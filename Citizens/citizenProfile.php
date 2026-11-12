<?php

session_start();

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

if (
    !isset($_SESSION["logged_in"]) ||
    $_SESSION["logged_in"] !== true
) {
    header("Location: ../Cores/login.html");
    exit;
}
?>
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>My Profile | Malabon CitizenCare</title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        /* =========================================================
       BASE
    ========================================================= */

        * {
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            min-height: 100vh;

            font-family:
                Inter,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            background: #f6f8fc;
            color: #0f172a;

            -webkit-font-smoothing: antialiased;

            padding-bottom: 88px;
        }

        button,
        input {
            font-family: inherit;
        }

        button,
        a {
            -webkit-tap-highlight-color: transparent;
        }


        /* =========================================================
       HEADER
    ========================================================= */

        .citizen-header {
            position: sticky;
            top: 0;
            z-index: 50;

            background: rgba(255, 255, 255, 0.95);

            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);

            border-bottom:
                1px solid rgba(226, 232, 240, 0.75);
        }


        /* =========================================================
       MAIN
    ========================================================= */

        .citizen-main {
            padding-bottom: 25px !important;
        }


        /* =========================================================
       PROFILE HERO
    ========================================================= */

        .profile-hero {
            position: relative;
            overflow: hidden;
        }

        .profile-hero::before {
            content: "";

            position: absolute;

            width: 180px;
            height: 180px;

            right: -80px;
            top: -90px;

            border-radius: 999px;

            background:
                rgba(59, 130, 246, 0.08);

            pointer-events: none;
        }

        .profile-hero::after {
            content: "";

            position: absolute;

            width: 120px;
            height: 120px;

            left: -65px;
            bottom: -70px;

            border-radius: 999px;

            background:
                rgba(59, 130, 246, 0.05);

            pointer-events: none;
        }

        .profile-avatar {
            position: relative;
            z-index: 1;

            box-shadow:
                0 10px 25px rgba(37, 99, 235, 0.16);
        }


        /* =========================================================
       BOTTOM NAVIGATION
       EXACT STYLE FROM myComplaints.html
    ========================================================= */

        .mobile-bottom-nav {
            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            z-index: 100;

            padding:
                8px 12px calc(8px + env(safe-area-inset-bottom));

            pointer-events: none;
        }

        .mobile-bottom-nav-inner {
            max-width: 560px;

            margin: 0 auto;

            height: 68px;

            background:
                rgba(255, 255, 255, 0.96);

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);

            border:
                1px solid rgba(226, 232, 240, 0.95);

            border-radius: 24px;

            box-shadow:
                0 14px 40px rgba(15, 23, 42, 0.13),
                0 2px 8px rgba(15, 23, 42, 0.06);

            display: grid;

            grid-template-columns:
                1fr 1fr 1.15fr 1fr 1fr;

            align-items: center;

            padding: 5px;

            pointer-events: auto;
        }


        /* =========================================================
       NORMAL NAV ITEM
    ========================================================= */

        .bottom-nav-item {
            height: 58px;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            gap: 3px;

            border-radius: 18px;

            color: #94a3b8;

            font-size: 9px;
            font-weight: 700;

            transition:
                all 0.2s ease;

            text-decoration: none;

            border: none;

            background: transparent;

            cursor: pointer;
        }

        .bottom-nav-item svg {
            width: 20px;
            height: 20px;

            transition:
                transform 0.2s ease,
                color 0.2s ease;
        }

        .bottom-nav-item:hover {
            color: #2563eb;
            background: #f8fafc;
        }

        .bottom-nav-item.active {
            color: #2563eb;
            background: #eff6ff;
        }

        .bottom-nav-item.active svg {
            transform: translateY(-1px);
        }


        /* =========================================================
       REPORT BUTTON
       EXACT STYLE FROM myComplaints.html
    ========================================================= */

        .bottom-report-button {
            position: relative;

            height: 58px;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            gap: 3px;

            color: white;

            font-size: 9px;
            font-weight: 800;

            border: none;

            background: transparent;

            cursor: pointer;

            text-decoration: none;
        }

        .bottom-report-icon {
            width: 48px;
            height: 48px;

            margin-top: -25px;

            border-radius: 17px;

            display: flex;

            align-items: center;
            justify-content: center;

            background: #2563eb;

            color: white;

            border:
                4px solid #f8fafc;

            box-shadow:
                0 8px 20px rgba(37, 99, 235, 0.30);

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .bottom-report-button:hover .bottom-report-icon {

            transform:
                translateY(-2px);

            box-shadow:
                0 11px 25px rgba(37, 99, 235, 0.35);
        }

        .bottom-report-button:active .bottom-report-icon {

            transform:
                scale(0.95);
        }

        .bottom-report-label {
            color: #2563eb;

            margin-top: 1px;
        }


        /* =========================================================
       MODAL
    ========================================================= */

        .modal-panel {
            animation:
                modalUp 0.22s ease-out;
        }

        @keyframes modalUp {

            from {
                opacity: 0;
                transform:
                    translateY(15px) scale(0.98);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0) scale(1);
            }

        }


        /* =========================================================
       MOBILE
    ========================================================= */

        @media (max-width: 640px) {

            main {
                padding-top: 20px !important;
            }

            .modal-panel {
                border-radius: 24px;
            }

        }


        /* =========================================================
       SMALL PHONES
    ========================================================= */

        @media (max-width: 380px) {

            .mobile-bottom-nav {
                padding-left: 8px;
                padding-right: 8px;
            }

            .mobile-bottom-nav-inner {
                height: 64px;

                padding: 5px;

                border-radius: 22px;
            }

            .bottom-nav-item {
                height: 52px;

                border-radius: 16px;
            }

            .bottom-nav-item svg {
                width: 18px;
                height: 18px;
            }

            .bottom-nav-item span {
                font-size: 8px;
            }

            .bottom-report-button {
                height: 52px;
            }

            .bottom-report-icon {
                width: 46px;
                height: 46px;

                border-radius: 17px;
            }

        }


        /* =========================================================
       DESKTOP
    ========================================================= */

        @media (min-width: 768px) {

            .mobile-bottom-nav {
                padding-left: 24px;
                padding-right: 24px;
            }

        }
    </style>


</head>

<body>

    <!-- =========================================================
     HEADER
========================================================= -->

    <header class="citizen-header">

        <div class="max-w-6xl mx-auto px-4 sm:px-6">

            <div class="h-[72px]
               flex
               items-center
               justify-between">

                <!-- BRAND -->

                <div class="flex
                   items-center
                   gap-3
                   min-w-0">

                    <div class="w-10 h-10
                       rounded-2xl
                       bg-blue-50
                       border border-blue-100
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <img src="../assets/ahon.png" alt="Malabon CitizenCare" class="w-8 h-8 object-contain">

                    </div>


                    <div class="min-w-0">

                        <h1 class="text-sm sm:text-base
                           font-extrabold
                           text-slate-900
                           truncate">
                            Malabon CitizenCare
                        </h1>

                        <p class="text-[9px] sm:text-[10px]
                           font-bold
                           uppercase
                           tracking-[0.16em]
                           text-slate-400">
                            Citizen Portal
                        </p>

                    </div>

                </div>


                <!-- NOTIFICATIONS -->

                <button id="notificationButton" type="button" class="w-10 h-10
                   rounded-xl
                   border border-slate-200
                   bg-white
                   text-slate-500
                   flex items-center
                   justify-center
                   hover:bg-slate-50
                   hover:text-blue-600
                   transition" aria-label="Notifications">

                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />

                    </svg>

                </button>

            </div>

        </div>

    </header>

    <!-- =========================================================
     MAIN CONTENT
========================================================= -->

    <main class="citizen-main
           max-w-3xl
           mx-auto
           px-4 sm:px-6
           py-6 sm:py-8">

        <!-- =====================================================
     PAGE INTRO
====================================================== -->

        <section class="mb-5">

            <p class="text-xs
               font-bold
               uppercase
               tracking-[0.14em]
               text-blue-600
               mb-1">
                Account
            </p>

            <h2 class="text-2xl sm:text-3xl
               font-extrabold
               tracking-tight
               text-slate-900">
                My Profile
            </h2>

            <p class="text-sm
               text-slate-500
               mt-1">
                Manage your CitizenCare account information.
            </p>

        </section>


        <!-- =====================================================
     PROFILE HERO
====================================================== -->

        <section class="profile-hero
           bg-white
           rounded-[26px]
           border border-slate-200/80
           shadow-[0_10px_35px_rgba(15,23,42,0.05)]">

            <div class="relative z-10
               px-5 sm:px-7
               py-7 sm:py-8">

                <div class="flex
                   flex-col
                   items-center
                   text-center">

                    <!-- AVATAR -->

                    <div id="profileAvatar" class="profile-avatar
                       w-24 h-24
                       sm:w-28 sm:h-28
                       rounded-[30px]
                       bg-blue-600
                       text-white
                       flex items-center
                       justify-center
                       text-3xl sm:text-4xl
                       font-extrabold
                       overflow-hidden
                       border-4 border-white">

                        <span id="profileAvatarInitials">
                            --
                        </span>

                        <img id="profileAvatarImage" src="" alt="Profile" class="hidden
                           w-full h-full
                           object-cover">

                    </div>


                    <!-- NAME -->

                    <h3 id="profileName" class="mt-5
                       text-xl sm:text-2xl
                       font-extrabold
                       text-slate-900">
                        Loading...
                    </h3>


                    <!-- EMAIL -->

                    <p id="profileEmail" class="mt-1
                       text-sm
                       text-slate-500
                       break-all
                       max-w-md">
                        Loading...
                    </p>


                    <!-- VERIFICATION -->

                    <div id="profileVerification" class="inline-flex
                       items-center
                       gap-2
                       mt-4
                       px-3.5 py-2
                       rounded-full
                       bg-slate-100
                       text-slate-600
                       text-[11px]
                       font-bold">

                        <span id="verificationDot" class="w-2 h-2
                           rounded-full
                           bg-slate-400"></span>

                        <span id="verificationText">
                            Loading...
                        </span>

                    </div>

                </div>

            </div>

        </section>


        <!-- =====================================================
     ACCOUNT INFORMATION
====================================================== -->

        <section class="mt-7">

            <div class="flex
               items-end
               justify-between
               px-1
               mb-3">

                <div>

                    <p class="text-[10px]
                       font-bold
                       uppercase
                       tracking-[0.14em]
                       text-slate-400">
                        Personal details
                    </p>

                    <h3 class="text-base
                       font-extrabold
                       text-slate-900
                       mt-0.5">
                        Account Information
                    </h3>

                </div>

            </div>


            <div class="bg-white
               rounded-[24px]
               border border-slate-200/80
               shadow-[0_8px_30px_rgba(15,23,42,0.04)]
               overflow-hidden
               divide-y divide-slate-100">


                <!-- FULL NAME -->

                <div class="px-4 sm:px-5
                   py-4
                   flex items-center
                   gap-4">

                    <div class="w-11 h-11
                       rounded-2xl
                       bg-blue-50
                       text-blue-600
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                        </svg>

                    </div>


                    <div class="min-w-0
                       flex-1">

                        <p class="text-[10px]
                           uppercase
                           tracking-wide
                           text-slate-400
                           font-bold">
                            Full Name
                        </p>

                        <p id="infoFullName" class="text-sm
                           font-bold
                           text-slate-800
                           truncate
                           mt-0.5">
                            --
                        </p>

                    </div>

                </div>


                <!-- EMAIL -->

                <div class="px-4 sm:px-5
                   py-4
                   flex items-center
                   gap-4">

                    <div class="w-11 h-11
                       rounded-2xl
                       bg-blue-50
                       text-blue-600
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                        </svg>

                    </div>


                    <div class="min-w-0
                       flex-1">

                        <p class="text-[10px]
                           uppercase
                           tracking-wide
                           text-slate-400
                           font-bold">
                            Email Address
                        </p>

                        <p id="infoEmail" class="text-sm
                           font-bold
                           text-slate-800
                           truncate
                           mt-0.5">
                            --
                        </p>

                    </div>

                </div>


                <!-- CONTACT -->

                <div class="px-4 sm:px-5
                   py-4
                   flex items-center
                   gap-4">

                    <div class="w-11 h-11
                       rounded-2xl
                       bg-blue-50
                       text-blue-600
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 011.94.47l1.16 4.64a1 1 0 01-.52 1.1l-2.12 1.06a11.05 11.05 0 005.99 5.99l1.06-2.12a1 1 0 011.1-.52l4.64 1.16a1 1 0 01.47 1.94V20a2 2 0 01-2 2h-1C10.72 22 2 13.28 2 2V1a2 2 0 012-2z" />

                        </svg>

                    </div>


                    <div class="min-w-0
                       flex-1">

                        <p class="text-[10px]
                           uppercase
                           tracking-wide
                           text-slate-400
                           font-bold">
                            Contact Number
                        </p>

                        <p id="infoContact" class="text-sm
                           font-bold
                           text-slate-800
                           mt-0.5">
                            --
                        </p>

                    </div>

                </div>


                <!-- ACCOUNT CREATED -->

                <div class="px-4 sm:px-5
                   py-4
                   flex items-center
                   gap-4">

                    <div class="w-11 h-11
                       rounded-2xl
                       bg-blue-50
                       text-blue-600
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M8 7V3m8 4V3M4 11h16M5 21h14a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />

                        </svg>

                    </div>


                    <div class="min-w-0
                       flex-1">

                        <p class="text-[10px]
                           uppercase
                           tracking-wide
                           text-slate-400
                           font-bold">
                            Account Created
                        </p>

                        <p id="infoCreated" class="text-sm
                           font-bold
                           text-slate-800
                           mt-0.5">
                            --
                        </p>

                    </div>

                </div>

            </div>

        </section>


        <!-- =====================================================
     VERIFICATION
====================================================== -->

        <section class="mt-7">

            <div class="px-1 mb-3">

                <p class="text-[10px]
                   font-bold
                   uppercase
                   tracking-[0.14em]
                   text-slate-400">
                    Account status
                </p>

                <h3 class="text-base
                   font-extrabold
                   text-slate-900
                   mt-0.5">
                    Verification
                </h3>

            </div>


            <div id="verificationBox" class="bg-white
               rounded-[24px]
               border border-slate-200/80
               shadow-[0_8px_30px_rgba(15,23,42,0.04)]
               p-5">

                <div class="flex
                   items-start
                   gap-4">

                    <div id="verificationIcon" class="w-11 h-11
                       rounded-2xl
                       bg-slate-100
                       flex items-center
                       justify-center
                       text-slate-500
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

                        </svg>

                    </div>


                    <div class="flex-1
                       min-w-0">

                        <p id="verificationBoxTitle" class="font-extrabold
                           text-sm
                           text-slate-900">
                            Checking verification...
                        </p>

                        <p id="verificationBoxDescription" class="text-xs
                           text-slate-500
                           mt-1
                           leading-relaxed">
                            Please wait while we check your account.
                        </p>

                    </div>

                </div>

            </div>

        </section>


        <!-- =====================================================
     SETTINGS
====================================================== -->

        <section class="mt-7">

            <div class="px-1 mb-3">

                <p class="text-[10px]
                   font-bold
                   uppercase
                   tracking-[0.14em]
                   text-slate-400">
                    Account controls
                </p>

                <h3 class="text-base
                   font-extrabold
                   text-slate-900
                   mt-0.5">
                    Settings
                </h3>

            </div>


            <div class="space-y-3">


                <!-- EDIT PROFILE -->

                <button id="editProfileBtn" type="button" class="w-full
                   bg-white
                   border border-slate-200/80
                   rounded-2xl
                   px-4 py-4
                   flex items-center
                   gap-4
                   text-left
                   shadow-[0_6px_20px_rgba(15,23,42,0.03)]
                   hover:bg-slate-50
                   hover:border-slate-300
                   transition">

                    <div class="w-11 h-11
                       rounded-2xl
                       bg-blue-50
                       text-blue-600
                       flex items-center
                       justify-center
                       flex-shrink-0">

                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.121 2.121 0 10-3-3L5 17v3z" />

                        </svg>

                    </div>


                    <div class="flex-1">

                        <p class="text-sm
                           font-bold
                           text-slate-800">
                            Edit Profile
                        </p>

                        <p class="text-xs
                           text-slate-400
                           mt-0.5">
                            Update your name and profile photo
                        </p>

                    </div>


                    <svg class="w-5 h-5
                       text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />

                    </svg>

                </button>


                <!-- CHANGE PASSWORD -->
                <button id="changePasswordBtn" type="button"
                    onclick="window.location.href='../Cores/forgot_password.php'" class="w-full
bg-white
border border-slate-200/80
rounded-2xl
px-4 py-4
flex items-center
gap-4
text-left
shadow-[0_6px_20px_rgba(15,23,42,0.03)]
hover:bg-slate-50
hover:border-slate-300
transition">


                    <div class="w-11 h-11
           rounded-2xl
           bg-slate-100
           text-slate-600
           flex items-center
           justify-center
           flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M15 11V7a3 3 0 00-6 0v4m-2 0h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                        </svg>
                    </div>

                    <div class="flex-1">
                        <p class="text-sm font-bold text-slate-800">
                            Change Password
                        </p>

                        <p class="text-xs text-slate-400 mt-0.5">
                            Keep your account secure
                        </p>
                    </div>

                    <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>

                </button>



                <!-- LOGOUT -->
                <a href="../Cores/logout.php" class="w-full
bg-white
border border-red-100
rounded-2xl
px-4 py-4
flex items-center
gap-4
shadow-[0_6px_20px_rgba(15,23,42,0.03)]
hover:bg-red-50
hover:border-red-200
transition">

                    <div class="w-11 h-11
           rounded-2xl
           bg-red-50
           text-red-600
           flex items-center
           justify-center
           flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                d="M17 16l4-4m0 0l-4-4m4 4H9m4 8v1a2 2 0 01-2 2H5a2 2 0 01-2-2V3a2 2 0 012-2h6a2 2 0 012 2v1" />
                        </svg>
                    </div>

                    <div class="flex-1">
                        <p class="text-sm font-bold text-red-600">
                            Logout
                        </p>

                        <p class="text-xs text-red-400 mt-0.5">
                            Sign out of your CitizenCare account
                        </p>
                    </div>

                </a>


            </div>

        </section>


        <!-- =====================================================
     FOOTER
====================================================== -->

        <div class="text-center
           mt-8
           mb-2">

            <p class="text-[11px]
               font-semibold
               text-slate-400">
                Malabon CitizenCare
            </p>

            <p class="text-[10px]
               text-slate-300
               mt-1">
                Citizen Portal
            </p>

        </div>


    </main>

    <!-- =========================================================
     BOTTOM NAVIGATION
     COPIED FROM myComplaints.html DESIGN
========================================================= -->

    <nav class="mobile-bottom-nav" aria-label="Citizen navigation">

        <div class="mobile-bottom-nav-inner">


            <!-- =================================================
         HOME
    ================================================== -->

            <a href="citizen.php" class="bottom-nav-item">

                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z" />

                </svg>

                <span>
                    Home
                </span>

            </a>


            <!-- =================================================
         COMPLAINTS
    ================================================== -->

            <a href="myComplaints.html" class="bottom-nav-item">

                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />

                    <path stroke-linecap="round" stroke-width="1.8" d="M8.5 8h7M8.5 12h7M8.5 16h4" />

                </svg>

                <span>
                    Complaints
                </span>

            </a>


            <!-- =================================================
         REPORT
    ================================================== -->

            <button type="button" class="bottom-report-button"
                onclick="window.location.href='../Complaints/complaintForm.html'">

                <span class="bottom-report-icon">

                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M12 5v14M5 12h14" />

                    </svg>

                </span>

                <span class="bottom-report-label">
                    Report
                </span>

            </button>


            <!-- =================================================
         ALERTS
    ================================================== -->

            <button id="bottomAlertsButton" type="button" class="bottom-nav-item"
                onclick="window.location.href='notifications.html'" aria-label="Alerts">

                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M15 17h5l-1.5-2.2V10a6.5 6.5 0 00-13 0v4.8L4 17h5" />

                    <path stroke-linecap="round" stroke-width="1.8" d="M10 20h4" />

                </svg>

                <span>
                    Alerts
                </span>

            </button>


            <!-- =================================================
         PROFILE
    ================================================== -->

            <a href="citizenProfile.php" class="bottom-nav-item active" aria-current="page">

                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <circle cx="12" cy="8" r="3.5" stroke-width="1.8" />

                    <path stroke-linecap="round" stroke-width="1.8" d="M5 21a7 7 0 0114 0" />

                </svg>

                <span>
                    Profile
                </span>

            </a>

        </div>


    </nav>

    <!-- =========================================================
     EDIT PROFILE MODAL
========================================================= -->

    <div id="editProfileModal" class="hidden
           fixed inset-0
           z-[100]
           bg-slate-950/60
           backdrop-blur-sm
           flex items-end
           sm:items-center
           justify-center">


        <div id="editProfilePanel" class="modal-panel
           w-full
           sm:max-w-md
           bg-white
           rounded-t-[28px]
           sm:rounded-[26px]
           shadow-2xl
           overflow-hidden
           max-h-[92vh]
           overflow-y-auto">


            <!-- MODAL HEADER -->

            <div class="flex
               items-center
               justify-between
               px-5 py-4
               border-b border-slate-100">

                <div>

                    <p class="text-[10px]
                       font-bold
                       uppercase
                       tracking-[0.14em]
                       text-blue-600">
                        Account
                    </p>

                    <h2 class="font-extrabold
                       text-lg
                       text-slate-900
                       mt-0.5">
                        Edit Profile
                    </h2>

                    <p class="text-xs
                       text-slate-400
                       mt-0.5">
                        Update your name and profile photo
                    </p>

                </div>


                <button id="closeEditProfileBtn" type="button" class="w-10 h-10
                   rounded-xl
                   flex items-center
                   justify-center
                   text-slate-400
                   hover:bg-slate-100
                   hover:text-slate-700
                   transition" aria-label="Close">

                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />

                    </svg>

                </button>

            </div>


            <!-- MODAL CONTENT -->

            <div class="px-5
               py-6
               space-y-6">


                <!-- PROFILE PHOTO -->

                <div class="text-center">

                    <div class="relative
                       inline-block">

                        <div id="editAvatarContainer" class="w-24 h-24
                           rounded-[28px]
                           bg-blue-600
                           text-white
                           flex items-center
                           justify-center
                           text-3xl
                           font-extrabold
                           overflow-hidden
                           shadow-lg
                           shadow-blue-600/15">

                            <img id="editProfileImage" class="hidden
                               w-full h-full
                               object-cover" alt="Profile preview">

                            <span id="editAvatarInitial">
                                --
                            </span>

                        </div>


                        <button id="changeProfileImageBtn" type="button" class="absolute
                           bottom-0
                           right-0
                           w-10 h-10
                           rounded-2xl
                           bg-blue-600
                           text-white
                           border-4 border-white
                           flex items-center
                           justify-center
                           shadow-md
                           hover:bg-blue-700
                           transition" aria-label="Change profile photo">

                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                                    d="M3 7h3l2-3h8l2 3h3v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />

                                <circle cx="12" cy="13" r="3" />

                            </svg>

                        </button>

                    </div>


                    <p class="text-xs
                       text-slate-400
                       mt-3">
                        JPG, PNG or WEBP · Maximum 5MB
                    </p>


                    <input id="editProfileImageInput" type="file" accept="image/jpeg,image/png,image/webp"
                        class="hidden">

                </div>


                <!-- FULL NAME -->

                <div>

                    <label for="editFullName" class="block
                       text-[10px]
                       font-bold
                       uppercase
                       tracking-[0.12em]
                       text-slate-500
                       mb-2">
                        Full Name
                    </label>

                    <input id="editFullName" type="text" maxlength="100" autocomplete="name" class="w-full
                       px-4 py-3.5
                       rounded-2xl
                       border border-slate-200
                       bg-white
                       text-sm
                       text-slate-900
                       outline-none
                       focus:border-blue-500
                       focus:ring-4
                       focus:ring-blue-100
                       transition">

                </div>


                <!-- EMAIL -->

                <div>

                    <label class="block
                       text-[10px]
                       font-bold
                       uppercase
                       tracking-[0.12em]
                       text-slate-500
                       mb-2">
                        Email Address
                    </label>

                    <div id="editEmail" class="w-full
                       px-4 py-3.5
                       rounded-2xl
                       border border-slate-200
                       bg-slate-50
                       text-sm
                       text-slate-500">
                        --
                    </div>

                    <p class="text-[11px]
                       text-slate-400
                       mt-1.5">
                        Email address cannot be changed here.
                    </p>

                </div>


                <!-- CONTACT -->

                <div>

                    <label class="block
                       text-[10px]
                       font-bold
                       uppercase
                       tracking-[0.12em]
                       text-slate-500
                       mb-2">
                        Contact Number
                    </label>

                    <div id="editContact" class="w-full
                       px-4 py-3.5
                       rounded-2xl
                       border border-slate-200
                       bg-slate-50
                       text-sm
                       text-slate-500">
                        --
                    </div>

                    <p class="text-[11px]
                       text-slate-400
                       mt-1.5">
                        Contact number cannot be changed here.
                    </p>

                </div>

            </div>


            <!-- MODAL FOOTER -->

            <div class="px-5 py-4
               border-t border-slate-100
               flex gap-3
               bg-slate-50">

                <button id="cancelEditProfileBtn" type="button" class="flex-1
                   py-3.5
                   rounded-2xl
                   border border-slate-200
                   bg-white
                   text-sm
                   font-bold
                   text-slate-700
                   hover:bg-slate-100
                   transition">
                    Cancel
                </button>


                <button id="saveProfileBtn" type="button" class="flex-1
                   py-3.5
                   rounded-2xl
                   bg-blue-600
                   text-white
                   text-sm
                   font-bold
                   hover:bg-blue-700
                   transition
                   disabled:opacity-50
                   disabled:cursor-not-allowed">
                    Save Changes
                </button>

            </div>

        </div>

    </div>

    <!-- =========================================================
     EXISTING PROFILE JAVASCRIPT
     DO NOT CHANGE
========================================================= -->

    <script src="citizenProfile.js"></script>

</body>

</html>