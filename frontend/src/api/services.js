import api from './axios';

// ---------- Auth ----------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (formData) =>
    api.put('/auth/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ---------- Courses ----------
export const courseAPI = {
  list: (params) => api.get('/courses', { params }),
  get: (id) => api.get(`/courses/${id}`),
  categories: () => api.get('/courses/meta/categories'),
  mine: () => api.get('/courses/mine/list'),
  create: (formData) =>
    api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/courses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/courses/${id}`),
};

// ---------- Enrollments ----------
export const enrollmentAPI = {
  enroll: (courseId) => api.post(`/enrollments/${courseId}`),
  confirmPayment: (enrollmentId) => api.post(`/enrollments/${enrollmentId}/confirm-payment`),
  mine: () => api.get('/enrollments/mine'),
  status: (courseId) => api.get(`/enrollments/status/${courseId}`),
  updateProgress: (enrollmentId, materialId) =>
    api.put(`/enrollments/${enrollmentId}/progress`, { materialId }),
  cancel: (courseId) => api.delete(`/enrollments/${courseId}`),
  courseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
};

// ---------- Materials ----------
export const materialAPI = {
  list: (courseId) => api.get(`/materials/${courseId}`),
  upload: (courseId, formData, onUploadProgress) =>
    api.post(`/materials/${courseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  remove: (id) => api.delete(`/materials/${id}`),
};

// ---------- Assignments ----------
export const assignmentAPI = {
  list: (courseId) => api.get(`/assignments/${courseId}`),
  get: (id) => api.get(`/assignments/single/${id}`),
  create: (courseId, data) => api.post(`/assignments/${courseId}`, data),
  submit: (assignmentId, formData) =>
    api.post(`/assignments/submit/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
  mySubmission: (assignmentId) => api.get(`/assignments/${assignmentId}/my-submission`),
  grade: (submissionId, data) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// ---------- Users (admin) ----------
export const userAPI = {
  list: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
  stats: () => api.get('/users/stats/overview'),
};
