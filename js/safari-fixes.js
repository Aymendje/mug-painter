// safari-fixes.js - Safari-specific compatibility fixes

// === BROWSER DETECTION ===
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod|Safari/.test(navigator.userAgent) && !window.MSStream;

// === SAFARI FIXES INITIALIZATION ===
export function initSafariFixes() {
    if (!isSafari && !isIOS) return;
    
    console.log('Safari/iOS detected, applying compatibility fixes...');
    
    // Apply all Safari fixes
    fixFontLoading();
    fixSVGRendering();
    fixCanvasOperations();
    fixFileInputs();
    fixScrolling();
    fixTouchEvents();
    fixRadioLabels();
    
    console.log('Safari compatibility fixes applied');
}

// === RADIO LABEL CLICK FIX ===
function fixRadioLabels() {
    // iOS Safari sometimes fails to trigger a 'change' event when a label is clicked.
    if (!isIOS) return;

    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        const input = label.querySelector('input[type="radio"], input[type="checkbox"]');
        if (input) {
            label.addEventListener('click', (e) => {
                // Prevent default to avoid double-firing on some devices.
                e.preventDefault();

                // Manually trigger the 'click' on the input to ensure the 'change' event fires.
                if (input.checked !== true) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    });
}

// === FONT LOADING FIXES ===
function fixFontLoading() {
    // Safari has issues with document.fonts.ready timing
    if (document.fonts && document.fonts.ready) {
        // Do not reassign document.fonts.ready as it is readonly in Safari.
        // Extra readiness checks/delays are handled by safariWaitForFonts() where needed.
        void document.fonts.ready.catch(() => {});
    }
    
    // Ensure Google Fonts are properly loaded in Safari
    const linkElements = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    linkElements.forEach(link => {
        link.setAttribute('crossorigin', 'anonymous');
    });
}

// === SVG RENDERING FIXES ===
function fixSVGRendering() {
    // Safari sometimes has issues with SVG viewBox and dimensions
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'svg' || (node.querySelectorAll && node.querySelectorAll('svg').length > 0)) {
                        // Force Safari to recalculate SVG dimensions
                        const svgs = node.nodeName === 'svg' ? [node] : node.querySelectorAll('svg');
                        svgs.forEach(svg => {
                            if (svg.getAttribute('width') && svg.getAttribute('height')) {
                                // Force reflow in Safari
                                svg.style.width = svg.getAttribute('width');
                                svg.style.height = svg.getAttribute('height');
                            }
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// === CANVAS OPERATION FIXES ===
function fixCanvasOperations() {
    // Safari has issues with large canvas operations
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
        try {
            // Safari memory limit workaround
            if (this.width * this.height > 16777216) { // 4096x4096
                console.warn('Large canvas detected, applying Safari memory workaround');
                
                // Create smaller temporary canvas
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                // Scale down for Safari
                const scale = Math.sqrt(16777216 / (this.width * this.height));
                tempCanvas.width = Math.floor(this.width * scale);
                tempCanvas.height = Math.floor(this.height * scale);
                
                tempCtx.drawImage(this, 0, 0, tempCanvas.width, tempCanvas.height);
                return originalToDataURL.call(tempCanvas, type, quality);
            }
            
            return originalToDataURL.call(this, type, quality);
        } catch (error) {
            console.error('Safari canvas export error:', error);
            throw error;
        }
    };
}

// === FILE INPUT FIXES ===
function fixFileInputs() {
    // Safari has issues with file input change events
    document.addEventListener('change', (event) => {
        if (event.target.type === 'file' && isSafari) {
            // Force Safari to properly trigger file processing
            setTimeout(() => {
                if (event.target.files.length > 0) {
                    // Ensure file is properly loaded
                    const file = event.target.files[0];
                    if (file.size === 0) {
                        console.warn('Safari file loading issue detected, retrying...');
                        // Trigger change event again
                        setTimeout(() => {
                            event.target.dispatchEvent(new Event('change', { bubbles: true }));
                        }, 100);
                    }
                }
            }, 50);
        }
    });
}

// === SCROLLING FIXES ===
function fixScrolling() {
    // Safari iOS has issues with scrolling and fixed positioning
    if (isIOS) {
        // Fix for sticky elements on iOS
        const stickyElements = document.querySelectorAll('.md\\:sticky');
        stickyElements.forEach(element => {
            element.style.position = 'relative'; // Fallback for iOS
            element.classList.add('ios-sticky-fix');
        });
        
        // Add CSS for iOS sticky fix
        const style = document.createElement('style');
        style.textContent = `
            @supports (-webkit-overflow-scrolling: touch) {
                .ios-sticky-fix {
                    position: -webkit-sticky !important;
                    position: sticky !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// === TOUCH EVENT FIXES ===
function fixTouchEvents() {
    if (isIOS) {
        // Fix for touch events on iOS Safari
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        // Prevent zoom on double tap for better UX
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

// === SAFARI-SPECIFIC IMAGE LOADING ===
export function safariImageLoad(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        // Safari-specific image loading with fallbacks
        img.onload = () => {
            // Additional Safari check to ensure image is actually loaded
            if (isSafari && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                setTimeout(() => {
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                        resolve(img);
                    } else {
                        reject(new Error('Safari image loading failed'));
                    }
                }, 100);
            } else {
                resolve(img);
            }
        };
        
        img.onerror = reject;
        
        // Safari sometimes needs explicit crossorigin
        if (src.startsWith('http')) {
            img.crossOrigin = 'anonymous';
        }
        
        img.src = src;
    });
}

// === SAFARI FONT CHECK ===
export function safariWaitForFonts() {
    if (!isSafari) return Promise.resolve();
    
    return new Promise((resolve) => {
        // Safari-specific font loading check
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkFonts = () => {
            attempts++;
            
            // Check if fonts are loaded by measuring text width
            const testElement = document.createElement('div');
            testElement.style.cssText = `
                position: absolute;
                visibility: hidden;
                font-family: 'Roboto', sans-serif;
                font-size: 100px;
                width: auto;
                height: auto;
                line-height: normal;
                margin: 0;
                padding: 0;
                white-space: nowrap;
            `;
            testElement.textContent = 'Test';
            document.body.appendChild(testElement);
            
            const width = testElement.offsetWidth;
            document.body.removeChild(testElement);
            
            // If width is reasonable (not fallback font), fonts are loaded
            if (width > 200 || attempts >= maxAttempts) {
                resolve();
            } else {
                setTimeout(checkFonts, 20);
            }
        };
        
        checkFonts();
    });
}

// === SAFARI PDF EXPORT FIX ===
export function safariPdfFix() {
    if (!isSafari) return {};
    
    return {
        // Safari-specific jsPDF settings
        compress: false, // Safari has issues with PDF compression
        precision: 2,    // Reduced precision for Safari
    };
}