import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MoreHorizontal, Loader2, X, Trash2, Edit2 } from 'lucide-react'
import { getEnrollments, getUsers, getCourses, createEnrollment, updateEnrollment, deleteEnrollment } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Enrollment { id: number; studentId: number; courseId: number; enrolledAt: string; progress: number; status: string; score: number }
interface User { id: number; name: string; studentId?: string; role: string }
interface Course { id: number; name: string; gradeLevel: string; strand: string }

export default function EnrollmentsPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)

  // Form
  const [formStudentId, setFormStudentId] = useState(0)
  const [formCourseId, setFormCourseId] = useState(0)
  const [formStatus, setFormStatus] = useState('Active')
  const [formProgress, setFormProgress] = useState(0)
  const [formScore, setFormScore] = useState(0)
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const canManage = isAdmin || isTeacher

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [enrollRes, usersRes, coursesRes] = await Promise.all([getEnrollments(), getUsers(), getCourses()])
      setEnrollments(enrollRes.data)
      setUsers(usersRes.data)
      setCourses(coursesRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formStudentId || !formCourseId) return
    setSaving(true)
    try {
      await createEnrollment({ studentId: formStudentId, courseId: formCourseId, enrolledAt: new Date().toISOString().split('T')[0], progress: 0, status: 'Active', score: 0 })
      setShowCreateModal(false); resetForm(); fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!selectedEnrollment) return
    setSaving(true)
    try {
      await updateEnrollment(selectedEnrollment.id, { status: formStatus, progress: formProgress, score: formScore })
      setShowEditModal(false); resetForm(); fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this enrollment?')) return
    try { await deleteEnrollment(id); fetchData() } catch (err) { console.error(err) }
  }

  const openEdit = (e: Enrollment) => {
    setSelectedEnrollment(e); setFormStatus(e.status); setFormProgress(e.progress); setFormScore(e.score)
    setShowEditModal(true); setActionMenuId(null)
  }

  const resetForm = () => { setFormStudentId(0); setFormCourseId(0); setFormStatus('Active'); setFormProgress(0); setFormScore(0); setSelectedEnrollment(null) }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  const students = users.filter(u => u.role === 'student')

  const filtered = enrollments.filter(e => {
    const student = users.find(u => u.id === e.studentId)
    const course = courses.find(c => c.id === e.courseId)
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    const matchSearch = !search || student?.name.toLowerCase().includes(search.toLowerCase()) || course?.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enrollments</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{enrollments.length} total enrollments</p>
        </div>
        {canManage && (
          <button onClick={() => { resetForm(); setShowCreateModal(true) }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> New Enrollment
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search student or course..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300" />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-lg">
          {['All', 'Active', 'Completed', 'Dropped'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === s ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-700/50 border-b border-gray-100 dark:border-dark-600">
              <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Student</th>
              <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Course</th>
              <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Enrolled</th>
              <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Progress</th>
              <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Status</th>
              {canManage && <th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
            {filtered.map(enrollment => {
              const student = users.find(u => u.id === enrollment.studentId)
              const course = courses.find(c => c.id === enrollment.courseId)
              return (
                <tr key={enrollment.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-primary-700 dark:text-primary-300">{student?.name?.charAt(0) || '?'}</span></div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{student?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">{course?.name || 'Unknown'}</td>
                  <td className="px-5 py-3 text-[10px] text-gray-400">{enrollment.enrolledAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${enrollment.progress}%` }} /></div>
                      <span className="text-[10px] font-medium text-gray-500">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${enrollment.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : enrollment.status === 'Completed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>{enrollment.status}</span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3">
                      <div className="relative">
                        <button onClick={() => setActionMenuId(actionMenuId === enrollment.id ? null : enrollment.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"><MoreHorizontal className="w-4 h-4" /></button>
                        <AnimatePresence>{actionMenuId === enrollment.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-7 w-36 bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-500 shadow-lg z-10 py-1">
                            <button onClick={() => openEdit(enrollment)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600"><Edit2 className="w-3 h-3" />Edit</button>
                            <button onClick={() => { handleDelete(enrollment.id); setActionMenuId(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-gray-50 dark:hover:bg-dark-600"><Trash2 className="w-3 h-3" />Remove</button>
                          </motion.div>
                        )}</AnimatePresence>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No enrollments found.</td></tr>}
          </tbody>
        </table>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>{showCreateModal && (
        <Modal title="New Enrollment" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label><select value={formStudentId} onChange={e => setFormStudentId(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm"><option value={0}>Select student...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label><select value={formCourseId} onChange={e => setFormCourseId(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm"><option value={0}>Select course...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <button onClick={handleCreate} disabled={saving || !formStudentId || !formCourseId} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Enroll Student</button>
          </div>
        </Modal>
      )}</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>{showEditModal && selectedEnrollment && (
        <Modal title="Edit Enrollment" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Student: <span className="font-medium text-gray-900 dark:text-white">{users.find(u => u.id === selectedEnrollment.studentId)?.name}</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Course: <span className="font-medium text-gray-900 dark:text-white">{courses.find(c => c.id === selectedEnrollment.courseId)?.name}</span></p>
            </div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm"><option>Active</option><option>Completed</option><option>Dropped</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label><input type="number" min={0} max={100} value={formProgress} onChange={e => setFormProgress(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label><input type="number" value={formScore} onChange={e => setFormScore(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm" /></div>
            </div>
            <button onClick={handleEdit} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes</button>
          </div>
        </Modal>
      )}</AnimatePresence>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-4 h-4" /></button></div>{children}</div></motion.div></>)
}
