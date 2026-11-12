// ============================================================
// MCAT COMPLAINT MANAGEMENT
// ============================================================

(() => {

    const category = document.body.dataset.category || "";

    let table;
    let modal;
    let allComplaints = [];

    // ============================================================
    // EMERGENCY CLUSTER FILTER
    // ============================================================

    let emergencyComplaintIDs = [];

    let emergencyMode = false;

    let verifyEmergencyClusterBtn;
    let dispatchEmergencyClusterBtn;


    let currentPage = 1;
    const complaintsPerPage = 10;

    let totalPages = 1;
    let totalComplaints = 0;
    let pageFrom = 0;
    let pageTo = 0;

    // ============================================================
    // MODAL ELEMENTS
    // ============================================================

    let modalReference;
    let closeModal;

    let modalComplaint;
    let modalCategory;
    let modalLocation;
    let modalGPS;
    let modalMap;
    let modalLocationAddress;
    let modalLandmark;

    let modalUrgency;
    let modalCitizen;
    let modalStaff;
    let modalStatus;
    let modalCreated;
    let modalDeadline;
    let modalRemaining;
    let modalSLA;

    let modalImage;
    let modalVideo;
    let noEvidence;

    let imageViewer;
    let fullImage;
    let expandImageBtn;
    let closeImageViewer;

    let modalAIImageMatch;

    let verifyBtn;
    let rejectBtn;
    let dispatchBtn;

    // ============================================================
    // AI MANUAL REVIEW ELEMENTS
    // ============================================================

    let aiManualReviewForm;
    let aiManualReviewNotice;
    let manualReviewCategory;
    let manualReviewUrgency;
    let saveManualReviewBtn;
    let manualReviewMessage;

    let dispatchModal;
    let dispatchTeamList;
    let closeDispatchModal;

    let selectedComplaintID = null;

    let complaintMap = null;
    let complaintMarker = null;

    let dispatchTeamMarker = null;
    let dispatchLocationRefreshTimer = null;
    let dispatchLocationRequestID = 0;


    // ============================================================
    // EMERGENCY CONTROLS
    // ============================================================

    function updateEmergencyControlsFromStatus() {

        if (
            !emergencyMode ||
            emergencyComplaintIDs.length === 0
        ) {
            return;
        }


        const emergencyComplaints =
            allComplaints.filter(row =>
                emergencyComplaintIDs.includes(
                    Number(row.complaintID)
                )
            );


        if (emergencyComplaints.length === 0) {
            return;
        }


        const allVerified =
            emergencyComplaints.length === emergencyComplaintIDs.length &&
            emergencyComplaints.every(row =>
                normalizeStatus(row.status) === "verified"
            );


        if (!allVerified) {
            return;
        }


        console.log(
            "🚨 Emergency cluster already verified. Restoring dispatch state."
        );


        if (verifyEmergencyClusterBtn) {

            verifyEmergencyClusterBtn.disabled = true;

            verifyEmergencyClusterBtn.innerHTML = `
                <i class="fa-solid fa-check mr-1"></i>
                All Verified
            `;

        }


        if (dispatchEmergencyClusterBtn) {

            dispatchEmergencyClusterBtn.disabled = false;

            dispatchEmergencyClusterBtn.innerHTML = `
                <i class="fa-solid fa-truck-fast mr-1"></i>
                Dispatch Emergency
            `;

        }


        const bannerText =
            document.getElementById(
                "emergencyComplaintBannerText"
            );


        if (bannerText) {

            bannerText.textContent =
                `${emergencyComplaintIDs.length} emergency complaints verified and ready for dispatch.`;

        }

    }


    // ============================================================
    // INITIALIZE
    // ============================================================

    function initComplaint() {

        table =
            document.getElementById(
                "complaintsTable"
            );


        modal =
            document.getElementById(
                "viewModal"
            );


        closeModal =
            document.getElementById(
                "closeModal"
            );


        modalReference =
            document.getElementById(
                "modalReference"
            );


        modalComplaint =
            document.getElementById(
                "modalComplaint"
            );


        modalCategory =
            document.getElementById(
                "modalCategory"
            );


        modalLocation =
            document.getElementById(
                "modalLocation"
            );


        modalLandmark =
            document.getElementById(
                "modalLandmark"
            );


        modalGPS =
            document.getElementById(
                "modalGPS"
            );


        modalUrgency =
            document.getElementById(
                "modalUrgency"
            );


        modalCitizen =
            document.getElementById(
                "modalCitizen"
            );


        modalStaff =
            document.getElementById(
                "modalStaff"
            );


        modalStatus =
            document.getElementById(
                "modalStatus"
            );


        modalCreated =
            document.getElementById(
                "modalCreated"
            );


        modalDeadline =
            document.getElementById(
                "modalDeadline"
            );


        modalRemaining =
            document.getElementById(
                "modalRemaining"
            );


        modalSLA =
            document.getElementById(
                "modalSLA"
            );


        modalImage =
            document.getElementById(
                "modalImage"
            );


        modalVideo =
            document.getElementById(
                "modalVideo"
            );


        noEvidence =
            document.getElementById(
                "noEvidence"
            );


        imageViewer =
            document.getElementById(
                "imageViewer"
            );


        fullImage =
            document.getElementById(
                "fullImage"
            );


        expandImageBtn =
            document.getElementById(
                "expandImageBtn"
            );


        closeImageViewer =
            document.getElementById(
                "closeImageViewer"
            );


        modalAIImageMatch =
            document.getElementById(
                "modalAIImageMatch"
            );


        verifyBtn =
            document.getElementById(
                "verifyBtn"
            );


        rejectBtn =
            document.getElementById(
                "rejectBtn"
            );


        dispatchBtn =
            document.getElementById(
                "dispatchBtn"
            );


        // ========================================================
        // AI MANUAL REVIEW ELEMENTS
        // ========================================================

        aiManualReviewForm =
            document.getElementById(
                "aiManualReviewForm"
            );

        aiManualReviewNotice =
            document.getElementById(
                "aiManualReviewNotice"
            );

        manualReviewCategory =
            document.getElementById(
                "manualReviewCategory"
            );

        manualReviewUrgency =
            document.getElementById(
                "manualReviewUrgency"
            );

        saveManualReviewBtn =
            document.getElementById(
                "saveManualReviewBtn"
            );

        manualReviewMessage =
            document.getElementById(
                "manualReviewMessage"
            );



        verifyEmergencyClusterBtn =
            document.getElementById(
                "verifyEmergencyClusterBtn"
            );


        dispatchEmergencyClusterBtn =
            document.getElementById(
                "dispatchEmergencyClusterBtn"
            );


        if (dispatchEmergencyClusterBtn) {

            dispatchEmergencyClusterBtn.onclick =
                openEmergencyDispatchModal;

        }


        dispatchModal =
            document.getElementById(
                "dispatchModal"
            );


        dispatchTeamList =
            document.getElementById(
                "dispatchTeamList"
            );


        closeDispatchModal =
            document.getElementById(
                "closeDispatchModal"
            );


        // ========================================================
        // CLEAR FILTERS
        // ========================================================

        const clearFilters =
            document.getElementById(
                "clearComplaintFilters"
            );


        if (clearFilters) {

            clearFilters.addEventListener(
                "click",
                () => {

                    const searchInput =
                        document.getElementById(
                            "complaintSearch"
                        );


                    const statusFilter =
                        document.getElementById(
                            "complaintStatusFilter"
                        );


                    const urgencyFilter =
                        document.getElementById(
                            "complaintUrgencyFilter"
                        );


                    const categoryFilter =
                        document.getElementById(
                            "complaintCategoryFilter"
                        );


                    const assignmentFilter =
                        document.getElementById(
                            "complaintAssignmentFilter"
                        );


                    if (searchInput) {
                        searchInput.value = "";
                    }


                    if (statusFilter) {
                        statusFilter.value = "";
                    }


                    if (urgencyFilter) {
                        urgencyFilter.value = "";
                    }


                    if (categoryFilter) {
                        categoryFilter.value = "";
                    }


                    if (assignmentFilter) {
                        assignmentFilter.value = "";
                    }


                    sessionStorage.removeItem(
                        "complaintStatusFilter"
                    );


                    currentPage = 1;

                    loadComplaints();

                }
            );

        }


        // ========================================================
        // CLOSE COMPLAINT MODAL
        // ========================================================

        if (closeModal) {

            closeModal.onclick = () => {

                if (modal) {
                    modal.classList.add("hidden");
                }

            };

        }


        if (modal) {

            modal.onclick = e => {

                if (e.target === modal) {

                    modal.classList.add("hidden");

                }

            };

        }

        // ========================================================
        // VERIFY — OPEN CONFIRMATION
        // ========================================================

        if (verifyBtn) {

            verifyBtn.onclick = () => {

                if (
                    !selectedComplaintID ||
                    verifyBtn.disabled
                ) {
                    return;
                }

                openStatusConfirmation("Verified");

            };

        }



        // ========================================================
        // VERIFY EMERGENCY CLUSTER
        // ========================================================

        if (verifyEmergencyClusterBtn) {

            verifyEmergencyClusterBtn.onclick =
                async () => {

                    if (
                        !emergencyMode ||
                        emergencyComplaintIDs.length === 0
                    ) {
                        return;
                    }


                    const confirmed =
                        confirm(
                            `Verify all ${emergencyComplaintIDs.length} complaints in this emergency incident?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    verifyEmergencyClusterBtn.disabled =
                        true;


                    const originalText =
                        verifyEmergencyClusterBtn.innerHTML;


                    verifyEmergencyClusterBtn.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin mr-1"></i>
                        Verifying...
                    `;


                    try {

                        const response =
                            await fetch(
                                "/Complaint/Complaints/verify_emergency_cluster.php",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },
                                    body:
                                        JSON.stringify({
                                            complaintIDs:
                                                emergencyComplaintIDs
                                        })
                                }
                            );


                        const result =
                            await response.json();


                        if (!result.success) {

                            throw new Error(
                                result.message ||
                                "Failed to verify emergency complaints."
                            );

                        }


                        alert(
                            `${result.verifiedCount} emergency complaint(s) verified successfully.`
                        );


                        if (dispatchEmergencyClusterBtn) {

                            dispatchEmergencyClusterBtn.disabled =
                                false;

                        }


                        const bannerText =
                            document.getElementById(
                                "emergencyComplaintBannerText"
                            );


                        if (bannerText) {

                            bannerText.textContent =
                                `${emergencyComplaintIDs.length} emergency complaints verified and ready for dispatch.`;

                        }


                        verifyEmergencyClusterBtn.innerHTML = `
                            <i class="fa-solid fa-check mr-1"></i>
                            All Verified
                        `;

                    }
                    catch (error) {

                        console.error(
                            "Emergency cluster verification failed:",
                            error
                        );


                        alert(
                            error.message ||
                            "Failed to verify emergency complaints."
                        );


                        verifyEmergencyClusterBtn.disabled =
                            false;


                        verifyEmergencyClusterBtn.innerHTML =
                            originalText;

                    }

                };

        }

        // ========================================================
        // SAVE AI MANUAL REVIEW
        // ========================================================

        if (saveManualReviewBtn) {

            saveManualReviewBtn.onclick =
                async () => {

                    if (!selectedComplaintID) {
                        alert("No complaint selected.");
                        return;
                    }

                    const selectedCategory =
                        manualReviewCategory?.value || "";

                    const selectedUrgency =
                        manualReviewUrgency?.value || "";

                    if (!selectedCategory || !selectedUrgency) {

                        showManualReviewMessage(
                            "Please select both the complaint category and urgency.",
                            true
                        );

                        return;
                    }

                    const confirmed = confirm(
                        "Save this manual classification? The selected urgency will determine the complaint's response deadline."
                    );

                    if (!confirmed) {
                        return;
                    }

                    const originalButtonText =
                        saveManualReviewBtn.innerHTML;

                    saveManualReviewBtn.disabled = true;

                    saveManualReviewBtn.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin mr-1"></i>
                        Saving Manual Review...
                    `;

                    try {

                        const response = await fetch(
                            "/Complaint/Complaints/save_manual_review.php",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                credentials: "same-origin",

                                body: JSON.stringify({
                                    complaintID: selectedComplaintID,
                                    category: selectedCategory,
                                    urgency: selectedUrgency
                                })
                            }
                        );

                        const result = await response.json();

                        if (!response.ok || !result.success) {
                            throw new Error(
                                result.message ||
                                "Unable to save the manual review."
                            );
                        }

                        // Update the modal's visible classification.
                        if (modalCategory) {
                            modalCategory.textContent =
                                result.category || selectedCategory;
                        }

                        if (modalUrgency) {
                            modalUrgency.textContent =
                                result.urgency || selectedUrgency;
                        }

                        // Update the response deadline and SLA.
                        if (modalDeadline) {
                            modalDeadline.textContent =
                                formatComplaintDate(result.deadlineAt);
                        }

                        if (modalRemaining) {
                            modalRemaining.innerHTML =
                                getRemainingTime(result.deadlineAt);
                        }

                        if (modalSLA) {
                            modalSLA.textContent =
                                "On Time";
                        }

                        // Hide the manual-review warning and form.
                        if (aiManualReviewNotice) {
                            aiManualReviewNotice.classList.add("hidden");
                        }

                        if (aiManualReviewForm) {
                            aiManualReviewForm.classList.add("hidden");
                        }

                        // The complaint is now classified, but is
                        // still Pending until someone verifies it.
                        showManualReviewMessage(
                            "Manual review saved successfully.",
                            false
                        );

                        alert(
                            `Manual review saved successfully.\n\n` +
                            `Category: ${result.category || selectedCategory}\n` +
                            `Urgency: ${result.urgency || selectedUrgency}\n` +
                            `Response deadline: ${formatComplaintDate(result.deadlineAt)}`
                        );

                        // Reload the table to obtain the updated
                        // analysis status, category, urgency and deadline.
                        await loadComplaints();

                        // Close the modal so it can be reopened using
                        // fresh data from the server.
                        if (modal) {
                            modal.classList.add("hidden");
                        }

                    }
                    catch (error) {

                        console.error(
                            "Saving manual review failed:",
                            error
                        );

                        showManualReviewMessage(
                            error.message ||
                            "Unable to save the manual review.",
                            true
                        );

                    }
                    finally {

                        saveManualReviewBtn.disabled = false;

                        saveManualReviewBtn.innerHTML =
                            originalButtonText;

                    }

                };

        }


        // ========================================================
        // REJECT — OPEN CONFIRMATION
        // ========================================================

        if (rejectBtn) {

            rejectBtn.onclick = () => {

                if (
                    !selectedComplaintID ||
                    rejectBtn.disabled
                ) {
                    return;
                }

                openStatusConfirmation("Rejected");

            };

        }



        // ========================================================
        // DISPATCH
        // ========================================================

        if (dispatchBtn) {

            dispatchBtn.onclick =
                openDispatchModal;

        }


        // ========================================================
        // CLOSE DISPATCH MODAL
        // ========================================================

        if (closeDispatchModal) {

            closeDispatchModal.onclick = () => {

                if (dispatchModal) {

                    dispatchModal.classList.add(
                        "hidden"
                    );

                    dispatchModal.classList.remove(
                        "flex"
                    );

                }

            };

        }


        // ========================================================
        // SEARCH
        // ========================================================

        const searchInput =
            document.getElementById(
                "complaintSearch"
            );


        if (searchInput) {

            let searchTimeout;


            searchInput.addEventListener(
                "input",
                () => {

                    clearTimeout(
                        searchTimeout
                    );


                    searchTimeout =
                        setTimeout(
                            () => {

                                currentPage = 1;

                                loadComplaints();

                            },
                            300
                        );

                }
            );

        }


        // ========================================================
        // FILTERS
        // ========================================================

        const filterIDs = [

            "complaintStatusFilter",

            "complaintUrgencyFilter",

            "complaintCategoryFilter",

            "complaintAssignmentFilter"

        ];


        filterIDs.forEach(id => {

            const filter =
                document.getElementById(id);


            if (!filter) {
                return;
            }


            filter.addEventListener(
                "change",
                () => {

                    currentPage = 1;

                    loadComplaints();

                }
            );

        });


        // ========================================================
        // IMAGE VIEWER
        // ========================================================

        if (modalImage) {

            modalImage.style.cursor =
                "zoom-in";


            modalImage.onclick = () => {

                if (!modalImage.src) {
                    return;
                }


                if (fullImage) {
                    fullImage.src =
                        modalImage.src;
                }


                if (imageViewer) {

                    imageViewer.classList.remove(
                        "hidden"
                    );

                }

            };

        }


        if (expandImageBtn) {

            expandImageBtn.onclick = () => {

                if (
                    !modalImage ||
                    !modalImage.src
                ) {
                    return;
                }


                if (fullImage) {
                    fullImage.src =
                        modalImage.src;
                }


                if (imageViewer) {

                    imageViewer.classList.remove(
                        "hidden"
                    );

                }

            };

        }


        if (closeImageViewer) {

            closeImageViewer.onclick = () => {

                if (imageViewer) {

                    imageViewer.classList.add(
                        "hidden"
                    );

                }

            };

        }


        if (imageViewer) {

            imageViewer.onclick = e => {

                if (e.target === imageViewer) {

                    imageViewer.classList.add(
                        "hidden"
                    );

                }

            };

        }


        // ========================================================
        // INITIAL EMERGENCY STATE
        // ========================================================

        const storedEmergencyIDs =
            sessionStorage.getItem(
                "emergencyComplaintIDs"
            );


        if (storedEmergencyIDs) {

            try {

                emergencyComplaintIDs =
                    JSON.parse(
                        storedEmergencyIDs
                    )
                        .map(Number)
                        .filter(
                            id => !isNaN(id)
                        );


                if (
                    emergencyComplaintIDs.length > 0
                ) {

                    emergencyMode = true;


                    console.log(
                        "🚨 Emergency complaint mode:",
                        emergencyComplaintIDs
                    );

                }

            }
            catch (error) {

                console.error(
                    "Failed to read emergency complaint IDs:",
                    error
                );


                sessionStorage.removeItem(
                    "emergencyComplaintIDs"
                );

            }

        }


        // ========================================================
        // SHOW EMERGENCY INCIDENT BANNER
        // ========================================================

        const emergencyBanner =
            document.getElementById(
                "emergencyComplaintBanner"
            );


        const emergencyBannerText =
            document.getElementById(
                "emergencyComplaintBannerText"
            );


        if (
            emergencyMode &&
            emergencyComplaintIDs.length > 0
        ) {

            if (emergencyBanner) {

                emergencyBanner.classList.remove(
                    "hidden"
                );

            }


            if (emergencyBannerText) {

                let emergencyInfo = null;


                try {

                    emergencyInfo =
                        JSON.parse(
                            sessionStorage.getItem(
                                "emergencyClusterInfo"
                            )
                        );

                }
                catch (error) {

                    console.error(
                        "Failed to read emergency cluster info:",
                        error
                    );

                }


                if (emergencyInfo) {

                    const severity =
                        String(
                            emergencyInfo.severity ||
                            "EMERGENCY"
                        ).toUpperCase();


                    const emergencyCategory =
                        String(
                            emergencyInfo.category ||
                            "OTHER"
                        ).toUpperCase();


                    emergencyBannerText.textContent =
                        `${severity} • ${emergencyCategory} INCIDENT • ` +
                        `${emergencyComplaintIDs.length} related complaints`;

                }
                else {

                    emergencyBannerText.textContent =
                        `Showing ${emergencyComplaintIDs.length} complaints related to the detected emergency.`;

                }

            }

        }


        // ========================================================
        // EXIT EMERGENCY INCIDENT VIEW
        // ========================================================

        const exitEmergencyButton =
            document.getElementById(
                "exitEmergencyComplaintView"
            );


        if (exitEmergencyButton) {

            exitEmergencyButton.onclick = () => {

                sessionStorage.removeItem(
                    "emergencyComplaintIDs"
                );


                emergencyComplaintIDs = [];

                emergencyMode = false;


                const emergencyBanner =
                    document.getElementById(
                        "emergencyComplaintBanner"
                    );


                if (emergencyBanner) {

                    emergencyBanner.classList.add(
                        "hidden"
                    );

                }


                currentPage = 1;

                loadComplaints();

            };

        }


        // ========================================================
        // INITIAL LOAD
        // ========================================================

        loadComplaints();


        // ========================================================
        // AUTO REFRESH
        // ========================================================

        setInterval(
            loadComplaints,
            60000
        );

    }

    /* ============================================================
       VERIFY / REJECT CONFIRMATION
    ============================================================ */

    let pendingStatusAction = null;

    function openStatusConfirmation(status) {

        const modal = document.getElementById("statusConfirmModal");
        const title = document.getElementById("statusConfirmTitle");
        const message = document.getElementById("statusConfirmMessage");
        const reference = document.getElementById("statusConfirmReference");
        const icon = document.getElementById("statusConfirmIcon");
        const iconSymbol = document.getElementById("statusConfirmIconSymbol");
        const confirmButton = document.getElementById("confirmStatusAction");

        if (!modal || !confirmButton) {
            console.error("Status confirmation modal elements not found.");
            return;
        }

        if (!selectedComplaintID) {
            alert("No complaint selected.");
            return;
        }

        pendingStatusAction = status;

        const isVerify = status === "Verified";

        title.textContent = isVerify
            ? "Verify Complaint?"
            : "Reject Complaint?";

        message.textContent = isVerify
            ? "Are you sure you want to verify this complaint? It can then proceed to dispatch."
            : "Are you sure you want to reject this complaint? This action will mark it as rejected.";

        reference.textContent = "Complaint ID: " + selectedComplaintID;

        icon.className = isVerify
            ? "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600"
            : "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600";

        iconSymbol.className = isVerify
            ? "fa-solid fa-circle-check text-xl"
            : "fa-solid fa-circle-xmark text-xl";

        confirmButton.className = isVerify
            ? "rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            : "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50";

        confirmButton.textContent = isVerify
            ? "Yes, Verify"
            : "Yes, Reject";

        confirmButton.disabled = false;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }


    /* CLOSE MODAL */

    function closeStatusConfirmation() {

        const modal = document.getElementById("statusConfirmModal");

        if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }

        pendingStatusAction = null;
    }


    /* ============================================================
   CONNECT VERIFY / REJECT CONFIRMATION MODAL
============================================================ */

    const statusConfirmModal =
        document.getElementById("statusConfirmModal");

    const cancelStatusConfirm =
        document.getElementById("cancelStatusConfirm");

    const confirmStatusAction =
        document.getElementById("confirmStatusAction");

    // Cancel button
    if (cancelStatusConfirm) {
        cancelStatusConfirm.onclick = () => {
            closeStatusConfirmation();
        };
    }

    // Close when clicking the dark backdrop
    if (statusConfirmModal) {
        statusConfirmModal.onclick = (event) => {
            if (event.target === statusConfirmModal) {
                closeStatusConfirmation();
            }
        };
    }

    // Confirm Verify / Reject
    if (confirmStatusAction) {
        confirmStatusAction.onclick = () => {
            if (!selectedComplaintID || !pendingStatusAction) {
                console.error(
                    "Confirmation stopped: complaint ID or action is missing.",
                    {
                        complaintID: selectedComplaintID,
                        status: pendingStatusAction
                    }
                );
                return;
            }

            const complaintID = selectedComplaintID;
            const status = pendingStatusAction;

            confirmStatusAction.disabled = true;
            confirmStatusAction.textContent =
                status === "Verified"
                    ? "Verifying..."
                    : "Rejecting...";

            closeStatusConfirmation();

            updateStatus(complaintID, status);
        };
    }


    // ============================================================
    // REMAINING TIME
    // ============================================================

    function getRemainingTime(deadline) {

        if (!deadline) {
            return "—";
        }


        const now =
            new Date();


        const end =
            new Date(deadline);


        if (isNaN(end.getTime())) {
            return "—";
        }


        const diff =
            end - now;


        if (diff <= 0) {

            return `
                <span class="text-red-600 font-semibold">
                    OVERDUE
                </span>
            `;

        }


        const days =
            Math.floor(
                diff /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (
                    diff %
                    (1000 * 60 * 60 * 24)
                ) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (
                    diff %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );


        let color =
            "text-green-600";


        if (
            diff <
            12 * 60 * 60 * 1000
        ) {

            color =
                "text-red-600";

        }
        else if (
            diff <
            24 * 60 * 60 * 1000
        ) {

            color =
                "text-orange-500";

        }
        else if (
            diff <
            48 * 60 * 60 * 1000
        ) {

            color =
                "text-yellow-500";

        }


        return `
            <span class="${color} font-semibold">
                ${days}d ${hours}h ${minutes}m
            </span>
        `;

    }


    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatComplaintDate(dateValue) {

        if (!dateValue) {
            return "—";
        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {
            return String(dateValue);
        }


        return date.toLocaleDateString(
            "en-PH",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    // ============================================================
    // NORMALIZE STATUS
    // ============================================================

    function normalizeStatus(value) {

        return String(
            value ?? ""
        )
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }

    // ============================================================
    // DISABLE VERIFY / REJECT FOR COMPLETED COMPLAINTS
    // ============================================================

    function updateVerificationButtons(status) {

        const normalizedStatus = normalizeStatus(status);

        const isCompleted =
            normalizedStatus === "resolved" ||
            normalizedStatus === "unable to resolve";

        if (verifyBtn) {

            verifyBtn.disabled = isCompleted;

            verifyBtn.title = isCompleted
                ? "Verification is unavailable because this complaint is already completed."
                : "";

        }

        if (rejectBtn) {

            rejectBtn.disabled = isCompleted;

            rejectBtn.title = isCompleted
                ? "Rejection is unavailable because this complaint is already completed."
                : "";

        }

    }



    // ============================================================
    // NORMALIZE EMPTY ASSIGNMENT VALUES
    // ============================================================

    function isEmptyAssignmentValue(value) {

        const normalized =
            String(
                value ?? ""
            )
                .trim()
                .toLowerCase();


        return (
            normalized === "" ||
            normalized === "0" ||
            normalized === "null" ||
            normalized === "undefined" ||
            normalized === "none" ||
            normalized === "unassigned" ||
            normalized === "not assigned"
        );

    }


    // ============================================================
    // CHECK ASSIGNMENT
    // ============================================================

    function isAssigned(row) {

        const staff =
            row.assignedStaffName ??
            "";


        const teamID =
            row.dispatchTeamID ??
            row.teamID ??
            row.dispatch_team_id ??
            "";


        const dispatchStatus =
            row.dispatchStatus ??
            "";


        const hasStaff =
            !isEmptyAssignmentValue(
                staff
            );


        const hasTeam =
            !isEmptyAssignmentValue(
                teamID
            );


        const normalizedDispatchStatus =
            normalizeStatus(
                dispatchStatus
            );


        const hasDispatchStatus =
            !isEmptyAssignmentValue(
                dispatchStatus
            ) &&
            normalizedDispatchStatus !== "available";


        return (
            hasStaff ||
            hasTeam ||
            hasDispatchStatus
        );

    }


    // ============================================================
    // ACTION CONFIGURATION
    // ============================================================

    function getActionConfig(row) {

        const status =
            normalizeStatus(
                row.status
            );


        const assigned =
            isAssigned(row);


        // --------------------------------------------------------
        // PENDING
        // --------------------------------------------------------

        if (status === "pending") {

            return {
                label: "Review",
                icon: "fa-magnifying-glass",
                action: "review",
                className:
                    "border-blue-200 " +
                    "bg-blue-50 " +
                    "text-blue-700 " +
                    "hover:bg-blue-100"
            };

        }


        // --------------------------------------------------------
        // VERIFIED + NOT ASSIGNED
        // --------------------------------------------------------

        if (
            status === "verified" &&
            !assigned
        ) {

            return {
                label: "Assign",
                icon: "fa-user-plus",
                action: "assign",
                className:
                    "border-indigo-200 " +
                    "bg-indigo-50 " +
                    "text-indigo-700 " +
                    "hover:bg-indigo-100"
            };

        }


        // --------------------------------------------------------
        // IN PROGRESS
        // --------------------------------------------------------

        if (
            status === "in progress" ||
            status === "in_progress" ||
            status === "dispatched" ||
            status === "responding" ||
            status === "arrived"
        ) {

            return {
                label: "Track",
                icon: "fa-location-arrow",
                action: "track",
                className:
                    "border-blue-200 " +
                    "bg-blue-50 " +
                    "text-blue-700 " +
                    "hover:bg-blue-100"
            };

        }


        // --------------------------------------------------------
        // RESOLVED
        // --------------------------------------------------------

        if (status === "resolved") {

            return {
                label: "View",
                icon: "fa-eye",
                action: "view",
                className:
                    "border-green-200 " +
                    "bg-green-50 " +
                    "text-green-700 " +
                    "hover:bg-green-100"
            };

        }


        // --------------------------------------------------------
        // REJECTED
        // --------------------------------------------------------

        if (status === "rejected") {

            return {
                label: "View",
                icon: "fa-eye",
                action: "view",
                className:
                    "border-gray-200 " +
                    "bg-gray-50 " +
                    "text-gray-600 " +
                    "hover:bg-gray-100"
            };

        }


        // --------------------------------------------------------
        // VERIFIED + ASSIGNED
        // --------------------------------------------------------

        if (
            status === "verified" &&
            assigned
        ) {

            return {
                label: "Track",
                icon: "fa-location-arrow",
                action: "track",
                className:
                    "border-blue-200 " +
                    "bg-blue-50 " +
                    "text-blue-700 " +
                    "hover:bg-blue-100"
            };

        }


        // --------------------------------------------------------
        // FALLBACK
        // --------------------------------------------------------

        return {
            label: "View",
            icon: "fa-eye",
            action: "view",
            className:
                "border-gray-200 " +
                "bg-gray-50 " +
                "text-gray-600 " +
                "hover:bg-gray-100"
        };

    }


    // ============================================================
    // PRIORITY BADGE
    // ============================================================


    function getPriorityHTML(row) {

        const aiAnalysisStatus =
            String(
                row.aiAnalysisStatus ?? ""
            ).trim().toLowerCase();

        // AI ANALYSIS UNAVAILABLE
        if (aiAnalysisStatus === "unavailable") {
            return `
            <span class="
                inline-flex items-center gap-1.5
                rounded-full border border-amber-200
                bg-amber-50 px-2.5 py-1
                text-[10px] font-bold text-amber-800
                whitespace-nowrap
            ">
                <i class="fa-solid fa-triangle-exclamation"></i>
                MANUAL REVIEW
            </span>
        `;
        }

        // GET URGENCY
        const urgency =
            String(
                row.aiUrgency ?? "N/A"
            ).trim().toUpperCase();

        // HIGH — RED
        if (urgency === "HIGH") {
            return `
            <span class="
                inline-flex items-center gap-1.5
                rounded-full border border-red-200
                bg-red-50 px-2.5 py-1
                text-[10px] font-bold text-red-700
                whitespace-nowrap
            ">
                <span class="
                    h-1.5 w-1.5 rounded-full bg-red-500
                "></span>
                HIGH
            </span>
        `;
        }

        // NORMAL — BLUE
        if (urgency === "NORMAL") {
            return `
            <span class="
                inline-flex items-center gap-1.5
                rounded-full border border-blue-200
                bg-blue-50 px-2.5 py-1
                text-[10px] font-bold text-blue-700
                whitespace-nowrap
            ">
                <span class="
                    h-1.5 w-1.5 rounded-full bg-blue-500
                "></span>
                NORMAL
            </span>
        `;
        }

        // UNKNOWN / MISSING URGENCY — GRAY
        return `
        <span class="
            inline-flex items-center gap-1.5
            rounded-full border border-gray-200
            bg-gray-50 px-2.5 py-1
            text-[10px] font-bold text-gray-500
            whitespace-nowrap
        ">
            <span class="
                h-1.5 w-1.5 rounded-full bg-gray-400
            "></span>
            ${urgency}
        </span>
    `;
    }

    // ============================================================
    // STATUS BADGE
    // ============================================================

    function getStatusHTML(row) {

        const status =
            String(
                row.status ?? ""
            ).trim();


        const statusLower =
            normalizeStatus(status);


        let statusClass =
            "bg-gray-100 text-gray-600 border-gray-200";


        let statusIcon =
            "fa-circle-question";


        switch (statusLower) {

            case "resolved":

                statusClass =
                    "bg-green-50 " +
                    "text-green-700 " +
                    "border-green-200";

                statusIcon =
                    "fa-circle-check";

                break;


            case "verified":

                statusClass =
                    "bg-emerald-50 " +
                    "text-emerald-700 " +
                    "border-emerald-200";

                statusIcon =
                    "fa-circle-check";

                break;


            case "rejected":

                statusClass =
                    "bg-red-50 " +
                    "text-red-700 " +
                    "border-red-200";

                statusIcon =
                    "fa-circle-xmark";

                break;


            case "in progress":
            case "in_progress":
            case "dispatched":
            case "responding":
            case "arrived":

                statusClass =
                    "bg-blue-50 " +
                    "text-blue-700 " +
                    "border-blue-200";

                statusIcon =
                    "fa-spinner";

                break;


            case "pending":

                statusClass =
                    "bg-yellow-50 " +
                    "text-yellow-700 " +
                    "border-yellow-200";

                statusIcon =
                    "fa-clock";

                break;

        }


        return `
            <span
                class="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    whitespace-nowrap
                    ${statusClass}
                "
            >

                <i
                    class="
                        fa-solid
                        ${statusIcon}
                        text-[9px]
                    "
                ></i>

                ${escapeHTML(
            status || "Unknown"
        )}

            </span>
        `;

    }


    // ============================================================
    // LOCATION TEXT
    // ============================================================

    function getLocationText(row) {

        if (
            row.aiLocation &&
            row.aiLocation !== "Unknown" &&
            String(row.aiLocation).trim() !== ""
        ) {

            return row.aiLocation;

        }


        if (
            row.latitude != null &&
            row.longitude != null
        ) {

            return "Finding location...";

        }


        return "Location unavailable";

    }


    // ============================================================
    // LOAD COMPLAINTS
    // ============================================================

    function loadComplaints() {

        if (!table) {
            return;
        }


        let url =
            "/Complaint/Complaints/get_complaints.php";


        const params =
            new URLSearchParams();


        // ========================================================
        // DASHBOARD PENDING MODE
        // ========================================================

        const dashboardStatusFilter =
            sessionStorage.getItem(
                "complaintStatusFilter"
            );


        const pendingDashboardMode =
            dashboardStatusFilter === "pending";


        // ========================================================
        // CATEGORY
        // ========================================================

        if (
            category &&
            category !== "undefined"
        ) {

            params.set(
                "category",
                category
            );

        }


        const categoryFilter =
            document.getElementById(
                "complaintCategoryFilter"
            );


        if (
            categoryFilter &&
            categoryFilter.value !== ""
        ) {

            params.set(
                "category",
                categoryFilter.value
            );

        }


        // ========================================================
        // STATUS
        // ========================================================

        const statusFilter =
            document.getElementById(
                "complaintStatusFilter"
            );


        if (pendingDashboardMode) {

            params.set(
                "pendingMode",
                "1"
            );

        }
        else if (
            statusFilter &&
            statusFilter.value !== ""
        ) {

            params.set(
                "status",
                statusFilter.value
            );

        }


        // ========================================================
        // URGENCY
        // ========================================================

        const urgencyFilter =
            document.getElementById(
                "complaintUrgencyFilter"
            );


        if (
            urgencyFilter &&
            urgencyFilter.value !== ""
        ) {

            params.set(
                "urgency",
                urgencyFilter.value
            );

        }


        // ========================================================
        // ASSIGNMENT
        // ========================================================

        const assignmentFilter =
            document.getElementById(
                "complaintAssignmentFilter"
            );


        if (
            assignmentFilter &&
            assignmentFilter.value !== ""
        ) {

            params.set(
                "assignment",
                assignmentFilter.value
            );

        }


        // ========================================================
        // SEARCH
        // ========================================================

        const searchInput =
            document.getElementById(
                "complaintSearch"
            );


        if (searchInput) {

            const search =
                searchInput.value.trim();


            if (search !== "") {

                params.set(
                    "search",
                    search
                );

            }

        }


        // ========================================================
        // PAGINATION
        // ========================================================

        params.set(
            "page",
            currentPage
        );


        params.set(
            "limit",
            complaintsPerPage
        );


        url +=
            "?" +
            params.toString();


        console.log(
            "🌐 COMPLAINT REQUEST:",
            url
        );


        // ========================================================
        // LOADING
        // ========================================================

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="
                        py-16
                        text-center
                        text-gray-400
                    "
                >

                    <div class="
                        flex
                        items-center
                        justify-center
                        gap-2
                    ">

                        <i class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        "></i>

                        Loading complaints...

                    </div>

                </td>
            </tr>
        `;


        fetch(url)

            .then(res => {

                if (!res.ok) {

                    throw new Error(
                        `HTTP ${res.status}`
                    );

                }


                return res.json();

            })

            .then(result => {

                if (!result.success) {

                    table.innerHTML = `
                        <tr>
                            <td
                                colspan="6"
                                class="
                                    py-8
                                    text-center
                                    text-red-500
                                "
                            >

                                ${escapeHTML(
                        result.message ||
                        "Failed to load complaints."
                    )}

                            </td>
                        </tr>
                    `;


                    allComplaints = [];

                    totalComplaints = 0;
                    totalPages = 1;
                    pageFrom = 0;
                    pageTo = 0;


                    renderPagination();

                    return;

                }


                allComplaints =
                    Array.isArray(result.data)
                        ? result.data
                        : [];


                // ==================================================
                // EMERGENCY CLUSTER FILTER
                // ==================================================

                if (
                    emergencyMode &&
                    emergencyComplaintIDs.length > 0
                ) {

                    allComplaints =
                        allComplaints.filter(
                            row =>
                                emergencyComplaintIDs.includes(
                                    Number(row.complaintID)
                                )
                        );


                    console.log(
                        "🚨 Emergency complaints displayed:",
                        allComplaints
                    );

                }


                const pagination =
                    result.pagination || {};


                currentPage =
                    Number(
                        pagination.page ||
                        currentPage
                    );


                totalComplaints =
                    Number(
                        pagination.total ||
                        0
                    );


                totalPages =
                    Number(
                        pagination.totalPages ||
                        Math.ceil(
                            totalComplaints /
                            complaintsPerPage
                        )
                    );


                if (totalPages < 1) {
                    totalPages = 1;
                }


                pageFrom =
                    totalComplaints > 0
                        ? (
                            (currentPage - 1) *
                            complaintsPerPage
                        ) + 1
                        : 0;


                pageTo =
                    totalComplaints > 0
                        ? Math.min(
                            currentPage *
                            complaintsPerPage,
                            totalComplaints
                        )
                        : 0;


                // ==================================================
                // NO RESULTS
                // ==================================================

                if (
                    allComplaints.length === 0
                ) {

                    table.innerHTML = `
                        <tr>
                            <td
                                colspan="6"
                                class="
                                    py-12
                                    text-center
                                    text-slate-500
                                "
                            >

                                <div class="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                ">

                                    <i class="
                                        fa-regular
                                        fa-folder-open
                                        text-2xl
                                        text-gray-300
                                        mb-2
                                    "></i>

                                    <p class="
                                        text-sm
                                        font-medium
                                    ">
                                        No complaints found.
                                    </p>

                                </div>

                            </td>
                        </tr>
                    `;


                    renderPagination();

                    return;

                }


                // ==================================================
                // RESTORE EMERGENCY STATE
                // ==================================================

                updateEmergencyControlsFromStatus();


                // ==================================================
                // RENDER
                // ==================================================

                renderComplaintPage();

            })

            .catch(err => {

                console.error(
                    "Load complaints error:",
                    err
                );


                table.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="
                                py-10
                                text-center
                                text-red-500
                            "
                        >

                            <i class="
                                fa-solid
                                fa-triangle-exclamation
                                mr-1
                            "></i>

                            Unable to load complaints.

                        </td>
                    </tr>
                `;


                allComplaints = [];

                totalComplaints = 0;
                totalPages = 1;
                pageFrom = 0;
                pageTo = 0;


                renderPagination();

            });

    }


    // ============================================================
    // RENDER COMPLAINT TABLE
    // ============================================================

    function renderComplaintPage() {

        table.innerHTML = "";


        const currentComplaints =
            allComplaints;


        currentComplaints.forEach(
            (row, index) => {

                const isEmergencyComplaint =
                    emergencyMode &&
                    emergencyComplaintIDs.includes(
                        Number(row.complaintID)
                    );


                // ==================================================
                // LOCATION
                // ==================================================

                const locationText =
                    getLocationText(row);


                // ==================================================
                // ACTION
                // ==================================================

                const action =
                    getActionConfig(row);


                // ==================================================
                // ROW NUMBER
                // ==================================================

                const rowNumber =
                    (
                        (currentPage - 1) *
                        complaintsPerPage
                    ) +
                    index +
                    1;


                // ==================================================
                // SAFE VALUES
                // ==================================================

                const complaintText =
                    String(
                        row.rawComplaintText ??
                        "N/A"
                    );


                const categoryText =
                    String(
                        row.aiCategory ??
                        "N/A"
                    );


                const statusText =
                    String(
                        row.status ??
                        ""
                    );


                const reference =
                    String(
                        row.complaintReference ??
                        ""
                    );


                const locationValue =
                    String(
                        row.aiLocation ??
                        ""
                    );


                const urgency =
                    String(
                        row.aiUrgency ??
                        ""
                    );


                const citizen =
                    String(
                        row.citizenName ??
                        "N/A"
                    );


                const staff =
                    String(
                        row.assignedStaffName ??
                        "Unassigned"
                    );


                /*
                 * IMPORTANT:
                 *
                 * These three values are kept separate because
                 * dispatch assignment is NOT the same thing as
                 * response-staff assignment.
                 */

                const dispatchTeamID =
                    String(
                        row.dispatchTeamID ??
                        row.teamID ??
                        row.dispatch_team_id ??
                        ""
                    ).trim();


                const dispatchStatus =
                    String(
                        row.dispatchStatus ??
                        ""
                    ).trim();


                const evidence =
                    String(
                        row.filePath ??
                        ""
                    );


                const aiImageMatch =
                    String(
                        row.aiImageMatch ??
                        ""
                    );


                // ==================================================
                // BUILD ROW
                // ==================================================

                table.innerHTML += `

                    <tr
                        class="
                            group
                            border-b
                            transition
                            ${isEmergencyComplaint
                        ? "border-red-200 bg-red-50/60 hover:bg-red-100/70"
                        : "border-gray-100 hover:bg-slate-50"
                    }
                        "
                    >

                        <!-- ========================================
                             NO.
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                complaint-col-id
                            "
                        >

                            <span
                                class="
                                    text-xs
                                    font-bold
                                    text-gray-500
                                "
                            >
                                ${rowNumber}
                            </span>

                        </td>


                        <!-- ========================================
                             COMPLAINT
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                complaint-col-complaint
                            "
                        >

                            <div
                                class="
                                    max-w-[360px]
                                "
                            >

                                <p
                                    class="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                    "
                                    title="${escapeHTML(
                        complaintText
                    )}"
                                >

                                    ${escapeHTML(
                        complaintText
                    )}

                                </p>

                            </div>

                        </td>


                        <!-- ========================================
                             LOCATION
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                complaint-col-location
                                location-cell
                            "
                            data-location-id="${row.complaintID}"
                        >

                            <div
                                class="
                                    max-w-[220px]
                                    truncate
                                    text-xs
                                    text-gray-600
                                "
                                title="${escapeHTML(
                        locationText
                    )}"
                            >

                                ${escapeHTML(
                        locationText
                    )}

                            </div>

                        </td>


                        <!-- ========================================
                             PRIORITY
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                complaint-col-priority
                            "
                        >

                            ${getPriorityHTML(row)}

                        </td>


                        <!-- ========================================
                             STATUS
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                complaint-col-status
                            "
                        >

                            ${getStatusHTML(row)}

                        </td>


                        <!-- ========================================
                             ACTION
                        ========================================= -->

                        <td
                            class="
                                px-4
                                py-4
                                align-middle
                                text-center
                                complaint-col-actions
                            "
                        >

                            <button

                                type="button"

                                class="
                                    complaintActionBtn
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    transition
                                    whitespace-nowrap
                                    ${action.className}
                                "

                                data-id="${row.complaintID}"

                                data-action="${action.action}"

                                data-reference="${escapeHTML(
                        reference
                    )}"

                                data-text="${encodeURIComponent(
                        complaintText
                    )}"

                                data-category="${escapeHTML(
                        categoryText
                    )}"

                                data-location="${encodeURIComponent(
                        locationValue
                    )}"

                                data-latitude="${row.latitude ?? ""}"

                                data-longitude="${row.longitude ?? ""}"

                                data-accuracy="${row.accuracy ?? ""}"

                                data-urgency="${escapeHTML(
                        urgency
                    )}"

                                data-citizen="${escapeHTML(
                        citizen
                    )}"

                                data-staff="${escapeHTML(
                        staff
                    )}"

                    data-status="${escapeHTML(
                        statusText
                    )}"

                    data-ai-analysis-status="${escapeHTML(
                        row.aiAnalysisStatus || ""
                    )}"

                    data-dispatch-team-id="${escapeHTML(
                        dispatchTeamID
                    )}"

                                data-dispatch-status="${escapeHTML(
                        dispatchStatus
                    )}"

                                data-created="${escapeHTML(
                        row.createdAt ?? ""
                    )}"

                                data-deadline="${escapeHTML(
                        row.deadlineAt ?? ""
                    )}"

                                data-sla="${escapeHTML(
                        row.slaStatus ?? ""
                    )}"

                                data-evidence="${escapeHTML(
                        evidence
                    )}"

                                data-ai-image-match="${escapeHTML(
                        aiImageMatch
                    )}"
                            >

                                <i
                                    class="
                                        fa-solid
                                        ${action.icon}
                                        text-[10px]
                                    "
                                ></i>

                                ${action.label}

                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        // ============================================================
        // REGISTER ACTION BUTTONS
        // ============================================================

        registerActionButtons();


        // ============================================================
        // RESOLVE LOCATIONS
        // ============================================================

        resolveComplaintLocations(
            currentComplaints
        );


        // ============================================================
        // PAGINATION
        // ============================================================

        renderPagination();

    }

    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ============================================================
    // REGISTER ACTION BUTTONS
    // ============================================================

    function registerActionButtons() {

        document
            .querySelectorAll(".complaintActionBtn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        selectedComplaintID =
                            this.dataset.id;


                        const action =
                            this.dataset.action;


                        // =================================================
                        // REVIEW
                        // =================================================

                        if (action === "review") {

                            openComplaintModal(
                                this
                            );

                            return;

                        }


                        // =================================================
                        // ASSIGN
                        // =================================================

                        if (action === "assign") {

                            openComplaintModal(
                                this,
                                true
                            );

                            return;

                        }


                        // =================================================
                        // TRACK
                        // =================================================

                        if (action === "track") {

                            openComplaintModal(
                                this
                            );

                            return;

                        }


                        // =================================================
                        // VIEW
                        // =================================================

                        if (action === "view") {

                            openComplaintModal(
                                this
                            );

                            return;

                        }

                    }
                );

            });

    }


    // ============================================================
    // OPEN COMPLAINT MODAL
    // ============================================================

    function openComplaintModal(
        button,
        openAssignAfter = false
    ) {

        if (!modal) {
            return;
        }

        selectedComplaintID =
            button.dataset.id;

        // Disable Verify and Reject for completed complaints.
        updateVerificationButtons(
            button.dataset.status || ""
        );

        const aiAnalysisStatus =
            String(
                button.dataset.aiAnalysisStatus || ""
            ).trim().toLowerCase();

        const requiresManualReview =
            aiAnalysisStatus === "unavailable";

        // ========================================================
        // AI MANUAL REVIEW WARNING
        // ========================================================


        // ========================================================
        // AI MANUAL REVIEW WARNING AND FORM
        // ========================================================

        if (aiManualReviewNotice) {

            aiManualReviewNotice.classList.toggle(
                "hidden",
                !requiresManualReview
            );

        }

        if (aiManualReviewForm) {

            aiManualReviewForm.classList.toggle(
                "hidden",
                !requiresManualReview
            );

        }

        if (manualReviewCategory) {

            manualReviewCategory.value = "";

        }

        if (manualReviewUrgency) {

            manualReviewUrgency.value = "";

        }

        if (manualReviewMessage) {

            manualReviewMessage.textContent = "";

            manualReviewMessage.classList.add("hidden");

            manualReviewMessage.classList.remove(
                "text-red-600",
                "text-green-700"
            );

        }

        if (saveManualReviewBtn) {

            saveManualReviewBtn.disabled = false;

        }


        const complaintReference =
            button.dataset.reference ||
            `#${selectedComplaintID}`;


        if (modalReference) {

            modalReference.textContent =
                complaintReference;

        }


        if (modalComplaint) {

            try {

                modalComplaint.textContent =
                    decodeURIComponent(
                        button.dataset.text || ""
                    );

            }
            catch (error) {

                modalComplaint.textContent =
                    button.dataset.text || "";

            }

        }


        if (modalCategory) {

            modalCategory.textContent =
                button.dataset.category ||
                "N/A";

        }


        let aiLocation = "";

        try {

            aiLocation =
                decodeURIComponent(
                    button.dataset.location || ""
                );

        }
        catch (error) {

            aiLocation =
                button.dataset.location || "";

        }


        const latitude =
            parseFloat(
                button.dataset.latitude
            );


        const longitude =
            parseFloat(
                button.dataset.longitude
            );


        const accuracy =
            parseFloat(
                button.dataset.accuracy
            );

        // ========================================================
        // DISPATCH TEAM ID — MUST BE BEFORE GPS
        // ========================================================

        const progressDispatchTeamID =
            String(
                button.dataset.dispatchTeamId || ""
            ).trim();


        // ========================================================
        // LOCATION
        // ========================================================

        if (
            aiLocation &&
            aiLocation !== "Unknown" &&
            aiLocation !== "null"
        ) {

            if (modalLocation) {

                modalLocation.textContent =
                    aiLocation;

            }

        }
        else {

            if (modalLocation) {

                modalLocation.textContent =
                    "Determining location...";

            }

        }


        // ========================================================
        // GPS
        // ========================================================

        if (
            !isNaN(latitude) &&
            !isNaN(longitude)
        ) {

            showComplaintMap(
                latitude,
                longitude,
                selectedComplaintID,
                accuracy,
                progressDispatchTeamID
            );


            getLocationDetails(
                latitude,
                longitude
            )
                .then(location => {

                    if (!location) {
                        return;
                    }


                    if (
                        !aiLocation ||
                        aiLocation === "Unknown" ||
                        aiLocation === "null"
                    ) {

                        if (modalLocation) {

                            modalLocation.textContent =
                                location.location;

                        }

                    }

                });


            // ====================================================
            // LANDMARK
            // ====================================================

            if (modalLandmark) {

                modalLandmark.textContent =
                    "Finding nearby landmark...";


                getNearbyLandmark(
                    latitude,
                    longitude
                )
                    .then(landmark => {

                        if (landmark) {

                            modalLandmark.textContent =
                                `Near ${landmark.name}`;

                        }
                        else {

                            modalLandmark.textContent =
                                "No nearby landmark identified";

                        }

                    });

            }

        }
        else {

            if (modalLocation) {

                modalLocation.textContent =
                    aiLocation ||
                    "Location unavailable";

            }


            if (modalLandmark) {

                modalLandmark.textContent =
                    "No GPS location available";

            }


            showComplaintMap(
                null,
                null,
                selectedComplaintID,
                null
            );

        }


        // ========================================================
        // BASIC INFORMATION
        // ========================================================

        if (modalUrgency) {

            modalUrgency.textContent =
                button.dataset.urgency ||
                "N/A";

        }


        if (modalCitizen) {

            modalCitizen.textContent =
                button.dataset.citizen ||
                "N/A";

        }


        if (modalStaff) {

            modalStaff.textContent =
                button.dataset.staff ||
                "Unassigned";

        }


        if (modalStatus) {

            modalStatus.textContent =
                button.dataset.status ||
                "Unknown";

        }


        // ========================================================
        // DISPATCH / ASSIGNMENT DATA
        // ========================================================

        const progressStatus =
            button.dataset.status ||
            "Pending";

        const progressStaff =
            String(
                button.dataset.staff || ""
            ).trim();

        const progressDispatchStatus =
            String(
                button.dataset.dispatchStatus || ""
            ).trim();

        const progressHasStaff =
            !isEmptyAssignmentValue(
                progressStaff
            );

        const progressHasTeam =
            !isEmptyAssignmentValue(
                progressDispatchTeamID
            );

        const progressHasDispatchStatus =
            !isEmptyAssignmentValue(
                progressDispatchStatus
            ) &&
            normalizeStatus(
                progressDispatchStatus
            ) !== "available";

        const progressAssigned =
            progressHasStaff ||
            progressHasTeam ||
            progressHasDispatchStatus;

        updateComplaintProgress(
            progressStatus,
            progressAssigned
        );


        // ========================================================
        // DISPATCH BUTTON
        // ========================================================
        //
        // ADMIN + STAFF are both allowed to dispatch.
        //
        // Dispatch is available only when:
        //
        //     Complaint Status = Verified
        //     AND
        //     No staff assignment
        //     AND
        //     No dispatch team
        //     AND
        //     No active dispatch status
        //
        // There is deliberately NO role check here.
        // ========================================================

        const status =
            normalizeStatus(
                button.dataset.status || ""
            );

        const dispatchTeamID =
            String(
                button.dataset.dispatchTeamId || ""
            ).trim();

        const dispatchStatus =
            String(
                button.dataset.dispatchStatus || ""
            ).trim();

        updateDispatchButtonState(
            status,
            dispatchTeamID,
            dispatchStatus
        );

        // AI-unavailable complaints must be manually reviewed
        // before they can be dispatched.
        if (requiresManualReview && dispatchBtn) {
            dispatchBtn.disabled = true;
            dispatchBtn.title =
                "Manual review is required before dispatch.";
        }


        console.log(
            "DISPATCH BUTTON CHECK:",
            {
                complaintID:
                    selectedComplaintID,

                status:
                    status,

                staff:
                    progressStaff,

                dispatchTeamID:
                    dispatchTeamID,

                dispatchStatus:
                    dispatchStatus,

                hasAssignedStaff:
                    progressHasStaff,

                hasDispatchTeam:
                    progressHasTeam,

                hasDispatchStatus:
                    progressHasDispatchStatus,

                assigned:
                    progressAssigned
            }
        );

        // ========================================================
        // DATE / SLA
        // ========================================================

        if (modalCreated) {

            modalCreated.textContent =
                formatComplaintDate(
                    button.dataset.created
                );

        }


        if (modalDeadline) {

            modalDeadline.textContent =
                formatComplaintDate(
                    button.dataset.deadline
                );

        }


        if (modalSLA) {

            modalSLA.textContent =
                button.dataset.sla ||
                "N/A";

        }


        if (modalRemaining) {

            modalRemaining.innerHTML =
                getRemainingTime(
                    button.dataset.deadline
                );

        }


        // ========================================================
        // EVIDENCE
        // ========================================================

        const evidencePath =
            button.dataset.evidence ||
            "";


        if (modalImage) {

            modalImage.classList.add(
                "hidden"
            );

            modalImage.src = "";

        }


        if (modalVideo) {

            modalVideo.classList.add(
                "hidden"
            );

            modalVideo.pause();

            modalVideo.removeAttribute(
                "src"
            );

            modalVideo.load();

        }


        if (noEvidence) {

            noEvidence.classList.add(
                "hidden"
            );

        }


        if (expandImageBtn) {

            expandImageBtn.classList.add(
                "hidden"
            );

        }


        if (evidencePath !== "") {

            const lowerPath =
                evidencePath.toLowerCase();


            const isVideo =
                lowerPath.endsWith(".mp4") ||
                lowerPath.endsWith(".webm") ||
                lowerPath.endsWith(".ogg") ||
                lowerPath.endsWith(".mov") ||
                lowerPath.endsWith(".m4v");


            // ====================================================
            // VIDEO
            // ====================================================

            if (
                isVideo &&
                modalVideo
            ) {

                modalVideo.src =
                    evidencePath;


                modalVideo.classList.remove(
                    "hidden"
                );


                modalVideo.load();

            }


            // ====================================================
            // IMAGE
            // ====================================================

            else if (modalImage) {

                modalImage.src =
                    evidencePath;


                modalImage.classList.remove(
                    "hidden"
                );


                if (expandImageBtn) {

                    expandImageBtn.classList.remove(
                        "hidden"
                    );

                }

            }

        }
        else {

            if (noEvidence) {

                noEvidence.classList.remove(
                    "hidden"
                );

            }

        }


        // ========================================================
        // AI IMAGE MATCH
        // ========================================================

        if (modalAIImageMatch) {

            const imageMatch =
                (
                    button.dataset.aiImageMatch ||
                    "UNKNOWN"
                ).toUpperCase();


            if (imageMatch === "MATCH") {

                modalAIImageMatch.textContent =
                    "Image Matches Complaint";


                modalAIImageMatch.className =
                    "text-green-600 font-semibold";

            }
            else if (
                imageMatch === "MISMATCH"
            ) {

                modalAIImageMatch.textContent =
                    "Image Does Not Match Complaint";


                modalAIImageMatch.className =
                    "text-red-600 font-semibold";

            }
            else if (
                imageMatch === "INCONCLUSIVE"
            ) {

                modalAIImageMatch.textContent =
                    "Unable to Confirm Match";


                modalAIImageMatch.className =
                    "text-gray-500 font-semibold";

            }
            else {

                modalAIImageMatch.textContent =
                    "Not Available";


                modalAIImageMatch.className =
                    "text-gray-500 font-semibold";

            }

        }


        // ========================================================
        // SHOW MODAL
        // ========================================================

        modal.classList.remove(
            "hidden"
        );


        // ========================================================
        // RECORD COMPLAINT VIEW
        // ========================================================

        fetch(
            "/Complaint/Complaints/mark_complaint_viewed.php",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "same-origin",

                body:
                    JSON.stringify({
                        complaintID:
                            selectedComplaintID
                    })

            }
        )
            .then(res => res.json())
            .then(data => {

                if (!data.success) {

                    console.error(
                        "Failed to record complaint view:",
                        data.message
                    );

                }

            })
            .catch(err => {

                console.error(
                    "View notification request failed:",
                    err
                );

            });


        // ========================================================
        // AUTOMATIC ASSIGN MODAL
        // ========================================================

        if (openAssignAfter) {

            /*
             * The table's "Assign" action is only generated when
             * the complaint is verified and unassigned.
             *
             * Give the complaint modal time to open before opening
             * the team-selection modal.
             */

            setTimeout(
                () => {

                    /*
                     * Re-check the complaint before opening dispatch.
                     * This prevents an accidentally stale button from
                     * opening the dispatch team selector.
                     */

                    const latestStatus =
                        normalizeStatus(
                            button.dataset.status || ""
                        );


                    const latestStaff =
                        String(
                            button.dataset.staff || ""
                        ).trim();


                    const latestTeamID =
                        String(
                            button.dataset.dispatchTeamId || ""
                        ).trim();


                    const latestDispatchStatus =
                        String(
                            button.dataset.dispatchStatus || ""
                        ).trim();


                    const latestAssigned =
                        !isEmptyAssignmentValue(
                            latestTeamID
                        )
                        ||
                        (
                            !isEmptyAssignmentValue(
                                latestDispatchStatus
                            )
                            &&
                            normalizeStatus(
                                latestDispatchStatus
                            ) !== "available"
                        );


                    if (
                        latestStatus === "verified" &&
                        !latestAssigned
                    ) {

                        openDispatchModal();

                    }
                    else {

                        console.warn(
                            "Dispatch modal prevented because complaint is no longer verified/unassigned.",
                            {
                                complaintID:
                                    selectedComplaintID,

                                status:
                                    latestStatus,

                                staff:
                                    latestStaff,

                                dispatchTeamID:
                                    latestTeamID,

                                dispatchStatus:
                                    latestDispatchStatus
                            }
                        );

                    }

                },
                150
            );

        }

    }
    // ============================================================
    // UPDATE DISPATCH BUTTON STATE
    // ============================================================

    function updateDispatchButtonState(
        status,
        dispatchTeamID,
        dispatchStatus
    ) {

        const dispatchButton =
            document.getElementById("dispatchBtn");

        if (!dispatchButton) {
            console.warn(
                "Dispatch button #dispatchBtn was not found."
            );
            return;
        }


        const normalizedStatus =
            normalizeStatus(
                status || ""
            );


        const teamID =
            String(
                dispatchTeamID || ""
            ).trim();


        const currentDispatchStatus =
            String(
                dispatchStatus || ""
            ).trim();


        const hasTeam =
            !isEmptyAssignmentValue(
                teamID
            );


        const hasActiveDispatch =
            !isEmptyAssignmentValue(
                currentDispatchStatus
            ) &&
            normalizeStatus(
                currentDispatchStatus
            ) !== "available";


        // ========================================================
        // AI MANUAL REVIEW REQUIREMENT
        // ========================================================

        const aiAnalysisStatus =
            String(
                document.querySelector(
                    '#complaintsTable button[data-id="' +
                    CSS.escape(
                        String(selectedComplaintID || "")
                    ) +
                    '"]'
                )?.dataset.aiAnalysisStatus || ""
            ).trim().toLowerCase();

        const requiresManualReview =
            aiAnalysisStatus === "unavailable";


        // ========================================================
        // CAN DISPATCH
        // ========================================================

        const canDispatch =
            normalizedStatus === "verified" &&
            !hasTeam &&
            !hasActiveDispatch &&
            !requiresManualReview;

        // ========================================================
        // ENABLE
        // ========================================================

        if (canDispatch) {

            dispatchButton.disabled =
                false;

            dispatchButton.classList.remove(
                "opacity-50",
                "cursor-not-allowed",
                "pointer-events-none"
            );

            dispatchButton.classList.add(
                "cursor-pointer"
            );

            dispatchButton.title =
                "Assign a dispatch team";

        }


        // ========================================================
        // DISABLE
        // ========================================================

        else {

            dispatchButton.disabled =
                true;

            dispatchButton.classList.add(
                "opacity-50",
                "cursor-not-allowed"
            );

            dispatchButton.classList.remove(
                "cursor-pointer"
            );


            if (requiresManualReview) {

                dispatchButton.title =
                    "AI analysis is unavailable. Manual review is required before dispatch.";

            }

            else if (
                normalizedStatus !== "verified"
            ) {

                dispatchButton.title =
                    "Complaint must be verified first";

            }

            else if (hasTeam) {

                dispatchButton.title =
                    "A dispatch team is already assigned";

            }

            else if (hasActiveDispatch) {

                dispatchButton.title =
                    "Complaint already has an active dispatch";

            }

            else {

                dispatchButton.title =
                    "Dispatch unavailable";

            }

        }


        console.log(
            "DISPATCH BUTTON STATE:",
            {
                complaintStatus:
                    normalizedStatus,

                dispatchTeamID:
                    teamID,

                dispatchStatus:
                    currentDispatchStatus,

                hasTeam:
                    hasTeam,

                hasActiveDispatch:
                    hasActiveDispatch,

                canDispatch:
                    canDispatch
            }
        );

    }

    // ============================================================
    // UPDATE COMPLAINT PROGRESS
    // ============================================================

    function updateComplaintProgress(
        status,
        assigned = false
    ) {

        const container =
            document.getElementById(
                "complaintProgress"
            );


        if (!container) {
            return;
        }


        const currentStatus =
            normalizeStatus(
                status
            );


        const steps = [

            "submitted",

            "review",

            "verified",

            "assigned",

            "dispatched",

            "arrived",

            "resolved"

        ];


        // ========================================================
        // RESET REJECTED STEP
        // ========================================================

        const rejectedStep =
            container.querySelector(
                '[data-step="rejected"]'
            );


        if (rejectedStep) {

            rejectedStep.classList.add(
                "hidden"
            );


            const rejectedIcon =
                rejectedStep.querySelector(
                    ".progress-icon"
                );


            const rejectedTitle =
                rejectedStep.querySelector(
                    ".progress-title"
                );


            if (rejectedIcon) {

                rejectedIcon.className =
                    "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400";


                rejectedIcon.innerHTML =
                    '<i class="fa-solid fa-xmark text-xs"></i>';

            }


            if (rejectedTitle) {

                rejectedTitle.className =
                    "progress-title text-xs font-semibold text-gray-400";

            }

        }


        // ========================================================
        // REJECTED FLOW
        // ========================================================

        if (
            currentStatus === "rejected" ||
            currentStatus === "declined"
        ) {

            [
                "submitted",
                "review"
            ].forEach(
                step => {

                    const element =
                        container.querySelector(
                            `[data-step="${step}"]`
                        );


                    if (!element) {
                        return;
                    }


                    const icon =
                        element.querySelector(
                            ".progress-icon"
                        );


                    const title =
                        element.querySelector(
                            ".progress-title"
                        );


                    const line =
                        element.querySelector(
                            ".progress-line"
                        );


                    if (icon) {

                        icon.className =
                            "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600";


                        icon.innerHTML =
                            '<i class="fa-solid fa-check text-xs"></i>';

                    }


                    if (title) {

                        title.className =
                            "progress-title text-xs font-semibold text-green-700";

                    }


                    if (line) {

                        line.className =
                            "progress-line w-px flex-1 bg-green-300 my-1";

                    }

                }
            );


            if (rejectedStep) {

                rejectedStep.classList.remove(
                    "hidden"
                );


                const rejectedIcon =
                    rejectedStep.querySelector(
                        ".progress-icon"
                    );


                const rejectedTitle =
                    rejectedStep.querySelector(
                        ".progress-title"
                    );


                if (rejectedIcon) {

                    rejectedIcon.className =
                        "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600";


                    rejectedIcon.innerHTML =
                        '<i class="fa-solid fa-xmark text-xs"></i>';

                }


                if (rejectedTitle) {

                    rejectedTitle.className =
                        "progress-title text-xs font-semibold text-red-700";

                }

            }


            return;

        }


        // ========================================================
        // NORMAL COMPLAINT FLOW
        // ========================================================

        let currentStep = 1;


        switch (currentStatus) {

            case "pending":
            case "submitted":
            case "under review":
            case "review":

                currentStep = 1;

                break;


            case "verified":

                /*
                 * Verified and unassigned:
                 * current step = Verified.
                 *
                 * Verified and assigned:
                 * current step = Assigned.
                 */

                currentStep =
                    assigned
                        ? 3
                        : 2;

                break;


            case "assigned":
            case "assigned to response team":
            case "assigned to dispatch team":

                currentStep = 3;

                break;


            case "accepted":
            case "accepted by response team":
            case "dispatched":
            case "response team dispatched":
            case "in progress":
            case "in_progress":

                currentStep = 4;

                break;


            case "arrived":
            case "on site":
            case "on site / responding":
            case "responding":

                currentStep = 5;

                break;


            case "resolved":
            case "completed":

                currentStep = 7;

                break;


            default:

                currentStep = 1;

                break;

        }


        // ========================================================
        // UPDATE NORMAL STEPS
        // ========================================================

        steps.forEach(
            (step, index) => {

                const element =
                    container.querySelector(
                        `[data-step="${step}"]`
                    );


                if (!element) {
                    return;
                }


                const icon =
                    element.querySelector(
                        ".progress-icon"
                    );


                const title =
                    element.querySelector(
                        ".progress-title"
                    );


                const line =
                    element.querySelector(
                        ".progress-line"
                    );


                if (!icon || !title) {
                    return;
                }


                // ==================================================
                // COMPLETED
                // ==================================================

                if (index < currentStep) {

                    icon.className =
                        "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600";


                    icon.innerHTML =
                        '<i class="fa-solid fa-check text-xs"></i>';


                    title.className =
                        "progress-title text-xs font-semibold text-green-700";


                    if (line) {

                        line.className =
                            "progress-line w-px flex-1 bg-green-300 my-1";

                    }

                }


                // ==================================================
                // CURRENT
                // ==================================================

                else if (
                    index === currentStep &&
                    currentStep < steps.length
                ) {

                    icon.className =
                        "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-blue-100";


                    icon.innerHTML =
                        '<span class="text-[10px]">●</span>';


                    title.className =
                        "progress-title text-xs font-semibold text-blue-700";


                    if (line) {

                        line.className =
                            "progress-line w-px flex-1 bg-gray-200 my-1";

                    }

                }


                // ==================================================
                // NOT YET REACHED
                // ==================================================

                else {

                    icon.className =
                        "progress-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400";


                    icon.innerHTML =
                        '<i class="fa-solid fa-check text-xs"></i>';


                    title.className =
                        "progress-title text-xs font-semibold text-gray-400";


                    if (line) {

                        line.className =
                            "progress-line w-px flex-1 bg-gray-200 my-1";

                    }

                }

            }
        );

    }


    // ============================================================
    // PAGINATION
    // ============================================================

    function renderPagination() {

        const paginationInfo =
            document.getElementById(
                "complaintPageInfo"
            );


        const pagination =
            document.getElementById(
                "complaintPagination"
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

        if (totalComplaints <= 0) {

            paginationInfo.textContent =
                "Showing 0 of 0";


            pagination.innerHTML =
                "";


            return;

        }


        paginationInfo.textContent =
            `Showing ${pageFrom}-${pageTo} of ${totalComplaints}`;


        pagination.innerHTML =
            "";


        // ========================================================
        // CREATE PAGE BUTTON
        // ========================================================

        function createPageButton(
            label,
            page,
            active = false,
            disabled = false
        ) {

            const button =
                document.createElement(
                    "button"
                );


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
                ${active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
                ${disabled
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
                            currentPage === page
                        ) {

                            return;

                        }


                        currentPage =
                            page;


                        loadComplaints();


                        const tableContainer =
                            table.closest(
                                ".overflow-x-auto"
                            );


                        if (tableContainer) {

                            tableContainer.scrollTo({
                                left: 0,
                                behavior: "smooth"
                            });

                        }

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
                currentPage - 1,
                false,
                currentPage <= 1
            )
        );


        // ========================================================
        // VISIBLE PAGES
        // ========================================================

        const pages = [];


        if (totalPages <= 7) {

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


            if (currentPage > 4) {

                pages.push("...");

            }


            const startPage =
                Math.max(
                    2,
                    currentPage - 1
                );


            const endPage =
                Math.min(
                    totalPages - 1,
                    currentPage + 1
                );


            for (
                let i = startPage;
                i <= endPage;
                i++
            ) {

                pages.push(i);

            }


            if (
                currentPage <
                totalPages - 3
            ) {

                pages.push("...");

            }


            pages.push(
                totalPages
            );

        }


        // ========================================================
        // RENDER PAGES
        // ========================================================

        pages.forEach(page => {

            if (page === "...") {

                const dots =
                    document.createElement(
                        "span"
                    );


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
                    page === currentPage
                )
            );

        });


        // ========================================================
        // NEXT
        // ========================================================

        pagination.appendChild(
            createPageButton(
                "›",
                currentPage + 1,
                false,
                currentPage >= totalPages
            )
        );

    }


    // ============================================================
    // REVERSE GEOCODING
    // ============================================================

    async function reverseGeocodeLocation(
        latitude,
        longitude
    ) {

        if (
            latitude === null ||
            longitude === null ||
            latitude === undefined ||
            longitude === undefined ||
            isNaN(latitude) ||
            isNaN(longitude)
        ) {

            return "Location unavailable";

        }


        if (
            typeof google === "undefined" ||
            !google.maps
        ) {

            return "Location available";

        }


        try {

            const geocoder =
                new google.maps.Geocoder();


            const response =
                await geocoder.geocode({
                    location: {
                        lat: Number(latitude),
                        lng: Number(longitude)
                    }
                });


            if (
                !response.results ||
                response.results.length === 0
            ) {

                return "Location unavailable";

            }


            const result =
                response.results[0];


            const components =
                result.address_components ||
                [];


            let barangay = "";
            let city = "";


            components.forEach(
                component => {

                    const types =
                        component.types;


                    if (
                        types.includes(
                            "sublocality_level_1"
                        ) ||
                        types.includes(
                            "sublocality"
                        ) ||
                        types.includes(
                            "neighborhood"
                        )
                    ) {

                        if (!barangay) {

                            barangay =
                                component.long_name;

                        }

                    }


                    if (
                        types.includes(
                            "locality"
                        ) ||
                        types.includes(
                            "administrative_area_level_2"
                        )
                    ) {

                        if (!city) {

                            city =
                                component.long_name;

                        }

                    }

                }
            );


            let locationText = "";


            if (barangay) {

                locationText +=
                    `Brgy. ${barangay}`;

            }


            if (city) {

                if (locationText) {
                    locationText += ", ";
                }

                locationText += city;

            }


            if (!locationText) {

                locationText =
                    result.formatted_address ||
                    "Location unavailable";

            }


            return locationText;

        }
        catch (error) {

            console.error(
                "Reverse geocoding failed:",
                error
            );


            return "Location available";

        }

    }


    // ============================================================
    // RESOLVE UNKNOWN LOCATIONS
    // ============================================================

    async function resolveComplaintLocations(
        complaints
    ) {

        if (
            typeof google === "undefined" ||
            !google.maps
        ) {

            return;

        }


        for (
            const row of complaints
        ) {

            const aiLocationMissing =
                !row.aiLocation ||
                String(row.aiLocation).trim() === "" ||
                row.aiLocation === "Unknown";


            if (!aiLocationMissing) {
                continue;
            }


            if (
                row.latitude === null ||
                row.longitude === null ||
                row.latitude === undefined ||
                row.longitude === undefined ||
                isNaN(row.latitude) ||
                isNaN(row.longitude)
            ) {

                continue;

            }


            const cell =
                document.querySelector(
                    `.location-cell[data-location-id="${row.complaintID}"]`
                );


            if (!cell) {
                continue;
            }


            const location =
                await reverseGeocodeLocation(
                    row.latitude,
                    row.longitude
                );


            cell.textContent =
                location;


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        100
                    )
            );

        }

    }


    // ============================================================
    // GET LOCATION DETAILS
    // ============================================================

    async function getLocationDetails(
        latitude,
        longitude
    ) {

        try {

            if (
                !window.google ||
                !google.maps
            ) {

                return null;

            }


            const {
                Geocoder
            } =
                await google.maps.importLibrary(
                    "geocoding"
                );


            const geocoder =
                new Geocoder();


            const result =
                await geocoder.geocode({
                    location: {
                        lat: latitude,
                        lng: longitude
                    }
                });


            if (
                !result.results ||
                result.results.length === 0
            ) {

                return null;

            }


            const address =
                result.results[0]
                    .formatted_address;


            let locationName =
                address;


            const components =
                result.results[0]
                    .address_components;


            let barangay = "";
            let city = "";


            components.forEach(
                component => {

                    if (
                        component.types.includes(
                            "sublocality"
                        ) ||
                        component.types.includes(
                            "sublocality_level_1"
                        )
                    ) {

                        barangay =
                            component.long_name;

                    }


                    if (
                        component.types.includes(
                            "locality"
                        )
                    ) {

                        city =
                            component.long_name;

                    }

                }
            );


            if (
                barangay &&
                city
            ) {

                locationName =
                    `${barangay}, ${city}`;

            }
            else if (city) {

                locationName =
                    city;

            }


            return {
                address,
                location: locationName
            };

        }
        catch (error) {

            console.error(
                "Reverse geocoding failed:",
                error
            );


            return null;

        }

    }


    // ============================================================
    // GET NEARBY LANDMARK
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

                return null;

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

                return null;

            }


            const place =
                places[0];


            return {

                name:
                    place.displayName ||
                    null,

                address:
                    place.formattedAddress ||
                    null

            };

        }
        catch (error) {

            console.error(
                "Nearby landmark search failed:",
                error
            );


            return null;

        }

    }

    // ============================================================
    // TRACK DISPATCH TEAM LOCATION
    // ============================================================

    function stopDispatchLocationTracking() {

        if (dispatchLocationRefreshTimer !== null) {
            clearInterval(dispatchLocationRefreshTimer);
            dispatchLocationRefreshTimer = null;
        }

        // Invalidate any pending request from the previous complaint.
        dispatchLocationRequestID++;

        if (dispatchTeamMarker) {
            dispatchTeamMarker.map = null;
            dispatchTeamMarker = null;
        }
    }


    // ============================================================
    // TRACK DISPATCH TEAM LOCATION
    // ============================================================

    function stopDispatchLocationTracking() {

        if (dispatchLocationRefreshTimer !== null) {
            clearInterval(dispatchLocationRefreshTimer);
            dispatchLocationRefreshTimer = null;
        }

        // Invalidate requests from a previously opened complaint.
        dispatchLocationRequestID++;

        if (dispatchTeamMarker) {
            dispatchTeamMarker.map = null;
            dispatchTeamMarker = null;
        }
    }


    function startDispatchLocationTracking(teamID) {

        stopDispatchLocationTracking();

        if (
            teamID === null ||
            teamID === undefined ||
            String(teamID).trim() === "" ||
            String(teamID).trim() === "0"
        ) {
            return;
        }

        const requestID = dispatchLocationRequestID;
        const normalizedTeamID = String(teamID).trim();

        async function refreshDispatchLocation() {

            if (
                requestID !== dispatchLocationRequestID ||
                !complaintMap
            ) {
                return;
            }

            try {

                const response = await fetch(
                    "/Complaint/Dispatchs/get_dispatch_team_location.php?teamID=" +
                    encodeURIComponent(normalizedTeamID),
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store"
                    }
                );

                const result = await response.json();

                if (requestID !== dispatchLocationRequestID) {
                    return;
                }

                if (!response.ok || !result.success) {
                    console.warn(
                        "Unable to load dispatch location:",
                        result.message || response.status
                    );
                    return;
                }

                // PHP returns active:false when the team has no GPS fix.
                if (
                    result.active !== true ||
                    !result.location
                ) {
                    console.log(
                        result.message ||
                        "Dispatch team has no current GPS location."
                    );

                    // Hide an old marker so an outdated location
                    // is not mistaken for the team's current location.
                    if (dispatchTeamMarker) {
                        dispatchTeamMarker.map = null;
                        dispatchTeamMarker = null;
                    }

                    return;
                }

                const location = result.location;
                const latitude = Number(location.latitude);
                const longitude = Number(location.longitude);

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude) ||
                    latitude < -90 ||
                    latitude > 90 ||
                    longitude < -180 ||
                    longitude > 180
                ) {
                    console.warn(
                        "Dispatch endpoint returned invalid coordinates."
                    );
                    return;
                }

                const position = {
                    lat: latitude,
                    lng: longitude
                };

                const teamName =
                    location.teamName || `Dispatch Team #${normalizedTeamID}`;


                // Create or update the custom dispatch.webp marker.
                const iconUrl = "/Complaint/assets/dispatch.webp";

                if (!dispatchTeamMarker) {

                    dispatchTeamMarker = new google.maps.Marker({
                        map: complaintMap,
                        position: position,
                        title: `${teamName} — Live Location`,
                        icon: {
                            url: iconUrl,
                            scaledSize: new google.maps.Size(40, 40),
                            anchor: new google.maps.Point(20, 20)
                        },
                        zIndex: 1000
                    });

                } else {

                    dispatchTeamMarker.setPosition(position);
                    dispatchTeamMarker.setMap(complaintMap);
                    dispatchTeamMarker.setTitle(
                        `${teamName} — Live Location`
                    );
                    dispatchTeamMarker.setIcon({
                        url: iconUrl,
                        scaledSize: new google.maps.Size(40, 40),
                        anchor: new google.maps.Point(20, 20)
                    });

                }


            } catch (error) {

                console.error(
                    "Unable to refresh dispatch team location:",
                    error
                );

            }
        }

        // Get the latest coordinates immediately, then every five seconds.
        refreshDispatchLocation();

        dispatchLocationRefreshTimer = setInterval(
            refreshDispatchLocation,
            5000
        );
    }



    // ============================================================
    // SHOW COMPLAINT MAP
    // ============================================================

    async function showComplaintMap(
        latitude,
        longitude,
        complaintID,
        accuracy,
        dispatchTeamID = null
    ) {
        // Stop tracking the previously opened complaint/team.
        stopDispatchLocationTracking();

        // Keep the rest of your existing showComplaintMap code below.

        const mapElement =
            document.getElementById(
                "complaintMap"
            );


        const gpsStatus =
            document.getElementById(
                "modalGPSStatus"
            );


        if (!mapElement) {
            return;
        }


        // ========================================================
        // NO GPS
        // ========================================================

        if (
            latitude === null ||
            longitude === null ||
            latitude === undefined ||
            longitude === undefined ||
            isNaN(latitude) ||
            isNaN(longitude)
        ) {

            mapElement.innerHTML = `
                <div
                    class="
                        h-full
                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        class="
                            text-center
                            text-gray-400
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-location-dot
                                text-2xl
                                mb-2
                            "
                        ></i>

                        <p class="text-sm">
                            GPS location unavailable.
                        </p>

                    </div>

                </div>
            `;


            if (gpsStatus) {

                gpsStatus.textContent =
                    "No GPS location";

            }


            return;

        }


        latitude =
            Number(latitude);


        longitude =
            Number(longitude);


        // ========================================================
        // WAIT FOR GOOGLE MAPS
        // ========================================================

        let attempts = 0;


        while (
            (
                !window.google ||
                !window.google.maps
            ) &&
            attempts < 20
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            attempts++;

        }


        if (
            !window.google ||
            !window.google.maps
        ) {

            mapElement.innerHTML = `
                <div
                    class="
                        h-full
                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        class="
                            text-center
                            text-red-500
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                                text-xl
                                mb-2
                            "
                        ></i>

                        <p class="text-sm">
                            Map could not be loaded.
                        </p>

                    </div>

                </div>
            `;


            return;

        }


        try {

            const {
                Map
            } =
                await google.maps.importLibrary(
                    "maps"
                );


            const {
                AdvancedMarkerElement
            } =
                await google.maps.importLibrary(
                    "marker"
                );


            const position = {

                lat: latitude,
                lng: longitude

            };


            mapElement.innerHTML =
                "";


            complaintMap =
                new Map(
                    mapElement,
                    {

                        center:
                            position,

                        zoom: 17,

                        mapTypeControl:
                            false,

                        streetViewControl:
                            false,

                        fullscreenControl:
                            true,

                        mapId:
                            "DEMO_MAP_ID"

                    }
                );


            complaintMarker =
                new AdvancedMarkerElement({

                    map:
                        complaintMap,

                    position:
                        position,

                    title:
                        `Complaint #${complaintID}`

                });

            // Start tracking the assigned dispatch team separately.
            if (
                dispatchTeamID !== null &&
                dispatchTeamID !== undefined &&
                String(dispatchTeamID).trim() !== "" &&
                String(dispatchTeamID).trim() !== "0"
            ) {
                startDispatchLocationTracking(dispatchTeamID);
            }


            if (gpsStatus) {

                gpsStatus.textContent =
                    "Location detected from GPS";


                gpsStatus.className =
                    "text-xs font-medium text-green-600";

            }


            if (
                accuracy &&
                accuracy > 0
            ) {

                new google.maps.Circle({

                    map:
                        complaintMap,

                    center:
                        position,

                    radius:
                        Number(accuracy),

                    strokeOpacity:
                        0.5,

                    strokeWeight:
                        1,

                    fillOpacity:
                        0.08

                });

            }


            setTimeout(
                () => {

                    if (!complaintMap) {
                        return;
                    }


                    google.maps.event.trigger(
                        complaintMap,
                        "resize"
                    );


                    complaintMap.setCenter(
                        position
                    );

                },
                300
            );

        }
        catch (error) {

            console.error(
                "Google Maps Error:",
                error
            );


            mapElement.innerHTML = `
                <div
                    class="
                        h-full
                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        class="
                            text-center
                            text-red-500
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                                text-xl
                                mb-2
                            "
                        ></i>

                        <p class="text-sm">
                            Unable to display map.
                        </p>

                    </div>

                </div>
            `;

        }

    }


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    function updateStatus(
        id,
        status
    ) {

        fetch(
            "/Complaint/Complaints/update_status_complaints.php",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        complaintID:
                            id,

                        status:
                            status

                    })

            }
        )
            .then(res => {

                if (!res.ok) {

                    throw new Error(
                        `HTTP ${res.status}`
                    );

                }


                return res.json();

            })
            .then(data => {

                if (data.success) {

                    if (modalStatus) {

                        modalStatus.textContent =
                            status;

                    }


                    /*
                     * When a complaint becomes Verified,
                     * immediately enable the dispatch button.
                     *
                     * The complaint has just been verified by this
                     * action, so it has not been assigned yet.
                     */

                    // ========================================================
                    // UPDATE DISPATCH BUTTON AFTER STATUS CHANGE
                    // ========================================================

                    updateDispatchButtonState(
                        status,
                        "",
                        ""
                    );


                    // ========================================================
                    // UPDATE PROGRESS
                    // ========================================================

                    updateComplaintProgress(
                        status,
                        false
                    );


                    loadComplaints();

                }
                else {

                    alert(
                        data.message ||
                        "Unable to update complaint."
                    );

                }

            })
            .catch(err => {

                console.error(
                    "Update status error:",
                    err
                );


                alert(
                    "Unable to update complaint status."
                );

            });

    }


    // ============================================================
    // OPEN DISPATCH MODAL
    // ============================================================

    async function openDispatchModal() {

        // ========================================================
        // BASIC CHECK
        // ========================================================

        if (
            !dispatchModal ||
            !dispatchTeamList
        ) {

            console.error(
                "Dispatch modal elements were not found."
            );

            return;

        }


        // ========================================================
        // SELECTED COMPLAINT CHECK
        // ========================================================

        if (!selectedComplaintID) {

            alert(
                "No complaint selected."
            );

            return;

        }


        // ========================================================
        // SHOW MODAL
        // ========================================================

        dispatchModal.classList.remove(
            "hidden"
        );


        dispatchModal.classList.add(
            "flex"
        );


        dispatchTeamList.innerHTML = `
            <div
                class="
                    text-center
                    py-6
                    text-gray-500
                "
            >

                <i
                    class="
                        fa-solid
                        fa-spinner
                        fa-spin
                        mr-1
                    "
                ></i>

                Loading available teams...

            </div>
        `;


        try {

            const response =
                await fetch(
                    "/Complaint/Dispatchs/get_available_dispatchteams.php",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Unable to load dispatch teams. HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            /*
             * The current endpoint returns a raw array.
             *
             * This also supports an object response such as:
             *
             * {
             *     success: true,
             *     teams: [...]
             * }
             *
             * so the frontend remains compatible with either format.
             */

            const teams =
                Array.isArray(result)
                    ? result
                    : (
                        Array.isArray(result.teams)
                            ? result.teams
                            : []
                    );


            dispatchTeamList.innerHTML =
                "";


            if (
                teams.length === 0
            ) {

                dispatchTeamList.innerHTML = `
                    <div
                        class="
                            text-center
                            py-6
                            text-gray-400
                        "
                    >

                        No available dispatch teams.

                    </div>
                `;


                return;

            }


            teams.forEach(
                team => {

                    const teamID =
                        team.teamID ??
                        "";


                    const teamName =
                        team.teamName ||
                        `Team #${teamID}`;


                    const department =
                        team.department ||
                        "Response Team";


                    const status =
                        team.status ||
                        "Available";


                    dispatchTeamList.innerHTML += `

                        <div
                            class="
                                flex
                                items-center
                                justify-between
                                gap-4
                                border
                                border-gray-200
                                rounded-xl
                                p-4
                                bg-white
                            "
                        >

                            <div
                                class="
                                    min-w-0
                                "
                            >

                                <p
                                    class="
                                        font-semibold
                                        text-gray-800
                                        truncate
                                    "
                                >

                                    ${escapeHTML(
                        teamName
                    )}

                                </p>


                                <p
                                    class="
                                        text-sm
                                        text-gray-500
                                    "
                                >

                                    ${escapeHTML(
                        department
                    )}

                                </p>


                                <p
                                    class="
                                        text-xs
                                        text-green-600
                                        mt-1
                                        font-medium
                                    "
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-circle
                                            text-[7px]
                                            mr-1
                                        "
                                    ></i>

                                    ${escapeHTML(
                        status
                    )}

                                </p>

                            </div>


                            <button

                                type="button"

                                class="
                                    assignBtn
                                    shrink-0
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded-lg
                                    text-xs
                                    font-semibold
                                    transition
                                "

                                data-id="${escapeHTML(
                        teamID
                    )}"
                            >

                                Dispatch

                            </button>

                        </div>

                    `;

                }
            );


            // ====================================================
            // REGISTER TEAM BUTTONS
            // ====================================================

            dispatchTeamList
                .querySelectorAll(
                    ".assignBtn"
                )
                .forEach(btn => {

                    btn.onclick = () => {

                        const teamID =
                            btn.dataset.id;


                        if (
                            isEmptyAssignmentValue(
                                teamID
                            )
                        ) {

                            alert(
                                "Invalid dispatch team."
                            );

                            return;

                        }


                        assignDispatch(
                            teamID
                        );

                    };

                });

        }
        catch (err) {

            console.error(
                "Loading dispatch teams failed:",
                err
            );


            dispatchTeamList.innerHTML = `
                <div
                    class="
                        text-center
                        py-6
                        text-red-500
                    "
                >

                    Unable to load dispatch teams.

                </div>
            `;

        }

    }


    // ============================================================
    // ASSIGN DISPATCH TEAM
    // ============================================================

    async function assignDispatch(
        teamID
    ) {

        // ========================================================
        // COMPLAINT CHECK
        // ========================================================

        if (!selectedComplaintID) {

            alert(
                "No complaint selected."
            );

            return;

        }


        // ========================================================
        // TEAM CHECK
        // ========================================================

        if (
            isEmptyAssignmentValue(
                teamID
            )
        ) {

            alert(
                "Invalid dispatch team."
            );

            return;

        }


        // ========================================================
        // PREVENT DOUBLE CLICK
        // ========================================================

        const assignButtons =
            dispatchTeamList
                ? dispatchTeamList.querySelectorAll(
                    ".assignBtn"
                )
                : [];


        assignButtons.forEach(
            button => {

                button.disabled =
                    true;


                button.classList.add(
                    "opacity-50",
                    "cursor-not-allowed"
                );

            }
        );


        try {

            const response =
                await fetch(
                    "/Complaint/Dispatchs/dispatch_team.php",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify({

                                complaintID:
                                    selectedComplaintID,

                                teamID:
                                    teamID

                            })

                    }
                );


            if (!response.ok) {

                let message =
                    `Dispatch request failed. HTTP ${response.status}`;


                try {

                    const errorResult =
                        await response.json();


                    if (
                        errorResult &&
                        errorResult.message
                    ) {

                        message =
                            errorResult.message;

                    }

                }
                catch (error) {
                    // Keep HTTP message.
                }


                throw new Error(
                    message
                );

            }


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Dispatch successful."
                );


                if (dispatchModal) {

                    dispatchModal.classList.add(
                        "hidden"
                    );


                    dispatchModal.classList.remove(
                        "flex"
                    );

                }


                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }


                /*
                 * Reload the complaint table so:
                 *
                 * - the complaint is no longer "Assign"
                 * - dispatch/team information is refreshed
                 * - Track becomes available
                 */

                loadComplaints();

            }
            else {

                /*
                 * Re-enable buttons if the backend rejects the
                 * request so the user can try again.
                 */

                assignButtons.forEach(
                    button => {

                        button.disabled =
                            false;


                        button.classList.remove(
                            "opacity-50",
                            "cursor-not-allowed"
                        );

                    }
                );


                alert(
                    result.message ||
                    "Unable to dispatch complaint."
                );

            }

        }
        catch (err) {

            console.error(
                "Dispatch error:",
                err
            );


            assignButtons.forEach(
                button => {

                    button.disabled =
                        false;


                    button.classList.remove(
                        "opacity-50",
                        "cursor-not-allowed"
                    );

                }
            );


            alert(
                err.message ||
                "Unable to dispatch complaint."
            );

        }

    }


    // ============================================================
    // OPEN EMERGENCY DISPATCH MODAL
    // ============================================================

    async function openEmergencyDispatchModal() {

        if (
            !emergencyMode ||
            emergencyComplaintIDs.length === 0
        ) {

            return;

        }


        if (!dispatchEmergencyClusterBtn) {
            return;
        }


        try {

            dispatchEmergencyClusterBtn.disabled =
                true;


            dispatchEmergencyClusterBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin mr-1"></i>
                Loading Teams...
            `;


            // ====================================================
            // LOAD AVAILABLE DISPATCH TEAMS
            // ====================================================

            const response =
                await fetch(
                    "/Complaint/Dispatchs/get_available_dispatchteams.php",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Unable to load dispatch teams. HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            const teams =
                Array.isArray(result)
                    ? result
                    : result.teams;


            if (
                !teams ||
                teams.length === 0
            ) {

                alert(
                    "There are currently no available dispatch teams."
                );

                return;

            }


            // ====================================================
            // SHOW EXISTING DISPATCH MODAL
            // ====================================================

            if (!dispatchModal) {

                throw new Error(
                    "Dispatch modal was not found."
                );

            }


            dispatchModal.classList.remove(
                "hidden"
            );


            dispatchModal.classList.add(
                "flex"
            );


            // ====================================================
            // UPDATE MODAL TITLE
            // ====================================================

            const dispatchModalTitle =
                dispatchModal.querySelector(
                    "[data-dispatch-title]"
                );


            if (dispatchModalTitle) {

                dispatchModalTitle.textContent =
                    "Dispatch Emergency Cluster";

            }


            // ====================================================
            // TEAM LIST
            // ====================================================

            if (!dispatchTeamList) {

                throw new Error(
                    "Dispatch team list was not found."
                );

            }


            dispatchTeamList.innerHTML =
                "";


            teams.forEach(
                team => {

                    const teamID =
                        team.teamID;


                    const teamName =
                        team.teamName ||
                        `Team #${teamID}`;


                    const department =
                        team.department ||
                        "Response Team";


                    const teamCard =
                        document.createElement(
                            "div"
                        );


                    teamCard.className =
                        "flex items-center justify-between gap-4 " +
                        "rounded-xl border border-gray-200 " +
                        "bg-white p-4 hover:border-red-300 " +
                        "hover:bg-red-50/30 transition";


                    teamCard.innerHTML = `

                        <div class="min-w-0">

                            <p class="font-semibold text-gray-900">

                                ${escapeHTML(
                        teamName
                    )}

                            </p>


                            <p class="mt-1 text-xs text-gray-500">

                                ${escapeHTML(
                        department
                    )}

                            </p>


                            <p class="mt-1 text-xs font-medium text-green-600">

                                <i
                                    class="
                                        fa-solid
                                        fa-circle
                                        text-[7px]
                                        mr-1
                                    "
                                ></i>

                                Available

                            </p>

                        </div>


                        <button
                            type="button"
                            class="
                                emergency-dispatch-team-btn
                                shrink-0
                                rounded-lg
                                bg-red-600
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                hover:bg-red-700
                                transition
                            "
                            data-team-id="${escapeHTML(
                        teamID
                    )}"
                        >

                            <i class="
                                fa-solid
                                fa-truck-fast
                                mr-1
                            "></i>

                            Dispatch Cluster

                        </button>

                    `;


                    dispatchTeamList.appendChild(
                        teamCard
                    );

                }
            );


            // ====================================================
            // REGISTER CLUSTER DISPATCH BUTTONS
            // ====================================================

            dispatchTeamList
                .querySelectorAll(
                    ".emergency-dispatch-team-btn"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const teamID =
                                button.dataset.teamId;


                            if (
                                isEmptyAssignmentValue(
                                    teamID
                                )
                            ) {

                                alert(
                                    "Invalid dispatch team."
                                );

                                return;

                            }


                            dispatchEmergencyCluster(
                                Number(teamID)
                            );

                        }
                    );

                });

        }
        catch (error) {

            console.error(
                "Emergency dispatch modal error:",
                error
            );


            alert(
                error.message ||
                "Unable to load dispatch teams."
            );

        }
        finally {

            dispatchEmergencyClusterBtn.disabled =
                false;


            dispatchEmergencyClusterBtn.innerHTML = `
                <i class="fa-solid fa-truck-fast mr-1"></i>
                Dispatch Emergency
            `;

        }

    }


    // ============================================================
    // DISPATCH EMERGENCY CLUSTER
    // ============================================================

    async function dispatchEmergencyCluster(
        teamID
    ) {

        if (
            !emergencyMode ||
            emergencyComplaintIDs.length === 0
        ) {

            return;

        }


        if (
            isEmptyAssignmentValue(
                teamID
            )
        ) {

            alert(
                "Invalid dispatch team."
            );

            return;

        }


        const confirmed =
            confirm(
                `Dispatch all ${emergencyComplaintIDs.length} emergency complaints to this response team?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/Complaint/Dispatchs/dispatch_emergency_cluster.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify({

                                complaintIDs:
                                    emergencyComplaintIDs,

                                teamID:
                                    teamID

                            })
                    }
                );


            if (!response.ok) {

                let message =
                    `Emergency dispatch failed. HTTP ${response.status}`;


                try {

                    const errorResult =
                        await response.json();


                    if (
                        errorResult &&
                        errorResult.message
                    ) {

                        message =
                            errorResult.message;

                    }

                }
                catch (error) {
                    // Keep HTTP message.
                }


                throw new Error(
                    message
                );

            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Emergency dispatch failed."
                );

            }


            // ====================================================
            // CLOSE TEAM MODAL
            // ====================================================

            if (dispatchModal) {

                dispatchModal.classList.add(
                    "hidden"
                );


                dispatchModal.classList.remove(
                    "flex"
                );

            }


            // ====================================================
            // UPDATE EMERGENCY BANNER
            // ====================================================

            const bannerText =
                document.getElementById(
                    "emergencyComplaintBannerText"
                );


            if (bannerText) {

                bannerText.textContent =
                    `${result.assignedCount} emergency complaints dispatched to ${result.teamName}.`;

            }


            // ====================================================
            // UPDATE BUTTON
            // ====================================================

            if (dispatchEmergencyClusterBtn) {

                dispatchEmergencyClusterBtn.disabled =
                    true;


                dispatchEmergencyClusterBtn.innerHTML = `
                    <i class="fa-solid fa-check mr-1"></i>
                    Dispatched
                `;

            }


            // ====================================================
            // REFRESH COMPLAINTS
            // ====================================================

            await loadComplaints();


            alert(
                `Emergency cluster dispatched successfully to ${result.teamName}.`
            );

        }
        catch (error) {

            console.error(
                "Emergency cluster dispatch failed:",
                error
            );


            alert(
                error.message ||
                "Failed to dispatch emergency cluster."
            );

        }

    }


    // ============================================================
    // EXPOSE INITIALIZER
    // ============================================================

    window.initComplaint =
        initComplaint;

})();