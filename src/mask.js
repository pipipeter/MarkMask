/**
 * MarkMask — Mask / Mosaic Module
 * Provides pixelate, blur, and solid-color masking on rectangular regions.
 */
import { fabric } from 'fabric';
import { getCanvas, getZoom } from './canvas.js';

let maskStyle = 'pixelate'; // 'pixelate' | 'blur' | 'solid'
let pixelateSize = 12;
let blurRadius = 10;
let solidColor = '#000000';

let isDrawing = false;
let startX = 0;
let startY = 0;
let drawRect = null;

/** @type {Function|null} */
let onMaskCreated = null;

/**
 * Initialize mask drawing interactions
 * @param {Function} onCreated - called after a mask is created (for undo history)
 */
export function initMask(onCreated) {
  onMaskCreated = onCreated;
  const canvas = getCanvas();
  if (!canvas) return;

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  // Delete key support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const active = canvas.getActiveObject();
      if (active && active.isMaskObj) {
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
        if (onMaskCreated) onMaskCreated();
      }
    }
  });
}

function handleMouseDown(opt) {
  const canvas = getCanvas();
  // Only draw in mask mode - check the area class
  if (!document.querySelector('.canvas-area')?.classList.contains('mode-mask')) return;
  if (opt.target && opt.target.isMaskObj) return; // clicked existing mask

  isDrawing = true;
  const pointer = canvas.getPointer(opt.e);
  startX = pointer.x;
  startY = pointer.y;

  drawRect = new fabric.Rect({
    left: startX,
    top: startY,
    width: 0,
    height: 0,
    fill: 'rgba(99, 102, 241, 0.15)',
    stroke: '#6366f1',
    strokeWidth: 1 / getZoom(),
    strokeDashArray: [4 / getZoom(), 4 / getZoom()],
    selectable: false,
    evented: false,
  });
  canvas.add(drawRect);
}

function handleMouseMove(opt) {
  if (!isDrawing || !drawRect) return;
  const canvas = getCanvas();
  const pointer = canvas.getPointer(opt.e);

  const left = Math.min(startX, pointer.x);
  const top = Math.min(startY, pointer.y);
  const width = Math.abs(pointer.x - startX);
  const height = Math.abs(pointer.y - startY);

  drawRect.set({ left, top, width, height });
  canvas.renderAll();
}

function handleMouseUp(opt) {
  if (!isDrawing || !drawRect) return;
  isDrawing = false;

  const canvas = getCanvas();
  const rect = drawRect;
  canvas.remove(rect);

  // Min size check (at least 5px in original coords)
  if (rect.width < 5 || rect.height < 5) {
    canvas.renderAll();
    drawRect = null;
    return;
  }

  // Create mask object based on current style
  createMaskObject(rect.left, rect.top, rect.width, rect.height);
  drawRect = null;
}

/**
 * Create the actual mask object
 */
function createMaskObject(left, top, width, height) {
  const canvas = getCanvas();

  if (maskStyle === 'solid') {
    // Simple solid rectangle
    const mask = new fabric.Rect({
      left, top, width, height,
      fill: solidColor,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      isMaskObj: true,
      maskType: 'solid',
    });
    canvas.add(mask);
    canvas.setActiveObject(mask);
    canvas.renderAll();
    if (onMaskCreated) onMaskCreated();
    return;
  }

  // For pixelate and blur, we need to capture the region
  // Create a temporary canvas to get the pixel data
  const zoom = getZoom();
  const tempCanvas = document.createElement('canvas');
  const tw = Math.round(width);
  const th = Math.round(height);
  tempCanvas.width = tw;
  tempCanvas.height = th;
  const tempCtx = tempCanvas.getContext('2d');

  // Draw the current fabric canvas region to temp canvas
  const fabricEl = canvas.toCanvasElement(1); // get at current zoom
  tempCtx.drawImage(
    fabricEl,
    left * zoom, top * zoom, width * zoom, height * zoom,
    0, 0, tw, th
  );

  if (maskStyle === 'pixelate') {
    applyPixelate(tempCtx, tw, th, pixelateSize);
  } else if (maskStyle === 'blur') {
    applyBlur(tempCtx, tw, th, blurRadius);
  }

  // Convert temp canvas to Fabric image
  const dataUrl = tempCanvas.toDataURL();
  fabric.Image.fromURL(dataUrl, (img) => {
    img.set({
      left, top,
      scaleX: 1,
      scaleY: 1,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      isMaskObj: true,
      maskType: maskStyle,
    });
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
    if (onMaskCreated) onMaskCreated();
  });
}

/**
 * Pixelate effect
 */
function applyPixelate(ctx, w, h, blockSize) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      // Sample the center pixel of each block
      const sx = Math.min(x + Math.floor(blockSize / 2), w - 1);
      const sy = Math.min(y + Math.floor(blockSize / 2), h - 1);
      const idx = (sy * w + sx) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Fill the block
      for (let by = y; by < Math.min(y + blockSize, h); by++) {
        for (let bx = x; bx < Math.min(x + blockSize, w); bx++) {
          const bidx = (by * w + bx) * 4;
          data[bidx] = r;
          data[bidx + 1] = g;
          data[bidx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Gaussian-like blur using iterative box blur (fast)
 */
function applyBlur(ctx, w, h, radius) {
  // Use CanvasRenderingContext2D filter if supported
  // Re-draw the content with blur
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');

  // Copy original
  tempCtx.drawImage(ctx.canvas, 0, 0);

  // Clear and redraw with blur
  ctx.clearRect(0, 0, w, h);
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.filter = 'none';
}

// ---- Setters ----

export function setMaskStyle(style) {
  maskStyle = style;
}

export function setPixelateSize(size) {
  pixelateSize = size;
}

export function setBlurRadius(radius) {
  blurRadius = radius;
}

export function setSolidColor(color) {
  solidColor = color;
}
