import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useRequireAdmin } from '@/hooks/useAuthGuards'
import { AccessDenied, Button, Spinner, Badge } from '@/components/ui'
import { useSubjects } from '@/providers'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/subjects/create')({
  component: CreateSubjectPage,
})

function CreateSubjectPage() {
  const { loading: authLoading, isAuthorized, isAuthenticated } = useRequireAdmin()
  const { actions } = useSubjects()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) {
    return <AccessDenied />
  }

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }
    try {
      setSubmitting(true)
      await actions.createSubject({ name: name.trim(), description: description.trim(), isActive })
      navigate({ to: '/admin/subjects' })
    } catch (e: any) {
      setError(e?.message || 'Failed to create subject')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button variant="text" onClick={() => navigate({ to: '/admin/subjects' })} style={{ padding: 0, color: 'var(--primary-color)' }}>
          ← Back to Subjects
        </Button>
        <Badge variant={isActive ? 'success' : 'danger'}>{isActive ? 'Active' : 'Inactive'}</Badge>
      </div>
      <h1 style={{ marginTop: 0 }}>Create Subject</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="subject-name" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Name <span style={{ color: 'var(--danger-color)' }}>*</span>
          </label>
          <input
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border-color)' }}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="subject-description" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Description <span style={{ color: 'var(--danger-color)' }}>*</span>
          </label>
          <textarea
            id="subject-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border-color)', resize: 'vertical' }}
            aria-required="true"
          />
        </div>
        <label htmlFor="subject-active" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            id="subject-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        {error && <p style={{ color: 'var(--danger-color)', fontSize: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => navigate({ to: '/admin/subjects' })} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Subject'}
          </Button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--secondary-color)' }}>
          All fields marked * are required. Description must be at least 10 characters.
        </p>
      </div>
    </div>
  )
}
