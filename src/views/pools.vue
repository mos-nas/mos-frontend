<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('pools') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="poolsLoading" :loading="true" type="card" />
        <draggable v-model="pools" item-key="id" handle=".drag-handle" @end="onDragEndPool">
          <template #item="{ element: pool, index }">
            <v-card class="mb-3 pa-0" variant="outlined" rounded="lg">
              <div class="d-flex align-center px-3 py-2">
                <span class="drag-handle mr-2" style="cursor: grab; line-height: 1" aria-label="drag handle" aria-hidden>
                  <v-icon size="18">mdi-drag</v-icon>
                </span>
                <span class="font-weight-medium text-truncate text-h6">{{ pool.name }}</span>
                <v-icon v-if="pool.config.encrypted" size="16" class="ml-1" color="grey" aria-label="locked">mdi-lock</v-icon>
                <span v-if="pool.mountPoint" class="text-caption text-medium-emphasis ml-2 d-none d-sm-inline text-truncate" style="max-width: 200px">{{ pool.mountPoint }}</span>
                <v-spacer />
                <v-chip v-if="pool.type" size="x-small" class="mr-1" variant="tonal">{{ pool.type }}</v-chip>
                <v-chip v-if="pool.status.mounted" size="x-small" color="green" variant="tonal">{{ $t('mounted') }}</v-chip>
                <v-chip v-else size="x-small" color="grey" variant="tonal">{{ $t('unmounted') }}</v-chip>
                <v-switch v-model="pool.automount" hide-details density="compact" color="green" inset class="ml-3 flex-grow-0" style="transform: scale(0.8)" @change="switchAutomount(pool)" />
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn variant="text" icon size="small" v-bind="props" color="onPrimary">
                      <v-icon size="20">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item v-if="!pool.status.mounted" @click="pool.config && pool.config.encrypted ? openPassphraseDialog(pool) : mountPool(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-connection</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('mount pool') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.status.mounted" @click="unmountPool(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-power-plug-off</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('unmount pool') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeletePoolDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('delete pool') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openSpinDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-sleep</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('wake up / sleep') }}</v-list-item-title>
                    </v-list-item>

                    <!-- Mergerfs Pool Options -->
                    <template v-if="pool.type === 'mergerfs'">
                      <v-divider></v-divider>
                      <v-list-item @click="openManageMergerfsDevicesDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-harddisk</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('manage devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openManageMergerfsParityDevicesDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-harddisk</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('manage parity devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item v-if="pool.parity_devices.length > 0" @click="openSnapraidOperationDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-database-check</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('snapraid operation') }}</v-list-item-title>
                      </v-list-item>
                    </template>

                    <!-- NonRaid Pool Options -->
                    <template v-else-if="pool.type === 'nonraid'">
                      <v-divider></v-divider>
                      <v-list-item @click="openManageNonRaidDevicesDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-harddisk</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('manage devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openManageNonRaidParityDevicesDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-harddisk</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('manage parity devices') }}</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item v-if="pool.parity_devices.length > 0" @click="openNonRaidOperationDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-database-check</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('nonraid operation') }}</v-list-item-title>
                      </v-list-item>
                    </template>

                    <!-- BTRFS Pool Options -->
                    <template v-else-if="pool.type === 'btrfs'">
                      <v-divider></v-divider>
                      <v-list-item @click="openMultiOperationDialog(pool)">
                        <template #prepend>
                          <v-icon size="18">mdi-database-check</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('btrfs operation') }}</v-list-item-title>
                      </v-list-item>
                    </template>

                    <!-- Pool Settings -->
                    <v-list-item @click="openPoolSettingsDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-cog</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('pool settings') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div v-if="pool.status" class="px-3 pb-2">
                <div class="mb-1">
                  <v-progress-linear
                    :model-value="pool.status.usagePercent"
                    height="8"
                    :color="getUsageColor(pool.status.usagePercent)"
                    rounded
                    bg-opacity="0.25"
                    class="flex-grow-1"
                    style="min-width: 80px"
                  />
                  <div class="mt-1 d-flex justify-space-between align-center" style="white-space: nowrap">
                    <span class="text-caption text-medium-emphasis">{{ pool.status.usagePercent }}%</span>
                    <span class="text-caption text-medium-emphasis">{{ pool.status.usedSpace_human }} / {{ pool.status.totalSpace_human }}</span>
                  </div>
                </div>
              </div>

              <div v-if="(pool.data_devices && pool.data_devices.length > 0) || (pool.parity_devices && pool.parity_devices.length > 0)">
                <v-divider />
                <v-table density="compact" class="pool-devices-table" style="background-color: transparent">
                  <thead>
                    <tr style="background-color: rgba(0, 0, 0, 0.04)">
                      <th class="text-caption" style="width: 42px"></th>
                      <th class="text-caption">
                        {{ $t('disks') }}
                        <v-tooltip v-if="pool.status?.scrub_operation" location="top">
                          <template #activator="{ props }">
                            <v-chip v-bind="props" color="green" size="x-small" class="ml-1" label variant="tonal">
                              {{ $t('scrub running') }}
                              <span v-if="pool.status?.scrub_progress?.percent != null" class="ml-1">({{ Math.round(pool.status.scrub_progress.percent) }}%)</span>
                            </v-chip>
                          </template>
                          {{ $t('status') }}: {{ pool.status.scrub_progress?.status }}
                          <br />
                          {{ $t('speed') }}: {{ pool.status.scrub_progress?.speed }}
                          <br />
                          {{ $t('processed') }}: {{ pool.status.scrub_progress?.processed }}
                          <br />
                          {{ $t('errors') }}: {{ pool.status.scrub_progress?.errors }}
                        </v-tooltip>
                        <v-tooltip v-if="pool.status?.balance_operation" location="top">
                          <template #activator="{ props }">
                            <v-chip v-bind="props" color="green" size="x-small" class="ml-1" label variant="tonal">
                              {{ $t('balance running') }}
                              <span v-if="pool.status?.balance_progress?.percent != null" class="ml-1">({{ Math.round(pool.status.balance_progress.percent) }}%)</span>
                            </v-chip>
                          </template>
                          {{ $t('status') }}: {{ pool.status.balance_progress?.status }}
                          <br />
                          {{ $t('speed') }}: {{ pool.status.balance_progress?.speed }}
                          <br />
                          {{ $t('processed') }}: {{ pool.status.balance_progress?.processed }}
                          <br />
                          {{ $t('errors') }}: {{ pool.status.balance_progress?.errors }}
                        </v-tooltip>
                      </th>
                      <th class="text-caption" style="width: 60%">{{ $t('usage') }}</th>
                      <th class="text-caption text-right pr-2" style="width: 60px">{{ $t('fs') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="data_device in pool.data_devices" :key="data_device.id">
                      <td class="pa-1 text-center">
                        <v-icon
                          size="16"
                          class="cursor-pointer"
                          :style="{
                            color: data_device.powerStatus === 'active' ? 'green' : data_device.powerStatus === 'standby' ? '#1976d2' : 'red',
                          }"
                          @dblclick="data_device.powerStatus === 'active' ? sleepDisk(data_device) : wakeDisk(data_device)"
                        >
                          {{ getDiskIcon(data_device.diskType.type) }}
                        </v-icon>
                      </td>
                      <td class="pa-1 text-body-2 text-truncate" style="max-width: 120px">
                        <div>{{ data_device.device }}</div>
                        <div class="text-caption text-medium-emphasis text-truncate">
                          <span>{{ data_device.mountPoint }}</span>
                        </div>
                      </td>
                      <td class="pa-1" style="vertical-align: bottom">
                        <div v-if="data_device.storage">
                          <v-progress-linear
                            :model-value="data_device.storage.usagePercent"
                            height="6"
                            :color="getUsageColor(data_device.storage.usagePercent)"
                            rounded
                            class="flex-grow-1"
                            style="min-width: 40px"
                          />
                          <div class="d-flex justify-space-between align-center" style="white-space: nowrap; font-size: 0.8rem !important">
                            <span class="text-caption text-medium-emphasis" style="white-space: nowrap; font-size: 0.8rem !important">{{ Math.round(data_device.storage.usagePercent) }}%</span>
                            <span v-if="data_device.storage.usagePercent != null" class="ml-1">{{ data_device.storage.usedSpace_human }} / {{ data_device.storage.totalSpace_human }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="pa-1 text-right pr-2">
                        <v-chip size="x-small" variant="tonal" label>{{ data_device.filesystem }}</v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <template v-if="pool.parity_devices && pool.parity_devices.length > 0">
                  <v-divider />
                  <v-table density="compact" class="pool-devices-table" style="background-color: transparent">
                    <thead>
                      <tr style="background-color: rgba(0, 0, 0, 0.04)">
                        <th class="text-caption" style="width: 42px"></th>
                        <th class="text-caption">
                          {{ $t('parities') }}
                          <v-tooltip v-if="pool.status?.parity_operation" location="top">
                            <template #activator="{ props }">
                              <v-chip v-bind="props" color="green" size="x-small" class="ml-1" label variant="tonal">
                                {{ $t('operation running') }}
                                <span v-if="pool.status?.parity_progress?.percent != null" class="ml-1">({{ Math.round(pool.status.parity_progress.percent) }}%)</span>
                              </v-chip>
                            </template>
                            {{ $t('status') }}: {{ pool.status.parity_progress.status }}
                            <br />
                            {{ $t('speed') }}: {{ pool.status.parity_progress.speed }}
                            <br />
                            {{ $t('height') }}: {{ pool.status.parity_progress.height }}
                            <br />
                            {{ $t('stripes') }}: {{ pool.status.parity_progress.stripes }}
                            <br />
                            {{ $t('eta') }}: {{ pool.status.parity_progress.eta }}
                          </v-tooltip>
                        </th>
                        <th class="text-caption" style="width: 60%">{{ $t('usage') }}</th>
                        <th class="text-caption text-right pr-2" style="width: 60px">{{ $t('fs') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="parity_device in pool.parity_devices" :key="parity_device.id">
                        <td class="pa-1 text-center">
                          <v-icon
                            size="16"
                            class="cursor-pointer"
                            :style="{
                              color: parity_device.powerStatus === 'active' ? 'green' : parity_device.powerStatus === 'standby' ? '#1976d2' : 'red',
                            }"
                            @dblclick="parity_device.powerStatus === 'active' ? sleepDisk(parity_device) : wakeDisk(parity_device)"
                          >
                            {{ getDiskIcon(parity_device.diskType.type) }}
                          </v-icon>
                        </td>
                        <td class="pa-1 text-body-2 text-truncate" style="max-width: 120px">
                          <div>{{ parity_device.device }}</div>
                          <div class="text-caption text-medium-emphasis text-truncate">{{ parity_device.mountPoint }}</div>
                        </td>
                        <td class="pa-1" style="vertical-align: bottom">
                          <div v-if="parity_device.storage">
                            <v-progress-linear :model-value="parity_device.storage.usagePercent" height="6" color="grey darken-1" rounded class="flex-grow-1" style="min-width: 40px" />
                            <div class="d-flex justify-space-between align-center" style="white-space: nowrap; font-size: 0.8rem !important">
                              <span class="text-caption text-medium-emphasis" style="white-space: nowrap; font-size: 0.8rem !important">{{ Math.round(parity_device.storage.usagePercent) }}%</span>
                              <span v-if="parity_device.storage.usagePercent != null">{{ parity_device.storage.usedSpace_human }} / {{ parity_device.storage.totalSpace_human }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="pa-1 text-right pr-2">
                          <v-chip size="x-small" variant="tonal" label>{{ parity_device.filesystem }}</v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </template>
              </div>
            </v-card>
          </template>
        </draggable>
        <v-card v-if="pools.length === 0 && !poolsLoading" fluid class="mb-4 ml-0 mr-0 pa-0">
          <v-card-text class="pa-4">
            {{ $t('no pools have been created yet') }}
          </v-card-text>
        </v-card>

        <!-- Virtual Pools Section -->
        <div v-if="vpools.length > 0 && !vpoolsLoading" class="text-title-medium font-weight-medium" style="margin-top: 20px">{{ $t('virtual pools') }}</div>
        <v-card v-if="vpools.length > 0" fluid variant="outlined" rounded="lg" class="pa-0">
          <v-skeleton-loader v-if="vpoolsLoading" :loading="true" type="card" />
          <template v-if="vpools.length === 0 && !vpoolsLoading">
            <v-card-text class="pa-4 text-body-2">
              {{ $t('no virtual pools found') }}
            </v-card-text>
          </template>
          <template v-if="vpools.length > 0">
            <draggable v-model="vpools" item-key="id" handle=".vpool-drag-handle" @end="onDragEndVPool">
              <template #item="{ element: vpool }">
                <div>
                  <v-divider />
                  <div class="d-flex align-center px-3 py-2">
                    <span class="vpool-drag-handle mr-2" style="cursor: grab; line-height: 1" aria-label="drag handle" aria-hidden>
                      <v-icon size="18">mdi-drag</v-icon>
                    </span>
                    <span class="font-weight-medium text-truncate text-h6">{{ vpool.name }}</span>
                    <span v-if="vpool.mountPoint" class="text-caption text-medium-emphasis ml-2 d-none d-sm-inline text-truncate" style="max-width: 200px">{{ vpool.mountPoint }}</span>
                    <v-spacer />
                    <v-chip v-if="vpool.status?.mounted" size="x-small" color="green" variant="tonal">{{ $t('mounted') }}</v-chip>
                    <v-chip v-else size="x-small" color="grey" variant="tonal">{{ $t('unmounted') }}</v-chip>
                    <v-switch
                      v-model="vpool.automount"
                      hide-details
                      density="compact"
                      color="green"
                      inset
                      class="ml-3 flex-grow-0"
                      style="transform: scale(0.8)"
                      @change="switchVPoolAutomount(vpool)"
                    />
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn variant="text" icon size="small" v-bind="props" color="onPrimary">
                          <v-icon size="20">mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="vpool.status?.mounted ? unmountVPool(vpool) : mountVPool(vpool)">
                          <template #prepend>
                            <v-icon size="18">{{ vpool.status?.mounted ? 'mdi-power-plug-off' : 'mdi-connection' }}</v-icon>
                          </template>
                          <v-list-item-title>{{ vpool.status?.mounted ? $t('unmount') : $t('mount') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteVPool(vpool)">
                          <template #prepend>
                            <v-icon size="18">mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div v-if="vpool.status" class="px-3 pb-2">
                    <div class="mb-1">
                      <v-progress-linear
                        :model-value="vpool.status.usagePercent"
                        height="8"
                        :color="getUsageColor(vpool.status.usagePercent)"
                        rounded
                        bg-opacity="0.25"
                        class="flex-grow-1"
                        style="min-width: 80px"
                      />
                      <div class="mt-1 d-flex justify-space-between align-center" style="white-space: nowrap">
                        <span class="text-caption text-medium-emphasis">{{ vpool.status.usagePercent }}%</span>
                        <span class="text-caption text-medium-emphasis">{{ vpool.status.usedSpace_human }} / {{ vpool.status.totalSpace_human }}</span>
                      </div>
                    </div>
                    <div class="d-flex flex-wrap" style="gap: 4px">
                      <v-chip v-for="(path, idx) in vpool.paths" :key="`path-${idx}`" size="x-small" variant="tonal">
                        {{ path }}
                      </v-chip>
                      <v-chip v-if="vpool.comment" size="x-small" variant="tonal">{{ vpool.comment }}</v-chip>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </template>
        </v-card>

        <!-- Unassigned Disks Section -->
        <div class="text-title-medium font-weight-medium" style="margin-top: 20px">{{ $t('unassigned disks') }}</div>
        <v-card fluid style="margin-bottom: 80px" variant="outlined" rounded="lg" class="pa-0">
          <v-skeleton-loader v-if="unassignedDisksLoading" :loading="true" type="table-row@3" />
          <template v-if="unassignedDisks.length === 0 && !unassignedDisksLoading">
            <v-card-text class="pa-4 text-body-2">
              {{ $t('no unassigned disks found') }}
            </v-card-text>
          </template>
          <template v-if="unassignedDisks.length > 0">
            <v-divider />
            <v-table density="compact" class="pool-devices-table" style="background-color: transparent">
              <thead>
                <tr style="background-color: rgba(0, 0, 0, 0.04)">
                  <th class="text-caption" style="width: 42px"></th>
                  <th class="text-caption">{{ $t('device') }}</th>
                  <th class="text-caption d-none d-md-table-cell">{{ $t('model') }}</th>
                  <th class="text-caption">{{ $t('size') }}</th>
                  <th class="text-caption d-none d-sm-table-cell">{{ $t('partitions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="unassignedDisk in unassignedDisks" :key="unassignedDisk.name">
                  <td class="pa-1 text-center">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="16"
                          class="cursor-pointer"
                          :style="{
                            color: unassignedDisk.powerStatus === 'active' ? 'green' : unassignedDisk.powerStatus === 'standby' ? '#1976d2' : 'red',
                          }"
                          @dblclick="unassignedDisk.powerStatus === 'active' ? sleepDisk(unassignedDisk) : wakeDisk(unassignedDisk)"
                        >
                          {{ getDiskIcon(unassignedDisk.type) }}
                        </v-icon>
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="openCreatePoolDialog(unassignedDisk)">
                          <template #prepend>
                            <v-icon size="18">mdi-plus-circle</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('create pool') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openFormatDialog(unassignedDisk)">
                          <template #prepend>
                            <v-icon size="18">mdi-broom</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('format') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="pa-1 text-body-2 text-truncate" style="max-width: 120px">
                    <div>{{ unassignedDisk.device }}</div>
                    <div v-if="unassignedDisk.serial" class="text-caption text-medium-emphasis text-truncate">{{ unassignedDisk.serial }}</div>
                  </td>
                  <td class="pa-1 text-body-2 text-truncate d-none d-md-table-cell" style="max-width: 180px">
                    <span>{{ unassignedDisk.model || '—' }}</span>
                  </td>
                  <td class="pa-1 text-body-2" style="white-space: nowrap">
                    {{ unassignedDisk.sizeHuman || unassignedDisk.size_human }}
                  </td>
                  <td class="pa-1 d-none d-sm-table-cell">
                    <template v-if="unassignedDisk.partitions && unassignedDisk.partitions.length > 0">
                      <v-chip v-for="partition in unassignedDisk.partitions" :key="partition.device" size="x-small" variant="tonal" label class="mr-1">
                        {{ partition.device.replace('/dev/', '') }}
                        <span v-if="partition.filesystem" class="ml-1 text-medium-emphasis">{{ partition.filesystem }}</span>
                      </v-chip>
                    </template>
                    <span v-else class="text-caption text-medium-emphasis">—</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </template>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Format Dialog -->
  <v-dialog v-model="formatDialog.value" max-width="400" persistent>
    <v-card class="pa-0" :title="t('confirm format')" prepend-icon="mdi-broom" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        {{ $t('are you sure you want to format this disk?') }}
        <v-select
          v-model="formatDialog.filesystem"
          :items="formatDialog.filesystems"
          :label="$t('filesystem')"
          density="comfortable"
          :rules="[(v) => !!v || $t('filesystem is required')]"
          class="pt-4"
        />
        <v-switch v-model="formatDialog.partition" :label="$t('create partition')" inset hide-details density="compact" color="green" />
        <v-switch v-model="formatDialog.wipeExisting" :label="$t('wipe existing data')" inset hide-details density="compact" color="red" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" text @click="formatDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" :disabled="!formatDialog.filesystem" @click="formatDisk()">
          {{ $t('format') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Pool Dialog -->
  <v-dialog v-model="deletePoolDialog.value" max-width="400" persistent>
    <v-card class="pa-0" :title="t('confirm delete')" prepend-icon="mdi-delete" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        {{ $t('are you sure you want to delete this pool?') }}
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="deletePoolDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deletePool(deletePoolDialog.pool.id)">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Pool Dialog -->
  <v-dialog v-model="createPoolDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('create pool')" prepend-icon="mdi-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-text-field v-model="createPoolDialog.name" :label="$t('name')" class="pt-2" density="comfortable" />
        <v-select v-model="createPoolDialog.type" :items="poolTypes" :label="$t('type')" density="comfortable" @update:model-value="switchPoolType" />
        <v-select
          v-model="createPoolDialog.devices"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks
                  .filter((disk) => createPoolDialog.type !== 'mergerfs' || !createPoolDialog.snapraidDevice.includes(disk.device))
                  .map((disk) => ({
                    title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`,
                    value: disk.device,
                  }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('devices')"
          :multiple="createPoolDialog.type !== 'single'"
          density="comfortable"
        />
        <v-select
          v-if="createPoolDialog.type === 'mergerfs'"
          v-model="createPoolDialog.snapraidDevice"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks
                  .filter((disk) => !createPoolDialog.devices.includes(disk.device))
                  .map((disk) => ({
                    title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`,
                    value: disk.device,
                  }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('snapraid device')"
          density="comfortable"
          :multiple="true"
        />
        <v-select
          v-if="createPoolDialog.type === 'nonraid'"
          v-model="createPoolDialog.parity"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({
                  title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`,
                  value: disk.device,
                }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('parity')"
          :multiple="true"
          density="comfortable"
        />
        <v-select v-if="createPoolDialog.type === 'multi'" v-model="createPoolDialog.raidLevel" :items="raidLevels" :label="$t('raid level')" density="comfortable" />
        <v-select v-if="createPoolDialog.type !== 'bcachefs'" v-model="createPoolDialog.filesystem" :items="createPoolDialog.filesystems" :label="$t('filesystem')" density="comfortable" />
        <v-text-field v-if="createPoolDialog.type === 'mergerfs' || createPoolDialog.type === 'nonraid'" v-model="createPoolDialog.minfreespace" :label="$t('minfreespace')" />
        <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.comment" :label="$t('comment')" />
        <div v-if="createPoolDialog.type === 'bcachefs'">
          <v-select
            v-model="createPoolDialog.cache_devices"
            :items="
              Array.isArray(unassignedDisks)
                ? unassignedDisks
                    .filter((disk) => !createPoolDialog.devices.includes(disk.device))
                    .map((disk) => ({
                      title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`,
                      value: disk.device,
                    }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('cache devices')"
            :multiple="true"
            density="comfortable"
          />
          <v-text-field v-model.number="createPoolDialog.data_replicas" :label="$t('data replicas')" type="number" min="1" max="3" density="comfortable" />
          <v-text-field v-model.number="createPoolDialog.metadata_replicas" :label="$t('metadata replicas')" type="number" min="1" max="3" density="comfortable" />
          <v-select v-model="createPoolDialog.compression" :items="['none', 'lz4', 'gzip', 'zstd', 'snappy']" :label="$t('compression')" density="comfortable" />
          <v-select v-model="createPoolDialog.background_compression" :items="['none', 'lz4', 'gzip', 'zstd', 'snappy']" :label="$t('background compression')" density="comfortable" />
          <v-select v-model="createPoolDialog.cache_mode" :items="['writeback', 'writethrough', 'none']" :label="$t('cache mode')" density="comfortable" />
          <v-switch v-model="createPoolDialog.erasure_code" :label="$t('erasure code')" hide-details density="compact" color="green" inset />
        </div>

        <div v-if="createPoolDialog.type === 'mergerfs'">
          <v-divider></v-divider>
          <v-btn variant="text" @click="createPoolDialog.showAdvanced = !createPoolDialog.showAdvanced" class="mb-4">
            {{ createPoolDialog.showAdvanced ? $t('hide advanced options') : $t('show advanced options') }}
          </v-btn>
          <v-slide-y-transition>
            <div v-if="createPoolDialog.showAdvanced">
              <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.mergerfsOptions" :label="$t('mergerfs options')" />
              <div @click="createPoolDialog.skip_size_check_clicks < 5 ? createPoolDialog.skip_size_check_clicks++ : null">
                <v-switch
                  v-if="createPoolDialog.type === 'mergerfs'"
                  v-model="createPoolDialog.skip_size_check"
                  :label="$t('skip size check')"
                  hide-details
                  density="compact"
                  color="red"
                  inset
                  :disabled="createPoolDialog.skip_size_check_clicks < 5"
                />
              </div>
            </div>
          </v-slide-y-transition>
        </div>
        <v-switch v-if="createPoolDialog.type === 'mergerfs' || createPoolDialog.type === 'nonraid'" v-model="createPoolDialog.moveonenospc" :label="$t('moveonenospc')" hide-details density="compact" color="green" inset />
        <v-switch v-model="createPoolDialog.automount" :label="$t('automount')" hide-details density="compact" color="green" inset />
        <v-switch v-model="createPoolDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
        <v-switch v-model="createPoolDialog.shared" :label="$t('shared')" hide-details density="compact" color="green" inset />
        <v-switch v-model="createPoolDialog.encrypted" :label="$t('encrypt')" density="compact" color="red" inset />
        <v-text-field v-if="createPoolDialog.encrypted" v-model="createPoolDialog.passphrase" :label="$t('passphrase')" type="password" :rules="[(v) => !!v || $t('passphrase is required')]" />
        <v-switch v-if="createPoolDialog.encrypted" v-model="createPoolDialog.create_keyfile" :label="$t('create keyfile')" hide-details density="compact" color="red" inset />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="createPoolDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="createPool()" color="onPrimary">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Passphrase Dialog -->
  <v-dialog v-model="passphraseDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('enter passphrase')" prepend-icon="mdi-key" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-form>
          <v-text-field v-model="passphraseDialog.passphrase" :label="$t('passphrase')" type="password" :rules="[(v) => !!v || $t('passphrase is required')]" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="passphraseDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="mountPoolWithPassphrase(passphraseDialog.pool, passphraseDialog.passphrase)" color="onPrimary">
          {{ $t('mount') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add Mergerfs Device Dialog -->
  <v-dialog v-model="addMergerfsDevicesDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('add devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add to pool') }}</p>
        <v-form>
          <v-select
            v-model="addMergerfsDevicesDialog.devices"
            :items="
              Array.isArray(unassignedDisks)
                ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('devices')"
            :multiple="true"
            density="comfortable"
          />
          <v-text-field v-model="addMergerfsDevicesDialog.passphrase" :label="$t('passphrase (if encrypted)')" type="password" />
          <v-switch v-model="addMergerfsDevicesDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="addMergerfsDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="addMergerfsDevices(addMergerfsDevicesDialog.pool.id, addMergerfsDevicesDialog.devices, addMergerfsDevicesDialog.format, addMergerfsDevicesDialog.passphrase)" color="onPrimary">
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Remove MergerfsDevice Dialog -->
  <v-dialog v-model="removeMergerfsDevicesDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('remove devices')" prepend-icon="mdi-harddisk-remove" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to remove from pool') }}</p>
        <v-form>
          <v-select
            v-model="removeMergerfsDevicesDialog.devices"
            :items="
              removeMergerfsDevicesDialog.pool
                ? removeMergerfsDevicesDialog.pool.data_devices.map((device) => ({
                    title: `${device.device} (${device.storage?.totalSpace_human || '—'}) (${device.diskInfo?.diskSerial || '—'})`,
                    value: device.device,
                  }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('devices')"
            :multiple="true"
            density="comfortable"
          />
          <v-switch v-model="removeMergerfsDevicesDialog.unmount" :label="$t('unmount')" hide-details density="compact" color="red" inset />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="removeMergerfsDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="removeMergerfsDevice(removeMergerfsDevicesDialog.pool.id, removeMergerfsDevicesDialog.devices, removeMergerfsDevicesDialog.unmount)" color="red">
          {{ $t('remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Replace Mergerfs Device Dialog -->
  <v-dialog v-model="replaceMergerfsDeviceDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('replace device')" prepend-icon="mdi-file-replace" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-select
          v-model="replaceMergerfsDeviceDialog.oldDevice"
          :items="
            replaceMergerfsDeviceDialog.pool
              ? replaceMergerfsDeviceDialog.pool.data_devices.map((device) => ({
                  title: `${device.device} (${device.storage?.totalSpace_human || '—'}) (${device.diskInfo?.diskSerial || '—'})`,
                  value: device.device,
                }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('old device')"
          density="comfortable"
        />
        <v-select
          v-model="replaceMergerfsDeviceDialog.newDevice"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('new device')"
          density="comfortable"
        />
        <v-switch v-model="replaceMergerfsDeviceDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="replaceMergerfsDeviceDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="replaceMergerfsDevice(replaceMergerfsDeviceDialog.pool.id, replaceMergerfsDeviceDialog.oldDevice, replaceMergerfsDeviceDialog.newDevice, replaceMergerfsDeviceDialog.format)"
          color="red"
        >
          {{ $t('replace') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Sleep / Wake Dialog -->
  <v-dialog v-model="spinDialog.value" max-width="400" persistent>
    <v-card class="pa-0" :title="t('wake up / sleep')" prepend-icon="mdi-sleep" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <div class="d-flex flex-column gap-3">
          <v-btn @click="performSpinAction('up')" color="green" variant="tonal" prepend-icon="mdi-motion-play" size="large" class="w-100 mb-4 mt-4">
            {{ $t('spin up pool') }}
          </v-btn>
          <v-btn @click="performSpinAction('down')" color="blue" variant="tonal" prepend-icon="mdi-motion-pause" size="large" class="w-100">
            {{ $t('spin down pool') }}
          </v-btn>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer></v-spacer>
        <v-btn @click="spinDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Manage Mergerfs Devices Dialog -->
  <v-dialog v-model="manageMergerfsDevicesDialog.value" max-width="700" persistent>
    <v-card class="pa-0" :title="t('manage mergerfs devices')" prepend-icon="mdi-harddisk" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; max-height: 60vh">
        <div v-if="manageMergerfsDevicesDialog.pool && manageMergerfsDevicesDialog.pool.data_devices.length > 0">
          <v-list density="compact">
            <v-list-item v-for="device in manageMergerfsDevicesDialog.pool.data_devices" :key="device.id" class="mb-2 border rounded pa-2">
              <template #prepend>
                <v-icon class="mr-3" :style="{ color: device.powerStatus === 'active' ? 'green' : device.powerStatus === 'standby' ? '#1976d2' : 'red' }">mdi-harddisk</v-icon>
              </template>
              <div class="w-100">
                <v-list-item-title class="font-weight-medium">{{ device.device }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ device.mountPoint || '—' }} • {{ device.storage?.totalSpace_human || '—' }} • {{ device.diskInfo?.diskSerial || '—' }}
                </v-list-item-subtitle>
              </div>
              <template #append>
                <div class="d-flex gap-1">
                  <v-btn size="x-small" variant="text" icon @click="openReplaceMergerfsDeviceDialog(manageMergerfsDevicesDialog.pool, device.device)" color="orange" title="Replace">
                    <v-icon size="18">mdi-file-replace</v-icon>
                  </v-btn>
                  <v-btn size="x-small" variant="text" icon @click="openRemoveMergerfsDevicesDialog(manageMergerfsDevicesDialog.pool, [device.device])" color="red" title="Remove">
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
        <v-btn color="primary" variant="tonal" @click="openAddMergerfsDevicesDialog(manageMergerfsDevicesDialog.pool)" class="w-100">
          <v-icon size="18" class="mr-2">mdi-plus</v-icon>
          {{ $t('add devices') }}
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer></v-spacer>
        <v-btn @click="manageMergerfsDevicesDialog.value = false" color="onPrimary">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Manage Parity Devices Dialog -->
  <v-dialog v-model="manageMergerfsParityDevicesDialog.value" max-width="700" persistent>
    <v-card class="pa-0" :title="t('manage mergerfs parity devices')" prepend-icon="mdi-harddisk" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; max-height: 60vh">
        <div v-if="manageMergerfsParityDevicesDialog.pool">
          <div v-if="manageMergerfsParityDevicesDialog.pool.parity_devices && manageMergerfsParityDevicesDialog.pool.parity_devices.length > 0">
            <v-list density="compact">
              <v-list-item v-for="device in manageMergerfsParityDevicesDialog.pool.parity_devices" :key="device.id || device.device" class="mb-2 border rounded pa-2">
                <template #prepend>
                  <v-icon class="mr-3" :style="{ color: device.powerStatus === 'active' ? 'green' : device.powerStatus === 'standby' ? '#1976d2' : 'red' }">mdi-harddisk</v-icon>
                </template>
                <div class="w-100">
                  <v-list-item-title class="font-weight-medium">{{ device.device }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ device.mountPoint || '—' }} • {{ device.storage?.totalSpace_human || '—' }} • {{ device.diskInfo?.diskSerial || '—' }}</v-list-item-subtitle>
                </div>
                <template #append>
                  <div class="d-flex gap-1">
                    <v-btn size="x-small" variant="text" icon @click="startReplaceMergerfsParityDevice(device)" color="orange" title="Replace">
                      <v-icon size="18">mdi-file-replace</v-icon>
                    </v-btn>
                    <v-btn size="x-small" variant="text" icon @click="startRemoveMergerfsParityDevice(device)" color="red" title="Remove">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <v-divider class="my-3" />
          </div>
          <div v-else class="text-center py-4">
            <p class="text-caption text-medium-emphasis">{{ $t('no parity devices') }}</p>
          </div>
        </div>
        <v-btn color="primary" variant="tonal" @click="startAddMergerfsParityDevice()" class="w-100">
          <v-icon size="18" class="mr-2">mdi-plus</v-icon>
          {{ $t('add parity devices') }}
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer></v-spacer>
        <v-btn @click="manageMergerfsParityDevicesDialog.value = false" color="onPrimary">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Manage NonRaid Devices Dialog -->
  <v-dialog v-model="manageNonRaidDevicesDialog.value" max-width="700" persistent>
    <v-card class="pa-0" :title="t('manage nonraid devices')" prepend-icon="mdi-harddisk" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; max-height: 60vh">
        <div v-if="manageNonRaidDevicesDialog.pool && manageNonRaidDevicesDialog.pool.data_devices.length > 0">
          <v-list density="compact">
            <v-list-item v-for="device in manageNonRaidDevicesDialog.pool.data_devices" :key="device.id" class="mb-2 border rounded pa-2">
              <template #prepend>
                <v-icon class="mr-3" :style="{ color: device.powerStatus === 'active' ? 'green' : device.powerStatus === 'standby' ? '#1976d2' : 'red' }">mdi-harddisk</v-icon>
              </template>
              <div class="w-100">
                <v-list-item-title class="font-weight-medium">{{ device.device }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ device.mountPoint || '—' }} • {{ device.storage?.totalSpace_human || '—' }} • {{ device.diskInfo?.diskSerial || '—' }}</v-list-item-subtitle>
              </div>
            </v-list-item>
          </v-list>
        </div>
        <v-btn color="primary" variant="tonal" @click="openAddNonRaidDeviceDialog(manageNonRaidDevicesDialog.pool)" class="w-100">
          <v-icon size="18" class="mr-2">mdi-plus</v-icon>
          {{ $t('add devices') }}
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer></v-spacer>
        <v-btn @click="manageNonRaidDevicesDialog.value = false" color="onPrimary">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Manage NonRaid Parity Devices Dialog -->
  <v-dialog v-model="manageNonRaidParityDevicesDialog.value" max-width="700" persistent>
    <v-card class="pa-0" :title="t('manage nonraid parity devices')" prepend-icon="mdi-harddisk" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; max-height: 60vh">
        <div v-if="manageNonRaidParityDevicesDialog.pool">
          <div v-if="manageNonRaidParityDevicesDialog.pool.parity_devices && manageNonRaidParityDevicesDialog.pool.parity_devices.length > 0">
            <v-list density="compact">
              <v-list-item v-for="device in manageNonRaidParityDevicesDialog.pool.parity_devices" :key="device.id || device.device" class="mb-2 border rounded pa-2">
                <template #prepend>
                  <v-icon class="mr-3" :style="{ color: device.powerStatus === 'active' ? 'green' : device.powerStatus === 'standby' ? '#1976d2' : 'red' }">mdi-harddisk</v-icon>
                </template>
                <div class="w-100">
                  <v-list-item-title class="font-weight-medium">{{ device.device }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ device.mountPoint || '—' }} • {{ device.storage?.totalSpace_human || '—' }} • {{ device.diskInfo?.diskSerial || '—' }}</v-list-item-subtitle>
                </div>
              </v-list-item>
            </v-list>
            <v-divider class="my-3" />
          </div>
          <div v-else class="text-center py-4">
            <p class="text-caption text-medium-emphasis">{{ $t('no parity devices') }}</p>
          </div>
        </div>
        <v-btn color="primary" variant="tonal" @click="openAddNonRaidParityDialog(manageNonRaidParityDevicesDialog.pool)" class="w-100">
          <v-icon size="18" class="mr-2">mdi-plus</v-icon>
          {{ $t('add parity devices') }}
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer></v-spacer>
        <v-btn @click="manageNonRaidParityDevicesDialog.value = false" color="onPrimary">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add Parity Devices Dialog -->
  <v-dialog v-model="addMergerfsParityDevicesDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('add parity devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add as parity') }}</p>
        <v-select
          v-model="addMergerfsParityDevicesDialog.devices"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('devices')"
          :multiple="true"
          density="comfortable"
        />
        <v-switch v-model="addMergerfsParityDevicesDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
        <div @click="addMergerfsParityDevicesDialog.skip_size_check_clicks < 5 ? addMergerfsParityDevicesDialog.skip_size_check_clicks++ : null">
          <v-switch
            v-model="addMergerfsParityDevicesDialog.skip_size_check"
            :label="$t('skip size check')"
            hide-details
            density="compact"
            color="red"
            inset
            :disabled="addMergerfsParityDevicesDialog.skip_size_check_clicks < 5"
          />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="addMergerfsParityDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="addMergerfsParityDevice(addMergerfsParityDevicesDialog.pool.id, addMergerfsParityDevicesDialog.devices, addMergerfsParityDevicesDialog.format, addMergerfsParityDevicesDialog.skip_size_check)"
          color="onPrimary"
        >
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Remove Parity Devices Dialog -->
  <v-dialog v-model="removeMergerfsParityDevicesDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('remove parity devices')" prepend-icon="mdi-harddisk-remove" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select parity devices to remove') }}</p>
        <v-form>
          <v-select
            v-model="removeMergerfsParityDevicesDialog.devices"
            :items="
              removeMergerfsParityDevicesDialog.pool
                ? removeMergerfsParityDevicesDialog.pool.parity_devices.map((device) => ({
                    title: `${device.device} (${device.storage?.totalSpace_human || '—'}) (${device.diskInfo?.diskSerial || '—'})`,
                    value: device.device,
                  }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('devices')"
            :multiple="true"
            density="comfortable"
          />
          <v-switch v-model="removeMergerfsParityDevicesDialog.unmount" :label="$t('unmount')" hide-details density="compact" color="red" inset />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="removeMergerfsParityDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="removeMergerfsParityDevice(removeMergerfsParityDevicesDialog.pool.id, removeMergerfsParityDevicesDialog.devices, removeMergerfsParityDevicesDialog.unmount)" color="onPrimary">
          {{ $t('remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Replace Parity Device Dialog -->
  <v-dialog v-model="replaceMergerfsParityDeviceDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('replace parity device')" prepend-icon="mdi-file-replace" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-form>
          <v-select
            v-model="replaceMergerfsParityDeviceDialog.oldDevice"
            :items="
              replaceMergerfsParityDeviceDialog.pool
                ? replaceMergerfsParityDeviceDialog.pool.parity_devices.map((device) => ({
                    title: `${device.device} (${device.storage?.totalSpace_human || '—'}) (${device.diskInfo?.diskSerial || '—'})`,
                    value: device.device,
                  }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('old device')"
            density="comfortable"
          />
          <v-select
            v-model="replaceMergerfsParityDeviceDialog.newDevice"
            :items="
              Array.isArray(unassignedDisks)
                ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('new device')"
            density="comfortable"
          />
          <v-switch v-model="replaceMergerfsParityDeviceDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
          <div @click="replaceMergerfsParityDeviceDialog.skip_size_check_clicks < 5 ? replaceMergerfsParityDeviceDialog.skip_size_check_clicks++ : null">
            <v-switch
              v-model="replaceMergerfsParityDeviceDialog.skip_size_check"
              :label="$t('skip size check')"
              hide-details
              density="compact"
              color="red"
              inset
              :disabled="replaceMergerfsParityDeviceDialog.skip_size_check_clicks < 5"
            />
          </div>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="replaceMergerfsParityDeviceDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="
            replaceMergerfsParityDevice(
              replaceMergerfsParityDeviceDialog.pool.id,
              replaceMergerfsParityDeviceDialog.oldDevice,
              replaceMergerfsParityDeviceDialog.newDevice,
              replaceMergerfsParityDeviceDialog.format,
              replaceMergerfsParityDeviceDialog.skip_size_check,
            )
          "
          color="red"
        >
          {{ $t('replace') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add Non-Raid Devices Dialog -->
  <v-dialog v-model="addNonRaidDeviceDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('add device')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select device to add to pool') }}</p>
        <v-select
          v-model="addNonRaidDeviceDialog.device"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('device')"
          density="comfortable"
        />
        <v-select v-model="addNonRaidDeviceDialog.filesystem" :items="addNonRaidDeviceDialog.filesystems" :label="$t('filesystem')" density="comfortable" />
        <v-text-field v-model="addNonRaidDeviceDialog.passphrase" :label="$t('passphrase (if encrypted)')" type="password" />
        <v-switch v-model="addNonRaidDeviceDialog.format" :label="$t('format')" density="compact" color="red" inset hide-details="auto" />
        <v-switch v-model="addNonRaidDeviceDialog.parity_valid" :label="$t('parity valid')" hide-details="auto" density="compact" color="green" inset />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="addNonRaidDeviceDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="
            addNonRaidDevice(addNonRaidDeviceDialog.device, addNonRaidDeviceDialog.filesystem, addNonRaidDeviceDialog.passphrase, addNonRaidDeviceDialog.parity_valid, addNonRaidDeviceDialog.format)
          "
          color="onPrimary"
        >
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add Non-Raid Parity Dialog -->
  <v-dialog v-model="addNonRaidParityDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('add parity devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add as parity') }}</p>
        <v-form>
          <v-select
            v-model="addNonRaidParityDialog.device"
            :items="
              Array.isArray(unassignedDisks)
                ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human || '—'}) (${disk.serial || '—'})`, value: disk.device }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('device')"
            density="comfortable"
          />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="addNonRaidParityDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="addNonRaidParity(addNonRaidParityDialog.pool.id, addNonRaidParityDialog.device)" color="onPrimary">
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- SnapRAID Operation Dialog -->
  <v-dialog v-model="snapraidOperationDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('snapraid operation')" prepend-icon="mdi-database-check" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select the snapraid operation to be performed') }}</p>
        <v-select
          v-model="snapraidOperationDialog.operation"
          :items="
            snapraidOperationDialog.pool && snapraidOperationDialog.pool.status && snapraidOperationDialog.pool.status.parity_operation
              ? ['sync', 'check', 'scrub', 'status', 'force_stop']
              : ['sync', 'check', 'scrub', 'status']
          "
          :label="$t('operation')"
          density="comfortable"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="snapraidOperationDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="performSnapraidOperation(snapraidOperationDialog.pool.id, snapraidOperationDialog.operation)" color="onPrimary">
          {{ $t('perform') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- NonRaid Operation Dialog -->
  <v-dialog v-model="nonRaidOperationDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('nonraid operation')" prepend-icon="mdi-database-check" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select the nonraid operation to be performed') }}</p>
        <v-select v-model="nonRaidOperationDialog.operation" :items="nonRaidOperationDialog.operations" :label="$t('operation')" density="comfortable" />
        <v-select v-if="nonRaidOperationDialog.operation === 'check'" v-model="nonRaidOperationDialog.option" :items="nonRaidOperationDialog.options" :label="$t('options')" density="comfortable" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="nonRaidOperationDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="performNonRaidOperation(nonRaidOperationDialog.pool.id, nonRaidOperationDialog.operation, nonRaidOperationDialog.option)" color="onPrimary">
          {{ $t('perform') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- BTRFS Operation Dialog -->
  <v-dialog v-model="multiOperationDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('btrfs operation')" prepend-icon="mdi-database-check" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select the btrfs operation to be performed') }}</p>
        <v-select v-model="multiOperationDialog.operation" :items="multiOperationDialog.operations" :label="$t('operation')" density="comfortable" />
        <v-select v-model="multiOperationDialog.option" :items="multiOperationDialog.options" :label="$t('options')" density="comfortable" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="multiOperationDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="
            multiOperationDialog.operation === 'scrub'
              ? performMultiOperationScrub(multiOperationDialog.pool.id, multiOperationDialog.option)
              : performMultiOperationBalance(multiOperationDialog.pool.id, multiOperationDialog.option)
          "
          color="onPrimary"
        >
          {{ $t('perform') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- BTRFS Settings Dialog -->
  <v-dialog v-model="btrfsSettingsDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('btrfs settings')" prepend-icon="mdi-cog" style="max-height: 80vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; flex: 1">
        <span class="text-title-medium font-weight-medium">{{ $t('btrfs schedules') }}</span>
        <v-row align="center" class="pt-4">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="btrfsSettingsDialog.scrub.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('scrub enabled') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="btrfsSettingsDialog.scrub.enabled">
            <v-text-field
              v-model="btrfsSettingsDialog.scrub.schedule"
              :label="$t('scrub schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(btrfsSettingsDialog.scrub.schedule, (schedule) => (btrfsSettingsDialog.scrub.schedule = schedule))"
            />
          </v-col>
        </v-row>
        <v-row v-if="btrfsSettingsDialog.pool.type === 'btrfs' && btrfsSettingsDialog.pool.data_devices.length > 1" align="center">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="btrfsSettingsDialog.balance.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('balance enabled') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="btrfsSettingsDialog.balance.enabled">
            <v-text-field
              v-model="btrfsSettingsDialog.balance.schedule"
              :label="$t('balance schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(btrfsSettingsDialog.balance.schedule, (schedule) => (btrfsSettingsDialog.balance.schedule = schedule))"
            />
          </v-col>
        </v-row>
        <v-divider class="mt-6 mb-4"></v-divider>
        <span class="text-title-medium font-weight-medium">{{ $t('usage alerts') }}</span>
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field v-model="btrfsSettingsDialog.usage_alert.warning" :label="$t('warning')" type="number" suffix="%" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="btrfsSettingsDialog.usage_alert.alert" :label="$t('alert')" type="number" suffix="%" hide-details="auto" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="btrfsSettingsDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="saveBtrfsSettings()" color="onPrimary">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Mergerfs Settings Dialog -->
  <v-dialog v-model="mergerfsSettingsDialog.value" max-width="700" persistent>
    <v-card class="pa-0" :title="t('mergerfs settings')" prepend-icon="mdi-cog" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; flex: 1">
        <span class="text-title-medium font-weight-medium">{{ $t('snapraid schedules') }}</span>
        <v-row align="center" class="pt-4">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="mergerfsSettingsDialog.snapraid_sync.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('sync') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="mergerfsSettingsDialog.snapraid_sync.enabled">
            <v-text-field
              v-model="mergerfsSettingsDialog.snapraid_sync.schedule"
              :label="$t('sync schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(mergerfsSettingsDialog.snapraid_sync.schedule, (schedule) => (mergerfsSettingsDialog.snapraid_sync.schedule = schedule))"
            />
          </v-col>
        </v-row>
        <v-row align="center" class="mt-2">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="mergerfsSettingsDialog.snapraid_sync.check.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('check') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="mergerfsSettingsDialog.snapraid_sync.check.enabled">
            <v-text-field
              v-model="mergerfsSettingsDialog.snapraid_sync.check.schedule"
              :label="$t('check schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(mergerfsSettingsDialog.snapraid_sync.check.schedule, (schedule) => (mergerfsSettingsDialog.snapraid_sync.check.schedule = schedule))"
            />
          </v-col>
        </v-row>
        <v-row align="center" class="mt-2">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="mergerfsSettingsDialog.snapraid_sync.scrub.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('scrub') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="mergerfsSettingsDialog.snapraid_sync.scrub.enabled">
            <v-text-field
              v-model="mergerfsSettingsDialog.snapraid_sync.scrub.schedule"
              :label="$t('scrub schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(mergerfsSettingsDialog.snapraid_sync.scrub.schedule, (schedule) => (mergerfsSettingsDialog.snapraid_sync.scrub.schedule = schedule))"
            />
          </v-col>
        </v-row>
        <v-divider class="mt-6 mb-4"></v-divider>
        <span class="text-title-medium font-weight-medium">{{ $t('mergerfs policies') }}</span>
        <v-select v-model="mergerfsSettingsDialog.mergerfs_policies.create" :items="mergerfsSettingsDialog.availablePolicies" :label="$t('create policy')" density="comfortable" class="mt-4" />
        <v-select v-model="mergerfsSettingsDialog.mergerfs_policies.search" :items="mergerfsSettingsDialog.availablePolicies" :label="$t('search policy')" density="comfortable" />
        <a href="https://trapexit.github.io/mergerfs/latest/config/functions_categories_policies/#policy-descriptions" target="_blank" class="text-primary text-decoration-underline">
          {{ $t('see mergerfs documentation for policy descriptions') }}
        </a>
        <v-divider class="mt-6 mb-4"></v-divider>
        <span class="text-title-medium font-weight-medium">{{ $t('usage alerts') }}</span>
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field v-model="mergerfsSettingsDialog.usage_alert.warning" :label="$t('warning')" type="number" suffix="%" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="mergerfsSettingsDialog.usage_alert.alert" :label="$t('alert')" type="number" suffix="%" hide-details="auto" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="mergerfsSettingsDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="saveMergerfsSettings()" color="onPrimary">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- NonRaid Settings Dialog -->
  <v-dialog v-model="nonraidSettingsDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('nonraid settings')" prepend-icon="mdi-cog" style="max-height: 70vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto; flex: 1">
        <span class="text-title-medium font-weight-medium">{{ $t('nonraid schedules') }}</span>
        <v-row align="center" class="pt-4">
          <v-col cols="4">
            <div class="d-flex align-center">
              <v-switch v-model="nonraidSettingsDialog.check.enabled" hide-details="auto" density="compact" color="green" inset class="mr-2" />
              <span class="text-body-2">{{ $t('check') }}</span>
            </div>
          </v-col>
          <v-col cols="8" v-if="nonraidSettingsDialog.check.enabled">
            <v-text-field
              v-model="nonraidSettingsDialog.check.schedule"
              :label="$t('check schedule (cron)')"
              hide-details="auto"
              density="compact"
              append-inner-icon="mdi-calendar-clock"
              @click:append-inner="openCronDialog(nonraidSettingsDialog.check.schedule, (schedule) => (nonraidSettingsDialog.check.schedule = schedule))"
            />
          </v-col>
        </v-row>

        <v-divider class="mt-6 mb-4"></v-divider>

        <span class="text-title-medium font-weight-medium">{{ $t('usage alerts') }}</span>
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field v-model="nonraidSettingsDialog.usage_alert.warning" :label="$t('warning')" type="number" suffix="%" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="nonraidSettingsDialog.usage_alert.alert" :label="$t('alert')" type="number" suffix="%" hide-details="auto" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="nonraidSettingsDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="saveNonraidSettings()" color="onPrimary">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Virtual Pool Dialog -->
  <v-dialog v-model="createVpoolDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="t('create virtual pool')" prepend-icon="mdi-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-text-field v-model="createVpoolDialog.name" :label="$t('name')" density="comfortable" class="pt-2" />
        <div class="mb-4">
          <div class="d-flex justify-space-between align-center">
            <label class="text-body-2 font-weight-medium">{{ $t('paths') }}</label>
            <v-btn variant="text" size="small" color="green" class="pa-0" style="min-width: auto" @click="openVpoolFsDialog()" title="Add" aria-label="add">
              <v-icon size="18" class="mr-1">mdi-plus</v-icon>
              {{ $t('add') }}
            </v-btn>
          </div>
          <div class="mt-2">
            <v-chip v-for="(path, index) in createVpoolDialog.paths" :key="index" closable @click:close="createVpoolDialog.paths.splice(index, 1)" class="mr-2 mb-2">
              {{ path }}
            </v-chip>
          </div>
        </div>
        <v-text-field v-model="createVpoolDialog.comment" :label="$t('comment')" density="comfortable" />
        <v-select v-model="createVpoolDialog.config.policies.create" :items="createVpoolDialog.availablePolicies" :label="$t('create policy')" density="comfortable" />
        <v-select v-model="createVpoolDialog.config.policies.search" :items="createVpoolDialog.availableSearchPolicies" :label="$t('search policy')" density="comfortable" />
        <v-switch v-model="createVpoolDialog.automount" :label="$t('automount')" hide-details density="compact" color="green" inset />
        <v-switch v-model="createVpoolDialog.config.shared" :label="$t('shared')" hide-details density="compact" color="green" inset />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="createVpoolDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="createVPool()" color="onPrimary">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CronScheduleDialog v-model="cronDialog.value" :schedule="cronDialog.schedule" @apply="applyCronSchedule" @cancel="resetCronDialog" />

  <!-- File System Navigator Dialog for Virtual Pool Paths -->
  <fsNavigatorDialog
    v-model="vpoolFsDialog.value"
    :initial-path="vpoolFsDialog.initialPath"
    :roots="vpoolFsDialog.initialPath"
    select-type="directory"
    :title="$t('select directory')"
    @selected="handleVpoolFsSelected"
  />

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openCreatePoolDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create pool') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateVPoolDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create virtual pool') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick } from 'vue';
import { showSnackbarError } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import CronScheduleDialog from '@/components/cronScheduleDialog.vue';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import { useApi } from '@/composables/useApi';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { call } = useApi();
const pools = ref([]);
const poolsLoading = ref(true);
const unassignedDisks = ref([]);
const unassignedDisksLoading = ref(true);
const vpools = ref([]);
const vpoolsLoading = ref(true);
const { t } = useI18n();
const cronDialogApplyCallback = ref(null);
const cronDialog = reactive({
  value: false,
  schedule: '* * * * *',
});
const poolTypes = ref([]);
const raidLevels = ['raid0', 'raid1', 'raid10'];
const formatDialog = reactive({
  value: false,
  disk: null,
  filesystems: [],
  filesystem: '',
  partition: true,
  wipeExisting: true,
});
const spinDialog = reactive({
  value: false,
  pool: null,
});
const createPoolDialog = reactive({
  value: false,
  disk: null,
  name: '',
  type: 'single',
  devices: [],
  filesystems: [],
  filesystem: 'xfs',
  format: false,
  automount: true,
  comment: '',
  mergerfsOptions: '',
  snapraidDevice: [],
  raidLevel: '',
  encrypted: false,
  shared: false,
  create_keyfile: false,
  passphrase: '',
  showAdvanced: false,
  parity: [],
  parity_valid: false,
  policies: {
    create: 'pfrd',
    search: 'ff',
  },
  skip_size_check: false,
  skip_size_check_clicks: 0,
  cache_devices: [],
  data_replicas: 2,
  metadata_replicas: 2,
  erasure_code: true,
  compression: 'lz4',
  background_compression: 'zstd',
  cache_mode: 'writethrough',
  minfreespace: "20G",
  moveonenospc: true,  
});
const deletePoolDialog = reactive({
  value: false,
  pool: null,
  filesystems: [],
  filesystem: '',
});
const passphraseDialog = reactive({
  value: false,
  pool: null,
  passphrase: '',
});
const addMergerfsParityDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  format: false,
  skip_size_check: false,
  skip_size_check_clicks: 0,
});
const removeMergerfsParityDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  unmount: true,
});
const replaceMergerfsParityDeviceDialog = reactive({
  value: false,
  pool: null,
  oldDevice: null,
  newDevice: null,
  format: false,
  skip_size_check: false,
  skip_size_check_clicks: 0,
});
const addMergerfsDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  format: false,
  passphrase: '',
});
const removeMergerfsDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  unmount: true,
});
const replaceMergerfsDeviceDialog = reactive({
  value: false,
  pool: null,
  oldDevice: null,
  newDevice: null,
  format: false,
});
const manageMergerfsDevicesDialog = reactive({
  value: false,
  pool: null,
});
const manageMergerfsParityDevicesDialog = reactive({
  value: false,
  pool: null,
});
const manageNonRaidDevicesDialog = reactive({
  value: false,
  pool: null,
});
const manageNonRaidParityDevicesDialog = reactive({
  value: false,
  pool: null,
});
const addNonRaidDeviceDialog = reactive({
  value: false,
  pool: null,
  device: '',
  format: false,
  filesystems: [],
  filesystem: 'xfs',
  passphrase: '',
  parity_valid: false,
});
const addNonRaidParityDialog = reactive({
  value: false,
  pool: null,
  device: '',
});
const btrfsSettingsDialog = reactive({
  value: false,
  pool: null,
  scrub: {
    enabled: false,
    schedule: '0 4 * * WED',
  },
  balance: {
    enabled: false,
    schedule: '0 5 * * SUN',
  },
  usage_alert: {
    warning: 85,
    alert: 90,
  },
});
const snapraidOperationDialog = reactive({
  value: false,
  pool: null,
  operation: '',
});
const nonRaidOperationDialog = reactive({
  value: false,
  pool: null,
  operation: '',
  operations: ['check', 'start', 'pause', 'resume', 'cancel'],
  option: 'NOCORRECT',
  options: ['CORRECT', 'NOCORRECT'],
});
const multiOperationDialog = reactive({
  value: false,
  pool: null,
  operation: '',
  operations: ['scrub', 'balance'],
  option: '',
  options: ['start', 'pause', 'resume', 'cancel'],
});
const mergerfsSettingsDialog = reactive({
  value: false,
  pool: null,
  snapraid_sync: {
    enabled: false,
    schedule: '30 0 * * *',
    check: {
      enabled: false,
      schedule: '0 0 * */3 SUN',
    },
    scrub: {
      enabled: false,
      schedule: '0 4 * * WED',
    },
  },
  mergerfs_policies: {
    create: 'pfrd',
    search: 'ff',
  },
  availablePolicies: ['pfrd', 'rand', 'mfs', 'ff', 'lfs', 'lup', 'lus', 'all', 'msppfrd', 'mspmfs', 'msplfs', 'msplus', 'eppfrd', 'epmfs', 'eprand', 'epff', 'eplfs', 'eplus', 'epall', 'newest'],
  usage_alert: {
    warning: 85,
    alert: 90,
  },
});
const nonraidSettingsDialog = reactive({
  value: false,
  pool: null,
  check: {
    enabled: false,
    schedule: '0 0 * */3 SUN',
  },
  usage_alert: {
    warning: 85,
    alert: 90,
  },
});
const createVpoolDialog = reactive({
  value: false,
  name: '',
  paths: [],
  automount: true,
  comment: '',
  config: {
    policies: {
      create: 'mspmfs',
      search: 'ff',
    },
    shared: false,
  },
  availablePolicies: ['pfrd', 'rand', 'mfs', 'ff', 'lfs', 'lup', 'lus', 'all', 'msppfrd', 'mspmfs', 'msplfs', 'msplus', 'eppfrd', 'epmfs', 'eprand', 'epff', 'eplfs', 'eplus', 'epall', 'newest'],
  availableSearchPolicies: ['ff', 'lfs', 'lus', 'all', 'newest'],
});
const vpoolFsDialog = reactive({
  value: false,
  initialPath: '/',
});

onMounted(async () => {
  getPools();
  getVPools();
  getUnassignedDisks();
  getPoolTypes();
});

watch(
  () => createPoolDialog.devices,
  (newDevices) => {
    if (createPoolDialog.type === 'mergerfs' && Array.isArray(newDevices) && newDevices.length > 0) {
      const filtered = createPoolDialog.snapraidDevice.filter((device) => !newDevices.includes(device));
      if (filtered.length !== createPoolDialog.snapraidDevice.length) {
        createPoolDialog.snapraidDevice = filtered;
      }
    }
  },
);
watch(
  () => createPoolDialog.snapraidDevice,
  (newSnapraidDevices) => {
    if (createPoolDialog.type === 'mergerfs' && Array.isArray(newSnapraidDevices) && newSnapraidDevices.length > 0) {
      const filtered = createPoolDialog.devices.filter((device) => !newSnapraidDevices.includes(device));
      if (filtered.length !== createPoolDialog.devices.length) {
        createPoolDialog.devices = filtered;
      }
    }
  },
);
watch(
  () => cronDialog.value,
  (isOpen) => {
    if (!isOpen) {
      resetCronDialog();
    }
  },
);

const resetCronDialog = () => {
  cronDialogApplyCallback.value = null;
};

const openCronDialog = (schedule, applyCallback) => {
  cronDialog.schedule = schedule && String(schedule).trim().length > 0 ? schedule : '* * * * *';
  cronDialogApplyCallback.value = applyCallback;
  cronDialog.value = true;
};

const applyCronSchedule = (schedule) => {
  if (typeof cronDialogApplyCallback.value === 'function') {
    cronDialogApplyCallback.value(schedule);
  }
  resetCronDialog();
};

const openAddMergerfsDevicesDialog = (pool) => {
  addMergerfsDevicesDialog.value = true;
  addMergerfsDevicesDialog.pool = pool;
  addMergerfsDevicesDialog.devices = [];
  addMergerfsDevicesDialog.format = false;
  addMergerfsDevicesDialog.passphrase = '';
  addMergerfsDevicesDialog.skip_size_check = false;
};
const openRemoveMergerfsDevicesDialog = (pool, devices = []) => {
  removeMergerfsDevicesDialog.value = true;
  removeMergerfsDevicesDialog.pool = pool;
  removeMergerfsDevicesDialog.devices = devices;
  removeMergerfsDevicesDialog.unmount = true;
};
const openReplaceMergerfsDeviceDialog = (pool, oldDevice = null) => {
  replaceMergerfsDeviceDialog.value = true;
  replaceMergerfsDeviceDialog.pool = pool;
  replaceMergerfsDeviceDialog.oldDevice = oldDevice;
  replaceMergerfsDeviceDialog.newDevice = null;
  replaceMergerfsDeviceDialog.format = false;
};
const openSpinDialog = (pool) => {
  spinDialog.value = true;
  spinDialog.pool = pool;
};
const performSpinAction = (action) => {
  if (spinDialog.pool) {
    if (action === 'up') {
      wakePool(spinDialog.pool);
    } else if (action === 'down') {
      sleepPool(spinDialog.pool);
    }
    spinDialog.value = false;
  }
};
const openManageMergerfsDevicesDialog = (pool) => {
  manageMergerfsDevicesDialog.value = true;
  manageMergerfsDevicesDialog.pool = pool;
};
const openManageMergerfsParityDevicesDialog = (pool) => {
  manageMergerfsParityDevicesDialog.value = true;
  manageMergerfsParityDevicesDialog.pool = pool;
};
const openManageNonRaidDevicesDialog = (pool) => {
  manageNonRaidDevicesDialog.value = true;
  manageNonRaidDevicesDialog.pool = pool;
};
const openManageNonRaidParityDevicesDialog = (pool) => {
  manageNonRaidParityDevicesDialog.value = true;
  manageNonRaidParityDevicesDialog.pool = pool;
};
const startAddMergerfsParityDevice = () => {
  manageMergerfsParityDevicesDialog.value = false;
  const pool = manageMergerfsParityDevicesDialog.pool;
  nextTick(() => {
    openAddMergerfsParityDevicesDialog(pool);
  });
};
const startReplaceMergerfsParityDevice = (device) => {
  manageMergerfsParityDevicesDialog.value = false;
  const pool = manageMergerfsParityDevicesDialog.pool;
  nextTick(() => {
    replaceMergerfsParityDeviceDialog.value = true;
    replaceMergerfsParityDeviceDialog.pool = pool;
    replaceMergerfsParityDeviceDialog.oldDevice = device.device;
    replaceMergerfsParityDeviceDialog.newDevice = null;
    replaceMergerfsParityDeviceDialog.format = false;
    replaceMergerfsParityDeviceDialog.skip_size_check = false;
    replaceMergerfsParityDeviceDialog.skip_size_check_clicks = 0;
  });
};
const startRemoveMergerfsParityDevice = (device) => {
  manageMergerfsParityDevicesDialog.value = false;
  const pool = manageMergerfsParityDevicesDialog.pool;
  nextTick(() => {
    removeMergerfsParityDevicesDialog.value = true;
    removeMergerfsParityDevicesDialog.pool = pool;
    removeMergerfsParityDevicesDialog.devices = [device.device];
    removeMergerfsParityDevicesDialog.unmount = true;
  });
};
const openPassphraseDialog = (pool) => {
  passphraseDialog.value = true;
  passphraseDialog.pool = pool;
  passphraseDialog.passphrase = '';
};
const openFormatDialog = async (disk) => {
  formatDialog.value = true;
  formatDialog.disk = disk;
  formatDialog.filesystems = await getFilesystems();
};
const openCreatePoolDialog = async (disk) => {
  createPoolDialog.value = true;
  createPoolDialog.disk = disk;
  createPoolDialog.single = 'single';
  createPoolDialog.devices = disk && disk.device ? [disk.device] : [];
  createPoolDialog.name = '';
  createPoolDialog.format = false;
  createPoolDialog.automount = true;
  createPoolDialog.comment = '';
  createPoolDialog.mergerfsOptions = '';
  createPoolDialog.snapraidDevice = [];
  createPoolDialog.encrypted = false;
  createPoolDialog.shared = false;
  createPoolDialog.passphrase = '';
  createPoolDialog.create_keyfile = true;
  createPoolDialog.raidLevel = 'raid1';
  createPoolDialog.showAdvanced = false;
  createPoolDialog.parity = [];
  createPoolDialog.parity_valid = false;
  createPoolDialog.skip_size_check = false;
  createPoolDialog.skip_size_check_clicks = 0;
  createPoolDialog.cache_devices = [];
  createPoolDialog.data_replicas = 2;
  createPoolDialog.metadata_replicas = 2;
  createPoolDialog.erasure_code = true;
  createPoolDialog.compression = 'lz4';
  createPoolDialog.background_compression = 'zstd';
  createPoolDialog.cache_mode = 'writethrough';
  createPoolDialog.filesystems = await getFilesystems(createPoolDialog.type);
};
const openDeletePoolDialog = (pool) => {
  deletePoolDialog.value = true;
  deletePoolDialog.pool = pool;
};
const openAddMergerfsParityDevicesDialog = (pool) => {
  addMergerfsParityDevicesDialog.value = true;
  addMergerfsParityDevicesDialog.pool = pool;
  addMergerfsParityDevicesDialog.devices = [];
  addMergerfsParityDevicesDialog.format = false;
  addMergerfsParityDevicesDialog.skip_size_check = false;
  addMergerfsParityDevicesDialog.skip_size_check_clicks = 0;
};
const openSnapraidOperationDialog = (pool) => {
  snapraidOperationDialog.value = true;
  snapraidOperationDialog.pool = pool;
  snapraidOperationDialog.operation = '';
};
const openNonRaidOperationDialog = (pool) => {
  nonRaidOperationDialog.value = true;
  nonRaidOperationDialog.pool = pool;
  nonRaidOperationDialog.operation = '';
  nonRaidOperationDialog.option = 'NOCORRECT';
};
const openAddNonRaidDeviceDialog = async (pool) => {
  addNonRaidDeviceDialog.value = true;
  addNonRaidDeviceDialog.pool = pool;
  addNonRaidDeviceDialog.device = '';
  addNonRaidDeviceDialog.filesystem = 'xfs';
  addNonRaidDeviceDialog.filesystems = await getFilesystems('nonraid');
  addNonRaidDeviceDialog.passphrase = '';
  addNonRaidDeviceDialog.parity_valid = false;
  addNonRaidDeviceDialog.format = false;
};
const openAddNonRaidParityDialog = (pool) => {
  addNonRaidParityDialog.value = true;
  addNonRaidParityDialog.pool = pool;
  addNonRaidParityDialog.device = '';
};
const openMultiOperationDialog = (pool) => {
  multiOperationDialog.value = true;
  multiOperationDialog.pool = pool;
  multiOperationDialog.operation = '';
  multiOperationDialog.option = '';
};
const openPoolSettingsDialog = async (pool) => {
  if (pool.type === 'mergerfs') {
    openMergerfsSettingsDialog(pool);
  } else if (pool.type === 'nonraid') {
    openNonraidSettingsDialog(pool);
  } else if (pool.type === 'btrfs') {
    openBtrfsSettingsDialog(pool);
  }
};
const openBtrfsSettingsDialog = (pool) => {
  btrfsSettingsDialog.value = true;
  btrfsSettingsDialog.pool = pool;
  btrfsSettingsDialog.scrub = pool.config.scrub || {
    enabled: false,
    schedule: '0 4 * * WED',
  };
  btrfsSettingsDialog.balance = pool.config.balance || {
    enabled: false,
    schedule: '0 5 * * SUN',
  };
  btrfsSettingsDialog.usage_alert = {
    warning: pool.config.usage_alert ? pool.config.usage_alert.warning : 85,
    alert: pool.config.usage_alert ? pool.config.usage_alert.alert : 90,
  };
};
const openMergerfsSettingsDialog = async (pool) => {
  mergerfsSettingsDialog.value = true;
  mergerfsSettingsDialog.pool = pool;
  const policies = await getMergerfsPolicies(pool.id);
  mergerfsSettingsDialog.mergerfs_policies = {
    create: policies.create ? policies.create : 'pfrd',
    search: policies.search ? policies.search : 'ff',
  };
  mergerfsSettingsDialog.snapraid_sync = pool.config.snapraid
    ? pool.config.snapraid
    : {
        enabled: false,
        schedule: '30 0 * * *',
        check: {
          enabled: false,
          schedule: '0 0 * */3 SUN',
        },
        scrub: {
          enabled: false,
          schedule: '0 4 * * WED',
        },
      };
  mergerfsSettingsDialog.usage_alert = {
    warning: pool.config.usage_alert ? pool.config.usage_alert.warning : 85,
    alert: pool.config.usage_alert ? pool.config.usage_alert.alert : 90,
  };
};
const openNonraidSettingsDialog = (pool) => {
  nonraidSettingsDialog.value = true;
  nonraidSettingsDialog.pool = pool;
  nonraidSettingsDialog.check = pool.config.check || {
    enabled: false,
    schedule: '0 5 * * SUN',
  };
  nonraidSettingsDialog.usage_alert = {
    warning: pool.config.usage_alert ? pool.config.usage_alert.warning : 85,
    alert: pool.config.usage_alert ? pool.config.usage_alert.alert : 90,
  };
};
const openCreateVPoolDialog = () => {
  createVpoolDialog.value = true;
  createVpoolDialog.name = '';
  createVpoolDialog.paths = [];
  createVpoolDialog.automount = true;
  createVpoolDialog.comment = '';
  createVpoolDialog.config = {
    policies: {
      create: 'mspmfs',
      search: 'ff',
    },
    shared: false,
  };
  createVpoolDialog.availablePolicies = [
    'pfrd',
    'rand',
    'mfs',
    'ff',
    'lfs',
    'lup',
    'lus',
    'all',
    'msppfrd',
    'mspmfs',
    'msplfs',
    'msplus',
    'eppfrd',
    'epmfs',
    'eprand',
    'epff',
    'eplfs',
    'eplus',
    'epall',
    'newest',
  ];
  createVpoolDialog.availableSearchPolicies = ['ff', 'lfs', 'lus', 'all', 'newest'];
};

const openVpoolFsDialog = () => {
  vpoolFsDialog.value = true;
  vpoolFsDialog.initialPath = '/';
};

const handleVpoolFsSelected = (item) => {
  if (item && item.path && !createVpoolDialog.paths.includes(item.path)) {
    createVpoolDialog.paths.push(item.path);
  }
  vpoolFsDialog.value = false;
};

const getPools = async () => {
  try {
    const result = await call('/api/v1/pools', {
      errorLabel: t('pools could not be loaded'),
    });
    pools.value = result.sort((a, b) => a.index - b.index);
  } catch {} finally {
    poolsLoading.value = false;
  }
};

const getVPools = async () => {
  try {
    const result = await call('/api/v1/pools/vpools', {
      errorLabel: t('virtual pools could not be loaded'),
    });
    vpools.value = result.sort((a, b) => a.index - b.index);
  } catch {} finally {
    vpoolsLoading.value = false;
  }
};

const onDragEndVPool = async () => {
  const payload = {
    order: vpools.value.map((vpool, index) => ({
      id: vpool.id,
      index: index + 1,
    })),
  };

  try {
    await call('/api/v1/pools/vpools/order', {
      method: 'PUT',
      body: payload,
      errorLabel: t('virtual pool order could not be saved'),
      successLabel: t('virtual pool order saved successfully'),
    });
  } catch {}
};

const mountVPool = async (vpool) => {
  try {
    await call(`/api/v1/pools/vpools/${vpool.id}/mount`, {
      method: 'POST',
      errorLabel: t('virtual pool could not be mounted'),
      successLabel: t('virtual pool mounted successfully'),
    });
    getVPools();
  } catch {}
};

const unmountVPool = async (vpool) => {
  try {
    await call(`/api/v1/pools/vpools/${vpool.id}/unmount`, {
      method: 'POST',
      errorLabel: t('virtual pool could not be unmounted'),
      successLabel: t('virtual pool unmounted successfully'),
    });
    getVPools();
  } catch {}
};

const deleteVPool = async (vpool) => {
  try {
    await call(`/api/v1/pools/vpools/${vpool.id}`, {
      method: 'DELETE',
      errorLabel: t('virtual pool could not be deleted'),
      successLabel: t('virtual pool deleted successfully'),
    });
    getVPools();
  } catch {}
};

const getUnassignedDisks = async () => {
  try {
    const result = await call('/api/v1/disks/unassigned', {
      errorLabel: t('unassigned disks could not be loaded'),
    });
    unassignedDisks.value = result.unassignedDisks || [];
  } catch {} finally {
    unassignedDisksLoading.value = false;
  }
};

const getFilesystems = async (pooltype = '') => {
  const url = pooltype ? `/api/v1/disks/availablefilesystems?pooltype=${encodeURIComponent(pooltype)}` : '/api/v1/disks/availablefilesystems';
  try {
    const result = await call(url, {
      errorLabel: t('filesystems could not be loaded'),
    });
    return result || [];
  } catch {
    return [];
  }
};

const getPoolTypes = async () => {
  try {
    const result = await call('/api/v1/pools/availablepooltypes', {
      errorLabel: t('pool types could not be loaded'),
    });
    poolTypes.value = result || [];
  } catch {}
};

const formatDisk = async () => {
  const formatDiskData = {
    device: formatDialog.disk.name,
    filesystem: formatDialog.filesystem,
    partition: formatDialog.partition,
    wipeExisting: formatDialog.wipeExisting,
  };

  try {
    await call('/api/v1/disks/format', {
      method: 'POST',
      body: formatDiskData,
      errorLabel: t('disk could not be formatted'),
      successLabel: t('disk formatted successfully'),
    });
    getPools();
    getUnassignedDisks();
    formatDialog.value = false;
  } catch {}
};

const createPool = async () => {
  if (createPoolDialog.type === 'single') {
    createPoolSingle();
  } else if (createPoolDialog.type === 'mergerfs') {
    createPoolMergerfs();
  } else if (createPoolDialog.type === 'multi') {
    createPoolMulti();
  } else if (createPoolDialog.type === 'nonraid') {
    createPoolNonRaid();
  } else if (createPoolDialog.type === 'bcachefs') {
    createPoolBcachefs();
  }
};

const createPoolMergerfs = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
      comment: createPoolDialog.comment,
      mergerfsOptions: createPoolDialog.mergerfsOptions,
      snapraid: { device: createPoolDialog.snapraidDevice },
      minfreespace: createPoolDialog.minfreespace,
      moveonenospc: createPoolDialog.moveonenospc,
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
    skip_size_check: createPoolDialog.skip_size_check,
  };

  try {
    await call('/api/v1/pools/mergerfs', {
      method: 'POST',
      body: createPoolData,
      errorLabel: t('pool could not be created'),
      successLabel: t('pool created successfully'),
    });
    createPoolDialog.value = false;
    getPools();
    getUnassignedDisks();
  } catch {}
};

const createPoolNonRaid = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    parity: createPoolDialog.parity,
    options: {
      automount: createPoolDialog.automount,
      comment: createPoolDialog.comment,
      policies: createPoolDialog.policies,
      minfreespace: createPoolDialog.minfreespace,
      moveonenospc: createPoolDialog.moveonenospc,
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    await call('/api/v1/pools/nonraid', {
      method: 'POST',
      body: createPoolData,
      errorLabel: t('pool could not be created'),
      successLabel: t('pool created successfully'),
    });
    createPoolDialog.value = false;
    getPools();
    getUnassignedDisks();
  } catch {}
};

const createPoolBcachefs = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    cache_devices: createPoolDialog.cache_devices,
    format: createPoolDialog.format,
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
      data_replicas: createPoolDialog.data_replicas,
      metadata_replicas: createPoolDialog.metadata_replicas,
      erasure_code: createPoolDialog.erasure_code,
      compression: createPoolDialog.compression,
      background_compression: createPoolDialog.background_compression,
      cache_mode: createPoolDialog.cache_mode,
    },
    options: {
      automount: createPoolDialog.automount,
      comment: createPoolDialog.comment,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    await call('/api/v1/pools/bcachefs', {
      method: 'POST',
      body: createPoolData,
      errorLabel: t('pool could not be created'),
      successLabel: t('pool created successfully'),
    });
    createPoolDialog.value = false;
    getPools();
    getUnassignedDisks();
  } catch {}
};

const createPoolMulti = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    devices: createPoolDialog.devices,
    raidLevel: createPoolDialog.raidLevel,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    await call('/api/v1/pools/multi', {
      method: 'POST',
      body: createPoolData,
      errorLabel: t('pool could not be created'),
      successLabel: t('pool created successfully'),
    });
    createPoolDialog.value = false;
    getPools();
    getUnassignedDisks();
  } catch {}
};

const createPoolSingle = async () => {
  const createPoolData = {
    name: createPoolDialog.name,
    device: createPoolDialog.devices,
    filesystem: createPoolDialog.filesystem,
    format: createPoolDialog.format,
    options: {
      automount: createPoolDialog.automount,
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };

  try {
    await call('/api/v1/pools/single', {
      method: 'POST',
      body: createPoolData,
      errorLabel: t('pool could not be created'),
      successLabel: t('pool created successfully'),
    });
    createPoolDialog.value = false;
    getPools();
    getUnassignedDisks();
  } catch {}
};

const createVPool = async () => {
  const payload = {
    name: createVpoolDialog.name,
    paths: createVpoolDialog.paths,
    options: {
      automount: createVpoolDialog.automount,
      comment: createVpoolDialog.comment,
    },
    config: {
      policies: createVpoolDialog.config.policies,
      shared: createVpoolDialog.config.shared,
    },
  };

  try {
    await call('/api/v1/pools/vpools', {
      method: 'POST',
      body: payload,
      errorLabel: t('virtual pool could not be created'),
      successLabel: t('virtual pool created successfully'),
    });
    getVPools();
    createVpoolDialog.value = false;
  } catch {}
};

const deletePool = async (poolId) => {
  try {
    await call(`/api/v1/pools/${poolId}`, {
      method: 'DELETE',
      errorLabel: t('pool could not be deleted'),
      successLabel: t('pool deleted successfully'),
    });
    getPools();
    getUnassignedDisks();
    getPoolTypes();
    deletePoolDialog.value = false;
  } catch {}
};

const switchAutomount = async (pool) => {
  try {
    await call(`/api/v1/pools/${pool.id}/automount`, {
      method: 'POST',
      body: { enabled: pool.automount },
      errorLabel: t('could not change automount setting'),
      successLabel: t('automount setting changed successfully'),
    });
    getPools();
  } catch {}
};

const switchVPoolAutomount = async (vpool) => {
  try {
    await call(`/api/v1/pools/vpools/${vpool.id}/automount`, {
      method: 'POST',
      body: { enabled: vpool.automount },
      errorLabel: t('could not change automount setting'),
      successLabel: t('automount setting changed successfully'),
    });
    getVPools();
  } catch {}
};

const unmountPool = async (pool) => {
  try {
    await call(`/api/v1/pools/${pool.id}/unmount`, {
      method: 'POST',
      errorLabel: t('pool could not be unmounted'),
      successLabel: t('pool unmounted successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const mountPool = async (pool) => {
  try {
    await call(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      errorLabel: t('pool could not be mounted'),
      successLabel: t('pool mounted successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const mountPoolWithPassphrase = async (pool, passphrase) => {
  try {
    await call(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      body: { passphrase },
      errorLabel: t('pool could not be mounted'),
      successLabel: t('pool mounted successfully'),
    });
    getPools();
    getUnassignedDisks();
    passphraseDialog.value = false;
  } catch {}
};

const syncManagedPoolViews = (poolId) => {
  const updated = pools.value.find((p) => p.id === poolId);
  if (!updated) return;
  if (manageMergerfsDevicesDialog.pool?.id === poolId) manageMergerfsDevicesDialog.pool = updated;
  if (manageMergerfsParityDevicesDialog.pool?.id === poolId) manageMergerfsParityDevicesDialog.pool = updated;
  if (manageNonRaidDevicesDialog.pool?.id === poolId) manageNonRaidDevicesDialog.pool = updated;
  if (manageNonRaidParityDevicesDialog.pool?.id === poolId) manageNonRaidParityDevicesDialog.pool = updated;
};

const addMergerfsParityDevice = async (poolId, devices, format, skipSizeCheck) => {
  try {
    await call(`/api/v1/pools/${poolId}/parity/add`, {
      method: 'POST',
      body: { devices, format, skipSizeCheck },
      errorLabel: t('parity device could not be added'),
      successLabel: t('parity device added successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    addMergerfsParityDevicesDialog.value = false;
  } catch {}
};

const removeMergerfsParityDevice = async (poolId, devices, unmount) => {
  try {
    await call(`/api/v1/pools/${poolId}/parity/remove`, {
      method: 'POST',
      body: { devices, unmount },
      errorLabel: t('parity device could not be removed'),
      successLabel: t('parity device removed successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    removeMergerfsParityDevicesDialog.value = false;
  } catch {}
};

const replaceMergerfsParityDevice = async (poolId, oldDevice, newDevice, format, skipSizeCheck) => {
  try {
    await call(`/api/v1/pools/${poolId}/parity/replace`, {
      method: 'POST',
      body: { oldDevice, newDevice, format, skipSizeCheck },
      errorLabel: t('parity device could not be replaced'),
      successLabel: t('parity device replaced successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    replaceMergerfsParityDeviceDialog.value = false;
  } catch {}
};

const performSnapraidOperation = async (poolId, operation) => {
  try {
    await call(`/api/v1/pools/${poolId}/parity`, {
      method: 'POST',
      body: { operation },
      errorLabel: t('snapraid operation could not be executed'),
      successLabel: t('snapraid operation executed successfully'),
    });
    getPools();
    getUnassignedDisks();
    snapraidOperationDialog.value = false;
  } catch {}
};

const performNonRaidOperation = async (poolId, operation, option) => {
  if (operation != 'check') {
    option = null;
  }

  const payload = {
    operation: operation,
    ...(option !== null && { option: option }),
  };

  try {
    await call(`/api/v1/pools/${poolId}/parity`, {
      method: 'POST',
      body: payload,
      errorLabel: t('nonraid operation could not be executed'),
      successLabel: t('nonraid operation executed successfully'),
    });
    getPools();
    getUnassignedDisks();
    nonRaidOperationDialog.value = false;
  } catch {}
};

const performMultiOperationScrub = async (poolId, option) => {
  try {
    await call(`/api/v1/pools/${poolId}/btrfs/scrub`, {
      method: 'POST',
      body: { operation: option },
      errorLabel: t('btrfs scrub could not be executed'),
      successLabel: t('btrfs scrub executed successfully'),
    });
    getPools();
    getUnassignedDisks();
    multiOperationDialog.value = false;
  } catch {}
};

const performMultiOperationBalance = async (poolId, option) => {
  try {
    await call(`/api/v1/pools/${poolId}/btrfs/balance`, {
      method: 'POST',
      body: { operation: option },
      errorLabel: t('btrfs balance could not be executed'),
      successLabel: t('btrfs balance executed successfully'),
    });
    getPools();
    getUnassignedDisks();
    multiOperationDialog.value = false;
  } catch {}
};

const saveBtrfsSettings = async () => {
  try {
    await call(`/api/v1/pools/${btrfsSettingsDialog.pool.id}/config`, {
      method: 'PATCH',
      body: {
        scrub: btrfsSettingsDialog.scrub,
        balance: btrfsSettingsDialog.balance,
        usage_alert: btrfsSettingsDialog.usage_alert,
      },
      errorLabel: t('btrfs settings could not be saved'),
      successLabel: t('btrfs settings saved successfully'),
    });
    getPools();
    btrfsSettingsDialog.value = false;
  } catch {}
};

const saveMergerfsSettings = async () => {
  try {
    await call(`/api/v1/pools/${mergerfsSettingsDialog.pool.id}/config`, {
      method: 'PATCH',
      body: {
        snapraid: mergerfsSettingsDialog.snapraid_sync,
        policies: mergerfsSettingsDialog.mergerfs_policies,
        usage_alert: mergerfsSettingsDialog.usage_alert,
      },
      errorLabel: t('mergerfs settings could not be saved'),
      successLabel: t('mergerfs settings saved successfully'),
    });
    getPools();
    mergerfsSettingsDialog.value = false;
  } catch {}
};

const saveNonraidSettings = async () => {
  try {
    await call(`/api/v1/pools/${nonraidSettingsDialog.pool.id}/config`, {
      method: 'PATCH',
      body: {
        check: nonraidSettingsDialog.check,
        usage_alert: nonraidSettingsDialog.usage_alert,
      },
      errorLabel: t('nonraid settings could not be saved'),
      successLabel: t('nonraid settings saved successfully'),
    });
    getPools();
    nonraidSettingsDialog.value = false;
  } catch {}
};

const addMergerfsDevices = async (poolId, devices, format, passphrase, skipSizeCheck) => {
  try {
    await call(`/api/v1/pools/${poolId}/devices/add`, {
      method: 'POST',
      body: { devices, format, passphrase, skip_size_check: skipSizeCheck },
      errorLabel: t('device could not be added'),
      successLabel: t('device added successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    addMergerfsDevicesDialog.value = false;
  } catch {}
};

const removeMergerfsDevice = async (poolId, devices, unmount) => {
  try {
    await call(`/api/v1/pools/${poolId}/devices/remove`, {
      method: 'POST',
      body: { devices, unmount },
      errorLabel: t('device could not be removed'),
      successLabel: t('device removed successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    removeMergerfsDevicesDialog.value = false;
  } catch {}
};

const replaceMergerfsDevice = async (poolId, oldDevice, newDevice, format) => {
  try {
    await call(`/api/v1/pools/${poolId}/devices/replace`, {
      method: 'POST',
      body: { oldDevice, newDevice, format },
      errorLabel: t('device could not be replaced'),
      successLabel: t('device replaced successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    replaceMergerfsDeviceDialog.value = false;
  } catch {}
};

const wakePool = async (pool) => {
  const devices = [...(pool.data_devices ? pool.data_devices.map((d) => d.device) : []), ...(pool.parity_devices ? pool.parity_devices.map((d) => d.device) : [])];

  try {
    await call('/api/v1/disks/wake', {
      method: 'POST',
      body: { devices },
      errorLabel: t('pool could not be woken up'),
      successLabel: t('pool woken up successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const sleepPool = async (pool) => {
  const devices = [...(pool.data_devices ? pool.data_devices.map((d) => d.device) : []), ...(pool.parity_devices ? pool.parity_devices.map((d) => d.device) : [])];

  try {
    await call('/api/v1/disks/sleep', {
      method: 'POST',
      body: { devices },
      errorLabel: t('pool could not be put to sleep'),
      successLabel: t('pool put to sleep successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const wakeDisk = async (disk) => {
  try {
    await call('/api/v1/disks/wake', {
      method: 'POST',
      body: { devices: [disk.device] },
      errorLabel: t('disk could not be woken up'),
      successLabel: t('disk woken up successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const sleepDisk = async (disk) => {
  try {
    await call('/api/v1/disks/sleep', {
      method: 'POST',
      body: { devices: [disk.device] },
      errorLabel: t('disk could not be put to sleep'),
      successLabel: t('disk put to sleep successfully'),
    });
    getPools();
    getUnassignedDisks();
  } catch {}
};

const addNonRaidDevice = async (device, filesystem, passphrase, parity_valid, format) => {
  try {
    await call('/api/v1/pools/nonraid/adddevice', {
      method: 'POST',
      body: { device, filesystem, passphrase, parity_valid, format },
      errorLabel: t('device could not be added'),
      successLabel: t('device added successfully'),
    });
    const poolId = manageNonRaidDevicesDialog.pool?.id;
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    addNonRaidDeviceDialog.value = false;
  } catch {}
};

const addNonRaidParity = async (poolId, device) => {
  try {
    await call('/api/v1/pools/nonraid/addparity', {
      method: 'POST',
      body: { device },
      errorLabel: t('parity device could not be added'),
      successLabel: t('parity device added successfully'),
    });
    await getPools();
    syncManagedPoolViews(poolId);
    getUnassignedDisks();
    addNonRaidParityDialog.value = false;
  } catch {}
};

const getMergerfsPolicies = async (poolId) => {
  try {
    const result = await call(`/api/v1/pools/${poolId}/config`, {
      errorLabel: t('mergerfs policies could not be loaded'),
    });
    return result.policies || {};
  } catch {
    return {};
  }
};

const onDragEndPool = async () => {
  const payload = {
    order: pools.value.map((pool, index) => ({
      id: pool.id,
      index: index + 1,
    })),
  };

  try {
    await call('/api/v1/pools/order', {
      method: 'PUT',
      body: payload,
      errorLabel: t('pool order could not be saved'),
      successLabel: t('pool order saved successfully'),
    });
  } catch {}
};

const getDiskIcon = (type) => {
  switch (type) {
    case 'ssd':
      return 'mdi-harddisk';
    case 'hdd':
      return 'mdi-harddisk';
    case 'usb':
      return 'mdi-usb-flash-drive';
    case 'nvme':
      return 'mdi-chip';
    case 'ramdisk':
      return 'mdi-memory';
    case 'emmc':
      return 'mdi-micro-sd';
    default:
      return 'mdi-help-circle';
  }
};

const switchPoolType = async () => {
  createPoolDialog.devices = [];
  createPoolDialog.snapraidDevice = [];
  createPoolDialog.parity = [];
  createPoolDialog.cache_devices = [];

  createPoolDialog.filesystems = await getFilesystems(createPoolDialog.type);
  if (createPoolDialog.type === 'single' || createPoolDialog.type === 'mergerfs') {
    createPoolDialog.filesystem = 'xfs';
  } else if (createPoolDialog.type === 'bcachefs') {
    createPoolDialog.filesystem = 'bcachefs';
  } else {
    createPoolDialog.filesystem = 'btrfs';
  }
  if (createPoolDialog.type === 'nonraid') {
    createPoolDialog.filesystem = 'xfs';
    if (pools.value.some((p) => p.type === 'nonraid')) {
      showSnackbarError(t('only one nonraid pool allowed'), t('you can only create one nonraid pool per system'));
      createPoolDialog.type = 'single';
      createPoolDialog.filesystem = 'xfs';
      return;
    }
  }
};

const getUsageColor = (usagePercent) => {
  if (usagePercent < 70) {
    return 'green';
  } else if (usagePercent < 90) {
    return 'orange';
  } else {
    return 'red';
  }
};
</script>