document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Elements
    // ==========================
    const form = document.querySelector("form");

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");

    const passwordStrength = document.getElementById("passwordStrength");
    const passwordMatch = document.getElementById("passwordMatch");

    const passwordRequirements =
        document.getElementById("passwordRequirements");

    const registerBtn = document.getElementById("registerBtn");


    // ==========================
    // Password Toggle Function
    // ==========================
    function setupPasswordToggle(inputId, buttonId, eyeId, eyeOffId) {

        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        const eye = document.getElementById(eyeId);
        const eyeOff = document.getElementById(eyeOffId);

        if (!input || !button) return;

        button.addEventListener("click", () => {

            const hidden = input.type === "password";

            input.type = hidden ? "text" : "password";

            eye.classList.toggle("hidden", hidden);
            eyeOff.classList.toggle("hidden", !hidden);

        });

    }

    setupPasswordToggle(
        "password",
        "password-toggle",
        "eye-icon",
        "eye-off-icon"
    );

    setupPasswordToggle(
        "confirm_password",
        "confirm-password-toggle",
        "confirm-eye-icon",
        "confirm-eye-off-icon"
    );


    // ==========================
    // Password Requirement Helper
    // ==========================
    function updateRequirement(id, valid) {

        const requirement = document.getElementById(id);

        if (!requirement) return;

        const icon = requirement.querySelector(".req-icon");

        if (valid) {

            requirement.classList.remove("text-gray-500");
            requirement.classList.add("text-green-600");

            if (icon) {
                icon.textContent = "✓";
            }

        } else {

            requirement.classList.remove("text-green-600");
            requirement.classList.add("text-gray-500");

            if (icon) {
                icon.textContent = "○";
            }

        }

    }


    // ==========================
    // Password Validation
    // ==========================
    function validatePassword() {

        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;


        // ==========================
        // Show / Hide Requirements
        // ==========================
        if (password === "") {

            passwordRequirements.classList.add("hidden");

        } else {

            passwordRequirements.classList.remove("hidden");

        }


        // ==========================
        // Password Requirements
        // ==========================
        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);


        // ==========================
        // Update Checklist
        // ==========================
        updateRequirement("req-length", hasLength);
        updateRequirement("req-upper", hasUpper);
        updateRequirement("req-lower", hasLower);
        updateRequirement("req-number", hasNumber);
        updateRequirement("req-special", hasSpecial);


        // ==========================
        // Password Strength
        // ==========================
        let score = 0;

        if (hasLength) score++;
        if (hasUpper) score++;
        if (hasLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;


        if (password === "") {

            passwordStrength.classList.add("hidden");

        } else {

            passwordStrength.classList.remove("hidden");

            if (score <= 2) {

                passwordStrength.textContent = "Weak Password";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-red-600";

            } else if (score <= 4) {

                passwordStrength.textContent = "Medium Password";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-yellow-600";

            } else {

                passwordStrength.textContent = "Strong Password ✓";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-green-600";

            }

        }


        // ==========================
        // Password Match
        // ==========================
        if (confirm === "") {

            passwordMatch.classList.add("hidden");

        } else {

            passwordMatch.classList.remove("hidden");

            if (password === confirm) {

                passwordMatch.textContent = "✔ Passwords match";

                passwordMatch.className =
                    "mt-2 text-sm font-medium text-green-600";

            } else {

                passwordMatch.textContent = "✖ Passwords do not match";

                passwordMatch.className =
                    "mt-2 text-sm font-medium text-red-600";

            }

        }


        // ==========================
        // Enable Register Button
        // ==========================
        const strongPassword =
            hasLength &&
            hasUpper &&
            hasLower &&
            hasNumber &&
            hasSpecial;


        if (strongPassword && password === confirm) {

            registerBtn.disabled = false;

            registerBtn.className =
                "w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-500/20 mt-2";

        } else {

            registerBtn.disabled = true;

            registerBtn.className =
                "w-full py-3.5 bg-gray-400 text-white font-bold rounded-xl cursor-not-allowed transition-all mt-2";

        }

    }


    // ==========================
    // Password Input Events
    // ==========================
    passwordInput.addEventListener("input", validatePassword);

    confirmPasswordInput.addEventListener("input", validatePassword);


    // ==========================
    // Contact Number Validation
    // ==========================
    const contactInput = document.getElementById("contact_number");

    if (contactInput) {

        contactInput.addEventListener("input", () => {

            contactInput.value = contactInput.value
                .replace(/\D/g, "")
                .slice(0, 11);

        });

    }


    // ==========================
    // Form Validation
    // ==========================
    form.addEventListener("submit", (e) => {

        if (registerBtn.disabled) {

            e.preventDefault();

            alert("Please create a strong password before registering.");

        }

    });


    // ==========================
    // Error Banner
    // ==========================
    const errorBanner = document.getElementById("error-banner");

    if (errorBanner) {

        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");

        const messages = {

            password_mismatch: "The passwords do not match.",
            email_exists: "This email address is already registered.",
            empty_fields: "Please complete all required fields.",
            invalid_email: "Please enter a valid email address.",
            invalid_contact: "Contact number must contain exactly 11 digits.",
            password_too_short: "Password must be at least 8 characters.",
            weak_password: "Password does not meet the security requirements.",
            upload_failed: "File upload failed. Please try again."

        };

        if (error) {

            errorBanner.classList.remove("hidden");

            errorBanner.textContent =
                messages[error] || "Registration failed.";

        }

    }


    // ==========================
    // Initial Validation
    // ==========================
    validatePassword();

});

