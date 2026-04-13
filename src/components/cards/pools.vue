<template>
  <template v-if="props.pools && props.pools.length === 0">
    <p class="text-body-2">{{ $t('no pools available') }}</p>
  </template>
  <template v-else-if="props.pools && props.pools.length" style="overflow: hidden">
    <div v-for="(pool, index) in props.pools" :key="index" class="py-1">
      <div class="d-flex justify-space-between align-center w-100 mb-1">
        <div class="text-body-2 font-weight-medium">{{ pool.name }}</div>
        <div class="text-caption">{{ pool.status?.usedSpace_human || '-' }} / {{ pool.status?.totalSpace_human || '-' }}</div>
      </div>
      <v-progress-linear
        :model-value="pool.status?.usagePercent || 0"
        height="16"
        :color="pool.status?.usagePercent >= 90 ? 'error' : pool.status?.usagePercent >= 60 ? 'warning' : 'success'"
        rounded
        class="mb-1"
      >
        <template #default>
          <span>
            <small>{{ (pool.status?.usagePercent ?? 0).toFixed(1) }}%</small>
          </span>
        </template>
      </v-progress-linear>
    </div>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" class="my-2" />
  </template>
</template>

<script setup>
const props = defineProps({
  pools: {
    type: Array,
    default: () => [],
  },
});
</script>
