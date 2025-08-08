// undo-redo.js - Undo/Redo functionality for SVG/canvas snapshot states

import { state, dom } from './config.js';
import { update3DMug } from './3d-engine.js';
import { collectProjectData, loadProjectData } from './project-manager.js';

/**
 * Updates the disabled state of the undo and redo buttons.
 */
function updateUndoRedoButtons() {
  if (dom.undoBtn) dom.undoBtn.disabled = state.undoStack.length === 0;
  if (dom.redoBtn) dom.redoBtn.disabled = state.redoStack.length === 0;
}

/**
 * Undo the last action by restoring the previous SVG state.
 */
export function undo() {
  if (state.undoStack.length === 0) return;
  // Save current project state for redo
  state.redoStack.push(JSON.parse(JSON.stringify(collectProjectData())));
  const previousData = state.undoStack.pop();
  // Prevent capturing a new undo state during this restore
  state.skipCapture = true;
  // Restore project settings and regenerate template
  loadProjectData(previousData);
  if (state.isCurrentView3D) update3DMug();
  updateUndoRedoButtons();
}

/**
 * Redo the last undone action by restoring the next SVG state.
 */
export function redo() {
  if (state.redoStack.length === 0) return;
  // Save current project state for undo
  state.undoStack.push(JSON.parse(JSON.stringify(collectProjectData())));
  const nextData = state.redoStack.pop();
  // Prevent capturing a new undo state during this restore
  state.skipCapture = true;
  loadProjectData(nextData);
  if (state.isCurrentView3D) update3DMug();
  updateUndoRedoButtons();
}

/**
 * Captures the current SVG state for undo and clears the redo stack.
 * Should be called before each template update.
 */
export function captureUndoState() {
  if (state.skipCapture) {
    state.skipCapture = false;
    return;
  }
  // Capture project data snapshot for undo
  const data = collectProjectData();
  state.undoStack.push(JSON.parse(JSON.stringify(data)));
  if (state.undoStack.length > state.maxUndoStack) {
    state.undoStack.shift();
  }
  // Clear redo history
  state.redoStack = [];
  updateUndoRedoButtons();
}

/**
 * Initializes undo/redo button event listeners.
 */
export function initUndoRedo() {
  if (dom.undoBtn) {
    dom.undoBtn.addEventListener('click', undo);
    dom.undoBtn.disabled = true;
  }
  if (dom.redoBtn) {
    dom.redoBtn.addEventListener('click', redo);
    dom.redoBtn.disabled = true;
  }
}
