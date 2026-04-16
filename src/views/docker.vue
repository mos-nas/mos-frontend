<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('docker containers') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="dockersLoading" type="card" :width="'100%'" :height="'60px'" class="mb-2" />
        <v-card v-else fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-table class="bg-transparent">
              <thead>
                <tr style="cursor: pointer; background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                  <th style="min-width: 250px; padding: 4px 8px; vertical-align: middle">{{ $t('name') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle">{{ $t('state') }}</th>
                  <th style="min-width: 150px; padding: 4px 8px; vertical-align: middle">
                    {{ $t('image') }}
                  </th>
                  <th style="width: 250px; padding: 4px 8px; vertical-align: middle">{{ $t('ports') }}</th>
                  <th style="padding: 4px 8px; vertical-align: middle">{{ $t('ip address') }}</th>
                  <th style="padding: 4px 8px; vertical-align: middle">{{ $t('network') }}</th>
                  <th style="width: 90px; padding: 4px 8px; vertical-align: middle">{{ $t('autostart') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle">{{ $t('info') }}</th>
                  <th style="width: 42px; padding: 4px 8px; vertical-align: middle"></th>
                </tr>
              </thead>

              <!-- Docker Groups -->
              <tbody v-if="dockerGroups.length > 0">
                <template v-for="group in dockerGroups" :key="group.id">
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
                          <v-list-item v-if="group.webui && group.running" @click="showComposeWebui(group)">
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

                    <td>
                      <div class="d-flex align-center">
                        <div class="mr-2">
                          <div style="font-size: 0.9rem">
                            {{ group.name }}
                          </div>
                          <div class="text-caption" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ group.runningCount }}/{{ group.count }} {{ $t('started') }}</div>
                        </div>
                        <v-chip v-if="group.compose" size="small">{{ $t('compose') }}</v-chip>
                      </div>
                    </td>

                    <td>
                      <v-icon v-if="group.update_available" style="color: red" @click.stop="updateDockerGroupContainers(group)">mdi-autorenew</v-icon>
                      <v-icon v-else style="color: green">mdi-check</v-icon>
                    </td>

                    <td>&nbsp;</td>
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

                  <tr v-for="containerName in group.expanded ? group.containers : []" :key="containerName">
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
                          <v-list-item v-if="checkWebui(dockers.find((d) => d.Names && d.Names[0] === containerName))" @click="showWebui(dockers.find((d) => d.Names && d.Names[0] === containerName))">
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

                    <td>
                      <div class="d-flex align-center">
                        <div class="mr-2">
                          <div style="font-size: 0.9rem">{{ containerName }}</div>
                          <div class="text-caption" :style="{ color: dockers.find((d) => d.Names && d.Names[0] === containerName)?.State === 'running' ? 'green' : 'red' }">
                            {{ dockers.find((d) => d.Names && d.Names[0] === containerName)?.State }}
                          </div>
                        </div>
                        <v-chip v-if="dockers.find((d) => d.Names && d.Names[0] === containerName)?.privileged" size="small">{{ $t('privileged') }}</v-chip>
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
              <tr v-if="dockerGroups.length > 0 && dockers.some((d) => !dockerGroups.some((g) => g.containers && g.containers.includes(d.Names?.[0])))">
                <td colspan="10" class="pa-0">
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
              <draggable
                v-if="dockers.some((d) => !dockerGroups.some((g) => g.containers && g.containers.includes(d.Names?.[0])))"
                tag="tbody"
                v-model="dockers"
                item-key="Id"
                handle=".drag-handle"
                @end="onDragEnd()"
              >
                <template #item="{ element: docker }">
                  <tr v-if="!dockerGroups.some((g) => g.containers && g.containers.includes(docker.Names?.[0]))" :id="docker.Id">
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
                    <td>
                      <div class="d-flex align-center">
                        <div class="mr-2">
                          <div style="font-size: 0.9rem">
                            {{ docker.Names[0] }}
                          </div>
                          <div class="text-caption" :style="{ color: docker.State === 'running' ? 'green' : 'red' }">{{ docker.State }}</div>
                        </div>
                        <v-chip v-if="docker.privileged" size="small">{{ $t('privileged') }}</v-chip>
                      </div>
                    </td>
                    <td>
                      <v-icon v-if="mosDockers && mosDockers.find((item) => item.name === docker.Names[0] && item.update_available)" style="color: red" @click="updateDocker(docker.Names[0])">
                        mdi-autorenew
                      </v-icon>
                      <v-icon v-else style="color: green">mdi-check</v-icon>
                    </td>
                    <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ docker.Image }}</td>
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

  <!-- Docker Compose Dialog -->
  <v-dialog v-model="createComposeStackDialog.value" max-width="800">
    <v-card class="pa-0">
      <v-card-title class="text-h6">{{ $t('docker compose') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="createComposeStackDialog.name" :label="$t('stack name')" required></v-text-field>
        <v-textarea v-model="createComposeStackDialog.yaml" :label="$t('compose yaml')" rows="10" required></v-textarea>
        <v-textarea v-model="createComposeStackDialog.env" :label="$t('environment variables')" rows="5"></v-textarea>
        <v-text-field v-model="createComposeStackDialog.icon" :label="$t('icon url')"></v-text-field>
        <v-text-field v-model="createComposeStackDialog.webui" :label="$t('web ui url')"></v-text-field>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="createComposeStackDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="createComposeStack()">
          {{ $t('create') }}
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
          <v-textarea v-model="editComposeStackDialog.yaml" :label="$t('compose yaml')" rows="10" required></v-textarea>
          <v-textarea v-model="editComposeStackDialog.env" :label="$t('environment variables')" rows="5"></v-textarea>
          <v-text-field v-model="editComposeStackDialog.icon" :label="$t('icon url')"></v-text-field>
          <v-text-field v-model="editComposeStackDialog.webui" :label="$t('web ui url')"></v-text-field>
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
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('add container') }}</v-list-item-title>
      </v-list-item>
      <v-list-item to="/docker/compose">
        <template v-slot:prepend>
          <v-icon>mdi-toy-brick-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('docker compose') }}</v-list-item-title>
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

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { openTerminalPopup } from '@/composables/terminalpopup';
import { useDockerWebSocket } from '@/composables/useDockerWebSocket';
import DockerInfoDialog from '@/components/dockerInfoDialog.vue';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const dockers = ref([]);
const dockerGroups = ref([]);
const mosDockers = ref([]);
const composeStacks = ref([]);
const overlay = ref(false);
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
const { wsIsConnected, wsError, wsOperationDialog, wsScrollContainer, sendDockerWSCommand, closeWsDialog } = useDockerWebSocket({
  onErrorSnackbar: showSnackbarError,
  onSuccessSnackbar: showSnackbarSuccess,
  onCompleted: async () => {
    await getDockers();
    await getComposeStacks();
    await getDockerGroups();
  },
});
const createComposeStackDialog = reactive({
  value: false,
  name: '',
  yaml: '',
  env: '',
  icon: '',
  webui: '',
});
const editComposeStackDialog = reactive({
  value: false,
  name: '',
  yaml: '',
  env: '',
  icon: '',
  webui: '',
});
const removeComposeStackDialog = reactive({
  value: false,
  name: '',
});
const wsLoading = ref(false);

onMounted(async () => {
  await getDockers();
  await getComposeStacks();
  await getDockerGroups();
  dockersLoading.value = false;
});

const getDockers = async () => {
  try {
    const [res, mosRes] = await Promise.all([
      fetch('/api/v1/docker/containers/json?all=true', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
      }),
      fetch('/api/v1/docker/mos/containers', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
      }),
    ]);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    if (!mosRes.ok) {
      const error = await mosRes.json();
      throw new Error(`${t('docker containers could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const result = await res.json();
    const mosResult = await mosRes.json();

    // Entferne führenden / von jedem Namen und initialisiere zusätzliche Properties
    result.forEach((docker) => {
      if (docker.Names && Array.isArray(docker.Names)) {
        docker.Names = docker.Names.map((name) => (name.startsWith('/') ? name.slice(1) : name));
      }
      docker.showInfo = false;
      docker.webui = '';
    });

    // Sortiere docker nach dem Index in mosResult
    if (Array.isArray(mosResult)) {
      result.sort((a, b) => {
        const objA = mosResult.find((item) => item.name === a.Names[0]);
        const objB = mosResult.find((item) => item.name === b.Names[0]);
        const idxA = objA ? objA.index : Number.MAX_SAFE_INTEGER;
        const idxB = objB ? objB.index : Number.MAX_SAFE_INTEGER;

        return idxA - idxB;
      });
    }

    // Übernehme autostart aus mosResult in result
    result.forEach((docker) => {
      const mos = mosResult.find((item) => item.name === docker.Names[0]);
      docker.autostart = mos ? mos.autostart : false;
      docker.wait = mos ? mos.wait : 0;
      docker.index = mos ? mos.index : Number.MAX_SAFE_INTEGER;
    });

    dockers.value = result;
    mosDockers.value = mosResult;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getComposeStacks = async () => {
  try {
    const res = await fetch('/api/v1/docker/mos/compose/stacks', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('compose stacks could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    const result = await res.json();
    composeStacks.value = result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const getDockerGroups = async () => {
  try {
    const res = await fetch('/api/v1/docker/mos/groups', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker groups could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    const result = await res.json();
    const newGroups = result || [];

    dockerGroups.value = newGroups.map((group) => {
      const old = dockerGroups.value.find((g) => g.id === group.id);
      // Für Compose-Gruppen: webui und autostart aus composeStacks übernehmen
      const composeStack = group.compose ? composeStacks.value.find((s) => s.name === group.name) : null;
      return {
        ...group,
        expanded: old ? old.expanded : false,
        webui: composeStack?.webui || null,
        autostart: composeStack?.autostart ?? false,
      };
    });
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const stopDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/stop`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker container stopped successfully'));
    getDockers();
    getDockerGroups();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const startDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/start`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be started')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker container started successfully'));
    getDockers();
    getDockerGroups();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restartDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/restart`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be restarted')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker container restarted successfully'));
    getDockers();
    getDockerGroups();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const killDocker = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/containers/${name}/kill`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker container stopped successfully'));
    getDockers();
    getDockerGroups();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeDocker = async (name) => {
  deleteDialog.value = false;
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/remove`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container could not be removed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('docker container removed successfully'));
    getDockers();
    getDockerGroups();
    clearDeleteDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/containers`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(autostart),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('autostart setting could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('autostart setting saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchComposeAutostart = async (group) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(group.name)}`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ autostart: group.autostart }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('autostart setting could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('autostart setting saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const setGroupOrder = async () => {
  const newOrder = JSON.stringify(
    dockerGroups.value.map((group, idx) => {
      const obj = {
        id: group.id,
        index: idx + 1,
      };
      return obj;
    }),
  );

  try {
    const res = await fetch('/api/v1/docker/mos/groups/order', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: newOrder,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker group order could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker group order saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const onDragEnd = async () => {
  const newOrder = JSON.stringify(
    dockers.value.map((docker, idx) => {
      const obj = {
        name: docker.Names[0],
        index: idx + 1,
        wait: docker.wait,
        autostart: docker.autostart,
      };
      return obj;
    }),
  );

  try {
    const res = await fetch('/api/v1/docker/mos/containers', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: newOrder,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker container order could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker container order saved successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
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
      webui = webui.replace(/\[ADDRESS\]/g, window.location.hostname);
    }
    docker.webui = webui;
    return true;
  }
  return false;
};

const openTerminal = async (dockerName) => {
  const sessionId = await createDockerTerminalSession(dockerName);
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

const createDockerTerminalSession = async (dockerName) => {
  const existingSessionId = await checkExistingTerminal('docker', 'exec', dockerName);
  if (existingSessionId) {
    return existingSessionId;
  }

  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: 'docker', args: ['exec', '-it', dockerName, '/bin/sh'], width: 900, height: 420 }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to create terminal session')}|$| ${error.error || t('unknown error')}`);
    }

    const Result = await res.json();
    return Result.sessionId;
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const createLogsTerminalSession = async (dockerName) => {
  const existingSessionId = await checkExistingTerminal('docker', 'logs', dockerName);
  if (existingSessionId) {
    return existingSessionId;
  }

  try {
    const res = await fetch('/api/v1/terminal/create', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: 'docker', args: ['logs', '-f', '--tail', '100', dockerName], readonlyOnly: true, width: 900, height: 420 }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to create terminal log session')}|$| ${error.error || t('unknown error')}`);
    }

    const Result = await res.json();
    return Result.sessionId;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const checkExistingTerminal = async (command, arg, dockerName) => {
  try {
    const res = await fetch(`/api/v1/terminal/sessions`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to retrieve terminal sessions')}|$| ${error.error || t('unknown error')}`);
    }

    const Result = await res.json();
    const sessions = ref([]);
    sessions.value = Result.sessions || [];
    const session = sessions.value.filter((session) => session.command === command && Array.isArray(session.args) && session.args.includes(dockerName) && session.args.includes(arg));
    if (session.length > 0) {
      return session[0].sessionId;
    } else {
      return null;
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
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
    overlay.value = true;
    const res = await fetch('/api/v1/docker/mos/groups', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGroup),
    });
    overlay.value = false;

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker group could not be created')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('docker group created successfully'));
    getDockerGroups();
    clearCreateGroupDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteDockerGroup = async () => {
  if (!deleteGroupDialog.group) {
    showSnackbarError(t('no group selected'));
    return;
  }

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/groups/${encodeURIComponent(deleteGroupDialog.group.id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker group could not be deleted')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('docker group deleted successfully'));
    getDockerGroups();
    clearDeleteGroupDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/groups/${changeGroupDialog.group.id}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedGroup),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker group could not be updated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('docker group updated successfully'));
    getDockerGroups();
    clearChangeGroupDialog();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const startDockerGroupContainers = async (group) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/start`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('all containers in group could not be started')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('all containers in group started successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const stopDockerGroupContainers = async (group) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/stop`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('all containers in group could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('all containers in group stopped successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const restartDockerGroupContainers = async (group) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/groups/${encodeURIComponent(group.id)}/restart`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('all containers in group could not be restarted')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('all containers in group restarted successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateDockerGroupContainers = async (group, force_update = false) => {
  const updateBody = { groupId: group.id, force_update: force_update };
  sendDockerWSCommand('upgrade-group', updateBody);
};

const getUnusedImages = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/docker/mos/unusedimages', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('unused images could not be removed')}|$| ${error.error || t('unknown error')}`);
    }
    const result = await res.json();
    unusedImages.value = result || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeUnusedImage = async (imageId) => {
  const removeImageData = [imageId];

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/unusedimages`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(removeImageData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('unused image could not be removed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('unused image removed successfully'));
    await getUnusedImages();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const createComposeStack = async () => {
  createComposeStackDialog.value = false;
  const newCompose = {
    name: createComposeStackDialog.name.trim(),
    yaml: createComposeStackDialog.yaml,
    env: createComposeStackDialog.env,
    icon: createComposeStackDialog.icon,
    webui: createComposeStackDialog.webui,
  };
  sendDockerWSCommand('compose-create', newCompose);
};

const startComposeStack = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/start`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker compose stack could not be started')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('docker compose stack started successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const stopComposeStack = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/stop`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker compose stack could not be stopped')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('docker compose stack stopped successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const removeComposeStack = async (name) => {
  closeRemoveComposeStackDialog();
  sendDockerWSCommand('compose-delete', { name: name });
};

const restartComposeStack = async (name) => {
  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}/restart`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker compose stack could not be restarted')}|$| ${error.error || t('unknown error')}`);
    }
    getDockers();
    getDockerGroups();
    showSnackbarSuccess(t('docker compose stack restarted successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateDockerWaitTimes = async () => {
  const waitTimes = dockers.value.map((docker) => ({
    name: docker.Names[0],
    wait: docker.wait,
    index: docker.index,
  }));

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/docker/mos/containers', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(waitTimes),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('wait times could not be saved')}|$| ${error.error || t('unknown error')}`);
    }
    showSnackbarSuccess(t('wait times saved successfully'));
    dockerWaitTimesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
  editComposeStackDialog.value = false;
  const updatedCompose = {
    name: editComposeStackDialog.name.trim(),
    yaml: editComposeStackDialog.yaml,
    env: editComposeStackDialog.env,
    icon: editComposeStackDialog.icon,
    webui: editComposeStackDialog.webui,
  };
  sendDockerWSCommand('compose-update', updatedCompose);
};

const getComposeStack = async (name) => {
  try {
    const res = await fetch(`/api/v1/docker/mos/compose/stacks/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('docker compose stack could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }
    const result = await res.json();
    return result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return null;
  }
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
  const portMatch = webui.match(/PORT:(\d+)/);
  if (portMatch) {
    for (const containerName of group.containers || []) {
      const container = dockers.value.find((d) => d.Names && d.Names[0] === containerName);
      if (container && Array.isArray(container.Ports)) {
        const portObj = container.Ports.find((port) => port.PrivatePort === Number(portMatch[1]));
        if (portObj) {
          const port = portObj.PublicPort ? portObj.PublicPort : portObj.PrivatePort;
          webui = webui.replace(/\[PORT:\d+\]/g, port);
          break;
        }
      }
    }
    if (webui.includes('[PORT:')) {
      webui = webui.replace(/\[PORT:\d+\]/g, portMatch[1]);
    }
  }
  const addressMatch = webui.match(/\[ADDRESS\]/g);
  if (addressMatch) {
    webui = webui.replace(/\[ADDRESS\]/g, window.location.hostname);
  }
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
const openEditComposeStackDialog = async (name) => {
  let stack = await getComposeStack(name);
  editComposeStackDialog.value = true;
  editComposeStackDialog.name = stack.name;
  editComposeStackDialog.yaml = stack.yaml;
  editComposeStackDialog.env = stack.env;
  editComposeStackDialog.icon = stack.icon;
  editComposeStackDialog.webui = stack.webui || '';
};
</script>
