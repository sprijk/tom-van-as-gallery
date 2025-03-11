<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-serif font-bold">Over Tom van As</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
      <!-- Biografie en info -->
      <div class="md:col-span-2">
        <div class="prose prose-lg max-w-none">
          <p>(1932 Den Haag – 2024 Haastrecht/Gouda)</p>

          <p>
            Tom studeerde aan de Koninklijke Academie van Beeldende Kunsten in
            Den Haag (1948 -1953). Zijn vroege werk lijkt onder andere
            geïnspireerd door het kubisme van begin vorige eeuw.
          </p>

          <p>Zijn latere werk bestaat uit atelierwerk en landschappen.</p>

          <p>
            De landschappen maakte hij ter plekke tijdens reizen naar
            bijvoorbeeld Frankrijk, Spanje, Ierland en de Waddeneilanden maar
            ook vaak in de omgeving van zijn woonplaats Haastrecht.
          </p>

          <p>
            Hij schilderde met olieverf op doek en met aquarel en acryl. De
            stijl van de landschappen zou je kunnen zien als een vervolg op de
            schilders van ‘de Haagse School’
          </p>

          <img
            src="/images/over-tom-examples.jpg"
            class="w-full"
            alt="Voorbeelden van Tom's werk"
          />

          <!-- <h2>Tentoonstellingen</h2>
          <p>
            Mijn werk is tentoongesteld in verschillende galeries in Nederland
            en daarbuiten, waaronder:
          </p>

          <ul>
            <li>Galerie Moderne, Amsterdam (2022-2023)</li>
            <li>
              Kunsthal Rotterdam, Groepstentoonstelling "Nieuwe Perspectieven"
              (2021)
            </li>
            <li>Pulchri Studio, Den Haag (2020)</li>
            <li>Kunstbeurs Art Rotterdam (2019)</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Voor vragen over mijn werk, aankoop van schilderijen of opdrachten,
            kunt u contact met mij opnemen via:
          </p>

          <ul>
            <li>Email: info@tomvanas-art.nl</li>
            <li>Telefoon: +31 6 12345678</li>
          </ul>

          <p>
            Ik nodig u ook graag uit om mijn atelier te bezoeken op afspraak,
            waar u mijn nieuwste werken kunt bekijken en meer kunt leren over
            mijn creatieve proces.
          </p> -->
        </div>
      </div>

      <!-- Zijbalk met foto en snelle info -->
      <div class="md:col-span-1">
        <div class="bg-gray-100 rounded-lg overflow-hidden shadow-md p-6">
          <!-- Portretfoto -->
          <div class="bg-gray-200 mb-6 rounded-lg overflow-hidden">
            <img
              src="/images/tom-van-as.jpg"
              class="w-full object-cover"
              alt="Portretfoto van Tom van As"
            />
          </div>

          <h3 class="text-xl font-semibold mb-4">Snel Overzicht</h3>

          <div class="space-y-3">
            <div>
              <h4 class="font-medium text-gray-900">Geboren</h4>
              <p class="text-gray-700">1932, Den Haag, Nederland</p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900">Opleiding</h4>
              <p class="text-gray-700">
                Koninklijke Academie voor Beeldende Kunsten, Den Haag (1948
                -1953)
              </p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900">Medium</h4>
              <p class="text-gray-700">Acryl, olieverf, gemengde technieken</p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900">Stijl</h4>
              <p class="text-gray-700">
                Hedendaags expressionisme, abstracte landschappen
              </p>
            </div>
          </div>

          <!-- <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-xl font-semibold mb-4">Volg Mij</h3>

            <div class="flex space-x-4">
              <a
                href="#"
                class="text-gray-700 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="text-gray-700 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="text-gray-700 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
                  />
                </svg>
              </a>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Laatste schilderijen sectie -->
    <div v-if="recentPaintings.length > 0">
      <h2 class="text-2xl font-serif font-semibold mb-6">
        Mijn Laatste Werken
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <PaintingCard
          v-for="painting in recentPaintings"
          :key="painting.id"
          :painting="painting"
        />
      </div>

      <div class="text-center mt-8">
        <NuxtLink to="/schilderijen" class="btn btn-primary">
          Bekijk alle schilderijen
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Composable voor Cloudinary data
const { getAllPaintings } = useCloudinary();

// State
const recentPaintings = ref([]);

// Data ophalen
async function fetchData() {
  try {
    // Alle schilderijen ophalen
    const paintings = await getAllPaintings();

    // Sorteer op datum (nieuwste eerst) en pak de eerste 3
    recentPaintings.value = paintings
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, 3);
  } catch (error) {
    console.error("Fout bij het ophalen van recente schilderijen:", error);
  }
}

// SEO meta tags
useHead({
  title: "Over Tom van As | Kunstenaar",
  meta: [
    {
      name: "description",
      content:
        "Leer meer over kunstenaar Tom van As, zijn achtergrond, techniek en artistieke visie. Bekijk zijn portfolio en neem contact op voor aankoop of opdrachten.",
    },
  ],
});

// Data ophalen bij page load
onMounted(() => {
  fetchData();
});
</script>
