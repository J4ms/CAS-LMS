import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  ChevronDown,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

const courses = [
  { name: 'Web Development', students: 245, level: 'Intermediate', duration: '12 weeks' },
  { name: 'Data Science', students: 198, level: 'Beginner', duration: '10 weeks' },
  { name: 'UI/UX Design', students: 176, level: 'Advanced', duration: '8 weeks' },
  { name: 'Mobile Development', students: 154, level: 'Intermediate', duration: '14 weeks' },
  { name: 'Digital Marketing', students: 132, level: 'Beginner', duration: '6 weeks' },
  { name: 'Business Communication', students: 89, level: 'Beginner', duration: '8 weeks' },
]

const testimonials = [
  { name: 'Maria Santos', role: 'Student', text: 'CAS LMS transformed my learning experience. The platform is intuitive and the courses are well-structured.' },
  { name: 'Dr. Sarah Chen', role: 'Instructor', text: 'Managing courses and tracking student progress has never been easier. The analytics are incredibly helpful.' },
  { name: 'Juan Dela Cruz', role: 'Student', text: 'I love how I can access my courses anytime. The mobile-friendly design makes learning on the go possible.' },
]

const faqs = [
  { q: 'How do I enroll in a course?', a: 'Simply create an account, browse our course catalog, and click "Enroll" on any course that interests you.' },
  { q: 'Is there a free trial available?', a: 'Yes! All new students get access to introductory modules for free. Full course access requires enrollment.' },
  { q: 'Can instructors create their own courses?', a: 'Absolutely. Our platform provides comprehensive tools for course creation, content management, and student assessment.' },
  { q: 'How do I track my progress?', a: 'Your dashboard shows real-time progress, scores, and learning activity across all enrolled courses.' },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 bg-mesh-light dark:bg-mesh-dark text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">CAS</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center bg-gray-100 dark:bg-dark-700/60 backdrop-blur-sm rounded-full px-6 py-2 border border-gray-200 dark:border-dark-500/30">
            <a href="#home" className="text-sm text-gray-900 dark:text-white/90 hover:text-primary-600 dark:hover:text-white px-3 py-1 transition-colors">Home</a>
            <a href="#courses" className="text-sm text-gray-500 dark:text-white/60 hover:text-primary-600 dark:hover:text-white px-3 py-1 transition-colors">Courses</a>
            <a href="#features" className="text-sm text-gray-500 dark:text-white/60 hover:text-primary-600 dark:hover:text-white px-3 py-1 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-gray-500 dark:text-white/60 hover:text-primary-600 dark:hover:text-white px-3 py-1 transition-colors">Reviews</a>
            <a href="#faq" className="text-sm text-gray-500 dark:text-white/60 hover:text-primary-600 dark:hover:text-white px-3 py-1 transition-colors">FAQ</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-white/60 hover:text-primary-600 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            to={isAuthenticated ? `/dashboard/${user?.role}` : '/login'}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/80 hover:text-primary-600 dark:hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative max-w-7xl mx-auto px-8 pt-20 pb-32">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary-200/40 dark:from-primary-900/20 via-emerald-100/20 dark:via-emerald-900/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-primary-100/30 dark:bg-primary-800/10 rounded-full blur-3xl"
          />
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 left-16 flex items-center gap-2"
        >
          <div className="w-6 h-6 border border-gray-300 dark:border-white/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-white/60">Active Learners</p>
            <p className="text-xs text-gray-400 dark:text-white/40">2,945</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-40 right-20 flex items-center gap-2"
        >
          <div className="w-6 h-6 border border-gray-300 dark:border-white/20 rounded-full flex items-center justify-center">
            <Award className="w-3 h-3 text-primary-500 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-white/60">Courses</p>
            <p className="text-xs text-gray-400 dark:text-white/40">148</p>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex justify-center mb-8"
        >
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-700/60 backdrop-blur-sm border border-gray-200 dark:border-dark-500/30 rounded-full px-4 py-2">
            <BookOpen className="w-4 h-4 text-primary-500 dark:text-primary-400" />
            <span className="text-sm text-gray-600 dark:text-white/70">Empowering Education with CAS</span>
            <ArrowRight className="w-3 h-3 text-gray-400 dark:text-white/50" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-gray-900 dark:text-white/90 mb-6">
            One Platform for
            <br />
            <span className="text-gray-400 dark:text-white/60">Smarter Learning</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-xl mx-auto mb-10">
            Dive into the CAS Learning Management System, where modern education
            meets seamless technology for students, teachers, and administrators.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 bg-primary-600 dark:bg-white text-white dark:text-dark-900 px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-700 dark:hover:bg-white/90 hover:scale-105 transition-all duration-200"
            >
              Open App
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 px-6 py-3 rounded-full text-sm font-medium hover:border-primary-400 dark:hover:border-white/40 hover:scale-105 transition-all duration-200"
            >
              Discover More
            </a>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
        >
          {[
            { value: '2,945+', label: 'Active Students' },
            { value: '148', label: 'Courses Available' },
            { value: '36', label: 'Expert Instructors' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/90">{stat.value}</p>
              <p className="text-sm text-gray-400 dark:text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-8 flex items-center gap-3"
        >
          <div className="w-8 h-8 border border-gray-300 dark:border-white/20 rounded-full flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-primary-500 dark:text-primary-400" />
          </div>
          <span className="text-xs text-gray-400 dark:text-white/40">Scroll down</span>
        </motion.div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="relative max-w-7xl mx-auto px-8 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white/90 mb-4">
            Popular Courses
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-500 dark:text-white/40 max-w-lg mx-auto">
            Explore our most enrolled courses designed by industry experts.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course) => (
            <motion.div
              key={course.name}
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-50 dark:bg-dark-700/40 backdrop-blur-sm border border-gray-200 dark:border-dark-500/30 rounded-2xl p-6 hover:border-primary-300 dark:hover:border-primary-500/40 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-600/20 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white/90 mb-2">{course.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40 mb-3">
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-white/50">
                  <Users className="w-3 h-3 inline mr-1" />
                  {course.students} enrolled
                </span>
                <ArrowRight className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-8 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white/90 mb-4">
            Why Choose CAS?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-500 dark:text-white/40 max-w-lg mx-auto">
            Built for modern education with tools that empower every role in the learning journey.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: Users, title: 'Role-Based Access', desc: 'Tailored dashboards for Admins, Teachers, and Students with specific tools and views for each role.', color: 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-600/20' },
            { icon: BookOpen, title: 'Course Management', desc: 'Create, manage, and track courses with ease. Monitor student progress and learning outcomes in real-time.', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-600/20' },
            { icon: BarChart3, title: 'Performance Analytics', desc: 'Comprehensive analytics and reporting to track learning activity, participation, and academic performance.', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-600/20' },
            { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security with role-based permissions and data protection for all users.', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-600/20' },
            { icon: Zap, title: 'Real-time Updates', desc: 'Instant notifications, live progress tracking, and real-time messaging between students and instructors.', color: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-600/20' },
            { icon: Globe, title: 'Accessible Anywhere', desc: 'Fully responsive design that works seamlessly on desktop, tablet, and mobile devices.', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-600/20' },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              whileHover={{ y: -3 }}
              className="bg-gray-50 dark:bg-dark-700/40 backdrop-blur-sm border border-gray-200 dark:border-dark-500/30 rounded-2xl p-8 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white/90 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative max-w-7xl mx-auto px-8 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white/90 mb-4">
            What Our Users Say
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-500 dark:text-white/40 max-w-lg mx-auto">
            Hear from students and instructors who use CAS every day.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              className="bg-gray-50 dark:bg-dark-700/40 backdrop-blur-sm border border-gray-200 dark:border-dark-500/30 rounded-2xl p-8"
            >
              <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-600/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/80">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative max-w-3xl mx-auto px-8 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white/90 mb-4">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-500 dark:text-white/40">
            Got questions? We've got answers.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-gray-50 dark:bg-dark-700/40 backdrop-blur-sm border border-gray-200 dark:border-dark-500/30 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-white/80">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-white/40 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-sm text-gray-500 dark:text-white/40 leading-relaxed">{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-100 dark:from-primary-900/40 to-blue-50 dark:to-dark-700/60 backdrop-blur-sm border border-primary-200 dark:border-primary-500/20 rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white/90 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-500 dark:text-white/40 max-w-md mx-auto mb-8">
            Join thousands of students and instructors already using CAS to transform their educational experience.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-primary-500 hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-500/30 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">CAS</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed mb-4">
                Empowering education through modern technology. CAS Learning Management System for students, teachers, and administrators.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 bg-gray-100 dark:bg-dark-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-dark-500 transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 dark:bg-dark-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-dark-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white/80 mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><a href="#home" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Home</a></li>
                <li><a href="#courses" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Courses</a></li>
                <li><a href="#features" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Features</a></li>
                <li><a href="#faq" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">FAQ</a></li>
                <li><Link to="/login" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white/80 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-white/70 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white/80 mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
                  <Mail className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  support@cas-lms.edu
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
                  <Phone className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  +63 912 345 6789
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
                  <MapPin className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  Manila, Philippines
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 dark:border-dark-500/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-white/30">
              © 2026 CAS Learning Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/team" className="text-xs text-gray-400 dark:text-white/30 hover:text-primary-600 dark:hover:text-white/50 transition-colors">Developers</Link>
              <a href="#" className="text-xs text-gray-400 dark:text-white/30 hover:text-primary-600 dark:hover:text-white/50 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-400 dark:text-white/30 hover:text-primary-600 dark:hover:text-white/50 transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
