<template>
  <v-dialog v-model="internalVisible" max-width="520">
    <v-card :title="t('set schedule')" :prepend-icon="mdi-calendar-clock">
      <v-card-text>
        <CronVuetify v-model="localSchedule" @error="onCronError" />
        <div class="cron-schedule-preview text-center text-medium-emphasis mb-2 mt-4">
           <strong>{{ liveSchedulePreview }}</strong>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" variant="text" @click="onCancel">{{ t('cancel') }}</v-btn>
        <v-btn color="onPrimary" :disabled="!!cronError" @click="onApply">{{ t('apply') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CronVuetify } from '@vue-js-cron/vuetify';
import '@vue-js-cron/vuetify/dist/vuetify.css';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  schedule: {
    type: String,
    default: '* * * * *',
  },
});

const emit = defineEmits(['update:modelValue', 'apply', 'cancel']);
const { t } = useI18n();
const localSchedule = ref(props.schedule || '* * * * *');
const cronError = ref('');

const internalVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const liveSchedulePreview = computed(() => {
  return localSchedule.value && localSchedule.value.trim().length > 0 ? localSchedule.value : '* * * * *';
});

const onCronError = (errorMessage) => {
  cronError.value = errorMessage || '';
};

const onCancel = () => {
  internalVisible.value = false;
  emit('cancel');
};

const onApply = () => {
  emit('apply', localSchedule.value);
  internalVisible.value = false;
};

watch(
  () => internalVisible.value,
  (visible) => {
    if (visible) {
      localSchedule.value = props.schedule && props.schedule.trim().length > 0 ? props.schedule : '* * * * *';
      cronError.value = '';
    }
  },
);

watch(
  () => props.schedule,
  (newSchedule) => {
    if (internalVisible.value) {
      localSchedule.value = newSchedule && newSchedule.trim().length > 0 ? newSchedule : '* * * * *';
    }
  },
);
</script>

<style scoped>
.cron-schedule-preview {
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 600;
}
</style>
