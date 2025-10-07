// Define Notification interface locally to avoid circular dependency
export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'emergency' | 'new_report' | 'consultation' | 'system'
  timestamp: Date
  read: boolean
  userId: string
  data?: any
}

export class NotificationService {
  private static instance: NotificationService
  private listeners: ((notification: AppNotification) => void)[] = []
  private intervalId: number | null = null

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notifications
  subscribe(callback: (notification: AppNotification) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Emit notification to all subscribers
  private emit(notification: AppNotification) {
    this.listeners.forEach(listener => listener(notification))
  }

  // PUBLIC: Send a notification to all users with a given role (e.g., 'doctor', 'admin')
  sendRoleNotification(role: string, title: string, message: string, type: AppNotification['type'], data?: any) {
    // Fan-out to all users with the target role and persist per-user
    try {
      const usersList = JSON.parse(localStorage.getItem('users') || '[]')
      const registered = JSON.parse(localStorage.getItem('villageHealthRegisteredUsers') || '[]')
      // Combine both sources to ensure we target ALL users of the role, not only currently active ones
      const combined = ([] as any[]).concat(Array.isArray(usersList) ? usersList : [], Array.isArray(registered) ? registered : [])
      const seen = new Set<string>()
      const deduped = combined.filter((u: any) => {
        const key = (u && (u.id || u.email)) as string | undefined
        if (!key) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      const targets = deduped.filter((u: any) => u && u.role === role)

      // If no targets found, still emit a role-scoped notification for online listeners
      if (targets.length === 0) {
        const notification: AppNotification = {
          id: `${role}-${Date.now()}`,
          title,
          message,
          type,
          timestamp: new Date(),
          read: false,
          userId: role,
          data: data || {}
        }
        this.emit(notification)
        return
      }

      // Send to each target user and persist (per-account independence)
      targets.forEach((u: any) => {
        const targetId = u.id || u.email // prefer id, fallback to email
        if (!targetId) return
        this.sendUserNotification(targetId, title, message, type, data)
      })
    } catch (e) {
      console.error('Failed to send role notifications:', e)
    }
  }

  // PUBLIC: Send a notification to a specific user by ID (e.g., villager userId)
  sendUserNotification(userId: string, title: string, message: string, type: AppNotification['type'], data?: any) {
    const notification: AppNotification = {
      id: `${userId}-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      userId,
      data: data || {}
    }
    // Persist to the user's notification store
    try {
      const key = `notifications_${userId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const next = [notification, ...existing]
      localStorage.setItem(key, JSON.stringify(next))
    } catch (e) {
      console.error('Failed to persist user notification:', e)
    }
    // Emit to live subscribers
    this.emit(notification)
  }

  // Start monitoring for updates (simulates real-time updates)
  startMonitoring(userRole: string, userId?: string) {
    if (this.intervalId) return // Already monitoring

    this.intervalId = window.setInterval(() => {
      if (userRole === 'doctor') {
        // Doctor-specific monitoring: pass doctorId to ensure per-doctor state
        this.checkForNewReports(userId)
      }
      if (userRole === 'villager' && userId) {
        this.checkForReportUpdates(userId)
      }
    }, 10000) // Check every 10 seconds
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // Check for new health reports and notify doctors (per-doctor when doctorId provided)
  private checkForNewReports(doctorId?: string) {
    // Read from the shared store that the app actually uses
    const reports = JSON.parse(localStorage.getItem('allReports') || '[]')

    // Track last check to avoid duplicate notifications across intervals
    const lastCheckKey = doctorId ? `lastDoctorNotificationCheck_${doctorId}` : 'lastNotificationCheck'
    const lastCheck = localStorage.getItem(lastCheckKey)
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0)

    const newReports = reports.filter((report: any) => {
      // Use createdAt which is set by HealthReportForm
      const createdAt = report.createdAt ? new Date(report.createdAt) : null
      if (!createdAt) return false
      // Only consider reports with no doctor responses yet
      const hasResponses = Array.isArray(report.responses) && report.responses.length > 0
      // If doctorId provided, only include reports assigned to that doctor
      const assignedToDoctor = doctorId ? report.assignedDoctorId === doctorId : true
      return createdAt > lastCheckTime && !hasResponses && assignedToDoctor
    })

    newReports.forEach((report: any) => {
      const title = report.urgency === 'emergency' ? 'Emergency Health Report!' : 'New Health Report'
      const message = `${report.userName || report.patientName || 'A villager'} reported: ${
        Array.isArray(report.symptoms) ? report.symptoms.slice(0, 2).join(', ') : String(report.symptoms || '').split(',').slice(0, 2).join(', ')
      }${Array.isArray(report.symptoms) && report.symptoms.length > 2 ? '...' : ''}`
      const type: AppNotification['type'] = report.urgency === 'emergency' ? 'emergency' : 'new_report'
      if (doctorId && report.assignedDoctorId === doctorId) {
        // Target the specific assigned doctor
        this.sendUserNotification(doctorId, title, message, type, {
          reportId: report.id,
          patientId: report.userId,
          urgency: report.urgency
        })
      } else if (!doctorId) {
        // Fallback: broadcast to all doctors (legacy behaviour)
        this.sendRoleNotification('doctor', title, message, type, {
          reportId: report.id,
          patientId: report.userId,
          urgency: report.urgency
        })
      }
    })

    // Update last check time
    localStorage.setItem(lastCheckKey, new Date().toISOString())
  }

  // Check for doctor responses/deletions for a given patient's reports and notify the patient
  private checkForReportUpdates(patientId: string) {
    const reports = JSON.parse(localStorage.getItem('allReports') || '[]')
    const key = `lastPatientNotificationCheck_${patientId}`
    const lastCheck = localStorage.getItem(key)
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0)

    const patientReports = reports.filter((r: any) => r.userId === patientId)

    // Find new doctor responses since last check
    const newResponses: Array<{ report: any; response: any }> = []
    patientReports.forEach((report: any) => {
      const responses = Array.isArray(report.responses) ? report.responses : []
      responses.forEach((resp: any) => {
        // Prefer respondedAt, fallback to createdAt if present
        const respTime = resp.respondedAt
          ? new Date(resp.respondedAt)
          : (resp.createdAt ? new Date(resp.createdAt) : null)
        if (respTime && respTime > lastCheckTime) {
          newResponses.push({ report, response: resp })
        }
      })
    })

    newResponses.forEach(({ report, response }) => {
      this.sendUserNotification(
        patientId,
        'Doctor Response',
        `Dr. ${response.doctorName || 'Doctor'}: ${response.advice || response.message || 'New update'}`,
        'consultation',
        {
          reportId: report.id,
          doctorName: response.doctorName || 'Doctor',
          advicePreview: response.advice || undefined,
          responseId: response.id || undefined
        }
      )
    })

    // Note: Appointment deletions are already handled via direct sendUserNotification in DoctorDashboard

    localStorage.setItem(key, new Date().toISOString())
  }

  // Send notification for consultation updates (to a specific patient)
  sendConsultationNotification(patientId: string, doctorName: string, message: string) {
    const notification: AppNotification = {
      id: `consultation-${Date.now()}`,
      title: 'Doctor Response',
      message: `Dr. ${doctorName}: ${message}`,
      type: 'consultation',
      timestamp: new Date(),
      read: false,
      userId: patientId,
      data: {
        doctorName,
        type: 'response'
      }
    }

    this.emit(notification)
  }

  // Send system notifications (generic)
  sendSystemNotification(userId: string, title: string, message: string) {
    const notification: AppNotification = {
      id: `system-${Date.now()}`,
      title,
      message,
      type: 'system',
      timestamp: new Date(),
      read: false,
      userId,
      data: {}
    }

    this.emit(notification)
  }

  // Simulate push notifications (in real app, this would use service workers)
  requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission()
    }
    return Promise.resolve('denied')
  }

  // Show browser notification
  showBrowserNotification(notification: AppNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'emergency'
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
      }

      // Auto close after 5 seconds (except emergency)
      if (notification.type !== 'emergency') {
        setTimeout(() => browserNotification.close(), 5000)
      }
    }
  }

  // Play sound effect for notifications
  playNotificationSound(type: string) {
    // In a real app, you would have actual sound files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    const frequencies = {
      emergency: [800, 1000, 800], // Urgent beeping
      new_report: [600, 800], // Gentle notification
      consultation: [400, 600], // Soft chime
      system: [300, 500] // Low tone
    }

    const freq = frequencies[type as keyof typeof frequencies] || frequencies.system

    freq.forEach((frequency, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }, index * 200)
    })
  }
}

export default NotificationService.getInstance()