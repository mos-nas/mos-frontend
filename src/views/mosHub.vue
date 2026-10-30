<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('mos hub') }}</h2>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-text-field
              v-model="searchOnlineTemplate"
              :label="$t('search templates')"
              clearable
              append-inner-icon="mdi-magnify"
              outlined
              density="comfortable"
              hide-details
              class="ma-4"
              @click:append-inner="getMosHub(searchOnlineTemplate)"
              @click:clear="
                searchOnlineTemplate = '';
                getMosHub(searchOnlineTemplate);
              "
              @keyup.enter="getMosHub(searchOnlineTemplate)"
            ></v-text-field>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" color="secondary" density="comfortable" variant="outlined" class="ma-2 ml-4" style="min-width: 150px">
                  {{ $t('type') }}
                  <v-icon right size="18">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list density="comfortable">
                <v-list-item
                  @click="
                    currentPage = 1;
                    hubTypeSel = 'all';
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <template #append>
                    <v-icon v-if="hubTypeSel === 'all'">mdi-check</v-icon>
                  </template>
                  <v-list-item-title>{{ $t('all') }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="type in hubTypes"
                  :key="type"
                  @click="
                    currentPage = 1;
                    hubTypeSel = type;
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <v-list-item-title>{{ $t(type) }}</v-list-item-title>
                  <template #append>
                    <v-icon v-if="hubTypeSel === type">mdi-check</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" color="secondary" density="comfortable" variant="outlined" class="ma-2" style="min-width: 150px">
                  {{ $t('category') }}
                  <v-icon right size="18">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list density="comfortable">
                <v-list-item
                  @click="
                    currentPage = 1;
                    hubCategoriesSel = 'all';
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <v-list-item-title>{{ $t('all') }}</v-list-item-title>
                  <template #append>
                    <v-icon v-if="hubCategoriesSel === 'all'">mdi-check</v-icon>
                  </template>
                </v-list-item>
                <v-list-item
                  v-for="category in hubCategories"
                  :key="category"
                  @click="
                    currentPage = 1;
                    hubCategoriesSel = category;
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <v-list-item-title>{{ $t(category) }}</v-list-item-title>
                  <template #append>
                    <v-icon v-if="hubCategoriesSel === category">mdi-check</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" color="secondary" density="comfortable" variant="outlined" class="ma-2 ml-4 ml-sm-2" style="min-width: 150px">
                  {{ $t('sort') }}
                  <v-icon right size="18">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list density="comfortable">
                <v-list-item
                  v-for="sorting in hubSortings"
                  :key="sorting"
                  @click="
                    currentPage = 1;
                    hubSortingSel = sorting;
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <v-list-item-title>{{ $t(sorting) }}</v-list-item-title>
                  <template #append>
                    <v-icon v-if="hubSortingSel === sorting">mdi-check</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" color="secondary" density="comfortable" variant="outlined" class="ma-2 ml-sm-2" style="min-width: 150px">
                  {{ $t('order') }}
                  <v-icon right size="18">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list density="comfortable">
                <v-list-item
                  v-for="order in hubOrders"
                  :key="order"
                  @click="
                    currentPage = 1;
                    hubOrderSel = order;
                    getMosHub(searchOnlineTemplate, pageLimit, 0, hubOrderSel, hubSortingSel, hubTypeSel, hubCategoriesSel);
                  "
                >
                  <v-list-item-title>{{ $t(order) }}</v-list-item-title>
                  <template #append>
                    <v-icon v-if="hubOrderSel === order">mdi-check</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-divider class="mt-2" />
            <v-container fluid class="pa-4" v-if="!hubLoading">
              <template v-if="mosHub.length > 0">
                <div class="hub-grid">
                  <v-card v-for="(tpl, i) in mosHub" :key="tpl.name || i" style="height: 240px; display: flex; flex-direction: column" class="pa-0">
                    <v-card-text class="pa-0" style="position: relative; flex: 0 0 auto; padding-top: 40px !important">
                      <v-chip
                        v-if="tpl.maintainer"
                        size="small"
                        class="position-absolute"
                        style="top: 12px; left: 12px; background: var(--v-theme-secondary); color: var(--v-theme-on-secondary); z-index: 1"
                        :href="tpl.maintainer_donate"
                        target="_blank"
                        prepend-icon="mdi-account"
                      >
                        {{ tpl.maintainer || $t('unknown') }}
                      </v-chip>
                      <div class="d-flex justify-center align-center" style="height: 64px; width: 60px; margin: 0 auto; overflow: hidden">
                        <v-img v-if="tpl.icon" :src="tpl.icon" contain style="max-width: 100%; max-height: 100%; width: auto; height: auto"></v-img>
                        <v-icon v-else size="48" color="grey" style="opacity: 0.5">mdi-package-variant</v-icon>
                      </div>
                      <v-chip v-if="tpl.type" size="small" class="position-absolute" style="top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary); z-index: 1">
                        {{ $t(tpl.type) }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="py-2 px-4" style="flex: 1 1 auto; min-height: 0">
                      <div class="font-weight-bold mb-1" style="line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.1rem">
                        {{ tpl.name || $t('unknown') }}
                      </div>
                      <div
                        style="
                          max-height: 3.6em;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          display: -webkit-box;
                          line-clamp: 2;
                          -webkit-line-clamp: 2;
                          -webkit-box-orient: vertical;
                          white-space: normal;
                          font-size: 0.9rem;
                        "
                      >
                        {{ tpl.description }}
                      </div>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 0 8px; display: flex; align-items: center; height: 44px; min-height: 44px">
                      <v-chip v-if="tpl.installed" color="secondary" size="small">
                        {{ $t('installed') }}
                      </v-chip>
                      <v-spacer />
                      <v-btn color="secondary" :href="tpl.website" target="_blank" v-if="tpl.website" prepend-icon="mdi-web" size="small">
                        {{ $t('webpage') }}
                      </v-btn>
                      <v-btn
                        v-if="tpl.type == 'docker' && mosServices && mosServices.docker"
                        color="secondary"
                        prepend-icon="mdi-docker"
                        size="small"
                        @click="
                          installDialog.tpl = tpl;
                          installDialog.type = 'docker';
                          installDialog.value = true;
                        "
                        :disabled="!mosServices.docker.running"
                      >
                        {{ tpl.installed ? $t('reinstall') : $t('install') }}
                      </v-btn>
                      <v-btn
                        v-else-if="tpl.type == 'compose' && mosServices && mosServices.docker"
                        color="secondary"
                        prepend-icon="mdi-toy-brick-plus"
                        size="small"
                        @click="
                          installDialog.tpl = tpl;
                          installDialog.type = 'compose';
                          installDialog.value = true;
                        "
                        :disabled="!mosServices.docker.running"
                      >
                        {{ $t('install') }}
                      </v-btn>
                      <v-btn v-else-if="tpl.type == 'plugin'" color="secondary" prepend-icon="mdi-puzzle" size="small" @click="openPluginInstallDialog(tpl)">
                        {{ $t('install') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>

                <!-- Pagination -->
                <div v-if="mosHubCount > 0" class="pt-4 d-flex justify-center">
                  <v-pagination
                    v-model="currentPage"
                    :length="Math.ceil(mosHubCount / pageLimit)"
                    :total-visible="7"
                    @update:model-value="
                      (page) => {
                        currentPage = page;
                        getMosHub(searchOnlineTemplate, pageLimit, (page - 1) * pageLimit);
                      }
                    "
                  />
                </div>
              </template>
              <div v-else class="d-flex justify-center align-center" style="min-height: 400px">
                <v-card class="text-center pa-8" style="max-width: 500px; background: transparent; box-shadow: none; border: 2px dashed rgba(var(--v-theme-on-surface), 0.2)">
                  <v-icon size="80" class="d-block mb-4 mx-auto" style="opacity: 0.4">
                    mdi-inbox-multiple-outline
                  </v-icon>
                  <div v-if="errorMsg === ''">
                    <div class="text-h6 font-weight-bold mb-2">
                      {{ $t('no templates found matching your search') }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-4">
                      {{ $t('try adjusting your search filters or update your repositories') }}
                    </div>
                    <div class="d-flex gap-2 justify-center flex-wrap">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        variant="outlined"
                        @click="refreshRepositories()"
                        :loading="hubLoading"
                      >
                        {{ $t('update repositories') }}
                      </v-btn>
                      <div class="text-body-2 text-medium-emphasis mb-4 mt-4">
                      {{ $t('or add more repositories to expand your selection') }}
                      </div>
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-source-repository-multiple"
                        variant="outlined"
                        @click="openHubRepositoriesDialog()"
                      >
                        {{ $t('manage repositories') }}
                      </v-btn>
                    </div>
                  </div>
                  <div v-else>
                    <div class="text-h6 font-weight-bold mb-2">
                      {{ $t('could not load templates') }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-4">
                      {{ errorMsg }}
                    </div>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-refresh"
                      variant="outlined"
                      @click="getMosHub(searchOnlineTemplate)"
                      :loading="hubLoading"
                    >
                      {{ $t('retry') }}
                    </v-btn>
                  </div>
                </v-card>
              </div>
            </v-container>
            <v-container v-else fluid class="pa-4 d-flex justify-center">
              <div class="hub-grid" style="width: 100%">
                <v-skeleton-loader v-for="n in 8" :key="n" type="card" class="pa-0" />
              </div>
            </v-container>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Repositories Dialog -->
  <v-dialog v-model="mosHubRepositoriesDialog.value" max-width="600px" scrollable>
    <v-card class="pa-0" :title="$t('repositories')" prepend-icon="mdi-source-repository">
      <v-card-text class="py-0" style="max-height: 60vh; overflow-y: auto">
        <v-row class="pa-0 pt-2 pb-4">
          <v-col cols="12" v-for="(repo, index) in mosHubRepositoriesDialog.repositories" :key="index" class="d-flex align-center pa-0 gap-2">
            <v-text-field
              v-model="mosHubRepositoriesDialog.repositories[index]"
              :label="$t('repository') + ' ' + (index + 1)"
              outlined
              density="comfortable"
              class="flex-grow-1"
              hide-details="auto"
            ></v-text-field>
            <v-btn color="red" size="small" density="comfortable" variant="plain" icon @click="mosHubRepositoriesDialog.repositories.splice(index, 1)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
            <v-btn color="green" size="small" density="comfortable" variant="plain" icon @click="mosHubRepositoriesDialog.repositories.splice(index + 1, 0, '')">
              <v-icon size="18">mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-btn color="secondary" variant="text" prepend-icon="mdi-source-repository" @click="openKnownReposDialog()">
          {{ $t('known repositories') }}
        </v-btn>
        <v-spacer />
        <v-btn color="onPrimary" @click="mosHubRepositoriesDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="setHubRepositories(mosHubRepositoriesDialog.repositories)">{{ $t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Install/Details Dialog -->
  <v-dialog v-model="installDialog.value" max-width="760" scrollable>
    <v-card rounded="lg" class="pa-0">
      <v-card-title class="px-6 pt-6 pb-4">
        <div class="d-flex align-center w-100" style="gap: 16px">
          <div class="d-flex align-center me-4" style="min-width: 60px">
            <v-img v-if="installDialog.tpl?.icon" :src="installDialog.tpl?.icon" height="60" contain style="max-width: 100%"></v-img>
            <v-icon v-else size="28" color="on-surface-variant">mdi-package-variant</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="text-h6 font-weight-bold text-truncate">
              {{ installDialog.tpl?.name || $t('unknown') }}
            </div>
            <div class="text-body-2 text-medium-emphasis text-truncate">
              {{ installDialog.tpl?.maintainer || $t('unknown') }}
            </div>
          </div>
          <v-chip v-if="installDialog.tpl?.type" size="small" variant="tonal" color="primary" class="text-uppercase">
            {{ $t(installDialog.tpl.type) }}
          </v-chip>
        </div>
      </v-card-title>
      <v-divider />
      <v-card-text class="px-3 py-3">
        <v-row class="align-stretch" density="comfortable">
          <v-col cols="12" md="8">
            <div v-if="installDialog.tpl?.description" class="text-body-2 mb-4 pr-8" style="white-space: pre-line">
              {{ installDialog.tpl.description }}
            </div>
            <v-list density="compact" lines="one" class="pa-0">
              <v-list-item v-if="installDialog.tpl?.website" :href="installDialog.tpl.website" target="_blank" rel="noopener noreferrer" class="text-truncate" style="text-transform: none">
                <template #prepend>
                  <v-icon>mdi-web</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ $t('webpage') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.donate" :href="installDialog.tpl.donate" target="_blank" rel="noopener noreferrer" class="text-truncate" style="text-transform: none">
                <template #prepend>
                  <v-icon>mdi-gift</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ $t('donate') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.repository">
                <template #prepend>
                  <v-icon>mdi-source-repository</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ installDialog.tpl.repository }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.type === 'plugin'">
                <v-select v-model="installDialog.release" :items="releasesItems" density="compact" :loading="releasesLoading" label="Release" class="mt-2" clearable></v-select>
              </v-list-item>
              <v-list-item v-if="installDialog.tpl?.readme_url" :href="installDialog.tpl?.readme_url" target="_blank" rel="noopener noreferrer" class="text-truncate" style="text-transform: none">
                <template #prepend>
                  <v-icon>mdi-file-document-outline</v-icon>
                </template>
                <v-list-item-title class="text-truncate">
                  {{ $t('readme') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" color="surface-variant" rounded="lg" class="pa-4">
              <div class="text-caption text-medium-emphasis mb-3">
                {{ $t('template') }}
              </div>
              <div class="text-body-2">
                <div class="d-flex justify-space-between" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('type') }}</span>
                  <span class="font-weight-medium">{{ installDialog.tpl?.type || $t('unknown') }}</span>
                </div>
                <div v-if="installDialog.tpl?.maintainer" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('maintainer') }}</span>
                  <span class="font-weight-medium text-truncate">{{ installDialog.tpl.maintainer }}</span>
                </div>
                <div v-if="installDialog.tpl?.maintainer_donate" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('donate') }}</span>
                  <a :href="installDialog.tpl.maintainer_donate" target="_blank" class="font-weight-medium text-truncate">
                    <v-icon>mdi-gift</v-icon>
                  </a>
                </div>
                <div v-if="installDialog.tpl?.created_at" class="d-flex justify-space-between mt-2" style="gap: 12px">
                  <span class="text-medium-emphasis">{{ $t('created') }}</span>
                  <span class="font-weight-medium">
                    {{ new Date(installDialog.tpl.created_at * 1000).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-tooltip
          :text="$t('mos hub is community driven and not all templates are tested and verified. please check the template/source before installing and use at your own risk')"
          location="top"
          max-width="300"
        >
          <template #activator="{ props }">
            <v-icon v-bind="props" color="info" icon="mdi-information"></v-icon>
          </template>
        </v-tooltip>
        <v-spacer />
        <v-btn color="onPrimary" @click="installDialog.value = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" :disabled="installDialog.type === 'plugin' ? !installDialog.release : !mosServices?.docker?.running" :prepend-icon="getInstallDialogIcon()" @click="doDialogInstall()">
          {{ $t('install') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Pick known repos -->
  <v-dialog v-model="knownReposDialog.value" persistent max-width="600" scrollable>
    <v-card :title="$t('known repositories')" prepend-icon="mdi-source-repository">
      <v-card-text style="max-height: 60vh; overflow-y: auto">
        <v-list class="pa-0">
          <v-list-item v-for="repo in knownRepos" :key="repo" @click="toggleKnownRepo(repo)">
            <template #append>
              <v-icon v-if="selectedKnownRepos.includes(repo)" color="success">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title>{{ repo }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider />
      <v-card-actions style="flex-shrink: 0">
        <v-spacer />
        <v-btn color="onPrimary" @click="knownReposDialog.value = false">{{ $t('close') }}</v-btn>
        <v-btn color="onPrimary" @click="saveSelectedKnownRepos()">{{ $t('save') }}</v-btn>
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
      <v-list-item @click="openHubRepositoriesDialog()">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('repositories') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="refreshRepositories()">
        <template v-slot:prepend>
          <v-icon>mdi-refresh</v-icon>
        </template>
        <v-list-item-title>{{ $t('refresh repositories') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { onMounted, ref, reactive, nextTick, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useOverlay } from '@/composables/useOverlay';
import { useApi } from '@/composables/useApi';
import { useRouter } from 'vue-router';

const $router = useRouter();
const props = defineProps({
  hubType: String,
});
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const { call } = useApi();
const mosServices = inject('mosServices');
const searchOnlineTemplate = ref('');
const hubLoading = ref(true);
const releasesLoading = ref(false);
const hubTypeSel = ref('all');
const hubTypes = ref([]);
const hubCategoriesSel = ref('all');
const hubCategories = ref([]);
const hubSortings = ref(['name', 'created', 'updated']);
const hubSortingSel = ref('created');
const hubOrders = ref(['asc', 'desc']);
const hubOrderSel = ref('desc');
const installDialog = reactive({
  value: false,
  tpl: null,
  type: '',
  release: null,
});
const errorMsg = ref('');
const releasesItems = ref([]);
const mosHub = ref([]);
const mosHubCount = ref(0);
const knownRepos = ref([]);
const selectedKnownRepos = ref([]);
const knownReposDialog = reactive({
  value: false,
  loading: false,
});

const mosHubRepositoriesDialog = reactive({
  value: false,
  repositories: [''],
});
const currentPage = ref(1);
const pageLimit = 24;
onMounted(() => {
  if (props.hubType === 'docker') {
    hubTypeSel.value = 'docker';
  } else if (props.hubType === 'compose') {
    hubTypeSel.value = 'compose';
  } else if (props.hubType === 'plugin') {
    hubTypeSel.value = 'plugin';
  }
  getMosHub();
  getHubTypes();
  getHubCategories();
});

const getMosHub = async (search, limit = 24, skip = 0, order = hubOrderSel.value, sort = hubSortingSel.value, type = hubTypeSel.value, category = hubCategoriesSel.value) => {
  hubLoading.value = true;
  try {
    const baseUrl = __API_BASE_URL__ || window.location.origin;
    const url = new URL('/api/v1/mos/hub/index', baseUrl);
    url.searchParams.append('search', search || '');
    url.searchParams.append('order', order);
    url.searchParams.append('sort', sort);
    url.searchParams.append('limit', limit);
    url.searchParams.append('skip', skip);
    if (category && category !== 'all') url.searchParams.append('category', category);
    if (type && type !== 'all') url.searchParams.append('type', type);

    const result = await call(url.toString(), {
      errorLabel: t('could not load templates'),
      showOverlay: false,
    });

    if (result) {
      errorMsg.value = '';
      mosHub.value = result.results || [];
      mosHubCount.value = result.count || 0;
    }
  } catch (e) {
    errorMsg.value = e.message.split('|$|')[1] || t('unknown error');
  } finally {
    hubLoading.value = false;
  }
};

const refreshRepositories = async () => {
  hubLoading.value = true;
  try {
    await call('/api/v1/mos/hub/update', {
      method: 'POST',
      errorLabel: t('repositories could not be loaded'),
      successLabel: t('repositories refreshed successfully'),
      showOverlay: false,
    });
    getMosHub(searchOnlineTemplate.value);
  } catch (e) {
  } finally {
    hubLoading.value = false;
  }
};

const getHubRepositories = async () => {
  try {
    return await call('/api/v1/mos/hub/repositories', {
      errorLabel: t('repositories could not be loaded'),
      showOverlay: false,
    });
  } catch (e) {
    return [];
  }
};

const setHubRepositories = async (repositories) => {
  try {
    await call('/api/v1/mos/hub/repositories', {
      method: 'POST',
      body: repositories,
      errorLabel: t('repositories could not be changed'),
      successLabel: t('repositories changed successfully'),
      showOverlay: true,
    });
    refreshRepositories();
    mosHubRepositoriesDialog.value = false;
  } catch (e) {}
};

const getPluginReleases = async (repository) => {
  releasesLoading.value = true;
  const payload = {
    repository: repository,
    refresh: false,
  };

  try {
    releasesLoading.value = true;
    const data = await call('/api/v1/mos/plugins/releases', {
      method: 'POST',
      body: payload,
      errorLabel: t('plugin releases could not be loaded'),
      showOverlay: false,
    });

    if (data) {
      releasesItems.value = (data.releases || []).map((r) => r.tag);
      installDialog.release = releasesItems.value.length > 0 ? releasesItems.value[0] : null;
    }
  } catch (e) {
  } finally {
    releasesLoading.value = false;
  }
};

const getHubTypes = async () => {
  try {
    const result = await call('/api/v1/mos/hub/types', {
      errorLabel: t('hub types could not be loaded'),
      showOverlay: false,
    });

    if (result) {
      hubTypes.value = result;
    }
  } catch (e) {}
};

const getHubCategories = async () => {
  try {
    const result = await call('/api/v1/mos/hub/categories?all=true', {
      errorLabel: t('hub categories could not be loaded'),
      showOverlay: false,
    });

    if (result) {
      hubCategories.value = result;
    }
  } catch (e) {
  }
};

const installPlugin = async (templatepath, release) => {
  const payload = {
    template: templatepath,
    tag: release,
  };
  try {
    await call('/api/v1/mos/plugins/install', {
      method: 'POST',
      body: payload,
      errorLabel: t('plugin installation could not be started'),
      successLabel: t('plugin installation started successfully'),
      showOverlay: true,
    });
  } catch (e) {}
};

const getInstallDialogIcon = () => {
  if (installDialog.type === 'docker') return 'mdi-docker';
  if (installDialog.type === 'compose') return 'mdi-toy-brick-plus';
  if (installDialog.type === 'plugin') return 'mdi-puzzle';
  return 'mdi-package-variant';
};

const doDialogInstall = () => {
  if (installDialog.type === 'plugin') {
    installDialog.value = false;
    installPlugin(installDialog.tpl.files.template, installDialog.release);
  } else if (installDialog.type === 'docker') {
    installDialog.value = false;
    $router.push({ path: '/docker/create', query: { template: installDialog.tpl.files.template } });
  } else if (installDialog.type === 'compose') {
    installDialog.value = false;
    $router.push({
      path: '/docker/compose',
      query: {
        template: encodeURIComponent(installDialog.tpl.files?.template ?? ''),
        yaml: encodeURIComponent(installDialog.tpl.files?.yaml ?? ''),
        env: encodeURIComponent(installDialog.tpl.files?.env ?? ''),
      },
    });
  }
};

const openHubRepositoriesDialog = async () => {
  mosHubRepositoriesDialog.repositories = await getHubRepositories();
  await nextTick();
  mosHubRepositoriesDialog.value = true;
};
const openPluginInstallDialog = (tpl) => {
  installDialog.tpl = tpl;
  installDialog.type = 'plugin';
  installDialog.value = true;
  releasesItems.value = [];
  installDialog.release = null;
  getPluginReleases(tpl?.repository);
};
const openKnownReposDialog = async () => {
  knownReposDialog.value = true;
  knownReposDialog.loading = true;
  await getKnownRepos();
  selectedKnownRepos.value = [...mosHubRepositoriesDialog.repositories];
  knownReposDialog.loading = false;
};

const getKnownRepos = async () => {
  try {
    const result = await call('/api/v1/mos/hub/knownrepositories', {
      errorLabel: t('could not get known repositories'),
      showOverlay: false,
    });

    if (result) {
      knownRepos.value = result;
    }
  } catch (e) {}
};

const toggleKnownRepo = (repoName) => {
  const index = selectedKnownRepos.value.indexOf(repoName);
  if (index === -1) {
    selectedKnownRepos.value.push(repoName);
  } else {
    selectedKnownRepos.value.splice(index, 1);
  }
};

const saveSelectedKnownRepos = () => {
  mosHubRepositoriesDialog.repositories = [...selectedKnownRepos.value];
  knownReposDialog.value = false;
};
</script>

<style scoped>
.hub-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

@media (min-width: 760px) {
  .hub-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1080px) {
  .hub-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1440px) {
  .hub-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
