// pages/index.vue
<template>
  <div>
    <!-- Hero Sectie -->
    <section class="relative h-96 md:h-[70vh] bg-gray-800 overflow-hidden mb-12">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner />
      </div>

      <template v-else>
        <div class="absolute inset-0 z-0 opacity-70">
          <NuxtImg
            v-if="featuredPainting"
            provider="cloudinary"
            :src="featuredPainting.id"
            format="webp"
            width="1920"
            height="1080"
            fit="cover"
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
            Ontdek een unieke collectie schilderijen die emotie en verbeelding tot leven brengen
          </p>
          <div class="mt-8">
            <NuxtLink to="/schilderijen" class="btn btn-primary px-8 py-3 text-lg">
              Bekijk de collectie
            </NuxtLink>
          </div>
        </div>
      </template>
    </section>

    <!-- Uitgelichte Werken -->
    <section class="py-12 bg-gray-50">
      <div class="container-custom">
        <h2 class="text-3xl font-serif font-semibold mb-8 text-center">Uitgelichte Werken</h2>

        <div v-if="isLoading" class="py-8">
          <LoadingSpinner show-message message="Uitgelichte werken laden..." />
        </div>

        <div
          v-else-if="featuredPaintings.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <PaintingCard
            v-for="painting in featuredPaintings"
            :key="painting.id"
            :painting="painting"
          />
        </div>

        <div v-else class="text-center py-8 text-gray-600">
          <p>Geen uitgelichte werken beschikbaar.</p>
        </div>

        <div class="text-center mt-12">
          <NuxtLink to="/schilderijen" class="btn btn-secondary px-6 py-3">
            Bekijk alle schilderijen
          </NuxtLink>
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
                provider="cloudinary"
                :src="category.image"
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

    <!-- Contact -->
    <section class="py-16">
      <div class="container-custom">
        <div class="bg-primary-light/20 rounded-xl p-8 md:p-12">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl font-serif font-semibold mb-4">Interesse in een schilderij?</h2>
            <p class="text-gray-700 mb-8">
              Neem contact met mij op voor meer informatie over mijn werk, prijzen of om een
              afspraak te maken voor een bezichtiging.
            </p>
            <div
              class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center"
            >
              <a href="mailto:info@tomvanas-art.nl" class="btn btn-primary"> E-mail mij </a>
              <a href="tel:+31612345678" class="btn btn-secondary"> Bel mij </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Composable voor Cloudinary data
const { getAllPaintings } = useCloudinary();

// State voor homepage data
const paintings = ref([]);
const featuredPainting = ref(null);
const featuredPaintings = ref([]);
const categoryList = ref([]);
const isLoading = ref(true);

// Data ophalen
async function fetchData() {
  isLoading.value = true;

  console.log('hia');

  try {
    // Alle schilderijen ophalen
    paintings.value = await getAllPaintings();

    console.log('paintings.value.length', paintings.value.length);

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
