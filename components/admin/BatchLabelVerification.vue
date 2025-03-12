// components/admin/BatchLabelVerification.vue
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-medium mb-4">Batch Label Verificatie</h2>

    <div class="mb-6">
      <p class="text-gray-600 mb-4">
        Gebruik deze tool om meerdere labels tegelijk te verifiëren. Selecteer schilderijen die
        juiste labels hebben.
      </p>

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <input
            id="select-all"
            type="checkbox"
            :checked="allSelected"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            @change="toggleSelectAll"
          />
          <label for="select-all" class="ml-2 text-sm text-gray-700">Selecteer alles</label>
        </div>

        <button
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          :disabled="!selectedPaintings.length || isProcessing"
          @click="verifySelected"
        >
          <span v-if="isProcessing">Verwerken...</span>
          <span v-else>{{ selectedPaintings.length }} geselecteerde labels verifiëren</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner show-message message="Schilderijen laden..." />
    </div>

    <div v-else-if="paintings.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600">Geen schilderijen gevonden die geverifieerd moeten worden.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="painting in paintings"
        :key="painting.id"
        class="border rounded-lg overflow-hidden"
        :class="{ 'border-primary': isSelected(painting) }"
      >
        <div class="flex items-center p-2 bg-gray-50 border-b">
          <input
            :id="`select-${painting.id}`"
            type="checkbox"
            :checked="isSelected(painting)"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
            @change="toggleSelect(painting)"
          />
          <label :for="`select-${painting.id}`" class="text-sm font-medium truncate">
            {{ painting.title }}
          </label>
        </div>

        <div class="relative">
          <NuxtImg
            provider="cloudinary"
            :src="painting.id"
            width="200"
            height="200"
            format="webp"
            fit="cover"
            class="w-full h-40 object-contain"
            :alt="painting.title"
          />
        </div>

        <div class="p-3">
          <div class="text-sm mb-1">
            <span class="font-medium">Huidig label:</span> {{ painting.currentLabel || 'Geen' }}
          </div>

          <div class="text-xs text-gray-500">
            Laatste update: {{ formatDate(painting.created) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Results modal -->
    <Teleport to="body">
      <div
        v-if="showResultsModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-medium">Verificatie Resultaten</h3>
              <button class="text-gray-500 hover:text-gray-700" @click="showResultsModal = false">
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

            <div class="mb-4">
              <p class="text-green-600 font-medium">
                {{ verificationResults.success.length }} labels succesvol geverifieerd
              </p>
              <p v-if="verificationResults.failed.length" class="text-red-600 font-medium mt-2">
                {{ verificationResults.failed.length }} labels konden niet worden geverifieerd
              </p>
            </div>

            <div v-if="verificationResults.failed.length" class="mt-4">
              <h4 class="font-medium mb-2">Mislukte verificaties:</h4>
              <ul class="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li v-for="(painting, index) in verificationResults.failed" :key="index">
                  {{ painting.title }} - {{ painting.error }}
                </li>
              </ul>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                @click="showResultsModal = false"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  paintingsToVerify: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['verify-complete']);

// State
const paintings = computed(() => props.paintingsToVerify);
const selected = ref([]);
const isProcessing = ref(false);
const showResultsModal = ref(false);
const verificationResults = ref({
  success: [],
  failed: [],
});

// Computed properties
const allSelected = computed(() => {
  return paintings.value.length > 0 && selected.value.length === paintings.value.length;
});

const selectedPaintings = computed(() => {
  return selected.value
    .map((id) => paintings.value.find((painting) => painting.id === id))
    .filter(Boolean);
});

// Methods
function isSelected(painting) {
  return selected.value.includes(painting.id);
}

function toggleSelect(painting) {
  if (isSelected(painting)) {
    selected.value = selected.value.filter((id) => id !== painting.id);
  } else {
    selected.value.push(painting.id);
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selected.value = [];
  } else {
    selected.value = paintings.value.map((painting) => painting.id);
  }
}

async function verifySelected() {
  if (selectedPaintings.value.length === 0 || isProcessing.value) return;

  isProcessing.value = true;
  verificationResults.value = {
    success: [],
    failed: [],
  };

  try {
    // Process verification for each selected painting
    for (const painting of selectedPaintings.value) {
      try {
        // Call API to verify the label
        const response = await fetch('/api/admin/verify-label', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: painting.id,
            labelNumber: painting.currentLabel,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        // Add to success results
        verificationResults.value.success.push(painting);
      } catch (error) {
        // Add to failed results
        verificationResults.value.failed.push({
          ...painting,
          error: error.message || 'Onbekende fout',
        });
      }
    }

    // Show results modal
    showResultsModal.value = true;

    // Emit completion event
    emit('verify-complete', {
      verified: verificationResults.value.success.map((p) => p.id),
      failed: verificationResults.value.failed.map((p) => p.id),
    });
  } catch (error) {
    console.error('Error during batch verification:', error);
  } finally {
    isProcessing.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Onbekend';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Reset selected when paintings change
watch(
  () => props.paintingsToVerify,
  () => {
    selected.value = [];
  },
  { deep: true }
);
</script>
