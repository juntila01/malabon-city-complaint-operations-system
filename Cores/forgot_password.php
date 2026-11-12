<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>Forgot Password</title>

    <!-- Tailwind -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- FontAwesome -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center p-6">

    <div class="w-full max-w-md">

        <!-- Logo / System Name -->
        <div class="text-center mb-8">

            <div class="w-20 h-20 mx-auto rounded-full bg-blue-600 flex items-center justify-center shadow-lg">

                <i class="fa-solid fa-shield-halved text-white text-3xl"></i>

            </div>

            <h1 class="mt-5 text-3xl font-bold text-gray-800">
                Forgot Password
            </h1>

            <p class="text-gray-500 mt-2">
                Enter your registered email address and we'll send you a password reset link.
            </p>

        </div>

        <!-- Card -->

        <div class="bg-white rounded-2xl shadow-lg p-8">

            <form id="forgotPasswordForm">

                <!-- Email -->

                <div class="mb-6">

                    <label
                        class="block text-sm font-semibold text-gray-700 mb-2">

                        Email Address

                    </label>

                    <div class="relative">

                        <span class="absolute left-4 top-3.5 text-gray-400">

                            <i class="fa-solid fa-envelope"></i>

                        </span>

                        <input

                            type="email"

                            id="email"

                            name="email"

                            required

                            autocomplete="email"

                            placeholder="example@gmail.com"

                            class="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">

                    </div>

                </div>

                <!-- Button -->

                <button

                    id="submitBtn"

                    type="submit"

                    class="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg flex justify-center items-center gap-3">

                    <span id="buttonText">

                        Send Reset Link

                    </span>

                    <i class="fa-solid fa-paper-plane"></i>

                </button>

            </form>

            <!-- Back -->

            <div class="text-center mt-6">

                <a
                    href="login.html"
                    class="text-blue-600 hover:underline text-sm">

                    <i class="fa-solid fa-arrow-left mr-2"></i>

                    Back to Login

                </a>

            </div>

        </div>

        <!-- Footer -->

        <p class="text-center text-gray-400 text-sm mt-6">

            Complaint Management System

        </p>

    </div>

    <script src="/Complaint/Cores/forgot_password.js"></script>

</body>

</html>