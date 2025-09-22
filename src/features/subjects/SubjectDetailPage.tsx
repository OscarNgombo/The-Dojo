import { useEffect, useState } from 'react'
import type { Subject } from '@/types'
import { subjectService, normalizeSubject } from '@/api/subjects'
import { formatDate } from '@/utils/dateUtils'
import { useRequireAdmin } from '@/hooks/useAuthGuards'
import { decodeId } from '@/utils/idCodec'
import { AccessDenied, Badge, Button, Spinner, InfoBlock } from '@/components/ui'
import { useSubjects } from '@/providers'
import { useNavigate } from '@tanstack/react-router'

interface SubjectDetailPageProps {
  subjectIdParam: string
  initialEdit?: boolean
}

const SubjectDetailPage: React.FC<SubjectDetailPageProps> = ({
  subjectIdParam,
  initialEdit = false,
}) => {
  const { loading, isAuthorized, isAuthenticated } = useRequireAdmin()
  const decodedId = decodeId(subjectIdParam)
  const navigate = useNavigate()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(initialEdit)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { actions } = useSubjects()

  useEffect(() => {
    if (!isAuthorized || !isAuthenticated) return
    let cancelled = false
    const run = async () => {
      setFetching(true)
      setFetchError(null)
      try {
        const resp = await subjectService.getSubjectById(String(decodedId))
        const root: any = resp.data
        const payload: any = root && root.subject ? root.subject : root
        if (!payload || !payload.id) throw new Error('Subject not found')
        const normalized = normalizeSubject(payload)
        if (!cancelled) {
          setSubject(normalized)
          setName(normalized.name)
          setDescription(normalized.description)
          setActive(normalized.isActive)
        }
      } catch (e: any) {
        if (!cancelled)
          setFetchError(e?.message || 'Failed to load subject details')
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [isAuthorized, isAuthenticated, decodedId])

  if (!isAuthenticated || !isAuthorized) return <AccessDenied />
  if (loading || fetching || (!subject && !fetchError)) {
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
  if (fetchError)
    return (
      <div style={{ padding: '2rem', color: 'red' }}>Error: {fetchError}</div>
    )
  if (!subject) return null

  const handleSave = async () => {
    setFormError(null)
    if (!name.trim()) {
      setFormError('Name is required')
      return
    }
    if (description.trim().length < 10) {
      setFormError('Description must be at least 10 characters')
      return
    }
    try {
      setSaving(true)
      await actions.updateSubject(String(subject.id), {
        name: name.trim(),
        description: description.trim(),
        isActive: active,
      })
      setEditMode(false)
    } catch (e: any) {
      setFormError(e?.message || 'Failed to update subject')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete subject "${subject.name}"? This action cannot be undone.`,
      )
    )
      return
    await actions.deleteSubject(String(subject.id))
    navigate({ to: '/admin/subjects' })
  }

  return (
    <div
      style={{
        padding: '1rem',
        maxWidth: '860px',
        margin: '0 auto',
        background: 'var(--light-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="text"
            onClick={() => navigate({ to: '/admin/subjects' })}
            style={{ padding: 0, color: 'var(--primary-color)' }}
          >
            ← Back
          </Button>
          {!editMode && (
            <Button variant="secondary" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
          {editMode && (
            <>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditMode(false)
                  setName(subject.name)
                  setDescription(subject.description)
                  setActive(subject.isActive)
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          )}
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 'var(--small-font-size)',
              color: 'var(--secondary-color)',
            }}
          >
            Status:
          </span>
          <Badge variant={subject.isActive ? 'success' : 'danger'}>
            {subject.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
      {!editMode && (
        <header style={{ marginBottom: '24px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--header-font-size)',
              color: 'var(--dark-color)',
            }}
          >
            {subject.name}
          </h1>
          <p
            style={{
              margin: '4px 0 8px',
              color: 'var(--secondary-color)',
              fontSize: 'var(--small-font-size)',
              lineHeight: 1.4,
            }}
          >
            {subject.description || 'No description provided.'}
          </p>
        </header>
      )}
      {editMode && (
        <section
          style={{
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label
              htmlFor="edit-subject-name"
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Name <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="edit-subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="edit-subject-description"
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Description{' '}
              <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <textarea
              id="edit-subject-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                resize: 'vertical',
              }}
            />
          </div>
          <label
            htmlFor="edit-subject-active"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <input
              id="edit-subject-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />{' '}
            Active
          </label>
          {formError && (
            <p style={{ color: 'var(--danger-color)', fontSize: 12 }}>
              {formError}
            </p>
          )}
        </section>
      )}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <InfoBlock label="Subject ID" value={String(subject.id)} />
        <InfoBlock label="Created" value={formatDate(subject.createdAt)} />
        <InfoBlock label="Last Updated" value={formatDate(subject.updatedAt)} />
        <InfoBlock
          label="Created By"
          value={subject.createdByName || subject.createdBy || '—'}
        />
      </section>
    </div>
  )
}

export default SubjectDetailPage
