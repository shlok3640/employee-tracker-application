import API from '../api';

class MonitoringService {
  constructor() {
    this.sessionId = null;
    this.isMonitoring = false;
    this.activityInterval = null;
    this.screenshotInterval = null;
    this.idleTimeout = null;
    this.lastActivity = Date.now();
    this.metrics = {
      mouseMovements: 0,
      keyStrokes: 0,
      clicks: 0,
      totalActiveTime: 0,
      totalIdleTime: 0,
      idleSessions: 0,
      averageIdleDuration: 0
    };
    this.isIdle = false;
    this.idleStartTime = null;
    this.productivityScore = 100;
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.checkIdle = this.checkIdle.bind(this);
    this.takeScreenshot = this.takeScreenshot.bind(this);
    this.logActivity = this.logActivity.bind(this);
  }

  // Start monitoring session
  async startSession() {
    try {
      const deviceInfo = this.getDeviceInfo();
      const response = await API.post('/monitoring/session/start', deviceInfo);
      
      this.sessionId = response.data.sessionId;
      this.isMonitoring = true;
      this.lastActivity = Date.now();
      
      // Start activity tracking
      this.startActivityTracking();
      
      // Start screenshot monitoring
      this.startScreenshotMonitoring();
      
      // Start idle detection
      this.startIdleDetection();
      
      console.log('Monitoring session started:', this.sessionId);
      return response.data;
    } catch (error) {
      console.error('Failed to start monitoring session:', error);
      throw error;
    }
  }

  // End monitoring session
  async endSession() {
    try {
      if (!this.sessionId) return;

      this.stopMonitoring();
      
      const response = await API.post('/monitoring/session/end', {
        sessionId: this.sessionId,
        totalActiveTime: this.metrics.totalActiveTime,
        totalIdleTime: this.metrics.totalIdleTime,
        mouseMovements: this.metrics.mouseMovements,
        keyStrokes: this.metrics.keyStrokes,
        clicks: this.metrics.clicks,
        averageIdleDuration: this.metrics.averageIdleDuration
      });

      this.sessionId = null;
      this.isMonitoring = false;
      
      console.log('Monitoring session ended');
      return response.data;
    } catch (error) {
      console.error('Failed to end monitoring session:', error);
      throw error;
    }
  }

  // Start activity tracking
  startActivityTracking() {
    if (this.activityInterval) return;

    this.activityInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.updateProductivityScore();
        this.logActivity('activity_tracking', {
          productivityScore: this.productivityScore,
          isIdle: this.isIdle,
          idleDuration: this.isIdle ? Date.now() - this.idleStartTime : 0
        });
      }
    }, 30000); // Log activity every 30 seconds
  }

  // Start screenshot monitoring
  startScreenshotMonitoring() {
    if (this.screenshotInterval) return;

    this.screenshotInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.takeScreenshot();
      }
    }, 30000); // Take screenshot every 30 seconds
  }

  // Start idle detection
  startIdleDetection() {
    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keypress', this.handleKeyPress);
    document.addEventListener('click', this.handleClick);
    
    // Check for idle every minute
    this.idleTimeout = setInterval(this.checkIdle, 60000);
  }

  // Stop all monitoring
  stopMonitoring() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
    }
    
    if (this.idleTimeout) {
      clearInterval(this.idleTimeout);
      this.idleTimeout = null;
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keypress', this.handleKeyPress);
    document.removeEventListener('click', this.handleClick);
  }

  // Handle mouse movement
  handleMouseMove() {
    this.lastActivity = Date.now();
    this.metrics.mouseMovements++;
    
    if (this.isIdle) {
      this.setActive();
    }
  }

  // Handle key press
  handleKeyPress() {
    this.lastActivity = Date.now();
    this.metrics.keyStrokes++;
    
    if (this.isIdle) {
      this.setActive();
    }
  }

  // Handle click
  handleClick() {
    this.lastActivity = Date.now();
    this.metrics.clicks++;
    
    if (this.isIdle) {
      this.setActive();
    }
  }

  // Check if user is idle
  checkIdle() {
    const idleThreshold = 5 * 60 * 1000; // 5 minutes
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    
    if (timeSinceLastActivity > idleThreshold && !this.isIdle) {
      this.setIdle();
    }
  }

  // Set user as idle
  setIdle() {
    this.isIdle = true;
    this.idleStartTime = Date.now();
    this.metrics.idleSessions++;
    
    this.logActivity('idle_detected', {
      idleDuration: 0,
      productivityScore: this.productivityScore
    });
  }

  // Set user as active
  setActive() {
    if (this.isIdle) {
      const idleDuration = Date.now() - this.idleStartTime;
      this.metrics.totalIdleTime += idleDuration;
      this.metrics.averageIdleDuration = this.metrics.totalIdleTime / this.metrics.idleSessions;
      
      this.logActivity('active_detected', {
        idleDuration,
        productivityScore: this.productivityScore
      });
    }
    
    this.isIdle = false;
    this.idleStartTime = null;
  }

  // Take screenshot
  async takeScreenshot() {
    try {
      if (!this.sessionId) return;

      const canvas = await this.captureScreen();
      const imageData = canvas.toDataURL('image/png');
      
      const metadata = {
        pageUrl: window.location.href,
        windowTitle: document.title,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        browserInfo: navigator.userAgent,
        osInfo: this.getOSInfo(),
        activityContext: this.getActivityContext(),
        productivityScore: this.productivityScore,
        isIdle: this.isIdle,
        idleDuration: this.isIdle ? Date.now() - this.idleStartTime : 0,
        mousePosition: {
          x: 0, // Will be updated with actual mouse position
          y: 0
        },
        activeApplications: [document.title],
        networkActivity: navigator.onLine
      };

      await API.post('/monitoring/screenshot', {
        sessionId: this.sessionId,
        imageData,
        metadata
      });

      console.log('Screenshot captured');
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }

  // Capture screen using html2canvas or similar
  async captureScreen() {
    // This is a simplified version - in a real implementation,
    // you would use html2canvas or a similar library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create a simple representation of the screen
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text to indicate screenshot
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Screenshot captured at ' + new Date().toLocaleTimeString(), 10, 30);
    ctx.fillText('Page: ' + document.title, 10, 50);
    ctx.fillText('URL: ' + window.location.href, 10, 70);
    
    return canvas;
  }

  // Log activity
  async logActivity(activityType, details = {}) {
    try {
      if (!this.sessionId) return;

      await API.post('/monitoring/activity', {
        activityType,
        details: {
          pageUrl: window.location.href,
          windowTitle: document.title,
          productivityScore: this.productivityScore,
          isIdle: this.isIdle,
          ...details
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Update productivity score
  updateProductivityScore() {
    const baseScore = 100;
    let deductions = 0;
    
    // Deduct for idle time
    if (this.isIdle) {
      const idleDuration = Date.now() - this.idleStartTime;
      deductions += Math.min(50, idleDuration / (1000 * 60 * 10)); // Max 50 points for 10+ minutes idle
    }
    
    // Deduct for low activity
    const activityRate = (this.metrics.mouseMovements + this.metrics.keyStrokes + this.metrics.clicks) / 100;
    if (activityRate < 1) {
      deductions += 20;
    }
    
    this.productivityScore = Math.max(0, baseScore - deductions);
  }

  // Get device information
  getDeviceInfo() {
    return {
      browserInfo: navigator.userAgent,
      osInfo: this.getOSInfo(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      location: 'Unknown' // Would be determined by IP geolocation on server
    };
  }

  // Get OS information
  getOSInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Get activity context
  getActivityContext() {
    const activeElement = document.activeElement;
    const context = {
      currentPage: document.title,
      activeElement: activeElement ? activeElement.tagName : 'none',
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      }
    };
    
    return JSON.stringify(context);
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      productivityScore: this.productivityScore,
      isIdle: this.isIdle,
      sessionId: this.sessionId,
      isMonitoring: this.isMonitoring
    };
  }

  // Manual activity logging
  logManualActivity(activityType, details = {}) {
    this.logActivity(activityType, details);
  }

  // Force screenshot
  async forceScreenshot() {
    await this.takeScreenshot();
  }

  // Get session status
  getSessionStatus() {
    return {
      sessionId: this.sessionId,
      isMonitoring: this.isMonitoring,
      isIdle: this.isIdle,
      productivityScore: this.productivityScore,
      lastActivity: this.lastActivity
    };
  }

  // Admin: Get all screenshots for a user
  async getScreenshotsForUser(userId, token) {
    const response = await API.get(`/monitoring/screenshots/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Admin: Get a specific screenshot image
  async getScreenshotImage(screenshotId, token) {
    const response = await API.get(`/monitoring/screenshot/${screenshotId}/image`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService; 