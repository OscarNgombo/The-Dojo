import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { subjectService, normalizeSubject } from '@/api/subjects'
import type { Subject, SubjectFormData, RawSubject } from '@/types'
import { useToast } from './ToastProvider'
import { useApiCall } from '@/hooks/useApiCall'
import { useMutate } from '@/hooks/useMutate'
import { refetchSubjects } from '@/utils/refetchRollback'

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
  // Sorting intentionally client-side only now.
}

interface SubjectsActions {
  fetchSubjects: (
    page: number,
    pageSize?: number,
    options?: FetchSubjectsOptions,
  ) => Promise<void>
  createSubject: (data: SubjectFormData) => Promise<Subject | null>
  updateSubject: (id: string, data: SubjectFormData) => Promise<Subject | null>
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

const ensureSubject = (raw: Subject | RawSubject): Subject => {
  if ((raw as RawSubject).is_active !== undefined) {
    return normalizeSubject(raw as RawSubject)
  }
  return raw as Subject
}

export const SubjectsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SubjectsState>(initialState)
  const lastQueryRef = useRef<{
    page: number
    pageSize: number
    options?: FetchSubjectsOptions
  }>({ page: 1, pageSize: 10 })
  useToast()

  const subjectsCall = useApiCall<{
    records: Array<Subject | RawSubject>
    current_page: number
    last_page: number
    total_count: number
  }>({ keepPreviousData: true })


  const createMut = useMutate<SubjectFormData, Subject>({
    mutateFn: async (form) => (await subjectService.createSubject(form)).data,
    optimisticUpdate: (form) => {
      const temp: Subject = {
        id: `temp-${Date.now()}`,
        name: form.name,
        description: form.description,
        isActive: form.isActive,
        createdBy: 'me',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByName: 'You',
      }
      setState((prev) => ({
        ...prev,
        subjects: [temp, ...prev.subjects],
        totalCount: prev.totalCount + 1,
      }))
    },
    rollback: () => { void refetchSubjects(subjectsCall.execute, lastQueryRef.current) },
    onSuccess: (created) => {
      const normalized = ensureSubject(created)
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id.startsWith('temp-') ? normalized : s,
        ),
      }))
    },
    autoToast: { success: true, error: true },
    messages: { success: 'Subject created' },
  })

  const updateMut = useMutate<{ id: string; data: SubjectFormData }, Subject>({
    mutateFn: async ({ id, data }) =>
      (await subjectService.updateSubject(id, data)).data,
    optimisticUpdate: ({ id, data }) => {
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === id
            ? {
                ...s,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
              }
            : s,
        ),
      }))
    },
    rollback: () => { void refetchSubjects(subjectsCall.execute, lastQueryRef.current) },
    onSuccess: (updated, { id }) => {
      const norm = ensureSubject(updated)
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => (s.id === id ? norm : s)),
      }))
    },
    autoToast: { success: true, error: true },
    messages: { success: 'Subject updated' },
  })

  const deleteMut = useMutate<{ id: string }, { success: boolean }>({
    mutateFn: async ({ id }) => (await subjectService.deleteSubject(id)).data,
    optimisticUpdate: ({ id }) => {
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== id),
        totalCount: prev.totalCount > 0 ? prev.totalCount - 1 : 0,
      }))
    },
    rollback: () => { void refetchSubjects(subjectsCall.execute, lastQueryRef.current) },
    autoToast: { success: true, error: true },
    messages: { success: 'Subject deleted' },
  })

  const actions = useMemo<SubjectsActions>(() => {
    const fetchSubjects: SubjectsActions['fetchSubjects'] = async (
      page,
      pageSize = 10,
      options,
    ) => {
      lastQueryRef.current = { page, pageSize, options }
      const data = await subjectsCall.execute(async () => {
        const raw = await subjectService.getSubjects(page, pageSize, {
          search: options?.search,
          isActive: options?.isActive,
        })
        return { success: true, data: raw.data }
      })
      if (data) {
        const records = Array.isArray(data.records)
          ? data.records.map((r: Subject | RawSubject) => ensureSubject(r))
          : []
        setState((prev) => ({
          ...prev,
          loading: subjectsCall.loading,
          error: subjectsCall.error,
          subjects: records,
          currentPage: data.current_page,
          totalPages: data.last_page,
          totalCount: data.total_count,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          loading: subjectsCall.loading,
          error: subjectsCall.error,
        }))
      }
    }
    const refetch: SubjectsActions['refetch'] = async () => {
      const { page, pageSize, options } = lastQueryRef.current
      await fetchSubjects(page, pageSize, options)
    }
    const createSubject: SubjectsActions['createSubject'] = async (form) => {
      const res = await createMut.mutate(form)
      return res ? ensureSubject(res) : null
    }
    const updateSubject: SubjectsActions['updateSubject'] = async (
      id,
      form,
    ) => {
      const res = await updateMut.mutate({ id, data: form })
      return res ? ensureSubject(res) : null
    }
    const deleteSubject: SubjectsActions['deleteSubject'] = async (id) => {
      await deleteMut.mutate({ id })
    }
    return {
      fetchSubjects,
      createSubject,
      updateSubject,
      deleteSubject,
      refetch,
    }
  }, [subjectsCall, createMut, updateMut, deleteMut])

  const contextValue = useMemo(() => ({ state, actions }), [state, actions])
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
