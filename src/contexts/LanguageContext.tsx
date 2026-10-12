import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ur';

interface Translations {
  [key: string]: {
    en: string;
    ur: string;
  };
}

const UI_TRANSLATIONS: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  'nav.medications': { en: 'Medications', ur: 'ادویات کی فہرست' },
  'nav.allergies': { en: 'Allergies', ur: 'الرجی کی معلومات' },
  'nav.safety': { en: 'AI Safety Checker', ur: 'اے آئی ادویاتی حفاظت' },
  'nav.healthCard': { en: 'Health Card', ur: 'ایمرجنسی ہیلتھ کارڈ' },
  'nav.userManual': { en: 'User Manual', ur: 'رہنمائے صارف' },

  // Action Buttons
  'action.addMedication': { en: 'Add Medication', ur: 'دوائی شامل کریں' },
  'action.scanPrescription': { en: 'Scan Prescription (AI)', ur: 'نسخہ اسکین کریں (AI)' },
  'action.signIn': { en: 'Sign In', ur: 'سائن ان کریں' },
  'action.signOut': { en: 'Sign Out', ur: 'سائن آؤٹ' },
  'action.createAccount': { en: 'Create Account', ur: 'نیا اکاؤنٹ بنائیں' },
  'action.save': { en: 'Save', ur: 'محفوظ کریں' },
  'action.cancel': { en: 'Cancel', ur: 'منسوخ کریں' },
  'action.print': { en: 'Print Health Card', ur: 'ہیلتھ کارڈ پرنٹ کریں' },
  'action.reScan': { en: 'Re-scan Regimen', ur: 'دوبارہ جانچیں' },

  // Common Headers & Labels
  'app.tagline': {
    en: 'Personal Medication Record & Emergency Health Card',
    ur: 'ذاتی ادویات کا ڈیجیٹل ریکارڈ اور ہنگامی طبی کارڈ',
  },
  'common.language': { en: 'Language', ur: 'زبان' },
  'common.english': { en: 'English', ur: 'English' },
  'common.urdu': { en: 'اردو', ur: 'اردو' },
  'common.cloudSync': { en: 'Cloud Sync', ur: 'کلاؤڈ سنک' },
  'common.active': { en: 'Active', ur: 'فعال' },
  'common.safe': { en: 'Safe', ur: 'محفوظ' },
  'common.caution': { en: 'Caution', ur: 'احتیاط' },
  'common.critical': { en: 'Critical', ur: 'انتہائی اہم' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isUrdu: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dawacard_lang');
    return saved === 'ur' ? 'ur' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dawacard_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const entry = UI_TRANSLATIONS[key];
    if (entry) {
      return entry[language] || entry.en;
    }
    return fallback || key;
  };

  const isUrdu = language === 'ur';
  const dir: 'ltr' | 'rtl' = isUrdu ? 'rtl' : 'ltr';

  // Update HTML dir attribute for proper text rendering
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isUrdu,
        dir,
      }}
    >
      <div className={isUrdu ? 'font-urdu' : ''}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
