import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Shared DOM polyfills
window.scrollTo = window.scrollTo || (() => {})

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Router & file-route generation mocks to prevent side-effects during isolated tests
vi.mock('../routeTree.gen.ts', () => ({ routeTree: {} }))
vi.mock('../main.tsx', () => ({ router: { update: () => {} } }))
