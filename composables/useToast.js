// composables/useToast.js
export const useToast = () => {
  // Global state for toast notifications
  const toast = useState('globalToast', () => ({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'error'
    duration: 3000, // Default duration in milliseconds
  }));

  // Show notification
  const showToast = (options) => {
    // Handle different parameter formats
    let title, message, type, duration;

    if (typeof options === 'string') {
      // If just a string is passed, use it as the message
      message = options;
      title = 'Notificatie';
      type = 'info';
      duration = 3000;
    } else {
      // Extract from options object
      title = options.title || 'Notificatie';
      message = options.message || '';
      type = options.type || 'info';
      duration = options.duration || 3000;
    }

    // Update toast state
    toast.value = {
      visible: true,
      title,
      message,
      type,
      duration,
    };

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  // Shorthand functions for different notification types
  const showSuccess = (message, title = 'Succes', duration = 3000) => {
    showToast({ title, message, type: 'success', duration });
  };

  const showError = (message, title = 'Fout', duration = 4000) => {
    showToast({ title, message, type: 'error', duration });
  };

  const showInfo = (message, title = 'Informatie', duration = 3000) => {
    showToast({ title, message, type: 'info', duration });
  };

  // Hide toast
  const hideToast = () => {
    toast.value.visible = false;
  };

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    hideToast,
  };
};
