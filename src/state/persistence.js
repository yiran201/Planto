// 数据读写、schema 版本管理、默认数据生成。
// REQ-024：持久化后端从 localStorage 换成浏览器内的文件型数据库
// （state/db.js，@sqlite.org/sqlite-wasm + OPFS），`loadState`/
// `saveState` 因此从同步函数改成了异步函数——OPFS 的文件读写本身就是
// 异步的，调用方（store.js）需要相应调整。这个文件的其余部分
// （`createDefaultState`/`fillMissingDefaults`/schema 版本管理）完全
// 不受影响：应用整体仍然是"内存里一个大的响应式 state 对象"这个模型，
// 这里只是决定这个对象最终写到哪、从哪读回来。
import { getDateKey, addDays, parseDateKey } from '../utils/dateUtils.js';
import { readStateJson, writeStateJson } from './db.js';

export const SCHEMA_VERSION = 1;

// （REQ-052：`DEFAULT_CATEGORY_QUOTAS`——每个阶段每周期望抽取的各类别
// 活动数量——连同 `settings.categoryQuotas`/`settings.cooldownWeeks`
// 一起整个删除。这两个字段唯一的消费者是已经删除的
// `domain/scheduler.js`（见该文件删除时留在 `dayPlanner.js` 里的说明），
// UI 入口也早在 REQ-048 时就删过一次（"每阶段类别配额"表格），这次
// 用户直接要求把底层这套"随机生成本周计划"的自动排程子系统彻底清理，
// 不再是"留着当死数据"，是真的删掉了，新安装不会再生成这两个字段。
// 老数据里如果还带着，走 `fillMissingDefaults()` 的浅展开原样留着当
// 死数据，不影响任何逻辑。）

// （REQ-053/058 期间这里有一大套兴趣活动类别的动态列表/i18n seedKey
// 迁移逻辑——`SEED_ACTIVITY_CATEGORIES`/`LEGACY_CATEGORY_IDS`/
// `NAME_TO_SEED_KEY`/`migrateActivityCategoryRef()`/
// `backfillCategorySeedKeys()`，顶层 `activityCategories` 字段。
// REQ-082 应用户要求"分类搜索的功能去除掉……图文里面的分类也去掉"，
// 这一整套连同 `activity.category` 字段一起整个删除，不留死代码，见
// `domain/activityPool.js`/`ActivityModal.vue`/`ActivityCard.vue`/
// `ActivityLibraryPanel.vue` 各自的条目。下面 `migrateLegacyActivity()`
// 仍然保留——它处理的是 REQ-048 之前更老的一套分类体系
// （novel/interest/variety/routine），跟这里删掉的 REQ-053/058 类别
// 系统是两回事，用于检测"是不是极老的数据"这一步不受影响，只是不再
// 往迁移结果里写 `category` 字段了。）

// REQ-070：周期事件的物化策略从"创建时一次性生成"改成"滚动续期"
// （domain/recurringEvents.js），每条规则新增 `materializedUntil`/
// `materializedCount` 两个字段记录续期进度。REQ-070 之前创建的老规则
// 没有这两个字段，续期逻辑需要靠它们判断"已经生成到哪了"，缺了会直接
// 因为 `undefined` 参与日期比较/`parseDateKey(undefined)` 解析而出错。
// 通过扫描 `dayTimelines` 里这条规则名下实际已经物化出的实例，反推出
// 一个合理的初始值：`materializedUntil` 取这些实例里最晚的那个日期
// （理论上不该找不到任何实例，防御性兜底成"系列起始日前一天"，等价于
// "还没生成过"，下次续期会从 `seriesStartDate` 本身重新开始）；
// `materializedCount` 是找到的实例数量。这样续期时会从"老数据实际
// 截止的地方"开始补，不会重复生成，也不会漏掉中间的空档。判断"是不是
// 老数据"看有没有 `materializedUntil` 字段，已经带着这两个字段的规则
// 直接跳过，函数天然幂等。
function migrateRecurringEventRule(rule, dayTimelines) {
  if (rule.materializedUntil !== undefined) return rule;
  let latestKey = null;
  let count = 0;
  for (const [dateKey, timeline] of Object.entries(dayTimelines || {})) {
    for (const block of timeline.blocks || []) {
      if (block.recurringId !== rule.id) continue;
      count++;
      if (!latestKey || dateKey > latestKey) latestKey = dateKey;
    }
  }
  const materializedUntil = latestKey || getDateKey(addDays(parseDateKey(rule.seriesStartDate), -1));
  return { ...rule, materializedUntil, materializedCount: count };
}

// REQ-072：`googleSync` 从单一方向的 `{lastSyncedAt, syncedEventIds}`
// 改成双向的 `{lastSyncToGoogleAt, lastSyncFromGoogleAt}`。老数据里的
// `lastSyncedAt` 就是当时唯一存在的那个方向（同步到 Google）留下的
// 时间戳，原样平移过去；已经是新形状的数据（没有 `lastSyncedAt`）直接
// 走正常的浅展开合并。`syncedEventIds` 不迁移，从来没有代码读写过它。
function migrateGoogleSync(parsedGoogleSync, defaultGoogleSync) {
  if (parsedGoogleSync && parsedGoogleSync.lastSyncedAt !== undefined) {
    return { lastSyncToGoogleAt: parsedGoogleSync.lastSyncedAt, lastSyncFromGoogleAt: null };
  }
  return { ...defaultGoogleSync, ...parsedGoogleSync };
}

// REQ-048：兴趣活动库（原"活动库"/"体验库"）不再需要种子数据——旧版
// SEED_ACTIVITIES 是喂给自动排程算法用的通用建议条目，新版是用户自己
// 收藏的、带真实链接/图片/Markdown 笔记的个人参考库，编不出真实有意义
// 的链接/图片，硬编几条"看起来像推荐"的占位内容风险大于价值（万一用户
// 真的点开一个编出来的链接），所以新安装直接是空列表，交给用户自己用
// 「添加活动」建立第一条。
//
// 旧数据迁移：REQ-048 之前的活动条目用的是完全不同的分类体系（novel/
// interest/variety/routine，服务自动排程的"新鲜度"维度）和字段集合
// （blockType/tags/durationMinutes/energyLevel/rating/weightMultiplier/
// lastScheduledAt/timesScheduled）。这两套分类没有任何语义对应关系，
// 编不出合理的自动映射，`migrateLegacyActivity()`（下面 fillMissingDefaults
// 用）只做能安全做的事：保留 id/title/createdAt/imageUrl，其余旧字段
// 整个丢弃，`content` 留空，交给用户自己后续重新整理、补正文。判断
// "是不是旧数据"看 `category` 是否是这四个旧值之一——已经是新形状
// （或者压根没设过 category）的条目直接跳过，不会被重复处理，这个函数
// 天然幂等，不需要额外的一次性标记。（REQ-081：新字段集合里已经没有
// `link` 了，这里迁移出来的记录自然也不再带这个字段。REQ-082：新字段
// 集合里也已经没有 `category` 了——分类功能整个删除，这里不再把
// `category` 归到 `'other'`，老备份文件里的 `activity.link`/
// `activity.category` 都直接丢弃不迁移，跟"删掉这两个功能"的决定保持
// 一致。）
const LEGACY_ACTIVITY_CATEGORIES = new Set(['novel', 'interest', 'variety', 'routine']);
function migrateLegacyActivity(activity) {
  if (!LEGACY_ACTIVITY_CATEGORIES.has(activity.category)) return activity;
  return {
    id: activity.id,
    title: activity.title,
    imageUrl: activity.imageUrl || '',
    content: activity.content || '',
    createdAt: activity.createdAt,
  };
}

// 奖励名单（REQ-018 新增，REQ-019/022/023/031/058 陆续调整过定价/展示
// 方式）：REQ-018~058 期间应用内置过一份 17 项示例种子数据（相机/电脑/
// 旅行等，按日元参考价定的点数门槛），新装用户会自动拿到这份清单当
// 起点。REQ-067 应用户明确要求把这份内置示例数据清掉——这些是当初为了
// 演示"奖励兑换"这个机制编的具体示例，不适合作为开源发布后每个新用户
// 都会看到的默认内容，交给用户自己在"奖励"页面建立第一条。`value` 这个
// 字段本身的含义不变，仍然是"兑换这个奖励需要多少点数"，界面上一律
// 只说"点数"，不出现任何货币符号（REQ-022）。原来配套的 `SEED_REWARDS`
// 数组、`refreshRewardValuesFromSeedPrices()`（把内置奖励价格对齐最新
// 日元参考价的一次性操作，见 `domain/rewards.js`）、按标题/`seedKey`
// 反查种子数据的 `backfillRewardSeedKeys()` 一并整个删除——这几个都是
// 只服务于"内置种子数据"这一件事的代码，种子数据本身没了，留着就是
// 死代码，不是"留着兼容老数据"能解释的那种无害死字段。用户已有的、
// 带着旧版 `seedKey` 的奖励记录不受影响（`seedKey` 字段本身还在，
// `utils/i18nLabels.rewardLabel()` 逻辑没变，没有 `seedKey` 就用
// `title`），只是不会再被这两个函数处理。

export function createDefaultState() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  return {
    // claimedRewardsClearedAt（REQ-033）：`domain/rewards.js` 的
    // `clearClaimedRewards` 用来判断"这次一次性操作有没有执行过"的幂等
    // 标记，null 表示还没执行过，见 App.vue 挂载逻辑。（REQ-028 时新增过
    // 配套的 `pointsResetAt`，REQ-046 把点数余额改成派生计算后，
    // `resetPointsFromMonday` 整个删除，新安装不再生成这个字段；REQ-067
    // 删除内置奖励种子数据后，配套的 `rewardValuesRefreshedAt`
    // （REQ-031，`refreshRewardValuesFromSeedPrices` 的幂等标记）同样不再
    // 生成——这两个字段老数据里如果还带着，走 `fillMissingDefaults()` 的
    // `...parsed.meta` 浅展开原样留着当死数据，不影响任何逻辑。）
    meta: {
      schemaVersion: SCHEMA_VERSION,
      yearStart,
      claimedRewardsClearedAt: null,
    },
    settings: {
      workHours: { start: 9, end: 18, days: [1, 2, 3, 4, 5] },
      googleClientId: '',
      theme: 'dark',
      locale: 'zh',
      region: 'CN',
      // REQ-075：`backgroundOpacity`（背景图透明度滑块）删除——用户反馈
      // "背景图的效果不用设置透明化"，背景图现在始终按原样全不透明
      // 显示（见 App.vue 的 backgroundStyle）。老数据里如果还带着这个
      // 字段，走 `settings.appearance` 已有的浅展开合并原样留着当死
      // 数据，不影响任何逻辑，不需要专门清理。
      // REQ-077：新增 `transparentMode`（右上角"透明化切换"按钮的开关
      // 状态，见 App.vue），持久化存储，逻辑上和主题/字体这类外观偏好
      // 是同一类字段。
      appearance: {
        fontFamily: 'default',
        accentColor: '',
        backgroundImage: '',
        transparentMode: false,
      },
      // 完成一个时间块能拿多少点数 = 时长（小时）× 这两个比率之一，见
      // domain/rewards.computePointsForDuration/settlePastDays（REQ-019，
      // REQ-022 拆成平日/周末两档）。按事件所在日期是不是周末（周六/
      // 周日，`utils/dateUtils.weekdayIndex` 返回的 5/6）选用对应比率——
      // 这个"周末"判断和 `workHours.days`（自动排程默认工作日）是两个
      // 概念，不共用同一份配置，语义上"周末事件更值钱"是用户自己的个人
      // 激励尺度，不需要和排程规则绑在一起。默认都给 1000/小时（用户
      // 描述"1 小时约等于 1000 点的感觉"），用户可以在设置页分别调整。
      pointsPerHourWeekday: 1000,
      pointsPerHourWeekend: 1000,
    },
    // 兴趣活动库（REQ-048）新安装是空列表，见上面 migrateLegacyActivity
    // 上方那段注释里的取舍说明；用户自己通过「添加活动」建立第一条。
    // （REQ-082：这里原来还有一个 `activityCategories` 字段种 8 个默认
    // 分类种子数据，分类功能整个删除后新安装不再生成这个字段，见上方
    // migrateLegacyActivity 之前那段大注释。）
    activityPool: [],
    // （REQ-052）顶层 `weeklyPlans`（自动生成的周计划记录）随
    // `domain/scheduler.js` 一起整个删除——唯一的写入方是已删除的
    // `generateWeeklyPlan`/WeekBoard.vue 的"生成本周计划"按钮（REQ-015
    // 就已经删过按钮），这个字段本来就已经没有任何代码在读写。
    dayTimelines: {},
    recurringEvents: [],
    goals: [],
    plans: [],
    // REQ-067：新安装不再种入内置示例奖励，空数组，用户自己在"奖励"
    // 页面建立第一条——和 `activityPool` 空数组（REQ-048）是同一个取舍。
    rewards: [],
    // （REQ-019 新增过顶层 `rewardPoints` 存储余额，REQ-046 起改成派生
    // 计算——`domain/rewards.computeRewardBalance()` 现算"已结算块之和
    // 减已兑换奖励之和"，不再需要一个持久化的余额字段，新安装不再生成
    // 这个字段。老数据里如果还带着它，原样留在 `...parsed` 展开结果里
    // 当死数据，不影响任何逻辑，见 `fillMissingDefaults()` 的说明。）
    // REQ-072：原来只有单一方向（同步到 Google）的 `lastSyncedAt`，
    // `syncedEventIds` 字段声明了但从来没有任何代码读写过（去重实际上
    // 一直是靠 block 自己的 `googleEventId` 字段判断，不是靠这个映射
    // 表）。改成双向同步后拆成两个独立的时间戳，`syncedEventIds` 一并
    // 删除——真正没用过的字段，不是"留着兼容老数据"的那种死字段。
    googleSync: { lastSyncToGoogleAt: null, lastSyncFromGoogleAt: null },
    // 年视图的月度标语（REQ-068，新增）：`{ [monthKey]: text }`，
    // `monthKey` 是 `utils/dateUtils.getMonthKey()` 算出的 `YYYY-MM`
    // 字符串。取代了 REQ-060 时期的活跃度热力图——用户反馈"不要标注事件
    // 颜色深的深度"，改成用户自己给某个月手动写一句标语（给月份目标做
    // 标记用），纯自由文本，没有字数/格式限制。空对象是新安装的默认值，
    // 只有用户实际写过标语的月份才会出现 key。
    monthLabels: {},
  };
}

// REQ-024 上线前，数据一直存在 localStorage 这个 key 下面。REQ-024 只是
// 让应用不再读/写这个 key，并没有清掉它——用户升级到 REQ-024 之后第一次
// 打开应用，新数据库是空的，旧数据其实还原样躺在 localStorage 里。见
// `readLegacyLocalStorageState()`。
const LEGACY_LOCALSTORAGE_KEY = 'lifespark:v1';

// 读一次 localStorage 里的旧数据，不做任何"要不要用"的判断——纯粹是
// "这份旧数据现在长什么样"，调用方（下面 `autoRecoverFromLegacyLocalStorage()`）
// 决定什么时候调用、找到之后要不要用。找不到、解析失败都返回 `null`，
// 不抛异常。
// REQ-026 曾经把这个函数导出、多加了 `store.restoreFromLegacyBackup()`
// 这个不受"数据库是否为空"限制的手动恢复入口（配 `SettingsPanel.vue`
// 里的"数据恢复"按钮）；REQ-029 应用户要求把这个手动入口整个删除了
// （用户确认真实数据已经通过这个按钮恢复成功，不再需要它），这个函数
// 因此改回不导出的内部函数，只剩下面自动恢复这一个调用方。
function readLegacyLocalStorageState() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return fillMissingDefaults(parsed);
  } catch (err) {
    console.warn('[Planto] 尝试读取旧版 localStorage 数据失败', err);
    return null;
  }
}

// REQ-025：只在新数据库确实是"从来没写过"（`readStateJson()` 返回
// `null`）时自动触发一次——如果新数据库已经有数据了（不管是种子默认值
// 还是已经恢复过的真实数据），不会再自动去看 localStorage，避免用旧
// 数据覆盖掉之后在新数据库里产生的修改。
// 【已知局限】这个自动恢复只有"赶上那一次机会窗口"才生效——如果用户在
// 这次自动恢复实现之前就已经打开过一次新版本（哪怕什么都没做，应用
// 挂载时的一些副作用就可能已经往新数据库写过一行默认状态），窗口就已经
// 关闭，之后自动恢复不会再触发。REQ-026 曾经加过一个不依赖这个"窗口"的
// 手动兜底入口（`store.restoreFromLegacyBackup()` + `SettingsPanel.vue`
// 的"数据恢复"按钮），REQ-029 应用户要求删除了——错过窗口的情况现在没有
// 手动补救手段，只保留这个自动恢复本身。
async function autoRecoverFromLegacyLocalStorage() {
  const recovered = readLegacyLocalStorageState();
  if (recovered) {
    console.info('[Planto] 检测到 REQ-024 升级前遗留在 localStorage 的数据，已自动恢复到新数据库。');
    await writeStateJson(JSON.stringify(recovered));
  }
  return recovered;
}

export async function loadState() {
  try {
    const raw = await readStateJson();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return fillMissingDefaults(parsed);
    } else {
      const recovered = await autoRecoverFromLegacyLocalStorage();
      if (recovered) return recovered;
    }
    return createDefaultState();
  } catch (err) {
    console.warn('[Planto] 读取数据库失败，使用默认状态', err);
    return createDefaultState();
  }
}

// 版本号不变的增量字段（如 REQ-002 新增的 settings.theme /
// recurringEvents，REQ-011 新增的 settings.region / settings.appearance，
// REQ-016 新增的顶层 goals）不需要走破坏性迁移，但仍要保证旧数据里缺失
// 这些字段时用默认值补齐，避免 undefined 导致后续逻辑出错。
// settings.appearance 是嵌套对象，浅合并 `{...defaults.settings,
// ...parsed.settings}` 会让旧数据里存在的 appearance（哪怕只存了部分
// 字段）整个覆盖掉 defaults 里的新字段，所以单独再深一层合并。
// REQ-016 把 settings.phaseWeeks 整个删掉了（阶段周数改成从 goals 累加
// 算出来，不再是存储字段）——旧数据里如果还带着这个字段，`...parsed.settings`
// 浅展开会把它原样留在合并结果里，属于死数据，不影响任何逻辑（现在没有
// 任何地方读 settings.phaseWeeks 了），不需要专门清理。
// REQ-017 新增顶层 `plans`（计划，取代了"长期目标"的 UI 入口，见
// domain/plans.js 顶部注释）；`goals` 字段和读取它的三处调用链本身没有
// 删除，只是不再有地方能往里面写数据了，同样按"旧数据缺字段用默认值
// 补齐"的既有模式处理，不需要新的破坏性迁移。
// REQ-018 新增顶层 `plans` 的配对字段 `rewards`（奖励名单，见
// domain/rewards.js）。和 `activityPool` 的 `SEED_ACTIVITIES` 是同一个
// 模式：只有全新用户（`parsed.rewards` 不存在，即 localStorage 里完全
// 没存过这个字段）才会拿到种子数据；老用户升级后如果这个字段已经存在
// （哪怕被用户清空成空数组），不会被再次种入初始清单，避免删干净了却
// 刷新一下又冒出来。
// REQ-019 新增过顶层 `rewardPoints`（点数余额）和 `settings.pointsPerHour`
// （点数换算比率）。REQ-046 把 `rewardPoints` 改成派生计算（见
// `domain/rewards.computeRewardBalance()`），不再是需要合并默认值的
// 存储字段——`fillMissingDefaults()` 不再单独处理它，老数据里如果还
// 带着这个字段，走 `...parsed` 浅展开原样留在结果里当死数据，没有任何
// 地方再读它，不需要专门清理，和下面 `pointsPerHour`/`phaseWeeks` 是
// 同一个模式。`settings.pointsPerHour` 走的是 `settings` 那层已有的
// 浅展开合并，不需要专门处理（和其它既有字段是同一个增量方式）。
// 原来 REQ-018 时 `reward` 对象上的 `claimedByPlanId` 字段已经跟着
// "计划直接触发领取"这个机制一起被整个替换掉了，不再存在，见
// `domain/rewards.js` 顶部注释。
// REQ-022 把单一的 `settings.pointsPerHour` 拆成
// `pointsPerHourWeekday`/`pointsPerHourWeekend` 两个字段——旧数据里如果
// 还带着 `pointsPerHour` 这个字段，会原样留在合并结果里当死数据（`...
// parsed.settings` 浅展开会保留它，但已经没有任何地方读它了），不影响
// 任何逻辑，不需要专门清理，和 REQ-016 时 `settings.phaseWeeks` 的处理
// 方式是同一个模式。两个新字段本身也是走 `settings` 层已有的浅展开
// 合并，不需要额外代码。
function fillMissingDefaults(parsed) {
  const defaults = createDefaultState();
  return {
    ...defaults,
    ...parsed,
    meta: { ...defaults.meta, ...parsed.meta, schemaVersion: SCHEMA_VERSION },
    settings: {
      ...defaults.settings,
      ...parsed.settings,
      appearance: { ...defaults.settings.appearance, ...parsed.settings?.appearance },
    },
    // REQ-072：老数据里的 `googleSync.lastSyncedAt`（REQ-072 之前唯一的
    // 同步方向"同步到 Google"留下的时间戳）平移成新字段
    // `lastSyncToGoogleAt`，语义上就是同一件事，不算丢信息；已经带着
    // 新字段的数据（REQ-072 之后产生的）不重复处理。`syncedEventIds`
    // 不用管——从来没有代码写过这个字段，不需要迁移。
    googleSync: migrateGoogleSync(parsed.googleSync, defaults.googleSync),
    // REQ-070：老数据里的周期事件规则补上 materializedUntil/materializedCount，
    // 用当前（可能已经过其它字段迁移的）dayTimelines 反推初始值，见
    // migrateRecurringEventRule() 注释。
    recurringEvents: (parsed.recurringEvents || defaults.recurringEvents)
      .map((r) => migrateRecurringEventRule(r, parsed.dayTimelines || defaults.dayTimelines)),
    goals: parsed.goals || defaults.goals,
    plans: parsed.plans || defaults.plans,
    // REQ-067：`defaults.rewards` 现在恒为空数组（内置示例种子数据已
    // 删除），老数据/用户已有数据原样透传，不再有 `backfillRewardSeedKeys()`
    // 这一步——那是专门给"内置种子数据落盘时还没有 seedKey"这种情况补
    // 标记的，种子数据本身没了，这个场景不会再发生。
    rewards: parsed.rewards || defaults.rewards,
    // REQ-048：老数据里可能还带着旧分类体系（novel/interest/variety/
    // routine）的活动条目，逐条过一遍 migrateLegacyActivity() 转成新
    // 形状——这个函数本身是幂等的（已经是新形状的条目直接跳过），不需要
    // 额外的一次性标记，每次加载都可以安全重跑。（REQ-082：这里原来
    // 紧接着还有一步 migrateActivityCategoryRef()，把 `category` 字段
    // 转成动态类别列表里对应条目的 id——分类功能整个删除后这一步不再
    // 需要，见上方大注释；老数据里残留的 `activity.category` 字段没有
    // 任何代码再读它，属于无害的死数据。）
    activityPool: (parsed.activityPool || defaults.activityPool).map(migrateLegacyActivity),
  };
}

export async function saveState(state) {
  try {
    await writeStateJson(JSON.stringify(state));
  } catch (err) {
    console.warn('[Planto] 写入数据库失败', err);
  }
}

// REQ-043：设置页"导出全部数据"按钮用——把当前状态原样序列化成一份可读的
// JSON 给用户下载做备份。和 REQ-041/042 时期"镜像到本地文件夹"的差异是：
// 这是用户手动触发的一次性下载，不需要 File System Access API 那种持续
// 授权，所有浏览器（含 Firefox/Safari）都能用。
export function serializeStateForExport(state) {
  return JSON.stringify(state, null, 2);
}

// REQ-043："导入数据"按钮用——复用 `fillMissingDefaults()`，和从数据库/
// localStorage 读回来的数据走同一套"缺字段用默认值补齐"逻辑，避免导入
// 一份旧版本导出的、缺新字段的数据后出现 undefined。解析失败或内容不是
// 一个对象都返回 `null`，不抛异常，交给调用方（SettingsPanel.vue）决定
// 怎么提示用户。
export function parseImportedState(json) {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return fillMissingDefaults(parsed);
  } catch (err) {
    return null;
  }
}
