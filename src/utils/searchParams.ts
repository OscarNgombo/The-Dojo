export interface EditModeSearch {
  mode?: 'edit'
}

export const parseEditMode = (
  search: Record<string, unknown>,
): EditModeSearch => {
  if (search.mode === 'edit') return { mode: 'edit' }
  return {}
}

export const isEditMode = (s: EditModeSearch): boolean => s.mode === 'edit'
