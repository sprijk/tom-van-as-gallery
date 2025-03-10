<template>
  <div v-if="painting" class="bg-white rounded-lg overflow-hidden shadow-lg">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Schilderij afbeelding -->
      <div class="relative">
        <div class="aspect-square">
          <NuxtImg
            provider="cloudinary"
            :src="painting.id"
            format="webp"
            width="800"
            height="800"
            fit="cover"
            class="w-full h-full object-contain"
            :alt="painting.title"
          />
        </div>
        <button
          @click="showFullImage = true"
          class="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 transition-all"
          aria-label="Bekijk het volledige schilderij"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>
      </div>

      <!-- Schilderij informatie -->
      <div class="p-6">
        <h1 class="text-3xl font-semibold mb-4">{{ painting.title }}</h1>

        <div
          v-if="painting.categories && painting.categories.length"
          class="mb-6"
        >
          <h2 class="text-lg font-medium mb-2">Categorieën</h2>
          <div class="flex flex-wrap">
            <NuxtLink
              v-for="category in painting.categories"
              :key="category"
              :to="`/schilderijen?category=${category}`"
              class="mr-2 mb-2 bg-secondary-light px-3 py-1 rounded-full text-gray-800 hover:bg-secondary transition-colors"
            >
              {{ category }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="painting.tags && painting.tags.length" class="mb-6">
          <h2 class="text-lg font-medium mb-2">Tags</h2>
          <div class="flex flex-wrap">
            <NuxtLink
              v-for="tag in painting.tags"
              :key="tag"
              :to="`/schilderijen?tag=${tag}`"
              class="mr-2 mb-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-lg font-medium mb-2">Details</h2>
          <ul class="space-y-2 text-gray-700">
            <li v-if="painting.width && painting.height">
              <span class="font-medium">Afmetingen:</span>
              {{ painting.width }} x {{ painting.height }} pixels
            </li>
            <li v-if="painting.created">
              <span class="font-medium">Toegevoegd op:</span>
              {{ formatDate(painting.created) }}
            </li>
          </ul>
        </div>

        <div class="mt-8">
          <h2 class="text-lg font-medium mb-2">Interesse in dit werk?</h2>
          <p class="text-gray-700 mb-4">
            Neem contact met mij op voor meer informatie over dit schilderij of
            om een aankoop te bespreken.
          </p>
          <div class="flex space-x-4">
            <a
              href="mailto:info@tomvanas-art.nl?subject=Interesse in schilderij: {{ painting.title }}"
              class="btn btn-primary"
            >
              E-mail mij
            </a>
            <a href="tel:+31612345678" class="btn btn-secondary"> Bel mij </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox modal voor volledig beeld -->
    <div
      v-if="showFullImage"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      @click="showFullImage = false"
    >
      <button
        @click.stop="showFullImage = false"
        class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        aria-label="Sluit volledig beeld"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div class="max-w-screen-xl max-h-screen" @click.stop>
        <NuxtImg
          provider="cloudinary"
          :src="painting.id"
          format="webp"
          width="1600"
          height="1600"
          fit="contain"
          class="max-w-full max-h-screen object-contain"
          :alt="painting.title"
        />
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow"
  >
    <h2 class="text-2xl font-medium text-gray-700 mb-4">
      Schilderij niet gevonden
    </h2>
    <p class="text-gray-600 mb-6">
      Het gezochte schilderij is niet beschikbaar of bestaat niet.
    </p>
    <NuxtLink to="/schilderijen" class="btn btn-primary">
      Terug naar de galerij
    </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  painting: {
    type: Object,
    default: null,
  },
});

const showFullImage = ref(false);

// Datum formatteren
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
</script>
