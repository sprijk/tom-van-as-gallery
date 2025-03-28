<!-- pages/admin/index.vue (updated to redirect) -->
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
      <div v-else class="py-12 text-center">
        <h1 class="text-3xl font-serif font-bold mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <h2 class="text-2xl font-serif font-semibold mb-4">Label Verificatie</h2>
            <p class="text-gray-600 mb-6">
              Controleer en verifieer de labels van schilderijen in de collectie.
            </p>
            <NuxtLink to="/admin/labels" class="btn btn-primary w-full">
              Ga naar Label Verificatie
            </NuxtLink>
          </div>

          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <h2 class="text-2xl font-serif font-semibold mb-4">Publicatiestatus</h2>
            <p class="text-gray-600 mb-6">
              Beheer welke schilderijen zichtbaar zijn op de website.
            </p>
            <NuxtLink to="/admin/publish" class="btn btn-primary w-full">
              Ga naar Publicatiestatus
            </NuxtLink>
          </div>
        </div>

        <div class="mt-8">
          <button class="btn btn-secondary" @click="logout">Uitloggen</button>
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

// Toast notification service
const { showSuccess, showError, showInfo } = useToast();

// Authentication
async function handleLogin(password) {
  isLoggingIn.value = true;
  loginError.value = '';

  try {
    const { data, error } = await useFetch('/api/admin/verify-password', {
      method: 'POST',
      body: { password },
    });

    if (error.value) {
      throw error.value;
    }

    if (data.value?.success) {
      isAuthenticated.value = true;

      // Store authentication state in localStorage or cookie
      if (import.meta.client) {
        localStorage.setItem('adminAuthenticated', 'true');
      }

      // Show success toast
      showSuccess('Je bent succesvol ingelogd als administrator.', 'Ingelogd');
    } else {
      loginError.value = 'Incorrect wachtwoord';
      showError('Het ingevoerde wachtwoord is incorrect.', 'Aanmelding mislukt');
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

// Check authentication status on page load
onMounted(() => {
  if (import.meta.client) {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (authenticated) {
      isAuthenticated.value = true;
    }
  }
});

// SEO meta tags
useHead({
  title: 'Admin Dashboard | Tom van As Kunstgalerij',
});
</script>
