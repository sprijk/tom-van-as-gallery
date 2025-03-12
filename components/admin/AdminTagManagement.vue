<!-- components/admin/AdminTagManagement.vue -->
<template>
  <div class="mb-6">
    <h2 class="text-xl font-medium mb-4">Tags Beheren</h2>
    <p class="text-gray-600 mb-6">
      Hier kun je tags toevoegen aan schilderijen of nieuwe tags aanmaken die beschikbaar zijn voor
      alle schilderijen.
    </p>

    <!-- Global Tags Management -->
    <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Alle Tags</h3>

      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in allTags"
          :key="tag"
          class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center"
        >
          {{ tag }}
          <button class="ml-2 text-gray-500 hover:text-red-500" @click="removeGlobalTag(tag)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
        </span>
      </div>

      <div class="flex">
        <input
          v-model="newGlobalTag"
          type="text"
          class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nieuwe tag toevoegen..."
        />
        <button
          class="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
          :disabled="!newGlobalTag.trim()"
          @click="addGlobalTag"
        >
          Toevoegen
        </button>
      </div>
    </div>

    <!-- Painting Tag Management -->
    <div class="mb-4">
      <label for="painting-search" class="block text-gray-700 mb-2">Zoek schilderij</label>
      <div class="relative">
        <input
          id="painting-search"
          v-model="tagSearchQuery"
          type="text"
          class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Zoek op titel..."
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <LoadingSpinner show-message message="Laden..." />
    </div>

    <!-- Modified painting list for Tag Management -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="painting in filteredPaintingsForTags"
        :key="painting.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Modified image container for original aspect ratio -->
          <div class="md:w-1/3 bg-gray-100">
            <NuxtImg
              provider="cloudinary"
              :src="painting.id"
              format="webp"
              quality="auto:best"
              fit="inside"
              class="w-full h-auto object-contain mx-auto"
              :alt="painting.title"
            />
          </div>
          <div class="md:w-2/3 p-4">
            <h3 class="font-medium mb-2 truncate">{{ painting.title }}</h3>

            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-1">Huidige tags:</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in painting.tags"
                  :key="`${painting.id}-${tag}`"
                  class="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center"
                >
                  {{ tag }}
                  <button
                    class="ml-1 text-gray-500 hover:text-red-500"
                    @click="removeTagFromPainting(painting, tag)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3"
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
                </span>
                <span
                  v-if="!painting.tags || painting.tags.length === 0"
                  class="text-xs text-gray-500"
                >
                  Geen tags
                </span>
              </div>
            </div>

            <div class="flex">
              <select
                v-model="paintingNewTag[painting.id]"
                class="flex-grow px-2 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Kies een tag...</option>
                <option v-for="tag in availableTagsForPainting(painting)" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
              <button
                class="px-2 py-1 text-sm bg-primary text-white rounded-r-md hover:bg-primary-dark"
                :disabled="!paintingNewTag[painting.id]"
                @click="addTagToPainting(painting)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
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
  allTags: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

// Tag management
const newGlobalTag = ref('');
const paintingNewTag = ref({});
const tagSearchQuery = ref('');

// Computed properties
const filteredPaintingsForTags = computed(() => {
  if (!tagSearchQuery.value) {
    return props.paintings.slice(0, 10); // Show first 10 by default
  }

  const query = tagSearchQuery.value.toLowerCase();
  return props.paintings.filter((p) => p.title.toLowerCase().includes(query));
});

// Helper functions
function availableTagsForPainting(painting) {
  const paintingTags = painting.tags || [];
  return props.allTags.filter((tag) => !paintingTags.includes(tag));
}

// Tag management
async function addGlobalTag() {
  if (!newGlobalTag.value.trim()) return;

  try {
    // Call API to add a new global tag
    const response = await fetch('/api/admin/add-tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag: newGlobalTag.value.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tag');
    }

    // Add to local state
    if (!props.allTags.includes(newGlobalTag.value.trim())) {
      props.allTags.push(newGlobalTag.value.trim());
    }

    newGlobalTag.value = '';

    // Show success notification
    alert(`Tag is toegevoegd.`);
  } catch (error) {
    console.error('Error adding tag:', error);
    // Show error notification
    alert(`Fout bij het toevoegen van de tag: ${error.message}`);
  }
}

async function removeGlobalTag(tag) {
  try {
    // Call API to remove a global tag
    const response = await fetch('/api/admin/remove-tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove tag');
    }

    // Remove from allTags
    const index = props.allTags.indexOf(tag);
    if (index !== -1) {
      props.allTags.splice(index, 1);
    }

    // Show success notification
    alert(`Tag "${tag}" is verwijderd.`);
  } catch (error) {
    console.error('Error removing tag:', error);
    // Show error notification
    alert(`Fout bij het verwijderen van de tag: ${error.message}`);
  }
}

async function addTagToPainting(painting) {
  const tag = paintingNewTag.value[painting.id];
  if (!tag) return;

  try {
    // Call API to add tag to painting
    const response = await fetch('/api/admin/add-painting-tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: painting.id,
        tag,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tag to painting');
    }

    // Update local state
    if (!painting.tags) {
      painting.tags = [];
    }
    painting.tags.push(tag);
    paintingNewTag.value[painting.id] = '';

    // Show success notification
    alert(`Tag "${tag}" is toegevoegd aan ${painting.title}.`);
  } catch (error) {
    console.error('Error adding tag to painting:', error);
    // Show error notification
    alert(`Fout bij het toevoegen van de tag: ${error.message}`);
  }
}

async function removeTagFromPainting(painting, tag) {
  try {
    // Call API to remove tag from painting
    const response = await fetch('/api/admin/remove-painting-tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: painting.id,
        tag,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove tag from painting');
    }

    // Update local state
    painting.tags = painting.tags.filter((t) => t !== tag);

    // Show success notification
    alert(`Tag "${tag}" is verwijderd van ${painting.title}.`);
  } catch (error) {
    console.error('Error removing tag from painting:', error);
    // Show error notification
    alert(`Fout bij het verwijderen van de tag: ${error.message}`);
  }
}
</script>
