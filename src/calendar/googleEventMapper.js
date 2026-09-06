// 把 Google Calendar 事件转换成按天分组的时段列表（小时为单位）。
// REQ-072：这个文件原名 conflictMapper.js，当时只服务"读取忙碌时段避让
// 冲突"这一个已删除的功能（把结果单纯拿去和用户自己的块比对生成文字
// 警告，不落地成真正的日历块）；现在服务"从 Google 同步到本地"，产出
// 的时段直接被 GoogleSyncPanel.vue 转成只读的 `source:'google'` 块写进
// dayTimelines，函数改名以贴合新用途，逻辑本身（含跨天事件按天切分）
// 没有变化。全天事件（无 dateTime，只有 date）不参与小时级时段计算，
// Google Calendar 的全天事件语义（跨若干天、和具体钟点无关）跟这个
// 应用"小时级时间块"的数据模型不匹配，简化处理成忽略，不尝试硬凑一个
// 全天块。
import { getDateKey } from '../utils/dateUtils.js';

export function mapEventsToDaySegments(events) {
  const map = {};

  for (const ev of events) {
    if (!ev.start?.dateTime || !ev.end?.dateTime) continue;

    const start = new Date(ev.start.dateTime);
    const end = new Date(ev.end.dateTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) continue;

    let cursor = new Date(start);
    while (cursor < end) {
      const dayStart = new Date(cursor);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const segStartMs = Math.max(start.getTime(), dayStart.getTime());
      const segEndMs = Math.min(end.getTime(), dayEnd.getTime());
      const startHour = (segStartMs - dayStart.getTime()) / 3600000;
      const endHour = (segEndMs - dayStart.getTime()) / 3600000;

      if (endHour > startHour) {
        const dateKey = getDateKey(dayStart);
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push({
          start: startHour,
          end: endHour,
          title: ev.summary || 'Google 日程',
          googleEventId: ev.id,
        });
      }
      cursor = dayEnd;
    }
  }

  return map;
}
