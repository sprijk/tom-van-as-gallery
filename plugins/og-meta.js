// Create this file as plugins/og-meta.js

export default defineNuxtPlugin((nuxtApp) => {
  // Set base URL for the site - change this to your production domain
  const baseUrl = 'https://tomvanas-kunst.nl';

  // Helper function to get absolute URL
  const getAbsoluteUrl = (path) => {
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  };

  // Hook into Nuxt's useHead to automatically convert relative URLs to absolute
  nuxtApp.hook('app:created', () => {
    const originalUseHead = nuxtApp.vueApp.config.globalProperties.$head;

    if (originalUseHead) {
      nuxtApp.vueApp.config.globalProperties.$head = (input) => {
        // Process meta tags to ensure absolute URLs for OG tags
        if (input && input.meta) {
          input.meta.forEach((tag) => {
            // Make OG image URLs absolute
            if ((tag.property === 'og:image' || tag.property === 'twitter:image') && tag.content) {
              tag.content = getAbsoluteUrl(tag.content);
            }

            // Make OG URLs absolute
            if ((tag.property === 'og:url' || tag.property === 'twitter:url') && tag.content) {
              tag.content = getAbsoluteUrl(tag.content);
            }
          });
        }

        // Process canonical links
        if (input && input.link) {
          input.link.forEach((link) => {
            if (link.rel === 'canonical' && link.href) {
              link.href = getAbsoluteUrl(link.href);
            }
          });
        }

        return originalUseHead(input);
      };
    }
  });

  return {
    provide: {
      // Expose helper function for use in components if needed
      getAbsoluteUrl,
    },
  };
});
