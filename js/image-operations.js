
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
    const imageData = imageType === 'face' ? state.uploadedFaceImage : state.uploadedBackImage;
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
        } else {
            state.uploadedBackImage = processedDataUrl;
        }
        
        // Regenerate template
        if (window.generateTemplate) {
            window.generateTemplate();
        }
    };
    
    img.src = imageData;
}