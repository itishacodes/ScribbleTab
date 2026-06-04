'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const launchButton = document.getElementById('action-toggle-btn'); 

  if (launchButton) {
    launchButton.addEventListener('click', async () => {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!activeTab || activeTab.url?.startsWith('chrome://') || activeTab.url?.startsWith('edge://')) {
        alert("Chrome blocks extensions on internal pages. Try a regular website!");
        window.close();
        return;
      }

      // Check if already injected
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => typeof window.ScribbleEngineLoaded !== 'undefined'
      }, (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          window.close();
          return;
        }

        const isAlreadyLoaded = results[0].result;

        if (!isAlreadyLoaded) {
          // Dynamic CSP Safe Injection Pipeline
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
            if (chrome.runtime.lastError) {
              window.close();
              return;
            }
            
            // Set safety flag context
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: () => { window.ScribbleEngineLoaded = true; }
            }, () => {
              // Inject CSS explicitly via Chrome API to bypass page-level CSP blocks
              chrome.scripting.insertCSS({
                target: { tabId: activeTab.id },
                files: ['content/content.css']
              }, () => {
                chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SCRIBBLETAB_CANVAS' });
                window.close();
              });
            });
          });
        } else {
          chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SCRIBBLETAB_CANVAS' });
          window.close();
        }
      });
    });
  }
});