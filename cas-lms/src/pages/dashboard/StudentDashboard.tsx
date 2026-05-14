import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import { getEnrollments, getCourses, getUserById, getGradesByStudent } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Enrollment { id: number; studentId: number; courseId: number; enrolledAt: string; progress: number; status: string; score: number }
interface Course { id: number; name: string; category: string; level: string; strand: string; gradeLevel: string; duration: string }
interface Grade { id: number; studentId: number; courseId: number; level: string; semester?: string; quarter?: string; term: string; score: number; remarks: string }

const tagColors: Record<string, string> = {
  'INC': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'NO EXAM': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'NOT PAID': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  'FAILED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'PASSED': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'DROPPED': 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  'SCHOLAR': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  "DEAN'S LIST": 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<(Enrollment & { course?: Course })[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [userTags, setUserTags] = useState<string[]>([])
  const [isFlagged, setIsFlagged] = useState(false)
  const [flagReason, setFlagReason] = useState('')

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const [enrollRes, coursesRes, userRes, gradesRes] = await Promise.all([
          getEnrollments(), getCourses(), getUserById(user.id), getGradesByStudent(user.id)
        ])
        setCourses(coursesRes.data)
        setGrades(gradesRes.data)
        setUserTags(userRes.data.tags || [])
        setIsFlagged(userRes.data.flagged || false)
        setFlagReason(userRes.data.flagReason || '')

        const myEnrollments = enrollRes.data.filter((e: Enrollment) => e.studentId === user.id)
        setEnrolledCourses(myEnrollments.map((e: Enrollment) => ({
          ...e,
          course: coursesRes.data.find((c: Course) => c.id === e.courseId),
        })))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  const avgScore = enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((s, e) => s + e.score, 0) / enrolledCourses.length) : 0
  const completedCount = enrolledCourses.filter(e => e.status === 'Completed').length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Flagged Warning */}
        {isFlagged && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Your account has been flagged</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{flagReason}</p>
            </div>
          </motion.div>
        )}

        {/* Enrolled Courses - Collapsible list style */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600">
          <div className="p-5 border-b border-gray-100 dark:border-dark-600">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">My Courses</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{enrolledCourses.length} enrolled • {completedCount} completed</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-dark-700">
            {enrolledCourses.map(enrollment => (
              <div key={enrollment.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${enrollment.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                  <BookOpen className={`w-4 h-4 ${enrollment.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{enrollment.course?.name}</p>
                  <p className="text-[10px] text-gray-400">{enrollment.course?.gradeLevel} {enrollment.course?.strand && `• ${enrollment.course.strand}`}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20">
                    <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-gray-400">Progress</span><span className="font-bold text-gray-700 dark:text-gray-300">{enrollment.progress}%</span></div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden"><div className={`h-full rounded-full ${enrollment.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{ width: `${enrollment.progress}%` }} /></div>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${enrollment.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : enrollment.status === 'Active' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-100 dark:bg-dark-600 text-gray-500'}`}>{enrollment.status}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))}
            {enrolledCourses.length === 0 && <div className="text-center py-10"><p className="text-sm text-gray-400">No courses yet. Join one using a class code.</p></div>}
          </div>
        </div>

        {/* Grades Section */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600">
          <div className="p-5 border-b border-gray-100 dark:border-dark-600 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">My Grades</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{grades.length} records</p>
            </div>
            <a href="/dashboard/grades" className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">View All →</a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-dark-700">
            {grades.slice(0, 5).map(grade => {
              const course = courses.find(c => c.id === grade.courseId)
              const isSHS = grade.level === 'Senior High School'
              return (
                <div key={grade.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{course?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400">{isSHS ? `${grade.semester} – ${grade.term}` : grade.quarter}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${grade.score >= 90 ? 'text-emerald-600' : grade.score >= 75 ? 'text-blue-600' : 'text-red-600'}`}>{grade.score}</p>
                    {grade.remarks && <p className="text-[9px] text-gray-400">{grade.remarks}</p>}
                  </div>
                </div>
              )
            })}
            {grades.length === 0 && <div className="text-center py-8"><p className="text-xs text-gray-400">No grades yet.</p></div>}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-64 space-y-4 hidden xl:block flex-shrink-0">
        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-gray-100 dark:border-dark-600 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-blue-200 dark:from-primary-800 dark:to-dark-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-700 dark:text-primary-200">{user?.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{user?.studentId || 'Student'}</p>

          {/* Tags */}
          {userTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {userTags.map(tag => (
                <span key={tag} className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300'}`}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-3">Overview</p>
          <div className="space-y-2.5">
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Courses</span><span className="text-xs font-bold text-gray-900 dark:text-white">{enrolledCourses.length}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Completed</span><span className="text-xs font-bold text-emerald-600">{completedCount}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Avg Score</span><span className="text-xs font-bold text-gray-900 dark:text-white">{avgScore}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Grades</span><span className="text-xs font-bold text-gray-900 dark:text-white">{grades.length}</span></div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Quick Links</p>
          <div className="space-y-1">
            <a href="/dashboard/my-courses" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Join a Course</a>
            <a href="/dashboard/assessments" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Take Assessments</a>
            <a href="/dashboard/grades" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ View All Grades</a>
            <a href="/dashboard/messages" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Messages</a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
