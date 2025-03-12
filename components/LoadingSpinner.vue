<template>
  <div class="flex justify-center items-center py-12">
    <div
      class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary relative"
    >
      <span class="sr-only">Laden...</span>
    </div>
    <p
      v-if="showMessage"
      class="ml-4 text-gray-600"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  showMessage: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'Laden...',
  },
})
</script>
