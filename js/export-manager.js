// export-manager.js - Export functionality for SVG, PNG, PDF, and cutout files

import { state, dom } from './config.js';
import { collectProjectData } from './project-manager.js';
import { safariImageLoad, safariWaitForFonts, safariPdfFix } from './safari-fixes.js';
import { getMobileOptimizedCanvasSize, isMobileDevice, getMobileCompressionLimit, hideMobileLoadingIndicator } from './mobile-support.js';
import { getProjectMetadata } from './template-generator.js';
import { canvasToPngWithMetadata } from './png-manager.js';
import { compressImage } from './image-operations.js';

// === BASIC FILE DOWNLOAD TRIGGER ===
export function triggerDownload(content, filename) {
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

// === PNG EXPORT ===
export async function renderAndDownloadPNG(svgString, filename) {
    // Wait for all fonts to be ready before export (with Safari fixes)
    await document.fonts.ready;
    await safariWaitForFonts();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
        img.onload = async () => { 
            // Additional delay to ensure fonts are applied in SVG
            await new Promise(resolve => setTimeout(resolve, 100));
            URL.revokeObjectURL(url); 
            resolve(); 
        };
        img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        img.src = url;
    });

    // Get SVG dimensions
    const widthMatch = svgString.match(/width="(\d+(\.\d+)?)/);
    const heightMatch = svgString.match(/height="(\d+(\.\d+)?)/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 300;
    
    // Convert to high-resolution canvas (mobile-optimized DPI)
    const dpi = 300; // Lower DPI for mobile
    const scale = dpi / 25.4; // mm to inches
    let canvasWidth = Math.round(svgWidth * scale);
    let canvasHeight = Math.round(svgHeight * scale);
    
    // Apply mobile canvas size limits
    const mobileOptimized = getMobileOptimizedCanvasSize(canvasWidth, canvasHeight);
    canvas.width = mobileOptimized.width;
    canvas.height = mobileOptimized.height;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Add project data if requested
    let finalFilename = filename;
    const projectMetadata = getProjectMetadata();

    // TODO embed projectMetadata in PNG
    const outBlob = await canvasToPngWithMetadata(
        canvas,
        "projectMetadata",
        projectMetadata // make sure this is a string; stringify if it's an object
      );

    // Download PNG
    const pngUrl = URL.createObjectURL(outBlob);
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// === PDF EXPORT ===  
export async function renderAndDownloadPDF(svgString, filename) {
    // Wait for all fonts to be ready before export (with Safari fixes)
    await document.fonts.ready;
    await safariWaitForFonts();
    
    // Letter size in horizontal orientation: 11" x 8.5" (279.4mm x 215.9mm)
    // Minimum margins: 6.3mm on all sides
    const { jsPDF } = window.jspdf;
    const safariOptions = safariPdfFix();
    const pdf = new jsPDF({
        orientation: 'landscape', // horizontal orientation
        unit: 'mm',
        format: 'letter', // 8.5x11 inches
        compress: false, // Safari-specific compression setting
        ...safariOptions
    });
    
    // Letter size dimensions in landscape: width=279.4mm, height=215.9mm
    const pageWidth = 279.4;
    const pageHeight = 215.9;
    const margin = 6.3; // minimum margin 6.3mm on all sides
    
    // Calculate available space for content
    const maxContentWidth = pageWidth - (2 * margin);
    const maxContentHeight = pageHeight - (2 * margin);
    
    // Get SVG dimensions
    const widthMatch = svgString.match(/width="([^"]+)"/);
    const heightMatch = svgString.match(/height="([^"]+)"/);
    const svgWidthStr = widthMatch ? widthMatch[1].replace('mm', '') : '800';
    const svgHeightStr = heightMatch ? heightMatch[1].replace('mm', '') : '300';
    const svgWidth = parseFloat(svgWidthStr);
    const svgHeight = parseFloat(svgHeightStr);

    // Try using addSvgAsImage for vector SVG embedding (smaller file size, better quality)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
        img.onload = async () => { 
            // Additional delay to ensure fonts are applied in SVG
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Calculate scale to fit within available space while maintaining aspect ratio
            const scaleX = maxContentWidth / svgWidth;
            const scaleY = maxContentHeight / svgHeight;
            const scale = Math.min(scaleX, scaleY);
            
            const finalWidth = svgWidth * scale;
            const finalHeight = svgHeight * scale;
            
            // Optimized resolution for PDF (150 DPI for good quality but smaller file size)
            const dpi = 150;
            const pdfScale = dpi / 25.4; // mm to pixels at 150 DPI
            canvas.width = Math.round(svgWidth * pdfScale);
            canvas.height = Math.round(svgHeight * pdfScale);
            
            // Draw SVG to canvas with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to PNG for highest quality
            const imageDataUrl = canvas.toDataURL('image/png');
            
            // Add image to PDF at top-left position (with margin)
            pdf.addImage(imageDataUrl, 'PNG', margin, margin, finalWidth, finalHeight);
            
            // Add project data to PDF if requested (fallback method)
            let finalFilename = filename;
            if (dom.includeProjectDataCheckbox?.checked) {
                try {
                    // Add project data as PDF metadata
                    pdf.setProperties({
                        title: `Mug Painter - ${dom.projectNameInput.value || 'Unnamed'}`,
                        subject: 'Mug Wrap Template',
                        creator: 'Mug Painter',
                        keywords: getProjectMetadata()
                    });
                    } catch (error) {
                    console.warn('Could not embed project data in PDF fallback:', error);
                }
            }
            
            // Save the PDF
            pdf.save(finalFilename);
            
            URL.revokeObjectURL(url); 
            resolve(); 
        };
        img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        img.src = url;
    });
}

// === EXTERIOR-ONLY SVG CREATION ===
function createExteriorOnlySVG() {
    // Extract the main path (exterior outline) from the original SVG
    const pathMatch = state.svgForDesign.match(/<path[^>]+d="([^"]+)"[^>]*>/);
    if (!pathMatch) {
        console.error('Could not find main path in SVG');
        return state.svgForDesign; // Fallback to full SVG
    }
    
    // Get SVG dimensions and viewBox
    const widthMatch = state.svgForDesign.match(/width="([^"]+)"/);
    const heightMatch = state.svgForDesign.match(/height="([^"]+)"/);
    const viewBoxMatch = state.svgForDesign.match(/viewBox="([^"]+)"/);
    
    const width = widthMatch ? widthMatch[1] : '800';
    const height = heightMatch ? heightMatch[1] : '300';
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${parseFloat(width)} ${parseFloat(height)}`;
    
    // Create a minimal SVG with only the exterior path on white background
    const exteriorOnlySVG = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
        <path d="${pathMatch[1]}" fill="black" stroke="none"/>
    </svg>`;
    
    return exteriorOnlySVG;
}

// === CUTOUT GENERATION AND DOWNLOAD ===
export async function generateAndDownloadCutout() {
    if (!state.svgForDesign) return;
    
    // Wait for all fonts to be ready before export
    await document.fonts.ready;
    
    // Check if exterior-only mode is enabled
    const exteriorOnlyMode = document.getElementById('exteriorOnlyMode')?.checked || false;
    
    if (exteriorOnlyMode) {
        // For exterior-only, export pure SVG vector path without rasterization
        const exteriorOnlySVG = createExteriorOnlySVG();
        const filename = `${dom.projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-cutout'}-exterior.svg`;
        triggerDownload(exteriorOnlySVG, filename);
        return;
    }
    
    // For full cutout with artwork, we still need to rasterize to create the mask
    let svgForCutout = state.svgForDesign.replace('<svg', '<svg style="background-color: white;"');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgForCutout], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
        img.onload = async () => { 
            // Additional delay to ensure fonts are applied in SVG
            await new Promise(resolve => setTimeout(resolve, 100));
            URL.revokeObjectURL(url); 
            resolve(); 
        };
        img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
        img.src = url;
    });

    // Get SVG dimensions
    const widthMatch = state.svgForDesign.match(/width="(\d+(\.\d+)?)/);
    const heightMatch = state.svgForDesign.match(/height="(\d+(\.\d+)?)/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 300;
    
    // High-resolution canvas
    const dpi = 300;
    const scale = dpi / 25.4;
    canvas.width = Math.round(svgWidth * scale);
    canvas.height = Math.round(svgHeight * scale);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Process image data to create cutout mask (white becomes transparent, non-white becomes black)
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
    const format = dom.exportFormatSelect.value;
    const filenameBase = dom.projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-template';
    const cutoutType = exteriorOnlyMode ? 'exterior' : 'cutout';
    const filename = `${filenameBase}_${cutoutType}.${format}`;

    if (format === 'png') {
        // Direct PNG download
        const a = document.createElement('a');
        a.href = pngDataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (format === 'pdf') {
        // Create PDF with cutout
        await createCutoutPDF(pngDataUrl, filename, svgWidth, svgHeight);
    } else { // SVG
        // Create SVG cutout with clipping path
        await createCutoutSVG(pngDataUrl, filename, svgWidth, svgHeight);
    }
}

// === CUTOUT PDF CREATION ===
async function createCutoutPDF(pngDataUrl, filename, svgWidth, svgHeight) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
    });
    
    const margin = 6.3;
    const pageWidth = 279.4;
    const pageHeight = 215.9;
    const maxContentWidth = pageWidth - (2 * margin);
    const maxContentHeight = pageHeight - (2 * margin);
    
    // Calculate scale to fit cutout image
    const scaleX = maxContentWidth / svgWidth;
    const scaleY = maxContentHeight / svgHeight;
    const scale = Math.min(scaleX, scaleY);
    const finalWidth = svgWidth * scale;
    const finalHeight = svgHeight * scale;
    
    pdf.addImage(pngDataUrl, 'PNG', margin, margin, finalWidth, finalHeight);
    pdf.save(filename);
}

// === CUTOUT SVG CREATION ===
async function createCutoutSVG(pngDataUrl, filename, svgWidth, svgHeight) {
    // Extract path data from original SVG for clipping
    const pathMatch = state.svgForDesign.match(/<path[^>]+d="([^"]+)"/);
    if (!pathMatch) {
        console.error('Could not find path data in SVG');
        return;
    }
    
    const pathData = pathMatch[1];
    const finalMaskSvg = `<svg width="${svgWidth.toFixed(2)}mm" height="${svgHeight.toFixed(2)}mm" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><clipPath id="mugClipPath"><path d="${pathData}" /></clipPath></defs><image href="${pngDataUrl}" x="0" y="0" width="${svgWidth}" height="${svgHeight}" clip-path="url(#mugClipPath)" /></svg>`;
    
    triggerDownload(finalMaskSvg, filename);
}


// === IMAGE UPLOAD HANDLER ===
export async function handleImageUpload(event, imageType) {
    const file = event.target.files[0];
    if (file) {
        // Check if uploaded file is SVG
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
            // For SVG files, read as text to preserve vector data
            const reader = new FileReader();
            reader.onload = (e) => {
                const svgContent = e.target.result;
                // Store both the raw SVG content and a flag indicating it's vector
                const vectorData = {
                    type: 'svg',
                    content: svgContent,
                    dataUrl: `data:image/svg+xml;base64,${btoa(svgContent)}`
                };
                
                if (imageType === 'face') {
                    state.uploadedFaceImage = vectorData.dataUrl;
                    // SVG background removal not supported, keep button disabled
                } else if (imageType === 'back') {
                    state.uploadedBackImage = vectorData.dataUrl;
                    // SVG background removal not supported, keep button disabled
                } else if (imageType === 'bg') {
                    state.uploadedBgImageData = vectorData.dataUrl;
                }
                
                if (window.generateTemplate) {
                    window.generateTemplate();
                }
            };
            reader.readAsText(file);
        } else {
            // For raster images, compress if needed
            const compressionLimit = getMobileCompressionLimit();
            const isLargeFile = file.size > compressionLimit;
            
            if (isLargeFile) {
                // Show compression notice
                console.log(`Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). Compressing...`);
                
                // Show mobile loading indicator for large files on mobile
                if (isMobileDevice()) {
                    window.showMobileLoadingIndicator?.('Processing large image...');
                }
            }
            
            try {
                const imageDataUrl = await compressImage(file);
                
                // Hide mobile loading indicator
                if (isMobileDevice()) {
                    hideMobileLoadingIndicator();
                }
                
                if (imageType === 'face') {
                    state.uploadedFaceImage = imageDataUrl;
                    // Enable background removal button for raster images
                    if (dom.removeBackgroundFaceBtn) {
                        dom.removeBackgroundFaceBtn.disabled = false;
                    }
                } else if (imageType === 'back') {
                    state.uploadedBackImage = imageDataUrl;
                    // Enable background removal button for raster images
                    if (dom.removeBackgroundBackBtn) {
                        dom.removeBackgroundBackBtn.disabled = false;
                    }
                } else if (imageType === 'bg') {
                    state.uploadedBgImageData = imageDataUrl;
                }
                
                if (window.generateTemplate) {
                    window.generateTemplate();
                }
                
                // Update background removal button states
                if (window.updateBackgroundRemovalButtons) {
                    window.updateBackgroundRemovalButtons();
                }
                
            } catch (error) {
                console.error('Error processing image:', error);
                
                // Hide mobile loading indicator on error
                if (isMobileDevice()) {
                    hideMobileLoadingIndicator();
                }
                
                if (isMobileDevice()) {
                    alert('Unable to process image on this device. Please try a smaller file.');
                } else {
                    alert('Error processing image. Please try a different file.');
                }
            }
        }
    }
}
