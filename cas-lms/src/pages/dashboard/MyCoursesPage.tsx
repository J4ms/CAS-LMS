import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Loader2, X, KeyRound, Upload, FileText, Download, ChevronRight, ChevronDown, ArrowLeft, Eye } from 'lucide-react'
import { getEnrollments, getCourses, getCourseByJoinCode, createEnrollment, getLessonsByCourse } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

interface Course { id: number; name: string; category: string; level: string; strand: string; gradeLevel: string; instructorId: number; duration: string; joinCode: string }
interface Enrollment { id: number; studentId: number; courseId: number; progress: number; status: string; score: number }
interface EnrolledCourse extends Enrollment { course?: Course }
interface Lesson { id: number; courseId: number; title: string; content: string; instructorId: number; createdAt: string; fileType: string; fileName: string }

export default function MyCoursesPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')
  const [joining, setJoining] = useState(false)

  // Course detail view
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null)

  // File upload
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => { fetchData() }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [enrollRes, coursesRes] = await Promise.all([getEnrollments(), getCourses()])
      const myEnrollments = enrollRes.data.filter((e: Enrollment) => e.studentId === user.id)
      setEnrolledCourses(myEnrollments.map((e: Enrollment) => ({
        ...e, course: coursesRes.data.find((c: Course) => c.id === e.courseId),
      })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openCourse = async (enrollment: EnrolledCourse) => {
    setSelectedCourse(enrollment)
    setLoadingLessons(true)
    try {
      const res = await getLessonsByCourse(enrollment.courseId)
      setLessons(res.data)
    } catch (err) { console.error(err) }
    finally { setLoadingLessons(false) }
  }

  const handleJoinCourse = async () => {
    if (!joinCode.trim() || !user) return
    setJoinError(''); setJoinSuccess(''); setJoining(true)
    try {
      const res = await getCourseByJoinCode(joinCode.trim().toUpperCase())
      if (res.data.length === 0) { setJoinError('Invalid code. No course found.'); setJoining(false); return }
      const course = res.data[0]
      if (enrolledCourses.find(e => e.courseId === course.id)) { setJoinError('Already enrolled in this course.'); setJoining(false); return }
      await createEnrollment({ studentId: user.id, courseId: course.id, enrolledAt: new Date().toISOString().split('T')[0], progress: 0, status: 'Active', score: 0 })
      setJoinSuccess(`Joined "${course.name}" successfully!`)
      setJoinCode('')
      await addNotification({ title: 'Course Joined', message: `You joined ${course.name}`, type: 'enrollment' })
      fetchData()
    } catch { setJoinError('Failed to join. Try again.') }
    finally { setJoining(false) }
  }

  const handleDownload = (lesson: Lesson) => {
    // Simulate download - in production this would be a real file URL
    const blob = new Blob([`File: ${lesson.fileName}\nTitle: ${lesson.title}\nContent: ${lesson.content}\n\nThis is a simulated download. In production, this would download the actual file from the server.`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = lesson.fileName || `${lesson.title}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setUploadedFiles(Array.from(e.target.files)) }
  const handleUploadSubmit = () => { if (uploadedFiles.length > 0) { alert(`${uploadedFiles.length} file(s) uploaded successfully.`); setShowUploadModal(false); setUploadedFiles([]) } }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  // Course Detail View
  if (selectedCourse) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Back button + Course header */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCourse.course?.name}</h2>
            <p className="text-xs text-gray-400">{selectedCourse.course?.gradeLevel} {selectedCourse.course?.strand && `• ${selectedCourse.course.strand}`} • {selectedCourse.course?.category}</p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600">
          <div className="p-5 border-b border-gray-100 dark:border-dark-600 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Lessons</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{lessons.length} lessons available</p>
            </div>
            <button onClick={() => { setUploadedFiles([]); setShowUploadModal(true) }} className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">
              <Upload className="w-3 h-3" /> Submit Work
            </button>
          </div>

          {loadingLessons ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12"><FileText className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" /><p className="text-sm text-gray-400">No lessons posted yet.</p></div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-700">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="overflow-hidden">
                  <button onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                      <p className="text-[10px] text-gray-400">{lesson.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.fileType && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{lesson.fileType}</span>}
                      {expandedLesson === lesson.id ? <ChevronDown className="w-4 h-4 text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                    </div>
                  </button>
                  <AnimatePresence>{expandedLesson === lesson.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-4 pt-1 border-t border-gray-50 dark:border-dark-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{lesson.content}</p>
                        {lesson.fileName && (
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
                            <div className="w-10 h-10 bg-white dark:bg-dark-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-dark-500">
                              <FileText className="w-5 h-5 text-primary-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{lesson.fileName}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{lesson.fileType} file</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setViewingLesson(lesson)} className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-lg text-[10px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-500 transition-colors">
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button onClick={() => handleDownload(lesson)} className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-medium hover:bg-primary-700 transition-colors">
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </div>
                          </div>
                        )}
                        {!lesson.fileName && (
                          <p className="text-[10px] text-gray-400 italic">No file attached to this lesson.</p>
                        )}
                      </div>
                    </motion.div>
                  )}</AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Lesson Modal */}
        <AnimatePresence>{viewingLesson && (
          <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingLesson(null)} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{viewingLesson.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{viewingLesson.fileName} • {viewingLesson.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(viewingLesson)} className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-medium hover:bg-primary-700"><Download className="w-3 h-3" />Download</button>
                  <button onClick={() => setViewingLesson(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {/* File preview area */}
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-8 text-center mb-4">
                  <FileText className="w-16 h-16 text-primary-300 dark:text-primary-700 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{viewingLesson.fileName}</p>
                  <p className="text-xs text-gray-400 mt-1 uppercase">{viewingLesson.fileType} Document</p>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Lesson Content</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{viewingLesson.content}</p>
                </div>
              </div>
            </div>
          </motion.div></>
        )}</AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>{showUploadModal && (
          <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadModal(false)} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-gray-900 dark:text-white">Submit Work</h3><button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 dark:border-dark-500 rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select files from your device</p>
                  <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-300" accept=".pdf,.docx,.doc,.pptx,.jpg,.jpeg,.png,.zip" />
                </div>
                {uploadedFiles.length > 0 && <div className="space-y-1">{uploadedFiles.map((f, i) => <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-dark-700 rounded-lg p-2"><FileText className="w-3 h-3 text-primary-500" /><span className="flex-1 truncate">{f.name}</span><span className="text-gray-400">{(f.size/1024).toFixed(1)}KB</span></div>)}</div>}
                <button onClick={handleUploadSubmit} disabled={uploadedFiles.length === 0} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">Upload</button>
              </div>
            </div>
          </motion.div></>
        )}</AnimatePresence>
      </motion.div>
    )
  }

  // Course List View
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Courses</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">View lessons, download materials, or join a new course</p>
        </div>
        <button onClick={() => { setJoinCode(''); setJoinError(''); setJoinSuccess(''); setShowJoinModal(true) }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <KeyRound className="w-4 h-4" /> Join with Code
        </button>
      </motion.div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrolledCourses.map((enrollment, i) => (
          <motion.div key={enrollment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => openCourse(enrollment)}
            className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="h-24 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{enrollment.course?.name}</h3>
              <p className="text-[10px] text-gray-400 mb-3">{enrollment.course?.gradeLevel} {enrollment.course?.strand && `• ${enrollment.course.strand}`}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] mb-1"><span className="text-gray-400">Progress</span><span className="font-bold text-gray-700 dark:text-gray-300">{enrollment.progress}%</span></div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${enrollment.progress}%` }} /></div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${enrollment.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>{enrollment.status}</span>
                <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium group-hover:underline">View Lessons →</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-16"><KeyRound className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400 mb-2">No courses yet</p><p className="text-sm text-gray-400">Ask your teacher for a join code.</p></div>
      )}

      {/* Join Modal */}
      <AnimatePresence>{showJoinModal && (
        <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJoinModal(false)} className="fixed inset-0 bg-black/50 z-50" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-gray-900 dark:text-white">Join a Course</h3><button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter the class code from your teacher.</p>
              {joinError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-lg">{joinError}</div>}
              {joinSuccess && <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs px-3 py-2 rounded-lg">{joinSuccess}</div>}
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm font-mono text-center tracking-widest uppercase focus:outline-none focus:border-primary-500" placeholder="e.g. WEB-2026A" maxLength={12} />
              <button onClick={handleJoinCourse} disabled={joining || !joinCode.trim()} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">{joining && <Loader2 className="w-4 h-4 animate-spin" />}<KeyRound className="w-4 h-4" />Join</button>
            </div>
          </div>
        </motion.div></>
      )}</AnimatePresence>
    </div>
  )
}
