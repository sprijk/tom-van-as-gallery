// plugins/error-handler.js
export default defineNuxtPlugin(() => {
  // Globale variabele voor API status
  const apiStatus = useState('apiStatus', () => ({
    paintingsLoaded: false,
    error: null,
    retryCount: 0,
    maxRetries: 3,
  }));

  // Error handler functie
  const handleApiError = (error, context) => {
    console.error(`API Fout in ${context}:`, error);

    apiStatus.value.error = {
      message: error.message || 'Er is een fout opgetreden bij het communiceren met de server',
      context: context,
      timestamp: new Date().toISOString(),
    };

    // Toon een melding voor de gebruiker
    if (import.meta.client) {
      // Eenvoudig fallback alert als er geen toast-functionaliteit is
      alert(
        `Er is een fout opgetreden: ${
          error.message || 'Onbekende fout'
        }. Probeer de pagina te vernieuwen.`
      );
    }

    return null;
  };

  // Helper functie voor retries
  const withRetry = async (fn, context, maxRetries = apiStatus.value.maxRetries) => {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn();
        apiStatus.value.retryCount = 0; // Reset na succesvolle poging
        return result;
      } catch (error) {
        lastError = error;
        apiStatus.value.retryCount++;

        // Wacht exponentieel langer bij elke nieuwe poging
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Poging ${attempt + 1} mislukt, opnieuw proberen na ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Alle pogingen mislukt, handle de laatste error
    return handleApiError(lastError, context);
  };

  // Expose de functies voor gebruik in de app
  return {
    provide: {
      apiStatus: apiStatus,
      handleApiError: handleApiError,
      withRetry: withRetry,
    },
  };
});
