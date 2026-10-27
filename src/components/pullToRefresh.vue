<template>
  <v-pull-to-refresh :pull-down-threshold="threshold" @load="onLoad">
    <slot />
  </v-pull-to-refresh>
</template>

<script setup>
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

const onLoad = async ({ done }) => {
  emit('refresh-start');
  try {
    await props.onRefresh();
  } catch (error) {
    console.error('Refresh error:', error);
  } finally {
    done('ok');
    emit('refresh-end');
  }
};
</script>

<style>
html,
body {
  overscroll-behavior-y: none;
}
</style>
