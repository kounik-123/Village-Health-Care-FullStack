import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Divider, Avatar } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import NotificationService from '../../services/NotificationService'

interface Message {
  id: string
  consultationId: string
  senderId: string
  senderName: string
  role: 'doctor' | 'patient'
  content: string
  timestamp: Date
}

const Chat: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const storageKey = useMemo(() => `messages_${consultationId}`, [consultationId])

  useEffect(() => {
    if (!consultationId) return
    const raw = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const parsed: Message[] = raw.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }))
    setMessages(parsed)
  }, [storageKey, consultationId])

  useEffect(() => {
    // auto-scroll to bottom
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !consultationId || !user) return
    const newMsg: Message = {
      id: `${Date.now()}`,
      consultationId,
      senderId: user.id,
      senderName: user.fullName,
      role: user.role === 'doctor' ? 'doctor' : 'patient',
      content: input.trim(),
      timestamp: new Date()
    }
    const updated = [...messages, newMsg]
    setMessages(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))

    // Broadcast notifications when villager (patient) sends a message
    if (user.role !== 'doctor') {
      const preview = newMsg.content.length > 60 ? newMsg.content.slice(0, 57) + '...' : newMsg.content
      try {
        NotificationService.sendRoleNotification(
          'admin',
          'New Message',
          `${user.fullName} sent a message: "${preview}"`,
          'consultation',
          { consultationId }
        )
        NotificationService.sendRoleNotification(
          'doctor',
          'New Message',
          `${user.fullName} sent a message: "${preview}"`,
          'consultation',
          { consultationId }
        )
      } catch (e) {
        console.error('Failed to broadcast message notifications:', e)
      }
    }

    setInput('')
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5">Consultation Chat</Typography>
        <Typography variant="body2" color="text.secondary">
          Chat with your appointed doctor in real-time
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, height: { xs: 350, md: 500 }, display: 'flex', flexDirection: 'column' }}>
        <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto' }}>
          <List>
            {messages.map(m => (
              <React.Fragment key={m.id}>
                <ListItem sx={{ justifyContent: m.senderId === user?.id ? 'flex-end' : 'flex-start' }}>
                  {m.senderId !== user?.id && (
                    <Avatar sx={{ mr: 1 }}>{m.senderName.charAt(0)}</Avatar>
                  )}
                  <ListItemText
                    primary={m.content}
                    secondary={`${m.senderName} • ${new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(m.timestamp)}`}
                    sx={{
                      maxWidth: '70%',
                      bgcolor: m.senderId === user?.id ? 'primary.light' : 'grey.100',
                      color: 'text.primary',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            fullWidth
            size="small"
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Chat