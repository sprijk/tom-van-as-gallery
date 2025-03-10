<template>
  <div>
    <div v-if="isLoading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
      ></div>
    </div>

    <template v-else>
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <NuxtLink
                to="/"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                  ></path>
                </svg>
                Home
              </NuxtLink>
            </li>
            <li>
              <div class="flex items-center">
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <NuxtLink
                  to="/schilderijen"
                  class="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2"
                >
                  Schilderijen
                </NuxtLink>
              </div>
            </li>
            <li v-if="painting && painting.category" aria-current="page">
              <div class="flex items-center">
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <NuxtLink
                  :to="`/schilderijen?category=${painting.category}`"
                  class="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2"
                >
                  {{ painting.category }}
                </NuxtLink>
              </div>
            </li>
            <li aria-current="page">
              <div class="flex items-center">
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  class="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate max-w-xs"
                >
                  {{ painting?.title || "Schilderij details" }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Schilderij Detail Component -->
      <PaintingDetail :painting="painting" />

      <!-- Gerelateerde schilderijen -->
      <section v-if="relatedPaintings.length > 0" class="mt-16">
        <h2 class="text-2xl font-serif font-semibold mb-6">
          Gerelateerde schilderijen
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <PaintingCard
            v-for="relPainting in relatedPaintings"
            :key="relPainting.id"
            :painting="relPainting"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
const route = useRoute();
const { getPaintingById, getAllPaintings } = useCloudinary();

// State
const painting = ref(null);
const allPaintings = ref([]);
const isLoading = ref(true);

// Gerelateerde schilderijen op basis van categorie en tags
const relatedPaintings = computed(() => {
  if (!painting.value || allPaintings.value.length === 0) return [];

  const paintingId = painting.value.id;
  const category = painting.value.category;
  const tags = painting.value.tags || [];

  // Zoek schilderijen in dezelfde categorie of met overeenkomende tags
  return allPaintings.value
    .filter((p) => {
      // Negeer het huidige schilderij
      if (p.id === paintingId) return false;

      // Controleer op dezelfde categorie
      const hasSameCategory = p.category === category;

      // Controleer op overeenkomende tags
      const hasMatchingTag = p.tags && p.tags.some((tag) => tags.includes(tag));

      return hasSameCategory || hasMatchingTag;
    })
    .slice(0, 4); // Limiteer tot 4 gerelateerde schilderijen
});

// SEO meta tags
useHead(() => ({
  title: painting.value
    ? `${painting.value.title} | Tom van As Schilderijen`
    : "Schilderij details | Tom van As",
  meta: [
    {
      name: "description",
      content: painting.value
        ? `Bekijk "${painting.value.title}" door kunstenaar Tom van As. ${
            painting.value.category
              ? `Categorie: ${painting.value.category}.`
              : ""
          }`
        : "Ontdek de schilderijen van kunstenaar Tom van As.",
    },
  ],
}));

// Data ophalen
async function fetchData() {
  isLoading.value = true;

  try {
    // Haal schilderij op basis van ID
    const id = route.params.id;
    painting.value = await getPaintingById(id);

    // Haal alle schilderijen op voor gerelateerde werken
    allPaintings.value = await getAllPaintings();
  } catch (error) {
    console.error("Fout bij het ophalen van schilderij:", error);
  } finally {
    isLoading.value = false;
  }
}

// Data ophalen bij page load of wanneer de route ID verandert
watch(() => route.params.id, fetchData, { immediate: true });
</script>
