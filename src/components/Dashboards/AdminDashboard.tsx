import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  // IconButton, // unused
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Dashboard,
  People,
  LocalHospital,
  Assignment,
  Warning,
  CheckCircle,
  Block,
  // Edit, // unused
  // Add // unused
} from '@mui/icons-material'
// import { Tooltip } from '@mui/material' // remove unused Tooltip import
import { Routes, Route } from 'react-router-dom'
import Profile from '../Profile/Profile'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import NotificationService from '../../services/NotificationService'
import Users from '../Admin/Users'
import Reports from '../Admin/Reports'
import Analytics from '../Admin/Analytics'

interface SystemStats {
  totalUsers: number
  totalDoctors: number
  totalVillagers: number
  totalReports: number
  pendingReports: number
  emergencyReports: number
  resolvedReports: number
  activeConsultations: number
  respondedReports: number
}

interface User {
  id: string
  fullName: string
  email: string
  role: 'villager' | 'doctor' | 'admin'
  phoneNumber?: string
  village?: string
  specialization?: string
  licenseNumber?: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalVillagers: 0,
    totalReports: 0,
    pendingReports: 0,
    emergencyReports: 0,
    resolvedReports: 0,
    activeConsultations: 0,
    respondedReports: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [selectedUser] = useState<User | null>(null) // remove unused setter to fix TS6133
  const [userDialog, setUserDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<{ date: string; totalReports: number; emergencyReports: number; resolvedReports: number }[]>([])

  // Removed unused auth/i18n hooks

  useEffect(() => {
    loadSystemData()
    const unsubscribe = NotificationService.subscribe(() => {
      loadSystemData()
    })
    // Lightweight polling + custom event listeners to stay in sync with deletions and responses
    const onUpdate = () => loadSystemData()
    try {
      window.addEventListener('reports_updated', onUpdate)
      window.addEventListener('users_updated', onUpdate)
      window.addEventListener('allReportsUpdated', onUpdate as EventListener)
    } catch {}
    const interval = setInterval(loadSystemData, 1500)
    return () => {
      unsubscribe()
      clearInterval(interval)
      try {
        window.removeEventListener('reports_updated', onUpdate)
        window.removeEventListener('users_updated', onUpdate)
        window.removeEventListener('allReportsUpdated', onUpdate as EventListener)
      } catch {}
    }
  }, [])

  const loadSystemData = () => {
    try {
      // Load users
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const usersWithDates = allUsers.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt || Date.now()),
        lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
        isActive: u.isActive !== false // Default to true if not specified
      }))
      setUsers(usersWithDates)

      // Load and normalize reports (ensure Date objects)
      const rawReports = JSON.parse(localStorage.getItem('allReports') || '[]')
      const allReports = rawReports.map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt) : null,
        responses: Array.isArray(r.responses)
          ? r.responses.map((resp: any) => ({
              ...resp,
              respondedAt: resp.respondedAt
                ? new Date(resp.respondedAt)
                : (resp.createdAt ? new Date(resp.createdAt) : null)
            }))
          : []
      }))

      // Admin should see all reports irrespective of per-user hidden lists
      const visibleReports = allReports

      // Calculate stats using visible reports
      const villagers = usersWithDates.filter((u: User) => u.role === 'villager')
      const doctors = usersWithDates.filter((u: User) => u.role === 'doctor')
      const pendingReports = visibleReports.filter((r: any) => r.status === 'pending')
      const emergencyPending = visibleReports.filter((r: any) => r.urgency === 'emergency' && r.status === 'pending')
      const resolvedReports = visibleReports.filter((r: any) => r.status === 'resolved')
      const respondedReports = visibleReports.filter((r: any) => Array.isArray(r.responses) && r.responses.length > 0)
      const activeConsultations = visibleReports.filter((r: any) => Array.isArray(r.responses) && r.responses.length > 0 && r.status !== 'resolved')

      setStats({
        totalUsers: usersWithDates.length,
        totalDoctors: doctors.length,
        totalVillagers: villagers.length,
        totalReports: visibleReports.length,
        pendingReports: pendingReports.length,
        emergencyReports: emergencyPending.length,
        resolvedReports: resolvedReports.length,
        activeConsultations: activeConsultations.length,
        respondedReports: respondedReports.length
      })

      // Build simple time series for last 7 days using historical (all) reports
      const days = 7
      const today = new Date()
      const series = Array.from({ length: days }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (days - 1 - i))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const dailyReports = allReports.filter((r: any) => {
          const createdAt: Date | null = r.createdAt
          if (!createdAt) return false
          return (
            createdAt.getFullYear() === d.getFullYear() &&
            createdAt.getMonth() === d.getMonth() &&
            createdAt.getDate() === d.getDate()
          )
        })
        const dailyEmergency = dailyReports.filter((r: any) => r.urgency === 'emergency')
        const dailyResolved = dailyReports.filter((r: any) => r.status === 'resolved')
        return {
          date: key,
          totalReports: dailyReports.length,
          emergencyReports: dailyEmergency.length,
          resolvedReports: dailyResolved.length
        }
      })
      setChartData(series)
    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getFilteredUsers = () => {
    switch (activeTab) {
      case 0: // All
        return users
      case 1: // Villagers
        return users.filter(u => u.role === 'villager')
      case 2: // Doctors
        return users.filter(u => u.role === 'doctor')
      case 3: // Inactive
        return users.filter(u => !u.isActive)
      default:
        return users
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>Loading system data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/" element={
          <Box sx={{ mt: 2 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom color="primary">
                <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System administration and monitoring
              </Typography>
            </Paper>

            {/* System Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4" color="primary.main">
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.totalVillagers} Villagers, {stats.totalDoctors} Doctors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Assignment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h6">Health Reports</Typography>
                    <Typography variant="h4" color="info.main">
                      {stats.totalReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.pendingReports} Pending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h6">Emergency Cases</Typography>
                    <Typography variant="h4" color="error.main">
                      {stats.emergencyReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Require immediate attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocalHospital sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Consultations</Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.activeConsultations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active doctor-patient interactions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* System Health Indicators */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                System Health
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Server Status:</strong> Online
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Response Rate:</strong> {stats.totalReports > 0 ? Math.round((stats.respondedReports / stats.totalReports) * 100) : 0}%
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity={stats.pendingReports > 10 ? "warning" : "success"} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Pending Queue:</strong> {stats.pendingReports} reports
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Paper>

            {/* System Trends */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                System Trends (Last 7 Days)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="totalReports" name="Total Reports" fill="#1976d2" />
                        <Bar dataKey="emergencyReports" name="Emergency" fill="#d32f2f" />
                        <Bar dataKey="resolvedReports" name="Resolved" fill="#2e7d32" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Villagers', value: users.filter(u => u.role === 'villager').length },
                            { name: 'Doctors', value: users.filter(u => u.role === 'doctor').length },
                            { name: 'Admins', value: users.filter(u => u.role === 'admin').length }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          label
                        >
                          <Cell fill="#1976d2" />
                          <Cell fill="#2e7d32" />
                          <Cell fill="#9c27b0" />
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* User Management */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  User Management
                </Typography>
              </Box>

              {/* User Tabs */}
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label={`All Users (${users.length})`} />
                <Tab label={`Villagers (${users.filter(u => u.role === 'villager').length})`} />
                <Tab label={`Doctors (${users.filter(u => u.role === 'doctor').length})`} />
                <Tab label={`Inactive (${users.filter(u => !u.isActive).length})`} />
              </Tabs>

              {/* Users Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredUsers().map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.fullName}
                            </Typography>
                            {user.village && (
                              <Typography variant="caption" color="text.secondary">
                                {user.village}
                              </Typography>
                            )}
                            {user.specialization && (
                              <Typography variant="caption" color="text.secondary">
                                {user.specialization}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.toUpperCase()}
                            size="small"
                            color={user.role === 'doctor' ? 'primary' : user.role === 'admin' ? 'secondary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.isActive ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {user.isActive ? (
                              <CheckCircle sx={{ color: 'success.main' }} />
                            ) : (
                              <Block sx={{ color: 'error.main' }} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* User Dialog */}
            <Dialog
              open={userDialog}
              onClose={() => setUserDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {selectedUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  User management functionality would be implemented here in a real application.
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setUserDialog(false)}>
                  Cancel
                </Button>
                <Button variant="contained">
                  {selectedUser ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        } />
        </Routes>
      </Container>
    )
}

export default AdminDashboard