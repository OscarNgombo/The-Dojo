import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SubjectsList from '../../../../features/subjects/SubjectsList'
import { RootTestProviders } from '../../../RootTestProviders'

vi.mock('@/hooks/useAuthGuards', () => ({
  useRequireAdmin: () => ({
    loading: false,
    isAuthorized: true,
    isAuthenticated: true,
  }),
}))

vi.mock('@tanstack/react-router', async () => {
  const actual: any = await vi.importActual('@tanstack/react-router')
  return { ...actual, useNavigate: () => () => {} }
})

vi.mock('@/hooks/useSubjectsList', () => ({
  useSubjectsList: () => ({
    subjects: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      setSearch: () => {},
      activeFilter: 'all',
      setActiveFilter: () => {},
      page: 1,
      setPage: () => {},
      reset: () => {},
    },
    pagination: { currentPage: 1, totalPages: 1, totalCount: 0 },
    refresh: () => {},
    deleteSubject: async () => {},
  }),
}))

describe('SubjectsList (isolated)', () => {
  it('renders heading and can toggle search input', async () => {
    render(
      <RootTestProviders>
        <SubjectsList />
      </RootTestProviders>,
    )
    expect(
      await screen.findByRole('heading', { name: /subjects/i }),
    ).toBeInTheDocument()
    const toggleBtn = screen.getByRole('button', { name: /show search/i })
    toggleBtn.click()
    // Wait for the input to appear after state update
    expect(await screen.findByLabelText(/search subjects/i)).toBeInTheDocument()
  })
})
