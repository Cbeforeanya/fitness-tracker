import { useEffect, useRef, useState } from 'react';
import { Trophy, Target, Zap, Medal, Star, Award } from 'lucide-react';

interface WorkoutData {
  distance: number;
  duration: number;
  pace: string;
  calories: number;
  coordinates: GeolocationPosition[];
}

interface AchievementsBadgesProps {
  workoutData: WorkoutData;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  isUnlocked: boolean;
  progress: number;
  gradient: string;
  shadow: string;
}

export const AchievementsBadges = ({ workoutData }: AchievementsBadgesProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize achievements
  useEffect(() => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-km',
        title: 'First Kilometer',
        description: 'Complete your first 1km',
        icon: Target,
        isUnlocked: workoutData.distance >= 1,
        progress: Math.min(workoutData.distance, 1) * 100,
        gradient: 'bg-gradient-primary',
        shadow: 'shadow-primary'
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Maintain under 5:00/km pace',
        icon: Zap,
        isUnlocked: workoutData.pace !== '0:00' && parseFloat(workoutData.pace.split(':')[0]) < 5,
        progress: workoutData.pace !== '0:00' ? 
          Math.max(0, 100 - (parseFloat(workoutData.pace.split(':')[0]) * 20)) : 0,
        gradient: 'bg-gradient-secondary',
        shadow: 'shadow-secondary'
      },
      {
        id: 'calorie-burner',
        title: 'Calorie Crusher',
        description: 'Burn 200+ calories',
        icon: Medal,
        isUnlocked: workoutData.calories >= 200,
        progress: Math.min(workoutData.calories / 200, 1) * 100,
        gradient: 'bg-gradient-success',
        shadow: 'shadow-glass'
      },
      {
        id: 'endurance-master',
        title: 'Endurance Master',
        description: 'Workout for 30+ minutes',
        icon: Trophy,
        isUnlocked: workoutData.duration >= 1800,
        progress: Math.min(workoutData.duration / 1800, 1) * 100,
        gradient: 'bg-gradient-primary',
        shadow: 'shadow-primary'
      },
      {
        id: 'location-tracker',
        title: 'Route Explorer',
        description: 'Track 50+ GPS points',
        icon: Star,
        isUnlocked: workoutData.coordinates.length >= 50,
        progress: Math.min(workoutData.coordinates.length / 50, 1) * 100,
        gradient: 'bg-gradient-secondary',
        shadow: 'shadow-secondary'
      },
      {
        id: 'consistency-king',
        title: 'Consistency King',
        description: 'Complete a 5km run',
        icon: Award,
        isUnlocked: workoutData.distance >= 5,
        progress: Math.min(workoutData.distance / 5, 1) * 100,
        gradient: 'bg-gradient-success',
        shadow: 'shadow-glass'
      }
    ];

    setAchievements(baseAchievements);
  }, [workoutData]);

  // Intersection Observer API - Animate badges when they scroll into view
  useEffect(() => {
    if (!achievementsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            
            // Animate each badge with staggered timing
            const badges = entry.target.querySelectorAll('.achievement-badge');
            badges.forEach((badge, index) => {
              setTimeout(() => {
                badge.classList.add('slide-in-bottom');
                badge.classList.remove('opacity-0');
                
                // Add unlock animation for unlocked achievements
                if (badge.classList.contains('unlocked')) {
                  setTimeout(() => {
                    badge.classList.add('animate-pulse');
                  }, 200);
                }
              }, index * 150);
            });
          }
        });
      },
      { 
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    observer.observe(achievementsRef.current);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={achievementsRef} className="space-y-6">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Achievements
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = achievement.icon;
          
          return (
            <div
              key={achievement.id}
              className={`achievement-badge opacity-0 glass p-6 rounded-2xl ${achievement.shadow} transition-smooth hover:scale-105 relative overflow-hidden ${
                achievement.isUnlocked ? 'unlocked' : ''
              }`}
            >
              {/* Unlock glow effect */}
              {achievement.isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${achievement.gradient} rounded-xl ${
                    achievement.isUnlocked ? 'animate-pulse' : 'opacity-50'
                  }`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  {achievement.isUnlocked && (
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                      UNLOCKED
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className={`font-semibold ${
                      achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium">
                        {Math.round(achievement.progress)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${achievement.gradient} transition-smooth`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Achievement summary */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          {achievements.filter(a => a.isUnlocked).length} of {achievements.length} achievements unlocked
        </p>
      </div>
    </div>
  );
};