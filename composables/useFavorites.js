// File: composables/useFavorites.js
// composables/useFavorites.js
export const useFavorites = () => {
  // State for favorites
  const favorites = useState('favorites', () => []);

  // Notification state
  const notification = useState('favoriteNotification', () => ({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  }));

  // Show notification
  const showNotification = (title, message, type = 'info') => {
    notification.value = {
      visible: true,
      title,
      message,
      type,
    };

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.value.visible = false;
    }, 3000);
  };

  // Add a painting to favorites
  const addFavorite = (painting) => {
    if (!isPaintingInFavorites(painting.id)) {
      favorites.value.push(painting);
      updateLocalStorage();
      showNotification(
        'Toegevoegd aan favorieten',
        `"${painting.title}" is aan je favorieten toegevoegd`,
        'success'
      );
      return true;
    }
    return false;
  };

  // Remove a painting from favorites
  const removeFavorite = (paintingId) => {
    const index = favorites.value.findIndex((p) => p.id === paintingId);
    if (index !== -1) {
      const painting = favorites.value[index];
      favorites.value.splice(index, 1);
      updateLocalStorage();
      showNotification(
        'Verwijderd uit favorieten',
        `"${painting.title}" is uit je favorieten verwijderd`,
        'info'
      );
      return true;
    }
    return false;
  };

  // Check if a painting is in favorites
  const isPaintingInFavorites = (paintingId) => {
    return favorites.value.some((p) => p.id === paintingId);
  };

  // Clear all favorites
  const clearFavorites = () => {
    favorites.value = [];
    updateLocalStorage();
  };

  // Count of favorites
  const favoritesCount = computed(() => favorites.value.length);

  // Save favorites to localStorage
  const updateLocalStorage = () => {
    if (import.meta.client) {
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    }
  };

  // Load favorites from localStorage
  const loadFavoritesFromStorage = () => {
    if (import.meta.client) {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        favorites.value = JSON.parse(storedFavorites);
      }
    }
  };

  // Initialize favorites from localStorage
  onMounted(() => {
    loadFavoritesFromStorage();
  });

  // Clear all favorites
  const clearAllFavorites = () => {
    if (favorites.value.length > 0) {
      favorites.value = [];
      updateLocalStorage();
      showNotification(
        'Favorieten gewist',
        'Alle schilderijen zijn uit je favorieten verwijderd',
        'info'
      );
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isPaintingInFavorites,
    clearFavorites,
    clearAllFavorites,
    favoritesCount,
    notification,
  };
};
