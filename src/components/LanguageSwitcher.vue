<script setup>
import { computed } from 'vue';
import { store } from '../state/store.js';
import { SUPPORTED_LOCALES } from '../i18n/index.js';

const props = defineProps({
  state: { type: Object, required: true },
});

// 缩写显示：中 / EN / 日，悬浮时用 title 显示完整语言名。
const ABBR = { zh: '中', en: 'EN', ja: '日' };

const currentLocale = computed(() => props.state.settings.locale || 'zh');

function setLocale(value) {
  store.setState((s) => ({ settings: { ...s.settings, locale: value } }));
}
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="opt in SUPPORTED_LOCALES"
      :key="opt.value"
      class="language-switcher__btn"
      :class="{ 'language-switcher__btn--active': currentLocale === opt.value }"
      :title="opt.label"
      @click="setLocale(opt.value)"
    >
      {{ ABBR[opt.value] }}
    </button>
  </div>
</template>
