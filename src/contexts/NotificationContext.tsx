import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import NotificationService from '../services/NotificationService'
import type { AppNotification } from '../services/NotificationService'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'LOAD_NOTIFICATIONS'; payload: AppNotification[] }

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      }
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      )
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, read: true }))
      return {
        notifications: allReadNotifications,
        unreadCount: 0
      }
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      }
    
    case 'LOAD_NOTIFICATIONS':
      return {
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      }
    
    default:
      return state
  }
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  showToast: (message: string, options?: { severity?: 'success' | 'info' | 'warning' | 'error', autoHideDuration?: number }) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export type { AppNotification } from '../services/NotificationService'
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user } = useAuth()

  // Toast state
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success')
  const [toastDuration, setToastDuration] = useState<number>(3000)

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`notifications_${user.id}`)
      if (stored) {
        try {
          const notifications = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
          dispatch({ type: 'LOAD_NOTIFICATIONS', payload: notifications })
        } catch (error) {
          console.error('Error loading notifications:', error)
        }
      } else {
        // Initialize empty store per-user to avoid mixing states
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]))
      }
    }
  }, [user])

  // Save notifications to localStorage whenever they change (even when empty)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(state.notifications))
    }
  }, [state.notifications, user])

  // Subscribe to notification service
  useEffect(() => {
    if (!user) return

    const unsubscribe = NotificationService.subscribe((notification) => {
      // Accept notifications targeted to current user ID or current user role
      const isCurrentUser = notification.userId === user.id
      const isRoleBroadcast = notification.userId === user.role
      
      if (isCurrentUser || isRoleBroadcast) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
        NotificationService.showBrowserNotification(notification)
        NotificationService.playNotificationSound(notification.type)
      }
    })

    // Start monitoring for the user's role and id
    NotificationService.startMonitoring(user.role, user.id)

    // Request notification permission
    NotificationService.requestNotificationPermission()

    return () => {
      unsubscribe()
      NotificationService.stopMonitoring()
    }
  }, [user])

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
  }

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  const clearNotifications = () => {
    dispatch({ type: 'LOAD_NOTIFICATIONS', payload: [] })
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]))
    }
  }

  const showToast: NotificationContextType['showToast'] = (message, options) => {
    setToastMessage(message)
    setToastSeverity(options?.severity || 'success')
    setToastDuration(options?.autoHideDuration ?? 3000)
    setToastOpen(true)
  }

  const handleToastClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setToastOpen(false)
  }

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    showToast
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Global Toast Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={toastDuration}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={(props) => <Slide {...props} direction="left" />}
        sx={{ zIndex: (theme) => theme.zIndex.snackbar, mr: 2, mt: 2 }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
          sx={{
            width: '100%',
            color: '#fff',
            boxShadow: 6,
            borderRadius: 2,
            backdropFilter: 'blur(4px)',
            background: toastSeverity === 'success'
              ? 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
              : undefined
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}