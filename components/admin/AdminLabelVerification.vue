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
        class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        @click="openDetailView(painting)"
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
            provider="imagor"
            :src="painting.destPath"
            format="webp"
            width="600"
            fit="inside"
            class="w-full h-auto object-contain mx-auto"
            :alt="painting.title"
          />
        </div>

        <div class="p-4">
          <div class="mb-2">
            <div class="flex justify-between items-center">
              <label class="block text-gray-700 text-sm">Huidig Label</label>
              <span class="text-sm text-gray-500">Klik voor details</span>
            </div>
            <div class="mt-1 flex items-center">
              <input
                :value="painting.currentLabel || 'Geen label'"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readonly
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600 mb-4">Geen schilderijen gevonden met de huidige filter.</p>
      <button class="btn btn-secondary" @click="labelFilter = 'all'">Toon alle schilderijen</button>
    </div>

    <!-- Detail View Modal -->
    <AdminPaintingDetail
      v-if="showDetailView && selectedPainting"
      :painting="selectedPainting"
      :has-previous="hasPrevious"
      :has-next="hasNext"
      :is-updating="isUpdating"
      @close="closeDetailView"
      @navigate="navigatePainting"
      @verify="verifyLabel"
      @update="updateLabel"
    />
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

// Import toast notifications
const { showSuccess, showError } = useToast();

// State
const labelFilter = ref('all');
const isUpdating = ref(false);
const showDetailView = ref(false);
const selectedPainting = ref(null);
const selectedIndex = ref(-1);

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

// Navigation properties
const hasPrevious = computed(() => {
  return selectedIndex.value > 0;
});

const hasNext = computed(() => {
  return selectedIndex.value < filteredPaintings.value.length - 1;
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

// Detail view handlers
function openDetailView(painting) {
  selectedPainting.value = painting;
  selectedIndex.value = filteredPaintings.value.indexOf(painting);
  showDetailView.value = true;
}

function closeDetailView() {
  showDetailView.value = false;
  setTimeout(() => {
    selectedPainting.value = null;
    selectedIndex.value = -1;
  }, 200);
}

function navigatePainting(direction) {
  if (direction === 'prev' && hasPrevious.value) {
    selectedIndex.value--;
  } else if (direction === 'next' && hasNext.value) {
    selectedIndex.value++;
  }

  selectedPainting.value = filteredPaintings.value[selectedIndex.value];
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

    // Update the selected painting reference (to ensure reactivity)
    selectedPainting.value = { ...painting };

    // Show success notification
    showSuccess(`Label voor "${painting.title}" is geverifieerd.`, 'Label geverifieerd');

    // Navigate to next painting if available
    if (hasNext.value) {
      navigatePainting('next');
    } else {
      closeDetailView();
    }
  } catch (error) {
    console.error('Error verifying label:', error);
    // Show error notification
    showError(`Fout bij het verifiëren van het label: ${error.message}`, 'Verificatie mislukt');
  } finally {
    isUpdating.value = false;
  }
}

async function updateLabel(data) {
  if (isUpdating.value || !data.correctedLabel) return;

  isUpdating.value = true;
  const painting = data;

  try {
    // Call API to update the label
    const response = await fetch('/api/admin/update-label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: painting.id,
        labelNumber: data.correctedLabel,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update label');
    }

    // Update local state
    const updatedPainting = { ...painting };
    updatedPainting.currentLabel = data.correctedLabel;
    updatedPainting.labelStatus = 'verified';
    updatedPainting.title = `Nummer ${data.correctedLabel}`;

    // Find and update the painting in the paintings array
    const index = props.paintings.findIndex((p) => p.id === painting.id);
    if (index !== -1) {
      props.paintings[index] = updatedPainting;
    }

    // Update the selected painting reference
    selectedPainting.value = updatedPainting;

    // Show success notification
    showSuccess(
      `Label voor "${updatedPainting.title}" is bijgewerkt naar ${data.correctedLabel}.`,
      'Label bijgewerkt'
    );
  } catch (error) {
    console.error('Error updating label:', error);
    // Show error notification
    showError(`Fout bij het bijwerken van het label: ${error.message}`, 'Bijwerken mislukt');
  } finally {
    isUpdating.value = false;
  }
}
</script>
