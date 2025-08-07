// main.js - Application initialization and global function setup

import { state, dom } from './config.js';
import { randomProjectName } from './project-manager.js';
import { generateTemplate } from './template-generator.js';
import { loadGoogleFonts, prefetchAllFonts } from './font-manager.js';
import { setupEventListeners } from './event-handlers.js';
import { CustomSelect } from './ui-components.js';

// === GLOBAL FUNCTION ACCESS ===
// Make generateTemplate available globally for cross-module access
window.generateTemplate = generateTemplate;

// === FONT DROPDOWN INITIALIZATION ===
function initializeFontDropdowns() {
    // Initialize face font dropdown
    if (dom.faceFontSelect) {
        window.faceDropdown = new CustomSelect(dom.faceFontSelect, state.selectedFaceFont, (value) => {
            state.selectedFaceFont = value;
            if (state.dropdownsInitialized) generateTemplate();
        });
    }
    
    // Initialize back font dropdown
    if (dom.backFontSelect) {
        window.backDropdown = new CustomSelect(dom.backFontSelect, state.selectedBackFont, (value) => {
            state.selectedBackFont = value;
            if (state.dropdownsInitialized) generateTemplate();
        });
    }
    
    state.dropdownsInitialized = true;
    
    // Generate initial template after dropdowns are ready
    generateTemplate();
}

// === APPLICATION INITIALIZATION ===
function initializeApplication() {
    console.log('Initializing Mug Painter application...');
    
    // Load Google Fonts into the page
    loadGoogleFonts();
    
    // Pre-fetch all fonts for caching
    prefetchAllFonts();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize font dropdowns with a delay to allow fonts to start loading
    setTimeout(() => {
        initializeFontDropdowns();
    }, 500);
    
    // Update initial UI state
    updateInitialControlsVisibility();

    // Initiate random project name
    randomProjectName();
    
    console.log('Mug Painter application initialized successfully');
}

// === INITIAL UI STATE ===
function updateInitialControlsVisibility() {
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked')?.value || 'transparent';
    dom.bgNoneControls.classList.toggle('hidden', selectedBgType !== 'transparent');
    dom.bgColorControls.classList.toggle('hidden', selectedBgType !== 'color');
    dom.bgImageControls.classList.toggle('hidden', selectedBgType !== 'image');
    
    const selectedFaceType = document.querySelector('input[name="faceArtType"]:checked')?.value || 'transparent';
    dom.faceImageControls.classList.toggle('hidden', selectedFaceType !== 'image');
    dom.faceTextControls.classList.toggle('hidden', selectedFaceType !== 'text');
    
    const selectedBackType = document.querySelector('input[name="backArtType"]:checked')?.value || 'transparent';
    dom.backImageControls.classList.toggle('hidden', selectedBackType !== 'image');
    dom.backTextControls.classList.toggle('hidden', selectedBackType !== 'text');
}

// === START APPLICATION WHEN DOM IS READY ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    // DOM is already loaded
    initializeApplication();
}
