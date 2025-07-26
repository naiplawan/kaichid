// Performance optimization utilities for mobile and desktop

import React, { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Debounce hook for optimizing frequent function calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for limiting function call frequency
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (!throttleRef.current) {
        callbackRef.current(...args);
        throttleRef.current = setTimeout(() => {
          throttleRef.current = undefined;
        }, delay);
      }
    }) as T,
    [delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Virtual viewport hook for mobile optimization
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Performance observer for monitoring app performance
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });
    
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      
      setMetrics(prev => ({ 
        ...prev, 
        lcp: lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime 
      }));
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntry & { processingStart?: number };
        setMetrics(prev => ({ 
          ...prev, 
          fid: fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0 
        }));
      }
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { 
          value?: number; 
          hadRecentInput?: boolean; 
        };
        
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return metrics;
}

/**
 * Image lazy loading component
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48L3N2Zz4=",
  className = "",
  ...props 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const isIntersecting = useIntersectionObserver(
    { current: imageRef },
    { threshold: 0.1 }
  );

  useEffect(() => {
    if (isIntersecting && imageSrc === placeholder) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, placeholder, imageSrc]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}

/**
 * Bundle size analyzer
 */
export function getBundleSize(): Promise<{ gzipped: number; uncompressed: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ gzipped: 0, uncompressed: 0 });
      return;
    }

    // This is a simplified version - in production you'd use proper bundle analysis
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let totalSize = 0;

    Promise.all(
      scripts.map(async (script) => {
        try {
          const response = await fetch((script as HTMLScriptElement).src, { method: 'HEAD' });
          const size = parseInt(response.headers.get('content-length') || '0', 10);
          return size;
        } catch {
          return 0;
        }
      })
    ).then((sizes) => {
      totalSize = sizes.reduce((sum, size) => sum + size, 0);
      resolve({
        gzipped: Math.round(totalSize * 0.3), // Approximate gzip compression
        uncompressed: totalSize,
      });
    });
  });
}

/**
 * Memory usage monitor
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }).memory;

        if (memory) {
          setMemoryInfo({
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576),
          });
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Connection quality monitor
 */
export function useConnectionQuality() {
  const [connectionInfo, setConnectionInfo] = useState({
    effectiveType: '4g' as const,
    downlink: 10,
    rtt: 100,
    saveData: false,
  });

  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & {
          connection?: {
            effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
            downlink?: number;
            rtt?: number;
            saveData?: boolean;
          };
        }).connection;

        if (connection) {
          setConnectionInfo({
            effectiveType: connection.effectiveType || '4g',
            downlink: connection.downlink || 10,
            rtt: connection.rtt || 100,
            saveData: connection.saveData || false,
          });
        }
      }
    };

    updateConnectionInfo();

    if ('connection' in navigator) {
      const connection = (navigator as Navigator & {
        connection?: EventTarget;
      }).connection;

      if (connection) {
        connection.addEventListener('change', updateConnectionInfo);
        return () => connection.removeEventListener('change', updateConnectionInfo);
      }
    }
  }, []);

  return connectionInfo;
}

/**
 * Prefetch resources for better performance
 */
export function prefetchResource(href: string, as: 'script' | 'style' | 'image' | 'fetch') {
  if (typeof document === 'undefined') return;

  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: 'script' | 'style' | 'image' | 'fetch') {
  if (typeof document === 'undefined') return;

  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Service Worker registration for offline support
 */
export function registerServiceWorker(swPath: string = '/sw.js') {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  return navigator.serviceWorker
    .register(swPath)
    .then((registration) => {
      console.log('Service Worker registered:', registration);
      return registration;
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
      throw error;
    });
}

/**
 * Cache management utilities
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: unknown, ttl: number = 300000): void { // Default 5 minutes TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Virtual scrolling for large lists
 */
interface VirtualScrollProps {
  items: unknown[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: unknown, index: number) => React.ReactNode;
  overscan?: number;
}

export function useVirtualScroll({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: Omit<VirtualScrollProps, 'renderItem'>) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    setScrollTop,
  };
}