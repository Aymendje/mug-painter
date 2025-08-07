// config.js - Global configuration, constants, and DOM element references

// === CONSTANTS ===
export const GOOGLE_FONTS = [
    "Roboto",
    "Open Sans",
    "Lato",
    "Source Sans Pro",
    "Slabo 27px",
    "Raleway",
    "PT Sans", 
    "Merriweather",
    "Caveat",
    "Inter",
    "Montserrat",
    "Playfair Display",
    "Oswald",
    "Pacifico",
    "Comfortaa",
    "Lobster",
    "Cormorant Garamond",
    "Amatic SC",
    "Anton",
    "Abril Fatface",
    "Permanent Marker",
    "Rock Salt",
    "Creepster",
    "Nosifier"
];

// === GLOBAL STATE ===
export const state = {
    // SVG and design state
    svgForDesign: '',
    
    // Face artwork state
    uploadedFaceImage: null,
    isFaceFlippedH: false,
    isFaceFlippedV: false,
    faceRotation: 0,
    
    // Back artwork state
    uploadedBackImage: null,
    isBackFlippedH: false,
    isBackFlippedV: false,
    backRotation: 0,
    
    // Background state
    uploadedBgImageData: null,
    
    // Text formatting states - Face
    isFaceBold: false,
    isFaceItalic: false,
    isFaceUnderline: false,
    isFaceStrikethrough: false,
    isFaceContour: false,
    
    // Text formatting states - Back
    isBackBold: false,
    isBackItalic: false,
    isBackUnderline: false,
    isBackStrikethrough: false,
    isBackContour: false,
    
    // Font selection
    selectedFaceFont: 'Roboto',
    selectedBackFont: 'Roboto',
    
    // Font cache
    fontCache: {},
    
    // 3D Scene state
    scene: null,
    camera: null,
    renderer: null,
    mugMesh: null,
    controls: null,
    isCurrentView3D: false,
    animationId: null,
    
    // Dropdown initialization
    dropdownsInitialized: false
};

// === DOM ELEMENTS ===
export const dom = {
    // Project controls
    projectNameInput: document.getElementById('projectName'),
    
    // Dimension inputs
    heightInput: document.getElementById('mugHeight'),
    diameterInput: document.getElementById('mugDiameter'),
    handleAreaWidthInput: document.getElementById('handleAreaWidth'),
    
    // Preview containers
    svgContainer: document.getElementById('svg-container'),
    infoDiv: document.getElementById('info'),
    svgPreview: document.getElementById('svg-preview'),
    threeCanvas: document.getElementById('three-canvas'),
    
    // Face artwork controls
    faceArtTypeRadios: document.querySelectorAll('input[name="faceArtType"]'),
    faceImageControls: document.getElementById('face-image-controls'),
    uploadFaceBtn: document.getElementById('uploadFaceBtn'),
    faceImageInput: document.getElementById('faceImageInput'),
    flipFaceHBtn: document.getElementById('flipFaceHBtn'),
    flipFaceVBtn: document.getElementById('flipFaceVBtn'),
    rotateFaceLBtn: document.getElementById('rotateFaceLBtn'),
    rotateFaceRBtn: document.getElementById('rotateFaceRBtn'),
    
    // Face text controls
    faceTextControls: document.getElementById('face-text-controls'),
    faceTextInput: document.getElementById('faceTextInput'),
    faceFontSelect: document.getElementById('faceFontSelect'),
    faceColorPicker: document.getElementById('faceColorPicker'),
    faceBoldBtn: document.getElementById('faceBoldBtn'),
    faceItalicBtn: document.getElementById('faceItalicBtn'),
    faceUnderlineBtn: document.getElementById('faceUnderlineBtn'),
    faceStrikethroughBtn: document.getElementById('faceStrikethroughBtn'),
    faceContourBtn: document.getElementById('faceContourBtn'),
    faceContourControls: document.getElementById('face-contour-controls'),
    faceContourColorPicker: document.getElementById('faceContourColorPicker'),
    
    // Back artwork controls
    backArtTypeRadios: document.querySelectorAll('input[name="backArtType"]'),
    backImageControls: document.getElementById('back-image-controls'),
    uploadBackBtn: document.getElementById('uploadBackBtn'),
    backImageInput: document.getElementById('backImageInput'),
    flipBackHBtn: document.getElementById('flipBackHBtn'),
    flipBackVBtn: document.getElementById('flipBackVBtn'),
    rotateBackLBtn: document.getElementById('rotateBackLBtn'),
    rotateBackRBtn: document.getElementById('rotateBackRBtn'),
    
    // Back text controls
    backTextControls: document.getElementById('back-text-controls'),
    backTextInput: document.getElementById('backTextInput'),
    backFontSelect: document.getElementById('backFontSelect'),
    backColorPicker: document.getElementById('backColorPicker'),
    backBoldBtn: document.getElementById('backBoldBtn'),
    backItalicBtn: document.getElementById('backItalicBtn'),
    backUnderlineBtn: document.getElementById('backUnderlineBtn'),
    backStrikethroughBtn: document.getElementById('backStrikethroughBtn'),
    backContourBtn: document.getElementById('backContourBtn'),
    backContourControls: document.getElementById('back-contour-controls'),
    backContourColorPicker: document.getElementById('backContourColorPicker'),
    
    // Background controls
    bgTypeRadios: document.querySelectorAll('input[name="backgroundType"]'),
    bgColorControls: document.getElementById('bg-color-controls'),
    bgColorPicker: document.getElementById('bgColorPicker'),
    bgImageControls: document.getElementById('bg-image-controls'),
    bgUploadBtn: document.getElementById('bgUploadBtn'),
    bgImageUploadInput: document.getElementById('bgImageUpload'),
    bgImageStyle: document.getElementById('bgImageStyle'),
    bgImageSize: document.getElementById('bgImageSize'),
    bgNoneControls: document.getElementById('bg-none-controls'),
    
    // Export controls
    exportFormatSelect: document.getElementById('exportFormat'),
    downloadDesignBtn: document.getElementById('downloadDesignBtn'),
    downloadCutoutBtn: document.getElementById('downloadCutoutBtn'),
    includeProjectDataCheckbox: document.getElementById('includeProjectData'),
    loadProjectBtn: document.getElementById('loadProjectBtn'),
    loadProjectInput: document.getElementById('loadProjectInput'),
    
    // 3D view controls
    view2DBtn: document.getElementById('view2DBtn'),
    view3DBtn: document.getElementById('view3DBtn')
};

// Helper function to get font selector elements with null checks
export function getFontSelectorElements() {
    const faceSelect = dom.faceFontSelect;
    const backSelect = dom.backFontSelect;
    
    return {
        face: {
            trigger: faceSelect?.querySelector('.custom-select-trigger'),
            options: faceSelect?.querySelector('.custom-options'),
            text: faceSelect?.querySelector('.custom-select-trigger span')
        },
        back: {
            trigger: backSelect?.querySelector('.custom-select-trigger'),
            options: backSelect?.querySelector('.custom-options'),
            text: backSelect?.querySelector('.custom-select-trigger span')
        }
    };
}
