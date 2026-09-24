<template>
  <template v-if="cpu && cpu.load !== undefined">
    <v-row density="compact">
      <v-col cols="3" sm="3" md="3">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('current') }}</strong>
        </div>
        <div class="text-body-2">{{ cpu.load.toFixed(2) }}%</div>
      </v-col>
      <v-col cols="3" sm="3" md="3">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('1 min') }}</strong>
        </div>
        <div class="text-body-2">{{ cpu.load.toFixed(2) }}%</div>
      </v-col>
      <v-col cols="3" sm="3" md="3">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('5 min') }}</strong>
        </div>
        <div class="text-body-2">{{ avgLoad5.toFixed(2) }}%</div>
      </v-col>
      <v-col cols="3" sm="3" md="3">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('15 min') }}</strong>
        </div>
        <div class="text-body-2">{{ avgLoad15.toFixed(2) }}%</div>
      </v-col>
      <v-divider class="my-2"></v-divider>
      <v-col cols="12">
        <div class="load-bar-container">
          <div class="load-bar" :style="{ width: Math.min(cpu.load, 100) + '%', backgroundColor: getLoadColor(cpu.load) }"></div>
        </div>
        <div class="load-legend mt-2">
          <div class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: getLoadColor(cpu.load) }"></div>
            <span class="text-caption">{{ getLoadStatus(cpu.load) }}</span>
          </div>
        </div>
      </v-col>
      <v-divider class="my-2"></v-divider>
      <v-col cols="12">
        <div ref="chartEl" class="chart-wrapper"></div>
      </v-col>
    </v-row>
  </template>
  <template v-else>
    <v-skeleton-loader type="article" :loading="true" height="160" class="my-2" />
  </template>
</template>

<script setup>
import { toRefs, ref, watch, onMounted, onBeforeUnmount, nextTick, markRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import * as echarts from 'echarts';

const { t } = useI18n();
const vuetifyTheme = useTheme();

const props = defineProps({
  cpu: { type: Object, default: () => ({ load: 0 }) },
  maxPoints: { type: Number, default: 60 },
});

const { cpu, maxPoints } = toRefs(props);
const MAX_POINTS = maxPoints.value;
const chartEl = ref(null);

let chart = null;
let labels = [];
let seriesLoad = [];
let seriesAvg5 = [];
let seriesAvg15 = [];
let resizeObserver = null;
let resizeListener = null;

const avgLoad5 = ref(0);
const avgLoad15 = ref(0);

function getLoadColor(load) {
  if (load >= 90) return '#ef5350'; // red
  if (load >= 60) return '#ff9800'; // orange
  return '#66bb6a'; // green
}

function getLoadStatus(load) {
  if (load >= 90) return t('high load');
  if (load >= 60) return t('moderate load');
  return t('low load');
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
    areaColor: isDark ? '#66bb6a33' : '#66bb6a44',
    lineColor: isDark ? '#81c784' : '#43a047',
    lineAvg5Color: isDark ? '#ffb74d' : '#f57c00',
    lineAvg15Color: isDark ? '#64b5f6' : '#1e88e5',
  };
}

function clampHistory() {
  const trim = (arr) => {
    if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
  };
  trim(labels);
  trim(seriesLoad);
  trim(seriesAvg5);
  trim(seriesAvg15);
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
    color: [colors.lineColor, colors.lineAvg5Color, colors.lineAvg15Color],
    backgroundColor: 'transparent',
    textStyle: { color: colors.textColor },
    animation: true,
    animationDuration: 400,
    animationDurationUpdate: 400,
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
                `<div style="color: ${p.color}; padding: 2px 0">● ${p.name}: <strong>${p.value.toFixed(2)}%</strong></div>`,
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
        formatter: (v) => `${v}%`,
      },
      splitLine: { lineStyle: { color: colors.gridColor, type: 'dashed' } },
    },
    series: [
      {
        name: t('load current'),
        type: 'line',
        data: seriesLoad,
        smooth: 0.4,
        lineStyle: { width: 2.5 },
        areaStyle: { color: colors.areaColor },
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
      },
      {
        name: t('load avg5min'),
        type: 'line',
        data: seriesAvg5,
        smooth: 0.4,
        lineStyle: { width: 2 },
        areaStyle: null,
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
      },
      {
        name: t('load avg15min'),
        type: 'line',
        data: seriesAvg15,
        smooth: 0.4,
        lineStyle: { width: 2 },
        areaStyle: null,
        itemStyle: { borderWidth: 0 },
        symbol: 'none',
        emphasis: { scale: false },
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
  () => cpu.value?.load,
  (newLoad) => {
    if (newLoad === undefined) return;

    const ts = new Date();
    const label = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    labels.push(label);
    seriesLoad.push(newLoad);

    const windowSize5 = 5;
    const windowSize15 = 15;

    const avg5 = seriesLoad.length >= windowSize5
      ? seriesLoad.slice(-windowSize5).reduce((a, b) => a + b, 0) / windowSize5
      : seriesLoad.reduce((a, b) => a + b, 0) / seriesLoad.length;

    const avg15 = seriesLoad.length >= windowSize15
      ? seriesLoad.slice(-windowSize15).reduce((a, b) => a + b, 0) / windowSize15
      : seriesLoad.reduce((a, b) => a + b, 0) / seriesLoad.length;

    avgLoad5.value = avg5;
    avgLoad15.value = avg15;

    seriesAvg5.push(avg5);
    seriesAvg15.push(avg15);

    clampHistory();
    
    if (chart) {
      updateChart();
    } else {
      nextTick(() => {
        if (chartEl.value && !chart) {
          initChart();
        }
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  nextTick(() => {
    if (chartEl.value) {
      initChart();
    }
  });
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
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 220px;
}

.load-bar-container {
  width: 100%;
  height: 24px;
  background-color: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.load-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 2px;
}

.load-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
</style>
