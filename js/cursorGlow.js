const cursorGlow = document.querySelector(".cursorGlow");

if (cursorGlow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener("mousemove", (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
        cursorGlow.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
        cursorGlow.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
        cursorGlow.style.opacity = "1";
    });
}