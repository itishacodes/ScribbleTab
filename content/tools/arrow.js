'use strict';

const ScribbleArrowTool = {
  anchorPointX: 0,
  anchorPointY: 0,
  previewRenderSnapshot: null,

  onMouseDown(canvasContext, pointX, pointY, engineState) {
    this.anchorPointX = pointX;
    this.anchorPointY = pointY;
    
    // Cache the pristine canvas matrix grid state to manage continuous canvas invalidations safely
    this.previewRenderSnapshot = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
  },

  onMouseMove(canvasContext, pointX, pointY, engineState) {
    if (!engineState.isActionActive || !this.previewRenderSnapshot) return;

    // Purge prior preview frames by loading the cached initial snapshot layout frame
    canvasContext.putImageData(this.previewRenderSnapshot, 0, 0);

    // Call the dedicated math compositor to draw the current live arrow state
    this.renderVectorArrowStructure(canvasContext, this.anchorPointX, this.anchorPointY, pointX, pointY, engineState);
  },

  onMouseUp(canvasContext, pointX, pointY, engineState) {
    // Release heap storage allocations cleanly
    this.previewRenderSnapshot = null;
  },

  renderVectorArrowStructure(canvasContext, sourceX, sourceY, targetX, targetY, engineState) {
    // Dynamic ratio calculations to scale the structural head relative to stroke thickness metrics
    const structuralHeadLength = Math.max(15, engineState.currentStrokeWeight * 4);
    
    // Capture the continuous trajectory angle across the current 2D coordinate plane
    const directionalAngle = Math.atan2(targetY - sourceY, targetX - sourceX);

    // 1. Draw the Main Connecting Line Shaft
    canvasContext.beginPath();
    canvasContext.moveTo(sourceX, sourceY);
    canvasContext.lineTo(targetX, targetY);
    canvasContext.strokeStyle = engineState.currentColorHex;
    canvasContext.lineWidth = engineState.currentStrokeWeight;
    canvasContext.lineCap = 'round';
    canvasContext.stroke();

    // 2. Compute and Layer Vector Wings for the Cap Structure
    canvasContext.beginPath();
    
    // Left Wing Vector Coordinates Calculation Loop
    canvasContext.moveTo(targetX, targetY);
    canvasContext.lineTo(
      targetX - structuralHeadLength * Math.cos(directionalAngle - Math.PI / 6),
      targetY - structuralHeadLength * Math.sin(directionalAngle - Math.PI / 6)
    );
    
    // Right Wing Vector Coordinates Calculation Loop
    canvasContext.moveTo(targetX, targetY);
    canvasContext.lineTo(
      targetX - structuralHeadLength * Math.cos(directionalAngle + Math.PI / 6),
      targetY - structuralHeadLength * Math.sin(directionalAngle + Math.PI / 6)
    );
    
    canvasContext.strokeStyle = engineState.currentColorHex;
    canvasContext.lineWidth = engineState.currentStrokeWeight;
    canvasContext.lineCap = 'round';
    canvasContext.stroke();
  }
};