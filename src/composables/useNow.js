// 提供一个每 30 秒刷新一次的"当前时间"，供日/周视图画"现在"横线用。
// now 是模块级单例（多个视图同时用到时共享同一个 ref），定时器按挂载的
// 组件数量计数，最后一个用到它的组件卸载时才清掉，避免遗留定时器。
import { onMounted, onUnmounted, ref } from 'vue';

const now = ref(new Date());
let refCount = 0;
let timer = null;

export function useNow() {
  onMounted(() => {
    refCount++;
    if (!timer) {
      timer = setInterval(() => {
        now.value = new Date();
      }, 30000);
    }
  });

  onUnmounted(() => {
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  return now;
}
