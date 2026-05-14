import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Clock, Users, Search, Plus, Loader2, X, Copy, Check } from 'lucide-react'
import { getCourses, getUsers, createCourse } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Course {
  id: number
  name: string
  category: string
  level: string
  strand: string
  gradeLevel: string
  instructorId: number
  duration: string
  students: number
  status: string
  description: string
  joinCode: string
}

interface User {
  id: number
  name: string
}

const LEVELS = ['Pre-school', 'Elementary', 'Junior High School', 'Senior High School']
const STRANDS = ['', 'ABM', 'STEM', 'HUMSS', 'GAS']
const CATEGORIES = ['Technology', 'Data', 'Design', 'Business', 'Marketing', 'Language', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Physical Education']

function generateJoinCode(name: string): string {
  const prefix = name.replace(/[^A-Z]/gi, '').substring(0, 4).toUpperCase()
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${suffix}`
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Technology')
  const [formLevel, setFormLevel] = useState('Senior High School')
  const [formStrand, setFormStrand] = useState('')
  const [formGradeLevel, setFormGradeLevel] = useState('Grade 11')
  const [formDuration, setFormDuration] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'
  const canCreate = isTeacher || isAdmin

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([getCourses(), getUsers()])
      let courseData = coursesRes.data
      // Teachers only see their own courses
      if (isTeacher && user) {
        courseData = courseData.filter((c: Course) => c.instructorId === user.id)
      }
      setCourses(courseData)
      setInstructors(usersRes.data.filter((u: { role: string }) => u.role === 'teacher'))
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formName || !user) return
    setSaving(true)
    try {
      const joinCode = generateJoinCode(formName)
      await createCourse({
        name: formName,
        category: formCategory,
        level: formLevel,
        strand: formStrand,
        gradeLevel: formGradeLevel,
        instructorId: user.id,
        duration: formDuration,
        students: 0,
        status: 'Active',
        description: formDescription,
        joinCode,
        createdAt: new Date().toISOString().split('T')[0],
      })
      setShowCreateModal(false)
      resetForm()
      fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const resetForm = () => {
    setFormName(''); setFormCategory('Technology'); setFormLevel('Senior High School')
    setFormStrand(''); setFormGradeLevel('Grade 11'); setFormDuration(''); setFormDescription('')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
  }

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All Categories' || c.category === categoryFilter
    return matchSearch && matchCategory
  })

  const categories = ['All Categories', ...new Set(courses.map((c) => c.category))]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{isTeacher ? 'My Subjects' : 'All Courses'}</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{isTeacher ? 'Manage your subjects and share join codes with students' : 'Manage and organize your course catalog'}</p>
        </div>
        {canCreate && (
          <button onClick={() => { resetForm(); setShowCreateModal(true) }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 rounded-xl px-4 py-2.5">
          {categories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
      </motion.div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course, i) => {
          const instructor = instructors.find((inst) => inst.id === course.instructorId)
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-28 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center relative">
                <BookOpen className="w-10 h-10 text-primary-400" />
                {/* Join Code Badge */}
                {course.joinCode && (
                  <button
                    onClick={() => handleCopyCode(course.joinCode)}
                    className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-white dark:hover:bg-dark-700 transition-colors"
                    title="Click to copy join code"
                  >
                    {copiedCode === course.joinCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {course.joinCode}
                  </button>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">{course.category}</span>
                  <span className="text-xs text-gray-400">{course.gradeLevel}</span>
                  {course.strand && <span className="text-xs text-gray-400">• {course.strand}</span>}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{course.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{instructor?.name || 'Unknown'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-dark-600 text-gray-500'}`}>{course.status}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-400 dark:text-gray-500">No courses found.</p></div>
      )}

      {/* Create Subject Modal */}
      <AnimatePresence>{showCreateModal && (
        <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-black/50 z-50" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add New Subject</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Practical Research 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select value={formLevel} onChange={e => setFormLevel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade Level</label>
                  <input type="text" value={formGradeLevel} onChange={e => setFormGradeLevel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. Grade 11" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strand (SHS only)</label>
                  <select value={formStrand} onChange={e => setFormStrand(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm">
                    {STRANDS.map(s => <option key={s} value={s}>{s || 'None'}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                <input type="text" value={formDuration} onChange={e => setFormDuration(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="e.g. 10 weeks" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 resize-none" placeholder="Brief description..." />
              </div>
              <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">A unique <span className="font-semibold text-primary-600 dark:text-primary-400">join code</span> will be generated automatically. Share it with your students so they can enroll.</p>
              </div>
              <button onClick={handleCreate} disabled={saving || !formName} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" /> Create Subject
              </button>
            </div>
          </div>
        </motion.div></>
      )}</AnimatePresence>
    </div>
  )
}
