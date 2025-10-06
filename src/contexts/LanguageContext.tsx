import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ru' | 'en';

interface Translations {
  [key: string]: {
    ru: string;
    en: string;
  };
}

const translations: Translations = {
  // Language Select Page
  'multichain.ecosystem': {
    ru: 'BDOG MULTICHAIN ECOSYSTEM',
    en: 'BDOG MULTICHAIN ECOSYSTEM'
  },
  'continue.russian': {
    ru: 'Продолжить на русском',
    en: 'Continue in Russian'
  },
  'continue.english': {
    ru: 'Продолжить на английском',
    en: 'Continue in English'
  },
  // BDOG ID Page
  'bdog.id': {
    ru: 'BDOG ID',
    en: 'BDOG ID'
  },
  'agree.terms': {
    ru: 'Я соглашаюсь с пользовательским соглашением',
    en: 'I agree to the terms of service'
  },
  'agree.privacy': {
    ru: 'Я соглашаюсь с обработкой персональных данных',
    en: 'I agree to the processing of personal data'
  },
  'remember.me': {
    ru: 'Запомнить меня',
    en: 'Remember me'
  },
  'login': {
    ru: 'Войти',
    en: 'Login'
  },
  'loading': {
    ru: 'Загрузка...',
    en: 'Loading...'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bdog-language');
    return (saved === 'ru' || saved === 'en') ? saved : 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bdog-language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
