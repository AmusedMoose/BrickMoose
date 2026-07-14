const carousel = document.getElementById('carousel');
let isDragging = false;
let startX;
let scrollLeftStart;

/* ==========================================
   DESKTOP GRAB DRAG SYSTEM
   ========================================== */
carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    carousel.classList.add('dragging');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeftStart = carousel.scrollLeft;
});

carousel.addEventListener('mouseleave', () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
});

carousel.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Extra defense fallback against system text capture triggers
    
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5; // Controls the movement responsiveness speed 
    carousel.scrollLeft = scrollLeftStart - walk;
});

/* ==========================================
   INTERACTIVE SPOTLIGHT GLOW EFFECT
   ========================================== */
document.addEventListener("mousemove", (e) => {
    const cards = document.querySelectorAll(".spotlight-card");
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect(),
              x = e.clientX - rect.left,
              y = e.clientY - rect.top;

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
    });
});

/* ==========================================
   HERO BACKGROUND PARALLAX ENGINE
   ========================================== */
const heroBg = document.getElementById('heroBg');

if (heroBg) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // 0.3 controls the parallax speed factor. 
        // Multiplying makes it slide slightly slower than the text, creating depth.
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
}

/* ==========================================
   SMOOTH INTERACTION SCROLL LINK LOGIC
   ========================================== */
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
/* ==========================================
   3D TILT ENGINE (Adapted from reference)
   ========================================== */
const tiltContainers = document.querySelectorAll(".spotlight-row-image");

tiltContainers.forEach(container => {
    // The image inside is the "card" that moves
    const image = container.querySelector('img');

    container.addEventListener('mousemove', (e) => {
        // Get container position
        const rect = container.getBoundingClientRect();
        
        // Calculate center-relative mouse position
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Dampen intensity (15 is the sweet spot from your reference)
        const dampen = 15;
        const rotateX = -(y / dampen);
        const rotateY = (x / dampen);

        // Apply instant rotation
        image.style.transition = 'none';
        image.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    // Reset when mouse leaves
    container.addEventListener('mouseleave', () => {
        image.style.transition = 'transform 0.5s ease-out';
        image.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    });
});