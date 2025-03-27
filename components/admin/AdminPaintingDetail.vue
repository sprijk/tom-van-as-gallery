<!-- components/admin/AdminPaintingDetail.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
      <!-- Header with close button -->
      <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Schilderij Label Verificatie</h2>
        <button class="text-gray-500 hover:text-gray-700 transition-colors" @click="$emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <!-- Image container -->
          <div class="relative bg-gray-100 rounded-lg overflow-hidden">
            <NuxtImg
              provider="imagor"
              :src="painting.destPath"
              format="webp"
              fit="inside"
              width="600"
              class="w-full h-auto object-contain mx-auto"
              :alt="painting.title"
            />

            <!-- Navigation buttons -->
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
              <button
                v-if="hasPrevious"
                class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                @click="$emit('navigate', 'prev')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <div class="absolute right-4 top-1/2 transform -translate-y-1/2">
              <button
                v-if="hasNext"
                class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                @click="$emit('navigate', 'next')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Details and form -->
          <div>
            <h3 class="text-xl font-medium mb-4">{{ painting.title }}</h3>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <label class="block text-gray-700 font-medium">Label Status</label>
                  <span
                    :class="{
                      'px-2 py-1 text-xs rounded-full': true,
                      'bg-green-100 text-green-800': painting.labelStatus === 'verified',
                      'bg-yellow-100 text-yellow-800': painting.labelStatus === 'needs_review',
                      'bg-gray-100 text-gray-800': painting.labelStatus === 'missing',
                    }"
                  >
                    {{ getLabelStatusText(painting.labelStatus) }}
                  </span>
                </div>
                <div class="text-sm text-gray-600 mb-4">
                  <p>Categorie: {{ painting.category || 'Geen categorie' }}</p>
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 mb-2">Huidig Label</label>
                <input
                  v-model="painting.currentLabel"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Geen label gevonden"
                  readonly
                />
              </div>

              <div class="mb-6">
                <label class="block text-gray-700 mb-2">Correct Label</label>
                <input
                  v-model="correctedLabel"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Voer correct label in"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  :disabled="isUpdating"
                  @click="verifyLabel"
                >
                  <span v-if="isUpdating">Bezig...</span>
                  <span v-else>Verifiëren</span>
                </button>
                <button
                  class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  :disabled="
                    isUpdating || !correctedLabel || correctedLabel === painting.currentLabel
                  "
                  @click="updateLabel"
                >
                  <span v-if="isUpdating">Bezig...</span>
                  <span v-else>Bijwerken</span>
                </button>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="font-medium mb-3">Sneltoetsen</h4>
              <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>← → Navigatie</div>
                <div>Enter Verifiëren</div>
                <div>Esc Sluiten</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  painting: {
    type: Object,
    required: true,
  },
  hasPrevious: {
    type: Boolean,
    default: false,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'navigate', 'verify', 'update']);

const correctedLabel = ref(props.painting.currentLabel || '');

// Reset corrected label when painting changes
watch(
  () => props.painting,
  (newPainting) => {
    correctedLabel.value = newPainting.currentLabel || '';
  }
);

// Helper functions
function getLabelStatusText(status) {
  switch (status) {
    case 'verified':
      return 'Geverifieerd';
    case 'needs_review':
      return 'Controleren';
    case 'missing':
      return 'Geen label';
    default:
      return 'Onbekend';
  }
}

// Event handlers
function verifyLabel() {
  emit('verify', props.painting);
}

function updateLabel() {
  emit('update', {
    ...props.painting,
    correctedLabel: correctedLabel.value,
  });
}

// Setup keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function handleKeyDown(event) {
  switch (event.key) {
    case 'ArrowLeft':
      if (props.hasPrevious) emit('navigate', 'prev');
      break;
    case 'ArrowRight':
      if (props.hasNext) emit('navigate', 'next');
      break;
    case 'Enter':
      if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
        verifyLabel();
      }
      break;
    case 'Escape':
      emit('close');
      break;
  }
}
</script>
