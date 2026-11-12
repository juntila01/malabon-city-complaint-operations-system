<?php

require_once "../Cores/auth.php";

requireRole(['admin']);

?>

<div class="w-full px-2">

    <!-- ============================================
         SUMMARY CARDS
    ============================================= -->

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

        <!-- Total Events -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div class="flex items-center justify-between">

                <div>

                    <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Total Events
                    </p>

                    <p id="totalEvents"
                        class="mt-2 text-2xl font-bold text-gray-900">
                        0
                    </p>

                </div>

                <div
                    class="flex h-9 w-9 items-center justify-center
                           rounded-lg bg-blue-50 text-blue-600">

                    <i class="fa-solid fa-chart-line text-sm"></i>

                </div>

            </div>

        </div>


        <!-- Citizen Activity -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div class="flex items-center justify-between">

                <div>

                    <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Citizen Activity
                    </p>

                    <p id="citizenEvents"
                        class="mt-2 text-2xl font-bold text-gray-900">
                        0
                    </p>

                </div>

                <div
                    class="flex h-9 w-9 items-center justify-center
                           rounded-lg bg-blue-50 text-blue-600">

                    <i class="fa-solid fa-users text-sm"></i>

                </div>

            </div>

        </div>


        <!-- Staff Activity -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div class="flex items-center justify-between">

                <div>

                    <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Staff Activity
                    </p>

                    <p id="staffEvents"
                        class="mt-2 text-2xl font-bold text-gray-900">
                        0
                    </p>

                </div>

                <div
                    class="flex h-9 w-9 items-center justify-center
                           rounded-lg bg-blue-50 text-blue-600">

                    <i class="fa-solid fa-user-tie text-sm"></i>

                </div>

            </div>

        </div>


        <!-- Dispatch Activity -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div class="flex items-center justify-between">

                <div>

                    <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Dispatch Activity
                    </p>

                    <p id="dispatchEvents"
                        class="mt-2 text-2xl font-bold text-gray-900">
                        0
                    </p>

                </div>

                <div
                    class="flex h-9 w-9 items-center justify-center
                           rounded-lg bg-blue-50 text-blue-600">

                    <i class="fa-solid fa-truck-fast text-sm"></i>

                </div>

            </div>

        </div>

    </div>


    <!-- ============================================
         FILTERS
    ============================================= -->

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-5">

        <div class="px-4 py-4 sm:px-5">

            <!-- FILTER HEADER -->

            <div class="flex items-center gap-2 mb-3">

                <div
                    class="flex h-8 w-8 items-center justify-center
                           rounded-lg bg-blue-50 text-blue-600">

                    <i class="fa-solid fa-filter text-xs"></i>

                </div>

                <div>

                    <p class="text-sm font-semibold text-gray-800">
                        Filters
                    </p>

                    <p class="text-[11px] text-gray-400">
                        Search and filter operational activity
                    </p>

                </div>

            </div>


            <!-- FILTER CONTROLS -->

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                <!-- Search -->

                <div class="relative">

                    <i
                        class="fa-solid fa-magnifying-glass
                               absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 text-xs">
                    </i>

                    <input
                        id="searchLogs"
                        type="text"
                        placeholder="Search reports..."
                        class="w-full pl-9 pr-4 py-2.5
                               rounded-lg
                               border border-gray-200
                               bg-white
                               text-sm text-gray-700
                               placeholder:text-gray-400
                               focus:border-blue-500
                               focus:ring-2 focus:ring-blue-100
                               focus:outline-none
                               transition">

                </div>


                <!-- Actor -->

                <select
                    id="actorFilter"
                    class="w-full px-3 py-2.5
                           rounded-lg
                           border border-gray-200
                           bg-white
                           text-sm text-gray-700
                           focus:border-blue-500
                           focus:ring-2 focus:ring-blue-100
                           focus:outline-none
                           transition">

                    <option value="">
                        All Actors
                    </option>

                    <option value="Citizen">
                        Citizen
                    </option>

                    <option value="System User">
                        System User
                    </option>

                    <option value="Dispatch Team">
                        Dispatch Team
                    </option>

                    <option value="System">
                        System
                    </option>

                </select>


                <!-- Action -->

                <select
                    id="actionFilter"
                    class="w-full px-3 py-2.5
                           rounded-lg
                           border border-gray-200
                           bg-white
                           text-sm text-gray-700
                           focus:border-blue-500
                           focus:ring-2 focus:ring-blue-100
                           focus:outline-none
                           transition">

                    <option value="">
                        All Actions
                    </option>

                    <option value="Complaint Submitted">
                        Complaint Submitted
                    </option>

                    <option value="Complaint Verified">
                        Complaint Verified
                    </option>

                    <option value="Complaint Status Changed">
                        Complaint Status Changed
                    </option>

                    <option value="Dispatch Status Changed">
                        Dispatch Status Changed
                    </option>

                    <option value="Complaint Completed">
                        Complaint Completed
                    </option>

                </select>


                <!-- Date -->

                <input
                    id="dateFilter"
                    type="date"
                    class="w-full px-3 py-2.5
                           rounded-lg
                           border border-gray-200
                           bg-white
                           text-sm text-gray-700
                           focus:border-blue-500
                           focus:ring-2 focus:ring-blue-100
                           focus:outline-none
                           transition">

            </div>

        </div>

    </div>


    <!-- ============================================
         ACTIVITY TABLE
    ============================================= -->

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        <!-- TABLE HEADER -->

        <div class="px-4 py-3 border-b border-gray-100">

            <div
                class="flex flex-col sm:flex-row
                       sm:items-center
                       sm:justify-between
                       gap-3">

                <!-- LEFT -->

                <div class="flex items-center gap-2">

                    <div
                        class="w-8 h-8 rounded-lg
                               bg-blue-50 text-blue-600
                               flex items-center justify-center">

                        <i class="fa-solid fa-clock-rotate-left text-xs"></i>

                    </div>

                    <div>

                        <h3 class="text-sm font-semibold text-gray-800">
                            Activity Logs
                        </h3>

                        <p
                            id="reportsPageInfo"
                            class="text-[11px] text-gray-400">

                            Showing 0 of 0

                        </p>

                    </div>

                </div>


                <!-- RIGHT PAGINATION -->

                <div
                    id="reportsPagination"
                    class="flex items-center
                           justify-start
                           md:justify-end
                           gap-1
                           flex-wrap">

                </div>

            </div>

        </div>


        <!-- TABLE -->

        <div class="overflow-x-auto activity-scroll">

            <table class="w-full min-w-[950px] border-collapse">

                <thead>

                    <tr class="bg-gray-50 border-b border-gray-200">

                        <th
                            class="px-4 sm:px-5 py-3
                                   text-left
                                   text-[10px]
                                   font-semibold
                                   uppercase
                                   tracking-wider
                                   text-gray-500
                                   whitespace-nowrap">

                            Date & Time

                        </th>


                        <th
                            class="px-4 sm:px-5 py-3
                                   text-left
                                   text-[10px]
                                   font-semibold
                                   uppercase
                                   tracking-wider
                                   text-gray-500
                                   whitespace-nowrap">

                            Actor

                        </th>


                        <th
                            class="px-4 sm:px-5 py-3
                                   text-left
                                   text-[10px]
                                   font-semibold
                                   uppercase
                                   tracking-wider
                                   text-gray-500
                                   whitespace-nowrap">

                            Action

                        </th>


                        <th
                            class="px-4 sm:px-5 py-3
                                   text-left
                                   text-[10px]
                                   font-semibold
                                   uppercase
                                   tracking-wider
                                   text-gray-500
                                   whitespace-nowrap">

                            Complaint

                        </th>


                        <th
                            class="px-4 sm:px-5 py-3
                                   text-left
                                   text-[10px]
                                   font-semibold
                                   uppercase
                                   tracking-wider
                                   text-gray-500
                                   whitespace-nowrap">

                            Details

                        </th>

                    </tr>

                </thead>


                <tbody
                    id="reportsTableBody"
                    class="divide-y divide-gray-100 bg-white">

                    <tr>

                        <td
                            colspan="5"
                            class="py-16 text-center text-gray-400">

                            Loading operational reports...

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</div>


<style>

    /* ============================================
       ACTIVITY TABLE SCROLLBAR
    ============================================= */

    .activity-scroll {
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
    }

    .activity-scroll::-webkit-scrollbar {
        height: 6px;
    }

    .activity-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .activity-scroll::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 999px;
    }

    .activity-scroll::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
    }


    /* ============================================
       TABLE HOVER
    ============================================= */

    #reportsTableBody tr {
        transition: background-color 0.15s ease;
    }

    #reportsTableBody tr:hover {
        background-color: #f8fafc;
    }


    /* ============================================
       MOBILE TABLE
    ============================================= */

    @media (max-width: 640px) {

        #reportsTableBody th,
        #reportsTableBody td {
            padding-left: 12px;
            padding-right: 12px;
        }

    }

</style>