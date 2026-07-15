import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import Settings from './pages/Settings'


function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#12121a',
          color: '#fff',
          fontSize: '14px',
        },
      }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App