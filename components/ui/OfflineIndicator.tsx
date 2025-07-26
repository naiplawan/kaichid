import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from './button';
import { useOfflineState } from '@/lib/offline/OfflineManager';

interface OfflineIndicatorProps {
  showFullStatus?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

export function OfflineIndicator({ 
  showFullStatus = false,
  position = 'top',
  className = ''
}: OfflineIndicatorProps) {
  const { 
    isOnline, 
    wasOffline, 
    offlineDuration, 
    connectionQuality,
    getQueueSize,
    clearQueue
  } = useOfflineState();

  const queueSize = getQueueSize();

  const getConnectionIcon = () => {
    if (!isOnline) return WifiOff;
    
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return Wifi;
      case 'poor':
        return AlertCircle;
      default:
        return WifiOff;
    }
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'text-red-500';
    
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'poor':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  const getStatusMessage = () => {
    if (!isOnline) {
      return 'You are offline';
    }
    
    if (wasOffline && offlineDuration > 0) {
      const duration = Math.floor(offlineDuration / 1000);
      return `Back online after ${duration}s`;
    }
    
    switch (connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'poor':
        return 'Poor connection';
      default:
        return 'Connected';
    }
  };

  const formatOfflineDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const ConnectionIcon = getConnectionIcon();

  if (!showFullStatus) {
    // Simple indicator
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ConnectionIcon className={`h-4 w-4 ${getConnectionColor()}`} />
        {!isOnline && (
          <span className="text-sm text-muted-foreground">Offline</span>
        )}
        {queueSize > 0 && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-yellow-600">{queueSize}</span>
          </div>
        )}
      </div>
    );
  }

  // Full status banner
  return (
    <AnimatePresence>
      {(!isOnline || wasOffline || queueSize > 0) && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          className={`fixed ${
            position === 'top' ? 'top-0' : 'bottom-0'
          } left-0 right-0 z-50 ${className}`}
        >
          <div className={`w-full ${
            isOnline 
              ? connectionQuality === 'poor' 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          } border-b px-4 py-3`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <ConnectionIcon className={`h-5 w-5 ${getConnectionColor()}`} />
                
                <div>
                  <p className={`text-sm font-medium ${
                    isOnline ? 'text-gray-900' : 'text-red-800'
                  }`}>
                    {getStatusMessage()}
                  </p>
                  
                  {!isOnline && offlineDuration > 0 && (
                    <p className="text-xs text-red-600">
                      Offline for {formatOfflineDuration(offlineDuration)}
                    </p>
                  )}
                  
                  {queueSize > 0 && (
                    <p className="text-xs text-yellow-600">
                      {queueSize} actions queued for when you're back online
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isOnline && wasOffline && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Reconnected</span>
                  </div>
                )}
                
                {queueSize > 0 && isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearQueue}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Clear Queue</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Network status badge for mobile
export function NetworkStatusBadge() {
  const { isOnline, connectionQuality } = useOfflineState();

  if (isOnline && connectionQuality === 'excellent') {
    return null; // Don't show when connection is excellent
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      !isOnline
        ? 'bg-red-100 text-red-800'
        : connectionQuality === 'poor'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-blue-100 text-blue-800'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </>
      ) : connectionQuality === 'poor' ? (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          Poor
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Good
        </>
      )}
    </div>
  );
}

// Queue status component
export function OfflineQueueStatus() {
  const { getQueueSize, clearQueue, isOnline } = useOfflineState();
  const queueSize = getQueueSize();

  if (queueSize === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Queued Actions</span>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {queueSize}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          {isOnline 
            ? 'Actions will be processed automatically'
            : 'Actions will sync when you\'re back online'
          }
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearQueue}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default OfflineIndicator;