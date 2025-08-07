// Get DOM elements
const projectNameInput = document.getElementById('projectName');
const heightInput = document.getElementById('mugHeight');
const diameterInput = document.getElementById('mugDiameter');
const handleAreaWidthInput = document.getElementById('handleAreaWidth');
const svgContainer = document.getElementById('svg-container');
const infoDiv = document.getElementById('info');

// Face Controls
const faceArtTypeRadios = document.querySelectorAll('input[name="faceArtType"]');
const faceImageControls = document.getElementById('face-image-controls');
const uploadFaceBtn = document.getElementById('uploadFaceBtn');
const faceImageInput = document.getElementById('faceImageInput');
const flipFaceHBtn = document.getElementById('flipFaceHBtn');
const flipFaceVBtn = document.getElementById('flipFaceVBtn');
const rotateFaceLBtn = document.getElementById('rotateFaceLBtn');
const rotateFaceRBtn = document.getElementById('rotateFaceRBtn');
const faceTextControls = document.getElementById('face-text-controls');
const faceTextInput = document.getElementById('faceTextInput');
const faceFontSelect = document.getElementById('faceFontSelect');
const faceColorPicker = document.getElementById('faceColorPicker');

// Back Controls
const backArtTypeRadios = document.querySelectorAll('input[name="backArtType"]');
const backImageControls = document.getElementById('back-image-controls');
const uploadBackBtn = document.getElementById('uploadBackBtn');
const backImageInput = document.getElementById('backImageInput');
const flipBackHBtn = document.getElementById('flipBackHBtn');
const flipBackVBtn = document.getElementById('flipBackVBtn');
const rotateBackLBtn = document.getElementById('rotateBackLBtn');
const rotateBackRBtn = document.getElementById('rotateBackRBtn');
const backTextControls = document.getElementById('back-text-controls');
const backTextInput = document.getElementById('backTextInput');
const backFontSelect = document.getElementById('backFontSelect');
const backColorPicker = document.getElementById('backColorPicker');

// Background Controls
const bgTypeRadios = document.querySelectorAll('input[name="backgroundType"]');
const bgColorControls = document.getElementById('bg-color-controls');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgImageControls = document.getElementById('bg-image-controls');
const bgUploadBtn = document.getElementById('bgUploadBtn');
const bgImageUploadInput = document.getElementById('bgImageUpload');
const bgNoneControls = document.getElementById('bg-none-controls');

// Export Controls
const exportFormatSelect = document.getElementById('exportFormat');
const downloadDesignBtn = document.getElementById('downloadDesignBtn');
const downloadCutoutBtn = document.getElementById('downloadCutoutBtn');

// Global variables
let svgForDesign = '';
let uploadedFaceImage = null, isFaceFlippedH = false, isFaceFlippedV = false, faceRotation = 0;
let uploadedBackImage = null, isBackFlippedH = false, isBackFlippedV = false, backRotation = 0;
let uploadedBgImageData = null;
const fontCache = {};
const googleFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Slabo 27px", "Raleway", "PT Sans", "Merriweather", "Lobster", "Pacifico", "Caveat"];

// --- Main Generation Function ---
async function generateTemplate() {
    // 1. Get user inputs & dimensions
    const mainHeight = parseFloat(heightInput.value);
    const diameter = parseFloat(diameterInput.value);
    const areaWidth = parseFloat(handleAreaWidthInput.value) * 1.2;
    if (isNaN(mainHeight) || isNaN(diameter) || isNaN(areaWidth) || mainHeight <= 0 || diameter <= 0 || areaWidth <= 0) {
        infoDiv.textContent = 'Please enter valid, positive numbers for all dimensions.';
        svgContainer.innerHTML = '';
        downloadDesignBtn.disabled = true; downloadCutoutBtn.disabled = true;
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

    // 5. Determine background fill
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    let defs = fontDefsForSVG || '';
    let mainFillForPreview = '', mainFillForDownload = 'fill="none"';

    if (selectedBgType === 'image' && uploadedBgImageData) {
        const bgPattern = `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${width.toFixed(2)}" height="${mainHeight.toFixed(2)}"><image href="${uploadedBgImageData}" x="0" y="0" width="${width.toFixed(2)}" height="${mainHeight.toFixed(2)}" preserveAspectRatio="xMidYMid slice"/></pattern>`;
        defs += bgPattern;
        mainFillForPreview = 'fill="url(#bgPattern)"';
        mainFillForDownload = 'fill="url(#bgPattern)"';
    } else if (selectedBgType === 'color') {
        mainFillForPreview = `fill="${bgColorPicker.value}"`;
        mainFillForDownload = `fill="${bgColorPicker.value}"`;
    } else { // Transparent
        defs += `<pattern id="checkerboard" patternUnits="userSpaceOnUse" width="20" height="20"><rect width="10" height="10" x="0" y="0" fill="#e2e8f0" /><rect width="10" height="10" x="10" y="0" fill="#f1f5f9" /><rect width="10" height="10" x="0" y="10" fill="#f1f5f9" /><rect width="10" height="10" x="10" y="10" fill="#e2e8f0" /></pattern>`;
        mainFillForPreview = 'fill="url(#checkerboard)"';
    }
    
    // 6. Assemble SVGs
    const finalDefs = defs ? `<defs>${defs}</defs>` : '';
    const svgContentForPreview = `<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" ${mainFillForPreview} stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${faceArtTag}${backArtTag}<rect x="${faceBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/><rect x="${backBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/></svg>`;
    svgForDesign = `<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" ${mainFillForDownload} stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${faceArtTag}${backArtTag}</svg>`;
    
    // 7. Update UI
    svgContainer.innerHTML = svgContentForPreview;
    infoDiv.innerHTML = `Calculated Circumference: <strong class="text-indigo-600">${width.toFixed(2)} mm</strong><br>Total Template Size: <strong class="text-indigo-600">${width.toFixed(2)} x ${mainHeight.toFixed(2)} mm</strong>`;
    downloadDesignBtn.disabled = false;
    downloadCutoutBtn.disabled = false;
}

async function createArtElement(type, x, y, w, h) {
    const artType = document.querySelector(`input[name="${type}ArtType"]:checked`).value;
    if (artType === 'transparent') return '';

    if (artType === 'image') {
        const imageData = type === 'face' ? uploadedFaceImage : uploadedBackImage;
        if (!imageData) return '';
        const isFlippedH = type === 'face' ? isFaceFlippedH : isBackFlippedH;
        const isFlippedV = type === 'face' ? isFaceFlippedV : isBackFlippedV;
        const rotation = type === 'face' ? faceRotation : backRotation;
        const scaleX = isFlippedH ? -1 : 1;
        const scaleY = isFlippedV ? -1 : 1;
        const transform = `translate(${(x + w / 2)}, ${(y + h / 2)}) rotate(${rotation}) scale(${scaleX}, ${scaleY}) translate(${-(w / 2)}, ${-(h / 2)})`;
        return `<g transform="${transform}"><image href="${imageData}" x="0" y="0" width="${w.toFixed(2)}" height="${h.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/></g>`;
    }

    if (artType === 'text') {
        const text = type === 'face' ? faceTextInput.value : backTextInput.value;
        if (!text.trim()) return '';
        const font = type === 'face' ? faceFontSelect.value : backFontSelect.value;
        const color = type === 'face' ? faceColorPicker.value : backColorPicker.value;
        
        const lines = text.split('\n');
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempSvg.style.position = 'absolute'; tempSvg.style.visibility = 'hidden';
        const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textNode.setAttribute('font-family', `"${font}"`);
        textNode.setAttribute('font-size', '100'); // Large size for accurate measurement
        lines.forEach((line, i) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.textContent = line;
            tspan.setAttribute('x', '0');
            textNode.appendChild(tspan);
        });
        tempSvg.appendChild(textNode);
        document.body.appendChild(tempSvg);
        const bbox = textNode.getBBox();
        document.body.removeChild(tempSvg);

        const scale = Math.min(w / bbox.width, h / bbox.height);
        const finalFontSize = 100 * scale;
        const transform = `translate(${x + w / 2}, ${y + h / 2})`;
        return `<text x="0" y="0" font-family="${font}" font-size="${finalFontSize.toFixed(2)}" fill="${color}" dominant-baseline="middle" text-anchor="middle" transform="${transform}">${lines.map(l => `<tspan x="0" dy="${lines.indexOf(l) === 0 ? -((lines.length-1)*0.6) : 1.2}em">${l}</tspan>`).join('')}</text>`;
    }
    return '';
}

// --- Font Handling ---
async function getFontDataURL(fontFamily) {
    if (fontCache[fontFamily]) return fontCache[fontFamily];
    try {
        const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400&display=swap`;
        const css = await fetch(url).then(res => res.text());
        const fontUrlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
        if (!fontUrlMatch) return null;
        const fontUrl = fontUrlMatch[1];
        const fontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer());
        const base64 = btoa(new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const dataUrl = `data:font/woff2;base64,${base64}`;
        fontCache[fontFamily] = dataUrl;
        return dataUrl;
    } catch (e) { console.error("Could not fetch font", e); return null; }
}

async function loadAndEmbedFonts() {
    const fontsToLoad = new Set();
    if (document.querySelector('input[name="faceArtType"]:checked').value === 'text' && faceTextInput.value.trim()) fontsToLoad.add(faceFontSelect.value);
    if (document.querySelector('input[name="backArtType"]:checked').value === 'text' && backTextInput.value.trim()) fontsToLoad.add(backFontSelect.value);
    if (fontsToLoad.size === 0) return '';

    const stylePromises = Array.from(fontsToLoad).map(async font => {
        const dataUrl = await getFontDataURL(font);
        return dataUrl ? `@font-face { font-family: '${font}'; src: url(${dataUrl}); }` : null;
    });

    const styleRules = (await Promise.all(stylePromises)).filter(Boolean);
    if (styleRules.length > 0) {
        let styleEl = document.getElementById('dynamic-font-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-font-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = styleRules.join('\n');
        const fontLoadPromises = Array.from(fontsToLoad).map(font => document.fonts.load(`12px "${font}"`));
        await Promise.all(fontLoadPromises).catch(err => console.error("Font loading error:", err));
    }
    return `<style>${styleRules.join(' ')}</style>`;
}

// --- Event Handlers ---
function handleImageUpload(event, imageType) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imageType === 'face') uploadedFaceImage = e.target.result;
            if (imageType === 'back') uploadedBackImage = e.target.result;
            if (imageType === 'bg') uploadedBgImageData = e.target.result;
            generateTemplate();
        };
        reader.readAsDataURL(file);
    }
}

function triggerDownload(content, filename) {
    if (!content) return;
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function renderAndDownloadPNG(svgString, filename) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
        img.onload = () => { URL.revokeObjectURL(url); resolve(); };
        img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        img.src = url;
    });

    const widthMatch = svgString.match(/width="(\d+(\.\d+)?)/);
    const heightMatch = svgString.match(/height="(\d+(\.\d+)?)/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 300;
    const dpi = 300;
    const scale = dpi / 25.4; // mm to inches
    canvas.width = Math.round(svgWidth * scale);
    canvas.height = Math.round(svgHeight * scale);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function generateAndDownloadCutout() {
    if (!svgForDesign) return;
    
    const designWithWhiteBg = svgForDesign.replace('<svg', '<svg style="background-color: white;"');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([designWithWhiteBg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
        img.onload = () => { URL.revokeObjectURL(url); resolve(); };
        img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        img.src = url;
    });

    const widthMatch = svgForDesign.match(/width="(\d+(\.\d+)?)/);
    const heightMatch = svgForDesign.match(/height="(\d+(\.\d+)?)/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 300;
    const dpi = 300;
    const scale = dpi / 25.4;
    canvas.width = Math.round(svgWidth * scale);
    canvas.height = Math.round(svgHeight * scale);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const isWhite = data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
        if (isWhite) {
            data[i + 3] = 0; // Make transparent
        } else {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255; // Make black
        }
    }
    ctx.putImageData(imageData, 0, 0);

    const pngDataUrl = canvas.toDataURL('image/png');
    const format = exportFormatSelect.value;
    const filenameBase = projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-template';
    const filename = `${filenameBase}_cutout.${format}`;

    if (format === 'png') {
        const a = document.createElement('a');
        a.href = pngDataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else { // SVG
        const pathData = svgForDesign.match(/<path[^>]+d="([^ "]+)"/)[1];
        const finalMaskSvg = `<svg width="${svgWidth.toFixed(2)}mm" height="${svgHeight.toFixed(2)}mm" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><clipPath id="mugClipPath"><path d="${pathData}" /></clipPath></defs><image href="${pngDataUrl}" x="0" y="0" width="${svgWidth}" height="${svgHeight}" clip-path="url(#mugClipPath)" /></svg>`;
        triggerDownload(finalMaskSvg, filename);
    }
}

function updateControlsVisibility() {
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    bgNoneControls.classList.toggle('hidden', selectedBgType !== 'transparent');
    bgColorControls.classList.toggle('hidden', selectedBgType !== 'color');
    bgImageControls.classList.toggle('hidden', selectedBgType !== 'image');
    
    const selectedFaceType = document.querySelector('input[name="faceArtType"]:checked').value;
    faceImageControls.classList.toggle('hidden', selectedFaceType !== 'image');
    faceTextControls.classList.toggle('hidden', selectedFaceType !== 'text');
    
    const selectedBackType = document.querySelector('input[name="backArtType"]:checked').value;
    backImageControls.classList.toggle('hidden', selectedBackType !== 'image');
    backTextControls.classList.toggle('hidden', selectedBackType !== 'text');
    
    generateTemplate();
}

// --- Attach Event Listeners ---
const allInputs = [projectNameInput, heightInput, diameterInput, handleAreaWidthInput, bgColorPicker, exportFormatSelect, faceTextInput, faceColorPicker, backTextInput, backColorPicker];
allInputs.forEach(input => input.addEventListener('input', generateTemplate));

[faceFontSelect, backFontSelect].forEach(sel => sel.addEventListener('change', generateTemplate));

projectNameInput.addEventListener('input', function() { this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, ''); });

[...bgTypeRadios, ...faceArtTypeRadios, ...backArtTypeRadios].forEach(radio => radio.addEventListener('change', updateControlsVisibility));

uploadFaceBtn.addEventListener('click', () => faceImageInput.click());
faceImageInput.addEventListener('change', (e) => handleImageUpload(e, 'face'));
flipFaceHBtn.addEventListener('click', () => { isFaceFlippedH = !isFaceFlippedH; generateTemplate(); });
flipFaceVBtn.addEventListener('click', () => { isFaceFlippedV = !isFaceFlippedV; generateTemplate(); });
rotateFaceLBtn.addEventListener('click', () => { faceRotation = (faceRotation - 90 + 360) % 360; generateTemplate(); });
rotateFaceRBtn.addEventListener('click', () => { faceRotation = (faceRotation + 90) % 360; generateTemplate(); });

uploadBackBtn.addEventListener('click', () => backImageInput.click());
backImageInput.addEventListener('change', (e) => handleImageUpload(e, 'back'));
flipBackHBtn.addEventListener('click', () => { isBackFlippedH = !isBackFlippedH; generateTemplate(); });
flipBackVBtn.addEventListener('click', () => { isBackFlippedV = !isBackFlippedV; generateTemplate(); });
rotateBackLBtn.addEventListener('click', () => { backRotation = (backRotation - 90 + 360) % 360; generateTemplate(); });
rotateBackRBtn.addEventListener('click', () => { backRotation = (backRotation + 90) % 360; generateTemplate(); });
backBoldBtn.addEventListener('click', () => { isBackBold = !isBackBold; generateTemplate(); });
backItalicBtn.addEventListener('click', () => { isBackItalic = !isBackItalic; generateTemplate(); });
backUnderlineBtn.addEventListener('click', () => { isBackUnderline = !isBackUnderline; generateTemplate(); });
backStrikethroughBtn.addEventListener('click', () => { isBackStrikethrough = !isBackStrikethrough; generateTemplate(); });

bgUploadBtn.addEventListener('click', () => bgImageUploadInput.click());
bgImageUploadInput.addEventListener('change', (e) => handleImageUpload(e, 'bg'));

downloadDesignBtn.addEventListener('click', () => {
    const format = exportFormatSelect.value;
    const filenameBase = projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-template';
    const filename = `${filenameBase}.${format}`;
    if (format === 'svg') {
        triggerDownload(svgForDesign, filename);
    } else {
        renderAndDownloadPNG(svgForDesign, filename);
    }
});

downloadCutoutBtn.addEventListener('click', generateAndDownloadCutout);

// Initial setup
function prefetchAllFonts() {
    googleFonts.forEach(font => {
        getFontDataURL(font);
    });
}

googleFonts.forEach(font => {
    const option1 = new Option(font, font);
    const option2 = new Option(font, font);
    faceFontSelect.add(option1);
    backFontSelect.add(option2);
});

// Pre-fetch all fonts on startup
prefetchAllFonts();
updateControlsVisibility();
