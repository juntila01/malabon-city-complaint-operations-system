(() => {
    "use strict";

    // ============================================================
    // GLOBAL STATE
    // ============================================================

    let notificationRefreshTimer = null;
    let currentComplaintId = null;

    // Verification camera state
    let verificationCameraStream = null;
    let verificationCapturedFile = null;
    let verificationPreviewObjectURL = null;

    // Verification browser-history state
    // Only ONE verification modal is used.
    //
    // Possible values:
    // null
    // "camera"
    // "preview"
    let verificationHistoryState = null;
    let verificationHistoryGoingBack = false;


    // ============================================================
    // SMALL DOM HELPERS
    // ============================================================

    const $ = (id) => document.getElementById(id);

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = value ?? "";
        }
    }

    function showElement(id, displayClass = null) {
        const element = $(id);

        if (!element) {
            return;
        }

        element.classList.remove("hidden");

        if (displayClass) {
            element.classList.add(displayClass);
        }
    }

    function hideElement(id) {
        const element = $(id);

        if (!element) {
            return;
        }

        element.classList.add("hidden");
    }

    // ============================================================
    // MANUAL REVIEW MESSAGE
    // ============================================================

    function showManualReviewMessage(
        message,
        isError = false
    ) {

        if (!manualReviewMessage) {
            alert(message);
            return;
        }

        manualReviewMessage.textContent = message;

        manualReviewMessage.classList.remove(
            "hidden",
            "text-red-600",
            "text-green-700"
        );

        manualReviewMessage.classList.add(
            isError
                ? "text-red-600"
                : "text-green-700"
        );

    }


    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        const div = document.createElement("div");
        div.textContent = String(value);

        return div.innerHTML;
    }


    // ============================================================
    // BODY SCROLL
    // ============================================================

    function lockBodyScroll() {
        document.body.classList.add("overflow-hidden");
    }

    function unlockBodyScrollIfNoModalOpen() {
        const modalIds = [
            "verificationModal",
            "complaintModal",
            "responseModal"
        ];

        const hasOpenModal = modalIds.some((id) => {
            const element = $(id);

            return (
                element &&
                !element.classList.contains("hidden")
            );
        });

        if (!hasOpenModal) {
            document.body.classList.remove("overflow-hidden");
        }
    }


    // ============================================================
    // DATE / TIME HELPERS
    // ============================================================

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Unknown";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }


    function formatNotificationTime(dateValue) {
        if (!dateValue) {
            return "";
        }

        const value = String(dateValue).trim();
        let date;

        /*
         * MySQL DATETIME format:
         * YYYY-MM-DD HH:mm:ss
         *
         * Treat this as Philippine local time,
         * without applying an additional UTC+8 offset.
         */
        const mysqlDateTimePattern =
            /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

        const match = value.match(mysqlDateTimePattern);

        if (match) {
            const [, year, month, day, hour, minute, second] = match;

            // Parse the stored date components explicitly.
            // This avoids browser-dependent string parsing.
            date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute),
                Number(second)
            );
        } else {
            date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute && diff >= 0) {
            return "Just now";
        }

        if (diff < hour && diff >= 0) {
            return `${Math.floor(diff / minute)}m ago`;
        }

        if (diff < day && diff >= 0) {
            return `${Math.floor(diff / hour)}h ago`;
        }

        if (diff < 7 * day && diff >= 0) {
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
    // GOOGLE LANDMARK HELPERS
    // ============================================================

    function extractGooglePlaceName(place) {
        if (!place) {
            return "";
        }

        return (
            place.displayName ||
            place.name ||
            place.formattedAddress ||
            ""
        );
    }

    function looksLikeGenericAddress(value) {
        if (!value) {
            return true;
        }

        const text = String(value)
            .trim()
            .toLowerCase();

        if (!text) {
            return true;
        }

        const genericPatterns = [
            "philippines",
            "malabon",
            "metro manila",
            "national capital region",
            "caloocan",
            "quezon city",
            "manila"
        ];

        return (
            genericPatterns.includes(text) ||
            text.length < 4
        );
    }

    function normalizeLandmarkName(value) {
        if (!value) {
            return "";
        }

        let text = String(value).trim();

        text = text.replace(/^near\s+/i, "");

        text = text.replace(
            /,\s*(Malabon|Caloocan|Manila|Quezon City).*$/i,
            ""
        );

        return text.trim();
    }


    // ============================================================
    // GOOGLE NEARBY LANDMARK
    // ============================================================

    async function findNearbyLandmark(latitude, longitude) {
        const landmarkElement = $("modalLandmark");

        if (!landmarkElement) {
            return;
        }

        landmarkElement.textContent =
            "Looking for nearby landmark...";

        if (
            latitude === null ||
            latitude === undefined ||
            longitude === null ||
            longitude === undefined
        ) {
            landmarkElement.textContent =
                "No landmark information available.";

            return;
        }

        try {
            if (
                !window.google ||
                !google.maps ||
                !google.maps.places ||
                !google.maps.places.Place
            ) {
                landmarkElement.textContent =
                    "Nearby landmark information is unavailable.";

                return;
            }

            const center = new google.maps.LatLng(
                Number(latitude),
                Number(longitude)
            );

            const request = {
                fields: [
                    "displayName",
                    "formattedAddress",
                    "location",
                    "types"
                ],

                locationRestriction: {
                    center,
                    radius: 500
                },

                includedPrimaryTypes: [
                    "school",
                    "hospital",
                    "church",
                    "mosque",
                    "police_station",
                    "fire_station",
                    "shopping_mall",
                    "supermarket",
                    "park",
                    "government_office",
                    "library",
                    "restaurant",
                    "store",
                    "local_government_office"
                ],

                maxResultCount: 5
            };

            const result =
                await google.maps.places.Place.searchNearby(request);

            const places = result?.places || [];

            if (!places.length) {
                landmarkElement.textContent =
                    "No nearby landmark found.";

                return;
            }

            let selectedPlace = null;

            for (const place of places) {
                const name = extractGooglePlaceName(place);

                if (!name) {
                    continue;
                }

                if (!looksLikeGenericAddress(name)) {
                    selectedPlace = place;
                    break;
                }
            }

            if (!selectedPlace) {
                selectedPlace = places[0];
            }

            let landmarkName = normalizeLandmarkName(
                extractGooglePlaceName(selectedPlace)
            );

            if (!landmarkName) {
                landmarkName =
                    "No nearby landmark found.";
            }

            landmarkElement.textContent =
                landmarkName;

        } catch (error) {
            console.warn(
                "Unable to find nearby landmark:",
                error
            );

            landmarkElement.textContent =
                "Nearby landmark information is unavailable.";
        }
    }


    // ============================================================
    // COMPLAINT MEDIA
    // ============================================================

    function resetComplaintMedia() {
        const image = $("modalComplaintImage");
        const video = $("modalComplaintVideo");
        const videoContainer = $("modalVideoContainer");

        if (image) {
            image.src = "";
            image.classList.add("hidden");
        }

        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
        }

        if (videoContainer) {
            videoContainer.classList.add("hidden");
        }
    }

    function showComplaintImage(src) {
        const image = $("modalComplaintImage");

        if (!image || !src) {
            return;
        }

        image.src = src;
        image.classList.remove("hidden");
    }

    function showComplaintVideo(src) {
        const video = $("modalComplaintVideo");
        const container = $("modalVideoContainer");

        if (!video || !container || !src) {
            return;
        }

        video.src = src;
        container.classList.remove("hidden");
    }

    function getAttachmentType(filePath) {
        if (!filePath) {
            return null;
        }

        const cleanPath = String(filePath)
            .split("?")[0]
            .split("#")[0]
            .toLowerCase();

        const extension = cleanPath.split(".").pop();

        const imageExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "bmp"
        ];

        const videoExtensions = [
            "mp4",
            "webm",
            "ogg",
            "mov",
            "m4v"
        ];

        if (imageExtensions.includes(extension)) {
            return "image";
        }

        if (videoExtensions.includes(extension)) {
            return "video";
        }

        return null;
    }


    // ============================================================
    // VIEW COMPLAINT
    // ============================================================

    async function viewComplaint(id) {
        if (!id) {
            console.warn(
                "viewComplaint() called without complaint ID."
            );

            return;
        }

        const modal = $("complaintModal");

        if (!modal) {
            console.warn(
                "complaintModal was not found."
            );

            return;
        }

        currentComplaintId = id;

        setText("modalCategory", "Loading...");
        setText("modalStatus", "Loading...");
        setText("modalUrgency", "Loading...");
        setText(
            "modalDescription",
            "Loading complaint details..."
        );
        setText("modalLocation", "Loading...");
        setText(
            "modalLandmark",
            "Looking for nearby landmark..."
        );
        setText("modalDate", "Loading...");

        resetComplaintMedia();

        modal.classList.remove("hidden");
        modal.classList.add("flex");

        lockBodyScroll();

        try {
            const response = await fetch(
                `/Complaint/Citizens/get_community_complaints.php?id=${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Complaint details:",
                data
            );

            const complaint =
                data?.complaint ||
                data?.data ||
                data;

            if (
                data?.success === false ||
                !complaint
            ) {
                throw new Error(
                    data?.message ||
                    "Complaint details could not be loaded."
                );
            }

            setText(
                "modalCategory",
                complaint.category ||
                complaint.complaintCategory ||
                "Complaint Details"
            );

            setText(
                "modalStatus",
                complaint.status ||
                complaint.complaintStatus ||
                "Unknown"
            );

            setText(
                "modalUrgency",
                complaint.urgency ||
                complaint.priority ||
                complaint.urgencyLevel ||
                "Unknown"
            );

            setText(
                "modalDescription",
                complaint.description ||
                complaint.complaintDescription ||
                "No description provided."
            );

            setText(
                "modalLocation",
                complaint.location ||
                complaint.address ||
                complaint.complaintLocation ||
                "Unknown"
            );

            setText(
                "modalDate",
                formatDate(
                    complaint.created_at ||
                    complaint.createdAt ||
                    complaint.date_submitted ||
                    complaint.submitted_at ||
                    complaint.date
                )
            );

            const attachment =
                complaint.file_path ||
                complaint.filePath ||
                complaint.attachment ||
                complaint.attachment_path ||
                complaint.media ||
                complaint.image ||
                complaint.image_path ||
                complaint.video ||
                complaint.video_path;

            const attachmentType =
                getAttachmentType(attachment);

            if (attachmentType === "image") {
                showComplaintImage(attachment);
            }

            if (attachmentType === "video") {
                showComplaintVideo(attachment);
            }

            if (
                complaint.attachment_type === "image" &&
                attachment
            ) {
                showComplaintImage(attachment);
            }

            if (
                complaint.attachment_type === "video" &&
                attachment
            ) {
                showComplaintVideo(attachment);
            }

            const latitude =
                complaint.latitude ??
                complaint.lat ??
                complaint.location_latitude ??
                complaint.locationLatitude;

            const longitude =
                complaint.longitude ??
                complaint.lng ??
                complaint.location_longitude ??
                complaint.locationLongitude;

            if (
                latitude !== null &&
                latitude !== undefined &&
                longitude !== null &&
                longitude !== undefined
            ) {
                findNearbyLandmark(
                    latitude,
                    longitude
                );
            } else {
                setText(
                    "modalLandmark",
                    "No nearby landmark information available."
                );
            }

        } catch (error) {
            console.error(
                "Error loading complaint:",
                error
            );

            setText(
                "modalCategory",
                "Unable to Load Complaint"
            );

            setText(
                "modalDescription",
                error.message ||
                "Something went wrong while loading the complaint."
            );

            setText(
                "modalStatus",
                "Unavailable"
            );

            setText(
                "modalUrgency",
                "Unavailable"
            );

            setText(
                "modalLocation",
                "Unavailable"
            );

            setText(
                "modalLandmark",
                "Unavailable"
            );

            setText(
                "modalDate",
                "Unavailable"
            );
        }
    }

    window.viewComplaint = viewComplaint;


    // ============================================================
    // CLOSE COMPLAINT MODAL
    // ============================================================

    function closeComplaintModal() {
        const modal = $("complaintModal");

        if (!modal) {
            return;
        }

        modal.classList.add("hidden");
        modal.classList.remove("flex");

        resetComplaintMedia();

        currentComplaintId = null;

        unlockBodyScrollIfNoModalOpen();
    }

    window.closeComplaintModal =
        closeComplaintModal;


    // ============================================================
    // SINGLE VERIFICATION MODAL
    //
    // IMPORTANT:
    // There is ONLY ONE verification modal.
    //
    // verificationModal = the actual modal
    //
    // verificationCameraView = camera area INSIDE that modal
    //
    // There is NO:
    // verificationCameraModal
    // verificationPreviewModal
    // ============================================================

    function toggleVerificationModal(show) {
        const modal = $("verificationModal");

        if (!modal) {
            return;
        }

        if (show) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");

            lockBodyScroll();

            hideVerificationCameraError();

            return;
        }

        resetVerificationInterface();

        modal.classList.add("hidden");
        modal.classList.remove("flex");

        unlockBodyScrollIfNoModalOpen();
    }

    window.toggleVerificationModal =
        toggleVerificationModal;


    // ============================================================
    // VERIFICATION HISTORY
    // ============================================================

    function pushVerificationHistory(type) {
        if (verificationHistoryState === type) {
            return;
        }

        try {
            verificationHistoryGoingBack = false;

            if (verificationHistoryState) {
                window.history.replaceState(
                    {
                        ...(window.history.state || {}),
                        citizenVerification: type
                    },
                    "",
                    window.location.href
                );
            } else {
                window.history.pushState(
                    {
                        ...(window.history.state || {}),
                        citizenVerification: type
                    },
                    "",
                    window.location.href
                );
            }

            verificationHistoryState = type;

        } catch (error) {
            console.warn(
                "Unable to create verification history state:",
                error
            );
        }
    }

    function goBackFromVerificationHistory() {
        if (!verificationHistoryState) {
            return;
        }

        if (verificationHistoryGoingBack) {
            return;
        }

        verificationHistoryGoingBack = true;

        try {
            window.history.back();

        } catch (error) {
            console.warn(
                "Unable to restore browser history:",
                error
            );

            verificationHistoryGoingBack = false;
            verificationHistoryState = null;
        }
    }


    // ============================================================
    // CAMERA PLACEHOLDER CLEANUP
    // ============================================================

    function removeOldCameraPlaceholder() {
        const placeholder =
            $("verificationCameraPlaceholder");

        if (placeholder) {
            placeholder.remove();
        }

        const status =
            $("verificationCameraStatus");

        if (status) {
            status.remove();
        }

        const statusText =
            $("verificationCameraStatusText");

        if (statusText) {
            statusText.remove();
        }
    }


    // ============================================================
    // CAMERA ERROR
    // ============================================================

    function showVerificationCameraError(message) {
        const errorElement =
            $("verificationCameraError");

        const errorText =
            $("verificationCameraErrorText");

        if (errorElement) {
            errorElement.classList.remove("hidden");
        }

        if (errorText) {
            errorText.textContent =
                message ||
                "Unable to access the camera.";
        }
    }

    function hideVerificationCameraError() {
        const errorElement =
            $("verificationCameraError");

        if (errorElement) {
            errorElement.classList.add("hidden");
        }
    }


    // ============================================================
    // OPEN CAMERA
    //
    // CAMERA-ONLY FLOW
    //
    // verificationModal remains the ONLY modal.
    //
    // The upload/preview box is the trigger.
    //
    // No file picker is opened.
    // No second modal is created.
    // ============================================================

    async function openVerificationCamera() {
        const modal = $("verificationModal");
        const cameraView = $("verificationCameraView");
        const video = $("verificationCameraVideo");
        const captureButton = $("verificationCaptureBtn");

        if (
            !modal ||
            !cameraView ||
            !video ||
            !captureButton
        ) {
            console.warn(
                "Verification camera elements were not found."
            );
            return;
        }

        if (
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
            showVerificationCameraError(
                "Camera access is not available on this device or browser."
            );
            return;
        }

        // Always stop any previous camera first.
        stopVerificationCamera();

        // Keep the verification modal open underneath.
        modal.classList.remove("hidden");
        modal.classList.add("flex");

        // Show the separate full-screen camera.
        cameraView.classList.remove("hidden");
        cameraView.setAttribute("aria-hidden", "false");

        lockBodyScroll();

        // Capture starts disabled until video is actually ready.
        captureButton.disabled = true;
        captureButton.classList.add(
            "opacity-50",
            "cursor-not-allowed"
        );

        hideVerificationCameraError();

        pushVerificationHistory("camera");

        try {
            let stream = null;

            // --------------------------------------------------------
            // TRY REAR CAMERA
            // --------------------------------------------------------

            try {
                stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: {
                                ideal: "environment"
                            },
                            width: {
                                ideal: 1920
                            },
                            height: {
                                ideal: 1080
                            }
                        },
                        audio: false
                    });

            } catch (rearCameraError) {
                console.warn(
                    "Rear camera failed. Trying default camera.",
                    rearCameraError
                );

                // ----------------------------------------------------
                // FALLBACK TO ANY AVAILABLE CAMERA
                // ----------------------------------------------------

                stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });
            }

            if (!stream) {
                throw new Error(
                    "No camera stream was returned."
                );
            }

            const videoTracks =
                stream.getVideoTracks();

            if (!videoTracks.length) {
                stream.getTracks().forEach(
                    track => {
                        try {
                            track.stop();
                        } catch (error) {
                            // Ignore cleanup errors.
                        }
                    }
                );

                throw new Error(
                    "No usable camera was found."
                );
            }

            verificationCameraStream = stream;

            // --------------------------------------------------------
            // ATTACH CAMERA
            // --------------------------------------------------------

            video.srcObject =
                verificationCameraStream;

            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;

            // Some browsers need loadedmetadata before
            // videoWidth/videoHeight becomes available.
            await new Promise(resolve => {
                if (
                    video.readyState >= 1 &&
                    video.videoWidth > 0 &&
                    video.videoHeight > 0
                ) {
                    resolve();
                    return;
                }

                const handleMetadata = () => {
                    video.removeEventListener(
                        "loadedmetadata",
                        handleMetadata
                    );

                    resolve();
                };

                video.addEventListener(
                    "loadedmetadata",
                    handleMetadata,
                    {
                        once: true
                    }
                );

                // Safety fallback.
                setTimeout(() => {
                    video.removeEventListener(
                        "loadedmetadata",
                        handleMetadata
                    );

                    resolve();
                }, 3000);
            });

            await video.play();

            video.classList.remove("hidden");

            // --------------------------------------------------------
            // CAMERA IS READY
            // --------------------------------------------------------

            captureButton.disabled = false;

            captureButton.classList.remove(
                "opacity-50",
                "cursor-not-allowed"
            );

        } catch (error) {

            console.error(
                "Verification camera error:",
                error
            );

            stopVerificationCamera();

            cameraView.classList.add("hidden");
            cameraView.setAttribute(
                "aria-hidden",
                "true"
            );

            if (
                verificationHistoryState === "camera"
            ) {
                verificationHistoryState = null;
                verificationHistoryGoingBack = false;
            }

            if (
                error &&
                (
                    error.name === "NotAllowedError" ||
                    error.name === "PermissionDeniedError"
                )
            ) {

                showVerificationCameraError(
                    "Camera permission was denied. Please allow camera access in your browser settings and try again."
                );

            } else if (
                error &&
                error.name === "NotFoundError"
            ) {

                showVerificationCameraError(
                    "No camera was found on this device."
                );

            } else if (
                error &&
                error.name === "NotReadableError"
            ) {

                showVerificationCameraError(
                    "The camera is currently being used by another application."
                );

            } else if (
                error &&
                error.name === "SecurityError"
            ) {

                showVerificationCameraError(
                    "Camera access is blocked by the browser. Please make sure this page is using HTTPS and allow camera access."
                );

            } else {

                showVerificationCameraError(
                    "Unable to access the camera. Please allow camera permission and try again."
                );
            }
        }
    }

    window.openVerificationCamera =
        openVerificationCamera;


    // ============================================================
    // COMPATIBILITY
    // ============================================================

    function startVerificationCamera() {
        return openVerificationCamera();
    }

    window.startVerificationCamera =
        startVerificationCamera;


    // ============================================================
    // CAPTURE IMAGE
    // ============================================================

    function captureVerificationDocument() {
        const video =
            $("verificationCameraVideo");

        const canvas =
            $("verificationCaptureCanvas");

        const captureButton =
            $("verificationCaptureBtn");

        if (
            !video ||
            !canvas
        ) {
            console.warn(
                "Verification camera capture elements were not found."
            );

            return;
        }

        if (
            !verificationCameraStream
        ) {
            console.warn(
                "Verification camera stream is not active."
            );

            return;
        }

        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            showVerificationCameraError(
                "The camera is still starting. Please wait a moment and try again."
            );

            return;
        }

        // Prevent double capture.
        if (captureButton) {
            captureButton.disabled = true;

            captureButton.classList.add(
                "opacity-50",
                "cursor-not-allowed"
            );
        }

        const width =
            video.videoWidth;

        const height =
            video.videoHeight;

        canvas.width =
            width;

        canvas.height =
            height;

        const context =
            canvas.getContext("2d");

        if (!context) {
            if (captureButton) {
                captureButton.disabled = false;

                captureButton.classList.remove(
                    "opacity-50",
                    "cursor-not-allowed"
                );
            }

            return;
        }

        context.clearRect(
            0,
            0,
            width,
            height
        );

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        // First attempt: high-quality JPEG.
        canvas.toBlob(
            function (blob) {

                if (!blob) {
                    if (captureButton) {
                        captureButton.disabled = false;

                        captureButton.classList.remove(
                            "opacity-50",
                            "cursor-not-allowed"
                        );
                    }

                    showVerificationCameraError(
                        "The photo could not be captured. Please try again."
                    );

                    return;
                }

                // Already within PHP's 5 MB limit.
                if (
                    blob.size <=
                    5 * 1024 * 1024
                ) {

                    finishVerificationCapture(
                        blob
                    );

                    return;
                }

                // Compress if too large.
                canvas.toBlob(
                    function (smallerBlob) {

                        if (!smallerBlob) {

                            if (captureButton) {
                                captureButton.disabled = false;

                                captureButton.classList.remove(
                                    "opacity-50",
                                    "cursor-not-allowed"
                                );
                            }

                            showVerificationCameraError(
                                "The captured image is too large. Please try again."
                            );

                            return;
                        }

                        if (
                            smallerBlob.size >
                            5 * 1024 * 1024
                        ) {

                            // One final lower-quality attempt.
                            canvas.toBlob(
                                function (finalBlob) {

                                    if (
                                        !finalBlob ||
                                        finalBlob.size >
                                        5 * 1024 * 1024
                                    ) {

                                        if (captureButton) {
                                            captureButton.disabled = false;

                                            captureButton.classList.remove(
                                                "opacity-50",
                                                "cursor-not-allowed"
                                            );
                                        }

                                        showVerificationCameraError(
                                            "The captured image is too large. Please move slightly farther away and try again."
                                        );

                                        return;
                                    }

                                    finishVerificationCapture(
                                        finalBlob
                                    );

                                },
                                "image/jpeg",
                                0.55
                            );

                            return;
                        }

                        finishVerificationCapture(
                            smallerBlob
                        );

                    },
                    "image/jpeg",
                    0.72
                );

            },
            "image/jpeg",
            0.90
        );
    }

    window.captureVerificationDocument =
        captureVerificationDocument;


    // ============================================================
    // FINISH CAPTURE
    //
    // SAME verificationModal.
    //
    // Camera view is hidden.
    // Upload box becomes the preview.
    //
    // NO verificationPreviewModal.
    // ============================================================

    function finishVerificationCapture(blob) {
        const modal =
            $("verificationModal");

        const cameraView =
            $("verificationCameraView");

        const previewImage =
            $("verificationPreviewImage");

        const previewOverlay =
            $("verificationPreviewOverlay");

        const previewPlaceholder =
            $("verificationUploadPlaceholder");

        const removeButton =
            $("verificationRemovePreviewBtn");

        const fileInfo =
            $("verificationFileInfo");

        const fileSizeRow =
            $("verificationFileSizeRow");

        const fileNameDisplay =
            $("verificationFileNameDisplay");

        const captureSize =
            $("verificationCaptureSize");

        const fileInput =
            $("verificationFileInput");

        if (!blob) {
            return;
        }

        const fileName =
            `Valid_ID_${Date.now()}.jpg`;

        verificationCapturedFile =
            new File(
                [blob],
                fileName,
                {
                    type: "image/jpeg",
                    lastModified: Date.now()
                }
            );

        // --------------------------------------------------------
        // PUT CAMERA FILE INTO EXISTING PHP FILE INPUT
        // --------------------------------------------------------

        if (fileInput) {
            try {
                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(
                    verificationCapturedFile
                );

                fileInput.files =
                    dataTransfer.files;

            } catch (error) {

                console.error(
                    "Unable to attach captured image to file input:",
                    error
                );
            }
        }

        // --------------------------------------------------------
        // REMOVE OLD OBJECT URL
        // --------------------------------------------------------

        if (
            verificationPreviewObjectURL
        ) {
            URL.revokeObjectURL(
                verificationPreviewObjectURL
            );

            verificationPreviewObjectURL =
                null;
        }

        // --------------------------------------------------------
        // CREATE PREVIEW URL
        // --------------------------------------------------------

        verificationPreviewObjectURL =
            URL.createObjectURL(
                verificationCapturedFile
            );

        // --------------------------------------------------------
        // SHOW IMAGE
        // --------------------------------------------------------

        if (previewImage) {

            previewImage.src =
                verificationPreviewObjectURL;

            previewImage.classList.remove(
                "hidden"
            );

            // Keep the entire document visible.
            previewImage.style.objectFit =
                "contain";

            previewImage.style.objectPosition =
                "center";
        }

        // --------------------------------------------------------
        // HIDE PLACEHOLDER
        // --------------------------------------------------------

        if (previewPlaceholder) {
            previewPlaceholder.classList.add(
                "hidden"
            );
        }

        // --------------------------------------------------------
        // SHOW PREVIEW OVERLAY
        // --------------------------------------------------------

        if (previewOverlay) {
            previewOverlay.classList.remove(
                "hidden"
            );
        }

        // --------------------------------------------------------
        // SHOW REMOVE BUTTON
        // --------------------------------------------------------

        if (removeButton) {
            removeButton.classList.remove(
                "hidden"
            );

            removeButton.style.display =
                "flex";
        }

        // --------------------------------------------------------
        // SHOW FILE INFORMATION
        // --------------------------------------------------------

        if (fileInfo) {
            fileInfo.classList.remove(
                "hidden"
            );
        }

        if (fileSizeRow) {
            fileSizeRow.classList.remove(
                "hidden"
            );
        }

        // --------------------------------------------------------
        // FILE NAME
        // --------------------------------------------------------

        if (fileNameDisplay) {
            fileNameDisplay.textContent =
                fileName;
        }

        // --------------------------------------------------------
        // FILE SIZE
        // --------------------------------------------------------

        if (captureSize) {

            const sizeKB =
                (
                    verificationCapturedFile.size /
                    1024
                ).toFixed(1);

            captureSize.textContent =
                `${sizeKB} KB`;
        }

        // --------------------------------------------------------
        // STOP CAMERA
        // --------------------------------------------------------

        stopVerificationCamera();

        // --------------------------------------------------------
        // HIDE FULL-SCREEN CAMERA
        // --------------------------------------------------------

        if (cameraView) {
            cameraView.classList.add(
                "hidden"
            );

            cameraView.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        // --------------------------------------------------------
        // KEEP VERIFICATION MODAL OPEN
        // --------------------------------------------------------

        if (modal) {
            modal.classList.remove(
                "hidden"
            );

            modal.classList.add(
                "flex"
            );
        }

        // --------------------------------------------------------
        // HISTORY = PREVIEW
        // --------------------------------------------------------

        try {

            window.history.replaceState(
                {
                    ...(window.history.state || {}),
                    citizenVerification: "preview"
                },
                "",
                window.location.href
            );

            verificationHistoryState =
                "preview";

            verificationHistoryGoingBack =
                false;

        } catch (error) {

            console.warn(
                "Unable to update verification history:",
                error
            );

            verificationHistoryState =
                "preview";
        }

        lockBodyScroll();

        // IMPORTANT:
        // User specifically wants Submit Verification
        // visible but DISABLED for now.
        setSubmitButtonState(false);
    }


    // ============================================================
    // CLOSE CAMERA
    //
    // Returns to the upload/preview area of the SAME modal.
    // ============================================================

    function closeVerificationCamera(
        event,
        fromHistory = false
    ) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        stopVerificationCamera();

        const cameraView =
            $("verificationCameraView");

        if (cameraView) {
            cameraView.classList.add(
                "hidden"
            );
        }

        if (fromHistory) {
            verificationHistoryState = null;
            verificationHistoryGoingBack = false;

            showVerificationUploadContent();

            return false;
        }

        if (
            verificationHistoryState === "camera"
        ) {
            goBackFromVerificationHistory();
        } else {
            verificationHistoryState = null;
        }

        showVerificationUploadContent();

        return false;
    }

    window.closeVerificationCamera =
        closeVerificationCamera;


    // ============================================================
    // SHOW UPLOAD / PREVIEW CONTENT
    //
    // SAME verificationModal.
    //
    // If a captured image exists:
    //     show preview
    //
    // If no captured image exists:
    //     show camera placeholder
    // ============================================================

    function showVerificationUploadContent() {
        const modal =
            $("verificationModal");

        const cameraView =
            $("verificationCameraView");

        const previewImage =
            $("verificationPreviewImage");

        const previewOverlay =
            $("verificationPreviewOverlay");

        const previewPlaceholder =
            $("verificationUploadPlaceholder");

        const removeButton =
            $("verificationRemovePreviewBtn");

        const fileInfo =
            $("verificationFileInfo");

        const fileSizeRow =
            $("verificationFileSizeRow");

        if (cameraView) {
            cameraView.classList.add(
                "hidden"
            );

            cameraView.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        // --------------------------------------------------------
        // CAPTURE EXISTS
        // --------------------------------------------------------

        if (verificationCapturedFile) {

            if (previewImage) {

                previewImage.src =
                    verificationPreviewObjectURL || "";

                previewImage.classList.remove(
                    "hidden"
                );

                previewImage.style.objectFit =
                    "contain";

                previewImage.style.objectPosition =
                    "center";
            }

            if (previewPlaceholder) {
                previewPlaceholder.classList.add(
                    "hidden"
                );
            }

            if (previewOverlay) {
                previewOverlay.classList.remove(
                    "hidden"
                );
            }

            if (removeButton) {
                removeButton.classList.remove(
                    "hidden"
                );

                removeButton.style.display =
                    "flex";
            }

            if (fileInfo) {
                fileInfo.classList.remove(
                    "hidden"
                );
            }

            if (fileSizeRow) {
                fileSizeRow.classList.remove(
                    "hidden"
                );
            }

            // Keep submit visible but disabled.
            setSubmitButtonState(false);

        } else {

            // ----------------------------------------------------
            // NO CAPTURE
            // ----------------------------------------------------

            if (previewImage) {
                previewImage.src = "";

                previewImage.classList.add(
                    "hidden"
                );
            }

            if (previewPlaceholder) {
                previewPlaceholder.classList.remove(
                    "hidden"
                );
            }

            if (previewOverlay) {
                previewOverlay.classList.add(
                    "hidden"
                );
            }

            if (removeButton) {
                removeButton.classList.add(
                    "hidden"
                );
            }

            if (fileInfo) {
                fileInfo.classList.add(
                    "hidden"
                );
            }

            if (fileSizeRow) {
                fileSizeRow.classList.add(
                    "hidden"
                );
            }

            // Still visible, still disabled.
            setSubmitButtonState(false);
        }

        // --------------------------------------------------------
        // KEEP VERIFICATION MODAL OPEN
        // --------------------------------------------------------

        if (modal) {
            modal.classList.remove(
                "hidden"
            );

            modal.classList.add(
                "flex"
            );
        }

        lockBodyScroll();
    }


    // ============================================================
    // STOP CAMERA
    // ============================================================

    function stopVerificationCamera() {
        const video =
            $("verificationCameraVideo");

        const cameraView =
            $("verificationCameraView");

        if (verificationCameraStream) {

            const tracks =
                verificationCameraStream.getTracks();

            tracks.forEach(
                track => {
                    try {
                        track.stop();
                    } catch (error) {
                        console.warn(
                            "Unable to stop camera track:",
                            error
                        );
                    }
                }
            );

            verificationCameraStream =
                null;
        }

        if (video) {

            try {
                video.pause();
            } catch (error) {
                // Ignore.
            }

            video.srcObject =
                null;

            video.removeAttribute(
                "src"
            );
        }

        if (cameraView) {
            cameraView.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    }

    window.stopVerificationCamera =
        stopVerificationCamera;

    // ============================================================
    // DISCARD CAPTURED IMAGE
    //
    // X BUTTON
    //
    // This removes the captured image and returns to the
    // camera placeholder.
    // ============================================================

    function discardVerificationCapture(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        stopVerificationCamera();

        if (verificationPreviewObjectURL) {
            URL.revokeObjectURL(
                verificationPreviewObjectURL
            );

            verificationPreviewObjectURL =
                null;
        }

        verificationCapturedFile =
            null;

        const previewImage =
            $("verificationPreviewImage");

        const previewOverlay =
            $("verificationPreviewOverlay");

        const previewPlaceholder =
            $("verificationUploadPlaceholder");

        const removeButton =
            $("verificationRemovePreviewBtn");

        if (previewImage) {
            previewImage.src = "";

            previewImage.classList.add(
                "hidden"
            );
        }

        if (previewOverlay) {
            previewOverlay.classList.add(
                "hidden"
            );
        }

        if (previewPlaceholder) {
            previewPlaceholder.classList.remove(
                "hidden"
            );
        }

        if (removeButton) {
            removeButton.classList.add(
                "hidden"
            );
        }

        setText(
            "verificationFileNameDisplay",
            "Barangay Clearance"
        );

        setText(
            "verificationCaptureSize",
            ""
        );

        setSubmitButtonState(false);

        verificationHistoryState = null;
        verificationHistoryGoingBack = false;

        showVerificationUploadContent();

        return false;
    }

    window.discardVerificationCapture =
        discardVerificationCapture;


    // ============================================================
    // CLOSE PREVIEW
    //
    // This only changes the visible state.
    // It does NOT delete the captured image.
    // ============================================================

    function closeVerificationPreview(
        event,
        fromHistory = false
    ) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (fromHistory) {
            verificationHistoryState = null;
            verificationHistoryGoingBack = false;

            showVerificationUploadContent();

            return false;
        }

        if (
            verificationHistoryState === "preview"
        ) {
            goBackFromVerificationHistory();
        } else {
            verificationHistoryState = null;
        }

        showVerificationUploadContent();

        return false;
    }

    window.closeVerificationPreview =
        closeVerificationPreview;


    // ============================================================
    // SUBMIT BUTTON STATE
    // ============================================================

    function setSubmitButtonState(enabled) {
        const submitButton =
            $("verificationSubmitBtn");

        if (!submitButton) {
            return;
        }

        /*
         * The button is always visually enabled.
         *
         * handleFormSubmission() itself checks whether
         * verificationCapturedFile exists before allowing
         * the form to submit.
         */

        submitButton.disabled = false;

        submitButton.classList.remove(
            "bg-slate-100",
            "bg-slate-200",
            "text-slate-400",
            "cursor-not-allowed",
            "bg-blue-600",
            "hover:bg-blue-700",
            "text-white",
            "cursor-pointer"
        );

        submitButton.classList.add(
            "bg-blue-600",
            "hover:bg-blue-700",
            "text-white",
            "cursor-pointer"
        );
    }

    window.setSubmitButtonState =
        setSubmitButtonState;


    // ============================================================
    // RESET VERIFICATION
    // ============================================================

    function resetVerificationInterface() {
        stopVerificationCamera();

        verificationHistoryState = null;
        verificationHistoryGoingBack = false;

        verificationCapturedFile =
            null;

        if (verificationPreviewObjectURL) {
            URL.revokeObjectURL(
                verificationPreviewObjectURL
            );

            verificationPreviewObjectURL =
                null;
        }

        const previewImage =
            $("verificationPreviewImage");

        const previewOverlay =
            $("verificationPreviewOverlay");

        const previewPlaceholder =
            $("verificationUploadPlaceholder");

        const removeButton =
            $("verificationRemovePreviewBtn");

        const fileNameDisplay =
            $("verificationFileNameDisplay");

        const captureSize =
            $("verificationCaptureSize");

        const cameraView =
            $("verificationCameraView");

        const form =
            $("uploadDocForm");

        // --------------------------------------------------------
        // RESET PREVIEW
        // --------------------------------------------------------

        if (previewImage) {
            previewImage.src = "";

            previewImage.classList.add(
                "hidden"
            );
        }

        if (previewOverlay) {
            previewOverlay.classList.add(
                "hidden"
            );
        }

        if (previewPlaceholder) {
            previewPlaceholder.classList.remove(
                "hidden"
            );
        }

        if (removeButton) {
            removeButton.classList.add(
                "hidden"
            );
        }

        // --------------------------------------------------------
        // RESET FILE INFORMATION
        // --------------------------------------------------------

        if (fileNameDisplay) {
            fileNameDisplay.textContent =
                "Barangay Clearance";
        }

        if (captureSize) {
            captureSize.textContent = "";
        }

        // --------------------------------------------------------
        // HIDE CAMERA VIEW
        // --------------------------------------------------------

        if (cameraView) {
            cameraView.classList.add(
                "hidden"
            );
        }

        // --------------------------------------------------------
        // RESET FORM
        // --------------------------------------------------------

        if (form) {
            form.reset();

            form.querySelectorAll(
                'input[data-camera-upload="1"], input[data-camera-marker="1"]'
            ).forEach(
                element => element.remove()
            );
        }

        setSubmitButtonState(false);
    }


    function resetForm(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        resetVerificationInterface();

        const uploadModal =
            $("verificationModal");

        if (uploadModal) {
            uploadModal.classList.add(
                "hidden"
            );

            uploadModal.classList.remove(
                "flex"
            );
        }

        unlockBodyScrollIfNoModalOpen();

        return false;
    }

    window.resetForm =
        resetForm;


    // ============================================================
    // FORM SUBMISSION
    // ============================================================

    async function handleFormSubmission(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!verificationCapturedFile) {
            return false;
        }

        const form = $("uploadDocForm");

        if (!form) {
            return false;
        }

        form.querySelectorAll(
            'input[data-camera-upload="1"], input[data-camera-marker="1"]'
        ).forEach(element => element.remove());

        let fileInput = $("verificationFileInput");

        if (!fileInput || fileInput.form !== form) {
            fileInput = document.createElement("input");

            fileInput.type = "file";
            fileInput.name = "Valid_ID";
            fileInput.classList.add("hidden");
            fileInput.dataset.cameraUpload = "1";

            form.appendChild(fileInput);
        }

        try {

            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(
                verificationCapturedFile
            );

            fileInput.files = dataTransfer.files;

        } catch (error) {

            console.error(
                "Unable to prepare captured file:",
                error
            );

            return false;
        }


        // =========================================================
        // CAMERA MARKER
        // =========================================================

        let cameraMarker = form.querySelector(
            'input[name="camera_capture"]'
        );

        if (!cameraMarker) {

            cameraMarker = document.createElement("input");

            cameraMarker.type = "hidden";
            cameraMarker.name = "camera_capture";
            cameraMarker.dataset.cameraMarker = "1";

            form.appendChild(cameraMarker);
        }

        cameraMarker.value = "1";


        // =========================================================
        // SUBMIT USING FETCH
        // =========================================================

        const formData = new FormData(form);


        // Optional loading state
        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {
            submitButton.disabled = true;
        }


        try {

            const response = await fetch(
                form.action,
                {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                }
            );


            const contentType =
                response.headers.get("content-type") || "";


            // =====================================================
            // JSON RESPONSE
            // =====================================================

            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                const result =
                    await response.json();


                if (!response.ok || result.success === false) {

                    showVerificationErrorModal(
                        result.message ||
                        "The captured document could not be verified."
                    );

                    return false;
                }


                // =================================================
                // SUCCESS
                // =================================================

                if (result.success === true) {

                    window.location.href =
                        "citizen.php?upload=success";

                    return false;
                }
            }


            // =====================================================
            // NON-JSON SUCCESS RESPONSE
            // =====================================================

            if (response.ok) {

                window.location.href =
                    "citizen.php?upload=success";

                return false;
            }


            showVerificationErrorModal(
                "The verification could not be completed. Please try again."
            );


        } catch (error) {

            console.error(
                "Verification submission error:",
                error
            );

            showVerificationErrorModal(
                "Unable to connect to the verification service. Please try again."
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }
        }


        return false;
    }

    window.handleFormSubmission = handleFormSubmission;


    function showVerificationErrorModal(message) {

        // Remove an existing error modal first
        const existingModal = document.getElementById(
            "verificationErrorModal"
        );

        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement("div");

        modal.id = "verificationErrorModal";

        modal.className =
            "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center " +
            "bg-black/50 backdrop-blur-[2px] px-3 sm:px-4 py-3 sm:py-6";

        modal.innerHTML = `
        <div
            id="verificationErrorCard"
            class="
                w-full max-w-md
                bg-white
                rounded-[24px]
                shadow-2xl
                overflow-hidden
                transform
                transition-all
                duration-200
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="verificationErrorTitle"
        >

            <!-- ================================
                 TOP
                 ================================= -->

            <div class="relative px-5 pt-6 pb-3 sm:px-6 sm:pt-7">

                <!-- Close -->
                <button
                    type="button"
                    id="verificationErrorCloseBtn"
                    class="
                        absolute
                        top-4
                        right-4
                        w-9
                        h-9
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-gray-400
                        hover:text-gray-600
                        hover:bg-gray-100
                        active:bg-gray-200
                        transition
                    "
                    aria-label="Close"
                >
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>


                <!-- Warning Icon -->
                <div class="flex justify-center mb-4">

                    <div
                        class="
                            w-16
                            h-16
                            rounded-full
                            bg-red-50
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <div
                            class="
                                w-11
                                h-11
                                rounded-full
                                bg-red-100
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <i
                                class="
                                    fa-solid
                                    fa-triangle-exclamation
                                    text-red-500
                                    text-xl
                                "
                            ></i>
                        </div>
                    </div>

                </div>


                <!-- Title -->
                <h2
                    id="verificationErrorTitle"
                    class="
                        text-center
                        text-xl
                        sm:text-2xl
                        font-bold
                        text-gray-900
                    "
                >
                    Valid ID Not Accepted
                </h2>


                <!-- Subtitle -->
                <p
                    class="
                        mt-2
                        text-center
                        text-sm
                        leading-5
                        text-gray-500
                        px-2
                    "
                >
                    We couldn't verify this image as a valid ID.
                </p>

            </div>


            <!-- ================================
                 MESSAGE
                 ================================= -->

            <div class="px-5 sm:px-6">

                <div
                    class="
                        rounded-2xl
                        bg-gray-50
                        border
                        border-gray-100
                        p-4
                    "
                >

                    <p
                        id="verificationErrorMessage"
                        class="
                            text-sm
                            leading-6
                            text-gray-600
                        "
                    ></p>

                </div>

            </div>


            <!-- ================================
                 WHAT TO DO
                 ================================= -->

            <div class="px-5 sm:px-6 pt-4">

                <p
                    class="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-400
                        mb-3
                    "
                >
                    Please try again
                </p>


                <div class="space-y-3">

                    <!-- Item 1 -->
                    <div class="flex items-start gap-3">

                        <div
                            class="
                                flex-shrink-0
                                w-7
                                h-7
                                rounded-full
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                text-xs
                                font-semibold
                            "
                        >
                            1
                        </div>

                        <p
                            class="
                                text-sm
                                leading-5
                                text-gray-600
                                pt-1
                            "
                        >
                            Capture the <span class="font-medium text-gray-800">
                                entire ID.
                            </span>.
                        </p>

                    </div>


                    <!-- Item 2 -->
                    <div class="flex items-start gap-3">

                        <div
                            class="
                                flex-shrink-0
                                w-7
                                h-7
                                rounded-full
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                text-xs
                                font-semibold
                            "
                        >
                            2
                        </div>

                        <p
                            class="
                                text-sm
                                leading-5
                                text-gray-600
                                pt-1
                            "
                        >
                            Make sure your name, photo, and
                            <span class="font-medium text-gray-800">
                                ID details
                            </span>
                            are clearly readable.
                        </p>

                    </div>


                    <!-- Item 3 -->
                    <div class="flex items-start gap-3">

                        <div
                            class="
                                flex-shrink-0
                                w-7
                                h-7
                                rounded-full
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                text-xs
                                font-semibold
                            "
                        >
                            3
                        </div>

                        <p
                            class="
                                text-sm
                                leading-5
                                text-gray-600
                                pt-1
                            "
                        >
                            Avoid glare, blur, shadows, or
                            <span class="font-medium text-gray-800">
                                cropped edges
                            </span>.
                        </p>

                    </div>

                </div>

            </div>


            <!-- ================================
                 ACTION
                 ================================= -->

            <div class="px-5 sm:px-6 pt-5 pb-5 sm:pb-6">

                <button
                    type="button"
                    id="verificationErrorTryAgainBtn"
                    class="
                        w-full
                        h-12
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-700
                        active:bg-blue-800
                        text-white
                        text-sm
                        font-semibold
                        shadow-sm
                        transition
                        flex
                        items-center
                        justify-center
                        gap-2
                    "
                >
                    <i class="fa-solid fa-camera text-sm"></i>
                    Try Again
                </button>

            </div>

        </div>
    `;


        document.body.appendChild(modal);


        // ============================================
        // SET MESSAGE
        // ============================================

        const messageElement = document.getElementById(
            "verificationErrorMessage"
        );

        if (messageElement) {

            messageElement.textContent =
                message ||
                "The captured image does not appear to be a valid ID. Please capture a clear photo of your valid ID.";
        }


        // ============================================
        // CLOSE FUNCTION
        // ============================================

        function closeErrorModal() {

            modal.classList.add("opacity-0");

            const card = document.getElementById(
                "verificationErrorCard"
            );

            if (card) {
                card.classList.add("translate-y-3");
            }

            setTimeout(function () {

                if (modal && modal.parentNode) {
                    modal.remove();
                }

                unlockBodyScrollIfNoModalOpen();

            }, 180);
        }


        // ============================================
        // TRY AGAIN
        // ============================================

        const tryAgainButton = document.getElementById(
            "verificationErrorTryAgainBtn"
        );

        if (tryAgainButton) {

            tryAgainButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeErrorModal();

                    // Re-open the verification camera
                    setTimeout(function () {

                        const verificationModal =
                            $("verificationModal");

                        if (verificationModal) {

                            verificationModal.classList.remove(
                                "hidden"
                            );

                            verificationModal.classList.add(
                                "flex"
                            );

                        }

                        // Reset the verification interface
                        resetVerificationInterface();

                        // Open camera again
                        setTimeout(function () {

                            initializeVerificationCamera();

                            const uploadBox =
                                $("verificationUploadBox");

                            if (uploadBox) {
                                uploadBox.click();
                            }

                        }, 100);

                    }, 200);
                }
            );
        }


        // ============================================
        // CLOSE BUTTON
        // ============================================

        const closeButton = document.getElementById(
            "verificationErrorCloseBtn"
        );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeErrorModal();

                }
            );
        }


        // ============================================
        // BACKDROP CLICK
        // ============================================

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
                    closeErrorModal();
                }

            }
        );


        // ============================================
        // ESCAPE KEY
        // ============================================

        function handleEscape(event) {

            if (event.key === "Escape") {

                event.preventDefault();

                closeErrorModal();

                document.removeEventListener(
                    "keydown",
                    handleEscape
                );
            }

        }

        document.addEventListener(
            "keydown",
            handleEscape
        );


        // ============================================
        // MOBILE BODY LOCK
        // ============================================

        document.body.classList.add("overflow-hidden");
    }


    // ============================================================
    // PROFILE
    // ============================================================

    function updateCitizenGreeting(fullName) {
        const greeting =
            $("citizenGreeting");

        if (!greeting) {
            return;
        }

        const cleanName =
            String(fullName || "").trim();

        const firstName =
            cleanName
                ? cleanName.split(/\s+/)[0]
                : "Citizen";

        greeting.innerHTML =
            `Hello, ${escapeHTML(firstName)}! ` +
            `<span class="inline-block" aria-hidden="true">👋</span>`;
    }

    async function loadCitizenProfileImage() {
        try {
            const response = await fetch(
                "/Complaint/Citizens/get_citizenProfile.php",
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Profile request failed: ${response.status}`
                );
            }

            const data = await response.json();

            console.log(
                "Citizen profile:",
                data
            );

            if (
                !data.success ||
                !data.data
            ) {
                console.warn(
                    "Citizen profile could not be loaded."
                );

                return;
            }

            const profile = data.data;

            if (profile.fullName) {
                const fullName =
                    profile.fullName.trim();

                const firstName =
                    fullName.split(/\s+/)[0];

                setText(
                    "navUserName",
                    firstName
                );

                updateCitizenGreeting(
                    fullName
                );
            }

            const profileImage =
                profile.profileImage;

            const avatar =
                $("userAvatar");

            if (
                avatar &&
                profileImage
            ) {
                avatar.src = profileImage;
            }

        } catch (error) {
            console.error(
                "Error loading citizen profile:",
                error
            );
        }
    }


    // ============================================================
    // PROFILE DROPDOWN
    // ============================================================

    function initializeProfileDropdown() {
        const button =
            $("profileButton");

        const dropdown =
            $("profileDropdown");

        const wrapper =
            $("profileMenuWrapper");

        if (
            !button ||
            !dropdown
        ) {
            return;
        }

        button.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                dropdown.classList.toggle(
                    "hidden"
                );
            }
        );

        document.addEventListener(
            "click",
            function (event) {
                if (
                    wrapper &&
                    !wrapper.contains(event.target)
                ) {
                    dropdown.classList.add("hidden");
                }
            }
        );
    }


    // ============================================================
    // HERO STATUS BADGE
    // ============================================================

    function updateHeroStatusBadge(status) {
        const badge =
            $("citizenStatusBadge");

        const text =
            $("citizenStatusText");

        const dot =
            $("citizenStatusDot");

        if (
            !badge ||
            !text ||
            !dot
        ) {
            return;
        }

        const normalized =
            String(status || "")
                .trim()
                .toLowerCase();

        badge.classList.remove(
            "bg-white/15",
            "bg-green-500",
            "bg-amber-500",
            "bg-red-500",
            "bg-slate-500"
        );

        dot.classList.remove(
            "bg-white",
            "bg-green-100",
            "bg-amber-100",
            "bg-red-100",
            "bg-slate-200"
        );

        if (normalized === "verified") {
            text.textContent =
                "Verified Citizen";

            badge.classList.add(
                "bg-green-500"
            );

            dot.classList.add(
                "bg-green-100"
            );

            return;
        }

        if (normalized === "pending") {
            text.textContent =
                "Pending Verification";

            badge.classList.add(
                "bg-amber-500"
            );

            dot.classList.add(
                "bg-amber-100"
            );

            return;
        }

        if (normalized === "rejected") {
            text.textContent =
                "Verification Rejected";

            badge.classList.add(
                "bg-red-500"
            );

            dot.classList.add(
                "bg-red-100"
            );

            return;
        }

        text.textContent =
            "Unverified Citizen";

        badge.classList.add(
            "bg-slate-500"
        );

        dot.classList.add(
            "bg-slate-200"
        );
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    function getNotificationIcon(type, title) {
        const combined =
            `${type || ""} ${title || ""}`.toLowerCase();

        if (
            combined.includes("resolved") ||
            combined.includes("complete") ||
            combined.includes("success")
        ) {
            return `
                <div class="w-9 h-9 rounded-xl bg-green-50 text-green-600
                            flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7">
                        </path>
                    </svg>
                </div>
            `;
        }

        if (
            combined.includes("dispatch") ||
            combined.includes("assigned") ||
            combined.includes("accepted")
        ) {
            return `
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600
                            flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7">
                        </path>
                    </svg>
                </div>
            `;
        }

        if (
            combined.includes("emergency") ||
            combined.includes("urgent")
        ) {
            return `
                <div class="w-9 h-9 rounded-xl bg-red-50 text-red-600
                            flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z">
                        </path>
                    </svg>
                </div>
            `;
        }

        return `
            <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500
                        flex items-center justify-center shrink-0">
                <svg class="w-4 h-4"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5">
                    </path>
                </svg>
            </div>
        `;
    }

    function getNotificationId(notification) {
        return (
            notification.notificationID ??
            notification.notificationId ??
            notification.id
        );
    }

    function getNotificationComplaintId(notification) {
        return (
            notification.complaintID ??
            notification.complaintId ??
            notification.complaint_id
        );
    }

    function getNotificationTitle(notification) {
        return (
            notification.title ||
            notification.notificationTitle ||
            "Notification"
        );
    }

    function getNotificationMessage(notification) {
        return (
            notification.message ||
            notification.notificationMessage ||
            notification.description ||
            ""
        );
    }

    function isNotificationRead(notification) {
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
    // REAL-TIME NOTIFICATION BADGE REFRESH
    // ============================================================

    async function refreshNotificationBadge() {
        try {
            const response = await fetch(
                "/Complaint/Citizens/get_notifications.php",
                {
                    method: "GET",
                    cache: "no-store",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Notification request failed: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.success !== true) {
                console.warn(
                    "Unable to refresh notifications:",
                    data.message
                );
                return;
            }

            const unreadCount = Number(data.unreadCount) || 0;

            const notificationBadge =
                document.getElementById("notificationBadge");

            const notificationSubtitle =
                document.getElementById("notificationSubtitle");

            if (notificationBadge) {
                notificationBadge.textContent =
                    unreadCount > 99 ? "99+" : String(unreadCount);

                notificationBadge.classList.toggle(
                    "hidden",
                    unreadCount === 0
                );
            }

            if (notificationSubtitle) {
                notificationSubtitle.textContent =
                    unreadCount === 0
                        ? "You're all caught up"
                        : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`;
            }

        } catch (error) {
            // Keep the previous badge state if the request fails.
            console.error(
                "Real-time notification refresh failed:",
                error
            );
        }
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
            const response = await fetch(
                "/Complaint/Citizens/get_notifications.php",
                {
                    method: "GET",
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

            if (Array.isArray(data)) {
                notifications = data;
            } else if (
                Array.isArray(data?.notifications)
            ) {
                notifications =
                    data.notifications;
            } else if (
                Array.isArray(data?.data)
            ) {
                notifications =
                    data.data;
            }

            if (loading) {
                loading.classList.add("hidden");
            }

            list
                .querySelectorAll(
                    ".citizen-notification-item"
                )
                .forEach(
                    element => element.remove()
                );

            const unreadNotifications =
                notifications.filter(
                    notification =>
                        !isNotificationRead(
                            notification
                        )
                );

            if (badge) {
                if (
                    unreadNotifications.length > 0
                ) {
                    badge.textContent =
                        unreadNotifications.length > 99
                            ? "99+"
                            : unreadNotifications.length;

                    badge.classList.remove("hidden");
                } else {
                    badge.textContent = "0";

                    badge.classList.add("hidden");
                }
            }

            if (subtitle) {
                subtitle.textContent =
                    unreadNotifications.length > 0
                        ? `${unreadNotifications.length} unread notification${unreadNotifications.length === 1 ? "" : "s"}`
                        : "You're all caught up.";
            }

            if (markAllButton) {
                markAllButton.classList.toggle(
                    "hidden",
                    unreadNotifications.length === 0
                );
            }

            if (!notifications.length) {
                if (empty) {
                    empty.classList.remove("hidden");
                }

                return;
            }

            if (empty) {
                empty.classList.add("hidden");
            }

            notifications.forEach(
                notification => {
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
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "citizen-notification-item px-4 py-3 border-b " +
                        "border-slate-100 hover:bg-slate-50 " +
                        "transition-colors cursor-pointer";

                    if (!read) {
                        item.classList.add(
                            "bg-blue-50/40"
                        );
                    }

                    item.dataset.notificationId =
                        id ?? "";

                    item.innerHTML = `
                        <div class="flex items-start gap-3">
                            ${getNotificationIcon(type, title)}

                            <div class="min-w-0 flex-1">
                                <div class="flex items-start justify-between gap-2">
                                    <p class="text-xs font-bold text-slate-800 leading-5">
                                        ${escapeHTML(title)}
                                    </p>

                                    ${!read
                            ? `
                                        <span class="w-2 h-2 rounded-full
                                                     bg-blue-600 shrink-0 mt-1.5">
                                        </span>
                                    `
                            : ""
                        }
                                </div>

                                <p class="text-xs text-slate-500 leading-5 mt-0.5">
                                    ${escapeHTML(message)}
                                </p>

                                <p class="text-[10px] text-slate-400 mt-1.5">
                                    ${escapeHTML(
                            formatNotificationTime(
                                createdAt
                            )
                        )}
                                </p>
                            </div>
                        </div>
                    `;

                    item.addEventListener(
                        "click",
                        async function () {
                            if (
                                !read &&
                                id
                            ) {
                                await markNotificationAsRead(
                                    id
                                );
                            }

                            if (complaintId) {
                                viewComplaint(
                                    complaintId
                                );
                            } else {
                                const viewButton =
                                    $("viewComplaintsBtn");

                                if (viewButton) {
                                    viewButton.click();
                                }
                            }
                        }
                    );

                    list.appendChild(item);
                }
            );

        } catch (error) {
            console.error(
                "Error loading notifications:",
                error
            );

            if (loading) {
                loading.classList.add("hidden");
            }

            if (empty) {
                empty.classList.remove("hidden");
            }

            if (subtitle) {
                subtitle.textContent =
                    "Unable to load notifications.";
            }
        }
    }


    // ============================================================
    // MARK NOTIFICATION READ
    // ============================================================

    async function markNotificationAsRead(
        notificationId
    ) {
        if (!notificationId) {
            return;
        }

        try {
            await fetch(
                "/Complaint/Citizens/mark_notification_read.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body:
                        `notification_id=${encodeURIComponent(notificationId)}`
                }
            );

            await loadNotifications();

        } catch (error) {
            console.warn(
                "Could not mark notification as read:",
                error
            );
        }
    }


    // ============================================================
    // MARK ALL READ
    // ============================================================

    async function markAllNotificationsAsRead() {
        try {
            const response =
                await fetch(
                    "/Complaint/Citizens/mark_all_notifications_read.php",
                    {
                        method: "POST"
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
        }
    }


    // ============================================================
    // INITIALIZE NOTIFICATIONS
    // ============================================================

    function initializeNotifications() {
        const button =
            $("notificationButton");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();

                window.location.href =
                    "notifications.html";
            }
        );
    }


    // ============================================================
    // VERIFICATION BADGE
    // ============================================================

    function setVerificationBadge(
        text,
        color
    ) {
        const badge =
            $("verificationBadge");

        if (!badge) {
            return;
        }

        badge.textContent =
            text;

        badge.className =
            "px-2 py-0.5 font-medium text-[10px] " +
            "rounded-md tracking-wide uppercase border";

        if (color === "green") {
            badge.classList.add(
                "bg-green-50",
                "border-green-200",
                "text-green-700"
            );
        }

        if (color === "amber") {
            badge.classList.add(
                "bg-amber-50",
                "border-amber-200",
                "text-amber-700"
            );
        }

        if (color === "red") {
            badge.classList.add(
                "bg-red-50",
                "border-red-200",
                "text-red-700"
            );
        }

        if (color === "slate") {
            badge.classList.add(
                "bg-slate-100",
                "border-slate-200",
                "text-slate-500"
            );
        }

        if (color === "blue") {
            badge.classList.add(
                "bg-blue-50",
                "border-blue-200",
                "text-blue-700"
            );
        }
    }


    // ============================================================
    // VERIFICATION CARD
    // ============================================================

    function updateVerificationCard(status) {
        const card =
            $("verificationCard");

        const dot =
            $("statusDot");

        const title =
            $("statusTitle");

        const description =
            $("statusDescription");

        const uploadBtn =
            $("uploadBtn");

        if (!card) {
            return;
        }

        const normalized =
            String(status || "")
                .trim()
                .toLowerCase();


        if (
            normalized === "verified"
        ) {
            card.classList.add("hidden");

            setVerificationBadge(
                "Verified",
                "green"
            );

            return;
        }

        // Hide the entire verification card while Pending.
        if (normalized === "pending") {
            card.classList.add("hidden");

            setVerificationBadge(
                "Pending",
                "amber"
            );

            return;
        }

        // Show the card for Rejected or Unverified citizens.
        card.classList.remove("hidden");


        card.classList.remove(
            "bg-amber-50",
            "border-amber-200",
            "bg-green-50",
            "border-green-200",
            "bg-red-50",
            "border-red-200",
            "bg-blue-50",
            "border-blue-200",
            "bg-slate-50",
            "border-slate-200"
        );

        if (dot) {
            dot.classList.remove(
                "bg-amber-500",
                "bg-green-500",
                "bg-red-500",
                "bg-blue-500",
                "bg-slate-400"
            );

            dot.classList.add(
                "animate-pulse"
            );
        }

        if (
            normalized === "pending"
        ) {
            card.classList.add(
                "bg-amber-50",
                "border-amber-200"
            );

            if (dot) {
                dot.classList.add(
                    "bg-amber-500"
                );
            }

            if (title) {
                title.textContent =
                    "Pending Review";

                title.className =
                    "text-xs font-bold uppercase tracking-wider text-amber-700";
            }

            if (description) {
                description.textContent =
                    "Your Valid ID has been submitted and is currently waiting for verification.";
            }

            if (uploadBtn) {
                uploadBtn.classList.remove(
                    "hidden"
                );
            }

            setVerificationBadge(
                "Pending",
                "amber"
            );

            return;
        }

        if (
            normalized === "rejected"
        ) {
            card.classList.add(
                "bg-red-50",
                "border-red-200"
            );

            if (dot) {
                dot.classList.add(
                    "bg-red-500"
                );
            }

            if (title) {
                title.textContent =
                    "Verification Rejected";

                title.className =
                    "text-xs font-bold uppercase tracking-wider text-red-700";
            }

            if (description) {
                description.textContent =
                    "Your submitted document could not be verified. Please upload a valid Valid ID.";
            }

            if (uploadBtn) {
                uploadBtn.classList.remove(
                    "hidden"
                );
            }

            setVerificationBadge(
                "Rejected",
                "red"
            );

            return;
        }

        card.classList.add(
            "bg-amber-50",
            "border-amber-200"
        );

        if (dot) {
            dot.classList.add(
                "bg-amber-500"
            );
        }

        if (title) {
            title.textContent =
                "Action Required";

            title.className =
                "text-xs font-bold uppercase tracking-wider text-amber-700";
        }

        if (description) {
            description.textContent =
                "To unlock full complaint filing privileges and map routes, please provide a valid digital copy of your current Valid ID.";
        }

        if (uploadBtn) {
            uploadBtn.classList.remove(
                "hidden"
            );
        }

        setVerificationBadge(
            "Unverified",
            "slate"
        );
    }


    // ============================================================
    // COMPLAINT ACCESS MESSAGE
    // ============================================================

    function setComplaintAccessMessage(
        message,
        type = "default"
    ) {
        const element =
            $("complaintAccessMessage");

        if (!element) {
            return;
        }

        element.textContent =
            message || "";

        element.classList.remove(
            "hidden",
            "bg-slate-50",
            "text-slate-600",
            "bg-amber-50",
            "text-amber-700",
            "bg-red-50",
            "text-red-700",
            "bg-green-50",
            "text-green-700"
        );

        if (!message) {
            element.classList.add(
                "hidden"
            );

            return;
        }

        if (type === "amber") {
            element.classList.add(
                "bg-amber-50",
                "text-amber-700"
            );

            return;
        }

        if (type === "red") {
            element.classList.add(
                "bg-red-50",
                "text-red-700"
            );

            return;
        }

        if (type === "green") {
            element.classList.add(
                "bg-green-50",
                "text-green-700"
            );

            return;
        }

        element.classList.add(
            "bg-slate-50",
            "text-white"
        );
    }


    // ============================================================
    // ENABLE COMPLAINT BUTTON
    // ============================================================

    function enableComplaintButton(
        label = "File a Complaint",
        accessMode = "normal"
    ) {
        const button =
            $("fileComplaintBtn");

        const buttonText =
            $("fileComplaintBtnText");

        if (!button) {
            return;
        }

        button.disabled =
            false;

        button.classList.remove(
            "bg-gray-100",
            "text-gray-400",
            "text-gray-500",
            "cursor-not-allowed",
            "opacity-60"
        );

        button.classList.add(
            "bg-blue-600",
            "hover:bg-blue-700",
            "text-white",
            "cursor-pointer"
        );

        if (buttonText) {
            buttonText.textContent =
                label;
        }

        button.onclick =
            function () {
                window.location.href =
                    "../Complaints/complaintForm.html";
            };

        sessionStorage.setItem(
            "complaintAccessMode",
            accessMode
        );

        sessionStorage.setItem(
            "complaintVerificationStatus",
            "allowed"
        );
    }


    // ============================================================
    // DISABLE COMPLAINT BUTTON
    // ============================================================

    function disableComplaintButton(
        messageText = "Verification required"
    ) {
        const button =
            $("fileComplaintBtn");

        const buttonText =
            $("fileComplaintBtnText");

        if (!button) {
            return;
        }

        button.disabled =
            true;

        button.classList.remove(
            "bg-blue-600",
            "hover:bg-blue-700",
            "text-white",
            "cursor-pointer"
        );

        button.classList.add(
            "bg-gray-100",
            "text-gray-400",
            "cursor-not-allowed",
            "opacity-60"
        );

        if (buttonText) {
            buttonText.textContent =
                messageText;
        }

        button.onclick =
            null;

        sessionStorage.setItem(
            "complaintAccessMode",
            "none"
        );

        sessionStorage.setItem(
            "complaintVerificationStatus",
            "blocked"
        );
    }


    // ============================================================
    // LOAD CITIZEN STATUS
    // ============================================================

    async function loadCitizenStatus() {
        try {
            const response =
                await fetch(
                    "/Complaint/Citizens/get_status_citizen.php",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Status request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "Citizen verification status:",
                data
            );

            const status =
                String(
                    data?.status ||
                    data?.verification_status ||
                    data?.verificationStatus ||
                    data?.citizen_status ||
                    "unverified"
                )
                    .trim()
                    .toLowerCase();

            updateHeroStatusBadge(
                status
            );

            updateVerificationCard(
                status
            );

            setComplaintAccessMessage(
                ""
            );

            if (
                status === "verified"
            ) {
                enableComplaintButton(
                    "File a New Complaint",
                    "normal"
                );

                return;
            }

            if (
                status === "pending"
            ) {
                const emergencyUsed =
                    sessionStorage.getItem(
                        "emergencyComplaintUsed"
                    ) === "true";

                if (!emergencyUsed) {
                    enableComplaintButton(
                        "File Emergency Complaint",
                        "emergency"
                    );

                    setComplaintAccessMessage(
                        "Your verification is still being reviewed. You may submit one emergency complaint while waiting for approval.",
                        "amber"
                    );

                } else {
                    disableComplaintButton(
                        "Your verification is still pending. The available emergency complaint has already been used."
                    );

                    setComplaintAccessMessage(
                        "Your emergency complaint has already been used. Please wait for your verification to be completed.",
                        "amber"
                    );
                }

                return;
            }

            if (
                status === "rejected"
            ) {
                disableComplaintButton(
                    "Verification required"
                );

                setComplaintAccessMessage(
                    "Your verification request was rejected. Please upload a valid Valid ID to continue.",
                    "red"
                );

                return;
            }

            disableComplaintButton(
                "Verification required"
            );

            setComplaintAccessMessage(
                "Please upload your Valid ID and complete verification before filing a complaint.",
                "default"
            );

        } catch (error) {
            console.error(
                "Error loading citizen status:",
                error
            );

            updateHeroStatusBadge(
                "unverified"
            );

            updateVerificationCard(
                "unverified"
            );

            disableComplaintButton(
                "Unable to verify account status"
            );

            setComplaintAccessMessage(
                "Unable to verify your account status right now. Please refresh the page and try again.",
                "red"
            );
        }
    }


    // ============================================================
    // LOAD CITIZEN ACTIVITY
    // ============================================================

    async function loadCitizenActivity() {
        try {
            const response =
                await fetch(
                    "/Complaint/Citizens/get_activity.php",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Activity request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "Citizen activity:",
                data
            );

            const pending =
                data?.pending ??
                data?.pendingCount ??
                data?.pending_count ??
                data?.data?.pending ??
                0;

            const resolved =
                data?.resolved ??
                data?.resolvedCount ??
                data?.resolved_count ??
                data?.data?.resolved ??
                0;

            setText(
                "pendingCount",
                pending
            );

            setText(
                "resolvedCount",
                resolved
            );

        } catch (error) {
            console.error(
                "Error loading citizen activity:",
                error
            );
        }
    }


    // ============================================================
    // RESPONSE MODAL
    // ============================================================

    function showResponseModal(
        title,
        message,
        success = true
    ) {
        const modal =
            $("responseModal");

        const circle =
            $("modalStatusCircle");

        const icon =
            $("modalStatusIcon");

        const titleElement =
            $("responseModalTitle");

        const messageElement =
            $("responseModalMessage");

        if (!modal) {
            return;
        }

        if (titleElement) {
            titleElement.textContent =
                title || "Notification";
        }

        if (messageElement) {
            messageElement.textContent =
                message || "";
        }

        if (circle) {
            circle.classList.remove(
                "bg-green-100",
                "bg-red-100",
                "bg-blue-100"
            );

            circle.classList.add(
                success
                    ? "bg-green-100"
                    : "bg-red-100"
            );
        }

        if (icon) {
            icon.textContent =
                success
                    ? "✓"
                    : "!";
        }

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "flex"
        );
    }

    function closeResponseModal() {
        const modal =
            $("responseModal");

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "flex"
        );

        unlockBodyScrollIfNoModalOpen();
    }


    // ============================================================
    // UPLOAD RESPONSE
    // ============================================================

    function handleUploadResponse() {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const uploadStatus =
            params.get("upload");

        if (!uploadStatus) {
            return;
        }

        if (
            uploadStatus === "success"
        ) {
            showResponseModal(
                "Verification Submitted",
                "Your Valid ID has been submitted successfully and is now waiting for review.",
                true
            );
        }

        if (
            uploadStatus === "error"
        ) {
            showResponseModal(
                "Upload Failed",
                "We could not process your Valid ID. Please check the file and try again.",
                false
            );
        }

        const cleanURL =
            window.location.pathname;

        window.history.replaceState(
            {},
            document.title,
            cleanURL
        );
    }


    // ============================================================
    // MY COMPLAINTS BUTTON
    // ============================================================

    function initializeMyComplaintsButton() {
        const button =
            $("viewComplaintsBtn");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            function () {
                window.location.href =
                    "myComplaints.html";
            }
        );
    }


    // ============================================================
    // COMPLAINT BUTTON FALLBACK
    // ============================================================

    function initializeComplaintButtonFallback() {
        const button =
            $("fileComplaintBtn");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            function (event) {
                const access =
                    sessionStorage.getItem(
                        "complaintVerificationStatus"
                    );

                if (
                    access !== "allowed"
                ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        );
    }


    // ============================================================
    // INITIALIZE VERIFICATION CAMERA
    // ============================================================

    function initializeVerificationCamera() {
        const uploadBox =
            $("verificationUploadBox");

        const cameraCloseButton =
            $("verificationCloseCameraBtn");

        const captureButton =
            $("verificationCaptureBtn");

        const removePreviewButton =
            $("verificationRemovePreviewBtn");


        // --------------------------------------------------------
        // UPLOAD/PREVIEW BOX
        //
        // IMPORTANT:
        // This does NOT open a file picker.
        // It always opens the device camera.
        // --------------------------------------------------------

        if (uploadBox) {
            uploadBox.addEventListener(
                "click",
                function (event) {

                    /*
                     * If the remove button was clicked,
                     * do not reopen the camera.
                     */
                    if (
                        event.target.closest(
                            "#verificationRemovePreviewBtn"
                        )
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    openVerificationCamera();
                }
            );

            uploadBox.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    openVerificationCamera();
                }
            );
        }


        // --------------------------------------------------------
        // CAMERA CLOSE X
        // --------------------------------------------------------

        if (cameraCloseButton) {
            cameraCloseButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    closeVerificationCamera(
                        event
                    );
                }
            );
        }


        // --------------------------------------------------------
        // CAPTURE
        // --------------------------------------------------------

        if (captureButton) {
            captureButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    captureVerificationDocument();
                }
            );
        }


        // --------------------------------------------------------
        // REMOVE CAPTURED IMAGE
        // --------------------------------------------------------

        if (removePreviewButton) {
            removePreviewButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    discardVerificationCapture(
                        event
                    );
                }
            );
        }
    }


    // ============================================================
    // MODAL BEHAVIOR
    // ============================================================

    function initializeModalBehavior() {

        const complaintModal =
            $("complaintModal");

        const verificationModal =
            $("verificationModal");

        const responseModal =
            $("responseModal");


        // --------------------------------------------------------
        // COMPLAINT MODAL
        // --------------------------------------------------------

        if (complaintModal) {
            complaintModal.addEventListener(
                "click",
                function (event) {
                    if (
                        event.target ===
                        complaintModal
                    ) {
                        closeComplaintModal();
                    }
                }
            );
        }


        // --------------------------------------------------------
        // SINGLE VERIFICATION MODAL
        // --------------------------------------------------------

        if (verificationModal) {
            verificationModal.addEventListener(
                "click",
                function (event) {

                    /*
                     * Only the dark outer background
                     * closes the verification modal.
                     *
                     * Clicking:
                     * - upload box
                     * - preview
                     * - camera
                     * - submit
                     * will NOT close it.
                     */

                    if (
                        event.target ===
                        verificationModal
                    ) {
                        toggleVerificationModal(
                            false
                        );
                    }
                }
            );
        }
        // --------------------------------------------------------
        // VERIFICATION MODAL CLOSE BUTTON
        // --------------------------------------------------------

        const verificationCloseButton =
            $("verificationCloseModalBtn");

        if (verificationCloseButton) {
            verificationCloseButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    toggleVerificationModal(false);
                }
            );
        }


        // --------------------------------------------------------
        // RESPONSE MODAL
        // --------------------------------------------------------

        if (responseModal) {
            responseModal.addEventListener(
                "click",
                function (event) {
                    if (
                        event.target ===
                        responseModal
                    ) {
                        closeResponseModal();
                    }
                }
            );
        }


        // --------------------------------------------------------
        // RESPONSE CLOSE
        // --------------------------------------------------------

        const closeButton =
            $("responseModalCloseBtn");

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    closeResponseModal();
                }
            );
        }


        // ========================================================
        // ESCAPE KEY
        // ========================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Escape"
                ) {
                    return;
                }


                // ------------------------------------------------
                // CAMERA IS OPEN
                // ------------------------------------------------

                if (
                    verificationCameraStream
                ) {
                    event.preventDefault();

                    closeVerificationCamera();

                    return;
                }


                // ------------------------------------------------
                // VERIFICATION MODAL IS OPEN
                // ------------------------------------------------

                if (
                    verificationModal &&
                    !verificationModal.classList.contains(
                        "hidden"
                    )
                ) {
                    event.preventDefault();

                    toggleVerificationModal(
                        false
                    );

                    return;
                }


                // ------------------------------------------------
                // COMPLAINT MODAL
                // ------------------------------------------------

                if (
                    complaintModal &&
                    !complaintModal.classList.contains(
                        "hidden"
                    )
                ) {
                    event.preventDefault();

                    closeComplaintModal();

                    return;
                }


                // ------------------------------------------------
                // RESPONSE MODAL
                // ------------------------------------------------

                if (
                    responseModal &&
                    !responseModal.classList.contains(
                        "hidden"
                    )
                ) {
                    event.preventDefault();

                    closeResponseModal();
                }
            }
        );


        // ========================================================
        // BROWSER BACK
        // ========================================================

        window.addEventListener(
            "popstate",
            function () {

                /*
                 * The verification flow uses ONE modal.
                 *
                 * Browser history is only used to keep
                 * camera opening/closing predictable.
                 */

                if (
                    verificationHistoryGoingBack
                ) {
                    verificationHistoryGoingBack =
                        false;

                    verificationHistoryState =
                        null;

                    return;
                }


                // Camera was open
                if (
                    verificationHistoryState ===
                    "camera"
                ) {
                    closeVerificationCamera(
                        null,
                        true
                    );

                    return;
                }


                // Verification modal was open
                if (
                    verificationModal &&
                    !verificationModal.classList.contains(
                        "hidden"
                    )
                ) {
                    toggleVerificationModal(
                        false,
                        true
                    );

                    return;
                }
            }
        );
    }


    // ============================================================
    // UPLOAD MODAL AVAILABILITY
    // ============================================================

    function uploadModalIsAvailable() {
        return !!$(
            "verificationModal"
        );
    }

    // ============================================================
    // REAL-TIME CITIZEN DASHBOARD REFRESH
    // ============================================================

    let citizenRefreshInProgress = false;

    async function refreshCitizenDashboard() {
        // Avoid overlapping requests if the previous refresh
        // has not finished yet.
        if (citizenRefreshInProgress) {
            return;
        }

        // Do not poll while the browser tab is hidden.
        if (document.hidden) {
            return;
        }

        citizenRefreshInProgress = true;

        try {
            await Promise.allSettled([
                loadNotifications(),
                loadCitizenActivity(),
                loadCitizenStatus()
            ]);
        } finally {
            citizenRefreshInProgress = false;
        }
    }

    function startCitizenDashboardRefresh() {
        // Prevent duplicate polling timers.
        if (notificationRefreshTimer !== null) {
            clearInterval(notificationRefreshTimer);
        }

        // Refresh every 5 seconds.
        notificationRefreshTimer = setInterval(
            refreshCitizenDashboard,
            5000
        );
    }



    // ============================================================
    // BEFORE UNLOAD
    // ============================================================

    window.addEventListener(
        "beforeunload",
        function () {

            if (notificationRefreshTimer) {
                clearInterval(
                    notificationRefreshTimer
                );

                notificationRefreshTimer =
                    null;
            }

            stopVerificationCamera();

            if (verificationPreviewObjectURL) {
                URL.revokeObjectURL(
                    verificationPreviewObjectURL
                );

                verificationPreviewObjectURL =
                    null;
            }
        }
    );


    // ============================================================
    // PAGE INITIALIZATION
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        async function () {
            console.log("CitizenCare citizen.js initialized.");

            removeOldCameraPlaceholder();

            await loadCitizenProfileImage();

            initializeProfileDropdown();

            await loadCitizenActivity();
            await loadCitizenStatus();

            initializeNotifications();
            initializeMyComplaintsButton();
            initializeComplaintButtonFallback();
            initializeVerificationCamera();
            initializeModalBehavior();
            handleUploadResponse();

            // Load the initial notification badge.
            await refreshNotificationBadge();

            // Prevent duplicate polling timers.
            if (notificationRefreshTimer) {
                clearInterval(notificationRefreshTimer);
            }

            // Refresh dashboard information every 5 seconds.
            notificationRefreshTimer = window.setInterval(
                async function () {
                    if (document.visibilityState !== "visible") {
                        return;
                    }

                    await Promise.allSettled([
                        loadCitizenActivity(),
                        loadCitizenStatus(),
                        refreshNotificationBadge()
                    ]);
                },
                5000
            );
        }
    );

})();