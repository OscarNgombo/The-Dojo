declare global {
  interface Window {
    __DEBUG_AUTH__?: boolean
  }
}

const envFlag = import.meta.env.VITE_DEBUG_AUTH === 'true'

export const debugAuth = (label: string, payload?: unknown): void => {
  if (typeof window !== 'undefined') {
    if (!window.__DEBUG_AUTH__ && !envFlag) return
  } else if (!envFlag) return
  console.log(`[AuthDebug] ${label}`, payload ?? '')
}
