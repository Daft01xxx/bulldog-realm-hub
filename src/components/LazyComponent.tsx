import { lazy, ComponentType, LazyExoticComponent } from 'react';

interface LazyOptions {
  /* Minimum delay in ms to show loading state (prevents flash) */
  minDelay?: number;
}

export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyOptions = {}
): LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const { minDelay = 0 } = options;
  
  let LazyComponent = lazy(() => {
    const promise = factory();
    
    if (minDelay > 0) {
      return Promise.all([
        promise,
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]).then(([moduleExports]) => moduleExports);
    }
    
    return promise;
  });

  // @ts-ignore
  LazyComponent.preload = factory;

  return LazyComponent as LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> };
}
