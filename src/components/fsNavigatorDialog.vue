<template>
  <v-dialog v-model="internalVisible" :persistent="persistent" max-width="800">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ dialogTitle }}</span>
        <v-spacer />
        <v-chip size="small" class="ml-2" variant="tonal">
          {{ currentPath || '/' }}
        </v-chip>
      </v-card-title>

      <v-card-subtitle class="pb-0">
        <div class="d-flex align-center ga-2">
          <v-btn size="small" variant="text" icon="mdi-home" @click="goRoot" color="secondary" :disabled="loading" />
          <v-btn size="small" variant="text" icon="mdi-arrow-up" @click="goUp" color="secondary" :disabled="!canGoUp || loading" />
          <v-btn size="small" variant="text" icon="mdi-refresh" @click="reload" color="secondary" :disabled="loading" />
          <v-spacer />
          <v-progress-circular v-if="loading" indeterminate size="20" color="secondary" />
        </div>
      </v-card-subtitle>
      <v-card-text class="pt-2" style="min-height: 300px; max-height: 60vh; overflow-y: auto">
        <v-alert v-if="errorMessage" type="error" density="compact" class="mb-2">
          {{ errorMessage }}
        </v-alert>
        <v-table density="compact">
          <thead>
            <tr>
              <th>{{ t('name') }}</th>
              <th style="width: 40%">{{ t('path') }}</th>
              <th style="width: 60px" class="text-center">{{ t('action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && items.length === 0">
              <td colspan="3" class="text-center text-medium-emphasis">
                {{ t('no entries') }}
              </td>
            </tr>
            <tr
              v-for="item in items"
              :key="item.path"
              :class="['cursor-pointer', activeItem && activeItem.path === item.path ? 'bg-primary bg-opacity-10' : '']"
              @click="setActiveItem(item)"
              @dblclick.stop.prevent="handleRowDblClick(item)"
            >
              <td>
                <div class="d-flex align-center ga-2">
                  <v-icon size="18">
                    {{ item.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}
                  </v-icon>
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td>
                <span class="text-caption">{{ item.displayPath || item.path }}</span>
              </td>
              <td class="text-center">
                <v-btn v-if="item.type === 'directory'" size="small" icon="mdi-folder-open" variant="text" @click.stop="navigateInto(item)" :disabled="loading" />
                <v-btn v-else-if="isSelectable(item)" size="small" icon="mdi-check" variant="text" @click.stop="confirmSelect(item)" :disabled="loading" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex align-center">
        <div class="text-caption text-truncate" style="max-width: 60%">
          <strong>{{ t('selected') }}:</strong>
          <span v-if="activeItem">
            {{ activeItem.displayPath || activeItem.path }}
          </span>
          <span v-else-if="props.selectType === 'directory'">
            {{ currentPath || '/' }}
          </span>
          <span v-else>-</span>
        </div>
        <v-spacer />
        <v-btn variant="text" color="onPrimary" @click="onCancel">
          {{ t('cancel') }}
        </v-btn>
        <v-btn v-if="showSelectButton" color="onPrimary" :disabled="(!activeItem && props.selectType !== 'directory') || (activeItem && !isSelectable(activeItem)) || loading" @click="confirmSelect()">
          {{ t('select') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { showSnackbarError } from '@/composables/snackbar';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  initialPath: {
    type: String,
    default: '/',
  },
  selectType: {
    type: String,
    default: 'directory',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  showSelectButton: {
    type: Boolean,
    default: true,
  },
  roots: {
    type: String,
    default: '',
  },
  includeHidden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'selected', 'cancel']);
const { t } = useI18n();

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dialogTitle = computed(() => props.title || t('select path'));

const loading = ref(false);
const currentPath = ref('/');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const errorMessage = ref('');
const activeItem = ref(null);
const includeHidden = ref(props.includeHidden);

const loadPath = async (path = '/') => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const url = new URL('/api/v1/mos/fsnavigator', window.location.origin);
    if (path && path !== '/') {
      url.searchParams.set('path', path);
    }

    const typeParam = props.selectType === 'directory' ? 'directories' : 'all';
    url.searchParams.set('type', typeParam);

    if (props.roots !== '' && props.roots !== '/') {
      url.searchParams.set('roots', props.roots);
    }
    if (includeHidden.value) {
      url.searchParams.set('includeHidden', 'true');
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      let apiError = '';
      try {
        const data = await res.json();
        apiError = data.error || '';
      } catch {
        // ignore
      }
      const msg = apiError || t('filesystem could not be loaded');
      throw new Error(msg);
    }

    const data = await res.json();

    currentPath.value = data.currentPath || path || '/';
    canGoUp.value = !!data.canGoUp;
    parentPath.value = data.parentPath;
    items.value = Array.isArray(data.items) ? data.items : [];
    activeItem.value = null;
  } catch (e) {
    const msg = e?.message || t('unknown error');
    errorMessage.value = msg;
    showSnackbarError?.(t('filesystem could not be loaded'), msg);
  } finally {
    loading.value = false;
  }
};

const isSelectable = (item) => {
  if (!item) return false;
  if (props.selectType === 'directory') return item.type === 'directory';
  if (props.selectType === 'file') return item.type !== 'directory';
  return true; // 'both'
};

const setActiveItem = (item) => {
  activeItem.value = item;
};

const navigateInto = (item) => {
  if (!item || item.type !== 'directory') return;
  loadPath(item.path);
};

const handleRowDblClick = (item) => {
  if (!item) return;
  if (item.type === 'directory') {
    navigateInto(item);
  } else if (isSelectable(item)) {
    confirmSelect(item);
  }
};

const goRoot = () => {
  loadPath('/');
};

const goUp = () => {
  if (!canGoUp.value || !parentPath.value) return;
  loadPath(parentPath.value);
};

const reload = () => {
  loadPath(currentPath.value || '/');
};

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};

const confirmSelect = (explicitItem) => {
  const item = explicitItem || activeItem.value;

  if (item && isSelectable(item)) {
    emit('selected', {
      name: item.name,
      path: item.path,
      type: item.type,
      displayPath: item.displayPath ?? item.path,
    });
    internalVisible.value = false;
    return;
  }

  if (!item && props.selectType === 'directory' && currentPath.value) {
    const pathName = currentPath.value.split('/').filter(Boolean).pop() || '/';
    emit('selected', {
      name: pathName,
      path: currentPath.value,
      type: 'directory',
      displayPath: currentPath.value,
    });
    internalVisible.value = false;
  }
};

watch(
  () => internalVisible.value,
  (visible) => {
    if (visible) {
      const startPath = props.initialPath || '/';
      loadPath(startPath);
    }
  },
);
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
