// event-handlers.js - All UI event listeners and handlers

import { state, dom } from './config.js';
import { generateTemplate } from './template-generator.js';
import { switch2DView, switch3DView } from './3d-engine.js';
import { 
    triggerDownload, 
    renderAndDownloadPNG, 
    renderAndDownloadPDF, 
    generateAndDownloadCutout, 
    handleImageUpload 
} from './export-manager.js';
import { 
    toggleButtonState, 
    handleProjectFileLoad, 
    processProjectFile 
} from './project-manager.js';

// === UTILITY FUNCTIONS ===
function updateControlsVisibility() {
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    dom.bgNoneControls.classList.toggle('hidden', selectedBgType !== 'transparent');
    dom.bgColorControls.classList.toggle('hidden', selectedBgType !== 'color');
    dom.bgImageControls.classList.toggle('hidden', selectedBgType !== 'image');

    if (selectedBgType === 'image') {
        const selectedBgStyle = dom.bgImageStyle.value;
        dom.bgImageSize.classList.toggle('hidden', selectedBgStyle !== 'tile' && selectedBgStyle !== 'center');
    } else {
        dom.bgImageSize.classList.add('hidden');
    }
    
    const selectedFaceType = document.querySelector('input[name="faceArtType"]:checked').value;
    dom.faceImageControls.classList.toggle('hidden', selectedFaceType !== 'image');
    dom.faceTextControls.classList.toggle('hidden', selectedFaceType !== 'text');
    
    const selectedBackType = document.querySelector('input[name="backArtType"]:checked').value;
    dom.backImageControls.classList.toggle('hidden', selectedBackType !== 'image');
    dom.backTextControls.classList.toggle('hidden', selectedBackType !== 'text');
    
    generateTemplate();
}

// === DARK MODE FUNCTIONS ===
function initializeDarkMode() {
    // Check for saved theme preference or default to 'light' mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    
    // Save the current theme to localStorage
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === EVENT LISTENER SETUP ===
export function setupEventListeners() {
    // === DARK MODE INITIALIZATION AND TOGGLE ===
    initializeDarkMode();
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // === DIMENSION AND INPUT LISTENERS ===
    const allInputs = [
        dom.projectNameInput, dom.heightInput, dom.diameterInput, dom.handleAreaWidthInput, 
        dom.bgColorPicker, dom.exportFormatSelect, dom.faceTextInput, dom.faceColorPicker, 
        dom.faceContourColorPicker, dom.backTextInput, dom.backColorPicker, dom.backContourColorPicker
    ];
    allInputs.forEach(input => input.addEventListener('input', generateTemplate));

    // Project name sanitization
    dom.projectNameInput.addEventListener('input', function() { 
        this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, ''); 
    });

    // === RADIO BUTTON LISTENERS ===
    [...dom.bgTypeRadios, ...dom.faceArtTypeRadios, ...dom.backArtTypeRadios]
        .forEach(radio => radio.addEventListener('change', updateControlsVisibility));

    // === FACE ARTWORK LISTENERS ===
    // Image controls
    dom.uploadFaceBtn.addEventListener('click', () => dom.faceImageInput.click());
    dom.faceImageInput.addEventListener('change', (e) => handleImageUpload(e, 'face'));
    dom.flipFaceHBtn.addEventListener('click', () => { 
        state.isFaceFlippedH = !state.isFaceFlippedH; 
        generateTemplate(); 
    });
    dom.flipFaceVBtn.addEventListener('click', () => { 
        state.isFaceFlippedV = !state.isFaceFlippedV; 
        generateTemplate(); 
    });
    dom.rotateFaceLBtn.addEventListener('click', () => { 
        state.faceRotation = (state.faceRotation - 90 + 360) % 360; 
        generateTemplate(); 
    });
    dom.rotateFaceRBtn.addEventListener('click', () => { 
        state.faceRotation = (state.faceRotation + 90) % 360; 
        generateTemplate(); 
    });

    // Text formatting controls
    dom.faceBoldBtn.addEventListener('click', () => { 
        state.isFaceBold = !state.isFaceBold; 
        toggleButtonState(dom.faceBoldBtn, state.isFaceBold); 
        generateTemplate(); 
    });
    dom.faceItalicBtn.addEventListener('click', () => { 
        state.isFaceItalic = !state.isFaceItalic; 
        toggleButtonState(dom.faceItalicBtn, state.isFaceItalic); 
        generateTemplate(); 
    });
    dom.faceUnderlineBtn.addEventListener('click', () => { 
        state.isFaceUnderline = !state.isFaceUnderline; 
        toggleButtonState(dom.faceUnderlineBtn, state.isFaceUnderline); 
        generateTemplate(); 
    });
    dom.faceStrikethroughBtn.addEventListener('click', () => { 
        state.isFaceStrikethrough = !state.isFaceStrikethrough; 
        toggleButtonState(dom.faceStrikethroughBtn, state.isFaceStrikethrough); 
        generateTemplate(); 
    });
    dom.faceContourBtn.addEventListener('click', () => { 
        state.isFaceContour = !state.isFaceContour; 
        toggleButtonState(dom.faceContourBtn, state.isFaceContour); 
        dom.faceContourControls.classList.toggle('hidden', !state.isFaceContour); 
        generateTemplate(); 
    });

    // === BACK ARTWORK LISTENERS ===
    // Image controls
    dom.uploadBackBtn.addEventListener('click', () => dom.backImageInput.click());
    dom.backImageInput.addEventListener('change', (e) => handleImageUpload(e, 'back'));
    dom.flipBackHBtn.addEventListener('click', () => { 
        state.isBackFlippedH = !state.isBackFlippedH; 
        generateTemplate(); 
    });
    dom.flipBackVBtn.addEventListener('click', () => { 
        state.isBackFlippedV = !state.isBackFlippedV; 
        generateTemplate(); 
    });
    dom.rotateBackLBtn.addEventListener('click', () => { 
        state.backRotation = (state.backRotation - 90 + 360) % 360; 
        generateTemplate(); 
    });
    dom.rotateBackRBtn.addEventListener('click', () => { 
        state.backRotation = (state.backRotation + 90) % 360; 
        generateTemplate(); 
    });

    // Text formatting controls
    dom.backBoldBtn.addEventListener('click', () => { 
        state.isBackBold = !state.isBackBold; 
        toggleButtonState(dom.backBoldBtn, state.isBackBold); 
        generateTemplate(); 
    });
    dom.backItalicBtn.addEventListener('click', () => { 
        state.isBackItalic = !state.isBackItalic; 
        toggleButtonState(dom.backItalicBtn, state.isBackItalic); 
        generateTemplate(); 
    });
    dom.backUnderlineBtn.addEventListener('click', () => { 
        state.isBackUnderline = !state.isBackUnderline; 
        toggleButtonState(dom.backUnderlineBtn, state.isBackUnderline); 
        generateTemplate(); 
    });
    dom.backStrikethroughBtn.addEventListener('click', () => { 
        state.isBackStrikethrough = !state.isBackStrikethrough; 
        toggleButtonState(dom.backStrikethroughBtn, state.isBackStrikethrough); 
        generateTemplate(); 
    });
    dom.backContourBtn.addEventListener('click', () => { 
        state.isBackContour = !state.isBackContour; 
        toggleButtonState(dom.backContourBtn, state.isBackContour); 
        dom.backContourControls.classList.toggle('hidden', !state.isBackContour); 
        generateTemplate(); 
    });

    // === BACKGROUND CONTROLS ===
    dom.bgUploadBtn.addEventListener('click', () => dom.bgImageUploadInput.click());
    dom.bgImageUploadInput.addEventListener('change', (e) => handleImageUpload(e, 'bg'));
    dom.bgImageStyle.addEventListener('change', updateControlsVisibility);
    dom.bgImageSize.addEventListener('change', generateTemplate);

    // === DOWNLOAD AND EXPORT LISTENERS ===
    dom.downloadDesignBtn.addEventListener('click', () => {
        const format = dom.exportFormatSelect.value;
        const filenameBase = dom.projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-template';
        const filename = `${filenameBase}.${format}`;
        
        if (format === 'svg') {
            triggerDownload(state.svgForDesign, filename);
        } else if (format === 'pdf') {
            renderAndDownloadPDF(state.svgForDesign, filename);
        } else {
            renderAndDownloadPNG(state.svgForDesign, filename);
        }
    });

    dom.downloadCutoutBtn.addEventListener('click', generateAndDownloadCutout);

    // === PROJECT MANAGEMENT LISTENERS ===
    dom.loadProjectBtn.addEventListener('click', handleProjectFileLoad);
    dom.loadProjectInput.addEventListener('change', processProjectFile);

    // === 3D VIEW TOGGLE LISTENERS ===
    dom.view2DBtn.addEventListener('click', switch2DView);
    dom.view3DBtn.addEventListener('click', switch3DView);

    console.log('All event listeners setup complete');
}
