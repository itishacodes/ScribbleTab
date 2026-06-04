'use strict';

const ScribbleCircleTool = {
  originCoordinateX: 0,
  originCoordinateY: 0,
  canvasLayoutCacheBuffer: null,

  onMouseDown(canvasContext, clickX, clickY, engineState) {
    this.originCoordinateX = clickX;
    this.originCoordinateY = clickY;
    
    // Cache the pristine canvas matrix grid state to manage continuous canvas invalidations safely
    this.canvasLayoutCacheBuffer = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
  },

  onMouseMove(canvasContext, currentX, currentY, engineState) {
    if (!engineState.isActionActive || !this.canvasLayoutCacheBuffer) return;

    // Purge prior preview frames by loading the cached initial snapshot layout frame
    canvasContext.putImageData(this.canvasLayoutCacheBuffer, 0, 0);

    // Compute absolute delta steps to isolate coordinate space dimensions
    const horizontalRadiusDelta = Math.abs(currentX - this.originCoordinateX) / 2;
    const verticalRadiusDelta = Math.abs(currentY - this.originCoordinateY) / 2;
    
    // Establish absolute center focal tracking coordinates based on mouse extension pathing
    const shapeCenterFocalX = this.originCoordinateX + (currentX - this.originCoordinateX) / 2;
    const shapeCenterFocalY = this.originCoordinateY + (currentY - this.originCoordinateY) / 2;

    // Execute standard native geometric ellipse rendering pipeline
    canvasContext.beginPath();
    canvasContext.ellipse(
      shapeCenterFocalX, 
      shapeCenterFocalY, 
      horizontalRadiusDelta, 
      verticalRadiusDelta, 
      0, // Rotation angle (static on screen viewport coordinates)
      0, // Start angle of arc
      Math.PI * 2 // Complete full loop terminal angle
    );
    
    canvasContext.strokeStyle = engineState.currentColorHex;
    canvasContext.lineWidth = engineState.currentStrokeWeight;
    canvasContext.stroke();
  },

  onMouseUp(canvasContext, finalX, finalY, engineState) {
    // Release heap storage allocations cleanly
    this.canvasLayoutCacheBuffer = null;
  }
};