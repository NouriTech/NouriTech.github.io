
document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector("#projectGallery");

    if (!gallery) return;

    const galleryImage = gallery.querySelector(".projectGalleryImage");
    const galleryTitle = gallery.querySelector(".projectGalleryTitle");
    const galleryCounter = gallery.querySelector(".projectGalleryCounter");
    const closeButton = gallery.querySelector(".projectGalleryClose");
    const previousButton = gallery.querySelector(".projectGalleryArrow--prev");
    const nextButton = gallery.querySelector(".projectGalleryArrow--next");

    let images = [];
    let currentIndex = 0;
    let previousFocus = null;
    let previousOverflow = "";

    const getProjectTitle = (button) => {
        const card = button.closest(".projectCard");
        return card?.querySelector(".projectCardTitle")?.textContent.trim()
            || "Projet";
    };

    const getProjectImages = (button) => {
        const card = button.closest(".projectCard");

        if (!card) return [];

        return [...card.querySelectorAll(".projectCardVisual img")]
            .filter((img) => img.src);
    };

    const updateGallery = () => {
        const image = images[currentIndex];

        galleryImage.src = image.src;
        galleryImage.alt = image.alt;
        galleryTitle.textContent = getProjectTitle(previousFocus);
        galleryCounter.textContent = `${currentIndex + 1} / ${images.length}`;

        const hasMultipleImages = images.length > 1;

        previousButton.hidden = !hasMultipleImages;
        nextButton.hidden = !hasMultipleImages;
    };

    const openGallery = (button) => {
        images = getProjectImages(button);

        if (!images.length) return;

        currentIndex = images.indexOf(button.querySelector("img"));

        if (currentIndex < 0) currentIndex = 0;

        previousFocus = button;
        previousOverflow = document.body.style.overflow;

        updateGallery();

        gallery.inert = false;
        gallery.setAttribute("aria-hidden", "false");
        gallery.classList.add("is-open");

        document.body.style.overflow = "hidden";
        closeButton.focus();
    };

    const closeGallery = () => {
        if (!gallery.classList.contains("is-open")) return;

        gallery.classList.remove("is-open");
        gallery.setAttribute("aria-hidden", "true");
        gallery.inert = true;

        galleryImage.removeAttribute("src");
        document.body.style.overflow = previousOverflow;

        if (previousFocus?.isConnected) {
            previousFocus.focus();
        }
    };

    const showImage = (direction) => {
        if (images.length <= 1) return;

        currentIndex =
            (currentIndex + direction + images.length) % images.length;

        updateGallery();
    };

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest(".projectCardVisual[data-gallery]");

        if (trigger) {
            openGallery(trigger);
        }
    });

    closeButton.addEventListener("click", closeGallery);

    previousButton.addEventListener("click", () => showImage(-1));
    nextButton.addEventListener("click", () => showImage(1));

    gallery.addEventListener("click", (event) => {
        if (event.target === gallery) {
            closeGallery();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!gallery.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeGallery();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            showImage(-1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            showImage(1);
        } else if (event.key === "Tab") {
            const focusableElements = [
                closeButton,
                ...(images.length > 1 ? [previousButton, nextButton] : [])
            ].filter((element) => !element.hidden);

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });
});
