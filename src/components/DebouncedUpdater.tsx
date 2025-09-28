import { useCallback, useRef } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface DebouncedUpdaterProps {
  onUpdate: () => void;
  delay?: number;
}

export const useDebouncedUpdater = ({ onUpdate, delay = 1000 }: DebouncedUpdaterProps) => {
  const { isVeryLowEnd, isMobile } = useDevicePerformance();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Longer delays on very low-end devices to reduce load
    const actualDelay = isVeryLowEnd ? delay * 3 : isMobile ? delay * 2 : delay;

    timeoutRef.current = setTimeout(onUpdate, actualDelay);
  }, [onUpdate, delay, isVeryLowEnd, isMobile]);

  const immediateUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onUpdate();
  }, [onUpdate]);

  return { debouncedUpdate, immediateUpdate };
};