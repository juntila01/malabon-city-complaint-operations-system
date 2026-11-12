let selectedComplaint = null;
let selectedFeedbackRating = 0;

let complaintMap = null;
let complaintMarker = null;
let dispatchMarker = null;

let dispatchTrackingInterval = null;
let trackedComplaintID = null;

// ============================================================
// DATE HELPERS
// ============================================================

function formatDate(dateString) {
    if (!dateString) {
        return "Not available";
    }


    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return String(dateString);
    }

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });


}

function formatDateOnly(dateString) {
    if (!dateString) {
        return "Not available";
    }


    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return String(dateString);
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });


}

// ============================================================
// STATUS NORMALIZATION
// ============================================================

function normalizeComplaintStatus(status) {
    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

// ============================================================
// TERMINAL STATUS HELPERS
// ============================================================

function isUnableToResolveStatus(status) {
    const normalized = normalizeComplaintStatus(status);


    return [
        "unable to resolve",
        "unable resolve",
        "unable to be resolved",
        "unable resolve complaint",
        "unresolved"
    ].includes(normalized);


}

function isResolvedStatus(status) {
    const normalized = normalizeComplaintStatus(status);


    return (
        normalized === "resolved" ||
        normalized === "completed"
    );


}

// ============================================================
// STATUS STYLE
// ============================================================

function getComplaintStatusStyle(status) {
    const normalizedStatus =
        normalizeComplaintStatus(status);


    // --------------------------------------------------------
    // RESOLVED
    // --------------------------------------------------------

    if (isResolvedStatus(normalizedStatus)) {
        return {
            badge:
                "bg-emerald-50 text-emerald-700 border border-emerald-100",
            dot:
                "bg-emerald-500",
            accent:
                "bg-emerald-500"
        };
    }

    // --------------------------------------------------------
    // UNABLE TO RESOLVE / REJECTED
    // --------------------------------------------------------

    if (
        isUnableToResolveStatus(normalizedStatus) ||
        normalizedStatus === "rejected" ||
        normalizedStatus === "declined"
    ) {
        return {
            badge:
                "bg-red-50 text-red-700 border border-red-100",
            dot:
                "bg-red-500",
            accent:
                "bg-red-500"
        };
    }

    // --------------------------------------------------------
    // DISPATCH / ACTIVE
    // --------------------------------------------------------

    if (
        normalizedStatus === "in progress" ||
        normalizedStatus === "accepted" ||
        normalizedStatus === "dispatched" ||
        normalizedStatus === "responding" ||
        normalizedStatus === "on the way" ||
        normalizedStatus === "on site" ||
        normalizedStatus === "arrived" ||
        normalizedStatus === "assigned" ||
        normalizedStatus === "assigned to response team"
    ) {
        return {
            badge:
                "bg-blue-50 text-blue-700 border border-blue-100",
            dot:
                "bg-blue-500",
            accent:
                "bg-blue-500"
        };
    }

    // --------------------------------------------------------
    // VERIFIED
    // --------------------------------------------------------

    if (normalizedStatus === "verified") {
        return {
            badge:
                "bg-indigo-50 text-indigo-700 border border-indigo-100",
            dot:
                "bg-indigo-500",
            accent:
                "bg-indigo-500"
        };
    }

    // --------------------------------------------------------
    // REVIEW
    // --------------------------------------------------------

    if (
        normalizedStatus === "under review" ||
        normalizedStatus === "review" ||
        normalizedStatus === "for review" ||
        normalizedStatus === "awaiting review"
    ) {
        return {
            badge:
                "bg-violet-50 text-violet-700 border border-violet-100",
            dot:
                "bg-violet-500",
            accent:
                "bg-violet-500"
        };
    }

    // --------------------------------------------------------
    // DEFAULT / PENDING
    // --------------------------------------------------------

    return {
        badge:
            "bg-amber-50 text-amber-700 border border-amber-100",
        dot:
            "bg-amber-500",
        accent:
            "bg-amber-500"
    };


}

// ============================================================
// LOCATION HELPER
// ============================================================

function getComplaintLocation(complaint) {
    if (
        complaint.aiLocation &&
        complaint.aiLocation !== "Unknown"
    ) {
        return complaint.aiLocation;
    }


    if (complaint.location) {
        return complaint.location;
    }

    if (complaint.address) {
        return complaint.address;
    }

    if (complaint.barangay) {
        return `Barangay ${complaint.barangay}`;
    }

    return "Location unavailable";


}

// ============================================================
// DESCRIPTION HELPER
// ============================================================

function getComplaintPreview(text) {
    const description =
        String(text || "").trim();


    if (!description) {
        return "No description provided.";
    }

    const maxCharacters = 140;

    if (description.length <= maxCharacters) {
        return description;
    }

    return `${description
        .slice(0, maxCharacters)
        .trim()}...`;


}

// ============================================================
// COMPLAINT CARD
// ============================================================

function createComplaintCard(complaint) {
    let displayStatus =
        complaint.status || "Pending";


    /*
     * Dispatch terminal status has priority.
     */

    if (
        isUnableToResolveStatus(
            complaint.dispatchStatus
        )
    ) {
        displayStatus = "Unable to Resolve";
    }
    else if (
        isResolvedStatus(
            complaint.dispatchStatus
        )
    ) {
        displayStatus = "Resolved";
    }

    const statusStyle =
        getComplaintStatusStyle(
            displayStatus
        );

    const category =
        complaint.aiCategory ||
        complaint.category ||
        "General Complaint";

    const location =
        getComplaintLocation(
            complaint
        );

    const description =
        getComplaintPreview(
            complaint.rawComplaintText ||
            complaint.description
        );

    const submittedDate =
        formatDateOnly(
            complaint.createdAt
        );

    return `


<article
    class="
        group
        relative
        overflow-hidden
        bg-white
        border
        border-slate-200
        rounded-[22px]
        p-5
        sm:p-6
        shadow-sm
        hover:shadow-md
        hover:border-blue-200
        transition-all
        duration-200
    "
>
    <div
        class="
            absolute
            left-0
            top-0
            bottom-0
            w-1
            ${statusStyle.accent}
        "
    ></div>


<div
    class="
        flex
        items-center
        justify-between
        gap-3
    "
>
    <span
        class="
            inline-flex
            items-center
            gap-2
            px-3
            py-1.5
            rounded-full
            text-xs
            font-semibold
            ${statusStyle.badge}
        "
    >
        <span
            class="
                w-1.5
                h-1.5
                rounded-full
                ${statusStyle.dot}
            "
        ></span>

        ${escapeHTML(displayStatus)}
    </span>

    <span
        class="
            shrink-0
            text-[11px]
            font-semibold
            text-slate-400
        "
    >
        #${escapeHTML(complaint.complaintID)}
    </span>
</div>

<div class="mt-5">
    <h2
        class="
            text-[17px]
            sm:text-lg
            font-bold
            text-slate-800
            leading-snug
        "
    >
        ${escapeHTML(category)}
    </h2>

    <p
        class="
            mt-2
            text-sm
            text-slate-500
            leading-relaxed
        "
    >
        ${escapeHTML(description)}
    </p>
</div>

<div
    class="
        mt-5
        flex
        items-start
        gap-3
    "
>
    <div
        class="
            w-9
            h-9
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
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="
                    M17.657 16.657
                    L13.414 21
                    a2 2 0 01-2.828 0
                    l-4.243-4.343
                    a8 8 0 1111.314 0z
                "
            ></path>

            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="
                    M15 11
                    a3 3 0 11-6 0
                    3 3 0 016 0z
                "
            ></path>
        </svg>
    </div>

    <div
        class="
            min-w-0
            flex-1
        "
    >
        <p
            class="
                text-[11px]
                font-medium
                uppercase
                tracking-wide
                text-slate-400
            "
        >
            Location
        </p>

        <p
            class="
                mt-0.5
                text-sm
                font-medium
                text-slate-700
                leading-snug
                break-words
            "
        >
            ${escapeHTML(location)}
        </p>
    </div>
</div>

<div
    class="
        mt-5
        pt-4
        border-t
        border-slate-100
    "
>
    <div
        class="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
        "
    >
        <div
            class="
                flex
                items-center
                gap-2
                text-xs
                text-slate-400
            "
        >
            <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="
                        M8 7V3
                        m8 4V3
                        m-9 8h10
                        M5 5h14
                        a2 2 0 012 2v12
                        a2 2 0 01-2 2H5
                        a2 2 0 01-2-2V7
                        a2 2 0 012-2z
                    "
                ></path>
            </svg>

            <span>
                Submitted ${escapeHTML(submittedDate)}
            </span>
        </div>

        <button
            type="button"
            class="
                viewComplaintBtn
                w-full
                sm:w-auto
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-blue-50
                text-blue-600
                hover:bg-blue-600
                hover:text-white
                active:scale-[0.98]
                text-sm
                font-semibold
                transition-all
                duration-200
            "
            data-id="${escapeHTML(complaint.complaintID)}"
        >
            View details

            <svg
                class="
                    w-4
                    h-4
                    transition-transform
                    duration-200
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                ></path>
            </svg>
        </button>
    </div>
</div>


</article>
`;
}

// ============================================================
// DETERMINE COMPLAINT PROGRESS
// ============================================================

function getComplaintProgressState(complaint) {
    complaint = complaint || {};


    const complaintStatus =
        normalizeComplaintStatus(
            complaint.status
        );

    const dispatchStatus =
        normalizeComplaintStatus(
            complaint.dispatchStatus
        );

    // --------------------------------------------------------
    // UNABLE TO RESOLVE
    // --------------------------------------------------------

    if (
        isUnableToResolveStatus(
            complaintStatus
        ) ||
        isUnableToResolveStatus(
            dispatchStatus
        )
    ) {
        return {
            type: "unable"
        };
    }

    // --------------------------------------------------------
    // RESOLVED
    // --------------------------------------------------------

    if (
        isResolvedStatus(
            complaintStatus
        ) ||
        isResolvedStatus(
            dispatchStatus
        )
    ) {
        return {
            type: "resolved"
        };
    }

    // --------------------------------------------------------
    // DISPATCH STATUS
    // --------------------------------------------------------

    if (dispatchStatus === "arrived") {
        return {
            type: "normal",
            currentStep: 5
        };
    }

    if (dispatchStatus === "on the way") {
        return {
            type: "normal",
            currentStep: 4
        };
    }

    if (dispatchStatus === "assigned") {
        return {
            type: "normal",
            currentStep: 3
        };
    }

    // --------------------------------------------------------
    // GENERAL COMPLAINT STATUS
    // --------------------------------------------------------

    switch (complaintStatus) {

        case "pending":
        case "submitted":
            return {
                type: "normal",
                currentStep: 0
            };

        case "under review":
        case "review":
        case "for review":
        case "awaiting review":
            return {
                type: "normal",
                currentStep: 1
            };

        case "verified":
        case "approved":
            return {
                type: "normal",
                currentStep: 2
            };

        case "assigned":
        case "assigned to response team":
        case "team assigned":
            return {
                type: "normal",
                currentStep: 3
            };

        case "accepted":
        case "dispatched":
        case "in progress":
        case "responding":
        case "on the way":
            return {
                type: "normal",
                currentStep: 4
            };

        case "arrived":
        case "on site":
        case "onsite":
            return {
                type: "normal",
                currentStep: 5
            };

        default:
            return {
                type: "normal",
                currentStep: 0
            };
    }


}

// ============================================================
// UPDATE COMPLAINT PROGRESS
// ============================================================

function updateComplaintProgress(complaint) {


    const progressContainer =
        document.getElementById(
            "complaintProgressTracker"
        );

    if (!progressContainer) {
        return;
    }

    /*
     * Make the function safe if somebody passes
     * only a status string.
     */

    if (
        typeof complaint !== "object" ||
        complaint === null
    ) {
        complaint = {
            status: complaint || "Pending",
            dispatchStatus: ""
        };
    }

    const progressState =
        getComplaintProgressState(
            complaint
        );

    // ========================================================
    // COMMON STEPS
    // ========================================================

    const steps = [
        {
            key: "submitted",
            title: "Submitted",
            description:
                "Your complaint was submitted successfully."
        },

        {
            key: "review",
            title: "Under Review",
            description:
                "Your complaint is being reviewed."
        },

        {
            key: "verified",
            title: "Verified",
            description:
                "Your complaint has been verified."
        },

        {
            key: "assigned",
            title: "Assigned",
            description:
                "A response team has been assigned."
        },

        {
            key: "accepted",
            title: "On the Way",
            description:
                "The response team is on the way."
        },

        {
            key: "arrived",
            title: "Arrived",
            description:
                "The response team has arrived at the reported location."
        }
    ];

    // ========================================================
    // UNABLE TO RESOLVE
    // ========================================================

    if (
        progressState.type === "unable"
    ) {

        const unableSteps = [
            ...steps,

            {
                key: "unable",
                title: "Unable to Resolve",
                description:
                    "The response team was unable to resolve this complaint."
            }
        ];

        progressContainer.innerHTML =
            unableSteps
                .map(
                    (step, index) => {

                        const isTerminal =
                            index ===
                            unableSteps.length - 1;

                        /*
                         * EVERY STEP BEFORE THE TERMINAL
                         * STATE GETS A CHECKMARK.
                         */

                        if (!isTerminal) {

                            return `


<div
    class="
        progress-step
        completed
    "
>
    <div
        class="
            progress-icon
            completed
        "
    >
        <i
            class="
                fa-solid
                fa-check
            "
        ></i>
    </div>


<div
    class="
        progress-content
    "
>
    <div
        class="
            progress-label
        "
    >
        ${escapeHTML(step.title)}
    </div>

    <div
        class="
            progress-description
        "
    >
        ${escapeHTML(step.description)}
    </div>
</div>

<div
    class="
        progress-line
        completed
    "
></div>


</div>
`;
                        }


                        /*
                         * TERMINAL UNABLE TO RESOLVE
                         * IS RED AND DOES NOT GET A CHECKMARK.
                         */

                        return `


<div
    class="
        progress-step
        current
        rejected
    "
>
    <div
        class="
            progress-icon
            rejected
        "
    >
        <i
            class="
                fa-solid
                fa-triangle-exclamation
            "
        ></i>
    </div>


<div
    class="
        progress-content
    "
>
    <div
        class="
            progress-label
        "
    >
        ${escapeHTML(step.title)}
    </div>

    <div
        class="
            progress-description
        "
    >
        ${escapeHTML(step.description)}
    </div>
</div>


</div>
`;
                    }
                )
                .join("");


        return;
    }

    // ========================================================
    // RESOLVED
    // ========================================================

    if (
        progressState.type === "resolved"
    ) {

        const resolvedSteps = [
            ...steps,

            {
                key: "resolved",
                title: "Resolved",
                description:
                    "Your complaint has been resolved."
            }
        ];

        /*
         * ALL STEPS INCLUDING RESOLVED ARE COMPLETED.
         * This is the part that was missing before.
         */

        progressContainer.innerHTML =
            resolvedSteps
                .map(
                    (step, index) => {

                        const isLast =
                            index ===
                            resolvedSteps.length - 1;

                        return `


<div
    class="
        progress-step
        completed
    "
>
    <div
        class="
            progress-icon
            completed
        "
    >
        <i
            class="
                fa-solid
                fa-check
            "
        ></i>
    </div>


<div
    class="
        progress-content
    "
>
    <div
        class="
            progress-label
        "
    >
        ${escapeHTML(step.title)}
    </div>

    <div
        class="
            progress-description
        "
    >
        ${escapeHTML(step.description)}
    </div>
</div>

${!isLast
                                ? `
<div
    class="
        progress-line
        completed
    "
></div>
`
                                : ""
                            }


</div>
`;
                    }
                )
                .join("");


        return;
    }

    // ========================================================
    // REJECTED
    // ========================================================

    if (
        normalizeComplaintStatus(
            complaint.status
        ) === "rejected"
    ) {

        progressContainer.innerHTML = `


<div
    class="
        progress-step
        current
        rejected
    "
>
    <div
        class="
            progress-icon
            rejected
        "
    >
        <i
            class="
                fa-solid
                fa-xmark
            "
        ></i>
    </div>


<div
    class="
        progress-content
    "
>
    <div
        class="
            progress-label
        "
    >
        Complaint Rejected
    </div>

    <div
        class="
            progress-description
        "
    >
        This complaint was rejected by the administration.
    </div>
</div>


</div>
`;


        return;
    }

    // ========================================================
    // NORMAL PROGRESS
    // ========================================================

    const currentStep =
        Math.max(
            0,
            Math.min(
                progressState.currentStep,
                steps.length - 1
            )
        );

    progressContainer.innerHTML =
        steps
            .map(
                (step, index) => {

                    const isCompleted =
                        index <
                        currentStep;

                    const isCurrent =
                        index ===
                        currentStep;

                    let stateClass = "";

                    if (isCompleted) {
                        stateClass =
                            "completed";
                    }
                    else if (isCurrent) {
                        stateClass =
                            "current";
                    }

                    /*
                     * RESTORED CHECKMARK LOGIC.
                     */

                    const icon =
                        isCompleted
                            ? `
                            <i
                                class="
                                    fa-solid
                                    fa-check
                                "
                            ></i>
                        `
                            : isCurrent
                                ? `
                                <i
                                    class="
                                        fa-solid
                                        fa-circle
                                    "
                                ></i>
                            `
                                : `
                                <i
                                    class="
                                        fa-regular
                                        fa-circle
                                    "
                                ></i>
                            `;

                    const line =
                        index <
                            steps.length - 1
                            ? `
                            <div
                                class="
                                    progress-line
                                    ${index < currentStep
                                ? "completed"
                                : ""
                            }
                                "
                            ></div>
                        `
                            : "";

                    return `


<div
    class="
        progress-step
        ${stateClass}
    "
>
    <div
        class="
            progress-icon
            ${stateClass}
        "
    >
        ${icon}
    </div>


<div
    class="
        progress-content
    "
>
    <div
        class="
            progress-label
        "
    >
        ${escapeHTML(step.title)}
    </div>

    <div
        class="
            progress-description
        "
    >
        ${escapeHTML(step.description)}
    </div>
</div>

${line}


</div>
`;
                }
            )
            .join("");
}

// ============================================================
// SHOW COMPLAINT MAP
// ============================================================

function showComplaintMap(complaint) {


    const mapSection =
        document.getElementById(
            "complaintMapSection"
        );

    const mapElement =
        document.getElementById(
            "complaintMap"
        );

    const coordinatesElement =
        document.getElementById(
            "viewComplaintCoordinates"
        );

    if (
        !mapSection ||
        !mapElement ||
        !coordinatesElement
    ) {
        return;
    }

    const latitude =
        parseFloat(
            complaint.latitude ??
            complaint.lat ??
            complaint.gpsLatitude
        );

    const longitude =
        parseFloat(
            complaint.longitude ??
            complaint.lng ??
            complaint.lon ??
            complaint.gpsLongitude
        );

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        mapSection.classList.add(
            "hidden"
        );

        coordinatesElement.classList.add(
            "hidden"
        );

        stopDispatchTracking();

        return;
    }

    mapSection.classList.remove(
        "hidden"
    );

    coordinatesElement.classList.remove(
        "hidden"
    );

    coordinatesElement.textContent =
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    if (
        typeof google === "undefined" ||
        !google.maps
    ) {

        console.warn(
            "Google Maps API is not available."
        );

        return;
    }

    const position = {
        lat: latitude,
        lng: longitude
    };

    try {

        complaintMap =
            new google.maps.Map(
                mapElement,
                {
                    center: position,
                    zoom: 16,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true
                }
            );

        if (complaintMarker) {
            complaintMarker.setMap(
                null
            );
        }

        complaintMarker =
            new google.maps.Marker({
                position: position,
                map: complaintMap,
                title:
                    "Complaint Location"
            });

        startDispatchTracking(
            complaint.complaintID
        );

        setTimeout(
            () => {

                if (
                    complaintMap &&
                    typeof google !== "undefined" &&
                    google.maps
                ) {

                    google.maps.event.trigger(
                        complaintMap,
                        "resize"
                    );

                    complaintMap.setCenter(
                        position
                    );
                }

            },
            200
        );

    }
    catch (error) {

        console.error(
            "Google Maps error:",
            error
        );
    }


}

// ============================================================
// DISPATCH TRACKING
// ============================================================

function startDispatchTracking(
    complaintID
) {


    stopDispatchTracking();

    if (!complaintID) {
        return;
    }

    trackedComplaintID =
        complaintID;

    updateDispatchLocation();

    dispatchTrackingInterval =
        setInterval(
            updateDispatchLocation,
            5000
        );


}

// ============================================================

function stopDispatchTracking() {


    if (dispatchTrackingInterval) {

        clearInterval(
            dispatchTrackingInterval
        );

        dispatchTrackingInterval =
            null;
    }

    trackedComplaintID =
        null;

    if (dispatchMarker) {

        dispatchMarker.setMap(
            null
        );

        dispatchMarker =
            null;
    }


}

// ============================================================

async function updateDispatchLocation() {
    if (!trackedComplaintID || !complaintMap) {
        return;
    }

    if (typeof google === "undefined" || !google.maps) {
        return;
    }

    try {
        const response = await fetch(
            `get_dispatch_location_citizen.php?complaintID=${encodeURIComponent(trackedComplaintID)}`,
            {
                method: "GET",
                cache: "no-store",
                credentials: "same-origin"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        // PHP returns active and dispatch at the TOP LEVEL.
        // It does not return them inside result.data.
        if (!result || !result.success || result.active !== true || !result.dispatch) {
            if (dispatchMarker) {
                dispatchMarker.setMap(null);
                dispatchMarker = null;
            }

            if (result && result.success === false) {
                console.warn(
                    "Dispatch location unavailable:",
                    result.message || "Unknown server response"
                );
            }

            return;
        }

        const dispatchData = result.dispatch;

        const latitude = Number(
            dispatchData.latitude ?? dispatchData.lat
        );

        const longitude = Number(
            dispatchData.longitude ?? dispatchData.lng
        );

        // A team may be assigned before it shares its GPS location.
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            if (dispatchMarker) {
                dispatchMarker.setMap(null);
                dispatchMarker = null;
            }

            console.info(
                "The dispatch team has not provided valid GPS coordinates yet."
            );

            return;
        }

        const position = {
            lat: latitude,
            lng: longitude
        };

        // CREATE THE DISPATCH TEAM ICON
        if (!dispatchMarker) {
            dispatchMarker = new google.maps.Marker({
                position,
                map: complaintMap,
                title: dispatchData.teamName || "Response Team",
                zIndex: 1000,
                icon: {
                    url: "/Complaint/assets/dispatch.webp",
                    scaledSize: new google.maps.Size(30, 30),
                    anchor: new google.maps.Point(15, 15)
                }
            });

            const infoWindow = new google.maps.InfoWindow();

            dispatchMarker.addListener("click", () => {
                const teamName =
                    dispatchData.teamName || "Response Team";

                const department =
                    dispatchData.department || "Department unavailable";

                const status =
                    dispatchData.status || "Active";

                const accuracy =
                    dispatchData.accuracy != null
                        ? `${dispatchData.accuracy} m`
                        : "Unavailable";

                const lastUpdate =
                    dispatchData.lastUpdate
                        ? formatDate(dispatchData.lastUpdate)
                        : "Unavailable";

                infoWindow.setContent(`
                    <div style="min-width:220px;font-family:Arial,sans-serif;">
                        <strong>${escapeHTML(teamName)}</strong>

                        <div style="margin-top:6px;font-size:13px;">
                            ${escapeHTML(department)}
                        </div>

                        <div style="margin-top:6px;font-size:13px;">
                            Status:
                            <strong>${escapeHTML(status)}</strong>
                        </div>

                        <div style="margin-top:4px;font-size:13px;">
                            GPS accuracy: ${escapeHTML(accuracy)}
                        </div>

                        <div style="margin-top:4px;font-size:12px;color:#64748b;">
                            Last update: ${escapeHTML(lastUpdate)}
                        </div>
                    </div>
                `);

                infoWindow.open({
                    map: complaintMap,
                    anchor: dispatchMarker
                });
            });
        } else {
            // UPDATE THE EXISTING ICON AS THE TEAM MOVES
            dispatchMarker.setPosition(position);
            dispatchMarker.setTitle(
                dispatchData.teamName || "Response Team"
            );
            dispatchMarker.setMap(complaintMap);
        }
    } catch (error) {
        console.error("Dispatch location error:", error);
    }
}


// ============================================================
// OPEN COMPLAINT MODAL
// ============================================================

function openComplaintModal(
    complaint
) {


    selectedComplaint =
        complaint;

    const modal =
        document.getElementById(
            "complaintViewModal"
        );

    if (!modal) {

        console.error(
            "Complaint modal not found."
        );

        return;
    }

    // ========================================================
    // BASIC INFORMATION
    // ========================================================

    const complaintID =
        document.getElementById(
            "viewComplaintID"
        );

    const category =
        document.getElementById(
            "viewComplaintCategory"
        );

    const description =
        document.getElementById(
            "viewComplaintDescription"
        );

    const urgency =
        document.getElementById(
            "viewComplaintUrgency"
        );

    const submitted =
        document.getElementById(
            "viewComplaintDate"
        );

    const deadline =
        document.getElementById(
            "viewComplaintDeadline"
        );

    if (complaintID) {

        complaintID.textContent =
            "#" +
            (
                complaint.complaintID ??
                "--"
            );
    }

    if (category) {

        category.textContent =
            complaint.aiCategory ||
            complaint.category ||
            "Uncategorized";
    }

    if (description) {

        description.textContent =
            complaint.rawComplaintText ||
            complaint.description ||
            "No description available.";
    }

    if (urgency) {

        urgency.textContent =
            complaint.aiUrgency ||
            complaint.urgency ||
            "Normal";
    }

    if (submitted) {

        submitted.textContent =
            complaint.createdAt
                ? formatDate(
                    complaint.createdAt
                )
                : "Not available";
    }

    if (deadline) {

        const deadlineValue =
            complaint.deadlineAt ??
            complaint.deadline ??
            null;

        deadline.textContent =
            deadlineValue
                ? formatDate(
                    deadlineValue
                )
                : "Not available";
    }

    // ========================================================
    // STATUS
    // ========================================================

    const statusElement =
        document.getElementById(
            "viewComplaintStatus"
        );

    let displayStatus =
        complaint.status ||
        "Pending";

    if (
        isUnableToResolveStatus(
            complaint.dispatchStatus
        )
    ) {

        displayStatus =
            "Unable to Resolve";
    }
    else if (
        isResolvedStatus(
            complaint.dispatchStatus
        )
    ) {

        displayStatus =
            "Resolved";
    }

    const normalizedStatus =
        normalizeComplaintStatus(
            displayStatus
        );

    if (statusElement) {

        statusElement.textContent =
            displayStatus;

        statusElement.className =
            "inline-flex mt-2 px-3 py-1.5 rounded-full text-xs font-bold";

        if (
            isResolvedStatus(
                normalizedStatus
            )
        ) {

            statusElement.classList.add(
                "bg-green-100",
                "text-green-700"
            );

        }
        else if (
            isUnableToResolveStatus(
                normalizedStatus
            ) ||
            normalizedStatus === "rejected" ||
            normalizedStatus === "declined"
        ) {

            statusElement.classList.add(
                "bg-red-100",
                "text-red-700"
            );

        }
        else if (
            normalizedStatus === "verified"
        ) {

            statusElement.classList.add(
                "bg-blue-100",
                "text-blue-700"
            );

        }
        else if (
            normalizedStatus === "under review" ||
            normalizedStatus === "review"
        ) {

            statusElement.classList.add(
                "bg-violet-100",
                "text-violet-700"
            );

        }
        else {

            statusElement.classList.add(
                "bg-blue-100",
                "text-blue-700"
            );
        }
    }

    // ========================================================
    // PROGRESS
    // ========================================================

    updateComplaintProgress(
        complaint
    );

    // ========================================================
    // LOCATION
    // ========================================================

    const locationElement =
        document.getElementById(
            "viewComplaintLocation"
        );

    if (locationElement) {

        locationElement.textContent =
            getComplaintLocation(
                complaint
            );
    }

    // ========================================================
    // MAP
    // ========================================================

    try {

        showComplaintMap(
            complaint
        );

    }
    catch (error) {

        console.error(
            "Unable to display complaint map:",
            error
        );
    }

    // ========================================================
    // EVIDENCE
    // ========================================================

    const evidenceSection =
        document.getElementById(
            "viewComplaintEvidenceSection"
        );

    const image =
        document.getElementById(
            "viewComplaintImage"
        );

    const video =
        document.getElementById(
            "viewComplaintVideo"
        );

    if (evidenceSection) {

        evidenceSection.classList.add(
            "hidden"
        );
    }

    if (image) {

        image.classList.add(
            "hidden"
        );

        image.removeAttribute(
            "src"
        );
    }

    if (video) {

        video.classList.add(
            "hidden"
        );

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();
    }

    if (complaint.filePath) {

        const filePath =
            String(
                complaint.filePath
            );

        const extension =
            filePath
                .split("?")[0]
                .split(".")
                .pop()
                .toLowerCase();

        const imageExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp"
        ];

        const videoExtensions = [
            "mp4",
            "webm",
            "ogg",
            "mov"
        ];

        if (
            imageExtensions.includes(
                extension
            ) &&
            image
        ) {

            image.src =
                filePath;

            image.classList.remove(
                "hidden"
            );

            if (evidenceSection) {

                evidenceSection.classList.remove(
                    "hidden"
                );
            }

        }
        else if (
            videoExtensions.includes(
                extension
            ) &&
            video
        ) {

            video.src =
                filePath;

            video.classList.remove(
                "hidden"
            );

            if (evidenceSection) {

                evidenceSection.classList.remove(
                    "hidden"
                );
            }
        }
    }

    // ========================================================
    // FEEDBACK
    // ========================================================

    const feedbackSection =
        document.getElementById(
            "viewComplaintFeedbackSection"
        );

    if (feedbackSection) {

        feedbackSection.classList.add(
            "hidden"
        );
    }

    const feedbackAvailable =
        isResolvedStatus(
            complaint.status
        ) ||
        isResolvedStatus(
            complaint.dispatchStatus
        );

    if (
        feedbackAvailable &&
        !complaint.hasFeedback &&
        feedbackSection
    ) {

        feedbackSection.classList.remove(
            "hidden"
        );
    }

    // ========================================================
    // SHOW MODAL
    // ========================================================

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );

    document.body.style.overflow =
        "hidden";

    setTimeout(
        () => {

            if (
                complaintMap &&
                typeof google !== "undefined" &&
                google.maps
            ) {

                google.maps.event.trigger(
                    complaintMap,
                    "resize"
                );
            }

        },
        150
    );


}

// ============================================================
// VIEW COMPLAINT PAGE
// ============================================================

function viewComplaint(id) {


    if (!id) {
        return;
    }

    window.location.href =
        `complaintDetails.html?id=${encodeURIComponent(
            id
        )}`;


}

// ============================================================
// LOAD COMPLAINTS
// ============================================================

async function loadMyComplaints() {


    const list =
        document.getElementById(
            "complaintsList"
        );

    const totalElement =
        document.getElementById(
            "totalComplaints"
        );

    const resolvedElement =
        document.getElementById(
            "resolvedComplaints"
        );

    if (!list) {

        console.error(
            "Complaints list not found."
        );

        return;
    }

    try {

        const response =
            await fetch(
                "get_myComplaints.php",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to load complaints."
            );
        }

        const complaints =
            Array.isArray(result.data)
                ? result.data
                : [];

        // ====================================================
        // SUMMARY
        // ====================================================

        if (totalElement) {

            totalElement.textContent =
                complaints.length;
        }

        const resolvedCount =
            complaints.filter(
                complaint => {

                    return (
                        isResolvedStatus(
                            complaint.status
                        ) ||
                        isResolvedStatus(
                            complaint.dispatchStatus
                        )
                    );
                }
            ).length;

        if (resolvedElement) {

            resolvedElement.textContent =
                resolvedCount;
        }

        // ====================================================
        // EMPTY STATE
        // ====================================================

        if (
            complaints.length === 0
        ) {

            list.innerHTML = `


<div
    class="
        bg-white
        border
        border-slate-200
        rounded-2xl
        p-8
        text-center
    "
>
    <div
        class="
            w-14
            h-14
            mx-auto
            rounded-2xl
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
        "
    >
        <svg
            class="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="
                    M9 12h6
                    m-6 4h6
                    m2 5H7
                    a2 2 0 01-2-2V5
                    a2 2 0 012-2h6
                    l5 5v11
                    a2 2 0 01-2 2z
                "
            ></path>
        </svg>
    </div>


<h3
    class="
        mt-4
        text-base
        font-bold
        text-slate-800
    "
>
    No complaints yet
</h3>

<p
    class="
        mt-1.5
        text-sm
        text-slate-500
        max-w-sm
        mx-auto
    "
>
    Your submitted complaints will
    appear here so you can easily
    track their progress.
</p>


</div>
`;


            return;
        }

        // ====================================================
        // RENDER
        // ====================================================

        list.innerHTML =
            complaints
                .map(
                    complaint =>
                        createComplaintCard(
                            complaint
                        )
                )
                .join("");

        registerComplaintViewButtons(
            complaints
        );

    }
    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );

        list.innerHTML = `


<div
    class="
        bg-white
        border
        border-red-200
        rounded-2xl
        p-6
    "
>
    <div
        class="
            flex
            items-start
            gap-3
        "
    >
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
                    d="
                        M12 9v4
                        m0 4h.01
                        M10.29 3.86
                        L1.82 18
                        a2 2 0 001.71 3h16.94
                        a2 2 0 001.71-3
                        L13.71 3.86
                        a2 2 0 00-3.42 0z
                    "
                ></path>
            </svg>
        </div>


    <div>
        <h3
            class="
                text-sm
                font-bold
                text-red-700
            "
        >
            Unable to load complaints
        </h3>

        <p
            class="
                mt-1
                text-sm
                text-red-500
            "
        >
            Something went wrong while
            loading your complaints.
        </p>

        <button
            type="button"
            id="retryComplaints"
            class="
                mt-4
                px-4
                py-2
                rounded-lg
                bg-red-600
                hover:bg-red-700
                text-white
                text-sm
                font-semibold
                transition
            "
        >
            Try again
        </button>
    </div>
</div>


</div>
`;


        const retryButton =
            document.getElementById(
                "retryComplaints"
            );

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadMyComplaints
            );
        }
    }


}

// ============================================================
// REGISTER CARD BUTTONS
// ============================================================

function registerComplaintViewButtons(
    complaints
) {


    const buttons =
        document.querySelectorAll(
            ".viewComplaintBtn"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const complaint =
                        complaints.find(
                            item =>
                                String(
                                    item.complaintID
                                ) === String(id)
                        );

                    if (complaint) {

                        openComplaintModal(
                            complaint
                        );
                    }
                }
            );
        }
    );


}

// ============================================================
// CLOSE COMPLAINT MODAL
// ============================================================

function closeComplaintModal() {


    stopDispatchTracking();

    const video =
        document.getElementById(
            "viewComplaintVideo"
        );

    const image =
        document.getElementById(
            "viewComplaintImage"
        );

    const modal =
        document.getElementById(
            "complaintViewModal"
        );

    const mapSection =
        document.getElementById(
            "complaintMapSection"
        );

    const feedbackModal =
        document.getElementById(
            "feedbackModal"
        );

    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();
    }

    if (image) {

        image.src = "";

        image.classList.add(
            "hidden"
        );
    }

    if (modal) {

        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );
    }

    if (mapSection) {

        mapSection.classList.add(
            "hidden"
        );
    }

    if (feedbackModal) {

        feedbackModal.classList.add(
            "hidden"
        );

        feedbackModal.classList.remove(
            "flex"
        );
    }

    document.body.style.overflow =
        "";

    selectedComplaint =
        null;


}

// ============================================================
// FEEDBACK MODAL
// ============================================================

function openFeedbackModal() {


    const modal =
        document.getElementById(
            "feedbackModal"
        );

    if (!modal) {
        return;
    }

    if (!selectedComplaint) {
        return;
    }

    selectedFeedbackRating =
        0;

    const comment =
        document.getElementById(
            "feedbackComment"
        );

    const message =
        document.getElementById(
            "feedbackMessage"
        );

    const characterCount =
        document.getElementById(
            "feedbackCharCount"
        );

    const submitButton =
        document.getElementById(
            "submitFeedbackBtn"
        );

    if (comment) {
        comment.value = "";
    }

    if (message) {

        message.textContent = "";

        message.classList.add(
            "hidden"
        );
    }

    if (characterCount) {

        characterCount.textContent =
            "0";
    }

    if (submitButton) {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Feedback";
    }

    updateFeedbackStars();

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );


}

// ============================================================

function closeFeedbackModal() {


    const modal =
        document.getElementById(
            "feedbackModal"
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
// FEEDBACK STARS
// ============================================================

function updateFeedbackStars() {


    const stars =
        document.querySelectorAll(
            ".feedbackStar"
        );

    stars.forEach(
        star => {

            const rating =
                parseInt(
                    star.dataset.rating,
                    10
                );

            if (
                rating <=
                selectedFeedbackRating
            ) {

                star.classList.remove(
                    "text-slate-300"
                );

                star.classList.add(
                    "text-yellow-400"
                );

            }
            else {

                star.classList.remove(
                    "text-yellow-400"
                );

                star.classList.add(
                    "text-slate-300"
                );
            }
        }
    );

    const ratingLabel =
        document.getElementById(
            "feedbackRatingText"
        );

    if (ratingLabel) {

        const labels = {

            0:
                "Select a rating",

            1:
                "Very dissatisfied",

            2:
                "Dissatisfied",

            3:
                "Neutral",

            4:
                "Satisfied",

            5:
                "Very satisfied"
        };

        ratingLabel.textContent =
            labels[
            selectedFeedbackRating
            ] ||
            "Select a rating";
    }


}

// ============================================================
// FEEDBACK MESSAGE
// ============================================================

function showFeedbackMessage(
    message,
    type = "error"
) {


    const element =
        document.getElementById(
            "feedbackMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "text-sm rounded-lg px-3 py-2";

    if (type === "success") {

        element.classList.add(
            "bg-green-50",
            "text-green-700"
        );

    }
    else {

        element.classList.add(
            "bg-red-50",
            "text-red-700"
        );
    }

    element.classList.remove(
        "hidden"
    );


}

// ============================================================
// SUBMIT FEEDBACK
// ============================================================

async function submitFeedback() {


    if (!selectedComplaint) {

        showFeedbackMessage(
            "No complaint selected."
        );

        return;
    }

    if (
        selectedFeedbackRating < 1 ||
        selectedFeedbackRating > 5
    ) {

        showFeedbackMessage(
            "Please select a rating."
        );

        return;
    }

    const commentElement =
        document.getElementById(
            "feedbackComment"
        );

    const submitButton =
        document.getElementById(
            "submitFeedbackBtn"
        );

    const comment =
        commentElement
            ? commentElement.value.trim()
            : "";

    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Submitting...";
    }

    try {

        const formData =
            new FormData();

        formData.append(
            "complaintID",
            selectedComplaint.complaintID
        );

        formData.append(
            "rating",
            selectedFeedbackRating
        );

        formData.append(
            "comment",
            comment
        );

        const response =
            await fetch(
                "submit_feedback.php",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to submit feedback."
            );
        }

        showFeedbackMessage(
            "Thank you! Your feedback has been submitted.",
            "success"
        );

        const feedbackSection =
            document.getElementById(
                "viewComplaintFeedbackSection"
            );

        if (feedbackSection) {

            feedbackSection.classList.add(
                "hidden"
            );
        }

        if (selectedComplaint) {

            selectedComplaint.hasFeedback =
                true;
        }

        setTimeout(
            () => {

                closeFeedbackModal();

            },
            1200
        );

    }
    catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );

        showFeedbackMessage(
            error.message ||
            "Unable to submit feedback."
        );

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Feedback";
        }
    }


}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {


    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );


}

// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ====================================================
        // LOAD COMPLAINTS
        // ====================================================

        loadMyComplaints();

        // ====================================================
        // COMPLAINT MODAL CLOSE BUTTON
        // ====================================================

        const closeComplaintButton =
            document.getElementById(
                "closeComplaintModal"
            );

        if (closeComplaintButton) {

            closeComplaintButton.addEventListener(
                "click",
                closeComplaintModal
            );
        }

        // ====================================================
        // COMPLAINT MODAL OUTSIDE CLICK
        // ====================================================

        const complaintModal =
            document.getElementById(
                "complaintViewModal"
            );

        if (complaintModal) {

            complaintModal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        complaintModal
                    ) {

                        closeComplaintModal();
                    }
                }
            );
        }

        // ====================================================
        // FEEDBACK BUTTON
        // ====================================================

        const feedbackButton =
            document.getElementById(
                "viewComplaintFeedbackBtn"
            );

        if (feedbackButton) {

            feedbackButton.addEventListener(
                "click",
                openFeedbackModal
            );
        }

        // ====================================================
        // FEEDBACK CLOSE BUTTON
        // ====================================================

        const closeFeedbackButton =
            document.getElementById(
                "closeFeedbackModal"
            );

        if (closeFeedbackButton) {

            closeFeedbackButton.addEventListener(
                "click",
                closeFeedbackModal
            );
        }

        // ====================================================
        // FEEDBACK MODAL OUTSIDE CLICK
        // ====================================================

        const feedbackModal =
            document.getElementById(
                "feedbackModal"
            );

        if (feedbackModal) {

            feedbackModal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        feedbackModal
                    ) {

                        closeFeedbackModal();
                    }
                }
            );
        }

        // ====================================================
        // FEEDBACK STARS
        // ====================================================

        const stars =
            document.querySelectorAll(
                ".feedbackStar"
            );

        stars.forEach(
            star => {

                star.addEventListener(
                    "click",
                    () => {

                        selectedFeedbackRating =
                            parseInt(
                                star.dataset.rating,
                                10
                            );

                        updateFeedbackStars();
                    }
                );
            }
        );

        // ====================================================
        // FEEDBACK CHARACTER COUNTER
        // ====================================================

        const feedbackComment =
            document.getElementById(
                "feedbackComment"
            );

        const feedbackCharCount =
            document.getElementById(
                "feedbackCharCount"
            );

        if (
            feedbackComment &&
            feedbackCharCount
        ) {

            feedbackComment.addEventListener(
                "input",
                () => {

                    feedbackCharCount.textContent =
                        feedbackComment.value.length;
                }
            );
        }

        // ====================================================
        // SUBMIT FEEDBACK
        // ====================================================

        const submitFeedbackButton =
            document.getElementById(
                "submitFeedbackBtn"
            );

        if (submitFeedbackButton) {

            submitFeedbackButton.addEventListener(
                "click",
                submitFeedback
            );
        }
    }


);
