import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English', short: 'EN' },
  { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', short: 'ಕನ್ನ' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'हिन्' },
];

export const TRANSLATIONS = {
  en: {
    // Navigation & Sidebar
    dashboard: 'Dashboard',
    submit: 'Submit Complaint',
    my_complaints: 'My Complaints',
    track: 'Track Complaint',
    profile: 'Profile',
    support: 'Help & Support',
    logout: 'Logout',
    portal_name: 'PGMS',
    portal_sub: 'Public Grievance Management',
    motto: 'Your Voice for a Better Community',

    // Header
    welcome_back: 'Welcome Back,',
    citizen_title: 'Citizen',
    notifications: 'Notifications',
    language: 'Language',
    select_language: 'Select Language',

    // Hero Section
    hero_title: 'Have a Civic Problem or Grievance?',
    hero_subtitle: 'File your complaint in 60 seconds with our AI-powered portal. Track resolution in real time.',
    file_grievance: 'File a Grievance',
    track_status: 'Track Status',
    how_it_works: 'How it works: 1. Submit -> 2. AI Classification -> 3. Department Resolution',

    // Stats
    total_submitted: 'Total Filed',
    in_processing: 'In Processing',
    pending_review: 'Pending Review',
    resolved: 'Resolved',
    resolution_rate: 'Resolution Rate',
    avg_response: 'Avg. Response Time',
    hours: 'hours',
    filter_my: 'My Complaints',
    filter_all: 'All Portal Cases',
    refresh: 'Refresh',

    // Track Card
    track_grievance: 'Track Your Grievance',
    track_placeholder: 'Enter Complaint ID (e.g., PGMS-20261024-PUAVG2)...',
    enter_valid_id: 'Please enter a valid Complaint ID',

    // Recent Complaints
    recent_grievances: 'Recent Grievances',
    no_complaints_found: 'No complaints filed yet',
    no_complaints_desc: 'When you submit a complaint via text, photo, audio or PDF, it will appear here.',
    delete: 'Delete',
    delete_confirm_title: 'Delete Complaint Record?',
    delete_confirm_desc: 'This complaint will be permanently removed from MongoDB and your dashboard.',
    cancel: 'Cancel',
    confirm_delete: 'Yes, Delete',
    deleting: 'Deleting...',
    status_pending: 'Pending',
    status_in_progress: 'In Progress',
    status_resolved: 'Resolved',
    status_rejected: 'Rejected',

    // Common Categories
    civic_departments: 'Civic Departments',
    road_potholes: 'Roads & Potholes',
    water_supply: 'Water Supply & Leakage',
    electricity: 'Electricity & Outages',
    sanitation: 'Garbage & Sanitation',
    transport: 'Transport & Traffic',
    view_all: 'View All',
    quick_actions: 'Quick Actions',

    // Submission Methods
    filing_language: 'Dashboard & Filing Language:',
    method_text: 'Standard Online Form',
    method_text_desc: 'Type description directly with instant AI department categorization.',
    method_pdf: 'Official PDF Petition',
    method_pdf_desc: 'Upload formal written grievances, notices, or scanned complaint letters.',
    method_photo: 'Photo / Image Evidence',
    method_photo_desc: 'Upload photos of damaged civic infrastructure, garbage, or leaks.',
    method_voice: 'Voice / Audio Complaint',
    method_voice_desc: 'Speak your complaint in English, Kannada, or Hindi.',

    // Profile View
    profile_title: 'Citizen Profile',
    full_name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    citizen_id: 'Citizen Reference ID',
    account_role: 'Account Role',
    verified_status: 'MongoDB Verified Citizen',
    grievances_summary: 'Your Grievance Summary',

    // Support View
    support_title: 'Citizen Help & Administration Support',
    admin_inquiries: 'Administrative Inquiries',
    admin_email: 'admin@gov.in',
    toll_free: 'National Toll-Free Helpline',
    toll_free_number: '1800-11-4000',
    secretariat: 'Central Grievance Secretariat',
    secretariat_number: '+91 11 2436 0000',
    address: 'Official Office Address',
    address_val: 'Department of Administrative Reforms and Public Grievances (DARPG), 5th Floor, Sardar Patel Bhawan, Sansad Marg, New Delhi 110001',
    hours_val: 'Operational 24x7 across all states and districts.',
  },

  kn: {
    // Navigation & Sidebar
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    submit: 'ದೂರು ಸಲ್ಲಿಸಿ',
    my_complaints: 'ನನ್ನ ದೂರುಗಳು',
    track: 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    profile: 'ಪ್ರೊಫೈಲ್',
    support: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    logout: 'ಲಾಗ್ ಔಟ್',
    portal_name: 'ಪಿ.ಜಿ.ಎಂ.ಎಸ್',
    portal_sub: 'ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿರ್ವಹಣೆ',
    motto: 'ಉತ್ತಮ ಸಮುದಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಧ್ವನಿ',

    // Header
    welcome_back: 'ಮರಳಿ ಸ್ವಾಗತ,',
    citizen_title: 'ನಾಗರಿಕ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    language: 'ಭಾಷೆ',
    select_language: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',

    // Hero Section
    hero_title: 'ಯಾವುದೇ ನಾಗರಿಕ ಸಮಸ್ಯೆ ಅಥವಾ ಕುಂದುಕೊರತೆ ಇದೆಯೇ?',
    hero_subtitle: 'ನಮ್ಮ AI-ಚಾಲಿತ ಪೋರ್ಟಲ್ ಮೂಲಕ 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ದೂರನ್ನು ದಾಖಲಿಸಿ. ನೈಜ ಸಮಯದಲ್ಲಿ ಪರಿಹಾರವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
    file_grievance: 'ದೂರನ್ನು ದಾಖಲಿಸಿ',
    track_status: 'ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    how_it_works: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ: 1. ಸಲ್ಲಿಕೆ -> 2. AI ವರ್ಗೀಕರಣ -> 3. ಇಲಾಖಾ ಪರಿಹಾರ',

    // Stats
    total_submitted: 'ಒಟ್ಟು ದಾಖಲಿಸಿದವು',
    in_processing: 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ',
    pending_review: 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
    resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    resolution_rate: 'ಪರಿಹಾರ ದರ',
    avg_response: 'ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ',
    hours: 'ಗಂಟೆಗಳು',
    filter_my: 'ನನ್ನ ದೂರುಗಳು',
    filter_all: 'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು',
    refresh: 'ನವೀಕರಿಸಿ',

    // Track Card
    track_grievance: 'ನಿಮ್ಮ ಕುಂದುಕೊರತೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    track_placeholder: 'ದೂರು ಐಡಿ ನಮೂದಿಸಿ (ಉದಾ: PGMS-20261024-PUAVG2)...',
    enter_valid_id: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ದೂರು ಐಡಿಯನ್ನು ನಮೂದಿಸಿ',

    // Recent Complaints
    recent_grievances: 'ಇತ್ತೀಚಿನ ಕುಂದುಕೊರತೆಗಳು',
    no_complaints_found: 'ಇನ್ನೂ ಯಾವುದೇ ದೂರು ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ',
    no_complaints_desc: 'ನೀವು ಪಠ್ಯ, ಫೋಟೋ, ಆಡಿಯೋ ಅಥವಾ ಪಿಡಿಎಫ್ ಮೂಲಕ ದೂರನ್ನು ಸಲ್ಲಿಸಿದಾಗ, ಅದು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    delete: 'ಅಳಿಸಿ',
    delete_confirm_title: 'ದೂರು ದಾಖಲೆಯನ್ನು ಅಳಿಸಬೇಕೇ?',
    delete_confirm_desc: 'ಈ ದೂರನ್ನು ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು MongoDB ಯಿಂದ ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirm_delete: 'ಹೌದು, ಅಳಿಸಿ',
    deleting: 'ಅಳಿಸಲಾಗುತ್ತಿದೆ...',
    status_pending: 'ಬಾಕಿ ಇದೆ',
    status_in_progress: 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ',
    status_resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    status_rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',

    // Common Categories
    civic_departments: 'ನಾಗರಿಕ ಇಲಾಖೆಗಳು',
    road_potholes: 'ರಸ್ತೆಗಳು ಮತ್ತು ಗುಂಡಿಗಳು',
    water_supply: 'ನೀರು ಸರಬರಾಜು ಮತ್ತು ಸೋರಿಕೆ',
    electricity: 'ವಿದ್ಯುತ್ ಮತ್ತು ಕಡಿತ',
    sanitation: 'ಕಸ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
    transport: 'ಸಾರಿಗೆ ಮತ್ತು ಸಂಚಾರ',
    view_all: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    quick_actions: 'ತ್ವರಿತ ಕ್ರಮಗಳು',

    // Submission Methods
    filing_language: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು ಸಲ್ಲಿಕೆ ಭಾಷೆ:',
    method_text: 'ಸಾಮಾನ್ಯ ಆನ್‌ಲೈನ್ ನಮೂನೆ',
    method_text_desc: 'ತತ್ಕ್ಷಣದ AI ಇಲಾಖಾ ವರ್ಗೀಕರಣದೊಂದಿಗೆ ವಿವರಣೆಯನ್ನು ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ.',
    method_pdf: 'ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ಅರ್ಜಿ',
    method_pdf_desc: 'ಲಿಖಿತ ದೂರುಗಳು, ಸೂಚನೆಗಳು ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಪತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    method_photo: 'ಫೋಟೋ / ಚಿತ್ರ ಪುರಾವೆ',
    method_photo_desc: 'ಹಾನಿಗೊಳಗಾದ ಮೂಲಸೌಕರ್ಯ, ಕಸ ಅಥವಾ ಸೋರಿಕೆಯ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    method_voice: 'ಧ್ವನಿ / ಆಡಿಯೋ ದೂರು',
    method_voice_desc: 'ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ನಿಮ್ಮ ದೂರನ್ನು ಮಾತನಾಡಿ.',

    // Profile View
    profile_title: 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    phone: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ',
    citizen_id: 'ನಾಗರಿಕ ಉಲ್ಲೇಖ ಐಡಿ',
    account_role: 'ಖಾತೆ ಪಾತ್ರ',
    verified_status: 'MongoDB ಪರಿಶೀಲಿತ ನಾಗರಿಕ',
    grievances_summary: 'ನಿಮ್ಮ ಕುಂದುಕೊರತೆಗಳ ಸಾರಾಂಶ',

    // Support View
    support_title: 'ನಾಗರಿಕ ಸಹಾಯ ಮತ್ತು ಆಡಳಿತ ಬೆಂಬಲ',
    admin_inquiries: 'ಆಡಳಿತಾತ್ಮಕ ವಿಚಾರಣೆಗಳು',
    admin_email: 'admin@gov.in',
    toll_free: 'ರಾಷ್ಟ್ರೀಯ ಉಚಿತ ಸಹಾಯವಾಣಿ',
    toll_free_number: '1800-11-4000',
    secretariat: 'ಕೇಂದ್ರ ಕುಂದುಕೊರತೆ ಸಚಿವಾಲಯ',
    secretariat_number: '+91 11 2436 0000',
    address: 'ಅಧಿಕೃತ ಕಚೇರಿ ವಿಳಾಸ',
    address_val: 'ಆಡಳಿತ ಸುಧಾರಣೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳ ಇಲಾಖೆ (DARPG), ಸರ್ದಾರ್ ಪಟೇಲ್ ಭವನ, ಸಂಸದ್ ಮಾರ್ಗ, ನವದೆಹಲಿ 110001',
    hours_val: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು ಮತ್ತು ಜಿಲ್ಲೆಗಳಲ್ಲಿ 24x7 ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
  },

  hi: {
    // Navigation & Sidebar
    dashboard: 'डैशबोर्ड',
    submit: 'शिकायत दर्ज करें',
    my_complaints: 'मेरी शिकायतें',
    track: 'शिकायत ट्रैक करें',
    profile: 'प्रोफ़ाइल',
    support: 'सहायता और समर्थन',
    logout: 'लॉग आउट',
    portal_name: 'पीजीएमएस',
    portal_sub: 'लोक शिकायत प्रबंधन प्रणाली',
    motto: 'बेहतर समाज के लिए आपकी आवाज़',

    // Header
    welcome_back: 'वापसी पर स्वागत है,',
    citizen_title: 'नागरिक',
    notifications: 'सूचनाएं',
    language: 'भाषा',
    select_language: 'भाषा चुनें',

    // Hero Section
    hero_title: 'कोई नागरिक समस्या या शिकायत है?',
    hero_subtitle: 'हमारे AI-संचालित पोर्टल पर 60 सेकंड में अपनी शिकायत दर्ज करें। वास्तविक समय में निवारण ट्रैक करें।',
    file_grievance: 'शिकायत दर्ज करें',
    track_status: 'स्थिति ट्रैक करें',
    how_it_works: 'यह कैसे कार्य करता है: 1. दर्ज करें -> 2. AI वर्गीकरण -> 3. विभाग द्वारा निवारण',

    // Stats
    total_submitted: 'कुल दर्ज शिकायतें',
    in_processing: 'प्रक्रिया में',
    pending_review: 'समीक्षा लंबित',
    resolved: 'निवारित',
    resolution_rate: 'निवारण दर',
    avg_response: 'औसत प्रतिक्रिया समय',
    hours: 'घंटे',
    filter_my: 'मेरी शिकायतें',
    filter_all: 'सभी पोर्टल मामले',
    refresh: 'रिफ್ರೆश',

    // Track Card
    track_grievance: 'अपनी शिकायत ट्रैक करें',
    track_placeholder: 'शिकायत संख्या दर्ज करें (उदा. PGMS-20261024-PUAVG2)...',
    enter_valid_id: 'कृपया एक मान्य शिकायत आईडी दर्ज करें',

    // Recent Complaints
    recent_grievances: 'हाल की शिकायतें',
    no_complaints_found: 'अभी तक कोई शिकायत दर्ज नहीं है',
    no_complaints_desc: 'जब आप टेक्स्ट, फोटो, ऑडियो या पीडीएफ द्वारा शिकायत दर्ज करेंगे, तो वह यहां दिखाई देगी।',
    delete: 'हटाएं',
    delete_confirm_title: 'क्या शिकायत रिकॉर्ड हटाना चाहते हैं?',
    delete_confirm_desc: 'यह शिकायत आपके डैशबोर्ड और MongoDB से स्थायी रूप से हटा दी जाएगी।',
    cancel: 'रद्द करें',
    confirm_delete: 'हाँ, हटाएं',
    deleting: 'हटाया जा रहा है...',
    status_pending: 'लंबित',
    status_in_progress: 'प्रक्रिया में',
    status_resolved: 'निवारित',
    status_rejected: 'अस्वीकृत',

    // Common Categories
    civic_departments: 'नागरिक विभाग',
    road_potholes: 'सड़कें और गड्ढे',
    water_supply: 'जल आपूर्ति और रिसाव',
    electricity: 'बिजली और कटौती',
    sanitation: 'कचरा और स्वच्छता',
    transport: 'सार्वजनिक परिवहन व यातायात',
    view_all: 'सभी देखें',
    quick_actions: 'त्वरित कार्रवाई',

    // Submission Methods
    filing_language: 'डैशबोर्ड और दर्ज करने की भाषा:',
    method_text: 'मानक ऑनलाइन फॉर्म',
    method_text_desc: 'त्वरित AI विभाग वर्गीकरण के साथ सीधे विवरण टाइप करें।',
    method_pdf: 'आधिकारिक पीडीएफ याचिका',
    method_pdf_desc: 'लिखित शिकायतें, नोटिस या स्कैन किए गए शिकायत पत्र अपलोड करें।',
    method_photo: 'फोटो / चित्र प्रमाण',
    method_photo_desc: 'क्षतिग्रस्त बुनियादी ढांचे, कचरे या रिसाव की तस्वीरें अपलोड करें।',
    method_voice: 'ध्वनि / ऑडियो शिकायत',
    method_voice_desc: 'अंग्रेजी, कन्नड़ या हिंदी में अपनी शिकायत बोलें।',

    // Profile View
    profile_title: 'नागरिक प्रोफ़ाइल',
    full_name: 'पूरा नाम',
    email: 'ईमेल पता',
    phone: 'फ़ोन नंबर',
    citizen_id: 'नागरिक संदर्भ आईडी',
    account_role: 'खाता भूमिका',
    verified_status: 'MongoDB सत्यापित नागरिक',
    grievances_summary: 'आपकी शिकायतों का सारांश',

    // Support View
    support_title: 'नागरिक सहायता और प्रशासनिक सहयोग',
    admin_inquiries: 'प्रशासनिक पूछताछ',
    admin_email: 'admin@gov.in',
    toll_free: 'राष्ट्रीय टोल-फ्री हेल्पलाइन',
    toll_free_number: '1800-11-4000',
    secretariat: 'केंद्रीय शिकायत सचिवालय',
    secretariat_number: '+91 11 2436 0000',
    address: 'आधिकारिक कार्यालय का पता',
    address_val: 'प्रशासनिक सुधार और लोक शिकायत विभाग (DARPG), 5वीं मंजिल, सरदार पटेल भवन, संसद मार्ग, नई दिल्ली 110001',
    hours_val: 'सभी राज्यों और जिलों में 24x7 उपलब्ध।',
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languages: LANGUAGES,
});

const STORAGE_KEY = 'pgms_active_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    if (['en', 'kn', 'hi'].includes(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.warn('Could not store language preference:', e);
      }
    }
  };

  const t = (key, fallback) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    if (TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
