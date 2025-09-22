import { useEffect, useMemo, useState } from 'react'
import { useRequireAdmin } from '@/hooks/useAuthGuards'
import {
  Spinner,
  AccessDenied,
  DataTable,
  Badge,
  Modal,
  RowActions,
  Button,
} from '@/components/ui'
import type { ColumnDef } from '@/types/dataTable'
import type { Subject } from '@/types'
import { formatDate } from '@/utils/dateUtils'
import { useNavigate } from '@tanstack/react-router'
import { encodeId } from '@/utils/idCodec'
import { useSubjectsList } from '@/hooks/useSubjectsList'

export const SubjectsList: React.FC = () => {
  const {
    loading: authLoading,
    isAuthorized,
    isAuthenticated,
  } = useRequireAdmin()
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) return <AccessDenied />

  const navigate = useNavigate()
  const list = useSubjectsList()
  const {
    subjects,
    loading,
    error,
    filters,
    pagination: listPagination,
    refresh,
    deleteSubject,
  } = list
  const {
    search: searchTerm,
    setSearch: setSearchTerm,
    activeFilter,
    setActiveFilter,
    page,
    setPage,
    reset,
  } = filters
  const { totalPages, totalCount, currentPage } = listPagination
  const [isFilterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    if (currentPage && currentPage !== page) setPage(currentPage)
  }, [currentPage, page, setPage])
  const filterCount = useMemo(
    () => [searchTerm !== '', activeFilter !== 'all'].filter(Boolean).length,
    [searchTerm, activeFilter],
  )
  const displayedSubjects = useMemo(() => [...subjects], [subjects])

  const handleDelete = async (subject: Subject) => {
    if (
      window.confirm(
        `Delete subject "${subject.name}"? This action cannot be undone.`,
      )
    ) {
      await deleteSubject(subject.id)
    }
  }

  const columns: ColumnDef<Subject>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span style={{ fontSize: 12 }}>
          {row.original.description.length > 60
            ? row.original.description.slice(0, 57) + '...'
            : row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span style={{ fontSize: 12 }}>
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              label: 'View',
              onClick: () =>
                navigate({
                  to: '/admin/subjects/$subjectId',
                  params: { subjectId: encodeId(row.original.id) },
                }),
            },
            {
              label: 'Update',
              onClick: () =>
                navigate({
                  to: '/admin/subjects/$subjectId',
                  params: { subjectId: encodeId(row.original.id) },
                  search: { mode: 'edit' },
                }),
            },
            {
              label: 'Delete',
              onClick: () => handleDelete(row.original),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ]

  if (loading && subjects.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Subjects</h1>
      <div style={{ marginBottom: '0.75rem' }}>
        <label
          htmlFor="subject-search"
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          Search Subjects
        </label>
        <input
          id="subject-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or description"
          style={{
            width: '33%',
            padding: '8px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
          }}
          aria-label="Search subjects by name or description"
        />
      </div>
      <DataTable
        columns={columns}
        data={displayedSubjects}
        caption="Training subjects overview table"
        ariaLabel="Subjects table with filtering and pagination"
        getRowId={(row: Subject) => row.id}
        currentPage={currentPage || 1}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        totalCount={totalCount}
        pageSize={10}
        showFilterButton={!filterCount}
        filterActive={
          filterCount
            ? { count: filterCount, onClear: () => reset() }
            : undefined
        }
        onFilter={() => setFilterOpen(true)}
        onRefresh={() => refresh()}
        leftActionsExtra={
          <Button
            variant="primary"
            onClick={() => navigate({ to: '/admin/subjects/create' })}
          >
            Create Subject
          </Button>
        }
        emptyState={
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 600 }}>No subjects found</p>
            <p style={{ fontSize: 12, color: 'var(--secondary-color)' }}>
              Try adjusting your search or filter criteria to find subjects.
            </p>
          </div>
        }
      />
      <Modal
        open={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Subjects"
        description="Adjust filtering options for the subjects table. Use status to narrow results."
        primaryAction={{
          label: 'Apply',
          onClick: () => setFilterOpen(false),
          autoFocus: true,
        }}
        secondaryAction={{
          label: 'Reset',
          onClick: () => {
            reset()
            setFilterOpen(false)
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="subject-status-filter"
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Status
            </label>
            <select
              id="subject-status-filter"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SubjectsList
