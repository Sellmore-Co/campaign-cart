/**
 * Countdown Timer - Standalone Module
 * Supports multiple timers on the same page
 *
 * Usage:
 * 1. Include this script in your HTML
 * 2. Add elements with data-os-element="timer" attribute and time in MM:SS format
 * 3. Timers will auto-initialize on page load
 *
 * Example:
 * <span data-os-element="timer">05:00</span>
 * <div data-os-element="timer">10:30</div>
 *
 * Events:
 * - timerExpired: Fired when timer reaches 00:00
 *
 * Classes added:
 * - urgent: When timer is under 60 seconds
 * - expired: When timer reaches 00:00
 */

(function() {
  'use strict';

  // Countdown Timer Class
  class CountdownTimer {
    constructor(element) {
      this.element = element;
      this.remainingSeconds = this._parseTime(element.textContent);
      this.intervalId = null;
      this._start();
    }

    _parseTime(timeString) {
      const [minutes, seconds] = timeString.split(':').map(num => parseInt(num) || 0);
      return minutes * 60 + seconds;
    }

    _formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    _start() {
      this.intervalId = setInterval(() => {
        this.remainingSeconds--;

        if (this.remainingSeconds <= 0) {
          this.stop();
          this.element.textContent = '00:00';
          this.element.classList.add('expired');
          this.element.dispatchEvent(new CustomEvent('timerExpired', {
            bubbles: true,
            detail: { element: this.element }
          }));
        } else {
          this.element.textContent = this._formatTime(this.remainingSeconds);

          // Add urgency class when under 60 seconds
          if (this.remainingSeconds === 60) {
            this.element.classList.add('urgent');
            this.element.dispatchEvent(new CustomEvent('timerUrgent', {
              bubbles: true,
              detail: { element: this.element, remainingSeconds: this.remainingSeconds }
            }));
          }

          // Optional: Dispatch tick event
          this.element.dispatchEvent(new CustomEvent('timerTick', {
            bubbles: true,
            detail: {
              element: this.element,
              remainingSeconds: this.remainingSeconds,
              formattedTime: this._formatTime(this.remainingSeconds)
            }
          }));
        }
      }, 1000);
    }

    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    // Public methods
    pause() {
      this.stop();
    }

    resume() {
      if (!this.intervalId && this.remainingSeconds > 0) {
        this._start();
      }
    }

    reset(seconds) {
      this.stop();
      this.remainingSeconds = seconds || this._parseTime(this.element.getAttribute('data-timer-initial') || '00:00');
      this.element.textContent = this._formatTime(this.remainingSeconds);
      this.element.classList.remove('expired', 'urgent');
      this._start();
    }

    getRemainingSeconds() {
      return this.remainingSeconds;
    }
  }

  // Timer Manager - Handles all timers on the page
  class TimerManager {
    constructor() {
      this.timers = new Map();
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupTimers());
      } else {
        this.setupTimers();
      }
    }

    setupTimers() {
      const timerElements = document.querySelectorAll('[data-os-element="timer"]');

      timerElements.forEach(element => {
        // Store initial time as data attribute for reset functionality
        element.setAttribute('data-timer-initial', element.textContent);

        const timer = new CountdownTimer(element);
        this.timers.set(element, timer);
      });

      // Expose global API if needed
      window.CountdownTimerManager = this;
    }

    // Public API methods
    getTimer(element) {
      return this.timers.get(element);
    }

    pauseAll() {
      this.timers.forEach(timer => timer.pause());
    }

    resumeAll() {
      this.timers.forEach(timer => timer.resume());
    }

    resetAll() {
      this.timers.forEach(timer => timer.reset());
    }

    stopAll() {
      this.timers.forEach(timer => timer.stop());
    }
  }

  // Add default styles
  const addDefaultStyles = () => {
    const styleId = 'countdown-timer-styles';

    // Check if styles already exist
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Countdown Timer Default Styles */
      [data-os-element="timer"] {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        transition: color 0.3s ease, transform 0.3s ease;
      }

      [data-os-element="timer"].urgent {
        color: #ff9800;
        animation: urgentPulse 1s ease-in-out infinite;
      }

      [data-os-element="timer"].expired {
        color: #ff4444;
        animation: none;
      }

      @keyframes urgentPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }

      /* Optional: Add a subtle glow effect for urgent state */
      [data-os-element="timer"].urgent {
        text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
      }

      /* Optional: Strike-through for expired */
      [data-os-element="timer"].expired::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 2px;
        background: currentColor;
        transform: scaleX(0);
        animation: strikeThrough 0.3s ease forwards;
      }

      @keyframes strikeThrough {
        to {
          transform: scaleX(1);
        }
      }
    `;

    document.head.appendChild(style);
  };

  // Initialize everything
  addDefaultStyles();
  const timerManager = new TimerManager();

  // Example usage with event listeners (optional - remove if not needed)
  document.addEventListener('timerExpired', (e) => {
    console.log('Timer expired:', e.detail.element);
    // You can add custom behavior here, like:
    // - Show a modal
    // - Redirect the user
    // - Display a message
  });

  document.addEventListener('timerUrgent', (e) => {
    console.log('Timer urgent:', e.detail.element, 'Remaining:', e.detail.remainingSeconds);
    // You can add custom behavior here
  });

  // Expose classes globally if needed for manual control
  window.CountdownTimer = CountdownTimer;
  window.TimerManager = TimerManager;

})();