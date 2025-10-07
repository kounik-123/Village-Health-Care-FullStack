import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import {
  Chat,
  VideoCall,
  Phone,
  Schedule,
  CheckCircle,
  Person,
  AccessTime,
  LocalHospital
} from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import CallModal from './CallModal'
import { useAuth } from '../../contexts/AuthContext'

interface Consultation {
  id: string
  reportId: string
  doctorId: string
  doctorName: string
  doctorSpecialization?: string
  patientId: string
  patientName: string
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
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [callMode, setCallMode] = useState<null | 'voice' | 'video'>(null)

  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    loadConsultations()
  }, [user])

  const loadConsultations = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(`consultations_${user!.id}`) || '[]')
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

      setConsultations(parsed.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('Error loading consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  // status helpers are defined below with typed status

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleStartChat = (consultation: Consultation) => {
    navigate(`/chat/${consultation.id}`)
  }

  const handleVideoCall = (consultation: Consultation) => {
    void consultation
    setCallMode('video')
  }

  const handleVoiceCall = (consultation: Consultation) => {
    void consultation
    setCallMode('voice')
  }

  const getStatusColor = (status: Consultation['status']) => {
    switch (status) {
      case 'active':
        return 'primary'
      case 'scheduled':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: Consultation['status']) => {
    switch (status) {
      case 'active':
        return <Chat />
      case 'scheduled':
        return <Schedule />
      case 'completed':
        return <CheckCircle />
      default:
        return <Chat />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>Loading consultations...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            <LocalHospital sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('consultations')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your consultations with doctors
          </Typography>
        </Box>

        {consultations.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              No consultations yet
            </Typography>
            <Typography variant="body2">
              Once a doctor responds to your health report, you'll be able to communicate with them here.
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
              Active Consultations: {consultations.filter(c => c.status === 'active').length}
            </Typography>
            
            <List>
              {consultations.map((consultation, index) => (
                <React.Fragment key={consultation.id}>
                  <ListItem
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: consultation.status === 'active' ? '#f3e5f5' : 'background.paper'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            Dr. {consultation.doctorName}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(consultation.status)}
                            label={consultation.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(consultation.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {consultation.doctorSpecialization && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {consultation.doctorSpecialization}
                            </Typography>
                          )}
                          
                          {consultation.lastMessage && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="body2" gutterBottom>
                                <strong>Last message:</strong>
                              </Typography>
                              <Typography variant="body2">
                                {consultation.lastMessage.content.length > 100
                                  ? `${consultation.lastMessage.content.substring(0, 100)}...`
                                  : consultation.lastMessage.content
                                }
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {formatDate(consultation.lastMessage.timestamp)}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption">
                                Started: {formatDate(consultation.createdAt)}
                              </Typography>
                            </Box>
                            {consultation.completedAt && (
                              <Typography variant="caption" color="success.main">
                                Completed: {formatDate(consultation.completedAt)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {consultation.status === 'active' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Start Chat">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStartChat(consultation)}
                                aria-label="Start Chat"
                              >
                                <Chat />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleVoiceCall(consultation)}
                              aria-label="Voice Call"
                            >
                              <Phone />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleVideoCall(consultation)}
                              aria-label="Video Call"
                            >
                              <VideoCall />
                            </IconButton>
                          </Box>
                        )}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/villager/reports`)}
                        >
                          View Report
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < consultations.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
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
      <CallModal open={!!callMode} mode={callMode || 'voice'} onClose={() => setCallMode(null)} />
    </Container>
  )
}

export default ConsultationsList