export type Direction = 'asc' | 'desc'

export interface SortConfig<T extends Record<string, unknown>> {
  field: keyof T
  direction?: Direction
}

export interface TextSearchConfig<T extends Record<string, unknown>> {
  term: string
  fields: Array<keyof T>
}

export interface BooleanFilterConfig<T extends Record<string, unknown>> {
  field: keyof T
  value: boolean
}

export function applyTextSearch<T extends Record<string, unknown>>(
  items: T[],
  config?: TextSearchConfig<T>,
): T[] {
  if (!config || !config.term.trim()) return items
  const term = config.term.toLowerCase().trim()
  return items.filter((item) =>
    config.fields.some((f) => {
      const v = item[f]
      if (v == null) return false
      return String(v).toLowerCase().includes(term)
    }),
  )
}

export function applyBooleanFilter<T extends Record<string, unknown>>(
  items: T[],
  config?: BooleanFilterConfig<T>,
): T[] {
  if (!config) return items
  return items.filter((item) => item[config.field] === config.value)
}

export function applySort<T extends Record<string, unknown>>(
  items: T[],
  config?: SortConfig<T>,
  fallback?: (a: T, b: T) => number,
): T[] {
  if (!config) {
    return fallback ? [...items].sort(fallback) : [...items]
  }
  const { field, direction = 'asc' } = config
  const dir = direction === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const av = a[field]
    const bv = b[field]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
}

export interface ProcessListParams<T extends Record<string, unknown>> {
  items: T[]
  search?: TextSearchConfig<T>
  bool?: BooleanFilterConfig<T>
  sort?: SortConfig<T>
  fallbackSort?: (a: T, b: T) => number
}

export function processList<T extends Record<string, unknown>>(
  params: ProcessListParams<T>,
): T[] {
  const afterSearch = applyTextSearch<T>(params.items, params.search)
  const afterBool = applyBooleanFilter<T>(afterSearch, params.bool)
  return applySort<T>(afterBool, params.sort, params.fallbackSort)
}

export function filterAndSortSubjects(
  subjects: any[],
  options: {
    searchTerm?: string
    isActive?: boolean | undefined
    sortField?: string
    sortDirection?: Direction
  },
): any[] {
  return processList({
    items: subjects,
    search: options.searchTerm
      ? { term: options.searchTerm, fields: ['name', 'description'] }
      : undefined,
    bool:
      typeof options.isActive === 'boolean'
        ? { field: 'isActive', value: options.isActive }
        : undefined,
    sort: options.sortField
      ? { field: options.sortField as any, direction: options.sortDirection }
      : undefined,
    fallbackSort: (a: any, b: any) => {
      const ai = Number(a.id)
      const bi = Number(b.id)
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi
      return String(a.id).localeCompare(String(b.id))
    },
  })
}

export function filterAndSortTasks(
  tasks: any[],
  options: {
    searchTerm?: string
    sortField?: string
    sortDirection?: Direction
  },
): any[] {
  return processList({
    items: tasks,
    search: options.searchTerm
      ? {
          term: options.searchTerm,
          fields: ['title', 'description', 'requirements'],
        }
      : undefined,
    sort: options.sortField
      ? { field: options.sortField as any, direction: options.sortDirection }
      : undefined,
    fallbackSort: (a: any, b: any) => Number(a.id) - Number(b.id),
  })
}

export function filterAndSortUsers(
  users: any[],
  options: {
    sortField?: string
    sortDirection?: Direction
    searchTerm?: string
  },
): any[] {
  return processList({
    items: users,
    search: options.searchTerm
      ? { term: options.searchTerm, fields: ['name', 'email'] }
      : undefined,
    sort: options.sortField
      ? { field: options.sortField as any, direction: options.sortDirection }
      : undefined,
    fallbackSort: (a: any, b: any) => {
      const ai = Number(a.id)
      const bi = Number(b.id)
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi
      return String(a.id).localeCompare(String(b.id))
    },
  })
}
