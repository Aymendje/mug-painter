// 3d-engine.js - Three.js 3D visualization functionality

import { state, dom } from './config.js';

// === 3D SCENE INITIALIZATION ===
export function init3DScene() {
    // Create scene
    state.scene = new THREE.Scene();
    
    // Get canvas dimensions from svg-preview
    const previewRect = dom.svgPreview.getBoundingClientRect();
    const canvasWidth = previewRect.width > 4 ? previewRect.width - 4 : 400;
    const canvasHeight = previewRect.height > 4 ? previewRect.height - 4 : 400;
    
    // Create checkered background texture
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(canvasWidth, 256) || 128;
    canvas.height = Math.min(canvasHeight, 256) || 128;
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
    
    state.scene.background = texture;
    
    // Create camera
    const aspect = canvasWidth / canvasHeight;
    state.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    state.camera.position.set(0, 0, 5);
    state.camera.lookAt(0, 0, 0);
    
    // Create renderer
    state.renderer = new THREE.WebGLRenderer({ 
        canvas: dom.threeCanvas, 
        antialias: true,
        alpha: true
    });
    state.renderer.setSize(canvasWidth, canvasHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio || 1);
    // Enable shadows for realistic look
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add realistic lighting with shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    state.scene.add(ambientLight);
    
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
    state.scene.add(directionalLight);
    
    // Add 3D interaction controls
    setupInteractionControls();
    
    // Handle canvas resize
    setupResizeObserver();
    
    // Force initial render
    state.renderer.render(state.scene, state.camera);
}

// === 3D INTERACTION CONTROLS ===
function setupInteractionControls() {
    // Mouse interaction variables
    let mouseX = 0, mouseY = 0;
    let isLeftMouseDown = false;
    let isRightMouseDown = false;
    
    // Touch interaction variables
    let touches = [];
    let lastPinchDistance = 0;
    let isPinching = false;
    let isTouching = false;
    let lastTouchCenter = { x: 0, y: 0 };
    
    // Function to stop rotation animation
    function stopMugRotation() {
        if (state.mugMesh) {
            state.isRotating = false;
        }
    }
    
    // Helper function to get touch distance for pinch gestures
    function getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Helper function to get center point of two touches
    function getTouchCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    // === MOUSE EVENTS ===
    dom.threeCanvas.addEventListener('mousedown', (e) => {
        // Stop rotation on any mouse interaction
        stopMugRotation();
        
        if (e.button === 0) { // Left mouse button
            isLeftMouseDown = true;
        } else if (e.button === 2) { // Right mouse button
            isRightMouseDown = true;
            e.preventDefault(); // Prevent context menu
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    dom.threeCanvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isLeftMouseDown = false;
        } else if (e.button === 2) {
            isRightMouseDown = false;
        }
    });
    
    dom.threeCanvas.addEventListener('mousemove', (e) => {
        if (!isLeftMouseDown && !isRightMouseDown) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        if (isLeftMouseDown && state.mugMesh) {
            // Left mouse: rotate mug
            state.mugMesh.rotation.y += deltaX * 0.01;
            state.mugMesh.rotation.x += deltaY * 0.01;
        } else if (isRightMouseDown) {
            // Right mouse: move camera in X/Y
            const moveSpeed = 0.01;
            state.camera.position.x -= deltaX * moveSpeed;
            state.camera.position.y += deltaY * moveSpeed;
        }
        
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // === TOUCH EVENTS ===
    dom.threeCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        // Stop rotation on touch interaction
        stopMugRotation();
        
        touches = Array.from(e.touches);
        isTouching = true;
        
        if (touches.length === 2) {
            // Two finger touch - prepare for pinch or pan
            isPinching = true;
            lastPinchDistance = getTouchDistance(touches[0], touches[1]);
            lastTouchCenter = getTouchCenter(touches[0], touches[1]);
        } else if (touches.length === 1) {
            // Single finger touch - prepare for rotation
            isPinching = false;
            mouseX = touches[0].clientX;
            mouseY = touches[0].clientY;
        }
    });
    
    dom.threeCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (!isTouching) return;
        
        const currentTouches = Array.from(e.touches);
        
        if (currentTouches.length === 2 && touches.length === 2) {
            // Two finger pinch/pan
            const currentDistance = getTouchDistance(currentTouches[0], currentTouches[1]);
            const currentCenter = getTouchCenter(currentTouches[0], currentTouches[1]);
            
            if (isPinching) {
                // Pinch to zoom
                const pinchDelta = currentDistance - lastPinchDistance;
                const zoomSpeed = 0.01;
                
                state.camera.position.z -= pinchDelta * zoomSpeed;
                state.camera.position.z = Math.max(2, Math.min(state.camera.position.z, 15));
                
                lastPinchDistance = currentDistance;
                
                // Two finger pan (camera movement)
                const panDeltaX = currentCenter.x - lastTouchCenter.x;
                const panDeltaY = currentCenter.y - lastTouchCenter.y;
                const moveSpeed = 0.01;
                
                state.camera.position.x -= panDeltaX * moveSpeed;
                state.camera.position.y += panDeltaY * moveSpeed;
                
                lastTouchCenter = currentCenter;
            }
        } else if (currentTouches.length === 1 && !isPinching && state.mugMesh) {
            // Single finger rotation
            const deltaX = currentTouches[0].clientX - mouseX;
            const deltaY = currentTouches[0].clientY - mouseY;
            
            state.mugMesh.rotation.y += deltaX * 0.01;
            state.mugMesh.rotation.x += deltaY * 0.01;
            
            mouseX = currentTouches[0].clientX;
            mouseY = currentTouches[0].clientY;
        }
        
        touches = currentTouches;
    });
    
    dom.threeCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        const remainingTouches = Array.from(e.touches);
        
        if (remainingTouches.length === 0) {
            // All fingers lifted
            isTouching = false;
            isPinching = false;
            touches = [];
        } else if (remainingTouches.length === 1 && touches.length === 2) {
            // Went from two fingers to one - switch to rotation mode
            isPinching = false;
            mouseX = remainingTouches[0].clientX;
            mouseY = remainingTouches[0].clientY;
            touches = remainingTouches;
        } else {
            touches = remainingTouches;
        }
    });
    
    dom.threeCanvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        isTouching = false;
        isPinching = false;
        touches = [];
    });

    // Prevent context menu on right-click
    dom.threeCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Add scroll-to-zoom functionality
    dom.threeCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Stop rotation on scroll interaction
        stopMugRotation();
        
        const zoomSpeed = 0.01;
        const delta = e.deltaY * zoomSpeed;
        
        // Adjust camera position for zoom
        state.camera.position.z += delta;
        
        // Clamp zoom limits
        state.camera.position.z = Math.max(2, Math.min(state.camera.position.z, 15));
    });
}

// === RESIZE OBSERVER ===
function setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
        if (state.renderer && state.camera) {
            const previewRect = dom.svgPreview.getBoundingClientRect();
            const width = previewRect.width > 4 ? previewRect.width - 4 : 400;
            const height = previewRect.height > 4 ? previewRect.height - 4 : 400;
            state.renderer.setSize(width, height);
            state.camera.aspect = width / height;
            state.camera.updateProjectionMatrix();
        }
    });
    resizeObserver.observe(dom.svgPreview);
}

// === 3D MUG GEOMETRY CREATION ===
export function create3DMugGeometry(height, diameter, handleWidth) {
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
    const innerPartsGeometry = mergeInnerGeometries(innerWall, bottomGeometry, bottomGeometry2);
    
    // Create handle and lip
    const handleGeometry = createHandleGeometry(mugHeight, mugRadius, handleDepth, ceramicThickness);
    const lipGeometry = createLipGeometry(outerTopRadius, innerTopRadius, mugHeight);
    
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

// === HELPER GEOMETRY FUNCTIONS ===
function mergeInnerGeometries(innerWall, bottomGeometry, bottomGeometry2) {
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
    
    return innerPartsGeometry;
}

function createHandleGeometry(mugHeight, mugRadius, handleDepth, ceramicThickness) {
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
    const handleX = 0;
    const handleY = 0; // Center vertically
    const handleZ = mugRadius - ceramicThickness;
    handleGeometry.translate(handleX, handleY, handleZ);
    
    return handleGeometry;
}

function createLipGeometry(outerTopRadius, innerTopRadius, mugHeight) {
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
    
    return lipGeometry;
}

// === TEXTURE CREATION ===
export async function createMugTexture(svgForDesign) {
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
    
    // Get dimensions from svg-preview instead of hardcoding
    const previewRect = dom.svgPreview.getBoundingClientRect();
    canvas.width = previewRect.width > 0 ? previewRect.width : 1024;
    canvas.height = previewRect.height > 0 ? previewRect.height : 512;
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svg3D], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise(async (resolve) => {
        img.onload = async () => {
            console.log('SVG loaded for texture');
            
            try {
                // Wait for fonts to be ready in the document
                await document.fonts.ready;
                
                // Additional small delay to ensure SVG fonts are applied
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Draw SVG to canvas
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Create Three.js texture
                const texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                
                URL.revokeObjectURL(url);
                console.log('Texture created successfully with fonts');
                resolve(texture);
            } catch (err) {
                console.error('Error drawing SVG to canvas:', err);
                URL.revokeObjectURL(url);
                resolve(null);
            }
        };
        
        img.onerror = (err) => {
            console.error('Error loading SVG for texture:', err);
            URL.revokeObjectURL(url);
            resolve(null);
        };
        
        img.src = url;
    });
}

// === ROTATION ANIMATION MANAGEMENT ===
export function startMugRotation() {
    if (state.mugMesh && state.isCurrentView3D) {
        state.isRotating = true;
        state.rotationStartTime = Date.now();
    }
}

export function stopMugRotation() {
    if (state.mugMesh) {
        state.isRotating = false;
    }
}

// === 3D MUG UPDATE ===
export async function update3DMug() {
    if (!state.isCurrentView3D || !state.scene) {
        console.log('Not in 3D view or no scene');
        return;
    }
    
    console.log('Updating 3D mug...');
    
    const height = parseFloat(dom.heightInput.value);
    const diameter = parseFloat(dom.diameterInput.value);
    const handleWidth = parseFloat(dom.handleAreaWidthInput.value);
    
    // Remove existing mug
    if (state.mugMesh) {
        state.scene.remove(state.mugMesh);
        if (state.mugMesh.geometry) state.mugMesh.geometry.dispose();
        if (state.mugMesh.material) state.mugMesh.material.dispose();
    }
    
    // Create new mug geometry (returns a Group with body and handle)
    state.mugMesh = create3DMugGeometry(height, diameter, handleWidth);
    
    // Wait for all fonts to be ready before creating texture
    await document.fonts.ready;
    
    // Create texture from current SVG
    let texture = null;
    try {
        texture = await createMugTexture(state.svgForDesign);
    } catch (err) {
        console.error('Error creating texture:', err);
    }
    
    // Apply materials to all meshes in the group
    state.mugMesh.traverse((child) => {
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
    
    state.scene.add(state.mugMesh);
    
    // Start rotation animation after canvas rebuild
    startMugRotation();
}

// === ANIMATION LOOP ===
export function animate3D() {
    if (!state.isCurrentView3D) return;
    
    state.animationId = requestAnimationFrame(animate3D);
    
    // Handle mug rotation animation
    if (state.isRotating && state.mugMesh && state.rotationStartTime) {
        const elapsedTime = Date.now() - state.rotationStartTime;
        const rotationDuration = 10000; // 10 seconds for full revolution
        const rotationAngle = (elapsedTime / rotationDuration) * Math.PI * 2; // Full circle in radians
        
        // Apply rotation around Z-axis
        state.mugMesh.rotation.y = rotationAngle;
        
        // Reset rotation after full circle to avoid precision issues
        if (elapsedTime >= rotationDuration) {
            state.rotationStartTime = Date.now();
        }
    }
    
    if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
    }
}

// === VIEW SWITCHING ===
export function switch2DView() {
    state.isCurrentView3D = false;
    
    // Cancel animation loop
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }
    
    // Show 2D, hide 3D
    dom.svgContainer.style.display = 'flex';
    dom.threeCanvas.classList.add('hidden');
    
    // Update button states
    dom.view2DBtn.classList.remove('btn-secondary');
    dom.view2DBtn.classList.add('btn-primary');
    dom.view3DBtn.classList.remove('btn-primary');
    dom.view3DBtn.classList.add('btn-secondary');
}

export function switch3DView() {
    // Check if THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded');
        alert('3D functionality requires Three.js to be loaded. Please refresh the page.');
        return;
    }
    
    state.isCurrentView3D = true;
    
    // Always reinitialize 3D scene to avoid state issues
    if (state.scene) {
        // Clean up existing scene
        if (state.mugMesh) {
            state.scene.remove(state.mugMesh);
        }
        if (state.renderer) {
            state.renderer.dispose();
        }
        state.scene = null;
        state.camera = null;
        state.renderer = null;
        state.mugMesh = null;
    }
    
    // Initialize fresh 3D scene
    init3DScene();
    
    // Hide 2D, show 3D
    dom.svgContainer.style.display = 'none';
    dom.threeCanvas.classList.remove('hidden');
    
    // Update button states
    dom.view3DBtn.classList.remove('btn-secondary');
    dom.view3DBtn.classList.add('btn-primary');
    dom.view2DBtn.classList.remove('btn-primary');
    dom.view2DBtn.classList.add('btn-secondary');
    
    // Update 3D mug and start animation
    update3DMug();
    animate3D();
    
    // Start rotation animation when switching to 3D view
    startMugRotation();
}
