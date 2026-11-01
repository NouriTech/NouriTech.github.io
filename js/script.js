
/* ========================================
   THÈME NIGHT / LIGHT
======================================== */

// Restaurer le thème enregistré, Night par défaut.
const savedTheme = localStorage.getItem("nouritech-theme");

function applyTheme(theme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
}

// Appliquer le thème avant le chargement des composants.
applyTheme(savedTheme === "light" ? "light" : "night");


/* Icône soleil */
const sunIcon = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.42 1.42" />
        <path d="m17.65 17.65 1.42 1.42" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.35 17.65-1.42 1.42" />
        <path d="m19.07 4.93-1.42-1.42" />
    </svg>
`;


/* Icône lune */
const moonIcon = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401" />
    </svg>
`;

/* ========================================
   CHEMIN DE BASE DU SITE
======================================== */

const pathSegments = window.location.pathname
    .split("/")
    .filter(Boolean);

// Si la page est à la racine, aucun dossier parent à remonter.
// Sinon, on remonte d'un niveau.
const basePath = pathSegments.length === 0 ||
    (pathSegments.length === 1 && pathSegments[0] === "index.html")
    ? "./"
    : "../";



/* ========================================
   CHARGEMENT DE LA NAVBAR
======================================== */

fetch(`${basePath}components/navbar.html`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Impossible de charger la navbar.");
        }

        return response.text();
    })
    .then(html => {
        document.getElementById("navbarContainer").innerHTML = html;

        const navbarToggle = document.querySelector(".navbarToggle");
        const navbarMenu = document.getElementById("navbarMenu");
        const navbarOverlay = document.querySelector(".navbarOverlay");

        // Fermer le menu
        function closeMenu() {
            navbarMenu.classList.remove("isOpen");
            navbarOverlay.classList.remove("isVisible");

            navbarToggle.setAttribute("aria-expanded", "false");
            navbarToggle.setAttribute(
                "aria-label",
                "Ouvrir le menu de navigation"
            );
        }

        // Ouvrir ou fermer le menu avec le hamburger
        navbarToggle.addEventListener("click", () => {
            const isExpanded =
                navbarToggle.getAttribute("aria-expanded") === "true";

            if (isExpanded) {
                closeMenu();
            } else {
                navbarMenu.classList.add("isOpen");
                navbarOverlay.classList.add("isVisible");

                navbarToggle.setAttribute("aria-expanded", "true");
                navbarToggle.setAttribute(
                    "aria-label",
                    "Fermer le menu de navigation"
                );
            }
        });

        // Fermer le menu en cliquant sur le voile sombre
        navbarOverlay.addEventListener("click", closeMenu);

        // Fermer le menu après avoir choisi une page
        navbarMenu.querySelectorAll(".navbarLinks a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });


        /* ========================================
           BOUTON DE CHANGEMENT DE THÈME
        ======================================== */

        const themeToggle = document.getElementById("themeToggle");

        function updateThemeButton() {
            const isLight =
                document.documentElement.getAttribute("data-theme") === "light";

            // En Night, le soleil permet de passer en Light.
            // En Light, la lune permet de repasser en Night.
            themeToggle.innerHTML = isLight ? moonIcon : sunIcon;

            const label = isLight
                ? "Passer au thème sombre"
                : "Passer au thème clair";

            themeToggle.setAttribute("aria-label", label);
            themeToggle.setAttribute("title", label);
        }

        // Afficher l'icône correspondant au thème actuel.
        updateThemeButton();

        // Basculer de thème et mémoriser le choix.
        themeToggle.addEventListener("click", () => {
            const isLight =
                document.documentElement.getAttribute("data-theme") === "light";

            const newTheme = isLight ? "night" : "light";

            applyTheme(newTheme);
            localStorage.setItem("nouritech-theme", newTheme);

            updateThemeButton();
        });
    })
    .catch(error => {
        console.error("Erreur lors du chargement de la navbar :", error);
    });


/* ========================================
   CHARGEMENT DU FOOTER
======================================== */

fetch(`${basePath}/components/footer.html`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Impossible de charger le footer.");
        }

        return response.text();
    })
    .then(html => {
        document.getElementById("footerContainer").innerHTML = html;
    })
    .catch(error => {
        console.error("Erreur lors du chargement du footer :", error);
    });
