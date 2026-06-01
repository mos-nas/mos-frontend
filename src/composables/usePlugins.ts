import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';
import * as Vue from 'vue';

interface Plugin {
  name: string;
  icon?: string;
}

interface FederationContainer {
  get(module: string): Promise<() => { default?: unknown } & Record<string, unknown>>;
}

interface FederationSharedEntry {
  get: () => () => typeof Vue;
  loaded: boolean;
}

type I18nInstance = {
  global?: {
    mergeLocaleMessage?: (locale: string, messages: Record<string, unknown>) => void;
  };
  mergeLocaleMessage?: (locale: string, messages: Record<string, unknown>) => void;
};

const plugins: Ref<Plugin[]> = ref([]);
const pluginsLoaded = ref(false);
const loadedComponents: ShallowRef<Record<string, unknown>> = shallowRef({});
const loadedWidgets: ShallowRef<Record<string, unknown>> = shallowRef({});
const loadedLocales = new Set<string>();
const loadedContainers: Record<string, FederationContainer> = {};

const initSharedScope = async (): Promise<void> => {
  if ((globalThis as any).__federation_shared__?.default?.vue) {
    return;
  }

  if (!(globalThis as any).__federation_shared__) {
    (globalThis as any).__federation_shared__ = { default: {} };
  }
  if (!(globalThis as any).__federation_shared__.default) {
    (globalThis as any).__federation_shared__.default = {};
  }

  const vueVersion = Vue.version || '3.0.0';
  const majorVersion = vueVersion.split('.')[0];

  const entry: FederationSharedEntry = { get: () => () => Vue, loaded: true };

  (globalThis as any).__federation_shared__.default.vue = {
    [majorVersion]: entry,
    [vueVersion]: entry,
  };
};

export const getPlugins = async (): Promise<Plugin[]> => {
  try {
    const res = await fetch('/api/v1/mos/plugins', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      plugins.value = [];
      return [];
    }

    const data = await res.json();
    plugins.value = data.results || data || [];
    pluginsLoaded.value = true;
    return plugins.value;
  } catch {
    plugins.value = [];
    return [];
  }
};

export const loadPluginComponent = async (plugin: Plugin): Promise<unknown> => {
  const cacheKey = plugin.name;

  if (loadedComponents.value[cacheKey]) {
    return loadedComponents.value[cacheKey];
  }

  try {
    await initSharedScope();

    const remoteUrl = `/_plugins/${plugin.name}/remoteEntry.js`;

    if (!loadedContainers[plugin.name]) {
      const container = await import(/* @vite-ignore */ remoteUrl);
      loadedContainers[plugin.name] = container;
    }

    const container = loadedContainers[plugin.name];
    const factory = await container.get('./Plugin');
    const Module = factory();

    loadedComponents.value = {
      ...loadedComponents.value,
      [cacheKey]: Module.default || Module,
    };

    return loadedComponents.value[cacheKey];
  } catch {
    return null;
  }
};

export const loadPluginWidget = async (plugin: Plugin): Promise<unknown> => {
  if (loadedWidgets.value[plugin.name]) {
    return loadedWidgets.value[plugin.name];
  }

  try {
    await initSharedScope();

    const remoteUrl = `/_plugins/${plugin.name}/remoteEntry.js`;

    if (!loadedContainers[plugin.name]) {
      const container = await import(/* @vite-ignore */ remoteUrl);
      loadedContainers[plugin.name] = container;
    }

    const container = loadedContainers[plugin.name];
    const factory = await container.get('./Widget');
    const Module = factory();

    loadedWidgets.value = {
      ...loadedWidgets.value,
      [plugin.name]: Module.default || Module,
    };

    return loadedWidgets.value[plugin.name];
  } catch {
    return null;
  }
};

export const loadPluginLocales = async (plugin: Plugin, i18n: I18nInstance): Promise<void> => {
  if (loadedLocales.has(plugin.name)) return;

  try {
    await initSharedScope();

    const remoteUrl = `/_plugins/${plugin.name}/remoteEntry.js`;

    if (!loadedContainers[plugin.name]) {
      const container = await import(/* @vite-ignore */ remoteUrl);
      loadedContainers[plugin.name] = container;
    }

    const container = loadedContainers[plugin.name];
    const factory = await container.get('./Locales');
    const locales = factory();
    const messages = (locales.default || locales) as Record<string, unknown>;

    for (const [locale, translations] of Object.entries(messages)) {
      if (translations && typeof translations === 'object') {
        const merge = i18n.global?.mergeLocaleMessage || i18n.mergeLocaleMessage;
        if (merge) merge.call(i18n.global || i18n, locale, translations as Record<string, unknown>);
      }
    }

    loadedLocales.add(plugin.name);
  } catch {
    // Locales are optional, don't break anything
  }
};

export const getPluginIconUrl = (plugin: Plugin): string | null => {
  if (plugin.icon) {
    if (plugin.icon.startsWith('mdi-')) {
      return null;
    }
    if (plugin.icon.startsWith('/plugins/')) {
      return plugin.icon.replace('/plugins/', '/_plugins/');
    }
    return plugin.icon;
  }
  return `/_plugins/${plugin.name}/icon.png`;
};

export const hasMdiIcon = (plugin: Plugin): boolean => {
  return !!plugin.icon && plugin.icon.startsWith('mdi-');
};

export const getPluginRoute = (plugin: Plugin): string => {
  return `/plugins/${plugin.name}`;
};

export const usePlugins = () => {
  return {
    plugins,
    pluginsLoaded,
    loadedComponents,
    loadedWidgets,
    getPlugins,
    loadPluginComponent,
    loadPluginWidget,
    loadPluginLocales,
    getPluginIconUrl,
    hasMdiIcon,
    getPluginRoute,
  };
};

export default usePlugins;
