<!-- File: pages/favorieten.vue -->
<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-serif font-bold">Jouw Favorieten</h1>
      <p class="text-gray-600 mt-2">
        Hier vind je alle schilderijen die je hebt gemarkeerd als favoriet.
      </p>
    </div>

    <div v-if="favorites.length === 0" class="py-12 text-center bg-gray-50 rounded-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
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
      <h2 class="text-xl font-medium text-gray-700 mb-4">Je hebt nog geen favorieten</h2>
      <p class="text-gray-600 mb-6">
        Blader door de schilderijen en voeg je favorieten toe door op het hart-icoon te klikken.
      </p>
      <NuxtLink to="/schilderijen" class="btn btn-primary">Bekijk schilderijen</NuxtLink>
    </div>

    <div v-else>
      <div class="mb-6 flex justify-between items-center">
        <div>
          <span class="text-gray-700">{{ favorites.length }} schilderijen geselecteerd</span>
        </div>
        <div class="flex space-x-4">
          <button
            class="text-primary hover:text-primary-dark transition-colors flex items-center"
            @click="clearAllFavorites"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Alles verwijderen
          </button>
        </div>
      </div>

      <!-- Favorites grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div
          v-for="painting in favorites"
          :key="painting.id"
          class="bg-white rounded-lg shadow-md overflow-hidden group relative"
        >
          <NuxtLink :to="`/schilderijen/${painting.id}`" class="block">
            <div class="relative pb-[75%] bg-gray-100">
              <NuxtImg
                provider="cloudinary"
                :src="painting.id"
                format="webp"
                width="600"
                height="600"
                fit="contain"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                :alt="painting.title"
              />
              <!-- Remove from favorites button -->
              <button
                class="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-2 shadow hover:bg-primary-dark transition-colors"
                aria-label="Verwijder uit favorieten"
                @click.prevent="removeFavorite(painting.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-1 text-gray-900">
                {{ painting.title }}
              </h3>
              <div v-if="painting.category" class="mb-2">
                <span
                  class="inline-block bg-secondary-light text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                >
                  {{ painting.category }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Inquiry Form -->
      <div class="bg-primary-light/20 rounded-xl p-6 md:p-8 mb-8">
        <h2 class="text-2xl font-serif font-semibold mb-4">Informatie aanvragen</h2>
        <p class="text-gray-700 mb-6">
          Vul het onderstaande formulier in om meer informatie te ontvangen over je geselecteerde
          schilderijen en eventueel een afspraak te maken voor bezichtiging (aan huis).
        </p>

        <form @submit.prevent="submitInquiry">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="name" class="block text-gray-700 mb-2">Naam</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label for="email" class="block text-gray-700 mb-2">E-mail</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label for="phone" class="block text-gray-700 mb-2">Telefoonnummer</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label for="subject" class="block text-gray-700 mb-2">Onderwerp</label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Bijv. Prijsinformatie, Bezichtiging, etc."
              />
            </div>
          </div>

          <div class="mb-6">
            <label for="message" class="block text-gray-700 mb-2">Bericht</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Stel hier je vragen over de geselecteerde schilderijen"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary px-6 py-3" :disabled="isSubmitting">
              <span v-if="isSubmitting">Verzenden...</span>
              <span v-else>Informatie aanvragen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { favorites, removeFavorite, clearAllFavorites } = useFavorites();
const { showSuccess, showError } = useToast();

// Form data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: 'Informatie over favoriete schilderijen',
  message: '',
});

const isSubmitting = ref(false);
const formSubmitted = ref(false);

// Function to submit inquiry
async function submitInquiry() {
  if (favorites.value.length === 0) {
    showError(
      'Selecteer eerst schilderijen als favoriet voordat je een aanvraag doet.',
      'Geen favorieten'
    );
    return;
  }

  isSubmitting.value = true;

  try {
    // Prepare the data to be sent
    const inquiryData = {
      ...form,
      paintings: favorites.value.map((painting) => ({
        id: painting.id,
        title: painting.title,
        category: painting.category || 'Geen categorie',
      })),
    };

    // API call
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });

    if (!response.ok) {
      throw new Error('Er is een fout opgetreden bij het verzenden van het formulier');
    }

    // Handle success
    showSuccess(
      'We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.',
      'Aanvraag verzonden',
      6000
    );

    // Reset form
    Object.keys(form).forEach((key) => {
      if (key !== 'subject') {
        form[key] = '';
      }
    });

    // Optionally clear favorites after successful submission
    // clearFavorites();

    formSubmitted.value = true;
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    showError(
      'Er is een fout opgetreden bij het verzenden van je aanvraag. Probeer het later opnieuw of neem direct contact op.',
      'Verzenden mislukt'
    );
  } finally {
    isSubmitting.value = false;
  }
}

// SEO meta tags
useHead({
  title: 'Mijn Favorieten | Tom van As Kunstgalerij',
  meta: [
    {
      name: 'description',
      content: 'Bekijk je favoriete schilderijen van Tom van As en vraag informatie aan.',
    },
  ],
});
</script>
