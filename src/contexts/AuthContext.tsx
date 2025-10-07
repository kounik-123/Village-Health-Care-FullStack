import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  role: 'villager' | 'doctor' | 'admin'
  createdAt: Date
  profilePicture?: string
  specialization?: string // For doctors
  licenseNumber?: string // For doctors
  village?: string // For villagers
  // Extended profile fields
  gender?: string
  dateOfBirth?: string // ISO date string (YYYY-MM-DD)
  address?: string
  medicalHistory?: string // For villagers
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  // Update profile with partial fields
  updateProfile: (updates: Partial<User>) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phoneNumber: string
  role: 'villager' | 'doctor' | 'admin'
  specialization?: string
  licenseNumber?: string
  village?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('villageHealthUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Ensure Admin Dashboard reflects active session on reload
        try {
          const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
          const idx = adminUsers.findIndex((u: any) => u.id === userData.id || u.email === userData.email)
          if (idx >= 0) {
            adminUsers[idx] = { ...adminUsers[idx], isActive: true }
            localStorage.setItem('users', JSON.stringify(adminUsers))
            // Notify same-tab listeners
            try { window.dispatchEvent(new Event('users_updated')) } catch {}
          }
        } catch (e) {
          console.error('Failed to mark user active on session restore:', e)
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('villageHealthUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    try {
      // Get registered users from localStorage
      const registeredUsers: (User & { password: string })[] = JSON.parse(localStorage.getItem('villageHealthRegisteredUsers') || '[]')
      
      // Mock authentication - In real app, this would call your backend API
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'villager@test.com',
          fullName: 'राम कुमार',
          phoneNumber: '+91-9876543210',
          role: 'villager',
          village: 'Rampur',
          createdAt: new Date()
        },
        {
          id: '2',
          email: 'doctor@test.com',
          fullName: 'Dr. Priya Sharma',
          phoneNumber: '+91-9876543211',
          role: 'doctor',
          specialization: 'General Medicine',
          licenseNumber: 'MED12345',
          createdAt: new Date()
        },
        {
          id: '3',
          email: 'admin@test.com',
          fullName: 'Admin User',
          phoneNumber: '+91-9876543212',
          role: 'admin',
          createdAt: new Date()
        }
      ]

      // Combine mock users with registered users
      const allUsers = [...mockUsers, ...registeredUsers]
      
      // Find user by email
      const foundUser = allUsers.find((u: User) => u.email === email)
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      // For registered users, check password (mock users use any password)
      const isRegisteredUser = registeredUsers.find((u: { email: string; password: string }) => u.email === email)
      if (isRegisteredUser && isRegisteredUser.password !== password) {
        throw new Error('Invalid email or password')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create user object without password for storage
      const userForStorage = {
        id: foundUser.id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        phoneNumber: foundUser.phoneNumber,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
        ...(foundUser.profilePicture && { profilePicture: foundUser.profilePicture }),
        ...(foundUser.specialization && { specialization: foundUser.specialization }),
        ...(foundUser.licenseNumber && { licenseNumber: foundUser.licenseNumber }),
        ...(foundUser.village && { village: foundUser.village })
      }

      setUser(userForStorage)
      localStorage.setItem('villageHealthUser', JSON.stringify(userForStorage))

      // Sync to Admin Dashboard 'users' collection
      try {
        const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
        const idx = adminUsers.findIndex((u: any) => u.id === userForStorage.id || u.email === userForStorage.email)
        const existing = idx >= 0 ? adminUsers[idx] : null
        const adminUserEntry = {
          id: userForStorage.id,
          fullName: userForStorage.fullName,
          email: userForStorage.email,
          role: userForStorage.role,
          phoneNumber: userForStorage.phoneNumber,
          village: (userForStorage as any).village,
          specialization: (userForStorage as any).specialization,
          licenseNumber: (userForStorage as any).licenseNumber,
          isActive: true,
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        if (idx >= 0) {
          adminUsers[idx] = { ...existing, ...adminUserEntry }
        } else {
          adminUsers.push(adminUserEntry)
        }
        localStorage.setItem('users', JSON.stringify(adminUsers))
        // Notify same-tab listeners
        try { window.dispatchEvent(new Event('users_updated')) } catch {}
      } catch (e) {
        console.error('Failed to sync admin users on login:', e)
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true)
    try {
      // Check if user already exists
      const registeredUsers = JSON.parse(localStorage.getItem('villageHealthRegisteredUsers') || '[]')
      const existingUser = registeredUsers.find((u: any) => u.email === userData.email)
      
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Mock registration - In real app, this would call your backend API
      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        createdAt: new Date(),
        password: userData.password, // Store password for authentication
        ...(userData.specialization && { specialization: userData.specialization }),
        ...(userData.licenseNumber && { licenseNumber: userData.licenseNumber }),
        ...(userData.village && { village: userData.village })
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Store user in registered users list
      const updatedRegisteredUsers = [...registeredUsers, newUser]
      localStorage.setItem('villageHealthRegisteredUsers', JSON.stringify(updatedRegisteredUsers))

      // Create user object without password for current session
      const userForSession = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        createdAt: newUser.createdAt,
        ...(newUser.specialization && { specialization: newUser.specialization }),
        ...(newUser.licenseNumber && { licenseNumber: newUser.licenseNumber }),
        ...(newUser.village && { village: newUser.village })
      }

      setUser(userForSession)
      localStorage.setItem('villageHealthUser', JSON.stringify(userForSession))

      // Sync to Admin Dashboard 'users' collection on registration
      try {
        const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
        const idx = adminUsers.findIndex((u: any) => u.id === userForSession.id || u.email === userForSession.email)
        const existing = idx >= 0 ? adminUsers[idx] : null
        const adminUserEntry = {
          id: userForSession.id,
          fullName: userForSession.fullName,
          email: userForSession.email,
          role: userForSession.role,
          phoneNumber: userForSession.phoneNumber,
          village: (userForSession as any).village,
          specialization: (userForSession as any).specialization,
          licenseNumber: (userForSession as any).licenseNumber,
          isActive: true,
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        if (idx >= 0) {
          adminUsers[idx] = { ...existing, ...adminUserEntry }
        } else {
          adminUsers.push(adminUserEntry)
        }
        localStorage.setItem('users', JSON.stringify(adminUsers))
        // Notify same-tab listeners
        try { window.dispatchEvent(new Event('users_updated')) } catch {}
      } catch (e) {
        console.error('Failed to sync admin users on registration:', e)
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (user) {
      try {
        const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
        const idx = adminUsers.findIndex((u: any) => u.id === user.id || u.email === user.email)
        if (idx >= 0) {
          const existing = adminUsers[idx]
          adminUsers[idx] = {
            ...existing,
            isActive: false,
            lastLogout: new Date().toISOString()
          }
          localStorage.setItem('users', JSON.stringify(adminUsers))
          // Notify same-tab listeners
          try { window.dispatchEvent(new Event('users_updated')) } catch {}
        }
      } catch (e) {
        console.error('Failed to mark user as logged out in admin users:', e)
      }
    }
    setUser(null)
    localStorage.removeItem('villageHealthUser')
  }

  // Update currently logged in user's profile and persist to localStorage
  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return
    try {
      // Merge updates into current user
      const updatedUser: User = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('villageHealthUser', JSON.stringify(updatedUser))

      // Also update in registered users if present
      const registeredUsers: (User & { password?: string })[] = JSON.parse(localStorage.getItem('villageHealthRegisteredUsers') || '[]')
      const userIndex = registeredUsers.findIndex((u) => u.id === user.id || u.email === user.email)
      if (userIndex >= 0) {
        const existing = registeredUsers[userIndex]
        registeredUsers[userIndex] = { ...existing, ...updates }
        localStorage.setItem('villageHealthRegisteredUsers', JSON.stringify(registeredUsers))
      }

      // Sync profile updates to Admin Dashboard 'users' collection
      try {
        const adminUsers: any[] = JSON.parse(localStorage.getItem('users') || '[]')
        const idx = adminUsers.findIndex((u: any) => u.id === updatedUser.id || u.email === updatedUser.email)
        if (idx >= 0) {
          const existingAdminUser = adminUsers[idx]
          adminUsers[idx] = {
            ...existingAdminUser,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            village: updatedUser.village,
            specialization: updatedUser.specialization,
            licenseNumber: updatedUser.licenseNumber
          }
          localStorage.setItem('users', JSON.stringify(adminUsers))
          // Notify same-tab listeners
          try { window.dispatchEvent(new Event('users_updated')) } catch {}
        } else {
          adminUsers.push({
            id: updatedUser.id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
            phoneNumber: updatedUser.phoneNumber,
            village: updatedUser.village,
            specialization: updatedUser.specialization,
            licenseNumber: updatedUser.licenseNumber,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          })
          localStorage.setItem('users', JSON.stringify(adminUsers))
          // Notify same-tab listeners
          try { window.dispatchEvent(new Event('users_updated')) } catch {}
        }
      } catch (e) {
        console.error('Failed to sync admin users on profile update:', e)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}