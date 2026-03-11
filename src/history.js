/**
 * MarkMask — History (Undo/Redo) Manager
 * Stack-based canvas state snapshots using Fabric.js serialization.
 */
import { serializeState, restoreState } from './canvas.js';

const MAX_HISTORY = 30;

let undoStack = [];
let redoStack = [];
let isBusy = false;

/** @type {Function|null} */
let onHistoryChange = null;

/**
 * Initialize history manager
 * @param {Function} onChange - called when undo/redo availability changes
 */
export function initHistory(onChange) {
  onHistoryChange = onChange;

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore when typing in inputs
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });
}

/**
 * Push current state onto the undo stack
 */
export function pushState() {
  if (isBusy) return;

  const state = serializeState();
  if (!state) return;

  undoStack.push(JSON.stringify(state));

  // Limit stack depth
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }

  // Clear redo stack on new action
  redoStack = [];

  notifyChange();
}

/**
 * Undo last action
 */
export function undo() {
  if (undoStack.length === 0 || isBusy) return;

  isBusy = true;

  // Save current state for redo
  const currentState = serializeState();
  if (currentState) {
    redoStack.push(JSON.stringify(currentState));
  }

  // Restore previous state
  const prevState = JSON.parse(undoStack.pop());
  restoreState(prevState, () => {
    isBusy = false;
    notifyChange();
  });
}

/**
 * Redo last undone action
 */
export function redo() {
  if (redoStack.length === 0 || isBusy) return;

  isBusy = true;

  // Save current state for undo
  const currentState = serializeState();
  if (currentState) {
    undoStack.push(JSON.stringify(currentState));
  }

  // Restore redo state
  const nextState = JSON.parse(redoStack.pop());
  restoreState(nextState, () => {
    isBusy = false;
    notifyChange();
  });
}

/**
 * Reset history (e.g., when a new image is loaded)
 */
export function resetHistory() {
  undoStack = [];
  redoStack = [];
  notifyChange();
}

/**
 * Check if undo is available
 */
export function canUndo() {
  return undoStack.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo() {
  return redoStack.length > 0;
}

function notifyChange() {
  if (onHistoryChange) {
    onHistoryChange(canUndo(), canRedo());
  }
}
