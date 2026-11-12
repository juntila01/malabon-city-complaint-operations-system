document.addEventListener('DOMContentLoaded', () => {

    console.log("🔥🔥🔥 COMPLAINT FORM JS VERSION 1000 LOADED 🔥🔥🔥");
    let isVerifiedUser = false;
    const form = document.getElementById('complaintForm');
    const complaintInput = document.getElementById('complaintText');
    const submitBtn = document.getElementById('submitBtn');

    // ==========================================
    // ACTIVE COMPLAINT AVAILABILITY
    // ==========================================

    const complaintLimitNotice =
        document.getElementById("complaintLimitNotice");

    const complaintLimitTitle =
        document.getElementById("complaintLimitTitle");

    const complaintLimitText =
        document.getElementById("complaintLimitText");

    let complaintAvailability = {
        highActive: false,
        normalActive: false,
        highAvailable: true,
        normalAvailable: true,
        manualReviewActive: false,
        limitReached: false
    };

    const statusNotice = document.getElementById('statusNotice');
    const aiPanel = document.getElementById('aiPanel');
    const aiCategory = document.getElementById('aiCategory');
    const aiUrgency = document.getElementById('aiUrgency');

    const customAlertModal = document.getElementById('customAlertModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalIconContainer = document.getElementById('modalIconContainer');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    const successModal = document.getElementById("successModal");
    const successMessage = document.getElementById("successMessage");
    const successCloseBtn = document.getElementById("successCloseBtn");

    const errorModal = document.getElementById("errorModal");
    const errorModalTitle = document.getElementById("errorModalTitle");
    const errorModalMessage = document.getElementById("errorModalMessage");
    const errorModalCloseBtn = document.getElementById("errorModalCloseBtn");

    const REPORT_RATE_LIMIT = 30000; // 30 seconds

    async function loadCitizenVerificationStatus() {

        try {

            const response = await fetch("../get_status_citizen.php", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Unable to retrieve citizen verification status.");
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            isVerifiedUser =
                String(data.status).toLowerCase() === "verified";

            updateEvidenceOptions();

            console.log(
                "Citizen verification status:",
                data.status
            );

        } catch (error) {

            console.error(
                "Verification Status Error:",
                error
            );

            // Fail safely:
            // if status cannot be verified, treat the user as unverified
            isVerifiedUser = false;

            updateEvidenceOptions();
        }
    }
    // ==========================================
    // ACTIVE COMPLAINT LIMIT
    // ==========================================

    async function checkComplaintAvailability() {

        if (
            !submitBtn ||
            !complaintLimitNotice ||
            !complaintLimitTitle ||
            !complaintLimitText
        ) {
            return;
        }

        try {

            const response = await fetch(
                "../Citizens/get_complaint_status.php",
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
                throw new Error(
                    data.message ||
                    "Unable to check complaint availability."
                );
            }

            complaintAvailability = {
                highActive: data.highActive === true,
                normalActive: data.normalActive === true,
                highAvailable: data.highAvailable === true,
                normalAvailable: data.normalAvailable === true,
                manualReviewActive: data.manualReviewActive === true,
                limitReached: data.limitReached === true
            };

            updateComplaintLimitUI();

        } catch (error) {

            console.error(
                "Complaint availability check failed:",
                error
            );

            // IMPORTANT:
            // Do not block the user if the status-check
            // endpoint fails.
            //
            // analyze.php is still the final authority.

            complaintAvailability = {
                highActive: false,
                normalActive: false,
                highAvailable: true,
                normalAvailable: true
            };

            submitBtn.disabled = false;

            submitBtn.classList.remove(
                "bg-slate-300",
                "cursor-not-allowed",
                "opacity-70"
            );

            submitBtn.classList.add(
                "bg-blue-600",
                "hover:bg-blue-700",
                "shadow-blue-600/10",
                "hover:shadow-blue-600/20"
            );

            if (complaintLimitNotice) {
                complaintLimitNotice.classList.add("hidden");
            }
        }
    }


    function updateComplaintLimitUI() {

        if (
            !submitBtn ||
            !complaintLimitNotice ||
            !complaintLimitTitle ||
            !complaintLimitText
        ) {
            return;
        }

        const hasHigh = complaintAvailability.highActive;
        const hasNormal = complaintAvailability.normalActive;
        const hasManualReview = complaintAvailability.manualReviewActive;
        const limitReached = complaintAvailability.limitReached;

        // ==========================================
        // MANUAL REVIEW REQUIRED
        // ==========================================

        if (hasManualReview) {

            submitBtn.disabled = true;

            submitBtn.classList.remove(
                "bg-blue-600",
                "hover:bg-blue-700",
                "shadow-blue-600/10",
                "hover:shadow-blue-600/20"
            );

            submitBtn.classList.add(
                "bg-slate-300",
                "cursor-not-allowed",
                "opacity-70"
            );

            complaintLimitTitle.textContent =
                "Complaint awaiting manual review";

            complaintLimitText.textContent =
                "You already have a complaint awaiting manual review " +
                "because AI analysis was unavailable. Please wait for " +
                "the response team to review it before submitting another complaint.";

            complaintLimitNotice.classList.remove("hidden");

            return;
        }

        // ==========================================
        // BOTH URGENCY SLOTS OCCUPIED
        // ==========================================

        if (limitReached || (hasHigh && hasNormal)) {

            submitBtn.disabled = true;

            submitBtn.classList.remove(
                "bg-blue-600",
                "hover:bg-blue-700",
                "shadow-blue-600/10",
                "hover:shadow-blue-600/20"
            );

            submitBtn.classList.add(
                "bg-slate-300",
                "cursor-not-allowed",
                "opacity-70"
            );

            complaintLimitTitle.textContent =
                "Active complaint limit reached";

            complaintLimitText.textContent =
                "You already have an active emergency complaint and " +
                "an active normal complaint. Please wait until one " +
                "of your complaints is resolved or rejected.";

            complaintLimitNotice.classList.remove("hidden");

            return;
        }

        // ==========================================
        // ONE HIGH COMPLAINT ACTIVE
        // ==========================================

        if (hasHigh) {

            submitBtn.disabled = false;

            submitBtn.classList.remove(
                "bg-slate-300",
                "cursor-not-allowed",
                "opacity-70"
            );

            submitBtn.classList.add(
                "bg-blue-600",
                "hover:bg-blue-700",
                "shadow-blue-600/10",
                "hover:shadow-blue-600/20"
            );

            complaintLimitTitle.textContent =
                "Emergency complaint already active";

            complaintLimitText.textContent =
                "You already have an active emergency complaint. " +
                "You may still submit another report if it is " +
                "classified as a normal complaint.";

            complaintLimitNotice.classList.remove("hidden");

            return;
        }

        // ==========================================
        // ONE NORMAL COMPLAINT ACTIVE
        // ==========================================

        if (hasNormal) {

            submitBtn.disabled = false;

            submitBtn.classList.remove(
                "bg-slate-300",
                "cursor-not-allowed",
                "opacity-70"
            );

            submitBtn.classList.add(
                "bg-blue-600",
                "hover:bg-blue-700",
                "shadow-blue-600/10",
                "hover:shadow-blue-600/20"
            );

            complaintLimitTitle.textContent =
                "Normal complaint already active";

            complaintLimitText.textContent =
                "You already have an active normal complaint. " +
                "You may still submit another report if it is " +
                "classified as an emergency.";

            complaintLimitNotice.classList.remove("hidden");

            return;
        }

        // ==========================================
        // NO ACTIVE COMPLAINTS
        // ==========================================

        submitBtn.disabled = false;

        submitBtn.classList.remove(
            "bg-slate-300",
            "cursor-not-allowed",
            "opacity-70"
        );

        submitBtn.classList.add(
            "bg-blue-600",
            "hover:bg-blue-700",
            "shadow-blue-600/10",
            "hover:shadow-blue-600/20"
        );

        complaintLimitNotice.classList.add("hidden");
    }

    // ==========================================
    // GPS LOCATION
    // ==========================================

    function getUserLocation() {
        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by this browser."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {

                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });

                },
                (error) => {

                    switch (error.code) {

                        case error.PERMISSION_DENIED:
                            reject(new Error("Location permission was denied."));
                            break;

                        case error.POSITION_UNAVAILABLE:
                            reject(new Error("Your location is currently unavailable."));
                            break;

                        case error.TIMEOUT:
                            reject(new Error("Getting your location timed out."));
                            break;

                        default:
                            reject(new Error("Unable to get your location."));
                    }

                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    function triggerWarningModal(title, message, isError = false) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        if (isError) {
            modalIcon.textContent = '✕';
            modalIconContainer.className = "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 mb-4";
        } else {
            modalIcon.textContent = '!';
            modalIconContainer.className = "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-4";
        }

        // Keep upper banner hidden while modal popup handles validation attention
        statusNotice.classList.add('hidden');
        customAlertModal.classList.remove('hidden');
    }

    modalCloseBtn.addEventListener('click', () => {
        customAlertModal.classList.add('hidden');
    });

    successCloseBtn.addEventListener("click", () => {
        window.location.href = "../Citizens/citizen.php";
    });

    errorModalCloseBtn.addEventListener("click", () => {
        errorModal.classList.add("hidden");
    });

    function showStatusNotice(type, message) {
        statusNotice.className = "max-w-[540px] w-full mb-4 p-4 rounded-xl text-sm font-medium border transform transition-all duration-300 block";

        if (type === 'success') {
            statusNotice.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
        } else {
            statusNotice.classList.add('bg-red-50', 'text-red-800', 'border-red-200');
        }
        statusNotice.textContent = message;
        statusNotice.classList.remove('hidden');
    }
    function showSuccessModal(message) {

        successMessage.textContent = message;

        successModal.classList.remove("hidden");

    }

    function showErrorModal(title, message) {

        errorModalTitle.textContent = title;
        errorModalMessage.textContent = message;

        errorModal.classList.remove("hidden");
    }


    function styleAIBadges(category, urgency) {

        // Handle AI-unavailable or incomplete AI responses safely.
        const safeCategory =
            typeof category === "string" && category.trim()
                ? category.trim()
                : "Pending Review";

        const safeUrgency =
            typeof urgency === "string" && urgency.trim()
                ? urgency.trim()
                : "Pending Review";

        aiCategory.className =
            "inline-block mt-1 px-2.5 py-0.5 font-bold text-[11px] uppercase rounded-full bg-blue-100 text-blue-800";

        aiUrgency.className =
            "inline-block mt-1 px-2.5 py-0.5 font-bold text-[11px] uppercase rounded-full";

        aiCategory.textContent = safeCategory;
        aiUrgency.textContent = safeUrgency;

        switch (safeUrgency.toLowerCase()) {

            case "high":

                aiUrgency.classList.add(
                    "bg-red-100",
                    "text-red-700"
                );

                break;

            case "normal":

                aiUrgency.classList.add(
                    "bg-slate-100",
                    "text-slate-700"
                );

                break;

            default:

                aiUrgency.classList.add(
                    "bg-amber-100",
                    "text-amber-800"
                );

                break;
        }

        aiPanel.classList.remove("hidden");
    }

    // ==========================================
    // VIDEO FRAME EXTRACTION
    // ==========================================
    //
    // Extracts representative frames from a video
    // directly in the user's browser.
    //
    // This avoids FFmpeg and works on:
    // - XAMPP
    // - InfinityFree
    // - Normal shared hosting
    //
    // ==========================================

    async function extractVideoFrames(videoFile, knownDuration = null) {

        const MAX_FRAMES = 10;
        const MAX_DURATION = 20;

        const videoURL = URL.createObjectURL(videoFile);
        const video = document.createElement("video");

        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;

        video.src = videoURL;

        try {

            // ==========================================
            // WAIT FOR VIDEO METADATA
            // ==========================================

            await new Promise((resolve, reject) => {

                const timeout = setTimeout(() => {
                    reject(
                        new Error("Unable to load video metadata.")
                    );
                }, 10000);

                video.onloadedmetadata = () => {

                    clearTimeout(timeout);

                    console.log("Video metadata loaded:", {
                        duration: video.duration,
                        width: video.videoWidth,
                        height: video.videoHeight
                    });

                    resolve();

                };

                video.onerror = () => {

                    clearTimeout(timeout);

                    reject(
                        new Error("Unable to read the video.")
                    );

                };

            });


            // ==========================================
            // WAIT FOR VIDEO DATA
            // ==========================================

            await new Promise((resolve, reject) => {

                const timeout = setTimeout(() => {
                    reject(
                        new Error("Unable to load video data.")
                    );
                }, 10000);

                video.onloadeddata = () => {

                    clearTimeout(timeout);
                    resolve();

                };

                video.onerror = () => {

                    clearTimeout(timeout);

                    reject(
                        new Error("Unable to load video data.")
                    );

                };

            });


            // ==========================================
            // GET VIDEO DURATION
            // ==========================================
            //
            // Camera-recorded WebM files may not contain
            // duration metadata.
            //
            // If we already know the duration from the
            // MediaRecorder timer, use that value.
            //
            // Otherwise use the browser metadata.
            // ==========================================

            let duration = null;

            if (
                Number.isFinite(knownDuration) &&
                knownDuration > 0
            ) {

                duration = knownDuration;

                console.log(
                    "Using recorded video duration:",
                    duration
                );

            } else {

                duration = video.duration;

                console.log(
                    "Using video metadata duration:",
                    duration
                );

            }


            // ==========================================
            // STILL UNKNOWN?
            // ==========================================

            if (
                !Number.isFinite(duration) ||
                duration <= 0
            ) {

                URL.revokeObjectURL(videoURL);

                throw new Error(
                    "Unable to determine video duration. Please upload an MP4 video or record the video again."
                );

            }


            console.log(
                "Final video duration:",
                duration
            );


            // ==========================================
            // MAXIMUM VIDEO LENGTH
            // ==========================================

            if (duration > MAX_DURATION) {

                URL.revokeObjectURL(videoURL);

                throw new Error(
                    "Video cannot be longer than 20 seconds."
                );

            }


            // ==========================================
            // VIDEO DIMENSIONS
            // ==========================================

            let width = video.videoWidth;
            let height = video.videoHeight;

            if (!width || !height) {

                URL.revokeObjectURL(videoURL);

                throw new Error(
                    "Unable to determine video dimensions."
                );

            }


            // ==========================================
            // RESIZE FRAMES
            // ==========================================

            const MAX_WIDTH = 640;

            if (width > MAX_WIDTH) {

                height = Math.round(
                    height * (MAX_WIDTH / width)
                );

                width = MAX_WIDTH;

            }


            const canvas =
                document.createElement("canvas");

            const context =
                canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;


            // ==========================================
            // FRAME COUNT
            // ==========================================

            const frameCount =
                Math.min(
                    MAX_FRAMES,
                    Math.max(
                        3,
                        Math.ceil(duration / 2)
                    )
                );

            console.log(
                "Extracting",
                frameCount,
                "frames from",
                duration,
                "second video."
            );


            const frames = [];


            // ==========================================
            // EXTRACT FRAMES
            // ==========================================

            for (
                let i = 0;
                i < frameCount;
                i++
            ) {

                let timestamp;

                if (frameCount === 1) {

                    timestamp = 0;

                } else {

                    timestamp =
                        (i / (frameCount - 1))
                        * Math.max(0, duration - 0.2);

                }


                await new Promise((resolve, reject) => {

                    let finished = false;

                    const timeout =
                        setTimeout(() => {

                            if (finished) {
                                return;
                            }

                            finished = true;

                            reject(
                                new Error(
                                    "Video frame extraction timed out."
                                )
                            );

                        }, 5000);


                    video.onseeked = () => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        clearTimeout(timeout);

                        resolve();

                    };


                    video.onerror = () => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        clearTimeout(timeout);

                        reject(
                            new Error(
                                "Unable to seek video frame."
                            )
                        );

                    };


                    video.currentTime =
                        Math.max(
                            0,
                            Math.min(
                                timestamp,
                                duration - 0.1
                            )
                        );

                });


                // ======================================
                // DRAW FRAME
                // ======================================

                context.drawImage(
                    video,
                    0,
                    0,
                    width,
                    height
                );


                // ======================================
                // CONVERT TO JPEG
                // ======================================

                const blob =
                    await new Promise(resolve => {

                        canvas.toBlob(
                            resolve,
                            "image/jpeg",
                            0.75
                        );

                    });


                if (!blob) {
                    continue;
                }


                const frameFile =
                    new File(
                        [blob],
                        `video_frame_${String(i + 1).padStart(2, "0")}.jpg`,
                        {
                            type: "image/jpeg"
                        }
                    );


                frames.push(frameFile);

            }


            URL.revokeObjectURL(videoURL);


            return frames;


        } catch (error) {

            URL.revokeObjectURL(videoURL);

            throw error;

        }

    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const complaintText = complaintInput.value.trim();
        const evidence = imageInput.files[0];

        // Complaint validation
        if (!complaintText) {
            triggerWarningModal(
                "Input Empty",
                "Please enter details about the incident before trying to submit."
            );
            return;
        }

        // Image validation
        if (!evidence) {
            triggerWarningModal(
                "Evidence Required",
                "Please provide a photo or short video as supporting evidence."
            );
            return;
        }

        // ==========================================
        // EVIDENCE VALIDATION
        // ==========================================

        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        // Max 5MB
        if (evidence.size > MAX_FILE_SIZE) {

            triggerWarningModal(
                "File Too Large",
                "Your evidence file must not exceed 5MB.",
                true
            );

            return;
        }


        // Allowed evidence types
        const allowedImageTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        const allowedVideoTypes = [
            "video/webm",
            "video/mp4"
        ];

        const isImage = allowedImageTypes.includes(evidence.type);

        // Accept video/webm and video/webm;codecs=vp8, etc.
        const isVideo =
            allowedVideoTypes.includes(evidence.type) ||
            evidence.type.startsWith("video/webm;");

        if (!isImage && !isVideo) {
            triggerWarningModal(
                "Invalid Evidence",
                "Only JPG, JPEG, PNG, MP4, and WebM files are allowed.",
                true
            );
            return;
        }
        // Anti-spam
        const lastSubmissionTime = localStorage.getItem("lastReportTimestamp");
        const currentTime = Date.now();

        if (
            lastSubmissionTime &&
            currentTime - lastSubmissionTime < REPORT_RATE_LIMIT
        ) {
            const secondsRemaining = Math.ceil(
                (REPORT_RATE_LIMIT -
                    (currentTime - lastSubmissionTime)) / 1000
            );

            triggerWarningModal(
                "Anti-Spam Restriction",
                `Please wait ${secondsRemaining} second(s) before submitting another report.`
            );

            return;
        }

        statusNotice.classList.add("hidden");
        aiPanel.classList.add("hidden");

        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        // ==========================================
        // GET CITIZEN GPS LOCATION FIRST
        // ==========================================
        // Location is mandatory for every complaint.
        // Request it before doing any video processing.
        // ==========================================

        let location;

        try {

            submitBtn.textContent = "Getting your location...";

            location = await getUserLocation();

            console.log("GPS Location:", {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy
            });

        } catch (locationError) {

            console.error(
                "Location Error:",
                locationError
            );

            showErrorModal(
                "Location Required",
                locationError.message ||
                "Your location is required before submitting a complaint."
            );

            submitBtn.textContent = "Submit Report";

            await checkComplaintAvailability();

            return;
        }

        const latitude = location.latitude;
        const longitude = location.longitude;
        const accuracy = location.accuracy;


        // ==========================================
        // VIDEO AI FRAME EXTRACTION
        // ==========================================

        let videoFrames = [];

        if (isVideo) {

            submitBtn.textContent =
                "Preparing video for AI analysis...";

            try {

                videoFrames =
                    await extractVideoFrames(
                        evidence,
                        recordedVideoDuration
                    );

                console.log(
                    "Extracted video frames:",
                    videoFrames.length
                );

                if (videoFrames.length === 0) {

                    throw new Error(
                        "Unable to extract frames from the video."
                    );

                }

            } catch (videoError) {

                console.error(
                    "Video Frame Extraction Error:",
                    videoError
                );

                showErrorModal(
                    "Video Processing Error",
                    videoError.message ||
                    "Unable to process the uploaded video."
                );

                submitBtn.textContent = "Submit Report";

                await checkComplaintAvailability();

                return;
            }
        }

        try {

            // ==========================================
            // PREPARE COMPLAINT DATA
            // ==========================================

            const formData = new FormData();

            formData.append(
                "text",
                complaintText
            );

            formData.append(
                "image",
                evidence
            );

            formData.append(
                "imageSource",
                imageSource
            );

            // ==========================================
            // GPS LOCATION
            // ==========================================

            formData.append(
                "latitude",
                latitude
            );

            formData.append(
                "longitude",
                longitude
            );

            formData.append(
                "accuracy",
                accuracy
            );

            console.log("GPS Location:", {
                latitude,
                longitude,
                accuracy
            });

            // ==========================================
            // VIDEO AI FRAMES
            // ==========================================

            if (isVideo && videoFrames.length > 0) {

                videoFrames.forEach(
                    (frame, index) => {

                        formData.append(
                            "videoFrames[]",
                            frame,
                            `video_frame_${index + 1}.jpg`
                        );

                    }
                );

            }

            // GPS
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("accuracy", accuracy);


            submitBtn.textContent = "Processing...";

            const response = await fetch("/Complaint/Complaints/analyze.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const responseData = await response.json();

            console.log("🔥 NEW COMPLAINT JS VERSION");
            console.log("🔥 RESPONSE DATA:", responseData);
            // Only after you've seen the output, change it back later:
            // const data = JSON.parse(text);

            if (responseData.status === "error") {

                let errorTitle = "Submission Failed";

                if (responseData.error_code === "PROFANITY_DETECTED") {

                    errorTitle = "Inappropriate Language";

                } else if (
                    responseData.media_safety === "INAPPROPRIATE" ||
                    responseData.error_code === "INAPPROPRIATE_VIDEO"
                ) {

                    errorTitle = "Inappropriate Evidence";

                } else if (
                    responseData.message &&
                    responseData.message.toLowerCase().includes("evidence")
                ) {

                    errorTitle = "Invalid Evidence";

                }

                showErrorModal(
                    errorTitle,
                    responseData.message || "Your complaint could not be submitted."
                );


            } else {

                const requiresManualReview =
                    responseData.requiresManualReview === true ||
                    responseData.aiAnalysisStatus === "Unavailable";

                showSuccessModal(
                    requiresManualReview
                        ? "Your complaint was submitted successfully and is awaiting manual review because AI analysis is unavailable."
                        : "Your complaint has been submitted successfully."
                );

                styleAIBadges(
                    requiresManualReview
                        ? "Pending Review"
                        : responseData.category,
                    requiresManualReview
                        ? "Pending Review"
                        : responseData.urgency
                );


                localStorage.setItem(
                    "lastReportTimestamp",
                    Date.now()
                );

                form.reset();

                preview.src = "";
                preview.classList.add("hidden");

                fileName.className =
                    "mt-3 text-center text-sm text-slate-500 flex items-center justify-center gap-2";

                fileName.innerHTML = "No image selected";

                aiPanel.classList.add("hidden");
                await checkComplaintAvailability();
            }

        } catch (error) {

            console.error("Complaint Submission Error:", error);

            showErrorModal(
                "Submission Error",
                error.message || "Unable to submit your complaint."
            );

        } finally {

            submitBtn.textContent = "Submit Report";

            // Re-check the real complaint status from the database.
            // This decides whether the button should actually be enabled.
            await checkComplaintAvailability();

        }

    });
    // ==========================================
    // IMAGE / CAMERA HANDLING
    // ==========================================

    const preview = document.getElementById("imagePreview");
    const fileName = document.getElementById("fileName");

    const imageInput = document.getElementById("complaintImage");

    const addPhotoBtn = document.getElementById("addPhotoBtn");

    const photoSourceModal =
        document.getElementById("photoSourceModal");

    const takePhotoBtn =
        document.getElementById("takePhotoBtn");

    const uploadPhotoBtn =
        document.getElementById("uploadPhotoBtn");

    const unverifiedNotice =
        document.getElementById("unverifiedNotice");

    const cancelPhotoBtn =
        document.getElementById("cancelPhotoBtn");

    const photoSourceBackdrop =
        document.getElementById("photoSourceBackdrop");

    const removeImageBtn =
        document.getElementById("removeImageBtn");


    // ==========================================
    // LIVE CAMERA ELEMENTS
    // ==========================================

    const cameraModal =
        document.getElementById("cameraModal");

    const cameraVideo =
        document.getElementById("cameraVideo");

    const cameraCanvas =
        document.getElementById("cameraCanvas");

    const capturePhotoBtn =
        document.getElementById("capturePhotoBtn");

    const closeCameraBtn =
        document.getElementById("closeCameraBtn");

    const recordVideoBtnCamera =
        document.getElementById("recordVideoBtnCamera");

    const recordingTimer =
        document.getElementById("recordingTimer");

    const recordingTime =
        document.getElementById("recordingTime");


    const recordingProgress =
        document.getElementById("recordingProgress");

    const recordingProgressContainer =
        document.getElementById("recordingProgressContainer");

    const recordingRemaining =
        document.getElementById("recordingRemaining");

    const cameraModeText =
        document.getElementById("cameraModeText");

    const cameraInstruction =
        document.getElementById("cameraInstruction");


    let cameraStream = null;

    let mediaRecorder = null;
    let recordedChunks = [];

    let recordingInterval = null;
    let recordingStartTime = null;

    let recordedVideoDuration = null;

    const MAX_VIDEO_DURATION = 20 * 1000;
    const MAX_VIDEO_SIZE = 5 * 1024 * 1024;


    // ==========================================
    // OPEN PHOTO SOURCE MODAL
    // ==========================================

    addPhotoBtn.addEventListener("click", async () => {

        if (isVerifiedUser) {

            // Verified users can choose camera OR device storage
            photoSourceModal.classList.remove("hidden");

        } else {

            // Unverified users can ONLY use camera
            await openCamera();

        }

    });
    function updateEvidenceOptions() {

        const unverifiedNotice =
            document.getElementById("unverifiedNotice");

        if (!isVerifiedUser) {

            // Unverified:
            // camera only
            uploadPhotoBtn.classList.add("hidden");

            if (unverifiedNotice) {
                unverifiedNotice.classList.remove("hidden");
            }

        } else {

            // Verified:
            // camera + device upload
            uploadPhotoBtn.classList.remove("hidden");

            if (unverifiedNotice) {
                unverifiedNotice.classList.add("hidden");
            }
        }
    }


    // ==========================================
    // CLOSE PHOTO SOURCE MODAL
    // ==========================================

    function closePhotoSourceModal() {

        photoSourceModal.classList.add("hidden");

    }

    cancelPhotoBtn.addEventListener(
        "click",
        closePhotoSourceModal
    );

    photoSourceBackdrop.addEventListener(
        "click",
        closePhotoSourceModal
    );


    // ==========================================
    // TAKE PHOTO
    // ==========================================

    takePhotoBtn.addEventListener(
        "click",
        async () => {

            closePhotoSourceModal();

            await openCamera();

        }
    );

    const recordVideoBtn = document.getElementById("recordVideoBtn");

    recordVideoBtn.addEventListener("click", async () => {

        closePhotoSourceModal();

        await openCamera();

        // Start recording only if the camera opened successfully
        if (cameraStream) {
            startVideoRecording();
        }

    });


    // ==========================================
    // OPEN LIVE CAMERA
    // ==========================================

    async function openCamera() {

        // --------------------------------------------------
        // Check whether this page can use the camera API
        // --------------------------------------------------

        const canUseLiveCamera =
            !!(
                navigator.mediaDevices &&
                typeof navigator.mediaDevices.getUserMedia === "function"
            );

        // --------------------------------------------------
        // If live camera is unavailable, fall back to the
        // browser/device's native camera picker.
        // --------------------------------------------------

        if (!canUseLiveCamera) {

            console.warn(
                "Live camera API unavailable. Using native camera fallback."
            );

            useNativeCameraFallback();

            return;
        }

        try {

            // --------------------------------------------------
            // FIRST ATTEMPT
            // Prefer the rear/environment camera.
            //
            // IMPORTANT:
            // Do NOT request microphone here.
            // A photo only needs video.
            // --------------------------------------------------

            try {

                cameraStream =
                    await navigator.mediaDevices.getUserMedia({

                        video: {
                            facingMode: {
                                ideal: "environment"
                            }
                        },

                        audio: false

                    });

            } catch (firstError) {

                console.warn(
                    "Environment camera request failed. Retrying with basic camera...",
                    firstError
                );

                // --------------------------------------------------
                // SECOND ATTEMPT
                // Some browsers/devices don't properly support
                // facingMode.
                // --------------------------------------------------

                cameraStream =
                    await navigator.mediaDevices.getUserMedia({

                        video: true,

                        audio: false

                    });

            }

            // --------------------------------------------------
            // Make sure we actually received a stream
            // --------------------------------------------------

            if (
                !cameraStream ||
                cameraStream.getVideoTracks().length === 0
            ) {

                throw new Error(
                    "No usable camera stream was returned."
                );

            }

            // --------------------------------------------------
            // Attach stream to video element
            // --------------------------------------------------

            cameraVideo.srcObject = cameraStream;

            cameraVideo.muted = true;
            cameraVideo.playsInline = true;

            // Some browsers need play() explicitly.
            try {

                await cameraVideo.play();

            } catch (playError) {

                console.warn(
                    "Camera video play() warning:",
                    playError
                );

            }

            // --------------------------------------------------
            // Show camera interface
            // --------------------------------------------------

            cameraModal.classList.remove("hidden");

        } catch (error) {

            console.error(
                "Camera Error:",
                error
            );

            // --------------------------------------------------
            // Clean up any partially-created stream
            // --------------------------------------------------

            if (cameraStream) {

                cameraStream
                    .getTracks()
                    .forEach(track => track.stop());

                cameraStream = null;

            }

            cameraVideo.srcObject = null;

            // --------------------------------------------------
            // Handle specific errors
            // --------------------------------------------------

            switch (error.name) {

                case "NotAllowedError":

                    triggerWarningModal(
                        "Camera Permission Denied",
                        "Camera access was denied. Please allow camera permission in your browser settings and try again.",
                        true
                    );

                    break;


                case "NotFoundError":

                    triggerWarningModal(
                        "No Camera Found",
                        "No camera was detected on this device. You can still select an image from your device.",
                        true
                    );

                    // Give the user another way to provide evidence.
                    if (isVerifiedUser) {
                        imageInput.click();
                    }

                    break;


                case "NotReadableError":

                    triggerWarningModal(
                        "Camera In Use",
                        "Your camera may already be in use by another application or browser tab. Please close it and try again.",
                        true
                    );

                    break;


                case "OverconstrainedError":

                    triggerWarningModal(
                        "Camera Configuration Error",
                        "The requested camera configuration is not available on this device. Please try again.",
                        true
                    );

                    break;


                case "SecurityError":

                    triggerWarningModal(
                        "Camera Security Error",
                        "Your browser blocked camera access because this page is not allowed to use the camera. Please open the website using HTTPS.",
                        true
                    );

                    break;


                default:

                    triggerWarningModal(
                        "Unable to Access Camera",
                        "Your browser could not access the camera. You can use your device's camera picker instead.",
                        true
                    );

                    break;
            }

        }
    }


    // ==========================================
    // NATIVE CAMERA FALLBACK
    // ==========================================
    //
    // This is used when getUserMedia() is unavailable.
    //
    // On supported mobile browsers, this can open the
    // device's native camera through the file input.
    //
    // ==========================================

    function useNativeCameraFallback() {

        if (!imageInput) {

            triggerWarningModal(
                "Camera Unavailable",
                "Your browser cannot access the camera and no camera input is available.",
                true
            );

            return;
        }

        // --------------------------------------------------
        // Tell the browser this input can accept images
        // from the device camera.
        // --------------------------------------------------

        imageInput.setAttribute(
            "accept",
            "image/jpeg,image/jpg,image/png"
        );

        imageInput.setAttribute(
            "capture",
            "environment"
        );

        // --------------------------------------------------
        // Open native camera/file picker
        // --------------------------------------------------

        imageInput.click();

    }

    // ==========================================
    // RECORD VIDEO
    // ==========================================

    recordVideoBtnCamera.addEventListener("click", () => {

        if (!cameraStream) {
            triggerWarningModal(
                "Camera Not Ready",
                "Please wait for the camera to start.",
                true
            );
            return;
        }

        // If already recording, stop recording
        if (mediaRecorder && mediaRecorder.state === "recording") {
            stopVideoRecording();
            return;
        }

        startVideoRecording();

    });


    function startVideoRecording() {

        recordedChunks = [];

        let mimeType = "";

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
            mimeType = "video/webm;codecs=vp8";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
            mimeType = "video/webm";
        } else {
            triggerWarningModal(
                "Video Not Supported",
                "Your browser does not support video recording.",
                true
            );
            return;
        }

        mediaRecorder = new MediaRecorder(cameraStream, {
            mimeType: mimeType,
            videoBitsPerSecond: 1500000
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(recordedChunks, {
                type: mimeType
            });

            handleRecordedVideo(videoBlob);
        };

        // Start recording
        mediaRecorder.start(250);

        recordingStartTime = Date.now();

        // Show recording timer
        recordingTimer.classList.remove("hidden");
        recordingTimer.classList.add("is-recording");

        // Remove the old countdown/progress UI if it still exists
        if (recordingProgressContainer) {
            recordingProgressContainer.classList.add("hidden");
        }

        if (cameraModeText) {
            cameraModeText.textContent = "Recording";
        }

        if (cameraInstruction) {
            cameraInstruction.textContent =
                "Tap Stop to finish recording";
        }

        // Change record button to Stop appearance
        recordVideoBtnCamera.classList.remove("bg-red-600");
        recordVideoBtnCamera.classList.add("bg-white");
        recordVideoBtnCamera.setAttribute(
            "aria-label",
            "Stop video recording"
        );

        const recordIcon = recordVideoBtnCamera.querySelector("span");

        if (recordIcon) {
            recordIcon.classList.remove("rounded-full");
            recordIcon.classList.add("rounded-sm");
            recordIcon.classList.remove("bg-white");
            recordIcon.classList.add("bg-red-600");
        }

        // Start at 00:01 and update until 00:20
        updateRecordingTimer();

        clearInterval(recordingInterval);

        recordingInterval = setInterval(
            updateRecordingTimer,
            200
        );
    }

    function updateRecordingTimer() {

        if (!recordingStartTime) {
            return;
        }

        const elapsed = Date.now() - recordingStartTime;

        // Stop at 20 seconds
        if (elapsed >= MAX_VIDEO_DURATION) {
            recordingTime.textContent = "00:20";
            stopVideoRecording();
            return;
        }

        // Count upward: 00:01 -> 00:20
        const elapsedSeconds = Math.min(
            20,
            Math.floor(elapsed / 1000) + 1
        );

        recordingTime.textContent =
            `00:${String(elapsedSeconds).padStart(2, "0")}`;
    }

    function stopVideoRecording() {

        // ------------------------------------------
        // Save actual recording duration BEFORE
        // resetting recordingStartTime
        // ------------------------------------------

        if (recordingStartTime) {

            recordedVideoDuration =
                (Date.now() - recordingStartTime) / 1000;

            // Keep it safely within the 20-second limit
            recordedVideoDuration =
                Math.min(
                    20,
                    Math.max(
                        0.1,
                        recordedVideoDuration
                    )
                );

            console.log(
                "Recorded video duration:",
                recordedVideoDuration,
                "seconds"
            );
        }

        // ------------------------------------------
        // Stop MediaRecorder
        // ------------------------------------------

        if (
            mediaRecorder &&
            mediaRecorder.state === "recording"
        ) {

            mediaRecorder.stop();

        }

        // ------------------------------------------
        // Stop timer
        // ------------------------------------------

        clearInterval(recordingInterval);

        recordingInterval = null;

        recordingStartTime = null;

        recordingTimer.classList.add("hidden");

        // Reset record button
        recordVideoBtnCamera.classList.remove("bg-white");
        recordVideoBtnCamera.classList.add("bg-red-600");

        recordVideoBtnCamera.setAttribute(
            "aria-label",
            "Start video recording"
        );

        const recordIcon = recordVideoBtnCamera.querySelector("span");

        if (recordIcon) {
            recordIcon.classList.remove("rounded-sm");
            recordIcon.classList.add("rounded-full");
            recordIcon.classList.remove("bg-red-600");
            recordIcon.classList.add("bg-white");
        }


    }


    function handleRecordedVideo(videoBlob) {

        if (videoBlob.size > MAX_VIDEO_SIZE) {

            triggerWarningModal(
                "Video Too Large",
                "The recorded video exceeds the 5MB maximum size. Please record a shorter video.",
                true
            );

            recordedChunks = [];
            recordedVideoDuration = null;

            return;
        }

        const videoFile = new File(
            [videoBlob],
            `complaint_${Date.now()}.webm`,
            {
                type: "video/webm"
            }
        );

        console.log(
            "Recorded video:",
            videoFile.name,
            videoFile.size,
            "duration:",
            recordedVideoDuration
        );

        imageSource = "camera_video";

        const dataTransfer =
            new DataTransfer();

        dataTransfer.items.add(videoFile);

        imageInput.files =
            dataTransfer.files;

        closeCamera();

        setSelectedVideo(videoFile);
    }


    // ==========================================
    // CAPTURE PHOTO
    // ==========================================

    capturePhotoBtn.addEventListener(
        "click",
        () => {

            if (!cameraStream) {
                return;
            }


            const videoWidth =
                cameraVideo.videoWidth;

            const videoHeight =
                cameraVideo.videoHeight;


            if (
                !videoWidth ||
                !videoHeight
            ) {

                triggerWarningModal(
                    "Camera Not Ready",
                    "Please wait a moment for the camera to start.",
                    true
                );

                return;

            }


            // Set canvas size
            cameraCanvas.width =
                videoWidth;

            cameraCanvas.height =
                videoHeight;


            // Draw current camera frame
            const context =
                cameraCanvas.getContext("2d");

            context.drawImage(
                cameraVideo,
                0,
                0,
                videoWidth,
                videoHeight
            );


            // Convert frame to image
            cameraCanvas.toBlob(
                (blob) => {

                    if (!blob) {

                        triggerWarningModal(
                            "Capture Failed",
                            "Unable to capture the photo. Please try again.",
                            true
                        );

                        return;

                    }


                    const file =
                        new File(
                            [blob],
                            `complaint_${Date.now()}.jpg`,
                            {
                                type: "image/jpeg"
                            }
                        );

                    imageSource = "camera";


                    // Put captured photo
                    // into the normal file input
                    const dataTransfer =
                        new DataTransfer();

                    dataTransfer.items.add(file);

                    imageInput.files =
                        dataTransfer.files;


                    // Show preview
                    setSelectedImage(file);


                    // Close camera
                    closeCamera();

                },
                "image/jpeg",
                0.9
            );

        }
    );


    // ==========================================
    // CLOSE CAMERA
    // ==========================================

    closeCameraBtn.addEventListener(
        "click",
        () => {

            closeCamera();

        }
    );


    function closeCamera() {

        // Stop camera hardware
        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            cameraStream = null;

        }


        cameraVideo.srcObject =
            null;

        cameraModal.classList.add(
            "hidden"
        );

        // Reset camera interface for the next session
        recordingTimer.classList.add("hidden");
        recordingTimer.classList.remove("is-recording");

        if (recordingProgressContainer) {
            recordingProgressContainer.classList.add("hidden");
        }

        if (recordingProgress) {
            recordingProgress.style.width = "0%";
        }

        if (cameraModeText) {
            cameraModeText.textContent = "Photo Mode";
        }

        if (cameraInstruction) {
            cameraInstruction.textContent =
                "Position the incident inside the frame";
        }


    }


    // ==========================================
    // CHOOSE FROM DEVICE
    // ==========================================


    uploadPhotoBtn.addEventListener(
        "click",
        () => {

            closePhotoSourceModal();

            // Normal device upload.
            // Do not force the camera.
            imageInput.removeAttribute("capture");

            imageInput.setAttribute(
                "accept",
                "image/jpeg,image/jpg,image/png"
            );

            imageInput.click();

        }
    );



    // ==========================================
    // EXISTING IMAGE SELECTED
    // ==========================================

    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files[0];

            if (!file) {
                return;
            }

            setSelectedImage(file);

        }
    );


    // ==========================================
    // SET SELECTED IMAGE
    // ==========================================

    function setSelectedImage(file) {

        recordedVideoDuration = null;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        // Validate type
        if (!allowedTypes.includes(file.type)) {

            triggerWarningModal(
                "Invalid Image",
                "Only JPG, JPEG and PNG images are allowed.",
                true
            );

            clearSelectedImage();

            return;
        }


        // Validate size
        if (file.size > 5 * 1024 * 1024) {

            triggerWarningModal(
                "Image Too Large",
                "The image must not exceed 5MB.",
                true
            );

            clearSelectedImage();

            return;
        }


        // Create image preview
        const objectURL =
            URL.createObjectURL(file);

        preview.src = objectURL;

        // Show image
        preview.classList.remove("hidden");

        // Hide Add Photo content
        addPhotoBtn.classList.add("hidden");

        // Show remove button
        removeImageBtn.classList.remove("hidden");

        // Update filename
        fileName.className =
            "mt-3 text-center text-sm text-green-600 font-semibold";

        fileName.textContent =
            file.name;
    }
    function setSelectedVideo(file) {

        if (!file) {
            return;
        }

        // Validate video type
        if (!file.type.startsWith("video/")) {

            triggerWarningModal(
                "Invalid Video",
                "Please record a valid video.",
                true
            );

            clearSelectedImage();

            return;
        }


        // Validate size
        if (file.size > MAX_VIDEO_SIZE) {

            triggerWarningModal(
                "Video Too Large",
                "The video must not exceed 5MB.",
                true
            );

            clearSelectedImage();

            return;
        }


        const videoPreview =
            document.getElementById("videoPreview");

        // Create preview URL
        const objectURL =
            URL.createObjectURL(file);

        // Remove previous preview URL if one exists
        if (videoPreview.dataset.objectUrl) {

            URL.revokeObjectURL(
                videoPreview.dataset.objectUrl
            );

        }

        videoPreview.dataset.objectUrl =
            objectURL;

        videoPreview.src =
            objectURL;

        videoPreview.classList.remove("hidden");

        // Hide image preview
        preview.src = "";
        preview.classList.add("hidden");

        // Hide add button
        addPhotoBtn.classList.add("hidden");

        // Show remove button
        removeImageBtn.classList.remove("hidden");

        // Show filename
        fileName.className =
            "mt-3 text-center text-sm text-green-600 font-semibold";

        fileName.textContent =
            file.name;

        // Mark evidence as video
        imageSource = "camera_video";
    }


    // ==========================================
    // REMOVE IMAGE
    // ==========================================

    removeImageBtn.addEventListener(
        "click",
        () => {

            clearSelectedImage();

        }
    );


    function clearSelectedImage() {

        // Clear actual file input
        imageInput.value = "";

        // Clear image preview
        preview.src = "";
        preview.classList.add("hidden");

        // Clear video preview
        const videoPreview =
            document.getElementById("videoPreview");

        if (videoPreview) {

            videoPreview.pause();

            if (videoPreview.dataset.objectUrl) {

                URL.revokeObjectURL(
                    videoPreview.dataset.objectUrl
                );

                videoPreview.dataset.objectUrl = "";
            }

            videoPreview.removeAttribute("src");

            videoPreview.load();

            videoPreview.classList.add("hidden");
        }

        // Reset evidence button
        addPhotoBtn.classList.remove("hidden");

        // Hide remove button
        removeImageBtn.classList.add("hidden");

        // Clear filename
        fileName.textContent = "";

        // Reset evidence source
        imageSource = "";

        // Clear recorded video data
        recordedChunks = [];
        recordedVideoDuration = null;

        // Stop any active recording
        if (
            mediaRecorder &&
            mediaRecorder.state === "recording"
        ) {
            mediaRecorder.stop();
        }

        // Reset recording timer
        clearInterval(recordingInterval);

        recordingInterval = null;
        recordingStartTime = null;

        if (recordingTimer) {
            recordingTimer.classList.add("hidden");
        }

        if (recordingTime) {
            recordingTime.textContent = "00:00";
        }

        // Reset record button
        if (recordVideoBtnCamera) {

            recordVideoBtnCamera.classList.remove("bg-white");
            recordVideoBtnCamera.classList.add("bg-red-600");
        }
    }

    // ==========================================
    // INITIAL COMPLAINT AVAILABILITY CHECK
    // ==========================================

    checkComplaintAvailability();

    // ==========================================
    // REFRESH COMPLAINT AVAILABILITY
    // ==========================================
    //
    // Re-check every 15 seconds so that if an admin or
    // dispatch team resolves a complaint while this page
    // is open, the citizen's submission button updates
    // automatically.
    // ==========================================

    setInterval(() => {

        checkComplaintAvailability();

    }, 15000);


});