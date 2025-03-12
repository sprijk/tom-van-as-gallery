<!-- components/admin/AdminLogin.vue -->
<template>
  <div class="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
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
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  isLoggingIn: {
    type: Boolean,
    default: false,
  },
  loginError: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['login']);

const password = ref('');

function handleLogin() {
  emit('login', password.value);
}
</script>
