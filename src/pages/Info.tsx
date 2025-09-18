import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ExternalLink } from "lucide-react";

const Info = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      name: "Telegram",
      icon: "📱",
      url: "https://t.me/smarty_crypto",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "TikTok", 
      icon: "🎵",
      url: "https://www.tiktok.com/@bulldogcommunity?_t=ZS-8zmIijAcJj6&_r=1",
      color: "from-pink-500 to-red-500"
    },
    {
      name: "Поддержка",
      icon: "💬", 
      url: "https://t.me/Deff0xq",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2" />
          Меню
        </Button>
      </div>

      {/* Social links */}
      <div className="max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-bold text-foreground text-center mb-6 animate-fade-in-up">
          Наши социальные сети
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {socialLinks.map((link, index) => (
            <Card 
              key={link.name}
              className="card-glow p-4 hover-lift cursor-pointer animate-slide-in-right"
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => window.open(link.url, "_blank")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{link.icon}</div>
                  <span className="text-lg font-semibold text-foreground">
                    {link.name}
                  </span>
                </div>
                <ExternalLink className="w-5 h-5 text-gold" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <Card className="card-glow p-6">
          <h2 className="text-2xl font-bold text-gradient mb-6 text-center">
            Bulldog Multichain Ecosystem
          </h2>
          
          <div className="space-y-6 text-foreground">
            <div>
              <h3 className="text-xl font-semibold text-gold mb-3">2-й квартал 2025 года — запуск экосистемы</h3>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Запуск токена BDOG в приложении Blum (28 марта 2025 года) — завершён</li>
                <li>• Первоначальная настройка сообщества: веб-сайт, Telegram-канал и чат</li>
                <li>• Создание и запуск коллекций NFT: стикеры Bulldog</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gold mb-3">4-й квартал 2025 года — выход на рынок</h3>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Листинг BDOG на DEX (TON)</li>
                <li>• Создание пулов ликвидности BDOG/USD и BDOG/TON</li>
                <li>• Распределение вознаграждений NFT</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gold mb-3">4-й квартал 2025 года — расширение мультичейна I</h3>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Интеграция в экосистему TRON</li>
                <li>• Запуск пулов BDOG/TRON и BDOG/USD (TRON)</li>
                <li>• Балансировка цены BDOG с помощью межсетевого механизма 1:1</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gold mb-3">4-й квартал 2025 года — расширение Multichain II</h3>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Расширение на BNB Chain и Solana</li>
                <li>• Пулы ликвидности: BDOG/BNB, BDOG/SOL, BDOG/USD</li>
                <li>• Укрепление сообщества: новые стикеры NFT</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gold mb-3">1-й квартал 2026 года — Ethereum и глобальный запуск</h3>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Запуск на Ethereum (Launchpool)</li>
                <li>• Создание пулов BDOG/ETH и BDOG/USDT</li>
                <li>• Полная мультичейн-интеграция (TON, TRON, BNB, SOL, ETH)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="card-glow p-6">
          <h2 className="text-2xl font-bold text-gradient mb-6">
            Кто мы? И каковы наши ценности?
          </h2>
          
          <div className="space-y-4 text-muted-foreground">
            <p>
              Мы — команда трудолюбивых людей, финансовых экспертов и разработчиков игр. 
              Наше кредо — честность и порядочность по отношению ко всему сообществу!
            </p>
            <p>
              С нами невозможно провернуть аферу. Это противоречит нашим ценностям! 
              Мы ориентируемся на долгосрочный рост, мощную поддержку сообщества и высокую ликвидность.
            </p>
            <p>
              Мы стремимся идти в ногу со временем и внедрять технологии искусственного интеллекта.
            </p>
          </div>
        </Card>

        <Card className="card-glow p-6">
          <h2 className="text-2xl font-bold text-gradient mb-6">
            Наши планы
          </h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                1) Запуск токена BDOG в приложении Blum — ЗАВЕРШЕНО
              </h4>
              <p className="text-muted-foreground">
                Дата запуска: 28 марта 2025 года, около 13:00 по всемирному координированному времени
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                2) Создание инфраструктуры Multichain — В ПРОЦЕССЕ
              </h4>
              <p className="text-muted-foreground">
                Созданы веб-сайт, Telegram-канал, стикеры Bulldog для Telegram и группа сообщества. 
                Интеграция в экосистему TRON в рамках единой мультичейн-среды.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                3) Маркетинг — В ПРОЦЕССЕ
              </h4>
              <p className="text-muted-foreground">
                Постоянно создаются рекламные видеоролики. Планируются конкурсы и розыгрыши 
                с вознаграждением в наших токенах.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                4) Создание коллекций NFT — ВЫПОЛНЕНО
              </h4>
              <p className="text-muted-foreground">
                Коллекция стикеров в Telegram токенизирована на Getgems.io 
                как коллекция Bulldog Stickers.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                5) Разработка видеоигры
              </h4>
              <p className="text-muted-foreground">
                Создание собственной студии GameDev. В игре BDOG будет единственной внутриигровой валютой 
                для покупки дополнений, скинов, NFT-предметов и подписок.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gold mb-2">
                6) Предложения по продвижению токена
              </h4>
              <p className="text-muted-foreground">
                Создавайте видеоролики в TikTok, рекламирующие наш токен. 
                Можно использовать нейронные сети и контент, созданный искусственным интеллектом.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Info;