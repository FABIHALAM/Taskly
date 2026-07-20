import { useState, useEffect, Suspense } from 'react'
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
import TaskDetail from './pages/TaskDetail'
import AppLoader from './components/AppLoader'

function App() {
  const [initLoading, setInitLoading] = useState(true)

  useEffect(() => {
    // Smooth initial app load effect
    const timer = setTimeout(() => {
      setInitLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (initLoading) {
    return <AppLoader message="Initializing Taskly Workspace..." />
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f111a',
            color: '#f8fafc',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
        }}
      />
      <Suspense fallback={<AppLoader message="Loading Page..." />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/projects/:id/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App