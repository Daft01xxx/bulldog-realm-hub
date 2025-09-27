import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, X } from "lucide-react";

interface VideoWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const VideoWatchModal = ({ isOpen, onClose, onComplete }: VideoWatchModalProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videosWatched, setVideosWatched] = useState<boolean[]>([false, false]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    "/ads/video1.mp4", // Первое видео
    "/ads/video1.mp4"  // Второе видео (то же самое)
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentVideo(0);
      setVideosWatched([false, false]);
      setProgress(0);
      setIsPlaying(false);
    }
  }, [isOpen]);

  const handleVideoEnd = () => {
    const newVideosWatched = [...videosWatched];
    newVideosWatched[currentVideo] = true;
    setVideosWatched(newVideosWatched);

    if (currentVideo === 0) {
      // Переходим к второму видео
      setCurrentVideo(1);
      setProgress(0);
      setIsPlaying(false);
    } else {
      // Оба видео просмотрены
      if (newVideosWatched.every(watched => watched)) {
        onComplete();
        onClose();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const canClose = videosWatched.every(watched => watched);

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gradient">
              Просмотр видео {currentVideo + 1}/2
            </DialogTitle>
            {canClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={videos[currentVideo]}
              className="w-full h-64 object-cover"
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Прогресс видео {currentVideo + 1}: {Math.round(progress)}%
            </p>
          </div>

          {/* Videos completion status */}
          <div className="flex gap-4 mb-4">
            {videos.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-full ${
                    videosWatched[index] ? 'bg-green-500' : 
                    currentVideo === index ? 'bg-gold animate-pulse' : 'bg-muted'
                  }`}
                />
                <span className="text-sm">
                  Видео {index + 1} {videosWatched[index] ? '✓' : currentVideo === index ? '▶' : '○'}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {!canClose 
                ? "Необходимо просмотреть оба видео до конца для получения награды" 
                : "Все видео просмотрены! Вы получили 2000 V-BDOG"
              }
            </p>
            
            {canClose && (
              <Button 
                onClick={onClose}
                className="button-gradient-gold"
              >
                Закрыть
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};