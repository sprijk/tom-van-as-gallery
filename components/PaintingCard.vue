<!-- Modified PaintingCard.vue with unpublished indicator for admin -->
<template>
  <div class="group relative">
    <NuxtLink
      :to="`/schilderijen/${painting.id}`"
      class="block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div class="relative pb-[75%] bg-gray-100">
        <NuxtImg
          provider="cloudinary"
          :src="painting.id"
          format="webp"
          width="600"
          height="600"
          fit="contain"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          :alt="painting.title"
        />

        <!-- Unpublished indicator for admin -->
        <div
          v-if="isAdmin && painting.published === false"
          class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
        >
          <span class="text-white text-sm font-medium px-3 py-1 rounded-full bg-gray-800">
            Niet gepubliceerd
          </span>
        </div>

        <!-- Favorite button -->
        <div class="absolute top-2 right-2 z-10">
          <div class="relative">
            <FavoriteButton
              :painting="painting"
              :is-favorite="isPaintingInFavorites(painting.id)"
              @toggle="toggleFavorite(painting)"
            />

            <!-- Tooltip that appears on hover -->
            <!-- <div
              class="hidden group-hover:block absolute right-0 top-full mt-2 bg-white text-gray-800 text-xs rounded shadow-md p-2 w-48 pointer-events-none"
            >
              <p>Klik op het hart om dit schilderij aan je favorieten toe te voegen</p>
              <div class="absolute -top-1 right-3 w-2 h-2 bg-white transform rotate-45"></div>
            </div> -->
          </div>
        </div>
      </div>
      <div class="p-4 bg-white">
        <h3 class="text-lg font-semibold mb-1 text-gray-900">
          {{ painting.title }}
        </h3>
        <div v-if="painting.category" class="mb-2">
          <span
            class="inline-block bg-secondary-light text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
          >
            {{ painting.category }}
          </span>
        </div>

        <!-- Admin indicator for publishing status -->
        <div v-if="isAdmin && painting.published === false" class="mt-2">
          <span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
            Niet gepubliceerd
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  painting: {
    type: Object,
    required: true,
  },
});

// Check if user is admin
const isAdmin = computed(() => {
  if (import.meta.client) {
    return localStorage.getItem('adminAuthenticated') === 'true';
  }
  return false;
});

// Use the favorites composable
const { addFavorite, removeFavorite, isPaintingInFavorites } = useFavorites();

// Toggle favorite status
function toggleFavorite(painting) {
  if (isPaintingInFavorites(painting.id)) {
    removeFavorite(painting.id);
  } else {
    addFavorite(painting);
  }
}
</script>
