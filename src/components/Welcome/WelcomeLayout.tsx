import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Fab,
  LinearProgress,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material'
import { designTokens, navGlassEffect, glassButtonEffect } from '../../styles/theme'
import Footer from './Footer'

const WelcomeLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Features', path: '/features' },
    { label: 'Contact', path: '/contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
      setShowBackToTop(scrollTop > 300)
      setScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
              },
              backgroundColor: location.pathname === item.path ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Box sx={{ px: 2, pt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleNavigation('/login')}
            sx={{ mb: 1 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleNavigation('/register')}
          >
            Sign Up
          </Button>
        </Box>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={scrollProgress}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          height: 3,
          backgroundColor: 'transparent',
          '& .MuiLinearProgress-bar': {
            background: designTokens.colors.primary.gradient,
          },
        }}
      />

      {/* Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          ...navGlassEffect,
          transition: 'all 0.3s ease-in-out',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          background: scrolled 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: scrolled ? 'blur(30px)' : 'blur(20px)',
          WebkitBackdropFilter: scrolled ? 'blur(30px)' : 'blur(20px)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: designTokens.colors.primary.gradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => handleNavigation('/welcome')}
          >
            Village Health Monitor
          </Typography>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: location.pathname === item.path 
                      ? designTokens.colors.primary.main 
                      : designTokens.colors.neutral[700],
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="outlined"
                onClick={() => handleNavigation('/login')}
                sx={{
                  ...glassButtonEffect.primary,
                  minWidth: '100px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  ml: 2
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNavigation('/register')}
                sx={{
                  ...glassButtonEffect.secondary,
                  minWidth: '100px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                Sign Up
              </Button>
            </Box>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        <Outlet />
        <Footer />
      </Box>

      {/* Back to Top Button */}
      <Fab
        color="primary"
        size="medium"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'scale(1)' : 'scale(0)',
          transition: `all ${designTokens.animations.duration.normal} ${designTokens.animations.easing.easeInOut}`,
          background: designTokens.colors.primary.gradient,
          '&:hover': {
            background: designTokens.colors.primary.gradient,
            filter: 'brightness(1.1)',
            transform: 'scale(1.1)',
          },
        }}
      >
        <ArrowUpIcon />
      </Fab>
    </Box>
  )
}

export default WelcomeLayout