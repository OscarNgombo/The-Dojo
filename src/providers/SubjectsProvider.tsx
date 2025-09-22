import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { subjectService } from '../api/subjects'
import type { Subject, SubjectFormData, RawSubject } from '../types'
import { useToast } from './ToastProvider'

interface SubjectsState {
  subjects: Subject[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
}

interface FetchSubjectsOptions {
  search?: string
  isActive?: boolean
  sortField?: 'id' | 'name' | 'created_at'
  sortDirection?: 'asc' | 'desc'
}

interface SubjectsActions {
  fetchSubjects: (
    page: number,
    pageSize?: number,
    options?: FetchSubjectsOptions,
  ) => Promise<void>
  createSubject: (data: SubjectFormData) => Promise<Subject | null>
  updateSubject: (
    id: string,
    data: SubjectFormData,
  ) => Promise<Subject | null>
  deleteSubject: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

interface SubjectsContextType {
  state: SubjectsState
  actions: SubjectsActions
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(
  undefined,
)

const initialState: SubjectsState = {
  subjects: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
}

// Normalization from snake_case RawSubject to Subject
const normalizeSubject = (raw: RawSubject): Subject => ({
  id: String(raw.id),
  name: raw.name,
  description: raw.description,
  isActive: raw.is_active,
  createdBy: String(raw.created_by),
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  createdByName: raw.created_by_name,
})

export const SubjectsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SubjectsState>(initialState)
  const lastQueryRef = useRef<{
    page: number
    pageSize: number
    options?: FetchSubjectsOptions
  }>({ page: 1, pageSize: 10 })
  const { addToast } = useToast()

  const actions = useMemo<SubjectsActions>(() => {
    const fetchSubjects: SubjectsActions['fetchSubjects'] = async (
      page,
      pageSize = 10,
      options,
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        // Query params for search / active filtering handled client-side for now
        const resp = await subjectService.getSubjects(page, pageSize)
        const records = Array.isArray(resp.data.records)
          ? resp.data.records.map((r) => normalizeSubject(r as unknown as RawSubject))
          : []

        let filtered = records
        if (options?.isActive !== undefined) {
          filtered = filtered.filter((s) => s.isActive === options.isActive)
        }
        if (options?.search) {
          const term = options.search.toLowerCase()
            .trim()
          filtered = filtered.filter(
            (s) =>
              s.name.toLowerCase().includes(term) ||
              s.description.toLowerCase().includes(term),
          )
        }
        if (options?.sortField) {
          const { sortField, sortDirection = 'asc' } = options
          filtered = [...filtered].sort((a, b) => {
            const dir = sortDirection === 'asc' ? 1 : -1
            const av = (a as any)[sortField]
            const bv = (b as any)[sortField]
            if (av < bv) return -1 * dir
            if (av > bv) return 1 * dir
            return 0
          })
        } else {
          // default sort by id asc (numeric compare if possible)
            filtered = [...filtered].sort((a, b) => {
              const ai = Number(a.id)
              const bi = Number(b.id)
              if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi
              return String(a.id).localeCompare(String(b.id))
            })
        }

        lastQueryRef.current = { page, pageSize, options }
        setState((prev) => ({
          ...prev,
            loading: false,
            subjects: filtered,
            currentPage: resp.data.current_page,
            totalPages: resp.data.last_page,
            totalCount: resp.data.total_count,
        }))
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load subjects'
        setState((p) => ({ ...p, loading: false, error: message }))
        addToast({ message, type: 'error' })
      }
    }

    const refetch: SubjectsActions['refetch'] = async () => {
      const { page, pageSize, options } = lastQueryRef.current
      await fetchSubjects(page, pageSize, options)
    }

    const createSubject: SubjectsActions['createSubject'] = async (data) => {
      try {
        const resp = await subjectService.createSubject(data)
        addToast({ message: 'Subject created', type: 'success' })
        // Optimistic prepend
        setState((prev) => ({
          ...prev,
          subjects: [
            normalizeSubject(resp.data as unknown as RawSubject),
            ...prev.subjects,
          ],
          totalCount: prev.totalCount + 1,
        }))
        return normalizeSubject(resp.data as unknown as RawSubject)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to create subject'
        addToast({ message, type: 'error' })
        return null
      }
    }

    const updateSubject: SubjectsActions['updateSubject'] = async (
      id,
      data,
    ) => {
      try {
        const resp = await subjectService.updateSubject(id, data)
        const updated = normalizeSubject(resp.data as unknown as RawSubject)
        setState((prev) => ({
          ...prev,
          subjects: prev.subjects.map((s) => (s.id === id ? updated : s)),
        }))
        addToast({ message: 'Subject updated', type: 'success' })
        return updated
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to update subject'
        addToast({ message, type: 'error' })
        return null
      }
    }

    const deleteSubject: SubjectsActions['deleteSubject'] = async (id) => {
      try {
        await subjectService.deleteSubject(id)
        setState((prev) => ({
          ...prev,
          subjects: prev.subjects.filter((s) => s.id !== id),
          totalCount: prev.totalCount > 0 ? prev.totalCount - 1 : 0,
        }))
        addToast({ message: 'Subject deleted', type: 'success' })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to delete subject'
        addToast({ message, type: 'error' })
      }
    }

    return {
      fetchSubjects,
      createSubject,
      updateSubject,
      deleteSubject,
      refetch,
    }
  }, [addToast])

  const contextValue = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions],
  )

  return (
    <SubjectsContext.Provider value={contextValue}>
      {children}
    </SubjectsContext.Provider>
  )
}

export const useSubjects = (): SubjectsContextType => {
  const ctx = useContext(SubjectsContext)
  if (!ctx) throw new Error('useSubjects must be used within SubjectsProvider')
  return ctx
}
