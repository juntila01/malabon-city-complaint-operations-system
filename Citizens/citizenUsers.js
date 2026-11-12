(() => {

    let citizens = [];
    let filteredCitizens = [];
    let selectedCitizen = null;

    let currentUserRole = null;

    let table;
    let searchInput;
    let statusFilter;

    let modal;
    let closeModal;

    let modalName;
    let modalEmail;
    let modalContact;
    let modalStatus;
    let modalImage;

    let imageViewer;
    let fullImage;
    let expandImageBtn;
    let closeImageViewer;

    let verifyBtn;
    let rejectBtn;


    // =====================================================
    // PAGINATION
    // =====================================================

    let citizenCurrentPage = 1;
    const citizenItemsPerPage = 10;

    let citizenPagination;


    // =====================================================
    // INITIALIZE PAGE
    // =====================================================

    async function initCitizenPage() {

        table =
            document.getElementById("citizensTable");

        searchInput =
            document.getElementById("searchCitizen");

        statusFilter =
            document.getElementById("statusFilter");

        citizenPagination =
            document.getElementById("citizenPagination");


        const clearCitizenFilters =
            document.getElementById("clearCitizenFilters");


        modal =
            document.getElementById("viewModal");

        closeModal =
            document.getElementById("closeModal");


        modalName =
            document.getElementById("modalName");

        modalEmail =
            document.getElementById("modalEmail");

        modalContact =
            document.getElementById("modalContact");

        modalStatus =
            document.getElementById("modalStatus");

        modalImage =
            document.getElementById("modalImage");


        imageViewer =
            document.getElementById("imageViewer");

        fullImage =
            document.getElementById("fullImage");

        expandImageBtn =
            document.getElementById("expandImageBtn");

        closeImageViewer =
            document.getElementById("closeImageViewer");


        verifyBtn =
            document.getElementById("verifyBtn");

        rejectBtn =
            document.getElementById("rejectBtn");


        // =================================================
        // LOAD CURRENT USER ROLE FIRST
        // =================================================

        await loadCurrentUserRole();


        // =================================================
        // LOAD CITIZENS
        // =================================================

        await loadCitizens();


        // =================================================
        // FILTER EVENTS
        // =================================================

        if (searchInput) {

            searchInput.oninput = () => {

                citizenCurrentPage = 1;

                filterCitizens();

            };

        }


        if (statusFilter) {

            statusFilter.onchange = () => {

                citizenCurrentPage = 1;

                filterCitizens();

            };

        }


        if (clearCitizenFilters) {

            clearCitizenFilters.onclick = () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "All";
                }

                citizenCurrentPage = 1;

                filteredCitizens = [...citizens];

                renderTable();

            };

        }


        // =================================================
        // MODAL EVENTS
        // =================================================

        if (closeModal) {

            closeModal.onclick =
                hideModal;

        }


        if (verifyBtn) {

            verifyBtn.onclick =
                verifyCitizen;

        }


        if (rejectBtn) {

            rejectBtn.onclick =
                rejectCitizen;

        }


        // =================================================
        // TABLE EVENT DELEGATION
        // =================================================

        if (table) {

            table.onclick =
                tableClick;

        }


        // =================================================
        // PAGINATION EVENT DELEGATION
        // =================================================

        if (citizenPagination) {

            citizenPagination.onclick = e => {

                const button =
                    e.target.closest("[data-page]");


                if (!button) {
                    return;
                }


                if (
                    button.disabled ||
                    button.dataset.page === undefined
                ) {
                    return;
                }


                const page =
                    Number(button.dataset.page);


                if (!Number.isInteger(page)) {
                    return;
                }


                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            filteredCitizens.length /
                            citizenItemsPerPage
                        )
                    );


                if (
                    page < 1 ||
                    page > totalPages ||
                    page === citizenCurrentPage
                ) {
                    return;
                }


                citizenCurrentPage =
                    page;


                renderTable();

            };

        }


        // =================================================
        // IMAGE VIEWER
        // =================================================

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


        if (modalImage) {

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

                if (
                    e.target === imageViewer
                ) {

                    imageViewer.classList.add(
                        "hidden"
                    );

                }

            };

        }

    }


    // =====================================================
    // GET LOGGED-IN USER ROLE
    // =====================================================

    async function loadCurrentUserRole() {

        try {

            const response =
                await fetch(
                    "/Complaint/Citizens/get_current_user.php",
                    {
                        credentials: "include"
                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                console.error(
                    "Unable to determine current user role."
                );

                currentUserRole =
                    null;

                return;

            }


            currentUserRole =
                String(
                    data.role || ""
                ).toLowerCase();


            console.log(
                "Current user role:",
                currentUserRole
            );

        }
        catch (error) {

            console.error(
                "Failed to load current user role:",
                error
            );

            currentUserRole =
                null;

        }

    }


    // =====================================================
    // LOAD CITIZENS
    // =====================================================

    async function loadCitizens() {

        if (!table) {
            return;
        }


        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-5 py-14 text-center"
                >

                    <div
                        class="flex flex-col items-center justify-center"
                    >

                        <div
                            class="mb-3 flex h-10 w-10 items-center
                                   justify-center rounded-full
                                   bg-blue-50 text-blue-600"
                        >
                            <i class="fa-solid fa-spinner fa-spin"></i>
                        </div>

                        <p
                            class="text-sm font-medium text-gray-600"
                        >
                            Loading citizens...
                        </p>

                    </div>

                </td>
            </tr>
        `;


        if (citizenPagination) {

            citizenPagination.innerHTML =
                "";

        }


        try {

            const response =
                await fetch(
                    "/Complaint/Citizens/get_citizenusers.php",
                    {
                        credentials: "include"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                throw new Error(
                    "Invalid citizen data received."
                );

            }


            citizens =
                data;


            filteredCitizens =
                [...citizens];


            citizenCurrentPage =
                1;


            renderTable();

        }
        catch (error) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-5 py-14 text-center"
                    >

                        <div
                            class="flex flex-col items-center justify-center"
                        >

                            <div
                                class="mb-3 flex h-10 w-10 items-center
                                       justify-center rounded-full
                                       bg-red-50 text-red-500"
                            >
                                <i
                                    class="fa-solid
                                           fa-triangle-exclamation"
                                ></i>
                            </div>

                            <p
                                class="text-sm font-medium text-gray-700"
                            >
                                Failed to load citizens.
                            </p>

                            <p
                                class="mt-1 text-xs text-gray-400"
                            >
                                Please try again later.
                            </p>

                        </div>

                    </td>
                </tr>
            `;


            if (citizenPagination) {

                citizenPagination.innerHTML =
                    "";

            }


            console.error(
                "Failed to load citizens:",
                error
            );

        }

    }


    // =====================================================
    // FILTER CITIZENS
    // =====================================================

    function filterCitizens() {

        if (
            !searchInput ||
            !statusFilter
        ) {
            return;
        }


        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        const status =
            statusFilter.value;


        filteredCitizens =
            citizens.filter(citizen => {

                const fullName =
                    String(
                        citizen.fullName || ""
                    ).toLowerCase();


                const email =
                    String(
                        citizen.email || ""
                    ).toLowerCase();


                const contact =
                    String(
                        citizen.contactNumber || ""
                    ).toLowerCase();


                const matchSearch =
                    fullName.includes(search) ||
                    email.includes(search) ||
                    contact.includes(search);


                const matchStatus =
                    status === "All" ||
                    citizen.verificationStatus === status;


                return (
                    matchSearch &&
                    matchStatus
                );

            });


        renderTable();

    }


    // =====================================================
    // RENDER TABLE
    // =====================================================

    function renderTable() {

        if (!table) {
            return;
        }


        // =================================================
        // EMPTY RESULT
        // =================================================

        if (
            filteredCitizens.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-5 py-14 text-center"
                    >

                        <div
                            class="flex flex-col
                                   items-center
                                   justify-center"
                        >

                            <div
                                class="mb-3 flex h-10 w-10 items-center
                                       justify-center rounded-full
                                       bg-gray-100 text-gray-400"
                            >
                                <i class="fa-solid fa-users"></i>
                            </div>

                            <p
                                class="text-sm font-medium text-gray-600"
                            >
                                No citizens found.
                            </p>

                            <p
                                class="mt-1 text-xs text-gray-400"
                            >
                                Try adjusting your search
                                or filters.
                            </p>

                        </div>

                    </td>
                </tr>
            `;


            updateCitizenPagination();

            return;

        }


        // =================================================
        // PAGE CALCULATION
        // =================================================

        const totalPages =
            Math.ceil(
                filteredCitizens.length /
                citizenItemsPerPage
            );


        if (
            citizenCurrentPage >
            totalPages
        ) {

            citizenCurrentPage =
                totalPages;

        }


        if (
            citizenCurrentPage < 1
        ) {

            citizenCurrentPage =
                1;

        }


        const startIndex =
            (
                citizenCurrentPage - 1
            ) *
            citizenItemsPerPage;


        const endIndex =
            Math.min(
                startIndex +
                citizenItemsPerPage,
                filteredCitizens.length
            );


        const currentCitizens =
            filteredCitizens.slice(
                startIndex,
                endIndex
            );


        // =================================================
        // RENDER CURRENT PAGE
        // =================================================

        table.innerHTML =
            currentCitizens
                .map(citizen => {

                    // ======================================
                    // NORMALIZE STATUS
                    // ======================================

                    const citizenStatus =
                        citizen.verificationStatus === null ||
                            citizen.verificationStatus === undefined ||
                            String(
                                citizen.verificationStatus
                            ).trim() === ""
                            ? "Unverified"
                            : String(
                                citizen.verificationStatus
                            ).trim();


                    // ======================================
                    // STATUS BADGE
                    // ======================================

                    let badge =
                        "bg-gray-100 text-gray-700";


                    switch (
                    citizenStatus.toLowerCase()
                    ) {

                        case "unverified":

                            badge =
                                "bg-gray-100 text-gray-700";

                            break;


                        case "pending":

                            badge =
                                "bg-yellow-50 " +
                                "text-yellow-700 " +
                                "border border-yellow-100";

                            break;


                        case "verified":

                            badge =
                                "bg-green-50 " +
                                "text-green-700 " +
                                "border border-green-100";

                            break;


                        case "rejected":

                            badge =
                                "bg-red-50 " +
                                "text-red-700 " +
                                "border border-red-100";

                            break;


                        default:

                            badge =
                                "bg-slate-100 " +
                                "text-slate-700";

                    }


                    // ======================================
                    // VIEW BUTTON
                    // ADMIN ONLY
                    // ======================================

                    const viewButton =
                        currentUserRole === "admin"
                            ? `
            <button
                type="button"
                class="viewBtn inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                data-id="${escapeHTML(
                                citizen.citizenID
                            )}"
            >
                <i class="fa-solid fa-eye text-[10px]"></i>
                View
            </button>
        `
                            : "";

                    // ======================================
                    // ROW
                    // ======================================

                    return `
                        <tr
                            class="transition-colors hover:bg-gray-50/80"
                        >

                            <td
                                class="whitespace-nowrap
                                       px-5 py-4
                                       text-sm text-gray-600"
                            >
                                #${escapeHTML(
                        citizen.citizenID
                    )}
                            </td>


                            <td
                                class="whitespace-nowrap
                                       px-5 py-4
                                       text-sm font-medium
                                       text-gray-900"
                            >
                                ${escapeHTML(
                        citizen.fullName
                    )}
                            </td>


                            <td
                                class="px-5 py-4
                                       text-sm text-gray-600"
                            >
                                ${escapeHTML(
                        citizen.email
                    )}
                            </td>


                            <td
                                class="whitespace-nowrap
                                       px-5 py-4
                                       text-sm text-gray-600"
                            >
                                ${escapeHTML(
                        citizen.contactNumber
                    )}
                            </td>


                            <td
                                class="whitespace-nowrap
                                       px-5 py-4"
                            >

                                <span
                                    class="inline-flex
                                           items-center
                                           rounded-full
                                           px-2.5
                                           py-1
                                           text-xs
                                           font-medium
                                           ${badge}"
                                >
                                    ${escapeHTML(
                        citizenStatus
                    )}
                                </span>

                            </td>


                            <td
                                class="whitespace-nowrap
                                       px-5 py-4
                                       text-center"
                            >
                                ${viewButton}
                            </td>

                        </tr>
                    `;

                })
                .join("");


        // =================================================
        // UPDATE PAGINATION
        // =================================================

        updateCitizenPagination();

    }


    // =====================================================
    // UPDATE PAGINATION
    // ONLY: < 1 2 3 >
    // =====================================================

    function updateCitizenPagination() {

        if (!citizenPagination) {
            return;
        }


        const total =
            filteredCitizens.length;


        // =================================================
        // NO RESULTS / SINGLE PAGE
        // =================================================

        if (total === 0) {

            citizenPagination.innerHTML =
                "";

            return;

        }


        const totalPages =
            Math.ceil(
                total /
                citizenItemsPerPage
            );


        // =================================================
        // NO PAGINATION NEEDED
        // =================================================

        if (totalPages <= 1) {

            citizenPagination.innerHTML =
                "";

            return;

        }


        let html = "";


        // =================================================
        // PREVIOUS ARROW
        // =================================================

        html += `
            <button
                type="button"
                data-page="${citizenCurrentPage - 1}"
                aria-label="Previous page"
                class="citizen-page-btn
                       inline-flex
                       items-center
                       justify-center"
                ${citizenCurrentPage === 1
                ? "disabled"
                : ""}
            >
                <span
                    class="text-lg leading-none"
                >
                    ‹
                </span>
            </button>
        `;


        // =================================================
        // PAGE NUMBERS
        // =================================================

        if (totalPages <= 7) {

            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                html +=
                    createCitizenPageButton(
                        page
                    );

            }

        }
        else {

            // =============================================
            // FIRST PAGE
            // =============================================

            html +=
                createCitizenPageButton(1);


            // =============================================
            // LEFT ELLIPSIS
            // =============================================

            if (
                citizenCurrentPage > 4
            ) {

                html += `
                    <span
                        class="citizen-page-ellipsis"
                    >
                        ...
                    </span>
                `;

            }


            // =============================================
            // MIDDLE PAGES
            // =============================================

            const startPage =
                Math.max(
                    2,
                    citizenCurrentPage - 1
                );


            const endPage =
                Math.min(
                    totalPages - 1,
                    citizenCurrentPage + 1
                );


            for (
                let page = startPage;
                page <= endPage;
                page++
            ) {

                html +=
                    createCitizenPageButton(
                        page
                    );

            }


            // =============================================
            // RIGHT ELLIPSIS
            // =============================================

            if (
                citizenCurrentPage <
                totalPages - 3
            ) {

                html += `
                    <span
                        class="citizen-page-ellipsis"
                    >
                        ...
                    </span>
                `;

            }


            // =============================================
            // LAST PAGE
            // =============================================

            html +=
                createCitizenPageButton(
                    totalPages
                );

        }


        // =================================================
        // NEXT ARROW
        // =================================================

        html += `
            <button
                type="button"
                data-page="${citizenCurrentPage + 1}"
                aria-label="Next page"
                class="citizen-page-btn
                       inline-flex
                       items-center
                       justify-center"
                ${citizenCurrentPage === totalPages
                ? "disabled"
                : ""}
            >
                <span
                    class="text-lg leading-none"
                >
                    ›
                </span>
            </button>
        `;


        citizenPagination.innerHTML =
            html;

    }


    // =====================================================
    // CREATE PAGE BUTTON
    // =====================================================

    function createCitizenPageButton(page) {

        return `
            <button
                type="button"
                data-page="${page}"
                aria-label="Page ${page}"
                class="citizen-page-btn
                       ${page === citizenCurrentPage
                ? "active"
                : ""}"
            >
                ${page}
            </button>
        `;

    }


    // =====================================================
    // TABLE CLICK
    // =====================================================

    function tableClick(e) {

        if (!table) {
            return;
        }


        const button =
            e.target.closest(".viewBtn");


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        selectedCitizen =
            citizens.find(
                citizen =>
                    String(
                        citizen.citizenID
                    ) ===
                    String(id)
            );


        if (!selectedCitizen) {
            return;
        }


        // =================================================
        // FILL MODAL
        // =================================================

        if (modalName) {

            modalName.textContent =
                selectedCitizen.fullName ||
                "-";

        }


        if (modalEmail) {

            modalEmail.textContent =
                selectedCitizen.email ||
                "-";

        }


        if (modalContact) {

            modalContact.textContent =
                selectedCitizen.contactNumber ||
                "-";

        }


        if (modalStatus) {

            modalStatus.textContent =
                selectedCitizen.verificationStatus ||
                "Unverified";

        }


        // =================================================
        // VERIFICATION IMAGE
        // =================================================

        if (modalImage) {

            if (
                selectedCitizen.attachment
            ) {

                modalImage.src =
                    selectedCitizen.attachment;

            }
            else {

                modalImage.src =
                    "assets/no-image.png";

            }

        }


        // =================================================
        // APPLY PERMISSIONS
        // =================================================

        updateVerificationButtons();


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }

    }


    // =====================================================
    // UPDATE VERIFICATION BUTTONS
    // =====================================================

    function updateVerificationButtons() {

        if (
            !verifyBtn ||
            !rejectBtn ||
            !selectedCitizen
        ) {
            return;
        }


        const status =
            String(
                selectedCitizen.verificationStatus ||
                ""
            ).toLowerCase();


        // =================================================
        // ADMIN
        // =================================================

        if (
            currentUserRole === "admin"
        ) {

            if (
                status === "pending"
            ) {

                enableActionButton(
                    verifyBtn
                );

                enableActionButton(
                    rejectBtn
                );

            }
            else {

                disableActionButton(
                    verifyBtn,
                    "Only pending citizens can be verified"
                );

                disableActionButton(
                    rejectBtn,
                    "Only pending citizens can be rejected"
                );

            }


            return;

        }


        // =================================================
        // STAFF / OTHER ROLES
        // =================================================

        disableActionButton(
            verifyBtn,
            "You do not have permission to verify citizens"
        );

        disableActionButton(
            rejectBtn,
            "You do not have permission to reject citizens"
        );

    }


    // =====================================================
    // DISABLE BUTTON
    // =====================================================

    function disableActionButton(
        button,
        title
    ) {

        if (!button) {
            return;
        }


        button.disabled =
            true;


        button.title =
            title;


        button.classList.add(
            "opacity-50",
            "cursor-not-allowed"
        );


        button.classList.remove(
            "hover:bg-green-700",
            "hover:bg-red-200"
        );

    }


    // =====================================================
    // ENABLE BUTTON
    // =====================================================

    function enableActionButton(
        button
    ) {

        if (!button) {
            return;
        }


        button.disabled =
            false;


        button.title =
            "";


        button.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );

    }


    // =====================================================
    // ACTION POPUP MODAL
    // =====================================================

    function showActionModal(
        type,
        title,
        message,
        confirmText = "OK",
        onConfirm = null,
        showCancel = false
    ) {

        const actionModal =
            document.getElementById(
                "actionModal"
            );


        const icon =
            document.getElementById(
                "actionModalIcon"
            );


        const iconSymbol =
            document.getElementById(
                "actionModalIconSymbol"
            );


        const titleElement =
            document.getElementById(
                "actionModalTitle"
            );


        const messageElement =
            document.getElementById(
                "actionModalMessage"
            );


        const cancelBtn =
            document.getElementById(
                "actionModalCancel"
            );


        const confirmBtn =
            document.getElementById(
                "actionModalConfirm"
            );


        if (
            !actionModal ||
            !icon ||
            !iconSymbol ||
            !titleElement ||
            !messageElement ||
            !cancelBtn ||
            !confirmBtn
        ) {

            console.error(
                "Action modal elements not found."
            );

            return;

        }


        // =================================================
        // SET CONTENT
        // =================================================

        titleElement.textContent =
            title;


        messageElement.textContent =
            message;


        confirmBtn.textContent =
            confirmText;


        // =================================================
        // RESET BUTTON
        // =================================================

        confirmBtn.disabled =
            false;


        cancelBtn.classList.toggle(
            "hidden",
            !showCancel
        );


        // =================================================
        // RESET ICON
        // =================================================

        icon.className =
            "w-14 h-14 rounded-full " +
            "flex items-center justify-center";


        iconSymbol.className =
            "fa-solid text-xl";


        // =================================================
        // SUCCESS
        // =================================================

        if (
            type === "success"
        ) {

            icon.classList.add(
                "bg-green-100",
                "text-green-600"
            );


            iconSymbol.classList.add(
                "fa-check"
            );


            confirmBtn.className =
                "px-5 py-2.5 rounded-lg " +
                "bg-green-600 text-white " +
                "font-medium text-sm " +
                "hover:bg-green-700 " +
                "transition";

        }


        // =================================================
        // ERROR
        // =================================================

        else if (
            type === "error"
        ) {

            icon.classList.add(
                "bg-red-100",
                "text-red-600"
            );


            iconSymbol.classList.add(
                "fa-xmark"
            );


            confirmBtn.className =
                "px-5 py-2.5 rounded-lg " +
                "bg-red-600 text-white " +
                "font-medium text-sm " +
                "hover:bg-red-700 " +
                "transition";

        }


        // =================================================
        // WARNING
        // =================================================

        else if (
            type === "warning"
        ) {

            icon.classList.add(
                "bg-yellow-100",
                "text-yellow-600"
            );


            iconSymbol.classList.add(
                "fa-exclamation"
            );


            if (
                confirmText === "Verify"
            ) {

                confirmBtn.className =
                    "min-w-[150px] px-6 py-3 " +
                    "rounded-xl bg-green-600 " +
                    "text-white font-semibold text-sm " +
                    "hover:bg-green-700 " +
                    "shadow-sm transition-all";

            }

            else if (
                confirmText === "Reject"
            ) {

                confirmBtn.className =
                    "min-w-[150px] px-6 py-3 " +
                    "rounded-xl bg-red-600 " +
                    "text-white font-semibold text-sm " +
                    "hover:bg-red-700 " +
                    "shadow-sm transition-all";

            }

            else {

                confirmBtn.className =
                    "min-w-[150px] px-6 py-3 " +
                    "rounded-xl bg-yellow-500 " +
                    "text-white font-semibold text-sm " +
                    "hover:bg-yellow-600 " +
                    "shadow-sm transition-all";

            }

        }


        // =================================================
        // CANCEL
        // =================================================

        cancelBtn.onclick = () => {

            actionModal.classList.add(
                "hidden"
            );

        };


        // =================================================
        // CONFIRM
        // =================================================

        confirmBtn.onclick = async () => {

            if (onConfirm) {

                confirmBtn.disabled =
                    true;


                await onConfirm();

            }
            else {

                actionModal.classList.add(
                    "hidden"
                );

            }

        };


        // =================================================
        // SHOW
        // =================================================

        actionModal.classList.remove(
            "hidden"
        );

    }


    // =====================================================
    // HIDE ACTION MODAL
    // =====================================================

    function hideActionModal() {

        const actionModal =
            document.getElementById(
                "actionModal"
            );


        if (actionModal) {

            actionModal.classList.add(
                "hidden"
            );

        }

    }


    // =====================================================
    // VERIFY CITIZEN
    // =====================================================

    async function verifyCitizen() {

        if (!selectedCitizen) {
            return;
        }


        if (
            currentUserRole !== "admin"
        ) {

            showActionModal(
                "error",
                "Access Denied",
                "You do not have permission to verify citizens.",
                "OK"
            );

            return;

        }


        if (
            String(
                selectedCitizen.verificationStatus ||
                ""
            ).toLowerCase() !== "pending"
        ) {

            showActionModal(
                "warning",
                "Cannot Verify",
                "Only pending citizens can be verified.",
                "OK"
            );

            return;

        }


        const citizenName =
            selectedCitizen.fullName;


        showActionModal(
            "warning",
            "Verify Citizen",
            `Are you sure you want to verify ${citizenName}?`,
            "Verify",

            async () => {

                try {

                    const response =
                        await fetch(
                            "/Complaint/Citizens/verify_citizen.php",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials:
                                    "include",

                                body:
                                    JSON.stringify({
                                        id:
                                            selectedCitizen.citizenID
                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        data.success === false
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to verify citizen."
                        );

                    }


                    hideModal();


                    showActionModal(
                        "success",
                        "Verification Successful",
                        `${citizenName} has been verified successfully.`,
                        "Done"
                    );


                    await loadCitizens();

                }
                catch (error) {

                    console.error(
                        "Verify citizen error:",
                        error
                    );


                    showActionModal(
                        "error",
                        "Verification Failed",
                        error.message ||
                        "Failed to verify citizen.",
                        "OK"
                    );

                }

            },

            true
        );

    }


    // =====================================================
    // REJECT CITIZEN
    // =====================================================

    async function rejectCitizen() {

        if (!selectedCitizen) {
            return;
        }


        if (
            currentUserRole !== "admin"
        ) {

            showActionModal(
                "error",
                "Access Denied",
                "You do not have permission to reject citizens.",
                "OK"
            );

            return;

        }


        if (
            String(
                selectedCitizen.verificationStatus ||
                ""
            ).toLowerCase() !== "pending"
        ) {

            showActionModal(
                "warning",
                "Cannot Reject",
                "Only pending citizens can be rejected.",
                "OK"
            );

            return;

        }


        const citizenName =
            selectedCitizen.fullName;


        showActionModal(
            "warning",
            "Reject Citizen",
            `Are you sure you want to reject ${citizenName}?`,
            "Reject",

            async () => {

                try {

                    const response =
                        await fetch(
                            "/Complaint/Citizens/reject_citizen.php",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials:
                                    "include",

                                body:
                                    JSON.stringify({
                                        id:
                                            selectedCitizen.citizenID
                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        data.success === false
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to reject citizen."
                        );

                    }


                    hideModal();


                    showActionModal(
                        "success",
                        "Citizen Rejected",
                        `${citizenName} has been rejected.`,
                        "Done"
                    );


                    await loadCitizens();

                }
                catch (error) {

                    console.error(
                        "Reject citizen error:",
                        error
                    );


                    showActionModal(
                        "error",
                        "Rejection Failed",
                        error.message ||
                        "Failed to reject citizen.",
                        "OK"
                    );

                }

            },

            true
        );

    }


    // =====================================================
    // HIDE CITIZEN MODAL
    // =====================================================

    function hideModal() {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );


        selectedCitizen =
            null;

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

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


    // =====================================================
    // EXPOSE INIT
    // =====================================================

    window.initCitizenPage =
        initCitizenPage;

})();