import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, Box, Grid, Card, CardContent } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

interface SystemStats {
  totalUsers: number
  totalDoctors: number
  totalVillagers: number
  totalReports: number
  pendingReports: number
  emergencyReports: number
  resolvedReports: number
  respondedReports: number
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalVillagers: 0,
    totalReports: 0,
    pendingReports: 0,
    emergencyReports: 0,
    resolvedReports: 0,
    respondedReports: 0
  })
  const [chartData, setChartData] = useState<{ date: string; totalReports: number; emergencyReports: number; resolvedReports: number }[]>([])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    try {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const villagers = allUsers.filter((u: any) => u.role === 'villager')
      const doctors = allUsers.filter((u: any) => u.role === 'doctor')
      const allReports = JSON.parse(localStorage.getItem('allReports') || '[]').map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt) : null
      }))
      const pendingReports = allReports.filter((r: any) => r.status === 'pending')
      const emergencyReports = allReports.filter((r: any) => r.urgency === 'emergency')
      const resolvedReports = allReports.filter((r: any) => r.status === 'resolved')
      const respondedReports = allReports.filter((r: any) => Array.isArray(r.responses) && r.responses.length > 0)

      setStats({
        totalUsers: allUsers.length,
        totalDoctors: doctors.length,
        totalVillagers: villagers.length,
        totalReports: allReports.length,
        pendingReports: pendingReports.length,
        emergencyReports: emergencyReports.length,
        resolvedReports: resolvedReports.length,
        respondedReports: respondedReports.length
      })

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
        return { date: key, totalReports: dailyReports.length, emergencyReports: dailyEmergency.length, resolvedReports: dailyResolved.length }
      })
      setChartData(series)
    } catch (e) {
      console.error('Failed to load analytics data', e)
    }
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">Admin - Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Data insights and visual reports for the system</Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Total Users</Typography>
            <Typography variant="h5" color="primary.main">{stats.totalUsers}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Reports</Typography>
            <Typography variant="h5" color="secondary.main">{stats.totalReports}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Responded</Typography>
            <Typography variant="h5" color="success.main">{stats.respondedReports}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Emergency</Typography>
            <Typography variant="h5" color="error.main">{stats.emergencyReports}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: 3, my: 3 }}>
        <Typography variant="h6" gutterBottom>Reports Trend (Last 7 days)</Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalReports" name="Total Reports" fill="#1976d2" />
              <Bar dataKey="emergencyReports" name="Emergency" fill="#d32f2f" />
              <Bar dataKey="resolvedReports" name="Resolved" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, my: 3 }}>
        <Typography variant="h6" gutterBottom>User Distribution</Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[
                { name: 'Villagers', value: Number(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')||'[]').filter((u:any)=>u.role==='villager').length : 0) },
                { name: 'Doctors', value: Number(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')||'[]').filter((u:any)=>u.role==='doctor').length : 0) },
                { name: 'Admins', value: Number(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')||'[]').filter((u:any)=>u.role==='admin').length : 0) }
              ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                <Cell fill="#1976d2" />
                <Cell fill="#2e7d32" />
                <Cell fill="#9c27b0" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Container>
  )
}

export default Analytics