// mobile-support.js - Mobile browser optimization and support

// === MOBILE DETECTION ===
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Mobile viewport detection
const isMobileViewport = () => window.innerWidth <= 768;

// === MOBILE OPTIMIZATION INITIALIZATION ===
export function initMobileSupport() {
    if (!isMobile && !isTouchDevice && !isMobileViewport()) return;
    
    console.log('Mobile device detected, applying optimizations...');
    
    // Apply all mobile optimizations
    optimizeViewport();
    optimizeUI();
    optimizeScrolling();
    
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
