import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, X, FileText, ClipboardList, Flag, AlertTriangle, Upload, Clock, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'
import { getCourses, getLessonsByCourse, getAssessmentsByCourse, createLesson, createAssessment, getGradesByCourse, createGrade, updateGrade, deleteGrade, getUsers, flagUser, updateUser } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

interface Course { id: number; name: string; category: string; level: string; strand: string; gradeLevel: string; instructorId: number; students: number; duration: string; joinCode: string }
interface Lesson { id: number; courseId: number; title: string; content: string; instructorId: number; createdAt: string; fileType: string; fileName: string }
interface Assessment { id: number; courseId: number; title: string; description: string; instructorId: number; type: string; maxScore: number; dueDate: string; timeLimit: number; openTime: string; closeTime: string; createdAt: string; questions: Question[] }
interface Question { id: string; type: 'multiple_choice' | 'identification' | 'select_multiple'; question: string; options?: string[]; correctAnswer?: string; correctAnswers?: string[]; points: number }
interface Grade { id: number; studentId: number; courseId: number; level: string; semester?: string; quarter?: string; term: string; score: number; remarks: string; instructorId: number; createdAt: string }
interface Student { id: number; name: string; email: string; role: string; studentId: string; gradeLevel: string; flagged: boolean; flagReason: string; tags: string[] }

const SHS_TERMS = ['Prelim', 'Midterm', 'Semis', 'Finals']
const SHS_SEMESTERS = ['1st Semester', '2nd Semester']
const JHS_QUARTERS = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter']
const AVAILABLE_TAGS = ['INC','NO EXAM','NOT PAID','FAILED','PASSED','DROPPED','PROBATION','IRREGULAR','SCHOLAR',"DEAN'S LIST",'GRADUATED','ON LEAVE']

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'lessons'|'assessments'|'grades'|'students'>('lessons')
  const [expandedLesson, setExpandedLesson] = useState<number|null>(null)

  // Modals
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Lesson form - FILE SELECT
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonFile, setLessonFile] = useState<File|null>(null)
  const lessonFileRef = useRef<HTMLInputElement>(null)

  // Assessment form with time limit + open/close + guide file
  const [assessTitle, setAssessTitle] = useState('')
  const [assessDesc, setAssessDesc] = useState('')
  const [assessType, setAssessType] = useState('quiz')
  const [assessDueDate, setAssessDueDate] = useState('')
  const [assessTimeLimit, setAssessTimeLimit] = useState(30)
  const [assessOpenTime, setAssessOpenTime] = useState('')
  const [assessCloseTime, setAssessCloseTime] = useState('')
  const [assessGuideFile, setAssessGuideFile] = useState<File|null>(null)
  const guideFileRef = useRef<HTMLInputElement>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Grade form
  const [gradeStudentId, setGradeStudentId] = useState(0)
  const [gradeTerm, setGradeTerm] = useState('')
  const [gradeSemester, setGradeSemester] = useState('')
  const [gradeQuarter, setGradeQuarter] = useState('')
  const [gradeScore, setGradeScore] = useState('')
  const [gradeRemarks, setGradeRemarks] = useState('')
  const [editingGradeId, setEditingGradeId] = useState<number|null>(null)

  // Flag
  const [flagStudent, setFlagStudent] = useState<Student|null>(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagTags, setFlagTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const [coursesRes, usersRes] = await Promise.all([getCourses(), getUsers()])
        const tc = coursesRes.data.filter((c: Course) => c.instructorId === user?.id)
        setMyCourses(tc)
        if (tc.length > 0) setSelectedCourse(tc[0])
        setStudents(usersRes.data.filter((u: Student) => u.role === 'student'))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    init()
  }, [user])

  useEffect(() => { if (selectedCourse) loadData(selectedCourse.id) }, [selectedCourse])

  const loadData = async (id: number) => {
    try {
      const [l, a, g] = await Promise.all([getLessonsByCourse(id), getAssessmentsByCourse(id), getGradesByCourse(id)])
      setLessons(l.data); setAssessments(a.data); setGrades(g.data)
    } catch (err) { console.error(err) }
  }

  const isSHS = selectedCourse?.level === 'Senior High School'

  // Handlers
  const handlePostLesson = async () => {
    if (!lessonTitle || !selectedCourse) return
    setSaving(true)
    try {
      await createLesson({ courseId: selectedCourse.id, title: lessonTitle, content: lessonFile ? `File: ${lessonFile.name}` : '', instructorId: user?.id, createdAt: new Date().toISOString().split('T')[0], fileType: lessonFile ? (lessonFile.name.split('.').pop() || '') : '', fileName: lessonFile?.name || '' })
      setShowLessonModal(false); setLessonTitle(''); setLessonFile(null)
      loadData(selectedCourse.id)
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handlePostAssessment = async () => {
    if (!assessTitle || !selectedCourse || questions.length === 0) return
    setSaving(true)
    try {
      const maxScore = questions.reduce((s, q) => s + q.points, 0)
      await createAssessment({ courseId: selectedCourse.id, title: assessTitle, description: assessDesc, instructorId: user?.id, type: assessType, maxScore, dueDate: assessDueDate, timeLimit: assessTimeLimit, openTime: assessOpenTime, closeTime: assessCloseTime, guideFile: assessGuideFile?.name || '', createdAt: new Date().toISOString().split('T')[0], questions })
      setShowAssessmentModal(false); setAssessTitle(''); setAssessDesc(''); setQuestions([]); setAssessTimeLimit(30); setAssessOpenTime(''); setAssessCloseTime(''); setAssessGuideFile(null)
      loadData(selectedCourse.id)
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handlePostGrade = async () => {
    if (!selectedCourse || !gradeStudentId || !gradeScore) return
    setSaving(true)
    try {
      const d: Record<string, unknown> = { studentId: gradeStudentId, courseId: selectedCourse.id, level: selectedCourse.level, score: Number(gradeScore), remarks: gradeRemarks, instructorId: user?.id, createdAt: new Date().toISOString().split('T')[0] }
      if (isSHS) { d.semester = gradeSemester; d.term = gradeTerm } else { d.quarter = gradeQuarter; d.term = '' }
      if (editingGradeId) await updateGrade(editingGradeId, d); else await createGrade(d)
      setShowGradeModal(false); resetGradeForm(); loadData(selectedCourse.id)
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleDeleteGrade = async (id: number) => { if (!confirm('Delete?')) return; await deleteGrade(id); if (selectedCourse) loadData(selectedCourse.id) }

  const handleFlagStudent = async () => {
    if (!flagStudent) return; setSaving(true)
    try {
      const nf = !flagStudent.flagged
      await flagUser(flagStudent.id, nf, nf ? flagReason : '')
      if (flagTags.length > 0) await updateUser(flagStudent.id, { tags: flagTags })
      if (nf) await addNotification({ title: 'Student Flagged', message: `${flagStudent.name}: ${flagReason}`, type: 'flag' })
      setShowFlagModal(false); setFlagReason(''); setFlagTags([])
      const r = await getUsers(); setStudents(r.data.filter((u: Student) => u.role === 'student'))
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const resetGradeForm = () => { setGradeStudentId(0); setGradeTerm(''); setGradeSemester(''); setGradeQuarter(''); setGradeScore(''); setGradeRemarks(''); setEditingGradeId(null) }
  const addQuestion = () => setQuestions([...questions, { id: `q${questions.length+1}`, type: 'multiple_choice', question: '', options: ['','','',''], correctAnswer: '', points: 10 }])
  const updateQ = (i: number, f: string, v: unknown) => { const u = [...questions]; u[i] = { ...u[i], [f]: v }; setQuestions(u) }
  const removeQ = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i))
  const copyCode = () => { if (selectedCourse?.joinCode) { navigator.clipboard.writeText(selectedCourse.joinCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) } }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
  if (myCourses.length === 0) return <div className="text-center py-16"><FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-400">No subjects yet. Create one from "My Subjects".</p></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 min-h-[calc(100vh-200px)]">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Header with course name + tabs */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 mb-6">
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedCourse?.name}</h2>
              <button onClick={copyCode} className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors">
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{selectedCourse?.joinCode}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">{selectedCourse?.gradeLevel} {selectedCourse?.strand && `• ${selectedCourse.strand}`} • {selectedCourse?.category}</p>
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-100 dark:border-dark-600 -mx-5 px-5">
              {(['lessons','assessments','grades','students'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`pb-3 text-xs font-semibold capitalize border-b-2 transition-all ${tab === t ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* LESSONS TAB - Collapsible sections like reference */}
        {tab === 'lessons' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">{lessons.length} lessons uploaded</p>
              <button onClick={() => { setLessonTitle(''); setLessonFile(null); setShowLessonModal(true) }} className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-700"><Plus className="w-3 h-3" />Upload Lesson</button>
            </div>
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-600 overflow-hidden">
                <button onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                  <div className="w-7 h-7 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lesson.fileType && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{lesson.fileType}</span>}
                    {expandedLesson === lesson.id ? <ChevronDown className="w-4 h-4 text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </div>
                </button>
                <AnimatePresence>{expandedLesson === lesson.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50 dark:border-dark-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{lesson.content}</p>
                      {lesson.fileName && <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-700 rounded-lg p-2.5"><Upload className="w-4 h-4 text-primary-500" /><span className="text-xs text-gray-600 dark:text-gray-300">{lesson.fileName}</span><span className="text-[10px] text-gray-400 ml-auto">{lesson.createdAt}</span></div>}
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
            {lessons.length === 0 && <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-600"><Upload className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" /><p className="text-sm text-gray-400">No lessons yet. Upload your first file.</p></div>}
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {tab === 'assessments' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">{assessments.length} assessments</p>
              <button onClick={() => { setAssessTitle(''); setAssessDesc(''); setQuestions([]); setAssessTimeLimit(30); setAssessOpenTime(''); setAssessCloseTime(''); setAssessGuideFile(null); setShowAssessmentModal(true) }} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700"><Plus className="w-3 h-3" />Create Assessment</button>
            </div>
            {assessments.map(a => (
              <div key={a.id} className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-100 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.type === 'exam' ? 'bg-red-50 dark:bg-red-900/20' : a.type === 'quiz' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}><ClipboardList className={`w-4 h-4 ${a.type === 'exam' ? 'text-red-500' : a.type === 'quiz' ? 'text-amber-500' : 'text-blue-500'}`} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.questions.length} questions • {a.maxScore} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.timeLimit > 0 && <span className="flex items-center gap-0.5 text-[10px] text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded"><Clock className="w-2.5 h-2.5" />{a.timeLimit}m</span>}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${a.type === 'exam' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : a.type === 'quiz' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>{a.type}</span>
                  </div>
                </div>
                {(a.openTime || a.closeTime) && <div className="mt-2 ml-11 flex items-center gap-3 text-[10px] text-gray-400"><span>Opens: {a.openTime ? new Date(a.openTime).toLocaleString() : '—'}</span><span>→</span><span>Closes: {a.closeTime ? new Date(a.closeTime).toLocaleString() : '—'}</span></div>}
              </div>
            ))}
            {assessments.length === 0 && <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-600"><ClipboardList className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" /><p className="text-sm text-gray-400">No assessments yet.</p></div>}
          </div>
        )}

        {/* GRADES TAB */}
        {tab === 'grades' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">{grades.length} records • {isSHS ? 'Prelim → Finals' : 'Q1 → Q4'}</p>
              <button onClick={() => { resetGradeForm(); setShowGradeModal(true) }} className="flex items-center gap-1.5 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-700"><Plus className="w-3 h-3" />Post Grade</button>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-600 overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-gray-50/80 dark:bg-dark-700/50 border-b border-gray-100 dark:border-dark-600"><th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-4 py-2.5">Student</th><th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-4 py-2.5">{isSHS ? 'Sem / Term' : 'Quarter'}</th><th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-4 py-2.5">Score</th><th className="text-left text-[10px] font-semibold text-gray-400 uppercase px-4 py-2.5"></th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
                  {grades.map(g => { const s = students.find(st => st.id === g.studentId); return (
                    <tr key={g.id}><td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">{s?.name || `#${g.studentId}`}</td><td className="px-4 py-2.5 text-[10px] text-gray-400">{isSHS ? `${g.semester} – ${g.term}` : g.quarter}</td><td className="px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white">{g.score}</td><td className="px-4 py-2.5 flex gap-2"><button onClick={() => { setEditingGradeId(g.id); setGradeStudentId(g.studentId); setGradeScore(String(g.score)); setGradeRemarks(g.remarks); setGradeTerm(g.term); setGradeSemester(g.semester||''); setGradeQuarter(g.quarter||''); setShowGradeModal(true) }} className="text-[10px] text-primary-600">Edit</button><button onClick={() => handleDeleteGrade(g.id)} className="text-[10px] text-red-500">Del</button></td></tr>
                  )})}
                  {grades.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-xs text-gray-400">No grades posted.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {tab === 'students' && (
          <div className="space-y-2">
            {students.map(st => (
              <div key={st.id} className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-100 dark:border-dark-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${st.flagged ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>{st.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{st.name} <span className="text-gray-400 font-normal">({st.studentId})</span></p>
                    <div className="flex items-center gap-1.5 mt-0.5">{st.flagged && <span className="text-[8px] text-red-500 font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />FLAGGED</span>}{st.tags?.map(t => <span key={t} className="text-[7px] font-bold px-1 py-0.5 rounded bg-gray-100 dark:bg-dark-600 text-gray-500">{t}</span>)}</div>
                  </div>
                </div>
                <button onClick={() => { setFlagStudent(st); setFlagReason(st.flagReason||''); setFlagTags(st.tags||[]); setShowFlagModal(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"><Flag className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-64 space-y-4 hidden xl:block flex-shrink-0">
        {/* Subject Selector */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Subjects</p>
          <div className="space-y-1">
            {myCourses.map(c => (
              <button key={c.id} onClick={() => setSelectedCourse(c)} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedCourse?.id === c.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
                <span className="block truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Stats */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-3">Statistics</p>
          <div className="space-y-2.5">
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Lessons</span><span className="text-xs font-bold text-gray-900 dark:text-white">{lessons.length}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Assessments</span><span className="text-xs font-bold text-gray-900 dark:text-white">{assessments.length}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Grades</span><span className="text-xs font-bold text-gray-900 dark:text-white">{grades.length}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Students</span><span className="text-xs font-bold text-gray-900 dark:text-white">{selectedCourse?.students || 0}</span></div>
          </div>
        </div>
      </div>

      {/* === MODALS === */}

      {/* LESSON MODAL - File Select */}
      <AnimatePresence>{showLessonModal && <Modal title="Upload Lesson" onClose={() => setShowLessonModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label><input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Lesson title" /></div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select File</label>
            <div onClick={() => lessonFileRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-dark-500 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              {lessonFile ? (
                <div className="flex items-center justify-center gap-3"><FileText className="w-8 h-8 text-primary-500" /><div className="text-left"><p className="text-sm font-medium text-gray-900 dark:text-white">{lessonFile.name}</p><p className="text-[10px] text-gray-400">{(lessonFile.size/1024).toFixed(1)} KB</p></div></div>
              ) : (
                <><Upload className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-2" /><p className="text-xs text-gray-500 dark:text-gray-400">Click to select file</p><p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, PPTX, XLSX, Images, Video</p></>
              )}
            </div>
            <input ref={lessonFileRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.mp4,.mp3" onChange={e => { if (e.target.files?.[0]) setLessonFile(e.target.files[0]) }} />
          </div>
          <button onClick={handlePostLesson} disabled={saving||!lessonTitle} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}<Upload className="w-4 h-4" />Upload</button>
        </div>
      </Modal>}</AnimatePresence>

      {/* ASSESSMENT MODAL - Time Limit + Open/Close + Guide File */}
      <AnimatePresence>{showAssessmentModal && <Modal title="Create Assessment" onClose={() => setShowAssessmentModal(false)} wide>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase mb-1">Title</label><input type="text" value={assessTitle} onChange={e => setAssessTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm" placeholder="Title" /></div>
            <div><label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase mb-1">Type</label><select value={assessType} onChange={e => setAssessType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm"><option value="quiz">Quiz</option><option value="exam">Exam</option><option value="assignment">Assignment</option><option value="activity">Activity</option></select></div>
          </div>
          <div><label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase mb-1">Instructions</label><textarea value={assessDesc} onChange={e => setAssessDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm resize-none" placeholder="Instructions..." /></div>

          {/* Time & Schedule */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">Due Date</label><input type="date" value={assessDueDate} onChange={e => setAssessDueDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded-lg text-xs" /></div>
              <div><label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">Time Limit</label><div className="flex items-center gap-1"><input type="number" value={assessTimeLimit} onChange={e => setAssessTimeLimit(Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded-lg text-xs" /><span className="text-[9px] text-gray-400">min</span></div></div>
              <div className="flex items-end"><p className="text-[9px] text-gray-400 pb-1.5">0 = unlimited</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">Opens At</label><input type="datetime-local" value={assessOpenTime} onChange={e => setAssessOpenTime(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded-lg text-[10px]" /></div>
              <div><label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">Closes At</label><input type="datetime-local" value={assessCloseTime} onChange={e => setAssessCloseTime(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded-lg text-[10px]" /></div>
            </div>
          </div>

          {/* Guide File */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase mb-1">Guide / Reference File (optional)</label>
            <div onClick={() => guideFileRef.current?.click()} className="border border-dashed border-gray-200 dark:border-dark-500 rounded-lg p-3 text-center cursor-pointer hover:border-primary-300 transition-colors">
              {assessGuideFile ? <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">📎 {assessGuideFile.name}</p> : <p className="text-[10px] text-gray-400">Click to attach a guide file (PDF, DOCX, etc.)</p>}
            </div>
            <input ref={guideFileRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) setAssessGuideFile(e.target.files[0]) }} />
          </div>

          {/* Questions */}
          <div className="border-t border-gray-200 dark:border-dark-600 pt-3">
            <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Questions ({questions.length})</p><button onClick={addQuestion} className="text-[10px] text-primary-600 font-medium flex items-center gap-0.5"><Plus className="w-3 h-3" />Add</button></div>
            {questions.map((q, i) => (
              <div key={i} className="border border-gray-100 dark:border-dark-600 rounded-lg p-3 mb-2 bg-white dark:bg-dark-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2"><select value={q.type} onChange={e => updateQ(i,'type',e.target.value)} className="px-2 py-1 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded text-[9px]"><option value="multiple_choice">Multiple Choice</option><option value="identification">Identification</option><option value="select_multiple">Select Multiple</option></select><input type="number" value={q.points} onChange={e => updateQ(i,'points',Number(e.target.value))} className="w-12 px-2 py-1 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded text-[9px] text-center" /></div>
                  <button onClick={() => removeQ(i)} className="text-[9px] text-red-500 hover:text-red-700">Remove</button>
                </div>
                <input type="text" value={q.question} onChange={e => updateQ(i,'question',e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-xs mb-2" placeholder="Question text..." />
                {(q.type === 'multiple_choice' || q.type === 'select_multiple') && <div className="space-y-1 mb-1.5">{(q.options||['','','','']).map((o,oi) => <input key={oi} type="text" value={o} onChange={e => { const opts=[...(q.options||[])]; opts[oi]=e.target.value; updateQ(i,'options',opts) }} className="w-full px-2 py-1 border border-gray-100 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded text-[10px]" placeholder={`Option ${oi+1}`} />)}</div>}
                {q.type === 'multiple_choice' && <input type="text" value={q.correctAnswer||''} onChange={e => updateQ(i,'correctAnswer',e.target.value)} className="w-full px-2 py-1 border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-white rounded text-[10px]" placeholder="Correct answer" />}
                {q.type === 'select_multiple' && <input type="text" value={(q.correctAnswers||[]).join(', ')} onChange={e => updateQ(i,'correctAnswers',e.target.value.split(',').map(s=>s.trim()))} className="w-full px-2 py-1 border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-white rounded text-[10px]" placeholder="Correct answers (comma separated)" />}
                {q.type === 'identification' && <input type="text" value={q.correctAnswer||''} onChange={e => updateQ(i,'correctAnswer',e.target.value)} className="w-full px-2 py-1 border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-white rounded text-[10px]" placeholder="Correct answer" />}
              </div>
            ))}
          </div>
          <button onClick={handlePostAssessment} disabled={saving||!assessTitle||questions.length===0} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Post Assessment</button>
        </div>
      </Modal>}</AnimatePresence>

      {/* GRADE MODAL */}
      <AnimatePresence>{showGradeModal && <Modal title={editingGradeId ? 'Edit Grade' : 'Post Grade'} onClose={() => setShowGradeModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label><select value={gradeStudentId} onChange={e => setGradeStudentId(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm"><option value={0}>Select...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          {isSHS ? <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label><select value={gradeSemester} onChange={e => setGradeSemester(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm"><option value="">—</option>{SHS_SEMESTERS.map(s => <option key={s}>{s}</option>)}</select></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label><select value={gradeTerm} onChange={e => setGradeTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm"><option value="">—</option>{SHS_TERMS.map(t => <option key={t}>{t}</option>)}</select></div></div> : <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quarter</label><select value={gradeQuarter} onChange={e => setGradeQuarter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm"><option value="">—</option>{JHS_QUARTERS.map(q => <option key={q}>{q}</option>)}</select></div>}
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label><input type="number" value={gradeScore} onChange={e => setGradeScore(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm" /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label><input type="text" value={gradeRemarks} onChange={e => setGradeRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm" placeholder="Optional" /></div></div>
          <button onClick={handlePostGrade} disabled={saving||!gradeStudentId||!gradeScore} className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingGradeId ? 'Update' : 'Post Grade'}</button>
        </div>
      </Modal>}</AnimatePresence>

      {/* FLAG MODAL */}
      <AnimatePresence>{showFlagModal && flagStudent && <Modal title={flagStudent.flagged ? 'Manage Flag' : 'Flag Student'} onClose={() => setShowFlagModal(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Student: <span className="font-semibold text-gray-900 dark:text-white">{flagStudent.name}</span></p>
          {!flagStudent.flagged && <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-lg text-sm resize-none" placeholder="Reason..." />}
          <div><p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Tags</p><div className="flex flex-wrap gap-1.5">{AVAILABLE_TAGS.map(tag => <button key={tag} onClick={() => setFlagTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])} className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${flagTags.includes(tag) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 dark:border-dark-500 text-gray-400'}`}>{tag}</button>)}</div></div>
          <div className="flex gap-2">
            {flagStudent.flagged && <button onClick={async () => { await flagUser(flagStudent.id, false, ''); setShowFlagModal(false); const r = await getUsers(); setStudents(r.data.filter((u: Student) => u.role === 'student')) }} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium">Remove Flag</button>}
            <button onClick={handleFlagStudent} disabled={saving||(!flagStudent.flagged && !flagReason)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">{flagStudent.flagged ? 'Update' : 'Flag'}</button>
          </div>
        </div>
      </Modal>}</AnimatePresence>
    </motion.div>
  )
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className={`bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} p-6`} onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-4 h-4" /></button></div>{children}</div></motion.div></>)
}
