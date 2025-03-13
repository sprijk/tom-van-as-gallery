<!-- File: components/FavoritesIndicator.vue -->
<template>
  <div class="relative">
    <NuxtLink
      to="/favorieten"
      class="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        :fill="favoritesCount > 0 ? 'currentColor' : 'none'"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span class="hidden md:inline">Favorieten</span>
      <span
        v-if="favoritesCount > 0"
        class="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full"
        >{{ favoritesCount }}</span
      >
    </NuxtLink>
  </div>
</template>

<script setup>
const { favoritesCount } = useFavorites();
</script>
