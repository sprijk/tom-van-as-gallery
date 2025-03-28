<!-- pages/admin/publish.vue -->
<template>
  <div>
    <ClientOnly>
      <!-- Login Form -->
      <AdminLogin
        v-if="!isAuthenticated"
        :is-logging-in="isLoggingIn"
        :login-error="loginError"
        @login="handleLogin"
      />

      <!-- Admin Dashboard -->
      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-serif font-bold">Publicatiestatus</h1>
          <div class="flex space-x-4">
            <NuxtLink to="/admin/labels" class="btn btn-secondary">
              Naar Label Verificatie
            </NuxtLink>
            <button class="btn btn-secondary" @click="logout">Uitloggen</button>
          </div>
        </div>

        <!-- Pagination Controls (Top) -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <label for="pageSize" class="mr-2">Items per pagina:</label>
            <select
              id="pageSize"
              v-model="pageSize"
              class="border rounded px-2 py-1"
              @change="updatePageSize"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="flex items-center">
            <button class="btn btn-secondary mr-2" :disabled="currentPage === 1" @click="prevPage">
              Vorige
            </button>
            <span>Pagina {{ currentPage }} van {{ totalPages }}</span>
            <button
              class="btn btn-secondary ml-2"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Volgende
            </button>
          </div>
        </div>

        <!-- Publication Management Tab -->
        <AdminPublishManagement
          :paintings="paginatedPaintings"
          :is-loading="isLoading"
          @refresh="fetchPaintings"
          @update="handlePublishUpdate"
        />

        <!-- Pagination Controls (Bottom) -->
        <div class="flex justify-center mt-4">
          <button class="btn btn-secondary mr-2" :disabled="currentPage === 1" @click="prevPage">
            Vorige
          </button>
          <span>Pagina {{ currentPage }} van {{ totalPages }}</span>
          <button
            class="btn btn-secondary ml-2"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Volgende
          </button>
        </div>

        <!-- Debug information -->
        <div v-if="debugMode" class="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 class="text-lg font-bold mb-2">Debug Information</h2>
          <p>Total paintings loaded: {{ paintings.length }}</p>
          <p>Image Example URL:</p>
          <code
            v-if="paintings.length > 0"
            class="block bg-gray-200 p-2 rounded mt-2 overflow-x-auto text-xs"
          >
            {{ getImageUrl(paintings[0]) }}
          </code>
          <div class="mt-4">
            <button class="px-3 py-1 bg-gray-300 rounded text-sm" @click="toggleDebugMode">
              Hide Debug Info
            </button>
          </div>
        </div>
        <div v-else class="mt-8">
          <button class="px-3 py-1 bg-gray-200 rounded text-sm" @click="toggleDebugMode">
            Show Debug Info
          </button>
        </div>
      </div>

      <template #fallback>
        <div class="py-12 text-center">
          <LoadingSpinner show-message message="Admin dashboard laden..." />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Register the admin-auth middleware
definePageMeta({
  middleware: ['admin-auth'],
});

// Authentication state
const isAuthenticated = ref(false);
const loginError = ref('');
const isLoggingIn = ref(false);
const debugMode = ref(false);

// Painting data and loading states
const { getAllPaintings } = useImageService();
const { showSuccess, showError, showInfo } = useToast();
const paintings = ref([]);
const isLoading = ref(true);

// Pagination
const currentPage = ref(1);
const pageSize = ref(20); // Adjust as needed
const totalPaintings = ref(0);
const totalPages = ref(1);
const paginatedPaintings = ref(ref([]));

// Toggle debug mode
function toggleDebugMode() {
  debugMode.value = !debugMode.value;
}

// Authentication
async function handleLogin(password) {
  isLoggingIn.value = true;
  loginError.value = '';

  try {
    // Make an API call to verify the password
    const response = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.success) {
        isAuthenticated.value = true;

        // Store authentication state in localStorage or cookie
        if (import.meta.client) {
          localStorage.setItem('adminAuthenticated', 'true');
        }

        // Show success toast
        showSuccess('Je bent succesvol ingelogd als administrator.', 'Ingelogd');

        // Fetch data for admin dashboard
        fetchPaintings();
      } else {
        loginError.value = 'Incorrect wachtwoord';
        showError('Het ingevoerde wachtwoord is incorrect.', 'Aanmelding mislukt');
      }
    } else {
      loginError.value = 'Er ging iets mis bij het verifiëren van het wachtwoord';
      showError('Er ging iets mis bij het verifiëren van het wachtwoord.', 'Server fout');
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.value = 'Er ging iets mis bij het inloggen. Probeer het opnieuw.';
    showError('Er ging iets mis bij het inloggen. Probeer het opnieuw.', 'Verbindingsfout');
  } finally {
    isLoggingIn.value = false;
  }
}

function logout() {
  isAuthenticated.value = false;

  // Clear authentication state
  if (import.meta.client) {
    localStorage.removeItem('adminAuthenticated');
  }

  showInfo('Je bent uitgelogd.', 'Uitgelogd');
}

// Helper function for debug display
function getImageUrl(painting) {
  if (!painting) return 'No painting selected';

  const config = useRuntimeConfig();
  const imagorBaseUrl = config.public.imagorBaseUrl;

  // This constructs the URL that would be used by NuxtImg with imagor provider
  return `${imagorBaseUrl}/unsafe/fit-in/400x/${painting.destPath}`;
}

// Data fetching
async function fetchPaintings() {
  isLoading.value = true;

  try {
    // Add admin header to get all paintings including unpublished ones
    const headers = new Headers();
    headers.append('x-is-admin', 'true');

    const paintingsData = await getAllPaintings(true, headers); // Force refresh with admin headers

    console.log('Publish page - Raw paintings data:', paintingsData.length);

    // Enhance painting data with label information
    paintings.value = paintingsData.map((painting) => {
      // Extract label_number from context if available
      const labelNumber = extractLabelNumber(painting);

      // Determine label status
      let labelStatus = 'missing';
      if (labelNumber) {
        labelStatus = 'needs_review'; // Default to needs review for any label

        // In a real implementation, you'd check if it's been verified before
        // Here we're checking the verified property from the API
        if (painting.verified) {
          labelStatus = 'verified';
        }
      }

      return {
        ...painting,
        currentLabel: labelNumber || '',
        correctedLabel: labelNumber || '',
        labelStatus,
        published: painting.published !== undefined ? painting.published : true, // Default to published if not specified
      };
    });

    totalPaintings.value = paintings.value.length;
    totalPages.value = Math.ceil(totalPaintings.value / pageSize.value);
    updatePaginatedPaintings();

    showSuccess('Schilderijen succesvol geladen.', 'Data geladen');

    // Debug information
    console.log('Publish page - Processed paintings:', paintings.value.length);
    if (paintings.value.length > 0) {
      console.log('Publish page - Sample painting:', JSON.stringify(paintings.value[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching paintings:', error);
    showError('Kon de schilderijen niet laden. Probeer het later nog eens.', 'Laad fout');
  } finally {
    isLoading.value = false;
  }
}

function updatePaginatedPaintings() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedPaintings.value = paintings.value.slice(start, end);
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updatePaginatedPaintings();
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    updatePaginatedPaintings();
  }
}

function updatePageSize() {
  currentPage.value = 1; // Reset to the first page when page size changes
  totalPages.value = Math.ceil(totalPaintings.value / pageSize.value);
  updatePaginatedPaintings();
}

// Handle publication status update
function handlePublishUpdate({ id, published }) {
  console.log(`Handling publish update for id: ${id}, published: ${published}`);

  // Update our local state
  const paintingIndex = paintings.value.findIndex((p) => p.id === id);
  if (paintingIndex !== -1) {
    const painting = paintings.value[paintingIndex];
    console.log('Before update:', { ...painting });

    // Create a new object to ensure reactivity
    const updatedPainting = {
      ...painting,
      published: published,
    };

    // Replace the painting in the array
    paintings.value.splice(paintingIndex, 1, updatedPainting);

    console.log('After update:', { ...updatedPainting });
  } else {
    console.warn(`Painting with id ${id} not found in paintings array`);
  }
}

// Extract label number from painting metadata
function extractLabelNumber(painting) {
  // In a real implementation, this would come from the Cloudinary metadata
  // Here we're accessing the labelNumber property returned from the API
  return painting.labelNumber || null;
}

// Check authentication status on page load
onMounted(() => {
  if (import.meta.client) {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (authenticated) {
      isAuthenticated.value = true;
      fetchPaintings();
    }
  }
});

// SEO meta tags
useHead({
  title: 'Publicatiestatus | Admin Dashboard | Tom van As Kunstgalerij',
});
</script>
