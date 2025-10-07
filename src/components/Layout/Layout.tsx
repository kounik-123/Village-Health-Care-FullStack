import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NotificationCenter from '../Notifications/NotificationCenter'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
  Report,
  Chat,
  History,
  Settings,
  Language
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null)
  
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { showToast } = useNotifications()
  // Recompute unread based on notifications to ensure UI stays accurate even if unreadCount is stale
  const computedUnread = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0
  const displayUnread = computedUnread ?? (typeof unreadCount === 'number' ? unreadCount : 0)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  // Notification menu controlled via NotificationCenter component

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    logout()
    showToast('Logout Successful', { severity: 'success', autoHideDuration: 3500 })
    navigate('/login')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
  }

  const getNavigationItems = () => {
    const baseItems = [
      { text: t('dashboard'), icon: <Dashboard />, path: `/${user?.role}` },
      { text: t('profile'), icon: <AccountCircle />, path: `/${user?.role}/profile` },
    ]

    switch (user?.role) {
      case 'villager':
        return [
          ...baseItems,
          { text: t('reportHealth'), icon: <Report />, path: '/villager/report' },
          { text: t('myReports'), icon: <History />, path: '/villager/reports' },
          { text: t('consultations'), icon: <Chat />, path: '/villager/consultations' },
        ]
      case 'doctor':
        return [
          ...baseItems,
          { text: t('patientReports'), icon: <Report />, path: '/doctor/reports' },
          { text: t('activeConsultations'), icon: <Chat />, path: '/doctor/consultations' },
          { text: t('medicalHistory'), icon: <History />, path: '/doctor/history' },
        ]
      case 'admin':
        return [
          ...baseItems,
          { text: 'Users', icon: <AccountCircle />, path: '/admin/users' },
          { text: 'Reports', icon: <Report />, path: '/admin/reports' },
          { text: 'Analytics', icon: <Settings />, path: '/admin/analytics' },
        ]
      default:
        return baseItems
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            🏥 Village Health - {user?.fullName}
          </Typography>

          <IconButton color="inherit" onClick={toggleLanguage}>
            <Language />
          </IconButton>

          <NotificationCenter />

          <IconButton
            edge="end"
            aria-label="account of current user"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.fullName.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Toolbar />
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {getNavigationItems().map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary={t('logout')} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate(`/${user?.role}/profile`)}>
          <AccountCircle sx={{ mr: 1 }} />
          {t('profile')}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          {t('logout')}
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{t('notifications')}</Typography>
          {displayUnread > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                markAsRead(notification.id)
                handleNotificationMenuClose()
              }}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                maxWidth: 350
              }}
            >
              <Typography variant="subtitle2" fontWeight={notification.read ? 'normal' : 'bold'}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.timestamp.toLocaleString()}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout