/**
 * TimerManager - Manages countdown timers
 * 
 * This class handles countdown timers that can be added to the page
 * using data-os-element="timer" attributes.
 */

export class TimerManager {
  #app;
  #logger;
  #timers = new Map();
  #storagePrefix = 'os-timer-';

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('TIMER');
    this.#initTimers();
    this.#logger.infoWithTime('TimerManager initialized');
  }

  /**
   * Initialize all timers on the page
   */
  #initTimers() {
    this.#logger.infoWithTime('Initializing timers');
    const timerElements = document.querySelectorAll('[data-os-element="timer"]');
    
    if (timerElements.length === 0) {
      this.#logger.debugWithTime('No timer elements found on page');
      return;
    }
    
    this.#logger.debugWithTime(`Found ${timerElements.length} timer elements`);
    
    timerElements.forEach((timerElement) => {
      this.#setupTimer(timerElement);
    });
  }

  /**
   * Set up a single timer element
   * @param {HTMLElement} timerElement - The timer element to set up
   */
  #setupTimer(timerElement) {
    // Get the parent element that may contain timer configuration
    const parentElement = timerElement.closest('[data-os-element="timer-text"]');
    
    if (!parentElement) {
      this.#logger.warnWithTime(`Timer element has no parent with data-os-element="timer-text", using default configuration`);
    }
    
    // Get timer configuration
    const timerConfig = this.#getTimerConfig(timerElement, parentElement);
    
    if (!timerConfig.duration) {
      this.#logger.warnWithTime(`Timer element is missing duration, skipping: ${timerElement.outerHTML}`);
      return;
    }
    
    // Store the original content of the parent element for potential restoration
    const originalParentContent = parentElement ? parentElement.innerHTML : null;
    
    // Set up the timer
    let startTime = +new Date();
    const timerPersistenceId = timerConfig.persistenceId;
    
    // If we have a persistence ID, try to load the start time from localStorage
    if (timerPersistenceId) {
      const storageKey = this.#storagePrefix + timerPersistenceId;
      const cachedStartTime = parseInt(localStorage.getItem(storageKey) || "");
      
      if (cachedStartTime > 0) {
        startTime = cachedStartTime;
        this.#logger.debugWithTime(`Loaded persisted timer start time for ${timerPersistenceId}: ${new Date(startTime).toISOString()}`);
      } else {
        localStorage.setItem(storageKey, String(startTime));
        this.#logger.debugWithTime(`Saved new timer start time for ${timerPersistenceId}: ${new Date(startTime).toISOString()}`);
      }
    } else {
      this.#logger.debugWithTime(`Timer has no persistence ID, it will reset with every page load: ${timerElement.outerHTML}`);
    }
    
    // Create a timer object to store the interval ID
    const timer = {
      element: timerElement,
      parentElement,
      config: timerConfig,
      startTime,
      intervalId: null,
      originalParentContent
    };
    
    // Store the timer information
    this.#timers.set(timerElement, timer);
    
    // Create the timer update handler with access to the timer object
    const updateHandler = () => {
      const now = +new Date();
      const elapsed = (now - startTime) / 1000;
      let seconds = Math.round(timerConfig.duration - elapsed);
      
      if (seconds <= 0) {
        seconds = 0;
        
        // Handle timer expiry
        if (timerConfig.expiryText) {
          // Check if we should replace the entire parent content or just the timer
          if (parentElement && timerConfig.replaceEntireContent) {
            parentElement.innerHTML = timerConfig.expiryText;
          } else {
            timerElement.innerText = timerConfig.expiryText;
          }
        } else {
          timerElement.innerText = "00:00";
        }
        
        // Clear the interval - now we can safely access the intervalId from the timer object
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.intervalId = null;
        }
        
        this.#timers.delete(timerElement);
        
        // Trigger expiry event
        this.#triggerTimerEvent('expired', timerElement, { 
          timerElement, 
          parentElement, 
          config: timerConfig 
        });
        
        return;
      }
      
      // Format the time
      const hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      const minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      
      // Update the timer text
      const formattedTime = this.#formatTime(hours, minutes, seconds, timerConfig.format);
      timerElement.innerText = formattedTime;
      
      // Trigger update event
      this.#triggerTimerEvent('updated', timerElement, { 
        timerElement, 
        parentElement, 
        config: timerConfig,
        remaining: { hours, minutes, seconds },
        formattedTime
      });
    };
    
    // Run the handler immediately to set the initial value
    updateHandler();
    
    // Set up the interval and store the ID in the timer object
    timer.intervalId = setInterval(updateHandler, 1000);
    
    this.#logger.debugWithTime(`Timer initialized: ${timerConfig.duration} seconds, persistence ID: ${timerConfig.persistenceId || 'none'}`);
  }

  /**
   * Get timer configuration from element attributes
   * @param {HTMLElement} timerElement - The timer element
   * @param {HTMLElement|null} parentElement - The parent element with timer configuration
   * @returns {Object} Timer configuration
   */
  #getTimerConfig(timerElement, parentElement) {
    const config = {
      duration: 0,
      persistenceId: null,
      expiryText: null,
      format: 'auto', // 'auto', 'hh:mm:ss', 'mm:ss', 'ss'
      replaceEntireContent: false // Whether to replace the entire parent content on expiry
    };
    
    // Try to get duration from data attributes
    if (timerElement.dataset.osDuration) {
      config.duration = parseInt(timerElement.dataset.osDuration);
    } else if (parentElement?.dataset.osTimerDuration) {
      config.duration = parseInt(parentElement.dataset.osTimerDuration);
    }
    
    // Try to get persistence ID from data attributes
    if (timerElement.dataset.osPersistenceId) {
      config.persistenceId = timerElement.dataset.osPersistenceId;
    } else if (parentElement?.dataset.osTimerPersistenceId) {
      config.persistenceId = parentElement.dataset.osTimerPersistenceId;
    }
    
    // Try to get expiry text from data attributes
    if (timerElement.dataset.osExpiryText) {
      config.expiryText = timerElement.dataset.osExpiryText;
    } else if (parentElement?.dataset.osTimerExpiryText) {
      config.expiryText = parentElement.dataset.osTimerExpiryText;
    }
    
    // Try to get format from data attributes
    if (timerElement.dataset.osFormat) {
      config.format = timerElement.dataset.osFormat;
    } else if (parentElement?.dataset.osTimerFormat) {
      config.format = parentElement.dataset.osTimerFormat;
    }
    
    // Check if we should replace the entire content
    if (timerElement.dataset.osReplaceEntireContent === 'true') {
      config.replaceEntireContent = true;
    } else if (parentElement?.dataset.osTimerReplaceEntireContent === 'true') {
      config.replaceEntireContent = true;
    }
    
    // If the expiry text contains HTML tags, we should replace the entire content
    if (config.expiryText && (config.expiryText.includes('<') || config.expiryText.includes('>'))) {
      config.replaceEntireContent = true;
    }
    
    return config;
  }

  /**
   * Format time according to the specified format
   * @param {number} hours - Hours
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @param {string} format - Format string ('auto', 'hh:mm:ss', 'mm:ss', 'ss')
   * @returns {string} Formatted time
   */
  #formatTime(hours, minutes, seconds, format) {
    const padded = (num) => num.toString().padStart(2, '0');
    
    if (format === 'hh:mm:ss' || (format === 'auto' && hours > 0)) {
      return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`;
    } else if (format === 'mm:ss' || (format === 'auto' && minutes > 0)) {
      return `${padded(minutes)}:${padded(seconds)}`;
    } else if (format === 'ss') {
      return padded(seconds);
    }
    
    // Default format (auto with no significant time)
    return `${padded(minutes)}:${padded(seconds)}`;
  }

  /**
   * Trigger a timer event
   * @param {string} eventName - Name of the event
   * @param {HTMLElement} element - Element that triggered the event
   * @param {Object} detail - Event details
   */
  #triggerTimerEvent(eventName, element, detail = {}) {
    const event = new CustomEvent(`os:timer.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { ...detail, manager: this }
    });
    
    element.dispatchEvent(event);
    document.dispatchEvent(event);
    this.#logger.debugWithTime(`Timer event triggered: ${eventName}`);
  }

  /**
   * Refresh all timers on the page
   * This can be called after dynamic content is loaded
   */
  refreshTimers() {
    this.#logger.infoWithTime('Refreshing timers');
    
    // Clear existing timers
    this.#timers.forEach((timer) => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
      }
    });
    
    this.#timers.clear();
    
    // Re-initialize timers
    this.#initTimers();
  }

  /**
   * Get all active timers
   * @returns {Map} Map of active timers
   */
  getTimers() {
    return this.#timers;
  }
} 