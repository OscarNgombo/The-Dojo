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

export const useQueryState = <T, R extends string>(options: UseQueryStateOptions<T, R>) => {
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
      return parse ? parse(raw) : ((raw as unknown) as T)
    } catch {
      return defaultValue
    }
  })()

  const [value, setValue] = useState<T>(initial)
  const debounceRef = useRef<number | null>(null)

  const commit = useCallback(
    (next: T) => {
      const serialized = serialize ? serialize(next) : String(next)
      const nextSearch: Record<string, string> = { ...search }
      if (serialized == null || serialized === '' || serialized === 'all') {
        delete nextSearch[key]
      } else {
        nextSearch[key] = serialized
      }
      navigate({ to: route.replace(/\/$/, ''), search: nextSearch as any, replace })
    },
    [key, serialize, search, replace, navigate, route],
  )

  const setQueryState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        if (debounceMs > 0) {
          if (debounceRef.current) window.clearTimeout(debounceRef.current)
          debounceRef.current = window.setTimeout(() => commit(resolved), debounceMs) as unknown as number
        } else {
          commit(resolved)
        }
        return resolved
      })
    },
    [commit, debounceMs],
  )

  useEffect(() => {
    const raw = search[key]
    const parsed = raw == null ? defaultValue : parse ? parse(raw) : ((raw as unknown) as T)
    setValue(parsed)
  }, [search[key]])

  return [value, setQueryState] as const
}
