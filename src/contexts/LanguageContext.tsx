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
  },
  // Menu Page
  'bdog.app': {
    ru: 'BDOG APP',
    en: 'BDOG APP'
  },
  'menu.wallet': {
    ru: 'Кошелёк BDOG',
    en: 'BDOG Wallet'
  },
  'menu.wallet.desc': {
    ru: 'Управляйте своими токенами',
    en: 'Manage your tokens'
  },
  'menu.game': {
    ru: 'BDOG GAME',
    en: 'BDOG GAME'
  },
  'menu.game.desc': {
    ru: 'Играйте и зарабатывайте',
    en: 'Play and earn'
  },
  'menu.miner': {
    ru: 'Майнер',
    en: 'Miner'
  },
  'menu.miner.desc': {
    ru: 'Пассивный доход V-BDOG',
    en: 'Passive V-BDOG income'
  },
  'menu.info': {
    ru: 'Информация о BDOG',
    en: 'BDOG Information'
  },
  'menu.info.desc': {
    ru: 'Узнайте больше о проекте',
    en: 'Learn more about the project'
  },
  'menu.referral': {
    ru: 'Реферальная программа',
    en: 'Referral Program'
  },
  'menu.referral.desc': {
    ru: 'Приглашайте друзей',
    en: 'Invite friends'
  },
  'menu.promotion': {
    ru: 'Реклама проекта за вознаграждение',
    en: 'Promote for rewards'
  },
  'menu.promotion.desc': {
    ru: 'Продвигайте и получайте награды',
    en: 'Promote and get rewards'
  },
  'menu.support': {
    ru: 'Поддержка',
    en: 'Support'
  },
  'menu.support.desc': {
    ru: 'Связаться с поддержкой',
    en: 'Contact support'
  },
  'menu.admin': {
    ru: 'Админ панель',
    en: 'Admin Panel'
  },
  'menu.admin.desc': {
    ru: 'Управление системой',
    en: 'System management'
  },
  'menu.referrals': {
    ru: 'Рефералов:',
    en: 'Referrals:'
  },
  'menu.daily.gift': {
    ru: 'Получить ежедневный подарок',
    en: 'Claim daily gift'
  },
  'menu.daily.next': {
    ru: 'Следующий подарок через',
    en: 'Next gift in'
  },
  'menu.daily.text': {
    ru: 'Получи свой ежедневный бонус!',
    en: 'Get your daily bonus!'
  },
  'menu.daily.cooldown': {
    ru: 'Подарок обновляется каждые 24 часа',
    en: 'Gift refreshes every 24 hours'
  },
  'menu.ad.text': {
    ru: 'Твоя реклама тут,',
    en: 'Your ad here,'
  },
  'menu.ad.link': {
    ru: 'пиши нам',
    en: 'contact us'
  },
  // Navigation
  'nav.main': {
    ru: 'Главное меню',
    en: 'Main Menu'
  },
  'nav.main.desc': {
    ru: 'Вернуться в главное меню',
    en: 'Return to main menu'
  },
  // Toast messages
  'toast.copied': {
    ru: 'Скопировано!',
    en: 'Copied!'
  },
  'toast.copied.desc': {
    ru: 'ID пользователя скопирован в буфер обмена',
    en: 'User ID copied to clipboard'
  },
  'toast.error': {
    ru: 'Ошибка',
    en: 'Error'
  },
  'toast.copy.error': {
    ru: 'Не удалось скопировать ID',
    en: 'Failed to copy ID'
  },
  'toast.daily.claimed': {
    ru: 'Ежедневный подарок получен! 🎉',
    en: 'Daily gift claimed! 🎉'
  },
  'toast.daily.congrats': {
    ru: 'Поздравляем! Вы получили:',
    en: 'Congratulations! You received:'
  },
  'toast.daily.already': {
    ru: 'Ежедневный подарок',
    en: 'Daily Gift'
  },
  'toast.daily.already.desc': {
    ru: 'Подарок уже получен сегодня! Попробуйте завтра.',
    en: 'Gift already claimed today! Try again tomorrow.'
  },
  'toast.daily.fail': {
    ru: 'Не удалось получить ежедневный подарок. Попробуйте еще раз.',
    en: 'Failed to claim daily gift. Please try again.'
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
