import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen } from 'lucide-react'

const team = [
  { name: 'Chua, James Bernard A.', role: 'Project Leader', pic: '' },
  { name: 'Urgelles, Angelo B.', role: 'System Analyst, QA', pic: '' },
  { name: 'Victorio, Kevin Lance C.', role: 'Developer, Idea Maker', pic: '' },
  { name: 'Cabugao, Renz Carl P.', role: 'System Analyst', pic: '' },
  { name: 'Dela Cruz, Lydia Nirvamae O.', role: 'Documentation, QA', pic: '' },
]

const stagger = { visible: { transition: { staggerChildren: 0.12 } } }
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function TeamPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 bg-pattern relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-700/5 dark:bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-20">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">CAS LMS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Development Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">The people who built the CAS Learning Management System.</p>
        </motion.div>

        {/* Team Grid - 3 top, 2 bottom centered */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {/* Top row - 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {team.slice(0, 3).map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
          {/* Bottom row - 2 centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[calc(66.666%+12px)] mx-auto">
            {team.slice(3, 5).map((member, i) => (
              <TeamCard key={i + 3} member={member} />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center mt-16">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            CAS Learning Management System © 2026
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
            Built with React • TypeScript • Tailwind CSS • Node.js
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function TeamCard({ member }: { member: { name: string; role: string; pic: string } }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-6 text-center hover:shadow-xl transition-all duration-300"
    >
      {/* Profile pic - shows image if available, initials if not */}
      <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30">
        {member.pic ? (
          <img src={member.pic} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-white">{member.name.split(' ').map(n => n[0]).join('')}</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
    </motion.div>
  )
}
