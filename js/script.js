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
const faceFontTrigger = faceFontSelect.querySelector('.custom-select-trigger');
const faceFontOptions = faceFontSelect.querySelector('.custom-options');
const faceFontText = faceFontTrigger.querySelector('span');
const faceColorPicker = document.getElementById('faceColorPicker');
const faceBoldBtn = document.getElementById('faceBoldBtn');
const faceItalicBtn = document.getElementById('faceItalicBtn');
const faceUnderlineBtn = document.getElementById('faceUnderlineBtn');
const faceStrikethroughBtn = document.getElementById('faceStrikethroughBtn');
const faceContourBtn = document.getElementById('faceContourBtn');
const faceContourControls = document.getElementById('face-contour-controls');
const faceContourColorPicker = document.getElementById('faceContourColorPicker');

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
const backFontTrigger = backFontSelect.querySelector('.custom-select-trigger');
const backFontOptions = backFontSelect.querySelector('.custom-options');
const backFontText = backFontTrigger.querySelector('span');
const backColorPicker = document.getElementById('backColorPicker');
const backBoldBtn = document.getElementById('backBoldBtn');
const backItalicBtn = document.getElementById('backItalicBtn');
const backUnderlineBtn = document.getElementById('backUnderlineBtn');
const backStrikethroughBtn = document.getElementById('backStrikethroughBtn');
const backContourBtn = document.getElementById('backContourBtn');
const backContourControls = document.getElementById('back-contour-controls');
const backContourColorPicker = document.getElementById('backContourColorPicker');

// Background Controls
const bgTypeRadios = document.querySelectorAll('input[name="backgroundType"]');
const bgColorControls = document.getElementById('bg-color-controls');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgImageControls = document.getElementById('bg-image-controls');
const bgUploadBtn = document.getElementById('bgUploadBtn');
const bgImageUploadInput = document.getElementById('bgImageUpload');
const bgImageStyle = document.getElementById('bgImageStyle');
const bgImageSize = document.getElementById('bgImageSize');
const bgNoneControls = document.getElementById('bg-none-controls');

// Export Controls
const exportFormatSelect = document.getElementById('exportFormat');
const downloadDesignBtn = document.getElementById('downloadDesignBtn');
const downloadCutoutBtn = document.getElementById('downloadCutoutBtn');
const includeProjectDataCheckbox = document.getElementById('includeProjectData');
const loadProjectBtn = document.getElementById('loadProjectBtn');
const loadProjectInput = document.getElementById('loadProjectInput');

// 3D Controls
const view2DBtn = document.getElementById('view2DBtn');
const view3DBtn = document.getElementById('view3DBtn');
const threeCanvas = document.getElementById('three-canvas');
const svgPreview = document.getElementById('svg-preview');

// Global variables
let svgForDesign = '';
let uploadedFaceImage = null, isFaceFlippedH = false, isFaceFlippedV = false, faceRotation = 0;
let uploadedBackImage = null, isBackFlippedH = false, isBackFlippedV = false, backRotation = 0;
let uploadedBgImageData = null;
// Text formatting states
let isFaceBold = false, isFaceItalic = false, isFaceUnderline = false, isFaceStrikethrough = false, isFaceContour = false;
let isBackBold = false, isBackItalic = false, isBackUnderline = false, isBackStrikethrough = false, isBackContour = false;
// Font selection values
let selectedFaceFont = 'Roboto';
let selectedBackFont = 'Roboto';
const fontCache = {};
const googleFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Slabo 27px", "Raleway", "PT Sans", "Merriweather", "Lobster", "Pacifico", "Caveat"];

// 3D Scene Variables
let scene, camera, renderer, mugMesh, controls;
let isCurrentView3D = false;
let animationId = null;

// --- 3D Scene Functions ---
function init3DScene() {
    // Create scene
    scene = new THREE.Scene();
    
    // Get canvas dimensions first
    const canvasWidth = threeCanvas.clientWidth || 400;
    const canvasHeight = threeCanvas.clientHeight || 400;
    
    // Create checkered background texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Simple fixed checker size for visibility
    const checkSize = 16; // Fixed size checkers
    
    const color1 = '#f8fafc'; // Light gray
    const color2 = '#e2e8f0'; // Darker gray for better contrast
    
    // Clear canvas first
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw checkers
    for (let x = 0; x < canvas.width; x += checkSize) {
        for (let y = 0; y < canvas.height; y += checkSize) {
            const isEven = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0;
            if (!isEven) {
                ctx.fillStyle = color2;
                ctx.fillRect(x, y, checkSize, checkSize);
            }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Much bigger squares - only 2x2 repeat
    
    console.log('Checkered background created');
    
    scene.background = texture;
    
    // Create camera
    const aspect = canvasWidth / canvasHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: threeCanvas, 
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    // Enable shadows for realistic look
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add realistic lighting with shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // Position light higher and more to the front for better inner cavity illumination
    directionalLight.position.set(2, 8, 4);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    // Tighten shadow camera bounds for better resolution
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
    scene.add(directionalLight);
    
    // Add basic rotation without OrbitControls
    let mouseX = 0, mouseY = 0;
    let isMouseDown = false;
    
    threeCanvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    threeCanvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    threeCanvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        if (mugMesh) {
            mugMesh.rotation.y += deltaX * 0.01;
            mugMesh.rotation.x += deltaY * 0.01;
        }
        
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Handle canvas resize
    const resizeObserver = new ResizeObserver(() => {
        if (renderer && camera) {
            const width = threeCanvas.clientWidth;
            const height = threeCanvas.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });
    resizeObserver.observe(threeCanvas);
    
    // Force initial render
    renderer.render(scene, camera);
}

function create3DMugGeometry(height, diameter, handleWidth) {
    // Convert mm to scene units (scale down more for visibility)
    const scaleToScene = 0.03;
    const mugHeight = height * scaleToScene;
    const mugRadius = (diameter / 2) * scaleToScene;
    const handleDepth = handleWidth * scaleToScene;
    
    // Ceramic thickness (4mm in scene units)
    const ceramicThickness = 4 * scaleToScene;
    
    // Create a proper hollow mug with thick ceramic walls
    // We'll create the outer wall, inner wall, and bottom separately then merge
    
    const outerRadius = mugRadius;
    const outerTopRadius = mugRadius * 0.9;
    const innerRadius = mugRadius - ceramicThickness;
    const innerTopRadius = outerTopRadius - ceramicThickness;
    
    // Create outer wall
    const outerWall = new THREE.CylinderGeometry(
        outerTopRadius,   // top radius
        outerRadius,      // bottom radius
        mugHeight,        // height
        32, 1, true       // radial segments, height segments, open ended (no caps)
    );
    
    // Create inner wall (reversed normals to face inward)
    const innerWall = new THREE.CylinderGeometry(
        innerTopRadius,   // top radius
        innerRadius,      // bottom radius
        mugHeight - ceramicThickness, // shorter to not go through bottom
        32, 1, true       // open ended
    );
    
    // Position inner wall up to create bottom thickness
    innerWall.translate(0, ceramicThickness / 2, 0);
    
    // Create bottom as a solid disk (no hole in center)
    const bottomGeometry = new THREE.CircleGeometry(
        outerRadius,      // radius - full bottom
        32               // segments
    );
    
    // Rotate bottom to face downward and position at bottom of mug
    bottomGeometry.rotateX(Math.PI / 2); // Rotate so normals point downward
    bottomGeometry.translate(0, -mugHeight / 2, 0);
    
    // Also create a second bottom facing upward (inside the mug) for double-sided
    const bottomGeometry2 = new THREE.CircleGeometry(
        innerRadius,      // radius - should match inner cavity
        32               // segments
    );
    
    // This one faces upward (inside the mug) and positioned at the ceramic thickness level
    bottomGeometry2.rotateX(-Math.PI / 2); // Rotate so normals point upward
    bottomGeometry2.translate(0, -mugHeight / 2 + ceramicThickness, 0);
    
    // Keep outer wall separate from inner parts
    const outerWallGeometry = outerWall;
    
    // Merge inner wall and bottom geometries (parts that shouldn't have texture)
    const innerPartsGeometry = new THREE.BufferGeometry();
    
    // Get vertex data for inner parts only
    const innerPositions = innerWall.attributes.position.array;
    const bottomPositions = bottomGeometry.attributes.position.array;
    const bottom2Positions = bottomGeometry2.attributes.position.array;
    
    const innerUVs = innerWall.attributes.uv.array;
    const bottomUVs = bottomGeometry.attributes.uv.array;
    const bottom2UVs = bottomGeometry2.attributes.uv.array;
    
    const innerIndices = innerWall.index ? innerWall.index.array : [];
    const bottomIndices = bottomGeometry.index ? bottomGeometry.index.array : [];
    const bottom2Indices = bottomGeometry2.index ? bottomGeometry2.index.array : [];
    
    // Combine inner parts positions
    const innerTotalPositions = new Float32Array(
        innerPositions.length + bottomPositions.length + bottom2Positions.length
    );
    const innerTotalUVs = new Float32Array(
        innerUVs.length + bottomUVs.length + bottom2UVs.length
    );
    
    let innerOffset = 0;
    innerTotalPositions.set(innerPositions, innerOffset);
    innerTotalUVs.set(innerUVs, innerOffset / 3 * 2);
    innerOffset += innerPositions.length;
    
    innerTotalPositions.set(bottomPositions, innerOffset);
    innerTotalUVs.set(bottomUVs, innerOffset / 3 * 2);
    innerOffset += bottomPositions.length;
    
    innerTotalPositions.set(bottom2Positions, innerOffset);
    innerTotalUVs.set(bottom2UVs, innerOffset / 3 * 2);
    
    // Combine inner parts indices with proper offsets
    const innerTotalIndices = [];
    let innerVertexOffset = 0;
    
    // Inner wall indices (reversed to face inward)
    if (innerIndices.length > 0) {
        for (let i = 0; i < innerIndices.length; i += 3) {
            innerTotalIndices.push(innerIndices[i + 2] + innerVertexOffset);
            innerTotalIndices.push(innerIndices[i + 1] + innerVertexOffset);
            innerTotalIndices.push(innerIndices[i] + innerVertexOffset);
        }
    }
    innerVertexOffset += innerPositions.length / 3;
    
    // Bottom indices
    if (bottomIndices.length > 0) {
        for (let i = 0; i < bottomIndices.length; i++) {
            innerTotalIndices.push(bottomIndices[i] + innerVertexOffset);
        }
    }
    innerVertexOffset += bottomPositions.length / 3;
    
    // Second bottom indices
    if (bottom2Indices.length > 0) {
        for (let i = 0; i < bottom2Indices.length; i++) {
            innerTotalIndices.push(bottom2Indices[i] + innerVertexOffset);
        }
    }
    
    // Set inner parts geometry attributes
    innerPartsGeometry.setAttribute('position', new THREE.BufferAttribute(innerTotalPositions, 3));
    innerPartsGeometry.setAttribute('uv', new THREE.BufferAttribute(innerTotalUVs, 2));
    innerPartsGeometry.setIndex(innerTotalIndices);
    innerPartsGeometry.computeVertexNormals();
    
    // Create handle using torus geometry for a realistic C-shaped handle
    const handleOuterRadius = mugHeight / 3.0; // Handle height proportional to mug
    const handleTubeRadius = Math.max(ceramicThickness, handleDepth * 0.4);  // Handle thickness (at least as thick as ceramic)
    
    const handleGeometry = new THREE.TorusGeometry(
        handleOuterRadius,  // radius of the torus
        handleTubeRadius,   // tube radius (thickness)
        8,                  // radial segments
        16,                 // tubular segments  
        Math.PI       // arc length (more than half circle for C-shape)
    );
    
    // Position and orient the handle
    handleGeometry.rotateZ(Math.PI / 2); // Rotate to vertical orientation
    handleGeometry.rotateY(Math.PI / 2); // Face outward from mug
    
    // Position handle at the back where SVG seam meets
    // In cylindrical UV mapping, the seam is typically at angle 0 (positive X-axis)
    // But we want the handle at the back (opposite side from the front design)
    // So we position it at angle PI (negative X-axis)
    const handleX = 0;
    console.log("handleX", handleX);
    const handleY = 0; // Center vertically
    const handleZ = mugRadius - ceramicThickness;
    handleGeometry.translate(handleX, handleY, handleZ);
    
    // Create mug lip (torus at the top bridging outer and inner walls)
    const lipMajorRadius = (outerTopRadius + innerTopRadius) / 2; // Middle between outer and inner at top
    const lipMinorRadius = (outerTopRadius - innerTopRadius) / 2; // Half the gap between outer and inner
    
    const lipGeometry = new THREE.TorusGeometry(
        lipMajorRadius,     // major radius (distance from center of mug to center of torus tube)
        lipMinorRadius,     // minor radius (thickness of the torus tube)
        8,                  // radial segments
        32                  // tubular segments
    );
    
    // Position the lip at the top of the mug
    lipGeometry.rotateX(Math.PI / 2); // Face outward from mug
    lipGeometry.translate(0, mugHeight / 2, 0);
    
    // Create group to hold all geometries
    const mugGroup = new THREE.Group();
    
    // Create meshes with basic materials (will be updated with proper materials later)
    const outerWallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const innerPartsMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const lipMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const outerWallMesh = new THREE.Mesh(outerWallGeometry, outerWallMaterial);
    const innerPartsMesh = new THREE.Mesh(innerPartsGeometry, innerPartsMaterial);
    const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
    const lipMesh = new THREE.Mesh(lipGeometry, lipMaterial);
    
    // Mark meshes for identification
    outerWallMesh.name = 'outerWall';
    innerPartsMesh.name = 'innerParts';
    handleMesh.name = 'handle';
    lipMesh.name = 'lip';
    
    // Add all to group
    mugGroup.add(outerWallMesh);
    mugGroup.add(innerPartsMesh);
    mugGroup.add(handleMesh);
    mugGroup.add(lipMesh);
    
    return mugGroup;
}

async function createMugTexture() {
    console.log('Creating mug texture...');
    
    if (!svgForDesign) {
        console.warn('No SVG design available for texture');
        return null;
    }
    
    // Create a clean version of SVG without main template path stroke for 3D texture
    // Only remove stroke from the main path element (template outline), keep text and other elements intact
    const svg3D = svgForDesign.replace(
        /stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/g,
        'stroke="none"'
    );
    
    // Create a canvas to render SVG as texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for texture (power of 2 for WebGL)
    canvas.width = 1024;
    canvas.height = 512;
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svg3D], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
        img.onload = () => {
            console.log('SVG loaded for texture');
            
            // Draw SVG to canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Create Three.js texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            
            URL.revokeObjectURL(url);
            console.log('Texture created successfully');
            resolve(texture);
        };
        
        img.onerror = (err) => {
            console.error('Error loading SVG for texture:', err);
            URL.revokeObjectURL(url);
            resolve(null);
        };
        
        img.src = url;
    });
}

async function update3DMug() {
    if (!isCurrentView3D || !scene) {
        console.log('Not in 3D view or no scene');
        return;
    }
    
    console.log('Updating 3D mug...');
    
    const height = parseFloat(heightInput.value);
    const diameter = parseFloat(diameterInput.value);
    const handleWidth = parseFloat(handleAreaWidthInput.value);
    
    // Remove existing mug
    if (mugMesh) {
        scene.remove(mugMesh);
        if (mugMesh.geometry) mugMesh.geometry.dispose();
        if (mugMesh.material) mugMesh.material.dispose();
    }
    
    // Create new mug geometry (returns a Group with body and handle)
    mugMesh = create3DMugGeometry(height, diameter, handleWidth);
    
    // Create texture from current SVG
    let texture = null;
    try {
        texture = await createMugTexture();
    } catch (err) {
        console.error('Error creating texture:', err);
    }
    
    // Apply materials to all meshes in the group
    mugMesh.traverse((child) => {
        if (child.isMesh) {
            // Apply texture only to outer wall
            if (texture && child.name === 'outerWall') {
                child.material = new THREE.MeshLambertMaterial({
                    color: 0xffffff,
                    map: texture
                });
                // Outer wall casts and receives shadows
                child.castShadow = true;
                child.receiveShadow = true;
            } else if (child.name === 'innerParts') {
                // Inner parts get plain white material (no texture)
                child.material = new THREE.MeshLambertMaterial({
                    color: 0xffffff
                });
                // Inner parts cast shadows on each other but don't cast external shadows
                child.castShadow = true;
                child.receiveShadow = true;
            } else if (child.name === 'lip') {
                // Lip gets plain white material (no texture)
                child.material = new THREE.MeshLambertMaterial({
                    color: 0xffffff
                });
                // Lip casts and receives shadows
                child.castShadow = true;
                child.receiveShadow = true;
            } else {
                // Handle gets plain white material
                child.material = new THREE.MeshLambertMaterial({
                    color: 0xffffff
                });
                // Handle casts shadows
                child.castShadow = true;
                child.receiveShadow = true;
            }
        }
    });
    
    scene.add(mugMesh);
}

function animate3D() {
    if (!isCurrentView3D) return;
    
    animationId = requestAnimationFrame(animate3D);
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function switch2DView() {
    isCurrentView3D = false;
    
    // Cancel animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Show 2D, hide 3D
    svgContainer.style.display = 'flex';
    threeCanvas.classList.add('hidden');
    
    // Update button states
    view2DBtn.classList.remove('btn-secondary');
    view2DBtn.classList.add('btn-primary');
    view3DBtn.classList.remove('btn-primary');
    view3DBtn.classList.add('btn-secondary');
    
    // Regenerate 2D template
    generateTemplate();
}

function switch3DView() {
    // Check if THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded');
        alert('3D functionality requires Three.js to be loaded. Please refresh the page.');
        return;
    }
    
    isCurrentView3D = true;
    
    // Always reinitialize 3D scene to avoid state issues
    if (scene) {
        // Clean up existing scene
        if (mugMesh) {
            scene.remove(mugMesh);
        }
        if (renderer) {
            renderer.dispose();
        }
        scene = null;
        camera = null;
        renderer = null;
        mugMesh = null;
    }
    
    // Initialize fresh 3D scene
    init3DScene();
    
    // Hide 2D, show 3D
    svgContainer.style.display = 'none';
    threeCanvas.classList.remove('hidden');
    
    // Update button states
    view3DBtn.classList.remove('btn-secondary');
    view3DBtn.classList.add('btn-primary');
    view2DBtn.classList.remove('btn-primary');
    view2DBtn.classList.add('btn-secondary');
    
    // Update 3D mug and start animation
    update3DMug();
    animate3D();
}

// --- Main Generation Function ---
async function generateTemplate() {
    // 1. Get user inputs & dimensions
    const mainHeight = parseFloat(heightInput.value);
    const diameter = parseFloat(diameterInput.value);
    const areaWidth = parseFloat(handleAreaWidthInput.value) * 0.5 * 1.5;
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

    // 5. Create background area (only for main cylindrical section, not handle areas)
    const bgAreaX = areaWidth;
    const bgAreaWidth = width - (2 * areaWidth);
    const bgAreaHeight = mainHeight;
    const backgroundPath = `M ${bgAreaX.toFixed(2)} 0 L ${(bgAreaX + bgAreaWidth).toFixed(2)} 0 L ${(bgAreaX + bgAreaWidth).toFixed(2)} ${bgAreaHeight.toFixed(2)} L ${bgAreaX.toFixed(2)} ${bgAreaHeight.toFixed(2)} Z`;

    // 6. Determine background fill
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    let defs = fontDefsForSVG || '';
    let backgroundElement = '';
    
    // Always include checkerboard pattern for preview
    defs += `<pattern id="checkerboard" patternUnits="userSpaceOnUse" width="20" height="20"><rect width="10" height="10" x="0" y="0" fill="#e2e8f0" /><rect width="10" height="10" x="10" y="0" fill="#f1f5f9" /><rect width="10" height="10" x="0" y="10" fill="#f1f5f9" /><rect width="10" height="10" x="10" y="10" fill="#e2e8f0" /></pattern>`;

    if (selectedBgType === 'image' && uploadedBgImageData) {
        const image = new Image();
        image.src = uploadedBgImageData;
        await new Promise(resolve => { image.onload = resolve; });

        const style = bgImageStyle.value;
        const size = bgImageSize.value;
        let imageTag = '';

        let w = image.width;
        let h = image.height;

        switch (size) {
            case 'xs': h = mainHeight / 8; w = image.width * (h / image.height); break;
            case 's': h = mainHeight / 4; w = image.width * (h / image.height); break;
            case 'm': h = mainHeight / 2; w = image.width * (h / image.height); break;
            case 'l': h = mainHeight * 0.9; w = image.width * (h / image.height); break;
            case 'xl': h = mainHeight * 2; w = image.width * (h / image.height); break;
        }

        if (style === 'tile') {
            const pattern = `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><image href="${uploadedBgImageData}" x="0" y="0" width="${w}" height="${h}"/></pattern>`;
            defs += pattern;
            backgroundElement = `<path d="${backgroundPath}" fill="url(#bgPattern)"/>`;
        } else {
            let x = bgAreaX, y = 0;
            let imgWidth = w, imgHeight = h;
            let preserveAspectRatio = 'none';
            if (style === 'fit') {
                preserveAspectRatio = 'xMidYMid meet';
                imgWidth = bgAreaWidth;
                imgHeight = mainHeight;
            } else if (style === 'fill') {
                preserveAspectRatio = 'xMidYMid slice';
                imgWidth = bgAreaWidth;
                imgHeight = mainHeight;
            } else if (style === 'center') {
                x = bgAreaX + (bgAreaWidth - w) / 2;
                y = (mainHeight - h) / 2;
            } else if (style === 'stretch') {
                imgWidth = bgAreaWidth;
                imgHeight = mainHeight;
            }
            imageTag = `<image href="${uploadedBgImageData}" x="${x}" y="${y}" width="${imgWidth}" height="${imgHeight}" preserveAspectRatio="${preserveAspectRatio}"/>`;
            const bgPattern = `<pattern id="bgPattern" patternUnits="userSpaceOnUse" width="${bgAreaWidth.toFixed(2)}" height="${mainHeight.toFixed(2)}">${imageTag}</pattern>`;
            defs += bgPattern;
            backgroundElement = `<path d="${backgroundPath}" fill="url(#bgPattern)"/>`;
        }
    } else if (selectedBgType === 'color') {
        backgroundElement = `<path d="${backgroundPath}" fill="${bgColorPicker.value}"/>`;
    } else { // Transparent
        // For transparent background, don't create a background element (will be handled in preview separately)
        backgroundElement = '';
    }
    
    // 7. Assemble SVGs with optional project metadata
    let projectMetadata = '';
    if (includeProjectDataCheckbox.checked) {
        const projectData = collectProjectData();
        projectMetadata = `<!--MUG_PAINTER_PROJECT_DATA:${btoa(JSON.stringify(projectData))}:END_PROJECT_DATA-->`;
    }
    
    const finalDefs = defs ? `<defs>${defs}</defs>` : '';
    
    // For preview: always show full checkerboard background as base layer for all modes
    const svgContentForPreview = `<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" fill="url(#checkerboard)" stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${backgroundElement}${faceArtTag}${backArtTag}<rect x="${faceBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/><rect x="${backBoxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight.toFixed(2)}" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="4 4"/></svg>`;
    
    // For download version: main path is always transparent, background only in cylindrical area when not transparent
    const downloadBackgroundElement = selectedBgType === 'transparent' ? '' : backgroundElement;
    svgForDesign = `${projectMetadata}<svg width="${width.toFixed(2)}mm" height="${mainHeight.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(2)} ${mainHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${finalDefs}<path d="${pathData}" fill="none" stroke="#1e293b" stroke-width="2" vector-effect="non-scaling-stroke"/>${downloadBackgroundElement}${faceArtTag}${backArtTag}</svg>`;
    
    // 8. Update UI
    svgContainer.innerHTML = svgContentForPreview;
    infoDiv.innerHTML = `Calculated Circumference: <strong class="text-indigo-600">${width.toFixed(2)} mm</strong><br>Total Template Size: <strong class="text-indigo-600">${width.toFixed(2)} x ${mainHeight.toFixed(2)} mm</strong>`;
    downloadDesignBtn.disabled = false;
    downloadCutoutBtn.disabled = false;
    
    // 9. Update 3D view if active
    if (isCurrentView3D) {
        update3DMug();
    }
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
        const font = type === 'face' ? selectedFaceFont : selectedBackFont;
        const color = type === 'face' ? faceColorPicker.value : backColorPicker.value;
        
        // Get formatting states
        const isBold = type === 'face' ? isFaceBold : isBackBold;
        const isItalic = type === 'face' ? isFaceItalic : isBackItalic;
        const isUnderline = type === 'face' ? isFaceUnderline : isBackUnderline;
        const isStrikethrough = type === 'face' ? isFaceStrikethrough : isBackStrikethrough;
        const isContour = type === 'face' ? isFaceContour : isBackContour;
        const contourColor = type === 'face' ? faceContourColorPicker.value : backContourColorPicker.value;
        
        // Build style attributes
        const fontWeight = isBold ? '700' : '400';
        const fontStyle = isItalic ? 'italic' : 'normal';
        const textDecoration = [];
        if (isUnderline) textDecoration.push('underline');
        if (isStrikethrough) textDecoration.push('line-through');
        const textDecorationValue = textDecoration.length > 0 ? textDecoration.join(' ') : 'none';
        
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i] || ' ';
            lines[i] = lines[i].replace(/ /g, '\u00A0');
        }
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempSvg.style.position = 'absolute'; tempSvg.style.visibility = 'hidden';
        const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textNode.setAttribute('font-family', `"${font}"`);
        textNode.setAttribute('font-size', '100'); // Large size for accurate measurement
        textNode.setAttribute('font-weight', fontWeight);
        textNode.setAttribute('font-style', fontStyle);
        textNode.setAttribute('dominant-baseline', 'middle');
        textNode.setAttribute('text-anchor', 'middle');
        lines.forEach((line, i) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.textContent = line;
            tspan.setAttribute('x', '0');
            tspan.setAttribute('dy', i === 0 ? `-${(lines.length-1)*0.6}em` : '1.2em');
            textNode.appendChild(tspan);
        });
        tempSvg.appendChild(textNode);
        document.body.appendChild(tempSvg);
        const bbox = textNode.getBBox();
        document.body.removeChild(tempSvg);

        const scale = Math.min(w / bbox.width, h / bbox.height);
        const finalFontSize = 100 * scale;
        const transform = `translate(${x + w / 2}, ${y + h / 2})`;
        const textContent = lines.map(l => `<tspan x="0" dy="${lines.indexOf(l) === 0 ? -((lines.length-1)*0.6) : 1.2}em">${l}</tspan>`).join('');
        const textAttributes = `x="0" y="0" font-family="${font}" font-size="${finalFontSize.toFixed(2)}" font-weight="${fontWeight}" font-style="${fontStyle}" text-decoration="${textDecorationValue}" dominant-baseline="middle" text-anchor="middle" transform="${transform}"`;
        
        if (isContour) {
            // Create outlined text using two text elements: stroke underneath, fill on top
            return `<g>
                <text ${textAttributes} fill="none" stroke="${contourColor}" stroke-width="4" stroke-linejoin="round">${textContent}</text>
                <text ${textAttributes} fill="${color}">${textContent}</text>
            </g>`;
        } else {
            return `<text ${textAttributes} fill="${color}">${textContent}</text>`;
        }
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
    if (document.querySelector('input[name="faceArtType"]:checked').value === 'text' && faceTextInput.value.trim()) fontsToLoad.add(selectedFaceFont);
    if (document.querySelector('input[name="backArtType"]:checked').value === 'text' && backTextInput.value.trim()) fontsToLoad.add(selectedBackFont);
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
    } else if (format === 'pdf') {
        // Create a simple PDF with the cutout PNG
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
    } else { // SVG
        const pathData = svgForDesign.match(/<path[^>]+d="([^ "]+)"/)[1];
        const finalMaskSvg = `<svg width="${svgWidth.toFixed(2)}mm" height="${svgHeight.toFixed(2)}mm" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><clipPath id="mugClipPath"><path d="${pathData}" /></clipPath></defs><image href="${pngDataUrl}" x="0" y="0" width="${svgWidth}" height="${svgHeight}" clip-path="url(#mugClipPath)" /></svg>`;
        triggerDownload(finalMaskSvg, filename);
    }
}

async function renderAndDownloadPDF(svgString, filename) {
    // Letter size in horizontal orientation: 11" x 8.5" (279.4mm x 215.9mm)
    // Minimum margins: 6.3mm on all sides
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape', // horizontal orientation
        unit: 'mm',
        format: 'letter' // 8.5x11 inches
    });
    
    // Letter size dimensions in landscape: width=279.4mm, height=215.9mm
    const pageWidth = 279.4;
    const pageHeight = 215.9;
    const margin = 6.3; // minimum margin 6.3mm on all sides
    
    // Calculate available space for content
    const maxContentWidth = pageWidth - (2 * margin);
    const maxContentHeight = pageHeight - (2 * margin);
    
    // Convert SVG to image for PDF embedding
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

    // Get SVG dimensions
    const widthMatch = svgString.match(/width="(\d+(\.\d+)?)/);
    const heightMatch = svgString.match(/height="(\d+(\.\d+)?)/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 300;
    
    // Calculate scale to fit within available space while maintaining aspect ratio
    const scaleX = maxContentWidth / svgWidth;
    const scaleY = maxContentHeight / svgHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const finalWidth = svgWidth * scale;
    const finalHeight = svgHeight * scale;
    
    // High resolution for PDF
    const dpi = 300;
    const pdfScale = dpi / 25.4; // mm to pixels at 300 DPI
    canvas.width = Math.round(svgWidth * pdfScale);
    canvas.height = Math.round(svgHeight * pdfScale);
    
    // Draw SVG to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // Add image to PDF at top-left position (with margin)
    pdf.addImage(imageDataUrl, 'PNG', margin, margin, finalWidth, finalHeight);
    
    // Save the PDF
    pdf.save(filename);
}

// Project Save/Load Functions
function collectProjectData() {
    const projectData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        
        // Project settings
        projectName: projectNameInput.value,
        mugDimensions: {
            height: parseFloat(heightInput.value),
            diameter: parseFloat(diameterInput.value),
            handleAreaWidth: parseFloat(handleAreaWidthInput.value)
        },
        
        // Background settings
        background: {
            type: document.querySelector('input[name="backgroundType"]:checked').value,
            color: bgColorPicker.value,
            imageData: uploadedBgImageData,
            imageStyle: bgImageStyle.value,
            imageSize: bgImageSize.value
        },
        
        // Face artwork settings
        faceArt: {
            type: document.querySelector('input[name="faceArtType"]:checked').value,
            imageData: uploadedFaceImage,
            isFlippedH: isFaceFlippedH,
            isFlippedV: isFaceFlippedV,
            rotation: faceRotation,
            text: faceTextInput.value,
            font: selectedFaceFont,
            color: faceColorPicker.value,
            bold: isFaceBold,
            italic: isFaceItalic,
            underline: isFaceUnderline,
            strikethrough: isFaceStrikethrough,
            contour: isFaceContour,
            contourColor: faceContourColorPicker.value
        },
        
        // Back artwork settings
        backArt: {
            type: document.querySelector('input[name="backArtType"]:checked').value,
            imageData: uploadedBackImage,
            isFlippedH: isBackFlippedH,
            isFlippedV: isBackFlippedV,
            rotation: backRotation,
            text: backTextInput.value,
            font: selectedBackFont,
            color: backColorPicker.value,
            bold: isBackBold,
            italic: isBackItalic,
            underline: isBackUnderline,
            strikethrough: isBackStrikethrough,
            contour: isBackContour,
            contourColor: backContourColorPicker.value
        }
    };
    
    return projectData;
}

function loadProjectData(projectData) {
    try {
        // Project settings
        if (projectData.projectName) projectNameInput.value = projectData.projectName;
        
        // Mug dimensions
        if (projectData.mugDimensions) {
            heightInput.value = projectData.mugDimensions.height;
            diameterInput.value = projectData.mugDimensions.diameter;
            handleAreaWidthInput.value = projectData.mugDimensions.handleAreaWidth;
        }
        
        // Background settings
        if (projectData.background) {
            const bg = projectData.background;
            // Set background type
            const bgRadio = document.querySelector(`input[name="backgroundType"][value="${bg.type}"]`);
            if (bgRadio) bgRadio.checked = true;
            
            bgColorPicker.value = bg.color || '#BFDBFE';
            uploadedBgImageData = bg.imageData || null;
            bgImageStyle.value = bg.imageStyle || 'fill';
            bgImageSize.value = bg.imageSize || 'original';
        }
        
        // Face artwork settings
        if (projectData.faceArt) {
            const face = projectData.faceArt;
            // Set face art type
            const faceRadio = document.querySelector(`input[name="faceArtType"][value="${face.type}"]`);
            if (faceRadio) faceRadio.checked = true;
            
            // Image settings
            uploadedFaceImage = face.imageData || null;
            isFaceFlippedH = face.isFlippedH || false;
            isFaceFlippedV = face.isFlippedV || false;
            faceRotation = face.rotation || 0;
            
            // Text settings
            faceTextInput.value = face.text || '';
            selectedFaceFont = face.font || 'Roboto';
            faceColorPicker.value = face.color || '#000000';
            isFaceBold = face.bold || false;
            isFaceItalic = face.italic || false;
            isFaceUnderline = face.underline || false;
            isFaceStrikethrough = face.strikethrough || false;
            isFaceContour = face.contour || false;
            faceContourColorPicker.value = face.contourColor || '#000000';
        }
        
        // Back artwork settings
        if (projectData.backArt) {
            const back = projectData.backArt;
            // Set back art type
            const backRadio = document.querySelector(`input[name="backArtType"][value="${back.type}"]`);
            if (backRadio) backRadio.checked = true;
            
            // Image settings
            uploadedBackImage = back.imageData || null;
            isBackFlippedH = back.isFlippedH || false;
            isBackFlippedV = back.isFlippedV || false;
            backRotation = back.rotation || 0;
            
            // Text settings
            backTextInput.value = back.text || '';
            selectedBackFont = back.font || 'Roboto';
            backColorPicker.value = back.color || '#000000';
            isBackBold = back.bold || false;
            isBackItalic = back.italic || false;
            isBackUnderline = back.underline || false;
            isBackStrikethrough = back.strikethrough || false;
            isBackContour = back.contour || false;
            backContourColorPicker.value = back.contourColor || '#000000';
        }
        
        // Update button states
        updateFormattingButtonStates();
        
        // Update custom dropdowns
        if (window.faceDropdown) {
            window.faceDropdown.setValue(selectedFaceFont);
        }
        if (window.backDropdown) {
            window.backDropdown.setValue(selectedBackFont);
        }
        
        // Update UI visibility
        updateControlsVisibility();
        
        // Regenerate template
        generateTemplate();
        
        console.log('Project loaded successfully!', projectData);
    } catch (error) {
        console.error('Error loading project data:', error);
        alert('Error loading project file. The file may be corrupted or from an incompatible version.');
    }
}

function updateFormattingButtonStates() {
    // Update face formatting buttons
    toggleButtonState(faceBoldBtn, isFaceBold);
    toggleButtonState(faceItalicBtn, isFaceItalic);
    toggleButtonState(faceUnderlineBtn, isFaceUnderline);
    toggleButtonState(faceStrikethroughBtn, isFaceStrikethrough);
    toggleButtonState(faceContourBtn, isFaceContour);
    faceContourControls.classList.toggle('hidden', !isFaceContour);
    
    // Update back formatting buttons
    toggleButtonState(backBoldBtn, isBackBold);
    toggleButtonState(backItalicBtn, isBackItalic);
    toggleButtonState(backUnderlineBtn, isBackUnderline);
    toggleButtonState(backStrikethroughBtn, isBackStrikethrough);
    toggleButtonState(backContourBtn, isBackContour);
    backContourControls.classList.toggle('hidden', !isBackContour);
}

function parseProjectFromSVG(svgContent) {
    const metadataMatch = svgContent.match(/<!--MUG_PAINTER_PROJECT_DATA:([^:]+):END_PROJECT_DATA-->/);
    if (metadataMatch) {
        try {
            const encodedData = metadataMatch[1];
            const decodedData = atob(encodedData);
            return JSON.parse(decodedData);
        } catch (error) {
            console.error('Error parsing project data from SVG:', error);
            return null;
        }
    }
    return null;
}

function toggleButtonState(button, isActive) {
    if (isActive) {
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
    } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }
}

function updateControlsVisibility() {
    const selectedBgType = document.querySelector('input[name="backgroundType"]:checked').value;
    bgNoneControls.classList.toggle('hidden', selectedBgType !== 'transparent');
    bgColorControls.classList.toggle('hidden', selectedBgType !== 'color');
    bgImageControls.classList.toggle('hidden', selectedBgType !== 'image');

    if (selectedBgType === 'image') {
        const selectedBgStyle = bgImageStyle.value;
        bgImageSize.classList.toggle('hidden', selectedBgStyle !== 'tile' && selectedBgStyle !== 'center');
    } else {
        bgImageSize.classList.add('hidden');
    }
    
    const selectedFaceType = document.querySelector('input[name="faceArtType"]:checked').value;
    faceImageControls.classList.toggle('hidden', selectedFaceType !== 'image');
    faceTextControls.classList.toggle('hidden', selectedFaceType !== 'text');
    
    const selectedBackType = document.querySelector('input[name="backArtType"]:checked').value;
    backImageControls.classList.toggle('hidden', selectedBackType !== 'image');
    backTextControls.classList.toggle('hidden', selectedBackType !== 'text');
    
    generateTemplate();
}

// --- Attach Event Listeners ---
const allInputs = [projectNameInput, heightInput, diameterInput, handleAreaWidthInput, bgColorPicker, exportFormatSelect, faceTextInput, faceColorPicker, faceContourColorPicker, backTextInput, backColorPicker, backContourColorPicker];
allInputs.forEach(input => input.addEventListener('input', generateTemplate));

// Font selection now handled by custom dropdowns

projectNameInput.addEventListener('input', function() { this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, ''); });

[...bgTypeRadios, ...faceArtTypeRadios, ...backArtTypeRadios].forEach(radio => radio.addEventListener('change', updateControlsVisibility));

uploadFaceBtn.addEventListener('click', () => faceImageInput.click());
faceImageInput.addEventListener('change', (e) => handleImageUpload(e, 'face'));
flipFaceHBtn.addEventListener('click', () => { isFaceFlippedH = !isFaceFlippedH; generateTemplate(); });
flipFaceVBtn.addEventListener('click', () => { isFaceFlippedV = !isFaceFlippedV; generateTemplate(); });
rotateFaceLBtn.addEventListener('click', () => { faceRotation = (faceRotation - 90 + 360) % 360; generateTemplate(); });
rotateFaceRBtn.addEventListener('click', () => { faceRotation = (faceRotation + 90) % 360; generateTemplate(); });

// Face formatting buttons
faceBoldBtn.addEventListener('click', () => { isFaceBold = !isFaceBold; toggleButtonState(faceBoldBtn, isFaceBold); generateTemplate(); });
faceItalicBtn.addEventListener('click', () => { isFaceItalic = !isFaceItalic; toggleButtonState(faceItalicBtn, isFaceItalic); generateTemplate(); });
faceUnderlineBtn.addEventListener('click', () => { isFaceUnderline = !isFaceUnderline; toggleButtonState(faceUnderlineBtn, isFaceUnderline); generateTemplate(); });
faceStrikethroughBtn.addEventListener('click', () => { isFaceStrikethrough = !isFaceStrikethrough; toggleButtonState(faceStrikethroughBtn, isFaceStrikethrough); generateTemplate(); });
faceContourBtn.addEventListener('click', () => { isFaceContour = !isFaceContour; toggleButtonState(faceContourBtn, isFaceContour); faceContourControls.classList.toggle('hidden', !isFaceContour); generateTemplate(); });

uploadBackBtn.addEventListener('click', () => backImageInput.click());
backImageInput.addEventListener('change', (e) => handleImageUpload(e, 'back'));
flipBackHBtn.addEventListener('click', () => { isBackFlippedH = !isBackFlippedH; generateTemplate(); });
flipBackVBtn.addEventListener('click', () => { isBackFlippedV = !isBackFlippedV; generateTemplate(); });
rotateBackLBtn.addEventListener('click', () => { backRotation = (backRotation - 90 + 360) % 360; generateTemplate(); });
rotateBackRBtn.addEventListener('click', () => { backRotation = (backRotation + 90) % 360; generateTemplate(); });
// Back formatting buttons
backBoldBtn.addEventListener('click', () => { isBackBold = !isBackBold; toggleButtonState(backBoldBtn, isBackBold); generateTemplate(); });
backItalicBtn.addEventListener('click', () => { isBackItalic = !isBackItalic; toggleButtonState(backItalicBtn, isBackItalic); generateTemplate(); });
backUnderlineBtn.addEventListener('click', () => { isBackUnderline = !isBackUnderline; toggleButtonState(backUnderlineBtn, isBackUnderline); generateTemplate(); });
backStrikethroughBtn.addEventListener('click', () => { isBackStrikethrough = !isBackStrikethrough; toggleButtonState(backStrikethroughBtn, isBackStrikethrough); generateTemplate(); });
backContourBtn.addEventListener('click', () => { isBackContour = !isBackContour; toggleButtonState(backContourBtn, isBackContour); backContourControls.classList.toggle('hidden', !isBackContour); generateTemplate(); });

bgUploadBtn.addEventListener('click', () => bgImageUploadInput.click());
bgImageUploadInput.addEventListener('change', (e) => handleImageUpload(e, 'bg'));
bgImageStyle.addEventListener('change', updateControlsVisibility);
bgImageSize.addEventListener('change', generateTemplate);

downloadDesignBtn.addEventListener('click', () => {
    const format = exportFormatSelect.value;
    const filenameBase = projectNameInput.value.replace(/[^a-zA-Z0-9_-]/g, '') || 'mug-template';
    const filename = `${filenameBase}.${format}`;
    if (format === 'svg') {
        triggerDownload(svgForDesign, filename);
    } else if (format === 'pdf') {
        renderAndDownloadPDF(svgForDesign, filename);
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

// Custom dropdown functionality
class CustomSelect {
    constructor(element, initialValue, onChange) {
        this.element = element;
        this.trigger = element.querySelector('.custom-select-trigger');
        this.options = element.querySelector('.custom-options');
        this.textElement = this.trigger.querySelector('span');
        this.isOpen = false;
        this.selectedValue = initialValue;
        this.onChange = onChange;
        
        this.init();
    }
    
    init() {
        // Populate options
        this.populateOptions();
        
        // Set initial value
        this.setValue(this.selectedValue);
        
        // Event listeners
        this.trigger.addEventListener('click', () => this.toggle());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
        
        // Keyboard support
        this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    populateOptions() {
        this.options.innerHTML = '';
        googleFonts.forEach(font => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.textContent = font;
            option.style.fontFamily = `"${font}", sans-serif`;
            option.dataset.value = font;
            
            option.addEventListener('click', () => {
                this.selectOption(font);
            });
            
            this.options.appendChild(option);
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.trigger.classList.add('open');
        this.options.classList.add('open');
        this.updateSelectedOption();
    }
    
    close() {
        this.isOpen = false;
        this.trigger.classList.remove('open');
        this.options.classList.remove('open');
    }
    
    setValue(value) {
        this.selectedValue = value;
        this.textElement.textContent = value;
        this.textElement.style.fontFamily = `"${value}", sans-serif`;
        this.updateSelectedOption();
    }
    
    selectOption(value) {
        this.setValue(value);
        this.close();
        if (this.onChange) {
            this.onChange(value);
        }
    }
    
    updateSelectedOption() {
        this.options.querySelectorAll('.custom-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.value === this.selectedValue);
        });
    }
    
    handleKeydown(e) {
        if (!this.isOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            this.open();
            return;
        }
        
        if (this.isOpen) {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateOptions(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateOptions(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    const focused = this.options.querySelector('.custom-option:focus');
                    if (focused) {
                        this.selectOption(focused.dataset.value);
                    }
                    break;
            }
        }
    }
    
    navigateOptions(direction) {
        const options = Array.from(this.options.querySelectorAll('.custom-option'));
        const currentIndex = options.findIndex(opt => opt.classList.contains('selected'));
        const newIndex = Math.max(0, Math.min(options.length - 1, currentIndex + direction));
        
        options[newIndex].focus();
    }
}

// Load Google Fonts
function loadGoogleFonts() {
    googleFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    });
}

loadGoogleFonts();

// Initialize custom dropdowns
let dropdownsInitialized = false;
setTimeout(() => {
    window.faceDropdown = new CustomSelect(faceFontSelect, selectedFaceFont, (value) => {
        selectedFaceFont = value;
        if (dropdownsInitialized) generateTemplate();
    });
    
    window.backDropdown = new CustomSelect(backFontSelect, selectedBackFont, (value) => {
        selectedBackFont = value;
        if (dropdownsInitialized) generateTemplate();
    });
    
    dropdownsInitialized = true;
    
    // Generate initial template after dropdowns are ready
    generateTemplate();
}, 500); // Wait for fonts to start loading

// Project load event handlers
loadProjectBtn.addEventListener('click', () => {
    loadProjectInput.click();
});

loadProjectInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            const projectData = parseProjectFromSVG(fileContent);
            
            if (projectData) {
                if (confirm('This will replace your current project. Continue?')) {
                    loadProjectData(projectData);
                }
            } else {
                alert('No project data found in this file. Make sure the file was exported with project data enabled.');
            }
        };
        reader.readAsText(file);
    }
});

// 3D view toggle event listeners
view2DBtn.addEventListener('click', switch2DView);
view3DBtn.addEventListener('click', switch3DView);

// Pre-fetch all fonts on startup
prefetchAllFonts();
updateControlsVisibility();
