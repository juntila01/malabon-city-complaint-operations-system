document.addEventListener("DOMContentLoaded", async () => {

    // =========================================================
    // Elements
    // =========================================================

    const loadingState =
        document.getElementById("loadingState");

    const invalidState =
        document.getElementById("invalidState");

    const invalidMessage =
        document.getElementById("invalidMessage");

    const resetForm =
        document.getElementById("resetPasswordForm");

    const accountName =
        document.getElementById("accountName");

    const accountEmail =
        document.getElementById("accountEmail");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const passwordStrength =
        document.getElementById("passwordStrength");

    const passwordMatch =
        document.getElementById("passwordMatch");

    const resetBtn =
        document.getElementById("resetBtn");

    const resetButtonText =
        document.getElementById("resetButtonText");


    // =========================================================
    // Get Token
    // =========================================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const token =
        urlParams.get("token");


    // =========================================================
    // No Token
    // =========================================================

    if (!token) {

        showInvalid(
            "No password reset token was provided."
        );

        return;
    }


    // =========================================================
    // Validate Token
    // =========================================================

    try {

        const formData =
            new FormData();

        formData.append(
            "action",
            "validate"
        );

        formData.append(
            "token",
            token
        );


        const response =
            await fetch(
                "reset_password.php",
                {
                    method: "POST",
                    body: formData
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            showInvalid(
                result.message
            );

            return;
        }


        // =====================================================
        // Display Account
        // =====================================================

        accountName.textContent =
            result.account.displayName;

        accountEmail.textContent =
            result.account.email;


        // =====================================================
        // Show Reset Form
        // =====================================================

        loadingState.classList.add("hidden");

        resetForm.classList.remove("hidden");


    } catch (error) {

        console.error(
            "Token validation error:",
            error
        );

        showInvalid(
            "Unable to validate the reset link. Please try again."
        );

    }


    // =========================================================
    // Password Toggle
    // =========================================================

    setupPasswordToggle(
        "toggleNewPassword",
        "newPassword"
    );

    setupPasswordToggle(
        "toggleConfirmPassword",
        "confirmPassword"
    );


    // =========================================================
    // Password Validation
    // =========================================================

    function validatePasswords() {

        const password =
            newPassword.value;

        const confirm =
            confirmPassword.value;


        // -----------------------------------------------------
        // Password Rules
        // -----------------------------------------------------

        const hasLength =
            password.length >= 8;

        const hasUpper =
            /[A-Z]/.test(password);

        const hasLower =
            /[a-z]/.test(password);

        const hasNumber =
            /[0-9]/.test(password);

        const hasSpecial =
            /[^A-Za-z0-9]/.test(password);


        // -----------------------------------------------------
        // Calculate Strength
        // -----------------------------------------------------

        let score = 0;

        if (hasLength) score++;
        if (hasUpper) score++;
        if (hasLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;


        // =====================================================
        // Password Strength Message
        // =====================================================

        if (password === "") {

            passwordStrength.classList.add(
                "hidden"
            );

        } else {

            passwordStrength.classList.remove(
                "hidden"
            );


            if (score <= 2) {

                passwordStrength.textContent =
                    "Weak Password";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-red-600";


            } else if (score <= 4) {

                passwordStrength.textContent =
                    "Medium Password";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-yellow-600";


            } else {

                passwordStrength.textContent =
                    "Strong Password";

                passwordStrength.className =
                    "mt-2 text-sm font-medium text-green-600";

            }

        }


        // =====================================================
        // Password Match
        // =====================================================

        if (confirm === "") {

            passwordMatch.classList.add(
                "hidden"
            );

        } else {

            passwordMatch.classList.remove(
                "hidden"
            );


            if (password === confirm) {

                passwordMatch.textContent =
                    "Passwords match";

                passwordMatch.className =
                    "mt-2 text-sm font-medium text-green-600";


            } else {

                passwordMatch.textContent =
                    "Passwords do not match";

                passwordMatch.className =
                    "mt-2 text-sm font-medium text-red-600";

            }

        }


        // =====================================================
        // Strong Password
        // =====================================================

        const strongPassword =
            hasLength &&
            hasUpper &&
            hasLower &&
            hasNumber &&
            hasSpecial;


        // =====================================================
        // Enable / Disable Button
        // =====================================================

        if (
            strongPassword &&
            password === confirm
        ) {

            resetBtn.disabled = false;

            resetBtn.className =
                "w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-500/20";


        } else {

            resetBtn.disabled = true;

            resetBtn.className =
                "w-full py-3.5 bg-gray-400 text-white font-bold rounded-xl cursor-not-allowed transition-all";

        }

    }


    // =========================================================
    // Listen For Password Changes
    // =========================================================

    newPassword.addEventListener(
        "input",
        validatePasswords
    );

    confirmPassword.addEventListener(
        "input",
        validatePasswords
    );


    // Initial state

    validatePasswords();


    // =========================================================
    // Submit Reset
    // =========================================================

    resetForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const password =
                newPassword.value;

            const confirm =
                confirmPassword.value;


            // -------------------------------------------------
            // Validate
            // -------------------------------------------------

            if (!validatePassword(password)) {

                Swal.fire({
                    icon: "warning",
                    title: "Weak Password",
                    text: "Please create a strong password."
                });

                return;
            }


            if (password !== confirm) {

                Swal.fire({
                    icon: "error",
                    title: "Passwords Do Not Match",
                    text: "Please make sure both passwords are identical."
                });

                return;
            }


            // -------------------------------------------------
            // Loading
            // -------------------------------------------------

            resetBtn.disabled = true;

            resetBtn.classList.add(
                "opacity-70",
                "cursor-not-allowed"
            );

            resetButtonText.textContent =
                "Resetting Password...";


            try {

                const formData =
                    new FormData();

                formData.append(
                    "action",
                    "reset"
                );

                formData.append(
                    "token",
                    token
                );

                formData.append(
                    "password",
                    password
                );


                const response =
                    await fetch(
                        "reset_password.php",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                if (!result.success) {

                    Swal.fire({
                        icon: "error",
                        title: "Reset Failed",
                        text: result.message
                    });

                    return;
                }


                // -------------------------------------------------
                // Success
                // -------------------------------------------------

                await Swal.fire({

                    icon: "success",

                    title:
                        "Password Reset Successfully",

                    text:
                        "Your password has been changed. You can now log in using your new password.",

                    confirmButtonColor:
                        "#2563eb",

                    confirmButtonText:
                        "Go to Login"

                });


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                Swal.fire({

                    icon: "error",

                    title:
                        "Server Error",

                    text:
                        "Unable to connect to the server."

                });


            } finally {

                resetBtn.disabled = false;

                resetBtn.classList.remove(
                    "opacity-70",
                    "cursor-not-allowed"
                );

                resetButtonText.textContent =
                    "Reset Password";

                // Re-evaluate button state
                validatePasswords();

            }

        }
    );


    // =========================================================
    // Show Invalid Token
    // =========================================================

    function showInvalid(message) {

        loadingState.classList.add(
            "hidden"
        );

        resetForm.classList.add(
            "hidden"
        );

        invalidState.classList.remove(
            "hidden"
        );

        invalidMessage.textContent =
            message;

    }


    // =========================================================
    // Password Toggle
    // =========================================================

    function setupPasswordToggle(
        buttonID,
        inputID
    ) {

        const button =
            document.getElementById(buttonID);

        const input =
            document.getElementById(inputID);


        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                const hidden =
                    input.type === "password";


                input.type =
                    hidden
                        ? "text"
                        : "password";


                button.innerHTML =
                    hidden
                        ? '<i class="fa-solid fa-eye-slash"></i>'
                        : '<i class="fa-solid fa-eye"></i>';

            }
        );

    }


    // =========================================================
    // Final Password Validation
    // =========================================================

    function validatePassword(password) {

        return (

            password.length >= 8 &&

            /[A-Z]/.test(password) &&

            /[a-z]/.test(password) &&

            /[0-9]/.test(password) &&

            /[^A-Za-z0-9]/.test(password)

        );

    }

});