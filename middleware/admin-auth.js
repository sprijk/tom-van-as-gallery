// middleware/admin-auth.js
export default defineNuxtRouteMiddleware((to) => {
  // Only run on client-side
  if (import.meta.client) {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

    // If the user is trying to access an admin page and is not authenticated,
    // redirect to the admin login page
    if (to.path.startsWith('/admin') && to.path !== '/admin' && !isAuthenticated) {
      return navigateTo('/admin');
    }
  }
});
