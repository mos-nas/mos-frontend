import { inject, Ref } from 'vue';

export function useOverlay() {
  const overlay = inject<Ref<boolean>>('overlay');

  if (!overlay) {
    throw new Error('Overlay not provided. Make sure it is provided in App.vue');
  }

  const show = () => {
    overlay.value = true;
  };

  const hide = () => {
    overlay.value = false;
  };

  return {
    overlay,
    show,
    hide,
  };
}
