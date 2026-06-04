'use strict';

const ScribbleEraserTool = {
  onMouseDown(canvasContext, targetX, targetY, engineState) {
    // Structural vector open path initialization tracking node
    canvasContext.beginPath();
    canvasContext.moveTo(targetX, targetY);
  },

  onMouseMove(canvasContext, currentX, currentY, engineState) {
    if (!engineState.isActionActive) return;

    // Scale multiplier adjustment to make erasing feel broad, satisfying, and responsive
    const localEraserFootprintDimension = engineState.currentStrokeWeight * 4;
    
    // Convert current target center point into appropriate localized coordinate bounding box offsets
    const spatialBoundingOffsetX = currentX - localEraserFootprintDimension / 2;
    const spatialBoundingOffsetY = currentY - localEraserFootprintDimension / 2;

    // Core Canvas state pixel erasure execution stream
    canvasContext.clearRect(
      spatialBoundingOffsetX,
      spatialBoundingOffsetY,
      localEraserFootprintDimension,
      localEraserFootprintDimension
    );
  },

  onMouseUp(canvasContext, finalX, finalY, engineState) {
    // Volatile termination lifecycle handler hook placeholder
  }
};