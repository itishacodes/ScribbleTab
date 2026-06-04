'use strict';

const ScribbleOrchestrator = {
  isWorkspaceActive: false,

  activateWorkspace() {
    if (this.isWorkspaceActive) return;
    this.isWorkspaceActive = true;

    // Create and anchor our isolated canvas surface
    const operationalCanvas = ScribbleOverlay.init();
    ScribbleOverlay.enableWorkspace();

    // Attach core rendering pipelines
    ScribbleDrawingEngine.init(operationalCanvas);

    // Initialize custom toolbar interface and map callback events
    ScribbleToolbar.build({
      onToolChange(selectedTool) {
        ScribbleDrawingEngine.setTool(selectedTool);
      },
      onColorChange(selectedColor) {
        ScribbleDrawingEngine.setColor(selectedColor);
      },
      onBrushSizeChange(pixelSize) {
        ScribbleDrawingEngine.setBrushSize(pixelSize);
      },
      onUndo() {
        ScribbleDrawingEngine.executeUndo();
      },
      onClear() {
        ScribbleDrawingEngine.wipeCanvasSurface();
      },
      async onSave() {
        try {
          await ScribbleDrawingEngine.exportAsPng(ScribbleToolbar.fetchElement());
        } catch (error) {
          ScribbleOrchestrator.dispatchToast('Export failed: ' + error.message, true);
        }
      },
      async onCopy() {
        try {
          await ScribbleDrawingEngine.copyCanvasToClipboard(ScribbleToolbar.fetchElement());
          ScribbleOrchestrator.dispatchToast('Copied to system clipboard!');
        } catch (error) {
          ScribbleOrchestrator.dispatchToast('Clipboard write failed: ' + error.message, true);
        }
      },
      onClose() {
        ScribbleOrchestrator.deactivateWorkspace();
      }
    });
  },

  deactivateWorkspace() {
    if (!this.isWorkspaceActive) return;
    this.isWorkspaceActive = false;
    ScribbleToolbar.teardown();
    ScribbleOverlay.teardown();
  },

  dispatchToast(messageText, isErrorAlert = false) {
    const existingNotification = document.getElementById('scribbletab-status-toast');
    if (existingNotification) existingNotification.remove();

    const toastNode = document.createElement('div');
    toastNode.id = 'scribbletab-status-toast';
    toastNode.textContent = messageText;

    // Premium custom matching style pipeline
    toastNode.style.cssText = [
      'position: fixed !important',
      'bottom: 32px !important',
      'left: 50% !important',
      'transform: translateX(-50%) !important',
      `background: ${isErrorAlert ? '#ef4444' : '#6366f1'} !important`, // Red vs Indigo Brand accent
      'color: #ffffff !important',
      'padding: 12px 24px !important',
      'border-radius: 8px !important',
      'z-index: 2147483647 !important',
      'font-family: -apple-system, BlinkMacSystemFont, sans-serif !important',
      'font-size: 13px !important',
      'font-weight: 600 !important',
      'pointer-events: none !important',
      'box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important'
    ].join(';');

    document.body.appendChild(toastNode);
    setTimeout(() => toastNode.remove(), 3500);
  }
};

// Global Hotkey Layer Orchestration
document.addEventListener('keydown', (event) => {
  // Alt+Shift+A — Primary global visibility toggle trigger
  if (event.altKey && event.shiftKey && event.key === 'A') {
    if (ScribbleOrchestrator.isWorkspaceActive) {
      ScribbleOrchestrator.deactivateWorkspace();
    } else {
      ScribbleOrchestrator.activateWorkspace();
    }
    return;
  }

  if (!ScribbleOrchestrator.isWorkspaceActive) return;

  // Escape Key handles window closure actions
  if (event.key === 'Escape') {
    ScribbleOrchestrator.deactivateWorkspace();
    return;
  }

  // Handle Canvas Undo history mutations (Ctrl / Cmd + Z)
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    ScribbleDrawingEngine.executeUndo();
    return;
  }

  // Prevent Hotkey interception when typing inside host site input nodes
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;

  const standardInputKey = event.key.toLowerCase();
  switch (standardInputKey) {
    case 'f':
      ScribbleDrawingEngine.setTool('freehand');
      ScribbleToolbar.updateActiveToolElement('freehand');
      break;
    case 'r':
      ScribbleDrawingEngine.setTool('rect');
      ScribbleToolbar.updateActiveToolElement('rect');
      break;
    case 'c':
      ScribbleDrawingEngine.setTool('circle');
      ScribbleToolbar.updateActiveToolElement('circle');
      break;
    case 'a':
      ScribbleDrawingEngine.setTool('arrow');
      ScribbleToolbar.updateActiveToolElement('arrow');
      break;
    case 'e':
      ScribbleDrawingEngine.setTool('eraser');
      ScribbleToolbar.updateActiveToolElement('eraser');
      break;
  }
});

// Structural Message Interceptors from extension runtime layer channels
chrome.runtime.onMessage.addListener((incomingMessage) => {
  if (incomingMessage.type === 'TOGGLE_SCRIBBLETAB_CANVAS') {
    if (ScribbleOrchestrator.isWorkspaceActive) {
      ScribbleOrchestrator.deactivateWorkspace();
    } else {
      ScribbleOrchestrator.activateWorkspace();
    }
  }
});

// Register primary global window endpoint function for popup programmatic initialization
window.__scribbleTabToggle = function () {
  if (ScribbleOrchestrator.isWorkspaceActive) {
    ScribbleOrchestrator.deactivateWorkspace();
  } else {
    ScribbleOrchestrator.activateWorkspace();
  }
};