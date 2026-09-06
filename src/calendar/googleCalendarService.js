// 封装 gapi.client 对 Google Calendar API v3 的调用。
// 依赖 googleAuthClient.js 提供的 access token，以及 index.html 中通过
// <script src="https://apis.google.com/js/api.js"> 引入的全局 `gapi`。
import { getAccessToken } from './googleAuthClient.js';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
// REQ-084：项目改名后这个 key 同步从 'lifespark' 改成 'planto'——它只是
// 写进 Google 日历事件 extendedProperties.private 的一个标记值，纯
// write-only（全项目搜索确认没有任何代码读回来做判断，去重实际靠
// block.googleEventId，见 persistence.js 顶部注释），改名不会影响任何
// 现有同步逻辑；老数据里已经同步过的事件上还带着旧的 'lifespark' 标记，
// 不会被重新处理，也没有任何代码依赖它，属于无害死数据。
const EXTENDED_PROP_KEY = 'planto';

let gapiReady = false;

export function isGapiLoaded() {
  return typeof window !== 'undefined' && !!window.gapi;
}

export function loadGapiClient() {
  return new Promise((resolve, reject) => {
    if (!isGapiLoaded()) {
      reject(new Error('Google API 脚本尚未加载完成'));
      return;
    }
    if (gapiReady) {
      resolve();
      return;
    }
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({});
        await window.gapi.client.load(DISCOVERY_DOC);
        gapiReady = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

function withAuthHeader() {
  const token = getAccessToken();
  if (!token) throw new Error('尚未登录 Google 账号');
  window.gapi.client.setToken({ access_token: token });
}

export async function listEvents(timeMinISO, timeMaxISO) {
  await loadGapiClient();
  withAuthHeader();
  const resp = await window.gapi.client.calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMinISO,
    timeMax: timeMaxISO,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });
  return resp.result.items || [];
}

export async function insertEvent(event) {
  await loadGapiClient();
  withAuthHeader();
  const resp = await window.gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return resp.result;
}

export function buildEventPayload(block, dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const startDate = new Date(y, m - 1, d, Math.floor(block.start), Math.round((block.start % 1) * 60));
  const endDate = new Date(y, m - 1, d, Math.floor(block.end), Math.round((block.end % 1) * 60));
  return {
    summary: `[Planto] ${block.title}`,
    start: { dateTime: startDate.toISOString() },
    end: { dateTime: endDate.toISOString() },
    extendedProperties: { private: { [EXTENDED_PROP_KEY]: block.id } },
  };
}

export const EXTENDED_PROPERTY_KEY = EXTENDED_PROP_KEY;
