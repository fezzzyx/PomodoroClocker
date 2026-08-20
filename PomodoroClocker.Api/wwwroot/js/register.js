const registerForm =
    document.getElementById("registerForm");

const registerError =
    document.getElementById("registerError");

const registerSubmitButton =
    registerForm.querySelector('button[type="submit"]');


registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;

        registerError.textContent = "";


        if (password !== confirmPassword) {

            registerError.textContent =
                "Passwords do not match.";

            return;
        }

        if (registerSubmitButton) {
            registerSubmitButton.disabled = true;
            registerSubmitButton.textContent = "Creating account...";
        }


        try {

            const response = await fetch(
                "/api/Auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );


            if (!response.ok) {

                const message =
                    await response.text();

                throw new Error(message);
            }


            const result =
                await response.json();


            localStorage.setItem(
                "token",
                result.token
            );

            localStorage.setItem(
                "username",
                result.username
            );


            window.location.href = "/";

        } catch (error) {

            console.error(error);

            registerError.textContent =
                error.message ||
                "Registration failed.";

        } finally {

            if (registerSubmitButton) {
                registerSubmitButton.disabled = false;
                registerSubmitButton.textContent = "Register";
            }
        }

    }
);