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

    const paintingsData = await getAllPaintings(true, headers);

    // Validate paintingsData
    if (!paintingsData) {
      console.error('getAllPaintings returned null');
      showError('Geen schilderijen kunnen ophalen. Er is een technisch probleem.', 'Ophaalfout');
      paintings.value = [];
      return;
    }

    // Ensure paintingsData is an array
    const paintingsArray = Array.isArray(paintingsData) ? paintingsData : [];

    // Enhance painting data with label information
    paintings.value = paintingsArray.map((painting) => {
      return {
        ...painting,
        currentLabel: painting.labelNumber || '',
        correctedLabel: painting.labelNumber || '',
        labelStatus: determineLabelStatus(painting),
        published: painting.published !== undefined ? painting.published : true, // Default to published if not specified
      };
    });
    // .slice(0, 40); // Limit to 10 paintings for now

    showSuccess('Schilderijen succesvol geladen.', 'Data geladen');

    // Debug information
    console.log('Labels page - Loaded paintings:', paintings.value.length);
    if (paintings.value.length > 0) {
      console.log('Labels page - Sample painting:', JSON.stringify(paintings.value[0], null, 2));
    }
  } catch (error) {
    console.error('Error fetching paintings:', error);
    showError('Kon de schilderijen niet laden. Probeer het later nog eens.', 'Laad fout');
    paintings.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Determine label status
function determineLabelStatus(painting) {
  if (!painting.labelNumber) {
    return 'missing';
  }

  // In a real implementation, this would come from server-side verification
  // Here we default to 'needs_review' for any label
  return painting.verified ? 'verified' : 'needs_review';
}

// Check authentication status on page load
onMounted(() => {
  if (import.meta.client) {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (authenticated) {
      isAuthenticated.value = true;
    }
  }
});

fetchPaintings();

// SEO meta tags
useHead({
  title: 'Label Verificatie | Admin Dashboard | Tom van As Kunstgalerij',
});
</script>
