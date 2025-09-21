export const encodeId = (raw: string | number): string => {
  const str = String(raw)
  try {
    if (typeof btoa === 'function') return btoa(str)
  } catch (_) {
    // ignore
  }
  return str
}

export const decodeId = (maybeEncoded: string): string => {
  try {
    if (typeof atob === 'function') {
      const decoded = atob(maybeEncoded)
      if (/^\d+$/.test(decoded) || /^[0-9a-fA-F-]{8,}$/.test(decoded)) {
        return decoded
      }
    }
  } catch (_) {
    // swallow
  }
  return maybeEncoded
}
