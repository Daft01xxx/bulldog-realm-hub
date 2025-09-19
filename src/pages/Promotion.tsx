import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, TrendingUp, Eye, MessageSquare } from "lucide-react";

const Promotion = () => {
  const navigate = useNavigate();

  const promotionTasks = [
    {
      title: "Пост в Telegram",
      description: "Опубликуйте пост о BDOG в своем Telegram канале",
      reward: "2,500,000 V-BDOG",
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "100,000 просмотров в TikTok",
      description: "Создайте видео о BDOG и наберите 100к просмотров",
      reward: "1,000,000 V-BDOG", 
      icon: Eye,
      color: "from-pink-500 to-red-500"
    },
    {
      title: "1,000,000 просмотров в TikTok",
      description: "Создайте вирусное видео о BDOG с миллионом просмотров",
      reward: "5,000,000 V-BDOG",
      icon: TrendingUp,
      color: "from-gold to-gold-light"
    }
  ];

  const tips = [
    "Используйте хештеги #BDOG #BulldogToken #CryptoGaming",
    "Показывайте игровой процесс и возможности заработка", 
    "Добавляйте эмоции и личный опыт",
    "Используйте нейронные сети для создания контента",
    "Создавайте обучающий контент про криптовалюты"
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

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient animate-glow-text mb-4">
          Реклама проекта за вознаграждение
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Продвигайте BDOG в социальных сетях и получайте щедрые награды в токенах V-BDOG
        </p>
      </div>

      {/* Promotion tasks */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
          Задания для промоутеров
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotionTasks.map((task, index) => {
            const IconComponent = task.icon;
            return (
              <Card 
                key={task.title}
                className="card-glow p-6 hover-lift cursor-pointer animate-slide-in-right"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center animate-pulse-gold">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {task.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {task.description}
                  </p>
                  
                  <div className="bg-gradient-gold rounded-lg p-3">
                    <p className="text-black font-bold text-lg">
                      {task.reward}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips section */}
      <Card className="card-glow max-w-2xl mx-auto p-6 mb-8 animate-bounce-in" style={{animationDelay: '0.4s'}}>
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">
          Советы по успешному продвижению
        </h3>
        
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 animate-fade-in-up"
              style={{animationDelay: `${0.5 + index * 0.1}s`}}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Requirements */}
      <Card className="card-glow max-w-2xl mx-auto p-6 mb-8 animate-slide-in-right" style={{animationDelay: '0.6s'}}>
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">
          Требования к контенту
        </h3>
        
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
            <p>Контент должен быть оригинальным и качественным</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
            <p>Обязательно упоминание BDOG и ссылки на проект</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
            <p>Можно использовать AI-генерированный контент</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full"></div>
            <p>Предоставьте скриншоты статистики для подтверждения</p>
          </div>
        </div>
      </Card>

      {/* Contact info */}
      <Card className="card-glow max-w-md mx-auto p-6 text-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Готовы начать промоутинг?
        </h3>
        
        <p className="text-muted-foreground mb-4">
          Свяжитесь с нами для получения дополнительной информации и подтверждения выполненных заданий
        </p>
        
        <Button
          onClick={() => window.open("https://t.me/Deff0xq", "_blank")}
          className="button-gold w-full group"
        >
          <MessageSquare className="w-4 h-4 mr-2 group-hover:animate-pulse" />
          Связаться с нами
        </Button>
      </Card>
    </div>
  );
};

export default Promotion;