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

function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        fetch(file)
            .then(response => response.text())
            .then(data => {
                element.innerHTML = data;
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header-placeholder", "/BrickMoose/components/header.html");
    loadComponent("footer-placeholder", "/BrickMoose/components/footer.html");
});