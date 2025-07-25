class SmartFitnessTracker {
    constructor() {
        // Workout state
        this.isTracking = false;
        this.isPaused = false;
        this.duration = 0;
        this.distance = 0;
        this.coordinates = [];
        this.startTime = null;
        this.timerInterval = null;
        this.watchId = null;
        
        // Network state
        this.isOnline = navigator.onLine;
        this.connection = null;
        
        // Achievement definitions
        this.achievements = [
            {
                id: 'first-km',
                title: 'First Kilometer',
                description: 'Complete your first 1km',
                icon: '🎯',
                target: 1,
                type: 'distance'
            },
            {
                id: 'speed-demon',
                title: 'Speed Demon',
                description: 'Maintain under 5:00/km pace',
                icon: '⚡',
                target: 5,
                type: 'pace'
            },
            {
                id: 'calorie-burner',
                title: 'Calorie Crusher',
                description: 'Burn 200+ calories',
                icon: '🏅',
                target: 200,
                type: 'calories'
            },
            {
                id: 'endurance-master',
                title: 'Endurance Master',
                description: 'Workout for 30+ minutes',
                icon: '🏆',
                target: 1800,
                type: 'duration'
            },
            {
                id: 'location-tracker',
                title: 'Route Explorer',
                description: 'Track 50+ GPS points',
                icon: '⭐',
                target: 50,
                type: 'coordinates'
            },
            {
                id: 'consistency-king',
                title: 'Consistency King',
                description: 'Complete a 5km run',
                icon: '👑',
                target: 5,
                type: 'distance'
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🏃‍♂️ Smart Fitness Tracker initialized');
        this.bindEvents();
        this.initNetworkMonitoring();
        this.initIntersectionObserver();
        this.loadStoredData();
        this.renderAchievements();
    }
    
    bindEvents() {
        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => this.startWorkout());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseWorkout());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopWorkout());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetWorkout());
        
        // Location permission
        document.getElementById('enableLocationBtn').addEventListener('click', () => this.requestLocationPermission());
    }
    
    /**
     * NETWORK INFORMATION API
     * Monitors network connection quality and status
     */
    initNetworkMonitoring() {
        console.log('📶 Initializing Network Information API monitoring');
        
        // Get connection object (with vendor prefixes for compatibility)
        this.connection = navigator.connection || 
                         navigator.mozConnection || 
                         navigator.webkitConnection;
        
        if (this.connection) {
            console.log('📶 Network Information API supported');
            this.updateNetworkStatus();
            
            // Monitor connection changes
            this.connection.addEventListener('change', () => {
                console.log('📶 Connection changed:', this.connection.effectiveType);
                this.updateNetworkStatus();
                
                // Show warning for slow connections
                if (this.connection.effectiveType === 'slow-2g' || this.connection.effectiveType === '2g') {
                    this.showNetworkWarning();
                }
            });
        }
        
        // Monitor online/offline status
        window.addEventListener('online', () => {
            console.log('📶 Back online');
            this.isOnline = true;
            this.updateNetworkStatus();
            this.hideOfflineIndicator();
        });
        
        window.addEventListener('offline', () => {
            console.log('📶 Gone offline');
            this.isOnline = false;
            this.updateNetworkStatus();
            this.showOfflineIndicator();
            this.saveWorkoutDataOffline();
        });
    }
    
    updateNetworkStatus() {
        const networkIcon = document.getElementById('networkIcon');
        const networkText = document.getElementById('networkText');
        const networkStatus = document.getElementById('networkStatus');
        
        if (!this.isOnline) {
            networkIcon.textContent = '📶';
            networkText.textContent = 'Offline';
            networkStatus.style.color = 'hsl(0 84% 60%)';
            return;
        }
        
        if (!this.connection) {
            networkIcon.textContent = '📶';
            networkText.textContent = 'Online';
            networkStatus.style.color = 'hsl(142 76% 36%)';
            return;
        }
        
        // Update based on connection type
        switch (this.connection.effectiveType) {
            case '4g':
                networkIcon.textContent = '📶';
                networkText.textContent = '4G';
                networkStatus.style.color = 'hsl(142 76% 36%)';
                break;
            case '3g':
                networkIcon.textContent = '📶';
                networkText.textContent = '3G';
                networkStatus.style.color = 'hsl(210 40% 98%)';
                break;
            case '2g':
            case 'slow-2g':
                networkIcon.textContent = '📶';
                networkText.textContent = this.connection.effectiveType.toUpperCase();
                networkStatus.style.color = 'hsl(142 76% 36%)';
                break;
            default:
                networkIcon.textContent = '📶';
                networkText.textContent = 'Online';
                networkStatus.style.color = 'hsl(142 76% 36%)';
        }
    }
    
    showNetworkWarning() {
        const warning = document.getElementById('networkWarning');
        warning.classList.remove('hidden');
        setTimeout(() => {
            warning.classList.add('hidden');
        }, 5000);
    }
    
    showOfflineIndicator() {
        document.getElementById('offlineIndicator').classList.remove('hidden');
    }
    
    hideOfflineIndicator() {
        document.getElementById('offlineIndicator').classList.add('hidden');
    }
    
    saveWorkoutDataOffline() {
        if (this.isTracking) {
            const workoutData = {
                duration: this.duration,
                distance: this.distance,
                coordinates: this.coordinates,
                timestamp: Date.now()
            };
            localStorage.setItem('offlineWorkout', JSON.stringify(workoutData));
            console.log('💾 Workout data saved offline');
        }
    }
    
    /**
     * INTERSECTION OBSERVER API
     * Animates elements when they scroll into view
     */
    initIntersectionObserver() {
        console.log('👁️ Initializing Intersection Observer API');
        
        // Observer for stats section
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('👁️ Stats section came into view - triggering animations');
                    entry.target.classList.add('visible');
                    
                    // Animate stat cards with staggered timing
                    const statCards = entry.target.querySelectorAll('.stat-card');
                    statCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 150);
                    });
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observer for achievements section
        const achievementsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('👁️ Achievements section came into view - triggering animations');
                    
                    // Animate achievement badges with staggered timing
                    const badges = entry.target.querySelectorAll('.achievement-badge');
                    badges.forEach((badge, index) => {
                        setTimeout(() => {
                            badge.classList.add('visible');
                            
                            // Add pulse animation for unlocked achievements
                            if (badge.classList.contains('unlocked')) {
                                setTimeout(() => {
                                    badge.querySelector('.achievement-icon').style.animation = 'pulse 2s infinite';
                                }, 200);
                            }
                        }, index * 200);
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe sections
        const statsSection = document.getElementById('statsSection');
        const achievementsSection = document.getElementById('achievementsSection');
        
        if (statsSection) statsObserver.observe(statsSection);
        if (achievementsSection) achievementsObserver.observe(achievementsSection);
    }
    
    /**
     * GEOLOCATION API
     * Tracks user's location during workouts with high accuracy
     */
    startLocationTracking() {
        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by this browser.');
            return;
        }
        
        console.log('📍 Starting Geolocation API tracking');
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
        };
        
        const successCallback = (position) => {
            console.log('📍 GPS position acquired:', position.coords.latitude, position.coords.longitude);
            this.updateLocationInfo(position);
            this.coordinates.push(position);
            this.calculateDistance();
            this.updateStats();
        };
        
        const errorCallback = (error) => {
            console.error('📍 Geolocation error:', error);
            let errorMessage = '';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred.';
                    break;
            }
            
            this.showLocationError(errorMessage);
        };
        
        // Get initial position
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
        
        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            options
        );
        
        // Show GPS active status
        document.getElementById('gpsIcon').textContent = '✅';
        document.getElementById('gpsStatus').textContent = 'GPS Active';
        document.getElementById('gpsStatus').style.color = 'hsl(142 76% 36%)';
        document.getElementById('locationLoading').classList.remove('hidden');
    }
    
    stopLocationTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            console.log('📍 Geolocation tracking stopped');
        }
        
        // Update GPS status
        document.getElementById('gpsIcon').textContent = '❌';
        document.getElementById('gpsStatus').textContent = 'GPS Inactive';
        document.getElementById('gpsStatus').style.color = 'hsl(0 84% 60%)';
        document.getElementById('trackingIndicator').classList.add('hidden');
        document.getElementById('locationLoading').classList.add('hidden');
    }
    
    updateLocationInfo(position) {
        document.getElementById('locationLoading').classList.add('hidden');
        document.getElementById('locationInfo').classList.remove('hidden');
        document.getElementById('trackingIndicator').classList.remove('hidden');
        
        const coords = position.coords;
        document.getElementById('latitude').textContent = `Lat: ${coords.latitude.toFixed(6)}`;
        document.getElementById('longitude').textContent = `Lng: ${coords.longitude.toFixed(6)}`;
        document.getElementById('accuracy').textContent = `±${Math.round(coords.accuracy)}m`;
        
        const speed = coords.speed ? `${(coords.speed * 3.6).toFixed(1)} km/h` : 'Unknown';
        document.getElementById('speed').textContent = `Speed: ${speed}`;
    }
    
    showLocationError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('locationError').classList.remove('hidden');
    }
    
    hideLocationError() {
        document.getElementById('locationError').classList.add('hidden');
    }
    
    async requestLocationPermission() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000
                });
            });
            
            this.updateLocationInfo(position);
            this.hideLocationError();
            console.log('📍 Location permission granted');
        } catch (error) {
            this.showLocationError('Failed to get location permission.');
        }
    }
    
    /**
     * BACKGROUND TASKS API
     * Uses requestIdleCallback for smooth timer updates during idle periods
     */
    startTimer() {
        console.log('⏱️ Starting timer with Background Tasks API optimization');
        
        this.timerInterval = setInterval(() => {
            // Background Tasks API - Update timer during idle periods for smooth performance
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => {
                    this.duration++;
                    this.updateTimerDisplay();
                    this.updateStats();
                    
                    // Save state periodically
                    if (this.duration % 10 === 0) {
                        this.saveWorkoutState();
                    }
                });
            } else {
                // Fallback for browsers without requestIdleCallback
                this.duration++;
                this.updateTimerDisplay();
                this.updateStats();
                
                if (this.duration % 10 === 0) {
                    this.saveWorkoutState();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            console.log('⏱️ Timer stopped');
        }
    }
    
    updateTimerDisplay() {
        const timerValue = document.getElementById('timerValue');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        timerValue.textContent = this.formatTime(this.duration);
        
        if (this.isTracking && !this.isPaused) {
            timerValue.classList.add('pulsing');
            statusIndicator.classList.add('recording');
            statusIndicator.classList.remove('paused');
            statusText.textContent = 'Recording';
        } else if (this.isPaused) {
            timerValue.classList.remove('pulsing');
            statusIndicator.classList.add('paused');
            statusIndicator.classList.remove('recording');
            statusText.textContent = 'Paused';
        } else {
            timerValue.classList.remove('pulsing');
            statusIndicator.classList.remove('recording', 'paused');
            statusText.textContent = 'Ready to start';
        }
    }
    
    // Workout Controls
    startWorkout() {
        this.isTracking = true;
        this.isPaused = false;
        this.startTime = Date.now();
        
        this.startTimer();
        this.startLocationTracking();
        
        // Update UI
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
        document.getElementById('workoutTip').classList.remove('hidden');
        
        console.log('🏃‍♂️ Workout started');
    }
    
    pauseWorkout() {
        this.isPaused = true;
        this.stopTimer();
        
        // Update UI
        document.getElementById('pauseBtn').classList.add('hidden');
        
        // Show resume button
        const resumeBtn = document.createElement('button');
        resumeBtn.id = 'resumeBtn';
        resumeBtn.className = 'btn btn-secondary';
        resumeBtn.innerHTML = '<span class="btn-icon">▶️</span>Resume';
        resumeBtn.addEventListener('click', () => this.resumeWorkout());
        
        const controls = document.querySelector('.timer-controls');
        controls.insertBefore(resumeBtn, document.getElementById('stopBtn'));
        
        this.updateTimerDisplay();
        console.log('⏸️ Workout paused');
    }
    
    resumeWorkout() {
        this.isPaused = false;
        this.startTimer();
        
        // Update UI
        document.getElementById('resumeBtn').remove();
        document.getElementById('pauseBtn').classList.remove('hidden');
        
        this.updateTimerDisplay();
        console.log('▶️ Workout resumed');
    }
    
    stopWorkout() {
        this.isTracking = false;
        this.isPaused = false;
        
        this.stopTimer();
        this.stopLocationTracking();
        
        // Update UI
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
        document.getElementById('resetBtn').classList.remove('hidden');
        document.getElementById('workoutTip').classList.add('hidden');
        
        if (document.getElementById('resumeBtn')) {
            document.getElementById('resumeBtn').remove();
        }
        
        // Save workout data
        this.saveWorkoutData();
        this.updateTimerDisplay();
        this.checkAchievements();
        
        console.log('⏹️ Workout stopped');
    }
    
    resetWorkout() {
        this.duration = 0;
        this.distance = 0;
        this.coordinates = [];
        
        // Update UI
        document.getElementById('resetBtn').classList.add('hidden');
        this.updateTimerDisplay();
        this.updateStats();
        
        console.log('🔄 Workout reset');
    }
    
    // Calculations
    calculateDistance() {
        if (this.coordinates.length < 2) return;
        
        const last = this.coordinates[this.coordinates.length - 1];
        const secondLast = this.coordinates[this.coordinates.length - 2];
        
        const distance = this.getDistanceBetween(
            secondLast.coords.latitude,
            secondLast.coords.longitude,
            last.coords.latitude,
            last.coords.longitude
        );
        
        this.distance += distance;
    }
    
    getDistanceBetween(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    calculatePace() {
        if (this.distance === 0 || this.duration === 0) return '0:00';
        
        const paceInSeconds = this.duration / this.distance;
        const minutes = Math.floor(paceInSeconds / 60);
        const seconds = Math.floor(paceInSeconds % 60);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    calculateCalories() {
        // Simple estimation: 60 calories per km for average person
        return Math.round(this.distance * 60);
    }
    
    updateStats() {
        document.getElementById('distanceValue').textContent = `${this.distance.toFixed(2)} km`;
        document.getElementById('durationValue').textContent = this.formatTime(this.duration);
        document.getElementById('paceValue').textContent = `${this.calculatePace()}/km`;
        document.getElementById('caloriesValue').textContent = `${this.calculateCalories()} kcal`;
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Achievements System
    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        grid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const isUnlocked = this.checkAchievementUnlocked(achievement);
            const progress = this.calculateAchievementProgress(achievement);
            
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : ''}`;
            
            badge.innerHTML = `
                <div class="achievement-header">
                    <div class="achievement-icon">${achievement.icon}</div>
                    ${isUnlocked ? '<div class="unlocked-badge">UNLOCKED</div>' : ''}
                </div>
                <div class="achievement-content">
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                    <div class="progress-bar">
                        <div class="progress-header">
                            <span>Progress</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            grid.appendChild(badge);
        });
        
        this.updateAchievementsSummary();
    }
    
    checkAchievementUnlocked(achievement) {
        switch (achievement.type) {
            case 'distance':
                return this.distance >= achievement.target;
            case 'duration':
                return this.duration >= achievement.target;
            case 'calories':
                return this.calculateCalories() >= achievement.target;
            case 'coordinates':
                return this.coordinates.length >= achievement.target;
            case 'pace':
                const currentPace = this.calculatePace();
                if (currentPace === '0:00') return false;
                const paceMinutes = parseFloat(currentPace.split(':')[0]);
                return paceMinutes < achievement.target;
            default:
                return false;
        }
    }
    
    calculateAchievementProgress(achievement) {
        switch (achievement.type) {
            case 'distance':
                return Math.min(this.distance / achievement.target, 1) * 100;
            case 'duration':
                return Math.min(this.duration / achievement.target, 1) * 100;
            case 'calories':
                return Math.min(this.calculateCalories() / achievement.target, 1) * 100;
            case 'coordinates':
                return Math.min(this.coordinates.length / achievement.target, 1) * 100;
            case 'pace':
                const currentPace = this.calculatePace();
                if (currentPace === '0:00') return 0;
                const paceMinutes = parseFloat(currentPace.split(':')[0]);
                return Math.max(0, 100 - (paceMinutes * 20));
            default:
                return 0;
        }
    }
    
    checkAchievements() {
        this.renderAchievements();
    }
    
    updateAchievementsSummary() {
        const unlocked = this.achievements.filter(a => this.checkAchievementUnlocked(a)).length;
        const total = this.achievements.length;
        document.getElementById('achievementsSummary').textContent = 
            `${unlocked} of ${total} achievements unlocked`;
    }
    
    // Data Persistence
    saveWorkoutState() {
        const state = {
            duration: this.duration,
            distance: this.distance,
            coordinates: this.coordinates.length,
            timestamp: Date.now()
        };
        localStorage.setItem('currentWorkout', JSON.stringify(state));
    }
    
    saveWorkoutData() {
        const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        
        const workout = {
            id: Date.now(),
            date: new Date().toISOString(),
            duration: this.duration,
            distance: this.distance,
            pace: this.calculatePace(),
            calories: this.calculateCalories(),
            coordinates: this.coordinates.length
        };
        
        workouts.push(workout);
        localStorage.setItem('workoutHistory', JSON.stringify(workouts));
        
        this.updateTotalStats();
    }
    
    loadStoredData() {
        const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        this.updateTotalStats();
    }
    
    updateTotalStats() {
        const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        
        const totalWorkouts = workouts.length;
        const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
        const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
        
        document.getElementById('totalWorkouts').textContent = totalWorkouts;
        document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
        document.getElementById('totalCalories').textContent = totalCalories;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartFitnessTracker();
});

/**
 * API USAGE SUMMARY:
 * 
 * 1. GEOLOCATION API (navigator.geolocation):
 *    - Purpose: Real-time GPS tracking during workouts
 *    - Features: High accuracy positioning, continuous tracking, error handling
 *    - Usage: Tracks user's route, calculates distance, provides location info
 * 
 * 2. INTERSECTION OBSERVER API (IntersectionObserver):
 *    - Purpose: Animate elements when they scroll into view
 *    - Features: Threshold-based triggering, staggered animations
 *    - Usage: Animates stats cards and achievement badges on scroll
 * 
 * 3. NETWORK INFORMATION API (navigator.connection):
 *    - Purpose: Monitor network connection quality and type
 *    - Features: Connection type detection, bandwidth monitoring, change events
 *    - Usage: Shows connection status, warns about slow connections, offline mode
 * 
 * 4. BACKGROUND TASKS API (requestIdleCallback):
 *    - Purpose: Optimize performance by running tasks during idle periods
 *    - Features: Smooth timer updates, non-blocking operations
 *    - Usage: Timer updates, data persistence, background calculations
 */