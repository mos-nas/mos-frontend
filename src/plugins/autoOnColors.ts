import { watch, type Plugin } from 'vue';
import type { ThemeInstance } from 'vuetify';

interface VuetifyInstance {
  theme: ThemeInstance;
}

function getContrastColor(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

function applyOnColors(vuetify: VuetifyInstance): void {
  const themes = vuetify.theme.themes.value
  for (const themeName in themes) {
    const colors = themes[themeName].colors
    for (const [key, value] of Object.entries(colors)) {
      if (!key.startsWith('on-') && typeof value === 'string' && value.startsWith('#')) {
        colors[`on-${key}`] = getContrastColor(value)
      }
    }
  }
}

export function createAutoOnColorsPlugin(vuetify: VuetifyInstance): Plugin {
  return {
    install() {
      applyOnColors(vuetify)

      watch(
        vuetify.theme.themes,
        () => applyOnColors(vuetify),
        { deep: true }
      )
    }
  }
}
