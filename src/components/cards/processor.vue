<template>
  <template v-if="osInfo && Object.keys(osInfo).length === 0">
    <p class="text-body-2">{{ $t('no os data available') }}</p>
  </template>
  <template v-else-if="osInfo && Object.keys(osInfo).length">
    <v-row density="compact">
      <v-col cols="6" sm="6" md="6" xl="6" v-if="osInfo && osInfo.cpu">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('brand') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.base[0].os_id" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.cpu.manufacturer }}, {{ osInfo.cpu.brand }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="6" xl="6" v-if="cpu.info.architecture !== undefined && cpu.info.architecture !== null && cpu.info.architecture !== '' && cpu.info.architecture !== 'unknown' && cpu.info.architecture !== 'Unknown'">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('architecture') }}</strong>
        </div>
        <div class="text-body-2" :title="cpu.info.architecture" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ cpu.info.architecture }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="6" xl="6" v-if="osInfo.cpu?.cores !== undefined && osInfo.cpu?.physicalCores !== undefined">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('cores') }}</strong>
        </div>
        <div class="text-body-2" :title="cpu.info.architecture" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.cpu.physicalCores }} / {{ osInfo.cpu.cores }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="6" xl="6" v-if="temperature.main != null || temperature.min != null || temperature.max != null">
        <div class="text-caption text-medium-emphasis" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          <strong>{{ $t('temperature / min / max') }}</strong>
        </div>
        <span v-if="temperature.main != null" class="text-body-2" :title="temperature.main" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ temperature.main }}°C</span>
        <span v-if="temperature.min != null" class="text-body-2" :title="temperature.min" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">/ {{ temperature.min }}°C</span>
        <span v-if="temperature.max != null" class="text-body-2" :title="temperature.max" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">/ {{ temperature.max }}°C</span>
      </v-col>
      <v-divider class="mt-2 mb-2"></v-divider>
      <v-col cols="auto" class="d-flex align-center text-caption" style="width: 60px">
        <strong>{{ $t('load') }}:</strong>
      </v-col>
      <v-col class="d-flex align-center">
        <v-progress-linear :model-value="cpu.load" height="16" :color="cpu.load >= 90 ? 'red' : cpu.load >= 60 ? 'orange' : 'green'" style="margin-top: 0; border-radius: 7px; overflow: hidden">
          <template #default>
            <span>
              <small>{{ cpu.load.toFixed(2) }}%</small>
            </span>
          </template>
        </v-progress-linear>
      </v-col>
      <v-col cols="12" sm="12" md="12" xl="12">
        <div v-if="cpu.cores && cpu.cores.length">
          <details>
            <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline" class="text-body-2 mb-1">{{ $t('cores') }}</summary>
            <v-row v-for="(core, i) in (cpu.cores || []).filter((c) => c.isPhysical)" :key="i" density="compact">
              <v-col>
                <div class="core-row" style="min-width: 0; display: flex; align-items: center; gap: 6px">
                  <div class="core-label text-body-2">
                    <small>
                      <b>Core-{{ core.number }}</b>
                    </small>
                  </div>
                  <div class="core-bar">
                    <v-progress-linear
                      :model-value="core.load?.total ?? 0"
                      height="12"
                      :color="core.load?.total >= 90 ? 'red' : core.load?.total >= 75 ? 'orange' : 'green'"
                      style="margin-top: 2px; border-radius: 6px; overflow: hidden; width: 100%"
                    >
                      <template #default>
                        <span>
                          <small>{{ Number(core.load?.total ?? 0).toFixed(2) }}%</small>
                        </span>
                      </template>
                    </v-progress-linear>
                  </div>
                </div>
              </v-col>
              <v-col v-for="(thread, ti) in (cpu.cores || []).filter((c) => c.isHyperThreaded && c.physicalCoreNumber === core.number)" :key="ti" density="compact">
                <div class="core-row" style="min-width: 0">
                  <div class="core-label text-body-2">
                    <small>
                      <b>Ht-{{ thread.number }}</b>
                    </small>
                  </div>
                  <div class="core-bar">
                    <v-progress-linear
                      :model-value="thread.load?.total ?? 0"
                      height="12"
                      :color="thread.load?.total >= 90 ? 'red' : thread.load?.total >= 75 ? 'orange' : 'green'"
                      style="margin-top: 2px; border-radius: 6px; overflow: hidden; width: 100%"
                    >
                      <template #default>
                        <span>
                          <small>{{ Number(thread.load?.total ?? 0).toFixed(2) }}%</small>
                        </span>
                      </template>
                    </v-progress-linear>
                  </div>
                </div>
              </v-col>
            </v-row>
          </details>
        </div>
      </v-col>
    </v-row>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" />
  </template>
</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) },
  temperature: { type: Object, default: () => ({}) },
  osInfo: { type: Object, default: () => ({}) },
});
const { cpu, temperature, osInfo } = toRefs(props);
</script>

<style scoped>
.cores-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 6px;
  margin: 4px;
}

.core-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.core-label {
  width: 56px;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.core-bar {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 12px;
}
</style>
