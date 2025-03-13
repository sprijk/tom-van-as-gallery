<!-- File: components/PaintingCard.vue (update the existing file) -->
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
          <FavoriteButton
            :painting="painting"
            :is-favorite="isPaintingInFavorites(painting.id)"
            @toggle="toggleFavorite(painting)"
          />
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
