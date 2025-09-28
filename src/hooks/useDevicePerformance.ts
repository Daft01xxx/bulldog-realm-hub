import { useState, useEffect } from 'react';

interface DevicePerformance {
  isMobile: boolean;
  isLowEnd: boolean;
  reduceAnimations: boolean;
  cores: number;
  memory: number;
}

export const useDevicePerformance = (): DevicePerformance => {
  const [performance, setPerformance] = useState<DevicePerformance>({
    isMobile: false,
    isLowEnd: false,
    reduceAnimations: false,
    cores: 4,
    memory: 4
  });

  useEffect(() => {
    const detectPerformance = () => {
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Get device specs
      const cores = (navigator as any).hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      
      // Detect low-end device
      const isLowEnd = cores <= 4 || memory <= 2 || isMobile;
      
      // Check user preference for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const reduceAnimations = isLowEnd || prefersReducedMotion;

      setPerformance({
        isMobile,
        isLowEnd,
        reduceAnimations,
        cores,
        memory
      });
    };

    detectPerformance();
  }, []);

  return performance;
};