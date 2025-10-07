import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material'
import { VideoCall, Call, Chat, Person, Schedule } from '@mui/icons-material'
import CallModal from '../Communication/CallModal'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface Consultation {
  id: string
  reportId: string
  doctorId: string
  doctorName: string
  doctorSpecialization?: string
  patientId?: string
  patientName?: string
  status: 'active' | 'scheduled' | 'completed'
  createdAt: Date
  lastMessage?: {
    content: string
    timestamp: Date
    sender: 'doctor' | 'patient'
  }
  scheduledAt?: Date
  completedAt?: Date
}

const ConsultationsList: React.FC = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState<Consultation[]>([])

  useEffect(() => {
    const loadConsultations = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(`consultations_${user!.id}`) || '[]')
        // Build visible report set for villager
        const reportsKey = `reports_${user!.id}`
        const hiddenKey = `hiddenReports_Villager_${user!.id}`
        const allReports = JSON.parse(localStorage.getItem(reportsKey) || '[]')
        const hiddenIds = JSON.parse(localStorage.getItem(hiddenKey) || '[]')
        const visibleReports = Array.isArray(hiddenIds)
          ? allReports.filter((r: any) => !hiddenIds.includes(r.id))
          : allReports
        const visibleReportIds = new Set(visibleReports.map((r: any) => r.id))

        const parsed: Consultation[] = stored.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          lastMessage: c.lastMessage ? {
            ...c.lastMessage,
            timestamp: new Date(c.lastMessage.timestamp)
          } : undefined,
          scheduledAt: c.scheduledAt ? new Date(c.scheduledAt) : undefined,
          completedAt: c.completedAt ? new Date(c.completedAt) : undefined
        }))
        // Show ONLY active consultations tied to existing visible reports and de-duplicate by id
        const active = parsed.filter(c => c.status === 'active' && visibleReportIds.has(c.reportId))
        const uniqueById = Array.from(new Map(active.map(c => [c.id, c])).values())
        setConsultations(uniqueById.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

        // Cleanup orphan active consultations not tied to any current report
        try {
          if (Array.isArray(stored)) {
            const cleaned = stored.filter((c: any) => visibleReportIds.has(c.reportId) || c.status !== 'active')
            localStorage.setItem(`consultations_${user!.id}`, JSON.stringify(cleaned))
          }
        } catch {}
      } catch (e) {
        console.error('Error loading consultations:', e)
        setConsultations([])
      }
    }

    if (user) {
      loadConsultations()
    }

    // Listen to consultation updates and storage changes
    const onUpdated = () => loadConsultations()
    window.addEventListener('consultations_updated', onUpdated as EventListener)
    window.addEventListener('storage', onUpdated as EventListener)
    return () => {
      window.removeEventListener('consultations_updated', onUpdated as EventListener)
      window.removeEventListener('storage', onUpdated as EventListener)
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'scheduled':
        return 'warning'
      case 'completed':
        return 'default'
      default:
        return 'default'
    }
  }

  const [callOpen, setCallOpen] = useState<{ mode: 'voice' | 'video' } | null>(null)
  const handleVideoCall = (consultationId: string) => {
    void consultationId
    setCallOpen({ mode: 'video' })
  }

  const handleVoiceCall = (consultationId: string) => {
    void consultationId
    setCallOpen({ mode: 'voice' })
  }

  const handleChat = (consultationId: string) => {
    navigate(`/chat/${consultationId}`)
  }

  if (consultations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('dashboard.noConsultations')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/villager/report')}
          sx={{ mt: 2 }}
        >
          {t('dashboard.submitHealthReport')}
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.myConsultations')}
      </Typography>

      <List>
        {consultations.map((consultation, index) => (
          <React.Fragment key={consultation.id}>
            <ListItem
              sx={{
                p: 0,
                mb: 2,
              }}
            >
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        Dr. {consultation.doctorName}
                      </Typography>
                      {consultation.doctorSpecialization && (
                        <Typography variant="body2" color="text.secondary">
                          {consultation.doctorSpecialization}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={t(`dashboard.${consultation.status}`)}
                      color={getStatusColor(consultation.status) as any}
                      size="small"
                    />
                  </Box>

                  {/* Symptoms omitted: not available in new consultation schema */}

                  {consultation.lastMessage && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {consultation.lastMessage.content}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {consultation.createdAt.toLocaleDateString()} {consultation.createdAt.toLocaleTimeString()}
                    </Typography>

                    <Box>
                      <Tooltip title={t('dashboard.chat') as string}>
                        <IconButton
                          color="primary"
                          onClick={() => handleChat(consultation.id)}
                          aria-label={t('dashboard.chat') as string}
                        >
                          <Chat />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('dashboard.voiceCall') as string}>
                        <IconButton
                          color="primary"
                          onClick={() => handleVoiceCall(consultation.id)}
                          aria-label={t('dashboard.voiceCall') as string}
                        >
                          <Call />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('dashboard.videoCall') as string}>
                        <IconButton
                          color="primary"
                          onClick={() => handleVideoCall(consultation.id)}
                          aria-label={t('dashboard.videoCall') as string}
                        >
                          <VideoCall />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
            {index < consultations.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <CallModal open={!!callOpen} mode={(callOpen?.mode || 'voice')} onClose={() => setCallOpen(null)} />
      <Typography variant="h6" gutterBottom>
        Active Consultations: {consultations.length}
      </Typography>
    </Box>
  )
}

export default ConsultationsList