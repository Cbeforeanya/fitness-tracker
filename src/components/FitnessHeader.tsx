import { Activity, Zap } from 'lucide-react';

export const FitnessHeader = () => {
  return (
    <header className="glass border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-primary">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FitTracker Pro
              </h1>
              <p className="text-sm text-muted-foreground">Smart Fitness Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-success rounded-lg animate-pulse">
              <Zap className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-accent">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};