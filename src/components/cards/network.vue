<template>
  <template v-if="network && network.interfaces && network.interfaces.length === 0">
    <p class="text-body-2">{{ $t('no network interface found') }}</p>
  </template>
  <template v-else-if="network && network.interfaces && network.interfaces.length > 0">
    <v-row density="compact">
      <template v-if="nic">
        <v-col cols="6" sm="6" md="3" v-if="getInterfaceName(nic)">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('interface') }}</strong>
          </div>
          <div class="d-flex align-center">
            <div class="text-body-2" :title="getInterfaceName(nic)" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 4px">{{ getInterfaceName(nic) }}</div>
            <v-menu>
              <template #activator="{ props }">
                <v-icon v-bind="props" color="grey-darken-1" style="cursor: pointer; margin-left: 4px">mdi-chevron-down</v-icon>
              </template>
              <v-list>
                <v-list-item v-for="intf in interfaces" :key="getInterfaceName(intf)" @click="selectInterface(intf)">
                  <v-list-item-title>{{ getInterfaceName(intf) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-col>
        <v-col cols="6" sm="6" md="3" v-if="nic.type">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('type') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.type" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.type }}</div>
        </v-col>
        <v-col cols="6" sm="6" md="3" v-if="nic.state">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('state') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.state" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.state }}</div>
        </v-col>
        <v-col cols="6" sm="6" md="3" v-if="nic.ip4">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('ip4') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.ip4" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.ip4 }}</div>
        </v-col>
        <v-col cols="6" sm="6" md="3" v-if="nic.ip6">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('ip6') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.ip6" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.ip6 }}</div>
        </v-col>
        <v-col cols="6" sm="6" md="3" v-if="nic.speed_human">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('speed') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.speed_human" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.speed_human }}</div>
        </v-col>  
        <v-col cols="6" sm="6" md="3" v-if="nic.mac">
          <div class="text-caption text-medium-emphasis">
            <strong>{{ $t('mac') }}</strong>
          </div>
          <div class="text-body-2" :title="nic.mac" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ nic.mac }}</div>
        </v-col>
        <v-divider class="my-1" />
        <v-col cols="12">
          <div ref="chartEl" class="chart-wrapper"></div>
        </v-col>
      </template>

      <template v-else>
        <p>{{ $t('no network interface found') }}</p>
      </template>
    </v-row>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" class="my-2" />
  </template>
</template>

<script setup>
import { toRefs, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import * as echarts from 'echarts';
import { showSnackbarError } from '@/composables/snackbar';

const { t } = useI18n();
const vuetifyTheme = useTheme();

const props = defineProps({
  network: { type: Object, default: () => ({ interfaces: [] }) },
  maxPoints: { type: Number, default: 60 },
});

const { network, maxPoints } = toRefs(props);
const MAX_POINTS = maxPoints.value;
const nic = ref(null);
const chartEl = ref(null);
const interfaces = ref([]);

let chart = null;
let labels = [];
let seriesRx = [];
let seriesTx = [];
let seriesTotal = [];
let resizeObserver = null;
let resizeListener = null;

let lastUpdateTs = null;
let smoothedInterval = 2000;
let currentAnimDuration = 900;
const ANIM_DURATION_MIN = 800;
const ANIM_DURATION_MAX = 2800;
const ANIM_DURATION_FACTOR = 1.15;
const INTERVAL_EMA_ALPHA = 0.3;

function getInterfaceName(iface) {
  return iface?.interface || iface?.name || null;
}

function setSelectedNic(iface) {
  nic.value = iface ? { ...iface } : null;
}

function clampHistory() {
  const trim = (arr) => {
    if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
  };
  trim(labels);
  trim(seriesRx);
  trim(seriesTx);
  trim(seriesTotal);
}

function formatBytesPerSec(bytesPerSec) {
  if (bytesPerSec == null || isNaN(bytesPerSec)) return '–';
  const abs = Math.abs(bytesPerSec);
  if (abs < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  const units = ['KB/s', 'MB/s', 'GB/s', 'TB/s'];
  let v = bytesPerSec / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)} ${units[i]}`;
}

function getThemeMode() {
  return vuetifyTheme.global.name.value;
}

function getThemeColors() {
  const isDark = getThemeMode() === 'dark';
  return {
    textColor: isDark ? '#f0f0f0' : '#333',
    labelColor: isDark ? '#ffffff' : '#333',
    labelFontSize: 13,
    labelFontWeight: isDark ? 700 : 500,
    gridColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
    areaRxColor: isDark ? '#4caf5033' : '#4caf5044',
    areaTxColor: isDark ? '#2196f333' : '#2196f344',
    areaTotalColor: isDark ? '#ff980033' : '#ff980044',
    lineRxColor: isDark ? '#81c784' : '#43a047',
    lineTxColor: isDark ? '#64b5f6' : '#1e88e5',
    lineTotalColor: isDark ? '#ffb74d' : '#f57c00',
  };
}

function initChart() {
  if (!chartEl.value) return;

  if (chart) {
    chart.dispose();
    chart = null;
  }

  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  chart = markRaw(echarts.init(chartEl.value, null, { renderer: 'canvas' }));
  updateChart();

  resizeListener = () => {
    if (chart) {
      chart.resize();
    }
  };
  window.addEventListener('resize', resizeListener);
  
  resizeObserver = new ResizeObserver(() => {
    if (chart) {
      chart.resize();
    }
  });
  resizeObserver.observe(chartEl.value);
}

function updateChart() {
  if (!chart) return;

  const colors = getThemeColors();

  const option = {
    color: [colors.lineRxColor, colors.lineTxColor, colors.lineTotalColor],
    backgroundColor: 'transparent',
    textStyle: { color: colors.textColor },
    animation: true,
    animationDuration: 400,
    animationDurationUpdate: currentAnimDuration,
    animationEasingUpdate: 'linear',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: '#fff',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross', lineStyle: { color: colors.gridColor } },
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        const label = params[0].axisValue;
        return (
          `<div style="padding: 4px 0"><strong>${label}</strong></div>` +
          params
            .map(
              (p) =>
                `<div style="color: ${p.color}; padding: 2px 0">● ${p.name}: <strong>${formatBytesPerSec(p.value)}</strong></div>`,
            )
            .join('')
        );
      },
    },
    legend: {
      top: 0,
      textStyle: {
        color: colors.labelColor,
        fontSize: colors.labelFontSize,
        fontWeight: colors.labelFontWeight,
      },
      itemGap: 20,
    },
    grid: {
      left: '50px',
      right: '20px',
      top: '28px',
      bottom: '40px',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: { lineStyle: { color: colors.gridColor } },
      axisLabel: {
        color: colors.labelColor,
        fontSize: colors.labelFontSize,
        fontWeight: colors.labelFontWeight,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: colors.gridColor } },
      axisLabel: {
        color: colors.labelColor,
        fontSize: colors.labelFontSize,
        fontWeight: colors.labelFontWeight,
        formatter: (v) => formatBytesPerSec(v),
      },
      splitLine: { lineStyle: { color: colors.gridColor, type: 'dashed' } },
    },
    series: [
      {
        name: 'RX',
        type: 'line',
        data: seriesRx,
        smooth: 0.4,
        lineStyle: { width: 2.5 },
        areaStyle: { color: colors.areaRxColor },
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
        animationDuration: currentAnimDuration,
        animationEasing: 'linear',
      },
      {
        name: 'TX',
        type: 'line',
        data: seriesTx,
        smooth: 0.4,
        lineStyle: { width: 2.5 },
        areaStyle: { color: colors.areaTxColor },
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
        animationDuration: currentAnimDuration,
        animationEasing: 'linear',
      },
      {
        name: 'Total',
        type: 'line',
        data: seriesTotal,
        smooth: 0.4,
        lineStyle: { width: 2.5 },
        areaStyle: { color: colors.areaTotalColor },
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
        animationDuration: currentAnimDuration,
        animationEasing: 'linear',
      },
    ],
  };

  chart.setOption(option);
}

watch(
  () => vuetifyTheme.global.name.value,
  () => {
    if (chart) updateChart();
  },
);

watch(
  () => network.value?.interfaces,
  (ifaces) => {
    const newVal = ifaces?.[0] || null;
    if (!newVal) {
      setSelectedNic(null);
      labels = [];
      seriesRx = [];
      seriesTx = [];
      seriesTotal = [];
      lastUpdateTs = null;
      smoothedInterval = 2000;
      if (chart) updateChart();
      return;
    }

    setSelectedNic(newVal);

    const rxB = newVal?.statistics?.rx?.speed_bps;
    const txB = newVal?.statistics?.tx?.speed_bps;
    let totalB = newVal?.statistics?.total?.speed_bps;
    if ((totalB == null || isNaN(totalB)) && (rxB != null || txB != null)) totalB = (rxB || 0) + (txB || 0);
    if (rxB == null && txB == null && totalB == null) return;

    const now = Date.now();
    if (lastUpdateTs != null) {
      const delta = now - lastUpdateTs;
      const clampedDelta = Math.min(Math.max(delta, 300), 5000);
      smoothedInterval = smoothedInterval * (1 - INTERVAL_EMA_ALPHA) + clampedDelta * INTERVAL_EMA_ALPHA;
      currentAnimDuration = Math.min(Math.max(smoothedInterval * ANIM_DURATION_FACTOR, ANIM_DURATION_MIN), ANIM_DURATION_MAX);
    }
    lastUpdateTs = now;

    const ts = new Date();
    const label = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    labels.push(label);
    seriesRx.push(rxB ?? 0);
    seriesTx.push(txB ?? 0);
    seriesTotal.push(totalB ?? 0);

    clampHistory();
    if (chart) updateChart();
  },
  { immediate: true, deep: true },
);

watch(
  () => chartEl.value,
  (v) => {
    if (v) initChart();
  },
  { immediate: true },
);

onMounted(() => {
  getAllInterfaces();
});

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
    resizeListener = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

const getAllInterfaces = async () => {
  try {
    const res = await fetch('/api/v1/mos/system/network/interfaces', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network interfaces could not be fetched')}|$| ${error.error || t('unknown error')}`);
    }
    
    interfaces.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setNewInterface = async (iface) => {
  const payload = {
    interface: iface,
  };
  try {
    const res = await fetch('/api/v1/mos/dashboard/interface', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network interface could not be set')}|$| ${error.error || t('unknown error')}`);
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const selectInterface = (iface) => {
  labels = [];
  seriesRx = [];
  seriesTx = [];
  seriesTotal = [];
  lastUpdateTs = null;
  smoothedInterval = 2000;
  setNewInterface(getInterfaceName(iface));
  setSelectedNic(iface);
  if (chart) updateChart();
};

</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
}
</style>