import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function BdogPay() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="button-outline-gold"
          >
            <ArrowLeft className="w-4 h-4 text-gold" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-center text-gold">BDOG PAY</h1>
        </div>

        {/* Main Content */}
        <Card className="card-glow p-8 text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">
            BDOG PAY
          </h2>
          <p className="text-lg text-muted-foreground">
            Пока недоступно
          </p>
        </Card>
      </div>
    </div>
  );
}