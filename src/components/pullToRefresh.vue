<template>
  <div ref="root" class="ptr-root">
    <div class="ptr-indicator" :style="indicatorStyle">
      <v-progress-circular :model-value="progress" :indeterminate="refreshing" size="28" width="3" color="primary" />
    </div>
    <div class="ptr-content" :class="{ 'ptr-animate': !dragging }" :style="contentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  onRefresh: {
    type: Function,
    required: true,
  },
  threshold: {
    type: Number,
    default: 64,
  },
});

const emit = defineEmits(['refresh-start', 'refresh-end']);

const root = ref(null);
const pull = ref(0);
const refreshing = ref(false);
const dragging = ref(false);

let tracking = false;
let startY = 0;
let startX = 0;

const progress = computed(() => Math.min(100, (pull.value / props.threshold) * 100));

const contentStyle = computed(() => (pull.value > 0 ? { transform: `translateY(${pull.value}px)` } : {}));

const indicatorStyle = computed(() => ({
  opacity: refreshing.value ? 1 : Math.min(1, pull.value / props.threshold),
  transform: `translateY(${pull.value - 40}px)`,
}));

const isScrolledAway = (target) => {
  let node = target;
  while (node && node !== document.documentElement) {
    if (node.scrollTop > 0) return true;
    node = node.parentElement;
  }
  const doc = document.scrollingElement || document.documentElement;
  return (window.scrollY || doc.scrollTop || 0) > 0;
};

const onTouchStart = (e) => {
  if (refreshing.value || e.touches.length !== 1) return;
  if (isScrolledAway(e.target)) return;
  tracking = true;
  dragging.value = false;
  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
};

const onTouchMove = (e) => {
  if (!tracking) return;
  const dy = e.touches[0].clientY - startY;
  const dx = e.touches[0].clientX - startX;

  if (!dragging.value) {
    if (dy < 0 || Math.abs(dx) > Math.abs(dy)) {
      tracking = false;
      return;
    }
    if (dy < 8) return;
    if (isScrolledAway(e.target)) {
      tracking = false;
      return;
    }
    dragging.value = true;
  }

  if (e.cancelable) e.preventDefault();
  pull.value = Math.min(dy * 0.5, props.threshold * 1.6);
};

const onTouchEnd = async () => {
  const wasDragging = dragging.value;
  tracking = false;
  dragging.value = false;
  if (!wasDragging) return;

  if (pull.value >= props.threshold) {
    refreshing.value = true;
    pull.value = props.threshold;
    emit('refresh-start');
    try {
      await props.onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      refreshing.value = false;
      pull.value = 0;
      emit('refresh-end');
    }
  } else {
    pull.value = 0;
  }
};

onMounted(() => {
  const el = root.value;
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd, { passive: true });
  el.addEventListener('touchcancel', onTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  const el = root.value;
  if (!el) return;
  el.removeEventListener('touchstart', onTouchStart);
  el.removeEventListener('touchmove', onTouchMove);
  el.removeEventListener('touchend', onTouchEnd);
  el.removeEventListener('touchcancel', onTouchEnd);
});
</script>

<style>
html,
body {
  overscroll-behavior-y: none;
}

.ptr-root {
  position: relative;
}

.ptr-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -14px;
  z-index: 5;
  pointer-events: none;
}

.ptr-animate {
  transition: transform 0.2s ease;
}

.ptr-indicator,
.ptr-content {
  will-change: transform;
}
</style>