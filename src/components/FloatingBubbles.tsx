import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { designTokens } from '../styles/theme'

interface Bubble {
  id: number
  size: number
  left: number
  animationDuration: number
  animationDelay: number
  opacity: number
  gradient: string
  shape: 'circle' | 'ellipse'
}

const FloatingBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  // Bubble colors matching the image: mint green, turquoise, peach/yellow, and lavender
  const gradients = [
    // Mint green bubbles (like in the image)
    `radial-gradient(circle, rgba(178, 236, 193, 0.8), rgba(144, 238, 144, 0.6), rgba(152, 251, 152, 0.4))`, // Soft mint green
    `radial-gradient(circle, rgba(162, 235, 176, 0.75), rgba(134, 239, 172, 0.55), rgba(187, 247, 208, 0.35))`, // Light mint
    
    // Turquoise/Aqua bubbles (like in the image)
    `radial-gradient(circle, rgba(165, 243, 252, 0.8), rgba(103, 232, 249, 0.6), rgba(34, 211, 238, 0.4))`, // Bright turquoise
    `radial-gradient(circle, rgba(153, 246, 228, 0.75), rgba(94, 234, 212, 0.55), rgba(45, 212, 191, 0.35))`, // Teal
    
    // Peach/Yellow bubbles (like in the image)
    `radial-gradient(circle, rgba(254, 240, 138, 0.8), rgba(253, 224, 71, 0.6), rgba(250, 204, 21, 0.4))`, // Warm yellow
    `radial-gradient(circle, rgba(254, 215, 170, 0.75), rgba(251, 191, 36, 0.55), rgba(245, 158, 11, 0.35))`, // Peach orange
    
    // Lavender/Purple bubbles (like in the image)
    `radial-gradient(circle, rgba(221, 214, 254, 0.8), rgba(196, 181, 253, 0.6), rgba(167, 139, 250, 0.4))`, // Soft lavender
    `radial-gradient(circle, rgba(233, 213, 255, 0.75), rgba(209, 196, 233, 0.55), rgba(186, 164, 235, 0.35))`, // Light purple
    
    // Additional soft variations
    `radial-gradient(circle, rgba(187, 247, 208, 0.7), rgba(134, 239, 172, 0.5), rgba(74, 222, 128, 0.3))`, // Green variation
    `radial-gradient(circle, rgba(165, 243, 252, 0.7), rgba(125, 211, 252, 0.5), rgba(59, 130, 246, 0.3))`, // Blue variation
    `radial-gradient(circle, rgba(254, 249, 195, 0.7), rgba(254, 240, 138, 0.5), rgba(251, 191, 36, 0.3))`, // Yellow variation
    `radial-gradient(circle, rgba(243, 232, 255, 0.7), rgba(221, 214, 254, 0.5), rgba(196, 181, 253, 0.3))`, // Purple variation
  ]

  useEffect(() => {
    // Generate initial bubbles
    const generateBubbles = () => {
      const newBubbles: Bubble[] = []
      const bubbleCount = 15 // Moderate number for performance

      for (let i = 0; i < bubbleCount; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 80 + 20, // 20px to 100px
          left: Math.random() * 100, // 0% to 100%
          animationDuration: Math.random() * 20 + 15, // 15s to 35s
          animationDelay: Math.random() * 10, // 0s to 10s delay
          opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7 opacity - more visible
          gradient: gradients[Math.floor(Math.random() * gradients.length)],
          shape: 'circle', // All bubbles are perfect circles like in the image
        })
      }
      setBubbles(newBubbles)
    }

    generateBubbles()
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {bubbles.map((bubble) => (
        <Box
          key={bubble.id}
          sx={{
            position: 'absolute',
            width: `${bubble.size}px`,
            height: `${bubble.size}px`, // Perfect circles
            borderRadius: '50%',
            background: bubble.gradient,
            opacity: bubble.opacity,
            left: `${bubble.left}%`,
            bottom: '-100px',
            backdropFilter: 'blur(1px)', // Subtle blur for soft appearance
            border: '1px solid rgba(255, 255, 255, 0.15)', // Softer border
            boxShadow: `0 2px 10px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)`, // Gentle shadow
            animation: `floatUp ${bubble.animationDuration}s linear infinite`,
            animationDelay: `${bubble.animationDelay}s`,
            '@keyframes floatUp': {
              '0%': {
                transform: `translateY(0) translateX(0)`,
                opacity: 0,
              },
              '10%': {
                opacity: bubble.opacity,
              },
              '90%': {
                opacity: bubble.opacity,
              },
              '100%': {
                transform: `translateY(-100vh) translateX(${Math.sin(bubble.id) * 30}px)`, // Gentle horizontal drift
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  )
}

export default FloatingBubbles