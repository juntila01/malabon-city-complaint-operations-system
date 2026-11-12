/* ============================================================
   MCAT DISPATCH TEAM
   Dispatch User Dashboard
   ============================================================ */

let complaints = [];
let emergencyClusters = [];

let selectedComplaint = null;
let currentUser = null;

// ============================================================
// EMERGENCY DISPATCH ALERT
// ============================================================

let emergencyDispatchAlertShown = false;

let emergencyDispatchAlertModal = null;
let emergencyDispatchAlertClose = null;
let emergencyDispatchAlertView = null;

// ============================================================
// EMERGENCY ALERT SOUND
// ============================================================

let emergencyAlertSound =
    new Audio("/Complaint/assets/emergency-alert.mp3");

emergencyAlertSound.preload = "auto";
emergencyAlertSound.loop = true;
emergencyAlertSound.volume = 0.8;

console.log("🚨 Emergency alert audio initialized.");

// ============================================================
// EMERGENCY BROWSER NOTIFICATION
// ============================================================

function sendEmergencyBrowserNotification(cluster) {

    if (!("Notification" in window)) {

        console.warn(
            "⚠️ Browser notifications are not supported."
        );

        return;
    }

    const title =
        cluster.severity === "CRITICAL"
            ? "🚨 CRITICAL EMERGENCY"
            : "🚨 EMERGENCY DISPATCH";

    const message =
        `${cluster.category} incident detected. ` +
        `${cluster.complaintCount || 0} nearby reports, ` +
        `${cluster.highUrgencyCount || 0} high urgency.`;

    // --------------------------------------------------------
    // Notification permission already granted
    // --------------------------------------------------------

    if (Notification.permission === "granted") {

        new Notification(title, {
            body: message,
            requireInteraction: true,
            tag:
                `emergency-${cluster.clusterID}`
        });

        console.log(
            "🔔 Emergency browser notification sent."
        );

        return;
    }

    // --------------------------------------------------------
    // Permission not requested yet
    // --------------------------------------------------------

    if (Notification.permission === "default") {

        Notification.requestPermission()
            .then(permission => {

                if (permission !== "granted") {

                    console.warn(
                        "⚠️ Browser notification permission denied."
                    );

                    return;
                }

                new Notification(title, {
                    body: message,
                    requireInteraction: true,
                    tag:
                        `emergency-${cluster.clusterID}`
                });

                console.log(
                    "🔔 Emergency browser notification sent after permission."
                );

            })
            .catch(error => {

                console.warn(
                    "⚠️ Notification permission request failed:",
                    error
                );

            });

    }

}
// ============================================================
// EMERGENCY DISPATCH ALERT FUNCTIONS
// ============================================================

function showEmergencyDispatchAlert(cluster) {

    sendEmergencyBrowserNotification(cluster);

    console.log("SHOWING EMERGENCY POPUP", cluster);

    console.log(
        "Emergency modal element:",
        emergencyDispatchAlertModal
    );

    if (!emergencyDispatchAlertModal || !cluster) {
        console.warn("Emergency popup element is missing.");
        return;
    }


    const title =
        document.getElementById(
            "emergencyDispatchAlertTitle"
        );


    const reference =
        document.getElementById(
            "emergencyDispatchAlertReference"
        );


    const severity =
        document.getElementById(
            "emergencyDispatchAlertSeverity"
        );


    const reports =
        document.getElementById(
            "emergencyDispatchAlertReports"
        );


    const high =
        document.getElementById(
            "emergencyDispatchAlertHigh"
        );


    const team =
        document.getElementById(
            "emergencyDispatchAlertTeam"
        );


    const category =
        cluster.category ||
        "Emergency Incident";


    const clusterSeverity =
        String(
            cluster.severity ||
            "EMERGENCY"
        ).toUpperCase();


    const complaintCount =
        Number(
            cluster.complaintCount ||
            0
        );


    const highCount =
        Number(
            cluster.highUrgencyCount ||
            0
        );


    const teamName =
        cluster.teamName ||
        currentUser?.teamName ||
        "Your Response Team";


    if (title) {

        title.textContent =
            `${category} Emergency`;

    }


    if (reference) {

        reference.textContent =
            cluster.clusterReference ||
            "Emergency Incident";

    }


    if (severity) {

        severity.textContent =
            clusterSeverity;


        severity.className =
            clusterSeverity === "CRITICAL"

                ? "rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white"

                : "rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white";

    }


    if (reports) {

        reports.textContent =
            complaintCount;

    }


    if (high) {

        high.textContent =
            highCount;

    }


    if (team) {

        team.textContent =
            teamName;

    }


    emergencyDispatchAlertModal.classList.remove(
        "hidden"
    );


    emergencyDispatchAlertModal.classList.add(
        "flex"
    );
    // ============================================================
    // PLAY EMERGENCY ALERT
    // ============================================================

    console.log("🚨 EMERGENCY ALERT TRIGGERED");

    console.log(
        "Audio paused:",
        emergencyAlertSound.paused
    );

    console.log(
        "Audio readyState:",
        emergencyAlertSound.readyState
    );

    // ============================================================
    // AUTOMATIC EMERGENCY ALARM
    // ============================================================

    emergencyAlertSound.currentTime = 0;
    emergencyAlertSound.volume = 1.0;

    emergencyAlertSound.play()
        .then(() => {

            console.log(
                "🔊 EMERGENCY ALARM PLAYING AUTOMATICALLY"
            );

        })
        .catch(error => {

            console.warn(
                "⚠️ Browser blocked automatic emergency alarm:",
                error
            );

            console.warn(
                "🔔 Browser notification remains available."
            );

        });
}
// ============================================================
// CLOSE EMERGENCY ALERT
// ============================================================

function closeEmergencyDispatchAlert() {

    if (!emergencyDispatchAlertModal) {
        return;
    }

    // Hide the emergency popup
    emergencyDispatchAlertModal.classList.add("hidden");
    emergencyDispatchAlertModal.classList.remove("flex");

    // Stop the emergency alarm
    stopEmergencyAlertSound();

    // Allow the popup to appear again if another
    // emergency/high-urgency assignment is detected.
    emergencyDispatchAlertShown = false;

    console.log(
        "🚨 Emergency dispatch alert closed."
    );
}


// ============================================================
// STOP EMERGENCY ALERT SOUND
// ============================================================

function stopEmergencyAlertSound() {

    if (!emergencyAlertSound) {
        return;
    }

    emergencyAlertSound.pause();

    emergencyAlertSound.currentTime = 0;

    console.log(
        "🔇 Emergency alert sound stopped."
    );
}
// ============================================================
// VIEW EMERGENCY DISPATCH ALERT
// ============================================================

function viewEmergencyDispatchAlert() {

    // Stop the alarm first
    stopEmergencyAlertSound();

    // Close the emergency popup
    closeEmergencyDispatchAlert();

    console.log("🚨 Viewing emergency dispatch incident.");

    // If no cluster was stored, just close the popup
    if (!emergencyClusters || emergencyClusters.length === 0) {
        console.warn("⚠️ No emergency cluster available to view.");
        return;
    }

    /*
     * Find the currently active emergency cluster.
     * This uses the same logic as checkForEmergencyDispatch().
     */
    const teamID = currentUser?.teamID;

    const activeCluster = emergencyClusters.find(cluster => {

        const clusterTeamID =
            cluster.dispatchTeamID ??
            cluster.dispatch_team_id ??
            cluster.teamID ??
            cluster.team_id;

        const status =
            String(cluster.status || "").toLowerCase();

        return (
            String(clusterTeamID) === String(teamID) &&
            (
                status === "assigned" ||
                status === "active" ||
                status === "pending"
            )
        );
    });

    if (!activeCluster) {
        console.warn("⚠️ Active emergency cluster not found.");
        return;
    }

    console.log(
        "🚨 Opening emergency cluster:",
        activeCluster
    );

    /*
     * If the cluster has a representative complaint,
     * open that complaint in the existing complaint modal.
     */
    const complaintID =
        activeCluster.representativeComplaintID ??
        activeCluster.representative_complaint_id ??
        activeCluster.complaintIDs?.[0] ??
        activeCluster.complaint_ids?.[0];

    if (!complaintID) {
        console.warn(
            "⚠️ Emergency cluster has no complaint ID."
        );
        return;
    }

    const complaint = complaints.find(c =>
        String(
            c.complaintID ??
            c.complaint_id ??
            c.id
        ) === String(complaintID)
    );

    if (complaint) {

        selectedComplaint = complaint;

        /*
         * Use your existing complaint modal function.
         * Replace openComplaintModal() below only if your
         * existing function has a different name.
         */
        if (typeof openComplaintModal === "function") {
            openComplaintModal(complaint);
        } else if (typeof viewComplaint === "function") {
            viewComplaint(complaintID);
        } else {
            console.warn(
                "⚠️ No complaint modal function found."
            );
        }

    } else {

        console.warn(
            "⚠️ Representative complaint was not found in complaints list:",
            complaintID
        );
    }
}


function checkForEmergencyDispatch() {

    if (!currentUser) {
        return;
    }

    const teamID = Number(currentUser.teamID);

    if (!teamID) {
        console.warn("Dispatch team ID unavailable.");
        return;
    }

    // Get active emergency clusters assigned to this team.
    const assignedEmergency = Array.isArray(emergencyClusters)
        ? emergencyClusters.find(cluster => {

            const clusterTeamID = Number(
                cluster.dispatchTeamID ??
                cluster.dispatch_team_id ??
                cluster.teamID ??
                cluster.team_id
            );

            const status = String(
                cluster.status || ""
            ).trim().toLowerCase();

            return (
                clusterTeamID === teamID &&
                !["resolved", "unable to resolve"].includes(status)
            );
        })
        : null;

    // Check individual high-urgency complaints that are
    // not already included in an emergency cluster.
    const emergencyComplaintIDs = Array.isArray(emergencyClusters)
        ? emergencyClusters.flatMap(cluster =>
            Array.isArray(cluster.complaintIDs)
                ? cluster.complaintIDs.map(Number)
                : Array.isArray(cluster.complaint_ids)
                    ? cluster.complaint_ids.map(Number)
                    : []
        )
        : [];

    const assignedHighUrgency = complaints.find(complaint => {

        const complaintTeamID = Number(
            complaint.dispatchTeamID ??
            complaint.dispatch_team_id
        );

        const urgency = normalizeUrgency(
            complaint.aiUrgency
        );

        const status = normalizeDispatchStatus(
            complaint.dispatchStatus
        );

        const complaintID = Number(
            complaint.complaintID
        );

        return (
            complaintTeamID === teamID &&
            urgency === "HIGH" &&
            ["assigned", "on the way", "arrived"].includes(status) &&
            !emergencyComplaintIDs.includes(complaintID)
        );
    });

    // Prefer emergency clusters over individual complaints.
    if (assignedEmergency) {

        const clusterComplaintIDs = Array.isArray(
            assignedEmergency.complaintIDs
        )
            ? assignedEmergency.complaintIDs.map(Number)
            : Array.isArray(assignedEmergency.complaint_ids)
                ? assignedEmergency.complaint_ids.map(Number)
                : [];

        // If the representative complaint is already On the Way
        // or Arrived, do not reopen the emergency popup.
        const representativeID = Number(
            assignedEmergency.representativeComplaintID ??
            assignedEmergency.representative_complaint_id ??
            clusterComplaintIDs[0]
        );

        const representative = complaints.find(complaint =>
            Number(complaint.complaintID) === representativeID
        );

        const representativeStatus = normalizeDispatchStatus(
            assignedEmergency.representativeDispatchStatus ??
            representative?.dispatchStatus
        );

        if (
            ["on the way", "arrived"].includes(representativeStatus)
        ) {
            closeEmergencyDispatchAlert();

            // Keep the same emergency popup suppressed.
            // closeEmergencyDispatchAlert() resets this to false,
            // so set it to true AFTER closing the popup.
            emergencyDispatchAlertShown = true;

            return;
        }

        if (emergencyDispatchAlertShown) {
            return;
        }

        emergencyDispatchAlertShown = true;

        showEmergencyDispatchAlert(assignedEmergency);
        return;
    }

    // Individual HIGH-urgency complaint alert.
    if (assignedHighUrgency) {

        const status = normalizeDispatchStatus(
            assignedHighUrgency.dispatchStatus
        );

        if (["on the way", "arrived"].includes(status)) {
            closeEmergencyDispatchAlert();

            // Prevent the same alert from reopening on refresh.
            emergencyDispatchAlertShown = true;

            return;
        }

        if (emergencyDispatchAlertShown) {
            return;
        }

        emergencyDispatchAlertShown = true;

        showEmergencyDispatchAlert({

            complaintID: Number(
                assignedHighUrgency.complaintID
            ),

            complaintReference:
                assignedHighUrgency.complaintReference ||
                `Complaint #${assignedHighUrgency.complaintID}`,

            clusterReference:
                `HIGH-URGENCY-${assignedHighUrgency.complaintID}`,

            category:
                assignedHighUrgency.aiCategory ||
                "Uncategorized",

            severity: "HIGH",

            complaintCount: 1,

            highUrgencyCount: 1,

            dispatchTeamID: teamID,

            teamName:
                currentUser.teamName ||
                "Dispatch Team",

            status:
                assignedHighUrgency.dispatchStatus,

            isIndividualHighUrgency: true,

            complaintIDs: [
                Number(assignedHighUrgency.complaintID)
            ]
        });

        return;
    }

    // No active emergency alert is needed.
    emergencyDispatchAlertShown = false;
}

/* ============================================================
   DOM REFERENCES
============================================================ */

let complaintModal = null;
let resolveModal = null;
let unableModal = null;
let accountModal = null;
/* ============================================================
   COMPLAINT MAP
============================================================ */

let complaintMap = null;
let complaintMarker = null;

/* Google Maps routing */
let directionsService = null;
let directionsRenderer = null;

/* Current complaint destination */
let currentComplaintLocation = null;

/* Last location used to calculate route */
let lastRouteLatitude = null;
let lastRouteLongitude = null;

let dispatchLocationWatcher = null;
let dispatchLocationActive = false;

let dispatchTeamMarker = null;
function renderComplaintMap(complaint) {

    const latitude =
        Number(complaint.latitude);

    const longitude =
        Number(complaint.longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.warn(
            "Invalid complaint coordinates:",
            complaint.latitude,
            complaint.longitude
        );

        return;

    }


    /*
     * Save complaint destination.
     */

    currentComplaintLocation = {

        latitude: latitude,

        longitude: longitude

    };


    /*
     * Create / update complaint map.
     */

    initializeComplaintMap(
        latitude,
        longitude
    );


    initializeDirections();


    /*
     * ========================================================
     * RESTORE DISPATCH TEAM MARKER
     * ========================================================
     *
     * This is important after a page reload.
     *
     * The Google Maps marker itself does NOT survive a reload.
     * We recreate it using the GPS coordinates loaded from
     * the database.
     */

    restoreDispatchTeamMarker(
        complaint
    );
    if (
        (
            normalizeDispatchStatus(
                complaint.dispatchStatus
            ) === "on the way"
            ||
            normalizeDispatchStatus(
                complaint.dispatchStatus
            ) === "arrived"
        )
        &&
        lastRouteLatitude !== null
        &&
        lastRouteLongitude !== null
    ) {

        setTimeout(() => {

            drawRouteToComplaint(
                lastRouteLatitude,
                lastRouteLongitude
            );

        }, 300);

    }


    /*
     * ========================================================
     * IF GPS TRACKING IS ACTIVE
     * ========================================================
     *
     * Use the live marker position if available.
     */

    if (
        dispatchLocationActive &&
        dispatchTeamMarker
    ) {

        const teamPosition =
            dispatchTeamMarker.getPosition();


        if (teamPosition) {

            const teamLatitude =
                teamPosition.lat();

            const teamLongitude =
                teamPosition.lng();


            lastRouteLatitude =
                teamLatitude;

            lastRouteLongitude =
                teamLongitude;


            updateDispatchTeamMarker(
                teamLatitude,
                teamLongitude
            );


            drawRouteToComplaint(
                teamLatitude,
                teamLongitude
            );

        }

    }

}

function initializeComplaintMap(
    latitude,
    longitude
) {

    const mapElement =
        document.getElementById(
            "complaintMap"
        );


    if (!mapElement) {

        console.warn(
            "complaintMap element was not found."
        );

        return;

    }


    const location = {
        lat: latitude,
        lng: longitude
    };


    /*
     * Create the map only once.
     */

    if (!complaintMap) {

        complaintMap =
            new google.maps.Map(
                mapElement,
                {
                    center: location,
                    zoom: 18,

                    mapTypeId:
                        google.maps.MapTypeId.HYBRID,

                    mapTypeControl: true,

                    mapTypeControlOptions: {
                        style:
                            google.maps.MapTypeControlStyle.DEFAULT,

                        position:
                            google.maps.ControlPosition.TOP_RIGHT,

                        mapTypeIds: [
                            google.maps.MapTypeId.ROADMAP,
                            google.maps.MapTypeId.HYBRID
                        ]
                    },

                    streetViewControl: false,

                    fullscreenControl: true,

                    zoomControl: true
                }
            );

    }
    else {

        complaintMap.setCenter(
            location
        );

        complaintMap.setZoom(16);

    }


    /*
     * Remove previous marker.
     */

    if (complaintMarker) {

        complaintMarker.setMap(null);

    }


    /*
     * Create new marker.
     */

    complaintMarker =
        new google.maps.Marker({
            position: location,
            map: complaintMap,
            title: "Complaint Location"
        });


    /*
     * Google Maps sometimes needs
     * resize/center after a modal opens.
     */

    setTimeout(() => {

        if (!complaintMap) {
            return;
        }

        google.maps.event.trigger(
            complaintMap,
            "resize"
        );

        complaintMap.setCenter(location);

    }, 300);

    initializeDirections();

}
/* ============================================================
   INITIALIZE DIRECTIONS
============================================================ */

function initializeDirections() {

    if (!complaintMap) {

        console.warn(
            "Cannot initialize directions: map does not exist."
        );

        return;

    }


    if (!directionsService) {

        directionsService =
            new google.maps.DirectionsService();

    }


    if (!directionsRenderer) {

        directionsRenderer =
            new google.maps.DirectionsRenderer({

                map: complaintMap,

                suppressMarkers: true,

                preserveViewport: false,

                polylineOptions: {

                    strokeColor: "#2563EB",

                    strokeOpacity: 0.85,

                    strokeWeight: 6

                }

            });

    }
    else {

        /*
         * Make sure the renderer is attached
         * to the current complaint map.
         */

        directionsRenderer.setMap(
            complaintMap
        );

    }

}
/* ============================================================
   DRAW ROUTE TO COMPLAINT
============================================================ */

function drawRouteToComplaint(
    dispatchLatitude,
    dispatchLongitude
) {

    const distanceElement =
        document.getElementById("routeDistance");

    const estimatedTimeElement =
        document.getElementById("routeDuration");

    if (!currentComplaintLocation) {

        console.warn(
            "No complaint destination available."
        );

        return;

    }


    if (!complaintMap) {

        console.warn(
            "Map is not initialized."
        );

        return;

    }


    initializeDirections();


    if (
        !directionsService ||
        !directionsRenderer
    ) {

        console.warn(
            "Google Directions is not initialized."
        );

        return;

    }


    const origin = {

        lat:
            Number(dispatchLatitude),

        lng:
            Number(dispatchLongitude)

    };


    const destination = {

        lat:
            Number(
                currentComplaintLocation.latitude
            ),

        lng:
            Number(
                currentComplaintLocation.longitude
            )

    };


    if (
        !Number.isFinite(origin.lat) ||
        !Number.isFinite(origin.lng) ||
        !Number.isFinite(destination.lat) ||
        !Number.isFinite(destination.lng)
    ) {

        console.warn(
            "Invalid route coordinates:",
            {
                origin,
                destination
            }
        );

        return;

    }


    console.log(
        "Calculating Google Maps route:",
        {
            origin,
            destination
        }
    );
    const latDifference = Math.abs(
        origin.lat - destination.lat
    );

    const lngDifference = Math.abs(
        origin.lng - destination.lng
    );

    const sameLocation =
        latDifference < 0.00001 &&
        lngDifference < 0.00001;

    if (sameLocation) {

        console.log(
            "Dispatch team is already at the complaint location."
        );

        distanceElement.textContent = "0 m";
        estimatedTimeElement.textContent = "At location";

        return;
    }


    directionsService.route(

        {

            origin:
                origin,

            destination:
                destination,

            travelMode:
                google.maps.TravelMode.DRIVING,

            provideRouteAlternatives:
                false

        },

        (
            result,
            status
        ) => {

            console.log(
                "Google Directions response:",
                status
            );


            if (
                status !==
                google.maps.DirectionsStatus.OK
            ) {

                console.error(
                    "Unable to calculate route:",
                    status,
                    {
                        origin: origin,
                        destination: destination
                    }
                );


                setText(
                    "routeDistance",
                    "Unavailable"
                );


                setText(
                    "routeDuration",
                    "Unavailable"
                );


                if (directionsRenderer) {

                    directionsRenderer.setDirections({
                        routes: []
                    });

                }


                return;

            }


            /*
             * Display route.
             */

            directionsRenderer.setDirections(
                result
            );


            /*
             * Route information.
             */

            const route =
                result.routes[0];


            if (
                route &&
                route.legs &&
                route.legs.length > 0
            ) {

                const leg =
                    route.legs[0];


                setText(
                    "routeDistance",

                    leg.distance
                        ? leg.distance.text
                        : "Unavailable"
                );


                setText(
                    "routeDuration",

                    leg.duration
                        ? leg.duration.text
                        : "Unavailable"
                );

            }

        }

    );

}

/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    complaintModal =
        document.getElementById("complaintModal");

    resolveModal =
        document.getElementById("resolveModal");

    unableModal =
        document.getElementById("unableModal");

    accountModal =
        document.getElementById("accountModal");


    // ========================================================
    // EMERGENCY DISPATCH ALERT
    // ========================================================

    emergencyDispatchAlertModal =
        document.getElementById(
            "emergencyDispatchAlertModal"
        );

    emergencyDispatchAlertClose =
        document.getElementById(
            "emergencyDispatchAlertClose"
        );

    emergencyDispatchAlertView =
        document.getElementById(
            "emergencyDispatchAlertView"
        );


    // ========================================================
    // EMERGENCY ALERT BUTTONS
    // ========================================================

    if (emergencyDispatchAlertClose) {

        emergencyDispatchAlertClose.onclick =
            closeEmergencyDispatchAlert;

    }


    if (emergencyDispatchAlertView) {

        emergencyDispatchAlertView.onclick =
            viewEmergencyDispatchAlert;

    }


    setCurrentDate();

    setupModalEvents();

    setupEscapeKey();

    setupEvidenceUpload();

    loadDispatchDashboard();

});


async function loadEmergencyClusters() {

    try {

        const response = await fetch(
            "get_emergency_clusters.php",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {

            console.warn(
                "Emergency Cluster API:",
                data.message
            );

            emergencyClusters = [];
            return;
        }

        emergencyClusters =
            Array.isArray(data.data)
                ? data.data
                : [];

        console.log(
            "Emergency clusters loaded:",
            emergencyClusters
        );

    }
    catch (error) {

        console.error(
            "Emergency Cluster Error:",
            error
        );

        emergencyClusters = [];
    }
}


/* ============================================================
   LOAD DASHBOARD
============================================================ */

async function loadDispatchDashboard() {

    try {

        const response = await fetch(
            "dispatchUserData.php",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data = await response.json();


        if (!data.success) {

            console.error(
                "Dispatch API:",
                data.message
            );

            alert(
                data.message ||
                "Unable to load dispatch dashboard."
            );

            return;

        }


        currentUser =
            data.user || null;


        complaints =
            Array.isArray(data.complaints)
                ? data.complaints
                : [];

        await loadEmergencyClusters();


        /*
 * ========================================================
 * RESTORE DISPATCH TEAM GPS LOCATION
 * ========================================================
 *
 * dispatchUserData.php returns the location inside:
 *
 * data.user.currentLatitude
 * data.user.currentLongitude
 *
 * NOT data.teamLocation.
 */

        const savedLatitude =
            Number(
                data.user?.currentLatitude
            );

        const savedLongitude =
            Number(
                data.user?.currentLongitude
            );


        if (
            Number.isFinite(savedLatitude) &&
            Number.isFinite(savedLongitude)
        ) {

            console.log(
                "Restoring saved dispatch location:",
                {
                    latitude: savedLatitude,
                    longitude: savedLongitude
                }
            );


            /*
             * These variables survive the dashboard
             * rendering and are later used when the
             * complaint map is opened.
             */

            lastRouteLatitude =
                savedLatitude;

            lastRouteLongitude =
                savedLongitude;


        }
        else {

            console.warn(
                "No saved dispatch team GPS location found.",
                {
                    currentLatitude:
                        data.user?.currentLatitude,

                    currentLongitude:
                        data.user?.currentLongitude
                }
            );


            lastRouteLatitude = null;
            lastRouteLongitude = null;

        }
        /*
 * Render the dashboard using the newly loaded data.
 */

        renderUser();

        renderDashboard();

        checkForEmergencyDispatch();


    }
    catch (error) {

        console.error(
            "Dispatch Dashboard Error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

}


/* ============================================================
   DATE
============================================================ */

function setCurrentDate() {

    const element =
        document.getElementById("currentDate");


    if (!element) {
        return;
    }


    const now = new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* ============================================================
   USER
============================================================ */

function renderUser() {

    if (!currentUser) {
        return;
    }


    const name =
        currentUser.teamName ||
        currentUser.teamLeader ||
        currentUser.fullName ||
        currentUser.email ||
        "Dispatch Team";


    const initials =
        getInitials(name);


    setText(
        "headerInitials",
        initials
    );


    setText(
        "accountInitials",
        initials
    );


    setText(
        "accountName",
        name
    );


    /*
     * Optional header name fields.
     * These won't cause errors if they
     * don't exist in your HTML.
     */

    setText(
        "headerTeamName",
        currentUser.teamName ||
        "Dispatch Team"
    );


    setText(
        "headerDepartment",
        currentUser.department ||
        ""
    );

}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "--";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "--";
    }

    // Single name
    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }

    // First + last name
    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


/* ============================================================
   DASHBOARD
============================================================ */

function renderDashboard() {

    renderSummary();

    renderActiveAssignment();

    renderOtherAssignments();

    renderEmergencyIncidents();

}
function renderEmergencyIncidents() {

    const section = document.getElementById("emergencyIncidentsSection");
    const list = document.getElementById("emergencyIncidentList");
    const countBadge = document.getElementById("emergencyIncidentCount");

    if (!section || !list || !countBadge) {
        console.warn("Emergency incident elements not found.");
        return;
    }

    // Only show incidents that are still active
    const activeClusters = emergencyClusters.filter(cluster => {

        const status = String(cluster.status || "").toLowerCase();

        return (
            status !== "resolved" &&
            status !== "unable to resolve"
        );
    });

    // No active emergency incidents
    if (activeClusters.length === 0) {

        section.classList.add("hidden");
        list.innerHTML = "";
        countBadge.classList.add("hidden");

        return;
    }

    // Show section
    section.classList.remove("hidden");

    // Update count
    countBadge.textContent = activeClusters.length;
    countBadge.classList.remove("hidden");

    // Render incidents
    list.innerHTML = activeClusters.map(cluster => {

        const severity = String(
            cluster.severity || "EMERGENCY"
        ).toUpperCase();

        const severityClass =
            severity === "CRITICAL"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700";

        const category =
            cluster.category || "Emergency Incident";

        const complaintCount =
            Number(cluster.complaintCount || 0);

        const highCount =
            Number(cluster.highUrgencyCount || 0);

        const status =
            cluster.status || "Detected";

        const teamName =
            cluster.teamName || "Dispatch Team";

        return `
            <div class="rounded-xl border border-red-200 bg-white p-4 shadow-sm">

                <div class="flex items-start justify-between gap-4">

                    <div class="flex items-start gap-3">

                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <i class="fas fa-triangle-exclamation"></i>
                        </div>

                        <div>

                            <div class="flex flex-wrap items-center gap-2">

                                <h4 class="font-bold text-slate-900">
                                    ${escapeHTML(category)} Emergency
                                </h4>

                                <span class="rounded-full px-2.5 py-1 text-xs font-bold ${severityClass}">
                                    ${escapeHTML(severity)}
                                </span>

                            </div>

                            <p class="mt-1 text-xs text-slate-500">
                                ${escapeHTML(cluster.clusterReference || "Emergency Incident")}
                            </p>

                        </div>

                    </div>

                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        ${escapeHTML(status)}
                    </span>

                </div>

                <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    <div class="rounded-lg bg-slate-50 p-3">
                        <p class="text-xs text-slate-500">
                            Nearby Reports
                        </p>
                        <p class="mt-1 text-lg font-bold text-slate-900">
                            ${complaintCount}
                        </p>
                    </div>

                    <div class="rounded-lg bg-red-50 p-3">
                        <p class="text-xs text-red-600">
                            High Urgency
                        </p>
                        <p class="mt-1 text-lg font-bold text-red-700">
                            ${highCount}
                        </p>
                    </div>

                    <div class="rounded-lg bg-slate-50 p-3 col-span-2 sm:col-span-1">
                        <p class="text-xs text-slate-500">
                            Response Team
                        </p>
                        <p class="mt-1 truncate text-sm font-bold text-slate-900">
                            ${escapeHTML(teamName)}
                        </p>
                    </div>

                </div>

            </div>
        `;

    }).join("");
}

/* ============================================================
   SUMMARY
============================================================ */

function renderSummary() {

    const active =
        complaints.filter(
            complaint =>
                isActiveDispatch(complaint)
        ).length;


    const assigned =
        complaints.filter(
            complaint =>
                isActiveDispatch(
                    complaint
                )
        ).length;


    const completedToday =
        complaints.filter(
            complaint => {

                const status =
                    normalizeDispatchStatus(
                        complaint.dispatchStatus
                    );


                if (
                    status !== "resolved" &&
                    status !== "unable to resolve"
                ) {

                    return false;

                }


                if (!complaint.completedAt) {
                    return false;
                }


                const completed =
                    new Date(
                        complaint.completedAt
                    );


                const today =
                    new Date();


                return (
                    completed.getFullYear() ===
                    today.getFullYear() &&

                    completed.getMonth() ===
                    today.getMonth() &&

                    completed.getDate() ===
                    today.getDate()
                );

            }
        ).length;


    setText(
        "activeCount",
        active
    );


    setText(
        "assignedCount",
        assigned
    );


    setText(
        "completedCount",
        completedToday
    );

}
/* ============================================================
   OPEN COMPLAINT LOCATION
============================================================ */

function openComplaintLocation(complaintID) {

    const complaint =
        complaints.find(
            item =>
                Number(item.complaintID) ===
                Number(complaintID)
        );

    if (!complaint) {

        alert("Complaint could not be found.");

        return;

    }

    const latitude =
        Number(complaint.latitude);

    const longitude =
        Number(complaint.longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        alert(
            "Complaint location coordinates are unavailable."
        );

        return;

    }


    /*
     * Open the location using the coordinates.
     */

    const mapUrl =
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;


    window.open(
        mapUrl,
        "_blank"
    );

}

/* ============================================================
   ACTIVE ASSIGNMENT
============================================================ */

function renderActiveAssignment() {

    const container =
        document.getElementById("activeAssignmentCard");

    if (!container) {
        return;
    }

    const activeComplaint =
        getBestActiveComplaint();


    /*
     * No active assignment
     */

    if (!activeComplaint) {

        container.innerHTML = `
            <div class="p-8 text-center">

                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                    <svg class="h-6 w-6"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />

                    </svg>

                </div>

                <p class="mt-3 text-sm font-semibold text-slate-700">
                    No Active Assignment
                </p>

                <p class="mt-1 text-xs text-slate-400">
                    Assigned complaints will appear here.
                </p>

            </div>
        `;

        return;
    }


    /*
     * ========================================================
     * CHECK FOR EMERGENCY INCIDENT
     * ========================================================
     */

    const emergencyCluster =
        activeComplaint.emergencyCluster || null;


    /*
     * ========================================================
     * EMERGENCY INCIDENT VIEW
     * ========================================================
     */

    if (emergencyCluster) {

        const severity =
            String(
                emergencyCluster.severity ||
                "EMERGENCY"
            ).toUpperCase();


        const category =
            emergencyCluster.category ||
            activeComplaint.aiCategory ||
            "Emergency Incident";


        const status =
            normalizeDispatchStatus(
                activeComplaint.dispatchStatus ||
                emergencyCluster.status
            );


        const complaintCount =
            Number(
                emergencyCluster.complaintCount || 0
            );


        const highCount =
            Number(
                emergencyCluster.highUrgencyCount || 0
            );


        const severityClass =
            severity === "CRITICAL"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700";


        let statusClass =
            "bg-blue-50 text-blue-700";


        if (status === "on the way") {

            statusClass =
                "bg-indigo-50 text-indigo-700";

        }


        if (status === "arrived") {

            statusClass =
                "bg-amber-50 text-amber-700";

        }


        /*
         * Open the representative complaint.
         *
         * The representative complaint is still used by
         * the existing modal/map/status functions.
         */

        const representativeComplaintID =
            Number(
                emergencyCluster.representativeComplaintID ||
                activeComplaint.complaintID
            );


        let actionButton = "";

        if (status === "assigned") {

            actionButton = `
                <button
                    type="button"
                    onclick="openComplaintById(${representativeComplaintID})"
                    class="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">

                    Start Emergency Response

                </button>
            `;

        }
        else {

            actionButton = `
                <button
                    type="button"
                    onclick="openComplaintById(${representativeComplaintID})"
                    class="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">

                    View Emergency Incident

                </button>
            `;

        }


        container.innerHTML = `

            <div class="border-l-4 border-red-500">

                <div class="p-5">

                    <!-- TOP -->

                    <div class="flex flex-wrap items-start justify-between gap-4">

                        <div>

                            <div class="flex flex-wrap items-center gap-2">

                                <span
                                    class="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">

                                    EMERGENCY INCIDENT

                                </span>


                                <span
                                    class="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${severityClass}">

                                    ${escapeHTML(severity)}

                                </span>


                                <span
                                    class="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass}">

                                    ${escapeHTML(
            formatDispatchStatus(status)
        )}

                                </span>

                            </div>


                            <h4 class="mt-3 text-lg font-bold text-slate-900">

                                ${escapeHTML(category)} Emergency

                            </h4>


                            <p class="mt-1 text-xs text-slate-400">

                                ${escapeHTML(
            emergencyCluster.clusterReference ||
            "Emergency Incident"
        )}

                            </p>

                        </div>


                        <div class="text-right">

                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Reports
                            </p>

                            <p class="mt-1 text-xs font-semibold text-slate-600">

                                ${complaintCount} nearby
                                ${highCount > 0
                ? `• ${highCount} high urgency`
                : ""
            }

                            </p>

                        </div>

                    </div>


                    <!-- INCIDENT INFORMATION -->

                    <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <div class="rounded-xl border border-red-100 bg-red-50 p-4">

                            <p class="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                                Emergency Reports
                            </p>

                            <p class="mt-1 text-xl font-bold text-red-700">

                                ${complaintCount}

                            </p>

                            <p class="mt-1 text-xs text-red-600">

                                ${highCount} high urgency report${highCount === 1 ? "" : "s"}

                            </p>

                        </div>


                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Response Team
                            </p>

                            <p class="mt-1 text-sm font-bold text-slate-800">

                                ${escapeHTML(
                emergencyCluster.teamName ||
                currentUser?.teamName ||
                "Dispatch Team"
            )}

                            </p>

                        </div>

                    </div>


                    <!-- LOCATION -->

                    <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Incident Location
                        </p>

                        <p class="mt-1 text-sm font-semibold text-slate-800">

                            ${escapeHTML(
                activeComplaint.aiLocation ||
                "Location unavailable"
            )}

                        </p>

                    </div>


                    <!-- BOTTOM -->

                    <div class="mt-5 flex flex-wrap items-center justify-between gap-3">

                        <div>

                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Dispatch Status
                            </p>

                            <p class="mt-1 text-sm font-semibold text-slate-700">

                                ${escapeHTML(
                formatDispatchStatus(status)
            )}

                            </p>

                        </div>


                        <div class="flex gap-2">

                            ${actionButton}

                        </div>

                    </div>

                </div>

            </div>

        `;

        return;
    }


    /*
     * ========================================================
     * NORMAL COMPLAINT VIEW
     * ========================================================
     */

    const urgency =
        normalizeUrgency(
            activeComplaint.aiUrgency
        );

    const status =
        normalizeDispatchStatus(
            activeComplaint.dispatchStatus
        );


    let statusClass =
        "bg-blue-50 text-blue-700";


    if (status === "on the way") {

        statusClass =
            "bg-indigo-50 text-indigo-700";

    }


    if (status === "arrived") {

        statusClass =
            "bg-amber-50 text-amber-700";

    }


    const urgencyClass =
        urgency === "HIGH"
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-600";


    let actionButton = "";


    if (status === "assigned") {

        actionButton = `
            <button
                type="button"
                onclick="openComplaintById(${Number(
            activeComplaint.complaintID
        )})"
                class="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700">

                Start Dispatch

            </button>
        `;

    }
    else {

        actionButton = `
            <button
                type="button"
                onclick="openComplaintById(${Number(
            activeComplaint.complaintID
        )})"
                class="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700">

                View Assignment

            </button>
        `;

    }


    container.innerHTML = `

        <div class="border-l-4 ${urgency === "HIGH"
            ? "border-red-500"
            : "border-primary-500"
        }">

            <div class="p-5">

                <div class="flex flex-wrap items-start justify-between gap-4">

                    <div>

                        <div class="flex flex-wrap items-center gap-2">

                            <span
                                class="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${urgencyClass}">

                                ${urgency === "HIGH"
            ? "HIGH PRIORITY"
            : "NORMAL"
        }

                            </span>


                            <span
                                class="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass}">

                                ${escapeHTML(
            formatDispatchStatus(status)
        )}

                            </span>

                        </div>


                        <h4 class="mt-3 text-lg font-bold text-slate-900">

                            ${escapeHTML(
            activeComplaint.aiCategory ||
            "Complaint"
        )}

                        </h4>


                        <p class="mt-1 text-xs text-slate-400">

                            Complaint #${escapeHTML(
            activeComplaint.complaintID
        )}

                        </p>

                    </div>


                    <div class="text-right">

                        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Assigned
                        </p>

                        <p class="mt-1 text-xs text-slate-600">

                            ${activeComplaint.assignedAt
            ? formatDateTime(
                activeComplaint.assignedAt
            )
            : "Recently assigned"
        }

                        </p>

                    </div>

                </div>


                <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Complaint Location
                    </p>

                    <p class="mt-1 text-sm font-semibold text-slate-800">

                        ${escapeHTML(
            activeComplaint.aiLocation ||
            "Location unavailable"
        )}

                    </p>

                </div>


                <div class="mt-5 flex flex-wrap items-center justify-between gap-3">

                    <div>

                        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Dispatch Status
                        </p>

                        <p class="mt-1 text-sm font-semibold text-slate-700">

                            ${escapeHTML(
            formatDispatchStatus(status)
        )}

                        </p>

                    </div>


                    <div class="flex gap-2">

                        ${actionButton}

                    </div>

                </div>

            </div>

        </div>

    `;

}


function getBestActiveComplaint() {

    /*
     * ========================================================
     * CURRENT COMPLAINT
     * ========================================================
     */

    const currentComplaintID =
        Number(currentUser?.currentComplaintID);

    let currentComplaint = null;

    if (currentComplaintID) {

        currentComplaint =
            complaints.find(
                complaint =>
                    Number(complaint.complaintID) === currentComplaintID &&
                    isActiveDispatch(complaint)
            );
    }


    /*
     * ========================================================
     * FALLBACK
     * ========================================================
     */

    if (!currentComplaint) {

        const active =
            complaints
                .filter(complaint =>
                    isActiveDispatch(complaint)
                )
                .sort(
                    (a, b) =>
                        new Date(a.createdAt || 0) -
                        new Date(b.createdAt || 0)
                );

        currentComplaint =
            active[0] || null;
    }


    /*
     * ========================================================
     * CHECK IF COMPLAINT BELONGS TO EMERGENCY INCIDENT
     * ========================================================
     *
     * Emergency clusters are represented as one incident.
     *
     * We attach the matching cluster to the complaint object
     * so the Active Assignment UI can use it later.
     */

    if (currentComplaint) {

        const complaintID =
            Number(currentComplaint.complaintID);

        const emergencyCluster =
            emergencyClusters.find(cluster => {

                const clusterComplaintIDs =
                    Array.isArray(cluster.complaintIDs)
                        ? cluster.complaintIDs.map(Number)
                        : [];

                return clusterComplaintIDs.includes(
                    complaintID
                );
            });

        currentComplaint.emergencyCluster =
            emergencyCluster || null;
    }


    return currentComplaint || null;
}


/* ============================================================
   OTHER ASSIGNMENTS
============================================================ */

function renderOtherAssignments() {

    const container =
        document.getElementById(
            "assignmentList"
        );


    if (!container) {
        return;
    }


    const activeComplaint =
        getBestActiveComplaint();


    const emergencyComplaintIDs =
        emergencyClusters.flatMap(cluster =>
            Array.isArray(cluster.complaintIDs)
                ? cluster.complaintIDs.map(Number)
                : []
        );


    const otherComplaints =
        complaints
            .filter(complaint => {

                // Don't show the current active assignment
                if (
                    isSameComplaint(
                        complaint,
                        activeComplaint
                    )
                ) {
                    return false;
                }


                // Only show active dispatch complaints
                if (
                    !isActiveDispatch(
                        complaint
                    )
                ) {
                    return false;
                }


                // Don't show complaints that belong
                // to an emergency incident
                const complaintID =
                    Number(complaint.complaintID);

                if (
                    emergencyComplaintIDs.includes(
                        complaintID
                    )
                ) {
                    return false;
                }


                return true;

            })
            .slice(0, 8);


    if (!otherComplaints.length) {

        container.innerHTML = `
            <div class="px-5 py-8 text-center">

                <p class="text-sm font-semibold text-slate-700">
                    No other assignments
                </p>

                <p class="mt-1 text-xs text-slate-400">
                    Other assigned complaints will appear here.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        otherComplaints
            .map(
                (complaint, index) =>
                    renderAssignmentItem(
                        complaint,
                        index
                    )
            )
            .join("");

}


/* ============================================================
   ASSIGNMENT ITEM
============================================================ */

function renderAssignmentItem(
    complaint,
    index
) {

    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );


    const urgency =
        normalizeUrgency(
            complaint.aiUrgency
        );


    let statusClass =
        "bg-slate-100 text-slate-600";


    switch (status) {

        case "assigned":

            statusClass =
                "bg-blue-50 text-blue-700";

            break;


        case "on the way":

            statusClass =
                "bg-indigo-50 text-indigo-700";

            break;


        case "arrived":

            statusClass =
                "bg-amber-50 text-amber-700";

            break;


        case "resolved":

            statusClass =
                "bg-green-50 text-green-700";

            break;


        case "unable to resolve":

            statusClass =
                "bg-red-50 text-red-700";

            break;

    }


    return `

        <button
            type="button"

            onclick="openComplaintById(${Number(
        complaint.complaintID
    )})"

            class="flex w-full items-center gap-4
                   border-b border-slate-100
                   px-5 py-4 text-left
                   transition hover:bg-slate-50">

            <div
                class="flex h-10 w-10 shrink-0
                       items-center justify-center
                       rounded-lg bg-slate-100
                       text-xs font-bold
                       text-slate-600">

                ${String(
        index + 1
    ).padStart(2, "0")}

            </div>


            <div class="min-w-0 flex-1">

                <p
                    class="truncate text-sm
                           font-semibold text-slate-800">

                    ${escapeHTML(
        complaint.aiCategory ||
        "Complaint"
    )}

                </p>


                <p
                    class="mt-1 truncate
                           text-xs text-slate-500">

                    ${escapeHTML(
        complaint.aiLocation ||
        "Location unavailable"
    )}

                </p>


                <div
                    class="mt-1 flex items-center gap-2">

                    <span
                        class="text-[10px]
                               text-slate-400">

                        #${escapeHTML(
        complaint.complaintID
    )}

                    </span>


                    ${urgency === "HIGH"
            ? `
                                <span
                                    class="text-[10px]
                                           font-bold
                                           text-red-600">

                                    HIGH

                                </span>
                              `
            : ""
        }

                </div>

            </div>


            <span
                class="shrink-0 rounded-full
                       ${statusClass}
                       px-2.5 py-1 text-[10px]
                       font-semibold">

                ${escapeHTML(
            formatDispatchStatus(
                status
            )
        )}

            </span>

        </button>

    `;

}


/* ============================================================
   COMPLAINT MODAL
============================================================ */
function openComplaintById(id) {

    console.log("Opening complaint ID:", id);
    console.log("Available complaints:", complaints);

    const complaint = complaints.find(item => {

        return String(item.complaintID).trim() === String(id).trim();

    });

    if (!complaint) {

        console.error(
            "Complaint not found.",
            {
                requestedID: id,
                availableIDs: complaints.map(
                    item => item.complaintID
                )
            }
        );

        alert(
            `Complaint #${id} could not be found in the loaded complaints.`
        );

        return;

    }

    selectedComplaint = complaint;

    populateComplaintModal(complaint);

    if (complaintModal) {

        complaintModal.classList.remove("hidden");

        lockBody();

        // Wait until the modal is visible before rendering Google Maps
        requestAnimationFrame(() => {
            setTimeout(() => {
                renderComplaintMap(complaint);
            }, 100);
        });

    }

}
function updateDispatchButtonState(
    status,
    dispatchTeamID = "",
    dispatchStatus = ""
) {
    if (!dispatchBtn) {
        return;
    }

    const normalizedStatus =
        normalizeStatus(status);

    const hasDispatchTeam =
        !isEmptyAssignmentValue(
            dispatchTeamID
        );

    const normalizedDispatchStatus =
        normalizeStatus(
            dispatchStatus
        );

    const hasActiveDispatch =
        !isEmptyAssignmentValue(
            dispatchStatus
        ) &&
        normalizedDispatchStatus !== "available";

    const canDispatch =
        normalizedStatus === "verified" &&
        !hasDispatchTeam &&
        !hasActiveDispatch;

    dispatchBtn.disabled =
        !canDispatch;

    if (canDispatch) {
        dispatchBtn.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );

        dispatchBtn.classList.add(
            "hover:bg-blue-700"
        );

        dispatchBtn.setAttribute(
            "aria-disabled",
            "false"
        );
    } else {
        dispatchBtn.classList.add(
            "opacity-50",
            "cursor-not-allowed"
        );

        dispatchBtn.classList.remove(
            "hover:bg-blue-700"
        );

        dispatchBtn.setAttribute(
            "aria-disabled",
            "true"
        );
    }
}

function openComplaintModal() {

    if (!selectedComplaint) {

        selectedComplaint =
            getBestActiveComplaint();

    }

    if (!selectedComplaint) {
        return;
    }

    populateComplaintModal(
        selectedComplaint
    );

    if (complaintModal) {

        complaintModal.classList.remove(
            "hidden"
        );

        lockBody();

        requestAnimationFrame(() => {
            setTimeout(() => {
                renderComplaintMap(selectedComplaint);
            }, 100);
        });

    }

}


function closeComplaintModal() {

    if (complaintModal) {

        complaintModal.classList.add(
            "hidden"
        );

    }


    unlockBody();

}


/* ============================================================
   POPULATE COMPLAINT
============================================================ */

function populateComplaintModal(
    complaint
) {

    setText(
        "modalComplaintID",
        `#${complaint.complaintID}`
    );


    const urgency =
        normalizeUrgency(
            complaint.aiUrgency
        );


    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );


    const urgencyElement =
        document.getElementById(
            "modalUrgency"
        );


    if (urgencyElement) {

        urgencyElement.textContent =
            urgency === "HIGH"
                ? "HIGH PRIORITY"
                : "NORMAL";


        urgencyElement.className =
            urgency === "HIGH"
                ? "rounded-md bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700"
                : "rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600";

    }


    setText(
        "modalStatus",
        formatDispatchStatus(
            status
        )
    );


    setText(
        "modalCategory",
        complaint.aiCategory ||
        "Uncategorized"
    );


    setText(
        "modalCreatedAt",
        complaint.createdAt
            ? `Reported ${formatDateTime(
                complaint.createdAt
            )}`
            : "Date unavailable"
    );


    setText(
        "modalDescription",
        complaint.rawComplaintText ||
        "No description provided."
    );


    setText(
        "modalLocation",
        complaint.aiLocation ||
        "Location unavailable"
    );



    renderCitizen(
        complaint
    );


    renderTimeline(
        complaint
    );


    updateActionButtons(
        complaint
    );

}


/* ============================================================
   CITIZEN
============================================================ */

function renderCitizen(
    complaint
) {

    const name =
        complaint.citizenName ||
        complaint.fullName ||
        "Citizen";


    setText(
        "citizenName",
        name
    );


    setText(
        "citizenInitials",
        getInitials(name)
    );

}


/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline(
    complaint
) {

    const container =
        document.getElementById(
            "dispatchTimeline"
        );


    if (!container) {
        return;
    }


    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );


    const steps = [

        {
            key: "assigned",
            label: "Assigned",
            time: complaint.assignedAt
        },

        {
            key: "on the way",
            label: "On the Way",
            time: complaint.onTheWayAt
        },

        {
            key: "arrived",
            label: "Arrived",
            time: complaint.arrivedAt
        },

        {
            key: "resolved",
            label: "Resolved",
            time: complaint.completedAt
        }

    ];


    const order = {

        "assigned": 0,

        "on the way": 1,

        "arrived": 2,

        "resolved": 3,

        "unable to resolve": 3

    };


    const currentOrder =
        order[status] ?? -1;


    container.innerHTML =
        steps
            .map(
                (step, index) => {

                    const stepOrder =
                        order[step.key];


                    const completed =
                        currentOrder >=
                        stepOrder;


                    const current =
                        status === step.key;


                    const circleClass =
                        completed
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 text-slate-400";


                    const line =
                        index <
                            steps.length - 1
                            ? `
                                <div
                                    class="ml-4 h-6
                                           border-l
                                           border-slate-200">
                                </div>
                              `
                            : "";


                    return `

                        <div>

                            <div
                                class="flex items-start gap-3">

                                <div
                                    class="flex h-8 w-8
                                           shrink-0
                                           items-center
                                           justify-center
                                           rounded-full
                                           text-xs font-bold
                                           ${circleClass}">

                                    ${completed
                            ? "✓"
                            : index + 1
                        }

                                </div>


                                <div class="flex-1">

                                    <p
                                        class="text-sm
                                               font-semibold
                                               ${current
                            ? "text-primary-700"
                            : completed
                                ? "text-slate-700"
                                : "text-slate-400"
                        }">

                                        ${step.label}

                                    </p>


                                    ${step.time
                            ? `
                                                <p
                                                    class="mt-0.5
                                                           text-[10px]
                                                           text-slate-400">

                                                    ${formatDateTime(
                                step.time
                            )}

                                                </p>
                                              `
                            : ""
                        }

                                </div>

                            </div>

                            ${line}

                        </div>

                    `;

                }
            )
            .join("");


    if (
        status ===
        "unable to resolve"
    ) {

        container.innerHTML += `

            <div
                class="mt-3 rounded-xl
                       border border-red-200
                       bg-red-50 p-3">

                <p
                    class="text-xs font-semibold
                           text-red-700">

                    Unable to Resolve

                </p>

            </div>

        `;

    }

}
/* ============================================================
   DISPATCH TEAM MARKER - CUSTOM PNG ICON
============================================================ */

function updateDispatchTeamMarker(
    latitude,
    longitude
) {

    if (!complaintMap) {
        console.warn(
            "Cannot display dispatch marker: map not initialized."
        );
        return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        console.warn(
            "Invalid dispatch coordinates:",
            latitude,
            longitude
        );
        return;
    }

    const position = {
        lat: lat,
        lng: lng
    };

    // Reuse the existing marker and update its GPS position.
    if (dispatchTeamMarker) {

        dispatchTeamMarker.setPosition(position);
        dispatchTeamMarker.setMap(complaintMap);

        return;
    }

    // Create the dispatch team marker using your PNG.
    dispatchTeamMarker = new google.maps.Marker({

        position: position,

        map: complaintMap,

        title: "Dispatch Team",

        icon: {
            url: "/Complaint/assets/dispatch.webp",
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        },

        zIndex: 1000

    });

}
function restoreDispatchTeamMarker(complaint) {

    if (!complaint) {
        console.warn(
            "Cannot restore dispatch marker: no complaint."
        );
        return;
    }

    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );

    /*
     * Show the Dispatch Team marker only when:
     *
     * On the Way
     * Arrived
     */

    const shouldShow =
        status === "on the way" ||
        status === "arrived";


    if (!shouldShow) {

        if (dispatchTeamMarker) {

            dispatchTeamMarker.setMap(null);

        }

        return;

    }


    /*
     * Use the GPS position loaded from the database.
     */

    if (
        lastRouteLatitude === null ||
        lastRouteLongitude === null
    ) {

        console.warn(
            "Cannot restore dispatch marker: no saved GPS location."
        );

        return;

    }


    const latitude =
        Number(lastRouteLatitude);

    const longitude =
        Number(lastRouteLongitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.warn(
            "Invalid saved dispatch GPS:",
            latitude,
            longitude
        );

        return;

    }


    console.log(
        "Restoring Dispatch Team marker:",
        latitude,
        longitude
    );


    /*
     * ONLY restore the marker here.
     */

    updateDispatchTeamMarker(
        latitude,
        longitude
    );

}
/* ============================================================
   DISPATCH TEAM GPS TRACKING
============================================================ */

function startDispatchLocationTracking() {

    if (!navigator.geolocation) {

        alert(
            "GPS location is not supported by this browser."
        );

        return;
    }

    if (dispatchLocationWatcher !== null) {

        console.log(
            "Dispatch GPS tracking is already active."
        );

        return;
    }

    /*
     * We need an active complaint before
     * we can draw a route.
     */

    if (!selectedComplaint) {

        console.warn(
            "GPS tracking started without a selected complaint."
        );

    }

    console.log(
        "Starting dispatch GPS tracking..."
    );

    dispatchLocationActive = true;

    dispatchLocationWatcher =
        navigator.geolocation.watchPosition(

            position => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;


                console.log(
                    "Dispatch GPS:",
                    {
                        latitude,
                        longitude,
                        accuracy
                    }
                );


                /*
                 * Save GPS position to database.
                 */

                updateTeamLocation(
                    latitude,
                    longitude,
                    accuracy
                );


                /*
                 * Update grey dispatch marker.
                 */

                updateDispatchTeamMarker(
                    latitude,
                    longitude
                );


                /*
                 * Recalculate route only when
                 * the team has moved approximately
                 * 30 meters.
                 */

                if (
                    currentComplaintLocation &&
                    shouldRecalculateRoute(
                        latitude,
                        longitude
                    )
                ) {

                    console.log(
                        "Recalculating route to complaint..."
                    );

                    drawRouteToComplaint(
                        latitude,
                        longitude
                    );


                    lastRouteLatitude =
                        latitude;

                    lastRouteLongitude =
                        longitude;

                }

            },


            error => {

                console.error(
                    "Dispatch GPS Error:",
                    error
                );


                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        alert(
                            "Location permission was denied. Please allow location access for the dispatch tracking system."
                        );

                        break;


                    case error.POSITION_UNAVAILABLE:

                        console.warn(
                            "Dispatch GPS location unavailable."
                        );

                        break;


                    case error.TIMEOUT:

                        console.warn(
                            "Dispatch GPS request timed out."
                        );

                        break;

                }

            },


            {

                enableHighAccuracy: true,

                maximumAge: 5000,

                timeout: 10000

            }

        );

}
async function updateTeamLocation(
    latitude,
    longitude,
    accuracy
) {

    try {

        const response =
            await fetch(
                "updateTeamLocation.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    cache: "no-store",

                    body: JSON.stringify({

                        latitude:
                            latitude,

                        longitude:
                            longitude,

                        accuracy:
                            accuracy

                    })

                }
            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            console.error(
                "Invalid GPS response:",
                responseText
            );

            return;

        }


        if (!data.success) {

            console.warn(
                "GPS update failed:",
                data.message
            );

            return;

        }


        console.log(
            "GPS location saved."
        );

    }
    catch (error) {

        console.error(
            "GPS update error:",
            error
        );

    }

}
function stopDispatchLocationTracking() {

    if (
        dispatchLocationWatcher !== null
    ) {

        navigator.geolocation.clearWatch(
            dispatchLocationWatcher
        );

        dispatchLocationWatcher =
            null;

    }


    dispatchLocationActive =
        false;


    console.log(
        "Dispatch GPS tracking stopped."
    );

}
/* ============================================================
   ROUTE RECALCULATION DISTANCE
============================================================ */

function shouldRecalculateRoute(
    latitude,
    longitude
) {

    /*
     * First GPS location:
     * always calculate route.
     */

    if (
        lastRouteLatitude === null ||
        lastRouteLongitude === null
    ) {

        return true;

    }

    const distance =
        calculateDistanceMeters(
            lastRouteLatitude,
            lastRouteLongitude,
            latitude,
            longitude
        );

    /*
     * Recalculate after approximately
     * 30 meters of movement.
     */

    return distance >= 30;

}
/* ============================================================
   DISTANCE CALCULATION
============================================================ */

function calculateDistanceMeters(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {

    const earthRadius = 6371000;

    const lat1 =
        latitude1 *
        Math.PI /
        180;

    const lat2 =
        latitude2 *
        Math.PI /
        180;

    const deltaLat =
        (latitude2 - latitude1) *
        Math.PI /
        180;

    const deltaLng =
        (longitude2 - longitude1) *
        Math.PI /
        180;

    const a =
        Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +

        Math.cos(lat1) *
        Math.cos(lat2) *

        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;

}


/* ============================================================
   ACTION BUTTONS
============================================================ */

function updateActionButtons(
    complaint
) {

    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );


    const onWayButton =
        document.getElementById(
            "onWayButton"
        );


    const arrivedButton =
        document.getElementById(
            "arrivedButton"
        );


    const resolveButton =
        document.getElementById(
            "resolveButton"
        );


    const assistanceButton =
        document.getElementById(
            "assistanceButton"
        );


    const unableButton =
        document.getElementById(
            "unableButton"
        );


    hideButton(onWayButton);
    hideButton(arrivedButton);
    hideButton(resolveButton);
    hideButton(assistanceButton);
    hideButton(unableButton);


    if (
        status === "assigned"
    ) {

        showButton(
            onWayButton
        );

        showButton(
            assistanceButton
        );

        showButton(
            unableButton
        );

        return;

    }


    if (
        status === "on the way"
    ) {

        showButton(
            arrivedButton
        );

        showButton(
            assistanceButton
        );

        showButton(
            unableButton
        );

        return;

    }


    if (
        status === "arrived"
    ) {

        showButton(
            resolveButton
        );

        showButton(
            assistanceButton
        );

        showButton(
            unableButton
        );

    }

}

/* ============================================================
   MARK ON THE WAY
============================================================ */

async function markOnTheWay() {

    if (!selectedComplaint) {
        alert("No complaint selected.");
        return;
    }

    const confirmed = confirm(
        `Start dispatch for complaint #${selectedComplaint.complaintID}?`
    );

    if (!confirmed) {
        return;
    }

    const complaintID = Number(
        selectedComplaint.complaintID
    );

    const success = await updateComplaintStatus(
        complaintID,
        "On the Way"
    );

    if (success) {

        // Stop and close the emergency alert immediately.
        closeEmergencyDispatchAlert();

        // Prevent the same active emergency from
        // reopening the alert during dashboard refresh.
        emergencyDispatchAlertShown = true;

        console.log(
            "Dispatch started. Emergency alert closed."
        );

        // Start GPS tracking after dispatch begins.
        startDispatchLocationTracking();

    }
}



/* ============================================================
   MARK ARRIVED
============================================================ */

async function markArrived() {

    console.log("=== MARK ARRIVED CLICKED ===");
    console.log("Selected complaint:", selectedComplaint);

    if (!selectedComplaint) {

        alert("No complaint selected.");

        return;

    }

    const complaintID =
        Number(selectedComplaint.complaintID);

    if (!complaintID) {

        alert("Invalid complaint ID.");

        console.error(
            "Invalid complaint ID:",
            selectedComplaint.complaintID
        );

        return;

    }

    const currentStatus =
        normalizeDispatchStatus(
            selectedComplaint.dispatchStatus
        );

    console.log("Complaint ID:", complaintID);
    console.log("Current status:", currentStatus);

    /*
     * Mark Arrived is only valid when the complaint
     * is currently On the Way.
     */

    if (currentStatus !== "on the way") {

        alert(
            `This complaint cannot be marked as arrived.\n\nCurrent status: ${formatDispatchStatus(currentStatus)}`
        );

        console.warn(
            "Invalid status for Arrived:",
            currentStatus
        );

        return;

    }

    const confirmed =
        confirm(
            `Mark complaint #${complaintID} as arrived at the location?`
        );

    if (!confirmed) {
        return;
    }

    console.log(
        "Sending Arrived status for complaint:",
        complaintID
    );

    const success =
        await updateComplaintStatus(
            complaintID,
            "Arrived"
        );

    console.log(
        "Arrived update result:",
        success
    );

    if (!success) {

        console.error(
            "Failed to mark complaint as Arrived."
        );

        return;

    }

    stopDispatchLocationTracking();

    /*
     * IMPORTANT:
     *
     * updateDispatchStatus.php already creates
     * the dispatch log.
     *
     * Do NOT call createDispatchLog() here.
     */

    console.log(
        `Complaint #${complaintID} successfully marked as Arrived.`
    );

}


/* ============================================================
   UPDATE STATUS
============================================================ */

async function updateComplaintStatus(
    complaintID,
    status
) {

    console.log(
        "Updating complaint status:",
        {
            complaintID,
            status
        }
    );

    try {

        const response =
            await fetch(
                "updateDispatchStatus.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    cache: "no-store",

                    body: JSON.stringify({

                        complaintID:
                            Number(complaintID),

                        status:
                            status

                    })

                }
            );


        console.log(
            "HTTP status:",
            response.status
        );


        /*
         * Read the response as text first.
         *
         * This makes PHP errors visible instead of
         * immediately failing at response.json().
         */

        const responseText =
            await response.text();


        console.log(
            "Server response:",
            responseText
        );


        if (!response.ok) {

            console.error(
                "HTTP error:",
                response.status,
                responseText
            );

            alert(
                `Server error (${response.status}).\n\n${responseText}`
            );

            return false;

        }


        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (jsonError) {

            console.error(
                "Invalid JSON returned by PHP:",
                responseText
            );

            alert(
                "The server returned an invalid response. Check the browser console."
            );

            return false;

        }


        console.log(
            "Parsed server response:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "Unable to update complaint."
            );

            return false;

        }


        /*
         * Reload dashboard data so the new status
         * is reflected everywhere.
         */

        await loadDispatchDashboard();


        /*
         * Re-select the same complaint from the
         * freshly loaded data.
         */

        selectedComplaint =
            complaints.find(
                complaint =>
                    Number(
                        complaint.complaintID
                    ) ===
                    Number(
                        complaintID
                    )
            ) || null;


        console.log(
            "Updated complaint:",
            selectedComplaint
        );


        /*
         * Keep the complaint modal updated.
         */

        if (selectedComplaint) {

            populateComplaintModal(
                selectedComplaint
            );

        }


        return true;

    }
    catch (error) {

        console.error(
            "Status Update Error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

        return false;

    }

}

/* ============================================================
   RESOLVE
============================================================ */

function openResolveModal() {

    if (!selectedComplaint) {

        alert(
            "No complaint selected."
        );

        return;

    }


    setText(
        "resolveComplaintID",
        `Complaint #${selectedComplaint.complaintID}`
    );


    if (resolveModal) {

        resolveModal.classList.remove(
            "hidden"
        );

        lockBody();

    }

}


function closeResolveModal() {

    if (resolveModal) {

        resolveModal.classList.add(
            "hidden"
        );

    }


    unlockBody();

}


async function confirmResolve() {

    if (!selectedComplaint) {
        return;
    }


    const noteElement =
        document.getElementById(
            "resolutionNote"
        );


    const note =
        noteElement
            ? noteElement.value.trim()
            : "";


    if (!note) {

        alert(
            "Please enter a resolution note."
        );

        return;

    }


    await resolveComplaint(
        selectedComplaint.complaintID,
        note
    );

}


async function resolveComplaint(
    complaintID,
    resolutionNote
) {

    try {

        const formData =
            new FormData();

        formData.append(
            "complaintID",
            complaintID
        );

        formData.append(
            "resolutionNote",
            resolutionNote
        );


        const evidence =
            document.getElementById(
                "resolutionEvidence"
            );


        if (
            evidence &&
            evidence.files &&
            evidence.files[0]
        ) {

            formData.append(
                "resolutionEvidence",
                evidence.files[0]
            );

        }


        const response =
            await fetch(
                "../Complaints/resolveComplaint.php",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const responseText =
            await response.text();


        console.log(
            "Resolve response:",
            responseText
        );


        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (jsonError) {

            console.error(
                "Invalid JSON from resolveComplaint.php:",
                responseText
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }


        if (!data.success) {

            alert(
                data.message ||
                "Unable to resolve complaint."
            );

            return false;

        }


        /*
         * resolveComplaint.php already:
         *
         * 1. Updates complaint status
         * 2. Sets completedAt
         * 3. Saves evidence
         * 4. Creates dispatch log
         *
         * Therefore createDispatchLog() is NOT needed here.
         */


        resetResolutionForm();

        closeResolveModal();

        closeComplaintModal();


        await loadDispatchDashboard();


        alert(
            "Complaint successfully resolved."
        );


        return true;

    }
    catch (error) {

        console.error(
            "Resolve Error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to the server."
        );


        return false;

    }

}

/* ============================================================
   RESET RESOLUTION FORM
============================================================ */

function resetResolutionForm() {

    const note =
        document.getElementById(
            "resolutionNote"
        );


    if (note) {
        note.value = "";
    }


    const evidence =
        document.getElementById(
            "resolutionEvidence"
        );


    if (evidence) {
        evidence.value = "";
    }


    setText(
        "resolutionFileName",
        ""
    );

}


/* ============================================================
   EVIDENCE UPLOAD
============================================================ */

function setupEvidenceUpload() {

    const input =
        document.getElementById(
            "resolutionEvidence"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];


            setText(
                "resolutionFileName",
                file
                    ? file.name
                    : ""
            );

        }
    );

}

/* ============================================================
   UNABLE TO RESOLVE
============================================================ */

function openUnableModal() {

    if (!selectedComplaint) {

        alert(
            "No complaint selected."
        );

        return;

    }


    setText(
        "unableComplaintID",
        `Complaint #${selectedComplaint.complaintID}`
    );


    if (unableModal) {

        unableModal.classList.remove(
            "hidden"
        );

        lockBody();

    }

}


function closeUnableModal() {

    if (unableModal) {

        unableModal.classList.add(
            "hidden"
        );

    }


    unlockBody();

}


async function submitUnableRequest() {

    if (!selectedComplaint) {
        alert("No complaint selected.");
        return;
    }


    const selected =
        document.querySelector(
            'input[name="unableReason"]:checked'
        );


    if (!selected) {
        alert("Please select a reason.");
        return;
    }


    const detailsElement =
        document.getElementById(
            "unableDetails"
        );


    const details =
        detailsElement
            ? detailsElement.value.trim()
            : "";


    try {

        const response =
            await fetch(
                "../Complaints/unableToResolve.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        complaintID:
                            selectedComplaint.complaintID,

                        reason:
                            selected.value,

                        details:
                            details

                    })
                }
            );


        /*
         * Read raw response first.
         */

        const responseText =
            await response.text();


        console.log(
            "unableToResolve.php response:",
            responseText
        );


        /*
         * HTTP error
         */

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}: ${responseText}`
            );

        }


        /*
         * Parse JSON manually
         */

        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (jsonError) {

            console.error(
                "Invalid JSON from unableToResolve.php:",
                responseText
            );

            throw new Error(
                "Server returned invalid JSON. Check the console."
            );

        }


        /*
         * PHP returned success=false
         */

        if (!data.success) {

            alert(
                data.message ||
                "Unable to submit request."
            );

            return;

        }


        /*
         * SUCCESS
         *
         * PHP already:
         * - updated complaint
         * - created dispatch log
         * - freed dispatch team
         */


        closeUnableModal();

        closeComplaintModal();


        await loadDispatchDashboard();


        alert(
            "Complaint marked as unable to resolve."
        );

    }
    catch (error) {

        console.error(
            "Unable Error:",
            error
        );


        alert(
            error.message ||
            "Unable to connect to the server."
        );

    }

}


/* ============================================================
   ACCOUNT
============================================================ */

function openAccountModal() {

    renderAccount();


    if (accountModal) {

        accountModal.classList.remove(
            "hidden"
        );

        lockBody();

    }

}


function closeAccountModal() {

    if (accountModal) {

        accountModal.classList.add(
            "hidden"
        );

    }


    unlockBody();

}


function renderAccount() {

    if (!currentUser) {
        return;
    }


    const name =
        currentUser.teamName ||
        currentUser.teamLeader ||
        "Dispatch Team";


    setText(
        "accountName",
        name
    );


    setText(
        "accountEmail",
        currentUser.email ||
        "Unavailable"
    );


    setText(
        "accountDepartment",
        currentUser.department ||
        "Not assigned"
    );


    setText(
        "accountInitials",
        getInitials(name)
    );

}


/* ============================================================
   NOTIFICATIONS
============================================================ */

function openNotifications() {

    alert(
        "Notifications will be available here."
    );

}


/* ============================================================
   CHANGE PASSWORD
============================================================ */

function openChangePassword() {

    alert(
        "Change Password will be available here."
    );

}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutUser() {

    // Stop GPS tracking before logout
    stopDispatchLocationTracking();

    try {

        const response =
            await fetch(
                "../Cores/logout.php",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (data.success) {

            window.location.replace(
                "../Cores/login.html"
            );

        }
        else {

            alert(
                data.message ||
                "Unable to log out."
            );

        }

    }
    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

        window.location.replace(
            "../Cores/login.html"
        );

    }

}

/* ============================================================
   NAVIGATION
============================================================ */

function switchTab(tab) {

    const homeNav =
        document.getElementById(
            "homeNav"
        );


    const tasksNav =
        document.getElementById(
            "tasksNav"
        );


    if (
        tab === "home"
    ) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        if (homeNav) {

            homeNav.className =
                "text-xs font-semibold text-primary-600";

        }


        if (tasksNav) {

            tasksNav.className =
                "text-xs font-medium text-slate-400";

        }

        return;

    }


    if (
        tab === "tasks"
    ) {

        const assignmentList =
            document.getElementById(
                "assignmentList"
            );


        if (assignmentList) {

            assignmentList.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        if (homeNav) {

            homeNav.className =
                "text-xs font-medium text-slate-400";

        }


        if (tasksNav) {

            tasksNav.className =
                "text-xs font-semibold text-primary-600";

        }

    }

}


/* ============================================================
   MODALS
============================================================ */

function setupModalEvents() {

    [
        complaintModal,
        resolveModal,
        unableModal,
        accountModal
    ]
        .forEach(
            modal => {

                if (!modal) {
                    return;
                }


                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            modal.classList.add(
                                "hidden"
                            );


                            unlockBody();

                        }

                    }
                );

            }
        );

}


function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            [
                complaintModal,
                resolveModal,
                unableModal,
                accountModal
            ]
                .forEach(
                    modal => {

                        if (modal) {

                            modal.classList.add(
                                "hidden"
                            );

                        }

                    }
                );


            unlockBody();

        }
    );

}


/* ============================================================
   BODY LOCK
============================================================ */

function lockBody() {

    document.body.classList.add(
        "overflow-hidden"
    );

}


function unlockBody() {

    const modals = [

        complaintModal,
        resolveModal,
        unableModal,
        accountModal

    ];


    const open =
        modals.some(
            modal =>
                modal &&
                !modal.classList.contains(
                    "hidden"
                )
        );


    if (!open) {

        document.body.classList.remove(
            "overflow-hidden"
        );

    }

}


/* ============================================================
   ACTIVE PRIORITY UI
============================================================ */

function updateActivePriorityStyle(
    urgency
) {

    const container =
        document.getElementById(
            "activePriorityContainer"
        );


    if (!container) {
        return;
    }


    container.classList.remove(
        "border-red-500",
        "border-primary-500",
        "border-slate-300"
    );


    container.classList.add(
        urgency === "HIGH"
            ? "border-red-500"
            : "border-primary-500"
    );


    const badge =
        document.getElementById(
            "activeUrgency"
        );


    if (badge) {

        badge.className =
            urgency === "HIGH"

                ? "inline-flex rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700"

                : "inline-flex rounded-md bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-700";

    }

}
/* ============================================================
   STATUS HELPERS
============================================================ */

function normalizeDispatchStatus(status) {

    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


function formatDispatchStatus(status) {

    const normalized =
        normalizeDispatchStatus(status);

    switch (normalized) {

        case "assigned":
            return "Assigned";

        case "on the way":
            return "On the Way";

        case "arrived":
            return "Arrived";

        case "resolved":
            return "Resolved";

        case "unable to resolve":
            return "Unable to Resolve";

        default:
            return status || "Unknown";

    }

}


function normalizeUrgency(urgency) {

    return String(urgency || "NORMAL")
        .trim()
        .toUpperCase();

}


function isActiveDispatch(complaint) {

    if (!complaint) {
        return false;
    }

    const status =
        normalizeDispatchStatus(
            complaint.dispatchStatus
        );

    return [
        "assigned",
        "on the way",
        "arrived"
    ].includes(status);

}


/* ============================================================
   UI HELPERS
============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


function showButton(
    button
) {

    if (!button) {
        return;
    }


    button.classList.remove(
        "hidden"
    );

}


function hideButton(
    button
) {

    if (!button) {
        return;
    }


    button.classList.add(
        "hidden"
    );

}


function isSameComplaint(
    a,
    b
) {

    if (!a || !b) {
        return false;
    }


    return Number(
        a.complaintID
    ) === Number(
        b.complaintID
    );

}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDateTime(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* ============================================================
   HTML ESCAPING
============================================================ */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
// ============================================================
// AUTO REFRESH DISPATCH DASHBOARD
// ============================================================

setInterval(() => {

    console.log("🔄 Auto-refreshing dispatch dashboard...");

    loadDispatchDashboard();

}, 30 * 1000);