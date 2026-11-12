document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgotPasswordForm");
    const submitBtn = document.getElementById("submitBtn");
    const buttonText = document.getElementById("buttonText");

    if (!form) {
        console.error("forgotPasswordForm not found.");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const emailInput = document.getElementById("email");
        const accountTypeInput = document.getElementById("accountType");

        const email = emailInput.value.trim();

        // --------------------------------------
        // Basic Validation
        // --------------------------------------

        if (email === "") {

            Swal.fire({
                icon: "warning",
                title: "Email Required",
                text: "Please enter your email address."
            });

            return;
        }

        // --------------------------------------
        // Email Format Validation
        // --------------------------------------

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            Swal.fire({
                icon: "error",
                title: "Invalid Email",
                text: "Please enter a valid email address."
            });

            return;
        }

        // --------------------------------------
        // Loading State
        // --------------------------------------

        submitBtn.disabled = true;

        submitBtn.classList.add(
            "opacity-70",
            "cursor-not-allowed"
        );

        buttonText.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>
            Sending Reset Link...
        `;

        // --------------------------------------
        // Prepare Form Data
        // --------------------------------------

        const formData = new FormData();

        formData.append("email", email);

        try {

            const response = await fetch(
                "/Complaint/Cores/sendReset.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            // --------------------------------------
            // Check HTTP response
            // --------------------------------------

            if (!response.ok) {
                throw new Error(
                    `HTTP error: ${response.status}`
                );
            }

            // --------------------------------------
            // Parse JSON
            // --------------------------------------

            const result = await response.json();

            console.log("Password reset response:", result);

            // --------------------------------------
            // Success
            // --------------------------------------

            if (result.success) {

                Swal.fire({
                    title: "Email Sent",
                    html: result.message,
                    confirmButtonColor: "#2563eb"
                });

                form.reset();

            }

            // --------------------------------------
            // Failure
            // --------------------------------------

            else {

                Swal.fire({
                    icon: "error",
                    title: "Request Failed",
                    html: result.message,
                    confirmButtonColor: "#dc2626"
                });

            }

        }

        catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Server Error",
                text:
                    "Unable to connect to the server. Please try again later."
            });

        }

        finally {

            // --------------------------------------
            // Restore Button
            // --------------------------------------

            submitBtn.disabled = false;

            submitBtn.classList.remove(
                "opacity-70",
                "cursor-not-allowed"
            );

            buttonText.innerHTML = `
                Send Reset Link
            `;

        }

    });

});