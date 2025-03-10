<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-grow container-custom py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// Layout component voor consistentie in alle pagina's
</script>
