<!-- components/admin/AdminPublishManagement.vue -->
<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-xl font-medium">Publicatiestatus Beheren</h2>
      <div class="flex items-center space-x-4">
        <select
          v-model="publishFilter"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Alle schilderijen</option>
          <option value="published">Gepubliceerd</option>
          <option value="unpublished">Niet gepubliceerd</option>
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
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div
          class="p-4 bg-gray-50 flex items-center justify-between"
          :class="{ 'bg-red-50': !painting.published }"
        >
          <h3 class="font-medium truncate">{{ painting.title }}</h3>
          <span
            :class="{
              'px-2 py-1 text-xs rounded-full': true,
              'bg-green-100 text-green-800': painting.published,
              'bg-gray-100 text-gray-800': !painting.published,
            }"
          >
            {{ painting.published ? 'Gepubliceerd' : 'Niet gepubliceerd' }}
          </span>
        </div>

        <!-- Publish toggle -->
        <div class="p-4 border-t border-gray-200 flex items-center justify-between">
          <PublishToggle
            :painting-id="painting.id"
            :published="painting.published"
            @update="togglePublishStatus"
          />
        </div>

        <!-- Image container -->
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
          <div
            v-if="!painting.published"
            class="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center"
          >
            <span class="text-white text-sm font-medium px-3 py-1 rounded-full bg-gray-800">
              Niet gepubliceerd
            </span>
          </div>
        </div>

        <div class="p-4">
          <div class="mb-3">
            <div class="text-sm text-gray-500 mb-2">
              Categorie: {{ painting.category || 'Geen categorie' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600 mb-4">Geen schilderijen gevonden met de huidige filter.</p>
      <button class="btn btn-secondary" @click="publishFilter = 'all'">
        Toon alle schilderijen
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import PublishToggle from './PublishToggle.vue';

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

const emit = defineEmits(['refresh', 'update']);

// Import toast notifications
const { showSuccess, showError } = useToast();

// State
const publishFilter = ref('all');
const updateStates = reactive({});

// Computed properties for filtering
const filteredPaintings = computed(() => {
  if (publishFilter.value === 'all') {
    return props.paintings;
  }

  if (publishFilter.value === 'published') {
    return props.paintings.filter((p) => p.published);
  }

  if (publishFilter.value === 'unpublished') {
    return props.paintings.filter((p) => !p.published);
  }

  return props.paintings;
});

// Toggle publish status of a painting
async function togglePublishStatus({ id, published }) {
  // Get the painting to update
  const painting = props.paintings.find((p) => p.id === id);
  if (!painting) return;

  // Set updating state
  updateStates[id] = true;

  try {
    const response = await fetch('/api/admin/toggle-published', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: id,
        published: published,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update published status');
    }

    // Update the painting in the array
    painting.published = published;

    // Show success message
    showSuccess(
      `Schilderij is ${published ? 'gepubliceerd' : 'niet meer gepubliceerd'}.`,
      'Status bijgewerkt'
    );

    // Notify parent of the update
    emit('update', { id, published });
  } catch (error) {
    console.error('Error updating published status:', error);

    // Revert to previous state in UI
    painting.published = !published;

    showError(`Fout bij het bijwerken van de publicatiestatus: ${error.message}`, 'Update mislukt');
  } finally {
    // Clear updating state
    updateStates[id] = false;
  }
}
</script>
