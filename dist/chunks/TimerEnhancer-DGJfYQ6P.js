import { B as BaseEnhancer } from "./index-vJoanOk4.js";
class TimerEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.duration = 0;
    this.persistenceId = "";
    this.format = "mm:ss";
    this.startTime = 0;
  }
  async initialize() {
    this.validateElement();
    const durationAttr = this.getRequiredAttribute("data-duration");
    this.duration = parseInt(durationAttr, 10);
    this.persistenceId = this.getAttribute("data-persistence-id") || "default-timer";
    this.format = this.getAttribute("data-format") || "mm:ss";
    this.loadStartTime();
    this.startTimer();
    this.logger.debug(`Initialized timer: ${this.duration}s, persistence: ${this.persistenceId}`);
  }
  update() {
  }
  loadStartTime() {
    const stored = localStorage.getItem(`next-timer-${this.persistenceId}`);
    if (stored) {
      this.startTime = parseInt(stored, 10);
    } else {
      this.startTime = Date.now();
      localStorage.setItem(`next-timer-${this.persistenceId}`, this.startTime.toString());
    }
  }
  startTimer() {
    this.updateDisplay();
    this.interval = window.setInterval(() => {
      this.updateDisplay();
    }, 1e3);
  }
  updateDisplay() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1e3);
    const remaining = Math.max(0, this.duration - elapsed);
    if (remaining === 0) {
      this.handleTimerExpired();
      return;
    }
    const formatted = this.formatTime(remaining);
    const displayElement = this.element.querySelector("[data-next-timer-display]") || this.element;
    displayElement.textContent = formatted;
  }
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    switch (this.format) {
      case "hh:mm:ss":
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
      case "mm:ss":
        return `${pad(minutes)}:${pad(secs)}`;
      case "ss":
        return pad(secs);
      default:
        return `${pad(minutes)}:${pad(secs)}`;
    }
  }
  handleTimerExpired() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = void 0;
    }
    localStorage.removeItem(`next-timer-${this.persistenceId}`);
    this.element.style.display = "none";
    const expiredElements = document.querySelectorAll(`[data-next-timer-expired][data-persistence-id="${this.persistenceId}"]`);
    expiredElements.forEach((el) => {
      el.style.display = "";
    });
    this.emit("timer:expired", { persistenceId: this.persistenceId });
    this.logger.debug(`Timer expired: ${this.persistenceId}`);
  }
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    super.destroy();
  }
}
export {
  TimerEnhancer
};
