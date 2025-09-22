/** Common helpers for validating & deriving UI state from search params */

export interface EditModeSearch {
  mode?: 'edit';
}

/**
 * Normalize an arbitrary record of search params to a typed object
 * supporting a single optional `mode=edit` flag.
 */
export const parseEditMode = (search: Record<string, unknown>): EditModeSearch => {
  if (search.mode === 'edit') return { mode: 'edit' };
  return {};
};

/** Convenience boolean to reduce repetition */
export const isEditMode = (s: EditModeSearch): boolean => s.mode === 'edit';
