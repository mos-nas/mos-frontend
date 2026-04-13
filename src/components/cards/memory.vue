<template>
  <template v-if="mem && Object.keys(mem).length === 0">
    <p class="text-body-2">{{ $t('no memory data available') }}</p>
  </template>
  <template v-else-if="mem && Object.keys(mem).length > 0" class="memory-overview">
    <v-row density="compact">
      <v-col cols="3" sm="3" md="3" xl="3" v-if="mem.total_human">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('installed') }}</strong>
        </div>
        <div class="text-body-2" :title="mem.total_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ mem.installed_human }}
        </div>
      </v-col>
      <v-col cols="3" sm="3" md="3" xl="3" v-if="mem.total_human">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('usable') }}</strong>
        </div>
        <div class="text-body-2" :title="mem.total_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ mem.total_human }}
        </div>
      </v-col>
      <v-col cols="3" sm="3" md="3" xl="3" v-if="mem.used_human">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('used') }}</strong>
        </div>
        <div class="text-body-2" :title="mem.used_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ mem.used_human }}
        </div>
      </v-col>
      <v-col cols="3" sm="3" md="3" xl="3" v-if="mem.free_human">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('free') }}</strong>
        </div>
        <div class="text-body-2" :title="mem.free_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ mem.free_human }}
        </div>
      </v-col>
      <v-divider class="my-2"></v-divider>
      <v-col cols="12">
        <div class="memory-bar-container">
          <div class="memory-segment actual-used" :style="{ width: getMemUsedPercentage() + '%' }" :title="`Used: ${mem.used_human || 0}`">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%">
              <small>{{ mem.used_human || 0 }}</small>
            </div>
          </div>
          <div class="memory-segment free" :style="{ width: getMemFreePercentage() + '%' }" :title="`Free: ${mem.free_human || 0}`">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%">
              <small>{{ mem.free_human || 0 }}</small>
            </div>
          </div>
        </div>
        <div class="memory-legend mt-2">
          <div class="legend-item">
            <div class="legend-color actual-used"></div>
            <span class="text-caption">{{ $t('used') }} ({{ getMemUsedPercentage() }}%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color free"></div>
            <span class="text-caption">{{ $t('free') }} ({{ getMemFreePercentage() }}%)</span>
          </div>
        </div>
      </v-col>
      <v-divider class="my-2"></v-divider>
      <v-col cols="12">
        <details class="memory-details">
          <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline" class="text-body-2 mb-1">{{ $t('details') }}</summary>
          <div class="memory-breakdown-grid" v-if="mem.free_human">
            <div class="memory-breakdown-item">
              <div class="text-caption text-medium-emphasis">
                <strong>{{ $t('system') }}</strong>
              </div>
              <div class="text-body-2" :title="mem.breakdown.system.used_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ mem.breakdown.system.bytes_human }}
              </div>
            </div>
            <div class="memory-breakdown-item">
              <div class="text-caption text-medium-emphasis">
                <strong>{{ $t('docker') }}</strong>
              </div>
              <div class="text-body-2" :title="mem.breakdown.docker.used_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ mem.breakdown.docker.bytes_human }}
              </div>
            </div>
            <div class="memory-breakdown-item">
              <div class="text-caption text-medium-emphasis">
                <strong>{{ $t('lxc') }}</strong>
              </div>
              <div class="text-body-2" :title="mem.breakdown.lxc.used_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ mem.breakdown.lxc.bytes_human }}
              </div>
            </div>
            <div class="memory-breakdown-item">
              <div class="text-caption text-medium-emphasis">
                <strong>{{ $t('vms') }}</strong>
              </div>
              <div class="text-body-2" :title="mem.breakdown.vms.used_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ mem.breakdown.vms.bytes_human }}
              </div>
            </div>
          </div>
          <v-divider class="mb-2"></v-divider>
          <div class="memory-bar-container">
            <div class="memory-segment system-used" :style="{ width: (mem.breakdown?.system?.percentage || 0) + '%' }" :title="`System: ${mem.breakdown?.system?.percentage || 0}%`"></div>
            <div class="memory-segment docker-used" :style="{ width: (mem.breakdown?.docker?.percentage || 0) + '%' }" :title="`Docker: ${mem.breakdown?.docker?.percentage || 0}%`"></div>
            <div class="memory-segment lxc-used" :style="{ width: (mem.breakdown?.lxc?.percentage || 0) + '%' }" :title="`LXC: ${mem.breakdown?.lxc?.percentage || 0}%`"></div>
            <div class="memory-segment vms-used" :style="{ width: (mem.breakdown?.vms?.percentage || 0) + '%' }" :title="`VMs: ${mem.breakdown?.vms?.percentage || 0}%`"></div>
            <div class="memory-segment caches" :style="{ width: (mem.percentage?.dirtyCaches || 0) + '%' }" :title="`Dirty Caches: ${mem.percentage?.dirtyCaches || 0}%`"></div>
            <div class="memory-segment free" :style="{ width: getRealFreePercentage() + '%' }" :title="`Free: ${getRealFreePercentage()}%`"></div>
          </div>
          <div class="memory-legend mt-2">
            <div class="legend-item">
              <div class="legend-color system-used"></div>
              <span class="text-caption">{{ $t('system') }} ({{ mem.breakdown?.system?.percentage || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color docker-used"></div>
              <span class="text-caption">{{ $t('docker') }} ({{ mem.breakdown?.docker?.percentage || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color lxc-used"></div>
              <span class="text-caption">{{ $t('lxc') }} ({{ mem.breakdown?.lxc?.percentage || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color vms-used"></div>
              <span class="text-caption">{{ $t('vms') }} ({{ mem.breakdown?.vms?.percentage || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color caches"></div>
              <span class="text-caption">{{ $t('dirty caches') }} ({{ mem.percentage?.dirtyCaches || 0 }}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color free"></div>
              <span class="text-caption">{{ $t('free') }} ({{ getRealFreePercentage() }}%)</span>
            </div>
          </div>
        </details>
      </v-col>
    </v-row>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" class="my-2" />
  </template>
</template>

<script setup>
import { toRefs, computed } from 'vue';

const props = defineProps({
  memory: { type: Object, default: () => ({}) },
});
const { memory } = toRefs(props);
const mem = computed(() => memory.value ?? {});

const getRealFreePercentage = () => {
  const actuallyUsed = mem.value.percentage?.actuallyUsed || 0;
  const dirtyCaches = mem.value.percentage?.dirtyCaches || 0;
  return Math.max(0, 100 - actuallyUsed - dirtyCaches);
};

const getMemFreePercentage = () => {
  const total = mem.value.total || 1;
  return Math.round(((mem.value.free || 0) / total) * 100);
};

const getMemUsedPercentage = () => {
  return Math.round(((mem.value.used || 0) / (mem.value.total || 1)) * 100);
};
</script>

<style scoped>
.memory-overview {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 12px;
}

.memory-details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.memory-breakdown-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 4px;
  margin-bottom: 8px;
}

.memory-breakdown-item {
  min-width: 0;
}

.memory-stack {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 12px;
}

.memory-bar-container {
  display: flex;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.memory-segment {
  height: 100%;
  transition: all 0.3s ease;
}

.memory-segment.actual-used {
  background: rgb(255, 165, 0);
}

.memory-segment.system-used {
  background: rgb(255, 165, 0);
}

.memory-segment.docker-used {
  background: rgb(182, 255, 0);
}

.memory-segment.lxc-used {
  background: rgb(255, 106, 0);
}

.memory-segment.vms-used {
  background: rgb(114, 0, 255);
}

.memory-segment.caches {
  background: rgb(var(--v-theme-info));
}

.memory-segment.free {
  background: rgb(var(--v-theme-success));
}

.memory-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.actual-used {
  background: rgb(255, 165, 0);
}

.legend-color.system-used {
  background: rgb(255, 165, 0);
}

.legend-color.docker-used {
  background: rgb(182, 255, 0);
}

.legend-color.lxc-used {
  background: rgb(255, 106, 0);
}

.legend-color.vms-used {
  background: rgb(114, 0, 255);
}

.legend-color.caches {
  background: rgb(var(--v-theme-info));
}

.legend-color.free {
  background: rgb(var(--v-theme-success));
}
</style>
