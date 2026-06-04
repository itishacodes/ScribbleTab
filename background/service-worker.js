'use strict';

// Handle primary activation behavior when the user clicks the extension action icon in their browser bar
chrome.action.onClicked.addListener((activeTab) => {
  if (!activeTab || activeTab.url?.startsWith('chrome://') || activeTab.url?.startsWith('edge://')) {
    return;
  }

  chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SCRIBBLETAB_CANVAS' }, () => {
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: [
          'content/canvas-overlay.js',
          'content/toolbar.js',
          'content/tools/freehand.js',
          'content/tools/rectangle.js',
          'content/tools/circle.js',
          'content/tools/arrow.js',
          'content/tools/eraser.js',
          'content/drawing-engine.js',
          'content/content.js'
        ]
      }, () => {
        if (chrome.runtime.lastError) return;
        chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SCRIBBLETAB_CANVAS' });
      });
    }
  });
});

chrome.runtime.onMessage.addListener((incomingMessage, dispatchSender, sendResponseCallback) => {
  if (incomingMessage.type === 'TRIGGER_TAB_CAPTURE_PIPELINE') {
    chrome.tabs.captureVisibleTab(
      chrome.windows.WINDOW_ID_CURRENT,
      { format: 'png' },
      (capturedDataUrl) => {
        if (!capturedDataUrl) {
          sendResponseCallback({ success: false, error: 'Viewport tracking operational timeout bounds exceeded' });
        } else {
          sendResponseCallback({ success: true, capturedDataUrl: capturedDataUrl });
        }
      }
    );
    return true; 
  }
});