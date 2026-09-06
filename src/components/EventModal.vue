<script setup>
import { reactive, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { store } from '../state/store.js';
import { createId } from '../utils/id.js';
import { parseDateKey, getDateKey } from '../utils/dateUtils.js';
import { BLOCK_TYPES } from '../domain/dayPlanner.js';
import { getActiveKeyEvent } from '../domain/plans.js';
import {
  createRecurringEvent,
  deleteRecurringSeries,
  RECURRENCE_FREQUENCIES,
  RECURRENCE_END_TYPES,
} from '../domain/recurringEvents.js';

// v-if="uiState.modal" 在 App.vue 里控制这个组件的挂载/卸载，所以每次
// 打开一个新的（创建或编辑另一个块的）modal 时组件都是全新挂载的，
// 草稿状态天然不会跨会话串——不需要像旧版 vanilla 实现那样手动比对
// "modal 身份"来决定要不要重置草稿。
const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t, tm } = useI18n();

// 周一起始，和 domain.weekdayShort / JS Date.getDay() 编号对应。
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

const modal = props.uiState.modal;
const isEdit = modal.mode === 'edit';

function hourToTimeInput(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function timeInputToHour(value) {
  const [h, m] = (value || '0:0').split(':').map(Number);
  return h + (m || 0) / 60;
}

function buildDraft() {
  if (isEdit) {
    const b = modal.block;
    return {
      title: b.title,
      type: b.type,
      startTime: hourToTimeInput(b.start),
      endTime: hourToTimeInput(b.end),
      recurrenceEnabled: false,
      freq: 'weekly',
      byWeekday: [parseDateKey(modal.dateKey).getDay()],
      byMonthDay: parseDateKey(modal.dateKey).getDate(),
      endType: 'never',
      until: null,
      count: 4,
      planId: null,
      keyEventId: null,
    };
  }
  const start = modal.defaultStart ?? 9;
  const end = Math.min(24, start + 1);
  return {
    title: '',
    type: 'experience',
    startTime: hourToTimeInput(start),
    endTime: hourToTimeInput(end),
    recurrenceEnabled: modal.recurrenceEnabled || false,
    freq: 'weekly',
    byWeekday: [parseDateKey(modal.dateKey).getDay()],
    byMonthDay: parseDateKey(modal.dateKey).getDate(),
    endType: 'never',
    until: null,
    count: 4,
    planId: null,
    keyEventId: null,
  };
}

const draft = reactive(buildDraft());

const typeOptions = computed(() =>
  BLOCK_TYPES.filter((bt) => bt !== 'busy').map((bt) => ({ label: t(`domain.blockType.${bt}`), value: bt }))
);
const freqOptions = computed(() => RECURRENCE_FREQUENCIES.map((f) => ({ label: t(`domain.recurrenceFreq.${f}`), value: f })));
const endTypeLabel = (type) => t(`domain.recurrenceEnd.${type}`);

// 从计划添加（REQ-017）：只列出每个计划里当前"解锁"的关键事件（严格
// 按顺序完成，未解锁的还不能添加到时间轴，见 domain/plans.js 顶部注释）。
// 选中后把标题/预计时长直接搬进草稿，并记下 planId/keyEventId，保存时
// 这两个字段会写进新建的 block——后续在日视图上把这个 block 标记完成，
// 就是"经历事件之后计划才能得到进展"的推进入口（见 DayTimeline.vue）。
// REQ-038：已废止的计划（`plan.abolished`）也排除在外——废止就是"不能
// 再操作"，不应该还能从这里继续往它身上添加新的时间轴安排。
const planOptions = computed(() =>
  props.state.plans
    .filter((plan) => !plan.abolished)
    .map((plan) => ({ plan, keyEvent: getActiveKeyEvent(plan) }))
    .filter((entry) => entry.keyEvent)
    .map((entry) => ({
      value: entry.plan.id,
      label: t('event.planOptionLabel', { plan: entry.plan.title, keyEvent: entry.keyEvent.title }),
    }))
);

function onSelectPlan(planId) {
  draft.planId = planId || null;
  if (!planId) {
    draft.keyEventId = null;
    return;
  }
  const plan = props.state.plans.find((p) => p.id === planId);
  const keyEvent = plan && getActiveKeyEvent(plan);
  if (!keyEvent) return;
  draft.keyEventId = keyEvent.id;
  draft.title = keyEvent.title;
  const startHour = timeInputToHour(draft.startTime);
  draft.endTime = hourToTimeInput(Math.min(24, startHour + keyEvent.estimatedHours));
}

function addSingleBlock(dateKey, fields) {
  store.setState((s) => {
    const blocks = s.dayTimelines[dateKey]?.blocks || [];
    const block = {
      id: createId('blk'),
      type: fields.type,
      start: fields.start,
      end: fields.end,
      source: 'manual',
      title: fields.title,
      ...(fields.planId ? { planId: fields.planId, keyEventId: fields.keyEventId } : {}),
    };
    return { dayTimelines: { ...s.dayTimelines, [dateKey]: { blocks: [...blocks, block].sort((a, b) => a.start - b.start) } } };
  });
}

function updateBlockFields(dateKey, blockId, patch) {
  store.setState((s) => {
    const blocks = s.dayTimelines[dateKey]?.blocks || [];
    const next = blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)).sort((a, b) => a.start - b.start);
    return { dayTimelines: { ...s.dayTimelines, [dateKey]: { blocks: next } } };
  });
}

function removeBlockFromModal(dateKey, blockId) {
  store.setState((s) => {
    const blocks = (s.dayTimelines[dateKey]?.blocks || []).filter((b) => b.id !== blockId);
    return { dayTimelines: { ...s.dayTimelines, [dateKey]: { blocks } } };
  });
}

function close() {
  props.navigate(props.uiState.activeView, { modal: null });
}

function onSave() {
  if (!draft.title.trim()) {
    message.warning(t('event.titleRequired'));
    return;
  }
  const startHour = timeInputToHour(draft.startTime);
  const endHour = timeInputToHour(draft.endTime);
  if (endHour <= startHour) {
    message.warning(t('event.timeOrderInvalid'));
    return;
  }

  if (isEdit) {
    updateBlockFields(modal.dateKey, modal.block.id, {
      title: draft.title.trim(), type: draft.type, start: startHour, end: endHour, source: 'manual',
    });
    message.success(t('event.updatedToast'));
  } else if (draft.recurrenceEnabled) {
    const recurrence =
      draft.freq === 'weekly'
        ? { freq: 'weekly', byWeekday: draft.byWeekday.length ? draft.byWeekday : [parseDateKey(modal.dateKey).getDay()] }
        : draft.freq === 'monthly'
          ? { freq: 'monthly', byMonthDay: draft.byMonthDay }
          : { freq: 'daily' };
    const end =
      draft.endType === 'until' ? { type: 'until', until: draft.until ? getDateKey(new Date(draft.until)) : modal.dateKey }
        : draft.endType === 'count' ? { type: 'count', count: draft.count }
          : { type: 'never' };
    createRecurringEvent(store, {
      title: draft.title.trim(), type: draft.type, startHour, endHour,
      seriesStartDate: modal.dateKey, recurrence, end,
    });
    message.success(t('event.recurringCreatedToast'));
  } else {
    addSingleBlock(modal.dateKey, {
      title: draft.title.trim(), type: draft.type, start: startHour, end: endHour,
      planId: draft.planId, keyEventId: draft.keyEventId,
    });
    message.success(t('event.createdToast'));
  }
  close();
}

function onDeleteInstance() {
  removeBlockFromModal(modal.dateKey, modal.block.id);
  close();
  message.success(t('event.deletedToast'));
}

function onDeleteSeries() {
  deleteRecurringSeries(store, modal.block.recurringId);
  close();
  message.success(t('event.seriesDeletedToast'));
}
</script>

<template>
  <n-modal
    :show="true"
    preset="card"
    style="width: 480px; max-width: calc(100vw - 32px)"
    :title="isEdit ? t('event.editTitle') : t('event.createTitle')"
    @update:show="(v) => !v && close()"
  >
    <n-form label-placement="top">
      <n-form-item v-if="!isEdit && planOptions.length" :label="t('event.fromPlanLabel')">
        <n-select
          :value="draft.planId"
          :options="planOptions"
          clearable
          :placeholder="t('event.fromPlanPlaceholder')"
          @update:value="onSelectPlan"
        />
      </n-form-item>
      <n-form-item :label="t('event.titleLabel')">
        <n-input v-model:value="draft.title" :placeholder="t('event.titlePlaceholder')" />
      </n-form-item>
      <n-form-item :label="t('event.typeLabel')">
        <n-select v-model:value="draft.type" :options="typeOptions" />
      </n-form-item>
      <n-form-item :label="t('event.startLabel')">
        <n-time-picker v-model:formatted-value="draft.startTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
      </n-form-item>
      <n-form-item :label="t('event.endLabel')">
        <n-time-picker v-model:formatted-value="draft.endTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
      </n-form-item>

      <n-form-item v-if="!isEdit">
        <n-checkbox v-model:checked="draft.recurrenceEnabled">{{ t('event.recurringCheckbox') }}</n-checkbox>
      </n-form-item>

      <template v-if="!isEdit && draft.recurrenceEnabled">
        <n-form-item :label="t('event.freqLabel')">
          <n-select v-model:value="draft.freq" :options="freqOptions" />
        </n-form-item>
        <n-form-item v-if="draft.freq === 'weekly'" :label="t('event.weekdayLabel')">
          <n-checkbox-group v-model:value="draft.byWeekday">
            <n-checkbox v-for="(value, idx) in WEEKDAY_VALUES" :key="value" :value="value">{{ tm('domain.weekdayShort')[idx] }}</n-checkbox>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item v-if="draft.freq === 'monthly'" :label="t('event.monthDayLabel')">
          <n-input-number v-model:value="draft.byMonthDay" :min="1" :max="31" style="width: 100%" />
        </n-form-item>
        <n-form-item :label="t('event.endTypeLabel')">
          <n-radio-group v-model:value="draft.endType">
            <n-radio v-for="type in RECURRENCE_END_TYPES" :key="type" :value="type">{{ endTypeLabel(type) }}</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="draft.endType === 'until'" :label="t('event.untilLabel')">
          <n-date-picker v-model:value="draft.until" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item v-if="draft.endType === 'count'" :label="t('event.countLabel')">
          <n-input-number v-model:value="draft.count" :min="1" style="width: 100%" />
        </n-form-item>
      </template>
    </n-form>

    <template #footer>
      <div class="settings-actions">
        <n-button type="primary" @click="onSave">{{ isEdit ? t('event.saveBtn') : t('event.createBtn') }}</n-button>
        <n-button quaternary @click="close">{{ t('event.cancelBtn') }}</n-button>
        <n-button v-if="isEdit" quaternary type="error" @click="onDeleteInstance">{{ t('event.deleteInstance') }}</n-button>
        <n-button v-if="isEdit && modal.block.recurringId" quaternary type="error" @click="onDeleteSeries">{{ t('event.deleteSeries') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>
