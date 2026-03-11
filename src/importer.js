/**
 * MarkMask — Image Importer
 * Handles drag-drop, clipboard paste, and file picker image import.
 */

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Set up all import methods
 * @param {Function} onImageLoaded - callback receiving dataUrl string
 * @param {Function} showToast - toast notification function
 */
export function setupImporter(onImageLoaded, showToast) {
  setupDragDrop(onImageLoaded, showToast);
  setupPaste(onImageLoaded, showToast);
  setupFileInput(onImageLoaded, showToast);
}

function setupDragDrop(onImageLoaded, showToast) {
  const dropZone = document.getElementById('drop-zone');
  const canvasArea = document.querySelector('.canvas-area');

  // Use the whole canvas area as the drop target
  const target = dropZone || canvasArea;

  ['dragenter', 'dragover'].forEach(eventName => {
    target.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZone) dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    target.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZone) dropZone.classList.remove('drag-over');
    });
  });

  target.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0], onImageLoaded, showToast);
    }
  });
}

function setupPaste(onImageLoaded, showToast) {
  document.addEventListener('paste', (e) => {
    // Ignore paste if focus is on a text input
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) processFile(file, onImageLoaded, showToast);
        return;
      }
    }
  });
}

function setupFileInput(onImageLoaded, showToast) {
  const fileInput = document.getElementById('file-input');
  const btnOpen = document.getElementById('btn-open-file');
  const btnNew = document.getElementById('btn-new');

  btnOpen?.addEventListener('click', () => fileInput.click());
  btnNew?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0], onImageLoaded, showToast);
      e.target.value = ''; // Reset so same file can be re-selected
    }
  });
}

/**
 * Validate and read a file, then invoke callback with dataUrl
 */
function processFile(file, onImageLoaded, showToast) {
  // Validate type
  if (!SUPPORTED_TYPES.includes(file.type)) {
    showToast('不支持的格式，请使用 JPG / PNG / WebP', 'error');
    return;
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    showToast('图片太大，请使用 20MB 以内的图片', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    onImageLoaded(e.target.result);
  };
  reader.onerror = () => {
    showToast('读取图片失败，请重试', 'error');
  };
  reader.readAsDataURL(file);
}
