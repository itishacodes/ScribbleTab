'use strict';

if (typeof window.ScribbleOverlay === 'undefined') {
  window.ScribbleOverlay = {
    canvasElement: null,
    isMounted: false,

    init() {
      if (this.canvasElement) return this.canvasElement;

      this.canvasElement = document.createElement('canvas');
      this.canvasElement.id = 'scribbletab-viewport-canvas';
      
      this.resizeCanvasToViewport();
      document.body.appendChild(this.canvasElement);
      
      window.addEventListener('resize', this.handleViewportResize.bind(this));
      return this.canvasElement;
    },

    enableWorkspace() {
      if (!this.canvasElement) return;
      this.canvasElement.style.setProperty('pointer-events', 'all', 'important');
      this.isMounted = true;
    },

    resizeCanvasToViewport() {
      if (!this.canvasElement) return;
      this.canvasElement.width = window.innerWidth;
      this.canvasElement.height = window.innerHeight;
    },

    handleViewportResize() {
      if (!this.canvasElement || !this.isMounted) return;
      
      const engineCtx = this.canvasElement.getContext('2d');
      const temporarySnapshot = engineCtx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      this.resizeCanvasToViewport();
      engineCtx.putImageData(temporarySnapshot, 0, 0);
    },

    teardown() {
      if (this.canvasElement) {
        this.canvasElement.remove();
        this.canvasElement = null;
      }
      this.isMounted = false;
      window.removeEventListener('resize', this.handleViewportResize.bind(this));
    }
  };
}

// Map local alias for the execution scripts
var ScribbleOverlay = window.ScribbleOverlay;