/**
 * MarkMask — UI Controller
 * Binds all DOM controls to their respective module functions.
 */
import { setMode } from './canvas.js';
import { setMaskStyle, setPixelateSize, setBlurRadius, setSolidColor } from './mask.js';
import {
  setWmText, setWmFont, setWmColor, setWmOpacity,
  setWmAngle, setWmDensity, setWmFontSize, setWmMode, getWmMode,
  renderWatermark,
} from './watermark.js';
import { undo, redo } from './history.js';
import { downloadImage, copyToClipboard } from './exporter.js';

let showToast = () => {};
let imageLoaded = false;

/**
 * Initialize all UI bindings
 * @param {Function} toastFn
 */
export function initUI(toastFn) {
  showToast = toastFn;
  setupTabs();
  setupMaskControls();
  setupWatermarkControls();
  setupActionButtons();
}

/**
 * Called when an image is loaded — enable controls
 */
export function onImageReady() {
  imageLoaded = true;

  // Show canvas, hide drop zone
  document.getElementById('drop-zone')?.classList.add('hidden');
  document.getElementById('canvas-container')?.classList.remove('hidden');

  // Enable action buttons
  document.getElementById('btn-new').disabled = false;
  document.getElementById('btn-download').disabled = false;
  document.getElementById('btn-copy').disabled = false;

  // Default to mask mode
  activateMaskMode();
}

/**
 * Update undo/redo button states
 */
export function updateHistoryButtons(canUndoFlag, canRedoFlag) {
  document.getElementById('btn-undo').disabled = !canUndoFlag;
  document.getElementById('btn-redo').disabled = !canRedoFlag;
}

// ---- Tab Switching ----

function setupTabs() {
  const tabMask = document.getElementById('tab-mask');
  const tabWatermark = document.getElementById('tab-watermark');

  tabMask?.addEventListener('click', () => {
    activateMaskMode();
  });

  tabWatermark?.addEventListener('click', () => {
    activateWatermarkMode();
  });
}

function activateMaskMode() {
  // Tab styling
  document.getElementById('tab-mask')?.classList.add('active');
  document.getElementById('tab-watermark')?.classList.remove('active');

  // Panel visibility
  document.getElementById('panel-mask')?.classList.add('active');
  document.getElementById('panel-watermark')?.classList.remove('active');

  // Canvas mode
  setMode('mask');
}

function activateWatermarkMode() {
  // Tab styling
  document.getElementById('tab-watermark')?.classList.add('active');
  document.getElementById('tab-mask')?.classList.remove('active');

  // Panel visibility
  document.getElementById('panel-watermark')?.classList.add('active');
  document.getElementById('panel-mask')?.classList.remove('active');

  // Canvas mode
  setMode('select');
}

// ---- Mask Controls ----

function setupMaskControls() {
  // Style buttons
  const styleButtons = document.querySelectorAll('.style-btn');
  styleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      styleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const style = btn.dataset.style;
      setMaskStyle(style);

      // Show/hide relevant controls
      document.querySelectorAll('.mask-controls').forEach(el => el.classList.add('hidden'));
      document.getElementById(`ctrl-${style}`)?.classList.remove('hidden');
    });
  });

  // Pixelate size slider
  const pixelSlider = document.getElementById('pixelate-size');
  const pixelVal = document.getElementById('pixelate-val');
  pixelSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setPixelateSize(v);
    pixelVal.textContent = `${v}px`;
  });

  // Blur radius slider
  const blurSlider = document.getElementById('blur-radius');
  const blurVal = document.getElementById('blur-val');
  blurSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setBlurRadius(v);
    blurVal.textContent = `${v}px`;
  });

  // Solid color buttons
  const colorBtns = document.querySelectorAll('.color-btn');
  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setSolidColor(btn.dataset.color);
    });
  });
}

// ---- Watermark Controls ----

function setupWatermarkControls() {
  // Text input
  const textInput = document.getElementById('watermark-text');
  textInput?.addEventListener('input', (e) => {
    setWmText(e.target.value);
  });

  // Mode toggle (single / tiled)
  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      setWmMode(mode);

      // Show/hide tiled-only controls
      document.querySelectorAll('.tiled-only').forEach(el => {
        el.classList.toggle('visible', mode === 'tiled');
      });
    });
  });

  // Font selector
  const fontSelect = document.getElementById('watermark-font');
  fontSelect?.addEventListener('change', (e) => {
    setWmFont(e.target.value);
  });

  // Color buttons
  const wmColorBtns = document.querySelectorAll('.wm-color-btn');
  wmColorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      wmColorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setWmColor(btn.dataset.color);
    });
  });

  // Custom color picker
  const customColor = document.getElementById('wm-custom-color');
  customColor?.addEventListener('input', (e) => {
    document.querySelectorAll('.wm-color-btn').forEach(b => b.classList.remove('active'));
    setWmColor(e.target.value);
  });

  // Opacity slider
  const opacitySlider = document.getElementById('watermark-opacity');
  const opacityVal = document.getElementById('opacity-val');
  opacitySlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setWmOpacity(v / 100);
    opacityVal.textContent = `${v}%`;
  });

  // Angle slider
  const angleSlider = document.getElementById('watermark-angle');
  const angleVal = document.getElementById('angle-val');
  angleSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setWmAngle(v);
    angleVal.textContent = `${v}°`;
  });

  // Density slider
  const densitySlider = document.getElementById('watermark-density');
  const densityVal = document.getElementById('density-val');
  const densityLabels = ['稀', '较稀', '中', '较密', '密'];
  densitySlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setWmDensity(v);
    densityVal.textContent = densityLabels[v - 1];
  });

  // Font size slider
  const fontSizeSlider = document.getElementById('watermark-fontsize');
  const fontSizeVal = document.getElementById('fontsize-val');
  fontSizeSlider?.addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    setWmFontSize(v);
    fontSizeVal.textContent = `${v}px`;
  });
}

// ---- Action Buttons ----

function setupActionButtons() {
  document.getElementById('btn-undo')?.addEventListener('click', () => undo());
  document.getElementById('btn-redo')?.addEventListener('click', () => redo());
  document.getElementById('btn-download')?.addEventListener('click', () => downloadImage(showToast));
  document.getElementById('btn-copy')?.addEventListener('click', () => copyToClipboard(showToast));
}
