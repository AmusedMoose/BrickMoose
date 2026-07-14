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

// Parallax/Tilt logic could go here or be added as you build out 
// specific components.
console.log("BrickMoose System Initialized.");