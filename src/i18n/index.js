// vue-i18n 启动配置。三种语言的文案在 locales/*.js 里维护。
import { createI18n } from 'vue-i18n';
import zh from './locales/zh.js';
import en from './locales/en.js';
import ja from './locales/ja.js';

export const SUPPORTED_LOCALES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];

const longDateTime = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

export const i18n = createI18n({
  legacy: false, // Composition API 模式，组件里用 useI18n() 拿 t()/tm()/d()
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh, en, ja },
  datetimeFormats: {
    zh: { long: longDateTime },
    en: { long: longDateTime },
    ja: { long: longDateTime },
  },
});
