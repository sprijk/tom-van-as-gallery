<template>
  <!-- Added fixed min-height and width to ensure the component is always visible -->
  <div class="flex items-center min-h-[30px] min-w-[150px]">
    <label :for="`publish-toggle-${paintingId}`" class="mr-2 text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <!-- Make the toggle switch more prominent with explicit dimensions -->
    <button
      :id="`publish-toggle-${paintingId}`"
      type="button"
      :class="[
        'relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border',
        isPublished ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400',
      ]"
      :style="{ minWidth: '3rem', height: '1.5rem' }"
      :disabled="isUpdating"
      :aria-checked="isPublished"
      role="switch"
      @click="togglePublished"
    >
      <span class="sr-only">{{ isPublished ? 'Depubliceren' : 'Publiceren' }}</span>
      <span
        :class="[
          'absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm border border-gray-200',
          isPublished ? 'translate-x-6' : 'translate-x-1',
        ]"
        :style="{ minWidth: '1.25rem', height: '1.25rem' }"
      />
    </button>
    <span
      v-if="showStatus"
      class="ml-2 text-xs font-medium"
      :class="isPublished ? 'text-green-600' : 'text-gray-500'"
    >
      {{ isPublished ? 'Gepubliceerd' : 'Niet gepubliceerd' }}
    </span>
    <span v-if="isUpdating" class="ml-2 text-xs text-gray-500"> Bijwerken... </span>
  </div>
</template>

<script setup>
const props = defineProps({
  paintingId: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: 'Publiceren',
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update']);

const isPublished = ref(props.published);

// Watch for prop changes
watch(
  () => props.published,
  (newValue) => {
    isPublished.value = newValue;
  }
);

function togglePublished() {
  if (props.isUpdating) return;

  const newValue = !isPublished.value;
  isPublished.value = newValue;

  emit('update', {
    id: props.paintingId,
    published: newValue,
  });
}
</script>
