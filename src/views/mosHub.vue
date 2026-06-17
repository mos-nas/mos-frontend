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
                  <v-card v-for="(tpl, i) in mosHub" :key="tpl.name || i" style="height: 250px; display: flex; flex-direction: column" class="pa-0">
                    <v-card-text class="pa-0 pt-4">
                      <div class="d-flex justify-center">
                        <v-img v-if="tpl.icon" :src="tpl.icon" height="60" contain style="max-width: 100%"></v-img>
                        <v-icon v-else size="60" color="grey" style="opacity: 0.5">mdi-package-variant</v-icon>
                      </div>
                      <v-chip
                        v-if="tpl.maintainer"
                        size="small"
                        class="position-absolute"
                        style="top: 12px; left: 12px; background: var(--v-theme-secondary); color: var(--v-theme-on-secondary)"
                        :href="tpl.maintainer_donate"
                        target="_blank"
                        prepend-icon="mdi-account"
                      >
                        {{ tpl.maintainer || $t('unknown') }}
                      </v-chip>
                      <v-chip v-if="tpl.type" size="small" class="position-absolute" style="top: 12px; right: 12px; background: var(--v-theme-primary); color: var(--v-theme-on-primary)">
                        {{ $t(tpl.type) }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="py-2 px-4" style="min-height: 96px">
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
                    <v-spacer />
                    <v-divider />
                    <v-card-actions style="flex: 0 0 auto; gap: 4px; padding: 8px">
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
                        {{ $t('install') }}
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
              <div v-else>
                <div v-if="errorMsg === ''" class="text-center grey--text text--darken-1">
                  {{ $t('no templates found matching your search') }}
                </div>
                <div v-else class="text-center grey--text text--darken-1">
                  {{ errorMsg }}
                </div>
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
  <v-dialog v-model="mosHubRepositoriesDialog.value" max-width="600px">
    <v-card class="pa-0">
      <v-card-title>{{ $t('repositories') }}</v-card-title>
      <v-card-text class="pa-0">
        <v-container fluid>
          <v-row class="pa-0">
            <v-col cols="12" v-for="(repo, index) in mosHubRepositoriesDialog.repositories" :key="index" class="d-flex align-center">
              <v-text-field
                v-model="mosHubRepositoriesDialog.repositories[index]"
                :label="$t('repository') + ' ' + (index + 1)"
                outlined
                density="comfortable"
                class="flex-grow-1 mr-2"
                append-icon="mdi-delete"
                @click:append="mosHubRepositoriesDialog.repositories.splice(index, 1)"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex justify-end mt-2">
              <v-btn color="primary" variant="text" prepend-icon="mdi-plus" @click="mosHubRepositoriesDialog.repositories.push('')">
                {{ $t('add repository') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="mosHubRepositoriesDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="setHubRepositories(mosHubRepositoriesDialog.repositories)">{{ $t('save') }}</v-btn>
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
      <v-card-actions class="px-6 py-2">
        <v-spacer />
        <v-btn color="onPrimary" variant="text" @click="installDialog.value = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" :disabled="installDialog.type === 'plugin' ? !installDialog.release : !mosServices?.docker?.running" :prepend-icon="getInstallDialogIcon()" @click="doDialogInstall()">
          {{ $t('install') }}
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
import { useRouter } from 'vue-router';

const $router = useRouter();
const props = defineProps({
  hubType: String,
});
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const { overlay } = useOverlay();
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
    const url = new URL('/api/v1/mos/hub/index', window.location.origin);
    url.searchParams.append('search', search || '');
    url.searchParams.append('order', order);
    url.searchParams.append('sort', sort);
    url.searchParams.append('limit', limit);
    url.searchParams.append('skip', skip);
    if (category && category !== 'all') url.searchParams.append('category', category);
    if (type && type !== 'all') url.searchParams.append('type', type);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      errorMsg.value = error.error || t('unknown error');
    } else {
      errorMsg.value = '';
    }

    const result = await res.json();
    mosHub.value = result.results || [];
    mosHubCount.value = result.count || 0;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
  } finally {
    hubLoading.value = false;
  }
};

const refreshRepositories = async () => {
  hubLoading.value = true;
  try {
    const res = await fetch('/api/v1/mos/hub/update', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('repositories could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('repositories refreshed successfully'));
    getMosHub(searchOnlineTemplate.value);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    hubLoading.value = false;
  }
};

const getHubRepositories = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/repositories', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('repositories could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const repositories = await res.json();
    return repositories;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};

const setHubRepositories = async (repositories) => {
  overlay.value = true;

  try {
    const res = await fetch('/api/v1/mos/hub/repositories', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repositories),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('repositories could not be changed')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('repositories changed successfully'));
    refreshRepositories();
    mosHubRepositoriesDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const getPluginReleases = async (repository) => {
  releasesLoading.value = true;
  const payload = {
    repository: repository,
    refresh: false,
  };

  try {
    const res = await fetch('/api/v1/mos/plugins/releases', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('plugin releases could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    const data = await res.json();
    releasesItems.value = (data.releases || []).map((r) => r.tag);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  } finally {
    releasesLoading.value = false;
  }
};

const getHubTypes = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/types', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('hub types could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    hubTypes.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const getHubCategories = async () => {
  try {
    const res = await fetch('/api/v1/mos/hub/categories?all=true', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('hub categories could not be loaded')}|$| ${error.error || t('unknown error')}`);
    }

    hubCategories.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    return [];
  }
};

const installPlugin = async (templatepath, release) => {
  overlay.value = true;
  const payload = {
    template: templatepath,
    tag: release,
  };
  try {
    const res = await fetch('/api/v1/mos/plugins/install', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('plugin installation could not be started')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('plugin installation started successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
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
