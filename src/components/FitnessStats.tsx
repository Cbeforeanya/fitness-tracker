import { useEffect, useRef } from 'react';
import { MapPin, Timer, Zap, Flame } from 'lucide-react';

interface WorkoutData {
  distance: number;
  duration: number;
  pace: string;
  calories: number;
  coordinates: GeolocationPosition[];
}

interface FitnessStatsProps {
  workoutData: WorkoutData;
}

export const FitnessStats = ({ workoutData }: FitnessStatsProps) => {
  const statsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer API - Animate stats when they come into view
  useEffect(() => {
    if (!statsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation classes when visible
            entry.target.classList.add('slide-in-bottom');
            const statCards = entry.target.querySelectorAll('.stat-card');
            statCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('slide-in-right');
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: MapPin,
      label: 'Distance',
      value: `${workoutData.distance.toFixed(2)} km`,
      color: 'bg-gradient-primary',
      shadow: 'shadow-primary'
    },
    {
      icon: Timer,
      label: 'Duration',
      value: formatDuration(workoutData.duration),
      color: 'bg-gradient-secondary',
      shadow: 'shadow-secondary'
    },
    {
      icon: Zap,
      label: 'Pace',
      value: `${workoutData.pace}/km`,
      color: 'bg-gradient-success',
      shadow: 'shadow-glass'
    },
    {
      icon: Flame,
      label: 'Calories',
      value: `${workoutData.calories} kcal`,
      color: 'bg-gradient-primary',
      shadow: 'shadow-primary'
    }
  ];

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div ref={statsRef} className="opacity-0">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Today's Activity
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className={`stat-card glass p-6 rounded-2xl ${stat.shadow} transition-smooth hover:scale-105 opacity-0`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};