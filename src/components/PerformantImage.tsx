import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface PerformantImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

const PerformantImage = memo(function PerformantImage({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  onClick,
  loading = 'lazy',
  priority = false
}: PerformantImageProps) {
  const { isMobile, isVeryLowEnd, connectionSpeed } = useDevicePerformance();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!loading || loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for very aggressive lazy loading
  useEffect(() => {
    if (loading === 'eager' || priority || !isVeryLowEnd) {
      setIsIntersecting(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: isVeryLowEnd ? '50px' : '100px' } // Smaller preload margin on very low-end
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, priority, isVeryLowEnd]);

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
        <span className="text-muted-foreground text-xs">Ошибка</span>
      </div>
    );
  }

  // Don't load images on very slow connections unless priority
  if (connectionSpeed === 'slow' && !priority && isVeryLowEnd) {
    return (
      <div 
        className={`bg-muted rounded flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-muted-foreground text-xs">📷</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style} ref={imgRef}>
      {!isLoaded && isIntersecting && (
        <div className="absolute inset-0 bg-muted rounded animate-pulse" />
      )}
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            ...style,
            // Disable all filters on very low-end devices
            filter: isVeryLowEnd ? 'none' : isMobile ? 'none' : style.filter,
          }}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          // Optimize for mobile and low-end devices
          decoding="async"
          // Use lower quality on very low-end devices if supported
          fetchPriority={priority ? 'high' : isVeryLowEnd ? 'low' : 'auto'}
        />
      )}
    </div>
  );
});

export default PerformantImage;