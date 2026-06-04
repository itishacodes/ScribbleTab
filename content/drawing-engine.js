'use strict';

const ScribbleDrawingEngine = {
  MAX_HISTORY_DEPTH: 30,
  
  targetCanvas: null,
  drawingContext: null,
  historyBufferStack: [],
  userIsDrawing: false,

  currentSettingsState: {
    activeToolName: 'freehand',
    currentColorHex: '#ef4444', // Defaulting to our new vivid red palette element
    currentStrokeWeight: 3,
    isActionActive: false
  },

  registeredVectorTools: {
    freehand: ScribbleFreehandTool,
    rect: ScribbleRectTool,
    circle: ScribbleCircleTool,
    arrow: ScribbleArrowTool,
    eraser: ScribbleEraserTool
  },

  init(canvasElement) {
    this.targetCanvas = canvasElement;
    this.drawingContext = canvasElement.getContext('2d', { willReadFrequently: true });

    // Attach interaction handling hooks
    this.targetCanvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
    this.targetCanvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
    this.targetCanvas.addEventListener('mouseup', this.handlePointerUp.bind(this));
    this.targetCanvas.addEventListener('mouseleave', this.handlePointerUp.bind(this));
  },

  calculateRelativeCoordinates(event) {
    const spatialBounds = this.targetCanvas.getBoundingClientRect();
    return {
      clientXCoord: event.clientX - spatialBounds.left,
      clientYCoord: event.clientY - spatialBounds.top
    };
  },

  commitCanvasStateToHistory() {
    this.historyBufferStack.push(
      this.drawingContext.getImageData(0, 0, this.targetCanvas.width, this.targetCanvas.height)
    );
    
    // Trim oldest historical frames if memory bounds are exceeded
    if (this.historyBufferStack.length > this.MAX_HISTORY_DEPTH) {
      this.historyBufferStack.shift();
    }
  },

  executeUndo() {
    if (this.historyBufferStack.length === 0) return;
    const historicalPixelBuffer = this.historyBufferStack.pop();
    this.drawingContext.putImageData(historicalPixelBuffer, 0, 0);
  },

  handlePointerDown(event) {
    if (event.button !== 0) return; // Only execute on primary left clicks

    const { clientXCoord, clientYCoord } = this.calculateRelativeCoordinates(event);
    this.userIsDrawing = true;
    this.currentSettingsState.isActionActive = true;

    this.commitCanvasStateToHistory();
    this.synchronizeContextStyles();

    const contextualTool = this.registeredVectorTools[this.currentSettingsState.activeToolName];
    if (contextualTool && typeof contextualTool.onMouseDown === 'function') {
      contextualTool.onMouseDown(this.drawingContext, clientXCoord, clientYCoord, this.currentSettingsState);
    }
  },

  handlePointerMove(event) {
    if (!this.userIsDrawing) return;

    const { clientXCoord, clientYCoord } = this.calculateRelativeCoordinates(event);
    this.synchronizeContextStyles();

    const contextualTool = this.registeredVectorTools[this.currentSettingsState.activeToolName];
    if (contextualTool && typeof contextualTool.onMouseMove === 'function') {
      contextualTool.onMouseMove(this.drawingContext, clientXCoord, clientYCoord, this.currentSettingsState);
    }
  },

  handlePointerUp(event) {
    if (!this.userIsDrawing) return;

    const { clientXCoord, clientYCoord } = this.calculateRelativeCoordinates(event);
    this.userIsDrawing = false;
    this.currentSettingsState.isActionActive = false;

    const contextualTool = this.registeredVectorTools[this.currentSettingsState.activeToolName];
    if (contextualTool && typeof contextualTool.onMouseUp === 'function') {
      contextualTool.onMouseUp(this.drawingContext, clientXCoord, clientYCoord, this.currentSettingsState);
    }
  },

  synchronizeContextStyles() {
    this.drawingContext.strokeStyle = this.currentSettingsState.currentColorHex;
    this.drawingContext.fillStyle = this.currentSettingsState.currentColorHex;
    this.drawingContext.lineWidth = this.currentSettingsState.currentStrokeWeight;
    this.drawingContext.lineCap = 'round';
    this.drawingContext.lineJoin = 'round';
  },

  setTool(toolName) {
    if (this.registeredVectorTools[toolName]) {
      this.currentSettingsState.activeToolName = toolName;
    }
  },

  setColor(colorHexValue) {
    this.currentSettingsState.currentColorHex = colorHexValue;
  },

  setBrushSize(pixelRadius) {
    this.currentSettingsState.currentStrokeWeight = pixelRadius;
  },

  async assembleScreenComposite(toolbarDOMElement) {
    // Hide visual UI frames so they don't corrupt the captured frame array
    if (toolbarDOMElement) toolbarDOMElement.style.display = 'none';
    this.targetCanvas.style.setProperty('opacity', '0', 'important');

    // Dual requestAnimationFrame delay to guarantee a full browser paint cycle occurs post layout change
    await new Promise(frameResolved => requestAnimationFrame(frameResolved));
    await new Promise(frameResolved => requestAnimationFrame(frameResolved));

    const coreCaptureResponse = await new Promise((msgResolved) => {
      chrome.runtime.sendMessage({ type: 'TRIGGER_TAB_CAPTURE_PIPELINE' }, msgResolved);
    });

    // Instantly restore overlay elements visibility state fields
    this.targetCanvas.style.setProperty('opacity', '1', 'important');
    if (toolbarDOMElement) toolbarDOMElement.style.display = '';

    if (!coreCaptureResponse || !coreCaptureResponse.capturedDataUrl) {
      throw new Error('Background system viewport screen capture failed');
    }

    // Initialize clean offscreen composition workspace
    const compositionCanvas = document.createElement('canvas');
    compositionCanvas.width = this.targetCanvas.width;
    compositionCanvas.height = this.targetCanvas.height;
    const compositionContext = compositionCanvas.getContext('2d');

    // Render underlying layout image onto offscreen workspace
    await new Promise((loadSuccess, loadFailure) => {
      const visualBackdropImage = new Image();
      visualBackdropImage.onload = () => {
        compositionContext.drawImage(visualBackdropImage, 0, 0, compositionCanvas.width, compositionCanvas.height);
        loadSuccess();
      };
      visualBackdropImage.onerror = loadFailure;
      visualBackdropImage.src = coreCaptureResponse.capturedDataUrl;
    });

    // Layer active vectors over top of background pixel array
    compositionContext.drawImage(this.targetCanvas, 0, 0);

    return new Promise((blobSuccess, blobFailure) => {
      compositionCanvas.toBlob(generatedBlob => {
        if (generatedBlob) {
          blobSuccess(generatedBlob);
        } else {
          blobFailure(new Error('Offscreen processing stream tracking node failed'));
        }
      }, 'image/png');
    });
  },

  async exportAsPng(toolbarDOMElement) {
    const snapshotBlob = await this.assembleScreenComposite(toolbarDOMElement);
    const virtualBlobUrl = URL.createObjectURL(snapshotBlob);
    
    const operationalDownloadAnchor = document.createElement('a');
    operationalDownloadAnchor.href = virtualBlobUrl;
    operationalDownloadAnchor.download = `scribbletab-${Date.now()}.png`;
    
    document.body.appendChild(operationalDownloadAnchor);
    operationalDownloadAnchor.click();
    document.body.removeChild(operationalDownloadAnchor);
    
    URL.revokeObjectURL(virtualBlobUrl);
  },

  async copyCanvasToClipboard(toolbarDOMElement) {
    const snapshotBlob = await this.assembleScreenComposite(toolbarDOMElement);
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': snapshotBlob })
    ]);
  },

  wipeCanvasSurface() {
    this.commitCanvasStateToHistory();
    this.drawingContext.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);
  },

  fetchCurrentEngineState() {
    return { ...this.currentSettingsState };
  }
};