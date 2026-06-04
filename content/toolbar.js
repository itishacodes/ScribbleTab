'use strict';

const ScribbleToolbar = {
  dockElement: null,
  isCurrentlyDragging: false,
  pointerOffsetDeltaX: 0,
  pointerOffsetDeltaY: 0,
  isDockMinimized: false,
  activeCallbackRegistry: {},

  UI_TOOLS_SCHEMA: [
    { id: 'freehand', description: 'Pen Tool',        symbol: '✏️', triggerKey: 'F' },
    { id: 'rect',     description: 'Rectangle',       symbol: '▭',  triggerKey: 'R' },
    { id: 'circle',   description: 'Circle',          symbol: '○',  triggerKey: 'C' },
    { id: 'arrow',    description: 'Vector Arrow',    symbol: '→',  triggerKey: 'A' },
    { id: 'eraser',   description: 'Stroke Eraser',   symbol: '⌫',  triggerKey: 'E' }
  ],

  build(eventCallbacks) {
    if (this.dockElement) return this.dockElement;
    this.activeCallbackRegistry = eventCallbacks || {};

    this.dockElement = document.createElement('div');
    this.dockElement.id = 'scribbletab-floating-dock';
    this.dockElement.innerHTML = this.compileStructuralHTML();
    document.body.appendChild(this.dockElement);

    this.wireInteractiveEventListeners();
    this.updateActiveToolElement('freehand');

    return this.dockElement;
  },

  compileStructuralHTML() {
    const functionalToolNodes = this.UI_TOOLS_SCHEMA.map(toolItem => `
      <button class="st-matrix-node-btn" data-tool-id="${toolItem.id}" title="${toolItem.description} (${toolItem.triggerKey})">
        <span class="st-vector-glyph">${toolItem.symbol}</span>
        <span class="st-vector-label">${toolItem.id.substring(0, 4)}</span>
      </button>
    `).join('');

    return `
      <div id="st-drag-anchor" class="st-anchor-handle">
        <span class="st-drag-grip-indicator">⠿</span>
        <span class="st-dock-header-title">ScribbleTab</span>
        <button class="st-window-control-trigger" id="st-collapse-trigger" title="Minimize / Expand Viewport">−</button>
        <button class="st-window-control-trigger st-dismissal-trigger" id="st-termination-trigger" title="Exit Workspace (Esc)">✕</button>
      </div>

      <div class="st-window-collapsible-body">
        <div class="st-panel-segment">
          <div class="st-utility-matrix">${functionalToolNodes}</div>
        </div>

        <div class="st-panel-segment st-segment-flex-row">
          <label class="st-descriptor-tag">Color</label>
          <input type="color" id="st-native-color-picker" value="#ef4444" class="st-native-color-well" title="Custom Spectrum Native Picker">
          <div class="st-preset-track">
            <button class="st-swatch-bead" data-hex="#ef4444" style="background:#ef4444" title="Vivid Red"></button>
            <button class="st-swatch-bead" data-hex="#10b981" style="background:#10b981" title="Emerald Green"></button>
            <button class="st-swatch-bead" data-hex="#3b82f6" style="background:#3b82f6" title="Royal Blue"></button>
            <button class="st-swatch-bead" data-hex="#eab308" style="background:#eab308" title="Cyber Yellow"></button>
            <button class="st-swatch-bead" data-hex="#f97316" style="background:#f97316" title="Safety Orange"></button>
            <button class="st-swatch-bead" data-hex="#ffffff" style="background:#ffffff; border:1px solid #475569" title="Pure White"></button>
            <button class="st-swatch-bead" data-hex="#0f172a" style="background:#0f172a" title="Deep Obsidian"></button>
          </div>
        </div>

        <div class="st-panel-segment st-segment-flex-row">
          <label class="st-descriptor-tag">Size</label>
          <input type="range" id="st-stroke-slider" min="1" max="30" value="3" class="st-slider-input" title="Adjust Vector Stroke Radius">
          <span id="st-stroke-magnitude-display" class="st-current-size-log">3</span>
        </div>

        <div class="st-panel-segment st-action-row-grid">
          <button class="st-pipeline-trigger-btn" id="st-undo-trigger" title="Rollback Prior Interaction (Ctrl+Z)">↩ Undo</button>
          <button class="st-pipeline-trigger-btn" id="st-purge-trigger" title="Flush Complete Canvas Buffer">🗑 Clear</button>
          <button class="st-pipeline-trigger-btn st-pipeline-core-action" id="st-export-trigger" title="Compile Workspace Graphics to Disk File">💾 Save</button>
          <button class="st-pipeline-trigger-btn st-pipeline-core-action" id="st-clipboard-trigger" title="Stream Unified Frame Data to Clipboard Buffer">📋 Copy</button>
        </div>
      </div>
    `;
  },

  wireInteractiveEventListeners() {
    const localizedDragAnchorNode = this.dockElement.querySelector('#st-drag-anchor');
    localizedDragAnchorNode.addEventListener('mousedown', this.initializeDragSequence.bind(this));

    // Stop primary mousedown propagation to insulate underlying engine canvas drawing coordinates
    this.dockElement.addEventListener('mousedown', event => event.stopPropagation());

    // Window collapse toggling switch logic
    this.dockElement.querySelector('#st-collapse-trigger').addEventListener('click', this.executeMinimizeToggle.bind(this));

    // Vector tool configuration nodes loop mapping
    this.dockElement.querySelectorAll('.st-matrix-node-btn').forEach(toolNodeButton => {
      toolNodeButton.addEventListener('click', () => {
        const structuralToolId = toolNodeButton.dataset.toolId;
        this.updateActiveToolElement(structuralToolId);
        if (typeof this.activeCallbackRegistry.onToolChange === 'function') {
          this.activeCallbackRegistry.onToolChange(structuralToolId);
        }
      });
    });

    // Native color spectrum node monitoring channel
    const dynamicColorPickerElement = this.dockElement.querySelector('#st-native-color-picker');
    dynamicColorPickerElement.addEventListener('input', () => {
      if (typeof this.activeCallbackRegistry.onColorChange === 'function') {
        this.activeCallbackRegistry.onColorChange(dynamicColorPickerElement.value);
      }
    });

    // Swatch track rapid select event assignment loops
    this.dockElement.querySelectorAll('.st-swatch-bead').forEach(swatchNode => {
      swatchNode.addEventListener('click', () => {
        const targetingColorHex = swatchNode.dataset.hex;
        dynamicColorPickerElement.value = targetingColorHex;
        if (typeof this.activeCallbackRegistry.onColorChange === 'function') {
          this.activeCallbackRegistry.onColorChange(targetingColorHex);
        }
      });
    });

    // Linear range brush controller tracking system loops
    const lineWeightSliderElement = this.dockElement.querySelector('#st-stroke-slider');
    const trackingNumericalLogNode = this.dockElement.querySelector('#st-stroke-magnitude-display');
    lineWeightSliderElement.addEventListener('input', () => {
      trackingNumericalLogNode.textContent = lineWeightSliderElement.value;
      if (typeof this.activeCallbackRegistry.onBrushSizeChange === 'function') {
        this.activeCallbackRegistry.onBrushSizeChange(parseInt(lineWeightSliderElement.value, 10));
      }
    });

    // Core operational pipeline functional click executions
    this.dockElement.querySelector('#st-undo-trigger').addEventListener('click', () => {
      if (typeof this.activeCallbackRegistry.onUndo === 'function') this.activeCallbackRegistry.onUndo();
    });
    this.dockElement.querySelector('#st-purge-trigger').addEventListener('click', () => {
      if (typeof this.activeCallbackRegistry.onClear === 'function') this.activeCallbackRegistry.onClear();
    });
    this.dockElement.querySelector('#st-export-trigger').addEventListener('click', () => {
      if (typeof this.activeCallbackRegistry.onSave === 'function') this.activeCallbackRegistry.onSave();
    });
    this.dockElement.querySelector('#st-clipboard-trigger').addEventListener('click', () => {
      if (typeof this.activeCallbackRegistry.onCopy === 'function') this.activeCallbackRegistry.onCopy();
    });
    this.dockElement.querySelector('#st-termination-trigger').addEventListener('click', () => {
      if (typeof this.activeCallbackRegistry.onClose === 'function') this.activeCallbackRegistry.onClose();
    });
  },

  executeMinimizeToggle() {
    this.isDockMinimized = !this.isDockMinimized;
    const bodyCollapsibleSegment = this.dockElement.querySelector('.st-window-collapsible-body');
    const statusControlTriggerButton = this.dockElement.querySelector('#st-collapse-trigger');

    if (this.isDockMinimized) {
      // Re-map bounding dimensions directly to static layout properties prior to display adjustments
      const boundingCoordinates = this.dockElement.getBoundingClientRect();
      this.dockElement.style.left = boundingCoordinates.left + 'px';
      this.dockElement.style.top = boundingCoordinates.top + 'px';
      this.dockElement.style.right = 'auto';
      this.dockElement.style.bottom = 'auto';

      bodyCollapsibleSegment.style.display = 'none';
      statusControlTriggerButton.textContent = '+';
      statusControlTriggerButton.title = 'Expand Dashboard Options';
      this.dockElement.classList.add('st-collapsed-pill');
    } else {
      bodyCollapsibleSegment.style.display = '';
      statusControlTriggerButton.textContent = '−';
      statusControlTriggerButton.title = 'Minimize Viewport';
      this.dockElement.classList.remove('st-collapsed-pill');
    }
  },

  initializeDragSequence(event) {
    if (event.target.closest('#st-termination-trigger') || event.target.closest('#st-collapse-trigger')) return;

    this.isCurrentlyDragging = true;
    const operationalBounds = this.dockElement.getBoundingClientRect();
    this.pointerOffsetDeltaX = event.clientX - operationalBounds.left;
    this.pointerOffsetDeltaY = event.clientY - operationalBounds.top;

    event.stopPropagation();
    event.preventDefault();

    // Use binding references to preserve component context across the window tracking loop layers
    this.activeDragMoveRef = this.processDragSequenceMovement.bind(this);
    this.activeDragEndRef = this.terminateDragSequenceOperations.bind(this);

    document.addEventListener('mousemove', this.activeDragMoveRef, true);
    document.addEventListener('mouseup', this.activeDragEndRef, true);
  },

  processDragSequenceMovement(event) {
    if (!this.isCurrentlyDragging) return;

    const targetedPlacementX = event.clientX - this.pointerOffsetDeltaX;
    const targetedPlacementY = event.clientY - this.pointerOffsetDeltaY;

    const localBoundaryMetrics = this.dockElement.getBoundingClientRect();
    const extremeMaxXBoundary = window.innerWidth - localBoundaryMetrics.width;
    const extremeMaxYBoundary = window.innerHeight - localBoundaryMetrics.height;

    this.dockElement.style.left = `${Math.max(0, Math.min(targetedPlacementX, extremeMaxXBoundary))}px`;
    this.dockElement.style.top = `${Math.max(0, Math.min(targetedPlacementY, extremeMaxYBoundary))}px`;
    this.dockElement.style.right = 'auto';
    this.dockElement.style.bottom = 'auto';
  },

  terminateDragSequenceOperations() {
    this.isCurrentlyDragging = false;
    document.removeEventListener('mousemove', this.activeDragMoveRef, true);
    document.removeEventListener('mouseup', this.activeDragEndRef, true);
  },

  updateActiveToolElement(toolStringId) {
    if (!this.dockElement) return;
    this.dockElement.querySelectorAll('.st-matrix-node-btn').forEach(buttonElement => {
      buttonElement.classList.toggle('st-node-selected', buttonElement.dataset.toolId === toolStringId);
    });
  },

  reveal() {
    if (this.dockElement) this.dockElement.style.display = '';
  },

  conceal() {
    if (this.dockElement) this.dockElement.style.display = 'none';
  },

  fetchElement() {
    return this.dockElement;
  },

  teardown() {
    if (this.dockElement) {
      this.dockElement.remove();
      this.dockElement = null;
    }
    this.isDockMinimized = false;
    if (this.isCurrentlyDragging) {
      this.terminateDragSequenceOperations();
    }
  }
};