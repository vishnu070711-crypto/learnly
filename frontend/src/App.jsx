import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import CourseList from './pages/CourseList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import CourseDetail from './pages/course/CourseDetail';
import CourseMaterials from './pages/course/CourseMaterials';

import StudentDashboard from './pages/student/StudentDashboard';
import AssignmentDetail from './pages/student/AssignmentDetail';

import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseForm from './pages/instructor/CourseForm';
import ManageMaterials from './pages/instructor/ManageMaterials';
import ManageAssignments from './pages/instructor/ManageAssignments';
import GradeSubmissions from './pages/instructor/GradeSubmissions';
import CourseStudents from './pages/instructor/CourseStudents';

import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id/materials" element={<ProtectedRoute><CourseMaterials /></ProtectedRoute>} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any authenticated user */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:id"
        element={
          <ProtectedRoute roles={['student']}>
            <AssignmentDetail />
          </ProtectedRoute>
        }
      />

      {/* Instructor */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <CourseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:id/edit"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <CourseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/materials"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <ManageMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/assignments"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <ManageAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/students"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <CourseStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/assignments/:assignmentId/submissions"
        element={
          <ProtectedRoute roles={['instructor', 'admin']}>
            <GradeSubmissions />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
