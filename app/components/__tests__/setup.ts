import '@testing-library/jest-dom'

// jsdom does not implement IntersectionObserver — provide a no-op stub so
// components that use it (e.g. results_viewed PostHog tracking) render without error.
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver
