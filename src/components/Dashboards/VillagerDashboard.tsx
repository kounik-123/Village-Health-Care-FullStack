import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Fab,
  Alert
} from '@mui/material'
import {
  Report,
  Chat,
  Add,
  LocationOn,
  HealthAndSafety
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
// import { useNotifications } from '../../contexts/NotificationContext'
import HealthReportForm from '../HealthReport/HealthReportForm'
import ReportsList from '../HealthReport/ReportsList'
import ConsultationsList from '../Consultation/ConsultationsList'
import Profile from '../Profile/Profile'

const VillagerDashboard: React.FC = () => {
  const { user } = useAuth()
  // const { addNotification } = useNotifications()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [activeConsultations, setActiveConsultations] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const reportsKey = `reports_${user.id}`
    const hiddenKey = `hiddenReports_Villager_${user.id}`
    const consultationsKey = `consultations_${user.id}`

    const loadDashboardData = () => {
      // Load reports and filter out soft-deleted ones
      const allReports = JSON.parse(localStorage.getItem(reportsKey) || '[]')
      const hiddenIds = JSON.parse(localStorage.getItem(hiddenKey) || '[]')
      const visibleReports = Array.isArray(hiddenIds)
        ? allReports.filter((r: any) => !hiddenIds.includes(r.id))
        : allReports
      setRecentReports(visibleReports.slice(0, 3))

      // Build a fast lookup of visible report IDs
      const visibleReportIds = new Set(visibleReports.map((r: any) => r.id))

      // Load consultations and show ONLY active ones tied to existing visible reports (dedup by id)
      const consultations = JSON.parse(localStorage.getItem(consultationsKey) || '[]')
      const existingIds = new Set(Array.isArray(consultations) ? consultations.map((c: any) => c.id) : [])

      // Seed missing consultations from visible reports that have an appointed doctor and at least one response
      const missingConsultations: any[] = []
      try {
        visibleReports.forEach((r: any) => {
          if (r.assignedDoctorId && Array.isArray(r.responses) && r.responses.length > 0) {
            const resp = r.responses[r.responses.length - 1]
            const cid = `consultation_${r.id}_${r.assignedDoctorId}`
            if (!existingIds.has(cid)) {
              missingConsultations.push({
                id: cid,
                reportId: r.id,
                doctorId: r.assignedDoctorId,
                doctorName: r.assignedDoctorName || resp.doctorName,
                patientId: user.id,
                patientName: user.fullName,
                status: 'active',
                startedAt: new Date(),
                updatedAt: new Date(resp.respondedAt),
                createdAt: new Date(),
                lastMessage: {
                  content: resp.advice,
                  timestamp: new Date(resp.respondedAt),
                  sender: 'doctor'
                },
                resps: [
                  {
                    doctorId: resp.doctorId,
                    doctorName: resp.doctorName,
                    advice: resp.advice,
                    prescription: resp.prescription,
                    respondedAt: new Date(resp.respondedAt)
                  }
                ]
              })
            }
          }
        })
      } catch {}

      if (missingConsultations.length > 0) {
        const updatedAll = Array.isArray(consultations) ? [...missingConsultations, ...consultations] : missingConsultations
        localStorage.setItem(consultationsKey, JSON.stringify(updatedAll))
        try {
          window.dispatchEvent(new CustomEvent('consultations_updated', { detail: { userId: user.id, reason: 'seed_from_reports' } }))
        } catch {}
      }

      // Use the latest consultations data (if seeding occurred, reload from localStorage)
      const sourceCons = missingConsultations.length > 0
        ? JSON.parse(localStorage.getItem(consultationsKey) || '[]')
        : consultations

      const active = Array.isArray(sourceCons)
        ? sourceCons.filter((c: any) => c.status === 'active' && visibleReportIds.has(c.reportId))
        : []
      const uniqueById = Array.from(new Map(active.map((c: any) => [c.id, c])).values())
      setActiveConsultations(uniqueById)

      // Cleanup orphan active consultations not tied to any current report
      try {
        if (Array.isArray(consultations)) {
          const cleaned = consultations.filter((c: any) => visibleReportIds.has(c.reportId) || c.status !== 'active')
          localStorage.setItem(consultationsKey, JSON.stringify(cleaned))
        }
      } catch {}
    }

    // Initial load
    loadDashboardData()

    // Listen to real-time updates
    const onConsultationsUpdated = () => loadDashboardData()
    const onAllReportsUpdated = () => loadDashboardData()
    window.addEventListener('consultations_updated', onConsultationsUpdated as EventListener)
    window.addEventListener('allReportsUpdated', onAllReportsUpdated as EventListener)

    // Poll to reflect changes in reports, hidden IDs, or consultations
    let lastReports = localStorage.getItem(reportsKey) || ''
    let lastHidden = localStorage.getItem(hiddenKey) || ''
    let lastCons = localStorage.getItem(consultationsKey) || ''
    const interval = setInterval(() => {
      try {
        const currentReports = localStorage.getItem(reportsKey) || ''
        const currentHidden = localStorage.getItem(hiddenKey) || ''
        const currentCons = localStorage.getItem(consultationsKey) || ''
        if (currentReports !== lastReports || currentHidden !== lastHidden || currentCons !== lastCons) {
          lastReports = currentReports
          lastHidden = currentHidden
          lastCons = currentCons
          loadDashboardData()
        }
      } catch {}
    }, 1500)

    return () => {
      clearInterval(interval)
      window.removeEventListener('consultations_updated', onConsultationsUpdated as EventListener)
      window.removeEventListener('allReportsUpdated', onAllReportsUpdated as EventListener)
    }
  }, [user])

  const handleEmergencyReport = () => {
    navigate('/villager/report?emergency=true')
  }

  const quickStats = [
    {
      title: t('myReports'),
      value: recentReports.length,
      icon: <Report />,
      color: '#2e7d32',
      action: () => navigate('/villager/reports')
    },
    {
      title: t('activeConsultations'),
      value: activeConsultations.length,
      icon: <Chat />,
      color: '#1976d2',
      action: () => navigate('/villager/consultations')
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: <HealthAndSafety />,
      color: '#ed6c02',
      action: () => {}
    }
  ]

  return (
    <Container maxWidth="lg">
      <Routes>
        <Route path="/" element={
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                {t('welcome')}, {user?.fullName}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                How are you feeling today? Report any health concerns or check your consultation history.
              </Typography>
            </Box>

            {/* Emergency Alert */}
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleEmergencyReport}>
                  Report Emergency
                </Button>
              }
            >
              In case of emergency, click "Report Emergency" for immediate assistance.
            </Alert>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {quickStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                    onClick={stat.action}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            backgroundColor: stat.color + '20',
                            color: stat.color,
                            mr: 2
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography variant="h6" component="div">
                          {stat.title}
                        </Typography>
                      </Box>
                      <Typography variant="h4" color={stat.color} fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Reports */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Health Reports
                    </Typography>
                    {recentReports.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t('noReports')}
                      </Typography>
                    ) : (
                      recentReports.map((report, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2">
                            {report.symptoms}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))
                    )}
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/villager/reports')}
                    >
                      View All Reports
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Report />}
                        onClick={() => navigate('/villager/report')}
                        size="large"
                      >
                        {t('reportHealth')}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<LocationOn />}
                        onClick={() => navigate('/villager/report?location=true')}
                        size="large"
                      >
                        {t('shareLocation')}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Chat />}
                        onClick={() => navigate('/villager/consultations')}
                        size="large"
                      >
                        View Consultations
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Floating Action Button for Quick Report */}
            <Fab
              color="primary"
              aria-label="add report"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={() => navigate('/villager/report')}
            >
              <Add />
            </Fab>
          </>
        } />
        <Route path="/report" element={<HealthReportForm />} />
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/consultations" element={<ConsultationsList />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Container>
  )
}

export default VillagerDashboard