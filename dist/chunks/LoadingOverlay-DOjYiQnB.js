class LoadingOverlay {
  constructor() {
    this.overlay = null;
    this.showTime = 0;
  }
  show() {
    if (this.overlay) return;
    this.showTime = Date.now();
    this.overlay = document.createElement("div");
    this.overlay.className = "next-loading-overlay";
    this.overlay.innerHTML = `
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .next-loading-spinner .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: var(--brand--color--primary, #000);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      </style>
      <div class="next-loading-spinner">
        <div class="spinner"></div>
      </div>
    `;
    Object.assign(this.overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    });
    document.body.appendChild(this.overlay);
  }
  hide(immediate = false) {
    if (!this.overlay) return;
    if (immediate) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    } else {
      const elapsedTime = Date.now() - this.showTime;
      const remainingTime = Math.max(0, 3e3 - elapsedTime);
      setTimeout(() => {
        if (this.overlay) {
          document.body.removeChild(this.overlay);
          this.overlay = null;
        }
      }, remainingTime);
    }
  }
}
export {
  LoadingOverlay as L
};
