<template>
  <div>
    <div
      v-if="paintings.length === 0"
      class="text-center py-12"
    >
      <h3 class="text-xl text-gray-600">
        Geen schilderijen gevonden die overeenkomen met de filters.
      </h3>
      <button
        class="mt-4 btn btn-primary"
        @click="$emit('clearFilters')"
      >
        Wis filters
      </button>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <PaintingCard
        v-for="painting in paintings"
        :key="painting.id"
        :painting="painting"
      />
    </div>

    <div
      v-if="showLoadMore && paintings.length > 0"
      class="text-center mt-10"
    >
      <button
        class="btn btn-secondary"
        @click="$emit('loadMore')"
      >
        Meer laden
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  paintings: {
    type: Array,
    required: true,
  },
  showLoadMore: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['loadMore', 'clearFilters'])
</script>
