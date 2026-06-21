<template>
  <template v-if="props.disks && props.disks.length === 0">
    <p class="text-body-2">{{ $t('no disks in pools available') }}</p>
  </template>
  <template v-else-if="props.disks && props.disks.length > 0" style="overflow: hidden">
    <div v-for="(pool, poolIdx) in props.disks" :key="poolIdx" class="mb-1" style="overflow: hidden">
      <div class="d-flex align-center justify-space-between mb-0 mt-1" style="overflow: hidden">
        <div :class="['text-subtitle-2 font-weight-medium', { 'mt-2': poolIdx !== 0 }]" style="min-width: 0; line-height: 1; overflow: hidden">
          <span :title="pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}`" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 100%">
            <strong>{{ pool?.name ?? pool?.pool ?? `Pool ${poolIdx + 1}` }}</strong>
          </span>
        </div>
        <div class="text-caption text-medium-emphasis" style="line-height: 1; overflow: hidden">{{ (pool.data_devices?.length ?? 0) + (pool.parity_devices?.length ?? 0) }} {{ $t('device(s)') }}</div>
      </div>

      <v-divider class="my-1" />

      <v-row class="mb-0 py-0" style="flex-wrap: nowrap; overflow: hidden">
        <v-col cols="6" sm="6" class="py-1" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('device') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="pt-1" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('r/s') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="pt-1" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('w/s') }}</strong>
          </div>
        </v-col>
        <v-col cols="2" sm="2" class="pt-1" style="overflow: hidden">
          <div class="text-caption text-medium-emphasis" style="overflow: hidden">
            <strong>{{ $t('temperature') }}</strong>
          </div>
        </v-col>
      </v-row>

      <template v-if="(pool.data_devices && pool.data_devices.length) || (pool.parity_devices && pool.parity_devices.length)">
        <v-row v-for="(data_device, devIdx) in pool.data_devices ?? []" :key="`data-${devIdx}`" class="py-0 mt-0" style="flex-wrap: nowrap; overflow: hidden">
          <v-col cols="6" sm="6" class="d-flex align-center" style="gap: 3px; min-width: 0; overflow: hidden; line-height: 1.1">
            <span
              :style="{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '999px',
                background: data_device.powerStatus === 'active' ? 'rgba(0, 200, 0, 0.8)' : 'rgba(0, 122, 255, 0.9)',
                flex: '0 0 auto',
              }"
            ></span>
            <div class="text-body-2" :title="data_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; min-width: 0">
              {{ data_device.device }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? (data_device.performance.readSpeed_human ?? data_device.performance.readSpeed ?? '—') : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ data_device.performance ? (data_device.performance.writeSpeed_human ?? data_device.performance.writeSpeed ?? '—') : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="d-flex align-center" style="gap: 4px; line-height: 1.1">
              <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
                {{ data_device.temperature ?? '—' }}{{ data_device.temperature ? '°' : '' }}
              </div>
              <v-icon v-if="data_device.temperatureStatus === 'warning'" size="small" color="warning" style="flex: 0 0 auto">mdi-alert</v-icon>
              <v-icon v-if="data_device.temperatureStatus === 'error'" size="small" color="error" style="flex: 0 0 auto">mdi-alert-circle</v-icon>              
            </div>
          </v-col>
        </v-row>

        <v-row v-for="(parity_device, devIdx) in pool.parity_devices ?? []" :key="`parity-${devIdx}`" class="py-0 mt-0" style="flex-wrap: nowrap; overflow: hidden">
          <v-col cols="6" sm="6" class="d-flex align-center py-0" style="gap: 3px; min-width: 0; overflow: hidden; line-height: 1.1">
            <span
              :style="{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '999px',
                background: parity_device.powerStatus === 'active' ? 'rgba(0, 200, 0, 0.8)' : 'rgba(0, 122, 255, 0.9)',
                flex: '0 0 auto',
              }"
            ></span>
            <div class="text-body-2" :title="parity_device.device" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; min-width: 0">
              {{ parity_device.device }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? (parity_device.performance.readSpeed_human ?? parity_device.performance.readSpeed ?? '—') : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
              {{ parity_device.performance ? (parity_device.performance.writeSpeed_human ?? parity_device.performance.writeSpeed ?? '—') : '—' }}
            </div>
          </v-col>
          <v-col cols="2" sm="2" class="pt-1" style="min-width: 0; overflow: hidden">
            <div class="d-flex align-center" style="gap: 4px; line-height: 1.1">
              <div class="text-body-2" style="font-variant-numeric: tabular-nums; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
                {{ parity_device.temperature ?? '—' }}{{ parity_device.temperature ? '°' : '' }}
              </div>
              <v-icon v-if="parity_device.temperatureStatus === 'warning'" size="small" color="warning" style="flex: 0 0 auto">mdi-alert</v-icon>
              <v-icon v-if="parity_device.temperatureStatus === 'error'" size="small" color="error" style="flex: 0 0 auto">mdi-alert-circle</v-icon>              
            </div>
          </v-col>
        </v-row>
      </template>
    </div>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" class="my-2" />
  </template>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
  disks: {
    type: Array,
    default: () => [],
  },
});

watch(
  () => props.disks,
  (newDisks) => {
    if (newDisks && newDisks.length) {
      newDisks.sort((a, b) => a.index - b.index);
    }
  },
  { immediate: true },
);
</script>
