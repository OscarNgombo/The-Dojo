import { useEffect, useState } from 'react'
import { taskService, normalizeTask } from '@/api/tasks'
import type { Task, TaskFormData } from '@/types'
import { Spinner, Button, Input } from '@/components/ui'
import { useToast } from '@/providers/ToastProvider'

interface TaskDetailPageProps {
  taskIdParam: string
  initialEdit?: boolean
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ taskIdParam, initialEdit }) => {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<boolean>(!!initialEdit)
  const [form, setForm] = useState<TaskFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await taskService.getTaskById(taskIdParam)
        const normalized = normalizeTask(resp.data as any)
        setTask(normalized)
        if (!form) {
          setForm({
            subjectId: normalized.subjectId,
            title: normalized.title,
            description: normalized.description,
            requirements: normalized.requirements,
            dueDate: normalized.dueDate,
            maxScore: normalized.maxScore,
            isActive: normalized.isActive,
          })
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load task'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [taskIdParam])

  if (loading) return <Spinner />
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!task) return <div>Task not found.</div>

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{editMode ? 'Edit Task' : task.title}</h1>
      {!editMode && (
        <>
          <p><strong>Subject:</strong> {task.subjectName || task.subjectId}</p>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Requirements:</strong> {task.requirements}</p>
          <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}</p>
          <p><strong>Max Score:</strong> {task.maxScore}</p>
          <p><strong>Active:</strong> {task.isActive ? 'Yes' : 'No'}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button variant="primary" onClick={() => setEditMode(true)}>Edit</Button>
            <Button variant="secondary" onClick={() => window.history.back()}>Back</Button>
          </div>
        </>
      )}
      {editMode && form && (
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 480 }}
          onSubmit={async (e) => {
            e.preventDefault()
            // Basic validation
            if (!form.title.trim()) {
              addToast({ message: 'Title required', type: 'error' })
              return
            }
            if (!form.subjectId) {
              addToast({ message: 'Subject ID required', type: 'error' })
              return
            }
            setSaving(true)
            try {
              const resp = await taskService.updateTask(task.id, form)
              const updated = normalizeTask(resp.data as any)
              setTask(updated)
              addToast({ message: 'Task updated', type: 'success' })
              setEditMode(false)
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Update failed'
              addToast({ message: msg, type: 'error' })
            } finally {
              setSaving(false)
            }
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>Title</span>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>Subject ID</span>
            <Input
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            />
          </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ padding: '8px', fontFamily: 'inherit', fontSize: 14 }}
                rows={3}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Requirements</span>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                style={{ padding: '8px', fontFamily: 'inherit', fontSize: 14 }}
                rows={3}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Due Date (ISO)</span>
              <Input
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Max Score</span>
              <Input
                type="number"
                value={String(form.maxScore)}
                onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) || 0 })}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span>Active</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setEditMode(false)
                  if (task) {
                    setForm({
                      subjectId: task.subjectId,
                      title: task.title,
                      description: task.description,
                      requirements: task.requirements,
                      dueDate: task.dueDate,
                      maxScore: task.maxScore,
                      isActive: task.isActive,
                    })
                  }
                }}
              >
                Cancel
              </Button>
            </div>
        </form>
      )}
    </div>
  )
}

export default TaskDetailPage
