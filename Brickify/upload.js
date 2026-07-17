import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// --- 1. Global Setup (Defined at the top) ---
const container = document.getElementById('scene-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// Set default camera settings
camera.fov = 20;
camera.updateProjectionMatrix();

// Models & DOM Elements
let brick2x4 = null;
let brick2x2 = null;
let cropper = null;
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const widthNum = document.getElementById('widthNum');
const heightNum = document.getElementById('heightNum');
const colorSelect = document.getElementById('colorSelect');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const editorContainer = document.getElementById('editor-container');
const applyCropBtn = document.getElementById('applyCropBtn');
const loader = new GLTFLoader();

// --- 2. Logic Functions ---
function applyMaterial(brick, color) {
    brick.traverse((node) => {
        if (node.isMesh) {
            node.material = new THREE.MeshBasicMaterial({ color: color });
            const edges = new THREE.EdgesGeometry(node.geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
            node.add(line);
        }
    });
}

function updateGrid() {
    // 1. Clean up
    scene.children.forEach(child => { if (child.name === "brickGroup") scene.remove(child); });
    if (!brick2x4 || !brick2x2) return;

    // 2. Setup Dimensions
    const w = parseInt(document.getElementById('widthSlider').value);
    const h = parseInt(document.getElementById('heightSlider').value);
    const color = colorSelect.value;

    const studWidth = 1.0;
    const brick4x2_Width = 4.0;
    const brick2x2_Width = 2.0;
    const yOffset = 1.2;

    const brickGroup = new THREE.Group();
    brickGroup.name = "brickGroup";

    const totalWidthUnits = w * 2.0;
    const xStart = -totalWidthUnits / 2;

    for (let y = 0; y < h; y++) {
        const isStaggeredRow = (y % 2 !== 0);

        if (!isStaggeredRow) {
            let currentX = xStart;
            for (let i = 0; i < w / 2; i++) {
                const b = brick2x4.clone();
                applyMaterial(b, color);
                b.position.set(currentX + (brick4x2_Width / 2), y * yOffset, 0);
                brickGroup.add(b);
                currentX += brick4x2_Width;
            }
        } else {
            const leftEnd = brick2x2.clone();
            applyMaterial(leftEnd, color);
            leftEnd.position.set(xStart + (brick2x2_Width / 2) + 0, y * yOffset, 0);
            brickGroup.add(leftEnd);

            let currentX = xStart + brick2x2_Width - 1.0;
            const remainingWidth = totalWidthUnits - brick2x2_Width - brick2x2_Width;
            for (let i = 0; i < remainingWidth / brick4x2_Width; i++) {
                const b = brick2x4.clone();
                applyMaterial(b, color);
                b.position.set(currentX + (brick4x2_Width / 2) + 1, y * yOffset, 0);
                brickGroup.add(b);
                currentX += brick4x2_Width;
            }

            const rightEnd = brick2x2.clone();
            applyMaterial(rightEnd, color);
            rightEnd.position.set(currentX + (brick2x2_Width / 2) + 1, y * yOffset, 0);
            brickGroup.add(rightEnd);
        }
    }
    scene.add(brickGroup);

    // --- Dynamic Camera Centering Logic ---
    // 1. Calculate the bounding box of the newly built brick wall
    const box = new THREE.Box3().setFromObject(brickGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // 2. Set the OrbitControls look-at target to the exact center of the wall
    controls.target.copy(center);

    // 3. Estimate an appropriate camera distance dynamically based on wall dimensions and FOV
    const maxDim = Math.max(size.x, size.y);
    const fovRad = (camera.fov * Math.PI) / 180;

    // Calculate distance to perfectly fit the grid inside the screen height plus padding
    let cameraZ = Math.abs(maxDim / Math.sin(fovRad / 2));
    cameraZ *= 0.6; // Apply a slight padding factor

    // Fallback minimum distance so camera doesn't zoom in too close for very small grids
    const minDistance = 25;
    cameraZ = Math.max(cameraZ, minDistance);

    // 4. Update the camera position (keep it looking directly down the Z-axis at the grid center)
    camera.position.set(cameraZ / 8, cameraZ / 2, cameraZ);

    // Update controls internal state
    controls.update();
}

// --- 3. Initialization & Listeners ---
Promise.all([
    new Promise(res => loader.load('3001.glb', gltf => res(gltf.scene))),
    new Promise(res => loader.load('3003.glb', gltf => res(gltf.scene)))
]).then(([model1, model2]) => {
    brick2x4 = model1;
    brick2x2 = model2;
    updateGrid();
});

function syncInputs(slider, num) {
    slider.addEventListener('input', () => { num.value = slider.value; updateGrid(); });
    num.addEventListener('input', () => { slider.value = num.value; updateGrid(); });
}
syncInputs(widthSlider, widthNum);
syncInputs(heightSlider, heightNum);

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        editorContainer.style.display = 'block';
        imagePreview.src = event.target.result;
        imagePreview.onload = () => {
            if (cropper) cropper.destroy();
            cropper = new Cropper(imagePreview, {
                aspectRatio: (parseInt(widthSlider.value) * 2.0) / (parseInt(heightSlider.value) * 1.2),
                viewMode: 1,
            });
        };
    };
    reader.readAsDataURL(file);
});

applyCropBtn.addEventListener('click', () => {
    if (!cropper) return;
    const croppedCanvas = cropper.getCroppedCanvas();
    const texture = new THREE.CanvasTexture(croppedCanvas);
    const wallWidth = parseInt(widthSlider.value) * 2.0;
    const wallHeight = parseInt(heightSlider.value) * 1.2;

    const planeGeo = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const imagePlane = new THREE.Mesh(planeGeo, planeMat);
    imagePlane.name = "imagePlane";
    imagePlane.position.set(0, -0.6 + (wallHeight / 2) - 0.6, 1.05);

    scene.traverse((child) => {
        if (child.isGroup && child.name === "brickGroup") {
            const existing = child.getObjectByName("imagePlane");
            if (existing) child.remove(existing);
            child.add(imagePlane);
        }
    });
});

colorSelect.addEventListener('change', updateGrid);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});