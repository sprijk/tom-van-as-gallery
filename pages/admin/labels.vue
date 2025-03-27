<!-- pages/admin/labels.vue -->
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
          <h1 class="text-3xl font-serif font-bold">Label Verificatie</h1>
          <div class="flex space-x-4">
            <NuxtLink to="/admin/publish" class="btn btn-secondary">
              Naar Publicatiestatus
            </NuxtLink>
            <button class="btn btn-secondary" @click="logout">Uitloggen</button>
          </div>
        </div>

        <!-- Label Verification Tab -->
        <AdminLabelVerification
          :paintings="paintings"
          :is-loading="isLoading"
          @refresh="fetchPaintings"
        />
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

// Painting data and loading states
const { getAllPaintings } = useImageService();
const { showSuccess, showError, showInfo } = useToast();
const paintings = ref([]);
const isLoading = ref(true);

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

// Data fetching
async function fetchPaintings() {
  isLoading.value = true;

  try {
    // Add admin header to get all paintings including unpublished ones
    const headers = new Headers();
    headers.append('x-is-admin', 'true');

    const paintingsData = await getAllPaintings(true, headers); // Force refresh with admin headers

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

    showSuccess('Schilderijen succesvol geladen.', 'Data geladen');

    // Debug information
    console.log('Labels page - Loaded paintings:', paintings.value.length);
    if (paintings.value.length > 0) {
      console.log('Labels page - Sample painting:', JSON.stringify(paintings.value[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching paintings:', error);
    showError('Kon de schilderijen niet laden. Probeer het later nog eens.', 'Laad fout');
  } finally {
    isLoading.value = false;
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
  title: 'Label Verificatie | Admin Dashboard | Tom van As Kunstgalerij',
});
</script>
