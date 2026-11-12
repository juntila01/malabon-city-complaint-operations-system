
/* ============================================================
   MCAT COMPLAINT ANALYTICS
   ============================================================ */

let operationsReportData = null;

let operationsMonthlyChart = null;
let operationsCategoryChart = null;
let operationsUrgencyChart = null;

let operationsChartJsPromise = null;
let operationsReportRequestController = null;
let operationsReportRequestNumber = 0;

// TABLE PAGINATION
const OPERATIONS_ROWS_PER_PAGE = 10;

let operationsLocationPage = 1;
let operationsRecordsPage = 1;


// ============================================================
// INITIALIZE
// ============================================================

async function initOperationsReports() {
    const page = document.getElementById("operationsReportPage");

    if (!page) return;

    const startInput = document.getElementById("operationsStartDate");
    const endInput = document.getElementById("operationsEndDate");

    if (startInput && !startInput.value) {
        startInput.value = operationsFirstDayOfYear();
    }

    if (endInput && !endInput.value) {
        endInput.value = operationsToday();
    }

    const handlers = {
        operationsGenerateReport: applyOperationsFilters,
        operationsResetFilters: resetOperationsFilters,
        operationsExportCSV: exportOperationsCSV,
        operationsPrintReport: printOperationsReport
    };

    Object.entries(handlers).forEach(([id, handler]) => {
        const element = document.getElementById(id);

        if (element) {
            element.onclick = handler;
        }
    });

    await loadOperationsReports();
}


// ============================================================
// FILTERS
// ============================================================

function getOperationsFilters() {
    return {
        startDate: document.getElementById("operationsStartDate")?.value || "",
        endDate: document.getElementById("operationsEndDate")?.value || "",
        location: document.getElementById("operationsLocationFilter")?.value || "",
        category: document.getElementById("operationsCategoryFilter")?.value || "",
        urgency: document.getElementById("operationsUrgencyFilter")?.value || "",
        status: document.getElementById("operationsStatusFilter")?.value || ""
    };
}


async function applyOperationsFilters() {
    const filters = getOperationsFilters();

    if (!filters.startDate || !filters.endDate) {
        alert("Please select both the start date and end date.");
        return;
    }

    if (filters.startDate > filters.endDate) {
        alert("The start date cannot be later than the end date.");
        return;
    }

    await loadOperationsReports();
}


async function resetOperationsFilters() {
    const startInput = document.getElementById("operationsStartDate");
    const endInput = document.getElementById("operationsEndDate");

    if (startInput) startInput.value = operationsFirstDayOfYear();
    if (endInput) endInput.value = operationsToday();

    [
        "operationsLocationFilter",
        "operationsCategoryFilter",
        "operationsUrgencyFilter",
        "operationsStatusFilter"
    ].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = "";
    });

    await loadOperationsReports();
}


// ============================================================
// CHART.JS LOADER
// ============================================================

function ensureOperationsChartJs() {
    if (typeof Chart !== "undefined") {
        return Promise.resolve(true);
    }

    if (operationsChartJsPromise) {
        return operationsChartJsPromise;
    }

    operationsChartJsPromise = new Promise(resolve => {
        const existingScript = document.querySelector(
            'script[data-operations-chartjs="true"]'
        );

        if (existingScript) {
            existingScript.addEventListener(
                "load",
                () => resolve(typeof Chart !== "undefined"),
                { once: true }
            );

            existingScript.addEventListener(
                "error",
                () => resolve(false),
                { once: true }
            );

            return;
        }

        const script = document.createElement("script");

        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.async = true;
        script.dataset.operationsChartjs = "true";

        script.onload = () => resolve(typeof Chart !== "undefined");

        script.onerror = () => {
            console.error("Unable to load Chart.js.");
            resolve(false);
        };

        document.head.appendChild(script);
    });

    return operationsChartJsPromise;
}


// ============================================================
// LOAD REPORT DATA
// ============================================================

async function loadOperationsReports() {
    const filters = getOperationsFilters();

    if (!filters.startDate || !filters.endDate) {
        setOperationsMessage("Select a start date and end date.", "error");
        return;
    }

    if (filters.startDate > filters.endDate) {
        setOperationsMessage(
            "The start date cannot be later than the end date.",
            "error"
        );
        return;
    }

    if (operationsReportRequestController) {
        operationsReportRequestController.abort();
    }

    const controller = new AbortController();

    operationsReportRequestController = controller;

    const requestNumber = ++operationsReportRequestNumber;

    setOperationsMessage("Loading complaint analytics...", "loading");

    const button = document.getElementById("operationsGenerateReport");

    if (button) {
        button.disabled = true;
        button.classList.add("opacity-60", "cursor-wait");
    }

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params.set(key, value);
    });

    try {
        const response = await fetch(
            `/Complaint/Reports/get_operations_analytics.php?${params.toString()}`,
            {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
                headers: {
                    Accept: "application/json"
                }
            }
        );

        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            console.error("Invalid analytics response:", responseText);

            throw new Error(
                "The server did not return valid JSON. Check PHP errors and authentication."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                `The report request failed (${response.status}).`
            );
        }

        if (
            !result.summary ||
            !Array.isArray(result.records) ||
            !Array.isArray(result.monthlyTrend) ||
            !Array.isArray(result.categoryBreakdown) ||
            !Array.isArray(result.urgencyBreakdown) ||
            !Array.isArray(result.statusBreakdown) ||
            !Array.isArray(result.locationBreakdown) ||
            !Array.isArray(result.predictions)
        ) {
            console.error("Unexpected analytics response structure:", result);

            throw new Error(
                "The analytics response is incomplete. Check get_operations_analytics.php."
            );
        }

        if (requestNumber !== operationsReportRequestNumber) return;

        // New report starts both tables at page 1.
        operationsLocationPage = 1;
        operationsRecordsPage = 1;

        operationsReportData = result;

        populateOperationsLocations(result.filters?.locations || []);

        const chartAvailable = await ensureOperationsChartJs();

        if (requestNumber !== operationsReportRequestNumber) return;

        renderOperationsReport(result, chartAvailable);

        const period = document.getElementById("operationsReportPeriod");

        if (period) {
            period.textContent =
                `Reporting period: ${result.period?.start || filters.startDate} to ${result.period?.end || filters.endDate}. ` +
                "Values reflect the filters currently applied.";
        }

        if (!chartAvailable) {
            setOperationsMessage(
                `${Number(result.summary.total || 0).toLocaleString()} complaint record(s) loaded. Charts are unavailable because Chart.js could not be loaded.`,
                "warning"
            );
        } else {
            setOperationsMessage(
                `${Number(result.summary.total || 0).toLocaleString()} matching complaint record(s) loaded.`,
                "success"
            );
        }

    } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Complaint analytics error:", error);

        setOperationsMessage(
            error.message || "Unable to load complaint analytics.",
            "error"
        );

    } finally {
        if (requestNumber === operationsReportRequestNumber) {
            operationsReportRequestController = null;

            const currentButton = document.getElementById(
                "operationsGenerateReport"
            );

            if (currentButton) {
                currentButton.disabled = false;
                currentButton.classList.remove(
                    "opacity-60",
                    "cursor-wait"
                );
            }
        }
    }
}


// ============================================================
// RENDER ALL REPORTS
// ============================================================

function renderOperationsReport(data, chartAvailable = true) {
    renderOperationsSummary(data.summary || {});

    renderOperationsMonthly(data.monthlyTrend || [], chartAvailable);
    renderOperationsCategories(data.categoryBreakdown || [], chartAvailable);
    renderOperationsUrgency(data.urgencyBreakdown || [], chartAvailable);

    renderOperationsStatuses(data.statusBreakdown || []);
    renderOperationsLocations(data.locationBreakdown || []);
    renderOperationsPredictions(data.predictions || []);
    renderOperationsRecords(data.records || []);
}


// ============================================================
// SUMMARY CARDS
// ============================================================

function renderOperationsSummary(summary) {
    setOperationsText("operationsTotal", summary.total);
    setOperationsText("operationsHighUrgency", summary.highUrgency);
    setOperationsText("operationsResolved", summary.resolved);
    setOperationsText("operationsActive", summary.active);
}


// ============================================================
// CHART HELPERS
// ============================================================

function destroyOperationsChart(chart) {
    if (chart) chart.destroy();
}


function prepareOperationsCanvas(canvasId, chartAvailable) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    const parent = canvas.parentElement;

    let fallback = parent?.querySelector(".operations-chart-fallback");

    if (!chartAvailable || typeof Chart === "undefined") {
        canvas.style.display = "none";

        if (parent && !fallback) {
            fallback = document.createElement("p");

            fallback.className =
                "operations-chart-fallback py-8 text-center text-sm text-slate-500";

            fallback.textContent =
                "Chart unavailable. Check your internet connection and Chart.js loading.";

            parent.appendChild(fallback);
        }

        return null;
    }

    canvas.style.display = "";

    if (fallback) fallback.remove();

    return canvas;
}


// ============================================================
// MONTHLY TREND CHART
// ============================================================

function renderOperationsMonthly(rows, chartAvailable = true) {
    destroyOperationsChart(operationsMonthlyChart);
    operationsMonthlyChart = null;

    const canvas = prepareOperationsCanvas(
        "operationsMonthlyChart",
        chartAvailable
    );

    if (!canvas) return;

    operationsMonthlyChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: rows.map(row => row.label),

            datasets: [{
                label: "Complaints",
                data: rows.map(row => Number(row.total || 0)),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.10)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.25,
                fill: true
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// ============================================================
// CATEGORY CHART
// ============================================================

function renderOperationsCategories(rows, chartAvailable = true) {
    destroyOperationsChart(operationsCategoryChart);
    operationsCategoryChart = null;

    const canvas = prepareOperationsCanvas(
        "operationsCategoryChart",
        chartAvailable
    );

    if (!canvas) return;

    const categoryColors = {
        Fire: "#dc2626",
        Flood: "#2563eb",
        Obstruction: "#ca8a04",
        Traffic: "#475569",
        Uncategorized: "#94a3b8"
    };

    operationsCategoryChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: rows.map(row => row.label),

            datasets: [{
                label: "Complaints",
                data: rows.map(row => Number(row.total || 0)),

                backgroundColor: rows.map(row =>
                    categoryColors[row.label] || "#64748b"
                ),

                borderRadius: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// ============================================================
// URGENCY CHART
// ============================================================

function renderOperationsUrgency(rows, chartAvailable = true) {
    destroyOperationsChart(operationsUrgencyChart);
    operationsUrgencyChart = null;

    const canvas = prepareOperationsCanvas(
        "operationsUrgencyChart",
        chartAvailable
    );

    if (!canvas) return;

    const labels = rows.map(row => row.label);

    operationsUrgencyChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels,

            datasets: [{
                data: rows.map(row => Number(row.total || 0)),

                backgroundColor: labels.map(label => {
                    const normalized = String(label).toUpperCase();

                    if (normalized === "HIGH") return "#dc2626";
                    if (normalized === "NORMAL") return "#2563eb";

                    return "#94a3b8";
                }),

                borderWidth: 1
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// ============================================================
// STATUS BREAKDOWN
// ============================================================

function renderOperationsStatuses(rows) {
    const container = document.getElementById(
        "operationsStatusBreakdown"
    );

    if (!container) return;

    const total = rows.reduce(
        (sum, row) => sum + Number(row.total || 0),
        0
    );

    if (!rows.length) {
        container.innerHTML = `
            <p class="text-sm text-slate-400">
                No status data for this period.
            </p>
        `;
        return;
    }

    container.innerHTML = rows.map(row => {
        const count = Number(row.total || 0);

        const percentage = total
            ? (count / total) * 100
            : 0;

        return `
            <div>
                <div class="mb-1 flex justify-between gap-3 text-sm">
                    <span class="font-medium text-slate-700">
                        ${escapeOperationsHTML(row.label)}
                    </span>

                    <span class="text-slate-500">
                        ${count.toLocaleString()}
                        (${percentage.toFixed(1)}%)
                    </span>
                </div>

                <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        class="h-full rounded-full bg-blue-600"
                        style="width:${Math.min(percentage, 100)}%">
                    </div>
                </div>
            </div>
        `;
    }).join("");
}


// ============================================================
// TABLE PAGINATION HELPER
// ============================================================

function renderOperationsPagination(
    containerId,
    totalRows,
    currentPage,
    onPageChange
) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.replaceChildren();

    const totalPages = Math.max(
        1,
        Math.ceil(totalRows / OPERATIONS_ROWS_PER_PAGE)
    );

    currentPage = Math.min(
        Math.max(currentPage, 1),
        totalPages
    );

    const start = totalRows === 0
        ? 0
        : (currentPage - 1) * OPERATIONS_ROWS_PER_PAGE + 1;

    const end = Math.min(
        currentPage * OPERATIONS_ROWS_PER_PAGE,
        totalRows
    );

    const wrapper = document.createElement("div");

    wrapper.className =
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

    const summary = document.createElement("p");

    summary.className = "text-xs text-slate-500";
    summary.textContent =
        `Showing ${start}-${end} of ${totalRows.toLocaleString()} entries`;

    wrapper.appendChild(summary);

    const controls = document.createElement("div");

    controls.className =
        "flex flex-wrap items-center justify-start gap-1 sm:justify-end";

    function addButton(label, page, options = {}) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);

        button.className = options.active
            ? "min-w-9 rounded-lg border border-blue-700 bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
            : "min-w-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

        if (options.active) {
            button.setAttribute("aria-current", "page");
        }

        button.addEventListener("click", () => {
            if (!button.disabled && page !== currentPage) {
                onPageChange(page);
            }
        });

        controls.appendChild(button);
    }

    function addEllipsis() {
        const span = document.createElement("span");

        span.className = "px-1 text-sm text-slate-400";
        span.textContent = "…";

        controls.appendChild(span);
    }

    addButton("‹", currentPage - 1, {
        disabled: currentPage <= 1
    });

    addButton("1", 1, {
        active: currentPage === 1
    });

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
    }

    if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
    }

    if (startPage > 2) addEllipsis();

    for (let page = startPage; page <= endPage; page++) {
        addButton(String(page), page, {
            active: currentPage === page
        });
    }

    if (endPage < totalPages - 1) addEllipsis();

    if (totalPages > 1) {
        addButton(String(totalPages), totalPages, {
            active: currentPage === totalPages
        });
    }

    addButton("›", currentPage + 1, {
        disabled: currentPage >= totalPages
    });

    wrapper.appendChild(controls);
    container.appendChild(wrapper);
}


// ============================================================
// LOCATION COMPARISON
// ============================================================

function renderOperationsLocations(rows) {
    const body = document.getElementById("operationsLocationBody");

    if (!body) return;

    rows = Array.isArray(rows) ? rows : [];

    const totalPages = Math.max(
        1,
        Math.ceil(rows.length / OPERATIONS_ROWS_PER_PAGE)
    );

    operationsLocationPage = Math.min(
        Math.max(operationsLocationPage, 1),
        totalPages
    );

    if (!rows.length) {
        body.innerHTML = `
            <tr>
                <td colspan="5"
                    class="px-5 py-8 text-center text-slate-400">
                    No location data for the selected filters.
                </td>
            </tr>
        `;

        renderOperationsPagination(
            "operationsLocationPagination",
            0,
            1,
            () => {}
        );

        return;
    }

    const startIndex =
        (operationsLocationPage - 1) * OPERATIONS_ROWS_PER_PAGE;

    const visibleRows = rows.slice(
        startIndex,
        startIndex + OPERATIONS_ROWS_PER_PAGE
    );

    body.innerHTML = visibleRows
        .map(getOperationsLocationRowHTML)
        .join("");

    renderOperationsPagination(
        "operationsLocationPagination",
        rows.length,
        operationsLocationPage,
        page => {
            operationsLocationPage = page;
            renderOperationsLocations(
                operationsReportData?.locationBreakdown || []
            );
        }
    );
}


function getOperationsLocationRowHTML(row) {
    return `
        <tr class="hover:bg-slate-50">
            <td class="px-5 py-4 font-semibold text-slate-800">
                ${escapeOperationsHTML(row.location || "Unknown")}
            </td>

            <td class="px-5 py-4">
                ${Number(row.total || 0).toLocaleString()}
            </td>

            <td class="px-5 py-4">
                ${escapeOperationsHTML(row.topCategory || "Unknown")}
            </td>

            <td class="px-5 py-4 font-semibold text-red-600">
                ${Number(row.highUrgency || 0).toLocaleString()}
            </td>

            <td class="px-5 py-4">
                ${Number(row.active || 0).toLocaleString()}
            </td>
        </tr>
    `;
}


// ============================================================
// HISTORICAL PATTERNS / PLANNING INSIGHTS
// ============================================================

function renderOperationsPredictions(rows) {
    const container = document.getElementById(
        "operationsPredictionContainer"
    );

    if (!container) return;

    if (!rows.length) {
        container.innerHTML = `
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                There is not enough historical information to establish a seasonal pattern.
            </div>
        `;
        return;
    }

    container.innerHTML = rows.map(row => {
        const level = String(
            row.level || "HISTORICAL PATTERN"
        ).toUpperCase();

        let badgeClass = "bg-blue-100 text-blue-800";

        if (level === "ELEVATED") {
            badgeClass = "bg-amber-100 text-amber-800";
        } else if (
            level === "HIGHER THAN USUAL" ||
            level === "HIGH"
        ) {
            badgeClass = "bg-red-100 text-red-800";
        } else if (level === "LIMITED HISTORY") {
            badgeClass = "bg-slate-100 text-slate-700";
        }

        return `
            <article class="rounded-xl border border-slate-200 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-semibold text-slate-900">
                        ${escapeOperationsHTML(row.title)}
                    </h3>

                    <span class="rounded-full px-3 py-1 text-xs font-bold ${badgeClass}">
                        ${escapeOperationsHTML(level)}
                    </span>
                </div>

                <p class="mt-2 text-sm leading-6 text-slate-600">
                    ${escapeOperationsHTML(row.description)}
                </p>

                <p class="mt-2 text-sm font-medium text-blue-800">
                    Suggested preparation:
                    ${escapeOperationsHTML(row.recommendation)}
                </p>

                <p class="mt-2 text-xs text-slate-400">
                    ${escapeOperationsHTML(row.evidence || "")}
                </p>
            </article>
        `;
    }).join("");
}


// ============================================================
// DETAILED COMPLAINT RECORDS
// ============================================================

function renderOperationsRecords(rows) {
    const body = document.getElementById("operationsRecordsBody");
    const count = document.getElementById("operationsRecordCount");

    rows = Array.isArray(rows) ? rows : [];

    if (count) {
        count.textContent =
            `${rows.length.toLocaleString()} record(s) included in this report.`;
    }

    if (!body) return;

    const totalPages = Math.max(
        1,
        Math.ceil(rows.length / OPERATIONS_ROWS_PER_PAGE)
    );

    operationsRecordsPage = Math.min(
        Math.max(operationsRecordsPage, 1),
        totalPages
    );

    if (!rows.length) {
        body.innerHTML = `
            <tr>
                <td colspan="6"
                    class="px-4 py-8 text-center text-slate-400">
                    No matching complaint records.
                </td>
            </tr>
        `;

        renderOperationsPagination(
            "operationsRecordsPagination",
            0,
            1,
            () => {}
        );

        return;
    }

    const startIndex =
        (operationsRecordsPage - 1) * OPERATIONS_ROWS_PER_PAGE;

    const visibleRows = rows.slice(
        startIndex,
        startIndex + OPERATIONS_ROWS_PER_PAGE
    );

    body.innerHTML = visibleRows
        .map(getOperationsRecordRowHTML)
        .join("");

    renderOperationsPagination(
        "operationsRecordsPagination",
        rows.length,
        operationsRecordsPage,
        page => {
            operationsRecordsPage = page;
            renderOperationsRecords(
                operationsReportData?.records || []
            );
        }
    );
}


function getOperationsRecordRowHTML(row) {
    const urgency = String(
        row.urgency || "Unknown"
    ).toUpperCase();

    const urgencyClass = urgency === "HIGH"
        ? "font-bold text-red-600"
        : urgency === "NORMAL"
            ? "font-medium text-blue-700"
            : "font-medium text-slate-500";

    return `
        <tr class="hover:bg-slate-50">
            <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                ${escapeOperationsHTML(
                    row.reference || `#${row.complaintID ?? ""}`
                )}
            </td>

            <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                ${escapeOperationsHTML(row.createdAt || "—")}
            </td>

            <td class="px-4 py-3 text-slate-600">
                ${escapeOperationsHTML(row.location || "Unknown")}
            </td>

            <td class="px-4 py-3">
                ${escapeOperationsHTML(row.category || "Uncategorized")}
            </td>

            <td class="px-4 py-3">
                <span class="${urgencyClass}">
                    ${escapeOperationsHTML(urgency)}
                </span>
            </td>

            <td class="whitespace-nowrap px-4 py-3">
                ${escapeOperationsHTML(row.status || "Unknown")}
            </td>
        </tr>
    `;
}


// ============================================================
// LOCATION FILTER OPTIONS
// ============================================================

function populateOperationsLocations(locations) {
    const select = document.getElementById("operationsLocationFilter");

    if (!select) return;

    const previousValue = select.value;

    const uniqueLocations = [
        ...new Set(
            locations
                .map(location => String(location ?? "").trim())
                .filter(Boolean)
        )
    ];

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All locations";

    select.appendChild(allOption);

    uniqueLocations.forEach(location => {
        const option = document.createElement("option");

        option.value = location;
        option.textContent = location;

        select.appendChild(option);
    });

    if (
        [...select.options].some(
            option => option.value === previousValue
        )
    ) {
        select.value = previousValue;
    }
}


// ============================================================
// CSV EXPORT
// ============================================================

function exportOperationsCSV() {
    const data = operationsReportData;

    if (!data) {
        alert("Please load the report before exporting.");
        return;
    }

    const rows = data.records || [];

    const headers = [
        "Complaint Reference",
        "Date Submitted",
        "Location",
        "Category",
        "Urgency",
        "Status"
    ];

    function csvCell(value) {
        let text = String(value ?? "");

        if (/^[\s]*[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    const csvRows = [
        headers,
        ...rows.map(row => [
            row.reference || `#${row.complaintID ?? ""}`,
            row.createdAt,
            row.location,
            row.category,
            row.urgency,
            row.status
        ])
    ];

    const csv = "\uFEFF" + csvRows
        .map(row => row.map(csvCell).join(","))
        .join("\r\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `MCAT_Complaint_Analytics_${operationsToday()}.csv`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
}


// ============================================================
// PRINT / SAVE AS PDF
// ============================================================

function printOperationsReport() {
    if (!operationsReportData) {
        alert("Load the report before printing.");
        return;
    }

    document.getElementById("operationsPrintRoot")?.remove();

    const page = document.getElementById("operationsReportPage");

    if (!page) {
        alert("The report page could not be found.");
        return;
    }

    const clone = page.cloneNode(true);

    clone.id = "operationsReportPrintClone";

    // Remove screen-only pagination from the printed report.
    clone.querySelector("#operationsLocationPagination")?.remove();
    clone.querySelector("#operationsRecordsPagination")?.remove();

    // Restore ALL location rows in the print clone.
    const printLocationBody = clone.querySelector(
        "#operationsLocationBody"
    );

    if (printLocationBody) {
        const locations = operationsReportData.locationBreakdown || [];

        printLocationBody.innerHTML = locations
            .map(getOperationsLocationRowHTML)
            .join("");

        if (!locations.length) {
            printLocationBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-5 py-8 text-center">
                        No location data for the selected filters.
                    </td>
                </tr>
            `;
        }
    }

    // Restore ALL complaint records in the print clone.
    const printRecordsBody = clone.querySelector(
        "#operationsRecordsBody"
    );

    if (printRecordsBody) {
        const records = operationsReportData.records || [];

        printRecordsBody.innerHTML = records
            .map(getOperationsRecordRowHTML)
            .join("");

        if (!records.length) {
            printRecordsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center">
                        No matching complaint records.
                    </td>
                </tr>
            `;
        }
    }

    // Remove filters and status messages from the printed report.
    clone.querySelector("#operationsFiltersSection")?.remove();
    clone.querySelector("#operationsReportMessage")?.remove();

    // Hide action buttons in the printed header.
    clone.querySelectorAll("button").forEach(button => button.remove());

    // Add reporting period to the printout.
    const periodText = document.getElementById(
        "operationsReportPeriod"
    )?.textContent || "";

    const period = document.createElement("p");

    period.className = "operations-print-period";
    period.textContent = periodText;

    const header = clone.querySelector("section");

    if (header) header.appendChild(period);

    // Copy chart canvases as images because cloneNode doesn't copy drawings.
    const originalCanvases = page.querySelectorAll("canvas");
    const clonedCanvases = clone.querySelectorAll("canvas");

    originalCanvases.forEach((originalCanvas, index) => {
        const clonedCanvas = clonedCanvases[index];

        if (!clonedCanvas) return;

        try {
            const image = document.createElement("img");

            image.src = originalCanvas.toDataURL("image/png");
            image.alt = "Complaint analytics chart";
            image.className = "operations-print-chart";

            clonedCanvas.replaceWith(image);
        } catch (error) {
            console.warn("Unable to prepare chart for printing:", error);
        }
    });

    const printRoot = document.createElement("div");

    printRoot.id = "operationsPrintRoot";
    printRoot.appendChild(clone);

    document.body.appendChild(printRoot);

    let style = document.getElementById("operationsPrintStyle");

    if (!style) {
        style = document.createElement("style");
        style.id = "operationsPrintStyle";
        document.head.appendChild(style);
    }

    style.textContent = `
        #operationsPrintRoot {
            display: none;
        }

        @media print {
            @page {
                size: landscape;
                margin: 10mm;
            }

            body > * {
                display: none !important;
            }

            body > #operationsPrintRoot {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                color: #111827 !important;
            }

            #operationsPrintRoot,
            #operationsPrintRoot * {
                visibility: visible !important;
                box-sizing: border-box !important;
            }

            #operationsPrintRoot #operationsReportPrintClone {
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #fff !important;
                color: #111827 !important;
            }

            #operationsPrintRoot section,
            #operationsPrintRoot article,
            #operationsPrintRoot .rounded-2xl {
                box-shadow: none !important;
                break-inside: auto !important;
            }

            #operationsPrintRoot .overflow-x-auto,
            #operationsPrintRoot .overflow-hidden,
            #operationsPrintRoot .overflow-auto {
                overflow: visible !important;
            }

            #operationsPrintRoot .grid {
                break-inside: auto !important;
            }

            #operationsPrintRoot table {
                width: 100% !important;
                border-collapse: collapse !important;
                font-size: 8pt !important;
            }

            #operationsPrintRoot th,
            #operationsPrintRoot td {
                padding: 4px !important;
                border: 1px solid #d1d5db !important;
                color: #111827 !important;
            }

            #operationsPrintRoot tr {
                break-inside: avoid !important;
            }

            #operationsPrintRoot h1,
            #operationsPrintRoot h2,
            #operationsPrintRoot h3,
            #operationsPrintRoot p {
                color: #111827 !important;
            }

            #operationsPrintRoot .operations-print-period {
                display: block !important;
                margin-top: 8px !important;
                color: #475569 !important;
                font-size: 9pt !important;
            }

            #operationsPrintRoot .operations-print-chart {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: 75mm !important;
                object-fit: contain !important;
            }

            #operationsPrintRoot canvas {
                display: none !important;
            }

            #operationsPrintRoot .text-slate-400,
            #operationsPrintRoot .text-slate-500,
            #operationsPrintRoot .text-slate-600,
            #operationsPrintRoot .text-slate-700,
            #operationsPrintRoot .text-slate-800,
            #operationsPrintRoot .text-slate-900 {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
    `;

    const cleanup = () => {
        document.getElementById("operationsPrintRoot")?.remove();
        window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);

    // Fallback cleanup if the browser doesn't fire afterprint.
    setTimeout(cleanup, 60000);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
    });
}


// ============================================================
// UI HELPERS
// ============================================================

function setOperationsText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = Number(value || 0).toLocaleString();
    }
}


function setOperationsMessage(message, type = "loading") {
    const element = document.getElementById("operationsReportMessage");

    if (!element) return;

    element.className = "rounded-xl border p-4 text-sm";

    if (type === "error") {
        element.classList.add(
            "border-red-200",
            "bg-red-50",
            "text-red-700"
        );
    } else if (type === "success") {
        element.classList.add(
            "border-blue-200",
            "bg-blue-50",
            "text-blue-800"
        );
    } else if (type === "warning") {
        element.classList.add(
            "border-amber-200",
            "bg-amber-50",
            "text-amber-800"
        );
    } else {
        element.classList.add(
            "border-slate-200",
            "bg-slate-50",
            "text-slate-600"
        );
    }

    element.textContent = message;
}


function escapeOperationsHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function operationsToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function operationsFirstDayOfYear() {
    return `${new Date().getFullYear()}-01-01`;
}
