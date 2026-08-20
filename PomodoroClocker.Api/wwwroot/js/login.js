const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const loginSubmitButton =
    loginForm.querySelector('button[type="submit"]');


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    loginError.textContent = "";

    if (loginSubmitButton) {
        loginSubmitButton.disabled = true;
        loginSubmitButton.textContent = "Logging in...";
    }


    try {

        const response = await fetch(
            "/api/Auth/login",
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

        loginError.textContent =
            error.message ||
            "Login failed.";

    } finally {

        if (loginSubmitButton) {
            loginSubmitButton.disabled = false;
            loginSubmitButton.textContent = "Login";
        }
    }

});