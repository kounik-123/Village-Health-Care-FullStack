import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  HealthAndSafety,
  Notifications,
  Analytics,
  Security,
  People,
  LocationOn,
  Phone,
  CheckCircle,
  Schedule,
  TrendingUp,
  Rocket,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import AnimatedSection from './AnimatedSection'
import TypingAnimation from './TypingAnimation'
import CountingAnimation from './CountingAnimation'
import Timeline from './Timeline'
import { designTokens, glassEffect } from '../../styles/theme'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const features = [
    {
      icon: <HealthAndSafety />,
      title: 'Health Monitoring',
      description: 'Real-time health tracking and monitoring for rural communities with instant alerts and comprehensive reporting.',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <Notifications />,
      title: 'Smart Alerts',
      description: 'Intelligent notification system that connects patients with healthcare providers instantly during emergencies.',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <Analytics />,
      title: 'Data Analytics',
      description: 'Advanced analytics and insights to help healthcare providers make informed decisions and track community health trends.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <Security />,
      title: 'Secure Platform',
      description: 'End-to-end encryption and secure data handling to protect sensitive health information and maintain privacy.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <People />,
      title: 'Community Care',
      description: 'Connecting rural communities with qualified healthcare professionals through our comprehensive telemedicine platform.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <LocationOn />,
      title: 'Location Services',
      description: 'GPS-enabled emergency response system that helps healthcare providers locate patients quickly during critical situations.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    },
    {
      icon: <Phone />,
      title: '24/7 Support',
      description: 'Round-the-clock medical support and consultation services available to all registered community members.',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=center',
    },
  ]

  const stats = [
    { number: 10000, suffix: '+', label: 'Patients Served' },
    { number: 500, suffix: '+', label: 'Healthcare Providers' },
    { number: 50, suffix: '+', label: 'Villages Connected' },
    { number: 99, suffix: '%', label: 'Uptime Reliability' },
  ]

  const timelineItems = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'Village Health Monitor was founded with a mission to bridge the healthcare gap in rural communities through innovative technology solutions.',
      icon: <Rocket />,
      color: designTokens.colors.primary.main,
    },
    {
      year: '2021',
      title: 'First Deployment',
      description: 'Successfully deployed our platform in 10 rural villages, connecting over 1,000 patients with qualified healthcare providers.',
      icon: <CheckCircle />,
      color: designTokens.colors.secondary.main,
    },
    {
      year: '2022',
      title: 'Rapid Growth',
      description: 'Expanded to 25 villages and introduced AI-powered health analytics, serving over 5,000 patients with 24/7 monitoring capabilities.',
      icon: <TrendingUp />,
      color: designTokens.colors.accent.main,
    },
    {
      year: '2023',
      title: 'Innovation Continues',
      description: 'Launched telemedicine services and emergency response system, now serving 50+ villages with 10,000+ registered patients.',
      icon: <Schedule />,
      color: designTokens.colors.primary.main,
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${designTokens.colors.primary.main}15 0%, ${designTokens.colors.secondary.main}15 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4, pl: { xs: 0, md: 0 }, pr: { xs: 0, md: 6 } }}>
                <Typography
                  variant={isMobile ? 'h3' : 'h1'}
                  component="h1"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: designTokens.colors.primary.main,
                    background: designTokens.colors.primary.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    // Fallback for browsers that don't support gradient text
                    '@supports not (background-clip: text)': {
                      color: designTokens.colors.primary.main,
                      background: 'none',
                    },
                    // Ensure text is visible on all browsers
                    textShadow: '0 0 1px rgba(46, 125, 50, 0.3)',
                  }}
                >
                  Connecting Rural Communities to
                </Typography>
                <TypingAnimation
                  texts={['Quality Healthcare', 'Medical Experts', 'Emergency Services', 'Health Monitoring']}
                  variant={isMobile ? 'h4' : 'h2'}
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: designTokens.colors.secondary.main,
                    minHeight: isMobile ? '60px' : '80px',
                    lineHeight: 1.2,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: designTokens.colors.neutral[600],
                    lineHeight: 1.6,
                    maxWidth: '500px',
                  }}
                >
                  Empowering rural communities with accessible healthcare through innovative technology, 
                  real-time monitoring, and expert medical consultation services.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/welcome/features')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: designTokens.colors.primary.gradient,
                      '&:hover': {
                        background: designTokens.colors.primary.gradient,
                        filter: 'brightness(1.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderColor: designTokens.colors.primary.main,
                      color: designTokens.colors.primary.main,
                      '&:hover': {
                        backgroundColor: `${designTokens.colors.primary.main}10`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  pl: { xs: 0, md: 8 },
                  ml: { xs: 0, md: 4 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: 20,
                    bottom: 20,
                    background: designTokens.colors.primary.gradient,
                    borderRadius: designTokens.borderRadius.xl,
                    opacity: 0.1,
                    transform: 'rotate(3deg)',
                  },
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&crop=center"
                  alt="Doctor treating villagers in rural healthcare setting"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: designTokens.borderRadius.lg,
                    boxShadow: designTokens.shadows.strong,
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <AnimatedSection background="light" animation="fadeInUp">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <CountingAnimation
                  end={stat.number}
                  suffix={stat.suffix}
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: designTokens.colors.primary.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{ color: designTokens.colors.neutral[600] }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AnimatedSection>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <AnimatedSection
          key={index}
          background={index % 2 === 0 ? 'default' : 'light'}
          animation={index % 2 === 0 ? 'slideInLeft' : 'slideInRight'}
          delay={index * 100}
        >
          <Grid
            container
            spacing={6}
            alignItems="center"
            direction={index % 2 === 0 ? 'row' : 'row-reverse'}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    background: designTokens.colors.primary.gradient,
                    fontSize: '2rem',
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: designTokens.colors.neutral[800],
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: designTokens.colors.neutral[600],
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: designTokens.colors.primary.main,
                    color: designTokens.colors.primary.main,
                    '&:hover': {
                      backgroundColor: `${designTokens.colors.primary.main}10`,
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...glassEffect,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: designTokens.shadows.strong,
                  },
                }}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        </AnimatedSection>
      ))}

      {/* Timeline Section */}
      <AnimatedSection
        background="light"
        animation="fadeInUp"
        title="Our Journey"
        subtitle="From a simple idea to transforming healthcare in rural communities"
      >
        <Timeline items={timelineItems} />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection
        background="gradient"
        animation="pulse"
        title="Ready to Transform Healthcare in Your Community?"
        subtitle="Join thousands of healthcare providers and patients who trust Village Health Monitor for their medical needs."
      >
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: designTokens.colors.primary.gradient,
              '&:hover': {
                background: designTokens.colors.primary.gradient,
                filter: 'brightness(1.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Get Started Today
          </Button>
        </Box>
      </AnimatedSection>
    </Box>
  )
}

export default Home