<script setup>
import { reactive, computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { FolderOpenRound } from '@vicons/material';
import { store } from '../state/store.js';
import { SUPPORTED_REGIONS } from '../domain/holidays.js';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { serializeStateForExport, parseImportedState } from '../state/persistence.js';

const FONT_FAMILY_OPTIONS = ['default', 'system', 'rounded', 'serif', 'mono'];

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t, tm } = useI18n();

// 周一起始，和 domain.weekdayShort / 后端约定的 JS Date.getDay() 编号对应。
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

function buildDraft(state) {
  return {
    yearStart: new Date(state.meta.yearStart).getTime(),
    workStart: state.settings.workHours.start,
    workEnd: state.settings.workHours.end,
    workDays: [...state.settings.workHours.days],
  };
}

const draft = reactive(buildDraft(props.state));

function save() {
  store.setState((s) => ({
    meta: { ...s.meta, yearStart: new Date(draft.yearStart).toISOString() },
    settings: {
      ...s.settings,
      workHours: { start: draft.workStart, end: draft.workEnd, days: draft.workDays },
    },
  }));
  message.success(t('settingsView.savedToast'));
}

function reset() {
  Object.assign(draft, buildDraft(props.state));
}

// 外观/地区这几项和上面「语言」分区一样，点了就直接生效、不走
// draft/保存这套流程（见 docs/MODULES.md 里对这个分区的说明）——都是
// "调整了马上就能看到效果"更自然的即时生效类设置，跟需要谨慎对待、
// 容易误触的排程规则字段不是一类东西。
const appearance = computed(() => props.state.settings.appearance);
const fontOptions = computed(() =>
  FONT_FAMILY_OPTIONS.map((key) => ({ label: t(`settingsView.fontOption.${key}`), value: key }))
);
const regionOptions = computed(() => SUPPORTED_REGIONS.map((code) => ({ label: t(`settingsView.regionOption.${code}`), value: code })));
// 没有自定义强调色时，色板控件显示当前主题实际生效的 Google 蓝，而不是
// 一片空白——空字符串本身代表"跟随主题默认"，选中的颜色只有用户真的点了
// 色板之后才会写进 appearance.accentColor。
const accentColorPreview = computed(
  () => appearance.value.accentColor || (props.state.settings.theme === 'dark' ? '#8ab4f8' : '#1a73e8')
);

// REQ-077：本地文件转出来的 `data:` URI 少则几十 KB、多则近 11MB
// （见下面 MAX_BACKGROUND_IMAGE_BYTES 的换算），直接摆进 `n-input`
// 里显示成一整行天文数字长度的乱码字符串，用户反馈"不自然"——外部
// 图片 URL（`http(s)://...`）本身通常不长，保留可编辑的文本框；本地
// 文件来源的 `data:` URI 改成显示一句友好的说明文字，不再把原始
// 字符串糊在输入框里，实际存的值不变，只是这里展示的方式不同。
const isBackgroundImageDataUri = computed(() => (appearance.value.backgroundImage || '').startsWith('data:'));

function updateAppearance(patch) {
  store.setState((s) => ({ settings: { ...s.settings, appearance: { ...s.settings.appearance, ...patch } } }));
}

// 背景图片支持"浏览本地文件"（用户要求，原来只能粘贴一个外部图片
// URL）：本地图片没有云端地址可以引用，这个应用又是纯前端、不允许
// 引入后端上传，唯一能把"一个本地文件"变成一个能存进 state、能被
// CSS `background-image: url(...)` 直接使用的字符串的办法，就是用
// `FileReader.readAsDataURL()` 转成 base64 的 `data:` URI——`url()`
// 原生支持 `data:` URI，`App.vue` 的 `backgroundStyle` 完全不需要
// 为这种情况改代码，读进来的字符串和用户手动粘贴一个 `https://...`
// 图片链接对这个字段来说没有任何区别。
// 体积上限：`data:` URI 本身比原始文件大约 33%（base64 编码开销），
// 这个字符串会跟着整份 state 一起写进本地数据库、也会出现在"导出全部
// 数据"生成的 JSON 里——不限制的话，一张几十 MB 的高清照片会明显拖慢
// 这两者。8MB 原始文件（约 10.7MB 的 data URI）是一个足够装下绝大多数
// 手机照片/桌面壁纸、又不至于让数据库/导出文件变得夸张的上限，超出的
// 直接拒绝并提示，不做压缩/裁剪（引入图片处理逻辑超出这个功能本身的
// 范围，用户可以自己用图片工具先压缩一下再选）。
const MAX_BACKGROUND_IMAGE_BYTES = 8 * 1024 * 1024;
const backgroundFileInputRef = ref(null);

function triggerBackgroundFilePicker() {
  backgroundFileInputRef.value?.click();
}

// REQ-077：新增"启用背景图片"勾选框，用户反馈之前想取消背景图不够
// 直观（只能去文本框里点那个不太显眼的清除图标）。勾选框状态直接从
// `!!appearance.backgroundImage` 派生，不需要额外维护一个独立的
// enabled 布尔字段——取消勾选就是"清空这个字段"（`updateAppearance({
// backgroundImage: '' })`），语义上等价于用户要的"取消背景图片"；勾选
// （从空状态点亮）直接唤起文件选择器，图片选完/取消，勾选框会自动
// 跟着 `backgroundImage` 是否真的有值同步（没有独立状态就不会有"勾选
// 框亮着但其实没图"这种不一致）。想改用外部 URL 的话，下面的输入框
// 本身随时可编辑，不需要先勾选。
function onToggleBackgroundImage(checked) {
  if (checked) {
    triggerBackgroundFilePicker();
  } else {
    updateAppearance({ backgroundImage: '' });
  }
}

function handleBackgroundFileChange(event) {
  const file = event.target.files?.[0];
  event.target.value = ''; // 允许下次重新选择同一个文件也能触发 change
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    message.error(t('settingsView.backgroundImageInvalidType'));
    return;
  }
  if (file.size > MAX_BACKGROUND_IMAGE_BYTES) {
    message.error(t('settingsView.backgroundImageTooLarge'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => updateAppearance({ backgroundImage: reader.result });
  reader.onerror = () => message.error(t('settingsView.backgroundImageReadFailed'));
  reader.readAsDataURL(file);
}

function updateRegion(region) {
  store.setState((s) => ({ settings: { ...s.settings, region } }));
}

// 每小时点数（REQ-019，REQ-022 拆成平日/周末两档）：完成一个时间块能拿
// 多少点数的换算比率，见 domain/rewards.js 的 `isWeekend()`/
// `settleCompletedBlocks()`。和"语言/外观/地区"一样是即时生效，不进
// draft/保存流程——调整这两个数字之后马上就该体现在下一次结算的计算里
// （REQ-046 起结算是实时的，最多 30 秒内生效，见 domain/rewards.js
// 顶部注释，比率本身生效是立刻的，不需要用户再点一次「保存设置」）。
function updatePointsPerHour(key, value) {
  store.setState((s) => ({ settings: { ...s.settings, [key]: Math.max(0, value || 0) } }));
}

// REQ-043：全量数据导出/导入——最朴素的"下载一个 JSON 文件 / 选一个 JSON
// 文件读回来"，所有浏览器都能用，给用户一个随手可做的手动备份手段。
// REQ-044：原本还有一个平行的"数据库镜像到本地文件夹"（REQ-041/042，
// File System Access API，仅 Chromium 系浏览器、需要持续目录授权）已经
// 应用户要求整个删除，这个导出/导入是现在唯一的手动备份手段，见
// docs/CHANGELOG.md REQ-044 条目。
function handleExportData() {
  const json = serializeStateForExport(store.getState());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifespark-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const importInputRef = ref(null);

// 导入是破坏性操作（整体覆盖当前数据），确认放在触发文件选择器之前
// （`<n-popconfirm>` 包住按钮本身），和 `RewardPanel.vue` 兑换奖励是同一个
// "危险操作二次确认"模式；具体文件内容是否有效要等用户选完文件才知道，
// 所以校验放在 `handleImportFile` 里，无效文件不会碰到当前数据。
function triggerImport() {
  importInputRef.value?.click();
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  event.target.value = ''; // 允许下次重新选择同一个文件也能触发 change
  if (!file) return;
  const text = await file.text();
  const parsed = parseImportedState(text);
  if (!parsed) {
    message.error(t('settingsView.dataImportInvalid'));
    return;
  }
  store.setState(parsed);
  Object.assign(draft, buildDraft(store.getState()));
  message.success(t('settingsView.dataImportSuccess'));
}
</script>

<template>
  <div class="settings-panel">
    <div class="view-header"><h2>{{ t('settingsView.title') }}</h2></div>

    <div class="settings-section">
      <h3>{{ t('language.label') }}</h3>
      <LanguageSwitcher :state="state" />
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.appearanceSection') }}</h3>
      <label class="field-label settings-field">
        {{ t('settingsView.fontFamilyLabel') }}
        <n-select :value="appearance.fontFamily" :options="fontOptions" @update:value="(v) => updateAppearance({ fontFamily: v })" />
      </label>
      <label class="field-label settings-field">
        {{ t('settingsView.accentColorLabel') }}
        <div class="settings-inline-row">
          <n-color-picker
            :value="accentColorPreview"
            :modes="['hex']"
            :show-alpha="false"
            style="width: 160px"
            @update:value="(v) => updateAppearance({ accentColor: v })"
          />
          <n-button quaternary size="small" @click="updateAppearance({ accentColor: '' })">
            {{ t('settingsView.accentColorReset') }}
          </n-button>
        </div>
      </label>
      <label class="field-label settings-field">
        <n-checkbox :checked="!!appearance.backgroundImage" @update:checked="onToggleBackgroundImage">
          {{ t('settingsView.backgroundImageEnableLabel') }}
        </n-checkbox>
      </label>
      <div class="settings-field">
        <div class="settings-inline-row background-image-row">
          <div
            v-if="appearance.backgroundImage"
            class="background-image-preview"
            :style="{ backgroundImage: `url(${JSON.stringify(appearance.backgroundImage)})` }"
          />
          <n-input
            v-if="!isBackgroundImageDataUri"
            :value="appearance.backgroundImage"
            :placeholder="t('settingsView.backgroundImagePlaceholder')"
            clearable
            style="flex: 1"
            @update:value="(v) => updateAppearance({ backgroundImage: v })"
          />
          <span v-else class="background-image-local-label">{{ t('settingsView.backgroundImageLocalFileSet') }}</span>
          <n-button quaternary size="small" @click="triggerBackgroundFilePicker">
            <template #icon><n-icon><FolderOpenRound /></n-icon></template>
            {{ t('settingsView.backgroundImageBrowse') }}
          </n-button>
          <input
            ref="backgroundFileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleBackgroundFileChange"
          />
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.regionSection') }}</h3>
      <label class="field-label settings-field">
        {{ t('settingsView.regionLabel') }}
        <n-select :value="state.settings.region || 'CN'" :options="regionOptions" @update:value="updateRegion" />
      </label>
      <p class="settings-hint">{{ t('settingsView.regionHint') }}</p>
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.pointsSection') }}</h3>
      <div class="settings-grid">
        <label class="field-label settings-field">
          {{ t('settingsView.pointsPerHourWeekdayLabel') }}
          <n-input-number
            :value="state.settings.pointsPerHourWeekday"
            :min="0"
            :step="50"
            style="width: 100%"
            @update:value="(v) => updatePointsPerHour('pointsPerHourWeekday', v)"
          />
        </label>
        <label class="field-label settings-field">
          {{ t('settingsView.pointsPerHourWeekendLabel') }}
          <n-input-number
            :value="state.settings.pointsPerHourWeekend"
            :min="0"
            :step="50"
            style="width: 100%"
            @update:value="(v) => updatePointsPerHour('pointsPerHourWeekend', v)"
          />
        </label>
      </div>
      <p class="settings-hint">{{ t('settingsView.pointsPerHourHint') }}</p>
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.yearSection') }}</h3>
      <label class="field-label settings-field">
        {{ t('settingsView.yearStartLabel') }}
        <n-date-picker v-model:value="draft.yearStart" type="date" style="width: 100%" />
      </label>
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.workHoursSection') }}</h3>
      <div class="settings-grid">
        <label class="field-label settings-field">
          {{ t('settingsView.workStartLabel') }}
          <n-input-number v-model:value="draft.workStart" :min="0" :max="23" style="width: 100%" />
        </label>
        <label class="field-label settings-field">
          {{ t('settingsView.workEndLabel') }}
          <n-input-number v-model:value="draft.workEnd" :min="1" :max="24" style="width: 100%" />
        </label>
      </div>
      <div class="settings-field">
        {{ t('settingsView.workDaysLabel') }}
        <n-checkbox-group v-model:value="draft.workDays">
          <div class="checkbox-row">
            <n-checkbox v-for="(value, idx) in WEEKDAY_VALUES" :key="value" :value="value">{{ tm('domain.weekdayShort')[idx] }}</n-checkbox>
          </div>
        </n-checkbox-group>
      </div>
    </div>

    <div class="settings-section">
      <h3>{{ t('settingsView.dataBackupSection') }}</h3>
      <p class="settings-hint">{{ t('settingsView.dataBackupHint') }}</p>
      <div class="settings-actions">
        <n-button @click="handleExportData">{{ t('settingsView.dataExportBtn') }}</n-button>
        <n-popconfirm @positive-click="triggerImport">
          <template #trigger>
            <n-button type="warning">{{ t('settingsView.dataImportBtn') }}</n-button>
          </template>
          {{ t('settingsView.dataImportConfirm') }}
        </n-popconfirm>
        <input ref="importInputRef" type="file" accept="application/json" style="display: none" @change="handleImportFile" />
      </div>
    </div>

    <div class="settings-actions">
      <n-button type="primary" @click="save">{{ t('settingsView.save') }}</n-button>
      <n-button quaternary @click="reset">{{ t('settingsView.reset') }}</n-button>
    </div>
  </div>
</template>
