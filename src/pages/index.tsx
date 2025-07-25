import { useState, useEffect } from 'react';
import { FitnessHeader } from '.././components/FitnessHeader';
import { FitnessStats } from '.././components/FitnessStats';
import { LiveTracking } from '.././components/LiveTracking';
import { NetworkStatus } from '.././components/NetworkStatus';
import { AchievementsBadges } from '.././components/AchievementsBadges';
import { WorkoutTimer } from '.././components/WorkoutTimer';

/*
===========================================
SMART FITNESS TRACKER WEB APPLICATION
===========================================

INSTRUCTIONS TO RUN AND TEST:
1. Open the application in a modern browser (Chrome, Firefox, Safari, Edge)
2. Allow location permissions when prompted for GPS tracking
3. Grant notifications permission for workout alerts
4. Test features:
   - Click "Start Workout" to begin location tracking
   - Scroll down to see achievement badges animate in
   - Check network status indicator in top-right
   - View real-time stats during workout
   - Background processing handles distance/pace calculations

WEB APIs USED:
1. GEOLOCATION API: 
   - Tracks user's real-time location during workouts
   - Calculates distance traveled and current speed
   - Shows current coordinates and accuracy

2. INTERSECTION OBSERVER API:
   - Animates achievement badges when they scroll into view
   - Lazy loads workout history cards for performance
   - Triggers stat counter animations when visible

3. NETWORK INFORMATION API:
   - Monitors connection quality (4G, WiFi, slow-2g, etc.)
   - Shows data usage warnings for mobile connections
   - Saves workout data locally when offline

4. BACKGROUND TASKS API (requestIdleCallback):
   - Processes workout calculations without blocking UI
   - Smoothly calculates pace, calories, and route data
   - Performs heavy computations during idle time

FEATURES:
- Real-time GPS tracking with distance calculation
- Live workout timer with pause/resume functionality
- Achievement system with smooth animations
- Network status monitoring and offline support
- Responsive design for mobile and desktop
- Modern glass-morphism UI with fitness-themed colors
*/

const Index = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    distance: 0,
    duration: 0,
    pace: '0:00',
    calories: 0,
    coordinates: [] as GeolocationPosition[]
  });

  // Initialize background task processing
  useEffect(() => {
    const processWorkoutData = () => {
      // Background Tasks API - process calculations during idle time
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          if (workoutData.coordinates.length > 1) {
            calculateWorkoutMetrics();
          }
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(calculateWorkoutMetrics, 100);
      }
    };

    const calculateWorkoutMetrics = () => {
      const coords = workoutData.coordinates;
      if (coords.length < 2) return;

      // Calculate total distance using Haversine formula
      let totalDistance = 0;
      for (let i = 1; i < coords.length; i++) {
        const dist = calculateDistance(
          coords[i-1].coords.latitude,
          coords[i-1].coords.longitude,
          coords[i].coords.latitude,
          coords[i].coords.longitude
        );
        totalDistance += dist;
      }

      // Calculate pace (min/km)
      const timeInHours = workoutData.duration / 3600;
      const pace = timeInHours > 0 ? (workoutData.duration / 60) / (totalDistance) : 0;
      const paceMinutes = Math.floor(pace);
      const paceSeconds = Math.floor((pace - paceMinutes) * 60);

      // Estimate calories (rough calculation)
      const calories = Math.round(totalDistance * 65 + (workoutData.duration / 60) * 8);

      setWorkoutData(prev => ({
        ...prev,
        distance: totalDistance,
        pace: `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`,
        calories
      }));
    };

    if (isTracking) {
      processWorkoutData();
    }
  }, [workoutData.coordinates, workoutData.duration, isTracking]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleStartWorkout = () => {
    setIsTracking(true);
    setWorkoutData({
      distance: 0,
      duration: 0,
      pace: '0:00',
      calories: 0,
      coordinates: []
    });
  };

  const handleStopWorkout = () => {
    setIsTracking(false);
  };

  const updateWorkoutData = (newData: Partial<typeof workoutData>) => {
    setWorkoutData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header with network status */}
        <FitnessHeader />
        <NetworkStatus />

        {/* Main content */}
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Stats overview */}
          <FitnessStats workoutData={workoutData} />

          {/* Live tracking */}
          <LiveTracking 
            isTracking={isTracking} 
            onUpdateWorkoutData={updateWorkoutData}
          />

          {/* Workout controls */}
          <WorkoutTimer
            isTracking={isTracking}
            onStart={handleStartWorkout}
            onStop={handleStopWorkout}
            duration={workoutData.duration}
            onUpdateDuration={(duration) => updateWorkoutData({ duration })}
          />

          {/* Achievements section */}
          <AchievementsBadges workoutData={workoutData} />
        </div>
      </div>
    </div>
  );
};

export default Index;