<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-serif font-bold">Schilderijen</h1>
      <p class="text-gray-600 mt-2">
        Ontdek de volledige collectie van Tom van As. Gebruik de filters om
        specifieke werken te vinden.
      </p>
    </div>

    <PaintingSearch
      :paintings="allPaintings"
      @search="handleSearch"
      @select="handleSelectPainting"
    />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar met filters -->
      <div class="lg:col-span-1">
        <PaintingFilter
          :categories="allCategories"
          :tags="allTags"
          @update:filters="applyFilters"
        />
      </div>

      <!-- Resultaten -->
      <div class="lg:col-span-3">
        <div v-if="isLoading" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          ></div>
        </div>

        <template v-else>
          <div class="flex justify-between items-center mb-6">
            <p class="text-gray-600">
              {{ filteredPaintings.length }} schilderijen gevonden
            </p>
            <div class="flex items-center space-x-2">
              <label for="sort" class="text-sm text-gray-600"
                >Sorteren op:</label
              >
              <select
                id="sort"
                v-model="sortOption"
                class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Nieuwste eerst</option>
                <option value="oldest">Oudste eerst</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>

          <PaintingGrid
            :paintings="paginatedPaintings"
            :showLoadMore="hasMorePaintings"
            @loadMore="loadMore"
            @clearFilters="clearFilters"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
// Composable voor Cloudinary data
const { getAllPaintings, getAllCategories, getAllTags } = useCloudinary();
const route = useRoute();
const router = useRouter();

// State
const allPaintings = ref([]);
const allCategories = ref([]);
const allTags = ref([]);
const isLoading = ref(true);
const activeCategoryFromRoute = ref("");
const activeTagFromRoute = ref("");

// Filtering en sortering
const filters = ref({
  search: "",
  categories: [],
  tags: [],
});
const sortOption = ref("newest");
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
        painting.title.toLowerCase().includes(searchTerm) ||
        (painting.category &&
          painting.category.toLowerCase().includes(searchTerm)) ||
        (painting.tags &&
          painting.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      );
    });
  }

  // Filter op categorieën
  if (filters.value.categories.length > 0) {
    result = result.filter((painting) => {
      return (
        painting.category &&
        filters.value.categories.includes(painting.category)
      );
    });
  }

  // Filter op tags
  if (filters.value.tags.length > 0) {
    result = result.filter((painting) => {
      return (
        painting.tags &&
        painting.tags.some((tag) => filters.value.tags.includes(tag))
      );
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

// Sorteerfunctie
function sortPaintings(paintings) {
  return [...paintings].sort((a, b) => {
    switch (sortOption.value) {
      case "newest":
        return new Date(b.created || 0) - new Date(a.created || 0);
      case "oldest":
        return new Date(a.created || 0) - new Date(b.created || 0);
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
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
  filters.value = { ...newFilters };
  currentPage.value = 1;
  updateRouteParams();
}

function clearFilters() {
  filters.value = {
    search: "",
    categories: [],
    tags: [],
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
    query.categories = filters.value.categories.join(",");
  }

  if (filters.value.tags.length === 1) {
    query.tag = filters.value.tags[0];
  } else if (filters.value.tags.length > 1) {
    query.tags = filters.value.tags.join(",");
  }

  router.push({ query });
}

// Data ophalen
async function fetchData() {
  isLoading.value = true;

  try {
    // Alle schilderijen, categorieën en tags ophalen
    allPaintings.value = await getAllPaintings();
    allCategories.value = await getAllCategories();
    allTags.value = await getAllTags();

    // URL parameters verwerken om filters toe te passen
    const { category, categories, tag, tags, search } = route.query;

    if (search) {
      filters.value.search = search;
    }

    if (category) {
      filters.value.categories = [category];
    } else if (categories) {
      filters.value.categories = categories.split(",");
    }

    if (tag) {
      filters.value.tags = [tag];
    } else if (tags) {
      filters.value.tags = tags.split(",");
    }
  } catch (error) {
    console.error("Fout bij het ophalen van data:", error);
  } finally {
    isLoading.value = false;
  }
}

// Watch sort option om de URL te updaten
watch(sortOption, () => {
  const query = { ...route.query, sort: sortOption.value };
  router.push({ query });
});

// Data ophalen bij page load
onMounted(() => {
  fetchData();

  // Sort optie uit URL halen
  if (route.query.sort) {
    sortOption.value = route.query.sort;
  }
});
</script>
