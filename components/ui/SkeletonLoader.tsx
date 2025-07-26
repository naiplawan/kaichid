import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-muted via-muted/50 to-muted rounded";
  
  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}

// Game Card Skeleton
export function GameCardSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative w-full h-[500px] sm:h-[600px] rounded-2xl p-6 border-2 bg-muted/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Main Question Area */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="space-y-3 w-full">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
        </div>

        {/* Theme */}
        <div className="text-center mb-4">
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>

        {/* Swipe Instructions */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-px h-3" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Player List Skeleton
export function PlayerListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-3 rounded-lg border bg-muted/10">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
          <Skeleton className="h-5 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// Game Session Header Skeleton
export function GameSessionHeaderSkeleton() {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <Skeleton className="h-4 w-10 mb-1" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}

// Response List Skeleton
export function ResponseListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 border rounded-lg bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-muted/10">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="p-8 rounded-xl border bg-muted/10">
              <div className="flex items-center space-x-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <Skeleton className="h-12 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Navigation Skeleton
export function MobileNavigationSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex items-center justify-around px-2 py-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center space-y-1 px-3 py-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Journal Skeleton
export function JournalSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-20" />
        ))}
      </div>

      {/* Journal Entries */}
      <div className="grid gap-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-muted/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progressive Loading Container
interface ProgressiveLoadingProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function ProgressiveLoading({ 
  isLoading, 
  skeleton, 
  children, 
  fallback,
  delay = 0 
}: ProgressiveLoadingProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);

  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  if (showSkeleton) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {skeleton}
      </motion.div>
    );
  }

  if (!isLoading && !children && fallback) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {fallback}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}