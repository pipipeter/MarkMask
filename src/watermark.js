/**
 * MarkMask — Watermark Module
 * Single-point and tiled watermark rendering using Fabric.js objects.
 */
import { fabric } from 'fabric';
import { getCanvas, getOriginalSize, getZoom } from './canvas.js';

// Watermark state
let wmText = 'MarkMask';
let wmFont = 'Inter';
let wmColor = '#ffffff';
let wmOpacity = 0.3;
let wmAngle = -30;
let wmDensity = 3; // 1-5
let wmFontSize = 24;
let wmMode = 'single'; // 'single' | 'tiled'

/** @type {Function|null} */
let onWatermarkChanged = null;

// Keep references to watermark objects for easy removal
let watermarkObjects = [];

/**
 * Initialize the watermark module
 * @param {Function} onChange - called when watermark changes (for history)
 */
export function initWatermark(onChange) {
  onWatermarkChanged = onChange;
}

/**
 * Render the watermark (single or tiled)
 * Called whenever any watermark parameter changes.
 */
export function renderWatermark() {
  const canvas = getCanvas();
  if (!canvas) return;

  // Remove old watermark objects
  clearWatermarkObjects();

  if (!wmText.trim()) {
    canvas.renderAll();
    return;
  }

  if (wmMode === 'single') {
    renderSingle();
  } else {
    renderTiled();
  }

  canvas.renderAll();
}

function renderSingle() {
  const canvas = getCanvas();
  const { width, height } = getOriginalSize();

  const text = new fabric.Text(wmText, {
    left: width / 2,
    top: height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: wmFont,
    fontSize: wmFontSize,
    fill: wmColor,
    opacity: wmOpacity,
    angle: 0,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    isWatermark: true,
    // Allow rotation via corner
    lockScalingFlip: true,
  });

  canvas.add(text);
  watermarkObjects.push(text);
}

function renderTiled() {
  const canvas = getCanvas();
  const { width, height } = getOriginalSize();

  // Calculate spacing based on density (1=sparse, 5=dense)
  const densityMap = [400, 300, 200, 140, 90];
  const spacing = densityMap[wmDensity - 1] || 200;

  // Create individual text objects for the tile
  // We need to cover the entire canvas even when rotated
  const diagonal = Math.sqrt(width * width + height * height);
  const startX = -diagonal / 2;
  const startY = -diagonal / 2;
  const endX = width + diagonal / 2;
  const endY = height + diagonal / 2;

  const group = [];

  for (let y = startY; y < endY; y += spacing) {
    for (let x = startX; x < endX; x += spacing) {
      const t = new fabric.Text(wmText, {
        left: x,
        top: y,
        fontFamily: wmFont,
        fontSize: wmFontSize,
        fill: wmColor,
        opacity: wmOpacity,
        angle: wmAngle,
        originX: 'center',
        originY: 'center',
      });
      group.push(t);
    }
  }

  if (group.length === 0) return;

  const tiledGroup = new fabric.Group(group, {
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    isWatermark: true,
  });

  // Clip to canvas bounds
  tiledGroup.set({
    clipPath: new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      absolutePositioned: true,
    }),
  });

  canvas.add(tiledGroup);
  watermarkObjects.push(tiledGroup);
}

function clearWatermarkObjects() {
  const canvas = getCanvas();
  watermarkObjects.forEach((obj) => {
    canvas.remove(obj);
  });
  watermarkObjects = [];
}

// ---- Setters ----

export function setWmText(text) {
  wmText = text;
  renderWatermark();
}

export function setWmFont(font) {
  wmFont = font;
  renderWatermark();
}

export function setWmColor(color) {
  wmColor = color;
  renderWatermark();
}

export function setWmOpacity(opacity) {
  wmOpacity = opacity;
  renderWatermark();
}

export function setWmAngle(angle) {
  wmAngle = angle;
  renderWatermark();
}

export function setWmDensity(density) {
  wmDensity = density;
  renderWatermark();
}

export function setWmFontSize(size) {
  wmFontSize = size;
  renderWatermark();
}

export function setWmMode(mode) {
  wmMode = mode;
  renderWatermark();
}

export function getWmMode() {
  return wmMode;
}
