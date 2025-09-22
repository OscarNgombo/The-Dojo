import { describe, it, expect } from 'vitest';
import { parseEditMode, isEditMode } from '@/utils/searchParams';

describe('searchParams helpers', () => {
  it('returns empty object when mode not edit', () => {
    expect(parseEditMode({})).toEqual({});
    expect(parseEditMode({ mode: 'view' as unknown as string })).toEqual({});
  });

  it('returns edit when mode=edit', () => {
    expect(parseEditMode({ mode: 'edit' })).toEqual({ mode: 'edit' });
  });

  it('isEditMode true only when edit', () => {
    expect(isEditMode({})).toBe(false);
    expect(isEditMode({ mode: 'edit' })).toBe(true);
  });
});
