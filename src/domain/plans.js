// 计划（REQ-017）：用户定义一份"计划"，包含一串有先后顺序的关键事件，
// 需要严格按顺序完成关键事件才能一步步推进到计划的终点。取代了 REQ-016
// 的"长期目标"（domain/goals.js）——用户明确要求"计划取代长期目标"：
// 长期目标那种"按阶段设定预算周数、汇总成阶段时长"的模式不再有 UI 入口，
// `domain/goals.js`/`state.goals` 本身没有删除（不破坏 domain/yearPhases.js
// 已有的 computePhaseWeeksFromGoals 调用链），只是 SettingsPanel.vue 不再
// 提供管理入口，往后 state.goals 会一直是空数组，阶段周数会一直落回
// DEFAULT_PHASE_WEEKS_FALLBACK（13 周）——这是本次改动预期内的结果，不是
// 遗留 bug，见 docs/CHANGELOG.md REQ-017 条目里的取舍说明。
//
// 数据模型：
//   plan = { id, title, createdAt, keyEvents: KeyEvent[] }
//   KeyEvent = { id, title, estimatedHours, completedAt: string|null }
// keyEvents 数组本身的顺序即完成顺序（不单独存一个 order 字段）。
// "严格顺序"通过"只允许把数组里第一个 completedAt 为空的那个标记完成"
// 来强制：不提供"任意重排/任意标完成"的入口，完成状态天然是数组前缀
// 连续的一段。
// REQ-036：曾经提供过 `addKeyEvent`（追加/插入新关键事件到已有计划），
// 用户当时明确反馈"添加关键事件的功能不需要"，整个删除过一次。
// REQ-054：用户后来改变主意，明确要求"计划编辑时可以在后面添加事件"，
// 把这个能力加回来了，见下面 `addKeyEvent` 的注释——这不是撤销 REQ-036
// 的决定后又走回头路，是需求本身随时间变化了，两次都是当时用户的真实
// 诉求。
// REQ-038：`deletePlan`（把整份计划从 `state.plans` 里删掉）已经删除，
// 用户明确要求"去掉删除计划的功能，改成废止计划，只是显示变成不能
// 操作而已"——计划数据不再会被真的删掉，改成 `abolishPlan` 只翻一个
// `abolished` 标记位。`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/
// `completeKeyEvent`/`uncompleteLastKeyEvent` 这几个会修改计划内容的
// 函数都在入口加了 `if (p.abolished) return p;` 这层拦截——UI 层
// （`PlanPanel.vue`）会隐藏对应按钮，这里是双重保险，防止其他调用方
// （比如 `EventModal.vue`/`DayTimeline.vue`）绕过 UI 直接改到已废止的
// 计划。
import { createId } from '../utils/id.js';

export function createPlan(store, { title, keyEvents }) {
  const plan = {
    id: createId('plan'),
    title,
    createdAt: new Date().toISOString(),
    abolished: false,
    keyEvents: (keyEvents || []).map((ke) => ({
      id: createId('kev'),
      title: ke.title,
      estimatedHours: Math.max(0.25, Number(ke.estimatedHours) || 1),
      completedAt: null,
    })),
  };
  store.setState((s) => ({ plans: [...s.plans, plan] }));
  return plan;
}

// 废止一份计划（REQ-038，取代原来的 `deletePlan`）：只翻
// `abolished: true` 这个标记位，计划本身的数据（标题/关键事件/完成
// 进度）原样保留，不会从 `state.plans` 里消失。没有配对的"恢复"函数——
// 用户的原话是"改成废止计划"，没有要求可以撤销，和 REQ-017 时
// `deletePlan` 本来就是不可逆操作的语义保持一致（废止取代了删除，
// 严重程度应该不高于删除）。已经废止的计划再调用这个函数是安全的
// 空操作（`abolished` 已经是 `true`，覆盖成 `true` 没有变化）。
export function abolishPlan(store, planId) {
  store.setState((s) => ({
    plans: s.plans.map((p) => (p.id === planId ? { ...p, abolished: true } : p)),
  }));
}

// 修改计划本身的设置（目前只有 title 这一个可编辑字段）——REQ-032，用户
// 反馈"计划设置可以进行修改，现在修改不了"，原来只能创建/删除整份计划，
// 没有编辑入口。REQ-038 起对已废止的计划是无操作（见文件顶部注释）。
export function updatePlan(store, planId, patch) {
  store.setState((s) => ({
    plans: s.plans.map((p) => (p.id === planId && !p.abolished ? { ...p, ...patch } : p)),
  }));
}

// 往已有计划末尾追加一个新的关键事件（REQ-054）——只追加到
// `keyEvents` 数组末尾，不支持插到中间任意位置，保持"数组顺序即完成
// 顺序"这个不变式不被破坏；新事件的 `completedAt` 从 `null` 开始，正常
// 走后面的严格顺序推进。如果这份计划当前已经是"全部完成"状态
// （`computePlanProgress().isFinished`），追加一个新的未完成事件会让
// 它重新变回"未完成"——这是预期内的自然结果，不是需要特殊处理的边界
// 情况：往一份已经走完的计划里加新的一步，这份计划当然又有事情要做了。
// REQ-038 起对已废止的计划是无操作，和其它会修改计划内容的函数一致。
export function addKeyEvent(store, planId, { title, estimatedHours }) {
  store.setState((s) => ({
    plans: s.plans.map((p) =>
      p.id === planId && !p.abolished
        ? {
            ...p,
            keyEvents: [
              ...p.keyEvents,
              { id: createId('kev'), title, estimatedHours: Math.max(0.25, Number(estimatedHours) || 1), completedAt: null },
            ],
          }
        : p
    ),
  }));
}

// 编辑一个还没完成的关键事件（title/estimatedHours）——只允许改还没完成
// 的（`!ke.completedAt`），和 `removeKeyEvent` 的保护是同一个道理：已完成
// 的关键事件是"做过什么"的历史记录，修改会让这段历史失真，不允许改；
// 传入已完成的 keyEventId 时这个函数是无操作（不抛异常，静默忽略）。
// REQ-038 起对已废止的计划也是无操作。
export function updateKeyEvent(store, planId, keyEventId, patch) {
  store.setState((s) => ({
    plans: s.plans.map((p) =>
      p.id === planId && !p.abolished
        ? {
            ...p,
            keyEvents: p.keyEvents.map((ke) =>
              ke.id === keyEventId && !ke.completedAt
                ? { ...ke, ...patch, estimatedHours: Math.max(0.25, Number(patch.estimatedHours ?? ke.estimatedHours) || 1) }
                : ke
            ),
          }
        : p
    ),
  }));
}

// 只允许删除还没完成的关键事件（已完成的是"历史记录"，删除会打乱
// "数组前缀即已完成部分"这个不变式，也不符合"记录做过什么"的直觉）。
// REQ-038 起对已废止的计划也是无操作。
export function removeKeyEvent(store, planId, keyEventId) {
  store.setState((s) => ({
    plans: s.plans.map((p) =>
      p.id === planId && !p.abolished
        ? { ...p, keyEvents: p.keyEvents.filter((ke) => ke.id !== keyEventId || ke.completedAt) }
        : p
    ),
  }));
}

// 当前"解锁"的关键事件：keyEvents 数组里第一个还没完成的那个。为 null
// 代表这个计划的所有关键事件都已完成，即已经"到达终点"。
export function getActiveKeyEvent(plan) {
  return plan.keyEvents.find((ke) => !ke.completedAt) || null;
}

export function computePlanProgress(plan) {
  const total = plan.keyEvents.length;
  const completedCount = plan.keyEvents.filter((ke) => ke.completedAt).length;
  return {
    total,
    completedCount,
    isFinished: total > 0 && completedCount === total,
    activeKeyEvent: getActiveKeyEvent(plan),
  };
}

// 标记关键事件完成，推进计划进度："经历事件之后计划才能得到进展"——
// 只允许标记当前 active 的关键事件（getActiveKeyEvent 返回的那个），
// 严格按顺序推进，不能跳过中间某个直接标后面的。全部关键事件标完后，
// 这个计划即视为到达终点（见 computePlanProgress 的 isFinished）。
// REQ-038 起对已废止的计划也是无操作——一个块要是关联着已废止计划的
// 关键事件（废止之前就已经添加到时间轴上了），结算时不会再推进这份
// 计划的进度，但块本身照常算点数，两者是独立的（见
// `domain/rewards.settleCompletedBlocks`）。
export function completeKeyEvent(store, planId, keyEventId) {
  store.setState((s) => ({
    plans: s.plans.map((p) => {
      if (p.id !== planId || p.abolished) return p;
      const active = getActiveKeyEvent(p);
      if (!active || active.id !== keyEventId) return p;
      return {
        ...p,
        keyEvents: p.keyEvents.map((ke) => (ke.id === keyEventId ? { ...ke, completedAt: new Date().toISOString() } : ke)),
      };
    }),
  }));
}

// 撤销最近一次完成（对应"最后一个已完成"的关键事件），用于误点之后能
// 撤回，和日视图 toggleSkip 的"可逆操作"惯例一致。不允许撤销任意一个
// （只能撤销最后一个），否则会破坏"前缀连续"这个不变式。REQ-038 起对
// 已废止的计划也是无操作。
export function uncompleteLastKeyEvent(store, planId) {
  store.setState((s) => ({
    plans: s.plans.map((p) => {
      if (p.id !== planId || p.abolished) return p;
      const completed = p.keyEvents.filter((ke) => ke.completedAt);
      if (!completed.length) return p;
      const last = completed[completed.length - 1];
      return {
        ...p,
        keyEvents: p.keyEvents.map((ke) => (ke.id === last.id ? { ...ke, completedAt: null } : ke)),
      };
    }),
  }));
}
