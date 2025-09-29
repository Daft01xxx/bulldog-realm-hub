import React, { useEffect, useState, useCallback, memo } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface ImagePreloaderProps {
  images: string[];
  onLoadComplete?: (loadedCount: number, totalCount: number) => void;
  onLoadProgress?: (progress: number) => void;
  priority: 'high' | 'medium' | 'low';
  maxConcurrent?: number;
}

interface ImageCache {
  [url: string]: {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    blob?: Blob;
    objectUrl?: string;
    timestamp: number;
  };
}

class ImagePreloadManager {
  private static instance: ImagePreloadManager;
  private cache: ImageCache = {};
  private loadingQueue: Array<{
    url: string;
    priority: 'high' | 'medium' | 'low';
    resolve: (success: boolean) => void;
  }> = [];
  private activeLoads = 0;
  private maxConcurrent = 4;

  static getInstance(): ImagePreloadManager {
    if (!ImagePreloadManager.instance) {
      ImagePreloadManager.instance = new ImagePreloadManager();
    }
    return ImagePreloadManager.instance;
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = max;
  }

  private processQueue() {
    if (this.activeLoads >= this.maxConcurrent || this.loadingQueue.length === 0) {
      return;
    }

    // Sort by priority
    this.loadingQueue.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    const { url, resolve } = this.loadingQueue.shift()!;
    this.loadImage(url, resolve);
  }

  private async loadImage(url: string, resolve: (success: boolean) => void) {
    if (this.cache[url]?.loaded) {
      resolve(true);
      return;
    }

    if (this.cache[url]?.loading) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (!this.cache[url]?.loading) {
          clearInterval(checkInterval);
          resolve(this.cache[url]?.loaded || false);
        }
      }, 50);
      return;
    }

    this.cache[url] = {
      loaded: false,
      loading: true,
      error: false,
      timestamp: Date.now()
    };

    this.activeLoads++;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Create and test image loading
      const img = new Image();
      
      await new Promise<void>((resolveImg, rejectImg) => {
        img.onload = () => resolveImg();
        img.onerror = () => rejectImg(new Error('Image load failed'));
        img.src = objectUrl;
      });

      this.cache[url] = {
        loaded: true,
        loading: false,
        error: false,
        blob,
        objectUrl,
        timestamp: Date.now()
      };

      resolve(true);
      
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
      
      this.cache[url] = {
        loaded: false,
        loading: false,
        error: true,
        timestamp: Date.now()
      };

      resolve(false);
    } finally {
      this.activeLoads--;
      this.processQueue();
    }
  }

  async preloadImage(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.cache[url]?.loaded) {
        resolve(true);
        return;
      }

      this.loadingQueue.push({ url, priority, resolve });
      this.processQueue();
    });
  }

  getImageUrl(url: string): string {
    const cached = this.cache[url];
    return cached?.objectUrl || url;
  }

  isLoaded(url: string): boolean {
    return this.cache[url]?.loaded || false;
  }

  cleanup() {
    // Clean up old cache entries (older than 30 minutes)
    const cutoff = Date.now() - 30 * 60 * 1000;
    
    Object.keys(this.cache).forEach(url => {
      const entry = this.cache[url];
      if (entry.timestamp < cutoff) {
        if (entry.objectUrl) {
          URL.revokeObjectURL(entry.objectUrl);
        }
        delete this.cache[url];
      }
    });
  }
}

export const OptimizedImagePreloader: React.FC<ImagePreloaderProps> = memo(({
  images,
  onLoadComplete,
  onLoadProgress,
  priority,
  maxConcurrent = 4
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount] = useState(images.length);
  const { isVeryLowEnd, isMobile, connectionSpeed } = useDevicePerformance();
  
  const preloadManager = ImagePreloadManager.getInstance();

  // Adjust concurrent loads based on device performance
  useEffect(() => {
    let concurrent = maxConcurrent;
    
    if (isVeryLowEnd) concurrent = 1;
    else if (isMobile) concurrent = 2;
    else if (connectionSpeed === 'slow') concurrent = 2;
    
    preloadManager.setMaxConcurrent(concurrent);
  }, [isVeryLowEnd, isMobile, connectionSpeed, maxConcurrent, preloadManager]);

  const handleImageLoad = useCallback(() => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      const progress = (newCount / totalCount) * 100;
      
      onLoadProgress?.(progress);
      
      if (newCount === totalCount) {
        onLoadComplete?.(newCount, totalCount);
      }
      
      return newCount;
    });
  }, [totalCount, onLoadComplete, onLoadProgress]);

  useEffect(() => {
    if (images.length === 0) {
      onLoadComplete?.(0, 0);
      return;
    }

    const loadImages = async () => {
      const loadPromises = images.map(async (imageUrl) => {
        const success = await preloadManager.preloadImage(imageUrl, priority);
        if (success) {
          handleImageLoad();
        }
        return success;
      });

      await Promise.allSettled(loadPromises);
    };

    // Delay loading for low-end devices
    const delay = isVeryLowEnd ? 500 : 0;
    const timeoutId = setTimeout(loadImages, delay);

    return () => clearTimeout(timeoutId);
  }, [images, priority, handleImageLoad, preloadManager, isVeryLowEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      preloadManager.cleanup();
    };
  }, [preloadManager]);

  return null; // This is a utility component, doesn't render anything
});

OptimizedImagePreloader.displayName = 'OptimizedImagePreloader';

// Hook for using preloaded images
export const useOptimizedImage = (url: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const preloadManager = ImagePreloadManager.getInstance();

  useEffect(() => {
    setIsLoaded(preloadManager.isLoaded(url));
    
    // Check periodically if not loaded yet
    if (!preloadManager.isLoaded(url)) {
      const interval = setInterval(() => {
        if (preloadManager.isLoaded(url)) {
          setIsLoaded(true);
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [url, preloadManager]);

  return {
    src: preloadManager.getImageUrl(url),
    isLoaded,
    preload: (priority: 'high' | 'medium' | 'low' = 'medium') => 
      preloadManager.preloadImage(url, priority)
  };
};

// Enhanced OptimizedImage component with preloading
export const EnhancedOptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  priority?: 'high' | 'medium' | 'low';
}> = memo(({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  onClick,
  loading = 'lazy',
  priority = 'medium'
}) => {
  const { src: optimizedSrc, isLoaded, preload } = useOptimizedImage(src);
  const { isMobile } = useDevicePerformance();
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (loading === 'eager' || priority === 'high') {
      preload(priority);
    }
  }, [src, loading, priority, preload]);

  const handleLoad = useCallback(() => {
    setShowPlaceholder(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setShowPlaceholder(false);
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
      {showPlaceholder && !isLoaded && (
        <div className="absolute inset-0 bg-muted rounded animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded && !showPlaceholder ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          ...style,
          filter: isMobile ? 'none' : style.filter,
        }}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        decoding="async"
      />
    </div>
  );
});

EnhancedOptimizedImage.displayName = 'EnhancedOptimizedImage';