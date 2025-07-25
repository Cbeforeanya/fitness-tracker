import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, AlertTriangle } from 'lucide-react';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Network Information API - Monitor connection quality and type
  useEffect(() => {
    // Check if Network Information API is supported
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

    if (connection) {
      setConnectionInfo(connection);
      
      // Monitor connection changes
      const updateConnectionInfo = () => {
        setConnectionInfo({ ...connection });
        
        // Show warning for slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
      };

      connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save workout data locally when offline
  useEffect(() => {
    if (!isOnline) {
      // Save current workout state to localStorage
      const workoutData = localStorage.getItem('currentWorkout');
      if (workoutData) {
        console.log('Saving workout data offline...');
        localStorage.setItem('offlineWorkout', workoutData);
      }
    }
  }, [isOnline]);

  const getConnectionIcon = () => {
    if (!isOnline) return WifiOff;
    if (!connectionInfo) return Wifi;
    
    switch (connectionInfo.effectiveType) {
      case '4g':
      case '3g':
        return Wifi;
      case '2g':
      case 'slow-2g':
        return Signal;
      default:
        return Wifi;
    }
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'text-destructive';
    if (!connectionInfo) return 'text-accent';
    
    switch (connectionInfo.effectiveType) {
      case '4g':
        return 'text-accent';
      case '3g':
        return 'text-secondary';
      case '2g':
      case 'slow-2g':
        return 'text-primary';
      default:
        return 'text-accent';
    }
  };

  const getConnectionText = () => {
    if (!isOnline) return 'Offline';
    if (!connectionInfo) return 'Online';
    
    return connectionInfo.effectiveType?.toUpperCase() || 'Online';
  };

  const IconComponent = getConnectionIcon();

  return (
    <>
      {/* Network status indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`glass p-3 rounded-xl shadow-glass transition-smooth ${getConnectionColor()}`}>
          <div className="flex items-center space-x-2">
            <IconComponent className="w-4 h-4" />
            <span className="text-xs font-medium">{getConnectionText()}</span>
          </div>
        </div>
      </div>

      {/* Connection warning */}
      {showWarning && (
        <div className="fixed top-20 right-4 z-50 glass p-4 rounded-xl shadow-glass border border-primary/20 max-w-sm slide-in-right">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Slow Connection Detected</h4>
              <p className="text-xs text-muted-foreground">
                Your workout data will be saved locally and synced when connection improves.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Offline mode indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 z-50 glass p-4 rounded-xl shadow-glass border border-destructive/20 slide-in-bottom">
          <div className="flex items-center justify-center space-x-3">
            <WifiOff className="w-5 h-5 text-destructive" />
            <div className="text-center">
              <h4 className="font-medium text-sm text-destructive">Offline Mode</h4>
              <p className="text-xs text-muted-foreground">
                Your workout is being saved locally
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};