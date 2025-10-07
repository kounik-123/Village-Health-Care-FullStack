import React, { useState, useEffect } from 'react'
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  Warning,
  Info,
  CheckCircle,
  Person,
  Clear,
  MarkEmailRead,
} from '@mui/icons-material'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

const NotificationCenter: React.FC = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    clearNotifications()
    handleClose()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Warning color="error" />
      case 'new_report':
        return <Info color="info" />
      case 'consultation':
        return <Person color="primary" />
      case 'system':
        return <CheckCircle color="success" />
      default:
        return <Info color="info" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return '#ffebee'
      case 'new_report':
        return '#e3f2fd'
      case 'consultation':
        return '#f3e5f5'
      case 'system':
        return '#e8f5e8'
      default:
        return '#f5f5f5'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('notifications.justNow')
    if (minutes < 60) return t('notifications.minutesAgo', { count: minutes })
    if (hours < 24) return t('notifications.hoursAgo', { count: hours })
    return t('notifications.daysAgo', { count: days })
  }

  // Auto-refresh notifications every 30 seconds for doctors
  useEffect(() => {
    if (user?.role === 'doctor') {
      const interval = setInterval(() => {
        // Simulate receiving new notifications
        // Placeholder for real-time updates; integrate with backend later
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

  // Recompute unread from notifications to ensure badge updates reliably
  const computedUnread = Array.isArray(notifications)
    ? notifications.filter(n => !n.read).length
    : 0
  const safeUnread = typeof unreadCount === 'number' ? unreadCount : 0
  const displayUnread = computedUnread ?? safeUnread
  const badgeContent = displayUnread > 0 ? displayUnread : undefined

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={badgeContent} color="error">
          {displayUnread > 0 ? <NotificationsActive /> : <Notifications />}
         </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {t('notifications.title')}
            </Typography>
            <Box>
              {displayUnread > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  startIcon={<MarkEmailRead />}
                >
                  {t('notifications.markAllRead')}
                </Button>
              )}
              <IconButton size="small" onClick={handleClearAll}>
                <Clear />
              </IconButton>
            </Box>
          </Box>
          {displayUnread > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('notifications.unreadCount', { count: displayUnread })}
            </Typography>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('notifications.noNotifications')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : getNotificationColor(notification.type),
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: notification.read ? '#f5f5f5' : getNotificationColor(notification.type),
                    }
                  }}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                        {notification.type === 'emergency' && (
                          <Chip label="Emergency" size="small" color="error" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}

export default NotificationCenter