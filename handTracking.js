// handTracking.js - Fixed version with performance optimizations
class HandTracker {

  

  constructor() {
    this.canvas = document.getElementById('handCanvas');
    this.video = document.getElementById('camera');
    this.loading = document.getElementById('loading');
    
    if (!this.canvas || !this.video) {
      throw new Error('Required elements not found');
    }
    
    // Fix canvas performance issue
    this.ctx = this.canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true,
      desynchronized: true
    });
    
    this.currentFontSize = 1.5;
    this.targetFontSize = 1.5;
    this.lastTime = 0;
    this.smoothingFactor = 0.1;
    
    // Gesture recognition properties
    this.gestureHistory = [];
    this.gestureHoldTime = 0;
    this.gestureThreshold = 20;
    this.lastGesture = null;
    this.gestureDetected = false;
    this.cooldownTime = 40;
    this.cooldownCounter = 0;
    this.maxCooldownTime = 40;
    
    // Answer selection indicators
    this.currentGesture = null;
    this.gestureConfidence = 0;
    
    // Confirmation indicator properties
    this.confirmationActive = false;
    this.confirmationProgress = 0;
    this.confirmationStartTime = 0;
    
    // Offline detection properties
    this.detectionCanvas = document.createElement('canvas');
    this.detectionCtx = this.detectionCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false
    });
    this.skinColorThreshold = 80;
    this.handRegions = [];
    this.fingerTips = [];
    this.processingFrame = false;
    
    // Performance optimization
    this.frameSkipCounter = 0;
    this.frameSkipRate = 2; // Process every 2nd frame
    
    // Color detection settings
    this.skinColor = {
      r: { min: 95, max: 255 },
      g: { min: 40, max: 255 },
      b: { min: 20, max: 255 }
    };
    
    this.onHandDetectedCallback = null;
    this.onFontSizeChangeCallback = null;
    this.onGestureDetectedCallback = null;
    
    // Error handling
    this.errorCount = 0;
    this.maxErrors = 10;
  }

  // Set callback for when hands are detected (for inactivity timer)
  setOnHandDetectedCallback(callback) {
    this.onHandDetectedCallback = callback;
  }

  // Set callback for font size changes (for word animation)
  setOnFontSizeChangeCallback(callback) {
    this.onFontSizeChangeCallback = callback;
  }

  // Set callback for gesture detection (for quiz answers)
  setOnGestureDetectedCallback(callback) {
    this.onGestureDetectedCallback = callback;
  }

  hideLoading() {
    if (this.loading) {
      this.loading.style.opacity = '0';
      this.loading.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => {
        this.loading.style.display = 'none';
      }, 300);
    }
  }

  resizeCanvas() {
    if (this.video.videoWidth && this.video.videoHeight) {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.detectionCanvas.width = Math.floor(this.video.videoWidth / 4);
      this.detectionCanvas.height = Math.floor(this.video.videoHeight / 4);
    }
  }

  // Improved skin color detection
  isSkinColor(r, g, b) {
    const rgbSum = r + g + b;
    if (rgbSum === 0) return false;
    
    // Normalized RGB values
    const nr = r / rgbSum;
    const ng = g / rgbSum;
    const nb = b / rgbSum;
    
    // Enhanced skin color rules
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      nr > 0.36 && ng < 0.36 && nb < 0.25 &&
      rgbSum > 150 // Avoid very dark pixels
    );
  }

  // Optimized hand region detection
  findHandRegions() {
    const width = this.detectionCanvas.width;
    const height = this.detectionCanvas.height;
    
    try {
      // Draw scaled down video frame
      this.detectionCtx.drawImage(this.video, 0, 0, width, height);
      const imageData = this.detectionCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Create binary mask for skin pixels
      const skinMask = new Uint8Array(width * height);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelIndex = Math.floor(i / 4);
        
        skinMask[pixelIndex] = this.isSkinColor(r, g, b) ? 255 : 0;
      }
      
      // Find connected components (hand regions)
      const handRegions = this.findConnectedComponents(skinMask, width, height);
      
      // Filter and sort regions by size
      const validRegions = handRegions
        .filter(region => region.pixels.length > 50)
        .sort((a, b) => b.pixels.length - a.pixels.length)
        .slice(0, 2);
      
      return validRegions;
      
    } catch (error) {
      console.warn('Hand region detection error:', error);
      return [];
    }
  }

  // Optimized connected components detection
  findConnectedComponents(mask, width, height) {
    const visited = new Set();
    const regions = [];
    
    // Skip pixels for faster processing
    const skipSize = 2;
    
    for (let y = 0; y < height; y += skipSize) {
      for (let x = 0; x < width; x += skipSize) {
        const index = y * width + x;
        
        if (mask[index] === 255 && !visited.has(index)) {
          const region = this.floodFill(mask, width, height, x, y, visited);
          if (region.pixels.length > 20) {
            regions.push(region);
          }
        }
      }
    }
    
    return regions;
  }

  // Optimized flood fill algorithm
  floodFill(mask, width, height, startX, startY, visited) {
    const stack = [[startX, startY]];
    const pixels = [];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    
    while (stack.length > 0 && pixels.length < 2000) { // Limit for performance
      const [x, y] = stack.pop();
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || 
          visited.has(index) || mask[index] !== 255) {
        continue;
      }
      
      visited.add(index);
      pixels.push([x, y]);
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighbors (reduced for performance)
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    return {
      pixels,
      bounds: { minX, maxX, minY, maxY },
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    };
  }

  // Enhanced finger tip detection
  detectFingerTips(region) {
    const { pixels, bounds } = region;
    const fingerTips = [];
    
    // Find topmost points (potential finger tips)
    const topPoints = pixels
      .filter(([x, y]) => y === bounds.minY)
      .sort((a, b) => a[0] - b[0]);
    
    // Group nearby points and find peaks
    let currentGroup = [];
    let lastX = -1;
    const minDistance = 5; // Minimum distance between finger tips
    
    for (const [x, y] of topPoints) {
      if (lastX === -1 || x - lastX <= minDistance) {
        currentGroup.push([x, y]);
      } else {
        if (currentGroup.length > 2) { // Require minimum group size
          const avgX = currentGroup.reduce((sum, p) => sum + p[0], 0) / currentGroup.length;
          const avgY = currentGroup.reduce((sum, p) => sum + p[1], 0) / currentGroup.length;
          fingerTips.push([avgX, avgY]);
        }
        currentGroup = [[x, y]];
      }
      lastX = x;
    }
    
    if (currentGroup.length > 2) {
      const avgX = currentGroup.reduce((sum, p) => sum + p[0], 0) / currentGroup.length;
      const avgY = currentGroup.reduce((sum, p) => sum + p[1], 0) / currentGroup.length;
      fingerTips.push([avgX, avgY]);
    }
    
    return fingerTips.slice(0, 5); // Limit to 5 fingers max
  }

  // Enhanced gesture detection
  detectGesture(fingerTips) {
    if (!fingerTips || fingerTips.length === 0) {
      return { gesture: null, confidence: 0 };
    }
    
    const fingerCount = fingerTips.length;
    let gesture = null;
    let confidence = 0.5;
    
    // Improved mapping based on detected finger tips
    if (fingerCount === 1) {
      gesture = 0; // Answer 1
      confidence = 0.8;
    } else if (fingerCount === 2) {
      gesture = 1; // Answer 2
      confidence = 0.8;
    } else if (fingerCount === 3) {
      gesture = 2; // Answer 3
      confidence = 0.8;
    } else if (fingerCount >= 4) {
      gesture = 3; // Answer 4 or open hand
      confidence = 0.7;
    }
    
    // Special case for open hand (5 fingers)
    if (fingerCount === 5) {
      gesture = 0; // Use as trigger gesture
      confidence = 0.9;
    }
    
    console.log('Detected fingers:', fingerCount, 'Gesture:', gesture);
    
    return { gesture, confidence };
  }

  // Process gesture detection with improved stability
  processGesture(gestureResult) {
    if (this.cooldownCounter > 0) {
      this.cooldownCounter--;
      return;
    }
    
    if (gestureResult.gesture !== null && gestureResult.confidence > 0.6) {
      if (this.currentGesture === gestureResult.gesture) {
        this.gestureHoldTime++;
        this.gestureConfidence = Math.max(this.gestureConfidence, gestureResult.confidence);
        
        // Start confirmation animation
        if (!this.confirmationActive) {
          this.confirmationActive = true;
          this.confirmationStartTime = Date.now();
        }
        
        // Update confirmation progress
        this.confirmationProgress = Math.min(this.gestureHoldTime / this.gestureThreshold, 1);
        
        // Gesture held long enough
        if (this.gestureHoldTime >= this.gestureThreshold && !this.gestureDetected) {
          this.gestureDetected = true;
          this.cooldownCounter = this.cooldownTime;
          this.maxCooldownTime = this.cooldownTime;
          this.confirmationActive = false;
          this.confirmationProgress = 0;
          
          console.log('Gesture confirmed:', this.currentGesture, 'Confidence:', this.gestureConfidence);
          
          // Trigger gesture callback safely
          if (this.onGestureDetectedCallback) {
            try {
              this.onGestureDetectedCallback(this.currentGesture, this.gestureConfidence);
            } catch (error) {
              console.warn('Gesture callback error:', error);
            }
          }
          
          // Visual feedback
          this.showGestureConfirmation(this.currentGesture);
        }
      } else {
        // New gesture detected
        this.currentGesture = gestureResult.gesture;
        this.gestureHoldTime = 1;
        this.gestureConfidence = gestureResult.confidence;
        this.gestureDetected = false;
        this.confirmationActive = true;
        this.confirmationStartTime = Date.now();
        this.confirmationProgress = 0;
      }
    } else {
      // No clear gesture
      this.resetGestureState();
    }
  }

  // Reset gesture state
  resetGestureState() {
    this.currentGesture = null;
    this.gestureHoldTime = 0;
    this.gestureConfidence = 0;
    this.gestureDetected = false;
    this.confirmationActive = false;
    this.confirmationProgress = 0;
  }

  // Enhanced visual confirmation
  showGestureConfirmation(gestureIndex) {
    try {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Answer ${gestureIndex + 1}!`, this.canvas.width / 2, 100);
      this.ctx.restore();
      
      setTimeout(() => {
        if (!this.currentGesture) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }, 1000);
    } catch (error) {
      console.warn('Confirmation display error:', error);
    }
  }

  // Enhanced confirmation indicator
  drawConfirmationIndicator() {
    if (!this.confirmationActive || this.confirmationProgress <= 0) {
      return;
    }
    
    try {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height - 280;
      const radius = 35;
      
      const angle = this.confirmationProgress * 2 * Math.PI;
      
      this.ctx.save();
      
      // Background circle
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Progress arc
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius - 4, -Math.PI / 2, -Math.PI / 2 + angle);
      this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
      
      // Gesture number
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText((this.currentGesture + 1).toString(), centerX, centerY);
      
      // "CONFIRMING" text
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText('CONFIRMING', centerX, centerY + 50);
      
      this.ctx.restore();
    } catch (error) {
      console.warn('Confirmation indicator error:', error);
    }
  }

  // Enhanced cooldown indicator
  drawCooldownIndicator() {
    if (this.cooldownCounter <= 0) return;
    
    try {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height - 180;
      const radius = 30;
      
      const progress = this.cooldownCounter / this.maxCooldownTime;
      const countdownSeconds = Math.ceil(this.cooldownCounter / 20);
      
      this.ctx.save();
      
      // Background circle
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Countdown number
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(countdownSeconds.toString(), centerX, centerY);
      
      // "COOLDOWN" text
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.font = '10px Arial';
      this.ctx.fillText('COOLDOWN', centerX, centerY + 45);
      
      this.ctx.restore();
    } catch (error) {
      console.warn('Cooldown indicator error:', error);
    }
  }

  processFrame() {
    if (this.processingFrame || !this.video.videoWidth) return;
    
    this.processingFrame = true;
    
    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Find hand regions
      const handRegions = this.findHandRegions();
      
      if (handRegions.length > 0) {
        // Take the largest hand region
        const mainHand = handRegions[0];
        
        // Detect finger tips
        const fingerTips = this.detectFingerTips(mainHand);
        
        // Simple font size control based on hand size
        const handSize = Math.max(
          mainHand.bounds.maxX - mainHand.bounds.minX,
          mainHand.bounds.maxY - mainHand.bounds.minY
        );
        
        // Scale to original canvas coordinates
        const scaleFactor = 4; // Since we downscaled by 4
        const scaledHandSize = handSize * scaleFactor;
        
        // Font size control (simple version)
        const normalizedSize = Math.min(1, Math.max(0, (scaledHandSize - 50) / 200));
        this.targetFontSize = 1.5 + normalizedSize * 2;
        
        // Gesture detection
        const gestureResult = this.detectGesture(fingerTips);
        this.processGesture(gestureResult);
        
        // Draw hand region outline (for debugging)
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          mainHand.bounds.minX * scaleFactor,
          mainHand.bounds.minY * scaleFactor,
          (mainHand.bounds.maxX - mainHand.bounds.minX) * scaleFactor,
          (mainHand.bounds.maxY - mainHand.bounds.minY) * scaleFactor
        );
        
        // Draw finger tips
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        fingerTips.forEach(([x, y]) => {
          this.ctx.beginPath();
          this.ctx.arc(x * scaleFactor, y * scaleFactor, 8, 0, 2 * Math.PI);
          this.ctx.fill();
        });
        
        // Safely call hand detected callback
        if (this.onHandDetectedCallback) {
          try {
            this.onHandDetectedCallback();
          } catch (error) {
            console.warn('Hand detected callback error:', error);
          }
        }
      } else {
        this.targetFontSize = 1.5;
        this.currentGesture = null;
        this.gestureHoldTime = 0;
        this.gestureDetected = false;
        this.confirmationActive = false;
        this.confirmationProgress = 0;
      }
      
      // Draw indicators
      this.drawConfirmationIndicator();
      this.drawCooldownIndicator();
      
      // Smooth font size transition
      this.currentFontSize += (this.targetFontSize - this.currentFontSize) * this.smoothingFactor;
      
      if (Math.abs(this.targetFontSize - this.currentFontSize) > 0.01) {
        if (this.onFontSizeChangeCallback) {
          this.onFontSizeChangeCallback(this.currentFontSize);
        }
      }
      
    } catch (error) {
      console.warn('Frame processing error:', error);
    }
    
    this.processingFrame = false;
  }

  async startCamera() {
    try {
      this.loading.textContent = 'Requesting camera access...';
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      this.video.srcObject = stream;
      
      this.loading.textContent = 'Initializing offline hand detection...';
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.resizeCanvas();
          resolve();
        };
      });
      
      this.hideLoading();
      
      // Start processing frames
      const processLoop = () => {
        this.processFrame();
        requestAnimationFrame(processLoop);
      };
      
      processLoop();
      
    } catch (error) {
      console.error('Error starting camera:', error);
      this.loading.textContent = 'Camera access failed. Please allow camera permissions.';
      this.loading.style.color = '#ff6b6b';
      
      setTimeout(() => {
        this.hideLoading();
      }, 3000);
    }
  }

  // Get current font size
  getCurrentFontSize() {
    return this.currentFontSize;
  }

  // Stop hand tracking
  stop() {
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
  }
}