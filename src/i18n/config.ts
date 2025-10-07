import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Common
      'welcome': 'Welcome',
      'login': 'Login',
      'register': 'Register',
      'logout': 'Logout',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'back': 'Back',
      'next': 'Next',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      
      // Auth
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'fullName': 'Full Name',
      'phoneNumber': 'Phone Number',
      'selectRole': 'Select Role',
      'villager': 'Villager',
      'doctor': 'Doctor',
      'admin': 'Admin',
      
      // Health Reporting
      'reportHealth': 'Report Health Issue',
      'symptoms': 'Symptoms',
      'urgency': 'Urgency Level',
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'emergency': 'Emergency',
    'notifications': {
      'title': 'Notifications',
      'noNotifications': 'No notifications',
      'markAllRead': 'Mark all as read',
      'unreadCount': '{{count}} unread notifications',
      'justNow': 'Just now',
      'minutesAgo': '{{count}} minutes ago',
      'hoursAgo': '{{count}} hours ago',
      'daysAgo': '{{count}} days ago'
    },
      'description': 'Description',
      'location': 'Location',
      'shareLocation': 'Share My Location',
      
      // Dashboard
      'dashboard': 'Dashboard',
      'myReports': 'My Reports',
      'consultations': 'Consultations',
      'history': 'History',
      'profile': 'Profile',
      
      // Doctor
      'patientReports': 'Patient Reports',
      'activeConsultations': 'Active Consultations',
      'prescriptions': 'Prescriptions',
      'medicalHistory': 'Medical History',
      'viewDetails': 'View Details',
      'startConsultation': 'Start Consultation',
      
      // Messages
      'noReports': 'No health reports found',
      'reportSubmitted': 'Health report submitted successfully',
      'loginSuccess': 'Login successful',
      'registrationSuccess': 'Registration successful',
    }
  },
  hi: {
    translation: {
      // Common
      'welcome': 'स्वागत है',
      'login': 'लॉगिन',
      'register': 'पंजीकरण',
      'logout': 'लॉगआउट',
      'submit': 'जमा करें',
      'cancel': 'रद्द करें',
      'save': 'सेव करें',
      'delete': 'हटाएं',
      'edit': 'संपादित करें',
      'back': 'वापस',
      'next': 'आगे',
      'loading': 'लोड हो रहा है...',
      'error': 'त्रुटि',
      'success': 'सफलता',
      
      // Auth
      'email': 'ईमेल',
      'password': 'पासवर्ड',
      'confirmPassword': 'पासवर्ड की पुष्टि करें',
      'fullName': 'पूरा नाम',
      'phoneNumber': 'फोन नंबर',
      'selectRole': 'भूमिका चुनें',
      'villager': 'ग्रामीण',
      'doctor': 'डॉक्टर',
      'admin': 'प्रशासक',
      
      // Health Reporting
      'reportHealth': 'स्वास्थ्य समस्या की रिपोर्ट करें',
      'symptoms': 'लक्षण',
      'urgency': 'तात्कालिकता का स्तर',
      'low': 'कम',
      'medium': 'मध्यम',
      'high': 'उच्च',
      'emergency': 'आपातकाल',
    'notifications': {
      'title': 'सूचनाएं',
      'noNotifications': 'कोई सूचना नहीं',
      'markAllRead': 'सभी को पढ़ा हुआ चिह्नित करें',
      'unreadCount': '{{count}} अपठित सूचनाएं',
      'justNow': 'अभी',
      'minutesAgo': '{{count}} मिनट पहले',
      'hoursAgo': '{{count}} घंटे पहले',
      'daysAgo': '{{count}} दिन पहले'
    },
      'description': 'विवरण',
      'location': 'स्थान',
      'shareLocation': 'मेरा स्थान साझा करें',
      
      // Dashboard
      'dashboard': 'डैशबोर्ड',
      'myReports': 'मेरी रिपोर्ट्स',
      'consultations': 'परामर्श',
      'history': 'इतिहास',
      'profile': 'प्रोफाइल',
      
      // Doctor
      'patientReports': 'रोगी रिपोर्ट्स',
      'activeConsultations': 'सक्रिय परामर्श',
      'medicalHistory': 'चिकित्सा इतिहास',
      'viewDetails': 'विवरण देखें',
      'startConsultation': 'परामर्श शुरू करें',
      
      // Messages
      'noReports': 'कोई स्वास्थ्य रिपोर्ट नहीं मिली',
      'reportSubmitted': 'स्वास्थ्य रिपोर्ट सफलतापूर्वक जमा की गई',
      'loginSuccess': 'लॉगिन सफल',
      'registrationSuccess': 'पंजीकरण सफल',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n