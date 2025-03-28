<template>
  <div>
    <div v-if="isLoading" class="py-12">
      <LoadingSpinner show-message message="Schilderij laden..." />
    </div>

    <template v-else-if="painting">
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <nav class="flex flex-wrap" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
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
                  />
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
                  />
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
                  />
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
                  />
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate max-w-xs">
                  {{ painting.title || 'Schilderij details' }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Schilderij Detail Component -->
      <PaintingDetail
        :painting="painting"
        :previous-painting="previousPainting"
        :next-painting="nextPainting"
      />

      <!-- Gerelateerde schilderijen -->
      <section v-if="relatedPaintings.length > 0" class="mt-16">
        <h2 class="text-2xl font-serif font-semibold mb-6">Gerelateerde schilderijen</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PaintingCard
            v-for="relPainting in relatedPaintings"
            :key="relPainting.id"
            :painting="relPainting"
          />
        </div>
      </section>

      <!-- Terug naar overzicht knop -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/schilderijen"
          class="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          Terug naar alle schilderijen
        </NuxtLink>
      </div>
    </template>

    <div v-else class="py-12 text-center">
      <h2 class="text-2xl font-medium text-gray-700 mb-4">Schilderij niet gevonden</h2>
      <p class="text-gray-600 mb-6">Het gezochte schilderij is niet beschikbaar of bestaat niet.</p>
      <NuxtLink to="/schilderijen" class="btn btn-primary"> Terug naar de galerij </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { getPaintingById, getAllPaintings, isLoading, apiError } = useImageService();

// Data fetching
async function fetchData() {
  // Fetch current painting
  const paintingId = route.params.id;
  const paintingData = await getPaintingById(paintingId);

  // Fetch all paintings for navigation and related paintings
  const allPaintingsData = await getAllPaintings();

  return {
    painting: paintingData,
    allPaintings: allPaintingsData,
  };
}

// Use async/await with data loading
const { painting, allPaintings } = await fetchData();

// Determine previous and next paintings
const previousPainting = computed(() => {
  if (!allPaintings || !painting) return null;

  const currentIndex = allPaintings.findIndex((p) => p.id === painting.id);
  if (currentIndex > 0) {
    return allPaintings[currentIndex - 1];
  }
  return null;
});

const nextPainting = computed(() => {
  if (!allPaintings || !painting) return null;

  const currentIndex = allPaintings.findIndex((p) => p.id === painting.id);
  if (currentIndex < allPaintings.length - 1) {
    return allPaintings[currentIndex + 1];
  }
  return null;
});

// Related paintings based on category
const relatedPaintings = computed(() => {
  if (!allPaintings || !painting) return [];

  const category = painting.category;
  return allPaintings
    .filter((p) => {
      // Filter by same category but not the current painting
      return p.id !== painting.id && p.category === category;
    })
    .slice(0, 4); // Limit to 4 related paintings
});

// SEO meta tags
useHead(() => {
  const title = painting
    ? `${painting.title} | Tom van As Schilderijen`
    : 'Schilderij details | Tom van As';

  const description = painting
    ? `Bekijk "${painting.title}" door kunstenaar Tom van As. ${
        painting.category ? `Categorie: ${painting.category}.` : ''
      }`
    : 'Ontdek de schilderijen van kunstenaar Tom van As.';

  // Generate image URL for the painting if available
  const imageUrl = 'https://tomvanas-kunst.nl/images/og-image.jpg';

  // Calculate canonical URL
  const canonicalUrl = painting
    ? `https://tomvanas-kunst.nl/schilderijen/${painting.id}`
    : 'https://tomvanas-kunst.nl/schilderijen';

  return {
    title: title,
    meta: [
      { name: 'description', content: description },

      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },

      // Twitter
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: canonicalUrl },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: imageUrl },
    ],
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      },
    ],
  };
});

// Handle errors
watch(apiError, (error) => {
  if (error) {
    console.error('API Error:', error);
  }
});
</script>
