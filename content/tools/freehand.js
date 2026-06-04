'use strict';

const ScribbleFreehandTool = {
  coordinatePathHistory: [],

  onMouseDown(canvasContext, clickX, clickY, engineState) {
    // Clear array and seed with the initial structural entry node
    this.coordinatePathHistory = [{ horizontalX: clickX, verticalY: clickY }];
    
    canvasContext.beginPath();
    canvasContext.moveTo(clickX, clickY);
  },

  onMouseMove(canvasContext, currentX, currentY, engineState) {
    if (!engineState.isActionActive) return;

    this.coordinatePathHistory.push({ horizontalX: currentX, verticalY: currentY });

    const currentStreamLength = this.coordinatePathHistory.length;

    // Linear fallback protection routine for early trajectory path sequences
    if (currentStreamLength < 3) {
      canvasContext.strokeStyle = engineState.currentColorHex;
      canvasContext.lineWidth = engineState.currentStrokeWeight;
      canvasContext.lineCap = 'round';
      canvasContext.lineJoin = 'round';
      canvasContext.lineTo(currentX, currentY);
      canvasContext.stroke();
      return;
    }

    // Dynamic Quadratic Bezier vector interpolation using relative historical midpoint arrays
    const pointNodeAlpha = this.coordinatePathHistory[currentStreamLength - 3];
    const pointNodeBeta  = this.coordinatePathHistory[currentStreamLength - 2];
    const pointNodeGamma = this.coordinatePathHistory[currentStreamLength - 1];

    // Compute localized midpoint interpolation ranges across target coordinates
    const initialSegmentMidpointX = (pointNodeAlpha.horizontalX + pointNodeBeta.horizontalX) / 2;
    const initialSegmentMidpointY = (pointNodeAlpha.verticalY + pointNodeBeta.verticalY) / 2;
    
    const terminalSegmentMidpointX = (pointNodeBeta.horizontalX + pointNodeGamma.horizontalX) / 2;
    const terminalSegmentMidpointY = (pointNodeBeta.verticalY + pointNodeGamma.verticalY) / 2;

    // Execute curve composition path pipeline modifications
    canvasContext.beginPath();
    canvasContext.moveTo(initialSegmentMidpointX, initialSegmentMidpointY);
    
    // Smooth rendering transition passing directly through pointNodeBeta control metrics
    canvasContext.quadraticCurveTo(
      pointNodeBeta.horizontalX, 
      pointNodeBeta.verticalY, 
      terminalSegmentMidpointX, 
      terminalSegmentMidpointY
    );
    
    canvasContext.strokeStyle = engineState.currentColorHex;
    canvasContext.lineWidth = engineState.currentStrokeWeight;
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.stroke();
  },

  onMouseUp(canvasContext, finalX, finalY, engineState) {
    // Discrete mouse interaction safety layer: Draw a singular dot node if zero tracking paths took place
    if (this.coordinatePathHistory.length === 1) {
      canvasContext.beginPath();
      canvasContext.arc(
        finalX, 
        finalY, 
        engineState.currentStrokeWeight / 2, 
        0, 
        Math.PI * 2
      );
      canvasContext.fillStyle = engineState.currentColorHex;
      canvasContext.fill();
    }
    
    // Purge memory tracks cleanly
    this.coordinatePathHistory = [];
  }
};