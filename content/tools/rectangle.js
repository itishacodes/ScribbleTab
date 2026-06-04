'use strict';

const ScribbleRectTool = {
  clickAnchorPointX: 0,
  clickAnchorPointY: 0,
  canvasLayoutCacheBuffer: null,

  onMouseDown(canvasContext, targetX, targetY, engineState) {
    this.clickAnchorPointX = targetX;
    this.clickAnchorPointY = targetY;
    this.canvasLayoutCacheBuffer = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
  },

  onMouseMove(canvasContext, currentX, currentY, engineState) {
    if (!engineState.isActionActive || !this.canvasLayoutCacheBuffer) return;

    canvasContext.putImageData(this.canvasLayoutCacheBuffer, 0, 0);

    const absoluteVectorWidth  = currentX - this.clickAnchorPointX;
    const absoluteVectorHeight = currentY - this.clickAnchorPointY;

    canvasContext.beginPath();
    canvasContext.rect(this.clickAnchorPointX, this.clickAnchorPointY, absoluteVectorWidth, absoluteVectorHeight);
    
    canvasContext.strokeStyle = engineState.currentColorHex;
    canvasContext.lineWidth = engineState.currentStrokeWeight;
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.stroke();
  },

  onMouseUp(canvasContext, finalX, finalY, engineState) {
    this.canvasLayoutCacheBuffer = null;
  }
};