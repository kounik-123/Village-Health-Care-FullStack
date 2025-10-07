import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material'
import {
  Visibility,
  Flag,
  People,
  Handshake,
  Timeline,
  EmojiEvents,
  Favorite,
} from '@mui/icons-material'
import AnimatedSection from './AnimatedSection'
import { designTokens, glassEffect } from '../../styles/theme'

const About: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const sections = [
    {
      icon: <Flag />,
      title: 'Our Mission',
      description: 'To bridge the healthcare gap in rural communities by providing accessible, affordable, and quality medical services through innovative technology solutions.',
      content: 'We believe that every person, regardless of their location, deserves access to quality healthcare. Our mission is to eliminate geographical barriers and connect rural communities with expert medical professionals, ensuring timely diagnosis, treatment, and ongoing health monitoring.',
      image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500&h=400&fit=crop&crop=center',
      stats: [
        { label: 'Communities Served', value: '50+' },
        { label: 'Lives Impacted', value: '10,000+' },
      ],
    },
    {
      icon: <Visibility />,
      title: 'Our Vision',
      description: 'A world where geographical boundaries do not limit access to healthcare, and every rural community has the tools and resources needed for optimal health outcomes.',
      content: 'We envision a future where technology seamlessly integrates with healthcare delivery, creating a comprehensive ecosystem that empowers both patients and healthcare providers. Our vision extends beyond just medical treatment to include preventive care, health education, and community wellness programs.',
      image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=500&h=400&fit=crop&crop=center',
      stats: [
        { label: 'Target Villages', value: '500+' },
        { label: 'Healthcare Providers', value: '1,000+' },
      ],
    },
    {
      icon: <People />,
      title: 'Our Team',
      description: 'A diverse group of healthcare professionals, technology experts, and community advocates working together to revolutionize rural healthcare delivery.',
      content: 'Our multidisciplinary team combines decades of experience in healthcare, technology, and community development. We work closely with local healthcare providers, government agencies, and community leaders to ensure our solutions meet the unique needs of each community we serve.',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&h=400&fit=crop&crop=center',
      team: [
        { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', specialty: 'Rural Medicine' },
        { name: 'Raj Patel', role: 'CTO', specialty: 'Healthcare Technology' },
        { name: 'Maria Garcia', role: 'Community Outreach Director', specialty: 'Public Health' },
      ],
    },
    {
      icon: <Handshake />,
      title: 'Our Partners',
      description: 'Collaborating with leading healthcare institutions, technology companies, and government agencies to expand our reach and impact.',
      content: 'We work with a network of trusted partners including medical colleges, rural hospitals, NGOs, and technology providers. These partnerships enable us to leverage existing infrastructure, share knowledge, and scale our impact across multiple regions.',
      image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=500&h=400&fit=crop&crop=center',
      partners: [
        'Ministry of Health',
        'Rural Health Alliance',
        'Medical Technology Institute',
        'Community Health Foundation',
      ],
    },
    {
      icon: <Timeline />,
      title: 'Our Journey',
      description: 'From a small pilot project to a comprehensive healthcare platform serving thousands of patients across multiple regions.',
      content: 'Started in 2020 as a response to healthcare challenges in rural areas, we have grown from serving a single village to connecting entire regions with quality healthcare services. Our journey has been marked by continuous innovation, community feedback, and measurable health outcomes.',
      image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=500&h=400&fit=crop&crop=center',
      timeline: [
        { year: '2020', event: 'Pilot program launched in first village' },
        { year: '2021', event: 'Expanded to 10 communities' },
        { year: '2022', event: 'Reached 1,000 patients milestone' },
        { year: '2023', event: 'Launched telemedicine platform' },
        { year: '2024', event: 'Serving 50+ villages' },
      ],
    },
    {
      icon: <EmojiEvents />,
      title: 'Recognition & Impact',
      description: 'Our work has been recognized by healthcare organizations and has demonstrated measurable improvements in health outcomes.',
      content: 'We have received multiple awards for innovation in healthcare delivery and have published research showing significant improvements in patient outcomes, reduced emergency response times, and increased healthcare accessibility in rural areas.',
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&h=400&fit=crop&crop=center',
      achievements: [
        'Healthcare Innovation Award 2023',
        'Rural Development Excellence Award',
        'Digital Health Pioneer Recognition',
        'Community Impact Award',
      ],
    },
    {
      icon: <Favorite />,
      title: 'Community Impact',
      description: 'Measuring our success through improved health outcomes, reduced healthcare costs, and enhanced quality of life in rural communities.',
      content: 'Our impact extends beyond individual patient care to include community health education, preventive care programs, and capacity building for local healthcare workers. We measure success through reduced mortality rates, improved chronic disease management, and increased healthcare accessibility.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=400&fit=crop&crop=center',
      impact: [
        '40% reduction in emergency response time',
        '60% increase in preventive care uptake',
        '50% improvement in chronic disease management',
        '80% patient satisfaction rate',
      ],
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${designTokens.colors.primary.main}15 0%, ${designTokens.colors.secondary.main}15 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant={isMobile ? 'h3' : 'h1'}
              component="h1"
              sx={{
                mb: 3,
                fontWeight: 700,
                background: designTokens.colors.primary.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              About Village Health Monitor
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: designTokens.colors.neutral[600],
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Transforming rural healthcare through innovation, compassion, and community-centered solutions
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Sections */}
      {sections.map((section, index) => (
        <AnimatedSection
          key={index}
          background={index % 2 === 0 ? 'default' : 'light'}
          animation={index % 2 === 0 ? 'slideInLeft' : 'slideInRight'}
          delay={index * 100}
        >
          <Grid
            container
            spacing={6}
            alignItems="center"
            direction={index % 2 === 0 ? 'row' : 'row-reverse'}
          >
            <Grid item xs={12} md={6}>
              <Box>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    background: designTokens.colors.primary.gradient,
                    fontSize: '2rem',
                  }}
                >
                  {section.icon}
                </Avatar>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: designTokens.colors.neutral[800],
                  }}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: designTokens.colors.neutral[600],
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  {section.description}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: designTokens.colors.neutral[700],
                    lineHeight: 1.7,
                    mb: 4,
                  }}
                >
                  {section.content}
                </Typography>

                {/* Stats */}
                {section.stats && (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    {section.stats.map((stat, statIndex) => (
                      <Grid item xs={6} key={statIndex}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              background: designTokens.colors.primary.gradient,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Team Members */}
                {section.team && (
                  <Box sx={{ mb: 3 }}>
                    {section.team.map((member, memberIndex) => (
                      <Box key={memberIndex} sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.role} • {member.specialty}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Partners */}
                {section.partners && (
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={1}>
                      {section.partners.map((partner, partnerIndex) => (
                        <Grid item key={partnerIndex}>
                          <Chip
                            label={partner}
                            variant="outlined"
                            sx={{
                              borderColor: designTokens.colors.primary.main,
                              color: designTokens.colors.primary.main,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Timeline */}
                {section.timeline && (
                  <Box sx={{ mb: 3 }}>
                    {section.timeline.map((item, timelineIndex) => (
                      <Box key={timelineIndex} sx={{ display: 'flex', mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            minWidth: '80px',
                            fontWeight: 600,
                            color: designTokens.colors.primary.main,
                          }}
                        >
                          {item.year}
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 2 }}>
                          {item.event}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Achievements */}
                {section.achievements && (
                  <Box sx={{ mb: 3 }}>
                    {section.achievements.map((achievement, achievementIndex) => (
                      <Typography
                        key={achievementIndex}
                        variant="body1"
                        sx={{
                          mb: 1,
                          '&::before': {
                            content: '"•"',
                            color: designTokens.colors.primary.main,
                            fontWeight: 'bold',
                            marginRight: '8px',
                          },
                        }}
                      >
                        {achievement}
                      </Typography>
                    ))}
                  </Box>
                )}

                {/* Impact */}
                {section.impact && (
                  <Grid container spacing={2}>
                    {section.impact.map((item, impactIndex) => (
                      <Grid item xs={12} sm={6} key={impactIndex}>
                        <Card
                          sx={{
                            ...glassEffect,
                            p: 2,
                            textAlign: 'center',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                            },
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: designTokens.colors.primary.main,
                            }}
                          >
                            {item}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  ...glassEffect,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: designTokens.shadows.strong,
                  },
                }}
              >
                <img
                  src={section.image}
                  alt={section.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        </AnimatedSection>
      ))}
    </Box>
  )
}

export default About