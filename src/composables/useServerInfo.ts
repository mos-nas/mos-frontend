import { ref } from 'vue';
import { showSnackbarError } from './snackbar';
import { useAuth } from './useAuth';

const mosServices = ref<Record<string, any>>({});
const hostname = ref('');
const mosVersion = ref('');
const hideInactiveMenus = ref(localStorage.getItem('hideInactiveMenus') === 'true');
const groupMenus = ref(localStorage.getItem('groupMenus') === 'true');
const menuLayout = ref(localStorage.getItem('menuLayout') || 'vertical');

export function useServerInfo() {
  const { authHeaders } = useAuth();

  const loadMenuPreferences = () => {
    hideInactiveMenus.value = localStorage.getItem('hideInactiveMenus') === 'true';
    groupMenus.value = localStorage.getItem('groupMenus') === 'true';
    menuLayout.value = localStorage.getItem('menuLayout') || 'vertical';
  };

  const loadServices = async () => {
    try {
      const res = await fetch('/api/v1/mos/services', { method: 'GET', headers: authHeaders() });
      if (!res.ok) throw new Error('API-Error');
      mosServices.value = await res.json();
    } catch (e) {
      showSnackbarError(e instanceof Error ? e.message : String(e));
    }
  };

  const loadHostInfo = async () => {
    try {
      const res = await fetch('/api/v1/mos/osinfo', { method: 'GET', headers: authHeaders() });
      if (!res.ok) throw new Error('API-Error');
      const result = await res.json();
      hostname.value = result.hostname || '';
      mosVersion.value = result.mos?.version || '';
    } catch (e) {
      hostname.value = '';
    }
  };

  const reset = () => {
    mosServices.value = {};
    hostname.value = '';
    mosVersion.value = '';
    hideInactiveMenus.value = false;
    groupMenus.value = false;
    menuLayout.value = 'vertical';
  };

  return { mosServices, hostname, mosVersion, hideInactiveMenus, groupMenus, menuLayout, loadMenuPreferences, loadServices, loadHostInfo, reset };
}
