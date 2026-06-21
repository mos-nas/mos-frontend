<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px;">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle;">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px;">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('users') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-skeleton-loader v-if="!usersLoaded" type="table-heading, table-row@5" :loading="!usersLoaded" class="mb-4" />
        <v-card v-else-if="usersLoaded && users.length === 0" fluid class="pa-4 mb-4">
          <v-card-text class="pa-0">
            {{ $t('no users found') }}
          </v-card-text>
        </v-card>
        <v-card v-else-if="usersLoaded && users.length > 0" fluid style="margin-bottom: 80px" class="pa-0">
          <v-table density="comfortable" style="overflow-x: auto">
            <thead>
              <tr style="background-color: rgba(0, 0, 0, 0.04)">
                <th style="white-space: nowrap; width: 32px"></th>
                <th style="white-space: nowrap">{{ $t('username') }}</th>
                <th style="white-space: nowrap">{{ $t('role') }}</th>
                <th style="white-space: nowrap">{{ $t('language') }}</th>
                <th style="white-space: nowrap">{{ $t('samba') }}</th>
                <th style="white-space: nowrap">{{ $t('created at') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" style="cursor: pointer">mdi-account</v-icon>
                    </template>
                    <v-list>
                      <v-list-item @click="openChangeDialog(user)">
                        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDeleteDialog(user)">
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ user.username }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ user.role }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ user.language }}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  <v-icon v-if="user.samba_user" color="green">mdi-check-circle</v-icon>
                  <v-icon v-else color="red">mdi-close-circle</v-icon>
                </td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Delete User Dialog -->
  <v-dialog v-model="deleteDialog.value" max-width="400">
    <v-card :title="$t('confirm delete')" prepend-icon="mdi-delete" class="pa-0">
      <v-card-text>
        {{ $t('are you sure you want to delete this user?') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row class="d-flex justify-end">
          <v-btn color="onPrimary" @click="deleteDialog.value = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="red" @click="deleteUser(deleteDialog.user)">
            {{ $t('delete') }}
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add User Dialog -->
  <v-dialog v-model="addDialog.value" max-width="400">
    <v-card class="pa-0" :title="$t('add user')" prepend-icon="mdi-account-plus" style="max-height: 70vh; overflow: hidden">
      <v-card-text style="max-height: 420px; overflow-y: auto; padding: 16px">
        <v-text-field
          v-model="addDialog.username"
          :label="$t('username')"
          :error="addDialog.submitted && addDialog.username === ''"
          :error-messages="addDialog.submitted && addDialog.username === '' ? [$t('this field is required')] : []"
          required
        />
        <v-text-field
          v-model="addDialog.password"
          :type="showPassword ? 'text' : 'password'"
          :label="$t('password')"
          :error="addDialog.submitted && addDialog.password === ''"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :error-messages="addDialog.submitted && addDialog.password === '' ? [$t('this field is required')] : []"
          required
        />
        <v-text-field
          v-model="addDialog.password2"
          :label="$t('confirm password')"
          required
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :error="addDialog.submitted && addDialog.password2 === ''"
          :error-messages="
            addDialog.submitted ? (addDialog.password2 === '' ? [$t('this field is required')] : addDialog.password2 !== addDialog.password ? [$t('password is not the same')] : []) : []
          "
        />
        <v-select
          v-model="addDialog.role"
          :items="['admin', 'samba_only']"
          :label="$t('role')"
          required
          @update:modelValue="
            (val) => {
              addDialog.role = val;
              if (val === 'samba_only') addDialog.samba_user = true;
            }
          "
        />
        <v-switch v-model="addDialog.samba_user" :label="$t('samba user')" inset color="green" density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="addDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="addUser()">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Change User Dialog -->
  <v-dialog v-model="changeDialog.value" max-width="400">
    <v-card class="pa-0" :title="$t('change user')" prepend-icon="mdi-account-edit" style="max-height: 70vh; overflow: hidden">
      <v-card-text style="max-height: 420px; overflow-y: auto; padding: 16px">
        <v-text-field v-model="changeDialog.user.username" :label="$t('username')" readonly />
        <v-select v-model="changeDialog.role" :items="['admin', 'samba_only']" :label="$t('role')" required />
        <v-switch v-model="changeDialog.samba_user" :label="$t('samba user')" inset color="green" density="compact" hide-details="auto" @update:model-value="changeSambaUser()" />
        <div class="d-flex justify-end" v-if="!changeDialog.samba_user">
          <v-btn color="primary" variant="text" prepend-icon="mdi-password" @click="changePasswordVisibility()">
            {{ changeDialog.showPasswordFields || changeDialog.samba_user ? $t('hide password') : $t('change password') }}
          </v-btn>
        </div>
        <template v-if="changeDialog.showPasswordFields || changeDialog.samba_user">
          <v-text-field
            v-model="changeDialog.password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('password')"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :required="changeDialog.samba_user"
            class="mt-4"
          />
          <v-text-field
            v-model="changeDialog.password2"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('confirm password')"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :required="changeDialog.samba_user"
          />
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="onPrimary" @click="changeDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="onPrimary" @click="changeUser(changeDialog.user)">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon @click="openAddDialog()">
    <v-icon>mdi-plus</v-icon>
  </v-fab>

  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { showSnackbarError, showSnackbarSuccess } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';

const showPassword = ref(false);
const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const users = ref([]);
const usersLoaded = ref(false);
const { t } = useI18n();
const { overlay } = useOverlay();
const deleteDialog = reactive({
  value: false,
  user: null,
});
const changeDialog = reactive({
  value: false,
  user: null,
  password: '',
  password2: '',
  role: '',
  samba_user: false,
  showPasswordFields: false,
});
const addDialog = reactive({
  value: false,
  submitted: false,
  username: '',
  password: '',
  password2: '',
  role: '',
  samba_user: false,
});

const openDeleteDialog = (user) => {
  deleteDialog.value = true;
  deleteDialog.user = user;
};
const openChangeDialog = (user) => {
  changeDialog.value = true;
  changeDialog.user = user;
  changeDialog.password = '';
  changeDialog.password2 = '';
  changeDialog.role = user.role;
  changeDialog.samba_user = user.samba_user;
};
const openAddDialog = () => {
  addDialog.value = true;
  addDialog.username = '';
  addDialog.password = '';
  addDialog.password2 = '';
  addDialog.role = 'admin';
  addDialog.samba_user = false;
  addDialog.submitted = false;
};

const getUsers = async () => {
  try {
    const res = await fetch('/api/v1/auth/users', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to load users')}|$| ${error.error || t('unknown error')}`);
    }

    users.value = await res.json();
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    usersLoaded.value = true;
  }
};

const addUser = async () => {
  if (addDialog.username === '' || addDialog.password === '' || addDialog.password2 === '' || addDialog.role === '') {
    return;
  }
  if (addDialog.password !== addDialog.password2) {
    showSnackbarError(t('passwords do not match'));
    return;
  }

  const newUser = {
    username: addDialog.username,
    password: addDialog.password,
    role: addDialog.role,
    samba_user: addDialog.samba_user,
  };

  try {
    overlay.value = true;
    const res = await fetch('/api/v1/auth/users', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to create user')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('user successfully created'));
    getUsers();
    addDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const deleteUser = async (user) => {

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to delete user')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('user successfully deleted'));
    getUsers();
    deleteDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const changeUser = async () => {
  if (changeDialog.password !== changeDialog.password2) {
    showSnackbarError(t('passwords do not match'));
    return;
  }

  if (changeDialog.samba_user && changeDialog.password === '') {
    showSnackbarError(t('password is required for samba users'));
    return;
  }

  const userData = {
    username: changeDialog.user.username,
    password: changeDialog.password,
    role: changeDialog.role,
    samba_user: changeDialog.samba_user,
  };

  try {
    overlay.value = true;
    const res = await fetch(`/api/v1/auth/users/${changeDialog.user.id}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('failed to update user')}|$| ${error.error || t('unknown error')}`);
    }

    showSnackbarSuccess(t('user successfully updated'));
    getUsers();
    changeDialog.value = false;
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }

};

const changePasswordVisibility = () => {
  changeDialog.showPasswordFields = !changeDialog.showPasswordFields;
  if (!changeDialog.showPasswordFields) {
    changeDialog.password = '';
    changeDialog.password2 = '';
  }
};

const changeSambaUser = () => {
  if (changeDialog.samba_user) {
    changeDialog.password = '';
    changeDialog.password2 = '';
  } else {
    changeDialog.showPasswordFields = false;
    changeDialog.password = '';
    changeDialog.password2 = '';
  }
};

onMounted(() => {
  getUsers();
});
</script>
