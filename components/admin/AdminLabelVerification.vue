<!-- components/admin/AdminLabelVerification.vue -->
<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-xl font-medium">Label Verificatie</h2>
      <div class="flex items-center space-x-4">
        <select
          v-model="labelFilter"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Alle schilderijen</option>
          <option value="withLabel">Met label</option>
          <option value="withoutLabel">Zonder label</option>
          <option value="needsReview">Moet geverifieerd worden</option>
        </select>
        <button class="btn btn-secondary" @click="$emit('refresh')">
          <span v-if="isLoading">Laden...</span>
          <span v-else>Vernieuwen</span>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner show-message message="Schilderijen laden..." />
    </div>

    <!-- Paintings Grid -->
    <div
      v-else-if="filteredPaintings.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="painting in filteredPaintings"
        :key="painting.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-4 bg-gray-50 flex items-center justify-between">
          <h3 class="font-medium truncate">{{ painting.title }}</h3>
          <span
            v-if="painting.labelStatus"
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

        <!-- Image container for original aspect ratio -->
        <div class="relative bg-gray-100">
          <NuxtImg
            provider="cloudinary"
            :src="painting.id"
            format="webp"
            width="600"
            fit="inside"
            class="w-full h-auto object-contain mx-auto"
            :alt="painting.title"
          />
        </div>

        <div class="p-4">
          <div class="mb-4">
            <label class="block text-gray-700 mb-1 text-sm">Huidig Label</label>
            <div class="flex items-center">
              <input
                v-model="painting.currentLabel"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Geen label gevonden"
                readonly
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 mb-1 text-sm">Correct Label</label>
            <div class="flex items-center">
              <input
                v-model="painting.correctedLabel"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Voer correct label in"
              />
            </div>
          </div>

          <div class="flex justify-between">
            <button
              class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              :disabled="isUpdating"
              @click="verifyLabel(painting)"
            >
              Verifiëren
            </button>
            <button
              class="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              :disabled="
                isUpdating ||
                !painting.correctedLabel ||
                painting.correctedLabel === painting.currentLabel
              "
              @click="updateLabel(painting)"
            >
              Bijwerken
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600 mb-4">Geen schilderijen gevonden met de huidige filter.</p>
      <button class="btn btn-secondary" @click="labelFilter = 'all'">Toon alle schilderijen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  paintings: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['refresh']);

// State
const labelFilter = ref('all');
const isUpdating = ref(false);

// Computed properties for filtering
const filteredPaintings = computed(() => {
  if (labelFilter.value === 'all') {
    return props.paintings;
  }

  if (labelFilter.value === 'withLabel') {
    return props.paintings.filter((p) => p.currentLabel);
  }

  if (labelFilter.value === 'withoutLabel') {
    return props.paintings.filter((p) => !p.currentLabel);
  }

  if (labelFilter.value === 'needsReview') {
    return props.paintings.filter((p) => p.labelStatus === 'needs_review');
  }

  return props.paintings;
});

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

// Label verification and update
async function verifyLabel(painting) {
  if (isUpdating.value) return;

  isUpdating.value = true;

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
      throw new Error('Failed to verify label');
    }

    // Update local state
    painting.labelStatus = 'verified';

    // Show success notification
    alert(`Label voor "${painting.title}" is geverifieerd.`);
  } catch (error) {
    console.error('Error verifying label:', error);
    // Show error notification
    alert(`Fout bij het verifiëren van het label: ${error.message}`);
  } finally {
    isUpdating.value = false;
  }
}

async function updateLabel(painting) {
  if (isUpdating.value || !painting.correctedLabel) return;

  isUpdating.value = true;

  try {
    // Call API to update the label in Cloudinary
    const response = await fetch('/api/admin/update-label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: painting.id,
        labelNumber: painting.correctedLabel,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update label');
    }

    // Update local state
    painting.currentLabel = painting.correctedLabel;
    painting.labelStatus = 'verified';
    painting.title = `Nummer ${painting.correctedLabel}`;

    // Show success notification
    alert(`Label voor "${painting.title}" is bijgewerkt naar ${painting.correctedLabel}.`);
  } catch (error) {
    console.error('Error updating label:', error);
    // Show error notification
    alert(`Fout bij het bijwerken van het label: ${error.message}`);
  } finally {
    isUpdating.value = false;
  }
}
</script>
