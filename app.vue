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

    <!-- Global toast notifications -->
    <NotificationToast
      v-if="globalToast.visible"
      :title="globalToast.title"
      :message="globalToast.message"
      :type="globalToast.type"
      :visible="globalToast.visible"
      :duration="globalToast.duration"
      @close="globalToast.visible = false"
    />
  </NuxtLayout>
</template>

<script setup>
// Get global notification states
const { notification: favoriteNotification } = useFavorites();
const { toast: globalToast } = useToast();
</script>
