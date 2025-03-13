<!-- File: components/NotificationToast.vue -->
<template>
  <Teleport to="body">
    <transition name="toast">
      <div
        v-if="isVisible"
        class="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 z-50"
        :class="[
          type === 'success'
            ? 'border-green-500'
            : type === 'error'
              ? 'border-red-500'
              : 'border-primary',
        ]"
      >
        <div class="flex items-center">
          <div
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3"
            :class="[
              type === 'success'
                ? 'bg-green-100 text-green-500'
                : type === 'error'
                  ? 'bg-red-100 text-red-500'
                  : 'bg-primary-light text-primary',
            ]"
          >
            <svg
              v-if="type === 'success'"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else-if="type === 'error'"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <svg
              v-else
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ title }}</p>
            <p class="text-sm text-gray-600">{{ message }}</p>
          </div>
        </div>
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600" @click="hide">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Notificatie',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info'].includes(value),
  },
  duration: {
    type: Number,
    default: 3000, // 3 seconds
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close']);

const isVisible = ref(props.visible);
let hideTimeout = null;

// Show notification
function show() {
  clearTimeout(hideTimeout);
  isVisible.value = true;

  if (props.duration > 0) {
    hideTimeout = setTimeout(() => {
      hide();
    }, props.duration);
  }
}

// Hide notification
function hide() {
  isVisible.value = false;
  emit('close');
}

// Watch for changes to visible prop
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      show();
    } else {
      hide();
    }
  }
);

// Initialize on mount
onMounted(() => {
  if (props.visible) {
    show();
  }
});

// Clean up on unmount
onUnmounted(() => {
  clearTimeout(hideTimeout);
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
