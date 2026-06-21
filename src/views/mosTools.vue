<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
      <div class="d-flex align-center ga-3 mb-4">
        <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
        <h2 @click="showSpecialActions++" class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('tools') }}</h2>
      </div>
      </v-container>      
      <v-container class="pa-0" fluid>
        <v-row>
          <!-- Power Management Card -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-power</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('power management') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" @click="rebootDialog = true" class="mb-1" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-restart" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('reboot') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="shutdownDialog = true" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-power" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('shutdown') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Tools -->
          <v-col cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-tools</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('tools') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" to="/mosTools/webterminal" class="mb-1" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-powershell" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('webterminal') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" to="/mosTools/filebrowser" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-folder" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('filebrowser') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>

          <!-- Special Actions Card -->
          <v-col v-if="showSpecialActions >= 3" cols="12" md="6" lg="4" xl="3">
            <div class="card h-100">
              <div class="card-head">
                <v-avatar color="primary" variant="tonal" rounded size="40">
                  <v-icon>mdi-star-face</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">{{ $t('special') }}</span>
              </div>
              <div>
                <v-list bg-color="transparent" density="compact">
                  <v-list-item rounded="lg" @click="updateAPI()" class="mb-1" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-api" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update api') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item rounded="lg" @click="updateUI()" color="primary">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-monitor" class="mr-3"></v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ $t('update ui') }}</v-list-item-title>
                    <template v-slot:append>
                      <v-icon size="small" color="medium-emphasis">mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>

  <!-- Reboot Dialog -->
  <v-dialog v-model="rebootDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to reboot your system?')" :title="t('reboot')" class="pa-0">
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="rebootDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="rebootOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Shutdown Dialog -->
  <v-dialog v-model="shutdownDialog" max-width="600">
    <v-card max-width="400" prepend-icon="mdi-update" :text="t('do you want to shutdown your system?')" :title="t('shutdown')" class="pa-0">
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" :text="t('cancel')" @click="shutdownDialog = false"></v-btn>
        <v-btn color="onPrimary" :text="t('ok')" @click="shutdownOS"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const rebootDialog = ref(false);
const shutdownDialog = ref(false);
const { t } = useI18n();
const showSpecialActions = ref(0);
const { overlay } = useOverlay();

const rebootOS = async () => {

  try {
    overlay.value = true;

    const res = await fetch('/api/v1/system/power/reboot', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('reboot could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('reboot initiated successfully'));
    rebootDialog.value = false;
    window.location.href = '/reboot.html';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const shutdownOS = async () => {

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/system/power/shutdown', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('shutdown could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('shutdown initiated successfully'));
    shutdownDialog.value = false;
    window.location.href = '/shutdown.html';
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateAPI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_api', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update api could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update api initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const updateUI = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/mos/update_ui', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('update ui could not be initiated')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('update ui initiated successfully'));
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};
</script>

<style scoped>
.card {
  background: rgb(var(--v-theme-background));
  border-radius: 12px;
  padding: 8px 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 15%, transparent);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 6px;
}

@supports not (color: color-mix(in srgb, #000 50%, #fff)) {
  .card {
    border-color: rgba(0, 0, 0, 0.15);
  }
  :global(.v-theme--dark) .card {
    border-color: rgba(255, 255, 255, 0.28);
  }
}
</style>
