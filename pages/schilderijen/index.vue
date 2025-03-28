<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-serif font-bold">Schilderijen</h1>
      <p class="text-gray-600 mt-2">
        Ontdek de volledige collectie van Tom van As. Gebruik de filters om specifieke werken te
        vinden.
      </p>
    </div>

    <PaintingSearch
      :paintings="allPaintings"
      @search="handleSearch"
      @select="handleSelectPainting"
    />

    <div v-if="isLoading" class="py-12">
      <LoadingSpinner show-message message="Schilderijen laden..." />
    </div>

    <div v-else-if="allPaintings.length === 0" class="py-12 text-center">
      <p class="text-gray-700 text-lg mb-4">Er zijn momenteel geen schilderijen beschikbaar.</p>
      <p class="text-gray-600">Probeer het later nog eens of neem contact op met de galerij.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar met filters -->
      <div class="lg:col-span-1">
        <PaintingFilter
          :categories="allCategories"
          :initial-filters="filters"
          @update:filters="applyFilters"
        />
      </div>

      <!-- Resultaten -->
      <div class="lg:col-span-3">
        <div v-if="isFilterLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>

        <template v-else>
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
          >
            <p class="text-gray-600">{{ filteredPaintings.length }} schilderijen gevonden</p>
            <div class="flex items-center space-x-2">
              <label for="sort" class="text-sm text-gray-600">Sorteren op:</label>
              <select
                id="sort"
                v-model="sortOption"
                class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>

          <PaintingGrid
            :paintings="paginatedPaintings"
            :show-load-more="hasMorePaintings"
            @load-more="loadMore"
            @clear-filters="clearFilters"
          />
        </template>
      </div>
    </div>

    <!-- How It Works / Favorites explanation section -->
    <section class="py-16 bg-white">
      <div class="container-custom">
        <h2 class="text-3xl font-serif font-semibold mb-8 text-center">Hoe het werkt</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1: Browse -->
          <div class="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-secondary-light rounded-full flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-medium mb-2">Bekijk schilderijen</h3>
            <p class="text-gray-600">
              Blader door de collectie van Tom van As en ontdek schilderijen die u aanspreken.
            </p>
          </div>

          <!-- Step 2: Add to favorites -->
          <div class="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-secondary-light rounded-full flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-medium mb-2">Markeer als favoriet</h3>
            <p class="text-gray-600">
              Klik op het hartje bij schilderijen die u interessant vindt om ze toe te voegen aan uw
              favorieten.
            </p>
          </div>

          <!-- Step 3: Request info -->
          <div class="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-secondary-light rounded-full flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-medium mb-2">Vraag informatie</h3>
            <p class="text-gray-600">
              Ga naar uw favorieten pagina om eenvoudig meer informatie aan te vragen over de
              geselecteerde werken.
            </p>
          </div>
        </div>

        <div class="mt-10 text-center">
          <NuxtLink to="/schilderijen" class="btn btn-primary px-6 py-3">
            Begin met verkennen
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Composable voor data
const { getAllPaintings, getAllCategories, isLoading, apiError } = useImageService();
const route = useRoute();
const router = useRouter();

// State
const allPaintings = ref([]);
const allCategories = ref([]);
const isFilterLoading = ref(false);

// Filtering en sortering
const filters = ref({
  search: '',
  categories: [],
});
const sortOption = ref('az');
const perPage = ref(12);
const currentPage = ref(1);

// Verwerkte data
const filteredPaintings = computed(() => {
  let result = [...allPaintings.value];

  // Filter op zoekterm
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    result = result.filter((painting) => {
      return (
        (painting.title && painting.title.toLowerCase().includes(searchTerm)) ||
        (painting.category && painting.category.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Filter op categorieën
  if (filters.value.categories.length > 0) {
    result = result.filter((painting) => {
      return painting.category && filters.value.categories.includes(painting.category);
    });
  }

  // Sorteren
  return sortPaintings(result);
});

// Pagination
const paginatedPaintings = computed(() => {
  const lastIndex = currentPage.value * perPage.value;
  return filteredPaintings.value.slice(0, lastIndex);
});

const hasMorePaintings = computed(() => {
  return paginatedPaintings.value.length < filteredPaintings.value.length;
});

function sortPaintings(paintings) {
  return [...paintings].sort((a, b) => {
    let numA, numB;

    switch (sortOption.value) {
      case 'az':
        // Extract numbers from title strings
        numA = parseInt(((a.title || '').match(/\d+/) || ['0'])[0], 10);
        numB = parseInt(((b.title || '').match(/\d+/) || ['0'])[0], 10);
        return numA - numB;
      case 'za':
        // Extract numbers from title strings
        numA = parseInt(((a.title || '').match(/\d+/) || ['0'])[0], 10);
        numB = parseInt(((b.title || '').match(/\d+/) || ['0'])[0], 10);
        return numB - numA;
      default:
        return 0;
    }
  });
}

// Event handlers
function handleSearch(searchTerm) {
  filters.value.search = searchTerm;
  currentPage.value = 1;
  updateRouteParams();
}

function handleSelectPainting(painting) {
  router.push(`/schilderijen/${painting.id}`);
}

function applyFilters(newFilters) {
  isFilterLoading.value = true;
  setTimeout(() => {
    filters.value = { ...newFilters };
    currentPage.value = 1;
    updateRouteParams();
    isFilterLoading.value = false;
  }, 300); // Kleine vertraging voor betere gebruikservaring
}

function clearFilters() {
  filters.value = {
    search: '',
    categories: [],
  };
  updateRouteParams();
}

function loadMore() {
  currentPage.value++;
}

// URL parameters bijwerken
function updateRouteParams() {
  const query = {};

  if (filters.value.search) {
    query.search = filters.value.search;
  }

  if (filters.value.categories.length === 1) {
    query.category = filters.value.categories[0];
  } else if (filters.value.categories.length > 1) {
    query.categories = filters.value.categories.join(',');
  }

  // Sorteeroptie toevoegen aan URL
  if (sortOption.value !== 'newest') {
    query.sort = sortOption.value;
  }

  router.push({ query });
}

// Data ophalen
async function fetchData() {
  try {
    // Alle schilderijen en categorieën
    const paintings = await getAllPaintings();
    const categories = await getAllCategories();

    allPaintings.value = paintings;
    allCategories.value = categories;

    // URL parameters verwerken om filters toe te passen
    const { search, sort } = route.query;
    const categoryParam = route.query.category;
    const categoriesParam = route.query.categories;

    if (search) {
      filters.value.search = search;
    }

    if (categoryParam) {
      filters.value.categories = [categoryParam];
    } else if (categoriesParam) {
      filters.value.categories = categoriesParam.split(',');
    }

    if (sort) {
      sortOption.value = sort;
    }
  } catch (error) {
    console.error('Fout bij het ophalen van data:', error);
  }
}

// Watch for API errors
watch(apiError, (error) => {
  if (error) {
    console.error('API Error:', error);
  }
});

// Watch sort option om de URL te updaten
watch(sortOption, () => {
  updateRouteParams();
});

// SEO meta tags
useHead(() => {
  // Extract category from route query if available
  const category = route.query.category ? String(route.query.category) : null;

  // Create appropriate title and description based on filters
  let title = 'Schilderijen | Tom van As Kunstgalerij';
  let description = 'Bekijk de collectie schilderijen van kunstenaar Tom van As.';

  if (category) {
    title = `${category} | Tom van As Kunstgalerij`;
    description = `Bekijk de ${category} collectie van kunstenaar Tom van As.`;
  }

  // Try to find an appropriate image for the category
  const imageUrl = 'https://tomvanas-kunst.nl/images/og-image.jpg'; // Default fallback

  // Calculate canonical URL with filters
  let canonicalUrl = 'https://tomvanas-kunst.nl/schilderijen';
  if (category) {
    canonicalUrl += `?category=${encodeURIComponent(category)}`;
  }

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

function initializeFiltersFromUrl() {
  const { search, sort } = route.query;
  const categoryParam = route.query.category;
  const categoriesParam = route.query.categories;

  if (search) {
    filters.value.search = search;
  }

  if (categoryParam) {
    filters.value.categories = [categoryParam];
  } else if (categoriesParam) {
    filters.value.categories = categoriesParam.split(',');
  }

  if (sort) {
    sortOption.value = sort;
  }
}

initializeFiltersFromUrl();

// Data ophalen bij page load
// onMounted(() => {
fetchData();
// });
</script>
