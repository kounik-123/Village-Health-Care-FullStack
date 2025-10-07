import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import VillagerDashboard from './components/Dashboards/VillagerDashboard'
import DoctorDashboard from './components/Dashboards/DoctorDashboard'
import AdminDashboard from './components/Dashboards/AdminDashboard'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Chat from './components/Communication/Chat'
import WelcomeLayout from './components/Welcome/WelcomeLayout'
import Home from './components/Welcome/Home'
import About from './components/Welcome/About'
import Features from './components/Welcome/Features'
import Contact from './components/Welcome/Contact'
import FloatingBubbles from './components/FloatingBubbles'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FloatingBubbles />
        <Routes>
          {/* Welcome Pages */}
          <Route element={<WelcomeLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route element={<Layout />}>
            <Route 
              path="/chat/:consultationId" 
              element={
                <ProtectedRoute allowedRoles={['villager','doctor']}>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/villager/*" 
              element={
                <ProtectedRoute allowedRoles={['villager']}>
                  <VillagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/*" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App