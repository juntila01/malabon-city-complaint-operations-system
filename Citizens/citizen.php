<?php

session_start();

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");

if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    !isset($_SESSION['user_type']) ||
    $_SESSION['user_type'] !== 'citizen'
) {
    header("Location: ../Cores/login.html");
    exit;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Citizen Portal | Malabon Support</title>


    <!-- ============================================================
         TAILWIND
    ============================================================= -->

    <script src="https://cdn.tailwindcss.com"></script>


    <!-- ============================================================
         FONT
    ============================================================= -->

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
    >


    <!-- ============================================================
         FONT AWESOME
    ============================================================= -->

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    >


    <!-- ============================================================
         CITIZEN CSS
    ============================================================= -->

    <link
        rel="stylesheet"
        href="citizen.css"
    >


    <!-- ============================================================
         PAGE-SPECIFIC UI
    ============================================================= -->

    <style>

        html {
            scroll-behavior: smooth;
        }

        body.citizen-page {
            font-family: "Inter", sans-serif;
            padding-bottom: 92px;
        }

        .citizen-page button,
        .citizen-page a {
            -webkit-tap-highlight-color: transparent;
        }

        .citizen-page ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
        }

        .citizen-page ::-webkit-scrollbar-track {
            background: transparent;
        }

        .citizen-page ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 999px;
        }

        .citizen-page ::selection {
            background: #dbeafe;
            color: #1e3a8a;
        }

        .citizen-bottom-nav {
            width: min(100% - 24px, 560px);
        }

        @media (min-width: 768px) {

            body.citizen-page {
                padding-bottom: 104px;
            }

            .citizen-bottom-nav {
                width: 560px;
            }

        }

        @media (max-width: 767px) {

            .citizen-navbar {
                box-shadow:
                    0 1px 12px rgba(15, 23, 42, 0.04);
            }

            .citizen-main {
                min-height: calc(100vh - 72px);
            }

        }


        /* ============================================================
           CITIZEN BOTTOM NAVIGATION
        ============================================================= */

        .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;

            z-index: 100;

            padding:
                8px
                12px
                calc(8px + env(safe-area-inset-bottom));

            pointer-events: none;
        }

        .mobile-bottom-nav-inner {
            max-width: 560px;
            margin: 0 auto;

            height: 68px;

            background: rgba(255, 255, 255, 0.96);

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);

            border: 1px solid rgba(226, 232, 240, 0.95);

            border-radius: 24px;

            box-shadow:
                0 14px 40px rgba(15, 23, 42, 0.13),
                0 2px 8px rgba(15, 23, 42, 0.06);

            display: grid;

            grid-template-columns:
                1fr
                1fr
                1.15fr
                1fr
                1fr;

            align-items: center;

            padding: 5px;

            pointer-events: auto;
        }

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

            transition: all 0.2s ease;

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


        /* ============================================================
           REPORT BUTTON
        ============================================================= */

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

            border: 4px solid #f8fafc;

            box-shadow:
                0 8px 20px rgba(37, 99, 235, 0.30);

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .bottom-report-button:hover .bottom-report-icon {
            transform: translateY(-2px);

            box-shadow:
                0 11px 25px rgba(37, 99, 235, 0.35);
        }

        .bottom-report-button:active .bottom-report-icon {
            transform: scale(0.95);
        }

        .bottom-report-label {
            color: #2563eb;
            margin-top: 1px;
        }


        /* ============================================================
           BOTTOM SPACE
        ============================================================= */

        .citizen-main {
            padding-bottom: 100px !important;
        }


        /* ============================================================
           VERIFICATION MODAL
        ============================================================= */

        #verificationModal {
            overscroll-behavior: contain;
            touch-action: manipulation;
        }

        #verificationModalPanel {
            overscroll-behavior: contain;
        }

        #verificationModalContent {
            overscroll-behavior: contain;
        }


        /* ============================================================
           VERIFICATION UPLOAD / PREVIEW BOX
        ============================================================= */

        #verificationUploadBox {
            min-height: 230px;
            position: relative;
            overflow: hidden;
        }

        #verificationPreviewImage {
            display: block;
        }

        #verificationPreviewImage.hidden {
            display: none;
        }

        #verificationRemovePreviewBtn {
            display: flex;
        }

        #verificationRemovePreviewBtn.hidden {
            display: none !important;
        }

        #verificationPreviewOverlay {
            display: flex;
        }

        #verificationPreviewOverlay.hidden {
            display: none;
        }

        @media (max-width: 640px) {

            #verificationUploadBox {
                min-height: 210px;
            }

        }


        /* ============================================================
           FULL-SCREEN CAMERA
           
           IMPORTANT:
           This is NOT inside verificationModal.
           
           It covers the ENTIRE viewport.
        ============================================================= */

        #verificationCameraView {
            position: fixed;

            inset: 0;

            width: 100vw;
            height: 100dvh;

            z-index: 1000;

            background: #000;

            overflow: hidden;

            overscroll-behavior: contain;

            touch-action: none;
        }

        #verificationCameraVideo {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: contain;

    background: #000;
}

#verificationCameraFrame {
    position: absolute;

    left: 50%;
    top: 50%;

    transform:
        translate(-50%, -50%);

    width: min(90vw, 560px);

    aspect-ratio: 4 / 3;

    height: auto;

    border:
        2px solid
        rgba(255,255,255,0.85);

    border-radius: 24px;

    box-shadow:
        0 0 0 9999px rgba(0,0,0,0.22);

    pointer-events: none;
}

        #verificationCameraTopBar {
            position: absolute;

            top: 0;
            left: 0;
            right: 0;

            padding:
                calc(16px + env(safe-area-inset-top))
                18px
                16px;

            z-index: 10;

            background:
                linear-gradient(
                    to bottom,
                    rgba(0,0,0,0.55),
                    rgba(0,0,0,0)
                );

            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        #verificationCameraBottomBar {
            position: absolute;

            left: 0;
            right: 0;
            bottom: 0;

            z-index: 10;

            padding:
                20px
                20px
                calc(24px + env(safe-area-inset-bottom));

            background:
                linear-gradient(
                    to top,
                    rgba(0,0,0,0.70),
                    rgba(0,0,0,0)
                );

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;

            min-height: 190px;
        }

        #verificationCaptureBtn {
            width: 78px;
            height: 78px;

            border-radius: 999px;

            background: #fff;

            border:
                6px solid
                rgba(255,255,255,0.55);

            box-shadow:
                0 8px 30px rgba(0,0,0,0.30);

            display: flex;
            align-items: center;
            justify-content: center;

            transition:
                transform 0.15s ease,
                opacity 0.15s ease;
        }

        #verificationCaptureBtn:active {
            transform: scale(0.90);
        }

        #verificationCaptureBtn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        #verificationCaptureBtnInner {
            width: 58px;
            height: 58px;

            border-radius: 999px;

            background: #fff;

            border:
                2px solid
                #cbd5e1;
        }


        /* ============================================================
           CAMERA ERROR
        ============================================================= */

        #verificationCameraError {
            z-index: 20;
        }


        /* ============================================================
           HIDDEN FORM
        ============================================================= */

        #verificationFileInput {
            display: none !important;
        }


        /* ============================================================
           MOBILE CAMERA FRAME
        ============================================================= */

        @media (max-width: 640px) {

            #verificationCameraFrame {
                width: 90vw;
                aspect-ratio: 4 / 3;
                height: auto;

                border-radius: 20px;
            }

        }

    </style>

</head>


<body class="citizen-page bg-[#f6f8fc] text-slate-900 min-h-screen">


    <!-- ============================================================
         APP HEADER
    ============================================================= -->

    <nav
        class="citizen-navbar sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/70"
    >

        <div class="max-w-6xl mx-auto px-4 sm:px-6">

            <div
                class="citizen-navbar-inner h-[72px] flex items-center justify-between"
            >

                <!-- BRAND -->

                <div
                    class="citizen-brand flex items-center gap-3 min-w-0"
                >

                    <div
                        class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"
                    >

                        <img
                            src="../assets/ahon.png"
                            alt="Malabon CitizenCare Logo"
                            class="citizen-logo w-8 h-8 object-contain"
                        >

                    </div>

                    <div class="min-w-0">

                        <span
                            class="citizen-brand-name block font-extrabold text-[15px] sm:text-base tracking-tight text-slate-900 truncate"
                        >
                            Malabon CitizenCare
                        </span>

                        <span
                            class="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"
                        >
                            Citizen Portal
                        </span>

                    </div>

                </div>


                <!-- NAV ACTIONS -->

                <div
                    class="citizen-nav-actions flex items-center gap-2"
                >

                    <!-- NOTIFICATIONS -->

                    <div
                        id="notificationWrapper"
                        class="relative shrink-0"
                    >

                        <button
                            id="notificationButton"
                            type="button"
                            class="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                            aria-label="Notifications"
                        >

                            <svg
                                class="w-[21px] h-[21px]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.8"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                ></path>

                            </svg>

                            <span
                                id="notificationBadge"
                                class="hidden absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white"
                            >
                                0
                            </span>

                        </button>


                        <div
                            id="notificationDropdown"
                            class="hidden absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[100]"
                        >

                            <div
                                class="flex items-center justify-between px-5 py-4 border-b border-slate-100"
                            >

                                <div class="min-w-0">

                                    <h3
                                        class="font-extrabold text-sm text-slate-900"
                                    >
                                        Notifications
                                    </h3>

                                    <p
                                        id="notificationSubtitle"
                                        class="text-[11px] text-slate-400 mt-0.5"
                                    >
                                        You're all caught up.
                                    </p>

                                </div>

                                <button
                                    id="markAllNotificationsBtn"
                                    type="button"
                                    class="hidden text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0 ml-3"
                                >
                                    Mark all as read
                                </button>

                            </div>


                            <div
                                id="notificationList"
                                class="max-h-[420px] overflow-y-auto"
                            >

                                <div
                                    id="notificationLoading"
                                    class="px-5 py-10 text-center"
                                >

                                    <div
                                        class="w-8 h-8 mx-auto border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"
                                    ></div>

                                    <p
                                        class="text-xs text-slate-400 mt-3"
                                    >
                                        Loading notifications...
                                    </p>

                                </div>


                                <div
                                    id="notificationEmpty"
                                    class="hidden px-5 py-10 text-center"
                                >

                                    <div
                                        class="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"
                                    >

                                        <svg
                                            class="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >

                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="1.7"
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                                            ></path>

                                        </svg>

                                    </div>

                                    <p
                                        class="text-sm font-bold text-slate-700 mt-3"
                                    >
                                        No notifications
                                    </p>

                                    <p
                                        class="text-xs text-slate-400 mt-1"
                                    >
                                        Updates about your complaints will appear here.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- PROFILE -->

                    <div
                        id="profileMenuWrapper"
                        class="relative shrink-0"
                    >

                        <button
                            id="profileButton"
                            type="button"
                            class="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-50 transition-all"
                        >

                            <img
                                id="userAvatar"
                                src="../assets/default-avatar.png"
                                alt="Profile"
                                class="w-9 h-9 rounded-2xl object-cover border border-slate-200"
                            >

                            <span
                                id="navUserName"
                                class="hidden md:block max-w-[130px] truncate text-sm font-bold text-slate-700"
                            >
                                Loading...
                            </span>

                            <svg
                                class="hidden md:block w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 9l6 6 6-6"
                                ></path>

                            </svg>

                        </button>


                        <div
                            id="profileDropdown"
                            class="hidden absolute right-0 mt-3 w-52 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100]"
                        >

                            <a
                                href="citizenProfile.php"
                                class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >

                                <span
                                    class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
                                >

                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >

                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1.8"
                                            d="M15 19a6 6 0 00-12 0m6-8a4 4 0 100-8 4 4 0 000 8zm8-2v6m3-3h-6"
                                        ></path>

                                    </svg>

                                </span>

                                My Profile

                            </a>


                            <a
                                href="../Cores/logout.php"
                                class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                            >

                                <span
                                    class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"
                                >

                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >

                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1.8"
                                            d="M15 12H3m0 0l4-4m-4 4l4 4m5-9V5a2 2 0 012-2h5a2 2 0 012 2v14a2 2 0 01-2 2v-2"
                                        ></path>

                                    </svg>

                                </span>

                                Logout

                            </a>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </nav>


    <!-- ============================================================
         MAIN CONTENT
    ============================================================= -->

    <main
        class="citizen-main w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 md:pb-10"
    >

        <div
            class="citizen-content w-full max-w-4xl mx-auto space-y-5"
        >

            <!-- GREETING -->

            <section class="px-1 pt-1">

                <div
                    class="flex items-center justify-between gap-4"
                >

                    <div class="min-w-0">

                        <p
                            class="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 mb-1"
                        >
                            Welcome
                        </p>

                        <h1
                            id="citizenGreeting"
                            class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950"
                        >
                            Hello, Citizen!
                            <span class="inline-block">👋</span>
                        </h1>

                        <p
                            class="text-sm text-slate-500 mt-1"
                        >
                            What can we help you report today?
                        </p>

                    </div>


                </div>

            </section>


            <!-- REPORT HERO -->

            <section
                class="relative overflow-hidden rounded-[28px] bg-blue-600 text-white shadow-xl shadow-blue-600/15"
            >

                <div
                    class="absolute -right-16 -top-20 w-48 h-48 rounded-full bg-white/10"
                ></div>

                <div
                    class="absolute right-10 -bottom-24 w-40 h-40 rounded-full bg-white/5"
                ></div>

                <div
                    class="relative p-5 sm:p-7"
                >

                    <div
                        class="flex items-start justify-between gap-5"
                    >

                        <div class="max-w-[75%]">

                            <div
                                id="citizenStatusBadge"
                                class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 border border-white/15 text-[10px] font-extrabold uppercase tracking-wider"
                            >

                                <span
                                    id="citizenStatusDot"
                                    class="w-1.5 h-1.5 rounded-full bg-white"
                                ></span>

                                <span id="citizenStatusText">
                                    Verified Citizen
                                </span>

                            </div>


                            <h2
                                class="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                            >
                                See something that needs attention?
                            </h2>


                            <p
                                class="mt-2 text-sm text-blue-100 leading-relaxed max-w-xl"
                            >
                                Report community issues directly to Malabon so the right team can respond.
                            </p>

                        </div>

                    </div>


                    <div
                        id="complaintAccessMessage"
                        class="hidden mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs leading-relaxed text-blue-50"
                    ></div>


                    <button
                        id="fileComplaintBtn"
                        type="button"
                        class="group relative w-full mt-5 overflow-hidden rounded-2xl bg-white text-blue-700 shadow-lg shadow-blue-950/10 border border-white/80 px-5 py-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/15 active:translate-y-0 active:scale-[0.99]"
                    >

                        <span class="flex items-center gap-3.5 min-w-0">

                            <span
                                class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25 transition-transform duration-200 group-hover:scale-105"
                            >

                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2.4"
                                        d="M12 5v14M5 12h14"
                                    ></path>

                                </svg>

                            </span>


                            <span class="text-left min-w-0">

                                <span
                                    id="fileComplaintBtnText"
                                    class="block text-sm sm:text-base font-extrabold text-slate-900"
                                >
                                    File a New Complaint
                                </span>

                                <span
                                    class="block text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5"
                                >
                                    Report an issue in your community
                                </span>

                            </span>

                        </span>


                        <span
                            class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-0.5"
                        >

                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.2"
                                    d="M5 12h14m-5-5l5 5-5 5"
                                ></path>

                            </svg>

                        </span>

                    </button>

                </div>

            </section>


            <!-- ============================================================
                 VERIFICATION CARD
            ============================================================= -->

            <section
                id="verificationCard"
                class="hidden bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-hidden"
            >

                <div
                    class="p-4 sm:p-5 flex items-start gap-3.5"
                >

                    <div
                        id="verificationIcon"
                        class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"
                    >

                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >

                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.8"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            ></path>

                        </svg>

                    </div>


                    <div
                        class="verification-inner flex-1 min-w-0"
                    >

                        <div
                            class="flex items-center justify-between gap-3"
                        >

                            <div>

                                <p
                                    class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400"
                                >
                                    Account
                                </p>

                                <h3
                                    class="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5"
                                >
                                    Verification Status
                                </h3>

                            </div>


                            <span
                                id="verificationBadge"
                                class="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 font-extrabold text-[9px] rounded-full tracking-wide uppercase shrink-0"
                            >
                                Unverified
                            </span>

                        </div>


                        <div
                            class="mt-2 flex items-center gap-1.5"
                        >

                            <span
                                id="statusDot"
                                class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"
                            ></span>

                            <p
                                id="statusTitle"
                                class="text-[10px] font-extrabold uppercase tracking-wider text-amber-700"
                            >
                                Action Required
                            </p>

                        </div>


                        <p
                            id="statusDescription"
                            class="text-xs text-slate-500 mt-2 leading-relaxed"
                        >
                            To unlock full complaint filing privileges and map routes, please provide a valid,
                            government-issued ID.
                        </p>


                        <button
                            id="uploadBtn"
                            type="button"
                            onclick="toggleVerificationModal(true)"
                            class="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 mt-3 cursor-pointer"
                        >

                            Take Photo of Valid ID

                            <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 12h14m-5-5l5 5-5 5"
                                ></path>

                            </svg>

                        </button>

                    </div>

                </div>

            </section>


            <!-- ACTIVITY SNAPSHOT -->

            <section>

                <div
                    class="flex items-center justify-between px-1 mb-3"
                >

                    <div>

                        <p
                            class="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-600"
                        >
                            Overview
                        </p>

                        <h2
                            class="text-lg font-extrabold text-slate-900 mt-0.5"
                        >
                            My Activity
                        </h2>

                    </div>

                </div>


                <div
                    class="grid grid-cols-2 gap-3"
                >

                    <!-- PENDING -->

                    <div
                        class="relative overflow-hidden bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-4 sm:p-5"
                    >

                        <div
                            class="flex items-start justify-between gap-2"
                        >

                            <div
                                class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"
                            >

                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.8"
                                        d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>

                                </svg>

                            </div>


                            <span
                                id="pendingCount"
                                class="text-2xl font-extrabold text-slate-900"
                            >
                                0
                            </span>

                        </div>


                        <p
                            class="text-xs sm:text-sm font-bold text-slate-600 mt-4"
                        >
                            Pending Reports
                        </p>

                        <p
                            class="text-[10px] text-slate-400 mt-0.5"
                        >
                            Still being processed
                        </p>

                    </div>


                    <!-- RESOLVED -->

                    <div
                        class="relative overflow-hidden bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-4 sm:p-5"
                    >

                        <div
                            class="flex items-start justify-between gap-2"
                        >

                            <div
                                class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"
                            >

                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.8"
                                        d="M5 13l4 4L19 7"
                                    ></path>

                                </svg>

                            </div>


                            <span
                                id="resolvedCount"
                                class="text-2xl font-extrabold text-slate-900"
                            >
                                0
                            </span>

                        </div>


                        <p
                            class="text-xs sm:text-sm font-bold text-slate-600 mt-4"
                        >
                            Resolved Issues
                        </p>

                        <p
                            class="text-[10px] text-slate-400 mt-0.5"
                        >
                            Successfully completed
                        </p>

                    </div>

                </div>

            </section>


            <!-- MY COMPLAINTS -->

            <section
                class="bg-white rounded-[26px] border border-slate-200/80 shadow-sm overflow-hidden"
            >

                <div
                    class="p-5 sm:p-6"
                >

                    <div
                        class="flex items-start justify-between gap-4"
                    >

                        <div>

                            <p
                                class="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-600"
                            >
                                Activity
                            </p>

                            <h2
                                class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1"
                            >
                                My Complaints
                            </h2>

                            <p
                                class="text-sm text-slate-500 mt-1 leading-relaxed"
                            >
                                Track your submitted complaints and leave feedback after they are completed.
                            </p>

                        </div>

                    </div>


                    <button
                        id="viewComplaintsBtn"
                        type="button"
                        class="w-full mt-5 bg-slate-950 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >

                        View My Complaints

                        <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >

                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 12h14m-5-5l5 5-5 5"
                            ></path>

                        </svg>

                    </button>

                </div>

            </section>


            <!-- TRUST FOOTER -->

            <div
                class="pt-1 pb-2 text-center"
            >

                <div
                    class="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400"
                >

                    <span
                        class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    ></span>

                    Your reports help improve the Malabon community

                </div>

            </div>

        </div>

    </main>


    <!-- ============================================================
         CITIZEN BOTTOM NAVIGATION
    ============================================================= -->

    <nav
        class="mobile-bottom-nav"
        aria-label="Citizen navigation"
    >

        <div class="mobile-bottom-nav-inner">

            <button
                type="button"
                class="bottom-nav-item active"
                onclick="window.scrollTo({top: 0, behavior: 'smooth'})"
                aria-current="page"
            >

                <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z"
                    />

                </svg>

                <span>Home</span>

            </button>


            <button
                type="button"
                class="bottom-nav-item"
                onclick="document.getElementById('viewComplaintsBtn')?.click()"
            >

                <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />

                    <path
                        stroke-linecap="round"
                        stroke-width="1.8"
                        d="M8.5 8h7M8.5 12h7M8.5 16h4"
                    />

                </svg>

                <span>Complaints</span>

            </button>


            <button
                type="button"
                class="bottom-report-button"
                onclick="document.getElementById('fileComplaintBtn')?.click()"
            >

                <span class="bottom-report-icon">

                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.4"
                            d="M12 5v14M5 12h14"
                        />

                    </svg>

                </span>

                <span class="bottom-report-label">
                    Report
                </span>

            </button>


            <button
                type="button"
                class="bottom-nav-item"
                onclick="document.getElementById('notificationButton')?.click()"
            >

                <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M15 17h5l-1.5-2.2V10a6.5 6.5 0 00-13 0v4.8L4 17h5"
                    />

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M10 20h4"
                    />

                </svg>

                <span>Alerts</span>

            </button>


            <button
                type="button"
                class="bottom-nav-item"
                onclick="window.location.href='citizenProfile.php'"
            >

                <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >

                    <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                        stroke-width="1.8"
                    />

                    <path
                        stroke-linecap="round"
                        stroke-width="1.8"
                        d="M5 21a7 7 0 0114 0"
                    />

                </svg>

                <span>Profile</span>

            </button>

        </div>

    </nav>


    <!-- ============================================================
         SINGLE VERIFICATION MODAL
         
         THIS IS ONLY THE DOCUMENT VERIFICATION MODAL.
         
         The camera itself is NOT inside this modal.
    ============================================================= -->

    <div
        id="verificationModal"
        class="hidden fixed inset-0 z-[500] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
    >

        <div
            id="verificationModalPanel"
            class="relative w-full max-w-md max-h-[92vh] bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        >

            <!-- HEADER -->

            <div
                id="verificationHeader"
                class="shrink-0 px-5 sm:px-6 py-5 border-b border-slate-100 bg-white"
            >

                <div
                    class="flex items-start justify-between gap-4"
                >

                    <div class="min-w-0">

                        <p
                            class="text-[9px] font-extrabold uppercase tracking-[0.15em] text-blue-600"
                        >
                            Account Verification
                        </p>

                        <h2
                            id="verificationModalTitle"
                            class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1"
                        >
                            Verify Your Account
                        </h2>

                        <p
                            id="verificationModalDescription"
                            class="text-xs text-slate-500 mt-1.5 leading-relaxed"
                        >
                            Take a clear photo of your Valid ID using your camera.
                        </p>

                    </div>


                    <!-- CLOSE MODAL -->

                    <button
                        id="verificationCloseModalBtn"
                        type="button"
                        class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 shrink-0"
                        aria-label="Close verification"
                    >

                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >

                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>

                        </svg>

                    </button>

                </div>

            </div>


            <!-- CONTENT -->

            <div
                id="verificationModalContent"
                class="overflow-y-auto flex-1 p-5 sm:p-6"
            >

                <!-- =================================================
                     UPLOAD / PREVIEW BOX
                     
                     BEFORE CAPTURE:
                     Take a Photo
                     
                     AFTER CAPTURE:
                     Image preview
                ================================================== -->

                <div
                    id="verificationUploadBox"
                    role="button"
                    tabindex="0"
                    aria-label="Take photo of Valid ID"
                    class="relative w-full min-h-[230px] border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >

                    <!-- PLACEHOLDER -->

                    <div
                        id="verificationUploadPlaceholder"
                        class="flex flex-col items-center justify-center px-6 py-8 pointer-events-none"
                    >

                        <div
                            class="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4"
                        >

                            <i
                                class="fa-solid fa-camera text-xl text-blue-600"
                            ></i>

                        </div>


                        <p
                            class="text-sm font-bold text-slate-800"
                        >
                            Take a Photo
                        </p>


                        <p
                            class="text-xs text-slate-500 mt-1"
                        >
                            Tap here to open your camera
                        </p>


                        <p
                            class="text-[11px] text-slate-400 mt-3"
                        >
                            Capture your valid ID clearly
                        </p>

                    </div>


                    <!-- IMAGE PREVIEW -->

                    <img
                        id="verificationPreviewImage"
                        src=""
                        alt="Captured Valid ID Preview"
                        class="hidden absolute inset-0 w-full h-full object-contain bg-black"
                    >


                    <!-- PREVIEW OVERLAY -->

                    <div
                        id="verificationPreviewOverlay"
                        class="hidden absolute inset-0 bg-black/25 items-center justify-center pointer-events-none z-10"
                    >

                        <span
                            class="px-3 py-2 rounded-xl bg-black/70 text-white text-[10px] font-bold"
                        >
                            Tap to retake photo
                        </span>

                    </div>


                    <!-- REMOVE CAPTURE -->

                    <button
                        id="verificationRemovePreviewBtn"
                        type="button"
                        class="hidden absolute top-3 right-3 z-30 w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white border border-white/30 items-center justify-center shadow-lg transition-all active:scale-95"
                        aria-label="Remove captured image"
                        title="Remove captured image"
                    >

                        <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >

                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>

                        </svg>

                    </button>

                </div>


                <!-- FILE NAME -->

                <div
                    id="verificationFileInfo"
                    class="hidden mt-3"
                >

                    <div
                        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >

                        <p
                            class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400"
                        >
                            Captured File
                        </p>

                        <p
                            id="verificationFileNameDisplay"
                            class="text-xs font-bold text-slate-700 mt-1 break-all"
                        ></p>

                    </div>

                </div>


                <!-- FILE SIZE -->

                <div
                    id="verificationFileSizeRow"
                    class="hidden mt-2 px-1 flex items-center justify-between"
                >

                    <span
                        class="text-[10px] text-slate-400"
                    >
                        File size
                    </span>

                    <span
                        id="verificationCaptureSize"
                        class="text-[10px] font-bold text-slate-500"
                    ></span>

                </div>


                <!-- CAMERA ERROR -->

                <div
                    id="verificationCameraError"
                    class="hidden mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3"
                >

                    <div
                        class="flex items-start gap-3"
                    >

                        <div
                            class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"
                        >

                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.8"
                                    d="M12 9v4m0 4h.01M5.2 19h13.6c1.2 0 1.95-1.3 1.35-2.35L13.35 4.8c-.6-1.05-2.1-1.05-2.7 0L3.85 16.65C3.25 17.7 4 19 5.2 19z"
                                ></path>

                            </svg>

                        </div>


                        <p
                            id="verificationCameraErrorText"
                            class="text-xs text-red-700 leading-relaxed pt-1"
                        ></p>

                    </div>

                </div>


                <!-- INFORMATION -->

                <div
                    id="verificationInformation"
                    class="mt-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3"
                >

                    <div
                        class="flex items-start gap-3"
                    >

                        <div
                            class="w-8 h-8 rounded-xl bg-white text-blue-600 border border-blue-100 flex items-center justify-center shrink-0"
                        >

                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.8"
                                    d="M12 11v5m0-9h.01M5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z"
                                ></path>

                            </svg>

                        </div>


                        <p
                            class="text-[10px] sm:text-xs text-blue-800 leading-relaxed"
                        >
                            Make sure the entire ID is visible, readable, and well lit.
                            Avoid glare or covering any part of the ID.
                        </p>

                    </div>

                </div>


                <!-- CANVAS -->

                <canvas
                    id="verificationCaptureCanvas"
                    class="hidden"
                ></canvas>

            </div>


            <!-- =====================================================
                SUBMIT SECTION
            ====================================================== -->

            <div
                id="verificationSubmitSection"
                class="flex shrink-0 justify-center px-5 sm:px-6 py-4 border-t border-slate-100 bg-white"
            >
                <button
                    type="button"
                    id="verificationSubmitBtn"
                    onclick="handleFormSubmission(event)"
                    class="w-full max-w-sm py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold cursor-pointer transition-all"
                >
                    Submit Verification
                </button>
            </div>

        </div>

    </div>


    <!-- ============================================================
         FULL-SCREEN CAMERA
         
         IMPORTANT:
         
         This is OUTSIDE verificationModal.
         
         It covers the entire browser viewport.
         
         getUserMedia() will trigger the browser's native camera
         permission prompt when the user taps "Take a Photo".
    ============================================================= -->

    <div
        id="verificationCameraView"
        class="hidden"
        aria-hidden="true"
    >

        <!-- CAMERA VIDEO -->

        <video
            id="verificationCameraVideo"
            autoplay
            playsinline
            muted
        ></video>


        <!-- TOP BAR -->

        <div
            id="verificationCameraTopBar"
        >



        </div>

        <!-- BOTTOM CAMERA CONTROLS -->

        <div
            id="verificationCameraBottomBar"
        >


            <div class="flex items-center justify-center gap-5">

    <button
        type="button"
        id="verificationCloseCameraBtn"
        class="w-12 h-12 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center border border-white/15 active:scale-95 transition"
        aria-label="Close camera"
    >
        <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            ></path>
        </svg>
    </button>

    <button
        type="button"
        id="verificationCaptureBtn"
        disabled
        aria-label="Capture Valid ID"
    >
        <div
            id="verificationCaptureBtnInner"
        ></div>
    </button>

</div>

        </div>


        <!-- CAMERA ERROR -->

        <div
            id="verificationCameraFullscreenError"
            class="hidden absolute left-4 right-4 top-1/2 -translate-y-1/2 z-30"
        >

            <div
                class="max-w-md mx-auto rounded-3xl bg-white p-6 shadow-2xl text-center"
            >

                <div
                    class="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"
                >

                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                            d="M12 9v4m0 4h.01M5.2 19h13.6c1.2 0 1.95-1.3 1.35-2.35L13.35 4.8c-.6-1.05-2.1-1.05-2.7 0L3.85 16.65C3.25 17.7 4 19 5.2 19z"
                        ></path>

                    </svg>

                </div>


                <h3
                    class="text-base font-extrabold text-slate-900 mt-4"
                >
                    Camera Access Required
                </h3>


                <p
                    id="verificationCameraFullscreenErrorText"
                    class="text-xs text-slate-500 leading-relaxed mt-2"
                >
                    Please allow camera access in your browser to take a photo.
                </p>


                <button
                    type="button"
                    id="verificationCameraErrorCloseBtn"
                    class="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                    Close Camera
                </button>

            </div>

        </div>

    </div>


    <!-- ============================================================
         HIDDEN VERIFICATION FORM
         
         IMPORTANT:
         
         The file input is NEVER clicked.
         
         The camera capture JS creates a File object and assigns
         it to this input so upload_attachment_citizen.php can
         continue receiving:
         
             barangay_clearance
         
         No file picker is shown.
    ============================================================= -->

    <form
        id="uploadDocForm"
        method="POST"
        action="upload_attachment_citizen.php"
        enctype="multipart/form-data"
        class="hidden"
    >

        <input
            type="file"
            id="verificationFileInput"
            name="Valid_ID"
            accept="image/jpeg,image/png"
            class="hidden"
            tabindex="-1"
            aria-hidden="true"
        >


        <input
            type="hidden"
            id="verificationCameraCapture"
            name="camera_capture"
            value="1"
        >

    </form>


    <!-- ================================================================
         RESPONSE MODAL
    ================================================================= -->

    <div
        id="responseModal"
        class="hidden fixed inset-0 z-[800] flex items-center justify-center p-4"
    >

        <div
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        ></div>


        <div
            class="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl border border-slate-100"
        >

            <div
                id="modalStatusCircle"
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4"
            >

                <span
                    id="modalStatusIcon"
                    class="text-lg font-bold"
                ></span>

            </div>


            <div>

                <h3
                    id="responseModalTitle"
                    class="text-base font-bold text-slate-900"
                >
                    Notification
                </h3>


                <div class="mt-2">

                    <p
                        id="responseModalMessage"
                        class="text-sm text-slate-500 leading-relaxed"
                    ></p>

                </div>

            </div>


            <div
                class="mt-6 flex justify-center"
            >

                <button
                    id="responseModalCloseBtn"
                    type="button"
                    class="w-24 inline-flex justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none transition-all active:scale-95"
                >
                    OK
                </button>

            </div>

        </div>

    </div>


    <!-- ================================================================
         COMPLAINT DETAILS MODAL
    ================================================================= -->

    <div
        id="complaintModal"
        class="hidden fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >

        <div
            class="complaint-modal-panel bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        >

            <div
                class="shrink-0 px-6 py-5 border-b border-slate-200 bg-white"
            >

                <div
                    class="flex items-start justify-between gap-4"
                >

                    <div class="min-w-0">

                        <div
                            class="flex items-center gap-2 mb-1.5"
                        >

                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-700"
                            >

                                <span
                                    class="w-1.5 h-1.5 rounded-full bg-blue-500"
                                ></span>

                                Complaint Details

                            </span>

                        </div>


                        <h2
                            class="text-xl sm:text-2xl font-bold text-slate-900 leading-tight"
                        >

                            <span id="modalCategory">
                                Complaint Details
                            </span>

                        </h2>


                        <p
                            class="text-xs text-slate-500 mt-1"
                        >
                            Details and updates for this complaint
                        </p>

                    </div>


                    <button
                        type="button"
                        onclick="closeComplaintModal()"
                        class="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        aria-label="Close complaint details"
                    >

                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >

                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>

                        </svg>

                    </button>

                </div>

            </div>


            <div
                class="overflow-y-auto flex-1"
            >

                <div
                    class="p-6 space-y-6"
                >

                    <!-- STATUS / PRIORITY -->

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >

                        <div
                            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >

                            <p
                                class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2"
                            >
                                Current Status
                            </p>


                            <div
                                class="flex items-center gap-2"
                            >

                                <span
                                    class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"
                                ></span>

                                <p
                                    id="modalStatus"
                                    class="text-sm font-bold text-slate-800 break-words"
                                >
                                    Unknown
                                </p>

                            </div>

                        </div>


                        <div
                            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >

                            <p
                                class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2"
                            >
                                Priority Level
                            </p>


                            <div
                                class="flex items-center gap-2"
                            >

                                <span
                                    class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"
                                ></span>

                                <p
                                    id="modalUrgency"
                                    class="text-sm font-bold text-slate-800 break-words"
                                >
                                    Unknown
                                </p>

                            </div>

                        </div>

                    </div>


                    <!-- EVIDENCE -->

                    <section>

                        <div
                            class="flex items-center justify-between mb-3"
                        >

                            <div>

                                <p
                                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                    Evidence
                                </p>

                                <h3
                                    class="text-sm font-bold text-slate-800 mt-0.5"
                                >
                                    Complaint Attachment
                                </h3>

                            </div>

                        </div>


                        <div
                            class="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
                        >

                            <img
                                id="modalComplaintImage"
                                class="hidden w-full max-h-[360px] object-contain bg-slate-100"
                                alt="Complaint attachment"
                            >

                        </div>


                        <div
                            id="modalVideoContainer"
                            class="hidden w-full bg-black rounded-2xl overflow-hidden border border-slate-200"
                        >

                            <video
                                id="modalComplaintVideo"
                                class="w-full max-h-[420px] bg-black object-contain"
                                controls
                                controlsList="nodownload"
                                playsinline
                                preload="metadata"
                            ></video>

                        </div>

                    </section>


                    <!-- DESCRIPTION -->

                    <section>

                        <div
                            class="flex items-center gap-2 mb-3"
                        >

                            <div>

                                <p
                                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                    Complaint
                                </p>

                                <h3
                                    class="text-sm font-bold text-slate-800"
                                >
                                    Description
                                </h3>

                            </div>

                        </div>


                        <div
                            class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                        >

                            <p
                                id="modalDescription"
                                class="text-sm text-slate-700 leading-7 whitespace-pre-line break-words"
                            ></p>

                        </div>

                    </section>


                    <!-- LOCATION -->

                    <section>

                        <div
                            class="flex items-center gap-2 mb-3"
                        >

                            <div
                                class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"
                            >

                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.8"
                                        d="M12 21s7-5.4 7-12a7 7 0 10-14 0c0 6.6 7 12 7 12z"
                                    ></path>

                                    <circle
                                        cx="12"
                                        cy="9"
                                        r="2.2"
                                        stroke-width="1.8"
                                    ></circle>

                                </svg>

                            </div>


                            <div>

                                <p
                                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                    Location
                                </p>

                                <h3
                                    class="text-sm font-bold text-slate-800"
                                >
                                    Where it was reported
                                </h3>

                            </div>

                        </div>


                        <div
                            class="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100"
                        >

                            <div
                                class="px-5 py-4"
                            >

                                <p
                                    class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
                                >
                                    Reported Location
                                </p>

                                <p
                                    id="modalLocation"
                                    class="text-sm font-semibold text-slate-800 leading-relaxed break-words"
                                >
                                    Unknown
                                </p>

                            </div>


                            <div
                                class="px-5 py-4"
                            >

                                <p
                                    class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
                                >
                                    Nearby Landmark
                                </p>

                                <p
                                    id="modalLandmark"
                                    class="text-sm text-slate-600 leading-relaxed break-words"
                                >
                                    Looking for nearby landmark...
                                </p>

                            </div>

                        </div>
                    </section>
                    <!-- REPRT INFORMATION -->
                    <section>
                        <div
                            class="flex items-center gap-2 mb-3"
                        >
                            <div
                                class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"
                            >
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.8"
                                        d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                                    ></path>
                                </svg>
                            </div>
                            <div>
                                <p
                                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                    Report Information
                                </p>
                                <h3
                                    class="text-sm font-bold text-slate-800"
                                >
                                    Submission Details
                                </h3>
                            </div>
                        </div>
                        <div
                            class="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4"
                        >
                            <p
                                class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
                            >
                                Submitted
                            </p>
                            <p
                                id="modalDate"
                                class="text-sm font-semibold text-slate-700 break-words"
                            ></p>
                        </div>
                    </section>
                </div>
            </div>
            <!-- FOOTER -->
            <div
                class="shrink-0 px-6 py-4 border-t border-slate-200 bg-white flex justify-end"
            >
                <button
                    type="button"
                    onclick="closeComplaintModal()"
                    class="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all active:scale-[0.98]">Close
                </button>
            </div>
        </div>
    </div>
    <!-- ================================================================
         GOOGLE MAPS
    ================================================================= -->
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"></script>
    <!-- ===============================================================
         CITIZEN JAVASCRIPT
    ================================================================= -->
    <script src="citizen.js"></script>
</body>
</html>