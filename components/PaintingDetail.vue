<template>
  <div v-if="painting" class="bg-white rounded-lg overflow-hidden shadow-lg">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Schilderij afbeelding -->
      <div class="relative">
        <div
          class="aspect-w-4 aspect-h-3 md:aspect-auto md:h-full cursor-pointer"
          @click="showFullImage = true"
        >
          <NuxtImg
            provider="cloudinary"
            :src="painting.id"
            format="webp"
            fit="contain"
            class="w-full h-full object-contain rounded-lg bg-gray-100"
            :alt="painting.title"
          />
        </div>
        <button
          class="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 transition-all"
          aria-label="Bekijk het volledige schilderij"
          @click="showFullImage = true"
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

        <!-- Navigatieknoppen (links/rechts) -->
        <div class="absolute inset-y-0 left-0 flex items-center">
          <button
            v-if="previousPainting"
            class="bg-white bg-opacity-70 p-2 rounded-r-lg shadow hover:bg-opacity-100 transition-all"
            aria-label="Vorig schilderij"
            @click="navigateToPainting(previousPainting.id)"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div class="absolute inset-y-0 right-0 flex items-center">
          <button
            v-if="nextPainting"
            class="bg-white bg-opacity-70 p-2 rounded-l-lg shadow hover:bg-opacity-100 transition-all"
            aria-label="Volgend schilderij"
            @click="navigateToPainting(nextPainting.id)"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Schilderij informatie -->
      <div class="p-6">
        <h1 class="text-3xl font-semibold mb-4">
          {{ painting.title }}
        </h1>

        <div v-if="painting.category" class="mb-6">
          <h2 class="text-lg font-medium mb-2">Categorie</h2>
          <div class="flex flex-wrap">
            <NuxtLink
              :to="`/schilderijen?category=${painting.category}`"
              class="mr-2 mb-2 bg-secondary-light px-3 py-1 rounded-full text-gray-800 hover:bg-secondary transition-colors"
            >
              {{ painting.category }}
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
            <li v-if="painting.format">
              <span class="font-medium">Formaat:</span>
              {{ painting.format.toUpperCase() }}
            </li>
            <li v-if="painting.created">
              <span class="font-medium">Toegevoegd op:</span>
              {{ formatDate(painting.created) }}
            </li>
          </ul>
        </div>

        <div class="mt-8">
          <div class="bg-primary-light/20 rounded-lg p-6">
            <h2 class="text-lg font-medium mb-2">Interesse in dit werk?</h2>
            <p class="text-gray-700 mb-4">
              Neem contact met mij op voor meer informatie over dit schilderij of om een aankoop te
              bespreken.
            </p>
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                :href="`mailto:info@tomvanas-art.nl?subject=Interesse in schilderij: ${painting.title}`"
                class="btn btn-primary flex-1 text-center flex items-center justify-center"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                E-mail mij
              </a>
              <a
                href="tel:+31612345678"
                class="btn btn-secondary flex-1 text-center flex items-center justify-center"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Bel mij
              </a>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <button
              class="flex items-center text-primary hover:text-primary-dark transition-colors"
              @click="toggleShareOptions"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Deel dit schilderij
            </button>

            <div v-if="showShareOptions" class="mt-3 flex space-x-2">
              <a
                :href="facebookShareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Deel op Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
                  />
                </svg>
              </a>
              <a
                :href="twitterShareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                aria-label="Deel op Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                  />
                </svg>
              </a>
              <a
                :href="whatsappShareUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                aria-label="Deel via WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                  />
                </svg>
              </a>
              <button
                class="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors relative"
                aria-label="Kopieer link"
                @click="copyShareLink"
              >
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
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>

                <span
                  v-if="linkCopied"
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded mb-1 whitespace-nowrap"
                >
                  Link gekopieerd!
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox modal voor volledig beeld -->
    <Teleport to="body">
      <div
        v-if="showFullImage"
        class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        @click="showFullImage = false"
      >
        <button
          class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          aria-label="Sluit volledig beeld"
          @click.stop="showFullImage = false"
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
            quality="auto:best"
            fit="contain"
            class="max-w-full max-h-screen object-contain"
            :alt="painting.title"
          />
        </div>

        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <h3 class="text-xl font-medium">
            {{ painting.title }}
          </h3>
          <p v-if="painting.category" class="text-sm opacity-80 mt-1">
            {{ painting.category }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>

  <div v-else class="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-medium text-gray-700 mb-4">Schilderij niet gevonden</h2>
    <p class="text-gray-600 mb-6">Het gezochte schilderij is niet beschikbaar of bestaat niet.</p>
    <NuxtLink to="/schilderijen" class="btn btn-primary"> Terug naar de galerij </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  painting: {
    type: Object,
    default: null,
  },
  previousPainting: {
    type: Object,
    default: null,
  },
  nextPainting: {
    type: Object,
    default: null,
  },
});

const router = useRouter();
const showFullImage = ref(false);
const showShareOptions = ref(false);
const linkCopied = ref(false);

// Navigatie naar ander schilderij
function navigateToPainting(id) {
  if (!id) return;

  // Sluit de lightbox als deze open is
  showFullImage.value = false;

  // Navigeer naar het nieuwe schilderij
  router.push(`/schilderijen/${id}`);
}

// Datum formatteren
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Share functionaliteit
useRoute();
const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
});

const shareTitle = computed(() => {
  return props.painting ? `Bekijk "${props.painting.title}" van Tom van As` : '';
});

const facebookShareUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`;
});

const twitterShareUrl = computed(() => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareTitle.value
  )}&url=${encodeURIComponent(currentUrl.value)}`;
});

const whatsappShareUrl = computed(() => {
  return `https://wa.me/?text=${encodeURIComponent(shareTitle.value + ' ' + currentUrl.value)}`;
});

function toggleShareOptions() {
  showShareOptions.value = !showShareOptions.value;
}

function copyShareLink() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(currentUrl.value).then(() => {
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 2000);
    });
  }
}

// Close share options when clicking outside
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', (e) => {
      if (showShareOptions.value && !e.target.closest('.share-options')) {
        showShareOptions.value = false;
      }
    });

    // Add event listener for Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        showFullImage.value = false;
      }
    });
  }
});

// Add onUnmounted to clean up event listeners
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        showFullImage.value = false;
      }
    });
  }
});
</script>
