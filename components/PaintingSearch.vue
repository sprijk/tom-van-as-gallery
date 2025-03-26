<template>
  <div class="relative w-full mb-6">
    <div class="flex">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Zoek schilderijen op nummer of categorie..."
        class="w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        @keyup.enter="search"
      />
      <button
        class="bg-primary text-white px-6 py-3 rounded-r-lg hover:bg-primary-dark transition-colors"
        @click="search"
      >
        <span class="sr-only">Zoeken</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
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
      </button>
    </div>
    <div
      v-if="showSearchSuggestions && suggestions.length > 0"
      class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
    >
      <ul>
        <li
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
          @click="selectSuggestion(suggestion)"
        >
          <div class="h-10 w-10 flex-shrink-0 mr-2">
            <NuxtImg
              provider="cloudinary"
              :src="suggestion.id"
              width="40"
              height="40"
              fit="cover"
              class="h-full w-full object-cover rounded"
              :alt="suggestion.title"
            />
          </div>
          <div>
            <div class="font-medium">
              {{ suggestion.title }}
            </div>
            <div v-if="suggestion.category" class="text-xs text-gray-500">
              {{ suggestion.category }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  paintings: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['search', 'select']);

const searchTerm = ref('');
const showSearchSuggestions = ref(false);

// Zoeksuggesties genereren op basis van de zoekterm
const suggestions = computed(() => {
  if (!searchTerm.value || searchTerm.value.length < 2) return [];

  const term = searchTerm.value.toLowerCase();
  return props.paintings
    .filter((painting) => {
      // Zoek in titel
      if (painting.title.toLowerCase().includes(term)) return true;

      // Zoek in categorie
      if (painting.category && painting.category.toLowerCase().includes(term)) return true;

      return false;
    })
    .slice(0, 5); // Limiteer tot 5 suggesties
});

// Volledige zoekopdracht uitvoeren
function search() {
  if (searchTerm.value.trim()) {
    emit('search', searchTerm.value);
    showSearchSuggestions.value = false;
  }
}

// Suggestie selecteren
function selectSuggestion(suggestion) {
  emit('select', suggestion);
  searchTerm.value = '';
  showSearchSuggestions.value = false;
}

// Event listeners voor focus/blur
onMounted(() => {
  const input = document.querySelector('input');

  input.addEventListener('focus', () => {
    showSearchSuggestions.value = true;
  });

  // Sluit suggesties wanneer er buiten wordt geklikt
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showSearchSuggestions.value = false;
    }
  });
});
</script>
