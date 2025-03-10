<template>
  <div class="group">
    <NuxtLink
      :to="`/schilderijen/${painting.id}`"
      class="block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div class="relative pb-[100%]">
        <NuxtImg
          provider="cloudinary"
          :src="painting.id"
          format="webp"
          width="600"
          height="600"
          fit="cover"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          :alt="painting.title"
        />
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
const props = defineProps({
  painting: {
    type: Object,
    required: true,
  },
});
</script>
