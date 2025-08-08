// project-manager.js - Project save/load functionality with metadata handling

import { state, dom } from './config.js';
import getRandomName from 'https://cdn.jsdelivr.net/gh/shamrin/namesgenerator@master/namesgenerator.js';

// === PROJECT DATA COLLECTION ===
export function collectProjectData() {
    const projectData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        
        // Project settings
        projectName: dom.projectNameInput.value,
        mugDimensions: {
            height: parseFloat(dom.heightInput.value),
            diameter: parseFloat(dom.diameterInput.value),
            handleAreaWidth: parseFloat(dom.handleAreaWidthInput.value)
        },
        
        // Background settings
        background: {
            type: document.querySelector('input[name="backgroundType"]:checked').value,
            color: dom.bgColorPicker.value,
            imageData: state.uploadedBgImageData,
            imageStyle: dom.bgImageStyle.value,
            imageSize: dom.bgImageSize.value
        },
        
        // Face artwork settings
        faceArt: {
            type: document.querySelector('input[name="faceArtType"]:checked').value,
            imageData: state.uploadedFaceImage,
            isFlippedH: state.isFaceFlippedH,
            isFlippedV: state.isFaceFlippedV,
            rotation: state.faceRotation,
            text: dom.faceTextInput.value,
            font: state.selectedFaceFont,
            color: dom.faceColorPicker.value,
            bold: state.isFaceBold,
            italic: state.isFaceItalic,
            underline: state.isFaceUnderline,
            strikethrough: state.isFaceStrikethrough,
            contour: state.isFaceContour,
            contourColor: dom.faceContourColorPicker.value,
            textFlipped: state.isFaceTextFlipped,
            contourThickness: state.faceContourThickness
        },
        
        // Back artwork settings
        backArt: {
            type: document.querySelector('input[name="backArtType"]:checked').value,
            imageData: state.uploadedBackImage,
            isFlippedH: state.isBackFlippedH,
            isFlippedV: state.isBackFlippedV,
            rotation: state.backRotation,
            text: dom.backTextInput.value,
            font: state.selectedBackFont,
            color: dom.backColorPicker.value,
            bold: state.isBackBold,
            italic: state.isBackItalic,
            underline: state.isBackUnderline,
            strikethrough: state.isBackStrikethrough,
            contour: state.isBackContour,
            contourColor: dom.backContourColorPicker.value,
            textFlipped: state.isBackTextFlipped,
            contourThickness: state.backContourThickness
        }
    };
    
    return projectData;
}

// === PROJECT DATA LOADING ===
export function loadProjectData(projectData) {
    try {
        // Project settings
        if (projectData.projectName) {
            dom.projectNameInput.value = projectData.projectName;
        }
        
        // Mug dimensions
        if (projectData.mugDimensions) {
            dom.heightInput.value = projectData.mugDimensions.height;
            dom.diameterInput.value = projectData.mugDimensions.diameter;
            dom.handleAreaWidthInput.value = projectData.mugDimensions.handleAreaWidth;
        }
        
        // Background settings
        if (projectData.background) {
            loadBackgroundData(projectData.background);
        }
        
        // Face artwork settings
        if (projectData.faceArt) {
            loadFaceArtData(projectData.faceArt);
        }
        
        // Back artwork settings
        if (projectData.backArt) {
            loadBackArtData(projectData.backArt);
        }
        
        // Update button states and UI
        updateFormattingButtonStates();
        updateCustomDropdowns();
        updateControlsVisibility();
        
        // Update background removal button states
        if (window.updateBackgroundRemovalButtons) {
            window.updateBackgroundRemovalButtons();
        }
        
        // Regenerate template
        if (window.generateTemplate) {
            window.generateTemplate();
        }
        
        console.log('Project loaded successfully!', projectData);
    } catch (error) {
        console.error('Error loading project data:', error);
        alert('Error loading project file. The file may be corrupted or from an incompatible version.');
    }
}

// === BACKGROUND DATA LOADING ===
function loadBackgroundData(bg) {
    // Set background type
    const bgRadio = document.querySelector(`input[name="backgroundType"][value="${bg.type}"]`);
    if (bgRadio) bgRadio.checked = true;
    
    dom.bgColorPicker.value = bg.color || '#BFDBFE';
    state.uploadedBgImageData = bg.imageData || null;
    dom.bgImageStyle.value = bg.imageStyle || 'fill';
    dom.bgImageSize.value = bg.imageSize || 'original';
}

// === FACE ART DATA LOADING ===
function loadFaceArtData(face) {
    // Set face art type
    const faceRadio = document.querySelector(`input[name="faceArtType"][value="${face.type}"]`);
    if (faceRadio) faceRadio.checked = true;
    
    // Image settings
    state.uploadedFaceImage = face.imageData || null;
    state.isFaceFlippedH = face.isFlippedH || false;
    state.isFaceFlippedV = face.isFlippedV || false;
    state.faceRotation = face.rotation || 0;
    
    // Text settings
    dom.faceTextInput.value = face.text || '';
    state.selectedFaceFont = face.font || 'Roboto';
    dom.faceColorPicker.value = face.color || '#000000';
    state.isFaceBold = face.bold || false;
    state.isFaceItalic = face.italic || false;
    state.isFaceUnderline = face.underline || false;
    state.isFaceStrikethrough = face.strikethrough || false;
    state.isFaceContour = face.contour || false;
    dom.faceContourColorPicker.value = face.contourColor || '#000000';
    state.isFaceTextFlipped = face.textFlipped || false;
    state.faceContourThickness = face.contourThickness || 2;
}

// === BACK ART DATA LOADING ===
function loadBackArtData(back) {
    // Set back art type
    const backRadio = document.querySelector(`input[name="backArtType"][value="${back.type}"]`);
    if (backRadio) backRadio.checked = true;
    
    // Image settings
    state.uploadedBackImage = back.imageData || null;
    state.isBackFlippedH = back.isFlippedH || false;
    state.isBackFlippedV = back.isFlippedV || false;
    state.backRotation = back.rotation || 0;
    
    // Text settings
    dom.backTextInput.value = back.text || '';
    state.selectedBackFont = back.font || 'Roboto';
    dom.backColorPicker.value = back.color || '#000000';
    state.isBackBold = back.bold || false;
    state.isBackItalic = back.italic || false;
    state.isBackUnderline = back.underline || false;
    state.isBackStrikethrough = back.strikethrough || false;
    state.isBackContour = back.contour || false;
    dom.backContourColorPicker.value = back.contourColor || '#000000';
    state.isBackTextFlipped = back.textFlipped || false;
    state.backContourThickness = back.contourThickness || 2;
}

// === BUTTON STATE UPDATES ===
function updateFormattingButtonStates() {
    // Update face formatting buttons
    toggleButtonState(dom.faceBoldBtn, state.isFaceBold);
    toggleButtonState(dom.faceItalicBtn, state.isFaceItalic);
    toggleButtonState(dom.faceUnderlineBtn, state.isFaceUnderline);
    toggleButtonState(dom.faceStrikethroughBtn, state.isFaceStrikethrough);
    toggleButtonState(dom.faceContourBtn, state.isFaceContour);
    dom.faceContourControls.classList.toggle('hidden', !state.isFaceContour);
    toggleButtonState(dom.faceFlipTextBtn, state.isFaceTextFlipped);
    dom.faceContourThickness.value = state.faceContourThickness;
    dom.faceContourThicknessValue.textContent = state.faceContourThickness;
    
    // Update back formatting buttons
    toggleButtonState(dom.backBoldBtn, state.isBackBold);
    toggleButtonState(dom.backItalicBtn, state.isBackItalic);
    toggleButtonState(dom.backUnderlineBtn, state.isBackUnderline);
    toggleButtonState(dom.backStrikethroughBtn, state.isBackStrikethrough);
    toggleButtonState(dom.backContourBtn, state.isBackContour);
    dom.backContourControls.classList.toggle('hidden', !state.isBackContour);
    toggleButtonState(dom.backFlipTextBtn, state.isBackTextFlipped);
    dom.backContourThickness.value = state.backContourThickness;
    dom.backContourThicknessValue.textContent = state.backContourThickness;
}

// === CUSTOM DROPDOWN UPDATES ===
function updateCustomDropdowns() {
    if (window.faceDropdown) {
        window.faceDropdown.setValue(state.selectedFaceFont);
    }
    if (window.backDropdown) {
        window.backDropdown.setValue(state.selectedBackFont);
    }
}

// === CONTROLS VISIBILITY UPDATE ===
function updateControlsVisibility() {
    // Background controls
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
    
    // Face art controls
    const selectedFaceType = document.querySelector('input[name="faceArtType"]:checked').value;
    dom.faceImageControls.classList.toggle('hidden', selectedFaceType !== 'image');
    dom.faceTextControls.classList.toggle('hidden', selectedFaceType !== 'text');
    
    // Back art controls
    const selectedBackType = document.querySelector('input[name="backArtType"]:checked').value;
    dom.backImageControls.classList.toggle('hidden', selectedBackType !== 'image');
    dom.backTextControls.classList.toggle('hidden', selectedBackType !== 'text');
}

// === SVG PROJECT DATA PARSING ===
export function parseProjectFromSVG(svgContent) {
    const metadataMatch = svgContent.match(/<!--MUG_PAINTER_PROJECT_DATA:([^:]+):END_PROJECT_DATA-->/);
    if (metadataMatch) {
        try {
            const encodedData = metadataMatch[1];
            const decodedData = atob(encodedData);
            return JSON.parse(decodedData);
        } catch (error) {
            console.error('Error parsing project data from SVG:', error);
            return null;
        }
    }
    return null;
}

// === BUTTON STATE TOGGLE UTILITY ===
export function toggleButtonState(button, isActive) {
    if (isActive) {
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
    } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }
}

// === PROJECT FILE HANDLING ===
export function handleProjectFileLoad() {
    dom.loadProjectInput.click();
}

export function processProjectFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            const projectData = parseProjectFromSVG(fileContent);
            
            if (projectData) {
                if (confirm('This will replace your current project. Continue?')) {
                    loadProjectData(projectData);
                }
            } else {
                alert('No project data found in this file. Make sure the file was exported with project data enabled.');
            }
            
            // Reset the file input so the same file can be selected again
            event.target.value = '';
        };
        reader.readAsText(file);
    }
}

export function randomProjectName() {
    let name = getRandomName().replace(/[^a-zA-Z0-9-]/g, '-');
    dom.projectNameInput.value = name;
}
