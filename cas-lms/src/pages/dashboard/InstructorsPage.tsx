import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, BookOpen, Users, Loader2, X, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { getUsers, getCourses, createUser, updateUser, deleteUser, createNotification } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Instructor {
  id: number
  name: string
  email: string
  password: string
  department?: string
  courseCount?: number
  studentCount?: number
}

export default function InstructorsPage() {
  const { user } = useAuth()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([getUsers(), getCourses()])
      const teachers = usersRes.data.filter((u: { role: string }) => u.role === 'teacher')
      const enriched = teachers.map((t: Instructor) => {
        const teacherCourses = coursesRes.data.filter((c: { instructorId: number }) => c.instructorId === t.id)
        return {
          ...t,
          courseCount: teacherCourses.length,
          studentCount: teacherCourses.reduce((acc: number, c: { students: number }) => acc + c.students, 0),
        }
      })
      setInstructors(enriched)
    } catch (err) {
      console.error('Failed to fetch instructors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) return
    setSaving(true)
    try {
      await createUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: 'teacher',
        avatar: '',
        department: formDepartment,
        flagged: false,
        flagReason: '',
        createdAt: new Date().toISOString().split('T')[0],
      })
      await createNotification({
        userId: user?.id,
        title: 'New Instructor Added',
        message: `${formName} has been added as an instructor`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      })
      setShowCreateModal(false)
      resetForm()
      fetchInstructors()
    } catch (err) {
      console.error('Failed to create instructor:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedInstructor || !formName || !formEmail) return
    setSaving(true)
    try {
      await updateUser(selectedInstructor.id, {
        name: formName,
        email: formEmail,
        department: formDepartment,
        ...(formPassword ? { password: formPassword } : {}),
      })
      setShowEditModal(false)
      resetForm()
      fetchInstructors()
    } catch (err) {
      console.error('Failed to update instructor:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this instructor?')) return
    try {
      await deleteUser(id)
      fetchInstructors()
    } catch (err) {
      console.error('Failed to delete instructor:', err)
    }
  }

  const openEdit = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    setFormName(instructor.name)
    setFormEmail(instructor.email)
    setFormDepartment(instructor.department || '')
    setFormPassword('')
    setShowEditModal(true)
    setActionMenuId(null)
  }

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormDepartment('')
    setSelectedInstructor(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  const filtered = instructors.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Instructors</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage your teaching staff</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true) }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Instructor
          </button>
        )}
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((instructor, i) => (
          <motion.div
            key={instructor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-6 hover:shadow-lg transition-shadow duration-300 relative"
          >
            {isAdmin && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActionMenuId(actionMenuId === instructor.id ? null : instructor.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {actionMenuId === instructor.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-8 w-40 bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-500 shadow-lg z-10 py-1"
                    >
                      <button
                        onClick={() => openEdit(instructor)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => { handleDelete(instructor.id); setActionMenuId(null) }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary-700 dark:text-primary-300">{instructor.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{instructor.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{instructor.department || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3 h-3" />
                {instructor.courseCount} courses
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3" />
                {instructor.studentCount} students
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">{instructor.email}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal title="Add New Instructor" onClose={() => setShowCreateModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input type="text" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Computer Science" />
              </div>
              <button onClick={handleCreate} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Instructor
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedInstructor && (
          <Modal title="Edit Instructor" onClose={() => setShowEditModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input type="text" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="••••••" />
              </div>
              <button onClick={handleEdit} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </>
  )
}
