<template>
  <div class="bg-gray-50 rounded-lg p-4 mb-8">
    <div class="mb-4">
      <h3 class="text-lg font-medium mb-2">Zoeken</h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Zoek op titel..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        @input="updateFilters"
      />
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-medium mb-2">Categorieën</h3>
      <div class="space-y-2">
        <label
          v-for="category in allCategories"
          :key="category"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="category"
            v-model="selectedCategories"
            class="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            @change="updateFilters"
          />
          <span>{{ category }}</span>
        </label>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-medium mb-2">Tags</h3>
      <div class="flex flex-wrap">
        <button
          v-for="tag in allTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'mr-2 mb-2 px-3 py-1 text-sm rounded-full',
            selectedTags.includes(tag)
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="mt-6">
      <button @click="resetFilters" class="btn btn-secondary w-full">
        Wis alle filters
      </button>
    </div>
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
});

const emit = defineEmits(["update:filters"]);

const searchQuery = ref("");
const selectedCategories = ref([]);
const selectedTags = ref([]);

const allCategories = computed(() => props.categories);
const allTags = computed(() => props.tags);

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

// Alle filters resetten
function resetFilters() {
  searchQuery.value = "";
  selectedCategories.value = [];
  selectedTags.value = [];
  updateFilters();
}
</script>
