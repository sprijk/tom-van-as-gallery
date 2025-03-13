<!-- File: components/FavoriteButton.vue -->
<template>
  <button
    class="rounded-full p-2 transition-colors"
    :class="[
      isFavorite
        ? 'bg-primary text-white hover:bg-primary-dark'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ]"
    :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
    @click.stop="toggleFavorite"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      :fill="isFavorite ? 'currentColor' : 'none'"
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
  </button>
</template>

<script setup>
defineProps({
  painting: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle']);

function toggleFavorite(event) {
  // Prevent parent link click event
  event.stopPropagation();
  event.preventDefault();

  emit('toggle');
}
</script>
