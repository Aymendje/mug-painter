// font-manager.js - Font loading, caching, and embedding functionality

import { state, dom, GOOGLE_FONTS } from './config.js';

// === FONT DATA URL FETCHING ===
export async function getFontDataURL(fontFamily) {
    if (state.fontCache[fontFamily]) return state.fontCache[fontFamily];
    
    try {
        const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400&display=swap`;
        const css = await fetch(url).then(res => res.text());
        const fontUrlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
        
        if (!fontUrlMatch) return null;
        
        const fontUrl = fontUrlMatch[1];
        const fontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer());
        const base64 = btoa(new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const dataUrl = `data:font/woff2;base64,${base64}`;
        
        state.fontCache[fontFamily] = dataUrl;
        return dataUrl;
    } catch (e) { 
        console.error("Could not fetch font", e); 
        return null; 
    }
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

    // Fetch font data URLs for all fonts to load
    const stylePromises = Array.from(fontsToLoad).map(async font => {
        const dataUrl = await getFontDataURL(font);
        return dataUrl ? `@font-face { font-family: '${font}'; src: url(${dataUrl}); }` : null;
    });

    const styleRules = (await Promise.all(stylePromises)).filter(Boolean);
    
    if (styleRules.length > 0) {
        // Update dynamic styles
        let styleEl = document.getElementById('dynamic-font-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-font-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = styleRules.join('\n');
        
        // Load fonts into browser font system
        const fontLoadPromises = Array.from(fontsToLoad).map(font => 
            document.fonts.load(`12px "${font}"`)
        );
        await Promise.all(fontLoadPromises).catch(err => 
            console.error("Font loading error:", err)
        );
    }
    
    return `<style>${styleRules.join(' ')}</style>`;
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
    GOOGLE_FONTS.forEach(font => {
        getFontDataURL(font);
    });
}
