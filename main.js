const carousel = document.getElementById('carousel');

let isDragging = false;
let startX;
let scrollLeftStart;

/* ==========================================
   DESKTOP GRAB DRAG SYSTEM
   ========================================== */

if (carousel) {

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

}
/* ==========================================
   INTERACTIVE SPOTLIGHT GLOW EFFECT
   ========================================== */
document.addEventListener("mousemove", (e) => {
    // Selects both existing spotlight cards and the new pipeline steps
    const glowingElements = document.querySelectorAll(".spotlight-card, .step, .custom-form");

    glowingElements.forEach(el => {
        const rect = el.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        el.style.setProperty("--x", `${x}px`);
        el.style.setProperty("--y", `${y}px`);
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
    link.addEventListener('click', function (e) {
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



const contactForm = document.getElementById('contactForm');
const successBox = document.getElementById('success-message');
const echoData = document.getElementById('echo-data');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the page from refreshing

        // 1. Get the data
        const formData = new FormData(contactForm);
        const name = formData.get('user_name');
        const message = formData.get('user_message');

        // 2. Hide form, show success
        contactForm.style.display = 'none';
        successBox.style.display = 'block';

        // 3. Populate the echo box
        echoData.innerHTML = `<strong>Name:</strong> ${name}<br><br><strong>Message:</strong><br>${message}`;
    });
}