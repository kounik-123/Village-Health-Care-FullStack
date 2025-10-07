import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { 
  Language, 
  Visibility, 
  VisibilityOff, 
  PersonOutline,
  MedicalServices,
  AdminPanelSettings,
  Login as LoginIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { designTokens, glassEffect, glassButtonEffect } from '../../styles/theme'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { showToast } = useNotifications()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const roleIcons = {
    villager: <PersonOutline />,
    doctor: <MedicalServices />,
    admin: <AdminPanelSettings />,
  }

  const roleColors = {
    villager: designTokens.colors.primary.main,
    doctor: designTokens.colors.secondary.main,
    admin: designTokens.colors.accent.main,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      
      // Show login success toast
      showToast('Login Successful', { severity: 'success', autoHideDuration: 3500 })
      
      // Navigate based on user role (will be handled by the auth context)
      const user = JSON.parse(localStorage.getItem('villageHealthUser') || '{}')
      switch (user.role) {
        case 'villager':
          navigate('/villager')
          break
        case 'doctor':
          navigate('/doctor')
          break
        case 'admin':
          navigate('/admin')
          break
        default:
          navigate('/login')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${designTokens.colors.primary.main}15 0%, ${designTokens.colors.secondary.main}15 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="lg">
        {/* Language Selector */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <FormControl size="small">
            <InputLabel>Language</InputLabel>
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              startAdornment={<Language />}
              sx={{
                borderRadius: designTokens.borderRadius.md,
                ...glassEffect,
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिंदी</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={6} alignItems="center">
          {/* Left Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              ...glassEffect, 
              maxWidth: 500, 
              mx: 'auto',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      background: designTokens.colors.primary.gradient,
                      fontSize: '2rem',
                    }}
                  >
                    🏥
                  </Avatar>
                  <Typography 
                    component="h1" 
                    variant="h4" 
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      background: designTokens.colors.primary.gradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Village Health Monitor
                  </Typography>
                  <Typography variant="h6" sx={{ color: designTokens.colors.neutral[600] }}>
                    {t('welcome')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: designTokens.colors.neutral[700] }}>
                    {t('login')} to access healthcare services
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: designTokens.borderRadius.md,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={t('email')}
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: designTokens.borderRadius.md,
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: designTokens.borderRadius.md,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={loading ? null : <LoginIcon />}
                    sx={{ 
                      ...glassButtonEffect.secondary,
                      mt: 2, 
                      mb: 3, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:disabled': {
                        background: designTokens.colors.neutral[300],
                        opacity: 0.6,
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('login')}
                  </Button>
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        style={{ 
                          textDecoration: 'none', 
                          color: designTokens.colors.primary.main,
                          fontWeight: 500,
                        }}
                      >
                        {t('register')}
                      </Link>
                    </Typography>
                  </Box>

                  {/* Demo Credentials */}
                  <Card sx={{ mt: 3, ...glassEffect }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: designTokens.colors.neutral[700],
                          mb: 2,
                        }}
                      >
                        Demo Credentials:
                      </Typography>
                      <Grid container spacing={1}>
                        {[
                          { role: 'villager', email: 'villager@test.com', label: 'Villager' },
                          { role: 'doctor', email: 'doctor@test.com', label: 'Doctor' },
                          { role: 'admin', email: 'admin@test.com', label: 'Admin' },
                        ].map((demo) => (
                          <Grid item xs={12} key={demo.role}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                p: 1,
                                borderRadius: designTokens.borderRadius.small,
                                '&:hover': {
                                  backgroundColor: `${roleColors[demo.role as keyof typeof roleColors]}10`,
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  mr: 1,
                                  backgroundColor: roleColors[demo.role as keyof typeof roleColors],
                                  fontSize: '0.8rem',
                                }}
                              >
                                {roleIcons[demo.role as keyof typeof roleIcons]}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: designTokens.colors.neutral[600] }}>
                                {demo.label}: {demo.email} / password
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Animated Mockup */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Card
                sx={{
                  ...glassEffect,
                  overflow: 'hidden',
                  maxWidth: 400,
                  mx: 'auto',
                  '&:hover': {
                    transform: 'translateY(-8px) rotateY(5deg)',
                    boxShadow: designTokens.shadows.strong,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Village Health Monitor Dashboard"
                  style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                  }}
                />
              </Card>
              <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  color: designTokens.colors.neutral[700],
                  fontWeight: 500,
                }}
              >
                Access Your Healthcare Dashboard
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: designTokens.colors.neutral[600],
                  maxWidth: 300,
                  mx: 'auto',
                }}
              >
                Monitor health, connect with doctors, and manage your healthcare journey
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Login