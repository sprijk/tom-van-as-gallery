// pages/admin/index.vue
<template>
  <div>
    <!-- Login Form -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-serif font-bold mb-6">Admin Login</h1>

      <div v-if="loginError" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ loginError }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="password" class="block text-gray-700 mb-2">Wachtwoord</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Voer admin wachtwoord in"
            required
          />
        </div>

        <button type="submit" class="w-full btn btn-primary" :disabled="isLoggingIn">
          <span v-if="isLoggingIn">Inloggen...</span>
          <span v-else>Inloggen</span>
        </button>
      </form>
    </div>

    <!-- Admin Dashboard -->
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <button class="btn btn-secondary" @click="logout">Uitloggen</button>
      </div>

      <!-- Admin Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="flex space-x-8">
          <button
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="
              activeTab === 'labels'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
            @click="activeTab = 'labels'"
          >
            Label Verificatie
          </button>
          <button
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="
              activeTab === 'tags'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
            @click="activeTab = 'tags'"
          >
            Tags Beheren
          </button>
        </nav>
      </div>

      <!-- Label Verification Tab -->
      <div v-if="activeTab === 'labels'">
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
            <button class="btn btn-secondary" @click="fetchPaintings">
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

            <div class="relative">
              <NuxtImg
                provider="cloudinary"
                :src="painting.id"
                width="400"
                height="300"
                format="webp"
                fit="cover"
                class="w-full h-64 object-contain"
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
          <button class="btn btn-secondary" @click="labelFilter = 'all'">
            Toon alle schilderijen
          </button>
        </div>
      </div>

      <!-- Tag Management Tab -->
      <div v-else-if="activeTab === 'tags'">
        <div class="mb-6">
          <h2 class="text-xl font-medium mb-4">Tags Beheren</h2>
          <p class="text-gray-600 mb-6">
            Hier kun je tags toevoegen aan schilderijen of nieuwe tags aanmaken die beschikbaar zijn
            voor alle schilderijen.
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="painting in filteredPaintingsForTags"
              :key="painting.id"
              class="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div class="flex">
                <div class="w-1/3">
                  <NuxtImg
                    provider="cloudinary"
                    :src="painting.id"
                    width="150"
                    height="150"
                    format="webp"
                    fit="cover"
                    class="w-full h-full object-cover"
                    :alt="painting.title"
                  />
                </div>
                <div class="w-2/3 p-4">
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
                      <option
                        v-for="tag in availableTagsForPainting(painting)"
                        :key="tag"
                        :value="tag"
                      >
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
      </div>
    </div>
  </div>
</template>

<script setup>
// Authentication state
const password = ref('');
const isAuthenticated = ref(false);
const loginError = ref('');
const isLoggingIn = ref(false);

// Register the admin-auth middleware
definePageMeta({
  middleware: ['admin-auth'],
});

// Tab management
const activeTab = ref('labels');

// Painting data and loading states
const { getAllPaintings, getAllTags } = useCloudinary();
const paintings = ref([]);
const allTags = ref([]);
const isLoading = ref(false);
const isUpdating = ref(false);

// Filtering
const labelFilter = ref('all');
const tagSearchQuery = ref('');

// Tag management
const newGlobalTag = ref('');
const paintingNewTag = ref({});

// Computed properties for filtering
const filteredPaintings = computed(() => {
  if (labelFilter.value === 'all') {
    return paintings.value;
  }

  if (labelFilter.value === 'withLabel') {
    return paintings.value.filter((p) => p.currentLabel);
  }

  if (labelFilter.value === 'withoutLabel') {
    return paintings.value.filter((p) => !p.currentLabel);
  }

  if (labelFilter.value === 'needsReview') {
    return paintings.value.filter((p) => p.labelStatus === 'needs_review');
  }

  return paintings.value;
});

const filteredPaintingsForTags = computed(() => {
  if (!tagSearchQuery.value) {
    return paintings.value.slice(0, 10); // Show first 10 by default
  }

  const query = tagSearchQuery.value.toLowerCase();
  return paintings.value.filter((p) => p.title.toLowerCase().includes(query));
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

function availableTagsForPainting(painting) {
  const paintingTags = painting.tags || [];
  return allTags.value.filter((tag) => !paintingTags.includes(tag));
}

// Authentication
async function handleLogin() {
  isLoggingIn.value = true;
  loginError.value = '';

  try {
    // Make an API call to verify the password
    const response = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password.value }),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.success) {
        isAuthenticated.value = true;

        // Store authentication state in localStorage or cookie
        if (import.meta.client) {
          localStorage.setItem('adminAuthenticated', 'true');
        }

        // Fetch data for admin dashboard
        fetchPaintings();
        fetchTags();
      } else {
        loginError.value = 'Incorrect wachtwoord';
      }
    } else {
      loginError.value = 'Er ging iets mis bij het verifiëren van het wachtwoord';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.value = 'Er ging iets mis bij het inloggen. Probeer het opnieuw.';
  } finally {
    isLoggingIn.value = false;
  }
}

function logout() {
  isAuthenticated.value = false;
  password.value = '';

  // Clear authentication state
  if (import.meta.client) {
    localStorage.removeItem('adminAuthenticated');
  }
}

// Data fetching
async function fetchPaintings() {
  isLoading.value = true;

  try {
    const paintingsData = await getAllPaintings(true); // Force refresh

    // Enhance painting data with label information
    paintings.value = paintingsData.map((painting) => {
      // Extract label_number from context if available
      const labelNumber = extractLabelNumber(painting);

      // Determine label status
      let labelStatus = 'missing';
      if (labelNumber) {
        labelStatus = 'needs_review'; // Default to needs review for any label

        // In a real implementation, you'd check if it's been verified before
        // Here we're simulating that with a random check
        if (painting.verified) {
          labelStatus = 'verified';
        }
      }

      return {
        ...painting,
        currentLabel: labelNumber || '',
        correctedLabel: labelNumber || '',
        labelStatus,
        tags: painting.tags || [],
      };
    });
  } catch (error) {
    console.error('Error fetching paintings:', error);
    // Show error notification
  } finally {
    isLoading.value = false;
  }
}

async function fetchTags() {
  try {
    allTags.value = await getAllTags(true); // Force refresh
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
}

// Extract label number from painting metadata
function extractLabelNumber(painting) {
  // In a real implementation, this would come from the Cloudinary metadata
  // Here we're simulating based on the title
  if (painting.title && painting.title.startsWith('Nummer ')) {
    return painting.title.replace('Nummer ', '');
  }
  return null;
}

// Label verification and update
async function verifyLabel(painting) {
  if (isUpdating.value) return;

  isUpdating.value = true;

  try {
    // In a real implementation, you'd call an API to update the verification status

    // Update local state
    painting.labelStatus = 'verified';

    // Show success notification
    alert(`Label voor "${painting.title}" is geverifieerd.`);
  } catch (error) {
    console.error('Error verifying label:', error);
    // Show error notification
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

    // Update local state
    allTags.value.push(newGlobalTag.value.trim());
    newGlobalTag.value = '';

    // Show success notification
    alert(`Tag "${newGlobalTag.value}" is toegevoegd.`);
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

    // Update local state
    allTags.value = allTags.value.filter((t) => t !== tag);

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

// Check authentication status on page load
onMounted(() => {
  if (import.meta.client) {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (authenticated) {
      isAuthenticated.value = true;
      fetchPaintings();
      fetchTags();
    }
  }
});

// SEO meta tags
useHead({
  title: 'Admin Dashboard | Tom van As Kunstgalerij',
});
</script>
