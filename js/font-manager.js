// font-manager.js - Font loading, caching, and embedding functionality

import { state, dom, GOOGLE_FONTS } from './config.js';

// === FONT DATA URL FETCHING (SIMPLIFIED FOR CORS) ===
export async function getFontDataURL(fontFamily) {
    // For SVG export, we'll rely on the browser's loaded fonts rather than embedding
    // This avoids CORS issues while still providing font support
    return null; // Return null to use browser fonts
}

// === FONT LOADING AND EMBEDDING ===
export async function loadAndEmbedFonts() {
    const fontsToLoad = new Set();
    
    // Check if face text is using a font
    if (document.querySelector('input[name="faceArtType"]:checked').value === 'text' && dom.faceTextInput.value.trim()) {
        fontsToLoad.add(state.selectedFaceFont);
    }
    
    // Check if back text is using a font
    if (document.querySelector('input[name="backArtType"]:checked').value === 'text' && dom.backTextInput.value.trim()) {
        fontsToLoad.add(state.selectedBackFont);
    }
    
    if (fontsToLoad.size === 0) return '';

    // Load fonts into browser font system (using already loaded Google Fonts)
    const fontLoadPromises = Array.from(fontsToLoad).map(font => 
        document.fonts.load(`12px "${font}"`).catch(err => {
            console.warn(`Could not load font ${font}:`, err);
            return null;
        })
    );
    
    await Promise.all(fontLoadPromises);
    
    // For SVG export, create a style block that references the Google Fonts
    // This tells the SVG to use the fonts loaded via link tags in the HTML
    if (fontsToLoad.size > 0) {
        const fontImports = Array.from(fontsToLoad).map(font => 
            `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400&display=swap');`
        ).join('\n');
        
        return `<style><![CDATA[${fontImports}]]></style>`;
    }
    
    return '';
}

// === GOOGLE FONTS LOADING ===
export function loadGoogleFonts() {
    GOOGLE_FONTS.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    });
}

// === FONT PRE-FETCHING ===
export function prefetchAllFonts() {
    // Pre-load fonts using the browser's font loading API
    GOOGLE_FONTS.forEach(font => {
        document.fonts.load(`12px "${font}"`).catch(err => {
            // Ignore errors - font may not be available yet
            console.log(`Font ${font} will be loaded when needed`);
        });
    });
}
