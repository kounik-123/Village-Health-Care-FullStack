import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material'

interface CallModalProps {
  open: boolean
  mode: 'voice' | 'video'
  onClose: () => void
}

const CallModal: React.FC<CallModalProps> = ({ open, mode, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === 'video'
        })
        setStream(s)
        if (videoRef.current && mode === 'video') {
          videoRef.current.srcObject = s
          await videoRef.current.play()
        }
      } catch (e: any) {
        setError(e?.message || 'Unable to access media devices')
      }
    }
    if (open) start()
    return () => {
      stream?.getTracks().forEach(t => t.stop())
      setStream(null)
    }
  }, [open, mode])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'video' ? 'Video Call' : 'Voice Call'}</DialogTitle>
      <DialogContent>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
            {mode === 'video' ? (
              <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} muted />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Microphone active. This demo previews local audio only.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>End</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CallModal