// components/PaintingFilter.vue
<template>
  <div class="bg-gray-50 rounded-lg p-4 mb-8 sticky top-4">
    <div class="mb-4">
      <h3 class="text-lg font-medium mb-2 flex items-center justify-between">
        <span>Zoeken</span>
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          Wis filters
        </button>
      </h3>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Zoek op titel..."
          class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          @input="debounceUpdateFilters"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <div class="mb-4" v-if="allCategories.length > 0">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Categorieën</h3>
        <button
          v-if="selectedCategories.length > 0"
          @click="clearCategories"
          class="text-xs text-primary hover:text-primary-dark transition-colors"
        >
          Wis categorieën
        </button>
      </div>
      <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
        <label
          v-for="category in allCategories"
          :key="category"
          class="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
        >
          <input
            type="checkbox"
            :value="category"
            v-model="selectedCategories"
            class="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            @change="updateFilters"
          />
          <span class="text-gray-800">{{ category }}</span>
        </label>
      </div>
    </div>

    <div v-if="allTags.length > 0">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Tags</h3>
        <button
          v-if="selectedTags.length > 0"
          @click="clearTags"
          class="text-xs text-primary hover:text-primary-dark transition-colors"
        >
          Wis tags
        </button>
      </div>
      <div class="flex flex-wrap max-h-72 overflow-y-auto pb-2">
        <button
          v-for="tag in allTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'mr-2 mb-2 px-3 py-1 text-sm rounded-full transition-colors',
            selectedTags.includes(tag)
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="hasActiveFilters" class="mt-6 pt-4 border-t border-gray-200">
        <button @click="resetFilters" class="btn btn-secondary w-full">
          Wis alle filters
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  initialFilters: {
    type: Object,
    default: () => ({
      search: "",
      categories: [],
      tags: [],
    }),
  },
});

const emit = defineEmits(["update:filters"]);

// Reactieve staat voor filtering
const searchQuery = ref(props.initialFilters.search || "");
const selectedCategories = ref(props.initialFilters.categories || []);
const selectedTags = ref(props.initialFilters.tags || []);

// Computed properties voor UI
const allCategories = computed(() => props.categories);
const allTags = computed(() => props.tags);
const hasActiveFilters = computed(
  () =>
    searchQuery.value.trim() !== "" ||
    selectedCategories.value.length > 0 ||
    selectedTags.value.length > 0,
);

// Debounce voor zoekfunctie
let searchDebounceTimeout;
function debounceUpdateFilters() {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    updateFilters();
  }, 300);
}

// Tags toevoegen of verwijderen
function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
  updateFilters();
}

// Filters updaten en emit versturen naar ouder component
function updateFilters() {
  emit("update:filters", {
    search: searchQuery.value,
    categories: selectedCategories.value,
    tags: selectedTags.value,
  });
}

// Individuele filter resets
function clearCategories() {
  selectedCategories.value = [];
  updateFilters();
}

function clearTags() {
  selectedTags.value = [];
  updateFilters();
}

// Alle filters resetten
function resetFilters() {
  searchQuery.value = "";
  selectedCategories.value = [];
  selectedTags.value = [];
  updateFilters();
}

// Bij verandering van externe props de waardes updaten
watch(
  () => props.initialFilters,
  (newFilters) => {
    if (newFilters) {
      searchQuery.value = newFilters.search || "";
      selectedCategories.value = newFilters.categories || [];
      selectedTags.value = newFilters.tags || [];
    }
  },
  { deep: true },
);
</script>

<style scoped>
/* Animaties voor het verschijnen/verdwijnen van elementen */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
