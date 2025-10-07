import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material'
import {
  Email,
  Phone,
  LocationOn,
  Send,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  ExpandMore,
  CheckCircle,
  Schedule,
  Support,
  Business,
  Public,
  Security,
  Group,
} from '@mui/icons-material'
import AnimatedSection from './AnimatedSection'
import { designTokens, glassEffect } from '../../styles/theme'

const Contact: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false)
  }

  const contactInfo = [
    {
      icon: <Email />,
      title: 'Email Us',
      content: 'support@villagehealthmonitor.com',
      description: 'Get in touch via email for detailed inquiries',
    },
    {
      icon: <Phone />,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: '24/7 support hotline for urgent matters',
    },
    {
      icon: <LocationOn />,
      title: 'Visit Us',
      content: '123 Healthcare Ave, Medical District',
      description: 'Our headquarters and main support center',
    },
  ]

  const socialLinks = [
    { icon: <Facebook />, name: 'Facebook', url: '#' },
    { icon: <Twitter />, name: 'Twitter', url: '#' },
    { icon: <LinkedIn />, name: 'LinkedIn', url: '#' },
    { icon: <Instagram />, name: 'Instagram', url: '#' },
  ]

  const faqs = [
    {
      id: 'faq1',
      question: 'How do I get started with Village Health Monitor?',
      answer: 'Getting started is easy! Simply sign up for an account, choose your role (patient, doctor, or health worker), and complete the onboarding process. Our team will guide you through the setup and provide training materials.',
    },
    {
      id: 'faq2',
      question: 'Is my health data secure and private?',
      answer: 'Absolutely. We use end-to-end encryption, comply with HIPAA regulations, and follow industry best practices for data security. Your health information is never shared without your explicit consent.',
    },
    {
      id: 'faq3',
      question: 'What devices are compatible with the platform?',
      answer: 'Our platform works on all modern devices including smartphones, tablets, and computers. We also integrate with popular wearable devices and health monitoring equipment.',
    },
    {
      id: 'faq4',
      question: 'How much does the service cost?',
      answer: 'We offer flexible pricing plans for individuals, healthcare providers, and organizations. Contact our sales team for detailed pricing information tailored to your needs.',
    },
    {
      id: 'faq5',
      question: 'Do you provide training and support?',
      answer: 'Yes! We provide comprehensive training materials, video tutorials, and 24/7 customer support. Our team is always ready to help you make the most of our platform.',
    },
    {
      id: 'faq6',
      question: 'Can I integrate with existing healthcare systems?',
      answer: 'Our platform supports integration with most major healthcare systems and electronic health records (EHR) platforms. Our technical team can help with custom integrations.',
    },
  ]

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Emergency Support Only' },
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
              Get in Touch
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: designTokens.colors.neutral[600],
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              We're here to help you transform healthcare in your community
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <AnimatedSection
        animation="slideInLeft"
        title="Send Us a Message"
        subtitle="Have questions or need support? We'd love to hear from you."
      >
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Card sx={{ ...glassEffect }}>
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: designTokens.borderRadius.md,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Send />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          background: designTokens.colors.primary.gradient,
                          '&:hover': {
                            background: designTokens.colors.primary.gradient,
                            filter: 'brightness(1.1)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...glassEffect,
                height: 'fit-content',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&crop=center"
                alt="Contact us"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </AnimatedSection>

      {/* Contact Information Section */}
      <AnimatedSection
        background="light"
        animation="slideInRight"
        title="Contact Information"
        subtitle="Multiple ways to reach our support team"
      >
        <Grid container spacing={4}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  ...glassEffect,
                  textAlign: 'center',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: designTokens.shadows.strong,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                      background: designTokens.colors.primary.gradient,
                    }}
                  >
                    {info.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: designTokens.colors.neutral[800],
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      color: designTokens.colors.primary.main,
                      fontWeight: 500,
                    }}
                  >
                    {info.content}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: designTokens.colors.neutral[600],
                    }}
                  >
                    {info.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </AnimatedSection>

      {/* Map Section */}
      <AnimatedSection
        animation="fadeInUp"
        title="Find Our Office"
        subtitle="Visit us at our headquarters for in-person consultations"
      >
        <Card sx={{ ...glassEffect, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 400,
              background: `linear-gradient(45deg, ${designTokens.colors.primary.main}20, ${designTokens.colors.secondary.main}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: designTokens.colors.neutral[600],
                textAlign: 'center',
              }}
            >
              Interactive Map Placeholder
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                123 Healthcare Ave, Medical District
              </Typography>
            </Typography>
          </Box>
        </Card>
      </AnimatedSection>

      {/* Office Hours & Social Section */}
      <AnimatedSection
        background="light"
        animation="slideInLeft"
        title="Office Hours & Social Media"
        subtitle="Stay connected with us through multiple channels"
      >
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card sx={{ ...glassEffect }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Schedule sx={{ mr: 2, color: designTokens.colors.primary.main }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: designTokens.colors.neutral[800],
                    }}
                  >
                    Office Hours
                  </Typography>
                </Box>
                <List>
                  {officeHours.map((schedule, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={schedule.day}
                        secondary={schedule.hours}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: 500,
                            color: designTokens.colors.neutral[700],
                          },
                          '& .MuiListItemText-secondary': {
                            color: designTokens.colors.primary.main,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ ...glassEffect }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: designTokens.colors.neutral[800],
                  }}
                >
                  Follow Us
                </Typography>
                <Grid container spacing={2}>
                  {socialLinks.map((social, index) => (
                    <Grid item key={index}>
                      <IconButton
                        sx={{
                          width: 60,
                          height: 60,
                          background: designTokens.colors.primary.gradient,
                          color: 'white',
                          '&:hover': {
                            transform: 'translateY(-4px) rotate(5deg)',
                            boxShadow: designTokens.shadows.medium,
                          },
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 3,
                    color: designTokens.colors.neutral[600],
                  }}
                >
                  Stay updated with our latest news, health tips, and platform updates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection
        animation="slideInRight"
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our platform"
      >
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expandedFaq === faq.id}
              onChange={handleFaqChange(faq.id)}
              sx={{
                mb: 2,
                ...glassEffect,
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '0 0 16px 0',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: designTokens.colors.neutral[800],
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  sx={{
                    color: designTokens.colors.neutral[700],
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </AnimatedSection>

      {/* Support Features Section */}
      <AnimatedSection
        background="gradient"
        animation="pulse"
        title="Why Choose Our Support?"
        subtitle="We're committed to providing exceptional service and support"
      >
        <Grid container spacing={4}>
          {[
            {
              icon: <Support />,
              title: '24/7 Support',
              description: 'Round-the-clock assistance for all your needs',
            },
            {
              icon: <Group />,
              title: 'Expert Team',
              description: 'Healthcare and technology experts at your service',
            },
            {
              icon: <Security />,
              title: 'Secure Platform',
              description: 'Enterprise-grade security for your peace of mind',
            },
            {
              icon: <Public />,
              title: 'Global Reach',
              description: 'Supporting communities worldwide',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: designTokens.colors.primary.gradient,
                    color: 'white',
                    fontSize: '2rem',
                    boxShadow: designTokens.shadows.medium,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AnimatedSection>
    </Box>
  )
}

export default Contact