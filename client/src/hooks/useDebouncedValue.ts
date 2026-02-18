import { ref, watch } from "vue";

export function useDebouncedValue<T>(value: () => T, delayMs = 300) {
  const debounced = ref<T>(value());
  let timer: number | undefined;

  watch(
    value,
    (next) => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        debounced.value = next;
      }, delayMs);
    },
    { immediate: true }
  );

  return debounced;
}
