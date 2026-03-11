/**
 * MarkMask 码印 — Main Entry Point
 * Initializes all modules and wires them together.
 */
import './style.css';
import { initCanvas, loadImageToCanvas } from './canvas.js';
import { setupImporter } from './importer.js';
import { initMask } from './mask.js';
import { initWatermark } from './watermark.js';
import { initHistory, pushState, resetHistory } from './history.js';
import { initUI, onImageReady, updateHistoryButtons } from './ui.js';

// ---- Toast System ----

function showToast(message, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = message;
  el.className = 'toast';
  if (type) el.classList.add(type);

  // Force reflow for re-triggering animation
  void el.offsetWidth;
  el.classList.add('show');

  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.classList.remove('show');
  }, 2500);
}

// ---- App Init ----

function init() {
  // 1. Initialize Canvas
  initCanvas();

  // 2. Initialize UI
  initUI(showToast);

  // 3. Initialize History
  initHistory((canUndoFlag, canRedoFlag) => {
    updateHistoryButtons(canUndoFlag, canRedoFlag);
  });

  // 4. Initialize Mask module
  initMask(() => {
    // Callback: mask created/deleted → push state
    pushState();
  });

  // 5. Initialize Watermark module
  initWatermark(() => {
    pushState();
  });

  // 6. Setup Importer with callback
  setupImporter((dataUrl) => {
    loadImageToCanvas(dataUrl, () => {
      onImageReady();
      resetHistory();
      pushState(); // Initial state
      showToast('✅ 图片加载成功', 'success');
    });
  }, showToast);

  // Mobile detection
  checkMobile();
}

function checkMobile() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (window.innerWidth < 768);

  if (isMobile) {
    document.getElementById('mobile-warning')?.style.setProperty('display', 'flex');
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
