import { h } from 'vue';
import { toast } from 'vue-sonner';
import { VIcon } from 'vuetify/components';

export function showSnackbarSuccess(
  text: string,
  successText = '',
  icon = 'mdi-check-circle',
  position = 'bottom-toaster',
  duration = 3000
): void {
  toast.success(text, {
    description: successText || undefined,
    duration,
    icon: h(VIcon, { icon }),
    toasterId: position,
  });
}

export function showSnackbarError(
  text: string,
  errorText = '',
  icon = 'mdi-alert-circle',
  position = 'bottom-toaster',
  durationWhenNoDetails = 3000
): void {
  toast.error(text, {
    description: errorText || undefined,
    duration: errorText ? Infinity : durationWhenNoDetails,
    icon: h(VIcon, { icon }),
    cancel: { label: 'Close' },
    toasterId: position,
  });
}

export function showSnackbarInfo(
  text: string,
  icon = 'mdi-information',
  position = 'bottom-toaster',
  duration = 3000
): void {
  toast.info(text, { duration, icon: h(VIcon, { icon }), toasterId: position });
}

export function showSnackbarWarning(
  text: string,
  icon = 'mdi-alert-circle',
  position = 'bottom-toaster',
  duration = 3000
): void {
  toast.warning(text, { duration, icon: h(VIcon, { icon }), toasterId: position });
}
