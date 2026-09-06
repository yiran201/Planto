// 奖励名单（REQ-018，REQ-019 改为点数经济，REQ-020 改为默认完成+一天
// 延迟结算，REQ-022 拆分平日/周末比率 + 起始点数，REQ-046 改为实时结算 +
// 余额改成派生计算，REQ-051 起点数本身也改成每次现算、不再存快照）：
// `reward.value` 当初是按日元参考价定的（见 `persistence.js` 的
// `SEED_REWARDS` 注释），但 REQ-022 之后**界面上一律只说"点数"，不出现
// 任何日元/货币符号**——这个数字现在纯粹是"兑换这个奖励需要多少点数"的
// 门槛，日元只是历史上取值时用过的参考基准，不是当前的产品概念。也不再
// 是"完成整份计划直接领取"，也不再需要用户手动点击"标记完成"——用户
// 明确要求"事件不需要完成点击，默认没有点击跳过就算完成"，即一个时间块
// 只要没被标记跳过（`status:'skipped'`），就默认视为完成，应该攒点数。
//
// 一个块有没有资格算点数（REQ-046 起是实时判断）：只要真实结束时间已经
// 过去（过去的日期整天都算，今天则要看 `block.end` 是否已经早于此刻的
// 小时数），没被标记跳过、不是 Google 来源，就有资格，不再有"必须等到
// 这一天过完才算"的一天延迟——REQ-020 时当初加这个延迟是为了"算分是
// 即时的话，跳过就必须先撤销已经发出去的点数，逻辑上更绕"，但
// `components/DayTimeline.vue` 的 `toggleSkip()` 早就已经实现了"撤销
// 已经算过的点数/计划进度"这个反悔逻辑，这个撤销能力跟是否延迟无关，
// 一天延迟反而只是让用户多等一天才看到点数，不是必须的约束。
//
// 点数余额怎么算（REQ-046 是"结算时快照 `pointsAwarded`，余额=快照之和
// 减兑换之和"；REQ-051 用户进一步要求"单位时间的点数需要考虑一下……
// 不是说保存在数据库里就行了的"，也就是**点数本身也不应该是一个存进
// 数据库的快照**，而应该每次都用当前设置的比率现算——不然用户调整了
// `pointsPerHourWeekday`/`pointsPerHourWeekend` 之后，之前已经"结算"过
// 的那些块还停留在旧比率算出来的点数上，感觉不到设置变化的效果，跟
// "每次进入页面都应该按当前逻辑重新计算，不是存了就算数"这个预期不符）：
// `computeRewardBalance(state)` 现在**不读任何存储的点数字段**，而是对
// 每一个"有资格"的块，用它所在那天是不是周末选对应的当前比率、乘真实
// 时长，现算出点数再累加，减去已兑换奖励的 `value` 之和。这意味着：
// - 调整点数比率会立刻影响**所有**历史上已经完成的事件，不只是新完成
//   的——因为压根没有"旧比率算出来存好的数字"这回事，每次都是用当前
//   比率重新算的。
// - `block.pointsAwarded` 这个快照字段不再需要，REQ-051 起不会再写入；
//   `block.pointsSettled` 保留下来，但含义收窄为"这个块有没有已经因为
//   自己而推进过关联的计划"——只用来防止 `completeKeyEvent` 被同一个
//   块重复触发、以及 `toggleSkip()` 判断跳过时要不要连带撤销计划进度，
//   跟点数计算本身完全脱钩了。
// - 不再有 `state.rewardPoints` 这个需要每次操作都正确增减的存储字段
//   ——这类"存储的运行余额"历史上出过好几次因为漏调用某个函数导致余额
//   和实际记录对不上的 bug（比如 REQ-036 修过的"重置点数按钮漏调
//   settlePastDays 导致余额停在 0"），改成每次现算彻底消除了这一整类
//   bug。`toggleSkip()`/`removeBlock()`（`DayTimeline.vue`）不需要显式
//   调用任何"退点数"的函数——只要把块标记跳过（或者整个删掉），它自然
//   不会再被 `computeRewardBalance()` 算进去。`addPoints()`（专门做
//   余额增减的函数）和"重置点数从本周一开始算"
//   （`resetPointsFromMonday`，REQ-028/034，"重置一个存储余额"这个操作
//   在派生模型下不再有意义）都已经删除。
import { createId } from '../utils/id.js';
import { getDateKey, parseDateKey, weekdayIndex } from '../utils/dateUtils.js';
import { completeKeyEvent } from './plans.js';

// 周末指周六/周日——`utils/dateUtils.weekdayIndex()` 是周一起始的 0-6
// 索引，5=周六、6=周日。这个判断只用来决定"这一天的事件按哪档点数比率
// 结算"，和 `settings.workHours.days`（自动排程默认工作日）是两个独立
// 概念，不共用同一份配置：前者是用户的个人激励尺度（周末做的事更"值
// 钱"这类主观设定），后者是排程算法的业务规则。
function isWeekend(dateKey) {
  const idx = weekdayIndex(parseDateKey(dateKey));
  return idx === 5 || idx === 6;
}

export function createReward(store, { title, value }) {
  const reward = {
    id: createId('rwd'),
    title,
    value: Math.max(0, Number(value) || 0),
    claimed: false,
    claimedAt: null,
    createdAt: new Date().toISOString(),
  };
  store.setState((s) => ({ rewards: [...s.rewards, reward] }));
  return reward;
}

export function updateReward(store, id, patch) {
  store.setState((s) => ({
    rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  }));
}

// 只允许删除还没被兑换的奖励——已兑换的是"用点数换到了什么"的历史
// 记录，删除会丢失这段记录，和 domain/plans.js 里 removeKeyEvent 对
// 已完成事件的保护是同一个道理。
export function deleteReward(store, id) {
  store.setState((s) => ({
    rewards: s.rewards.filter((r) => r.id !== id || r.claimed),
  }));
}

// 按时长（小时）和当前设置的比率算出这次完成能拿多少点数，四舍五入到
// 整数（点数没有小数意义）。比率本身没有一个"标准答案"，是用户自己
// 设定的个人换算尺度，不在这里写死。
export function computePointsForDuration(hours, pointsPerHour) {
  return Math.max(0, Math.round(hours * (Number(pointsPerHour) || 0)));
}

// 一个块有没有资格算点数：不是 Google 来源、没被标记跳过、真实结束
// 时间已经过去（过去的日期整天都算，"今天"要看 `block.end` 是否早于
// 此刻的小时数）。`computeRewardBalance()`/`settleCompletedBlocks()`
// 共用这同一条判断，避免两处各写一份、以后改一处忘了改另一处。
function isBlockEligible(block, dateKey, todayKey, nowHour) {
  if (block.source === 'google' || block.status === 'skipped') return false;
  return dateKey < todayKey || (dateKey === todayKey && block.end <= nowHour);
}

// REQ-046 起点数余额是派生计算，不是存储字段；REQ-051 起连每个块的
// 点数本身也是现算的，不读任何存储的快照字段——完整原因见文件顶部
// 注释。这里对每一个"有资格"的块，用它所在那天是不是周末选当前对应的
// 比率（`state.settings.pointsPerHourWeekday`/`pointsPerHourWeekend`），
// 乘真实时长现算出点数再累加；减去 `state.rewards` 里已兑换条目的
// `value` 之和就是余额。`Math.max(0, ...)` 钳制下限，纯粹是防御性的
// （正常流程下不应该出现负数，因为 `redeemReward` 兑换前会先检查余额
// 够不够），避免出现负数余额这种没有意义的展示。
export function computeRewardBalance(state) {
  const now = new Date();
  const todayKey = getDateKey(now);
  const nowHour = now.getHours() + now.getMinutes() / 60;

  let earned = 0;
  for (const [dateKey, timeline] of Object.entries(state.dayTimelines)) {
    if (dateKey > todayKey) continue;
    const pointsPerHour = isWeekend(dateKey)
      ? state.settings.pointsPerHourWeekend
      : state.settings.pointsPerHourWeekday;
    for (const block of timeline.blocks || []) {
      if (!isBlockEligible(block, dateKey, todayKey, nowHour)) continue;
      earned += computePointsForDuration(block.end - block.start, pointsPerHour);
    }
  }
  const spent = state.rewards.reduce((sum, r) => sum + (r.claimed ? r.value || 0 : 0), 0);
  return Math.max(0, earned - spent);
}

// 兑换：点数余额够不够用 `computeRewardBalance()` 现算一次判断（同步、
// 单线程，不存在并发竞态），够了才标记兑换，返回 true/false 让调用方
// 决定要不要提示"点数不够"。REQ-046 起不再需要显式扣减任何存储字段——
// 标记 `claimed:true` 之后，这条记录本身就会被 `computeRewardBalance()`
// 算进"已花掉"的部分，余额自然下降，不需要额外一步"扣钱"的操作。
export function redeemReward(store, rewardId) {
  const state = store.getState();
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward || reward.claimed || computeRewardBalance(state) < reward.value) return false;
  store.setState((s) => ({
    rewards: s.rewards.map((r) => (r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r)),
  }));
  return true;
}

export function listUnclaimedRewards(rewards) {
  return rewards.filter((r) => !r.claimed);
}

// REQ-046 起是实时判断资格（取代 REQ-020 时期"一天延迟"的
// `settlePastDays`，原因见文件顶部注释）；REQ-051 起这个函数**不再
// 计算/存储点数**（点数改成 `computeRewardBalance()` 每次现算，见上面），
// 只剩一件事：一个块第一次变得"有资格"时，如果它关联了计划关键事件，
// 推进那份计划，并把 `block.pointsSettled` 标记成 `true`——这个字段名字
// 沿用 REQ-046 之前的叫法，但含义已经收窄为"这个块有没有已经因为自己
// 推进过关联的计划"，纯粹是 `completeKeyEvent` 的幂等标记 +
// `DayTimeline.vue` 的 `toggleSkip()` 判断"跳过时要不要连带撤销计划
// 进度"用，和点数计算完全脱钩了（点数现在不管 `pointsSettled` 是什么，
// 只看这个块此刻是否有资格，见 `isBlockEligible`）。
// 按日期从早到晚处理，保证同一份计划的多个关键事件即使分布在不同日期
// 里，也会按正确的时间顺序推进；`completeKeyEvent` 内部本身有"只能按
// 顺序完成"的防御，这里不需要重复处理。
//
// 调用方（`App.vue`）在挂载时和每次 `useNow()`（30 秒一个 tick）变化都
// 调用一次——这样即使应用一直开着不刷新页面，某个关联了计划的事件一
// 结束，最多 30 秒内计划进度就会自动推进，不需要用户手动刷新页面触发。
export function settleCompletedBlocks(store) {
  const state = store.getState();
  const now = new Date();
  const todayKey = getDateKey(now);
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const eligibleDateKeys = Object.keys(state.dayTimelines)
    .filter((dateKey) => dateKey <= todayKey)
    .sort();
  if (!eligibleDateKeys.length) return;

  const timelinePatch = {};
  const planCompletions = [];

  for (const dateKey of eligibleDateKeys) {
    const blocks = state.dayTimelines[dateKey]?.blocks || [];
    if (!blocks.length) continue;
    let changed = false;
    const nextBlocks = blocks.map((block) => {
      if (block.pointsSettled || !isBlockEligible(block, dateKey, todayKey, nowHour)) return block;
      changed = true;
      if (block.planId && block.keyEventId) planCompletions.push({ planId: block.planId, keyEventId: block.keyEventId });
      return { ...block, pointsSettled: true };
    });
    if (changed) timelinePatch[dateKey] = { blocks: nextBlocks };
  }

  if (!Object.keys(timelinePatch).length) return;

  store.setState((s) => ({ dayTimelines: { ...s.dayTimelines, ...timelinePatch } }));

  for (const { planId, keyEventId } of planCompletions) {
    completeKeyEvent(store, planId, keyEventId);
  }
}

// ~~refreshRewardValuesFromSeedPrices~~（REQ-031 新增，REQ-058 改按
// seedKey 匹配，**REQ-067 已整个删除**）：曾经是把内置示例奖励的点数
// 对齐到最新日元参考价的一次性操作，依赖 `persistence.js` 的
// `SEED_REWARDS`。用户要求把内置示例奖励数据整个清掉后，这份种子数据
// 不存在了，这个函数也就没有意义了，连同 `App.vue` 里
// `state.meta.rewardValuesRefreshedAt` 幂等标记的调用点一起删除，见
// `docs/CHANGELOG.md` REQ-067 条目。

// 清空"已兑换"记录（REQ-033，用户直接要求的一次性操作）：`deleteReward`
// 故意保护已兑换的条目不让删（"用点数换到了什么"的历史记录，见该函数
// 注释），这个函数是用户明确要求绕开这层保护、批量清掉这份历史——不是
// 常驻功能，不提供在界面上反复点的入口，用
// `state.meta.claimedRewardsClearedAt` 做"只执行一次"的幂等标记，逻辑
// 和 `refreshRewardValuesFromSeedPrices` 一样。只删 `claimed:true` 的
// 条目，待兑换的（`claimed:false`）不受影响。
export function clearClaimedRewards(store) {
  const state = store.getState();
  const nextRewards = state.rewards.filter((reward) => !reward.claimed);

  store.setState((s) => ({
    rewards: nextRewards,
    meta: { ...s.meta, claimedRewardsClearedAt: new Date().toISOString() },
  }));
}
