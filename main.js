// Spotlight Glow Effect
const cards = document.querySelectorAll(".spotlight-card");

document.addEventListener("mousemove", (e) => {
    for(const card of cards) {
        const rect = card.getBoundingClientRect(),
              x = e.clientX - rect.left,
              y = e.clientY - rect.top;

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
    }
});

// Parallax Background Effect
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroBg = document.getElementById('heroBg');
    
    // Moves the background down at 30% of the scroll speed
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrollPos * 0.3}px)`;
    }
});