import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage    from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage  from './pages/AnalyzePage'
import HistoryPage  from './pages/HistoryPage'
import SessionPage  from './pages/SessionPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
      } />
      <Route path="/analyze" element={
        <PrivateRoute><Layout><AnalyzePage /></Layout></PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute><Layout><HistoryPage /></Layout></PrivateRoute>
      } />
      <Route path="/session" element={
        <PrivateRoute><Layout><SessionPage /></Layout></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}