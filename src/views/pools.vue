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
                    <v-list-item @click="wakePool(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-motion-play</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('spin up pool') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="sleepPool(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-motion-pause</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('spin down pool') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'mergerfs'"></v-divider>
                    <v-list-item v-if="pool.type === 'mergerfs'" @click="openAddMergerfsDevicesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('add devices') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs'" @click="openRemoveMergerfsDevicesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-remove</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('remove devices') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs'" @click="openReplaceMergerfsDeviceDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-file-replace</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('replace device') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'mergerfs'"></v-divider>
                    <v-list-item v-if="pool.type === 'mergerfs'" @click="openAddParityDevicesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('add parity devices') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs' && pool.parity_devices.length > 0" @click="openRemoveParityDevicesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-remove</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('remove parity devices') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs' && pool.parity_devices.length > 0" @click="openReplaceParityDeviceDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-file-replace</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('replace parity device') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'mergerfs'"></v-divider>
                    <v-list-item v-if="pool.type === 'mergerfs'" @click="openMergerfsPolicyDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-shape-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('change mergerfs policy') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs' && pool.parity_devices.length > 0" @click="openSnapraidOperationDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-database-check</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('snapraid operation') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'mergerfs' && pool.parity_devices.length > 0" @click="openSnapraidSchedulesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-clock-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('snapraid schedules') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'nonraid'"></v-divider>
                    <v-list-item v-if="pool.type === 'nonraid'" @click="openAddNonRaidDeviceDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('add device') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'nonraid'" @click="openAddNonRaidParityDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('add parity device') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'nonraid'"></v-divider>
                    <v-list-item v-if="pool.type === 'nonraid' && pool.parity_devices.length > 0" @click="openNonRaidOperationDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('nonraid operation') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="pool.type === 'nonraid' && pool.parity_devices.length > 0" @click="openNonRaidSchedulesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-clock-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('nonraid schedules') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="pool.type === 'xfs' || pool.type === 'btrfs'"></v-divider>
                    <v-list-item v-if="pool.type === 'xfs' || pool.type === 'btrfs'" @click="openMultiSchedulesDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-harddisk-plus</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('btrfs schedules') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openUsageAlertsDialog(pool)">
                      <template #prepend>
                        <v-icon size="18">mdi-bell-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('usage alerts') }}</v-list-item-title>
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
                      <th class="text-caption">{{ $t('disks') }}</th>
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
  <v-dialog v-model="formatDialog.value" max-width="400">
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
  <v-dialog v-model="deletePoolDialog.value" max-width="400">
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
  <v-dialog v-model="createPoolDialog.value" max-width="600">
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
        <v-select v-model="createPoolDialog.filesystem" :items="createPoolDialog.filesystems" :label="$t('filesystem')" density="comfortable" />
        <v-text-field v-if="createPoolDialog.type === 'mergerfs'" v-model="createPoolDialog.comment" :label="$t('comment')" />
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
        <v-switch v-model="createPoolDialog.automount" :label="$t('automount')" hide-details density="compact" color="green" inset />
        <v-switch v-model="createPoolDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
        <v-switch v-model="createPoolDialog.shared" :label="$t('shared')" hide-details density="compact" color="green" inset />
        <!-- DISABLED FOR NOW <v-switch v-model="createPoolDialog.encrypted" :label="$t('encrypt')" density="compact" color="red" inset /> -->
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
  <v-dialog v-model="passphraseDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('enter passphrase')" prepend-icon="mdi-key" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
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
  <v-dialog v-model="addMergerfsDevicesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('add devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add to pool') }}</p>
        <v-form>
          <v-select
            v-model="addMergerfsDevicesDialog.devices"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`, value: disk.device })) : []"
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
  <v-dialog v-model="removeMergerfsDevicesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('remove devices')" prepend-icon="mdi-harddisk-remove" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to remove from pool') }}</p>
        <v-form>
          <v-select
            v-model="removeMergerfsDevicesDialog.devices"
            :items="
              removeMergerfsDevicesDialog.pool
                ? removeMergerfsDevicesDialog.pool.data_devices.map((device) => ({ title: `${device.device} (${device.size_human}) (${device.serial ? device.serial : '—'})`, value: device.device }))
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
  <v-dialog v-model="replaceMergerfsDeviceDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('replace device')" prepend-icon="mdi-file-replace" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-select
          v-model="replaceMergerfsDeviceDialog.oldDevice"
          :items="
            replaceMergerfsDeviceDialog.pool
              ? replaceMergerfsDeviceDialog.pool.data_devices.map((device) => ({ title: `${device.device} (${device.size_human}) (${device.serial ? device.serial : '—'})`, value: device.device }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('old device')"
          density="comfortable"
        />
        <v-select
          v-model="replaceMergerfsDeviceDialog.newDevice"
          :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`, value: disk.device })) : []"
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

  <!-- Add Parity Devices Dialog -->
  <v-dialog v-model="addParityDevicesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('add parity devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add as parity') }}</p>
        <v-select
          v-model="addParityDevicesDialog.devices"
          :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`, value: disk.device })) : []"
          item-title="title"
          item-value="value"
          :label="$t('devices')"
          :multiple="true"
          density="comfortable"
        />
        <v-switch v-model="addParityDevicesDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
        <div @click="addParityDevicesDialog.skip_size_check_clicks < 5 ? addParityDevicesDialog.skip_size_check_clicks++ : null">
          <v-switch
            v-model="addParityDevicesDialog.skip_size_check"
            :label="$t('skip size check')"
            hide-details
            density="compact"
            color="red"
            inset
            :disabled="addParityDevicesDialog.skip_size_check_clicks < 5"
          />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="addParityDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="addMergerfsParityDevice(addParityDevicesDialog.pool.id, addParityDevicesDialog.devices, addParityDevicesDialog.format, addParityDevicesDialog.skip_size_check)"
          color="onPrimary"
        >
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Remove Parity Devices Dialog -->
  <v-dialog v-model="removeParityDevicesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('remove parity devices')" prepend-icon="mdi-harddisk-remove" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select parity devices to remove') }}</p>
        <v-form>
          <v-select
            v-model="removeParityDevicesDialog.devices"
            :items="
              removeParityDevicesDialog.pool
                ? removeParityDevicesDialog.pool.parity_devices.map((device) => ({ title: `${device.device} (${device.size_human}) (${device.serial ? device.serial : '—'})`, value: device.device }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('devices')"
            :multiple="true"
            density="comfortable"
          />
          <v-switch v-model="removeParityDevicesDialog.unmount" :label="$t('unmount')" hide-details density="compact" color="red" inset />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="removeParityDevicesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="removeMergerfsParityDevice(removeParityDevicesDialog.pool.id, removeParityDevicesDialog.devices, removeParityDevicesDialog.unmount)" color="onPrimary">
          {{ $t('remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Replace Parity Device Dialog -->
  <v-dialog v-model="replaceParityDeviceDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('replace parity device')" prepend-icon="mdi-file-replace" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-form>
          <v-select
            v-model="replaceParityDeviceDialog.oldDevice"
            :items="
              replaceParityDeviceDialog.pool
                ? replaceParityDeviceDialog.pool.parity_devices.map((device) => ({ title: `${device.device} (${device.size_human}) (${device.serial ? device.serial : '—'})`, value: device.device }))
                : []
            "
            item-title="title"
            item-value="value"
            :label="$t('old device')"
            density="comfortable"
          />
          <v-select
            v-model="replaceParityDeviceDialog.newDevice"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => ({ title: `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`, value: disk.device })) : []"
            item-title="title"
            item-value="value"
            :label="$t('new device')"
            density="comfortable"
          />
          <v-switch v-model="replaceParityDeviceDialog.format" :label="$t('format')" hide-details density="compact" color="red" inset />
          <div @click="replaceParityDeviceDialog.skip_size_check_clicks < 5 ? replaceParityDeviceDialog.skip_size_check_clicks++ : null">
            <v-switch
              v-model="replaceParityDeviceDialog.skip_size_check"
              :label="$t('skip size check')"
              hide-details
              density="compact"
              color="red"
              inset
              :disabled="replaceParityDeviceDialog.skip_size_check_clicks < 5"
            />
          </div>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="replaceParityDeviceDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="
            replaceMergerfsParityDevice(
              replaceParityDeviceDialog.pool.id,
              replaceParityDeviceDialog.oldDevice,
              replaceParityDeviceDialog.newDevice,
              replaceParityDeviceDialog.format,
              replaceParityDeviceDialog.skip_size_check,
            )
          "
          color="red"
        >
          {{ $t('replace') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- SnapRAID Operation Dialog -->
  <v-dialog v-model="snapraidOperationDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('snapraid operations')" prepend-icon="mdi-database-check" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select the snapraid operation to be performed') }}</p>
        <v-form>
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
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="snapraidOperationDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn
          @click="snapraidOperationDialog.operation === 'fix' ? (snapraidFixWarningDialog.value = true) : performSnapraidOperation(snapraidOperationDialog.pool.id, snapraidOperationDialog.operation)"
          color="onPrimary"
        >
          {{ $t('perform') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- NonRaid Operation Dialog -->
  <v-dialog v-model="nonRaidOperationDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('nonraid operations')" prepend-icon="mdi-database-check" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select the nonraid operation to be performed') }}</p>
        <v-select v-model="nonRaidOperationDialog.operation" :items="nonRaidOperationDialog.operations" :label="$t('operation')" density="comfortable" />
        <v-select v-model="nonRaidOperationDialog.option" :items="nonRaidOperationDialog.options" :label="$t('options')" density="comfortable" v-if="nonRaidOperationDialog.operation === 'check'" />
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

  <!-- SnapRAID Schedules Dialog -->
  <v-dialog v-model="snapraidSchedulesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('snapraid schedules')" prepend-icon="mdi-clock-outline" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-form>
          <v-switch v-model="snapraidSchedulesDialog.sync.enabled" :label="$t('sync')" hide-details="auto" density="compact" color="green" inset />
          <v-text-field
            v-model="snapraidSchedulesDialog.sync.schedule"
            :label="$t('sync schedule (cron)')"
            hide-details="auto"
            class="mt-2 mb-4"
            append-inner-icon="mdi-calendar-clock"
            @click:append-inner="openCronDialog(snapraidSchedulesDialog.sync.schedule, (schedule) => (snapraidSchedulesDialog.sync.schedule = schedule))"
          />
          <v-switch v-model="snapraidSchedulesDialog.sync.check.enabled" :label="$t('check')" hide-details="auto" density="compact" color="green" inset />
          <v-text-field
            v-model="snapraidSchedulesDialog.sync.check.schedule"
            :label="$t('check schedule (cron)')"
            hide-details="auto"
            class="mt-2 mb-4"
            append-inner-icon="mdi-calendar-clock"
            @click:append-inner="openCronDialog(snapraidSchedulesDialog.sync.check.schedule, (schedule) => (snapraidSchedulesDialog.sync.check.schedule = schedule))"
          />
          <v-switch v-model="snapraidSchedulesDialog.sync.scrub.enabled" :label="$t('scrub')" hide-details="auto" density="compact" color="green" inset />
          <v-text-field
            v-model="snapraidSchedulesDialog.sync.scrub.schedule"
            :label="$t('scrub schedule (cron)')"
            hide-details="auto"
            class="mt-2"
            append-inner-icon="mdi-calendar-clock"
            @click:append-inner="openCronDialog(snapraidSchedulesDialog.sync.scrub.schedule, (schedule) => (snapraidSchedulesDialog.sync.scrub.schedule = schedule))"
          />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="snapraidSchedulesDialog.value = false" color="onPrimary">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" @click="saveSnapraidSchedules(snapraidSchedulesDialog.pool.id, snapraidSchedulesDialog.sync)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- NonRaid Schedules Dialog -->
  <v-dialog v-model="nonRaidSchedulesDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('nonraid schedules')" prepend-icon="mdi-clock-outline" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-switch v-model="nonRaidSchedulesDialog.check.enabled" :label="$t('check')" hide-details="auto" density="compact" color="green" inset />
        <v-text-field
          v-model="nonRaidSchedulesDialog.check.schedule"
          :label="$t('check schedule (cron)')"
          hide-details="auto"
          class="mt-2 mb-4"
          append-inner-icon="mdi-calendar-clock"
          @click:append-inner="openCronDialog(nonRaidSchedulesDialog.check.schedule, (schedule) => (nonRaidSchedulesDialog.check.schedule = schedule))"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="nonRaidSchedulesDialog.value = false" color="onPrimary">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" @click="saveNonRaidCheckSchedule(nonRaidSchedulesDialog.pool.id, nonRaidSchedulesDialog.check)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Multi Schedules Dialog -->
  <v-dialog v-model="multiSchedulesDialog.value" max-width="400">
    <v-card class="pa-0" :title="t('btrfs schedules')" prepend-icon="mdi-clock-outline" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-switch v-model="multiSchedulesDialog.scrub.enabled" :label="$t('scrub enabled')" hide-details="auto" density="compact" color="green" inset />
        <v-text-field
          v-model="multiSchedulesDialog.scrub.schedule"
          :label="$t('scrub schedule (cron)')"
          hide-details="auto"
          class="mt-2 mb-4"
          append-inner-icon="mdi-calendar-clock"
          @click:append-inner="openCronDialog(multiSchedulesDialog.scrub.schedule, (schedule) => (multiSchedulesDialog.scrub.schedule = schedule))"
          v-if="multiSchedulesDialog.scrub.enabled"
        />
        <v-switch
          v-if="multiSchedulesDialog.pool.type === 'btrfs' && multiSchedulesDialog.pool.data_devices.length > 1"
          v-model="multiSchedulesDialog.balance.enabled"
          :label="$t('balance enabled')"
          hide-details="auto"
          density="compact"
          color="green"
          inset
        />
        <v-text-field
          v-model="multiSchedulesDialog.balance.schedule"
          :label="$t('balance schedule (cron)')"
          hide-details="auto"
          class="mt-2 mb-4"
          append-inner-icon="mdi-calendar-clock"
          @click:append-inner="openCronDialog(multiSchedulesDialog.balance.schedule, (schedule) => (multiSchedulesDialog.balance.schedule = schedule))"
          v-if="multiSchedulesDialog.balance.enabled"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="multiSchedulesDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="saveMultiSchedules(multiSchedulesDialog.pool.id, multiSchedulesDialog.scrub, multiSchedulesDialog.balance)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add Non-Raid Devices Dialog -->
  <v-dialog v-model="addNonRaidDeviceDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('add device')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select device to add to pool') }}</p>
        <v-select v-model="addNonRaidDeviceDialog.device" :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => disk.device) : []" :label="$t('device')" density="comfortable" />
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
  <v-dialog v-model="addNonRaidParityDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('add parity devices')" prepend-icon="mdi-harddisk-plus" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <p class="mb-4">{{ $t('select devices to add as parity') }}</p>
        <v-form>
          <v-select
            v-model="addNonRaidParityDialog.device"
            :items="Array.isArray(unassignedDisks) ? unassignedDisks.map((disk) => `${disk.device} (${disk.size_human}) (${disk.serial ? disk.serial : '—'})`) : []"
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

  <!-- Mergerfs Policy -->
  <v-dialog v-model="mergerfsPolicyDialog.value" max-width="600">
    <v-card class="pa-0" :title="t('mergerfs policies')" prepend-icon="mdi-shape-outline" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">
        <v-select v-model="mergerfsPolicyDialog.policies.create" :items="mergerfsPolicyDialog.availablePolicies" :label="$t('create policy')" density="comfortable" class="mt-2" />
        <v-select v-model="mergerfsPolicyDialog.policies.search" :items="mergerfsPolicyDialog.availablePolicies" :label="$t('search policy')" density="comfortable" />
        <a href="https://trapexit.github.io/mergerfs/latest/config/functions_categories_policies/#policy-descriptions" target="_blank" class="mt-2">
          {{ $t('see mergerfs documentation for policy descriptions') }}
        </a>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="mergerfsPolicyDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="changeMergerfsPolicies(mergerfsPolicyDialog.pool.id, mergerfsPolicyDialog.policies)" color="onPrimary">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snapraid Fix Warning -->
  <v-dialog v-model="snapraidFixWarningDialog.value" max-width="400">
    <v-card class="pa-0" :title="t('warning')" prepend-icon="mdi-alert" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto">{{ $t('are you sure you want to perform a fix on your pool') }}?</v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="snapraidFixWarningDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="performSnapraidOperation(snapraidFixWarningDialog.pool.id, 'fix')" color="red">
          {{ $t('perform') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Usage Alerts -->
  <v-dialog v-model="usageAlertsDialog.value" max-width="400">
    <v-card class="pa-0" :title="t('usage alerts')" prepend-icon="mdi-bell-outline" style="max-height: 60vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-text-field v-model="usageAlertsDialog.usage_alert.warning" :label="$t('warning')" type="number" suffix="%" />
        <v-text-field v-model="usageAlertsDialog.usage_alert.alert" :label="$t('alert')" type="number" suffix="%" hide-details="auto" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="usageAlertsDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn @click="saveUsageAlerts(usageAlertsDialog.pool.id, usageAlertsDialog.usage_alert)" color="onPrimary">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CronScheduleDialog v-model="cronDialog.value" :schedule="cronDialog.schedule" @apply="applyCronSchedule" @cancel="resetCronDialog" />

  <!-- Floating Action Button -->
  <v-fab color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon @click="openCreatePoolDialog()">
    <v-icon>mdi-plus</v-icon>
  </v-fab>

</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import draggable from 'vuedraggable';
import CronScheduleDialog from '@/components/cronScheduleDialog.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const pools = ref([]);
const poolsLoading = ref(true);
const unassignedDisks = ref([]);
const unassignedDisksLoading = ref(true);
const { t } = useI18n();
const { overlay } = useOverlay();
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
const addParityDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  format: false,
  skip_size_check: false,
  skip_size_check_clicks: 0,
});
const removeParityDevicesDialog = reactive({
  value: false,
  pool: null,
  devices: [],
  unmount: true,
});
const snapraidOperationDialog = reactive({
  value: false,
  pool: null,
  operation: '',
});
const snapraidFixWarningDialog = reactive({
  value: false,
  pool: null,
});
const replaceParityDeviceDialog = reactive({
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
const snapraidSchedulesDialog = reactive({
  value: false,
  sync: {
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
});
const nonRaidSchedulesDialog = reactive({
  value: false,
  check: {
    enabled: false,
    schedule: '0 0 * */3 SUN',
  },
});
const multiSchedulesDialog = reactive({
  value: false,
  scrub: {
    enabled: false,
    schedule: '0 4 * * WED',
  },
  balance: {
    enabled: false,
    schedule: '0 5 * * SUN',
  },
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
const nonRaidOperationDialog = reactive({
  value: false,
  pool: null,
  operation: '',
  operations: ['check', 'start', 'pause', 'resume', 'cancel'],
  option: 'NOCORRECT',
  options: ['CORRECT', 'NOCORRECT'],
});
const mergerfsPolicyDialog = reactive({
  value: false,
  pool: null,
  policies: {
    create: 'pfrd',
    search: 'ff',
  },
  availablePolicies: ['pfrd', 'rand', 'mfs', 'ff', 'lfs', 'lup', 'lus', 'all', 'msppfrd', 'mspmfs', 'msplfs', 'msplus', 'eppfrd', 'epmfs', 'eprand', 'epff', 'eplfs', 'eplus', 'epall', 'newest'],
});
const usageAlertsDialog = reactive({
  value: false,
  pool: null,
  usage_alert: {
    warning: 85,
    alert: 90,
  },
});

onMounted(async () => {
  getPools();
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
const openRemoveMergerfsDevicesDialog = (pool) => {
  removeMergerfsDevicesDialog.value = true;
  removeMergerfsDevicesDialog.pool = pool;
  removeMergerfsDevicesDialog.devices = [];
  removeMergerfsDevicesDialog.unmount = true;
};
const openReplaceMergerfsDeviceDialog = (pool) => {
  replaceMergerfsDeviceDialog.value = true;
  replaceMergerfsDeviceDialog.pool = pool;
  replaceMergerfsDeviceDialog.oldDevice = null;
  replaceMergerfsDeviceDialog.newDevice = null;
  replaceMergerfsDeviceDialog.format = false;
};
const openReplaceParityDeviceDialog = (pool) => {
  replaceParityDeviceDialog.value = true;
  replaceParityDeviceDialog.pool = pool;
  replaceParityDeviceDialog.oldDevice = null;
  replaceParityDeviceDialog.newDevice = null;
  replaceParityDeviceDialog.format = false;
  replaceParityDeviceDialog.skip_size_check = false;
  replaceParityDeviceDialog.skip_size_check_clicks = 0;
};
const openSnapraidOperationDialog = (pool) => {
  snapraidOperationDialog.value = true;
  snapraidOperationDialog.pool = pool;
  snapraidOperationDialog.operation = '';
};
const openSnapraidSchedulesDialog = (pool) => {
  snapraidSchedulesDialog.value = true;
  snapraidSchedulesDialog.pool = pool;
  snapraidSchedulesDialog.sync = pool.config.sync || {
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
};
const openMultiSchedulesDialog = (pool) => {
  multiSchedulesDialog.value = true;
  multiSchedulesDialog.pool = pool;
  multiSchedulesDialog.scrub = {
    enabled: false,
    schedule: '0 4 * * WED',
  };
  multiSchedulesDialog.balance = {
    enabled: false,
    schedule: '0 5 * * SUN',
  };
  multiSchedulesDialog.scrub = pool.config.scrub || {
    enabled: false,
    schedule: '0 4 * * WED',
  };
  multiSchedulesDialog.balance = pool.config.balance || {
    enabled: false,
    schedule: '0 5 * * SUN',
  };
};
const openNonRaidSchedulesDialog = (pool) => {
  nonRaidSchedulesDialog.value = true;
  nonRaidSchedulesDialog.pool = pool;
  nonRaidSchedulesDialog.check = pool.config.check || {
    enabled: false,
    schedule: '0 5 * * SUN',
  };
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
  createPoolDialog.filesystems = await getFilesystems(createPoolDialog.type);
};
const openDeletePoolDialog = (pool) => {
  deletePoolDialog.value = true;
  deletePoolDialog.pool = pool;
};
const openAddParityDevicesDialog = (pool) => {
  addParityDevicesDialog.value = true;
  addParityDevicesDialog.pool = pool;
  addParityDevicesDialog.devices = [];
  addParityDevicesDialog.format = false;
  addParityDevicesDialog.skip_size_check = false;
  addParityDevicesDialog.skip_size_check_clicks = 0;
};
const openRemoveParityDevicesDialog = (pool) => {
  removeParityDevicesDialog.value = true;
  removeParityDevicesDialog.pool = pool;
  removeParityDevicesDialog.devices = [];
  removeParityDevicesDialog.unmount = true;
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
const openMergerfsPolicyDialog = async (pool) => {
  mergerfsPolicyDialog.value = true;
  mergerfsPolicyDialog.pool = pool;
  const policies = await getMergerfsPolicies(pool.id);
  mergerfsPolicyDialog.policies = {
    create: policies.create ? policies.create : 'pfrd',
    search: policies.search ? policies.search : 'ff',
  };
};
const openNonRaidOperationDialog = (pool) => {
  nonRaidOperationDialog.value = true;
  nonRaidOperationDialog.pool = pool;
  nonRaidOperationDialog.operation = '';
  nonRaidOperationDialog.option = 'NOCORRECT';
};
const openUsageAlertsDialog = (pool) => {
  usageAlertsDialog.value = true;
  usageAlertsDialog.pool = pool;
  usageAlertsDialog.usage_alert = {
    warning: pool.config.usage_alert ? pool.config.usage_alert.warning : 85,
    alert: pool.config.usage_alert ? pool.config.usage_alert.alert : 90,
  };
};

const getPools = async () => {
  try {
    const res = await fetch('/api/v1/pools', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pools could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    pools.value = await res.json();
    pools.value.sort((a, b) => a.index - b.index);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    poolsLoading.value = false;
  }
};

const getUnassignedDisks = async () => {
  try {
    const res = await fetch('/api/v1/disks/unassigned', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('unassigned disks could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const Result = await res.json();
    unassignedDisks.value = Result.unassignedDisks || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    unassignedDisksLoading.value = false;
  }
};

const getFilesystems = async (pooltype = '') => {
  try {
    const url = pooltype ? `/api/v1/disks/availablefilesystems?pooltype=${encodeURIComponent(pooltype)}` : '/api/v1/disks/availablefilesystems';
    const res = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('filesystems could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    return result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const getPoolTypes = async () => {
  try {
    const res = await fetch('/api/v1/pools/availablepooltypes', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool types could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    poolTypes.value = result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const formatDisk = async () => {
  const formatDiskData = {
    device: formatDialog.disk.name,
    filesystem: formatDialog.filesystem,
    partition: formatDialog.partition,
    wipeExisting: formatDialog.wipeExisting,
  };
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/disks/format`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formatDiskData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be formatted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk formatted successfully'));

    clearFormatDialog();
    getPools();
    getUnassignedDisks();
    formatDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createPool = async () => {
  createPoolDialog.value = false;

  if (createPoolDialog.type === 'single') {
    createPoolSingle();
  } else if (createPoolDialog.type === 'mergerfs') {
    createPoolMergerfs();
  } else if (createPoolDialog.type === 'multi') {
    createPoolMulti();
  } else if (createPoolDialog.type === 'nonraid') {
    createPoolNonRaid();
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
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
    skip_size_check: createPoolDialog.skip_size_check,
  };
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/mergerfs`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
    },
    config: {
      shared: createPoolDialog.shared,
      encrypted: createPoolDialog.encrypted,
      create_keyfile: createPoolDialog.encrypted ? createPoolDialog.create_keyfile : false,
    },
    passphrase: createPoolDialog.encrypted ? createPoolDialog.passphrase : null,
  };
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/nonraid`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/multi`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/single`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be created')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool created successfully'));

    clearCreatePoolDialog();
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deletePool = async (poolId) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${poolId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be deleted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool deleted successfully'));

    clearDeletePoolDialog();
    getPools();
    getUnassignedDisks();
    getPoolTypes();
    deletePoolDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchAutomount = async (pool) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${pool.id}/automount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled: pool.automount }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('could not change automount setting')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('automount setting changed successfully'));

    getPools();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const unmountPool = async (pool) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${pool.id}/unmount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be unmounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('pool unmounted successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const mountPool = async (pool) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool mounted successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const mountPoolWithPassphrase = async (pool, passphrase) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${pool.id}/mount`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passphrase: passphrase }),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be mounted')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool mounted successfully'));
    getPools();
    getUnassignedDisks();
    passphraseDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const addMergerfsParityDevice = async (poolId, devices, format, skipSizeCheck) => {
  overlay.value = true;
  const addParityData = {
    devices: devices,
    format: format,
    skipSizeCheck: skipSizeCheck,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/parity/add`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addParityData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('parity device could not be added')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('parity device added successfully'));
    getPools();
    getUnassignedDisks();
    addParityDevicesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeMergerfsParityDevice = async (poolId, devices, unmount) => {
  overlay.value = true;
  const removeParityData = {
    devices: devices,
    unmount: unmount,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/parity/remove`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(removeParityData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('parity device could not be removed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('parity device removed successfully'));
    getPools();
    getUnassignedDisks();
    removeParityDevicesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const replaceMergerfsParityDevice = async (poolId, oldDevice, newDevice, format, skipSizeCheck) => {
  overlay.value = true;
  const payload = {
    oldDevice: oldDevice,
    newDevice: newDevice,
    format: format,
    skipSizeCheck: skipSizeCheck,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/parity/replace`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('parity device could not be replaced')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('parity device replaced successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const performSnapraidOperation = async (poolId, operation) => {
  overlay.value = true;
  const commandData = {
    operation: operation,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/parity`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commandData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('snapraid operation could not be executed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('snapraid operation executed successfully'));
    getPools();
    getUnassignedDisks();
    snapraidOperationDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const performNonRaidOperation = async (poolId, operation, option) => {
  overlay.value = true;
  if (operation != 'check') {
    option = null;
  }

  const payload = {
    operation: operation,
    ...(option !== null && { option: option }),
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/parity`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('nonraid operation could not be executed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('nonraid operation executed successfully'));
    getPools();
    getUnassignedDisks();
    nonRaidOperationDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const saveSnapraidSchedules = async (id, sync) => {
  overlay.value = true;
  const configData = {
    sync: sync,
  };

  try {
    const res = await fetch(`/api/v1/pools/${id}/config`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('snapraid schedules could not be saved')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('snapraid schedules saved successfully'));
    getPools();
    getUnassignedDisks();
    snapraidSchedulesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const saveNonRaidCheckSchedule = async (id, check) => {
  overlay.value = true;
  const configData = {
    check: check,
  };

  try {
    const res = await fetch(`/api/v1/pools/${id}/config`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('check schedule could not be saved')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('check schedule saved successfully'));
    getPools();
    getUnassignedDisks();
    nonRaidSchedulesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const saveMultiSchedules = async (id, scrub, balance) => {
  overlay.value = true;
  const configData = {
    scrub: scrub,
    balance: balance,
  };

  try {
    const res = await fetch(`/api/v1/pools/${id}/config`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('schedules could not be saved')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('schedules saved successfully'));
    getPools();
    getUnassignedDisks();
    multiSchedulesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const addMergerfsDevices = async (poolId, devices, format, passphrase, skipSizeCheck) => {
  overlay.value = true;
  const payload = {
    devices: devices,
    format: format,
    passphrase: passphrase,
    skip_size_check: skipSizeCheck,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/devices/add`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('device could not be added')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('device added successfully'));
    getPools();
    getUnassignedDisks();
    addMergerfsDevicesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeMergerfsDevice = async (poolId, devices, unmount) => {
  overlay.value = true;
  const removeDeviceData = {
    devices: devices,
    unmount: unmount,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/devices/remove`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(removeDeviceData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('device could not be removed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('device removed successfully'));
    getPools();
    getUnassignedDisks();
    removeMergerfsDevicesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const replaceMergerfsDevice = async (poolId, oldDevice, newDevice, format) => {
  overlay.value = true;
  const replaceDeviceData = {
    oldDevice: oldDevice,
    newDevice: newDevice,
    format: format,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/devices/replace`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replaceDeviceData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('device could not be replaced')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('device replaced successfully'));
    getPools();
    getUnassignedDisks();
    replaceMergerfsDeviceDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const wakePool = async (pool) => {
  overlay.value = true;
  const wakePoolData = {
    devices: [...(pool.data_devices ? pool.data_devices.map((d) => d.device) : []), ...(pool.parity_devices ? pool.parity_devices.map((d) => d.device) : [])],
  };

  try {
    const res = await fetch(`/api/v1/disks/wake`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wakePoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be woken up')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool woken up successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const sleepPool = async (pool) => {
  overlay.value = true;
  const sleepPoolData = {
    devices: [...(pool.data_devices ? pool.data_devices.map((d) => d.device) : []), ...(pool.parity_devices ? pool.parity_devices.map((d) => d.device) : [])],
  };

  try {
    const res = await fetch(`/api/v1/disks/sleep`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sleepPoolData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('pool could not be put to sleep')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool put to sleep successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const wakeDisk = async (disk) => {
  overlay.value = true;
  const wakeDiskData = {
    devices: [disk.device],
  };

  try {
    const res = await fetch(`/api/v1/disks/wake`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wakeDiskData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be woken up')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk woken up successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const sleepDisk = async (disk) => {
  overlay.value = true;
  const sleepDiskData = {
    devices: [disk.device],
  };

  try {
    const res = await fetch(`/api/v1/disks/sleep`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sleepDiskData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('disk could not be put to sleep')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('disk put to sleep successfully'));
    getPools();
    getUnassignedDisks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const addNonRaidDevice = async (device, filesystem, passphrase, parity_valid, format) => {
  overlay.value = true;
  const addDeviceData = {
    device: device,
    filesystem: filesystem,
    passphrase: passphrase,
    parity_valid: parity_valid,
    format: format,
  };

  try {
    const res = await fetch(`/api/v1/pools/nonraid/adddevice`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addDeviceData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('device could not be added')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('device added successfully'));
    getPools();
    getUnassignedDisks();
    addNonRaidDeviceDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const addNonRaidParity = async (device) => {
  overlay.value = true;
  const addParityData = {
    device: device,
  };

  try {
    const res = await fetch(`/api/v1/pools/nonraid/addparity`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addParityData),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('parity device could not be added')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('parity device added successfully'));
    getPools();
    getUnassignedDisks();
    addNonRaidParityDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getMergerfsPolicies = async (poolId) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/config`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mergerfs policies could not be loaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    const result = await res.json();
    return result.policies || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const changeMergerfsPolicies = async (poolId, policies) => {
  overlay.value = true;
  const payload = {
    policies: policies,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/config`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('mergerfs policies could not be changed')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('mergerfs policies changed successfully'));
    getPools();
    mergerfsPolicyDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const saveUsageAlerts = async (poolId, usageAlert) => {
  overlay.value = true;
  const payload = {
    usage_alert: usageAlert,
  };

  try {
    const res = await fetch(`/api/v1/pools/${poolId}/config`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorDetails = await res.json();
      throw new Error(`${t('usage alert settings could not be saved')}|$| ${errorDetails.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('usage alert settings saved successfully'));
    getPools();
    usageAlertsDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
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
    const res = await fetch('/api/v1/pools/order', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('pool order could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('pool order saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
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

  createPoolDialog.filesystems = await getFilesystems(createPoolDialog.type);
  if (createPoolDialog.type === 'single' || createPoolDialog.type === 'mergerfs') {
    createPoolDialog.filesystem = 'xfs';
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

const clearCreatePoolDialog = () => {
  createPoolDialog.value = false;
  createPoolDialog.disk = null;
  createPoolDialog.name = '';
  createPoolDialog.type = 'single';
  createPoolDialog.devices = [];
  createPoolDialog.filesystem = '';
  createPoolDialog.automount = true;
  createPoolDialog.raidLevel = '';
  createPoolDialog.comment = '';
  createPoolDialog.mergerfsOptions = '';
  createPoolDialog.snapraidDevice = [];
  createPoolDialog.format = false;
  createPoolDialog.encrypted = false;
  createPoolDialog.create_keyfile = true;
  createPoolDialog.passphrase = '';
};
const clearFormatDialog = () => {
  formatDialog.value = false;
  formatDialog.disk = null;
  formatDialog.filesystem = '';
  formatDialog.partition = true;
  formatDialog.wipeExisting = true;
};
const clearDeletePoolDialog = () => {
  deletePoolDialog.value = false;
  deletePoolDialog.pool = null;
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
