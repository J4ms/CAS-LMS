import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import TeamPage from './pages/TeamPage'
import DashboardLayout from './layouts/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import CoursesPage from './pages/dashboard/CoursesPage'
import StudentsPage from './pages/dashboard/StudentsPage'
import MessagesPage from './pages/dashboard/MessagesPage'
import CalendarPage from './pages/dashboard/CalendarPage'
import EnrollmentsPage from './pages/dashboard/EnrollmentsPage'
import InstructorsPage from './pages/dashboard/InstructorsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import GradesPage from './pages/dashboard/GradesPage'
import MyCoursesPage from './pages/dashboard/MyCoursesPage'
import AssessmentsPage from './pages/dashboard/AssessmentsPage'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="teacher" element={<TeacherDashboard />} />
                <Route path="student" element={<StudentDashboard />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="enrollments" element={<EnrollmentsPage />} />
                <Route path="instructors" element={<InstructorsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="grades" element={<GradesPage />} />
                <Route path="my-courses" element={<MyCoursesPage />} />
                <Route path="assessments" element={<AssessmentsPage />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
