import React, { useEffect, useRef, useState } from 'react'
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material'
import { designTokens } from '../../styles/theme'

interface AnimatedSectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  reverse?: boolean
  background?: 'default' | 'light' | 'gradient'
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'pulse'
  delay?: number
  id?: string
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  title,
  subtitle,
  reverse = false,
  background = 'default',
  animation = 'fadeInUp',
  delay = 0,
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [delay])

  const getBackgroundStyle = () => {
    switch (background) {
      case 'light':
        return {
          backgroundColor: designTokens.colors.neutral[50],
        }
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${designTokens.colors.primary.main}10 0%, ${designTokens.colors.secondary.main}10 100%)`,
        }
      default:
        return {}
    }
  }

  const getAnimationStyle = () => {
    const baseStyle = {
      opacity: isVisible ? 1 : 0,
      transition: `all ${designTokens.animations.duration.slow} ${designTokens.animations.easing.easeInOut}`,
    }

    switch (animation) {
      case 'slideInLeft':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
        }
      case 'slideInRight':
        return {
          ...baseStyle,
          transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        }
      case 'pulse':
        return {
          ...baseStyle,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }
      default: // fadeInUp
        return {
          ...baseStyle,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        }
    }
  }

  return (
    <Box
      ref={sectionRef}
      id={id}
      sx={{
        py: { xs: 6, md: 10 },
        ...getBackgroundStyle(),
      }}
    >
      <Container maxWidth="lg">
        <Box sx={getAnimationStyle()}>
          {(title || subtitle) && (
            <Box
              sx={{
                textAlign: 'center',
                mb: { xs: 4, md: 6 },
              }}
            >
              {title && (
                <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  component="h2"
                  sx={{
                    mb: 2,
                    background: designTokens.colors.primary.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="h6"
                  sx={{
                    color: designTokens.colors.neutral[600],
                    maxWidth: '600px',
                    mx: 'auto',
                    lineHeight: 1.6,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
          {children}
        </Box>
      </Container>
    </Box>
  )
}

export default AnimatedSection