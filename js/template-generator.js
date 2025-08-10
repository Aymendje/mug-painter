// template-generator.js - SVG template generation and artwork creation

import { state, dom } from './config.js';
import { loadAndEmbedFonts } from './font-manager.js';
import { update3DMug } from './3d-engine.js';
import { collectProjectData } from './project-manager.js';
import { captureUndoState } from './undo-redo.js';

// === MAIN TEMPLATE GENERATION ===
export function getProjectMetadata() {
    let projectMetadata = '';
    if (dom.includeProjectDataCheckbox.checked) {
        const projectData = collectProjectData();
        projectMetadata = `<!--MUG_PAINTER_PROJECT_DATA:${btoa(JSON.stringify(projectData))}:END_PROJECT_DATA-->`;
    }
    return projectMetadata;
}

export async function generateTemplate() {
    // Capture current state for undo
    captureUndoState();
    // 1. Get user inputs & dimensions
    const mainHeight = parseFloat(dom.heightInput.value);
    const diameter = parseFloat(dom.diameterInput.value);
    const areaWidth = parseFloat(dom.handleAreaWidthInput.value) * 0.5 * 1.5;
    
    if (isNaN(mainHeight) || isNaN(diameter) || isNaN(areaWidth) || mainHeight <= 0 || diameter <= 0 || areaWidth <= 0) {
        dom.infoDiv.textContent = 'Please enter valid, positive numbers for all dimensions.';
        dom.svgContainer.innerHTML = '';
        dom.downloadDesignBtn.disabled = true; 
        dom.downloadCutoutBtn.disabled = true;
        return;
    }
    
    const width = diameter * Math.PI;
    const areaHeight = mainHeight * 0.5;
    const cutoutHeight = (mainHeight - areaHeight) / 2;
    const pathData = `M 0 ${cutoutHeight.toFixed(2)} L ${areaWidth.toFixed(2)} ${cutoutHeight.toFixed(2)} L ${areaWidth.toFixed(2)} 0 L ${(width - areaWidth).toFixed(2)} 0 L ${(width - areaWidth).toFixed(2)} ${cutoutHeight.toFixed(2)} L ${width.toFixed(2)} ${cutoutHeight.toFixed(2)} L ${width.toFixed(2)} ${(mainHeight - cutoutHeight).toFixed(2)} L ${(width - areaWidth).toFixed(2)} ${(mainHeight - cutoutHeight).toFixed(2)} L ${(width - areaWidth).toFixed(2)} ${mainHeight.toFixed(2)} L ${areaWidth.toFixed(2)} ${mainHeight.toFixed(2)} L ${areaWidth.toFixed(2)} ${(mainHeight - cutoutHeight).toFixed(2)} L 0 ${(mainHeight - cutoutHeight).toFixed(2)} Z`;
    
    // 2. Calculate guide box dimensions
    const boxWidth = width / 3;
    const boxHeight = mainHeight * 0.9;
    const boxY = mainHeight * 0.05;
    const faceBoxX = (width * (1 - 7 / 24)) - (boxWidth / 2);
    const backBoxX = (width * (7 / 24)) - (boxWidth / 2);

    // 3. Load fonts BEFORE creating artwork that needs measurements
    const fontDefsForSVG = await loadAndEmbedFonts();

    // 4. Create artwork tags
    let faceArtTag = await createArtElement('face', faceBoxX, boxY, boxWidth, boxHeight);
    let backArtTag = await createArtElement('back', backBoxX, boxY, boxWidth, boxHeight);

    // 5. Create background area (only for main cylindrical section, not handle areas)
    const bgAreaX = areaWidth;
    const bgAreaWidth = width - (2 * areaWidth);
    const bgAreaHeight = mainHeight;
    const backgroundPath = `M ${bgAreaX.toFixed(2)} 0 L ${(bgAreaX + bgAreaWidth).toFixed(2)} 0 L ${(bgAreaX + bgAreaWidth).toFixed(2)} ${bgAreaHeight.toFixed(2)} L ${bgAreaX.toFixed(2)} ${bgAreaHeight.toFixed(2)} Z`;

    // 6. Determine background fill
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    let defs = fontDefsForSVG || '';
    let backgroundElement = '';
    
    // Always include checkerboard pattern for preview
    defs += `<pattern id="checkerboard" patternUnits="userSpaceOnUse" width="20" height="20"><rect width="10" height="10" x="0" y="0" fill="#e2e8f0" /><rect width="10" height="10" x="10" y="0" fill="#f1f5f9" /><rect width="10" height="10" x="0" y="10" fill="#f1f5f9" /><rect width="10" height="10" x="10" y="10" fill="#e2e8f0" /></pattern>`;

    if (selectedBgType === 'image' && state.uploadedBgImageData) {
        backgroundElement = await createImageBackground(backgroundPath, bgAreaWidth, bgAreaX, mainHeight);
        defs += backgroundElement.defs;
        backgroundElement = backgroundElement.element;
    } else if (selectedBgType === 'color') {
        backgroundElement = `<path d="${backgroundPath}" fill="${dom.bgColorPicker.value}"/>`;
    } else { // Transparent
        // For transparent background, don't create a background element (will be handled in preview separately)
        backgroundElement = '';
    }
    
    // 7. Assemble SVGs with optional project metadata
    let projectMetadata = getProjectMetadata();
    const finalDefs = defs ? `<defs>${defs}</defs>` : '';
    
    // For preview: always show full checkerboard background as base layer for all modes
    const svgContentForPreview = `<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" fill="url(#checkerboard)" stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${backgroundElement}${faceArtTag}${backArtTag}<rect x="${faceBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/><rect x="${backBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/></svg>`;
    
    // For download version: main path is always transparent, background only in cylindrical area when not transparent
    const downloadBackgroundElement = selectedBgType === 'transparent' ? '' : backgroundElement;
    state.svgForDesign = `${projectMetadata}<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" fill="none" stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${downloadBackgroundElement}${faceArtTag}${backArtTag}</svg>`;
    
    // 8. Update UI
    dom.svgContainer.innerHTML = svgContentForPreview;
    dom.infoDiv.innerHTML = `Calculated Circumference: <strong class="text-indigo-600">${width.toFixed(2)} mm</strong><br>Total Template Size: <strong class="text-indigo-600">${width.toFixed(2)} x ${mainHeight.toFixed(2)} mm</strong>`;
    dom.downloadDesignBtn.disabled = false;
    dom.downloadCutoutBtn.disabled = false;
    
    // 9. Update 3D view if active
    if (state.isCurrentView3D) {
        update3DMug();
    }
}

// === IMAGE BACKGROUND CREATION ===
async function createImageBackground(backgroundPath, bgAreaWidth, bgAreaX, mainHeight) {
    const image = new Image();
    image.src = state.uploadedBgImageData;
    await new Promise(resolve => { image.onload = resolve; });

    const style = dom.bgImageStyle.value;
    const size = dom.bgImageSize.value;
    let imageTag = '';
    let defs = '';

    let w = image.width;
    let h = image.height;

    switch (size) {
        case 'xs': h = mainHeight / 8; w = image.width * (h / image.height); break;
        case 's': h = mainHeight / 4; w = image.width * (h / image.height); break;
        case 'm': h = mainHeight / 2; w = image.width * (h / image.height); break;
        case 'l': h = mainHeight * 0.9; w = image.width * (h / image.height); break;
        case 'xl': h = mainHeight * 2; w = image.width * (h / image.height); break;
    }

    // Build transform for background image based on flip/rotate
    const scaleX = state.isBgFlippedH ? -1 : 1;
    const scaleY = state.isBgFlippedV ? -1 : 1;
    const rotation = state.bgRotation || 0;
    const transformAttrTile = `transform="translate(${w/2}, ${h/2}) rotate(${rotation}) scale(${scaleX}, ${scaleY}) translate(${-w/2}, ${-h/2})"`;

    if (style === 'tile') {
        const pattern = `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><image href="${state.uploadedBgImageData}" x="0" y="0" width="${w}" height="${h}" ${transformAttrTile}/></pattern>`;
        defs += pattern;
        return {
            defs: defs,
            element: `<path d="${backgroundPath}" fill="url(#bgPattern)"/>`
        };
    } else {
        let x = bgAreaX, y = 0;
        let imgWidth = w, imgHeight = h;
        let preserveAspectRatio = 'none';
        if (style === 'fit') {
            preserveAspectRatio = 'xMidYMid meet';
            imgWidth = bgAreaWidth;
            imgHeight = mainHeight;
        } else if (style === 'fill') {
            preserveAspectRatio = 'xMidYMid slice';
            imgWidth = bgAreaWidth;
            imgHeight = mainHeight;
        } else if (style === 'center') {
            x = bgAreaX + (bgAreaWidth - w) / 2;
            y = (mainHeight - h) / 2;
        } else if (style === 'stretch') {
            imgWidth = bgAreaWidth;
            imgHeight = mainHeight;
        }
        // Transform about the center of the background area region
        const centerX = bgAreaX + bgAreaWidth / 2;
        const centerY = mainHeight / 2;
        const transformAttrArea = `transform="translate(${centerX}, ${centerY}) rotate(${rotation}) scale(${scaleX}, ${scaleY}) translate(${-centerX}, ${-centerY})"`;

        imageTag = `<image href="${state.uploadedBgImageData}" x="${x}" y="${y}" width="${imgWidth}" height="${imgHeight}" preserveAspectRatio="${preserveAspectRatio}" ${transformAttrArea}/>`;
        const bgPattern = `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${bgAreaWidth.toFixed(2)}" height="${mainHeight.toFixed(2)}">${imageTag}</pattern>`;
        defs += bgPattern;
        return {
            defs: defs,
            element: `<path d="${backgroundPath}" fill="url(#bgPattern)"/>`
        };
    }
}

// === ARTWORK ELEMENT CREATION ===
export async function createArtElement(type, x, y, w, h) {
    const artType = document.querySelector(`input[name="${type}ArtType"]:checked`).value;
    if (artType === 'transparent') return '';

    if (artType === 'image') {
        return createImageArtElement(type, x, y, w, h);
    }

    if (artType === 'text') {
        return createTextArtElement(type, x, y, w, h);
    }
    
    return '';
}

// === IMAGE ART ELEMENT ===
function createImageArtElement(type, x, y, w, h) {
    const imageData = type === 'face' ? state.uploadedFaceImage : state.uploadedBackImage;
    if (!imageData) return '';
    
    const isFlippedH = type === 'face' ? state.isFaceFlippedH : state.isBackFlippedH;
    const isFlippedV = type === 'face' ? state.isFaceFlippedV : state.isBackFlippedV;
    const rotation = type === 'face' ? state.faceRotation : state.backRotation;
    const scaleX = isFlippedH ? -1 : 1;
    const scaleY = isFlippedV ? -1 : 1;
    const transform = `translate(${(x + w / 2)}, ${(y + h / 2)}) rotate(${rotation}) scale(${scaleX}, ${scaleY}) translate(${-(w / 2)}, ${-(h / 2)})`;
    
    return `<g transform="${transform}"><image href="${imageData}" x="0" y="0" width="${w.toFixed(2)}" height="${h.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/></g>`;
}

// === TEXT ART ELEMENT ===
function createTextArtElement(type, x, y, w, h) {
    const textInput = type === 'face' ? dom.faceTextInput : dom.backTextInput;
    const text = textInput.value;
    if (!text.trim()) return '';
    
    const font = type === 'face' ? state.selectedFaceFont : state.selectedBackFont;
    const colorPicker = type === 'face' ? dom.faceColorPicker : dom.backColorPicker;
    const color = colorPicker.value;
    
    // Get formatting states
    const isBold = type === 'face' ? state.isFaceBold : state.isBackBold;
    const isItalic = type === 'face' ? state.isFaceItalic : state.isBackItalic;
    const isUnderline = type === 'face' ? state.isFaceUnderline : state.isBackUnderline;
    const isStrikethrough = type === 'face' ? state.isFaceStrikethrough : state.isBackStrikethrough;
    const isContour = type === 'face' ? state.isFaceContour : state.isBackContour;
    const contourColorPicker = type === 'face' ? dom.faceContourColorPicker : dom.backContourColorPicker;
    const contourColor = contourColorPicker.value;
    const contourThickness = type === 'face' ? state.faceContourThickness : state.backContourThickness;
    const isTextFlipped = type === 'face' ? state.isFaceTextFlipped : state.isBackTextFlipped;
    
    // Build style attributes
    const fontWeight = isBold ? '700' : '400';
    const fontStyle = isItalic ? 'italic' : 'normal';
    const textDecoration = [];
    if (isUnderline) textDecoration.push('underline');
    if (isStrikethrough) textDecoration.push('line-through');
    const textDecorationValue = textDecoration.length > 0 ? textDecoration.join(' ') : 'none';
    
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i] || ' ';
        lines[i] = lines[i].replace(/ /g, '\u00A0');
    }
    
    // Create temporary SVG element for measurement
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tempSvg.style.position = 'absolute'; 
    tempSvg.style.visibility = 'hidden';
    
    const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textNode.setAttribute('font-family', `"${font}"`);
    textNode.setAttribute('font-size', '100'); // Large size for accurate measurement
    textNode.setAttribute('font-weight', fontWeight);
    textNode.setAttribute('font-style', fontStyle);
    // Avoid Safari baseline quirks; we'll center using bbox math
    textNode.setAttribute('text-anchor', 'middle');
    
    lines.forEach((line, i) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.textContent = line;
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', i === 0 ? '0' : '1.2em');
        textNode.appendChild(tspan);
    });
    
    tempSvg.appendChild(textNode);
    document.body.appendChild(tempSvg);
    const bbox = textNode.getBBox();
    document.body.removeChild(tempSvg);

    const scale = Math.min(w / bbox.width, h / bbox.height);
    const finalFontSize = 100 * scale;
    const flipTransform = isTextFlipped ? 'scale(-1, 1)' : '';
    const groupTransform = `translate(${x + w / 2}, ${y + h / 2})`;
    const yAdjust = - (bbox.y + bbox.height / 2) * scale;
    const textTransform = `${flipTransform} translate(0, ${yAdjust.toFixed(2)})`;
    const textContent = lines.map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 1.2}em">${line}</tspan>`).join('');
    const textAttributes = `x="0" y="0" font-family="${font}" font-size="${finalFontSize.toFixed(2)}" font-weight="${fontWeight}" font-style="${fontStyle}" text-decoration="${textDecorationValue}" text-anchor="middle" transform="${groupTransform} ${textTransform}"`;
    
    if (isContour) {
        // Create outlined text using two text elements: stroke underneath, fill on top
        return `<g>
            <text ${textAttributes} fill="none" stroke="${contourColor}" stroke-width="${contourThickness}" stroke-linejoin="round">${textContent}</text>
            <text ${textAttributes} fill="${color}">${textContent}</text>
        </g>`;
    } else {
        return `<text ${textAttributes} fill="${color}">${textContent}</text>`;
    }
}
