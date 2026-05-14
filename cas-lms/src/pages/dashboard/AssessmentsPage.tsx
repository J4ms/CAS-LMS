import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Loader2, X, CheckCircle, Clock } from 'lucide-react'
import { getEnrollments, getAssessmentsByCourse, getAssessmentSubmissionsByStudent, createAssessmentSubmission } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Assessment { id: number; courseId: number; title: string; description: string; type: string; maxScore: number; dueDate: string; questions: Question[] }
interface Question { id: string; type: 'multiple_choice' | 'identification' | 'select_multiple'; question: string; options?: string[]; correctAnswer?: string; correctAnswers?: string[]; points: number }
interface Submission { id: number; assessmentId: number; studentId: number; score: number | null; submittedAt: string }

export default function AssessmentsPage() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [showTakeModal, setShowTakeModal] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; max: number } | null>(null)

  useEffect(() => { fetchData() }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const enrollRes = await getEnrollments()
      const myEnrollments = enrollRes.data.filter((e: { studentId: number; status: string }) => e.studentId === user.id && e.status === 'Active')
      const courseIds = myEnrollments.map((e: { courseId: number }) => e.courseId)

      const allAssessments: Assessment[] = []
      for (const cid of courseIds) {
        const res = await getAssessmentsByCourse(cid)
        allAssessments.push(...res.data)
      }
      setAssessments(allAssessments)

      const subsRes = await getAssessmentSubmissionsByStudent(user.id)
      setSubmissions(subsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const isSubmitted = (assessmentId: number) => submissions.some(s => s.assessmentId === assessmentId)
  const getSubmission = (assessmentId: number) => submissions.find(s => s.assessmentId === assessmentId)

  const startAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment)
    setAnswers({})
    setResult(null)
    setShowTakeModal(true)
  }

  const handleSubmit = async () => {
    if (!currentAssessment || !user) return
    setSubmitting(true)
    try {
      // Auto-grade
      let score = 0
      currentAssessment.questions.forEach(q => {
        const answer = answers[q.id]
        if (q.type === 'multiple_choice' || q.type === 'identification') {
          if (typeof answer === 'string' && answer.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim()) {
            score += q.points
          }
        } else if (q.type === 'select_multiple') {
          const correct = q.correctAnswers || []
          const selected = (answer as string[]) || []
          if (correct.length === selected.length && correct.every(c => selected.includes(c))) {
            score += q.points
          }
        }
      })

      await createAssessmentSubmission({
        assessmentId: currentAssessment.id,
        studentId: user.id,
        answers,
        score,
        submittedAt: new Date().toISOString().split('T')[0],
        gradedAt: new Date().toISOString().split('T')[0],
        autoGraded: true,
      })

      setResult({ score, max: currentAssessment.maxScore })
      fetchData()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const toggleMultiAnswer = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || []
    if (current.includes(option)) {
      setAnswers({ ...answers, [qId]: current.filter(o => o !== option) })
    } else {
      setAnswers({ ...answers, [qId]: [...current, option] })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assessments</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">View and take quizzes, exams, and assignments</p>
      </motion.div>

      {assessments.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No assessments available yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {assessments.map((assess, i) => {
          const submitted = isSubmitted(assess.id)
          const sub = getSubmission(assess.id)
          return (
            <motion.div key={assess.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-gray-100 dark:border-dark-600">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{assess.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{assess.questions.length} questions • Max: {assess.maxScore} pts • Due: {assess.dueDate}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{assess.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${assess.type === 'quiz' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : assess.type === 'exam' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'}`}>{assess.type}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {submitted ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Submitted</span>
                    {sub?.score !== null && sub !== undefined && <span className="text-sm font-bold text-gray-900 dark:text-white ml-2">{sub.score}/{assess.maxScore}</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />Not yet submitted</div>
                )}
                {!submitted && (
                  <button onClick={() => startAssessment(assess)} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-primary-700 transition-colors">Take Assessment</button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Take Assessment Modal */}
      <AnimatePresence>{showTakeModal && currentAssessment && (
        <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !result && setShowTakeModal(false)} className="fixed inset-0 bg-black/50 z-50" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
              <div><h3 className="text-base font-semibold text-gray-900 dark:text-white">{currentAssessment.title}</h3><p className="text-xs text-gray-400">{currentAssessment.questions.length} questions • {currentAssessment.maxScore} pts</p></div>
              <button onClick={() => setShowTakeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {result ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Assessment Submitted!</h4>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.score} / {result.max}</p>
                  <p className="text-sm text-gray-400 mt-2">{Math.round((result.score / result.max) * 100)}% score</p>
                  <button onClick={() => setShowTakeModal(false)} className="mt-6 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700">Close</button>
                </div>
              ) : (
                currentAssessment.questions.map((q, qi) => (
                  <div key={q.id} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-3"><span className="text-primary-600 dark:text-primary-400 mr-2">Q{qi + 1}.</span>{q.question} <span className="text-xs text-gray-400">({q.points} pts)</span></p>
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {q.options?.map(opt => (
                          <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q.id] === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-500 hover:border-gray-300'}`}>
                            <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="text-primary-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'identification' && (
                      <input type="text" value={(answers[q.id] as string) || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-600 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500" placeholder="Type your answer..." />
                    )}
                    {q.type === 'select_multiple' && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 mb-1">Select all that apply:</p>
                        {q.options?.map(opt => (
                          <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${((answers[q.id] as string[]) || []).includes(opt) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-500 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={((answers[q.id] as string[]) || []).includes(opt)} onChange={() => toggleMultiAnswer(q.id, opt)} className="text-primary-600 rounded" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {!result && (
              <div className="p-5 border-t border-gray-100 dark:border-dark-600">
                <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit Assessment
                </button>
              </div>
            )}
          </div>
        </motion.div></>
      )}</AnimatePresence>
    </div>
  )
}
