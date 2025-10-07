import React, { useState, useEffect } from 'react'
import { Typography, TypographyProps } from '@mui/material'
import { designTokens } from '../../styles/theme'

interface TypingAnimationProps extends Omit<TypographyProps, 'children'> {
  texts: string[]
  speed?: number
  deleteSpeed?: number
  pauseDuration?: number
  loop?: boolean
  showCursor?: boolean
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  loop = true,
  showCursor = true,
  ...typographyProps
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursorBlink, setShowCursorBlink] = useState(true)

  useEffect(() => {
    const targetText = texts[currentTextIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.slice(0, currentText.length + 1))
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => {
            if (loop && texts.length > 1) {
              setIsDeleting(true)
            }
          }, pauseDuration)
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [currentText, currentTextIndex, isDeleting, texts, speed, deleteSpeed, pauseDuration, loop])

  useEffect(() => {
    // Cursor blinking animation
    const cursorInterval = setInterval(() => {
      setShowCursorBlink(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <Typography
      {...typographyProps}
      sx={{
        ...typographyProps.sx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '& .typing-cursor': {
          opacity: showCursor && showCursorBlink ? 1 : 0,
          transition: 'opacity 0.1s',
          color: designTokens.colors.primary.main,
          marginLeft: '2px',
        },
      }}
    >
      <span style={{ display: 'inline-block', minWidth: 0 }}>
        {currentText}
      </span>
      {showCursor && <span className="typing-cursor">|</span>}
    </Typography>
  )
}

export default TypingAnimation