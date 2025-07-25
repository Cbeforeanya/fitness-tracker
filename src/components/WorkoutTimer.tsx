import { useEffect, useState } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '.././components/ui/button';

interface WorkoutTimerProps {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
  duration: number;
  onUpdateDuration: (duration: number) => void;
}

export const WorkoutTimer = ({ 
  isTracking, 
  onStart, 
  onStop, 
  duration, 
  onUpdateDuration 
}: WorkoutTimerProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [localDuration, setLocalDuration] = useState(0);

  // Timer logic using Background Tasks API for smooth updates
  useEffect(() => {
    let intervalId: number;
    
    if (isTracking && !isPaused) {
      intervalId = window.setInterval(() => {
        // Background Tasks API - Update timer during idle periods for smooth performance
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setLocalDuration(prev => {
              const newDuration = prev + 1;
              onUpdateDuration(newDuration);
              return newDuration;
            });
          });
        } else {
          setLocalDuration(prev => {
            const newDuration = prev + 1;
            onUpdateDuration(newDuration);
            return newDuration;
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, isPaused, onUpdateDuration]);

  // Sync with parent duration
  useEffect(() => {
    setLocalDuration(duration);
  }, [duration]);

  const handleStart = () => {
    setIsPaused(false);
    onStart();
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsPaused(false);
    setLocalDuration(0);
    onStop();
  };

  const handleReset = () => {
    setLocalDuration(0);
    onUpdateDuration(0);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass p-8 rounded-2xl shadow-glass text-center">
      <h3 className="text-xl font-semibold mb-6">Workout Timer</h3>
      
      {/* Large timer display */}
      <div className="mb-8">
        <div className={`text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-smooth ${
          isTracking && !isPaused ? 'animate-pulse' : ''
        }`}>
          {formatTime(localDuration)}
        </div>
        
        {/* Status indicator */}
        <div className="mt-4">
          {isTracking ? (
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-primary' : 'bg-accent animate-pulse'}`}></div>
              <span className="text-sm font-medium">
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Ready to start</span>
          )}
        </div>
      </div>
      
      {/* Control buttons */}
      <div className="flex items-center justify-center space-x-4">
        {!isTracking ? (
          <Button
            onClick={handleStart}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth px-8 py-3 text-lg shadow-primary"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Workout
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                onClick={handleResume}
                className="bg-gradient-success text-accent-foreground hover:opacity-90 transition-smooth"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-gradient-secondary text-secondary-foreground hover:opacity-90 transition-smooth"
                size="lg"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={handleStop}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth"
              size="lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}
        
        {localDuration > 0 && !isTracking && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        )}
      </div>
      
      {/* Workout tips */}
      {isTracking && (
        <div className="mt-6 bg-muted/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            🏃‍♂️ Keep your phone with you for accurate GPS tracking
          </p>
        </div>
      )}
    </div>
  );
};