<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('network interfaces') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0" style="margin-bottom: 80px">
        <v-card v-for="(iface, idx) in settingsNetwork.interfaces" :key="idx" class="mb-6 pa-0">
          <v-card-title class="d-flex align-center py-3 pb-1" style="position: relative">
            {{ $t('interface') }}: {{ iface.name || $t('new interface') }}
            <v-chip v-if="iface.link_state" class="ml-2" size="small" :color="iface.link_state === 'up' ? 'green' : 'red'">{{ $t(iface.link_state) }}</v-chip>
            <v-chip v-if="iface.status === 'orphan'" class="ml-2" size="small" color="red">{{ $t('orphan') }}</v-chip>
            <v-btn
              v-if="iface.status === 'orphan'"
              icon
              class="ma-0"
              :title="t('remove orphan')"
              :aria-label="t('remove orphan')"
              variant="text"
              color="red"
              @click="removeInterface(idx)"
              style="position: absolute; right: 8px; top: 8px; height: 32px; width: 32px"
            >
              <v-icon size="20">mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle v-if="iface.adapter !== '' && iface.adapter != null && iface.adapter != undefined" class="pt-0 pb-2">{{ iface.adapter }}</v-card-subtitle>
          <v-divider class="mb-0"></v-divider>
          <v-card-text class="pt-2">
            <!-- ETHERNET -->
            <template v-if="iface.type === 'ethernet'">
              <v-switch
                v-if="iface.mac !== '' && iface.mac !== null && iface.mac !== undefined"
                :label="$t('enabled')"
                :model-value="iface.status === 'enabled'"
                @update:model-value="(val) => (iface.status = val ? 'enabled' : 'disabled')"
                :readonly="readonlyInterfaceEnabled()"
                inset
                density="compact"
                color="green"
              ></v-switch>
              <v-select
                :label="$t('type')"
                v-model="iface.type"
                :items="['ethernet', 'bridged', 'bonded']"
                item-title="type"
                item-value="type"
                variant="outlined"
                hide-details="auto"
                @update:model-value="changeInterfaceType(iface)"
              ></v-select>
              <v-divider class="my-4"></v-divider>
              <div class="d-flex align-center mb-2">
                <span class="text-title-medium font-weight-medium">{{ $t('ipv4') }}</span>
              </div>
              <v-row v-if="iface.ipv4.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv4[0].dhcp">
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          :label="$t('cidr')"
                          v-model="iface.ipv4[0].cidr"
                          variant="outlined"
                          hide-details="auto"
                          min="0"
                          max="32"
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field :label="$t('mtu')" v-model="iface.ipv4[0].mtu" variant="outlined" hide-details="auto" type="number"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv4').value" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </template>
              </v-row>
              <div class="d-flex align-center mb-2 mt-4">
                <span class="text-title-medium font-weight-medium mr-4">{{ $t('ipv6') }}</span>
              </div>
              <v-switch
                :label="$t('enable ipv6')"
                color="green"
                inset
                density="compact"
                hide-details="auto"
                :model-value="iface.ipv6.length > 0"
                @update:model-value="changeIPv6Enabled(iface, $event)"
              ></v-switch>

              <v-row v-if="iface.ipv6.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv6[0].dhcp">
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv6').value" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                </template>
              </v-row>
            </template>

            <!-- BRIDGED -->
            <template v-else-if="iface.type === 'bridged'">
              <v-switch
                v-if="iface.mac !== '' && iface.mac !== null && iface.mac !== undefined"
                :label="$t('enabled')"
                :model-value="iface.status === 'enabled'"
                @update:model-value="(val) => (iface.status = val ? 'enabled' : 'disabled')"
                :readonly="readonlyInterfaceEnabled()"
                inset
                density="compact"
                color="green"
              ></v-switch>
              <v-select
                :label="$t('type')"
                v-model="iface.type"
                :items="['ethernet', 'bridged', 'bonded']"
                item-title="type"
                item-value="type"
                variant="outlined"
                hide-details="auto"
                @update:model-value="changeInterfaceType(iface)"
              ></v-select>
              <v-divider class="my-4"></v-divider>
              <div class="d-flex align-center mb-4">
                <span class="text-title-medium font-weight-medium">{{ $t('bridge') }}</span>
              </div>
              <v-row>
                <v-col cols="12">
                  <v-text-field :label="$t('bridge')" v-model="findBridgeForInterface(iface).name" variant="outlined" hide-details="auto"></v-text-field>
                </v-col>
              </v-row>
            </template>

            <!-- BRIDGE -->
            <template v-else-if="iface.type === 'bridge'">
              <v-switch
                v-if="iface.mac !== '' && iface.mac !== null && iface.mac !== undefined"
                :label="$t('enabled')"
                :model-value="iface.status === 'enabled'"
                @update:model-value="(val) => (iface.status = val ? 'enabled' : 'disabled')"
                :readonly="readonlyInterfaceEnabled()"
                inset
                density="compact"
                color="green"
              ></v-switch>
              <v-switch :label="$t('vlan filtering')" v-model="iface.vlan_filtering" inset density="compact" color="green" hide-details="auto"></v-switch>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex align-center mb-2">
                <span class="text-title-medium font-weight-medium">{{ $t('ipv4') }}</span>
              </div>
              <v-row v-if="iface.ipv4.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv4[0].dhcp">
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          :label="$t('cidr')"
                          v-model="iface.ipv4[0].cidr"
                          variant="outlined"
                          hide-details="auto"
                          min="0"
                          max="32"
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field :label="$t('mtu')" v-model="iface.ipv4[0].mtu" variant="outlined" hide-details="auto" type="number"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv4').value" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </template>
              </v-row>

              <div class="d-flex align-center mb-2 mt-4">
                <span class="text-title-medium font-weight-medium mr-4">{{ $t('ipv6') }}</span>
              </div>
              <v-switch
                :label="$t('enable ipv6')"
                color="green"
                hide-details="auto"
                inset
                density="compact"
                :model-value="iface.ipv6.length > 0"
                @update:model-value="changeIPv6Enabled(iface, $event)"
              ></v-switch>
              <v-row v-if="iface.ipv6.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv6[0].dhcp">
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 gateway')" v-model="iface.ipv6[0].gateway" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv6').value" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                </template>
              </v-row>
            </template>

            <!-- BOND -->
            <template v-else-if="iface.type === 'bond'">
              <v-switch
                v-if="iface.mac !== '' && iface.mac !== null && iface.mac !== undefined"
                :label="$t('enabled')"
                :model-value="iface.status === 'enabled'"
                @update:model-value="(val) => (iface.status = val ? 'enabled' : 'disabled')"
                :readonly="readonlyInterfaceEnabled()"
                inset
                density="compact"
                color="green"
              ></v-switch>
              <v-divider class="my-2"></v-divider>
              <v-text-field :label="$t('mode')" model-value="802.3ad" variant="outlined" readonly></v-text-field>
              <v-select
                :label="$t('interfaces')"
                v-model="iface.interfaces"
                :items="getAvailableBondedInterfacesForBond(iface)"
                multiple
                chips
                variant="outlined"
                hide-details="auto"
                max="2"
              ></v-select>
              <v-divider class="my-4"></v-divider>
              <div class="d-flex align-center mb-2">
                <span class="text-title-medium font-weight-medium">{{ $t('ipv4') }}</span>
              </div>
              <v-row v-if="iface.ipv4.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv4 dhcp')" v-model="iface.ipv4[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv4[0].dhcp">
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 address')" v-model="iface.ipv4[0].address" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          :label="$t('cidr')"
                          v-model="iface.ipv4[0].cidr"
                          variant="outlined"
                          hide-details="auto"
                          min="0"
                          max="32"
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field :label="$t('mtu')" v-model="iface.ipv4[0].mtu" variant="outlined" hide-details="auto" type="number"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 gateway')" v-model="iface.ipv4[0].gateway" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv4').value" variant="outlined" hide-details="auto"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </template>
              </v-row>

              <div class="d-flex align-center mb-2 mt-4">
                <span class="text-title-medium font-weight-medium mr-4">{{ $t('ipv6') }}</span>
              </div>
              <v-switch
                :label="$t('enable ipv6')"
                color="green"
                hide-details="auto"
                inset
                density="compact"
                :model-value="iface.ipv6.length > 0"
                @update:model-value="changeIPv6Enabled(iface, $event)"
              ></v-switch>
              <v-row v-if="iface.ipv6.length > 0">
                <v-col cols="12">
                  <v-switch :label="$t('ipv6 dhcp')" v-model="iface.ipv6[0].dhcp" inset density="compact" color="green" hide-details="auto"></v-switch>
                </v-col>
                <template v-if="!iface.ipv6[0].dhcp">
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 address')" v-model="iface.ipv6[0].address" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :label="$t('ipv6 gateway')" v-model="iface.ipv6[0].gateway" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="getIfaceIpDnsString(iface, 'ipv6').value" variant="outlined" hide-details="auto"></v-text-field>
                  </v-col>
                </template>
              </v-row>
            </template>

            <!-- BONDED -->
            <template v-else-if="iface.type === 'bonded'">
              <v-switch
                v-if="iface.mac !== '' && iface.mac !== null && iface.mac !== undefined"
                :label="$t('enabled')"
                :model-value="iface.status === 'enabled'"
                @update:model-value="(val) => (iface.status = val ? 'enabled' : 'disabled')"
                :readonly="readonlyInterfaceEnabled()"
                inset
                density="compact"
                color="green"
              ></v-switch>
              <v-select
                :label="$t('type')"
                v-model="iface.type"
                :items="['ethernet', 'bridged', 'bonded']"
                item-title="type"
                item-value="type"
                variant="outlined"
                hide-details="auto"
                @update:model-value="changeInterfaceType(iface)"
              ></v-select>
              <v-divider class="my-4"></v-divider>
              <div class="d-flex align-center mb-4">
                <span class="text-title-medium font-weight-medium">{{ $t('bond') }}</span>
              </div>
              <v-row>
                <v-col cols="12">
                  <v-text-field :label="$t('bond')" :model-value="findBondForInterface(iface).name" variant="outlined" hide-details="auto" readonly></v-text-field>
                </v-col>
              </v-row>
            </template>

            <!-- VLANs -->
            <v-divider class="my-4"></v-divider>
            <v-row>
              <v-col cols="12" class="d-flex align-center justify-space-between">
                <span class="text-title-medium font-weight-medium">{{ $t('vlan') }}</span>
                <v-btn variant="text" size="small" color="green" class="ma-1 pa-0 float-right" style="min-width: 0" @click="openVlanDialog(iface)" :title="$t('add vlan')" :aria-label="$t('add vlan')">
                  <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                  {{ $t('add vlan') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-table class="ma-0 pa-0" hide-default-footer>
              <thead>
                <tr>
                  <th class="text-start" style="width: 1px; white-space: nowrap"></th>
                  <th class="text-start">{{ $t('vlan id') }}</th>
                  <th class="text-start">{{ $t('mtu') }}</th>
                  <th class="text-start">{{ $t('ipv4') }}</th>
                  <th class="text-start">{{ $t('ipv6') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(vlan, vIdx) in iface.vlans || []" :key="vIdx">
                  <td style="width: 1px; white-space: nowrap; padding: 0">
                    <v-btn icon size="small" variant="text" color="red" @click="removeVlan(iface, vIdx)" :title="$t('remove')" :aria-label="$t('remove')">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                  <td>{{ vlan.vlan_id }}</td>
                  <td>{{ vlan.mtu || '' }}</td>
                  <td>
                    <div v-if="vlan.ipv4 && vlan.ipv4.length">
                      <div v-if="vlan.ipv4[0].dhcp">{{ $t('dhcp') }}</div>
                      <div v-else>{{ vlan.ipv4[0].address || '' }}</div>
                    </div>
                  </td>
                  <td>
                    <div v-if="vlan.ipv6 && vlan.ipv6.length">
                      <div v-if="vlan.ipv6[0].dhcp">{{ $t('dhcp') }}</div>
                      <div v-else>{{ vlan.ipv6[0].address || '' }}</div>
                    </div>
                  </td>
                </tr>
                <tr v-if="!(iface.vlans && iface.vlans.length)">
                  <td colspan="5" class="text-center">{{ $t('no vlans') }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Accept Changed Settings -->
  <v-dialog v-model="settingsNetworkCountdown.value" persistent width="600">
    <v-card class="pa-0" :title="$t('apply network settings')">
      <v-card-text>{{ $t('your network settings were changed, do you want to keep these settings') }}?</v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" text @click="revertChanges()">{{ $t('revert') }} ({{ settingsNetworkCountdown.remaining_seconds }})</v-btn>
        <v-btn color="onPrimary" @click="acceptChanges()">{{ $t('accept') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add VLAN Dialog -->
  <v-dialog v-model="addVlanDialog.value" persistent width="600">
    <v-card class="pa-0" :title="$t('add vlan')" prepend-icon="mdi-plus" style="max-height: 80vh; display: flex; flex-direction: column">
      <v-card-text style="overflow: auto" class="pt-2">
        <v-text-field v-model="addVlanDialog.vlan_id" :label="$t('vlan id')" variant="outlined"></v-text-field>
        <v-text-field v-model="addVlanDialog.mtu" :label="$t('mtu')" variant="outlined" hide-details="auto"></v-text-field>
        <v-divider class="my-4"></v-divider>
        <v-switch :label="$t('no ip assignment')" v-model="addVlanDialog.no_ip_assignment" inset density="compact" color="green"></v-switch>
        <div v-if="!addVlanDialog.no_ip_assignment">
          <div class="d-flex align-center mb-2">
            <span class="text-title-medium font-weight-medium">{{ $t('ipv4') }}</span>
          </div>
          <v-switch :label="$t('ipv4 dhcp')" v-model="addVlanDialog.ipv4.dhcp" inset density="compact" color="green"></v-switch>
          <template v-if="!addVlanDialog.ipv4.dhcp">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field :label="$t('ipv4 address')" v-model="addVlanDialog.ipv4.address" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field :label="$t('cidr')" v-model="addVlanDialog.ipv4.cidr" variant="outlined" min="0" max="32" type="number"></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field :label="$t('mtu')" v-model="addVlanDialog.ipv4.mtu" variant="outlined" type="number"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field :label="$t('ipv4 gateway')" v-model="addVlanDialog.ipv4.gateway" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field :label="$t('ipv4 dns (comma separated)')" v-model="addVlanDialog.ipv4.dns" variant="outlined"></v-text-field>
              </v-col>
            </v-row>
          </template>
          <div class="d-flex align-center mb-2 mt-4">
            <span class="text-title-medium font-weight-medium mr-4">{{ $t('ipv6') }}</span>
          </div>
          <v-switch
            :label="$t('enable ipv6')"
            color="green"
            inset
            density="compact"
            :model-value="addVlanDialog.ipv6 && addVlanDialog.ipv6.dhcp !== undefined"
            @update:model-value="
              (val) => {
                if (val) {
                  if (!addVlanDialog.ipv6) addVlanDialog.ipv6 = {};
                  addVlanDialog.ipv6.dhcp = true;
                } else {
                  addVlanDialog.ipv6 = null;
                }
              }
            "
            hide-details="auto"
          ></v-switch>
          <v-switch
            v-if="addVlanDialog.ipv6 && addVlanDialog.ipv6.dhcp !== undefined"
            :label="$t('ipv6 dhcp')"
            v-model="addVlanDialog.ipv6.dhcp"
            inset
            density="compact"
            color="green"
            hide-details="auto"
          ></v-switch>
          <template v-if="addVlanDialog.ipv6 && addVlanDialog.ipv6.dhcp !== undefined && !addVlanDialog.ipv6.dhcp">
            <v-text-field :label="$t('ipv6 address')" v-model="addVlanDialog.ipv6.address" variant="outlined" class="pt-2"></v-text-field>
            <v-text-field :label="$t('ipv6 gateway')" v-model="addVlanDialog.ipv6.gateway" variant="outlined"></v-text-field>
            <v-text-field :label="$t('ipv6 dns (comma separated)')" v-model="addVlanDialog.ipv6.dns" variant="outlined" hide-details="auto"></v-text-field>
          </template>
        </div>
      </v-card-text>
      <v-divider class="my-0"></v-divider>
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="onPrimary" text @click="addVlanDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="addVlanToInterfaces()">
          {{ $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Warning before save -->
  <v-dialog v-model="saveNetworkSettingsDialog.value" persistent width="600">
    <v-card class="pa-0" :title="$t('save network settings')">
      <v-card-text class="pb-2">
        {{ $t('your network settings will be saved and your network will be restarted') }}.
        <br />
        {{ $t('it may be necessary to manually restart network services such as docker, vm, or lxc') }}.
        <br />
        <br />
        {{ $t('do you want to continue') }}?
      </v-card-text>
      <v-card-actions>
        <v-btn color="onPrimary" text @click="saveNetworkSettingsDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn
          color="onPrimary"
          @click="
            saveNetworkSettingsDialog.value = false;
            setNetworkSettings();
          "
        >
          {{ $t('accept') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="saveNetworkSettingsDialog.value = true" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>

</template>

<script setup>
import { onMounted, ref, computed, reactive, watch, onBeforeUnmount } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const settingsNetwork = ref({ interfaces: [] });
const saveNetworkSettingsDialog = reactive({ value: false });
const { overlay } = useOverlay();
const { t } = useI18n();
const settingsNetworkCountdown = reactive({
  value: false,
  remaining_seconds: 0,
});
const addVlanDialog = reactive({
  value: false,
  iface: null,
  vlan_id: '',
  mtu: '',
  no_ip_assignment: true,
  ipv4: {
    dhcp: true,
    address: '',
    gateway: '',
    mtu: '',
    dns: '',
    cidr: '',
  },
  ipv6: null,
});

let countdownInterval = null;

watch(
  () => settingsNetworkCountdown.value,
  (val) => {
    if (!val && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  },
);

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
});

const getIfaceIpDnsString = (iface, type) => {
  return computed({
    get() {
      return iface[type][0].dns && iface[type][0].dns.length ? iface[type][0].dns.join(', ') : '';
    },
    set(val) {
      iface[type][0].dns = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    },
  });
};

onMounted(() => {
  getNetworkSettings();
});

const getNetworkSettings = async () => {
  try {
    const res = await fetch('/api/v1/mos/settings/network/interfaces', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    settingsNetwork.value = await res.json();
    settingsNetwork.value.interfaces.forEach((iface) => {
      // Initialize ipv4/ipv6 for all types except bonded
      if (iface.type === 'bonded') {
        iface.ipv4 = [];
        iface.ipv6 = [];
      } else {
        if (!iface.ipv4 || iface.ipv4.length === 0) {
          iface.ipv4 = [{ dhcp: true, address: null, cidr: null, gateway: null, mtu: null, dns: [] }];
        }
        if (iface.ipv4[0] && iface.ipv4[0].cidr === undefined) {
          iface.ipv4[0].cidr = null;
        }
        if (iface.ipv4[0] && iface.ipv4[0].mtu === undefined) {
          iface.ipv4[0].mtu = null;
        }
        if (!iface.ipv6) {
          iface.ipv6 = [];
        }
      }

      if (!iface.vlans) iface.vlans = [];
      if (iface.type === 'bond' && !iface.interfaces) iface.interfaces = [];
      if (iface.type === 'bond') iface.mode = '802.3ad';

      iface.vlans.forEach((vlan) => {
        if (vlan.ipv4 && vlan.ipv4.length > 0 && vlan.ipv4[0] && vlan.ipv4[0].cidr === undefined) vlan.ipv4[0].cidr = null;
        if (vlan.ipv4 && vlan.ipv4.length > 0 && vlan.ipv4[0] && vlan.ipv4[0].mtu === undefined) vlan.ipv4[0].mtu = null;
      });
    });
    if (settingsNetwork.value.pending_changes) {
      opensettingsNetworkCountdownDialog(settingsNetwork.value);
    }
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const validateBondInterfaces = () => {
  const invalidBond = settingsNetwork.value.interfaces.find((iface) => iface.type === 'bond' && (!Array.isArray(iface.interfaces) || iface.interfaces.length !== 2));
  if (!invalidBond) return true;

  showSnackbarError(t('bond requires exactly two interfaces'));
  return false;
};

const normalizeMtuValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

const normalizeIpv4MtuArray = (ipv4Array) => {
  if (!Array.isArray(ipv4Array)) return ipv4Array;
  return ipv4Array.map((entry) => {
    if (!entry || typeof entry !== 'object' || !Object.prototype.hasOwnProperty.call(entry, 'mtu')) return entry;
    return {
      ...entry,
      mtu: normalizeMtuValue(entry.mtu),
    };
  });
};

const setNetworkSettings = async () => {
  try {
    if (!validateBondInterfaces()) return;
    overlay.value = true;
    const payload = settingsNetwork.value.interfaces.map((iface) => {
      const baseIface =
        iface.type === 'bond'
          ? {
              ...iface,
              mode: '802.3ad',
            }
          : iface.type === 'bonded'
            ? {
                ...iface,
                ipv4: [],
                ipv6: [],
              }
            : {
                ...iface,
              };

      baseIface.mtu = normalizeMtuValue(baseIface.mtu);
      baseIface.ipv4 = normalizeIpv4MtuArray(baseIface.ipv4);

      if (Array.isArray(baseIface.vlans)) {
        baseIface.vlans = baseIface.vlans.map((vlan) => ({
          ...vlan,
          mtu: normalizeMtuValue(vlan.mtu),
          ipv4: normalizeIpv4MtuArray(vlan.ipv4),
        }));
      }

      return baseIface;
    });

    const res = await fetch('/api/v1/mos/settings/network/interfaces', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be changed')}|$| ${error.error || t('unknown error')}`);
    }
    await getNetworkSettings();
    showSnackbarSuccess(t('network settings changed successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const acceptChanges = async () => {
  settingsNetworkCountdown.value = false;
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network/apply', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be accepted')}|$| ${error.error || t('unknown error')}`);
    }
    await getNetworkSettings();
    showSnackbarSuccess(t('network settings accepted successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const revertChanges = async () => {
  settingsNetworkCountdown.value = false;
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/settings/network/revert', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('network settings could not be reverted')}|$| ${error.error || t('unknown error')}`);
    }
    await getNetworkSettings();
    showSnackbarSuccess(t('network settings reverted successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const changeInterfaceType = (iface) => {
  if (iface.type === 'ethernet') {
    const bridgeIdx = settingsNetwork.value.interfaces.findIndex((i) => i.type === 'bridge' && i.interfaces.includes(iface.name));
    if (bridgeIdx !== -1) {
      settingsNetwork.value.interfaces.splice(bridgeIdx, 1);
    }
    settingsNetwork.value.interfaces.forEach((i, idx) => {
      if (i.type === 'bond' && Array.isArray(i.interfaces) && i.interfaces.includes(iface.name)) {
        i.interfaces = i.interfaces.filter((name) => name !== iface.name);
        if (i.interfaces.length === 0) {
          settingsNetwork.value.interfaces.splice(idx, 1);
        }
      }
    });
    // Ensure ipv4/ipv6 are initialized for ethernet
    if (!iface.ipv4 || iface.ipv4.length === 0) {
      iface.ipv4 = [{ dhcp: true, address: null, cidr: null, gateway: null, mtu: null, dns: [] }];
    }
    if (!iface.ipv6) {
      iface.ipv6 = [];
    }
  } else if (iface.type === 'bridged') {
    settingsNetwork.value.interfaces.forEach((i, idx) => {
      if (i.type === 'bond' && Array.isArray(i.interfaces) && i.interfaces.includes(iface.name)) {
        i.interfaces = i.interfaces.filter((name) => name !== iface.name);
        if (i.interfaces.length === 0) {
          settingsNetwork.value.interfaces.splice(idx, 1);
        }
      }
    });
    const hasBridge = settingsNetwork.value.interfaces.some((i) => i.type === 'bridge');
    const bridgeName = 'br' + iface.name.slice(3);
    if (!hasBridge) {
      settingsNetwork.value.interfaces.push({
        name: bridgeName,
        type: 'bridge',
        mode: null,
        ipv4: [
          {
            dhcp: true,
            address: null,
            cidr: null,
            gateway: null,
            mtu: null,
            dns: [],
          },
        ],
        ipv6: [],
        vlan_filtering: false,
        interfaces: [iface.name],
      });
    }
  } else if (iface.type === 'bonded') {
    // If changing to bonded, remove any bridge that includes this interface
    const bridgeIdx = settingsNetwork.value.interfaces.findIndex((i) => i.type === 'bridge' && i.interfaces.includes(iface.name));
    if (bridgeIdx !== -1) {
      settingsNetwork.value.interfaces.splice(bridgeIdx, 1);
    }
    iface.ipv4 = [];
    iface.ipv6 = [];
    let existingBond = settingsNetwork.value.interfaces.find((i) => i.type === 'bond' && Array.isArray(i.interfaces) && i.interfaces.length < 2 && !i.interfaces.includes(iface.name));
    if (existingBond) {
      existingBond.interfaces.push(iface.name);
    } else {
      const bondNumber = Math.max(-1, ...settingsNetwork.value.interfaces.filter((i) => i.type === 'bond').map((i) => parseInt(i.name.replace('bond', '')) || 0)) + 1;
      settingsNetwork.value.interfaces.push({
        name: 'bond' + bondNumber,
        label: null,
        type: 'bond',
        mode: '802.3ad',
        interfaces: [iface.name],
        ipv4: [
          {
            dhcp: true,
            address: null,
            cidr: null,
            gateway: null,
            mtu: null,
            dns: [],
          },
        ],
        ipv6: [],
        vlans: [],
        mtu: null,
        hw_addr: null,
        status: 'enabled',
      });
    }
  } else if (iface.type === 'bond') {
    iface.mode = '802.3ad';
  }
};

const removeInterface = (idx) => {
  settingsNetwork.value.interfaces.splice(idx, 1);
};

const changeIPv6Enabled = (iface, enabled) => {
  if (enabled) {
    if (!iface.ipv6) iface.ipv6 = [];
    if (iface.ipv6.length === 0) {
      iface.ipv6.push({
        dhcp: true,
        address: null,
        gateway: null,
        dns: [],
      });
    }
  } else {
    iface.ipv6 = [];
  }
};

const opensettingsNetworkCountdownDialog = (networkSettings) => {
  settingsNetworkCountdown.value = true;
  settingsNetworkCountdown.remaining_seconds = networkSettings.remaining_seconds;
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdownInterval = setInterval(() => {
    if (settingsNetworkCountdown.remaining_seconds > 0) {
      settingsNetworkCountdown.remaining_seconds -= 1;
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      settingsNetworkCountdown.value = false;
      getNetworkSettings();
    }
  }, 1000);
};

const findBridgeForInterface = (iface) => {
  return settingsNetwork.value.interfaces.find((i) => i.type === 'bridge' && i.interfaces.includes(iface.name)) || { name: '' };
};

const getAvailableBondedInterfacesForBond = (bond) => {
  const bondedInterfaces = settingsNetwork.value.interfaces.filter((i) => i.type === 'bonded').map((i) => i.name);
  const assignedInOtherBonds = settingsNetwork.value.interfaces.filter((i) => i.type === 'bond' && i.name !== bond.name && Array.isArray(i.interfaces)).flatMap((i) => i.interfaces);
  return bondedInterfaces.filter((name) => !assignedInOtherBonds.includes(name));
};

const findBondForInterface = (iface) => {
  return settingsNetwork.value.interfaces.find((i) => i.type === 'bond' && Array.isArray(i.interfaces) && i.interfaces.includes(iface.name)) || { name: '' };
};

const readonlyInterfaceEnabled = () => {
  let ifaces = settingsNetwork.value.interfaces.filter((i) => i.mac && i.mac !== '' && i.mac !== null && i.mac !== undefined);
  if (ifaces.length <= 1) return true;
  return false;
};

const openVlanDialog = (iface) => {
  addVlanDialog.iface = iface;
  addVlanDialog.vlan_id = '';
  addVlanDialog.mtu = '';
  addVlanDialog.no_ip_assignment = true;
  addVlanDialog.ipv4 = {
    dhcp: true,
    address: '',
    cidr: '',
    gateway: '',
    mtu: '',
    dns: '',
  };
  addVlanDialog.ipv6 = null;
  addVlanDialog.value = true;
};

const removeVlan = (iface, vIdx) => {
  iface.vlans.splice(vIdx, 1);
};

const addVlanToInterfaces = () => {
  if (addVlanDialog.vlan_id === '' || addVlanDialog.vlan_id === null || addVlanDialog.vlan_id === undefined) {
    showSnackbarError(t('vlan id is required'));
    return;
  }

  if (!addVlanDialog.iface.vlans) addVlanDialog.iface.vlans = [];
  const newVlan = {
    vlan_id: addVlanDialog.vlan_id,
    mtu: addVlanDialog.mtu,
  };
  if (!addVlanDialog.no_ip_assignment) {
    newVlan.ipv4 = [
      {
        dhcp: addVlanDialog.ipv4.dhcp,
        address: addVlanDialog.ipv4.address,
        cidr: addVlanDialog.ipv4.cidr,
        gateway: addVlanDialog.ipv4.gateway,
        mtu: addVlanDialog.ipv4.mtu,
        dns: addVlanDialog.ipv4.dns
          ? addVlanDialog.ipv4.dns
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      },
    ];
    if (addVlanDialog.ipv6) {
      newVlan.ipv6 = [
        {
          dhcp: addVlanDialog.ipv6.dhcp,
          address: addVlanDialog.ipv6.address,
          gateway: addVlanDialog.ipv6.gateway,
          dns: addVlanDialog.ipv6.dns
            ? addVlanDialog.ipv6.dns
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
      ];
    }
  } else {
    newVlan.ipv4 = [{}];
    newVlan.ipv6 = [{}];
  }
  addVlanDialog.iface.vlans.push(newVlan);
  addVlanDialog.value = false;
};
</script>
