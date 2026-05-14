import axios from 'axios'

const API_BASE = 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Users
export const getUsers = () => api.get('/users')
export const getUserById = (id: number) => api.get(`/users/${id}`)
export const getUsersByRole = (role: string) => api.get(`/users?role=${role}`)
export const createUser = (data: Record<string, unknown>) => api.post('/users', data)
export const updateUser = (id: number, data: Record<string, unknown>) => api.patch(`/users/${id}`, data)
export const deleteUser = (id: number) => api.delete(`/users/${id}`)

// Flag user
export const flagUser = (id: number, flagged: boolean, flagReason: string) =>
  api.patch(`/users/${id}`, { flagged, flagReason })

// Courses
export const getCourses = () => api.get('/courses')
export const getCourseById = (id: number) => api.get(`/courses/${id}`)
export const getCourseByJoinCode = (code: string) => api.get(`/courses?joinCode=${code}`)
export const createCourse = (data: Record<string, unknown>) => api.post('/courses', data)
export const updateCourse = (id: number, data: Record<string, unknown>) => api.patch(`/courses/${id}`, data)
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`)

// Enrollments
export const getEnrollments = () => api.get('/enrollments')
export const getEnrollmentsByStudent = (studentId: number) => api.get(`/enrollments?studentId=${studentId}`)
export const createEnrollment = (data: Record<string, unknown>) => api.post('/enrollments', data)
export const updateEnrollment = (id: number, data: Record<string, unknown>) => api.patch(`/enrollments/${id}`, data)
export const deleteEnrollment = (id: number) => api.delete(`/enrollments/${id}`)

// Messages
export const getMessages = () => api.get('/messages')
export const getMessagesByUser = (userId: number) => api.get(`/messages?senderId=${userId}`)
export const getMessagesForUser = (userId: number) => api.get(`/messages?receiverId=${userId}`)
export const createMessage = (data: Record<string, unknown>) => api.post('/messages', data)
export const markMessageRead = (id: number) => api.patch(`/messages/${id}`, { read: true })

// Notifications
export const getNotifications = (userId: number) => api.get(`/notifications?userId=${userId}&_sort=createdAt&_order=desc`)
export const getUnreadNotifications = (userId: number) => api.get(`/notifications?userId=${userId}&read=false`)
export const markNotificationRead = (id: number) => api.patch(`/notifications/${id}`, { read: true })
export const markAllNotificationsRead = (userId: number) =>
  api.get(`/notifications?userId=${userId}&read=false`).then(async (res) => {
    await Promise.all(res.data.map((n: { id: number }) => api.patch(`/notifications/${n.id}`, { read: true })))
  })
export const createNotification = (data: Record<string, unknown>) => api.post('/notifications', data)

// Announcements
export const getAnnouncements = () => api.get('/announcements')
export const createAnnouncement = (data: Record<string, unknown>) => api.post('/announcements', data)

// Events
export const getEvents = () => api.get('/events')
export const createEvent = (data: Record<string, unknown>) => api.post('/events', data)

// Lessons
export const getLessons = () => api.get('/lessons')
export const getLessonsByCourse = (courseId: number) => api.get(`/lessons?courseId=${courseId}`)
export const createLesson = (data: Record<string, unknown>) => api.post('/lessons', data)
export const updateLesson = (id: number, data: Record<string, unknown>) => api.patch(`/lessons/${id}`, data)
export const deleteLesson = (id: number) => api.delete(`/lessons/${id}`)

// Assessments
export const getAssessments = () => api.get('/assessments')
export const getAssessmentsByCourse = (courseId: number) => api.get(`/assessments?courseId=${courseId}`)
export const createAssessment = (data: Record<string, unknown>) => api.post('/assessments', data)
export const updateAssessment = (id: number, data: Record<string, unknown>) => api.patch(`/assessments/${id}`, data)
export const deleteAssessment = (id: number) => api.delete(`/assessments/${id}`)

// Assessment Submissions
export const getAssessmentSubmissions = () => api.get('/assessmentSubmissions')
export const getAssessmentSubmissionsByAssessment = (assessmentId: number) => api.get(`/assessmentSubmissions?assessmentId=${assessmentId}`)
export const getAssessmentSubmissionsByStudent = (studentId: number) => api.get(`/assessmentSubmissions?studentId=${studentId}`)
export const createAssessmentSubmission = (data: Record<string, unknown>) => api.post('/assessmentSubmissions', data)
export const updateAssessmentSubmission = (id: number, data: Record<string, unknown>) => api.patch(`/assessmentSubmissions/${id}`, data)

// Grades
export const getGrades = () => api.get('/grades')
export const getGradesByStudent = (studentId: number) => api.get(`/grades?studentId=${studentId}`)
export const getGradesByCourse = (courseId: number) => api.get(`/grades?courseId=${courseId}`)
export const createGrade = (data: Record<string, unknown>) => api.post('/grades', data)
export const updateGrade = (id: number, data: Record<string, unknown>) => api.patch(`/grades/${id}`, data)
export const deleteGrade = (id: number) => api.delete(`/grades/${id}`)

// Activities
export const getActivities = () => api.get('/activities')
export const getActivitiesByCourse = (courseId: number) => api.get(`/activities?courseId=${courseId}`)
export const createActivity = (data: Record<string, unknown>) => api.post('/activities', data)
export const updateActivity = (id: number, data: Record<string, unknown>) => api.patch(`/activities/${id}`, data)
export const deleteActivity = (id: number) => api.delete(`/activities/${id}`)

// Submissions
export const getSubmissions = () => api.get('/submissions')
export const getSubmissionsByActivity = (activityId: number) => api.get(`/submissions?activityId=${activityId}`)
export const getSubmissionsByStudent = (studentId: number) => api.get(`/submissions?studentId=${studentId}`)
export const createSubmission = (data: Record<string, unknown>) => api.post('/submissions', data)
export const updateSubmission = (id: number, data: Record<string, unknown>) => api.patch(`/submissions/${id}`, data)

// Auth (simulated)
export const loginUser = async (email: string, password: string) => {
  const res = await api.get('/users', { params: { email } })
  const users = res.data
  if (users.length > 0 && users[0].password === password) {
    return users[0]
  }
  throw new Error('Invalid credentials')
}

export default api
