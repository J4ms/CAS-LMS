import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MoreHorizontal, Loader2, X, Flag, Edit2, Trash2, AlertTriangle, Tag } from 'lucide-react'
import { getUsers, getEnrollments, createUser, updateUser, deleteUser, flagUser, createNotification } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Student {
  id: number
  name: string
  email: string
  password: string
  studentId: string
  enrolledAt: string
  role: string
  flagged: boolean
  flagReason: string
  tags: string[]
  courseCount?: number
}

const AVAILABLE_TAGS = [
  'INC', 'NO EXAM', 'NOT PAID', 'FAILED', 'PASSED', 'DROPPED',
  'PROBATION', 'IRREGULAR', 'SCHOLAR', 'DEAN\'S LIST', 'GRADUATED', 'ON LEAVE'
]

const tagColors: Record<string, string> = {
  'INC': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'NO EXAM': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'NOT PAID': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'FAILED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'PASSED': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'DROPPED': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  'PROBATION': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'IRREGULAR': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'SCHOLAR': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  "DEAN'S LIST": 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'GRADUATED': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'ON LEAVE': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
}

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formStudentId, setFormStudentId] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    try {
      const [usersRes, enrollmentsRes] = await Promise.all([getUsers(), getEnrollments()])
      const studentUsers = usersRes.data.filter((u: { role: string }) => u.role === 'student')
      const enriched = studentUsers.map((s: Student) => ({
        ...s,
        tags: s.tags || [],
        courseCount: enrollmentsRes.data.filter((e: { studentId: number }) => e.studentId === s.id).length,
      }))
      setStudents(enriched)
    } catch (err) {
      console.error('Failed to fetch students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) return
    setSaving(true)
    try {
      await createUser({
        name: formName, email: formEmail, password: formPassword, role: 'student', avatar: '',
        studentId: formStudentId || `STU-${String(Date.now()).slice(-3)}`,
        enrolledAt: new Date().toISOString().split('T')[0],
        flagged: false, flagReason: '', tags: [],
        createdAt: new Date().toISOString().split('T')[0],
      })
      await createNotification({ userId: user?.id, title: 'New Student Created', message: `${formName} has been added as a student`, type: 'enrollment', read: false, createdAt: new Date().toISOString() })
      setShowCreateModal(false)
      resetForm()
      fetchStudents()
    } catch (err) { console.error('Failed to create student:', err) }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!selectedStudent || !formName || !formEmail) return
    setSaving(true)
    try {
      await updateUser(selectedStudent.id, { name: formName, email: formEmail, studentId: formStudentId, ...(formPassword ? { password: formPassword } : {}) })
      setShowEditModal(false)
      resetForm()
      fetchStudents()
    } catch (err) { console.error('Failed to update student:', err) }
    finally { setSaving(false) }
  }

  const handleFlag = async () => {
    if (!selectedStudent) return
    setSaving(true)
    try {
      const newFlagged = !selectedStudent.flagged
      await flagUser(selectedStudent.id, newFlagged, newFlagged ? flagReason : '')
      if (newFlagged) {
        await createNotification({ userId: user?.id, title: 'Student Flagged', message: `${selectedStudent.name} has been flagged: ${flagReason}`, type: 'flag', read: false, createdAt: new Date().toISOString() })
      }
      setShowFlagModal(false)
      setFlagReason('')
      fetchStudents()
    } catch (err) { console.error('Failed to flag student:', err) }
    finally { setSaving(false) }
  }

  const handleSaveTags = async () => {
    if (!selectedStudent) return
    setSaving(true)
    try {
      await updateUser(selectedStudent.id, { tags: selectedTags })
      setShowTagModal(false)
      fetchStudents()
    } catch (err) { console.error('Failed to update tags:', err) }
    finally { setSaving(false) }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try { await deleteUser(id); fetchStudents() } catch (err) { console.error(err) }
  }

  const openEdit = (student: Student) => {
    setSelectedStudent(student); setFormName(student.name); setFormEmail(student.email)
    setFormStudentId(student.studentId || ''); setFormPassword('')
    setShowEditModal(true); setActionMenuId(null)
  }
  const openFlag = (student: Student) => {
    setSelectedStudent(student); setFlagReason(student.flagReason || '')
    setShowFlagModal(true); setActionMenuId(null)
  }
  const openTags = (student: Student) => {
    setSelectedStudent(student); setSelectedTags(student.tags || [])
    setShowTagModal(true); setActionMenuId(null)
  }
  const resetForm = () => { setFormName(''); setFormEmail(''); setFormPassword(''); setFormStudentId(''); setSelectedStudent(null) }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Students</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage student records and enrollments</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowCreateModal(true) }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        )}
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Student</th>
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">ID</th>
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Tags</th>
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Courses</th>
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Status</th>
              {isAdmin && <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-600">
            {filtered.map((student, i) => (
              <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${student.flagged ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                      <span className={`text-sm font-medium ${student.flagged ? 'text-red-700 dark:text-red-300' : 'text-primary-700 dark:text-primary-300'}`}>{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</span>
                      {student.flagged && <div className="flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3 text-red-500" /><span className="text-[10px] text-red-500 font-medium">Flagged</span></div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{student.studentId || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {(student.tags || []).map(tag => (
                      <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300'}`}>{tag}</span>
                    ))}
                    {(!student.tags || student.tags.length === 0) && <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{student.courseCount || 0}</td>
                <td className="px-6 py-4">
                  {student.flagged ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">Flagged</span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">Active</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button onClick={() => setActionMenuId(actionMenuId === student.id ? null : student.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {actionMenuId === student.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-8 w-48 bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-500 shadow-lg z-10 py-1">
                            <button onClick={() => openEdit(student)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600"><Edit2 className="w-3.5 h-3.5" /> Edit Student</button>
                            <button onClick={() => openTags(student)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-600"><Tag className="w-3.5 h-3.5" /> Manage Tags</button>
                            <button onClick={() => openFlag(student)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-dark-600"><Flag className="w-3.5 h-3.5" /> {student.flagged ? 'Remove Flag' : 'Flag Student'}</button>
                            <button onClick={() => { handleDelete(student.id); setActionMenuId(null) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-600"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>{showCreateModal && (<Modal title="Add New Student" onClose={() => setShowCreateModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter full name" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter email" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label><input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Enter password" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID (optional)</label><input type="text" value={formStudentId} onChange={e => setFormStudentId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. STU-050" /></div>
          <button onClick={handleCreate} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Create Student</button>
        </div>
      </Modal>)}</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>{showEditModal && selectedStudent && (<Modal title="Edit Student" onClose={() => setShowEditModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label><input type="text" value={formStudentId} onChange={e => setFormStudentId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (leave blank to keep)</label><input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="••••••" /></div>
          <button onClick={handleEdit} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes</button>
        </div>
      </Modal>)}</AnimatePresence>

      {/* Flag Modal */}
      <AnimatePresence>{showFlagModal && selectedStudent && (<Modal title={selectedStudent.flagged ? 'Remove Flag' : 'Flag Student'} onClose={() => setShowFlagModal(false)}>
        <div className="space-y-4">
          {selectedStudent.flagged ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Remove the flag from <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.name}</span>?</p>
          ) : (
            <><p className="text-sm text-gray-600 dark:text-gray-400">Flag <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.name}</span> for an issue:</p>
            <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 resize-none" placeholder="e.g. Missed 3 consecutive exams..." /></>
          )}
          <button onClick={handleFlag} disabled={saving || (!selectedStudent.flagged && !flagReason)} className={`w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${selectedStudent.flagged ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{selectedStudent.flagged ? 'Remove Flag' : 'Flag Student'}</button>
        </div>
      </Modal>)}</AnimatePresence>

      {/* Tags Modal */}
      <AnimatePresence>{showTagModal && selectedStudent && (<Modal title={`Manage Tags — ${selectedStudent.name}`} onClose={() => setShowTagModal(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Select tags to apply to this student:</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selectedTags.includes(tag) ? `${tagColors[tag] || 'bg-gray-100 text-gray-700'} border-current` : 'border-gray-200 dark:border-dark-500 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}>{tag}</button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-dark-600">
              <p className="text-xs text-gray-400 mb-2">Selected: {selectedTags.join(', ')}</p>
            </div>
          )}
          <button onClick={handleSaveTags} disabled={saving} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Tags</button>
        </div>
      </Modal>)}</AnimatePresence>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </motion.div></>)
}
