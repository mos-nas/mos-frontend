<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('vm') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="vmsloading" :loading="true" type="card" :width="'100%'" :height="'60px'" class="mb-2" />
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-table class="bg-transparent">
              <thead>
                <tr style="background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                  <th style="min-width: 150px; padding: 4px 8px; vertical-align: middle">{{ $t('name') }}</th>
                  <th style="min-width: 200px; padding: 4px 8px; vertical-align: middle">{{ $t('description') }}</th>
                  <th style="min-width: 40px; padding: 4px 8px; vertical-align: middle">{{ $t('cpu load') }}</th>
                  <th style="padding: 4px 8px; vertical-align: middle">{{ $t('disks') }}</th>
                  <th style="padding: 4px 8px; vertical-align: middle">{{ $t('port') }}</th>
                  <th style="width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('autostart') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle">{{ $t('info') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vm in vms" :key="vm.name">
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-img class="drag-handle" v-bind="props" :src="getVmIconSrc(vm)" alt="vm image" width="24" height="24" style="cursor: pointer">
                          <template #error>
                            <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                              <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                            </v-sheet>
                          </template>
                        </v-img>
                      </template>
                      <v-list>
                        <v-list-item v-if="vm.state !== 'running'" @click="startVM(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-play-circle</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state !== 'running'" @click="startVM(vm.name).then(() => openVnc(vm.name))">
                          <template #prepend>
                            <v-icon>mdi-play-circle</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('start & vnc') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state === 'running' && vm.vncPort" @click="openVnc(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-monitor</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('vnc console') }}</v-list-item-title>
                        </v-list-item>
                        <v-divider v-if="vm.state === 'running' && vm.vncPort" />
                        <v-list-item v-if="vm.state === 'running'" @click="stopVM(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-stop-circle</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state === 'running'" @click="killVM(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-close-octagon</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state === 'running'" @click="restartVM(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-restart</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state === 'running'" @click="resetVM(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-cached</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('reset') }}</v-list-item-title>
                        </v-list-item>
                        <v-divider v-if="vm.state !== 'running'" />
                        <v-list-item v-if="vm.state !== 'running'" @click="openEditVmDialog(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-pencil</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('edit vm') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state !== 'running'" @click="openEditXmlDialog(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-text-box-edit</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('edit xml') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="vm.state !== 'running'" @click="openDeleteVmDialog(vm.name)">
                          <template #prepend>
                            <v-icon>mdi-delete-forever</v-icon>
                          </template>
                          <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <div style="font-size: 0.9rem">{{ vm.name }}</div>
                    <div class="text-caption" :style="{ color: vm.state === 'running' ? 'green' : 'red' }">{{ vm.state ?? '' }}</div>
                  </td>
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <div style="font-size: 0.9rem">{{ vm.description ?? '-' }}</div>
                  </td>
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <span v-if="vm.state === 'running'">{{ vm.cpu?.usage ?? '-' }}{{ vm.cpu?.unit }}</span>
                    <span v-else>-</span>
                  </td>
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <div v-if="vm.disks && vm.disks.length > 0">
                      <div v-for="(disk, index) in vm.disks" :key="index" class="text-caption">{{ disk.source }}</div>
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td style="padding: 4px 8px; vertical-align: middle">{{ vm.state === 'running' ? vm.vncPort || '-' : '-' }}</td>
                  <td style="padding: 4px 8px; vertical-align: middle">
                    <v-switch v-model="vm.autostart" color="green" hide-details density="compact" @change="switchAutostart(vm)" />
                  </td>
                  <td>
                    <v-icon @click="openInfoDialog(vm.name)" color="grey-darken-1" style="cursor: pointer">mdi-information-outline</v-icon>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Create VM Dialog -->
  <v-dialog v-model="createVmDialog" max-width="800">
    <v-card class="pa-0" :title="$t('create vm')" prepend-icon="mdi-plus">
      <v-card-text style="overflow: auto">
        <v-text-field v-model="newVm.name" :label="$t('name')" variant="outlined" class="my-2" hide-details="auto">
          <template #append-inner>
            <v-menu :close-on-content-click="true" location="bottom end">
              <template #activator="{ props }">
                <div v-bind="props" class="icon-picker">
                  <v-img v-if="newVm.icon" :src="`/os_icons/${newVm.icon}.png`" width="24" height="24">
                    <template #error>
                      <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                    </template>
                  </v-img>
                  <v-icon v-else color="grey-darken-1">mdi-image-plus</v-icon>
                </div>
              </template>
              <v-card max-width="350" max-height="400" style="overflow-x: hidden; overflow-y: auto">
                <v-card-text class="pa-2">
                  <div class="icon-grid">
                    <div
                      v-for="iconItem in vmCapabilities.icons || []"
                      :key="iconItem.icon"
                      class="icon-tile"
                      :class="{ 'icon-tile-selected': newVm.icon === iconItem.icon }"
                      @click="newVm.icon = iconItem.icon"
                    >
                      <v-img :src="`/os_icons/${iconItem.icon}.png`" width="32" height="32">
                        <template #error>
                          <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                        </template>
                      </v-img>
                      <span class="icon-tile-label">{{ iconItem.namePretty }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-text-field>
        <v-slider
          style="margin-top: 12px"
          v-model="newVm.memorySize"
          :label="$t('Memory Size (GB)')"
          step="1"
          min="1"
          :max="availableSystemMemory - 4"
          thumb-label="always"
          variant="outlined"
          class="mb-0 thumb-bottom"
        />
        <details>
          <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline" class="text-body-2 mb-0">{{ $t('core pinning') }}</summary>
          <v-row v-for="(core, i) in (cpu.cores || []).filter((c) => c.isPhysical)" :key="i" density="comfortable" class="align-center flex-wrap ga-2" no-gutters>
            <v-col cols="auto" class="py-0">
              <div class="core-row" style="min-width: 0; display: flex; align-items: center; gap: 6px">
                <v-checkbox v-model="newVm.selectedCores" :name="`core-${core.number}`" :value="core.number" hide-details density="compact" />
                <div class="core-label text-body-2">
                  <small>
                    <b>Core-{{ core.number }}</b>
                  </small>
                </div>
              </div>
            </v-col>
            <v-col cols="auto" class="py-0" v-for="(thread, ti) in (cpu.cores || []).filter((c) => c.isHyperThreaded && c.physicalCoreNumber === core.number)" :key="ti">
              <div class="core-row" style="min-width: 0; display: flex; align-items: center; gap: 6px">
                <v-checkbox v-model="newVm.selectedCores" :name="`thread-${thread.number}`" :value="thread.number" hide-details density="compact" />
                <div class="core-label text-body-2">
                  <small>
                    <b>Ht-{{ thread.number }}</b>
                  </small>
                </div>
              </div>
            </v-col>
          </v-row>
        </details>
        <v-select v-model="newVm.machineTypeArchitecture" :items="availableMachineTypeArchitectures" :label="$t('machine type')" variant="outlined" class="mt-8 mb-3" />
        <v-select
          v-if="newVm.machineTypeArchitecture"
          v-model="newVm.machineType"
          :items="selectedMachineTypeVersions"
          item-title="title"
          item-value="value"
          :label="$t('version')"
          variant="outlined"
          class="mb-3"
        />
        <v-select v-model="newVm.biosType" :items="vmCapabilities.biosTypes" :label="$t('BIOS Type')" variant="outlined" class="mb-4" />
        <v-divider class="my-4" />
        <!-- Disks Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('disks') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addDisk()" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(disk, index) in newVm.disks" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('disk') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeDisk(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="disk.source"
                  :label="$t('source')"
                  append-inner-icon="mdi-folder"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="/path/to/disk.qcow2"
                  @click:append-inner="
                    fsDialogDisk = true;
                    fsDialogInitialPath = vmCapabilities.vdisk_directory || '/';
                    fsDialogCallback = (item) => {
                      disk.source = item.path;
                    };
                  "
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="disk.size" :label="$t('size')" variant="outlined" density="compact" hide-details placeholder="20G" />
              </v-col>

              <v-col cols="12" md="3">
                <v-select v-model="disk.bus" :items="vmCapabilities.diskBuses" :label="$t('bus')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="disk.format" :items="vmCapabilities.diskFormats" :label="$t('format')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="disk.boot_order" :label="$t('boot order')" variant="outlined" density="compact" hide-details type="number" placeholder="1" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />
        <!-- CD-ROM Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('CD-ROM') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addCdrom()" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(cdrom, index) in newVm.cdroms" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('CD-ROM') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeCdrom(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="cdrom.source"
                  :label="$t('source')"
                  append-inner-icon="mdi-folder"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="/path/to/image.iso"
                  @click:append-inner="
                    fsDialogCdRom = true;
                    fsDialogInitialPath = '/';
                    fsDialogCallback = (item) => {
                      cdrom.source = item.path;
                    };
                  "
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-select v-model="cdrom.bus" :items="vmCapabilities.diskBuses" :label="$t('bus')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="cdrom.boot_order" :label="$t('boot order')" variant="outlined" density="compact" hide-details type="number" placeholder="2" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- VirtIO ISO Configuration -->
        <div class="mb-4">
          <div class="d-flex align-items-center mb-2">
            <span class="text-title-medium font-weight-bold">{{ $t('virtio drivers') }}</span>
          </div>
          <v-select
            v-model="newVm.virtioIso"
            :items="virtioIsoOptions"
            item-title="title"
            item-value="value"
            :label="$t('virtio iso')"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            append-icon="mdi-download"
            @click:append="downloadVirtioIso()"
            append-inner-icon="mdi-refresh"
            @click:append-inner="getVmCapabilities()"
          />
        </div>
        <v-divider class="my-4" />

        <!-- Networks Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('network adapter') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addNetwork()" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(network, index) in newVm.networks" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('network') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeNetwork(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="6">
                <v-select v-model="network.type" :items="vmCapabilities.networkTypes" :label="$t('type')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="network.source" :items="vmCapabilities.networks.bridges" :label="$t('source')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="network.model" :items="vmCapabilities.networkModels" :label="$t('model')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="network.mac" :label="$t('MAC Address')" variant="outlined" density="compact" hide-details placeholder="XX:XX:XX:XX:XX:XX" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- Graphics Configuration -->
        <div class="mb-4">
          <span class="text-title-medium font-weight-bold">{{ $t('graphics') }}</span>
          <v-card class="pa-3" variant="outlined">
            <v-row density="comfortable">
              <v-col cols="12" md="3">
                <v-select v-model="newVm.graphics.type" :items="vmCapabilities.graphicsTypes" :label="$t('type')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="newVm.graphics.keymap" :items="vmCapabilities.vncKeymaps" :label="$t('keymap')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="newVm.graphics.port" :label="$t('port')" variant="outlined" density="compact" hide-details placeholder="auto if empty" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="newVm.graphics.listen" :label="$t('listen')" variant="outlined" density="compact" hide-details placeholder="0.0.0.0" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- Host Devices Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('host devices') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addHostDevice()" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(hostdevice, index) in newVm.hostdevices" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('host devices') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeHostDevice(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12">
                <v-select
                  v-model="hostdevice.address"
                  :items="Object.entries(pcieDevices).map(([value, text]) => ({ value, title: `${value} - ${text}` }))"
                  :label="$t('PCI Address')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="0000:01:00.0"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- USB Devices Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('usb devices') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addUsbDevice()" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(usbdevice, index) in newVm.usbdevices" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('usb devices') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeUsbDevice(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12">
                <v-select
                  v-model="usbdevice.device"
                  :items="Object.entries(usbDevices).map(([value, text]) => ({ value, title: `${value} - ${text}` }))"
                  :label="$t('USB Device')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="1234:5678"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="createVmDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createVM()">{{ $t('create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit VM Dialog -->
  <v-dialog v-model="editVmDialog" max-width="800">
    <v-card class="pa-0" :title="$t('edit vm')" prepend-icon="mdi-pencil">
      <v-card-text style="overflow: auto">
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          {{ $t('Custom XML changes will be overwritten by this dialog') }}
        </v-alert>
        <v-text-field v-model="editedVm.name" :label="$t('name')" variant="outlined" class="my-2" hide-details="auto" readonly>
          <template #append-inner>
            <v-menu :close-on-content-click="true" location="bottom end">
              <template #activator="{ props }">
                <div v-bind="props" class="icon-picker">
                  <v-img v-if="editedVm.icon" :src="`/os_icons/${editedVm.icon}.png`" width="24" height="24">
                    <template #error>
                      <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                    </template>
                  </v-img>
                  <v-icon v-else color="grey-darken-1">mdi-image-plus</v-icon>
                </div>
              </template>
              <v-card max-width="350" max-height="400" style="overflow-x: hidden; overflow-y: auto">
                <v-card-text class="pa-2">
                  <div class="icon-grid">
                    <div
                      v-for="iconItem in vmCapabilities.icons || []"
                      :key="iconItem.icon"
                      class="icon-tile"
                      :class="{ 'icon-tile-selected': editedVm.icon === iconItem.icon }"
                      @click="editedVm.icon = iconItem.icon"
                    >
                      <v-img :src="`/os_icons/${iconItem.icon}.png`" width="32" height="32">
                        <template #error>
                          <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                        </template>
                      </v-img>
                      <span class="icon-tile-label">{{ iconItem.namePretty }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-text-field>
        <v-slider
          style="margin-top: 12px"
          v-model="editedVm.memorySize"
          :label="$t('Memory Size (GB)')"
          step="1"
          min="1"
          :max="availableSystemMemory - 4"
          thumb-label="always"
          variant="outlined"
          class="mb-0 thumb-bottom"
        />
        <details>
          <summary style="cursor: pointer; color: var(--v-theme-primary); text-decoration: underline" class="text-body-2 mb-0">{{ $t('core pinning') }}</summary>
          <v-row v-for="(core, i) in (cpu.cores || []).filter((c) => c.isPhysical)" :key="i" density="comfortable" class="align-center flex-wrap ga-2" no-gutters>
            <v-col cols="auto" class="py-0">
              <div class="core-row" style="min-width: 0; display: flex; align-items: center; gap: 6px">
                <v-checkbox v-model="editedVm.selectedCores" :name="`core-${core.number}`" :value="core.number" hide-details density="compact" />
                <div class="core-label text-body-2">
                  <small>
                    <b>Core-{{ core.number }}</b>
                  </small>
                </div>
              </div>
            </v-col>
            <v-col cols="auto" class="py-0" v-for="(thread, ti) in (cpu.cores || []).filter((c) => c.isHyperThreaded && c.physicalCoreNumber === core.number)" :key="ti">
              <div class="core-row" style="min-width: 0; display: flex; align-items: center; gap: 6px">
                <v-checkbox v-model="editedVm.selectedCores" :name="`thread-${thread.number}`" :value="thread.number" hide-details density="compact" />
                <div class="core-label text-body-2">
                  <small>
                    <b>Ht-{{ thread.number }}</b>
                  </small>
                </div>
              </div>
            </v-col>
          </v-row>
        </details>
        <v-select v-model="editedVm.machineTypeArchitecture" :items="availableMachineTypeArchitectures" :label="$t('machine type')" variant="outlined" class="mt-8 mb-3" />
        <v-select
          v-if="editedVm.machineTypeArchitecture"
          v-model="editedVm.machineType"
          :items="selectedMachineTypeVersions"
          item-title="title"
          item-value="value"
          :label="$t('version')"
          variant="outlined"
          class="mb-3"
        />
        <v-select v-model="editedVm.biosType" :items="vmCapabilities.biosTypes" :label="$t('BIOS Type')" variant="outlined" class="mb-4" />
        <v-divider class="my-4" />
        <!-- Disks Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('disks') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addDiskEdit" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(disk, index) in editedVm.disks" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('disk') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeDiskEdit(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="disk.source"
                  :label="$t('source')"
                  append-inner-icon="mdi-folder"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="/path/to/disk.qcow2"
                  @click:append-inner="
                    fsDialogDisk = true;
                    fsDialogInitialPath = vmCapabilities.vdisk_directory || '/';
                    fsDialogCallback = (item) => {
                      disk.source = item.path;
                    };
                  "
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="disk.size" :label="$t('size')" variant="outlined" density="compact" hide-details placeholder="20G" />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="disk.bus" :items="vmCapabilities.diskBuses" :label="$t('bus')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="disk.format" :items="vmCapabilities.diskFormats" :label="$t('format')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="disk.boot_order" :label="$t('boot order')" variant="outlined" density="compact" hide-details type="number" placeholder="1" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />
        <!-- CD-ROM Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('CD-ROM') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addCdromEdit" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(cdrom, index) in editedVm.cdroms" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('CD-ROM') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeCdromEdit(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="cdrom.source"
                  :label="$t('source')"
                  append-inner-icon="mdi-folder"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="/path/to/image.iso"
                  @click:append-inner="
                    fsDialogCdRom = true;
                    fsDialogInitialPath = '/';
                    fsDialogCallback = (item) => {
                      cdrom.source = item.path;
                    };
                  "
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-select v-model="cdrom.bus" :items="vmCapabilities.diskBuses" :label="$t('bus')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="cdrom.boot_order" :label="$t('boot order')" variant="outlined" density="compact" hide-details type="number" placeholder="2" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- VirtIO ISO Configuration -->
        <div class="mb-4">
          <div class="d-flex align-items-center mb-2">
            <span class="text-title-medium font-weight-bold">{{ $t('virtio drivers') }}</span>
          </div>
          <v-select
            v-model="editedVm.virtioIso"
            :items="virtioIsoOptions"
            item-title="title"
            item-value="value"
            :label="$t('virtio iso')"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            append-icon="mdi-download"
            @click:append="downloadVirtioIso()"
            append-inner-icon="mdi-refresh"
            @click:append-inner="getVmCapabilities()"
          />
        </div>
        <v-divider class="my-4" />

        <!-- Networks Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('network adapter') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addNetworkEdit" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(network, index) in editedVm.networks" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('network') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeNetworkEdit(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12" md="6">
                <v-select v-model="network.type" :items="vmCapabilities.networkTypes" :label="$t('type')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="network.source" :items="vmCapabilities.networks.bridges" :label="$t('source')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="network.model" :items="vmCapabilities.networkModels" :label="$t('model')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="network.mac" :label="$t('MAC Address')" variant="outlined" density="compact" hide-details placeholder="XX:XX:XX:XX:XX:XX" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- Graphics Configuration -->
        <div class="mb-4">
          <span class="text-title-medium font-weight-bold">{{ $t('graphics') }}</span>
          <v-card class="pa-3" variant="outlined">
            <v-row density="comfortable">
              <v-col cols="12" md="3">
                <v-select v-model="editedVm.graphics.type" :items="vmCapabilities.graphicsTypes" :label="$t('type')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="editedVm.graphics.keymap" :items="vmCapabilities.vncKeymaps" :label="$t('keymap')" variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="editedVm.graphics.port" :label="$t('port')" variant="outlined" density="compact" hide-details placeholder="auto if empty" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="editedVm.graphics.listen" :label="$t('listen')" variant="outlined" density="compact" hide-details placeholder="0.0.0.0" />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- Host Devices Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('host devices') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addHostDeviceEdit" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(hostdevice, index) in editedVm.hostdevices" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('Host Device') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeHostDeviceEdit(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12">
                <v-select
                  v-model="hostdevice.address"
                  :items="Object.entries(pcieDevices).map(([value, text]) => ({ value, title: `${value} - ${text}` }))"
                  :label="$t('PCI Address')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="0000:01:00.0"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>
        <v-divider class="my-4" />

        <!-- USB Devices Configuration -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <span class="text-title-medium font-weight-bold">{{ $t('usb devices') }}</span>
              <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0; color: green" @click="addUsbDeviceEdit" title="Add" aria-label="add">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                {{ $t('add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card v-for="(usbdevice, index) in editedVm.usbdevices" :key="index" class="mb-3 pa-3" variant="outlined">
            <div class="d-flex align-items-center mb-2">
              <span class="text-subtitle-2">{{ $t('USB Device') }} {{ index + 1 }}</span>
              <v-spacer />
              <v-btn size="x-small" icon="mdi-delete" variant="text" color="error" @click="removeUsbDeviceEdit(index)" />
            </div>
            <v-row density="comfortable">
              <v-col cols="12">
                <v-select
                  v-model="usbdevice.device"
                  :items="Object.entries(usbDevices).map(([value, text]) => ({ value, title: `${value} - ${text}` }))"
                  :label="$t('USB Device')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="1234:5678"
                />
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" @click="editVmDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="editVM()">{{ $t('save changes') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit XML Dialog -->
  <v-dialog v-model="editXmlDialog" max-width="1500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('edit xml') }} {{ $t('for') }} {{ editXmlVmData.name }}</v-card-title>
      <v-card-text style="overflow: auto; max-height: 70vh">
        <xmlEditor v-model="editXmlVmData.xml" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="editXmlDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="changeXml()">{{ $t('save changes') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete VM Dialog -->
  <v-dialog v-model="deleteVmDialog" max-width="500">
    <v-card class="pa-0">
      <v-card-title>{{ $t('delete vm') }}</v-card-title>
      <v-card-text style="overflow: auto; max-height: 70vh">
        <p class="mb-4">
          {{ $t('Are you sure you want to delete') }}
          <strong>{{ deleteVmData.name }}</strong>
          ?
        </p>
        <v-checkbox v-model="deleteVmData.removeDisks" :label="$t('Remove disks')" hide-details density="compact" />
        <v-checkbox v-model="deleteVmData.removeNvram" :label="$t('Remove NVRAM')" hide-details density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="deleteVmDialog = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="error" @click="deleteVM()">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- VM Info Dialog -->
  <v-dialog v-model="infoDialog" max-width="700">
    <v-card class="pa-0">
      <v-card-title>{{ infoDialogData.name }}</v-card-title>
      <v-card-text style="overflow: auto; max-height: 70vh">
        <v-skeleton-loader v-if="infoDialogLoading" />
        <template v-else>
          <h3 class="text-h6">{{ $t('general') }}</h3>
          <v-table density="compact" class="mb-4">
            <tbody>
              <tr>
                <td class="font-weight-medium" style="width: 150px">UUID</td>
                <td>{{ infoDialogData.uuid }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">{{ $t('memory') }}</td>
                <td>{{ infoDialogData.memoryHuman }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">{{ $t('cores') }}</td>
                <td>{{ infoDialogData.cpus }}</td>
              </tr>
              <tr v-if="infoDialogData.cpuPins?.length">
                <td class="font-weight-medium">{{ $t('pinned cores') }}</td>
                <td>{{ infoDialogData.cpuPins?.join(', ') }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">{{ $t('platform') }}</td>
                <td>{{ infoDialogData.platform }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">{{ $t('bios') }}</td>
                <td>{{ infoDialogData.bios }}</td>
              </tr>
            </tbody>
          </v-table>
          <template v-if="infoDialogData.disks?.length">
            <h3 class="text-h6">{{ $t('disks') }}</h3>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th>{{ $t('source') }}</th>
                  <th>{{ $t('format') }}</th>
                  <th>{{ $t('bus') }}</th>
                  <th>{{ $t('target') }}</th>
                  <th>{{ $t('boot order') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(disk, i) in infoDialogData.disks" :key="i">
                  <td class="text-caption">{{ disk.source }}</td>
                  <td>{{ disk.format }}</td>
                  <td>{{ disk.bus }}</td>
                  <td>{{ disk.target }}</td>
                  <td>{{ disk.boot_order || '-' }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <template v-if="infoDialogData.cdroms?.length">
            <h3 class="text-h6">{{ $t('CD-ROM') }}</h3>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th>{{ $t('source') }}</th>
                  <th>{{ $t('bus') }}</th>
                  <th>{{ $t('boot order') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cdrom, i) in infoDialogData.cdroms" :key="i">
                  <td class="text-caption">{{ cdrom.source }}</td>
                  <td>{{ cdrom.bus }}</td>
                  <td>{{ cdrom.boot_order || '-' }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <template v-if="infoDialogData.networks?.length">
            <h3 class="text-h6">{{ $t('network adapter') }}</h3>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th>{{ $t('type') }}</th>
                  <th>{{ $t('source') }}</th>
                  <th>{{ $t('model') }}</th>
                  <th>{{ $t('MAC Address') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(net, i) in infoDialogData.networks" :key="i">
                  <td>{{ net.type }}</td>
                  <td>{{ net.source }}</td>
                  <td>{{ net.model }}</td>
                  <td>{{ net.mac }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <template v-if="infoDialogData.graphics">
            <h3 class="text-h6">{{ $t('graphics') }}</h3>
            <v-table density="compact" class="mb-4">
              <tbody>
                <tr>
                  <td class="font-weight-medium" style="width: 150px">{{ $t('type') }}</td>
                  <td>{{ infoDialogData.graphics.type }}</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">{{ $t('port') }}</td>
                  <td>{{ infoDialogData.graphics.port || 'auto' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-medium">{{ $t('listen') }}</td>
                  <td>{{ infoDialogData.graphics.listen }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <template v-if="infoDialogData.pciDevices?.length">
            <h3 class="text-h6">{{ $t('Host Devices') }}</h3>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th>{{ $t('address') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pci, i) in infoDialogData.pciDevices" :key="i">
                  <td>{{ pci.address }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <template v-if="infoDialogData.usbDevices?.length">
            <h3 class="text-h6">{{ $t('USB Devices') }}</h3>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th>{{ $t('vendor') }}</th>
                  <th>{{ $t('product') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(usb, i) in infoDialogData.usbDevices" :key="i">
                  <td>{{ usb.vendor }}</td>
                  <td>{{ usb.product }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn @click="infoDialog = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog for Disks -->
  <fsNavigatorDialog
    v-model="fsDialogDisk"
    :initial-path="fsDialogInitialPath"
    :roots="fsDialogInitialPath != '' ? fsDialogInitialPath : ''"
    :selectType="'all'"
    :title="$t('select disk file')"
    @selected="handleFsSelected"
  />

  <!-- File System Navigator Dialog for CD-ROMs -->
  <fsNavigatorDialog
    v-model="fsDialogCdRom"
    :initial-path="fsDialogInitialPath"
    :roots="fsDialogInitialPath != '' ? fsDialogInitialPath : ''"
    :selectType="'all'"
    :title="$t('select ISO file')"
    @selected="handleFsSelected"
  />

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item @click="openCreateVmDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create vm') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { io } from 'socket.io-client';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import xmlEditor from '@/components/xmlEditor.vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const vms = ref([]);
const vmUsage = ref([]);
const overlay = ref(false);
const { t } = useI18n();
const vmsloading = ref(true);
const isConnected = ref(false);
const error = ref(null);
const router = useRouter();
const vmCapabilities = ref({
  vdisk_directory: '',
  qemuPath: '',
  libvirtPath: '',
  biosTypes: [],
  biosFiles: {},
  diskBuses: [],
  diskFormats: [],
  networkTypes: [],
  networkModels: [],
  graphicsTypes: [],
  machines: [],
  networks: {
    bridges: [],
    interfaces: [],
    libvirtNetworks: [],
  },
  virtioIsos: [],
});
const createVmDialog = ref(false);
const editVmDialog = ref(false);
const editXmlDialog = ref(false);
const editXmlVmData = ref({
  name: '',
  xml: '',
});
const deleteVmDialog = ref(false);
const deleteVmData = ref({
  name: '',
  removeDisks: false,
  removeNvram: false,
});
const infoDialog = ref(false);
const infoDialogLoading = ref(false);
const infoDialogData = ref({});
const fsDialogDisk = ref(false);
const fsDialogCdRom = ref(false);
const fsDialogCallback = ref(null);
const fsDialogInitialPath = ref('/');
const newVm = ref({
  name: '',
  icon: '',
  memorySize: 1,
  machineTypeArchitecture: 'q35',
  machineType: 'q35',
  biosType: 'ovmf',
  selectedCores: [],
  disks: [],
  cdroms: [],
  networks: [],
  graphics: {
    type: 'vnc',
    port: null,
    listen: '0.0.0.0',
    vncKeymap: null,
  },
  hostdevices: [],
  usbdevices: [],
});
const editedVm = ref({
  name: '',
  icon: '',
  memorySize: 1,
  machineTypeArchitecture: 'q35',
  machineType: 'q35',
  biosType: 'ovmf',
  selectedCores: [],
  disks: [],
  cdroms: [],
  networks: [],
  graphics: {
    type: 'vnc',
    port: null,
    listen: '0.0.0.0',
    keymap: 'en-us',
  },
  hostdevices: [],
  usbdevices: [],
  virtioIso: null,
});
const systemInfo = ref({
  os: {},
  cpu: {},
  memory: {},
  disks: [],
  network: [],
  processes: {},
});
const pcieDevices = ref({});
const usbDevices = ref({});
const availableSystemMemory = ref(0);
const cpu = ref({});

let socket = null;

onMounted(() => {
  getVMs();
  getVmUsage();
  getLoadWS();
  getSystemInfo();
  getVmCapabilities();
  getPCIeDevices();
  getUSBDevices();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

const getVMs = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    vms.value = await res.json();
  } catch (e) {
    showSnackbarError(t('Could not fetch VMs'));
  } finally {
    vmsloading.value = false;
  }
};

const getVmUsage = async () => {
  try {
    const res = await fetch('/api/v1/vm/machines/usage', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    vmUsage.value = await res.json();
  } catch (e) {
    showSnackbarError(t('Could not fetch VM usage'));
  }
};

const getVmUsageByName = (name) => {
  return vmUsage.value.find((u) => u.name === name);
};

watch(
  vmUsage,
  (newUsage) => {
    if (!newUsage || !vms.value) return;

    vms.value.forEach((vm) => {
      const usage = getVmUsageByName(vm.name);
      if (usage) {
        vm.cpu = usage.cpu;
        vm.memory = usage.memory;
        vm.state = usage.state;
      }
    });
  },
  { deep: true },
);

const getVmIconSrc = (vms) => {
  if (vms.customIcon) {
    return `/vm_custom/${vms.name}.png`;
  } else {
    return `/os_icons/${vms.icon}.png`;
  }
};

const getLoadWS = () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    error.value = 'No auth token found';
    return;
  }

  socket = io('/vm', {
    path: '/api/v1/socket.io/',
    transports: ['websocket'],
    upgrade: false,
  });

  socket.on('connect', () => {
    isConnected.value = true;
    error.value = null;
    socket.emit('subscribe-vm-usage', { token: authToken });
  });

  socket.on('connect_error', (err) => {
    error.value = `Connection error: ${err.message}`;
    isConnected.value = false;
  });
  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  socket.on('vm-usage-update', (data) => {
    vmUsage.value = data.vms;
  });
  socket.on('error', (err) => {
    error.value = `Socket error: ${err}`;
  });
};

const openVnc = async (vmName) => {
  try {
    const res = await fetch('/api/v1/vm/vnc/token', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vmName }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to get VNC token');
    }

    const { wsPath, token } = await res.json();

    const vm = vms.value.find((v) => v.name === vmName);
    let iconUrl = '';
    if (vm?.customIcon) {
      iconUrl = `/vm_custom/${vmName}.png`;
    } else if (vm?.icon) {
      iconUrl = `/os_icons/${vm.icon}.png`;
    }

    const width = 1280;
    const height = 1024;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const path = wsPath.substring(1);

    let url = `/novnc/vnc.html?host=${host}&port=${port}&path=${encodeURIComponent(path)}&autoconnect=true&resize=scale&title=${encodeURIComponent(vmName)}`;
    if (iconUrl) {
      url += `&icon=${encodeURIComponent(iconUrl)}`;
    }

    window.open(url, `vnc-${vmName}`, `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`);
  } catch (err) {
    showSnackbarError(t('vnc connection failed'), err.message);
  }
};

const stopVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/stop`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM shutdown initiated'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const startVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/start`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be started')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM started successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const killVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/kill`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be killed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM killed successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const resetVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/reset`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be reset')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM reset successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restartVM = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${name}/restart`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be restarted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM restarted successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openEditXmlDialog = async (name) => {
  try {
    const res = await fetch(`/api/v1/vm/machines/${name}/xml`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const data = await res.json();
    editXmlVmData.value.xml = data.xml;
    editXmlVmData.value.name = name;
    editXmlDialog.value = true;
  } catch (e) {
    showSnackbarError(t('Could not fetch XML'));
  }
};

const changeXml = async () => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/xml/validate`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xml: editXmlVmData.value.xml }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('XML could not be validated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('XML validated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    const payload = {
      name: editXmlVmData.value.name,
      xml: editXmlVmData.value.xml,
    };
    try {
      const res = await fetch(`/api/v1/vm/machines/${editXmlVmData.value.name}/xml`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(`${t('XML could not be changed')}|$| ${error.error || t('unknown error')}`);
      }

      showSnackbarSuccess(t('XML changed successfully'));
      getVMs();
    } catch (e) {
      const [userMessage, apiErrorMessage] = e.message.split('|$|');
      showSnackbarError(userMessage, apiErrorMessage);
    } finally {
      overlay.value = false;
      editXmlDialog.value = false;
    }
  }
};

const openInfoDialog = async (name) => {
  infoDialogData.value = { name };
  infoDialogLoading.value = true;
  infoDialog.value = true;

  try {
    const res = await fetch(`/api/v1/vm/machines/${name}/config`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    infoDialogData.value = await res.json();
  } catch (e) {
    showSnackbarError(t('Could not fetch VM config'));
    infoDialog.value = false;
  } finally {
    infoDialogLoading.value = false;
  }
};

const openDeleteVmDialog = (name) => {
  deleteVmData.value = {
    name: name,
    removeDisks: false,
    removeNvram: false,
  };
  deleteVmDialog.value = true;
};

const deleteVM = async () => {
  try {
    overlay.value = true;
    deleteVmDialog.value = false;

    const url = new URL(`/api/v1/vm/machines/${deleteVmData.value.name}`, window.location.origin);
    if (deleteVmData.value.removeDisks) {
      url.searchParams.set('removeDisks', 'true');
    }
    if (deleteVmData.value.removeNvram) {
      url.searchParams.set('removeNvram', 'true');
    }

    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM deleted successfully'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchAutostart = async (vm) => {
  const autostartBody = { enabled: vm.autostart };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${vm.name}/autostart`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(autostartBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('could not switch autostart')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('autostart setting updated'));
    getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getSystemInfo = async () => {
  try {
    const res = await fetch('/api/v1/system/load', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    systemInfo.value = await res.json();
    availableSystemMemory.value = Math.floor(systemInfo.value.memory.total / (1024 * 1024 * 1024));
    cpu.value = systemInfo.value.cpu;
  } catch (e) {
    showSnackbarError(t('Could not fetch memory info'));
  }
};

const getPCIeDevices = async () => {
  try {
    const res = await fetch('/api/v1/system/devices/pci', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const pcieDevicesRaw = await res.json();
    pcieDevices.value = pcieDevicesRaw.reduce((reduced, dev) => {
      const fullAddress = dev.slot.includes(':') && dev.slot.split(':')[0].length === 2 ? `0000:${dev.slot}` : dev.slot;
      reduced[fullAddress] = `${dev.class} ${dev.name} (${dev.vendor})`;
      return reduced;
    }, {});
  } catch (e) {
    showSnackbarError(t('Could not fetch PCIe devices'));
  }
};

const getUSBDevices = async () => {
  try {
    const res = await fetch('/api/v1/system/devices/usb', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const usbDevicesRaw = await res.json();
    usbDevices.value = usbDevicesRaw.reduce((reduced, dev) => {
      const key = `${dev.vendor_id}:${dev.product_id}`;
      reduced[key] = dev.description;
      return reduced;
    }, {});
  } catch (e) {
    showSnackbarError(t('Could not fetch USB devices'));
  }
};

const getVmCapabilities = async () => {
  try {
    const res = await fetch('/api/v1/vm/capabilities', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    vmCapabilities.value = await res.json();
  } catch (e) {
    showSnackbarError(t('Could not fetch VM capabilities'));
  }
};

const availableMachineTypeArchitectures = computed(() => {
  const categories = new Set();

  if (vmCapabilities.value?.machines) {
    vmCapabilities.value.machines.forEach((mt) => {
      if (mt.name.includes('i440fx')) {
        categories.add('i440fx');
      } else if (mt.name.includes('q35')) {
        categories.add('q35');
      }
    });
  }

  return Array.from(categories).sort();
});

const i440fxVersions = computed(() => {
  if (!vmCapabilities.value?.machines) return [];

  return vmCapabilities.value.machines
    .filter((mt) => mt.name.includes('i440fx')) // && !mt.description.includes('deprecated')
    .map((mt) => ({
      value: mt.name,
      title: mt.name === 'i440fx' ? `${mt.name} (default)` : mt.name,
      description: mt.description,
      isDefault: mt.description.includes('(default)'),
      isAlias: mt.description.includes('(alias'),
    }))
    .sort((a, b) => {
      if (a.isAlias) return -1;
      if (b.isAlias) return 1;
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      const versionA = a.value.match(/(\d+)\.(\d+)/);
      const versionB = b.value.match(/(\d+)\.(\d+)/);
      if (versionA && versionB) {
        const majorDiff = parseInt(versionB[1]) - parseInt(versionA[1]);
        if (majorDiff !== 0) return majorDiff;
        return parseInt(versionB[2]) - parseInt(versionA[2]);
      }
      return b.value.localeCompare(a.value);
    });
});

const q35Versions = computed(() => {
  if (!vmCapabilities.value?.machines) return [];

  return vmCapabilities.value.machines
    .filter((mt) => mt.name.includes('q35')) // && !mt.description.includes('deprecated')
    .map((mt) => ({
      value: mt.name,
      title: mt.name === 'q35' ? `${mt.name} (default)` : mt.name,
      description: mt.description,
      isDefault: mt.description.includes('(default)'),
      isAlias: mt.description.includes('(alias'),
    }))
    .sort((a, b) => {
      if (a.isAlias) return -1;
      if (b.isAlias) return 1;
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      const versionA = a.value.match(/(\d+)\.(\d+)/);
      const versionB = b.value.match(/(\d+)\.(\d+)/);
      if (versionA && versionB) {
        const majorDiff = parseInt(versionB[1]) - parseInt(versionA[1]);
        if (majorDiff !== 0) return majorDiff;
        return parseInt(versionB[2]) - parseInt(versionA[2]);
      }
      return b.value.localeCompare(a.value);
    });
});

const selectedMachineTypeVersions = computed(() => {
  if (newVm.value.machineTypeArchitecture === 'i440fx') {
    return i440fxVersions.value;
  } else if (newVm.value.machineTypeArchitecture === 'q35') {
    return q35Versions.value;
  }
  return [];
});

watch(
  () => newVm.value.machineTypeArchitecture,
  () => {
    const versions = selectedMachineTypeVersions.value;
    if (versions.length) {
      newVm.value.machineType = versions[0].value;
    }
  },
);

watch(
  () => editedVm.value.machineTypeArchitecture,
  () => {
    const versions = selectedMachineTypeVersions.value;
    if (versions.length) {
      editedVm.value.machineType = versions[0].value;
    }
  },
);

const virtioIsoOptions = computed(() => {
  if (!vmCapabilities.value?.virtioIsos) return [];
  return vmCapabilities.value.virtioIsos.map((iso) => ({
    title: `VirtIO ${iso.version}`,
    value: iso.path,
  }));
});

const openCreateVmDialog = async () => {
  newVm.value = {
    name: '',
    icon: '',
    memorySize: 1,
    machineTypeArchitecture: 'q35',
    machineType: 'q35',
    biosType: 'ovmf',
    selectedCores: [],
    disks: [],
    cdroms: [],
    networks: [],
    graphics: {
      type: 'vnc',
      port: null,
      listen: '0.0.0.0',
      keymap: 'en-us',
    },
    hostdevices: [],
    usbdevices: [],
  };

  createVmDialog.value = true;
};
const openEditVmDialog = async (name) => {
  try {
    const res = await fetch(`/api/v1/vm/machines/${name}/config`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    const data = await res.json();

    let memorySize = 1;
    if (data.memoryHuman) {
      const match = data.memoryHuman.match(/^(\d+)/);
      if (match) memorySize = parseInt(match[1]);
    }

    const platform = data.platform || 'q35';
    let machineTypeArchitecture = 'q35';
    if (platform.includes('i440fx')) machineTypeArchitecture = 'i440fx';

    editedVm.value = {
      name: data.name,
      icon: data.icon || '',
      memorySize,
      machineTypeArchitecture,
      machineType: platform,
      biosType: data.bios || 'ovmf',
      selectedCores: data.cpuPins || [],
      disks: (data.disks || []).map((d) => ({
        type: 'file',
        source: d.source || '',
        size: d.size || '',
        format: d.format || 'qcow2',
        bus: d.bus || 'virtio',
        boot_order: d.boot_order || 0,
      })),
      cdroms: (data.cdroms || []).map((c) => ({
        source: c.source || '',
        bus: c.bus || 'sata',
        boot_order: c.boot_order || 0,
      })),
      networks: (data.networks || []).map((n) => ({
        type: n.type || 'bridge',
        source: n.source || '',
        model: n.model || 'virtio',
        mac: n.mac || '',
      })),
      graphics: {
        type: data.graphics?.type || 'vnc',
        port: data.graphics?.port || null,
        listen: data.graphics?.listen || '0.0.0.0',
        keymap: data.graphics?.keymap || 'en-us',
      },
      hostdevices: (data.pciDevices || []).map((p) => ({ address: p.address })),
      usbdevices: (data.usbDevices || []).map((u) => ({ device: `${u.vendor}:${u.product}` })),
      virtioIso: null,
    };

    editVmDialog.value = true;
  } catch (e) {
    showSnackbarError(t('Could not fetch VM config'));
  }
};

const recalculateBootOrder = () => {
  const allBootableDevices = [...newVm.value.disks.map((d) => ({ item: d, type: 'disk' })), ...newVm.value.cdroms.map((c) => ({ item: c, type: 'cdrom' }))];

  allBootableDevices
    .sort((a, b) => (a.item.boot_order || 999) - (b.item.boot_order || 999))
    .forEach((device, index) => {
      device.item.boot_order = index + 1;
    });
};

const addDisk = () => {
  const totalDevices = newVm.value.disks.length + newVm.value.cdroms.length;
  const diskIndex = newVm.value.disks.length;
  const format = 'qcow2';
  const vdiskDir = vmCapabilities.value.vdisk_directory || '/';
  const vmName = newVm.value.name || 'unnamed';
  const source = `${vdiskDir}/${vmName}/vdisk${diskIndex + 1}.${format}`;

  newVm.value.disks.push({
    type: 'file',
    source: source,
    size: '',
    format: format,
    boot_order: totalDevices + 1,
  });
};

const removeDisk = (index) => {
  newVm.value.disks.splice(index, 1);
  recalculateBootOrder();
};

const addCdrom = () => {
  const totalDevices = newVm.value.disks.length + newVm.value.cdroms.length;
  newVm.value.cdroms.push({
    bus: 'sata',
    source: '',
    size: '',
    format: 'raw',
    boot_order: totalDevices + 1,
  });
};

const removeCdrom = (index) => {
  newVm.value.cdroms.splice(index, 1);
  recalculateBootOrder();
};

const addNetwork = () => {
  newVm.value.networks.push({
    type: 'bridge',
    source: '',
    model: 'virtio',
    mac: '',
  });
};

const removeNetwork = (index) => {
  newVm.value.networks.splice(index, 1);
};

const addHostDevice = () => {
  newVm.value.hostdevices.push({
    address: '',
  });
};

const removeHostDevice = (index) => {
  newVm.value.hostdevices.splice(index, 1);
};

const openFsDialog = (cb, mntPoint = '/') => {
  fsDialogCallback.value = cb;
  fsDialogInitialPath.value = mntPoint;
};

const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialogDisk.value = false;
  fsDialogCdRom.value = false;
};

const addUsbDevice = () => {
  newVm.value.usbdevices.push({
    device: '',
  });
};

const removeUsbDevice = (index) => {
  newVm.value.usbdevices.splice(index, 1);
};

const recalculateBootOrderEdit = () => {
  const allBootableDevices = [...editedVm.value.disks.map((d) => ({ item: d, type: 'disk' })), ...editedVm.value.cdroms.map((c) => ({ item: c, type: 'cdrom' }))];

  allBootableDevices
    .sort((a, b) => (a.item.boot_order || 999) - (b.item.boot_order || 999))
    .forEach((device, index) => {
      device.item.boot_order = index + 1;
    });
};

const addDiskEdit = () => {
  const totalDevices = editedVm.value.disks.length + editedVm.value.cdroms.length;
  const diskIndex = editedVm.value.disks.length;
  const format = 'qcow2';
  const vdiskDir = vmCapabilities.value.vdisk_directory || '/';
  const vmName = editedVm.value.name || 'unnamed';
  const source = `${vdiskDir}/${vmName}/vdisk${diskIndex + 1}.${format}`;

  editedVm.value.disks.push({
    type: 'file',
    source: source,
    size: '',
    format: format,
    boot_order: totalDevices + 1,
  });
};

const removeDiskEdit = (index) => {
  editedVm.value.disks.splice(index, 1);
  recalculateBootOrderEdit();
};

const addCdromEdit = () => {
  const totalDevices = editedVm.value.disks.length + editedVm.value.cdroms.length;
  editedVm.value.cdroms.push({
    bus: 'sata',
    source: '',
    size: '',
    format: 'raw',
    boot_order: totalDevices + 1,
  });
};

const removeCdromEdit = (index) => {
  editedVm.value.cdroms.splice(index, 1);
  recalculateBootOrderEdit();
};

const addNetworkEdit = () => {
  editedVm.value.networks.push({
    type: 'bridge',
    source: '',
    model: 'virtio',
    mac: '',
  });
};

const removeNetworkEdit = (index) => {
  editedVm.value.networks.splice(index, 1);
};

const addHostDeviceEdit = () => {
  editedVm.value.hostdevices.push({
    address: '',
  });
};

const removeHostDeviceEdit = (index) => {
  editedVm.value.hostdevices.splice(index, 1);
};

const addUsbDeviceEdit = () => {
  editedVm.value.usbdevices.push({
    device: '',
  });
};

const removeUsbDeviceEdit = (index) => {
  editedVm.value.usbdevices.splice(index, 1);
};

const createVM = async () => {
  if (!newVm.value.name) {
    showSnackbarError(t('name is required'));
    return;
  }

  if (!newVm.value.machineType) {
    showSnackbarError(t('machine type is required'));
    return;
  }

  if (!newVm.value.biosType) {
    showSnackbarError(t('BIOS type is required'));
    return;
  }

  const payload = {
    name: newVm.value.name,
    icon: newVm.value.icon,
    memory: `${newVm.value.memorySize}G`,
    cpus: newVm.value.selectedCores.length || 1,
    cpuPins: newVm.value.selectedCores,
    platform: newVm.value.machineType,
    bios: newVm.value.biosType,
    disks: newVm.value.disks.map((disk) => ({
      type: disk.bus,
      source: disk.source,
      size: disk.size,
      format: disk.format,
      boot_order: parseInt(disk.boot_order) || 0,
    })),
    cdroms: [
      ...newVm.value.cdroms.map((cdrom) => ({
        source: cdrom.source,
        bus: cdrom.bus,
        boot_order: parseInt(cdrom.boot_order) || 0,
      })),
      ...(newVm.value.virtioIso
        ? [
            {
              source: newVm.value.virtioIso,
              bus: 'sata',
              boot_order: 99,
            },
          ]
        : []),
    ],
    networks: newVm.value.networks,
    graphics: newVm.value.graphics,
    hostdevices: newVm.value.hostdevices,
    usbdevices: newVm.value.usbdevices.map((usb) => {
      const [vendor, product] = usb.device.split(':');
      return {
        vendor: `0x${vendor}`,
        product: `0x${product}`,
      };
    }),
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/vm/machines', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be created')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM created successfully'));
    createVmDialog.value = false;
    await getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const editVM = async () => {
  if (!editedVm.value.name) {
    showSnackbarError(t('name is required'));
    return;
  }

  if (!editedVm.value.machineType) {
    showSnackbarError(t('machine type is required'));
    return;
  }

  if (!editedVm.value.biosType) {
    showSnackbarError(t('BIOS type is required'));
    return;
  }

  const payload = {
    name: editedVm.value.name,
    icon: editedVm.value.icon,
    memory: `${editedVm.value.memorySize}G`,
    cpus: editedVm.value.selectedCores.length || 1,
    cpuPins: editedVm.value.selectedCores,
    platform: editedVm.value.machineType,
    bios: editedVm.value.biosType,
    disks: editedVm.value.disks.map((disk) => ({
      type: disk.bus,
      source: disk.source,
      size: disk.size,
      format: disk.format,
      boot_order: parseInt(disk.boot_order) || 0,
    })),
    cdroms: [
      ...editedVm.value.cdroms.map((cdrom) => ({
        source: cdrom.source,
        bus: cdrom.bus,
        boot_order: parseInt(cdrom.boot_order) || 0,
      })),
      ...(editedVm.value.virtioIso
        ? [
            {
              source: editedVm.value.virtioIso,
              bus: 'sata',
              boot_order: 99,
            },
          ]
        : []),
    ],
    networks: editedVm.value.networks,
    graphics: editedVm.value.graphics,
    hostdevices: editedVm.value.hostdevices,
    usbdevices: editedVm.value.usbdevices.map((usb) => {
      const [vendor, product] = usb.device.split(':');
      return {
        vendor: `0x${vendor}`,
        product: `0x${product}`,
      };
    }),
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/vm/machines/${editedVm.value.name}/config`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('VM could not be edited')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('VM edited successfully'));
    editVmDialog.value = false;
    await getVMs();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const downloadVirtioIso = async () => {
  window.open('/mosSettings/vm', '_blank');
};
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

.icon-picker {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.icon-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-tile:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.icon-tile-selected {
  background-color: rgba(var(--v-theme-primary), 0.12);
  outline: 2px solid rgb(var(--v-theme-primary));
}

.icon-tile-label {
  margin-top: 4px;
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.2;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thumb-bottom :deep(.v-slider-thumb__label-container) {
  top: calc(var(--v-slider-thumb-size) - 4px);
  transform: rotate(180deg);
}

.thumb-bottom :deep(.v-slider-thumb__label > div:first-child) {
  transform: rotate(180deg);
}
</style>
