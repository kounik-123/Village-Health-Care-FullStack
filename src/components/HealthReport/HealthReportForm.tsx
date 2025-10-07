import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material'
import { Send, Warning } from '@mui/icons-material'
import LocationMap from '../Communication/LocationMap'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
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

const HealthReportForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    symptoms: '',
    description: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'emergency'
  })
  const [location, setLocation] = useState<{latitude: number, longitude: number, address?: string, text?: string} | null>(null)
  const [bounds, setBounds] = useState<[[number, number],[number, number]] | null>(null)
  const [manualLocation, setManualLocation] = useState('')
  const [geocodeTimer, setGeocodeTimer] = useState<number | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user } = useAuth()
  const { showToast } = useNotifications()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Check URL parameters for emergency
  useEffect(() => {
    if (searchParams.get('emergency') === 'true') {
      setFormData(prev => ({ ...prev, urgency: 'emergency' }))
    }
  }, [searchParams])

  // Auto-geocode when user types a location name - Enhanced for better real-time updates
  useEffect(() => {
    if (!manualLocation.trim()) {
      setLocation(null)
      setIsGeocoding(false)
      return
    }
    
    setIsGeocoding(true)
    
    if (geocodeTimer) {
      clearTimeout(geocodeTimer)
    }
    
    // Reduced debounce time for more responsive updates
    const timer = window.setTimeout(() => {
      geocodeManualLocation()
    }, 400)
    
    setGeocodeTimer(timer)
    return () => clearTimeout(timer)
  }, [manualLocation])

  const geocodeManualLocation = async () => {
    if (!manualLocation.trim()) {
      setIsGeocoding(false)
      return
    }
    
    // Helper to get device location quickly (for local bias)
    const getDeviceLocation = () => new Promise<{ lat: number; lon: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 5000 }
      )
    })

    // Helper to run a nominatim query with optional viewbox bias
    const trySearch = async (q: string, viewbox?: { south: number; west: number; north: number; east: number }) => {
      const params = new URLSearchParams({
        format: 'json',
        q,
        limit: '1',
        addressdetails: '1'
      })
      if (viewbox) {
        params.set('viewbox', `${viewbox.west},${viewbox.south},${viewbox.east},${viewbox.north}`)
        params.set('bounded', '1')
      }
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data[0]
      }
      return null
    }

    try {
      setIsGeocoding(true)

      // Clean up the input (remove parentheses & extra spaces)
      const cleaned = manualLocation.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
      const zipMatch = cleaned.match(/\b\d{5,6}\b/)
      const postal = zipMatch ? zipMatch[0] : ''

      // Prepare candidate queries (ordered by relevance)
      const candidates: string[] = []
      if (cleaned) candidates.push(cleaned)
      if (postal) candidates.push(postal)
      // Add global fallback with country context if missing
      if (!/\b(India|IN)\b/i.test(cleaned)) candidates.push(`${cleaned}, India`)

      // Try to get device location for local bias
      const userLoc = await getDeviceLocation()
      let best: any = null

      // If we have device location, search with a small viewbox around it first
      if (userLoc) {
        const delta = 0.35 // ~40km box
        const viewbox = {
          south: userLoc.lat - delta,
          west: userLoc.lon - delta,
          north: userLoc.lat + delta,
          east: userLoc.lon + delta
        }
        for (const q of candidates) {
          best = await trySearch(q, viewbox)
          if (best) break
        }
      }

      // Fallback: global search without viewbox
      if (!best) {
        for (const q of candidates) {
          best = await trySearch(q)
          if (best) break
        }
      }

      if (best) {
        const lat = parseFloat(best.lat)
        const lon = parseFloat(best.lon)
        setLocation({ 
          latitude: lat, 
          longitude: lon, 
          address: best.display_name, 
          text: cleaned 
        })
        // Parse boundingbox if available: [south, north, west, east]
        const bb = best?.boundingbox
        if (Array.isArray(bb) && bb.length === 4) {
          const south = parseFloat(bb[0])
          const north = parseFloat(bb[1])
          const west = parseFloat(bb[2])
          const east = parseFloat(bb[3])
          if ([south, north, west, east].every(v => Number.isFinite(v))) {
            setBounds([[south, west],[north, east]])
          } else {
            setBounds(null)
          }
        } else {
          setBounds(null)
        }
        setError('')
      } else {
        setBounds(null)
        setLocation(null)
        setError('Location not found. Try simplifying the address or include nearby city name.')
      }
    } catch (e: any) {
      setBounds(null)
      setLocation(null)
      setError(e?.message || 'Failed to find the location. Check your network connection.')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const newReport: HealthReport = {
        id: Date.now().toString(),
        userId: user!.id,
        symptoms: formData.symptoms,
        description: formData.description,
        urgency: formData.urgency,
        location: location || undefined,
        createdAt: new Date(),
        status: 'pending',
        responses: [],
        assignedDoctorId: undefined,
        assignedDoctorName: undefined
      }

      // Save to localStorage (in real app, this would be sent to backend)
      const existingReports = JSON.parse(localStorage.getItem(`reports_${user!.id}`) || '[]')
      const updatedReports = [newReport, ...existingReports]
      localStorage.setItem(`reports_${user!.id}`, JSON.stringify(updatedReports))

      // Also save to global reports for doctors to see
      const globalReports = JSON.parse(localStorage.getItem('allReports') || '[]')
      localStorage.setItem('allReports', JSON.stringify([newReport, ...globalReports]))
      window.dispatchEvent(new CustomEvent('allReportsUpdated', { detail: { reason: 'new_report', reportId: newReport.id } }))

      // Ensure this villager exists in Admin Dashboard 'users' store and is marked Active
      try {
        const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
        const idx = adminUsers.findIndex((u: any) => u.id === user!.id || u.email === user!.email)
        const existing = idx >= 0 ? adminUsers[idx] : null
        const adminUserEntry = {
          id: user!.id,
          fullName: user!.fullName,
          email: user!.email,
          role: user!.role,
          phoneNumber: user!.phoneNumber,
          village: (user as any).village,
          specialization: (user as any).specialization,
          licenseNumber: (user as any).licenseNumber,
          isActive: true, // submitting a report implies active session
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        if (idx >= 0) {
          adminUsers[idx] = { ...existing, ...adminUserEntry }
        } else {
          adminUsers.push(adminUserEntry)
        }
        localStorage.setItem('users', JSON.stringify(adminUsers))
        // Notify same-tab listeners to refresh Admin Dashboard immediately
        try { window.dispatchEvent(new Event('users_updated')) } catch {}
      } catch (e) {
        console.error('Failed to sync admin users on report submit:', e)
      }

      // Broadcast notifications: to all doctors and admin (role-scoped)
      const notifType = formData.urgency === 'emergency' ? 'emergency' : 'new_report'
      const message = `${user!.fullName} has submitted a ${formData.urgency} priority health report.`
      // Removed doctor role broadcast to ensure doctor-specific notifications only when appointed or assigned
      NotificationService.sendRoleNotification('admin', 'New Health Report', message, notifType, {
        reportId: newReport.id,
        patientId: user!.id,
        urgency: formData.urgency
      })
      // Also notify all doctors to ensure shared visibility while keeping per-account independence
      NotificationService.sendRoleNotification('doctor', 'New Health Report', message, notifType, {
        reportId: newReport.id,
        patientId: user!.id,
        urgency: formData.urgency
      })

      setSuccess(String(t('reportSubmitted')))
      showToast(String(t('reportSubmitted')), { severity: 'success', autoHideDuration: 3000 })
      
      // Reset form
      setFormData({
        symptoms: '',
        description: '',
        urgency: 'medium'
      })
      setLocation(null)

      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/villager')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Body Pain', 'Stomach Pain',
    'Diarrhea', 'Vomiting', 'Dizziness', 'Chest Pain', 'Breathing Difficulty'
  ]

  const urgencyColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    emergency: '#d32f2f'
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            {t('reportHealth')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please describe your symptoms and health concerns
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Quick Symptom Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Common Symptoms (Click to add)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonSymptoms.map((symptom) => (
                <Chip
                  key={symptom}
                  label={symptom}
                  onClick={() => {
                    const currentSymptoms = formData.symptoms
                    const newSymptoms = currentSymptoms 
                      ? `${currentSymptoms}, ${symptom}`
                      : symptom
                    setFormData(prev => ({ ...prev, symptoms: newSymptoms }))
                  }}
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          {/* Symptoms Input */}
          <TextField
            fullWidth
            label={t('symptoms')}
            multiline
            rows={3}
            value={formData.symptoms}
            onChange={handleChange('symptoms')}
            required
            sx={{ mb: 3 }}
            placeholder="Describe your symptoms (e.g., fever, headache, cough)"
          />

          {/* Description */}
          <TextField
            fullWidth
            label={t('description')}
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange('description')}
            sx={{ mb: 3 }}
            placeholder="Provide more details about your condition, when it started, etc."
          />

          {/* Urgency Level */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('urgency')}</InputLabel>
            <Select
              value={formData.urgency}
              onChange={handleChange('urgency')}
              label={t('urgency')}
            >
              <MenuItem value="low">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: urgencyColors.low }} />
                  {t('low')} - Can wait for regular consultation
                </Box>
              </MenuItem>
              <MenuItem value="medium">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: urgencyColors.medium }} />
                  {t('medium')} - Need consultation soon
                </Box>
              </MenuItem>
              <MenuItem value="high">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: urgencyColors.high }} />
                  {t('high')} - Need urgent attention
                </Box>
              </MenuItem>
              <MenuItem value="emergency">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ color: urgencyColors.emergency }} />
                  {t('emergency')} - Life threatening
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Enter Location */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Enter your location"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Type a place name (e.g., Barasat, Gobardanga, Kolkata)"
              helperText={
                isGeocoding 
                  ? "Searching for location..." 
                  : location 
                    ? `✓ Found: ${location.text}` 
                    : "Enter a place name to see it on the map"
              }
              InputProps={{
                endAdornment: isGeocoding ? <CircularProgress size={20} /> : null
              }}
            />
            
            {/* Real-time Map Display */}
            {location && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  📍 {location.address || `${location.text} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`}
                </Typography>
                <LocationMap 
                  latitude={location.latitude} 
                  longitude={location.longitude} 
                  address={location.address || location.text} 
                  bounds={bounds ?? undefined}
                  onLocationChange={(loc) => {
                    setLocation({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      address: loc.address,
                      text: loc.text || manualLocation.trim()
                    })
                    // Clear bounds so map uses setView for device location
                    setBounds(null)
                    if (loc.text) {
                      setManualLocation(loc.text)
                    }
                  }}
                />
              </Box>
            )}
            
            {/* Show helpful message when no location is entered */}
            {!manualLocation.trim() && !location && (
              <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  💡 Enter your location to help doctors understand your area and provide better assistance
                </Typography>
              </Box>
            )}
          </Box>

          {/* Submit Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/villager')}
                size="large"
              >
                {t('cancel')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !formData.symptoms}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                size="large"
                sx={{
                  bgcolor: formData.urgency === 'emergency' ? urgencyColors.emergency : undefined
                }}
              >
                {loading ? 'Submitting...' : t('submit')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default HealthReportForm