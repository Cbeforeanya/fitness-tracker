import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '.././components/ui/button';

interface LiveTrackingProps {
  isTracking: boolean;
  onUpdateWorkoutData: (data: { coordinates?: GeolocationPosition[] }) => void;
}

export const LiveTracking = ({ isTracking, onUpdateWorkoutData }: LiveTrackingProps) => {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const coordinatesRef = useRef<GeolocationPosition[]>([]);

  // Geolocation API - Track user's location during workouts
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    if (isTracking) {
      // Start watching position with high accuracy
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      };

      const successCallback = (position: GeolocationPosition) => {
        setCurrentPosition(position);
        setLocationError('');
        setIsLocationEnabled(true);
        
        // Add to coordinates array
        coordinatesRef.current = [...coordinatesRef.current, position];
        onUpdateWorkoutData({ coordinates: coordinatesRef.current });
      };

      const errorCallback = (error: GeolocationPositionError) => {
        setIsLocationEnabled(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      };

      // Get initial position
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
      
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );
    } else {
      // Stop watching position
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Reset coordinates when not tracking
      coordinatesRef.current = [];
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, onUpdateWorkoutData]);

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      setCurrentPosition(position);
      setIsLocationEnabled(true);
      setLocationError('');
    } catch (error) {
      setLocationError('Failed to get location permission.');
    }
  };

  return (
    <div className="glass p-6 rounded-2xl shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-primary" />
          <span>Live Tracking</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          {isLocationEnabled ? (
            <CheckCircle className="w-5 h-5 text-accent" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          <span className={`text-sm font-medium ${isLocationEnabled ? 'text-accent' : 'text-destructive'}`}>
            {isLocationEnabled ? 'GPS Active' : 'GPS Inactive'}
          </span>
        </div>
      </div>

      {locationError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{locationError}</p>
          </div>
          
          {!isLocationEnabled && (
            <Button 
              onClick={requestLocationPermission}
              className="mt-3 bg-gradient-primary text-primary-foreground hover:opacity-90"
              size="sm"
            >
              Enable Location
            </Button>
          )}
        </div>
      )}

      {currentPosition && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Current Location</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lat: {currentPosition.coords.latitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Lng: {currentPosition.coords.longitude.toFixed(6)}
              </p>
            </div>

            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Navigation className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ±{Math.round(currentPosition.coords.accuracy)}m
              </p>
              <p className="text-xs text-muted-foreground">
                Speed: {currentPosition.coords.speed ? 
                  `${(currentPosition.coords.speed * 3.6).toFixed(1)} km/h` : 
                  'Unknown'
                }
              </p>
            </div>
          </div>

          {isTracking && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">Recording your route...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!currentPosition && !locationError && isTracking && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Acquiring GPS signal...</p>
        </div>
      )}
    </div>
  );
};