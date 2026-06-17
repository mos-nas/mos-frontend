<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <div class="d-flex align-center ga-3 mb-4">
          <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
          <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ t('notifications') }}</h2>
          <v-spacer></v-spacer>
          <v-btn text class="d-flex align-center" density="compact" @click="switchNotificationsOrder()">
            <v-icon small class="mr-1">{{ notificationsOrder === 'desc' ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}</v-icon>
            {{ notificationsOrder === 'desc' ? $t('newer') : $t('older') }}
          </v-btn>
        </div>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card v-if="notifications.length > 0" style="margin-bottom: 80px" class="pa-0">
          <v-card-text class="pa-0">
            <v-list class="pa-0" style="background-color: transparent">
              <v-list-item v-for="(notification, index) in notifications" :key="notification.id" @click="openNotificationDialog(notification)">
                <template v-slot:prepend>
                  <v-icon v-if="notification.priority === 'normal' || notification.priority === 'info'" color="blue">mdi-information-outline</v-icon>
                  <v-icon v-else-if="notification.priority === 'warning'" color="orange">mdi-alert-outline</v-icon>
                  <v-icon v-else-if="notification.priority === 'alert' || notification.priority === 'error'" color="red">mdi-alert-circle-outline</v-icon>
                  <v-icon v-else-if="notification.priority === 'success'" color="green">mdi-check-circle-outline</v-icon>
                  <v-icon v-else color="grey">mdi-bell-outline</v-icon>
                </template>
                <v-list-item-title :class="{ 'font-weight-bold': !notification.read }">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption text-grey">
                  {{ new Date(notification.timestamp).toLocaleString() }}
                </v-list-item-subtitle>
                <v-divider v-if="index < notifications.length - 1"></v-divider>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <v-card v-if="notifications.length === 0">
          <v-card-text class="pa-0">
            <v-list class="pa-0" style="background-color: transparent">
              <template v-if="notifications.length === 0">
                <v-list-item>
                  <v-list-item-title>{{ $t('no notifications available') }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Notification Detail Dialog -->
  <v-dialog v-model="notificationDialog.value" max-width="600px">
    <v-card
      class="pa-0"
      :title="notificationDialog.notification.title"
      :prepend-icon="
        notificationDialog.notification.priority === 'normal' || notificationDialog.notification.priority === 'info'
          ? 'mdi-information-outline'
          : notificationDialog.notification.priority === 'warning'
            ? 'mdi-alert-outline'
            : notificationDialog.notification.priority === 'alert' || notificationDialog.notification.priority === 'error'
              ? 'mdi-alert-circle-outline'
              : notificationDialog.notification.priority === 'success'
                ? 'mdi-check-circle-outline'
                : 'mdi-bell-outline'
      "
    >
      <v-card-text class="pa-0 pb-4 px-4">
        <p class="ma-0">{{ notificationDialog.notification.message }}</p>
        <p class="ma-0 text-caption text-grey">{{ new Date(notificationDialog.notification.timestamp).toLocaleString() }}</p>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="notificationDialog.value = false">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Read All Dialog -->
  <v-dialog v-model="readAllDialog.value" max-width="600px">
    <v-card :title="$t('mark all as read')" prepend-icon="mdi-check-all">
      <v-card-text class="pa-0 pb-4 px-4 mt-0">
        {{ $t('are you sure you want to mark all notifications as read?') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" text @click="readAllDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="markAllAsRead()">{{ $t('confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="openReadAllDialog()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-check-all</v-icon>
  </v-fab>

  <!-- Loading Overlay -->
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const notifications = ref([]);
const notificationsOrder = ref('desc');
const { overlay } = useOverlay();
const notificationDialog = reactive({
  value: false,
  notification: {},
});
const readAllDialog = reactive({
  value: false,
});

const { t } = useI18n();

onMounted(() => {
  getNotifications();
  window.addEventListener('notification-received', refreshHandler);
});

onUnmounted(() => {
  window.removeEventListener('notification-received', refreshHandler);
});

const refreshHandler = () => {
  getNotifications();
};

const getNotifications = async () => {
  try {
    const res = await fetch('/api/v1/notifications?order=' + notificationsOrder.value, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');
    notifications.value = await res.json();
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch('/api/v1/notifications/' + id + '/read', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) throw new Error('API-Error');

    notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read: true } : n));
    emit('refresh-notifications-badge');
  } catch (e) {
    showSnackbarError(e.message);
  }
};

const markAllAsRead = async () => {
  try {
    overlay.value = true;
    const res = await fetch('/api/v1/notifications/read/all', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('all notifications could not be marked as read')}|$| ${error.error || t('unknown error')}`);
    }
    readAllDialog.value = false;
    getNotifications();
    emit('refresh-notifications-badge');
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const switchNotificationsOrder = () => {
  if (notificationsOrder.value === 'asc') {
    notificationsOrder.value = 'desc';
  } else {
    notificationsOrder.value = 'asc';
  }
  getNotifications();
};

const openNotificationDialog = (notification) => {
  notificationDialog.notification = notification;
  notificationDialog.value = true;

  if (!notification.read) {
    markNotificationAsRead(notification.id);
  }
};
const openReadAllDialog = () => {
  readAllDialog.value = true;
};
</script>
