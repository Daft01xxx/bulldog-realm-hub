import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

const BoneResetTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      // MSK is UTC+3
      const mskOffset = 3 * 60; // minutes
      const currentMskTime = new Date(now.getTime() + (mskOffset + now.getTimezoneOffset()) * 60000);
      
      // Next reset is at 23:59 MSK today, or tomorrow if we're past that
      const nextReset = new Date(currentMskTime);
      nextReset.setHours(23, 59, 0, 0);
      
      // If we're past 23:59, set to tomorrow
      if (currentMskTime >= nextReset) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      
      const timeDiff = nextReset.getTime() - currentMskTime.getTime();
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card p-4 text-center mb-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-foreground">До обновления косточек</h3>
      </div>
      
      <div className="text-2xl font-mono font-bold text-gold">
        {timeLeft}
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Все косточки обновятся до 1000 в 23:59 МСК
      </div>
    </Card>
  );
};

export default BoneResetTimer;
