<?php

require_once __DIR__ . "/Cores/auth.php";
requireRole(['admin', 'staff']);

$currentRole = currentRole();
$currentDepartment = currentDepartment();

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Malabon Complaint Management</title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        /* =====================================================
           SIDEBAR BACKGROUND
           ===================================================== */

        #sidebar {
            width: 256px;
            flex: 0 0 256px;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;

            background-color: #ffffff;
            background-image:
                linear-gradient(
                    rgba(255, 255, 255, 0.93),
                    rgba(255, 255, 255, 0.93)
                ),
                url('/Complaint/assets/malaboncityhall.jpg');

            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;

            transition:
                width 0.25s ease,
                flex-basis 0.25s ease,
                transform 0.25s ease;
        }

        #sidebar .sidebar-link {
            min-width: 0;
        }

        #sidebar .sidebar-link i {
            width: 1rem;
            min-width: 1rem;
            text-align: center;
        }

        #sidebar .sidebar-text {
            transition: opacity 0.2s ease;
        }

        #sidebarBrand {
            transition: opacity 0.2s ease;
        }

        /* =====================================================
           TABLET: COMPACT ICON SIDEBAR
           ===================================================== */

        @media (min-width: 768px) and (max-width: 1279px) {

            #sidebar {
                width: 80px;
                flex-basis: 80px;
            }

            #sidebar .sidebar-text,
            #sidebar .sidebar-section-title,
            #sidebar #sidebarBrand {
                display: none !important;
            }

            #sidebar .sidebar-link {
                justify-content: center;
                padding-left: 0.75rem;
                padding-right: 0.75rem;
            }

            #sidebar .sidebar-link i {
                margin: 0;
            }

            #sidebar .sidebar-brand-row {
                justify-content: center;
                padding-left: 0;
                padding-right: 0;
            }

            #sidebar .sidebar-navigation {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
            }

            #sidebar #logoutBtn {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
                font-size: 0;
            }

            #sidebar #logoutBtn i {
                margin-right: 0;
                font-size: 0.875rem;
            }
        }

        /* =====================================================
           MOBILE: OFF-CANVAS SIDEBAR
           ===================================================== */

        @media (max-width: 767px) {

            #sidebar {
                position: fixed;
                top: 0;
                bottom: 0;
                left: 0;

                width: min(280px, 85vw);
                max-width: 85vw;
                height: 100dvh;

                flex: none;
                z-index: 60;

                transform: translateX(-105%);
                visibility: hidden;

                box-shadow: none;
            }

            #sidebar.mobile-sidebar-open {
                transform: translateX(0);
                visibility: visible;

                box-shadow: 12px 0 35px rgba(0, 0, 0, 0.12);
            }

            #sidebar .sidebar-text,
            #sidebar .sidebar-section-title,
            #sidebar #sidebarBrand {
                display: block;
                opacity: 1;
            }

            #sidebar .sidebar-link {
                justify-content: flex-start;
                padding-left: 1rem;
                padding-right: 1rem;
            }

            #sidebar .sidebar-link i {
                margin: 0;
            }

            #sidebar .sidebar-navigation {
                padding-left: 1rem;
                padding-right: 1rem;
            }

            #sidebar #logoutBtn {
                font-size: 0.875rem;
                padding-left: 1rem;
                padding-right: 1rem;
            }

            #sidebar #logoutBtn i {
                font-size: 0.875rem;
                margin-right: 0.5rem;
            }

            #sidebar .sidebar-brand-row {
                justify-content: flex-start;
                padding-left: 1rem;
                padding-right: 1rem;
            }
        }

        /* =====================================================
           MOBILE SIDEBAR OVERLAY
           ===================================================== */

        #sidebarOverlay {
            position: fixed;
            inset: 0;
            z-index: 50;

            background: rgba(17, 24, 39, 0.45);

            opacity: 0;
            visibility: hidden;
            pointer-events: none;

            transition:
                opacity 0.25s ease,
                visibility 0.25s ease;
        }

        #sidebarOverlay.active {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        /* =====================================================
           HEADER PROFILE
           ===================================================== */

        #headerProfile {
            max-width: 240px;
            min-width: 0;
        }

        #headerProfile:focus-visible,
        #mobileMenuBtn:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 3px;
        }

        /* =====================================================
           RESPONSIVE CONTENT
           ===================================================== */

        @media (max-width: 767px) {

            #dashboardHeader {
                height: 64px;
                padding-left: 0.75rem;
                padding-right: 0.75rem;
            }

            #page-title {
                font-size: 0.95rem;
            }

            #departmentLabel {
                font-size: 10px;
            }

            #content-area {
                padding: 0.75rem;
            }

            #headerProfile {
                padding: 0.25rem;
                gap: 0;
            }

            #headerProfileImage,
            #headerProfileInitials {
                width: 2.25rem;
                height: 2.25rem;
            }

            #notificationDropdown {
                position: fixed;
                top: 70px;
                right: 0.5rem;
                left: 0.5rem;
                width: auto;
                max-width: none;
            }

            #logoutModal > div {
                width: calc(100vw - 2rem);
                max-width: 24rem;
                padding: 1.5rem;
            }
        }

        body.sidebar-open {
            overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
            #sidebar,
            #sidebarOverlay {
                transition: none;
            }
        }
    </style>
</head>

<body class="bg-gray-50/50 font-sans text-gray-800 antialiased">

    <div class="flex h-screen h-[100dvh] overflow-hidden">

        <!-- =====================================================
             SIDEBAR
             ===================================================== -->

        <aside
            id="sidebar"
            aria-label="Main navigation"
            class="bg-white border-r border-gray-100 flex flex-col justify-between shrink-0">

            <div class="relative z-10 min-w-0">

                <div class="sidebar-brand-row h-20 flex items-center px-4 gap-3">

                    <img
                        src="/Complaint/assets/ahon.png"
                        alt="Malabon Ahon Logo"
                        class="w-10 h-10 object-contain shrink-0">

                    <span
                        id="sidebarBrand"
                        class="font-bold text-gray-900 tracking-tight text-lg whitespace-nowrap overflow-hidden">
                        Malabon Complaints
                    </span>

                </div>

                <div class="mx-4 border-t border-gray-300"></div>

                <nav class="sidebar-navigation px-4 pt-4 space-y-1">

                    <p class="sidebar-section-title px-4 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                        MANAGEMENT
                    </p>

                    <a
                        href="overview.html"
                        data-link
                        title="Dashboard"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-house text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Dashboard
                        </span>
                    </a>

                    <a
                        href="/Complaint/Complaints/complaint.html"
                        data-link
                        title="Complaints"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-inbox text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Complaints
                        </span>
                    </a>

                    <a
                        href="/Complaint/Feedback/feedback.html"
                        data-link
                        title="Feedback"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-star text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Feedback
                        </span>
                    </a>

                    <a
                        id="activityLogsLink"
                        href="/Complaint/Reports/operationalReports.php"
                        data-link
                        title="Activity Logs"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-clipboard-list text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Activity Logs
                        </span>
                    </a>

                    <a
                        href="/Complaint/Reports/operationsOverview.html"
                        data-link
                        title="Reports"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-chart-column text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Reports
                        </span>
                    </a>

                    <p class="sidebar-section-title px-4 pt-4 mb-2 text-[10px] uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                        USERS
                    </p>

                    <a
                        href="/Complaint/Dispatchs/dispatch.html"
                        data-link
                        title="Dispatch Teams"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-crosshairs text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Dispatch Teams
                        </span>
                    </a>

                    <a
                        href="/Complaint/Users/systemUsers.html"
                        data-link
                        title="System Users"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-users text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            System Users
                        </span>
                    </a>

                    <a
                        id="citizenUsersLink"
                        href="/Complaint/Citizens/citizenUsers.html"
                        data-link
                        title="Citizen Users"
                        class="sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-medium group">

                        <i class="fa-solid fa-users text-gray-400 group-hover:text-blue-600 transition"></i>

                        <span class="sidebar-text whitespace-nowrap">
                            Citizen Users
                        </span>
                    </a>

                </nav>
            </div>

            <!-- Sidebar bottom: logout -->

            <div class="relative z-10 p-4 mt-4">

                <button
                    id="logoutBtn"
                    type="button"
                    title="Logout"
                    class="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition">

                    <i class="fa-solid fa-right-from-bracket mr-2"></i>

                    <span class="sidebar-text whitespace-nowrap">
                        Logout
                    </span>
                </button>

            </div>

        </aside>

        <div id="sidebarOverlay" aria-hidden="true"></div>

        <!-- =====================================================
             MAIN WINDOW
             ===================================================== -->

        <div class="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-white">

            <header
                id="dashboardHeader"
                class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-5 lg:px-10 shrink-0 z-40">

                <div class="flex items-center gap-3 min-w-0">

                    <button
                        id="mobileMenuBtn"
                        type="button"
                        aria-label="Open navigation menu"
                        aria-controls="sidebar"
                        aria-expanded="false"
                        class="md:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition">

                        <i id="mobileMenuIcon" class="fa-solid fa-bars text-lg"></i>

                    </button>

                    <div class="flex flex-col justify-center min-w-0">

                        <h1
                            id="page-title"
                            class="text-lg font-bold text-gray-900 tracking-tight leading-tight truncate">
                            Dashboard
                        </h1>

                        <div
                            id="departmentLabel"
                            class="text-[11px] text-blue-600 font-semibold mt-0.5 truncate">
                            --
                        </div>

                    </div>

                </div>

                <div class="flex items-center gap-1 sm:gap-3 shrink-0">

                    <!-- Notifications -->

                    <div class="relative">

                        <button
                            id="notificationBtn"
                            type="button"
                            class="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            aria-label="Notifications"
                            aria-expanded="false">

                            <i class="fa-regular fa-bell text-lg"></i>

                            <span
                                id="notificationBadge"
                                class="hidden absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold items-center justify-center border-2 border-white">
                                0
                            </span>

                        </button>

                        <div
                            id="notificationDropdown"
                            class="hidden absolute right-0 top-12 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">

                            <div class="flex items-center justify-between px-4 py-3 border-b gap-2">

                                <div class="min-w-0">

                                    <h3 class="font-semibold text-gray-900 text-sm">
                                        Notifications
                                    </h3>

                                    <p
                                        id="notificationSubtitle"
                                        class="text-xs text-gray-500 mt-1">
                                        Important incidents and overdue complaints
                                    </p>

                                </div>

                                <button
                                    id="markNotificationsRead"
                                    type="button"
                                    class="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                    Mark all read
                                </button>

                            </div>

                            <div
                                id="notificationList"
                                class="max-h-96 overflow-y-auto divide-y divide-gray-100">

                                <div class="p-6 text-center text-sm text-gray-500">
                                    Loading notifications...
                                </div>

                            </div>

                            <div class="border-t px-4 py-3 text-center">

                                <button
                                    id="viewAllNotifications"
                                    type="button"
                                    class="text-sm font-medium text-blue-600 hover:text-blue-800">
                                    View Complaints
                                </button>

                            </div>

                        </div>

                    </div>

                    <div class="h-8 w-px bg-gray-100 mx-1"></div>

                    <!-- Header profile -->

                    <button
                        id="headerProfile"
                        type="button"
                        title="My Profile"
                        aria-label="Open my profile"
                        class="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition text-left">

                        <div class="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">

                            <img
                                id="headerProfileImage"
                                src=""
                                alt="Profile"
                                class="w-full h-full object-cover hidden">

                            <span
                                id="headerProfileInitials"
                                class="text-blue-600 font-semibold text-xs">
                                U
                            </span>

                        </div>

                        <div class="hidden sm:block max-w-[160px] min-w-0">

                            <p
                                id="headerProfileName"
                                class="text-sm font-semibold text-gray-900 truncate">
                                Loading...
                            </p>

                            <p
                                id="headerProfileRole"
                                class="text-[11px] text-gray-400 capitalize truncate">
                                --
                            </p>

                        </div>

                    </button>

                </div>

            </header>

            <main
                id="content-area"
                class="flex-1 min-w-0 overflow-y-auto p-5 bg-gray-50/30">
            </main>

        </div>

    </div>
    <!-- ================================================================
     EMERGENCY CLUSTER MODAL
================================================================ -->

<div id="emergencyClusterModal" class="fixed inset-0 z-[9999] hidden
            items-center justify-center
            bg-black/60 backdrop-blur-sm px-4">

    <div id="emergencyClusterModalContent" class="w-full max-w-md bg-white
                rounded-2xl shadow-2xl overflow-hidden">

        <div class="bg-red-600 px-6 py-5 text-white">

            <div class="flex items-center gap-4">

                <div class="w-12 h-12 rounded-full
                            bg-white/20
                            flex items-center justify-center
                            shrink-0">

                    <i class="fa-solid fa-triangle-exclamation
                              text-2xl">
                    </i>

                </div>


                <div>

                    <p class="text-xs font-bold uppercase
                              tracking-widest text-red-100">

                        Emergency Alert

                    </p>


                    <h2 id="emergencyModalSeverity" class="text-2xl font-bold">

                        EMERGENCY

                    </h2>

                </div>

            </div>

        </div>


        <div class="px-6 py-6">

            <div class="text-center">

                <div id="emergencyModalCategoryIcon" class="mx-auto w-16 h-16 rounded-2xl
                            bg-red-50 flex items-center
                            justify-center">

                    <i class="fa-solid fa-fire
                              text-red-600 text-3xl">
                    </i>

                </div>


                <h3 id="emergencyModalCategory" class="mt-4 text-xl font-bold text-gray-900">

                    FIRE INCIDENT

                </h3>


                <p id="emergencyModalDescription"
                    class="mt-2 text-sm text-gray-500">

                        Multiple complaints have been reported
                        within the same nearby area.

                    </p>

            </div>


            <div class="grid grid-cols-2 gap-3 mt-6">

                <div class="rounded-xl bg-gray-50
                            border border-gray-100
                            p-4 text-center">

                    <p id="emergencyModalComplaintCount" class="text-2xl font-bold text-gray-900">

                        0

                    </p>


                    <p id="emergencyModalCountLabel"
                        class="mt-1 text-xs text-gray-500">

                            Nearby Complaints

                        </p>

                </div>


                <div class="rounded-xl bg-red-50
                            border border-red-100
                            p-4 text-center">

                    <p id="emergencyModalHighCount" class="text-2xl font-bold text-red-600">

                        0

                    </p>


                    <p class="mt-1 text-xs text-red-500">
                        High Urgency
                    </p>

                </div>

            </div>


            <div class="mt-4 rounded-xl bg-gray-50
                       border border-gray-100 p-4">

                <div class="flex items-start gap-3">

                    <div class="w-9 h-9 rounded-lg
                                bg-gray-100
                                flex items-center justify-center
                                shrink-0">

                        <i class="fa-solid fa-location-dot
                                  text-gray-500">
                        </i>

                    </div>


                    <div>

                        <p class="text-xs font-semibold
                                  text-gray-500 uppercase
                                  tracking-wide">

                            Near Landmark

                        </p>


                        <p id="emergencyModalLocation" class="mt-1 text-sm font-medium
                                  text-gray-800">

                            Location detected

                        </p>

                    </div>

                </div>

            </div>

        </div>


        <div class="px-6 py-4 bg-gray-50
                    border-t border-gray-100
                    flex items-center justify-end gap-3">

            <button type="button" id="emergencyModalClose" class="px-4 py-2.5 rounded-lg
                           text-sm font-semibold
                           text-gray-600
                           hover:bg-gray-200
                           transition">

                Dismiss

            </button>


            <button type="button" id="emergencyModalView" class="px-5 py-2.5 rounded-lg
                           bg-red-600 text-white
                           text-sm font-semibold
                           hover:bg-red-700
                           transition shadow-sm">

                <i class="fa-solid fa-list-check mr-2"></i>

                View Complaints

            </button>

        </div>

    </div>

</div>



    <!-- =========================================================
         LOGOUT CONFIRMATION MODAL
         ========================================================= -->

    <div
        id="logoutModal"
        class="fixed inset-0 bg-black/50 hidden items-center justify-center z-[100] p-4">

        <div class="bg-white rounded-2xl shadow-xl w-96 max-w-full p-8 text-center">

            <div class="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-right-from-bracket text-xl"></i>
            </div>

            <h2 class="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
            </h2>

            <p class="text-gray-500 text-sm mb-8">
                Are you sure you want to log out?
            </p>

            <div class="flex justify-center gap-3">

                <button
                    id="cancelLogout"
                    type="button"
                    class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                    Cancel
                </button>

                <button
                    id="confirmLogout"
                    type="button"
                    class="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
                    Logout
                </button>

            </div>

        </div>

    </div>

    <!-- =========================================================
         GOOGLE MAPS CALLBACK
         ========================================================= -->

    <script>
        window.initGoogleMap = function () {

            console.log("GOOGLE MAPS CALLBACK FIRED");

            window.googleMapsReady = true;

            if (typeof window.onGoogleMapsReady === "function") {
                window.onGoogleMapsReady();
            }

        };
    </script>

    <!-- =========================================================
         CURRENT USER ROLE / DEPARTMENT
         ========================================================= -->

    <script>
        window.CURRENT_USER_ROLE =
            <?= json_encode($currentRole) ?>;

        window.CURRENT_USER_DEPARTMENT =
            <?= json_encode($currentDepartment) ?>;

        console.log("RBAC ROLE:", window.CURRENT_USER_ROLE);
        console.log("RBAC DEPARTMENT:", window.CURRENT_USER_DEPARTMENT);
    </script>

    <script
        async
        defer
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY&callback=initGoogleMap">
    </script>

    <!-- =========================================================
         DASHBOARD SPA + RESPONSIVE SIDEBAR
         ========================================================= -->

    <script>
        let currentUserRole = window.CURRENT_USER_ROLE || null;
        let currentUserDepartment = "";

        const contentArea =
            document.getElementById("content-area");

        const pageTitle =
            document.getElementById("page-title");

        const BASE = "/Complaint";

        const sidebar =
            document.getElementById("sidebar");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");

        const mobileMenuBtn =
            document.getElementById("mobileMenuBtn");

        const mobileMenuIcon =
            document.getElementById("mobileMenuIcon");

        const headerProfile =
            document.getElementById("headerProfile");

        const logoutModal =
            document.getElementById("logoutModal");

        const logoutBtn =
            document.getElementById("logoutBtn");

        const cancelLogout =
            document.getElementById("cancelLogout");

        const confirmLogout =
            document.getElementById("confirmLogout");


        /* =====================================================
           MOBILE SIDEBAR OPEN / CLOSE
           ===================================================== */

        function openMobileSidebar() {

            if (window.innerWidth > 767) {
                return;
            }

            sidebar.classList.add("mobile-sidebar-open");
            sidebarOverlay.classList.add("active");
            document.body.classList.add("sidebar-open");

            mobileMenuBtn.setAttribute("aria-expanded", "true");
            mobileMenuBtn.setAttribute("aria-label", "Close navigation menu");

            mobileMenuIcon.classList.remove("fa-bars");
            mobileMenuIcon.classList.add("fa-xmark");

        }


        function closeMobileSidebar() {

            sidebar.classList.remove("mobile-sidebar-open");
            sidebarOverlay.classList.remove("active");
            document.body.classList.remove("sidebar-open");

            mobileMenuBtn.setAttribute("aria-expanded", "false");
            mobileMenuBtn.setAttribute("aria-label", "Open navigation menu");

            mobileMenuIcon.classList.remove("fa-xmark");
            mobileMenuIcon.classList.add("fa-bars");

        }


        function toggleMobileSidebar() {

            if (sidebar.classList.contains("mobile-sidebar-open")) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }

        }


        mobileMenuBtn.addEventListener("click", toggleMobileSidebar);
        sidebarOverlay.addEventListener("click", closeMobileSidebar);


        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMobileSidebar();
                closeNotifications();
                closeLogoutModal();
            }

        });


        window.addEventListener("resize", () => {

            if (window.innerWidth > 767) {
                closeMobileSidebar();
            }

        });


        /* =====================================================
           LOAD SESSION / RBAC
           ===================================================== */

        async function loadUserRole() {

            try {

                const response = await fetch(
                    "/Complaint/Cores/get_session.php",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store"
                    }
                );

                const result = await response.json();

                if (!result.success || !result.logged_in) {

                    window.location.replace(
                        "/Complaint/Cores/login.html"
                    );

                    return;

                }

                currentUserRole = String(
                    result.role ||
                    window.CURRENT_USER_ROLE ||
                    ""
                ).trim().toLowerCase();

                currentUserDepartment = String(
                    result.department || ""
                ).trim().toUpperCase();

                window.CURRENT_USER_ROLE = currentUserRole;
                window.CURRENT_USER_DEPARTMENT = currentUserDepartment;

                const departmentLabel =
                    document.getElementById("departmentLabel");

                if (departmentLabel) {

                    departmentLabel.textContent =
                        currentUserDepartment
                            ? `${currentUserDepartment} Department`
                            : "Department Not Assigned";

                }

                console.log("Current RBAC Role:", currentUserRole);
                console.log("Current RBAC Department:", currentUserDepartment);

                applyRBAC();

            } catch (error) {

                console.error("Unable to load user role:", error);

            }

        }


        /* =====================================================
           APPLY ROLE / DEPARTMENT NAVIGATION RESTRICTIONS
           ===================================================== */

        function applyRBAC() {

            const activityLogsLink =
                document.getElementById("activityLogsLink");

            if (
                activityLogsLink &&
                currentUserRole !== "admin"
            ) {
                activityLogsLink.remove();
            }

            const citizenUsersLink =
                document.getElementById("citizenUsersLink");

            if (!citizenUsersLink) {
                return;
            }

            if (currentUserDepartment !== "IT") {
                citizenUsersLink.remove();
            }

        }


        /* =====================================================
           SPA ROUTES
           ===================================================== */

        const routes = {

            "overview.html": {
                title: "Dashboard",
                script: "overview.js",
                init: "initOverview"
            },

            "/Complaint/Complaints/complaint.html": {
                title: "Complaints",
                script: "/Complaint/Complaints/complaint.js",
                init: "initComplaint"
            },

            "/Complaint/Feedback/feedback.html": {
                title: "Citizen Feedback",
                script: "/Complaint/Feedback/feedback.js",
                init: "initFeedback"
            },

            "/Complaint/Reports/operationalReports.php": {
                title: "Activity Logs",
                script: "/Complaint/Reports/operationalReports.js",
                init: "initOperationalReports"
            },

            "/Complaint/Reports/operationsOverview.html": {
                title: "Reports",
                script: "/Complaint/Reports/operationsReports.js",
                init: "initOperationsReports"
            },

            "/Complaint/Users/systemUsers.html": {
                title: "System Users",
                script: "/Complaint/Users/systemUsers.js",
                init: "initSystemUsers"
            },

            "/Complaint/Citizens/citizenUsers.html": {
                title: "Citizen Users",
                script: "/Complaint/Citizens/citizenUsers.js",
                init: "initCitizenPage"
            },

            "/Complaint/Dispatchs/dispatch.html": {
                title: "Dispatch",
                script: "/Complaint/Dispatchs/dispatch.js",
                init: "initDispatch"
            },

            "/Complaint/Users/Systemprofile.html": {
                title: "My Profile",
                script: "/Complaint/Users/Systemprofile.js",
                init: "initProfile"
            }

        };


        const loadedScripts = new Set();


        async function loadScript(src) {

            if (!src || loadedScripts.has(src)) {
                return;
            }

            return new Promise((resolve, reject) => {

                const script = document.createElement("script");

                script.src = src;

                script.onload = () => {
                    loadedScripts.add(src);
                    resolve();
                };

                script.onerror = () => {
                    reject(new Error(`Unable to load script: ${src}`));
                };

                document.body.appendChild(script);

            });

        }


        /* =====================================================
           LOAD PAGE
           ===================================================== */

        async function loadPage(page, push = true) {

            try {

                if (
                    page === "/Complaint/Citizens/citizenUsers.html" &&
                    currentUserDepartment !== "IT"
                ) {

                    console.warn(
                        "Access denied: Citizen Users is restricted to IT."
                    );

                    return;

                }

                closeMobileSidebar();

                const response = await fetch(page, {
                    credentials: "same-origin",
                    cache: "no-store"
                });

                if (!response.ok) {
                    throw new Error(
                        `Unable to load page. HTTP ${response.status}`
                    );
                }

                const html = await response.text();

                contentArea.innerHTML = html;

                pageTitle.textContent =
                    routes[page]?.title || "Dashboard";


                /* Update sidebar active link. */

                document.querySelectorAll(".sidebar-link").forEach(link => {

                    link.classList.remove(
                        "bg-blue-50/80",
                        "text-blue-600",
                        "font-semibold"
                    );

                    link.classList.add("text-gray-900");

                });

                const activeLink = [
                    ...document.querySelectorAll(".sidebar-link")
                ].find(link => link.getAttribute("href") === page);

                if (activeLink) {

                    activeLink.classList.add(
                        "bg-blue-50/80",
                        "text-blue-600",
                        "font-semibold"
                    );

                    activeLink.classList.remove("text-gray-900");

                }


                /* Load page-specific script. */

                const route = routes[page];

                if (route?.script) {
                    await loadScript(route.script);
                }

                await new Promise(resolve => setTimeout(resolve, 0));

                const initFunction =
                    route ? window[route.init] : null;

                if (typeof initFunction === "function") {

                    initFunction();

                } else if (route?.init) {

                    console.warn(
                        `Initialization function not found: ${route.init}`
                    );

                }


                if (push) {

                    history.pushState(
                        { page },
                        "",
                        "?page=" + encodeURIComponent(page)
                    );

                }

            } catch (error) {

                console.error("Page loading error:", error);

                contentArea.innerHTML = `
                    <div class="p-6 sm:p-8 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        <p class="font-semibold">Failed to load page.</p>
                        <p class="text-sm mt-1">
                            Please refresh the dashboard and try again.
                        </p>
                    </div>
                `;

            }

        }
                // Allow shared dashboard scripts to navigate between SPA pages.
        window.loadPage = loadPage;

        /* =====================================================
           SIDEBAR NAVIGATION
           ===================================================== */

        document.querySelectorAll("[data-link]").forEach(link => {

            link.addEventListener("click", event => {

                event.preventDefault();

                loadPage(link.getAttribute("href"));

            });

        });


        window.addEventListener("popstate", event => {

            loadPage(
                event.state?.page || "overview.html",
                false
            );

        });


        /* =====================================================
           HEADER PROFILE
           ===================================================== */

        function getProfileInitials(name) {

            if (!name || !String(name).trim()) {
                return "U";
            }

            const parts = String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            if (parts.length === 1) {
                return parts[0].charAt(0).toUpperCase();
            }

            return (
                parts[0].charAt(0) +
                parts[parts.length - 1].charAt(0)
            ).toUpperCase();

        }


        async function loadHeaderProfile() {

            try {

                const response = await fetch(
                    "/Complaint/Users/get_Systemprofile.php",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                const result = await response.json();

                console.log("HEADER PROFILE:", result);

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to load profile."
                    );
                }

                const user = result.user || {};

                const name = user.name || "System User";

                const role =
                    user.role ||
                    window.CURRENT_USER_ROLE ||
                    "User";

                const headerProfileName =
                    document.getElementById("headerProfileName");

                const headerProfileRole =
                    document.getElementById("headerProfileRole");

                const headerProfileImage =
                    document.getElementById("headerProfileImage");

                const headerProfileInitials =
                    document.getElementById("headerProfileInitials");


                if (headerProfileName) {
                    headerProfileName.textContent = name;
                }

                if (headerProfileRole) {
                    headerProfileRole.textContent = role;
                }

                if (headerProfileInitials) {
                    headerProfileInitials.textContent =
                        getProfileInitials(name);
                }


                if (headerProfileImage && headerProfileInitials) {

                    if (user.profilePicture) {

                        headerProfileImage.onload = () => {

                            headerProfileImage.classList.remove("hidden");
                            headerProfileInitials.classList.add("hidden");

                        };

                        headerProfileImage.onerror = () => {

                            headerProfileImage.removeAttribute("src");
                            headerProfileImage.classList.add("hidden");

                            headerProfileInitials.textContent =
                                getProfileInitials(name);

                            headerProfileInitials.classList.remove("hidden");

                        };

                        headerProfileImage.src = user.profilePicture;

                        if (headerProfileImage.complete) {

                            if (headerProfileImage.naturalWidth > 0) {

                                headerProfileImage.classList.remove("hidden");
                                headerProfileInitials.classList.add("hidden");

                            } else {

                                headerProfileImage.classList.add("hidden");
                                headerProfileInitials.classList.remove("hidden");

                            }

                        }

                    } else {

                        headerProfileImage.removeAttribute("src");
                        headerProfileImage.classList.add("hidden");

                        headerProfileInitials.textContent =
                            getProfileInitials(name);

                        headerProfileInitials.classList.remove("hidden");

                    }

                }

            } catch (error) {

                console.error("HEADER PROFILE ERROR:", error);

                const headerProfileName =
                    document.getElementById("headerProfileName");

                const headerProfileRole =
                    document.getElementById("headerProfileRole");

                const headerProfileInitials =
                    document.getElementById("headerProfileInitials");

                if (headerProfileName) {
                    headerProfileName.textContent = "My Profile";
                }

                if (headerProfileRole) {
                    headerProfileRole.textContent =
                        window.CURRENT_USER_ROLE || "User";
                }

                if (headerProfileInitials) {
                    headerProfileInitials.textContent = "U";
                    headerProfileInitials.classList.remove("hidden");
                }

            }

        }


        headerProfile.addEventListener("click", () => {

            loadPage("/Complaint/Users/Systemprofile.html");

        });


        /* =====================================================
           NOTIFICATION SYSTEM
           ===================================================== */

        const notificationBtn =
            document.getElementById("notificationBtn");

        const notificationBadge =
            document.getElementById("notificationBadge");

        const notificationDropdown =
            document.getElementById("notificationDropdown");

        const notificationList =
            document.getElementById("notificationList");

        const notificationSubtitle =
            document.getElementById("notificationSubtitle");

        const markNotificationsRead =
            document.getElementById("markNotificationsRead");

        const viewAllNotifications =
            document.getElementById("viewAllNotifications");


        let notifications = [];
        let isLoadingNotifications = false;

        const READ_STORAGE_KEY = "adminReadNotifications";

        const READ_NOTIFICATION_EXPIRY =
            24 * 60 * 60 * 1000;


        /*
        |--------------------------------------------------------------------------
        | READ NOTIFICATION STORAGE
        |--------------------------------------------------------------------------
        |
        | New storage format:
        |
        | {
        |     "123": 1792000000000,
        |     "124": 1792000000000
        | }
        |
        | Each value is the timestamp when the notification was marked read.
        |
        */


        function getReadNotifications() {

            try {

                const stored = JSON.parse(
                    localStorage.getItem(READ_STORAGE_KEY) || "{}"
                );

                const now = Date.now();
                const readNotifications = {};


                /*
                 * Migrate the old format:
                 *
                 * ["123", "124"]
                 *
                 * Old IDs do not contain timestamps, so their 24-hour
                 * countdown begins when this migration first occurs.
                 */

                if (Array.isArray(stored)) {

                    stored.forEach(id => {

                        readNotifications[String(id)] = now;

                    });

                    saveReadNotifications(readNotifications);

                    return readNotifications;

                }


                if (
                    !stored ||
                    typeof stored !== "object"
                ) {

                    return {};

                }


                Object.entries(stored).forEach(([id, timestamp]) => {

                    const readAt = Number(timestamp);

                    if (
                        Number.isFinite(readAt) &&
                        readAt > 0 &&
                        readAt <= now &&
                        now - readAt < READ_NOTIFICATION_EXPIRY
                    ) {

                        readNotifications[String(id)] = readAt;

                    }

                });


                /*
                 * Persist the cleaned storage to remove expired entries.
                 */

                if (
                    JSON.stringify(stored) !==
                    JSON.stringify(readNotifications)
                ) {

                    saveReadNotifications(readNotifications);

                }

                return readNotifications;

            } catch (error) {

                console.error(
                    "Unable to read notification storage:",
                    error
                );

                return {};

            }

        }


        function saveReadNotifications(readNotifications) {

            try {

                localStorage.setItem(
                    READ_STORAGE_KEY,
                    JSON.stringify(readNotifications)
                );

            } catch (error) {

                console.error(
                    "Unable to save notification read status:",
                    error
                );

            }

        }


        function getNotificationID(notification) {

            return String(notification.complaintID ?? "");

        }


        function isNotificationRead(notification) {

            const readNotifications = getReadNotifications();

            return Boolean(
                readNotifications[getNotificationID(notification)]
            );

        }


        function markNotificationAsRead(notificationID) {

            const readNotifications = getReadNotifications();

            const key = String(notificationID);

            /*
             * Keep the original read timestamp.
             * Clicking a notification again must not restart the timer.
             */

            if (!readNotifications[key]) {

                readNotifications[key] = Date.now();

                saveReadNotifications(readNotifications);

            }

        }


        /*
        |--------------------------------------------------------------------------
        | EXPIRE READ NOTIFICATIONS
        |--------------------------------------------------------------------------
        |
        | Unread notifications remain visible.
        | Read notifications are hidden after 24 hours.
        | Complaint records are never deleted.
        |
        */

        function filterExpiredReadNotifications() {

            const readNotifications = getReadNotifications();

            notifications = notifications.filter(notification => {

                const notificationID =
                    getNotificationID(notification);

                // Unread notifications remain visible indefinitely.
                if (!readNotifications[notificationID]) {
                    return true;
                }

                const readAt =
                    readNotifications[notificationID];

                return (
                    Date.now() - readAt <
                    READ_NOTIFICATION_EXPIRY
                );

            });

        }


        function escapeHTML(value) {

            return String(value ?? "").replace(/[&<>"']/g, character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]);

        }


        function getNotificationIcon(notification) {

            if (notification.notificationType === "HIGH_PRIORITY") {

                return `
                    <span class="flex items-center justify-center w-9 h-9
                        rounded-full bg-red-100 text-red-600 shrink-0">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </span>
                `;

            }

            return `
                <span class="flex items-center justify-center w-9 h-9
                    rounded-full bg-amber-100 text-amber-600 shrink-0">
                    <i class="fa-solid fa-clock"></i>
                </span>
            `;

        }


        function getNotificationDescription(notification) {

            const reference =
                notification.complaintReference ||
                `Complaint #${notification.complaintID}`;

            const category =
                notification.category || "Uncategorized";

            const location =
                notification.location || "Location not provided";

            return `
                <p class="text-xs font-semibold text-gray-800">
                    ${escapeHTML(reference)}
                </p>

                <p class="text-xs text-gray-600 mt-1">
                    ${escapeHTML(category)} · ${escapeHTML(location)}
                </p>

                <p class="text-xs text-gray-500 mt-1">
                    ${escapeHTML(
                        notification.notificationTitle ||
                        "Complaint requires attention"
                    )}
                </p>
            `;

        }


        function updateNotificationBadge() {

            const unreadCount = notifications.filter(
                notification => !isNotificationRead(notification)
            ).length;

            notificationBadge.textContent =
                unreadCount > 99 ? "99+" : String(unreadCount);

            notificationBadge.classList.toggle(
                "hidden",
                unreadCount === 0
            );

            notificationBadge.classList.toggle(
                "flex",
                unreadCount > 0
            );

            notificationBtn.setAttribute(
                "aria-label",
                unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
            );

            if (notificationSubtitle) {

                notificationSubtitle.textContent =
                    `${unreadCount} unread · ${notifications.length} important notifications`;

            }

        }


        function renderNotifications() {

            /*
             * Always remove expired read notifications before rendering.
             */

            filterExpiredReadNotifications();


            if (notifications.length === 0) {

                notificationList.innerHTML = `
                    <div class="p-6 text-center">

                        <i class="fa-regular fa-bell-slash
                            text-2xl text-gray-300 mb-3"></i>

                        <p class="text-sm font-medium text-gray-600">
                            No important notifications
                        </p>

                        <p class="text-xs text-gray-400 mt-1">
                            High-priority and overdue complaints will appear here.
                        </p>

                    </div>
                `;

                updateNotificationBadge();

                return;

            }


            /*
             * The PHP endpoint determines notification ordering.
             * This function preserves the order it receives.
             */

            notificationList.innerHTML = notifications.map(notification => {

                const read = isNotificationRead(notification);

                const timestamp =
                    notification.createdAt ||
                    notification.deadlineAt ||
                    "";

                return `
                    <button
                        type="button"
                        class="w-full text-left px-4 py-3 flex gap-3
                            hover:bg-blue-50 transition
                            ${read ? "bg-white" : "bg-blue-50/60"}"
                        data-notification-id="${escapeHTML(
                            getNotificationID(notification)
                        )}"
                        aria-label="Open complaint ${escapeHTML(
                            notification.complaintReference ||
                            notification.complaintID
                        )}">

                        ${getNotificationIcon(notification)}

                        <span class="flex-1 min-w-0">

                            ${getNotificationDescription(notification)}

                            <span class="flex items-center gap-2 mt-2">

                                <span class="text-[10px] text-gray-400">
                                    ${escapeHTML(timestamp)}
                                </span>

                                ${read ? "" : `
                                    <span
                                        class="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                                        title="Unread">
                                    </span>
                                `}

                            </span>

                        </span>

                    </button>
                `;

            }).join("");

            updateNotificationBadge();

        }


        async function loadNotifications() {

            if (isLoadingNotifications) {
                return;
            }

            isLoadingNotifications = true;

            try {

                const response = await fetch(
                    "/Complaint/get_adminnotification.php",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                const responseText = await response.text();

                console.log(
                    "Notification endpoint:",
                    "/Complaint/get_adminnotification.php"
                );

                console.log(
                    "Notification HTTP status:",
                    response.status
                );

                let result;

                try {

                    result = JSON.parse(responseText);

                } catch (error) {

                    throw new Error(
                        "The notification endpoint returned invalid JSON. Check the PHP response."
                    );

                }

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message || "Unable to load notifications."
                    );

                }

                notifications = Array.isArray(result.notifications)
                    ? result.notifications
                    : [];

                renderNotifications();

            } catch (error) {

                console.error(
                    "Notification loading error:",
                    error
                );

                notificationList.innerHTML = `
                    <div class="p-5 text-center">

                        <i class="fa-solid fa-circle-exclamation
                            text-red-500 text-xl mb-2"></i>

                        <p class="text-sm text-gray-700">
                            Unable to load notifications.
                        </p>

                        <button
                            type="button"
                            id="retryNotifications"
                            class="text-xs text-blue-600 hover:text-blue-800 mt-2">
                            Try again
                        </button>

                    </div>
                `;

                const retryButton =
                    document.getElementById("retryNotifications");

                if (retryButton) {

                    retryButton.addEventListener(
                        "click",
                        loadNotifications
                    );

                }

            } finally {

                isLoadingNotifications = false;

            }

        }


        function openNotifications() {

            notificationDropdown.classList.remove("hidden");

            notificationBtn.setAttribute("aria-expanded", "true");

            loadNotifications();

        }


        function closeNotifications() {

            notificationDropdown.classList.add("hidden");

            notificationBtn.setAttribute("aria-expanded", "false");

        }


        notificationBtn.addEventListener("click", event => {

            event.stopPropagation();

            if (notificationDropdown.classList.contains("hidden")) {

                openNotifications();

            } else {

                closeNotifications();

            }

        });


        notificationDropdown.addEventListener("click", event => {

            event.stopPropagation();

        });


        document.addEventListener("click", event => {

            if (
                !notificationDropdown.contains(event.target) &&
                !notificationBtn.contains(event.target)
            ) {

                closeNotifications();

            }

        });


        /*
        |--------------------------------------------------------------------------
        | MARK ALL NOTIFICATIONS AS READ
        |--------------------------------------------------------------------------
        */

        if (markNotificationsRead) {

            markNotificationsRead.addEventListener("click", () => {

                const readNotifications = getReadNotifications();

                const now = Date.now();

                notifications.forEach(notification => {

                    const id = getNotificationID(notification);

                    /*
                     * Do not reset the timestamp for notifications
                     * that were already marked as read.
                     */

                    if (!readNotifications[id]) {
                        readNotifications[id] = now;
                    }

                });

                saveReadNotifications(readNotifications);

                renderNotifications();

            });

        }


        /*
        |--------------------------------------------------------------------------
        | OPEN INDIVIDUAL NOTIFICATION
        |--------------------------------------------------------------------------
        */

        notificationList.addEventListener("click", event => {

            const button = event.target.closest(
                "[data-notification-id]"
            );

            if (!button) {
                return;
            }

            const complaintID = button.dataset.notificationId;

            const notification = notifications.find(
                item => getNotificationID(item) === complaintID
            );

            if (!notification) {
                return;
            }

            markNotificationAsRead(complaintID);

            renderNotifications();

            closeNotifications();

            sessionStorage.setItem(
                "openNotificationComplaintID",
                complaintID
            );

            loadPage(
                "/Complaint/Complaints/complaint.html"
            );

        });


        /*
        |--------------------------------------------------------------------------
        | VIEW ALL NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        if (viewAllNotifications) {

            viewAllNotifications.addEventListener("click", () => {

                closeNotifications();

                loadPage(
                    "/Complaint/Complaints/complaint.html"
                );

            });

        }


        /*
        |--------------------------------------------------------------------------
        | LOGOUT CONFIRMATION
        |--------------------------------------------------------------------------
        */

        function openLogoutModal() {

            logoutModal.classList.remove("hidden");
            logoutModal.classList.add("flex");

        }


        function closeLogoutModal() {

            logoutModal.classList.remove("flex");
            logoutModal.classList.add("hidden");

        }


        logoutBtn.addEventListener("click", openLogoutModal);

        cancelLogout.addEventListener("click", closeLogoutModal);


        logoutModal.addEventListener("click", event => {

            if (event.target === logoutModal) {
                closeLogoutModal();
            }

        });


        confirmLogout.addEventListener("click", () => {

            window.location.replace(
                "/Complaint/Cores/logout.php"
            );

        });


        /*
        |--------------------------------------------------------------------------
        | INITIALIZE DASHBOARD
        |--------------------------------------------------------------------------
        */

        window.addEventListener("DOMContentLoaded", async () => {

            await loadUserRole();

            // Load emergency alert functions for the entire dashboard session.
            await loadScript("/Complaint/overview.js");

            // Start emergency monitoring independently of the active page.
            if (typeof window.initEmergencyAlerts === "function") {
                window.initEmergencyAlerts();
            }

            const params =
                new URLSearchParams(window.location.search);

            const requestedPage =
                params.get("page") || "overview.html";

            await loadPage(requestedPage, false);

            await loadHeaderProfile();

            // Load notifications on initial page load.
            loadNotifications();

            // Refresh server notifications every 30 seconds.
            window.adminNotificationInterval = setInterval(
                loadNotifications,
                30000
            );

            /*
             * Check read-notification expiration every minute.
             * This also refreshes the badge and subtitle.
             */

            window.adminReadNotificationExpiryInterval =
                setInterval(() => {

                    renderNotifications();

                }, 60000);

        });


        /*
        |--------------------------------------------------------------------------
        | EXTERNAL NOTIFICATION REFRESH
        |--------------------------------------------------------------------------
        */

        window.refreshAdminNotifications = loadNotifications;


        /*
        |--------------------------------------------------------------------------
        | BROWSER BACK/FORWARD CACHE HANDLING
        |--------------------------------------------------------------------------
        */

        window.addEventListener("pageshow", event => {

            if (event.persisted) {
                window.location.reload();
            }

        });

    </script>

</body>
</html>