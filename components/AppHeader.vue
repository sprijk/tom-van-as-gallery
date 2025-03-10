<template>
  <header class="bg-white shadow">
    <div class="container-custom py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-serif font-bold text-primary"
            >Tom van As</span
          >
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <NuxtLink
            to="/"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/schilderijen"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Schilderijen
          </NuxtLink>
          <NuxtLink
            to="/over-tom"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Over Tom
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="md:hidden text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="!isMobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMobileMenuOpen" class="mt-4 pb-3 md:hidden">
        <div class="flex flex-col space-y-3">
          <NuxtLink
            to="/"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/schilderijen"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Schilderijen
          </NuxtLink>
          <NuxtLink
            to="/over-tom"
            class="font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Over Tom
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

// Sluit het mobiele menu als er een route wijziging is
watch(
  () => useRoute().fullPath,
  () => {
    isMobileMenuOpen.value = false;
  }
);
</script>
