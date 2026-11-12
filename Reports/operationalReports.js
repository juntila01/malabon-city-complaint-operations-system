let operationalLogs = [];

// ============================================================
// PAGINATION
// ============================================================

let operationalCurrentPage = 1;
const operationalLogsPerPage = 10;


// ============================================================
// INITIALIZE
// ============================================================

async function initOperationalReports() {

    console.log("Initializing Operational Reports...");

    await loadOperationalReports();


    // ========================================================
    // SEARCH
    // ========================================================

    const searchInput =
        document.getElementById("searchLogs");

    searchInput?.addEventListener("input", () => {

        operationalCurrentPage = 1;

        renderOperationalReports();

    });


    // ========================================================
    // ACTOR FILTER
    // ========================================================

    const actorFilter =
        document.getElementById("actorFilter");

    actorFilter?.addEventListener("change", () => {

        operationalCurrentPage = 1;

        renderOperationalReports();

    });


    // ========================================================
    // ACTION FILTER
    // ========================================================

    const actionFilter =
        document.getElementById("actionFilter");

    actionFilter?.addEventListener("change", () => {

        operationalCurrentPage = 1;

        renderOperationalReports();

    });


    // ========================================================
    // DATE FILTER
    // ========================================================

    const dateFilter =
        document.getElementById("dateFilter");

    dateFilter?.addEventListener("change", () => {

        operationalCurrentPage = 1;

        renderOperationalReports();

    });

}


// ============================================================
// LOAD OPERATIONAL REPORTS
// ============================================================

async function loadOperationalReports() {

    const tbody =
        document.getElementById("reportsTableBody");


    if (!tbody) {

        console.error(
            "reportsTableBody element not found."
        );

        return;

    }


    try {

        // ====================================================
        // LOADING STATE
        // ====================================================

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="py-16 text-center text-gray-400"
                >
                    <div class="flex flex-col items-center">

                        <i
                            class="
                                fa-solid
                                fa-spinner
                                fa-spin
                                text-lg
                                mb-3
                            "
                        ></i>

                        <p class="text-sm">
                            Loading operational reports...
                        </p>

                    </div>
                </td>
            </tr>
        `;


        // ====================================================
        // FETCH
        // ====================================================

        const response =
            await fetch(
                "Reports/get_operational_logs.php",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data || !data.success) {

            throw new Error(
                data?.message ||
                "Unable to load reports."
            );

        }


        // ====================================================
        // STORE LOGS
        // ====================================================

        operationalLogs =
            Array.isArray(data.logs)
                ? data.logs
                : [];


        console.log(
            "Operational logs loaded:",
            operationalLogs.length
        );


        // ====================================================
        // UPDATE SUMMARY
        // ====================================================

        updateOperationalSummary();


        // ====================================================
        // RESET PAGE
        // ====================================================

        operationalCurrentPage = 1;


        // ====================================================
        // RENDER
        // ====================================================

        renderOperationalReports();

    }

    catch (error) {

        console.error(
            "Operational reports error:",
            error
        );


        operationalLogs = [];

        operationalCurrentPage = 1;


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="py-16 text-center"
                >
                    <div class="flex flex-col items-center">

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                                text-xl
                                text-red-400
                                mb-3
                            "
                        ></i>

                        <p
                            class="
                                text-sm
                                font-medium
                                text-red-500
                            "
                        >
                            Failed to load operational reports.
                        </p>

                        <p
                            class="
                                text-xs
                                text-gray-400
                                mt-1
                            "
                        >
                            Please try again later.
                        </p>

                    </div>
                </td>
            </tr>
        `;


        updateOperationalSummary();

        renderOperationalPagination(0);

    }

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateOperationalSummary() {

    const logs =
        Array.isArray(operationalLogs)
            ? operationalLogs
            : [];


    const totalEvents =
        document.getElementById("totalEvents");

    const citizenEvents =
        document.getElementById("citizenEvents");

    const staffEvents =
        document.getElementById("staffEvents");

    const dispatchEvents =
        document.getElementById("dispatchEvents");


    // ========================================================
    // TOTAL EVENTS
    // ========================================================

    if (totalEvents) {

        totalEvents.textContent =
            logs.length;

    }


    // ========================================================
    // CITIZEN EVENTS
    // ========================================================

    if (citizenEvents) {

        citizenEvents.textContent =
            logs.filter(
                log =>
                    log?.actorType === "Citizen"
            ).length;

    }


    // ========================================================
    // STAFF EVENTS
    // ========================================================

    if (staffEvents) {

        staffEvents.textContent =
            logs.filter(
                log =>
                    log?.actorType === "System User"
            ).length;

    }


    // ========================================================
    // DISPATCH EVENTS
    // ========================================================

    if (dispatchEvents) {

        dispatchEvents.textContent =
            logs.filter(
                log =>
                    log?.actorType === "Dispatch Team"
            ).length;

    }

}


// ============================================================
// RENDER OPERATIONAL REPORTS
// ============================================================

function renderOperationalReports() {

    const tbody =
        document.getElementById("reportsTableBody");


    if (!tbody) {

        console.error(
            "reportsTableBody element not found."
        );

        return;

    }


    const logs =
        Array.isArray(operationalLogs)
            ? operationalLogs
            : [];


    // ========================================================
    // FILTER VALUES
    // ========================================================

    const search =
        document.getElementById("searchLogs")
            ?.value
            ?.trim()
            .toLowerCase() || "";


    const actor =
        document.getElementById("actorFilter")
            ?.value || "";


    const action =
        document.getElementById("actionFilter")
            ?.value || "";


    const date =
        document.getElementById("dateFilter")
            ?.value || "";


    // ========================================================
    // FILTER LOGS
    // ========================================================

    const filtered =
        logs.filter(log => {

            if (!log) {
                return false;
            }


            const searchable = `
                ${log.actorName || ""}
                ${log.actorType || ""}
                ${log.action || ""}
                ${log.description || ""}
                ${log.complaintID || ""}
                ${log.oldValue || ""}
                ${log.newValue || ""}
            `.toLowerCase();


            // SEARCH

            if (
                search &&
                !searchable.includes(search)
            ) {

                return false;

            }


            // ACTOR

            if (
                actor &&
                log.actorType !== actor
            ) {

                return false;

            }


            // ACTION

            if (
                action &&
                log.action !== action
            ) {

                return false;

            }


            // DATE

            if (date) {

                const createdAt =
                    String(
                        log.createdAt || ""
                    );


                if (
                    !createdAt.startsWith(date)
                ) {

                    return false;

                }

            }


            return true;

        });


    // ========================================================
    // TOTAL PAGES
    // ========================================================

    const totalPages =
        Math.ceil(
            filtered.length /
            operationalLogsPerPage
        );


    // ========================================================
    // PROTECT CURRENT PAGE
    // ========================================================

    if (
        totalPages > 0 &&
        operationalCurrentPage > totalPages
    ) {

        operationalCurrentPage =
            totalPages;

    }


    if (
        operationalCurrentPage < 1
    ) {

        operationalCurrentPage = 1;

    }


    // ========================================================
    // CURRENT PAGE DATA
    // ========================================================

    const startIndex =
        (
            operationalCurrentPage - 1
        ) *
        operationalLogsPerPage;


    const endIndex =
        startIndex +
        operationalLogsPerPage;


    const currentLogs =
        filtered.slice(
            startIndex,
            endIndex
        );


    // ========================================================
    // NO RESULTS
    // ========================================================

    if (!currentLogs.length) {

        tbody.innerHTML = `
            <tr>

                <td
                    colspan="5"
                    class="py-16 text-center"
                >

                    <div
                        class="
                            flex
                            flex-col
                            items-center
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-inbox
                                text-xl
                                text-gray-300
                                mb-3
                            "
                        ></i>

                        <p
                            class="
                                text-sm
                                font-medium
                                text-gray-500
                            "
                        >
                            No activity logs found.
                        </p>

                        <p
                            class="
                                text-xs
                                text-gray-400
                                mt-1
                            "
                        >
                            Try adjusting your filters.
                        </p>

                    </div>

                </td>

            </tr>
        `;


        renderOperationalPagination(
            filtered.length
        );


        return;

    }


    // ========================================================
    // RENDER ROWS
    // ========================================================

    tbody.innerHTML =
        currentLogs
            .map(
                renderOperationalRow
            )
            .join("");


    // ========================================================
    // RENDER PAGINATION
    // ========================================================

    renderOperationalPagination(
        filtered.length
    );

}


// ============================================================
// RENDER SINGLE REPORT ROW
// ============================================================

function renderOperationalRow(log) {

    const rawDate =
        log?.createdAt || "";


    const date =
        rawDate
            ? new Date(
                String(rawDate)
                    .replace(" ", "T")
            )
            : null;


    const validDate =
        date &&
        !isNaN(date.getTime());


    // ========================================================
    // ACTOR BADGE
    // ========================================================

    let actorBadge =
        "bg-gray-100 text-gray-600";


    switch (
        String(
            log?.actorType || ""
        ).toLowerCase()
    ) {

        case "citizen":

            actorBadge =
                "bg-blue-50 text-blue-700";

            break;


        case "system user":

            actorBadge =
                "bg-gray-100 text-gray-700";

            break;


        case "dispatch team":

            actorBadge =
                "bg-indigo-50 text-indigo-700";

            break;


        case "system":

            actorBadge =
                "bg-gray-100 text-gray-600";

            break;

    }


    // ========================================================
    // ACTION BADGE
    // ========================================================

    let actionBadge =
        "bg-blue-50 text-blue-700";


    const actionText =
        String(
            log?.action || ""
        ).toLowerCase();


    if (
        actionText.includes("rejected")
    ) {

        actionBadge =
            "bg-red-50 text-red-700";

    }

    else if (
        actionText.includes("completed")
    ) {

        actionBadge =
            "bg-green-50 text-green-700";

    }

    else if (
        actionText.includes("verified")
    ) {

        actionBadge =
            "bg-green-50 text-green-700";

    }

    else if (
        actionText.includes("dispatch")
    ) {

        actionBadge =
            "bg-indigo-50 text-indigo-700";

    }


    // ========================================================
    // COMPLAINT DISPLAY
    // ========================================================

    const complaintCell =
        log?.complaintID
            ? `
                <span
                    class="
                        inline-flex
                        items-center
                        px-2.5
                        py-1
                        rounded-lg
                        bg-gray-100
                        text-gray-700
                        text-xs
                        font-semibold
                    "
                >
                    #${escapeHtml(
                        String(
                            log.complaintID
                        )
                    )}
                </span>
            `
            : `
                <span
                    class="
                        text-xs
                        text-gray-400
                    "
                >
                    System
                </span>
            `;


    // ========================================================
    // VALUE CHANGE
    // ========================================================

    const valueChange =
        log?.oldValue ||
        log?.newValue
            ? `
                <div
                    class="
                        flex
                        items-center
                        gap-2
                        mt-2
                        text-xs
                        text-gray-400
                    "
                >

                    <span
                        class="
                            truncate
                            max-w-[140px]
                        "
                    >
                        ${escapeHtml(
                            log?.oldValue ||
                            "—"
                        )}
                    </span>

                    <i
                        class="
                            fa-solid
                            fa-arrow-right
                            text-[9px]
                        "
                    ></i>

                    <span
                        class="
                            truncate
                            max-w-[140px]
                        "
                    >
                        ${escapeHtml(
                            log?.newValue ||
                            "—"
                        )}
                    </span>

                </div>
            `
            : "";


    // ========================================================
    // RETURN ROW
    // ========================================================

    return `
        <tr
            class="
                border-b
                border-gray-100
                hover:bg-gray-50
                transition-colors
            "
        >

            <!-- DATE & TIME -->

            <td
                class="
                    px-5
                    py-4
                    whitespace-nowrap
                    border-r
                    border-gray-100
                "
            >

                <div
                    class="
                        font-medium
                        text-gray-700
                    "
                >

                    ${
                        validDate
                            ? formatDate(date)
                            : "N/A"
                    }

                </div>


                <div
                    class="
                        text-xs
                        text-gray-400
                        mt-0.5
                    "
                >

                    ${
                        validDate
                            ? formatTime(date)
                            : "—"
                    }

                </div>

            </td>


            <!-- ACTOR -->

            <td
                class="
                    px-5
                    py-4
                    border-r
                    border-gray-100
                "
            >

                <div
                    class="
                        font-medium
                        text-gray-800
                    "
                >

                    ${escapeHtml(
                        log?.actorName ||
                        "System"
                    )}

                </div>


                <div class="mt-1">

                    <span
                        class="
                            inline-flex
                            items-center
                            px-2
                            py-0.5
                            rounded-full
                            text-[10px]
                            font-semibold
                            ${actorBadge}
                        "
                    >

                        ${escapeHtml(
                            log?.actorType ||
                            "System"
                        )}

                    </span>

                </div>

            </td>


            <!-- ACTION -->

            <td
                class="
                    px-5
                    py-4
                    border-r
                    border-gray-100
                "
            >

                <span
                    class="
                        inline-flex
                        items-center
                        px-2.5
                        py-1
                        rounded-full
                        ${actionBadge}
                        text-xs
                        font-semibold
                        whitespace-nowrap
                    "
                >

                    ${escapeHtml(
                        log?.action ||
                        "Unknown"
                    )}

                </span>

            </td>


            <!-- COMPLAINT -->

            <td
                class="
                    px-5
                    py-4
                    border-r
                    border-gray-100
                "
            >

                ${complaintCell}

            </td>


            <!-- DETAILS -->

            <td
                class="
                    px-5
                    py-4
                    max-w-md
                "
            >

                <div
                    class="
                        text-sm
                        leading-6
                        text-gray-600
                    "
                >

                    ${escapeHtml(
                        log?.description ||
                        "No details available."
                    )}

                </div>


                ${valueChange}

            </td>

        </tr>
    `;

}


// ============================================================
// PAGINATION
// SAME BEHAVIOR AS FEEDBACK
// ============================================================

function renderOperationalPagination(
    totalItems = 0
) {

    const paginationInfo =
        document.getElementById(
            "reportsPageInfo"
        );


    const pagination =
        document.getElementById(
            "reportsPagination"
        );


    if (
        !paginationInfo ||
        !pagination
    ) {

        return;

    }


    // ========================================================
    // NO RESULTS
    // ========================================================

    if (totalItems <= 0) {

        paginationInfo.textContent =
            "Showing 0 of 0";

        pagination.innerHTML = "";

        return;

    }


    // ========================================================
    // TOTAL PAGES
    // ========================================================

    const totalPages =
        Math.ceil(
            totalItems /
            operationalLogsPerPage
        );


    // ========================================================
    // PROTECT CURRENT PAGE
    // ========================================================

    if (
        operationalCurrentPage >
        totalPages
    ) {

        operationalCurrentPage =
            totalPages;

    }


    if (
        operationalCurrentPage < 1
    ) {

        operationalCurrentPage = 1;

    }


    // ========================================================
    // PAGE INFORMATION
    // ========================================================

    const pageFrom =
        (
            (
                operationalCurrentPage - 1
            ) *
            operationalLogsPerPage
        ) + 1;


    const pageTo =
        Math.min(
            operationalCurrentPage *
            operationalLogsPerPage,
            totalItems
        );


    paginationInfo.textContent =
        `Showing ${pageFrom}-${pageTo} of ${totalItems}`;


    pagination.innerHTML = "";


    // ========================================================
    // CREATE PAGE BUTTON
    // EXACT FEEDBACK STYLE
    // ========================================================

    function createPageButton(
        label,
        page,
        active = false,
        disabled = false
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.textContent =
            label;


        button.className = `
            min-w-[32px]
            h-8
            px-2
            rounded-lg
            border
            text-xs
            font-semibold
            transition

            ${
                active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }

            ${
                disabled
                    ? "opacity-40 cursor-not-allowed"
                    : ""
            }
        `;


        button.disabled =
            disabled;


        if (!disabled) {

            button.addEventListener(
                "click",
                () => {

                    if (
                        page ===
                        operationalCurrentPage
                    ) {

                        return;

                    }


                    operationalCurrentPage =
                        page;


                    renderOperationalReports();

                }
            );

        }


        return button;

    }


    // ========================================================
    // PREVIOUS
    // ========================================================

    pagination.appendChild(
        createPageButton(
            "‹",
            operationalCurrentPage - 1,
            false,
            operationalCurrentPage <= 1
        )
    );


    // ========================================================
    // PAGE NUMBERS
    // ========================================================

    const pages = [];


    if (
        totalPages <= 7
    ) {

        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pages.push(i);

        }

    }

    else {

        pages.push(1);


        if (
            operationalCurrentPage > 4
        ) {

            pages.push("...");

        }


        const startPage =
            Math.max(
                2,
                operationalCurrentPage - 1
            );


        const endPage =
            Math.min(
                totalPages - 1,
                operationalCurrentPage + 1
            );


        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {

            pages.push(i);

        }


        if (
            operationalCurrentPage <
            totalPages - 3
        ) {

            pages.push("...");

        }


        pages.push(totalPages);

    }


    // ========================================================
    // RENDER PAGE NUMBERS
    // ========================================================

    pages.forEach(page => {

        if (
            page === "..."
        ) {

            const dots =
                document.createElement("span");


            dots.textContent =
                "...";


            dots.className = `
                w-8
                h-8
                flex
                items-center
                justify-center
                text-gray-400
                text-xs
            `;


            pagination.appendChild(
                dots
            );


            return;

        }


        pagination.appendChild(
            createPageButton(
                String(page),
                page,
                page === operationalCurrentPage
            )
        );

    });


    // ========================================================
    // NEXT
    // ========================================================

    pagination.appendChild(
        createPageButton(
            "›",
            operationalCurrentPage + 1,
            false,
            operationalCurrentPage >= totalPages
        )
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date) {

    if (
        !date ||
        isNaN(date.getTime())
    ) {

        return "N/A";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(date) {

    if (
        !date ||
        isNaN(date.getTime())
    ) {

        return "—";

    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}