import React, { useState, useEffect } from 'react'
// Removed unused navigation and translation hooks
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Badge,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  // Removed ListItemSecondaryAction as it's unused
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
  LinearProgress
} from '@mui/material'
import {
  // Dashboard, // removed unused icon
  Notifications,
  People,
  Assignment,
  Warning,
  Chat,
  VideoCall,
  Phone,
  Send,
  Delete
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import LocationMap from '../Communication/LocationMap'
import NotificationService from '../../services/NotificationService'
import { Routes, Route } from 'react-router-dom'
import Profile from '../Profile/Profile'

interface HealthReport {
  id: string
  userId: string
  userName: string
  userPhone?: string
  userVillage?: string
  symptoms: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  location?: {
    latitude: number
    longitude: number
    address?: string
    text?: string
  }
  createdAt: Date
  status: 'pending' | 'reviewed' | 'active' | 'resolved'
  responses?: {
    doctorId: string
    doctorName: string
    advice: string
    prescription?: string
    followUpDate?: Date
    respondedAt: Date
  }[]
  assignedDoctorId?: string
  assignedDoctorName?: string
}

const DoctorDashboard: React.FC = () => {
  const [reports, setReports] = useState<HealthReport[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null)
  const [responseDialog, setResponseDialog] = useState(false)
  const [response, setResponse] = useState({
    advice: '',
    prescription: '',
    followUpDays: 7
  })

  const { user } = useAuth()
  const { showToast, unreadCount, notifications } = useNotifications()
  // const navigate = useNavigate() // removed unused navigation
  // Compute unread from context first for consistency with top bell icon; fallback to local calculation if needed
  const displayUnread = (typeof unreadCount === 'number' ? unreadCount : (Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0))
  // Add per-doctor hidden reports list (to hide deleted cases from this doctor's view only)
  const [hiddenReportIds, setHiddenReportIds] = useState<string[]>([])
  // Local toast for doctor (top-right with progress)
  const [localToastOpen, setLocalToastOpen] = useState(false)
  const [localToastMessage, setLocalToastMessage] = useState('')
  const [localToastSeverity, setLocalToastSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success')
  const [localToastProgress, setLocalToastProgress] = useState(0)
  const [localToastDuration, setLocalToastDuration] = useState(3000)
  // Delete confirmation modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportPendingDelete, setReportPendingDelete] = useState<HealthReport | null>(null)
  // NEW: consultations state for real-time rendering
  // const [consultations, setConsultations] = useState<any[]>([]) // removed unused state

  useEffect(() => {
    if (user) {
      const key = `hiddenReports_Doctor_${user.id}`
      const ids = JSON.parse(localStorage.getItem(key) || '[]')
      setHiddenReportIds(Array.isArray(ids) ? ids : [])
      loadReports()
      // Initial load of consultations for this doctor
      // const cons = JSON.parse(localStorage.getItem(`consultations_doctor_${user.id}`) || '[]')
      // setConsultations(Array.isArray(cons) ? cons : [])
    }
  }, [user])
  // Show local toast progress bar
  useEffect(() => {
    let interval: any
    if (localToastOpen) {
      setLocalToastProgress(0)
      const start = Date.now()
      interval = setInterval(() => {
        const elapsed = Date.now() - start
        const p = Math.min(100, (elapsed / localToastDuration) * 100)
        setLocalToastProgress(p)
        if (p >= 100) {
          setLocalToastOpen(false)
          clearInterval(interval)
        }
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [localToastOpen, localToastDuration])
  // Subscribe to appointment notifications for this doctor to show success toast
  useEffect(() => {
    if (!user) return
    const unsubscribe = NotificationService.subscribe((notification) => {
      if (notification.userId === user.id && notification.title === 'Appointment Assigned') {
        setLocalToastMessage('Appointment sent successfully')
        setLocalToastSeverity('success')
        setLocalToastDuration(3000)
        setLocalToastOpen(true)
        // Refresh consultations on appointment events
        // const cons = JSON.parse(localStorage.getItem(`consultations_doctor_${user.id}`) || '[]')
        // setConsultations(Array.isArray(cons) ? cons : [])
      }
    })
    return () => {
      unsubscribe()
    }
  }, [user])
  
  // Poll for real-time updates to reports only (removed consultations polling)
  useEffect(() => {
    if (!user) return
    // Immediate initial load so new reports appear instantly without waiting for polling
    loadReports()
    const reportsKey = 'allReports'
    let lastReports = localStorage.getItem(reportsKey) || ''
    const interval = setInterval(() => {
      try {
        const currentReports = localStorage.getItem(reportsKey) || ''
        if (currentReports !== lastReports) {
          lastReports = currentReports
          loadReports()
        }
      } catch {}
    }, 500)
    return () => clearInterval(interval)
  }, [user])

  // React instantly to cross-tab/localStorage updates to 'allReports'
  useEffect(() => {
    if (!user) return
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'allReports') {
        loadReports()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [user])
  // Removed unused t and navigate

  // React instantly to in-tab custom events that indicate updates to 'allReports'
  useEffect(() => {
    if (!user) return
    const onCustom = (e: Event) => {
      loadReports()
    }
    window.addEventListener('allReportsUpdated', onCustom as EventListener)
    return () => {
      window.removeEventListener('allReportsUpdated', onCustom as EventListener)
    }
  }, [user])
  // Removed unused t and navigate
  
  // Ensure hooks are always called in the same order
  // Duplicate effect removed to avoid redundant loadReports calls
  // useEffect(() => {
  //   if (user) {
  //     loadReports()
  //   }
  // }, [user])
  // Remove duplicate effect to maintain consistent hook order
  // useEffect(() => {
  //   loadReports()
  // }, [])
  
  // Guard against null user to prevent runtime errors and blank screen
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">Loading dashboard...</Alert>
        </Box>
      </Container>
    )
  }

  const loadReports = () => {
    try {
      // Load all reports from localStorage
      const allReports = JSON.parse(localStorage.getItem('allReports') || '[]')
      
      // Add user information to reports
      const reportsWithUserInfo = allReports.map((report: any) => {
        // Get user info from localStorage (in real app, this would come from backend)
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const reportUser = users.find((u: any) => u.id === report.userId)
        
        return {
          ...report,
          createdAt: new Date(report.createdAt),
          userName: reportUser?.fullName || 'Unknown User',
          userPhone: reportUser?.phoneNumber,
          userVillage: reportUser?.village,
          responses: Array.isArray(report.responses) ? report.responses.map((resp: any) => ({
            ...resp,
            respondedAt: new Date(resp.respondedAt),
            followUpDate: resp.followUpDate ? new Date(resp.followUpDate) : undefined
          })) : (report.doctorResponse ? [{
            doctorId: 'unknown',
            doctorName: report.doctorResponse.doctorName,
            advice: report.doctorResponse.advice,
            prescription: report.doctorResponse.prescription,
            followUpDate: report.doctorResponse.followUpDate ? new Date(report.doctorResponse.followUpDate) : undefined,
            respondedAt: new Date(report.doctorResponse.respondedAt)
          }] : []),
          assignedDoctorId: report.assignedDoctorId,
          assignedDoctorName: report.assignedDoctorName
        }
      })

      setReports(reportsWithUserInfo.sort((a: any, b: any) => {
        // Sort by urgency first, then by date
        const urgencyOrder: Record<'emergency' | 'high' | 'medium' | 'low', number> = { emergency: 4, high: 3, medium: 2, low: 1 }
        const aUrgency = a.urgency as 'emergency' | 'high' | 'medium' | 'low'
        const bUrgency = b.urgency as 'emergency' | 'high' | 'medium' | 'low'
        if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
          return urgencyOrder[bUrgency] - urgencyOrder[aUrgency]
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }))
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  const getFilteredReports = () => {
    // Always hide reports the current doctor removed (per-doctor hidden list)
    const visibleReports = reports
      .filter(r => !hiddenReportIds.includes(r.id))

    switch (activeTab) {
      case 0: // All
        return visibleReports
      case 1: // Pending (for this doctor)
        return visibleReports.filter(r => !hasDoctorResponded(r, user!.id))
      case 2: // Emergency (pending for this doctor)
        return visibleReports.filter(r => r.urgency === 'emergency' && !hasDoctorResponded(r, user!.id))
      case 3: // Reviewed (responded by this doctor)
        return visibleReports.filter(r => hasDoctorResponded(r, user!.id))
      default:
        return visibleReports
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return '#4caf50'
      case 'medium': return '#ff9800'
      case 'high': return '#f44336'
      case 'emergency': return '#d32f2f'
      default: return '#757575'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'reviewed': return 'info'
      case 'resolved': return 'success'
      default: return 'default'
    }
  }

  // Helper: whether current doctor has already responded to this report
  const hasDoctorResponded = (report: HealthReport, doctorId: string) => {
    return Array.isArray(report.responses) && report.responses.some((resp) => resp.doctorId === doctorId)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleRespondToReport = (report: HealthReport) => {
    setSelectedReport(report)
    setResponseDialog(true)
  }
  const openDeleteDialog = (report: HealthReport) => {
    setReportPendingDelete(report)
    setDeleteDialogOpen(true)
  }
  const handleConfirmDelete = () => {
    if (reportPendingDelete) {
      handleDeleteAppointment(reportPendingDelete)
    }
    setDeleteDialogOpen(false)
    setReportPendingDelete(null)
  }
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setReportPendingDelete(null)
  }

  const submitResponse = () => {
    if (!selectedReport || !response.advice) return

    // Prevent responses if a doctor is already appointed and it's not the current doctor
    if (selectedReport.assignedDoctorId && selectedReport.assignedDoctorId !== user!.id) {
      setResponseDialog(false)
      return
    }

    const newResponse = {
      id: `response_${selectedReport.id}_${user!.id}_${Date.now()}`,
      doctorId: user!.id,
      doctorName: user!.fullName,
      advice: response.advice,
      prescription: response.prescription || undefined,
      followUpDate: response.followUpDays > 0 
        ? new Date(Date.now() + response.followUpDays * 24 * 60 * 60 * 1000)
        : undefined,
      respondedAt: new Date()
    }

    // Update in allReports
    const allReports = JSON.parse(localStorage.getItem('allReports') || '[]')
    const updatedAllReports = allReports.map((r: any) => {
      if (r.id !== selectedReport.id) return r
      const existingResponses = Array.isArray(r.responses) ? r.responses : []
      return { ...r, status: 'reviewed', responses: [...existingResponses, newResponse] }
    })
    localStorage.setItem('allReports', JSON.stringify(updatedAllReports))
    window.dispatchEvent(new CustomEvent('allReportsUpdated', { detail: { reason: 'doctor_response', reportId: selectedReport.id } }))

    // Update in user's personal reports
    const userReports = JSON.parse(localStorage.getItem(`reports_${selectedReport.userId}`) || '[]')
    const updatedUserReports = userReports.map((r: any) => {
      if (r.id !== selectedReport.id) return r
      const existingResponses = Array.isArray(r.responses) ? r.responses : []
      return { ...r, status: 'reviewed', responses: [...existingResponses, newResponse] }
    })
    localStorage.setItem(`reports_${selectedReport.userId}`, JSON.stringify(updatedUserReports))

    // Sync consultations for real-time updates on both doctor and patient sides
    try {
      const doctorConsKey = `consultations_doctor_${user!.id}`
      const patientConsKey = `consultations_${selectedReport.userId}`
      const doctorCons = JSON.parse(localStorage.getItem(doctorConsKey) || '[]')
      const patientCons = JSON.parse(localStorage.getItem(patientConsKey) || '[]')

      const appendResp = (c: any) => {
        if (c.reportId !== selectedReport.id) return c
        const existingResps = Array.isArray(c.resps) ? c.resps : []
        return {
          ...c,
          status: 'active',
          updatedAt: new Date(),
          lastMessage: {
            content: response.advice,
            timestamp: new Date(),
            sender: 'doctor'
          },
          resps: [...existingResps, {
            doctorId: user!.id,
            doctorName: user!.fullName,
            advice: response.advice,
            prescription: response.prescription || undefined,
            respondedAt: new Date()
          }]
        }
      }

      const updatedDoctorCons = Array.isArray(doctorCons) ? doctorCons.map(appendResp) : []
      const updatedPatientCons = Array.isArray(patientCons) ? patientCons.map(appendResp) : []
      localStorage.setItem(doctorConsKey, JSON.stringify(updatedDoctorCons))
      localStorage.setItem(patientConsKey, JSON.stringify(updatedPatientCons))
      // Broadcast consultations update for immediate UI refresh
      try {
        window.dispatchEvent(new CustomEvent('consultations_updated', { detail: { userId: selectedReport.userId, doctorId: user!.id, reportId: selectedReport.id } }))
      } catch {}

      // Refresh reports
      loadReports()

      // Notify only villager and admin (not other doctors)
      try {
        NotificationService.sendUserNotification(
          selectedReport.userId,
          'Doctor Response',
          `Dr. ${user!.fullName} responded to your health report.`,
          'consultation',
          {
            reportId: selectedReport.id,
            doctorId: user!.id,
            doctorName: user!.fullName,
            advicePreview: response.advice,
            responseId: newResponse.id
          }
        )
        NotificationService.sendRoleNotification(
          'admin',
          'Doctor Responded',
          `Dr. ${user!.fullName} responded to ${selectedReport.userName}'s report.`,
          'consultation',
          {
            reportId: selectedReport.id,
            patientId: selectedReport.userId,
            doctorId: user!.id
          }
        )

        // Prevent duplicate patient notifications from monitoring
        localStorage.setItem(`lastPatientNotificationCheck_${selectedReport.userId}`, new Date().toISOString())
      } catch (e) {
        console.error('Failed to send notifications for response:', e)
      }

      // Reset form and close dialog
      setResponse({ advice: '', prescription: '', followUpDays: 7 })
      setResponseDialog(false)
      setSelectedReport(null)

      // Show success toast
      showToast('Responded successfully', { severity: 'success', autoHideDuration: 3000 })
    } catch (error) {
      console.error('Error submitting response:', error)
      showToast('Failed to submit response', { severity: 'error', autoHideDuration: 3000 })
    }
  }

  // Add handler to delete current doctor's appointment on a report
  const handleDeleteAppointment = (report: HealthReport) => {
      if (!user) return
      try {
        // Update in allReports: only clear assignment if it belongs to current doctor
        const allReports = JSON.parse(localStorage.getItem('allReports') || '[]')
        const updatedAllReports = allReports.map((r: any) => {
          if (r.id !== report.id) return r
          if (r.assignedDoctorId === user.id) {
            return { ...r, assignedDoctorId: undefined, assignedDoctorName: undefined }
          }
          return r
        })
        localStorage.setItem('allReports', JSON.stringify(updatedAllReports))

        // Update in user's personal reports store
        const userReports = JSON.parse(localStorage.getItem(`reports_${report.userId}`) || '[]')
        const updatedUserReports = userReports.map((r: any) => {
          if (r.id !== report.id) return r
          if (r.assignedDoctorId === user.id) {
            return { ...r, assignedDoctorId: undefined, assignedDoctorName: undefined }
          }
          return r
        })
        localStorage.setItem(`reports_${report.userId}`, JSON.stringify(updatedUserReports))

        // Hide this report from current doctor's dashboard (per-doctor hidden list)
        const key = `hiddenReports_Doctor_${user.id}`
        const nextHidden = hiddenReportIds.includes(report.id)
          ? hiddenReportIds
          : [...hiddenReportIds, report.id]
        setHiddenReportIds(nextHidden)
        localStorage.setItem(key, JSON.stringify(nextHidden))

        // Refresh view
        loadReports()

        // Notify villager and admin only about deletion
        try {
          NotificationService.sendUserNotification(
            report.userId,
            'Appointment Deleted',
            `Dr. ${user.fullName} removed their appointment for your report.`,
            'system',
            {
              reportId: report.id,
              doctorId: user.id,
              doctorName: user.fullName
            }
          )
          NotificationService.sendRoleNotification(
            'admin',
            'Appointment Deleted',
            `Dr. ${user.fullName} removed their appointment for ${report.userName}'s report.`,
            'system',
            {
              reportId: report.id,
              patientId: report.userId,
              doctorId: user.id
            }
          )
        } catch (e) {
          console.error('Failed to send notifications for deletion:', e)
        }

        // Show success toast
        showToast('Appointment deleted successfully', { severity: 'success', autoHideDuration: 3000 })
      } catch (error) {
        console.error('Error deleting appointment:', error)
      }
    }

    // Derive counts from the same visible set as the doctor sees
    const visibleReports = reports
      .filter(r => !hiddenReportIds.includes(r.id))
    const pendingCount = visibleReports.filter(r => !hasDoctorResponded(r, user!.id)).length
    const emergencyCount = visibleReports.filter(r => r.urgency === 'emergency' && !hasDoctorResponded(r, user!.id)).length
    const todayCount = visibleReports.filter(r => {
      const today = new Date()
      const reportDate = new Date(r.createdAt)
      return reportDate.toDateString() === today.toDateString()
    }).length

    return (
      <Container maxWidth="lg">
        <Routes>
          {/* Index Dashboard Overview */}
          <Route index element={
            <Box sx={{ mt: 2 }}>
              {/* Welcome Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Welcome, {user?.fullName ?? user?.name ?? 'Doctor'}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here’s an overview of your current activities and reports.
                </Typography>
              </Box>
              {/* Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Badge badgeContent={pendingCount} color="warning" overlap="circular">
                          <Assignment fontSize="large" sx={{ color: 'success.main' }} />
                        </Badge>
                        <Typography variant="h6" sx={{ mt: 1 }}>Pending Reports</Typography>
                        <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>{pendingCount}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Warning fontSize="large" sx={{ color: 'error.main' }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>Emergency Cases</Typography>
                        <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>{emergencyCount}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <People fontSize="large" sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>Today's Reports</Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{todayCount}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Notifications fontSize="large" sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>Notifications</Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{displayUnread}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Patient Reports (Index view) */}
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Patient Reports
                </Typography>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                  <Tab label={`All (${visibleReports.length})`} />
                  <Tab label={`Pending (${pendingCount})`} />
                  <Tab label={`Emergency (${emergencyCount})`} />
                  <Tab label={`Reviewed (${visibleReports.filter(r => r.status === 'reviewed').length})`} />
                </Tabs>
                {getFilteredReports().length === 0 ? (
                  <Alert severity="info">No reports found in this category.</Alert>
                ) : (
                  <List>
                    {getFilteredReports().map((report) => (
                      <ListItem
                        key={report.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: report.urgency === 'emergency' ? '#ffebee' : 'background.paper',
                          alignItems: 'flex-start',
                          pr: { xs: 14, sm: 22 }
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', minWidth: { xs: 140, sm: 180 } }}>
                            {(!report.assignedDoctorId || report.assignedDoctorId === user!.id) && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Send />}
                                onClick={() => handleRespondToReport(report)}
                              >
                                {report.assignedDoctorId === user!.id ? 'Continue' : 'Respond'}
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => openDeleteDialog(report)}
                            >
                              Delete Report
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Open Chat">
                                <IconButton size="small" color="primary" aria-label="Open Chat">
                                  <Chat />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Start Voice Call">
                                <IconButton size="small" color="primary" aria-label="Start Voice Call">
                                  <Phone />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Start Video Call">
                                <IconButton size="small" color="primary" aria-label="Start Video Call">
                                  <VideoCall />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        }
                      >
                       <ListItemText
                         primary={
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                             <Typography variant="h6">
                               {report.userName}
                             </Typography>
                             {report.urgency === 'emergency' && (
                               <Warning sx={{ color: 'error.main' }} />
                             )}
                             <Chip
                               label={report.urgency.toUpperCase()}
                               size="small"
                               sx={{ 
                                 bgcolor: getUrgencyColor(report.urgency),
                                 color: 'white',
                                 fontWeight: 'bold'
                               }}
                             />
                             <Chip
                               label={report.status.toUpperCase()}
                               size="small"
                               color={getStatusColor(report.status) as any}
                               variant="outlined"
                             />
                           </Box>
                         }
                         secondary={
                           <Box>
                             <Typography variant="body2" gutterBottom>
                               <strong>Symptoms:</strong> {report.symptoms}
                             </Typography>
                             {report.description && (
                               <Typography variant="body2" gutterBottom>
                                 <strong>Description:</strong> {report.description}
                               </Typography>
                             )}
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                               <Typography variant="caption">
                                 {formatDate(report.createdAt)}
                               </Typography>
                               {report.userVillage && (
                                 <Typography variant="caption">
                                   Village: {report.userVillage}
                                 </Typography>
                               )}
                             </Box>
                             {report.location && (
                               <Box sx={{ mt: 1 }}>
                                 <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
                                   Location: {report.location.text ? `${report.location.text} — ` : ''}{report.location.address || `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
                                 </Typography>
                                 <Box sx={{ mt: 1.5, mb: 1, width: '100%', maxWidth: 500 }}>
                                    <LocationMap
                                      latitude={report.location.latitude}
                                      longitude={report.location.longitude}
                                      address={report.location.address}
                                      height={150}
                                      showUseMyLocation={false}
                                    />
                                 </Box>
                               </Box>
                             )}
                             {Array.isArray(report.responses) && report.responses.length > 0 && (
                               <Box sx={{ mt: 1.5 }}>
                                 <Typography variant="subtitle2" gutterBottom>
                                   Doctor Responses
                                 </Typography>
                                 {report.responses.map((resp, idx) => (
                                   <Box key={idx} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                                     <Typography variant="body2" gutterBottom>
                                       <strong>Doctor:</strong> {resp.doctorName}
                                     </Typography>
                                     <Typography variant="body2" gutterBottom>
                                       <strong>Advice:</strong> {resp.advice}
                                     </Typography>
                                     {resp.prescription && (
                                       <Typography variant="body2" gutterBottom>
                                         <strong>Prescription:</strong> {resp.prescription}
                                       </Typography>
                                     )}
                                     <Box sx={{ display: 'flex', gap: 2 }}>
                                       <Typography variant="caption" color="text.secondary">
                                         Responded: {formatDate(resp.respondedAt as Date)}
                                       </Typography>
                                       {resp.followUpDate && (
                                         <Typography variant="caption" color="text.secondary">
                                           Follow-up: {formatDate(resp.followUpDate as Date)}
                                         </Typography>
                                       )}
                                     </Box>
                                   </Box>
                                 ))}
                               </Box>
                             )}
                           </Box>
                         }
                       />
                     </ListItem>
                   ))}
                 </List>
               )}
             </Paper>
            </Box>
          } />

          {/* NEW: Profile route for doctor */}
          <Route path="profile" element={<Profile />} />

          {/* NEW: Dedicated Patient Reports page at /doctor/reports */}
          <Route path="reports" element={
            <Box sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Patient Reports
                </Typography>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                  <Tab label={`All (${visibleReports.length})`} />
                  <Tab label={`Pending (${pendingCount})`} />
                  <Tab label={`Emergency (${emergencyCount})`} />
                  <Tab label={`Reviewed (${visibleReports.filter(r => r.status === 'reviewed').length})`} />
                </Tabs>
                {getFilteredReports().length === 0 ? (
                  <Alert severity="info">No reports found in this category.</Alert>
                ) : (
                  <List>
                    {getFilteredReports().map((report) => (
                      <ListItem
                        key={report.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: report.urgency === 'emergency' ? '#ffebee' : 'background.paper',
                          alignItems: 'flex-start',
                          pr: { xs: 14, sm: 22 }
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', minWidth: { xs: 140, sm: 180 } }}>
                            {(!report.assignedDoctorId || report.assignedDoctorId === user!.id) && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Send />}
                                onClick={() => handleRespondToReport(report)}
                              >
                                {report.assignedDoctorId === user!.id ? 'Continue' : 'Respond'}
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => openDeleteDialog(report)}
                            >
                              Delete Report
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Open Chat">
                                <IconButton size="small" color="primary" aria-label="Open Chat">
                                  <Chat />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Start Voice Call">
                                <IconButton size="small" color="primary" aria-label="Start Voice Call">
                                  <Phone />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Start Video Call">
                                <IconButton size="small" color="primary" aria-label="Start Video Call">
                                  <VideoCall />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        }
                      >
                       <ListItemText
                         primary={
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                             <Typography variant="h6">
                               {report.userName}
                             </Typography>
                             {report.urgency === 'emergency' && (
                               <Warning sx={{ color: 'error.main' }} />
                             )}
                             <Chip
                               label={report.urgency.toUpperCase()}
                               size="small"
                               sx={{ 
                                 bgcolor: getUrgencyColor(report.urgency),
                                 color: 'white',
                                 fontWeight: 'bold'
                               }}
                             />
                             <Chip
                               label={report.status.toUpperCase()}
                               size="small"
                               color={getStatusColor(report.status) as any}
                               variant="outlined"
                             />
                           </Box>
                         }
                         secondary={
                           <Box>
                             <Typography variant="body2" gutterBottom>
                               <strong>Symptoms:</strong> {report.symptoms}
                             </Typography>
                             {report.description && (
                               <Typography variant="body2" gutterBottom>
                                 <strong>Description:</strong> {report.description}
                               </Typography>
                             )}
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                               <Typography variant="caption">
                                 {formatDate(report.createdAt)}
                               </Typography>
                               {report.userVillage && (
                                 <Typography variant="caption">
                                   Village: {report.userVillage}
                                 </Typography>
                               )}
                             </Box>
                             {report.location && (
                               <Box sx={{ mt: 1 }}>
                                 <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
                                   Location: {report.location.text ? `${report.location.text} — ` : ''}{report.location.address || `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
                                 </Typography>
                                 <Box sx={{ mt: 1.5, mb: 1, width: '100%', maxWidth: 500 }}>
                                    <LocationMap
                                      latitude={report.location.latitude}
                                      longitude={report.location.longitude}
                                      address={report.location.address}
                                      height={150}
                                      showUseMyLocation={false}
                                    />
                                 </Box>
                               </Box>
                             )}
                             {Array.isArray(report.responses) && report.responses.length > 0 && (
                               <Box sx={{ mt: 1.5 }}>
                                 <Typography variant="subtitle2" gutterBottom>
                                   Doctor Responses
                                 </Typography>
                                 {report.responses.map((resp, idx) => (
                                   <Box key={idx} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                                     <Typography variant="body2" gutterBottom>
                                       <strong>Doctor:</strong> {resp.doctorName}
                                     </Typography>
                                     <Typography variant="body2" gutterBottom>
                                       <strong>Advice:</strong> {resp.advice}
                                     </Typography>
                                     {resp.prescription && (
                                       <Typography variant="body2" gutterBottom>
                                         <strong>Prescription:</strong> {resp.prescription}
                                       </Typography>
                                     )}
                                     <Box sx={{ display: 'flex', gap: 2 }}>
                                       <Typography variant="caption" color="text.secondary">
                                         Responded: {formatDate(resp.respondedAt as Date)}
                                       </Typography>
                                       {resp.followUpDate && (
                                         <Typography variant="caption" color="text.secondary">
                                           Follow-up: {formatDate(resp.followUpDate as Date)}
                                         </Typography>
                                       )}
                                     </Box>
                                   </Box>
                                 ))}
                               </Box>
                             )}
                           </Box>
                         }
                       />
                     </ListItem>
                   ))}
                 </List>
               )}
             </Paper>
            </Box>
          } />

          {/* Active Consultations - separate functional page showing pending reports only */}
          <Route path="consultations" element={
            <Box sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Active Consultations
                </Typography>
                {visibleReports.filter(r => !hasDoctorResponded(r, user!.id)).length === 0 ? (
                  <Alert severity="info">No pending reports requiring response.</Alert>
                ) : (
                  <List>
                    {visibleReports
                      .filter(r => !hasDoctorResponded(r, user!.id))
                      .map((report) => (
                        <ListItem
                          key={report.id}
                          sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1, alignItems: 'flex-start', pr: { xs: 14, sm: 22 } }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', minWidth: { xs: 140, sm: 180 } }}>
                              {(!report.assignedDoctorId || report.assignedDoctorId === user!.id) && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Send />}
                                  onClick={() => handleRespondToReport(report)}
                                >
                                  {report.assignedDoctorId === user!.id ? 'Continue' : 'Respond'}
                                </Button>
                              )}
                            </Box>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">{report.userName}</Typography>
                                <Chip label={report.urgency.toUpperCase()} size="small" sx={{ bgcolor: getUrgencyColor(report.urgency), color: 'white', fontWeight: 'bold' }} />
                                <Chip label={'PENDING'} size="small" color={getStatusColor('pending') as any} variant="outlined" />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Symptoms:</strong> {report.symptoms}
                                </Typography>
                                {report.description && (
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Description:</strong> {report.description}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(report.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
              </Paper>
            </Box>
          } />

          {/* Medical History - separate functional page showing responded & appointed cases */}
          <Route path="history" element={
            <Box sx={{ mt: 2 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Medical History
                </Typography>
                {visibleReports.filter(r => r.status === 'reviewed').length === 0 ? (
                  <Alert severity="info">No medical history records yet.</Alert>
                ) : (
                  <List>
                    {visibleReports
                      .filter(r => r.status === 'reviewed')
                      .map((report) => (
                        <ListItem
                          key={report.id}
                          sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1, alignItems: 'flex-start', pr: { xs: 14, sm: 22 } }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', minWidth: { xs: 140, sm: 180 } }}>
                              {report.assignedDoctorId === user!.id && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Send />}
                                  onClick={() => handleRespondToReport(report)}
                                >
                                  Continue
                                </Button>
                              )}
                            </Box>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">{report.userName}</Typography>
                                <Chip label={report.urgency.toUpperCase()} size="small" sx={{ bgcolor: getUrgencyColor(report.urgency), color: 'white', fontWeight: 'bold' }} />
                                <Chip label={'REVIEWED'} size="small" color={getStatusColor('reviewed') as any} variant="outlined" />
                              </Box>
                            }
                            secondary={
                              <Box>
                                {Array.isArray(report.responses) && report.responses.length > 0 && (
                                  <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Doctor Responses
                                    </Typography>
                                    {report.responses.map((resp, idx) => (
                                      <Box key={idx} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                                        <Typography variant="body2" gutterBottom>
                                          <strong>Doctor:</strong> {resp.doctorName}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                          <strong>Advice:</strong> {resp.advice}
                                        </Typography>
                                        {resp.prescription && (
                                          <Typography variant="body2" gutterBottom>
                                            <strong>Prescription:</strong> {resp.prescription}
                                          </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            Responded: {formatDate(resp.respondedAt as Date)}
                                          </Typography>
                                          {resp.followUpDate && (
                                            <Typography variant="caption" color="text.secondary">
                                              Follow-up: {formatDate(resp.followUpDate as Date)}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
              </Paper>
            </Box>
          } />
          </Routes>
          
          {/* Global overlays moved outside Routes */}
          {/* Response Dialog */}
          <Dialog
            open={responseDialog}
            onClose={() => setResponseDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Respond to {selectedReport?.userName}'s Report
            </DialogTitle>
            <DialogContent>
              {selectedReport && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Patient's Symptoms:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    {selectedReport.symptoms}
                  </Typography>
                  {selectedReport.description && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Description:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        {selectedReport.description}
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                label="Medical Advice"
                multiline
                rows={4}
                value={response.advice}
                onChange={(e) => setResponse(prev => ({ ...prev, advice: e.target.value }))}
                required
                sx={{ mb: 2 }}
                placeholder="Provide your medical advice and recommendations..."
              />

              <TextField
                fullWidth
                label="Prescription (Optional)"
                multiline
                rows={3}
                value={response.prescription}
                onChange={(e) => setResponse(prev => ({ ...prev, prescription: e.target.value }))}
                sx={{ mb: 2 }}
                placeholder="List medications, dosage, and instructions..."
              />

              <FormControl fullWidth>
                <InputLabel>Follow-up in Days</InputLabel>
                <Select
                  value={response.followUpDays}
                  onChange={(e) => setResponse(prev => ({ ...prev, followUpDays: e.target.value as number }))}
                  label="Follow-up in Days"
                >
                  <MenuItem value={0}>No follow-up needed</MenuItem>
                  <MenuItem value={3}>3 days</MenuItem>
                  <MenuItem value={7}>1 week</MenuItem>
                  <MenuItem value={14}>2 weeks</MenuItem>
                  <MenuItem value={30}>1 month</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResponseDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitResponse}
                variant="contained"
                disabled={!response.advice}
                startIcon={<Send />}
              >
                Send Response
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete confirmation modal */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            BackdropProps={{ sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.15)' } }}
            PaperProps={{ sx: { borderRadius: 2, boxShadow: 8 } }}
          >
            <DialogTitle>Are you sure you want to delete this?</DialogTitle>
            <DialogActions>
              <Button variant="outlined" onClick={handleCancelDelete}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleConfirmDelete}>OK</Button>
            </DialogActions>
          </Dialog>

          {/* Top-right toast with progress */}
          <Snackbar
            open={localToastOpen}
            autoHideDuration={localToastDuration}
            onClose={() => setLocalToastOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setLocalToastOpen(false)}
              severity={localToastSeverity}
              variant="filled"
              sx={{ width: '100%', borderRadius: 1, boxShadow: 2 }}
            >
              {localToastMessage}
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={localToastProgress} />
              </Box>
            </Alert>
          </Snackbar>
        </Container>
      )
    }

export default DoctorDashboard