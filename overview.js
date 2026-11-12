(() => {

    // ============================================================
    // DASHBOARD STATE
    // ============================================================

    let complaintTrendChart = null;
    let categoryChart = null;

    let overviewData = null;

    let currentFrom = null;
    let currentTo = null;


    // ============================================================
    // EMERGENCY CLUSTER DETECTION
    // ============================================================

    let emergencyAlertActive = false;
    let lastEmergencyClusterKey = null;

    let currentEmergencyCluster = null;

    // ============================================================
    // SINGLE HIGH COMPLAINT ALERT TRACKING
    // ============================================================

    const SINGLE_HIGH_ALERT_STORAGE_KEY =
        "mcatAlertedSingleHighComplaintIDs";

    let alertedSingleHighComplaintIDs = new Set();

    try {
        const savedIDs = JSON.parse(
            sessionStorage.getItem(
                SINGLE_HIGH_ALERT_STORAGE_KEY
            ) || "[]"
        );

        if (Array.isArray(savedIDs)) {
            alertedSingleHighComplaintIDs = new Set(
                savedIDs.map(Number)
            );
        }
    } catch (error) {
        console.warn(
            "Unable to load previously alerted complaints.",
            error
        );
    }

    function rememberSingleHighAlert(complaintID) {
        alertedSingleHighComplaintIDs.add(Number(complaintID));

        sessionStorage.setItem(
            SINGLE_HIGH_ALERT_STORAGE_KEY,
            JSON.stringify(
                [...alertedSingleHighComplaintIDs]
            )
        );
    }


    // ============================================================
    // EMERGENCY ALERT SOUND
    // ============================================================

    let emergencyAlertSound =
        new Audio("/Complaint/assets/emergency-alert.mp3");

    emergencyAlertSound.preload = "auto";
    emergencyAlertSound.volume = 0.8;
    emergencyAlertSound.loop = true;

    let emergencyAudioUnlocked = false;


    document.addEventListener("click", () => {

        if (emergencyAudioUnlocked) {
            return;
        }

        emergencyAlertSound
            .play()
            .then(() => {

                emergencyAlertSound.pause();
                emergencyAlertSound.currentTime = 0;

                emergencyAudioUnlocked = true;

                console.log(
                    "Emergency alert sound unlocked."
                );

            })
            .catch(() => {

                // Browser still requires interaction

            });

    }, { once: true });


    // ============================================================
    // CENTRALIZED CATEGORY COLORS
    // ============================================================

    const CATEGORY_COLORS = {

        "Fire": "#EF4444",
        "Flood": "#3B82F6",
        "Obstruction": "#EAB308",

        "Medical": "#EC4899",
        "Crime": "#8B5CF6",
        "Traffic": "#F97316",
        "Garbage": "#22C55E",
        "Noise": "#6366F1",
        "Infrastructure": "#D97706",

        "Uncategorized": "#000000",
        "Other": "#000000"
    };


    const FALLBACK_CATEGORY_COLORS = [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#eab308",
        "#9333ea",
        "#f97316",
        "#0891b2",
        "#64748b",
        "#db2777",
        "#65a30d"
    ];


    let fallbackColorIndex = 0;


    // ============================================================
    // CATEGORY COLOR HELPER
    // ============================================================

    function getCategoryColor(category) {

        if (!category) {
            return "#64748b";
        }

        if (CATEGORY_COLORS[category]) {
            return CATEGORY_COLORS[category];
        }

        const normalized = String(category)
            .trim()
            .toLowerCase();

        const matchingKey =
            Object.keys(CATEGORY_COLORS)
                .find(key =>
                    key.toLowerCase() === normalized
                );

        if (matchingKey) {
            return CATEGORY_COLORS[matchingKey];
        }

        return FALLBACK_CATEGORY_COLORS[
            fallbackColorIndex++ %
            FALLBACK_CATEGORY_COLORS.length
        ];
    }


    // ============================================================
    // HTML ESCAPE
    // ============================================================

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ============================================================
    // DATE HELPERS
    // ============================================================

    function formatInputDate(date) {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function formatDisplayDate(dateString) {

        if (!dateString) {
            return "N/A";
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }


    function formatDateTime(dateString) {

        if (!dateString) {
            return "N/A";
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }


    // ============================================================
    // LOAD OVERVIEW
    // ============================================================

    async function loadOverview(from = null, to = null) {

        try {

            let url = "overview.php";

            const params = new URLSearchParams();

            if (from) {
                params.append("from", from);
            }

            if (to) {
                params.append("to", to);
            }

            params.append("period", "custom");

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log(
                "1. Loading overview:",
                url
            );


            const response = await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


            console.log(
                "2. Response status:",
                response.status
            );


            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const data = await response.json();


            console.log(
                "3. API DATA:",
                data
            );


            if (!data.success) {
                throw new Error(
                    data.message ||
                    "API returned success=false"
                );
            }


            console.log(
                "4. Metrics:",
                data.metrics
            );


            overviewData = data;

            currentFrom = from;
            currentTo = to;


            // ====================================================
            // MAIN CARD DATA
            // ====================================================

            loadMetrics(
                data.metrics || {}
            );


            console.log(
                "5. Metrics loaded"
            );


            // ====================================================
            // TOTAL COMPLAINTS CATEGORY HOVER
            // ====================================================

            updateTotalComplaintsHover(
                data.charts?.categories || []
            );


            // ====================================================
            // PENDING COMPLAINTS HOVER TABLE
            // ====================================================

            console.log(
                "PENDING COMPLAINTS FROM API:",
                data.pendingComplaints
            );

            loadPendingComplaints(
                data.pendingComplaints || []
            );


            // ====================================================
            // OTHER DASHBOARD COMPONENTS
            // ====================================================

            if (
                data.charts &&
                Array.isArray(data.charts.trend)
            ) {

                renderComplaintTrend(
                    data.charts.trend
                );

            }


            if (
                data.charts &&
                Array.isArray(data.charts.categories)
            ) {

                renderCategoryChart(
                    data.charts.categories
                );

                renderCategoryOverview(
                    data.charts.categories
                );

            }


            /*
             * Keep this if your backend returns
             * queue data later.
             */

            if (
                Array.isArray(
                    data.recentComplaints
                )
            ) {

                console.log(
                    "Recent complaints:",
                    data.recentComplaints
                );

            }

        } catch (error) {

            console.error(
                "OVERVIEW ERROR:",
                error
            );

            showDashboardError(
                "Unable to load dashboard data."
            );
        }
    }


    // ============================================================
    // NEARBY LANDMARK
    // ============================================================

    async function getNearbyLandmark(
        latitude,
        longitude
    ) {

        try {

            if (
                !window.google ||
                !google.maps
            ) {

                return "Landmark not identified";

            }


            const {
                Place
            } =
                await google.maps.importLibrary(
                    "places"
                );


            const request = {

                fields: [
                    "displayName",
                    "formattedAddress"
                ],

                locationRestriction: {

                    center: {
                        lat: latitude,
                        lng: longitude
                    },

                    radius: 500

                },

                includedTypes: [
                    "school",
                    "hospital",
                    "fire_station",
                    "police",
                    "church",
                    "shopping_mall",
                    "supermarket",
                    "park",
                    "government_office"
                ]

            };


            const {
                places
            } =
                await Place.searchNearby(
                    request
                );


            if (
                !places ||
                places.length === 0
            ) {

                return "Landmark not identified";

            }


            const place =
                places[0];


            if (!place.displayName) {

                return "Landmark not identified";

            }


            return `Near ${place.displayName}`;

        }
        catch (error) {

            console.warn(
                "Unable to determine nearby landmark:",
                error
            );

            return "Landmark not identified";

        }

    }


    // ============================================================
    // EMERGENCY CLUSTER MODAL
    // ============================================================

    function showEmergencyClusterModal(
        cluster
    ) {

        currentEmergencyCluster =
            cluster;


        const modal =
            document.getElementById(
                "emergencyClusterModal"
            );


        const severityElement =
            document.getElementById(
                "emergencyModalSeverity"
            );


        const categoryElement =
            document.getElementById(
                "emergencyModalCategory"
            );


        const complaintCountElement =
            document.getElementById(
                "emergencyModalComplaintCount"
            );


        const highCountElement =
            document.getElementById(
                "emergencyModalHighCount"
            );


        const locationElement =
            document.getElementById(
                "emergencyModalLocation"
            );


        const iconContainer =
            document.getElementById(
                "emergencyModalCategoryIcon"
            );


        if (!modal) {

            console.error(
                "Emergency modal not found."
            );

            return;
        }



        const isSingleHighAlert =
            cluster.alertType === "SINGLE_HIGH";

        const severity = isSingleHighAlert
            ? "HIGH PRIORITY"
            : String(
                cluster.severity || "EMERGENCY"
            ).toUpperCase();

        const category = String(
            cluster.category || "OTHER"
        ).trim();

        severityElement.textContent = severity;

        categoryElement.textContent = isSingleHighAlert
            ? `${category} — ${cluster.complaintReference || ""}`
            : `${category} INCIDENT`;

        const descriptionElement = document.getElementById(
            "emergencyModalDescription"
        );

        const countLabelElement = document.getElementById(
            "emergencyModalCountLabel"
        );

        if (descriptionElement) {
            descriptionElement.textContent = isSingleHighAlert
                ? "A single HIGH-urgency complaint requires immediate attention."
                : "Multiple complaints have been reported within the same nearby area.";
        }

        if (countLabelElement) {
            countLabelElement.textContent = isSingleHighAlert
                ? "Complaint"
                : "Nearby Complaints";
        }



        complaintCountElement.textContent =
            Number(
                cluster.totalComplaints || 0
            ).toLocaleString();


        highCountElement.textContent =
            Number(
                cluster.highCount || 0
            ).toLocaleString();



        // ========================================================
        // LOCATION
        // ========================================================

        if (isSingleHighAlert) {

            locationElement.textContent =
                cluster.location || "Location not provided";

        } else if (
            cluster.center &&
            cluster.center.latitude !== undefined &&
            cluster.center.longitude !== undefined
        ) {

            const latitude = Number(
                cluster.center.latitude
            );

            const longitude = Number(
                cluster.center.longitude
            );

            locationElement.textContent =
                "Finding nearby landmark...";

            getNearbyLandmark(
                latitude,
                longitude
            ).then(landmark => {

                // Do not overwrite a newer alert's location.
                if (currentEmergencyCluster === cluster) {
                    locationElement.textContent = landmark;
                }

            });

        } else {

            locationElement.textContent =
                "Location not provided";

        }

        // ========================================================
        // CATEGORY ICON
        // ========================================================

        const iconMap = {

            "FIRE": "fa-fire",
            "FLOOD": "fa-water",
            "OBSTRUCTION": "fa-road",
            "MEDICAL": "fa-truck-medical",
            "CRIME": "fa-shield-halved",
            "TRAFFIC": "fa-car",
            "GARBAGE": "fa-trash",
            "NOISE": "fa-volume-high",
            "INFRASTRUCTURE": "fa-building"

        };


        const iconClass =
            iconMap[
            category.toUpperCase()
            ] ||
            "fa-triangle-exclamation";


        iconContainer.innerHTML = `
            <i class="fa-solid ${iconClass}
                      text-red-600 text-3xl"></i>
        `;


        // ========================================================
        // SHOW MODAL
        // ========================================================

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );
    }


    function closeEmergencyClusterModal() {

        emergencyAlertSound.pause();

        emergencyAlertSound.currentTime = 0;


        const modal =
            document.getElementById(
                "emergencyClusterModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
    }


    // ============================================================
    // COMPLAINT PAGE NAVIGATION
    // ============================================================

    document.addEventListener(
        "click",
        (event) => {

            const totalButton =
                event.target.closest(
                    "#totalComplaintsMainButton"
                );

            const existingButton =
                event.target.closest(
                    "#viewComplaints"
                );

            const pendingButton =
                event.target.closest(
                    "#pendingComplaintsMainButton"
                );


            if (
                !totalButton &&
                !existingButton &&
                !pendingButton
            ) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            // ========================================================
            // PENDING COMPLAINTS
            // ========================================================

            if (pendingButton) {

                sessionStorage.setItem(
                    "complaintStatusFilter",
                    "pending"
                );

                console.log(
                    "Opening complaints page in PENDING mode."
                );

            }

            // ========================================================
            // ALL COMPLAINTS
            // ========================================================

            else {

                sessionStorage.removeItem(
                    "complaintStatusFilter"
                );

                console.log(
                    "Opening complaints page in ALL mode."
                );

            }


            // ========================================================
            // SPA NAVIGATION
            // ========================================================

            if (
                typeof loadPage === "function"
            ) {

                loadPage(
                    "/Complaint/Complaints/complaint.html"
                );

            }
            else {

                console.error(
                    "SPA loadPage() function is not available."
                );

            }

        }
    );


    // ============================================================
    // EMERGENCY MODAL EVENTS
    // ============================================================

    document.addEventListener(
        "click",
        (event) => {

            // ====================================================
            // DISMISS EMERGENCY MODAL
            // ====================================================

            if (
                event.target.closest(
                    "#emergencyModalClose"
                )
            ) {

                closeEmergencyClusterModal();

                return;

            }


            // ====================================================
            // VIEW EMERGENCY COMPLAINTS
            // ====================================================

            if (
                event.target.closest(
                    "#emergencyModalView"
                )
            ) {

                if (
                    !currentEmergencyCluster ||
                    !Array.isArray(
                        currentEmergencyCluster.complaintIDs
                    )
                ) {

                    console.error(
                        "No emergency complaint data available."
                    );

                    return;

                }


                const complaintIDs =
                    currentEmergencyCluster.complaintIDs;


                console.log(
                    "Viewing emergency complaints:",
                    complaintIDs
                );


                closeEmergencyClusterModal();


                sessionStorage.setItem(
                    "emergencyComplaintIDs",
                    JSON.stringify(
                        complaintIDs
                    )
                );


                sessionStorage.setItem(
                    "emergencyClusterInfo",
                    JSON.stringify({
                        severity:
                            currentEmergencyCluster.severity,

                        category:
                            currentEmergencyCluster.category,

                        totalComplaints:
                            currentEmergencyCluster.totalComplaints,

                        highCount:
                            currentEmergencyCluster.highCount
                    })
                );


                if (
                    typeof loadPage === "function"
                ) {

                    loadPage(
                        "/Complaint/Complaints/complaint.html"
                    );

                } else {

                    console.error(
                        "SPA loadPage() function is not available."
                    );

                }

            }

        }
    );


    // ============================================================
    // EMERGENCY CLUSTER DETECTION
    // ============================================================

    async function checkEmergencyClusters() {

        try {

            const response =
                await fetch(
                    "Complaints/get_emergency_clusters.php",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Emergency detector HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!data.success) {

                console.error(
                    "Emergency detector error:",
                    data.message || data
                );

                return;

            }


            const clusters =
                Array.isArray(
                    data.clusters
                )
                    ? data.clusters
                    : [];


            if (
                clusters.length === 0
            ) {

                emergencyAlertActive =
                    false;

                lastEmergencyClusterKey =
                    null;

                return;

            }


            const severityRank = {

                "CRITICAL": 3,
                "EMERGENCY": 2

            };


            clusters.sort(
                (a, b) =>
                    (
                        severityRank[b.severity] || 0
                    ) -
                    (
                        severityRank[a.severity] || 0
                    )
            );


            const cluster =
                clusters[0];


            const complaintIDs =
                Array.isArray(
                    cluster.complaintIDs
                )
                    ? [
                        ...cluster.complaintIDs
                    ]
                        .map(Number)
                        .sort(
                            (a, b) =>
                                a - b
                        )
                    : [];


            const clusterKey =
                `${cluster.severity}-` +
                `${cluster.category}-` +
                `${complaintIDs.join(",")}`;


            if (
                emergencyAlertActive &&
                lastEmergencyClusterKey ===
                clusterKey
            ) {

                return;

            }


            emergencyAlertActive =
                true;

            lastEmergencyClusterKey =
                clusterKey;


            console.warn(
                "🚨 EMERGENCY CLUSTER DETECTED:",
                cluster
            );


            emergencyAlertSound.currentTime =
                0;


            emergencyAlertSound
                .play()
                .catch(error => {

                    console.warn(
                        "Emergency alert sound could not play:",
                        error
                    );

                });


            showEmergencyClusterModal(
                cluster
            );


        } catch (error) {

            console.error(
                "Emergency cluster check failed:",
                error
            );

        }

    }

    // ============================================================
    // SINGLE HIGH COMPLAINT DETECTION
    // ============================================================

    async function checkSingleHighComplaints() {

        try {

            const modal = document.getElementById(
                "emergencyClusterModal"
            );

            // Do not interrupt an alert already being displayed.
            if (
                !modal ||
                !modal.classList.contains("hidden")
            ) {
                return;
            }

            const response = await fetch(
                "/Complaint/get_adminnotification.php",
                {
                    method: "GET",
                    cache: "no-store",
                    credentials: "same-origin"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Notification request failed: HTTP ${response.status}`
                );
            }

            const data = await response.json();

            if (
                !data.success ||
                !Array.isArray(data.notifications)
            ) {
                return;
            }

            const complaint = data.notifications.find(item => {

                const id = Number(item.complaintID);

                const status = String(
                    item.status || ""
                ).trim().toUpperCase();

                const dispatchStatus = String(
                    item.dispatchStatus || ""
                ).trim().toUpperCase();

                return (
                    Number.isFinite(id) &&
                    id > 0 &&
                    String(item.urgency || "").toUpperCase() === "HIGH" &&
                    String(item.notificationType || "").toUpperCase() === "HIGH_PRIORITY" &&
                    !["RESOLVED", "REJECTED"].includes(status) &&
                    dispatchStatus !== "RESOLVED" &&
                    !alertedSingleHighComplaintIDs.has(id)
                );

            });

            if (!complaint) {
                return;
            }

            const complaintID = Number(
                complaint.complaintID
            );

            // Avoid a duplicate alert if this complaint belongs
            // to the cluster currently being displayed.
            if (
                currentEmergencyCluster &&
                Array.isArray(
                    currentEmergencyCluster.complaintIDs
                ) &&
                currentEmergencyCluster.complaintIDs
                    .map(Number)
                    .includes(complaintID)
            ) {
                rememberSingleHighAlert(complaintID);
                return;
            }

            // Mark it before displaying so polling does not
            // repeatedly trigger the same alert.
            rememberSingleHighAlert(complaintID);

            const singleAlert = {
                alertType: "SINGLE_HIGH",
                severity: "HIGH PRIORITY",
                category: complaint.category || "Other",
                location: complaint.location || "",
                totalComplaints: 1,
                highCount: 1,
                complaintIDs: [complaintID],
                complaintReference:
                    complaint.complaintReference ||
                    `#${complaintID}`
            };

            console.warn(
                "SINGLE HIGH-URGENCY COMPLAINT DETECTED:",
                singleAlert
            );

            showEmergencyClusterModal(singleAlert);

            // Play the existing emergency sound.
            emergencyAlertSound.currentTime = 0;

            emergencyAlertSound.play().catch(error => {
                console.warn(
                    "Emergency alert sound could not play:",
                    error
                );
            });

        } catch (error) {

            console.error(
                "Single HIGH complaint check failed:",
                error
            );

        }
    }



    // ============================================================
    // DASHBOARD ERROR
    // ============================================================

    function showDashboardError(
        message
    ) {

        const total =
            document.getElementById(
                "metric-total"
            );


        const pending =
            document.getElementById(
                "metric-pending"
            );


        if (total) {
            total.textContent = "--";
        }


        if (pending) {
            pending.textContent = "--";
        }


        console.error(
            message
        );

    }


    // ============================================================
    // LOAD METRICS
    // ============================================================

    function loadMetrics(
        metrics
    ) {

        console.log(
            "LOAD METRICS START"
        );


        console.log(
            "Metrics received:",
            metrics
        );


        // ========================================================
        // MAIN CARDS
        // ========================================================

        const totalElement =
            document.getElementById(
                "metric-total"
            );


        const pendingElement =
            document.getElementById(
                "metric-pending"
            );


        if (totalElement) {

            totalElement.textContent =
                Number(
                    metrics.total || 0
                ).toLocaleString();

        }


        if (pendingElement) {

            pendingElement.textContent =
                Number(
                    metrics.pending || 0
                ).toLocaleString();

        }


        // ========================================================
        // TOTAL COMPLAINTS HOVER COUNT
        // ========================================================

        const totalHoverCount =
            document.getElementById(
                "totalHoverCount"
            );


        if (totalHoverCount) {

            totalHoverCount.textContent =
                Number(
                    metrics.total || 0
                ).toLocaleString();

        }


        // ========================================================
        // PENDING COMPLAINTS HOVER COUNT
        // ========================================================

        const pendingHoverCount =
            document.getElementById(
                "pendingHoverCount"
            );


        if (pendingHoverCount) {

            pendingHoverCount.textContent =
                Number(
                    metrics.pending || 0
                ).toLocaleString();

        }


        // ========================================================
        // CATEGORY TOTAL
        // ========================================================

        const categoryTotal =
            document.getElementById(
                "categoryTotal"
            );


        if (categoryTotal) {

            categoryTotal.textContent =
                Number(
                    metrics.total || 0
                ).toLocaleString();

        }


        console.log(
            "Hover totals updated:",
            {
                total:
                    totalHoverCount?.textContent,

                pending:
                    pendingHoverCount?.textContent
            }
        );


        console.log(
            "LOAD METRICS END"
        );

    }


    // ============================================================
    // TOTAL COMPLAINTS HOVER
    // ============================================================

    function updateTotalComplaintsHover(
        categories
    ) {

        /*
         * IMPORTANT:
         *
         * #totalHoverCount is the number in the
         * expanded card header.
         *
         * #totalHoverCategories is where the
         * Top 5 categories should be rendered.
         */

        const container =
            document.getElementById(
                "totalHoverCategories"
            );


        if (!container) {

            console.error(
                "totalHoverCategories NOT FOUND"
            );

            return;

        }


        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            container.innerHTML = `
                <div class="py-8 text-center">

                    <i class="fa-solid
                              fa-chart-pie
                              text-gray-300
                              text-2xl">
                    </i>

                    <p class="mt-2
                              text-sm
                              text-gray-400">
                        No complaint category data available.
                    </p>

                </div>
            `;

            return;

        }


        // ========================================================
        // SORT HIGHEST → LOWEST
        // ========================================================

        const topFive =
            [...categories]
                .sort(
                    (a, b) =>
                        Number(b.total || 0) -
                        Number(a.total || 0)
                )
                .slice(0, 5);


        // ========================================================
        // RENDER TOP 5
        // ========================================================

        container.innerHTML =
            topFive
                .map(
                    (item, index) => {

                        const category =
                            item.category ||
                            "Other";


                        const count =
                            Number(
                                item.total || 0
                            );


                        const color =
                            getCategoryColor(
                                category
                            );


                        return `
                            <div
                                class="flex
                                       items-center
                                       justify-between
                                       rounded-xl
                                       border
                                       border-gray-100
                                       bg-gray-50
                                       px-3
                                       py-3">

                                <div
                                    class="flex
                                           items-center
                                           gap-3
                                           min-w-0">

                                    <span
                                        class="w-7
                                               h-7
                                               rounded-lg
                                               flex
                                               items-center
                                               justify-center
                                               text-xs
                                               font-bold
                                               text-white"
                                        style="
                                            background-color:
                                            ${color};
                                        ">

                                        ${index + 1}

                                    </span>


                                    <span
                                        class="text-sm
                                               font-semibold
                                               text-gray-800
                                               truncate">

                                        ${escapeHTML(
                            category
                        )}

                                    </span>

                                </div>


                                <span
                                    class="text-sm
                                           font-bold
                                           text-gray-900
                                           ml-3">

                                    ${count.toLocaleString()}

                                </span>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    // ============================================================
    // TOTAL COMPLAINT CATEGORY BREAKDOWN
    // ============================================================

    function renderTotalCategoryBreakdown(
        categories
    ) {

        const container =
            document.getElementById(
                "totalCategoryBreakdown"
            );


        if (!container) {
            return;
        }


        if (
            !categories ||
            categories.length === 0
        ) {

            container.innerHTML = `
                <div class="col-span-2
                            py-8
                            text-center">

                    <i class="fa-solid
                              fa-chart-pie
                              text-gray-300
                              text-2xl">
                    </i>

                    <p class="mt-2
                              text-sm
                              text-gray-400">

                        No category data available.

                    </p>

                </div>
            `;

            return;

        }


        const sortedCategories =
            [...categories].sort(
                (a, b) =>
                    Number(b.total || 0) -
                    Number(a.total || 0)
            );


        const total =
            sortedCategories.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total || 0
                    ),
                0
            );


        container.innerHTML =
            sortedCategories
                .map(
                    item => {

                        const category =
                            item.category ||
                            "Other";


                        const value =
                            Number(
                                item.total || 0
                            );


                        const percentage =
                            total > 0
                                ? (
                                    value /
                                    total *
                                    100
                                ).toFixed(1)
                                : "0.0";


                        const color =
                            getCategoryColor(
                                category
                            );


                        return `
                            <div
                                class="rounded-xl
                                       border
                                       border-gray-100
                                       bg-gray-50
                                       px-3
                                       py-3">

                                <div
                                    class="flex
                                           items-center
                                           justify-between
                                           gap-2">

                                    <div
                                        class="flex
                                               items-center
                                               gap-2
                                               min-w-0">

                                        <span
                                            class="w-2.5
                                                   h-2.5
                                                   rounded-full
                                                   shrink-0"
                                            style="
                                                background-color:
                                                ${color};
                                            ">
                                        </span>


                                        <span
                                            class="text-sm
                                                   font-medium
                                                   text-gray-700
                                                   truncate">

                                            ${escapeHTML(
                            category
                        )}

                                        </span>

                                    </div>


                                    <span
                                        class="text-sm
                                               font-bold
                                               text-gray-900">

                                        ${value.toLocaleString()}

                                    </span>

                                </div>


                                <div
                                    class="mt-2
                                           flex
                                           items-center
                                           justify-between">

                                    <div
                                        class="h-1.5
                                               bg-gray-200
                                               rounded-full
                                               flex-1
                                               mr-3
                                               overflow-hidden">

                                        <div
                                            class="h-full
                                                   rounded-full"
                                            style="
                                                width:${percentage}%;
                                                background-color:
                                                ${color};
                                            ">
                                        </div>

                                    </div>


                                    <span
                                        class="text-[11px]
                                               font-medium
                                               text-gray-400">

                                        ${percentage}%

                                    </span>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    // ============================================================
    // PENDING COMPLAINTS
    // ============================================================
    //
    // NEW VERSION:
    // The HTML now uses:
    //
    // <tbody id="pendingComplaintsList">
    //
    // Therefore we MUST generate <tr> rows.
    // ============================================================

    function loadPendingComplaints(
        complaints
    ) {

        const container =
            document.getElementById(
                "pendingComplaintsList"
            );


        const countElement =
            document.getElementById(
                "pendingHoverCount"
            );


        if (!container) {

            console.error(
                "pendingComplaintsList NOT FOUND"
            );

            return;

        }


        console.log(
            "PENDING COMPLAINT DATA:",
            complaints
        );


        // ========================================================
        // ONLY PENDING / AWAITING COMPLAINTS
        // ========================================================

        const pendingComplaints =
            (complaints || [])
                .filter(
                    complaint => {

                        const status =
                            String(
                                complaint.status ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        return (
                            status === "pending" ||
                            status === "awaiting"
                        );

                    }
                )
                .sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a.createdAt || 0
                            );


                        const dateB =
                            new Date(
                                b.createdAt || 0
                            );


                        return dateA - dateB;

                    }
                )
                .slice(0, 6);


        // ========================================================
        // UPDATE PENDING COUNT
        // ========================================================

        if (countElement) {

            /*
             * Use the backend metric for the headline count.
             *
             * The table itself only shows the available
             * recent pending complaints.
             */

            const metricPending =
                overviewData?.metrics?.pending;


            if (
                metricPending !== undefined
            ) {

                countElement.textContent =
                    Number(
                        metricPending
                    ).toLocaleString();

            } else {

                countElement.textContent =
                    pendingComplaints.length
                        .toLocaleString();

            }

        }


        // ========================================================
        // EMPTY STATE
        // ========================================================

        if (
            pendingComplaints.length === 0
        ) {

            container.innerHTML = `
                <tr>

                    <td
                        colspan="4"
                        class="px-4
                               py-10
                               text-center">

                        <div
                            class="flex
                                   flex-col
                                   items-center
                                   justify-center">

                            <div
                                class="w-10
                                       h-10
                                       rounded-full
                                       bg-green-50
                                       flex
                                       items-center
                                       justify-center">

                                <i
                                    class="fa-solid
                                           fa-check
                                           text-green-500">
                                </i>

                            </div>


                            <p
                                class="mt-3
                                       text-sm
                                       font-medium
                                       text-gray-700">

                                No pending complaints

                            </p>


                            <p
                                class="mt-1
                                       text-xs
                                       text-gray-400">

                                Everything is currently up to date.

                            </p>

                        </div>

                    </td>

                </tr>
            `;

            return;

        }


        // ========================================================
        // RENDER TABLE ROWS
        // ========================================================

        container.innerHTML =
            pendingComplaints
                .map(
                    complaint => {

                        const id =
                            complaint.complaintID ??
                            complaint.id ??
                            "--";


                        const category =
                            complaint.aiCategory ||
                            complaint.category ||
                            "Other";


                        const description =
                            complaint.rawComplaintText ||
                            complaint.complaintText ||
                            complaint.description ||
                            "No description";

                        const shortDescription =
                            description.length > 50
                                ? description.substring(0, 50) + "..."
                                : description;


                        const color =
                            getCategoryColor(
                                category
                            );


                        const createdAt =
                            formatDisplayDate(
                                complaint.createdAt
                            );


                        return `
                            <tr
                                class="hover:bg-gray-50
                                       transition-colors">

                                <!-- COMPLAINT -->

                                <td
                                    class="px-4
                                           py-3
                                           align-middle">

                                    <div
                                        class="flex
                                               items-center
                                               gap-3
                                               min-w-0">
                                        <div
                                            class="min-w-0">

                                            <p
                                                class="text-xs
                                                       font-semibold
                                                       text-gray-800">

                                                #${escapeHTML(
                            id
                        )}

                                            </p>


                                            <p
                                                class="mt-0.5
                                                       text-xs
                                                       text-gray-500
                                                       truncate
                                                       max-w-[220px]">

                                                ${escapeHTML(
                            shortDescription
                        )}

                                            </p>

                                        </div>

                                    </div>

                                </td>


                                <!-- CATEGORY -->

                                <td
                                    class="px-4
                                           py-3
                                           whitespace-nowrap">

                                    <span
                                        class="inline-flex
                                               items-center
                                               rounded-full
                                               px-2.5
                                               py-1
                                               text-[11px]
                                               font-semibold"
                                        style="
                                            color:${color};
                                            background-color:
                                            ${color}18;
                                        ">

                                        ${escapeHTML(
                            category
                        )}

                                    </span>

                                </td>


                                <!-- DATE -->

                                <td
                                    class="px-4
                                           py-3
                                           whitespace-nowrap">

                                    <span
                                        class="text-xs
                                               text-gray-500">

                                        ${escapeHTML(
                            createdAt
                        )}

                                    </span>

                                </td>


                                <!-- STATUS -->

                                <td
                                    class="px-4
                                           py-3
                                           whitespace-nowrap">

                                    <span
                                        class="inline-flex
                                               items-center
                                               gap-1.5
                                               rounded-full
                                               bg-yellow-50
                                               px-2.5
                                               py-1
                                               text-[11px]
                                               font-semibold
                                               text-yellow-700">

                                        <span
                                            class="w-1.5
                                                   h-1.5
                                                   rounded-full
                                                   bg-yellow-500">
                                        </span>

                                        Pending

                                    </span>

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");

    }


    // ============================================================
    // COMPLAINT TREND CHART
    // ============================================================

    function renderComplaintTrend(
        data
    ) {

        const canvas =
            document.getElementById(
                "complaintTrendChart"
            );


        if (!canvas) {
            return;
        }


        if (complaintTrendChart) {

            complaintTrendChart.destroy();

            complaintTrendChart = null;

        }


        if (!Array.isArray(data)) {
            data = [];
        }


        const labels =
            data.map(
                item =>
                    item.period || ""
            );


        const categories =
            new Set();


        data.forEach(
            item => {

                if (!item.categories) {
                    return;
                }


                Object.keys(
                    item.categories
                )
                    .forEach(
                        category => {

                            categories.add(
                                category
                            );

                        }
                    );

            }
        );


        const categoryList =
            Array.from(
                categories
            );


        fallbackColorIndex = 0;


        const datasets =
            categoryList.map(
                category => {

                    const color =
                        getCategoryColor(
                            category
                        );


                    return {

                        label: category,

                        data:
                            data.map(
                                item => {

                                    if (
                                        item.categories &&
                                        item.categories[
                                        category
                                        ] !== undefined
                                    ) {

                                        return Number(
                                            item.categories[
                                            category
                                            ]
                                        );

                                    }

                                    return 0;

                                }
                            ),

                        borderColor:
                            color,

                        backgroundColor:
                            color,

                        borderWidth: 2.5,

                        tension: 0.35,

                        fill: false,

                        pointRadius: 3,

                        pointHoverRadius: 6,

                        pointBorderWidth: 2,

                        pointBackgroundColor:
                            "#ffffff",

                        pointBorderColor:
                            color

                    };

                }
            );


        complaintTrendChart =
            new Chart(
                canvas,
                {

                    type: "line",

                    data: {

                        labels:
                            labels,

                        datasets:
                            datasets

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        interaction: {

                            mode: "index",

                            intersect: false

                        },

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    usePointStyle:
                                        true,

                                    pointStyle:
                                        "circle",

                                    padding:
                                        18,

                                    boxWidth:
                                        8,

                                    font: {
                                        size: 11
                                    }

                                }

                            },

                            tooltip: {

                                mode:
                                    "index",

                                intersect:
                                    false,

                                backgroundColor:
                                    "rgba(17, 24, 39, 0.94)",

                                padding:
                                    12,

                                cornerRadius:
                                    8,

                                titleFont: {

                                    size: 12,

                                    weight:
                                        "600"

                                },

                                bodyFont: {

                                    size: 12

                                },

                                displayColors:
                                    true

                            }

                        },

                        scales: {

                            x: {

                                grid: {
                                    display: false
                                },

                                ticks: {

                                    color:
                                        "#9ca3af",

                                    maxRotation:
                                        0,

                                    autoSkip:
                                        true,

                                    maxTicksLimit:
                                        10,

                                    font: {
                                        size: 11
                                    }

                                }

                            },

                            y: {

                                beginAtZero:
                                    true,

                                grid: {

                                    color:
                                        "rgba(229, 231, 235, 0.7)"

                                },

                                ticks: {

                                    precision:
                                        0,

                                    color:
                                        "#9ca3af",

                                    font: {
                                        size: 11
                                    }

                                }

                            }

                        }

                    }

                }
            );


        updateTrendFooter(
            data
        );

    }


    // ============================================================
    // TREND FOOTER
    // ============================================================

    function updateTrendFooter(
        data
    ) {

        const dateLabel =
            document.getElementById(
                "trendDateLabel"
            );


        const totalLabel =
            document.getElementById(
                "trendTotalLabel"
            );


        if (dateLabel) {

            if (
                currentFrom &&
                currentTo
            ) {

                dateLabel.textContent =
                    `${formatDisplayDate(
                        currentFrom
                    )} – ${formatDisplayDate(
                        currentTo
                    )}`;

            } else {

                dateLabel.textContent =
                    "Showing the selected date range";

            }

        }


        let total = 0;


        (data || [])
            .forEach(
                item => {

                    if (!item.categories) {
                        return;
                    }


                    Object.values(
                        item.categories
                    )
                        .forEach(
                            value => {

                                total +=
                                    Number(
                                        value || 0
                                    );

                            }
                        );

                }
            );


        const directTotal =
            data?.trendTotal ??
            null;


        if (totalLabel) {

            if (
                directTotal !== null
            ) {

                totalLabel.textContent =
                    `${Number(
                        directTotal
                    ).toLocaleString()} complaints`;

            } else {

                totalLabel.textContent =
                    `${Number(
                        total
                    ).toLocaleString()} complaints`;

            }

        }

    }


    // ============================================================
    // CATEGORY DOUGHNUT CHART
    // ============================================================

    function renderCategoryChart(
        data
    ) {

        const canvas =
            document.getElementById(
                "categoryChart"
            );


        if (!canvas) {
            return;
        }


        if (categoryChart) {

            categoryChart.destroy();

            categoryChart = null;

        }


        if (!Array.isArray(data)) {
            data = [];
        }


        const labels =
            data.map(
                item =>
                    item.category ||
                    "Other"
            );


        const values =
            data.map(
                item =>
                    Number(
                        item.total || 0
                    )
            );


        const total =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const colors =
            labels.map(
                category =>
                    getCategoryColor(
                        category
                    )
            );


        const centerTotal =
            document.getElementById(
                "categoryTotal"
            );


        if (centerTotal) {

            centerTotal.textContent =
                total.toLocaleString();

        }


        if (total === 0) {

            renderCategoryLegend(
                []
            );


            categoryChart =
                new Chart(
                    canvas,
                    {

                        type: "doughnut",

                        data: {

                            labels: [
                                "No Data"
                            ],

                            datasets: [{

                                data: [1],

                                backgroundColor: [
                                    "#e5e7eb"
                                ],

                                borderWidth: 0

                            }]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            cutout: "72%",

                            plugins: {

                                legend: {
                                    display: false
                                },

                                tooltip: {
                                    enabled: false
                                }

                            }

                        }

                    }
                );

            return;

        }


        categoryChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            labels,

                        datasets: [{

                            data:
                                values,

                            backgroundColor:
                                colors,

                            borderColor:
                                "#ffffff",

                            borderWidth:
                                3,

                            hoverBorderWidth:
                                3,

                            hoverOffset:
                                8

                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout: "68%",

                        radius: "92%",

                        animation: {

                            duration: 700

                        },

                        plugins: {

                            legend: {

                                display:
                                    false

                            },

                            tooltip: {

                                backgroundColor:
                                    "rgba(17, 24, 39, 0.94)",

                                padding:
                                    12,

                                cornerRadius:
                                    8,

                                callbacks: {

                                    label(
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw ||
                                                0
                                            );


                                        const percentage =
                                            total > 0
                                                ? (
                                                    value /
                                                    total *
                                                    100
                                                ).toFixed(1)
                                                : "0.0";


                                        return ` ${context.label}: ${value.toLocaleString()} (${percentage}%)`;

                                    }

                                }

                            }

                        }

                    }

                }
            );


        renderCategoryLegend(
            data
        );

    }


    // ============================================================
    // CATEGORY LEGEND
    // ============================================================

    function renderCategoryLegend(
        data
    ) {

        const container =
            document.getElementById(
                "categoryLegend"
            );


        if (!container) {
            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML = `
                <div
                    class="text-center
                           py-4
                           text-sm
                           text-gray-400">

                    No category data available.

                </div>
            `;

            return;

        }


        const total =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total || 0
                    ),
                0
            );


        const sorted =
            [...data].sort(
                (a, b) =>
                    Number(b.total || 0) -
                    Number(a.total || 0)
            );


        let visible =
            sorted.slice(0, 6);


        const remaining =
            sorted.slice(6);


        if (
            remaining.length > 0
        ) {

            const remainingTotal =
                remaining.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.total || 0
                        ),
                    0
                );


            visible.push({

                category: "Other",

                total:
                    remainingTotal

            });

        }


        container.innerHTML =
            visible
                .map(
                    item => {

                        const category =
                            item.category ||
                            "Other";


                        const value =
                            Number(
                                item.total || 0
                            );


                        const percentage =
                            total > 0
                                ? (
                                    value /
                                    total *
                                    100
                                ).toFixed(1)
                                : "0.0";


                        const color =
                            getCategoryColor(
                                category
                            );


                        return `
                            <div
                                class="flex
                                       items-center
                                       justify-between
                                       gap-3">

                                <div
                                    class="flex
                                           items-center
                                           gap-2
                                           min-w-0">

                                    <span
                                        class="w-2.5
                                               h-2.5
                                               rounded-full
                                               shrink-0"
                                        style="
                                            background-color:
                                            ${color};
                                        ">
                                    </span>


                                    <span
                                        class="text-sm
                                               text-gray-600
                                               truncate">

                                        ${escapeHTML(
                            category
                        )}

                                    </span>

                                </div>


                                <div
                                    class="flex
                                           items-center
                                           gap-2
                                           shrink-0">

                                    <span
                                        class="text-xs
                                               font-semibold
                                               text-gray-800">

                                        ${value.toLocaleString()}

                                    </span>


                                    <span
                                        class="text-[10px]
                                               text-gray-400">

                                        ${percentage}%

                                    </span>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    // ============================================================
    // CATEGORY OVERVIEW CARDS
    // ============================================================

    function renderCategoryOverview(
        data
    ) {

        const container =
            document.getElementById(
                "categoryOverview"
            );


        if (!container) {
            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML = `
                <div
                    class="col-span-full
                           py-10
                           text-center">

                    <i
                        class="fa-solid
                               fa-chart-simple
                               text-gray-300
                               text-2xl">
                    </i>


                    <p
                        class="mt-2
                               text-sm
                               text-gray-400">

                        No complaint category data available.

                    </p>

                </div>
            `;

            return;

        }


        const total =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.total || 0
                    ),
                0
            );


        const sorted =
            [...data].sort(
                (a, b) =>
                    Number(b.total || 0) -
                    Number(a.total || 0)
            );


        container.innerHTML =
            sorted
                .map(
                    item => {

                        const category =
                            item.category ||
                            "Other";


                        const value =
                            Number(
                                item.total || 0
                            );


                        const percentage =
                            total > 0
                                ? (
                                    value /
                                    total *
                                    100
                                ).toFixed(1)
                                : "0.0";


                        const color =
                            getCategoryColor(
                                category
                            );


                        return `
                            <div
                                class="group
                                       rounded-xl
                                       border
                                       border-gray-100
                                       bg-white
                                       hover:border-gray-200
                                       hover:shadow-md
                                       transition-all
                                       duration-200
                                       p-4">

                                <div
                                    class="flex
                                           items-center
                                           justify-between
                                           gap-3">

                                    <div
                                        class="flex
                                               items-center
                                               gap-3
                                               min-w-0">

                                        <div
                                            class="w-9
                                                   h-9
                                                   rounded-lg
                                                   flex
                                                   items-center
                                                   justify-center"
                                            style="
                                                background-color:
                                                ${color}18;
                                            ">

                                            <span
                                                class="w-2.5
                                                       h-2.5
                                                       rounded-full"
                                                style="
                                                    background-color:
                                                    ${color};
                                                ">
                                            </span>

                                        </div>


                                        <div
                                            class="min-w-0">

                                            <p
                                                class="text-sm
                                                       font-semibold
                                                       text-gray-800
                                                       truncate">

                                                ${escapeHTML(
                            category
                        )}

                                            </p>


                                            <p
                                                class="text-xs
                                                       text-gray-400">

                                                ${percentage}%
                                                of total

                                            </p>

                                        </div>

                                    </div>


                                    <p
                                        class="text-xl
                                               font-bold
                                               text-gray-900">

                                        ${value.toLocaleString()}

                                    </p>

                                </div>


                                <div
                                    class="mt-4
                                           h-1.5
                                           bg-gray-100
                                           rounded-full
                                           overflow-hidden">

                                    <div
                                        class="h-full
                                               rounded-full
                                               transition-all
                                               duration-500"
                                        style="
                                            width:${percentage}%;
                                            background-color:
                                            ${color};
                                        ">
                                    </div>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    // ============================================================
    // DATE RANGE
    // ============================================================

    function setDateRange(
        days
    ) {

        const fromInput =
            document.getElementById(
                "trendFrom"
            );


        const toInput =
            document.getElementById(
                "trendTo"
            );


        if (
            !fromInput ||
            !toInput
        ) {
            return;
        }


        const end =
            new Date();


        const start =
            new Date();


        start.setDate(
            start.getDate() -
            (days - 1)
        );


        fromInput.value =
            formatInputDate(
                start
            );


        toInput.value =
            formatInputDate(
                end
            );

    }


    // ============================================================
    // TREND DATE PRESET
    // ============================================================

    function initTrendDateFilter() {

        const preset =
            document.getElementById(
                "trendPreset"
            );


        const fromInput =
            document.getElementById(
                "trendFrom"
            );


        const toInput =
            document.getElementById(
                "trendTo"
            );


        const applyButton =
            document.getElementById(
                "applyTrendFilter"
            );


        if (
            !preset ||
            !fromInput ||
            !toInput
        ) {

            return;

        }


        // ========================================================
        // INITIAL RANGE
        // ========================================================

        setDateRange(
            30
        );


        // ========================================================
        // PRESET CHANGES
        // ========================================================

        preset.addEventListener(
            "change",
            function () {

                const value =
                    this.value;


                if (
                    value === "custom"
                ) {

                    return;

                }


                const days =
                    Number(
                        value
                    );


                if (
                    !isNaN(days)
                ) {

                    setDateRange(
                        days
                    );

                }

            }
        );


        // ========================================================
        // APPLY CUSTOM RANGE
        // ========================================================

        if (applyButton) {

            applyButton.addEventListener(
                "click",
                function () {

                    const from =
                        fromInput.value;


                    const to =
                        toInput.value;


                    if (
                        !from ||
                        !to
                    ) {

                        alert(
                            "Please select both a From and To date."
                        );

                        return;

                    }


                    if (
                        from > to
                    ) {

                        alert(
                            "The From date cannot be later than the To date."
                        );

                        return;

                    }


                    applyButton.disabled =
                        true;


                    applyButton.innerHTML = `
                        <i
                            class="fa-solid
                                   fa-spinner
                                   fa-spin
                                   mr-1">
                        </i>

                        Loading
                    `;


                    loadOverview(
                        from,
                        to
                    )
                        .finally(
                            () => {

                                applyButton.disabled =
                                    false;


                                applyButton.innerHTML =
                                    "Apply";

                            }
                        );

                }
            );

        }

    }


    // ============================================================
    // AUTO REFRESH
    // ============================================================

    function initAutoRefresh() {

        // ========================================================
        // DASHBOARD DATA REFRESH ONLY
        // Emergency monitoring runs globally from the dashboard shell.
        // ========================================================

        if (window.overviewDataRefreshInterval) {
            clearInterval(window.overviewDataRefreshInterval);
        }

        window.overviewDataRefreshInterval = setInterval(() => {

            // Do not refresh Overview data while another page is open.
            if (
                !document.getElementById("trendFrom") ||
                !document.getElementById("trendTo")
            ) {
                return;
            }

            const fromInput = document.getElementById("trendFrom");
            const toInput = document.getElementById("trendTo");

            loadOverview(
                fromInput.value || currentFrom,
                toInput.value || currentTo
            );

        }, 60000);

    }
    // ============================================================
    // GLOBAL EMERGENCY ALERT MONITORING
    // Started once by admindashboard.php.
    // ============================================================

    window.initEmergencyAlerts = function () {

        // Prevent duplicate polling intervals.
        if (window.emergencyAlertPollingInterval) {
            return;
        }

        // Check emergency clusters first, then individual HIGH complaints.
        checkEmergencyClusters().finally(() => {
            checkSingleHighComplaints();
        });

        // Continue checking every 10 seconds on every dashboard page.
        window.emergencyAlertPollingInterval = setInterval(async () => {

            await checkEmergencyClusters();

            await checkSingleHighComplaints();

        }, 10000);

    };


    // ============================================================
    // INITIALIZE
    // ============================================================

    window.initOverview = () => {

        initTrendDateFilter();


        const fromInput =
            document.getElementById(
                "trendFrom"
            );


        const toInput =
            document.getElementById(
                "trendTo"
            );


        const from =
            fromInput
                ? fromInput.value
                : null;


        const to =
            toInput
                ? toInput.value
                : null;


        loadOverview(
            from,
            to
        );


        initAutoRefresh();

    };

})();