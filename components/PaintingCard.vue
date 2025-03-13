<!-- Modified PaintingCard.vue with tooltip -->
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
        <!-- Favorite button -->
        <div class="absolute top-2 right-2 z-10">
          <div class="relative">
            <FavoriteButton
              :painting="painting"
              :is-favorite="isPaintingInFavorites(painting.id)"
              @toggle="toggleFavorite(painting)"
            />

            <!-- Tooltip that appears on hover -->
            <div
              class="hidden group-hover:block absolute right-0 top-full mt-2 bg-white text-gray-800 text-xs rounded shadow-md p-2 w-48 pointer-events-none"
            >
              <p>Klik op het hart om dit schilderij aan je favorieten toe te voegen</p>
              <div class="absolute -top-1 right-3 w-2 h-2 bg-white transform rotate-45"></div>
            </div>
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
