
const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");

if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Envoi en cours...";
        contactStatus.textContent = "";

        const captchaResponse = contactForm.querySelector(
            'textarea[name="h-captcha-response"]'
        );

        if (!captchaResponse?.value) {
            contactStatus.textContent =
                "Veuillez valider la vérification anti-spam.";

            contactStatus.dataset.status = "error";
            submitButton.disabled = false;
            submitButton.textContent = "Envoyer le message";
            return;
        }

        try {
            const formData = new FormData(contactForm);

            const response = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {
                contactForm.reset();
                contactStatus.textContent =
                    "Votre message a bien été envoyé. Merci !";
                contactStatus.dataset.status = "success";
            } else {
                throw new Error(result.message || "Échec de l'envoi.");
            }
        } catch (error) {
            contactStatus.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
            contactStatus.dataset.status = "error";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Envoyer le message";
        }
    });
}
