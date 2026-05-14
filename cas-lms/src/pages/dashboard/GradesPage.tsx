import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Loader2 } from 'lucide-react'
import { getGradesByStudent, getGrades, getCourses, getUsers } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Grade { id: number; studentId: number; courseId: number; level: string; semester?: string; quarter?: string; term: string; score: number; remarks: string; instructorId: number; createdAt: string }
interface Course { id: number; name: string; gradeLevel: string; level: string; strand: string }
interface User { id: number; name: string; studentId?: string }

export default function GradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const isStudent = user?.role === 'student'

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, usersRes] = await Promise.all([getCourses(), getUsers()])
        setCourses(coursesRes.data)
        setStudents(usersRes.data.filter((u: { role: string }) => u.role === 'student'))

        if (isStudent && user) {
          const gradesRes = await getGradesByStudent(user.id)
          setGrades(gradesRes.data)
        } else {
          const gradesRes = await getGrades()
          setGrades(gradesRes.data)
        }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user, isStudent])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  // Group grades by course
  const groupedByCourse = grades.reduce((acc, grade) => {
    if (!acc[grade.courseId]) acc[grade.courseId] = []
    acc[grade.courseId].push(grade)
    return acc
  }, {} as Record<number, Grade[]>)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 80) return 'text-blue-600 dark:text-blue-400'
    if (score >= 75) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{isStudent ? 'My Grades' : 'Grade Records'}</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {isStudent ? 'View your academic performance across all courses' : 'View and manage student grades'}
        </p>
      </motion.div>

      {Object.keys(groupedByCourse).length === 0 && (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500">No grades recorded yet.</p>
        </div>
      )}

      {Object.entries(groupedByCourse).map(([courseIdStr, courseGrades]) => {
        const courseId = Number(courseIdStr)
        const course = courses.find(c => c.id === courseId)
        const isSHS = course?.level === 'Senior High School'

        return (
          <motion.div
            key={courseId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{course?.name || 'Unknown Course'}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{course?.gradeLevel}</span>
                {course?.strand && <><span>•</span><span>{course.strand}</span></>}
                <span>•</span>
                <span>{isSHS ? 'Semester System (Prelim → Finals)' : 'Quarterly System (Q1 → Q4)'}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-600">
                    {!isStudent && <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Student</th>}
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">{isSHS ? 'Semester' : 'Quarter'}</th>
                    {isSHS && <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Term</th>}
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Score</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Remarks</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-600">
                  {courseGrades.map(grade => {
                    const student = students.find(s => s.id === grade.studentId)
                    return (
                      <tr key={grade.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                        {!isStudent && <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{student?.name || `#${grade.studentId}`}</td>}
                        <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{isSHS ? grade.semester : grade.quarter}</td>
                        {isSHS && <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{grade.term}</td>}
                        <td className={`px-5 py-3 text-lg font-bold ${getScoreColor(grade.score)}`}>{grade.score}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{grade.remarks || '—'}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{grade.createdAt}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Average */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-600 bg-gray-50/30 dark:bg-dark-700/30 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Average</span>
              <span className={`text-lg font-bold ${getScoreColor(Math.round(courseGrades.reduce((s, g) => s + g.score, 0) / courseGrades.length))}`}>
                {Math.round(courseGrades.reduce((s, g) => s + g.score, 0) / courseGrades.length)}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
