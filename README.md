# ScribbleTab

> Draw, annotate, and capture any webpage — seamlessly from an elegant, blurred UI workspace.

A modern, high-performance Chrome Extension (Manifest V3) that layers an isolated viewport drawing surface over any active website. ScribbleTab enables users to sketch fluid freehand strokes, construct shapes, and project crisp vectors, effortlessly generating unified PNG compositions (host layout + canvas strokes) directly to your files or clipboard.

[![Privacy: No data collected](https://img.shields.io/badge/Privacy-No%20data%20collected-indigo?style=flat-square)](https://yashpreetbathla.github.io/ScribbleTab/privacy-policy.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Manifest: V3](https://img.shields.io/badge/Manifest-V3-orange?style=flat-square)](manifest.json)

---

## 📸 Screenshots

| Premium Toolbar Interface | Workspace Canvas In Action |
|---------|------------------|
| ![[Toolbar Preview](./docs/screenshots/toolbar-preview)](./docs/screenshots/toolbar-preview) | ![[Drawing Preview](./docs/screenshots/drawing-preview)](./docs/screenshots/drawing-preview) |

---

## ⚡ Features

- **Fluid Freehand Brush** — Implements an optimized Chaikin Spline mathematical approximation via Quadratic Bezier Curves for anti-aliased, ultra-smooth ink strokes.
  
- **Dynamic Shapes Matrix** — Rectangle and Circle geometry engines featuring structural bounding box live previews during cursor tracking.
  
- **Dynamic Vector Arrow** — Auto-proportional vector arrow heads that calculate dimensions dynamically using target line trajectory and brush size variables.
  
- **Block Eraser Core** — Precision viewport tracking erasure matrix scaled to match selected stroke magnitudes.
  
- **Premium Color Engine** — Integrated spectrum picker alongside 7 custom-curated, vivid neon quick-swatches.
  
- **Linear Brush Slider** — Micro-fine weight adjusters extending smoothly from 1px to 30px.
  
- **Step-History Buffer** — Multi-step rollback history protection tracking up to 30 sequential layout changes (`Ctrl+Z`).
  
- **Surface Flush Pipeline** — Instant, single-click canvas clear commands equipped with full historical structural memory restoration support.
  
- **Unified Image Composer** — A dual-frame layout assembly system that isolates browser views, captures the display context, overlays user vectors, and exports timestamped PNG files.
  
- **Direct Clipboard Streaming** — Fast clipboard writer streams that copy unified layouts straight to system buffers.
  
- **Glassmorphic Dock UI** — A beautiful fixed overlay dashboard built with backdrop blur glass adjustments, custom boundaries, full viewport clamping, and a mini-pill display collapse mode.

---

## 📦 Installation

> No build steps or compiler configuration paths required. Loads natively as an unpacked system package.

1. Download or clone this project repository into your workspace.
2. Open your Google Chrome window and type `chrome://extensions` in the address string area.
3. Locate the **Developer Mode** toggle layout block in the upper right quadrant and switch it to **On**.
4. Click the **Load unpacked** selection tile positioned on the top left.
5. Choose your local project root directory folder named **`ScribbleTab`**.
6. The extension action element is now mounted. Pin the core toolbar icon for rapid activation.

---

## 🚀 Usage

### Activating Workspace Layers

| Trigger Method | Operational Mechanics |
|--------|--------|
| Action Icon Click | Opens the native popup UI frame ──► Click **Open Active Canvas** |
| Global Key Shortcut | Press `Alt + Shift + A` over your target active viewport context |


### Operational Keyboard Controls

| Keyboard Map Key | Sequential System Action |
|-----|--------|
| `Alt + Shift + A` | Global active toggle switcher (Launches or Destroys Workspace) |
| `Esc` | Instantly tear down current elements and exit workspace safely |
| `Ctrl + Z` / `Cmd + Z` | Undo and pop the last historical buffer frame entry |
| `F` | Activate Freehand Smooth Ink Brush |
| `R` | Activate Rectangle Boundary Box Tool |
| `C` | Activate Midpoint Circle Ellipse Tool |
| `A` | Activate Calculated Trajectory Vector Arrow Tool |
| `E` | Activate Spatial Bounding Box Eraser |

### Export Operations

- **💾 Save** — Hides all UI frames, initiates deep repaint cycles, pulls host page pixels, stitches active canvas lines overhead, and triggers file downloads named `scribbletab-[timestamp].png`.
- **📋 Copy** — Executes the exact same image matrix assembly, routing the resulting canvas blob directly to the system clipboard for immediate pasting.

---

## 🛠 Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Target Web Viewport                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Host Website DOM                     │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │ #scribbletab-viewport-canvas  (z-index: MAX-1)  │   │   │
│   │   │ fixed, 100vw × 100vh overlay block layout       │   │   │
│   │   │ pointer-events: all (handles canvas actions)    │   │   │
│   │   │                                                 │   │   │
│   │   │ mousedown ──► ScribbleDrawingEngine             │   │   │
│   │   │ mousemove ──► active tool rendering pipelines   │   │   │
│   │   │ mouseup   ──► tool lifecycle termination        │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │ #scribbletab-floating-dock  (z-index: MAX)      │   │   │
│   │   │ Glassmorphic layout panel (draggable/minimizable)│  │   │
│   │   │ mousedown stopPropagation (protects vector text)│   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Content Scripts Architecture (Isolated Context World Space)   │
│   ┌─────────────────┐ ┌──────────────────────┐ ┌────────────────┐│
│   │ content.js      │ │ drawing-engine.js    │ │canvas-overlay.js│
│   │ orchestrator    │─► history buffers stack│─► surface layout ││
│   │ hotkey listeners│ │ tracking operations  │ │ state logic    ││
│   └─────────────────┘ └──────────────────────┘ └────────────────┘│
│                                │                                │
│              ┌─────────────────┴─────────────────┐              │
│              ▼                                   ▼              │
│       tools/freehand.js                   tools/rectangle.js    │
│       tools/circle.js                     tools/arrow.js        │
│       tools/eraser.js                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
│ chrome.runtime.sendMessage
│ TRIGGER_TAB_CAPTURE_PIPELINE
▼
┌─────────────────────────────────────────────────────────────────┐
│              Background Service Worker Process                  │
│   chrome.tabs.captureVisibleTab ──► blob URL ──► sendResponse   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Visual Image Compilation Pipeline Flow

```
User initiates Export Sequence (Click Save/Copy Trigger)
│
▼
Conceal Dock Element + Set Viewport Canvas Opacity to 0
│
▼
Await 2x Consecutive requestAnimationFrame Layout Paints
(Guarantees browser layout visual deflicker)
│
▼
Dispatches: TRIGGER_TAB_CAPTURE_PIPELINE
│
▼
Background Service Worker Engine executes captureVisibleTab API
│
▼
Restores Canvas Opacity to 1 + Re-displays Toolbar Dock
│
▼
Generates Isolated Offscreen Composition Canvas Surface
├── Step 1: Draw native viewport screenshot backdrop
└── Step 2: Superimpose vector array layers directly overhead
│
▼
Converts Workspace to standard image/png Blob
├── [Save Trigger] ──► Generates Virtual URL ──► Emulates Click
└── [Copy Trigger] ──► Passes Blob Payload ──► ClipboardItem
```

---

## 📂 File Directory Structure

```
ScribbleTab/
├── manifest.json                    # Extension manifest configuration parameters
│
├── background/
│   └── service-worker.js            # Viewport screen capture process worker script
│
├── content/                         # Script context layers injected into host spaces
│   ├── content.js                   # Primary workspace orchestrator and hotkey managers
│   ├── canvas-overlay.js            # Handles surface creation, resizing, and pointer state tracking
│   ├── drawing-engine.js            # Manages undo history stacks and context styles
│   ├── toolbar.js                   # Manages dragging, minimizing, and event listeners for the dock
│   ├── content.css                  # Isolated styling definitions using !important modifiers
│   └── tools/
│       ├── freehand.js              # Bezier interpolation smooth ink stroke module
│       ├── rectangle.js             # Bounding box live-preview rectangle drawing tool
│       ├── circle.js                # Midpoint bounding ellipse shape tool
│       ├── arrow.js                 # Path trajectory vector tracking arrow utility
│       └── eraser.js                # Area-clearing bounding block eraser tool
│
├── popup/
│   ├── popup.html                   # Extension dropdown menu frame template
│   └── popup.js                     # Handles initialization checks and toggle events
│
└── icons/                           # Branded asset layout indicators
├── icon16.png
├── icon48.png
└── icon128.png
```

---

## 🧠 Core Engineering Principles To Keep In Mind

### 1. Script Injections and Global Allocation Guards
To prevent the runtime engine from throwing duplicate declaration crashes (`SyntaxError: Identifier has already been declared`) during recursive workspace invocation clicks, execution pipelines are gated by an explicit environment tracking flag context check run directly inside the window namespace scope by the popup controller before committing resources:
```js
if (typeof window.ScribbleEngineLoaded === 'undefined') {
  // Inject clean script engine layouts securely...
  window.ScribbleEngineLoaded = true;
}
```

### 2. Overriding Styles Safely with setProperty
The primary canvas uses an explicit pointer-events: none !important styling configuration inside the stylesheet to let users click through to host site menus when not drawing. Because standard style updates cannot override an existing !important rule via basic assignment, you must update its interactivity settings using this exact syntax:
```js
canvas.style.setProperty('pointer-events', 'all', 'important');
```

### 3. Preserving Asynchronous Open Port Lifecycles
Because background capture pipelines evaluate asynchronously, you must explicitly declare return true; within your messaging listener functions:
```js
chrome.runtime.onMessage.addListener((incomingMsg, sender, sendResponse) => {
  // ...Asynchronous Background Operations Execute Here...
  return true; // Prevents runtime thread channels from collapsing early
});
```

### 4. Protecting Canvas Pixel Data Across Viewport Resize Sweeps
When a browser window dimensions change, updating property values on canvas.width or canvas.height instantly wipes away all bitmap pixel storage memory. To prevent data loss, canvas-overlay.js saves canvas data using getImageData right before layout updates occur, and restores the drawn paths afterward using putImageData.

### 5. Capture Phase Pointer Tracking Operations
To prevent dragging actions from lagging or breaking when moving the toolbar over interactive web layouts or custom app grids, all mouse movement tracking is registered within the browser's high-priority Capture Phase instead of standard bubbling paths:
```js
document.addEventListener('mousemove', this.activeDragMoveRef, true); // true = Capture Phase Override
document.addEventListener('mouseup', this.activeDragEndRef, true);
```
