import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

export interface UseQueryStateOptions<T, R extends string> {
  key: string
  parse?: (raw: string | undefined) => T
  serialize?: (value: T) => string | undefined
  defaultValue: T
  route: R
  replace?: boolean
  debounceMs?: number
}

export const useQueryState = <T, R extends string>(
  options: UseQueryStateOptions<T, R>,
) => {
  const {
    key,
    parse,
    serialize,
    defaultValue,
    route,
    replace = true,
    debounceMs = 0,
  } = options

  const navigate = useNavigate()
  const search = useSearch({ from: route as any }) as Record<string, string>

  const initial: T = (() => {
    const raw = search[key]
    if (raw == null) return defaultValue
    try {
      return parse ? parse(raw) : (raw as unknown as T)
    } catch {
      return defaultValue
    }
  })()

  const [value, setValue] = useState<T>(initial)
  const debounceRef = useRef<number | null>(null)

  // We defer URL synchronization to an effect to avoid triggering navigation
  // during render (which React flags as setState in render elsewhere).
  const pendingValueRef = useRef<T | null>(null)
  const lastCommittedRef = useRef<T>(initial)
  const [version, setVersion] = useState(0)

  const scheduleCommit = useCallback((next: T) => {
    pendingValueRef.current = next
    // bump version so commit effect runs even if dependencies otherwise stable
    setVersion((v) => v + 1)
  }, [])

  const setQueryState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        if (debounceMs > 0) {
          if (debounceRef.current) window.clearTimeout(debounceRef.current)
          debounceRef.current = window.setTimeout(
            () => scheduleCommit(resolved),
            debounceMs,
          ) as unknown as number
        } else {
          scheduleCommit(resolved)
        }
        return resolved
      })
    },
    [scheduleCommit, debounceMs],
  )

  // Commit effect: sync pending value to router search when changed
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    const pending = pendingValueRef.current
    if (pending == null) return
    if (Object.is(pending, lastCommittedRef.current)) return
    const serialized = serialize ? serialize(pending) : String(pending)
    const nextSearch: Record<string, string> = { ...search }
    if (serialized == null || serialized === '' || serialized === 'all') {
      delete nextSearch[key]
    } else {
      nextSearch[key] = serialized
    }
    lastCommittedRef.current = pending
    pendingValueRef.current = null
    navigate({
      to: route.replace(/\/$/, ''),
      search: nextSearch as any,
      replace,
    })
  }, [search, key, serialize, navigate, route, replace, version])

  useEffect(() => {
    const raw = search[key]
    const parsed =
      raw == null ? defaultValue : parse ? parse(raw) : (raw as unknown as T)
    setValue(parsed)
    lastCommittedRef.current = parsed
  }, [search, key, parse, defaultValue])

  return [value, setQueryState] as const
}
