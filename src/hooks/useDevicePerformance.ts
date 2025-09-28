import { useState, useEffect } from 'react';

interface DevicePerformance {
  isMobile: boolean;
  isLowEnd: boolean;
  isVeryLowEnd: boolean;
  reduceAnimations: boolean;
  disableAllAnimations: boolean;
  cores: number;
  memory: number;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
}

export const useDevicePerformance = (): DevicePerformance => {
  const [performance, setPerformance] = useState<DevicePerformance>({
    isMobile: false,
    isLowEnd: false,
    isVeryLowEnd: false,
    reduceAnimations: false,
    disableAllAnimations: false,
    cores: 4,
    memory: 4,
    connectionSpeed: 'unknown'
  });

  useEffect(() => {
    const detectPerformance = () => {
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Get device specs
      const cores = (navigator as any).hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      
      // Detect connection speed
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        connectionSpeed = effectiveType === 'slow-2g' || effectiveType === '2g' ? 'slow' : 'fast';
      }
      
      // Detect low-end device (basic threshold)
      const isLowEnd = cores <= 4 || memory <= 2 || isMobile;
      
      // Detect very low-end device (aggressive threshold)
      const isVeryLowEnd = cores <= 2 || memory <= 1 || connectionSpeed === 'slow' || 
        (isMobile && (cores <= 4 && memory <= 2));
      
      // Check user preference for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const reduceAnimations = isLowEnd || prefersReducedMotion;
      const disableAllAnimations = isVeryLowEnd || prefersReducedMotion;

      setPerformance({
        isMobile,
        isLowEnd,
        isVeryLowEnd,
        reduceAnimations,
        disableAllAnimations,
        cores,
        memory,
        connectionSpeed
      });
    };

    detectPerformance();
  }, []);

  return performance;
};