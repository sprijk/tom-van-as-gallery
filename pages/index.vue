// pages/index.vue
<template>
  <div>
    <!-- Hero Sectie -->
    <section class="relative h-96 md:h-[70vh] bg-gray-800 overflow-hidden mb-12">
      <div class="absolute inset-0 z-0 opacity-70">
        <img
          src="/images/cover.png"
          width="1920"
          height="1080"
          class="w-full h-full object-cover"
          alt="Uitgelicht schilderij"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div class="container-custom h-full flex flex-col justify-end relative z-10 pb-12">
        <h1 class="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-bold max-w-3xl">
          Tom van As
        </h1>
        <p class="text-white/90 text-xl md:text-2xl max-w-2xl mt-4">
          Overzicht van 60 jaar werk: kijken, visie, en verbeelden
        </p>
        <div class="mt-8">
          <NuxtLink to="/schilderijen" class="btn btn-primary px-8 py-3 text-lg">
            Bekijk de collectie
          </NuxtLink>
        </div>
      </div>
    </section>

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
              Klik op het hartje bij schilderijen die u interessant vindt om te bezichtigen.
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
              Ga naar uw favorieten pagina om eenvoudig meer informatie aan te vagen over de
              geselecteerde werken en eventueel een afspraak te maken voor bezichtiging (aan huis).
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

    <!-- Categorieën -->
    <section class="py-16 bg-gray-50">
      <div class="container-custom">
        <h2 class="text-3xl font-serif font-semibold mb-8 text-center">Collecties</h2>

        <div v-if="isLoading" class="py-8">
          <LoadingSpinner show-message message="Collecties laden..." />
        </div>

        <div
          v-else-if="categoryList.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <NuxtLink
            v-for="category in categoryList"
            :key="category.name"
            :to="`/schilderijen?category=${category.name}`"
            class="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            <div class="h-48 relative overflow-hidden">
              <div
                class="absolute inset-0 bg-gray-800/40 group-hover:bg-gray-800/20 transition-colors z-10"
              />
              <NuxtImg
                v-if="category.image"
                provider="imagor"
                :src="painting.destPath"
                format="webp"
                width="600"
                height="400"
                fit="cover"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                :alt="category.name"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-primary/10">
                <span class="text-primary text-xl font-medium">{{ category.name }}</span>
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-xl font-semibold">{{ category.name }}</h3>
              <p class="text-gray-600 mt-1">{{ category.count }} schilderijen</p>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-8 text-gray-600">
          <p>Geen collecties beschikbaar.</p>
        </div>
      </div>
    </section>

    <!-- Over de Kunstenaar -->
    <section class="py-16">
      <div class="container-custom">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-serif font-semibold mb-6">Over Tom van As</h2>
            <p class="text-gray-700 mb-4">
              Tom studeerde aan de Koninklijke Academie van Beeldende Kunsten in Den Haag. Zijn werk
              omvat zowel atelierwerk als landschappen.
            </p>
            <p class="text-gray-700 mb-6">
              Met olieverf, aquarel en acryl creëerde hij werken die voortborduren op de traditie
              van de Haagse School, met een eigen twist geïnspireerd door het vroeg 20e-eeuwse
              kubisme.
            </p>
            <NuxtLink to="/over-tom" class="btn btn-primary"> Meer over Tom </NuxtLink>
          </div>
          <div class="rounded-lg overflow-hidden shadow-md">
            <img
              src="/images/tom-van-as.jpg"
              class="w-full h-full object-cover"
              alt="Portretfoto van Tom van As"
              width="600"
              height="400"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useImageService } from '../composables/useImageService';

// Composable voor data
const { getAllPaintings } = useImageService();

// State voor homepage data
const paintings = ref([]);
const featuredPainting = ref(null);
const featuredPaintings = ref([]);
const categoryList = ref([]);
const isLoading = ref(true);

// Data ophalen
async function fetchData() {
  isLoading.value = true;

  try {
    // Alle schilderijen ophalen
    paintings.value = await getAllPaintings();

    if (paintings.value.length > 0) {
      // Willekeurig uitgelicht schilderij kiezen
      const randomIndex = Math.floor(Math.random() * paintings.value.length);
      featuredPainting.value = paintings.value[randomIndex];

      // 3-6 uitgelichte schilderijen kiezen (zonder duplicaten)
      const shuffled = [...paintings.value].sort(() => 0.5 - Math.random());
      featuredPaintings.value = shuffled.slice(0, 6);

      // Categorieën verwerken en aantal schilderijen per categorie bepalen
      const categoryCounts = {};
      const categoryImages = {};

      paintings.value.forEach((painting) => {
        const category = painting.category;
        if (category) {
          if (!categoryCounts[category]) {
            categoryCounts[category] = 0;
            categoryImages[category] = painting.id; // Eerste schilderij als voorbeeld afbeelding
          }
          categoryCounts[category]++;
        }
      });

      // Categorieën voorbereiden voor weergave
      categoryList.value = Object.keys(categoryCounts)
        .filter((name) => name) // Filter lege categorienamen
        .map((name) => ({
          name,
          count: categoryCounts[name],
          image: categoryImages[name],
        }));
    }
  } catch (error) {
    console.error('Fout bij het ophalen van data:', error);
  } finally {
    isLoading.value = false;
  }
}

// SEO meta tags
useHead({
  title: 'Tom van As - Kunstgalerij',
  meta: [
    {
      name: 'description',
      content:
        'Ontdek de unieke schilderijen van kunstenaar Tom van As. Bekijk zijn collectie en vind uw favoriete kunstwerk.',
    },
  ],
});

// Data ophalen bij page load
onMounted(() => {
  fetchData();
});
</script>
