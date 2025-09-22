import { useState } from 'react'
import type { SubjectFormData, Subject } from '@/types'

interface UseSubjectFormOptions {
  initial?: Partial<Subject>
  onValidate?: (data: SubjectFormData) => string | null
}

interface UseSubjectFormResult {
  values: SubjectFormData
  errors: { form?: string }
  setName: (v: string) => void
  setDescription: (v: string) => void
  setActive: (v: boolean) => void
  validate: () => boolean
  reset: () => void
}

export const useSubjectForm = (options?: UseSubjectFormOptions): UseSubjectFormResult => {
  const [values, setValues] = useState<SubjectFormData>({
    name: options?.initial?.name || '',
    description: options?.initial?.description || '',
    isActive: options?.initial?.isActive ?? true,
  })
  const [errors, setErrors] = useState<{ form?: string }>({})

  const setName = (name: string) => setValues(v => ({ ...v, name }))
  const setDescription = (description: string) => setValues(v => ({ ...v, description }))
  const setActive = (isActive: boolean) => setValues(v => ({ ...v, isActive }))

  const validate = () => {
    if (!values.name.trim()) { setErrors({ form: 'Name is required' }); return false }
    if (values.description.trim().length < 10) { setErrors({ form: 'Description must be at least 10 characters' }); return false }
    if (options?.onValidate) {
      const custom = options.onValidate(values)
      if (custom) { setErrors({ form: custom }); return false }
    }
    setErrors({})
    return true
  }

  const reset = () => {
    setValues({ name: '', description: '', isActive: true })
    setErrors({})
  }

  return { values, errors, setName, setDescription, setActive, validate, reset }
}
