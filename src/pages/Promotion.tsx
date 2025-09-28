import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, TrendingUp, Eye, MessageSquare } from "lucide-react";
import { AudioManager } from '@/components/AudioManager';

const Promotion = () => {
  const navigate = useNavigate();

  const promotionTasks = [
    {
      title: "Создай вирусный ролик",
      description: "Сними креативное видео о BDOG для TikTok или YouTube",
      reward: "500,000 V-BDOG",
      icon: TrendingUp,
      gradient: "from-purple-500 via-pink-500 to-red-500"
    },
    {
      title: "Стрим с BDOG",
      description: "Проведи прямую трансляцию игры в BDOG на популярной платформе",
      reward: "1,000,000 V-BDOG", 
      icon: Eye,
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    },
    {
      title: "Пост в социальных сетях",
      description: "Опубликуй качественный пост о BDOG в своих соцсетях",
      reward: "250,000 V-BDOG",
      icon: MessageSquare,
      gradient: "from-gold via-yellow-400 to-orange-500"
    }
  ];

  const tips = [
    "Используй трендовые хештеги и музыку",
    "Покажи реальный геймплей и заработок", 
    "Делись личными эмоциями от игры",
    "Создавай уникальный контент с AI",
    "Объясняй простыми словами про крипто"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-2 py-4">
      <AudioManager backgroundMusic={false} volume={0.05} />
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold shadow-gold"
        >
          <ArrowLeft className="w-3 h-3 mr-1 icon-gold" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold shadow-gold"
        >
          <Home className="w-3 h-3 mr-1 icon-gold" />
          Меню
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold text-gradient animate-glow-text mb-4">
            💰 Заработай на рекламе
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Стань промоутером BDOG и получай крутые награды за качественный контент в социальных сетях
          </p>
        </div>
      </div>

      {/* Promotion Tasks */}
      <div className="max-w-xs mx-auto mb-6">
        <h2 className="text-lg font-bold text-center text-gradient mb-4 animate-fade-in-up">
          🎯 Доступные задания
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {promotionTasks.map((task, index) => {
            const IconComponent = task.icon;
            return (
              <Card 
                key={task.title}
                className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-2 border-gold/30 hover:border-gold/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gold/25 animate-slide-in-right group"
                style={{animationDelay: `${index * 0.15}s`}}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${task.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                <div className="relative p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gold/80 to-gold flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <IconComponent className="w-6 h-6 text-black" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-gold transition-colors">
                    {task.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {task.description}
                  </p>
                  
                  <div className="bg-gradient-to-r from-gold to-gold-light rounded-lg p-2 shadow-lg">
                    <p className="text-black font-bold text-sm">
                      💎 {task.reward}
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