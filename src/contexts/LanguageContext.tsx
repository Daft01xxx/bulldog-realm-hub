import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ru' | 'en' | 'zh' | 'es' | 'de' | 'fr' | 'it' | 'ja' | 'ko' | 'uk' | 'sv';

interface Translations {
  [key: string]: {
    ru: string;
    en: string;
    zh: string;
    es: string;
    de: string;
    fr: string;
    it: string;
    ja: string;
    ko: string;
    uk: string;
    sv: string;
  };
}

export const languageNames: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  uk: 'Українська',
  sv: 'Svenska'
};

const translations: Translations = {
  // Language selection
  'select.language': {
    ru: 'Выбрать язык',
    en: 'Select Language',
    zh: '选择语言',
    es: 'Seleccionar idioma',
    de: 'Sprache wählen',
    fr: 'Sélectionner la langue',
    it: 'Seleziona lingua',
    ja: '言語を選択',
    ko: '언어 선택',
    uk: 'Вибрати мову',
    sv: 'Välj språk'
  },
  'user.id': {
    ru: 'ID пользователя',
    en: 'User ID',
    zh: '用户ID',
    es: 'ID de usuario',
    de: 'Benutzer-ID',
    fr: 'ID utilisateur',
    it: 'ID utente',
    ja: 'ユーザーID',
    ko: '사용자 ID',
    uk: 'ID користувача',
    sv: 'Användar-ID'
  },
  // Navigation
  'nav.main': {
    ru: 'Главное меню',
    en: 'Main Menu',
    zh: '主菜单',
    es: 'Menú principal',
    de: 'Hauptmenü',
    fr: 'Menu principal',
    it: 'Menu principale',
    ja: 'メインメニュー',
    ko: '메인 메뉴',
    uk: 'Головне меню',
    sv: 'Huvudmeny'
  },
  'nav.wallet': {
    ru: 'Кошелёк',
    en: 'Wallet',
    zh: '钱包',
    es: 'Billetera',
    de: 'Geldbörse',
    fr: 'Portefeuille',
    it: 'Portafoglio',
    ja: 'ウォレット',
    ko: '지갑',
    uk: 'Гаманець',
    sv: 'Plånbok'
  },
  'nav.game': {
    ru: 'Игра',
    en: 'Game',
    zh: '游戏',
    es: 'Juego',
    de: 'Spiel',
    fr: 'Jeu',
    it: 'Gioco',
    ja: 'ゲーム',
    ko: '게임',
    uk: 'Гра',
    sv: 'Spel'
  },
  'nav.miner': {
    ru: 'Майнер',
    en: 'Miner',
    zh: '矿工',
    es: 'Minero',
    de: 'Miner',
    fr: 'Mineur',
    it: 'Minatore',
    ja: 'マイナー',
    ko: '채굴기',
    uk: 'Майнер',
    sv: 'Gruvarbetare'
  },
  'nav.info': {
    ru: 'Информация',
    en: 'Information',
    zh: '信息',
    es: 'Información',
    de: 'Information',
    fr: 'Information',
    it: 'Informazioni',
    ja: '情報',
    ko: '정보',
    uk: 'Інформація',
    sv: 'Information'
  },
  'nav.referral': {
    ru: 'Рефералы',
    en: 'Referrals',
    zh: '推荐',
    es: 'Referencias',
    de: 'Empfehlungen',
    fr: 'Parrainages',
    it: 'Referenze',
    ja: '紹介',
    ko: '추천',
    uk: 'Реферали',
    sv: 'Hänvisningar'
  },
  'nav.promotion': {
    ru: 'Продвижение',
    en: 'Promotion',
    zh: '推广',
    es: 'Promoción',
    de: 'Werbung',
    fr: 'Promotion',
    it: 'Promozione',
    ja: 'プロモーション',
    ko: '프로모션',
    uk: 'Просування',
    sv: 'Kampanj'
  },
  'nav.support': {
    ru: 'Поддержка',
    en: 'Support',
    zh: '支持',
    es: 'Soporte',
    de: 'Unterstützung',
    fr: 'Assistance',
    it: 'Supporto',
    ja: 'サポート',
    ko: '지원',
    uk: 'Підтримка',
    sv: 'Support'
  },
  'back': {
    ru: 'Назад',
    en: 'Back',
    zh: '返回',
    es: 'Volver',
    de: 'Zurück',
    fr: 'Retour',
    it: 'Indietro',
    ja: '戻る',
    ko: '뒤로',
    uk: 'Назад',
    sv: 'Tillbaka'
  },
  'menu': {
    ru: 'Меню',
    en: 'Menu',
    zh: '菜单',
    es: 'Menú',
    de: 'Menü',
    fr: 'Menu',
    it: 'Menu',
    ja: 'メニュー',
    ko: '메뉴',
    uk: 'Меню',
    sv: 'Meny'
  },
  // Menu Page
  'bdog.app': {
    ru: 'BDOG APP',
    en: 'BDOG APP',
    zh: 'BDOG 应用',
    es: 'BDOG APP',
    de: 'BDOG APP',
    fr: 'BDOG APP',
    it: 'BDOG APP',
    ja: 'BDOG アプリ',
    ko: 'BDOG 앱',
    uk: 'BDOG додаток',
    sv: 'BDOG APP'
  },
  'menu.wallet': {
    ru: 'Кошелёк BDOG',
    en: 'BDOG Wallet',
    zh: 'BDOG 钱包',
    es: 'Billetera BDOG',
    de: 'BDOG Geldbörse',
    fr: 'Portefeuille BDOG',
    it: 'Portafoglio BDOG',
    ja: 'BDOG ウォレット',
    ko: 'BDOG 지갑',
    uk: 'Гаманець BDOG',
    sv: 'BDOG Plånbok'
  },
  'menu.wallet.desc': {
    ru: 'Управляйте своими токенами',
    en: 'Manage your tokens',
    zh: '管理您的代币',
    es: 'Gestiona tus tokens',
    de: 'Verwalten Sie Ihre Token',
    fr: 'Gérez vos jetons',
    it: 'Gestisci i tuoi token',
    ja: 'トークンを管理',
    ko: '토큰 관리',
    uk: 'Керуйте своїми токенами',
    sv: 'Hantera dina tokens'
  },
  'menu.game': {
    ru: 'BDOG GAME',
    en: 'BDOG GAME',
    zh: 'BDOG GAME',
    es: 'BDOG GAME',
    de: 'BDOG GAME',
    fr: 'BDOG GAME',
    it: 'BDOG GAME',
    ja: 'BDOG GAME',
    ko: 'BDOG GAME',
    uk: 'BDOG GAME',
    sv: 'BDOG GAME'
  },
  'menu.game.desc': {
    ru: 'Играйте и зарабатывайте',
    en: 'Play and earn',
    zh: '玩游戏并赚取',
    es: 'Juega y gana',
    de: 'Spielen und verdienen',
    fr: 'Jouez et gagnez',
    it: 'Gioca e guadagna',
    ja: 'プレイして稼ぐ',
    ko: '플레이하고 벌기',
    uk: 'Грай і заробляй',
    sv: 'Spela och tjäna'
  },
  'menu.miner': {
    ru: 'Майнер',
    en: 'Miner',
    zh: '矿工',
    es: 'Minero',
    de: 'Miner',
    fr: 'Mineur',
    it: 'Minatore',
    ja: 'マイナー',
    ko: '채굴기',
    uk: 'Майнер',
    sv: 'Gruvarbetare'
  },
  'menu.miner.desc': {
    ru: 'Пассивный доход V-BDOG',
    en: 'Passive V-BDOG income',
    zh: '被动 V-BDOG 收入',
    es: 'Ingresos pasivos V-BDOG',
    de: 'Passives V-BDOG Einkommen',
    fr: 'Revenu passif V-BDOG',
    it: 'Reddito passivo V-BDOG',
    ja: '受動的 V-BDOG 収入',
    ko: '수동적 V-BDOG 수입',
    uk: 'Пасивний дохід V-BDOG',
    sv: 'Passiv V-BDOG inkomst'
  },
  'menu.info': {
    ru: 'Информация о BDOG',
    en: 'BDOG Information',
    zh: 'BDOG 信息',
    es: 'Información BDOG',
    de: 'BDOG Information',
    fr: 'Information BDOG',
    it: 'Informazioni BDOG',
    ja: 'BDOG 情報',
    ko: 'BDOG 정보',
    uk: 'Інформація про BDOG',
    sv: 'BDOG Information'
  },
  'menu.info.desc': {
    ru: 'Узнайте больше о проекте',
    en: 'Learn more about the project',
    zh: '了解更多关于项目',
    es: 'Aprende más sobre el proyecto',
    de: 'Erfahren Sie mehr über das Projekt',
    fr: 'En savoir plus sur le projet',
    it: 'Scopri di più sul progetto',
    ja: 'プロジェクトの詳細',
    ko: '프로젝트에 대해 더 알아보기',
    uk: 'Дізнайтеся більше про проект',
    sv: 'Läs mer om projektet'
  },
  'menu.referral': {
    ru: 'Реферальная программа',
    en: 'Referral Program',
    zh: '推荐计划',
    es: 'Programa de referencias',
    de: 'Empfehlungsprogramm',
    fr: 'Programme de parrainage',
    it: 'Programma di referenza',
    ja: '紹介プログラム',
    ko: '추천 프로그램',
    uk: 'Реферальна програма',
    sv: 'Hänvisningsprogram'
  },
  'menu.referral.desc': {
    ru: 'Приглашайте друзей',
    en: 'Invite friends',
    zh: '邀请朋友',
    es: 'Invita amigos',
    de: 'Freunde einladen',
    fr: 'Invitez des amis',
    it: 'Invita amici',
    ja: '友達を招待',
    ko: '친구 초대',
    uk: 'Запрошуйте друзів',
    sv: 'Bjud in vänner'
  },
  'menu.promotion': {
    ru: 'Реклама проекта за вознаграждение',
    en: 'Promote for rewards',
    zh: '推广以获得奖励',
    es: 'Promociona para recompensas',
    de: 'Werben für Belohnungen',
    fr: 'Promouvoir pour des récompenses',
    it: 'Promuovi per premi',
    ja: '報酬のためのプロモーション',
    ko: '보상을 위한 홍보',
    uk: 'Рекламуйте за винагороду',
    sv: 'Marknadsför för belöningar'
  },
  'menu.promotion.desc': {
    ru: 'Продвигайте и получайте награды',
    en: 'Promote and get rewards',
    zh: '推广并获得奖励',
    es: 'Promociona y obtén recompensas',
    de: 'Werben und Belohnungen erhalten',
    fr: 'Promouvoir et obtenir des récompenses',
    it: 'Promuovi e ottieni premi',
    ja: 'プロモーションして報酬を得る',
    ko: '홍보하고 보상 받기',
    uk: 'Просувайте і отримуйте винагороди',
    sv: 'Marknadsför och få belöningar'
  },
  'menu.support': {
    ru: 'Поддержка',
    en: 'Support',
    zh: '支持',
    es: 'Soporte',
    de: 'Unterstützung',
    fr: 'Assistance',
    it: 'Supporto',
    ja: 'サポート',
    ko: '지원',
    uk: 'Підтримка',
    sv: 'Support'
  },
  'menu.support.desc': {
    ru: 'Связаться с поддержкой',
    en: 'Contact support',
    zh: '联系支持',
    es: 'Contactar soporte',
    de: 'Support kontaktieren',
    fr: 'Contacter le support',
    it: 'Contatta il supporto',
    ja: 'サポートに連絡',
    ko: '지원 센터 문의',
    uk: 'Зв\'язатися з підтримкою',
    sv: 'Kontakta support'
  },
  'menu.data.transfer': {
    ru: 'Перенос данных',
    en: 'Data Transfer',
    zh: '数据传输',
    es: 'Transferencia de datos',
    de: 'Datenübertragung',
    fr: 'Transfert de données',
    it: 'Trasferimento dati',
    ja: 'データ転送',
    ko: '데이터 전송',
    uk: 'Перенесення даних',
    sv: 'Dataöverföring'
  },
  'menu.data.transfer.desc': {
    ru: 'Экспорт и импорт ваших данных',
    en: 'Export and import your data',
    zh: '导出和导入您的数据',
    es: 'Exporta e importa tus datos',
    de: 'Exportieren und importieren Sie Ihre Daten',
    fr: 'Exportez et importez vos données',
    it: 'Esporta e importa i tuoi dati',
    ja: 'データのエクスポートとインポート',
    ko: '데이터 내보내기 및 가져오기',
    uk: 'Експорт та імпорт ваших даних',
    sv: 'Exportera och importera dina data'
  },
  'menu.admin': {
    ru: 'Админ панель',
    en: 'Admin Panel',
    zh: '管理面板',
    es: 'Panel de administración',
    de: 'Admin-Panel',
    fr: 'Panneau d\'administration',
    it: 'Pannello di amministrazione',
    ja: '管理パネル',
    ko: '관리자 패널',
    uk: 'Панель адміністратора',
    sv: 'Adminpanel'
  },
  'menu.admin.desc': {
    ru: 'Управление системой',
    en: 'System management',
    zh: '系统管理',
    es: 'Gestión del sistema',
    de: 'Systemverwaltung',
    fr: 'Gestion du système',
    it: 'Gestione del sistema',
    ja: 'システム管理',
    ko: '시스템 관리',
    uk: 'Керування системою',
    sv: 'Systemhantering'
  },
  'menu.referrals': {
    ru: 'Рефералов:',
    en: 'Referrals:',
    zh: '推荐人数：',
    es: 'Referencias:',
    de: 'Empfehlungen:',
    fr: 'Parrainages:',
    it: 'Referenze:',
    ja: '紹介数：',
    ko: '추천 수：',
    uk: 'Рефералів:',
    sv: 'Hänvisningar:'
  },
  'menu.daily.gift': {
    ru: 'Получить ежедневный подарок',
    en: 'Claim daily gift',
    zh: '领取每日礼物',
    es: 'Reclamar regalo diario',
    de: 'Tägliches Geschenk abholen',
    fr: 'Réclamer cadeau quotidien',
    it: 'Reclama regalo giornaliero',
    ja: '毎日のギフトを受け取る',
    ko: '일일 선물 받기',
    uk: 'Отримати щоденний подарунок',
    sv: 'Hämta daglig present'
  },
  'menu.daily.next': {
    ru: 'Следующий подарок через',
    en: 'Next gift in',
    zh: '下次礼物时间',
    es: 'Próximo regalo en',
    de: 'Nächstes Geschenk in',
    fr: 'Prochain cadeau dans',
    it: 'Prossimo regalo tra',
    ja: '次のギフトまで',
    ko: '다음 선물까지',
    uk: 'Наступний подарунок через',
    sv: 'Nästa present om'
  },
  'menu.daily.text': {
    ru: 'Получи свой ежедневный бонус!',
    en: 'Get your daily bonus!',
    zh: '获取您的每日奖励！',
    es: '¡Obtén tu bono diario!',
    de: 'Holen Sie sich Ihren täglichen Bonus!',
    fr: 'Obtenez votre bonus quotidien!',
    it: 'Ottieni il tuo bonus giornaliero!',
    ja: '毎日のボーナスを受け取る！',
    ko: '일일 보너스를 받으세요！',
    uk: 'Отримай свій щоденний бонус!',
    sv: 'Få din dagliga bonus!'
  },
  'menu.daily.cooldown': {
    ru: 'Подарок обновляется каждые 24 часа',
    en: 'Gift refreshes every 24 hours',
    zh: '礼物每24小时刷新一次',
    es: 'Regalo se actualiza cada 24 horas',
    de: 'Geschenk wird alle 24 Stunden aktualisiert',
    fr: 'Cadeau se rafraîchit toutes les 24 heures',
    it: 'Regalo si aggiorna ogni 24 ore',
    ja: 'ギフトは24時間ごとに更新されます',
    ko: '선물은 24시간마다 새로고침됩니다',
    uk: 'Подарунок оновлюється кожні 24 години',
    sv: 'Present uppdateras var 24:e timme'
  },
  'menu.ad.text': {
    ru: 'Твоя реклама тут,',
    en: 'Your ad here,',
    zh: '您的广告在这里，',
    es: 'Tu anuncio aquí,',
    de: 'Ihre Anzeige hier,',
    fr: 'Votre publicité ici,',
    it: 'Il tuo annuncio qui,',
    ja: 'あなたの広告はこちら、',
    ko: '여기에 광고를,',
    uk: 'Ваша реклама тут,',
    sv: 'Din annons här,'
  },
  'menu.ad.link': {
    ru: 'пиши нам',
    en: 'contact us',
    zh: '联系我们',
    es: 'contáctanos',
    de: 'kontaktiere uns',
    fr: 'contactez-nous',
    it: 'contattaci',
    ja: 'お問い合わせ',
    ko: '문의하기',
    uk: 'пиши нам',
    sv: 'kontakta oss'
  },
  // Toast messages
  'toast.copied': {
    ru: 'Скопировано!',
    en: 'Copied!',
    zh: '已复制！',
    es: '¡Copiado!',
    de: 'Kopiert!',
    fr: 'Copié!',
    it: 'Copiato!',
    ja: 'コピーしました！',
    ko: '복사됨！',
    uk: 'Скопійовано!',
    sv: 'Kopierad!'
  },
  'toast.copied.desc': {
    ru: 'ID пользователя скопирован в буфер обмена',
    en: 'User ID copied to clipboard',
    zh: '用户ID已复制到剪贴板',
    es: 'ID de usuario copiado al portapapeles',
    de: 'Benutzer-ID in Zwischenablage kopiert',
    fr: 'ID utilisateur copié dans le presse-papiers',
    it: 'ID utente copiato negli appunti',
    ja: 'ユーザーIDをクリップボードにコピーしました',
    ko: '사용자 ID가 클립보드에 복사됨',
    uk: 'ID користувача скопійовано в буфер обміну',
    sv: 'Användar-ID kopierat till urklipp'
  },
  'toast.error': {
    ru: 'Ошибка',
    en: 'Error',
    zh: '错误',
    es: 'Error',
    de: 'Fehler',
    fr: 'Erreur',
    it: 'Errore',
    ja: 'エラー',
    ko: '오류',
    uk: 'Помилка',
    sv: 'Fel'
  },
  'toast.copy.error': {
    ru: 'Не удалось скопировать ID',
    en: 'Failed to copy ID',
    zh: '无法复制ID',
    es: 'Error al copiar ID',
    de: 'ID konnte nicht kopiert werden',
    fr: 'Échec de la copie de l\'ID',
    it: 'Impossibile copiare l\'ID',
    ja: 'IDのコピーに失敗しました',
    ko: 'ID 복사 실패',
    uk: 'Не вдалося скопіювати ID',
    sv: 'Kunde inte kopiera ID'
  },
  'toast.daily.claimed': {
    ru: 'Ежедневный подарок получен! 🎉',
    en: 'Daily gift claimed! 🎉',
    zh: '每日礼物已领取！🎉',
    es: '¡Regalo diario reclamado! 🎉',
    de: 'Tägliches Geschenk abgeholt! 🎉',
    fr: 'Cadeau quotidien réclamé! 🎉',
    it: 'Regalo giornaliero reclamato! 🎉',
    ja: '毎日のギフトを受け取りました！🎉',
    ko: '일일 선물 받기 완료！🎉',
    uk: 'Щоденний подарунок отримано! 🎉',
    sv: 'Daglig present hämtad! 🎉'
  },
  'toast.daily.congrats': {
    ru: 'Поздравляем! Вы получили:',
    en: 'Congratulations! You received:',
    zh: '恭喜！您获得了：',
    es: '¡Felicidades! Recibiste:',
    de: 'Glückwunsch! Sie haben erhalten:',
    fr: 'Félicitations! Vous avez reçu:',
    it: 'Congratulazioni! Hai ricevuto:',
    ja: 'おめでとうございます！受け取りました：',
    ko: '축하합니다! 받았습니다:',
    uk: 'Вітаємо! Ви отримали:',
    sv: 'Grattis! Du fick:'
  },
  'toast.daily.already': {
    ru: 'Ежедневный подарок',
    en: 'Daily Gift',
    zh: '每日礼物',
    es: 'Regalo diario',
    de: 'Tägliches Geschenk',
    fr: 'Cadeau quotidien',
    it: 'Regalo giornaliero',
    ja: '毎日のギフト',
    ko: '일일 선물',
    uk: 'Щоденний подарунок',
    sv: 'Daglig present'
  },
  'toast.daily.already.desc': {
    ru: 'Подарок уже получен сегодня! Попробуйте завтра.',
    en: 'Gift already claimed today! Try again tomorrow.',
    zh: '今天已领取礼物！请明天再试。',
    es: '¡Regalo ya reclamado hoy! Intenta mañana.',
    de: 'Geschenk heute bereits abgeholt! Versuchen Sie es morgen erneut.',
    fr: 'Cadeau déjà réclamé aujourd\'hui! Réessayez demain.',
    it: 'Regalo già reclamato oggi! Riprova domani.',
    ja: '本日既に受け取りました！明日また試してください。',
    ko: '오늘 이미 받았습니다! 내일 다시 시도하세요.',
    uk: 'Подарунок вже отримано сьогодні! Спробуйте завтра.',
    sv: 'Present redan hämtad idag! Försök igen imorgon.'
  },
  'toast.daily.fail': {
    ru: 'Не удалось получить ежедневный подарок. Попробуйте еще раз.',
    en: 'Failed to claim daily gift. Please try again.',
    zh: '无法领取每日礼物。请再试一次。',
    es: 'Error al reclamar regalo diario. Inténtalo de nuevo.',
    de: 'Tägliches Geschenk konnte nicht abgeholt werden. Bitte versuchen Sie es erneut.',
    fr: 'Échec de la réclamation du cadeau quotidien. Veuillez réessayer.',
    it: 'Impossibile reclamare il regalo giornaliero. Riprova.',
    ja: '毎日のギフトを受け取れませんでした。もう一度お試しください。',
    ko: '일일 선물 받기 실패. 다시 시도하세요.',
    uk: 'Не вдалося отримати щоденний подарунок. Спробуйте ще раз.',
    sv: 'Kunde inte hämta daglig present. Försök igen.'
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
    const validLanguages: Language[] = ['ru', 'en', 'zh', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'uk', 'sv'];
    return validLanguages.includes(saved as Language) ? (saved as Language) : 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bdog-language', lang);
  };

  // Auto-detect language based on IP on first visit
  useEffect(() => {
    const saved = localStorage.getItem('bdog-language');
    if (!saved) {
      // Only detect language if no language is saved
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const countryCode = data.country_code?.toLowerCase();
          const languageMap: Record<string, Language> = {
            'cn': 'zh',
            'us': 'en',
            'gb': 'en',
            'au': 'en',
            'ca': 'en',
            'ru': 'ru',
            'es': 'es',
            'mx': 'es',
            'ar': 'es',
            'de': 'de',
            'at': 'de',
            'ch': 'de',
            'fr': 'fr',
            'be': 'fr',
            'it': 'it',
            'jp': 'ja',
            'kr': 'ko',
            'ua': 'uk',
            'se': 'sv'
          };
          
          const detectedLang = languageMap[countryCode] || 'en';
          setLanguage(detectedLang);
        })
        .catch(() => {
          // If detection fails, keep default language
          console.log('Failed to detect language from IP');
        });
    }
  }, []);

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
