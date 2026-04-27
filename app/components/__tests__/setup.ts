import '@testing-library/jest-dom'

// jsdom does not implement IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver

// jsdom does not implement window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
