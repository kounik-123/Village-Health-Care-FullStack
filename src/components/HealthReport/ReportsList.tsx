import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Alert,
  Divider,
  IconButton,
  Collapse,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material'
import {
  History,
  LocationOn,
  ExpandMore,
  ExpandLess,
  Warning,
  CheckCircle,
  Schedule,
  Visibility,
  Delete
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import NotificationService from '../../services/NotificationService'

interface HealthReport {
  id: string
  userId: string
  symptoms: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  location?: {
    latitude: number
    longitude: number
    address?: string
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

const ReportsList: React.FC = () => {
  const [reports, setReports] = useState<HealthReport[]>([])
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // Track per-villager hidden reports (soft delete)
  const [, setHiddenReportIds] = useState<string[]>([])
  // Toast state
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const TOAST_DURATION = 4000
  const [toastProgress, setToastProgress] = useState(0)
  const toastTimerRef = useRef<number | null>(null)
  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportIdPendingDelete, setReportIdPendingDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Close toast handler
  const handleCloseSnackbar = (_event?: any, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
  }
  
  // Toast progress effect
  useEffect(() => {
    if (snackbarOpen) {
      setToastProgress(0)
      const start = Date.now()
      toastTimerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - start
        const pct = Math.min(100, (elapsed / TOAST_DURATION) * 100)
        setToastProgress(pct)
        if (elapsed >= TOAST_DURATION) {
          if (toastTimerRef.current) {
            clearInterval(toastTimerRef.current)
            toastTimerRef.current = null
          }
        }
      }, 100)
    }
    return () => {
      if (toastTimerRef.current) {
        clearInterval(toastTimerRef.current)
        toastTimerRef.current = null
      }
    }
  }, [snackbarOpen])
  useEffect(() => {
    loadReports()
  }, [user])

  // Poll for real-time updates to current user's reports so changes reflect instantly
  useEffect(() => {
    if (!user) return
    const key = `reports_${user.id}`
    let last = localStorage.getItem(key) || ''
    const interval = setInterval(() => {
      try {
        const current = localStorage.getItem(key) || ''
        if (current !== last) {
          last = current
          loadReports()
        }
      } catch {}
    }, 1500)
    return () => clearInterval(interval)
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'reviewed': return 'info'
      case 'resolved': return 'success'
      default: return 'default'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />
      case 'reviewed': return <Visibility />
      case 'resolved': return <CheckCircle />
      default: return <Schedule />
    }
  }


  const toggleExpand = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const loadReports = () => {
    try {
      const rawReports = JSON.parse(localStorage.getItem(`reports_${user!.id}`) || '[]')
      const parsedReports: HealthReport[] = rawReports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
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
      }))
      // Load hidden report IDs for current villager and filter
      const hiddenKey = `hiddenReports_Villager_${user!.id}`
      const storedHidden = JSON.parse(localStorage.getItem(hiddenKey) || '[]')
      const hiddenIds = Array.isArray(storedHidden) ? storedHidden : []
      setHiddenReportIds(hiddenIds)
      const visibleReports = parsedReports.filter(r => !hiddenIds.includes(r.id))
      setReports(visibleReports)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Open delete confirmation modal
  const openDeleteDialog = (reportId: string) => {
    setReportIdPendingDelete(reportId)
    setDeleteDialogOpen(true)
  }

  // Soft delete a report for current villager only (no confirm here)
  const handleDeleteReport = (reportId: string) => {
    if (!user) return
    const key = `hiddenReports_Villager_${user.id}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const next = Array.isArray(existing) ? Array.from(new Set([...existing, reportId])) : [reportId]
    setHiddenReportIds(next)
    localStorage.setItem(key, JSON.stringify(next))
    // Update visible list
    setReports(prev => prev.filter(r => r.id !== reportId))
    
    // Also cascade delete consultations and messages linked to this report for this villager
    try {
      const consKey = `consultations_${user.id}`
      const currentCons = JSON.parse(localStorage.getItem(consKey) || '[]')
      const toRemove = Array.isArray(currentCons) ? currentCons.filter((c: any) => c.reportId === reportId) : []
      const remaining = Array.isArray(currentCons) ? currentCons.filter((c: any) => c.reportId !== reportId) : []
      localStorage.setItem(consKey, JSON.stringify(remaining))
      // Remove chat messages for the removed consultations
      toRemove.forEach((c: any) => {
        try { localStorage.removeItem(`messages_${c.id}`) } catch {}
        // Optionally remove from doctor side as well to keep lists clean
        if (c.doctorId) {
          const docKey = `consultations_doctor_${c.doctorId}`
          const docCons = JSON.parse(localStorage.getItem(docKey) || '[]')
          const docRemaining = Array.isArray(docCons) ? docCons.filter((dc: any) => dc.id !== c.id) : []
          localStorage.setItem(docKey, JSON.stringify(docRemaining))
        }
      })
      // Notify UI to refresh
      window.dispatchEvent(new CustomEvent('consultations_updated', { detail: { userId: user.id, reportId } }))
    } catch {}

    // Show success toast
    setSnackbarMessage('Deleted successfully')
    setSnackbarOpen(true)
  }

  const handleConfirmDelete = () => {
    if (reportIdPendingDelete) {
      handleDeleteReport(reportIdPendingDelete)
    }
    setDeleteDialogOpen(false)
    setReportIdPendingDelete(null)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setReportIdPendingDelete(null)
  }

  const handleAppointDoctor = (report: HealthReport, doctorId: string) => {
    const selectedResponse = (report.responses || []).find(r => r.doctorId === doctorId)
    if (!selectedResponse) return

    const updatedReport: any = {
      ...report,
      status: 'reviewed',
      assignedDoctorId: selectedResponse.doctorId,
      assignedDoctorName: selectedResponse.doctorName
    }

    // Update in user's reports
    const userReports = JSON.parse(localStorage.getItem(`reports_${report.userId}`) || '[]')
    const updatedUserReports = userReports.map((r: any) => r.id === report.id ? updatedReport : r)
    localStorage.setItem(`reports_${report.userId}`, JSON.stringify(updatedUserReports))

    // Update in allReports
    const allReports = JSON.parse(localStorage.getItem('allReports') || '[]')
    const updatedAllReports = allReports.map((r: any) => r.id === report.id ? updatedReport : r)
    localStorage.setItem('allReports', JSON.stringify(updatedAllReports))
    window.dispatchEvent(new CustomEvent('allReportsUpdated', { detail: { reason: 'appoint_doctor', reportId: report.id, doctorId } }))

    // Create consultation records
    const patientConsultations = JSON.parse(localStorage.getItem(`consultations_${report.userId}`) || '[]')
    const newConsultation = {
      id: `consultation_${report.id}_${doctorId}`,
      reportId: report.id,
      doctorId: selectedResponse.doctorId,
      doctorName: selectedResponse.doctorName,
      patientId: report.userId,
      patientName: user!.fullName,
      status: 'active',
      startedAt: new Date(),
      updatedAt: new Date(selectedResponse.respondedAt),
      createdAt: new Date(),
      lastMessage: {
        content: selectedResponse.advice,
        timestamp: new Date(selectedResponse.respondedAt),
        sender: 'doctor'
      },
      resps: [
        {
          doctorId: selectedResponse.doctorId,
          doctorName: selectedResponse.doctorName,
          advice: selectedResponse.advice,
          prescription: selectedResponse.prescription,
          respondedAt: new Date(selectedResponse.respondedAt)
        }
      ]
    }
    // Ensure report still exists (not hidden/deleted) before adding consultations
    const reportsKeyForPatient = `reports_${report.userId}`
    const hiddenKeyForPatient = `hiddenReports_Villager_${report.userId}`
    const allReportsForPatient = JSON.parse(localStorage.getItem(reportsKeyForPatient) || '[]')
    const hiddenIdsForPatient = JSON.parse(localStorage.getItem(hiddenKeyForPatient) || '[]')
    const visibleReportsForPatient = Array.isArray(hiddenIdsForPatient)
      ? allReportsForPatient.filter((r: any) => !hiddenIdsForPatient.includes(r.id))
      : allReportsForPatient
    const isReportVisible = visibleReportsForPatient.some((r: any) => r.id === report.id)

    if (isReportVisible) {
      // De-duplicate consultations for the same report and doctor
      const dedupPatient = Array.isArray(patientConsultations)
        ? patientConsultations.filter((c: any) => c.id !== newConsultation.id)
        : []
      localStorage.setItem(`consultations_${report.userId}`, JSON.stringify([newConsultation, ...dedupPatient]))

      const doctorConsultations = JSON.parse(localStorage.getItem(`consultations_doctor_${selectedResponse.doctorId}`) || '[]')
      const dedupDoctor = Array.isArray(doctorConsultations)
        ? doctorConsultations.filter((c: any) => c.id !== newConsultation.id)
        : []
      localStorage.setItem(`consultations_doctor_${selectedResponse.doctorId}`, JSON.stringify([newConsultation, ...dedupDoctor]))
    }

    // Broadcast consultations update for immediate UI refresh
    window.dispatchEvent(new CustomEvent('consultations_updated', { detail: { userId: report.userId, reportId: report.id, doctorId } }))

    // Seed initial chat history for the consultation
    const initialMessages = [
      {
        id: `${Date.now()}`,
        consultationId: newConsultation.id,
        senderId: selectedResponse.doctorId,
        senderName: selectedResponse.doctorName,
        role: 'doctor',
        content: selectedResponse.advice,
        timestamp: new Date(selectedResponse.respondedAt)
      }
    ]
    localStorage.setItem(`messages_${newConsultation.id}`, JSON.stringify(initialMessages))

    // Notify appointed doctor and admin
    try {
      NotificationService.sendUserNotification(
        selectedResponse.doctorId,
        'Appointment Assigned',
        `${user!.fullName} appointed you to their case (Report #${report.id}).`,
        'system',
        { reportId: report.id, patientId: report.userId, doctorId: selectedResponse.doctorId }
      )
      NotificationService.sendRoleNotification(
        'admin',
        'Appointment Assigned',
        `${user!.fullName} appointed Dr. ${selectedResponse.doctorName} to Report #${report.id}.`,
        'system',
        { reportId: report.id, patientId: report.userId, doctorId: selectedResponse.doctorId }
      )
      // Broadcast to all doctors to ensure shared visibility
      NotificationService.sendRoleNotification(
        'doctor',
        'Appointment Assigned',
        `${user!.fullName} appointed Dr. ${selectedResponse.doctorName} to Report #${report.id}.`,
        'system',
        { reportId: report.id, patientId: report.userId, doctorId: selectedResponse.doctorId }
      )
    } catch (e) {
      console.error('Failed to send notifications for appointment:', e)
    }

    setSnackbarMessage('Doctor appointed successfully')
    setSnackbarOpen(true)
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>Loading your reports...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('healthHistory')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your health reports and doctor consultations
          </Typography>
        </Box>

        {reports.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              No health reports yet
            </Typography>
            <Typography variant="body2">
              You haven't submitted any health reports. Click the button below to report your first health concern.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/villager/report')}
            >
              {t('reportHealth')}
            </Button>
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Total Reports: {reports.length}
            </Typography>
            
            <Grid container spacing={2}>
              {reports.map((report) => (
                <Grid item xs={12} key={report.id}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      border: report.urgency === 'emergency' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
                      '&:hover': { elevation: 4 }
                    }}
                  >
                    <CardContent>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {report.symptoms.length > 50 
                              ? `${report.symptoms.substring(0, 50)}...` 
                              : report.symptoms
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(report.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {report.urgency === 'emergency' && (
                            <Warning sx={{ color: getUrgencyColor(report.urgency) }} />
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
                          {/* Per-villager delete (soft delete) */}
                          <IconButton
                            aria-label="Delete"
                            color="error"
                            size="small"
                            onClick={() => openDeleteDialog(report.id)}
                            sx={{ ml: 1 }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Status and Location */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status.toUpperCase()}
                          color={getStatusColor(report.status) as any}
                          variant="outlined"
                        />
                        {report.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Location shared
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Expand/Collapse Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => toggleExpand(report.id)}
                          size="small"
                        >
                          {expandedReport === report.id ? <ExpandLess /> : <ExpandMore />}
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {expandedReport === report.id ? 'Show Less' : 'Show More'}
                          </Typography>
                        </IconButton>
                      </Box>

                      {/* Expanded Content */}
                      <Collapse in={expandedReport === report.id}>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Full Symptoms */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Symptoms:
                          </Typography>
                          <Typography variant="body2">
                            {report.symptoms}
                          </Typography>
                        </Box>

                        {/* Description */}
                        {report.description && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Description:
                            </Typography>
                            <Typography variant="body2">
                              {report.description}
                            </Typography>
                          </Box>
                        )}

                        {/* Location Details */}
                        {report.location && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Location:
                            </Typography>
                            <Typography variant="body2">
                              {report.location.address || `${report.location.latitude}, ${report.location.longitude}`}
                            </Typography>
                          </Box>
                        )}

                        {/* Doctor Responses List */}
                        {(report.responses && report.responses.length > 0) && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Doctor Responses:
                            </Typography>
                            {report.assignedDoctorId && (
                              <Alert severity="success" sx={{ mb: 2 }}>
                                Appointed Doctor: Dr. {report.assignedDoctorName}
                              </Alert>
                            )}
                            {report.responses.map((resp, idx) => (
                              <Box key={`${report.id}_resp_${idx}`} sx={{ p: 2, mb: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Dr. {resp.doctorName}</strong>
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  {resp.advice}
                                </Typography>
                                {resp.prescription && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Prescription:
                                    </Typography>
                                    <Typography variant="body2">
                                      {resp.prescription}
                                    </Typography>
                                  </Box>
                                )}
                                {resp.followUpDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    Follow-up: {formatDate(resp.followUpDate)}
                                  </Typography>
                                )}
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                  Responded on: {formatDate(resp.respondedAt)}
                                </Typography>
                                {!report.assignedDoctorId && (
                                  <Box sx={{ mt: 1 }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleAppointDoctor(report, resp.doctorId)}
                                    >
                                      Appoint Doctor
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/villager/report')}
            size="large"
          >
            {t('reportHealth')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/villager')}
            size="large"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
      {/* Delete confirmation modal */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        BackdropProps={{ sx: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0,0,0,0.3)' } }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 6, minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            This will hide the report from your view only.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={handleCancelDelete} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ borderRadius: 2 }}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Success toast at top-right with progress */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={TOAST_DURATION}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionProps={{ onExited: () => setToastProgress(0) }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontWeight: 500 }}>{snackbarMessage}</Typography>
            <LinearProgress variant="determinate" value={toastProgress} sx={{ height: 4, borderRadius: 2 }} />
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ReportsList