import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProtectedRoute } from './auth'
import { StudentHomePage } from './pages/student/StudentHomePage'
import { StudentDetailPage } from './pages/student/StudentDetailPage'

export function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/student" element={<ProtectedRoute><StudentHomePage /></ProtectedRoute>} />
    <Route path="/student/:type/:id" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/student" replace />} />
  </Routes>
}