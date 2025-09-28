import { memo, useState, useCallback } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage = memo(function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  onClick,
  loading = 'lazy'
}: OptimizedImageProps) {
  const { isMobile } = useDevicePerformance();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div 
        className={`bg-muted rounded flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-muted-foreground text-xs">Ошибка загрузки</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted rounded animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          ...style,
          // Disable expensive filters on mobile for better performance
          filter: isMobile ? 'none' : style.filter,
        }}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        // Optimize for mobile
        decoding="async"
      />
    </div>
  );
});

export default OptimizedImage;