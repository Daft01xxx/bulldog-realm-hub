import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ExternalLink, Send, Music, MessageCircle } from "lucide-react";
import { AudioManager } from '@/components/AudioManager';

const Info = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      name: "Telegram",
      icon: Send,
      url: "https://t.me/smarty_crypto",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "TikTok", 
      icon: Music,
      url: "https://www.tiktok.com/@bulldogcommunity?_t=ZS-8zmIijAcJj6&_r=1",
      color: "from-pink-500 to-red-500"
    },
    {
      name: "Поддержка",
      icon: MessageCircle, 
      url: "https://t.me/Deff0xq",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background px-1 py-2">
      <AudioManager backgroundMusic={false} volume={0.05} />
      {/* Navigation */}
      <div className="flex justify-between items-center mb-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold text-xs px-2 py-1"
        >
          <ArrowLeft className="w-3 h-3 mr-1 text-gold" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold text-xs px-2 py-1"
        >
          <Home className="w-3 h-3 mr-1 text-gold" />
          Меню
        </Button>
      </div>

      {/* Social links */}
      <div className="max-w-xs mx-auto mb-3">
        <h2 className="text-base font-bold text-foreground text-center mb-2 animate-fade-in-up">
          Наши социальные сети
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          {socialLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Button
                key={link.name}
                onClick={() => window.open(link.url, "_blank")}
                className="button-gold w-full justify-between py-6 animate-slide-in-right hover-lift"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <span className="text-base font-semibold">
                    {link.name}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xs mx-auto space-y-3 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <Card className="card-glow p-4">
          <h2 className="text-lg font-bold text-gradient mb-4 text-center">
            Bulldog Multichain Ecosystem
          </h2>
          
          <div className="space-y-4 text-foreground">
            <div>
              <h3 className="text-base font-semibold text-gold mb-2">2-й квартал 2025 года — запуск экосистемы</h3>
              <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                <li>• Запуск токена BDOG в приложении Blum (28 марта 2025 года) — завершён</li>
                <li>• Первоначальная настройка сообщества: веб-сайт, Telegram-канал и чат</li>
                <li>• Создание и запуск коллекций NFT: стикеры Bulldog</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gold mb-2">4-й квартал 2025 года — выход на рынок</h3>
              <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                <li>• Листинг BDOG на DEX (TON)</li>
                <li>• Создание пулов ликвидности BDOG/USD и BDOG/TON</li>
                <li>• Распределение вознаграждений NFT</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gold mb-2">4-й квартал 2025 года — расширение мультичейна I</h3>
              <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                <li>• Интеграция в экосистему TRON</li>
                <li>• Запуск пулов BDOG/TRON и BDOG/USD (TRON)</li>
                <li>• Балансировка цены BDOG с помощью межсетевого механизма 1:1</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gold mb-2">4-й квартал 2025 года — расширение Multichain II</h3>
              <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                <li>• Расширение на BNB Chain и Solana</li>
                <li>• Пулы ликвидности: BDOG/BNB, BDOG/SOL, BDOG/USD</li>
                <li>• Укрепление сообщества: новые стикеры NFT</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gold mb-2">1-й квартал 2026 года — Ethereum и глобальный запуск</h3>
              <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                <li>• Запуск на Ethereum (Launchpool)</li>
                <li>• Создание пулов BDOG/ETH и BDOG/USDT</li>
                <li>• Полная мультичейн-интеграция (TON, TRON, BNB, SOL, ETH)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="card-glow p-4">
          <h2 className="text-lg font-bold text-gradient mb-4">
            Кто мы? И каковы наши ценности?
          </h2>
          
          <div className="space-y-3 text-xs text-muted-foreground">
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

        <Card className="card-glow p-6">
          <h2 className="text-2xl font-bold text-gradient mb-6">
            Премиальные NFT
          </h2>
          
          <div className="space-y-4 text-muted-foreground">
            <p>
              Премиальные NFT - это NFT при покупке которых вы будете получать 5% дохода от приложения 
              (реклама, комиссия, донат).
            </p>
            <p>
              Владельцы премиальных NFT становятся частью элитного сообщества и получают эксклюзивные 
              возможности для заработка в экосистеме BDOG.
            </p>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => window.open("https://getgems.io/collection/EQCuKGJDBPi4dGWuj2VP6B_o2ejoDNiey67NwOGkRjVdDI6b", "_blank")}
                className="button-gradient-gold px-8 py-3 text-lg font-semibold hover-lift"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Купить премиальный NFT
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Info;