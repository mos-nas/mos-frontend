<template>
  <template v-if="osInfo && Object.keys(osInfo).length === 0">
    <p class="text-body-2">{{ $t('no os data available') }}</p>
  </template>
  <template v-else-if="osInfo && Object.keys(osInfo).length > 0">
    <v-row density="compact">
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.base?.[0]?.os_id">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('platform') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.base[0].os_id" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ osInfo.base[0].os_id }}
        </div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.base?.[0]?.os_name">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('name') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.base[0].os_name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.base[0].os_name }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.base?.[0]?.os_version">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('version') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.base[0].os_version" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.base[0].os_version }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.hostname">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('hostname') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.hostname" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.hostname }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.uptime">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('uptime') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.uptime.pretty" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.uptime.pretty }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.arch">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('architecture') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.arch" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.arch }}</div>
      </v-col>
      <v-col cols="12" v-if="osInfo?.mos"><v-divider></v-divider></v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.version">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos version') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.version" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.version }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.channel">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos channel') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.channel" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.channel }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.build">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos build') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.build" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.build }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.running_kernel">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos kernel') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.running_kernel" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.running_kernel }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.frontend">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos frontend') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.frontend" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.frontend }}</div>
      </v-col>
      <v-col cols="6" sm="6" md="4" xl="3" v-if="osInfo?.mos?.api">
        <div class="text-caption text-medium-emphasis">
          <strong>{{ $t('mos api') }}</strong>
        </div>
        <div class="text-body-2" :title="osInfo.mos.api" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ osInfo.mos.api }}</div>
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
  osInfo: { type: Object, default: () => ({}) },
});
const { osInfo } = toRefs(props);
</script>
