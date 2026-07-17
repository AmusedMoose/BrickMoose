import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// --- 1. Global Setup ---
const container = document.getElementById('scene-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

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

// Automatically generate the texture and project it onto the physical dimensions of the 3D wall
function applyCroppedImageToWall() {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas();
    if (!croppedCanvas) return;

    const texture = new THREE.CanvasTexture(croppedCanvas);
    const wallWidth = parseInt(widthSlider.value); // 1 stud = 1.0 unit
    const wallHeight = parseInt(heightSlider.value) * 1.2;

    const planeGeo = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const imagePlane = new THREE.Mesh(planeGeo, planeMat);
    imagePlane.name = "imagePlane";

    const brickGroup = scene.getObjectByName("brickGroup");
    if (brickGroup) {
        // Calculate bounding box of the physical bricks to position the texture perfectly
        const box = new THREE.Box3().setFromObject(brickGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Match the center of the bricks and move slightly forward on Z to prevent z-fighting
        imagePlane.position.set(center.x, center.y, 1.05);

        const existing = brickGroup.getObjectByName("imagePlane");
        if (existing) {
            existing.geometry.dispose();
            if (existing.material.map) existing.material.map.dispose();
            existing.material.dispose();
            brickGroup.remove(existing);
        }
        brickGroup.add(imagePlane);
    }
}

function updateGrid() {
    scene.children.forEach(child => { if (child.name === "brickGroup") scene.remove(child); });
    if (!brick2x4 || !brick2x2) return;

    const w = parseInt(widthSlider.value); // Exact stud width
    const h = parseInt(heightSlider.value); // Exact row height
    const color = colorSelect.value;

    const yOffset = 1.2; // Height of 1 brick
    const brickGroup = new THREE.Group();
    brickGroup.name = "brickGroup";

    const xStart = -w / 2; // Center alignment start point

    for (let y = 0; y < h; y++) {
        const isStaggeredRow = (y % 2 !== 0);
        let currentX = xStart;

        if (!isStaggeredRow) {
            // STANDARD ROW (Even rows)
            // Fill with as many 2x4s as possible
            const num2x4 = Math.floor(w / 4);
            const has2x2 = (w % 4 === 2);

            for (let i = 0; i < num2x4; i++) {
                const b = brick2x4.clone();
                applyMaterial(b, color);
                b.position.set(currentX + 2.0, y * yOffset, 0); // Origin offset for 2x4
                brickGroup.add(b);
                currentX += 4.0;
            }
            // Fill any remaining 2-stud space at the end with a 2x2
            if (has2x2) {
                const b = brick2x2.clone();
                applyMaterial(b, color);
                b.position.set(currentX + 1.0, y * yOffset, 0); // Origin offset for 2x2
                brickGroup.add(b);
            }
        } else {
            // STAGGERED ROW (Odd rows)
            // Start row with a 2x2 brick on the left
            const leftEnd = brick2x2.clone();
            applyMaterial(leftEnd, color);
            leftEnd.position.set(currentX + 1.0, y * yOffset, 0);
            brickGroup.add(leftEnd);
            currentX += 2.0;

            // Fill the remaining space (w - 2 studs)
            const remainingStuds = w - 2;
            const num2x4 = Math.floor(remainingStuds / 4);
            const has2x2 = (remainingStuds % 4 === 2);

            for (let i = 0; i < num2x4; i++) {
                const b = brick2x4.clone();
                applyMaterial(b, color);
                b.position.set(currentX + 2.0, y * yOffset, 0);
                brickGroup.add(b);
                currentX += 4.0;
            }
            // Fill trailing gap with a 2x2 if necessary (e.g., width 4 becomes 2x2 - 2x2)
            if (has2x2) {
                const b = brick2x2.clone();
                applyMaterial(b, color);
                b.position.set(currentX + 1.0, y * yOffset, 0);
                brickGroup.add(b);
            }
        }
    }
    scene.add(brickGroup);

    // Dynamic Cropper Ratio Syncing
    if (cropper) {
        const targetAspectRatio = w / (h * 1.2);
        cropper.setAspectRatio(targetAspectRatio);
        applyCroppedImageToWall();
    }

    // Dynamic Camera Centering Logic
    const box = new THREE.Box3().setFromObject(brickGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    controls.target.copy(center);

    const maxDim = Math.max(size.x, size.y);
    const fovRad = (camera.fov * Math.PI) / 180;

    let cameraZ = Math.abs(maxDim / Math.sin(fovRad / 2));
    cameraZ *= 0.6;

    const minDistance = 25;
    cameraZ = Math.max(cameraZ, minDistance);

    camera.position.set(cameraZ / 8, cameraZ / 2, cameraZ);
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
                aspectRatio: parseInt(widthSlider.value) / (parseInt(heightSlider.value) * 1.2),
                viewMode: 1,
                crop() {
                    applyCroppedImageToWall();
                }
            });
        };
    };
    reader.readAsDataURL(file);
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

// --- 4. Checkout Logic ---
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', () => {
    if (!cropper) {
        alert("Please upload and crop an image first before checking out.");
        return;
    }

    const croppedCanvas = cropper.getCroppedCanvas();
    const dataUrl = croppedCanvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.download = 'BrickMoose-Custom-Design.png';
    downloadLink.href = dataUrl;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const w = parseInt(widthSlider.value);
    const h = parseInt(heightSlider.value);

    setTimeout(() => {
        const storeUrl = `https://brickmoose.com/store-1/p/brickify?width=${w}&height=${h}`;
        window.location.href = storeUrl;
    }, 500);
});