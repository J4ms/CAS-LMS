import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, GraduationCap, ArrowUpRight, Loader2, ClipboardList } from 'lucide-react'
import { getUsers, getCourses, getEnrollments, getGrades } from '../../services/api'

interface DashboardData {
  totalStudents: number
  totalCourses: number
  totalInstructors: number
  totalEnrollments: number
  enrollments: Array<{ id: number; studentId: number; courseId: number; enrolledAt: string; status: string; progress: number }>
  courses: Array<{ id: number; name: string; students: number; status: string; gradeLevel: string; strand: string }>
  students: Array<{ id: number; name: string; email: string; flagged: boolean; tags: string[] }>
  grades: Array<{ id: number; studentId: number; courseId: number; score: number }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, coursesRes, enrollmentsRes, gradesRes] = await Promise.all([getUsers(), getCourses(), getEnrollments(), getGrades()])
        const users = usersRes.data
        const students = users.filter((u: { role: string }) => u.role === 'student')
        const instructors = users.filter((u: { role: string }) => u.role === 'teacher')
        setData({ totalStudents: students.length, totalCourses: coursesRes.data.length, totalInstructors: instructors.length, totalEnrollments: enrollmentsRes.data.length, enrollments: enrollmentsRes.data, courses: coursesRes.data, students, grades: gradesRes.data })
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
  if (!data) return null

  const flaggedStudents = data.students.filter(s => s.flagged)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Students', value: data.totalStudents, icon: GraduationCap, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
            { label: 'Courses', value: data.totalCourses, icon: BookOpen, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
            { label: 'Instructors', value: data.totalInstructors, icon: Users, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
            { label: 'Enrollments', value: data.totalEnrollments, icon: ClipboardList, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-100 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                <div><p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p><p className="text-[10px] text-gray-400 uppercase font-medium">{stat.label}</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Enrollments</h3>
            <a href="/dashboard/enrollments" className="flex items-center gap-1 text-[10px] text-primary-600 dark:text-primary-400 font-medium">View All <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-dark-600">
            {data.enrollments.slice(0, 6).map((enrollment) => {
              const student = data.students.find(s => s.id === enrollment.studentId)
              const course = data.courses.find(c => c.id === enrollment.courseId)
              return (
                <div key={enrollment.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"><span className="text-[10px] font-medium text-primary-700 dark:text-primary-300">{student?.name?.charAt(0) || '?'}</span></div>
                    <div><p className="text-xs font-medium text-gray-900 dark:text-white">{student?.name || 'Unknown'}</p><p className="text-[10px] text-gray-400">{course?.name || 'Unknown'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${enrollment.progress}%` }} /></div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${enrollment.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : enrollment.status === 'Completed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>{enrollment.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Courses Overview */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Courses</h3>
            <a href="/dashboard/courses" className="flex items-center gap-1 text-[10px] text-primary-600 dark:text-primary-400 font-medium">View All <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-dark-600">
            {data.courses.slice(0, 5).map(course => (
              <div key={course.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                  <div><p className="text-xs font-medium text-gray-900 dark:text-white">{course.name}</p><p className="text-[10px] text-gray-400">{course.gradeLevel} {course.strand && `• ${course.strand}`}</p></div>
                </div>
                <span className="text-xs text-gray-400">{course.students} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-72 space-y-4 hidden lg:block">
        {/* Flagged Students */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Flagged Students</h4>
          {flaggedStudents.length === 0 ? <p className="text-xs text-gray-400">No flagged students</p> : (
            <div className="space-y-2">
              {flaggedStudents.map(s => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"><span className="text-[9px] font-medium text-red-700 dark:text-red-300">{s.name.charAt(0)}</span></div>
                  <div><p className="text-[10px] font-medium text-gray-900 dark:text-white">{s.name}</p><div className="flex gap-1">{s.tags?.slice(0, 2).map(t => <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">{t}</span>)}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grade Summary */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Grade Overview</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Total Records</span><span className="text-sm font-bold text-gray-900 dark:text-white">{data.grades.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Average Score</span><span className="text-sm font-bold text-gray-900 dark:text-white">{data.grades.length > 0 ? Math.round(data.grades.reduce((s, g) => s + g.score, 0) / data.grades.length) : 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Passing (≥75)</span><span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data.grades.filter(g => g.score >= 75).length}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Failing (&lt;75)</span><span className="text-sm font-bold text-red-600 dark:text-red-400">{data.grades.filter(g => g.score < 75).length}</span></div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-dark-600">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Links</h4>
          <div className="space-y-1.5">
            <a href="/dashboard/students" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Manage Students</a>
            <a href="/dashboard/instructors" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Manage Instructors</a>
            <a href="/dashboard/courses" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ All Courses</a>
            <a href="/dashboard/grades" className="block px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">→ Grade Records</a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
