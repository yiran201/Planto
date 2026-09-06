<script setup>
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { store } from '../state/store.js';
import { getWeekStart, getWeekDates, getDateKey } from '../utils/dateUtils.js';
import { createId } from '../utils/id.js';
import { IMPORTED_BLOCK_TYPE } from '../domain/dayPlanner.js';
import { startLogin, signOut, isLoggedIn, getRedirectUri } from '../calendar/googleAuthClient.js';
import { listEvents, insertEvent, buildEventPayload } from '../calendar/googleCalendarService.js';
import { mapEventsToDaySegments } from '../calendar/googleEventMapper.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t, d } = useI18n();

// REQ-077：Client ID 输入框用 n-input 自带的 type="password" +
// show-password-on="click" 遮起来——这串 ID 严格来说不算机密（本来就
// 会出现在这个页面发起的每次授权请求里，浏览器网络面板随便都能看到），
// 但用户在截图/分享屏幕求助时不想意外把它整个亮出来，遮起来 + 点一下
// 眼睛图标才显示是更自然的做法，不需要自己发明遮罩逻辑。
const clientIdDraft = ref(props.state.settings.googleClientId || '');
const connected = ref(isLoggedIn());

// REQ-056：Step 1 从"配置步骤见 README"改成面板内直接给出可点击链接的
// 引导步骤，用户不用跳出应用去翻文档。这几个是 Google Cloud Console
// 的标准固定路由（不依赖具体项目 ID，打开后由控制台按当前登录账号的
// 项目状态渲染）。REQ-072 新增 GOOGLE_CONSENT_SCREEN_URL：用户实测
// 撞上过"错误 403：org_internal"（OAuth 同意屏幕的用户类型被设成
// "内部"，只有项目所属 Google Workspace 组织成员能登录，个人 Gmail
// 会被拒绝），补一步引导去把用户类型改成"外部"、并在测试模式下把自己
// 加进测试用户名单。
const GOOGLE_CONSOLE_URL = 'https://console.cloud.google.com/';
const GOOGLE_CALENDAR_API_URL = 'https://console.cloud.google.com/apis/library/calendar-json.googleapis.com';
const GOOGLE_CONSENT_SCREEN_URL = 'https://console.cloud.google.com/apis/credentials/consent';
const GOOGLE_CREDENTIALS_URL = 'https://console.cloud.google.com/apis/credentials';

// 「已获授权的 JavaScript 来源」/「已获授权的重定向 URI」都必须和当前
// 页面的源完全一致。REQ-072 起登录方式从弹窗改成整页跳转（原因见
// calendar/googleAuthClient.js 顶部注释），新增了"重定向 URI"这个必须
// 登记的字段——`getRedirectUri()` 返回的就是跳转发起时用的
// `redirect_uri`，必须和 Console 里登记的值逐字符一致，否则 Google 会
// 拒绝这次跳转。本地开发端口在 vite.config.js 里固定成 6060
// （strictPort:true），理论上不会再漂移，但生产部署域名的场景仍然
// 存在，继续直接显示真实值给复制，比在文案里写死一个地址更不容易过期。
const currentOrigin = window.location.origin;
const redirectUri = getRedirectUri();

function copyOrigin() {
  navigator.clipboard.writeText(currentOrigin).then(
    () => message.success(t('sync.originCopied')),
    () => message.error(t('sync.copyFailed')),
  );
}

function copyRedirectUri() {
  navigator.clipboard.writeText(redirectUri).then(
    () => message.success(t('sync.originCopied')),
    () => message.error(t('sync.copyFailed')),
  );
}

const weekDates = computed(() => getWeekDates(getWeekStart(props.uiState.selectedWeekStart || new Date())));

function saveClientId() {
  store.setState((s) => ({ settings: { ...s.settings, googleClientId: clientIdDraft.value.trim() } }));
  message.success(t('sync.clientIdSaved'));
}

// REQ-072：登录改成整页跳转（`startLogin` 内部是
// `window.location.href = ...`），这个函数调用之后当前页面即将被导航
// 离开，不需要也不会继续往下执行——跳转回来后是全新的一次应用启动，
// `App.vue` 的 `onMounted` 里调用 `consumeRedirectToken()` 接住结果。
function handleLogin() {
  const clientId = props.state.settings.googleClientId;
  if (!clientId) {
    message.warning(t('sync.clientIdRequired'));
    return;
  }
  startLogin(clientId);
}

function handleLogout() {
  signOut();
  connected.value = false;
  message.success(t('sync.loggedOut'));
}

// REQ-072：从 Google 同步到本地，取代原来"读取忙碌时段（避让冲突）"
// 那个只生成文字提示、不落地成真正日历块的功能。策略：把当前正在查看
// 的这一周（`weekDates`）从 Google 拉回来的事件，转成
// `type:IMPORTED_BLOCK_TYPE('busy')`/`source:'google'` 的只读块——这套
// "Google 来源的块是只读的、不计入奖励点数、不算进月/年视图的事件点数"
// 的展示逻辑（`DayTimeline.vue`/`WeekBoard.vue`/`domain/rewards.js`/
// `MonthBoard.vue`/`YearBoard.vue`）早就存在，只是之前从来没有真正的
// 调用方把 Google 事件写成这种块，这次直接复用，不需要新增任何 UI
// 处理。每次同步是"整周替换"：这一周里每一天，先去掉所有旧的
// `source==='google'` 块，再放进这次新拉到的（没拉到就是空），用户
// 自己手动/计划安排的块（`source!=='google'`）完全不受影响——这样如果
// 某个事件在 Google 那边被删除/挪走了，本地也会在下次同步时自动清掉，
// 不需要额外的"是否要删除"逻辑。
async function handleSyncFromGoogle() {
  try {
    const dates = weekDates.value;
    const timeMin = dates[0].toISOString();
    const timeMax = new Date(dates[6].getTime() + 86400000).toISOString();
    const events = await listEvents(timeMin, timeMax);
    const segmentsByDate = mapEventsToDaySegments(events);

    const timelinePatch = {};
    let importedCount = 0;
    for (const date of dates) {
      const dateKey = getDateKey(date);
      const keptBlocks = (props.state.dayTimelines[dateKey]?.blocks || []).filter((b) => b.source !== 'google');
      const importedBlocks = (segmentsByDate[dateKey] || []).map((seg) => ({
        id: createId('blk'),
        type: IMPORTED_BLOCK_TYPE,
        start: seg.start,
        end: seg.end,
        source: 'google',
        title: seg.title,
        googleEventId: seg.googleEventId,
      }));
      importedCount += importedBlocks.length;
      timelinePatch[dateKey] = { blocks: [...keptBlocks, ...importedBlocks].sort((a, b) => a.start - b.start) };
    }

    store.setState((s) => ({
      dayTimelines: { ...s.dayTimelines, ...timelinePatch },
      googleSync: { ...s.googleSync, lastSyncFromGoogleAt: new Date().toISOString() },
    }));
    message.success(t('sync.fetchedCount', { count: importedCount }));
  } catch (err) {
    message.error(t('sync.fetchFailed', { message: err.message }));
  }
}

// 同步到 Google（REQ-018 时期就有，逻辑不变，只是 REQ-072 起
// `googleSync` 的时间戳字段从单一方向的 `lastSyncedAt` 改名成
// `lastSyncToGoogleAt`，和新增的"从 Google 同步到本地"的
// `lastSyncFromGoogleAt` 分开记）：跳过 Google 来源的块
// （`type==='busy'`，不应该被再推回 Google）和已经同步过的块（带
// `googleEventId`），其余的块创建成新的 Google 日历事件。**已知
// 局限**：只会新建，本地块如果后来被编辑/删除，不会同步撤销/更新
// 已经推过去的那份 Google 事件，这个方向目前是单向追加，没有做双向
// 的增量对账。
async function handleSyncToGoogle() {
  const dates = weekDates.value;
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  const updatedTimelines = {};

  for (const date of dates) {
    const dateKey = getDateKey(date);
    const blocks = props.state.dayTimelines[dateKey]?.blocks || [];
    const nextBlocks = [];
    for (const block of blocks) {
      if (block.type === IMPORTED_BLOCK_TYPE || block.googleEventId) {
        nextBlocks.push(block);
        if (block.googleEventId) skipped++;
        continue;
      }
      try {
        const payload = buildEventPayload(block, dateKey);
        const created = await insertEvent(payload);
        nextBlocks.push({ ...block, googleEventId: created.id });
        synced++;
      } catch (err) {
        console.warn('[Planto] 同步事件失败', err);
        nextBlocks.push(block);
        failed++;
      }
    }
    updatedTimelines[dateKey] = { blocks: nextBlocks };
  }

  store.setState((s) => ({
    dayTimelines: { ...s.dayTimelines, ...updatedTimelines },
    googleSync: { ...s.googleSync, lastSyncToGoogleAt: new Date().toISOString() },
  }));

  if (failed) {
    message.warning(t('sync.syncDoneWithFail', { synced, skipped, failed }));
  } else {
    message.success(t('sync.syncDone', { synced, skipped }));
  }
}
</script>

<template>
  <div class="settings-panel">
    <div class="view-header"><h2>{{ t('sync.title') }}</h2></div>

    <div class="settings-section">
      <h3>{{ t('sync.step1Title') }}</h3>
      <p class="hint-text">{{ t('sync.step1Hint') }}</p>
      <ol class="sync-guide-list">
        <li>
          {{ t('sync.guideStep1') }}
          <a :href="GOOGLE_CONSOLE_URL" target="_blank" rel="noopener noreferrer">{{ t('sync.guideStep1Link') }}</a>
        </li>
        <li>
          {{ t('sync.guideStep2') }}
          <a :href="GOOGLE_CALENDAR_API_URL" target="_blank" rel="noopener noreferrer">{{ t('sync.guideStep2Link') }}</a>
        </li>
        <li>
          {{ t('sync.guideStep3') }}
          <a :href="GOOGLE_CONSENT_SCREEN_URL" target="_blank" rel="noopener noreferrer">{{ t('sync.guideStep3Link') }}</a>
        </li>
        <li>
          {{ t('sync.guideStep4') }}
          <a :href="GOOGLE_CREDENTIALS_URL" target="_blank" rel="noopener noreferrer">{{ t('sync.guideStep4Link') }}</a>
        </li>
        <li>
          {{ t('sync.guideStep5') }}
          <div class="sync-origin-row">
            <code class="sync-origin-value">{{ currentOrigin }}</code>
            <n-button size="tiny" quaternary @click="copyOrigin">{{ t('sync.copyOrigin') }}</n-button>
          </div>
          <div class="sync-origin-row">
            <code class="sync-origin-value">{{ redirectUri }}</code>
            <n-button size="tiny" quaternary @click="copyRedirectUri">{{ t('sync.copyOrigin') }}</n-button>
          </div>
        </li>
        <li>{{ t('sync.guideStep6') }}</li>
      </ol>
      <div class="settings-field">
        <n-input
          v-model:value="clientIdDraft"
          type="password"
          show-password-on="click"
          :placeholder="t('sync.clientIdPlaceholder')"
        />
      </div>
      <n-button type="primary" @click="saveClientId">{{ t('sync.saveClientId') }}</n-button>
    </div>

    <div class="settings-section">
      <h3>{{ t('sync.step2Title') }}</h3>
      <p>{{ connected ? t('sync.connected') : t('sync.notConnected') }}</p>
      <div class="settings-actions">
        <n-button v-if="connected" quaternary @click="handleLogout">{{ t('sync.logout') }}</n-button>
        <n-button v-else type="primary" @click="handleLogin">{{ t('sync.login') }}</n-button>
      </div>
    </div>

    <div class="settings-section">
      <h3>{{ t('sync.step3Title') }}</h3>
      <p>{{ state.googleSync.lastSyncFromGoogleAt ? t('sync.lastSynced', { time: d(new Date(state.googleSync.lastSyncFromGoogleAt), 'long') }) : t('sync.neverSynced') }}</p>
      <n-button type="tertiary" @click="handleSyncFromGoogle">{{ t('sync.syncFromGoogle') }}</n-button>
    </div>

    <div class="settings-section">
      <h3>{{ t('sync.step4Title') }}</h3>
      <p>{{ state.googleSync.lastSyncToGoogleAt ? t('sync.lastSynced', { time: d(new Date(state.googleSync.lastSyncToGoogleAt), 'long') }) : t('sync.neverSynced') }}</p>
      <n-button type="primary" @click="handleSyncToGoogle">{{ t('sync.syncNow') }}</n-button>
    </div>
  </div>
</template>
