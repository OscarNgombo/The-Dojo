// Conditional debugging utility
// Toggle at runtime via: window.__DEBUG_AUTH__ = true
// or set import.meta.env.VITE_DEBUG_AUTH = 'true'

// Extend the Window interface (ambient declaration) for TS
declare global {
  interface Window {
    __DEBUG_AUTH__?: boolean
  }
}

const envFlag = import.meta.env.VITE_DEBUG_AUTH === 'true'

export const debugAuth = (
  label: string,
  payload?: unknown,
): void => {
  if (typeof window !== 'undefined') {
    if (!window.__DEBUG_AUTH__ && !envFlag) return
  } else if (!envFlag) return
  // eslint-disable-next-line no-console
  console.log(`[AuthDebug] ${label}`, payload ?? '')
}
