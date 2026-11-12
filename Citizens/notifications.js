(() => {

    "use strict";


    // ============================================================
    // GLOBAL STATE
    // ============================================================

    let notificationRefreshTimer = null;


    // ============================================================
    // DOM HELPER
    // ============================================================

    const $ = (id) => {

        return document.getElementById(id);

    };


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        const div =
            document.createElement("div");

        div.textContent =
            String(value);

        return div.innerHTML;

    }


    // ============================================================
    // DATE / TIME
    // ============================================================

    function formatNotificationTime(dateValue) {

        if (!dateValue) {
            return "";
        }

        let date;

        if (typeof dateValue === "string") {

            const value = dateValue.trim();

            // MySQL DATETIME without timezone:
            // Interpret explicitly as Asia/Manila (UTC+08:00).
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {

                date = new Date(
                    value.replace(" ", "T") + "+08:00"
                );

            } else if (
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
            ) {

                // ISO datetime without timezone.
                date = new Date(value + "+08:00");

            } else {

                // Preserve explicit timezone information, such as Z or +00:00.
                date = new Date(value);

            }

        } else {

            date = new Date(dateValue);

        }

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        const now = Date.now();
        const diff = now - date.getTime();

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < 0) {
            return diff > -minute ? "Just now" : "In the future";
        }

        if (diff < minute) {
            return "Just now";
        }

        if (diff < hour) {
            return `${Math.floor(diff / minute)}m ago`;
        }

        if (diff < day) {
            return `${Math.floor(diff / hour)}h ago`;
        }

        if (diff < 7 * day) {
            return `${Math.floor(diff / day)}d ago`;
        }

        return date.toLocaleDateString("en-PH", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }



    // ============================================================
    // NOTIFICATION ICON
    // ============================================================

    function getNotificationIcon(
        type,
        title
    ) {

        const combined =
            `${type || ""} ${title || ""}`
                .toLowerCase();


        // --------------------------------------------------------
        // RESOLVED / COMPLETED
        // --------------------------------------------------------

        if (
            combined.includes("resolved") ||
            combined.includes("complete") ||
            combined.includes("success")
        ) {

            return `

                <div
                    class="
                        w-10
                        h-10
                        rounded-xl
                        bg-green-50
                        text-green-600
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
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
                            d="M5 13l4 4L19 7"
                        />

                    </svg>

                </div>

            `;

        }


        // --------------------------------------------------------
        // DISPATCH / ASSIGNED
        // --------------------------------------------------------

        if (
            combined.includes("dispatch") ||
            combined.includes("assigned") ||
            combined.includes("accepted")
        ) {

            return `

                <div
                    class="
                        w-10
                        h-10
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
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
                            stroke-width="1.9"
                            d="M5 13l4 4L19 7"
                        />

                    </svg>

                </div>

            `;

        }


        // --------------------------------------------------------
        // EMERGENCY / URGENT
        // --------------------------------------------------------

        if (
            combined.includes("emergency") ||
            combined.includes("urgent")
        ) {

            return `

                <div
                    class="
                        w-10
                        h-10
                        rounded-xl
                        bg-red-50
                        text-red-600
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
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
                            d="M12 9v2m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                        />

                    </svg>

                </div>

            `;

        }


        // --------------------------------------------------------
        // DEFAULT
        // --------------------------------------------------------

        return `

            <div
                class="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-100
                    text-slate-500
                    flex
                    items-center
                    justify-center
                    shrink-0
                "
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                    />

                </svg>

            </div>

        `;

    }


    // ============================================================
    // GET NOTIFICATION ID
    // ============================================================

    function getNotificationId(
        notification
    ) {

        return (
            notification.notificationID ??
            notification.notificationId ??
            notification.id
        );

    }


    // ============================================================
    // GET COMPLAINT ID
    // ============================================================

    function getNotificationComplaintId(
        notification
    ) {

        return (
            notification.complaintID ??
            notification.complaintId ??
            notification.complaint_id
        );

    }


    // ============================================================
    // GET TITLE
    // ============================================================

    function getNotificationTitle(
        notification
    ) {

        return (
            notification.title ||
            notification.notificationTitle ||
            "Notification"
        );

    }


    // ============================================================
    // GET MESSAGE
    // ============================================================

    function getNotificationMessage(
        notification
    ) {

        return (
            notification.message ||
            notification.notificationMessage ||
            notification.description ||
            ""
        );

    }


    // ============================================================
    // READ STATE
    // ============================================================

    function isNotificationRead(
        notification
    ) {

        const value =
            notification.isRead ??
            notification.is_read ??
            notification.read ??
            notification.status;


        return (
            value === true ||
            value === 1 ||
            value === "1" ||
            value === "read" ||
            value === "READ"
        );

    }


    // ============================================================
    // CREATE NOTIFICATION ITEM
    // ============================================================

    function createNotificationItem(
        notification
    ) {

        const id =
            getNotificationId(
                notification
            );


        const complaintId =
            getNotificationComplaintId(
                notification
            );


        const title =
            getNotificationTitle(
                notification
            );


        const message =
            getNotificationMessage(
                notification
            );


        const type =
            notification.type ||
            notification.notificationType ||
            "";


        const createdAt =
            notification.created_at ||
            notification.createdAt ||
            notification.createdAtDate ||
            notification.date ||
            notification.timestamp;


        const read =
            isNotificationRead(
                notification
            );


        const item =
            document.createElement("div");


        item.className =
            `
                notification-item
                px-4
                sm:px-5
                py-4
                cursor-pointer
            `;


        if (read) {

            item.classList.add(
                "notification-read"
            );

        } else {

            item.classList.add(
                "notification-unread"
            );

        }


        item.dataset.notificationId =
            id ?? "";


        item.innerHTML = `

            <div
                class="
                    flex
                    items-start
                    gap-3
                "
            >

                ${getNotificationIcon(
            type,
            title
        )}


                <div
                    class="
                        min-w-0
                        flex-1
                    "
                >

                    <div
                        class="
                            flex
                            items-start
                            justify-between
                            gap-3
                        "
                    >

                        <p
                            class="
                                text-sm
                                font-bold
                                text-slate-800
                                leading-5
                            "
                        >
                            ${escapeHTML(title)}
                        </p>


                        ${!read
                ? `
                                    <span
                                        class="
                                            w-2.5
                                            h-2.5
                                            rounded-full
                                            bg-blue-600
                                            shrink-0
                                            mt-1.5
                                        "
                                        aria-label="Unread"
                                    ></span>
                                `
                : ""
            }

                    </div>


                    <p
                        class="
                            text-xs
                            sm:text-sm
                            text-slate-500
                            leading-5
                            mt-1
                        "
                    >
                        ${escapeHTML(message)}
                    </p>


                    <div
                        class="
                            flex
                            items-center
                            gap-2
                            mt-2
                        "
                    >

                        <span
                            class="
                                text-[10px]
                                sm:text-xs
                                text-slate-400
                            "
                        >
                            ${escapeHTML(
                formatNotificationTime(
                    createdAt
                )
            )}
                        </span>


                        ${complaintId
                ? `
                                    <span
                                        class="
                                            text-[10px]
                                            sm:text-xs
                                            font-semibold
                                            text-blue-500
                                        "
                                    >
                                        View complaint
                                    </span>
                                `
                : ""
            }

                    </div>

                </div>

            </div>

        `;


        // --------------------------------------------------------
        // CLICK
        // --------------------------------------------------------

        item.addEventListener(
            "click",
            async function () {

                if (
                    !read &&
                    id
                ) {

                    await markNotificationAsRead(
                        id,
                        false
                    );

                }


                if (complaintId) {

                    /*
                     * Go directly to My Complaints
                     * with the complaint ID.
                     *
                     * The existing myComplaints.js
                     * can use this value if supported.
                     */

                    sessionStorage.setItem(
                        "openComplaintId",
                        complaintId
                    );

                    window.location.href =
                        "myComplaints.html";

                    return;

                }


                window.location.href =
                    "myComplaints.html";

            }
        );


        return item;

    }


    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================

    async function loadNotifications() {

        const list =
            $("notificationList");

        const loading =
            $("notificationLoading");

        const empty =
            $("notificationEmpty");

        const badge =
            $("notificationBadge");

        const subtitle =
            $("notificationSubtitle");

        const markAllButton =
            $("markAllNotificationsBtn");


        if (!list) {

            return;

        }


        try {

            const response =
                await fetch(
                    "/Complaint/Citizens/get_notifications.php",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Notification request failed: ${response.status}`
                );

            }


            const data =
                await response.json();


            console.log(
                "Citizen notifications:",
                data
            );


            let notifications = [];


            if (
                Array.isArray(data)
            ) {

                notifications =
                    data;

            } else if (
                Array.isArray(
                    data?.notifications
                )
            ) {

                notifications =
                    data.notifications;

            } else if (
                Array.isArray(
                    data?.data
                )
            ) {

                notifications =
                    data.data;

            }


            // ----------------------------------------------------
            // HIDE LOADING
            // ----------------------------------------------------

            if (loading) {

                loading.classList.add(
                    "hidden"
                );

            }


            // ----------------------------------------------------
            // CLEAR CURRENT LIST
            // ----------------------------------------------------

            list.innerHTML = "";


            // ----------------------------------------------------
            // UNREAD
            // ----------------------------------------------------

            const unreadNotifications =
                notifications.filter(
                    notification =>
                        !isNotificationRead(
                            notification
                        )
                );


            // ----------------------------------------------------
            // BADGE
            // ----------------------------------------------------

            if (badge) {

                if (
                    unreadNotifications.length > 0
                ) {

                    badge.textContent =
                        unreadNotifications.length > 99
                            ? "99+"
                            : unreadNotifications.length;

                    badge.classList.remove(
                        "hidden"
                    );

                } else {

                    badge.textContent =
                        "0";

                    badge.classList.add(
                        "hidden"
                    );

                }

            }


            // ----------------------------------------------------
            // SUBTITLE
            // ----------------------------------------------------

            if (subtitle) {

                subtitle.textContent =
                    unreadNotifications.length > 0
                        ? `${unreadNotifications.length} unread notification${unreadNotifications.length === 1 ? "" : "s"}`
                        : "You're all caught up.";

            }


            // ----------------------------------------------------
            // MARK ALL BUTTON
            // ----------------------------------------------------

            if (markAllButton) {

                markAllButton.classList.toggle(
                    "hidden",
                    unreadNotifications.length === 0
                );

            }


            // ----------------------------------------------------
            // EMPTY
            // ----------------------------------------------------

            if (
                notifications.length === 0
            ) {

                if (empty) {

                    empty.classList.remove(
                        "hidden"
                    );

                }

                return;

            }


            if (empty) {

                empty.classList.add(
                    "hidden"
                );

            }


            // ----------------------------------------------------
            // RENDER
            // ----------------------------------------------------

            notifications.forEach(
                notification => {

                    list.appendChild(
                        createNotificationItem(
                            notification
                        )
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error loading notifications:",
                error
            );


            if (loading) {

                loading.classList.add(
                    "hidden"
                );

            }


            if (list) {

                list.innerHTML = `

                    <div
                        class="
                            px-6
                            py-12
                            text-center
                        "
                    >

                        <div
                            class="
                                w-12
                                h-12
                                mx-auto
                                rounded-2xl
                                bg-red-50
                                text-red-500
                                flex
                                items-center
                                justify-center
                                mb-4
                            "
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
                                    d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                                />

                            </svg>

                        </div>


                        <h3
                            class="
                                text-sm
                                font-bold
                                text-slate-700
                            "
                        >
                            Unable to load notifications
                        </h3>


                        <p
                            class="
                                text-xs
                                text-slate-400
                                mt-1
                            "
                        >
                            Please refresh the page and try again.
                        </p>


                        <button
                            type="button"
                            id="retryNotificationsBtn"
                            class="
                                mt-4
                                px-4
                                py-2
                                rounded-xl
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                text-xs
                                font-bold
                                transition
                            "
                        >
                            Try again
                        </button>

                    </div>

                `;


                const retry =
                    $("retryNotificationsBtn");


                if (retry) {

                    retry.addEventListener(
                        "click",
                        loadNotifications
                    );

                }

            }


            if (subtitle) {

                subtitle.textContent =
                    "Unable to load notifications.";

            }

        }

    }


    // ============================================================
    // MARK ONE AS READ
    // ============================================================

    async function markNotificationAsRead(
        notificationId,
        reload = true
    ) {

        if (!notificationId) {

            return;

        }


        try {

            const response =
                await fetch(
                    "/Complaint/Citizens/mark_notification_read.php",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body:
                            `notification_id=${encodeURIComponent(
                                notificationId
                            )}`
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            if (reload) {

                await loadNotifications();

            }


        } catch (error) {

            console.warn(
                "Could not mark notification as read:",
                error
            );

        }

    }


    // ============================================================
    // MARK ALL AS READ
    // ============================================================

    async function markAllNotificationsAsRead() {

        const button =
            $("markAllNotificationsBtn");


        if (button) {

            button.disabled = true;

            button.textContent =
                "Marking...";

        }


        try {

            const response =
                await fetch(
                    "/Complaint/Citizens/mark_all_notifications_read.php",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            await loadNotifications();


        } catch (error) {

            console.error(
                "Could not mark all notifications as read:",
                error
            );


        } finally {

            if (button) {

                button.disabled = false;

                button.textContent =
                    "Mark all read";

            }

        }

    }


    // ============================================================
    // MARK ALL BUTTON
    // ============================================================

    function initializeMarkAllButton() {

        const button =
            $("markAllNotificationsBtn");


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                markAllNotificationsAsRead();

            }
        );

    }


    // ============================================================
    // BACK BUTTON
    // ============================================================

    function initializeBackButton() {

        const button =
            $("backBtn");


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                } else {

                    window.location.href =
                        "citizen.php";

                }

            }
        );

    }


    // ============================================================
    // CLEANUP
    // ============================================================

    window.addEventListener(
        "beforeunload",
        function () {

            if (
                notificationRefreshTimer
            ) {

                clearInterval(
                    notificationRefreshTimer
                );

                notificationRefreshTimer =
                    null;

            }

        }
    );


    // ============================================================
    // INITIALIZATION
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "CitizenCare notifications.js initialized."
            );


            initializeBackButton();

            initializeMarkAllButton();

            loadNotifications();


            // ----------------------------------------------------
            // AUTO REFRESH EVERY 30 SECONDS
            // ----------------------------------------------------

            if (
                notificationRefreshTimer
            ) {

                clearInterval(
                    notificationRefreshTimer
                );

            }


            notificationRefreshTimer =
                setInterval(
                    loadNotifications,
                    30 * 1000
                );

        }
    );

})();