/**
 * MarkMask — Canvas Manager
 * Manages the Fabric.js canvas instance, image loading, and tool modes.
 */
import { fabric } from 'fabric';

/** @type {fabric.Canvas|null} */
let canvas = null;
/** @type {fabric.Image|null} */
let bgImage = null;
/** @type {string} current tool mode: 'select' | 'mask' */
let currentMode = 'select';

// Store original image dimensions for export
let originalWidth = 0;
let originalHeight = 0;

/**
 * Initialize the Fabric.js canvas
 */
export function initCanvas() {
  const container = document.getElementById('canvas-container');
  const el = document.getElementById('fabric-canvas');

  canvas = new fabric.Canvas(el, {
    selection: true,
    preserveObjectStacking: true,
    stopContextMenu: true,
    fireRightClick: false,
    controlsAboveOverlay: true,
  });

  // Custom corner style
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: '#6366f1',
    cornerStrokeColor: '#6366f1',
    cornerSize: 8,
    cornerStyle: 'circle',
    borderColor: '#818cf8',
    borderScaleFactor: 1.5,
    padding: 4,
  });

  // Handle resize
  const resizeObserver = new ResizeObserver(() => fitCanvasToContainer());
  resizeObserver.observe(container);

  return canvas;
}

/**
 * Fit canvas to its container, maintaining the image aspect ratio
 */
function fitCanvasToContainer() {
  if (!canvas || !bgImage) return;

  const container = document.getElementById('canvas-container');
  const cw = container.clientWidth;
  const ch = container.clientHeight;

  const padding = 40;
  const maxW = cw - padding * 2;
  const maxH = ch - padding * 2;

  const scale = Math.min(maxW / originalWidth, maxH / originalHeight, 1);

  const displayW = originalWidth * scale;
  const displayH = originalHeight * scale;

  canvas.setWidth(displayW);
  canvas.setHeight(displayH);
  canvas.setZoom(scale);
  canvas.renderAll();
}

/**
 * Load an image onto the canvas
 * @param {string} dataUrl - image data URL
 * @param {Function} [onDone] - callback after load
 */
export function loadImageToCanvas(dataUrl, onDone) {
  fabric.Image.fromURL(dataUrl, (img) => {
    // Clear previous state
    canvas.clear();

    bgImage = img;
    originalWidth = img.width;
    originalHeight = img.height;

    // Set as non-interactive background
    img.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'default',
    });

    canvas.add(img);
    canvas.sendToBack(img);

    fitCanvasToContainer();

    if (onDone) onDone();
  }, { crossOrigin: 'anonymous' });
}

/**
 * Get the canvas instance
 */
export function getCanvas() {
  return canvas;
}

/**
 * Get original (full-res) image dimensions
 */
export function getOriginalSize() {
  return { width: originalWidth, height: originalHeight };
}

/**
 * Get current zoom (scale) ratio
 */
export function getZoom() {
  return canvas ? canvas.getZoom() : 1;
}

/**
 * Set the tool mode
 * @param {'select'|'mask'} mode
 */
export function setMode(mode) {
  currentMode = mode;
  const area = document.querySelector('.canvas-area');

  if (mode === 'mask') {
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      if (obj !== bgImage) {
        obj.selectable = false;
        obj.evented = false;
      }
    });
    area.classList.add('mode-mask');
  } else {
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      if (obj !== bgImage) {
        obj.selectable = true;
        obj.evented = true;
      }
    });
    area.classList.remove('mode-mask');
  }
  canvas.discardActiveObject();
  canvas.renderAll();
}

/**
 * Get current mode
 */
export function getMode() {
  return currentMode;
}

/**
 * Serialize canvas state (for undo/redo)
 */
export function serializeState() {
  if (!canvas) return null;
  return canvas.toJSON(['selectable', 'evented', 'hasControls', 'hasBorders',
    'lockMovementX', 'lockMovementY', 'hoverCursor', 'maskType', 'isMaskObj', 'isWatermark']);
}

/**
 * Restore canvas from serialized state
 * @param {object} state
 * @param {Function} [onDone]
 */
export function restoreState(state, onDone) {
  if (!canvas || !state) return;
  canvas.loadFromJSON(state, () => {
    // Re-find the background image
    const objects = canvas.getObjects();
    bgImage = objects.find(o => !o.isMaskObj && !o.isWatermark && o.type === 'image') || null;
    if (bgImage) {
      bgImage.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
    }
    canvas.renderAll();
    if (onDone) onDone();
  });
}

/**
 * Export the canvas as a data URL at original resolution
 * @param {string} [format='png']
 * @returns {string}
 */
export function exportToDataURL(format = 'png') {
  if (!canvas) return '';

  // Deselect everything first
  canvas.discardActiveObject();
  canvas.renderAll();

  const multiplier = 1 / canvas.getZoom();
  return canvas.toDataURL({
    format,
    quality: 1,
    multiplier,
  });
}

/**
 * Export the canvas as a Blob
 * @param {Function} callback - receives the Blob
 */
export function exportToBlob(callback) {
  if (!canvas) return;

  canvas.discardActiveObject();
  canvas.renderAll();

  const multiplier = 1 / canvas.getZoom();
  canvas.toCanvasElement(multiplier).toBlob(callback, 'image/png', 1);
}
