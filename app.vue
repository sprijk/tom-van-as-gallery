<template>
  <NuxtLayout>
    <NuxtPage />

    <!-- Global notification for favorites -->
    <NotificationToast
      v-if="favoriteNotification.visible"
      :title="favoriteNotification.title"
      :message="favoriteNotification.message"
      :type="favoriteNotification.type"
      :visible="favoriteNotification.visible"
      @close="favoriteNotification.visible = false"
    />
  </NuxtLayout>
</template>

<script setup>
// Get global notification state
const { notification: favoriteNotification } = useFavorites();
</script>
