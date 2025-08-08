// mobile-support.js - Mobile browser optimization and support

// === MOBILE DETECTION ===
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Mobile viewport detection
const isMobileViewport = () => window.innerWidth <= 768;

// === MOBILE OPTIMIZATION INITIALIZATION ===
export function initMobileSupport() {
    if (!isMobile && !isTouchDevice && !isMobileViewport()) return;
    
    console.log('Mobile device detected, applying optimizations...');
    
    // Apply all mobile optimizations
    optimizeViewport();
    optimizePerformance();
    optimizeUI();
    optimizeFileHandling();
    optimizeCanvas();
    optimizeScrolling();
    addMobileFallbacks();
    
    // Listen for orientation changes
    setupOrientationHandling();
    
    // Setup responsive behavior
    setupResponsiveUpdates();
    
    console.log('Mobile optimizations applied');
}

// === VIEWPORT OPTIMIZATION ===
function optimizeViewport() {
    // Ensure proper viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
    }
    
    // Mobile-optimized viewport settings
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    
    // Prevent zoom on form inputs (iOS Safari)
    if (isIOS) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.style.fontSize) {
                input.style.fontSize = '16px';
            }
        });
    }
}

// === PERFORMANCE OPTIMIZATION ===
function optimizePerformance() {
    // Reduce canvas resolution on mobile for better performance
    window.mobileCanvasScale = isMobile ? 0.75 : 1.0;
    
    // Limit 3D rendering quality on mobile
    window.mobile3DQuality = isMobile ? 'low' : 'high';
    
    // Debounce resize events for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.handleResize) {
                window.handleResize();
            }
        }, 150);
    });
    
    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Update any scroll-dependent elements
            updateScrollElements();
        }, 100);
    }, { passive: true });
}

// === UI OPTIMIZATION ===
function optimizeUI() {
    // Add mobile-specific classes
    document.body.classList.add('mobile-optimized');
    if (isTouchDevice) document.body.classList.add('touch-device');
    if (isIOS) document.body.classList.add('ios-device');
    if (isAndroid) document.body.classList.add('android-device');
    
    // Optimize button sizes for touch
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        if (isMobile) {
            button.style.minHeight = '44px'; // iOS guideline
            button.style.minWidth = '44px';
        }
    });
    
    // Optimize form controls
    const formControls = document.querySelectorAll('input, select, textarea');
    formControls.forEach(control => {
        if (isMobile) {
            control.style.minHeight = '44px';
            // Prevent zoom on focus (Android)
            if (isAndroid) {
                control.addEventListener('focus', () => {
                    control.style.fontSize = '16px';
                });
            }
        }
    });
    
    // Add touch-friendly spacing
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (isMobileViewport()) {
            card.style.padding = '1rem';
            card.style.margin = '0.5rem 0';
        }
    });
}

// === FILE HANDLING OPTIMIZATION ===
function optimizeFileHandling() {
    // Reduce image compression threshold on mobile
    window.mobileCompressionLimit = 2 * 1024 * 1024; // 2MB instead of 5MB
    
    // Add mobile-specific file input handling
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        // Add accept attributes for better mobile camera integration
        if (input.accept && input.accept.includes('image/')) {
            input.setAttribute('capture', 'environment'); // Use rear camera by default
        }
        
        // Handle mobile file selection
        input.addEventListener('change', (event) => {
            if (isMobile && event.target.files.length > 0) {
                const file = event.target.files[0];
                // Show loading indicator for large files
                if (file.size > 1024 * 1024) { // 1MB
                    showMobileLoadingIndicator('Processing image...');
                }
            }
        });
    });
}

// === CANVAS OPTIMIZATION ===
function optimizeCanvas() {
    // Override canvas creation for mobile optimization
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'canvas' && isMobile) {
            // Limit canvas size on mobile
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'width' || name === 'height') {
                    const numValue = parseInt(value);
                    if (numValue > 2048) {
                        value = '2048'; // Limit to 2048px on mobile
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        
        return element;
    };
}

// === SCROLLING OPTIMIZATION ===
function optimizeScrolling() {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add momentum scrolling for iOS
    if (isIOS) {
        document.body.style.webkitOverflowScrolling = 'touch';
    }
    
    // Optimize sticky elements for mobile
    const stickyElements = document.querySelectorAll('.md\\:sticky');
    stickyElements.forEach(element => {
        if (isMobileViewport()) {
            // Disable sticky on small screens to save space
            element.style.position = 'static';
            element.classList.add('mobile-static');
        }
    });
}

// === MOBILE FALLBACKS ===
function addMobileFallbacks() {
    // 3D view fallback for low-power devices
    if (isMobile) {
        const view3DBtn = document.getElementById('view3DBtn');
        if (view3DBtn) {
            view3DBtn.addEventListener('click', (e) => {
                // Check if device can handle 3D
                if (!canHandle3D()) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('3D view is disabled on this device for better performance. Please use the 2D view.');
                    return false;
                }
            });
        }
    }
    
    // Add download fallbacks
    addMobileDownloadFallbacks();
}

// === ORIENTATION HANDLING ===
function setupOrientationHandling() {
    const handleOrientationChange = () => {
        setTimeout(() => {
            // Update viewport height for mobile browsers
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Trigger resize events
            if (window.handleResize) {
                window.handleResize();
            }
            
            // Update 3D canvas if visible
            if (window.resize3DCanvas) {
                window.resize3DCanvas();
            }
        }, 300); // Delay to let orientation change complete
    };
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Initial call
    handleOrientationChange();
}

// === RESPONSIVE UPDATES ===
function setupResponsiveUpdates() {
    const updateResponsiveElements = () => {
        const isMobileView = isMobileViewport();
        
        // Update navigation
        const nav = document.querySelector('nav, .navigation');
        if (nav) {
            nav.classList.toggle('mobile-nav', isMobileView);
        }
        
        // Update grid layouts
        const grids = document.querySelectorAll('.grid, .flex');
        grids.forEach(grid => {
            if (isMobileView) {
                grid.classList.add('mobile-stack');
            } else {
                grid.classList.remove('mobile-stack');
            }
        });
    };
    
    // Initial call
    updateResponsiveElements();
    
    // Update on resize
    window.addEventListener('resize', updateResponsiveElements);
}

// === UTILITY FUNCTIONS ===
function canHandle3D() {
    // Check if device can handle 3D rendering
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;
    
    // Check for minimum performance requirements
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    // Block known low-performance renderers
    const lowPerformancePatterns = [
        /adreno.*3\d\d/i, // Old Adreno GPUs
        /mali.*4\d\d/i,   // Old Mali GPUs
        /powervr.*54/i    // Old PowerVR GPUs
    ];
    
    return !lowPerformancePatterns.some(pattern => 
        pattern.test(renderer) || pattern.test(vendor)
    );
}

function showMobileLoadingIndicator(message) {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'mobile-loading';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 10000;
        font-size: 18px;
    `;
    
    overlay.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <div>${message}</div>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 10000);
    
    return overlay;
}

export function hideMobileLoadingIndicator() {
    const overlay = document.getElementById('mobile-loading');
    if (overlay) {
        overlay.remove();
    }
}

function addMobileDownloadFallbacks() {
    // Override download function for better mobile support
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function(object) {
        const url = originalCreateObjectURL.call(this, object);
        
        // Add mobile-specific handling
        if (isMobile) {
            setTimeout(() => {
                // Clean up URLs more aggressively on mobile
                try {
                    URL.revokeObjectURL(url);
                } catch (e) {
                    // Ignore errors
                }
            }, 5000); // 5 second cleanup
        }
        
        return url;
    };
}

function updateScrollElements() {
    // Update any elements that depend on scroll position
    const scrollY = window.scrollY;
    
    // Update sticky elements on mobile
    const mobileSticky = document.querySelectorAll('.mobile-static');
    mobileSticky.forEach(element => {
        if (scrollY > 100) {
            element.classList.add('scrolled');
        } else {
            element.classList.remove('scrolled');
        }
    });
}

// === MOBILE-SPECIFIC EXPORT FUNCTIONS ===
export function getMobileOptimizedCanvasSize(width, height) {
    if (!isMobile) return { width, height };
    
    const maxSize = 1536; // Max dimension for mobile
    const scale = Math.min(1, maxSize / Math.max(width, height));
    
    return {
        width: Math.round(width * scale),
        height: Math.round(height * scale)
    };
}

export function isMobileDevice() {
    return isMobile || isTouchDevice || isMobileViewport();
}

export function getMobileCompressionLimit() {
    return isMobile ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB vs 5MB
}