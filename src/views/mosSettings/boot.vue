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
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('boot') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0" style="margin-bottom: 80px">
          <v-card-text class="pb-2">
            <span class="text-title-medium font-weight-medium">{{ $t('install to disk') }}</span>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-3">{{ $t('transfer usb data to disk device') }}</p>
            <v-row no-gutters>
              <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" rounded size="large" block prepend-icon="mdi-harddisk-plus" @click="installToDiskDialog.value = true">
                  {{ $t('install to disk') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider class="my-2"></v-divider>

          <v-card-text class="pt-2">
            <span class="text-title-medium font-weight-medium">{{ $t('grub') }}</span>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-3">{{ $t('edit grub.cfg') }}</p>
            <v-row no-gutters>
              <v-col cols="12" md="4" lg="3">
                <v-btn color="primary" rounded size="large" block prepend-icon="mdi-file-document-edit-outline" @click="openFileEditor('/boot/grub/grub.cfg')">
                  {{ $t('edit grub.cfg') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Install to Disk Dialog -->
  <v-dialog v-model="installToDiskDialog.value" max-width="500">
    <v-card class="pa-0" :title="$t('install to disk')" prepend-icon="mdi-harddisk-plus">
      <v-card-text>
        <p class="mb-4">{{ $t('transfer usb data to disk device') }}</p>
        <v-select
          v-model="installToDiskDialog.disk"
          :items="
            Array.isArray(unassignedDisks)
              ? unassignedDisks.map((disk) => ({
                  title: `${disk.device} (${disk.size_human})`,
                  value: disk.device,
                }))
              : []
          "
          item-title="title"
          item-value="value"
          :label="$t('device')"
          density="comfortable"
        />
        <v-select v-model="installToDiskDialog.filesystem" :items="['ext4', 'btrfs', 'xfs', 'vfat']" :label="$t('filesystem')" required outlined></v-select>
        <v-switch v-model="installToDiskDialog.extra_partition" :label="$t('extra partition')" inset color="green" density="compact" hide-details="auto"></v-switch>
        <v-switch v-model="installToDiskDialog.restore" :label="$t('restore from file')" inset color="green" density="compact" hide-details="auto"></v-switch>
        <v-text-field
          v-if="installToDiskDialog.restore"
          v-model="installToDiskDialog.tar_file"
          :label="$t('tar file')"
          outlined
          class="mt-4"
          hide-details="auto"
          append-inner-icon="mdi-folder"
          @click:append-inner="
            openFsDialog((item) => {
              installToDiskDialog.tar_file = item.path;
            })
          "
        ></v-text-field>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="installToDiskDialog.value = false" color="onPrimary">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="installToDisk()">{{ $t('install') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="file" :title="$t('select file')" @selected="handleFsSelected" />

  <!-- File Edit Dialog -->
  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" @saved="onFileSaved" />

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary" />
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import FileEditDialog from '@/components/fileEditDialog.vue';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';

const editFileDialogVisible = ref(false);
const selectedFilePath = ref('');
const overlay = ref(false);
const { t } = useI18n();
const unassignedDisks = ref([]);
const installToDiskDialog = reactive({
  value: false,
  disk: '',
  filesystem: '',
  extra_partition: false,
  restore: false,
  tar_file: '',
});
const fsDialog = ref(false);
const fsDialogCallback = ref(null);

onMounted(() => {
  getUnassignedDisks();
});

const openFsDialog = (cb) => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};

const openFileEditor = (path) => {
  selectedFilePath.value = path;
  editFileDialogVisible.value = true;
};
const onFileSaved = (file) => {};

const installToDisk = async () => {
  const installToDiskBody = {
    disk: installToDiskDialog.disk,
    filesystem: installToDiskDialog.filesystem,
    extra_partition: installToDiskDialog.extra_partition,
    tar_file: installToDiskDialog.tar_file,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/installtodisk', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(installToDiskBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || t('installation failed'));
    }
    showSnackbarSuccess(t('installation successfully, please make sure to reboot the system from the installed disk'));
  } catch (e) {
    showSnackbarError(e.message);
  } finally {
    overlay.value = false;
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
    const result = await res.json();
    unassignedDisks.value = result.unassignedDisks || [];
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  }
};
</script>
