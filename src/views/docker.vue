<template>
  <v-container fluid class="d-flex justify-center">
    <pull-to-refresh :on-refresh="getAll" class="w-100">
      <v-container style="width: 100%; max-width: 1920px" class="pa-0">
        <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
          <div class="d-flex align-center ga-3 mb-4">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('docker containers') }}</h2>
            <v-spacer />
            <v-text-field v-model="searchTerm" :placeholder="t('search')" density="compact" hide-details clearable class="search-field" prepend-inner-icon="mdi-magnify" />
          </div>
        </v-container>
        <v-container fluid class="pa-0">
          <v-skeleton-loader v-if="dockersLoading" type="card" :width="'100%'" :height="'60px'" class="mb-2" />
          <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
            <v-card-text class="pa-0">
              <v-table class="bg-transparent" style="table-layout: fixed; width: 100%">
                <thead>
                  <tr style="cursor: pointer; background-color: rgba(0, 0, 0, 0.04)">
                    <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                    <th style="width: 350px; padding: 4px 8px; vertical-align: middle">{{ $t('name') }}</th>
                    <th style="width: 42px; padding: 4px 8px; vertical-align: middle">{{ $t('state') }}</th>
                    <th style="width: 150px; padding: 4px 8px; vertical-align: middle">
                      {{ $t('image') }}
                    </th>
                    <th style="width: 200px; padding: 4px 8px; vertical-align: middle">{{ $t('size') }}</th>
                    <th style="width: 250px; padding: 4px 8px; vertical-align: middle">{{ $t('ports') }}</th>
                    <th style="width: 120px; padding: 4px 8px; vertical-align: middle">{{ $t('ip address') }}</th>
                    <th style="width: 120px; padding: 4px 8px; vertical-align: middle">{{ $t('network') }}</th>
                    <th style="width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('autostart') }}</th>
                    <th style="width: 42px; padding: 4px 8px; vertical-align: middle">{{ $t('info') }}</th>
                    <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                  </tr>
                </thead>

                <!-- Docker Groups -->
                <tbody v-if="dockerGroups.length > 0">
                  <template v-for="group in filteredDockerGroups" :key="group.id">
                    <tr :id="group.id" @click.stop="group.expanded = !group.expanded">
                      <td>
                        <v-menu v-model="group.menu">
                          <template #activator="{ props }">
                            <v-img
                              v-if="group.compose && group.icon && group.icon != '' && !group.icon.toLowerCase().includes('mdi')"
                              class="drag-handle-grp"
                              v-bind="props"
                              :src="`/docker_icons/compose/${group.icon}.png`"
                              alt="docker image"
                              width="24"
                              height="24"
                            >
                              <template #error>
                                <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                                  <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                                </v-sheet>
                              </template>
                            </v-img>
                            <v-img
                              v-else-if="!group.compose && group.icon && group.icon != '' && !group.icon.toLowerCase().includes('mdi')"
                              class="drag-handle-grp"
                              v-bind="props"
                              :src="`/docker_icons/groups/${group.icon}`"
                              alt="docker image"
                              width="24"
                              height="24"
                            >
                              <template #error>
                                <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                                  <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                                </v-sheet>
                              </template>
                            </v-img>
                            <v-icon v-else-if="group.icon" class="drag-handle-grp" v-bind="props" color="grey-darken-1">
                              {{ group.icon }}
                            </v-icon>
                            <v-icon v-else-if="group.compose" class="drag-handle-grp" v-bind="props" color="grey-darken-1">mdi-toy-brick</v-icon>
                            <v-icon v-else class="drag-handle-grp" v-bind="props" color="grey-darken-1">mdi-folder</v-icon>
                          </template>

                          <v-list v-if="group.compose">
                            <v-list-item v-if="group.webui && group.runningCount > 0" @click="showComposeWebui(group)">
                              <template #prepend>
                                <v-icon>mdi-web</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('web ui') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="startComposeStack(group.name)">
                              <template #prepend>
                                <v-icon>mdi-play-circle</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('start stack') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="stopComposeStack(group.name)">
                              <template #prepend>
                                <v-icon>mdi-stop-circle</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('stop stack') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="restartComposeStack(group.name)">
                              <template #prepend>
                                <v-icon>mdi-restart</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('restart stack') }}</v-list-item-title>
                            </v-list-item>
                            <v-divider />
                            <v-list-item @click="openEditComposeStackDialog(group.name)">
                              <template #prepend>
                                <v-icon>mdi-text-box-edit</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('edit stack') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openRemoveComposeStackDialog(group.name)">
                              <template #prepend>
                                <v-icon>mdi-delete</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('remove stack') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="pullImagesForComposeStack(group.name)">
                              <template #prepend>
                                <v-icon>mdi-download-multiple</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('pull stack images') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="updateDockerGroupContainers(group, true)">
                              <template #prepend>
                                <v-icon>mdi-update</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('force update stack') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>

                          <v-list v-else>
                            <v-list-item @click="openChangeGroupDialog(group)">
                              <template #prepend>
                                <v-icon>mdi-folder-edit</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('edit group') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openDeleteGroupDialog(group)">
                              <template #prepend>
                                <v-icon>mdi-folder-remove</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('delete group') }}</v-list-item-title>
                            </v-list-item>
                            <v-divider />
                            <v-list-item @click="startDockerGroupContainers(group)">
                              <template #prepend>
                                <v-icon>mdi-play-box-multiple</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('start all') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="stopDockerGroupContainers(group)">
                              <template #prepend>
                                <v-icon>mdi-stop</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('stop all') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="restartDockerGroupContainers(group)">
                              <template #prepend>
                                <v-icon>mdi-restart</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('restart all') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>
                      <td style="overflow: hidden; max-width: 250px">
                        <div class="d-flex align-center" style="min-width: 0; overflow: hidden">
                          <div class="mr-2" style="min-width: 0; overflow: hidden; flex: 1">
                            <div style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                              {{ group.name }}
                            </div>
                            <div class="text-caption" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ group.runningCount }}/{{ group.count }} {{ $t('started') }}</div>
                          </div>
                          <v-chip v-if="group.compose" size="small" style="flex-shrink: 0">{{ $t('compose') }}</v-chip>
                        </div>
                      </td>
                      <td>
                        <v-icon v-if="group.update_available" style="color: red" @click.stop="updateDockerGroupContainers(group)">mdi-autorenew</v-icon>
                        <v-icon v-else style="color: green">mdi-check</v-icon>
                      </td>
                      <td>&nbsp;</td>
                      <td style="padding: 4px 8px; vertical-align: middle">
                        <div class="d-flex align-center ga-1" style="overflow: hidden">
                          <span v-if="group.size_human && !group.compose" class="text-caption" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                            {{ group.size_human }}
                          </span>
                        </div>
                      </td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>
                        <v-switch v-if="group.compose" v-model="group.autostart" color="green" hide-details density="compact" @click.stop @change="switchComposeAutostart(group)" />
                      </td>
                      <td>&nbsp;</td>
                      <td>
                        <v-btn icon density="compact" @click.stop="group.expanded = !group.expanded">
                          <v-icon>{{ group.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                    <tr v-for="containerName in group.expanded ? filteredGroupContainers(group) : []" :key="containerName">
                      <td>
                        <v-menu>
                          <template #activator="{ props }">
                            <v-img v-bind="props" :src="`/docker_icons/${containerName}.png`" alt="docker image" width="24" height="24" style="cursor: pointer">
                              <template #error>
                                <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                                  <v-icon color="grey-darken-1">{{ group.compose ? 'mdi-cube-outline' : 'mdi-image-off' }}</v-icon>
                                </v-sheet>
                              </template>
                            </v-img>
                          </template>

                          <v-list v-if="!group.compose">
                            <v-list-item
                              v-if="checkWebui(dockers.find((d) => d.Names && d.Names[0] === containerName))"
                              @click="showWebui(dockers.find((d) => d.Names && d.Names[0] === containerName))"
                            >
                              <template #prepend>
                                <v-icon>mdi-web</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('web ui') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'running'" @click="openTerminal(containerName)">
                              <template #prepend>
                                <v-icon>mdi-console</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('terminal') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="dockers.find((d) => d.Names && d.Names[0] === containerName).State !== 'running'" @click="startDocker(containerName)">
                              <template #prepend>
                                <v-icon>mdi-play-circle</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item
                              v-if="
                                dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'running' || dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'restarting'
                              "
                              @click="stopDocker(containerName)"
                            >
                              <template #prepend>
                                <v-icon>mdi-stop-circle</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'running'" @click="restartDocker(containerName)">
                              <template #prepend>
                                <v-icon>mdi-restart</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item
                              v-if="
                                dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'running' || dockers.find((d) => d.Names && d.Names[0] === containerName).State === 'restarting'
                              "
                              @click="killDocker(containerName)"
                            >
                              <template #prepend>
                                <v-icon>mdi-close-octagon</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item :to="`/docker/change/${containerName}`">
                              <template #prepend>
                                <v-icon>mdi-text-box-edit</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                            </v-list-item>
                            <v-divider />
                            <v-list-item @click="openTerminalLogs(containerName)">
                              <template #prepend>
                                <v-icon>mdi-math-log</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('logs') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="mosDockers.find((item) => item.name === containerName && item.update_available)" @click="updateDocker(containerName)">
                              <template #prepend>
                                <v-icon>mdi-update</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('update') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="!mosDockers.find((item) => item.name === containerName && item.update_available)" @click="updateDocker(containerName, true)">
                              <template #prepend>
                                <v-icon>mdi-chevron-up-circle</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('force update') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openDeleteDialog(dockers.find((d) => d.Names && d.Names[0] === containerName))">
                              <template #prepend>
                                <v-icon>mdi-delete</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>

                          <v-list v-else>
                            <v-list-item @click="openTerminalLogs(containerName)">
                              <template #prepend>
                                <v-icon>mdi-math-log</v-icon>
                              </template>
                              <v-list-item-title>{{ $t('logs') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>

                      <td style="overflow: hidden; max-width: 250px">
                        <div class="d-flex align-center" style="min-width: 0; overflow: hidden">
                          <div class="mr-2" style="min-width: 0; overflow: hidden; flex: 1">
                            <div style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ containerName }}</div>
                            <div
                              class="text-caption"
                              :style="{
                                color: dockers.find((d) => d.Names && d.Names[0] === containerName)?.State === 'running' ? 'green' : 'red',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }"
                            >
                              {{ dockers.find((d) => d.Names && d.Names[0] === containerName)?.State }}
                            </div>
                          </div>
                          <v-chip v-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.privileged" size="small" style="flex-shrink: 0">{{ $t('privileged') }}</v-chip>
                        </div>
                      </td>

                      <td>
                        <template v-if="!group.compose">
                          <v-icon v-if="mosDockers && mosDockers.find((item) => item.name === containerName && item.update_available)" style="color: red" @click="updateDocker(containerName)">
                            mdi-autorenew
                          </v-icon>
                          <v-icon v-else style="color: green">mdi-check</v-icon>
                        </template>
                      </td>

                      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                        {{ dockers.find((d) => d.Names && d.Names[0] === containerName)?.Image }}
                      </td>

                      <td style="padding: 4px 8px; vertical-align: middle">
                        <div class="d-flex align-center ga-1" style="overflow: hidden">
                          <span
                            v-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.size_human"
                            class="text-caption"
                            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                          >
                            {{ dockers.find((d) => d.Names && d.Names[0] === containerName)?.size_human }}
                          </span>
                          <v-btn variant="text" icon size="x-small" @click.stop="calculateContainerSize(containerName)" :title="$t('calculate directory size')" color="primary">
                            <v-icon size="16">mdi-calculator</v-icon>
                          </v-btn>
                        </div>
                      </td>

                      <td>
                        <template
                          v-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.Ports && dockers.find((d) => d.Names && d.Names[0] === containerName)?.Ports.some((p) => p.PublicPort)"
                        >
                          <div>
                            <div
                              class="text-body-2"
                              v-html="getPortMappings(dockers.find((d) => d.Names && d.Names[0] === containerName))"
                              :style="{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: (dockers.find((d) => d.Names && d.Names[0] === containerName) ? dockers.find((d) => d.Names && d.Names[0] === containerName)._portsExpanded : false)
                                  ? 'normal'
                                  : 'nowrap',
                              }"
                            />
                            <div
                              v-if="
                                (dockers.find((d) => d.Names && d.Names[0] === containerName)?.Ports || [])
                                  .filter((p) => p.PublicPort)
                                  .filter((p, i, self) => i === self.findIndex((x) => x.PrivatePort === p.PrivatePort)).length > 2
                              "
                              class="mt-0"
                            >
                              <v-icon
                                @click.stop="
                                  (function () {
                                    const _d = dockers.find((d) => d.Names && d.Names[0] === containerName);
                                    if (_d) _d._portsExpanded = !_d._portsExpanded;
                                  })()
                                "
                                :title="
                                  dockers.find((d) => d.Names && d.Names[0] === containerName)
                                    ? dockers.find((d) => d.Names && d.Names[0] === containerName)._portsExpanded
                                      ? $t('collapse')
                                      : $t('expand')
                                    : $t('expand')
                                "
                                color="grey-darken-1"
                                style="cursor: pointer; transition: transform 0.18s"
                                :style="{
                                  transform: dockers.find((d) => d.Names && d.Names[0] === containerName)
                                    ? dockers.find((d) => d.Names && d.Names[0] === containerName)._portsExpanded
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)'
                                    : 'rotate(0deg)',
                                }"
                              >
                                mdi-chevron-down
                              </v-icon>
                            </div>
                          </div>
                        </template>
                      </td>

                      <td>
                        <template v-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.HostConfig.NetworkMode === 'bridge'">
                          {{
                            getContainerIPAddress(
                              dockers.find((d) => d.Names && d.Names[0] === containerName),
                              'none',
                            )
                          }}
                        </template>
                        <template v-else-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.HostConfig.NetworkMode === 'host'">
                          {{
                            getContainerIPAddress(
                              dockers.find((d) => d.Names && d.Names[0] === containerName),
                              'none',
                            )
                          }}
                        </template>
                        <template v-else>
                          {{
                            getContainerIPAddress(
                              dockers.find((d) => d.Names && d.Names[0] === containerName),
                              'none',
                            )
                          }}
                        </template>
                      </td>

                      <td>
                        <template v-if="!dockers.find((d) => d.Names && d.Names[0] === containerName)?.HostConfig.NetworkMode.startsWith('container:')">
                          {{ dockers.find((d) => d.Names && d.Names[0] === containerName)?.HostConfig.NetworkMode }}
                        </template>
                        <template v-else>
                          {{ getContainerNameFromNetworkmode(dockers.find((d) => d.Names && d.Names[0] === containerName)?.HostConfig.NetworkMode) }}
                        </template>
                      </td>

                      <td>
                        <v-switch
                          v-if="!group.compose"
                          :model-value="dockers.find((d) => d.Names && d.Names[0] === containerName)?.autostart ?? false"
                          color="green"
                          hide-details
                          density="compact"
                          @update:model-value="
                            (val) => {
                              const d = dockers.find((x) => x.Names && x.Names[0] === containerName);
                              if (d) {
                                d.autostart = val;
                                switchAutostart(d);
                              }
                            }
                          "
                        />
                      </td>

                      <td>
                        <v-icon class="drag-handle" @click="openInfoDialog(dockers.find((d) => d.Names && d.Names[0] === containerName))" color="grey-darken-1">mdi-information-outline</v-icon>
                      </td>

                      <td></td>
                    </tr>
                  </template>
                </tbody>

                <!-- Separator Row -->
                <tr v-if="filteredDockerGroups.length > 0 && filteredUngroupedDockers.length > 0">
                  <td colspan="11" class="pa-0">
                    <div
                      :style="{
                        width: '100%',
                        margin: '0',
                        boxSizing: 'border-box',
                        borderTop: $vuetify && $vuetify.theme && $vuetify.theme.name === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.12)',
                      }"
                    />
                  </td>
                </tr>

                <!-- Ungrouped Docker Containers -->
                <draggable v-if="filteredUngroupedDockers.length > 0" tag="tbody" v-model="dockers" item-key="Id" handle=".drag-handle" @end="onDragEnd()">
                  <template #item="{ element: docker }">
                    <tr v-if="filteredUngroupedDockers.includes(docker)" :id="docker.Id">
                      <td>
                        <v-menu>
                          <template #activator="{ props }">
                            <v-img
                              v-if="docker.Names && docker.Names.length"
                              v-bind="props"
                              :src="`/docker_icons/${docker.Names[0]}.png`"
                              alt="docker image"
                              width="24"
                              height="24"
                              style="cursor: pointer"
                            >
                              <template #error>
                                <v-sheet class="d-flex align-center justify-center" height="100%" width="100%">
                                  <v-icon color="grey-darken-1">mdi-image-off</v-icon>
                                </v-sheet>
                              </template>
                            </v-img>
                          </template>
                          <v-list>
                            <v-list-item v-if="checkWebui(docker)" @click="showWebui(docker)">
                              <v-list-item-title>{{ $t('web ui') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="docker.State === 'running'" @click="openTerminal(docker.Names[0])">
                              <v-list-item-title>{{ $t('terminal') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="docker.State !== 'running'" @click="startDocker(docker.Names[0])">
                              <v-list-item-title>{{ $t('start') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="docker.State === 'running' || docker.State === 'restarting'" @click="stopDocker(docker.Names[0])">
                              <v-list-item-title>{{ $t('stop') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="docker.State === 'running' || docker.State === 'restarting'" @click="restartDocker(docker.Names[0])">
                              <v-list-item-title>{{ $t('restart') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="docker.State === 'running' || docker.State === 'restarting'" @click="killDocker(docker.Names[0])">
                              <v-list-item-title>{{ $t('kill') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item :to="`/docker/change/${docker.Names[0]}`">
                              <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                            </v-list-item>
                            <v-divider />
                            <v-list-item @click="openTerminalLogs(docker.Names[0])">
                              <v-list-item-title>{{ $t('logs') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="mosDockers.find((item) => item.name === docker.Names[0] && item.update_available)" @click="updateDocker(docker.Names[0])">
                              <v-list-item-title>{{ $t('update') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="!mosDockers.find((item) => item.name === docker.Names[0] && item.update_available)" @click="updateDocker(docker.Names[0], true)">
                              <v-list-item-title>{{ $t('force update') }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openDeleteDialog(docker)">
                              <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>
                      <td style="overflow: hidden; max-width: 250px">
                        <div class="d-flex align-center" style="min-width: 0; overflow: hidden">
                          <div class="mr-2" style="min-width: 0; overflow: hidden; flex: 1">
                            <div style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                              {{ docker.Names[0] }}
                            </div>
                            <div class="text-caption" :style="{ color: docker.State === 'running' ? 'green' : 'red', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">
                              {{ docker.State }}
                            </div>
                          </div>
                          <v-chip v-if="docker.privileged" size="small" style="flex-shrink: 0">{{ $t('privileged') }}</v-chip>
                        </div>
                      </td>
                      <td>
                        <v-icon v-if="mosDockers && mosDockers.find((item) => item.name === docker.Names[0] && item.update_available)" style="color: red" @click="updateDocker(docker.Names[0])">
                          mdi-autorenew
                        </v-icon>
                        <v-icon v-else style="color: green">mdi-check</v-icon>
                      </td>
                      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ docker.Image }}</td>
                      <td style="padding: 4px 8px; vertical-align: middle">
                        <div class="d-flex align-center ga-1" style="overflow: hidden">
                          <span v-if="docker.size_human" class="text-caption" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                            {{ docker.size_human }}
                          </span>
                          <v-btn variant="text" icon size="x-small" @click.stop="calculateContainerSize(docker.Names[0])" :title="$t('calculate directory size')" color="primary">
                            <v-icon size="16">mdi-calculator</v-icon>
                          </v-btn>
                        </div>
                      </td>
                      <td>
                        <template v-if="docker.Ports && docker.Ports.some((p) => p.PublicPort)">
                          <div>
                            <div
                              class="text-body-2"
                              v-html="getPortMappings(docker)"
                              :style="{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: docker._portsExpanded ? 'normal' : 'nowrap' }"
                            />
                            <div v-if="(docker.Ports || []).filter((p) => p.PublicPort).filter((p, i, self) => i === self.findIndex((x) => x.PrivatePort === p.PrivatePort)).length > 2" class="mt-0">
                              <v-icon
                                @click.stop="docker._portsExpanded = !docker._portsExpanded"
                                :title="docker._portsExpanded ? $t('collapse') : $t('expand')"
                                color="grey-darken-1"
                                style="cursor: pointer; transition: transform 0.18s"
                                :style="{ transform: docker._portsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
                              >
                                mdi-chevron-down
                              </v-icon>
                            </div>
                          </div>
                        </template>
                      </td>
                      <td>
                        <template v-if="docker.HostConfig.NetworkMode === 'bridge'">
                          {{ getContainerIPAddress(docker, '-') }}
                        </template>
                        <template v-else-if="docker.HostConfig.NetworkMode === 'host'">
                          {{ getContainerIPAddress(docker, '-') }}
                        </template>
                        <template v-else>
                          {{ getContainerIPAddress(docker, '-') }}
                          <span v-if="getFirstNetwork(docker)?.GlobalIPv6Address">
                            <br />
                            {{ getFirstNetwork(docker)?.GlobalIPv6Address }}
                          </span>
                        </template>
                      </td>
                      <td>
                        <template v-if="!docker.HostConfig.NetworkMode.startsWith('container:')">
                          {{ docker.HostConfig.NetworkMode }}
                        </template>
                        <template v-else>
                          {{ getContainerNameFromNetworkmode(docker.HostConfig.NetworkMode) }}
                        </template>
                      </td>
                      <td>
                        <v-switch v-model="docker.autostart" color="green" hide-details density="compact" @change="switchAutostart(docker)" />
                      </td>
                      <td>
                        <v-icon class="drag-handle" @click="openInfoDialog(docker)" color="grey-darken-1">mdi-information-outline</v-icon>
                      </td>
                      <td></td>
                    </tr>
                  </template>
                </draggable>
              </v-table>
            </v-card-text>
          </v-card>
        </v-container>
      </v-container>
    </pull-to-refresh>
  </v-container>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6" v-if="deleteDialog.docker">{{ $t('delete') }} {{ deleteDialog.docker.Names[0] }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this docker container?') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="removeDocker(deleteDialog.docker.Names[0])">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Group Dialog -->
  <v-dialog v-model="createGroupDialog.value" max-width="600">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('create docker group') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="createGroupDialog.name" :label="$t('group name')" required></v-text-field>
        <v-text-field v-model="createGroupDialog.icon" :label="$t('icon')"></v-text-field>
        <v-select v-model="createGroupDialog.containers" :items="dockers.map((d) => d.Names[0])" :label="$t('select containers')" multiple chips></v-select>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="clearCreateGroupDialog()">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createDockerGroup()">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change Group Dialog -->
  <v-dialog v-model="changeGroupDialog.value" max-width="600">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('edit docker group') }} - {{ changeGroupDialog.name }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="changeGroupDialog.name" :label="$t('group name')" required></v-text-field>
        <v-text-field v-model="changeGroupDialog.icon" :label="$t('icon')"></v-text-field>
        <v-combobox v-model="changeGroupDialog.containers" :items="dockers.map((d) => d.Names[0])" :label="$t('select containers')" multiple chips clearable></v-combobox>
        <draggable v-model="changeGroupDialog.containers" class="d-flex flex-wrap mt-2" :component="'div'">
          <template #item="{ element, index }">
            <v-chip class="ma-1" closable @click:close="changeGroupDialog.containers.splice(index, 1)">
              <v-icon left class="drag-handle" style="cursor: grab" color="grey-darken-1">mdi-drag</v-icon>
              {{ element }}
            </v-chip>
          </template>
        </draggable>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="clearChangeGroupDialog()">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="updateDockerGroup()">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Group Dialog -->
  <v-dialog v-model="deleteGroupDialog.value" max-width="500">
    <v-card class="pa-0">
      <v-card-title class="text-h6" v-if="deleteGroupDialog.group">{{ $t('delete') }} - {{ deleteGroupDialog.group.name }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to delete this docker group?') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteGroupDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="deleteDockerGroup()">
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unused Images Dialog -->
  <v-dialog v-model="unusedImagesDialog.value" max-width="600">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('unused docker images') }}</v-card-title>
      <v-card-text>
        <div v-if="unusedImages.length === 0">{{ $t('no unused images found') }}</div>
        <v-list v-else>
          <template v-for="(image, index) in unusedImages" :key="index">
            <v-list-item>
              <v-list-item-title>{{ image.repository }}</v-list-item-title>
              <v-list-item-subtitle>{{ image.tag }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn variant="text" icon color="red" @click="removeUnusedImage(image.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="index < unusedImages.length - 1" />
          </template>
        </v-list>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" text @click="unusedImagesDialog.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- WebSocket Operation Dialog -->
  <v-dialog v-model="wsOperationDialog.value" max-width="800" persistent>
    <v-card>
      <v-card-text class="pa-1">
        <div
          ref="wsScrollContainer"
          :style="{
            flexGrow: 1,
            height: 'calc(100vh - 340px)',
            overflow: 'auto',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            border: '1px solid ' + ($vuetify.theme && $vuetify.theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'),
            borderRadius: '4px',
            backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#121212' : '#fafafa',
            color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
          }"
        >
          <div
            v-for="(line, index) in wsOperationDialog.data"
            :key="index"
            :style="{
              paddingLeft: '4px',
              paddingRight: '4px',
              whiteSpace: 'pre-wrap',
              backgroundColor: $vuetify.theme && $vuetify.theme.name == 'dark' ? 'transparent' : '#fafafa',
              color: $vuetify.theme && $vuetify.theme.name == 'dark' ? '#e0e0e0' : '#111',
            }"
          >
            <small>{{ line.output }}</small>
          </div>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-progress-circular v-if="wsOperationDialog.loading" color="primary" class="ma-0" indeterminate />
        <v-spacer />
        <v-btn color="onPrimary" text @click="closeWsDialog()">
          {{ $t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!--Docker Compose Edit Dialog -->
  <v-dialog v-model="editComposeStackDialog.value" max-width="800">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('edit docker compose stack') }} - {{ editComposeStackDialog.name }}</v-card-title>
      <v-card-text class="pa-0">
        <div style="max-height: 60vh; overflow-y: auto; padding: 16px; padding-bottom: 32px">
          <v-text-field v-model="editComposeStackDialog.name" :label="$t('stack name')" readonly></v-text-field>
          <div class="mb-4">
            <v-label class="text-body2" style="display: block">{{ $t('compose yaml') }}</v-label>
            <div ref="editDialogYamlEditorContainer" style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden"></div>
          </div>
          <div class="mb-4 mt-4">
            <v-label class="text-body2" style="display: block">{{ $t('environment variables') }}</v-label>
            <div ref="editDialogEnvEditorContainer" style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px; overflow: hidden"></div>
          </div>
          <v-text-field v-model="editComposeStackDialog.icon" :label="$t('icon url')" class="mt-4"></v-text-field>
          <v-text-field v-model="editComposeStackDialog.webui" :label="$t('web ui url')"></v-text-field>
          <v-switch :label="$t('no autoupdate')" v-model="editComposeStackDialog.no_autoupdate" inset color="green" density="compact" hide-details="auto"></v-switch>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="editComposeStackDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="editComposeStack()">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!--Docker Compose Remove Dialog -->
  <v-dialog v-model="removeComposeStackDialog.value" max-width="500" persistent>
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('remove docker compose stack') }} - {{ removeComposeStackDialog.name }}</v-card-title>
      <v-card-text>
        {{ $t('are you sure you want to remove this docker compose stack? all containers in this stack will be removed.') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="removeComposeStackDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="removeComposeStack(removeComposeStackDialog.name)">
          {{ $t('remove') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Docker Waittime Dialog -->
  <v-dialog v-model="dockerWaitTimesDialog.value" persistent width="600">
    <v-card max-height="80vh" style="display: flex; flex-direction: column" class="pa-0">
      <v-card-title class="text-h6 pb-0">{{ $t('sort / wait times') }}</v-card-title>
      <v-card-text style="overflow: auto; flex: 1; padding-bottom: 0" class="px-1 pt-1">
        <span class="pl-3 text-title-medium font-weight-medium">{{ $t('groups') }}</span>
        <draggable v-model="dockerGroups" item-key="id" handle=".drag-handle" style="line-height: 1.5">
          <template #item="{ element: d }">
            <v-row :key="d.id" class="d-flex align-center pa-0 ma-0 ml-2">
              <v-col cols="8" class="pa-0 ma-0 mb-1 d-flex align-center">
                <v-icon class="drag-handle" color="grey-darken-1" style="cursor: grab; margin-right: 8px">mdi-drag</v-icon>
                <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ d.name }}</div>
              </v-col>
              <v-col cols="4" class="px-2 py-0 ma-0 mb-2">
                <v-text-field density="compact" hide-details="auto" readonly tabindex="-1" style="visibility: hidden; height: 40px" />
              </v-col>
            </v-row>
          </template>
        </draggable>
        <span class="pl-3 text-title-medium font-weight-medium">{{ $t('containers') }}</span>
        <draggable v-model="dockers" item-key="Id" handle=".drag-handle" @end="sortDockerIndex()">
          <template #item="{ element: d }">
            <v-row :key="d.Id" class="d-flex align-center pa-0 ma-0 ml-2">
              <v-col cols="9" class="pa-0 ma-0 mb-1 d-flex align-center">
                <v-icon class="drag-handle" color="grey-darken-1" style="cursor: grab; margin-right: 8px">mdi-drag</v-icon>
                <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ d.Names?.[0] }}</div>
              </v-col>
              <v-col cols="3" class="px-2 py-0 ma-0 mb-2">
                <v-text-field density="compact" hide-details="auto" type="number" min="0" max="999" maxlength="3" v-model="d.wait" :label="$t('wait (sec)')" />
              </v-col>
            </v-row>
          </template>
        </draggable>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          color="onPrimary"
          @click="
            dockerWaitTimesDialog.value = false;
            getDockers();
            getDockerGroups();
          "
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          text
          color="onPrimary"
          @click="
            updateDockerWaitTimes();
            setGroupOrder();
          "
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button with Menu -->
  <v-menu location="top">
    <template v-slot:activator="{ props }">
      <v-fab v-bind="props" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
        <v-icon color="onPrimary">mdi-dots-vertical</v-icon>
      </v-fab>
    </template>
    <v-list>
      <v-list-item to="/docker/create">
        <template v-slot:prepend>
          <v-icon>mdi-docker</v-icon>
        </template>
        <v-list-item-title>{{ $t('create docker container') }}</v-list-item-title>
      </v-list-item>
      <v-list-item to="/docker/compose">
        <template v-slot:prepend>
          <v-icon>mdi-toy-brick-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create compose stack') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openCreateGroupDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-folder-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('create docker group') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="dockerWaitTimesDialog.value = true">
        <template v-slot:prepend>
          <v-icon>mdi-timer-sand</v-icon>
        </template>
        <v-list-item-title>{{ $t('sort / wait times') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openUnusedImagesDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-image-off</v-icon>
        </template>
        <v-list-item-title>{{ $t('unused docker images') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="checkForUpdates()">
        <template v-slot:prepend>
          <v-icon>mdi-update</v-icon>
        </template>
        <v-list-item-title>{{ $t('check for updates') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="updateAll()">
        <template v-slot:prepend>
          <v-icon>mdi-refresh</v-icon>
        </template>
        <v-list-item-title>{{ $t('update all') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <DockerInfoDialog v-model="infoDialog.value" :docker="infoDialog.docker" />
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue';
import draggable from 'vuedraggable';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useApi } from '@/composables/useApi';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { openTerminalPopup } from '@/composables/terminalpopup';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import DockerInfoDialog from '@/components/dockerInfoDialog.vue';
import PullToRefresh from '@/components/pullToRefresh.vue';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const theme = useTheme();
const { call } = useApi();
const dockers = ref([]);
const dockerGroups = ref([]);
const mosDockers = ref([]);
const composeStacks = ref([]);
const unusedImages = ref([]);
const dockerWaitTimesDialog = reactive({
  value: false,
});
const deleteDialog = reactive({
  value: false,
  docker: null,
});
const infoDialog = reactive({ value: false, docker: null });
const createGroupDialog = reactive({
  value: false,
  name: '',
  icon: '',
  containers: [],
});
const changeGroupDialog = reactive({
  value: false,
  group: null,
  name: '',
  icon: '',
  containers: [],
});
const deleteGroupDialog = reactive({
  value: false,
  group: null,
});
const unusedImagesDialog = reactive({
  value: false,
  images: [],
});
const dockersLoading = ref(true);
const { wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {
    await getAll();
  },
});
const editComposeStackDialog = reactive({
  value: false,
  name: '',
  yaml: '',
  env: '',
  icon: '',
  webui: '',
  no_autoupdate: false,
});
const editDialogYamlEditorContainer = ref(null);
const editDialogEnvEditorContainer = ref(null);
let editDialogYamlEditor = null;
let editDialogEnvEditor = null;
const removeComposeStackDialog = reactive({
  value: false,
  name: '',
});
const searchTerm = ref('');

const filteredDockerGroups = computed(() => {
  const term = (searchTerm.value || '').trim().toLowerCase();
  if (!term) return dockerGroups.value;
  return dockerGroups.value.filter((group) => {
    if (group.name && group.name.toLowerCase().includes(term)) return true;
    return (group.containers || []).some((containerName) => containerName.toLowerCase().includes(term));
  });
});

const filteredUngroupedDockers = computed(() => {
  const ungrouped = dockers.value.filter((d) => !dockerGroups.value.some((g) => g.containers && g.containers.includes(d.Names?.[0])));
  const term = (searchTerm.value || '').trim().toLowerCase();
  if (!term) return ungrouped;
  return ungrouped.filter((docker) => docker.Names && docker.Names[0] && docker.Names[0].toLowerCase().includes(term));
});

onMounted(async () => {
  await getAll();
});

watch(searchTerm, (newTerm) => {
  if (newTerm && newTerm.trim()) {
    dockerGroups.value.forEach((g) => (g.expanded = true));
  }
});

const getAll = async () => {
  dockersLoading.value = true;
  await Promise.all([getDockers(), getComposeStacks()]);
  await getDockerGroups();
  dockersLoading.value = false;
};

const filteredGroupContainers = (group) => {
  const term = (searchTerm.value || '').trim().toLowerCase();
  if (!term) return group.containers || [];
  return (group.containers || []).filter((containerName) => containerName.toLowerCase().includes(term));
};

const getDockers = async () => {
  const [result, mosResult] = await Promise.all([
    call('/api/v1/docker/containers/json?all=true', {
      method: 'GET',
      errorLabel: t('docker containers could not be loaded'),
      showOverlay: false,
    }),
    call('/api/v1/docker/mos/containers', {
      method: 'GET',
      errorLabel: t('docker containers could not be loaded'),
      showOverlay: false,
    }),
  ]);

  if (!result || !mosResult) {
    return;
  }

  result.forEach((docker) => {
    if (docker.Names && Array.isArray(docker.Names)) {
      docker.Names = docker.Names.map((name) => (name.startsWith('/') ? name.slice(1) : name));
    }
    docker.showInfo = false;
    docker.webui = '';
  });

  if (Array.isArray(mosResult)) {
    result.sort((a, b) => {
      const objA = mosResult.find((item) => item.name === a.Names[0]);
      const objB = mosResult.find((item) => item.name === b.Names[0]);
      const idxA = objA ? objA.index : Number.MAX_SAFE_INTEGER;
      const idxB = objB ? objB.index : Number.MAX_SAFE_INTEGER;

      return idxA - idxB;
    });
  }

  result.forEach((docker) => {
    const mos = mosResult.find((item) => item.name === docker.Names[0]);
    docker.autostart = mos ? mos.autostart : false;
    docker.wait = mos ? mos.wait : 0;
    docker.index = mos ? mos.index : Number.MAX_SAFE_INTEGER;
    docker.default_shell = mos ? mos.default_shell : '/bin/sh';

    if (docker.NetworkSettings && docker.NetworkSettings.Networks) {
      const networkMode = docker.HostConfig?.NetworkMode || '';
      const networkSettings = docker.NetworkSettings.Networks[networkMode];
      if (networkSettings && networkSettings.IPAMConfig) {
        if (networkSettings.IPAMConfig.IPv4Address) {
          docker.custom_ip = networkSettings.IPAMConfig.IPv4Address;
        } else if (networkSettings.IPAMConfig.IPv6Address) {
          docker.custom_ip = `[${networkSettings.IPAMConfig.IPv6Address}]`;
        } else {
          docker.custom_ip = mos ? mos.custom_ip : '';
        }
      } else {
        docker.custom_ip = mos ? mos.custom_ip : '';
      }
    } else {
      docker.custom_ip = mos ? mos.custom_ip : '';
    }
  });

  dockers.value = result;
  mosDockers.value = mosResult;
};

const getComposeStacks = async () => {
  const result = await call('/api/v1/docker/mos/compose/stacks', {
    method: 'GET',
    errorLabel: t('compose stacks could not be loaded'),
    showOverlay: false,
  });
  composeStacks.value = result || [];
};

const getDockerGroups = async () => {
  const result = await call('/api/v1/docker/mos/groups', {
    method: 'GET',
    errorLabel: t('docker groups could not be loaded'),
    showOverlay: false,
  });

  if (!result) {
    return;
  }

  const newGroups = result || [];

  dockerGroups.value = newGroups.map((group) => {
    const old = dockerGroups.value.find((g) => g.id === group.id);
    const composeStack = group.compose ? composeStacks.value.find((s) => s.name === group.name) : null;
    const runningCount = (group.containers || []).filter((name) => {
      const d = dockers.value.find((d) => d.Names && d.Names[0] === name);
      return d && d.State === 'running';
    }).length;
    return {
      ...group,
      expanded: old ? old.expanded : false,
      webui: composeStack?.webui || group.webui || null,
      autostart: composeStack?.autostart ?? false,
      runningCount,
    };
  });
};

const stopDocker = async (name) => {
  try {
    await call(`/api/v1/docker/containers/${name}/stop`, {
      method: 'POST',
      errorLabel: t('docker container could not be stopped'),
      successLabel: t('docker container stopped successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const startDocker = async (name) => {
  try {
    await call(`/api/v1/docker/containers/${name}/start`, {
      method: 'POST',
      errorLabel: t('docker container could not be started'),
      successLabel: t('docker container started successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const restartDocker = async (name) => {
  try {
    await call(`/api/v1/docker/containers/${name}/restart`, {
      method: 'POST',
      body: { name: name },
      errorLabel: t('docker container could not be restarted'),
      successLabel: t('docker container restarted successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const killDocker = async (name) => {
  try {
    await call(`/api/v1/docker/containers/${name}/kill`, {
      method: 'POST',
      errorLabel: t('docker container could not be stopped'),
      successLabel: t('docker container stopped successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const removeDocker = async (name) => {
  try {
    await call(`/api/v1/docker/mos/remove`, {
      method: 'DELETE',
      body: { name: name },
      errorLabel: t('docker container could not be removed'),
      successLabel: t('docker container removed successfully'),
    });
    await getDockers();
    await getDockerGroups();
    clearDeleteDialog();
    deleteDialog.value = false;
  } catch (e) {}
};

const updateDocker = async (name, force_update = false) => {
  const updateBody = force_update ? { name: name, force_update: true } : { name: name };
  sendDockerWSCommand('upgrade', updateBody);
};

const checkForUpdates = async () => {
  sendDockerWSCommand('check-updates');
};

const updateAll = async () => {
  sendDockerWSCommand('upgrade');
};

const switchAutostart = async (docker) => {
  const autostart = [{ name: docker.Names[0], autostart: docker.autostart }];
  await call(`/api/v1/docker/mos/containers`, {
    method: 'POST',
    body: autostart,
    errorLabel: t('autostart setting could not be saved'),
    successLabel: t('autostart setting saved successfully'),
  });
};

const switchComposeAutostart = async (group) => {
  await call(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(group.name)}`, {
    method: 'PATCH',
    body: { autostart: group.autostart },
    errorLabel: t('autostart setting could not be saved'),
    successLabel: t('autostart setting saved successfully'),
  });
};

const setGroupOrder = async () => {
  const newOrder = dockerGroups.value.map((group, idx) => ({
    id: group.id,
    index: idx + 1,
  }));

  await call('/api/v1/docker/mos/groups/order', {
    method: 'PUT',
    body: newOrder,
    errorLabel: t('docker group order could not be saved'),
    successLabel: t('docker group order saved successfully'),
    showOverlay: false,
  });
};

const onDragEnd = async () => {
  const newOrder = dockers.value.map((docker, idx) => ({
    name: docker.Names[0],
    index: idx + 1,
    wait: docker.wait,
    autostart: docker.autostart,
  }));

  await call('/api/v1/docker/mos/containers', {
    method: 'POST',
    body: newOrder,
    errorLabel: t('docker container order could not be saved'),
    successLabel: t('docker container order saved successfully'),
    showOverlay: false,
  });
};

const checkWebui = (docker) => {
  if (docker.State === 'running' && docker.Labels && docker.Labels['mos.webui'] !== undefined) {
    let webui = docker.Labels['mos.webui'];
    const portMatch = webui.match(/PORT:(\d+)/);
    if (portMatch && Array.isArray(docker.Ports)) {
      const portObj = docker.Ports.find((port) => port.PrivatePort === Number(portMatch[1]));
      if (portObj) {
        const port = portObj.PublicPort ? portObj.PublicPort : portObj.PrivatePort;
        webui = webui.replace(/\[PORT:\d+\]/g, port);
      } else {
        webui = webui.replace(/\[PORT:\d+\]/g, portMatch[1]);
      }
    }
    const addressMatch = webui.match(/\[ADDRESS\]/g);
    if (addressMatch) {
      const address = docker.custom_ip && docker.custom_ip.trim() ? docker.custom_ip : window.location.hostname;
      webui = webui.replace(/\[ADDRESS\]/g, address);
    }
    docker.webui = webui;
    return true;
  }
  return false;
};

const openTerminal = async (dockerName) => {
  const docker = dockers.value.find((d) => d.Names && d.Names[0] === dockerName);
  const shell = docker ? docker.default_shell : null;
  const sessionId = await createDockerTerminalSession(dockerName, shell);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create terminal session'));
  }
};

const openTerminalLogs = async (dockerName) => {
  const sessionId = await createLogsTerminalSession(dockerName);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create logs terminal session'));
  }
};

const createDockerTerminalSession = async (dockerName, shell) => {
  const result = await call('/api/v1/terminal/create', {
    method: 'POST',
    body: { command: 'docker', args: ['exec', '-it', dockerName, shell], width: 900, height: 420 },
    errorLabel: t('failed to create terminal session'),
    showOverlay: false,
  });
  return result?.sessionId || null;
};

const createLogsTerminalSession = async (dockerName) => {
  const existingSessionId = await checkExistingTerminal('docker', 'logs', dockerName);
  if (existingSessionId) {
    return existingSessionId;
  }

  const result = await call('/api/v1/terminal/create', {
    method: 'POST',
    body: { command: 'docker', args: ['logs', '-f', '--tail', '100', dockerName], readonlyOnly: true, width: 900, height: 420 },
    errorLabel: t('failed to create terminal log session'),
    showOverlay: false,
  });
  return result?.sessionId || null;
};

const checkExistingTerminal = async (command, arg, dockerName) => {
  const result = await call(`/api/v1/terminal/sessions`, {
    method: 'GET',
    errorLabel: t('failed to retrieve terminal sessions'),
    showOverlay: false,
  });

  if (!result) {
    return null;
  }

  const sessions = result.sessions || [];
  const session = sessions.filter((session) => session.command === command && Array.isArray(session.args) && session.args.includes(dockerName) && session.args.includes(arg));
  if (session.length > 0) {
    return session[0].sessionId;
  }
  return null;
};

const createDockerGroup = async () => {
  if (!createGroupDialog.name || createGroupDialog.name.trim() === '') {
    showSnackbarError(t('group name is required'));
    return;
  }
  if (!createGroupDialog.containers || createGroupDialog.containers.length === 0) {
    showSnackbarError(t('at least one container must be selected'));
    return;
  }

  const newGroup = {
    name: createGroupDialog.name.trim(),
    icon: createGroupDialog.icon.trim(),
    containers: createGroupDialog.containers,
  };

  try {
    await call('/api/v1/docker/mos/groups', {
      method: 'POST',
      body: newGroup,
      errorLabel: t('docker group could not be created'),
      successLabel: t('docker group created successfully'),
    });
    await getDockerGroups();
    clearCreateGroupDialog();
  } catch (e) {}
};

const deleteDockerGroup = async () => {
  if (!deleteGroupDialog.group) {
    showSnackbarError(t('no group selected'));
    return;
  }

  try {
    await call(`/api/v1/docker/mos/groups/${encodeURIComponent(deleteGroupDialog.group.id)}`, {
      method: 'DELETE',
      errorLabel: t('docker group could not be deleted'),
      successLabel: t('docker group deleted successfully'),
    });
    await getDockerGroups();
    clearDeleteGroupDialog();
  } catch (e) {}
};

const updateDockerGroup = async () => {
  if (!changeGroupDialog.group) {
    showSnackbarError(t('no group selected'));
    return;
  }
  if (!changeGroupDialog.name || changeGroupDialog.name.trim() === '') {
    showSnackbarError(t('group name is required'));
    return;
  }
  if (!changeGroupDialog.containers || changeGroupDialog.containers.length === 0) {
    showSnackbarError(t('at least one container must be selected'));
    return;
  }

  const updatedGroup = {
    name: changeGroupDialog.name.trim(),
    icon: changeGroupDialog.icon.trim(),
    containers: changeGroupDialog.containers,
  };

  try {
    await call(`/api/v1/docker/mos/groups/${changeGroupDialog.group.id}`, {
      method: 'PUT',
      body: updatedGroup,
      errorLabel: t('docker group could not be updated'),
      successLabel: t('docker group updated successfully'),
    });
    await getDockerGroups();
    clearChangeGroupDialog();
  } catch (e) {}
};

const startDockerGroupContainers = async (group) => {
  try {
    await call(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/start`, {
      method: 'POST',
      errorLabel: t('all containers in group could not be started'),
      successLabel: t('all containers in group started successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const stopDockerGroupContainers = async (group) => {
  try {
    await call(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/stop`, {
      method: 'POST',
      errorLabel: t('all containers in group could not be stopped'),
      successLabel: t('all containers in group stopped successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const restartDockerGroupContainers = async (group) => {
  try {
    await call(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/restart`, {
      method: 'POST',
      errorLabel: t('all containers in group could not be restarted'),
      successLabel: t('all containers in group restarted successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const updateDockerGroupContainers = async (group, force_update = false) => {
  const updateBody = { groupId: group.id, force_update: force_update };
  sendDockerWSCommand('upgrade-group', updateBody);
};

const getUnusedImages = async () => {
  const result = await call('/api/v1/docker/mos/unusedimages', {
    method: 'GET',
    errorLabel: t('unused images could not be retrieved'),
    showOverlay: false,
  });
  unusedImages.value = result || [];
};

const removeUnusedImage = async (imageId) => {
  const removeImageData = [imageId];
  try {
    await call(`/api/v1/docker/mos/unusedimages`, {
      method: 'DELETE',
      body: removeImageData,
      errorLabel: t('unused image could not be removed'),
      successLabel: t('unused image removed successfully'),
    });
    await getUnusedImages();
  } catch (e) {}
};

const startComposeStack = async (name) => {
  try {
    await call(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/start`, {
      method: 'POST',
      errorLabel: t('docker compose stack could not be started'),
      successLabel: t('docker compose stack started successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const stopComposeStack = async (name) => {
  try {
    await call(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/stop`, {
      method: 'POST',
      errorLabel: t('docker compose stack could not be stopped'),
      successLabel: t('docker compose stack stopped successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const removeComposeStack = async (name) => {
  closeRemoveComposeStackDialog();
  sendDockerWSCommand('compose-delete', { name: name });
};

const restartComposeStack = async (name) => {
  try {
    await call(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/restart`, {
      method: 'POST',
      errorLabel: t('docker compose stack could not be restarted'),
      successLabel: t('docker compose stack restarted successfully'),
    });
    await getDockers();
    await getDockerGroups();
  } catch (e) {}
};

const updateDockerWaitTimes = async () => {
  const waitTimes = dockers.value.map((docker) => ({
    name: docker.Names[0],
    wait: docker.wait,
    index: docker.index,
  }));

  try {
    await call('/api/v1/docker/mos/containers', {
      method: 'POST',
      body: waitTimes,
      errorLabel: t('wait times could not be saved'),
      successLabel: t('wait times saved successfully'),
    });
    dockerWaitTimesDialog.value = false;
  } catch (e) {}
};

const sortDockerIndex = () => {
  dockers.value.forEach((d, idx) => {
    d.index = idx + 1;
  });
  dockers.value = [...dockers.value];
};

const pullImagesForComposeStack = async (name) => {
  sendDockerWSCommand('compose-pull', { name: name });
};

const editComposeStack = async () => {
  const updatedCompose = {
    name: editComposeStackDialog.name.trim(),
    yaml: editComposeStackDialog.yaml,
    env: editComposeStackDialog.env,
    icon: editComposeStackDialog.icon,
    webui: editComposeStackDialog.webui,
    no_autoupdate: editComposeStackDialog.no_autoupdate,
  };
  sendDockerWSCommand('compose-update', updatedCompose);
  editComposeStackDialog.value = false;
};

const getComposeStack = async (name) => {
  const result = await call(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}`, {
    method: 'GET',
    errorLabel: t('docker compose stack could not be loaded'),
    showOverlay: false,
  });
  return result || null;
};

const calculateContainerSize = async (containerName) => {
  try {
    const result = await call(`/api/v1/docker/mos/containers/${containerName}/calc`, {
      method: 'GET',
      errorLabel: t('error calculating directory size'),
      successLabel: t('directory size calculated'),
      showOverlay: false,
    });

    if (result && result.size_human) {
      const docker = dockers.value.find((d) => d.Names && d.Names[0] === containerName);
      if (docker) {
        docker.size_human = result.size_human;
      }
    }
  } catch (e) {}
};

const getContainerNameFromNetworkmode = (networkMode) => {
  if (!networkMode || !networkMode.startsWith('container:')) return '-';

  const ref = networkMode.split(':')[1];
  if (!ref) return '-';

  const matched = dockers.value.find((d) => (d.Id && (d.Id === ref || d.Id.startsWith(ref))) || (d.Names && d.Names[0] === ref));

  return matched ? (matched.Names && matched.Names[0]) || matched.Id : ref;
};

const getFirstNetwork = (docker) => {
  if (!docker) return null;
  const networks = docker.NetworkSettings && docker.NetworkSettings.Networks;
  if (!networks) return null;
  const vals = Object.values(networks);
  return vals && vals.length > 0 ? vals[0] : null;
};

const getContainerIPAddress = (docker, defaultValue = 'none') => {
  if (!docker) return defaultValue;
  const mode = docker.HostConfig && docker.HostConfig.NetworkMode;
  if (mode === 'bridge') {
    return docker.NetworkSettings && docker.NetworkSettings.Networks && docker.NetworkSettings.Networks.bridge ? docker.NetworkSettings.Networks.bridge.IPAddress || defaultValue : defaultValue;
  }
  if (mode === 'host') {
    return docker.NetworkSettings && docker.NetworkSettings.Networks && docker.NetworkSettings.Networks.host ? docker.NetworkSettings.Networks.host.IPAddress || defaultValue : defaultValue;
  }
  const firstNet = getFirstNetwork(docker);
  return firstNet ? firstNet.IPAddress || defaultValue : defaultValue;
};

const showWebui = (docker) => {
  window.open(`${docker.webui}`, '_blank');
};

const showComposeWebui = (group) => {
  if (!group.webui) return;
  let webui = group.webui;
  const portMatch = webui.match(/\[?PORT:(\d+)\]?/i);
  if (portMatch) {
    let resolvedPort = portMatch[1];
    for (const containerName of group.containers || []) {
      const container = dockers.value.find((d) => d.Names && d.Names[0] === containerName);
      if (container && Array.isArray(container.Ports)) {
        const portObj = container.Ports.find((port) => port.PrivatePort === Number(portMatch[1]));
        if (portObj) {
          resolvedPort = portObj.PublicPort ? portObj.PublicPort : portObj.PrivatePort;
          break;
        }
      }
    }
    webui = webui.replace(/\[?PORT:\d+\]?/gi, resolvedPort);
  }
  webui = webui.replace(/\[ADDRESS\]/gi, window.location.hostname);
  window.open(webui, '_blank');
};

const getPortMappings = (docker) => {
  if (!docker || !Array.isArray(docker.Ports)) return '';
  const uniquePorts = docker.Ports.filter((port, index, self) => index === self.findIndex((p) => p.PrivatePort === port.PrivatePort));
  const publicPorts = uniquePorts.filter((port) => port.PublicPort);
  const displayPorts = docker._portsExpanded ? publicPorts : publicPorts.slice(0, 2);
  const host = window.location.hostname;

  const portLink = (port) => {
    const label = `${port.PublicPort}:${port.PrivatePort}`;
    const href = `http://${host}:${port.PublicPort}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline dotted;">${label}</a>`;
  };

  const lines = [];
  for (let i = 0; i < displayPorts.length; i += 2) {
    const port1 = displayPorts[i];
    const port2 = displayPorts[i + 1];

    let line = portLink(port1);
    if (port2) {
      line += ` ${portLink(port2)}`;
    }
    lines.push(line);
  }

  return lines.join('<br/>');
};

const openInfoDialog = (docker) => {
  infoDialog.docker = docker;
  infoDialog.value = true;
};
const clearDeleteDialog = () => {
  deleteDialog.value = false;
  deleteDialog.docker = null;
};
const openDeleteDialog = (docker) => {
  deleteDialog.value = true;
  deleteDialog.docker = docker;
};
const openCreateGroupDialog = () => {
  createGroupDialog.value = true;
  createGroupDialog.name = '';
  createGroupDialog.icon = '';
  createGroupDialog.containers = [];
};
const clearCreateGroupDialog = () => {
  createGroupDialog.value = false;
  createGroupDialog.name = '';
  createGroupDialog.icon = '';
  createGroupDialog.containers = [];
};
const openChangeGroupDialog = (group) => {
  changeGroupDialog.value = true;
  changeGroupDialog.group = group;
  changeGroupDialog.icon = group.icon || '';
  changeGroupDialog.name = group.name;
  changeGroupDialog.containers = group.containers || [];
};
const clearChangeGroupDialog = () => {
  changeGroupDialog.value = false;
  changeGroupDialog.group = null;
  changeGroupDialog.icon = '';
  changeGroupDialog.name = '';
  changeGroupDialog.containers = [];
};
const openDeleteGroupDialog = (group) => {
  deleteGroupDialog.value = true;
  deleteGroupDialog.group = group;
};
const clearDeleteGroupDialog = () => {
  deleteGroupDialog.value = false;
  deleteGroupDialog.group = null;
};
const openUnusedImagesDialog = async () => {
  await getUnusedImages();
  unusedImagesDialog.value = true;
};
const openRemoveComposeStackDialog = (name) => {
  removeComposeStackDialog.value = true;
  removeComposeStackDialog.name = name;
};
const closeRemoveComposeStackDialog = () => {
  removeComposeStackDialog.value = false;
  removeComposeStackDialog.name = '';
};

const getEditorTheme = () => {
  return theme.global.name.value === 'dark' ? [oneDark] : [];
};

const initEditDialogYamlEditor = () => {
  if (!editDialogYamlEditorContainer.value) return;

  const startState = EditorState.create({
    doc: editComposeStackDialog.yaml,
    extensions: [
      basicSetup,
      yaml(),
      ...getEditorTheme(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          editComposeStackDialog.yaml = update.state.doc.toString();
        }
      }),
    ],
  });

  editDialogYamlEditor = new EditorView({
    state: startState,
    parent: editDialogYamlEditorContainer.value,
  });
};

const initEditDialogEnvEditor = () => {
  if (!editDialogEnvEditorContainer.value) return;

  const startState = EditorState.create({
    doc: editComposeStackDialog.env,
    extensions: [
      basicSetup,
      ...getEditorTheme(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          editComposeStackDialog.env = update.state.doc.toString();
        }
      }),
    ],
  });

  editDialogEnvEditor = new EditorView({
    state: startState,
    parent: editDialogEnvEditorContainer.value,
  });
};

const updateEditDialogYamlEditor = (newValue) => {
  if (editDialogYamlEditor) {
    const changes = editDialogYamlEditor.state.changes({
      from: 0,
      to: editDialogYamlEditor.state.doc.length,
      insert: newValue,
    });
    editDialogYamlEditor.dispatch({ changes });
  }
};

const updateEditDialogEnvEditor = (newValue) => {
  if (editDialogEnvEditor) {
    const changes = editDialogEnvEditor.state.changes({
      from: 0,
      to: editDialogEnvEditor.state.doc.length,
      insert: newValue,
    });
    editDialogEnvEditor.dispatch({ changes });
  }
};

const openEditComposeStackDialog = async (name) => {
  let stack = await getComposeStack(name);
  editComposeStackDialog.value = true;
  editComposeStackDialog.name = stack.name;
  editComposeStackDialog.yaml = stack.yaml;
  editComposeStackDialog.env = stack.env;
  editComposeStackDialog.icon = stack.icon;
  editComposeStackDialog.webui = stack.webui || '';
  editComposeStackDialog.no_autoupdate = stack.no_autoupdate || false;
  await nextTick();
  initEditDialogYamlEditor();
  initEditDialogEnvEditor();
};
</script>

<style scoped>
:deep(.cm-editor) {
  height: 200px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
  resize: vertical;
  overflow: auto !important;
}

:deep(.cm-gutters) {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
