<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 @click="showSpecialActions++" class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('settings') }}</h2>
        </div>
      </v-container>
      <v-container class="pa-0" fluid>
        <v-row>
          <!-- System Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-update</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('system') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" @click="openUpdateOsDialog()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-package-up" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update system') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="openUpdateKernelDialog()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-engine" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update kernel') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="rollbackKernelDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-undo" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('rollback kernel') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="rebootDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-restart" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('reboot') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="shutdownDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-power" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('shutdown') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- System Configuration Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-cog</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('system configuration') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" to="/mosSettings/users" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-account" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('users') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/system" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-desktop-classic" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('system') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/cron" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-clock-outline" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('cron jobs') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/logs" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-text-box-outline" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('logs') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/mosHub" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-hub" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('mos hub') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/notifications" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-bell" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('notifications') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="downloadDiagnostics()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-doctor" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('diagnostics') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Hardware Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-chip</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('hardware') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" to="/mosSettings/boot" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-usb-flash-drive" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('boot') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/usbDevices" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-usb" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('usb devices') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/pciDevices" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-chip" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('pci devices') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/sensors" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-thermometer" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('sensors') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/zram" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-memory" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('zram') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/smart" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-chart-timeline-variant-shimmer" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('s.m.a.r.t.') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Virtualization Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-server</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('virtualization') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" to="/mosSettings/docker" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-docker" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('docker service') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/lxc" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-package-variant" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('lxc service') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/vm" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-desktop-tower" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('vm service') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Network Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-network</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('network') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" to="/mosSettings/networkInterfaces" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-ethernet" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('network interfaces') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/networkServices" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-network-outline" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('network services') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/iscsiTargets" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-server-network" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('iscsi target') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/iscsiInitiators" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-server-network" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('iscsi initiator') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosSettings/token" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-key" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('token') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Others Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-help-box</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('others') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" @click="thanksDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-handshake" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('thanks') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="aboutDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-information" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('about') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" href="https://docs.mos-official.net" target="_blank" rel="noopener" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-help-circle" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('help') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="supportDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-lifebuoy" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('support mos') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Special Actions Card -->
          <v-col v-if="showSpecialActions >= 3" cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-star-face</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('special') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" @click="updateAPI()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-api" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update api') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="updateUI()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-monitor" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update ui') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <!-- Update OS Dialog -->
  <v-dialog v-model="updateOsDialog.value" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-update" :title="t('update system')" class="pa-0">
      <v-card-text class="pa-0">
        <div style="max-height: 60vh; overflow-y: auto; padding: 16px" class="pb-0 mb-0">
          <div v-if="osInfo?.mos" class="ma-0 mb-4">
            <p class="ma-0 text-body-2">
              <b>{{ $t('mos version') }}:</b>
              {{ osInfo.mos.version }}
            </p>
            <p class="ma-0 text-body-2">
              <b>{{ $t('mos channel') }}:</b>
              {{ osInfo.mos.channel }}
            </p>
            <p class="ma-0 text-body-2">
              <b>{{ $t('mos kernel') }}:</b>
              {{ osInfo.mos.running_kernel }}
            </p>
          </div>
          <p class="ma-0 mb-4">{{ t('please select your target firmware!') }}</p>
          <v-select
            v-model="updateOsDialog.channel"
            :items="getMosChannels()"
            :label="t('channel')"
            @update:modelValue="onChannelChange"
            :hide-details="updateOsDialog.channel && updateOsDialog.channel !== osInfo?.mos?.channel ? 'auto' : false"
          ></v-select>
          <v-alert v-if="updateOsDialog.channel && updateOsDialog.channel !== osInfo?.mos?.channel" type="warning" icon="mdi-alert" variant="text" density="compact" class="text-caption">
            {{ t('channel is being switched from') }} {{ osInfo.mos.channel }} {{ t('to') }} {{ updateOsDialog.channel }}
          </v-alert>
          <v-select v-model="updateOsDialog.release" :items="getMosReleasesOfChannel()" :label="t('release')"></v-select>
          <v-switch v-model="updateOsDialog.update_kernel" :label="t('update kernel')" inset density="compact" color="green" hide-details="auto" />
          <v-switch v-model="updateOsDialog.update_plugins" :label="t('update plugins')" inset density="compact" color="green" hide-details="auto" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateOsDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Update Kernel Dialog -->
  <v-dialog v-model="updateKernelDialog.value" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-engine" :title="t('update kernel')" class="pa-0">
      <v-card-text class="pa-0">
        <div style="max-height: 60vh; overflow-y: auto; padding: 16px; padding-bottom: 32px">
          <p class="mb-4">{{ t('please select your target kernel release!') }}</p>
          <v-select v-model="updateKernelDialog.version" :items="['recommended', ...mosKernel.map((k) => k.tag_name)]" :label="t('kernel release')" hide-details="auto" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="updateKernelDialog.value = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="updateKernel(updateKernelDialog.version)"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rollback Kernel Dialog -->
  <v-dialog v-model="rollbackKernelDialog" max-width="600">
    <v-card max-width="600" prepend-icon="mdi-undo" :title="t('rollback kernel')" class="pa-0">
      <v-card-text>
        <p class="mb-4">{{ t('are you sure you want to rollback to the previous kernel version?') }}</p>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rollbackKernelDialog = false"></v-btn>
        <v-btn color="red" :text="t('ok')" @click="rollbackKernel()"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Thanks Dialog -->
  <v-dialog v-model="thanksDialog" max-width="500">
    <v-card max-width="600" class="pa-0" style="max-height: 80vh; display: flex; flex-direction: column" :title="t('thanks')" prepend-icon="mdi-handshake">
      <v-card-text style="padding-bottom: 0" class="pa-0 pl-4 pr-4 ma-0">
        <p class="ma-0 mb-2">
          {{ t('the mos team') }},
          <br />
        </p>
        <p class="ma-0 mb-4">{{ t('thanks you for your use and feedback') }}!</p>
      </v-card-text>
      <v-divider />
      <v-card-text class="font-weight-medium pl-4 pt-2 pb-2">{{ t('used software and packages') }}:</v-card-text>
      <div style="overflow-y: auto; flex: 1 1 auto">
        <v-container v-if="osInfo && osInfo.base && osInfo.base.length" class="pa-0">
          <div v-for="(baseItem, i) in osInfo.base" :key="i" class="pa-0 mb-4">
            <v-list class="pa-0">
              <v-list-item v-if="baseItem.os_name">
                <v-list-item-title class="text-body-1">{{ baseItem.os_name }}</v-list-item-title>
                <v-list-item-subtitle class="text--secondary">{{ baseItem.os_version }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-for="pkg in baseItem.packages" :key="pkg.name">
                <div class="v-list-item-content">
                  <v-list-item-title class="text-body-1">{{ pkg.name }}</v-list-item-title>
                  <v-list-item-subtitle class="text--secondary">{{ pkg.version }}</v-list-item-subtitle>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </v-container>
      </div>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff)">
        <v-spacer />
        <v-btn color="onPrimary" :text="t('close')" @click="thanksDialog = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- About Dialog -->
  <v-dialog v-model="aboutDialog" max-width="600">
    <v-card class="pa-0" style="max-height: 80vh; display: flex; flex-direction: column" prepend-icon="mdi-information" :title="t('about')">
      <div style="overflow-y: auto; flex: 1 1 auto; padding-right: 16px">
        <v-card-text class="py-0">
          <v-row class="align-center" no-gutters>
            <v-col cols="auto" class="pr-4">
              <v-img src="/mos_black.png" alt="MOS Logo" height="56" width="56" contain />
            </v-col>
            <v-col>
              <div class="text-h6 font-weight-medium">{{ $t('mos') }}</div>
              <div class="text-body-2 text-medium-emphasis">
                <span v-if="osInfo?.mos">{{ $t('version') }}: {{ osInfo.mos.version }} · {{ $t('channel') }}: {{ osInfo.mos.channel }}</span>
              </div>
            </v-col>
            <v-col cols="auto" class="pl-2">
              <v-chip color="green" variant="tonal" size="small" :title="$t('forever and ever')">
                {{ $t('open source') }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-4">
          <div class="font-weight-bold mb-2">{{ $t('the team') }}:</div>
          <v-row class="d-flex" density="comfortable">
            <v-col cols="12">
              <v-chip
                v-for="(c, idx) in ['alturismo', 'anym001', 'giganode', 'Christoph Hummer (ich777)', 'j0k3r', 'Joly0', 'Mainfrezzer', 'RiDDiX', 'Harald Wiesinger (s3ppo)', 'Sonic6']"
                :key="idx"
                class="ma-1"
                size="small"
                variant="outlined"
              >
                <v-icon start size="16">mdi-account</v-icon>
                {{ c }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-2">
          <div class="font-weight-bold mb-2">{{ $t('official channels') }}:</div>
          <v-row density="comfortable" class="align-center">
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://discord.gg/fcTMbuygTV" target="_blank" rel="noopener" :aria-label="'Discord'" title="Discord">
                <v-icon color="#7289DA">mdi-headphones</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://www.reddit.com/r/MOS_official_net" target="_blank" rel="noopener" :aria-label="'Reddit'" title="Reddit">
                <v-icon color="#FF4500">mdi-reddit</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="text" icon size="small" href="https://x.com/mos_offi" target="_blank" rel="noopener" :aria-label="'X'" title="X">
                <v-icon color="#1DA1F2">mdi-twitter</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-text class="py-2">
          <div class="font-weight-bold mb-2">{{ $t('source & license') }}:</div>
          <v-row class="mt-2" density="comfortable">
            <v-col cols="auto">
              <v-btn variant="outlined" size="small" href="https://github.com/ich777/mos-releases" target="_blank" rel="noopener">
                <v-icon start>mdi-github</v-icon>
                GitHub
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="outlined" size="small" href="https://github.com/ich777/mos-frontend?tab=AGPL-3.0-1-ov-file" target="_blank" rel="noopener">
                <v-icon start>mdi-file-document-outline</v-icon>
                AGPL-3.0
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
      <v-divider />
      <v-card-actions style="position: sticky; bottom: 0; z-index: 2; background: var(--v-theme-surface, #fff)">
        <v-spacer />
        <v-btn variant="text" color="onPrimary" @click="aboutDialog = false">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Support MOS Dialog -->
  <v-dialog v-model="supportDialog" max-width="700" persistent>
    <v-card max-width="700" prepend-icon="mdi-lifebuoy" :title="t('support mos')" class="pa-0">
      <v-card-text class="pt-0">
        <span>{{ t('mos is and will be free for everyone') }}!</span>
        <br />
        <span>{{ t('if you would like to support the project, please consider to send a donation') }}.</span>
        <br />
        <span v-if="!mosServices?.mos?.supporter" class="d-block mt-2">
          {{ t('as a thank you, every supporter who donates at least $5 will receive a code to unlock a support banner') }}.
          <br />
          <v-divider class="mt-2 mb-2"></v-divider>
          <v-btn variant="text" @click="showEnterCode = !showEnterCode" class="mb-2" prepend-icon="mdi-ticket">
            {{ showEnterCode ? t('hide code entry') : t('enter code') }}
          </v-btn>
          <v-slide-y-transition>
            <div v-if="showEnterCode">
              <v-text-field v-model="supportCode" :label="t('enter code')" hide-details class="mb-2"></v-text-field>
              <div class="d-flex justify-end">
                <v-btn variant="text" color="primary" @click="validateSupportCode()">{{ t('validate') }}</v-btn>
              </div>
            </div>
          </v-slide-y-transition>
        </span>
        <span v-else class="d-block mt-2 text-primary">
          <v-divider class="mt-2 mb-2"></v-divider>
          {{ t('support banner already unlocked') }}. {{ t('thank you for being a supporter') }}!
        </span>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn prepend-icon="mdi-gift" variant="text" color="primary" href="https://paypal.me/chips777" target="_blank" rel="noopener">{{ t('paypal') }}</v-btn>
        <v-btn prepend-icon="mdi-gift" variant="text" color="primary" href="https://github.com/sponsors/ich777?frequency=one-time&sponsor=ich777" target="_blank" rel="noopener">{{ t('github sponsors') }}</v-btn>        
        <v-spacer />
        <v-btn color="onPrimary" :text="t('close')" @click="supportDialog = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Reboot Dialog -->
  <v-dialog v-model="rebootDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to reboot your system?')" :title="t('reboot')" class="pa-0">
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rebootDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="rebootOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Shutdown Dialog -->
  <v-dialog v-model="shutdownDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to shutdown your system?')" :title="t('shutdown')" class="pa-0">
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="shutdownDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="shutdownOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { onMounted, ref, reactive, inject } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const mosReleases = ref({});
const mosServices = inject('mosServices');
const mosKernel = ref([]);
const thanksDialog = ref(false);
const aboutDialog = ref(false);
const supportDialog = ref(false);
const rollbackKernelDialog = ref(false);
const rebootDialog = ref(false);
const shutdownDialog = ref(false);
const showSpecialActions = ref(0);
const osInfo = ref({});
const { t } = useI18n();
const { overlay } = useOverlay();
const updateOsDialog = reactive({
  value: false,
  channel: null,
  release: null,
  update_kernel: true,
  update_plugins: true,
});
const updateKernelDialog = reactive({
  value: false,
  version: null,
});

onMounted(() => {
  getMosReleases();
  getOsInfo();
  getMosKernel();
});

const getMosReleases = async () => {
  try {
    const res = await fetch('/api/v1/mos/getreleases', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch releases')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    mosReleases.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getMosKernel = async () => {
  try {
    const res = await fetch('/api/v1/mos/getkernel', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to fetch kernel releases')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    mosKernel.value = data;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getOsInfo = async () => {
  try {
    const res = await fetch('/api/v1/mos/osinfo', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('API-Error')}|$| ${error.error || t('unknown error')}`);
    }

    osInfo.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getMosChannels = () => {
  return Object.keys(mosReleases.value);
};
const getMosReleasesOfChannel = () => {
  if (!updateOsDialog.channel) return [];

  const releases = mosReleases.value[updateOsDialog.channel] || [];
  const tags = releases.map((item) => item.tag_name);
  if (releases.length > 0) {
    tags.unshift('latest');
  }
  return tags;
};

const updateOS = async () => {
  const updateBody = {
    version: updateOsDialog.release,
    channel: updateOsDialog.channel,
    update_kernel: updateOsDialog.update_kernel,
    update_plugins: updateOsDialog.update_plugins,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/updateos', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    updateOsDialog.value = false;
    showSnackbarSuccess(t('update initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateKernel = async (kernelVersion) => {
  const updateBody = {
    version: kernelVersion,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/updatekernel', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('kernel update could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    updateKernelDialog.value = false;
    showSnackbarSuccess(t('kernel update initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const rollbackKernel = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/rollbackkernel', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('kernel rollback could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('kernel rollback initiated successfully'));
    rollbackKernelDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const rebootOS = async () => {
  try {
    overlay.value = true;

    const res = await fetch('/api/v1/system/power/reboot', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('reboot could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('reboot initiated successfully'));
    rebootDialog.value = false;
    window.location.href = '/reboot.html';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const shutdownOS = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/system/power/shutdown', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('shutdown could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('shutdown initiated successfully'));
    shutdownDialog.value = false;
    window.location.href = '/shutdown.html';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateAPI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_api', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update api could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update api initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateUI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_ui', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update ui could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update ui initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const downloadDiagnostics = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/diag', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('download diagnostics could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const contentDisposition = res.headers.get('content-disposition');
    let filename = `mos_diagnostics_${new Date().toISOString()}.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const validateSupportCode = async () => {
  const payload = {
    supporter_key: supportCode.value,
  };
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/system', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('invalid support code')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('support banner successfully activated'));
    supportDialog.value = false;
    emit('refresh-drawer');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openUpdateOsDialog = () => {
  updateOsDialog.value = true;
  clearUpdateOsDialog();
};
const clearUpdateOsDialog = () => {
  updateOsDialog.release = null;
  updateOsDialog.channel = null;
  updateOsDialog.update_kernel = true;
  updateOsDialog.update_plugins = true;
};
const openUpdateKernelDialog = () => {
  updateKernelDialog.value = true;
};
</script>

<style scoped>
.card {
  background: rgb(var(--v-theme-background));
  border-radius: 12px;
  padding: 8px 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 15%, transparent);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 6px;
}

@supports not (color: color-mix(in srgb, #000 50%, #fff)) {
  .card {
    border-color: rgba(0, 0, 0, 0.15);
  }
  :global(.v-theme--dark) .card {
    border-color: rgba(255, 255, 255, 0.28);
  }
}
</style>
