import { state } from './config.js';
// === IMAGE COMPRESSION ===
const COMPRESSION_LIMIT = 8 * 1024 * 1024; // 8MB

export async function compressImage(file, maxSizeBytes = COMPRESSION_LIMIT) {
    // If file is already under the limit, return as-is
    if (file.size <= maxSizeBytes) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Safari-specific image loading check
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                console.warn('Safari image loading issue, retrying...');
                setTimeout(() => img.onload(), 100);
                return;
            }
            
            // Calculate compression ratio based on file size
            const compressionRatio = Math.min(1, Math.sqrt(maxSizeBytes / file.size));
            
            // Resize image dimensions (conservative on mobile)
            const maxWidth = 2048;
            const maxHeight = 2048;
            
            let { width, height } = img;
            
            // Scale down if image is too large
            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                if (width > height) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                } else {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                }
            }
            
            // Apply additional compression ratio if needed
            width = Math.round(width * compressionRatio);
            height = Math.round(height * compressionRatio);
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Start with high quality and reduce if needed
            let quality = 0.85;
            let compressedDataUrl;
            
            do {
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                quality -= 0.05;
            } while (compressedDataUrl.length > maxSizeBytes * 1.37 && quality > 0.3); // 1.37 accounts for base64 overhead
            
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedDataUrl.length / 1024 / 1024 * 0.75).toFixed(1)}MB`);
            resolve(compressedDataUrl);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}


// === BACKGROUND REMOVAL ===
export function removeImageBackground(imageType) {
    let imageData = null;
    if (imageType === 'face') {
        imageData = state.uploadedFaceImage;
    } else if (imageType === 'back') {
        imageData = state.uploadedBackImage;
    } else if (imageType === 'bg') {
        imageData = state.uploadedBgImageData;
    }
    if (!imageData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = canvasImageData.data;
        
        // Simple background removal: make similar colors to corners transparent
        // Sample corner colors to determine likely background
        const cornerSamples = [
            {r: data[0], g: data[1], b: data[2]}, // top-left
            {r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2]}, // top-right
            {r: data[(canvas.height - 1) * canvas.width * 4], g: data[(canvas.height - 1) * canvas.width * 4 + 1], b: data[(canvas.height - 1) * canvas.width * 4 + 2]}, // bottom-left
            {r: data[((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4], g: data[((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4 + 1], b: data[((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4 + 2]} // bottom-right
        ];
        
        // Use the most common corner color as background
        const bgColor = cornerSamples[0]; // Simplified: use top-left corner
        const tolerance = 30; // Adjust tolerance for background detection
        
        // Remove background pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if pixel is similar to background color
            const colorDiff = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            if (colorDiff < tolerance) {
                data[i + 3] = 0; // Make transparent
            }
        }
        
        ctx.putImageData(canvasImageData, 0, 0);
        
        // Convert back to data URL and update state
        const processedDataUrl = canvas.toDataURL('image/png');
        
        if (imageType === 'face') {
            state.uploadedFaceImage = processedDataUrl;
        } else if (imageType === 'back') {
            state.uploadedBackImage = processedDataUrl;
        } else if (imageType === 'bg') {
            state.uploadedBgImageData = processedDataUrl;
        }
        
        // Regenerate template
        if (window.generateTemplate) {
            window.generateTemplate();
        }
    };
    
    img.src = imageData;
}

export function svgToPng(svgString) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!svgString || typeof svgString !== 'string') {
                reject(new Error('svgToPng: svgString must be a non-empty string'));
                return;
            }

            // Ensure fonts are ready before rasterizing SVG
            try {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }
            } catch (_) {
                // Ignore font readiness errors; continue best-effort
            }

            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = async () => {
                try {
                    // Small delay to help ensure font application inside SVG (Safari/Firefox quirks)
                    await new Promise(r => setTimeout(r, 100));

                    // Determine SVG dimensions
                    const widthMatch = svgString.match(/width="([^\"]+)"/);
                    const heightMatch = svgString.match(/height="([^\"]+)"/);
                    const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);

                    let widthStr = widthMatch ? widthMatch[1] : '';
                    let heightStr = heightMatch ? heightMatch[1] : '';

                    let canvasWidth;
                    let canvasHeight;

                    const parseDimension = (dimStr) => {
                        if (!dimStr) return null;
                        const isMm = /mm\b/i.test(dimStr);
                        const numeric = parseFloat(dimStr.replace(/[^0-9.\-]/g, ''));
                        if (Number.isNaN(numeric)) return null;
                        return { value: numeric, unit: isMm ? 'mm' : 'px' };
                    };

                    const parsedW = parseDimension(widthStr);
                    const parsedH = parseDimension(heightStr);

                    if (parsedW && parsedH) {
                        if (parsedW.unit === 'mm' || parsedH.unit === 'mm') {
                            // Treat as millimeters at 300 DPI
                            const dpi = 300;
                            const scale = dpi / 25.4; // mm -> px
                            canvasWidth = Math.max(1, Math.round(parsedW.value * scale));
                            canvasHeight = Math.max(1, Math.round(parsedH.value * scale));
                        } else {
                            // Pixels
                            canvasWidth = Math.max(1, Math.round(parsedW.value));
                            canvasHeight = Math.max(1, Math.round(parsedH.value));
                        }
                    } else if (viewBoxMatch) {
                        const vb = viewBoxMatch[1].trim().split(/\s+/).map(Number);
                        const vbWidth = vb[2] || img.naturalWidth || 800;
                        const vbHeight = vb[3] || img.naturalHeight || 300;
                        canvasWidth = Math.max(1, Math.round(vbWidth));
                        canvasHeight = Math.max(1, Math.round(vbHeight));
                    } else {
                        // Fallback to image intrinsic or sensible defaults
                        canvasWidth = img.naturalWidth || 800;
                        canvasHeight = img.naturalHeight || 300;
                    }

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    // Optional: white background to avoid transparent background if SVG lacks one
                    // Comment out if transparency is desired by default
                    // ctx.fillStyle = '#ffffff';
                    // ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(url);
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('svgToPng: Failed to create PNG blob'));
                        }
                    }, 'image/png');
                } catch (err) {
                    URL.revokeObjectURL(url);
                    reject(err);
                }
            };

            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };

            img.src = url;
        } catch (error) {
            reject(error);
        }
    });
}

export function flipPngHorizontally(pngBlob) {
    return new Promise((resolve, reject) => {
        try {
            if (!pngBlob) {
                reject(new Error('flipPngHorizontally: input is required'));
                return;
            }

            const img = new Image();
            let objectUrl = null;

            const cleanup = () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                }
            };

            img.onload = () => {
                try {
                    const width = img.naturalWidth || img.width;
                    const height = img.naturalHeight || img.height;

                    if (!width || !height) {
                        cleanup();
                        reject(new Error('flipPngHorizontally: invalid image dimensions'));
                        return;
                    }

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;

                    // Preserve transparency and flip horizontally
                    ctx.clearRect(0, 0, width, height);
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        cleanup();
                        if (blob) {
                            resolve(blob);
                            return;
                        }
                        // Fallback if toBlob returns null (older browsers)
                        try {
                            const dataUrl = canvas.toDataURL('image/png');
                            const parts = dataUrl.split(',');
                            const mime = parts[0].match(/:(.*?);/)[1];
                            const binary = atob(parts[1]);
                            const len = binary.length;
                            const arrayBuffer = new ArrayBuffer(len);
                            const bytes = new Uint8Array(arrayBuffer);
                            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                            resolve(new Blob([arrayBuffer], { type: mime }));
                        } catch (err) {
                            reject(err);
                        }
                    }, 'image/png');
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            };

            img.onerror = () => {
                cleanup();
                reject(new Error('flipPngHorizontally: failed to load image'));
            };

            if (pngBlob instanceof Blob) {
                objectUrl = URL.createObjectURL(pngBlob);
                img.src = objectUrl;
            } else if (typeof pngBlob === 'string') {
                // Assume data URL or regular URL
                img.src = pngBlob;
            } else {
                reject(new Error('flipPngHorizontally: expected a Blob or data URL string'));
            }
        } catch (e) {
            reject(e);
        }
    });
}