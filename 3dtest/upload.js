import * as THREE from 'three';

// 1. Setup Scene
const container = document.getElementById('scene-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 2. Create the "Brick Wall"
const wallGeo = new THREE.PlaneGeometry(5, 5);
const wallMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
const wall = new THREE.Mesh(wallGeo, wallMat);
scene.add(wall);

// 3. Create the "Display Plane" (Where the photo goes)
const photoGeo = new THREE.PlaneGeometry(2, 2);
const photoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const photoPlane = new THREE.Mesh(photoGeo, photoMat);
photoPlane.position.z = 0.01; // Slightly in front of the wall
scene.add(photoPlane);

camera.position.z = 5;

// 4. Handle File Upload
const input = document.getElementById('imageInput');
input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, (texture) => {
            photoPlane.material.map = texture;
            photoPlane.material.needsUpdate = true;
        });
    };
    reader.readAsDataURL(file);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();