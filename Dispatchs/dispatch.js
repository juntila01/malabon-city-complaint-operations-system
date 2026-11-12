(() => {

    /* ============================================================
       STATE
    ============================================================ */

    let teams = [];
    let filteredTeams = [];
    let selectedTeam = null;

    let isEditingTeam = false;

    let dispatchCurrentPage = 1;
    const dispatchItemsPerPage = 10;

    let dispatchTeamMap = null;
    let dispatchTeamMarker = null;
    let dispatchLocationInterval = null;

    let table = null;
    let tableBody = null;
    let searchInput = null;

    let modal = null;
    let closeModal = null;

    let modalTeamName = null;
    let modalDepartment = null;
    let modalLeader = null;
    let modalContact = null;
    let modalStatus = null;

    let editBtn = null;
    let deleteBtn = null;
    let availableBtn = null;

    let availableModal = null;
    let confirmAvailableBtn = null;
    let cancelAvailableBtn = null;

    let addTeamBtn = null;
    let addTeamModal = null;
    let closeAddTeamModal = null;
    let cancelAddTeam = null;
    let addTeamForm = null;
    let saveTeamBtn = null;

    let toggleTeamPassword = null;
    let toggleTeamConfirmPassword = null;

    let teamPassword = null;
    let teamConfirmPassword = null;

    let teamPasswordStrength = null;
    let teamPasswordMatch = null;
    let teamPasswordRequirements = null;

    let currentRole = "";
    let currentDepartment = "";


    /* ============================================================
       CONSTANTS
    ============================================================ */

    const DISPATCH_DEPARTMENTS = [
        "BFP",
        "MCAT",
        "PSTMO"
    ];

    const ALLOWED_STATUSES = [
        "Available",
        "Dispatched",
        "On Break",
        "Offline"
    ];

    const EDITABLE_STATUSES = [
        "Available",
        "Dispatched",
        "On Break",
        "Offline",
        "Off Duty",
        "Maintenance"
    ];


    /* ============================================================
       ADMIN ACCESS HELPERS
    ============================================================ */

    function isGlobalAdmin() {
        return (
            currentRole === "admin" &&
            currentDepartment === "IT"
        );
    }


    function isDepartmentAdmin() {
        return (
            currentRole === "admin" &&
            DISPATCH_DEPARTMENTS.includes(currentDepartment)
        );
    }


    function isAdmin() {
        return currentRole === "admin";
    }


    /* ============================================================
       DOM HELPER
    ============================================================ */

    function getElement(...ids) {

        for (const id of ids) {

            const element = document.getElementById(id);

            if (element) {
                return element;
            }

        }

        return null;
    }


    /*
     * Find a field by ID first, then by name.
     */

    function getFormField(...names) {

        if (!addTeamForm) {
            return null;
        }

        for (const name of names) {

            const byId = document.getElementById(name);

            if (
                byId &&
                addTeamForm.contains(byId)
            ) {
                return byId;
            }

            const byName = addTeamForm.querySelector(
                `[name="${name}"]`
            );

            if (byName) {
                return byName;
            }

        }

        return null;
    }


    /* ============================================================
       FORM FIELD HELPERS
    ============================================================ */

    function setFormValue(names, value) {

        const field = getFormField(...names);

        if (field) {
            field.value = value ?? "";
        }

    }


    function getFormValue(names) {

        const field = getFormField(...names);

        return String(field?.value ?? "").trim();
    }


    function setPasswordRequired(required) {

        if (teamPassword) {
            teamPassword.required = required;
        }

        if (teamConfirmPassword) {
            teamConfirmPassword.required = required;
        }

    }


    function resetPasswordFeedback() {

        if (teamPasswordStrength) {

            teamPasswordStrength.textContent = "";

            teamPasswordStrength.className =
                "mt-1 h-5 text-xs font-medium invisible";

        }

        if (teamPasswordMatch) {

            teamPasswordMatch.textContent = "";

            teamPasswordMatch.className =
                "mt-2 text-sm font-medium hidden";

        }

        if (teamPasswordRequirements) {
            teamPasswordRequirements.classList.add("hidden");
        }

        [
            "reqTeamLength",
            "reqTeamUpper",
            "reqTeamLower",
            "reqTeamNumber",
            "reqTeamSpecial"
        ].forEach(id => {

            const requirement = document.getElementById(id);

            if (!requirement) {
                return;
            }

            requirement.classList.remove("text-green-600");
            requirement.classList.add("text-gray-500");

            const icon = requirement.querySelector(".team-req-icon");

            if (icon) {
                icon.textContent = "○";
            }

        });

    }


    function setFormMode(editing) {

        isEditingTeam = editing;

        const modalTitle = addTeamModal?.querySelector("h2");

        if (modalTitle) {
            modalTitle.textContent = editing
                ? "Edit Dispatch Team"
                : "Add Dispatch Team";
        }

        const passwordLabel = addTeamForm?.querySelector(
            'label[for="teamPassword"], label[for="password"]'
        );

        if (passwordLabel) {
            passwordLabel.textContent = editing
                ? "New Password (Optional)"
                : "Password";
        }

        const confirmLabel = addTeamForm?.querySelector(
            'label[for="teamConfirmPassword"], label[for="teamConfirmPassword"]'
        );

        if (confirmLabel) {
            confirmLabel.textContent = editing
                ? "Confirm New Password"
                : "Confirm Password";
        }

        setPasswordRequired(!editing);

        if (teamPassword) {
            teamPassword.minLength = 8;
            teamPassword.autocomplete = editing
                ? "new-password"
                : "new-password";
        }

        if (teamConfirmPassword) {
            teamConfirmPassword.minLength = 8;
            teamConfirmPassword.autocomplete = "new-password";
        }

        if (saveTeamBtn) {

            saveTeamBtn.disabled = false;

            saveTeamBtn.innerHTML = editing
                ? '<i class="fa-solid fa-floppy-disk mr-2"></i>Save Changes'
                : '<i class="fa-solid fa-plus mr-2"></i>Add Team';

            saveTeamBtn.className = editing
                ? "px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                : "px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition";

        }

    }


    /* ============================================================
       INIT
    ============================================================ */

    function initDispatch() {

        console.log("=================================");
        console.log("INIT DISPATCH");
        console.log("ROLE:", window.CURRENT_USER_ROLE);
        console.log("DEPARTMENT:", window.CURRENT_USER_DEPARTMENT);
        console.log("=================================");

        currentRole = String(
            window.CURRENT_USER_ROLE || ""
        ).trim().toLowerCase();

        currentDepartment = String(
            window.CURRENT_USER_DEPARTMENT || ""
        ).trim().toUpperCase();

        console.log("Dispatch role:", currentRole);
        console.log("Dispatch department:", currentDepartment);
        console.log("Global IT admin:", isGlobalAdmin());
        console.log("Restricted department admin:", isDepartmentAdmin());


        /* MAIN TABLE */

        table = getElement("dispatchTable");
        tableBody = getElement("dispatchTableBody");
        searchInput = getElement("searchTeam");


        /* VIEW MODAL */

        modal = getElement("viewModal");
        closeModal = getElement("closeModal");

        modalTeamName = getElement("modalTeamName");
        modalDepartment = getElement("modalDepartment");
        modalLeader = getElement("modalLeader");
        modalContact = getElement("modalContact");
        modalStatus = getElement("modalStatus");

        editBtn = getElement("editBtn");
        deleteBtn = getElement("deleteBtn");
        availableBtn = getElement("availableBtn");


        /* AVAILABLE MODAL */

        availableModal = getElement("availableModal");
        confirmAvailableBtn = getElement("confirmAvailableBtn");
        cancelAvailableBtn = getElement("cancelAvailableBtn");


        /* ADD / EDIT TEAM MODAL */

        addTeamBtn = getElement("addTeamBtn");
        addTeamModal = getElement("addTeamModal");
        closeAddTeamModal = getElement("closeAddTeamModal");
        cancelAddTeam = getElement("cancelAddTeam");
        addTeamForm = getElement("addTeamForm");
        saveTeamBtn = getElement("saveTeamBtn");

        toggleTeamPassword = getElement("toggleTeamPassword");
        toggleTeamConfirmPassword = getElement("toggleTeamConfirmPassword");

        teamPassword = getElement("teamPassword");
        teamConfirmPassword = getElement("teamConfirmPassword");

        teamPasswordStrength = getElement("teamPasswordStrength");
        teamPasswordMatch = getElement("teamPasswordMatch");
        teamPasswordRequirements = getElement("teamPasswordRequirements");


        configureDepartmentUI();
        configureRoleUI();

        setupPasswordControls();
        setupContactNumber();
        setupFilters();
        setupViewModal();
        setupAddTeam();

        loadTeams();

        console.log("Dispatch initialization finished.");

    }


    /* ============================================================
       ROLE UI
    ============================================================ */

    function configureRoleUI() {

        if (!addTeamBtn) {
            return;
        }

        if (isAdmin()) {
            addTeamBtn.classList.remove("hidden");
        } else {
            addTeamBtn.classList.add("hidden");
        }

    }


    /* ============================================================
       DEPARTMENT UI
    ============================================================ */

    function configureDepartmentUI() {

        const departmentFilter = getElement("teamDepartmentFilter");
        const globalDepartmentField = getElement("globalDepartmentField");
        const adminDepartmentField = getElement("adminDepartmentField");
        const departmentSelect = getElement("department");
        const adminDepartmentName = getElement("adminDepartmentName");


        /* IT GLOBAL ADMIN */

        if (isGlobalAdmin()) {

            if (globalDepartmentField) {
                globalDepartmentField.classList.remove("hidden");
            }

            if (adminDepartmentField) {
                adminDepartmentField.classList.add("hidden");
            }

            if (departmentSelect) {

                departmentSelect.setAttribute("required", "required");

                if (
                    !DISPATCH_DEPARTMENTS.includes(
                        String(departmentSelect.value).trim().toUpperCase()
                    )
                ) {
                    departmentSelect.value = "";
                }

            }

            if (departmentFilter) {

                departmentFilter.disabled = false;

                departmentFilter.classList.remove(
                    "bg-slate-100",
                    "cursor-not-allowed"
                );

            }

            return;
        }


        /* RESTRICTED DEPARTMENT ADMIN */

        if (isDepartmentAdmin()) {

            if (globalDepartmentField) {
                globalDepartmentField.classList.add("hidden");
            }

            if (adminDepartmentField) {
                adminDepartmentField.classList.remove("hidden");
            }

            if (adminDepartmentName) {
                adminDepartmentName.textContent = currentDepartment;
            }

            if (departmentSelect) {

                departmentSelect.removeAttribute("required");
                departmentSelect.value = currentDepartment;

            }

            if (departmentFilter) {

                departmentFilter.value = currentDepartment;
                departmentFilter.disabled = true;

                departmentFilter.classList.add(
                    "bg-slate-100",
                    "cursor-not-allowed"
                );

            }

            return;
        }


        /* FALLBACK */

        if (globalDepartmentField) {
            globalDepartmentField.classList.remove("hidden");
        }

        if (adminDepartmentField) {
            adminDepartmentField.classList.add("hidden");
        }

        if (departmentSelect) {
            departmentSelect.setAttribute("required", "required");
        }

        if (departmentFilter) {

            departmentFilter.disabled = false;

            departmentFilter.classList.remove(
                "bg-slate-100",
                "cursor-not-allowed"
            );

        }

    }


    /* ============================================================
       FILTER SETUP
    ============================================================ */

    function setupFilters() {

        const departmentFilter = getElement("teamDepartmentFilter");
        const statusFilter = getElement("teamStatusFilter");
        const clearFilters = getElement("clearTeamFilters");

        if (searchInput) {
            searchInput.addEventListener("input", filterTeams);
        }

        if (departmentFilter) {
            departmentFilter.addEventListener("change", filterTeams);
        }

        if (statusFilter) {
            statusFilter.addEventListener("change", filterTeams);
        }

        if (clearFilters) {

            clearFilters.addEventListener("click", () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (departmentFilter) {

                    departmentFilter.value = isDepartmentAdmin()
                        ? currentDepartment
                        : "";

                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                filterTeams();

            });

        }

    }


    /* ============================================================
       LOAD TEAMS
    ============================================================ */

    async function loadTeams() {

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = `
<tr>
    <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">
        Loading teams...
    </td>
</tr>
`;

        try {

            const response = await fetch(
                "/Complaint/Dispatchs/get_dispatchteams.php",
                {
                    method: "GET",
                    cache: "no-store",
                    credentials: "same-origin"
                }
            );

            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch (error) {

                console.error("Invalid team response:", responseText);

                throw new Error(`HTTP ${response.status}`);

            }

            if (Array.isArray(result)) {

                teams = result;

            } else if (result && Array.isArray(result.teams)) {

                teams = result.teams;

            } else {

                throw new Error(
                    result?.message || "Invalid team response."
                );

            }


            /* Restricted admins only see their own department. */

            if (isDepartmentAdmin()) {

                teams = teams.filter(team => {

                    const department = String(
                        team.department || ""
                    ).trim().toUpperCase();

                    return department === currentDepartment;

                });

            }

            filteredTeams = [...teams];

            filterTeams();

        } catch (error) {

            console.error("Load Teams Error:", error);

            tableBody.innerHTML = `
<tr>
    <td colspan="7" class="px-4 py-10 text-center text-sm text-red-500">
        Failed to load teams.
    </td>
</tr>
`;

        }

    }


    /* ============================================================
       FILTER TEAMS
    ============================================================ */

    function filterTeams() {

        const search = String(
            searchInput?.value || ""
        ).trim().toLowerCase();

        const departmentFilter = getElement("teamDepartmentFilter");
        const statusFilter = getElement("teamStatusFilter");

        let department = String(
            departmentFilter?.value || ""
        ).trim().toUpperCase();

        const status = String(statusFilter?.value || "");


        if (isDepartmentAdmin()) {
            department = currentDepartment;
        }

        filteredTeams = teams.filter(team => {

            const teamDepartment = String(
                team.department || ""
            ).trim().toUpperCase();

            const teamName = String(
                team.teamName || ""
            ).toLowerCase();

            const teamLeader = String(
                team.teamLeader || ""
            ).toLowerCase();

            const contact = String(
                team.contactNumber || ""
            ).toLowerCase();

            const teamID = String(
                team.teamID || ""
            ).toLowerCase();

            const matchesSearch =
                !search ||
                teamID.includes(search) ||
                teamName.includes(search) ||
                teamDepartment.toLowerCase().includes(search) ||
                teamLeader.includes(search) ||
                contact.includes(search);

            const matchesDepartment =
                !department || teamDepartment === department;

            const matchesStatus =
                !status || String(team.status || "") === status;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );

        });

        dispatchCurrentPage = 1;

        renderTable();

    }


    /* ============================================================
       RENDER TABLE
    ============================================================ */

    function renderTable() {

        if (!tableBody) {
            return;
        }

        const totalItems = filteredTeams.length;

        const totalPages = Math.max(
            1,
            Math.ceil(totalItems / dispatchItemsPerPage)
        );

        if (dispatchCurrentPage > totalPages) {
            dispatchCurrentPage = totalPages;
        }

        if (dispatchCurrentPage < 1) {
            dispatchCurrentPage = 1;
        }

        if (totalItems === 0) {

            tableBody.innerHTML = `
<tr>
    <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">
        No dispatch teams found.
    </td>
</tr>
`;

            updateDispatchPagination(0);

            return;
        }

        const pageStart = (
            dispatchCurrentPage - 1
        ) * dispatchItemsPerPage;

        const pageItems = filteredTeams.slice(
            pageStart,
            pageStart + dispatchItemsPerPage
        );

        tableBody.innerHTML = pageItems.map(team => {

            let badge = "bg-gray-100 text-gray-700";

            switch (String(team.status || "")) {

                case "Available":
                    badge = "bg-green-100 text-green-700";
                    break;

                case "Dispatched":
                    badge = "bg-blue-100 text-blue-700";
                    break;

                case "On Break":
                    badge = "bg-amber-100 text-amber-700";
                    break;

                case "Off Duty":
                    badge = "bg-gray-100 text-gray-700";
                    break;

                case "Maintenance":
                    badge = "bg-red-100 text-red-700";
                    break;

                case "Offline":
                    badge = "bg-slate-100 text-slate-700";
                    break;

            }

            return `
<tr class="border-b border-gray-100 hover:bg-slate-50 transition-colors">

    <td class="px-4 py-3 text-sm text-gray-600">
        #${escapeHTML(team.teamID)}
    </td>

    <td class="px-4 py-3 text-sm font-medium text-gray-900">
        ${escapeHTML(team.teamName)}
    </td>

    <td class="px-4 py-3 text-sm text-gray-700">
        ${escapeHTML(team.department)}
    </td>

    <td class="px-4 py-3 text-sm text-gray-700">
        ${escapeHTML(team.teamLeader)}
    </td>

    <td class="px-4 py-3 text-sm text-gray-700">
        ${escapeHTML(team.contactNumber)}
    </td>

    <td class="px-4 py-3">
        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge}">
            ${escapeHTML(team.status)}
        </span>
    </td>

    <td class="px-4 py-3 text-right">
        <button
            type="button"
            class="viewBtn inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            data-id="${escapeHTML(team.teamID)}"
        >
            <i class="fa-solid fa-eye text-[10px]"></i>
            View
        </button>
    </td>

</tr>
`;

        }).join("");

        updateDispatchPagination(totalItems);

    }


    /* ============================================================
       PAGINATION
    ============================================================ */

    function updateDispatchPagination(totalItems = 0) {

        const pagination = getElement("dispatchPagination");
        const pageInfo = getElement("dispatchPageInfo");

        if (!pagination) {
            return;
        }

        const totalPages = Math.max(
            1,
            Math.ceil(totalItems / dispatchItemsPerPage)
        );

        const pageFrom = totalItems === 0
            ? 0
            : ((dispatchCurrentPage - 1) * dispatchItemsPerPage) + 1;

        const pageTo = totalItems === 0
            ? 0
            : Math.min(
                dispatchCurrentPage * dispatchItemsPerPage,
                totalItems
            );

        if (pageInfo) {
            pageInfo.textContent =
                `Showing ${pageFrom}-${pageTo} of ${totalItems}`;
        }

        pagination.innerHTML = "";

        if (totalItems === 0) {
            return;
        }

        const createButton = (
            label,
            page,
            disabled = false,
            active = false,
            ariaLabel = ""
        ) => {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;

            button.className = active
                ? "dispatch-page-active text-white"
                : "bg-white text-gray-600";

            if (ariaLabel) {
                button.setAttribute("aria-label", ariaLabel);
            }

            if (!disabled) {

                button.addEventListener("click", () => {

                    dispatchCurrentPage = page;

                    renderTable();

                });

            }

            pagination.appendChild(button);

        };

        createButton(
            "‹",
            dispatchCurrentPage - 1,
            dispatchCurrentPage === 1,
            false,
            "Previous page"
        );

        if (totalPages <= 7) {

            for (let page = 1; page <= totalPages; page++) {

                createButton(
                    String(page),
                    page,
                    false,
                    page === dispatchCurrentPage,
                    `Page ${page}`
                );

            }

        } else {

            createButton(
                "1",
                1,
                false,
                dispatchCurrentPage === 1,
                "Page 1"
            );

            if (dispatchCurrentPage > 4) {

                const ellipsis = document.createElement("span");

                ellipsis.className =
                    "px-1 text-xs text-gray-400";

                ellipsis.textContent = "…";

                pagination.appendChild(ellipsis);

            }

            const startPage = Math.max(
                2,
                dispatchCurrentPage - 1
            );

            const endPage = Math.min(
                totalPages - 1,
                dispatchCurrentPage + 1
            );

            for (
                let page = startPage;
                page <= endPage;
                page++
            ) {

                createButton(
                    String(page),
                    page,
                    false,
                    page === dispatchCurrentPage,
                    `Page ${page}`
                );

            }

            if (dispatchCurrentPage < totalPages - 3) {

                const ellipsis = document.createElement("span");

                ellipsis.className =
                    "px-1 text-xs text-gray-400";

                ellipsis.textContent = "…";

                pagination.appendChild(ellipsis);

            }

            createButton(
                String(totalPages),
                totalPages,
                false,
                dispatchCurrentPage === totalPages,
                `Page ${totalPages}`
            );

        }

        createButton(
            "›",
            dispatchCurrentPage + 1,
            dispatchCurrentPage === totalPages,
            false,
            "Next page"
        );

    }


    /* ============================================================
       VIEW MODAL
    ============================================================ */

    function setupViewModal() {

        if (closeModal) {
            closeModal.onclick = hideModal;
        }

        if (table) {
            table.onclick = tableClick;
        }

        if (deleteBtn) {
            deleteBtn.onclick = deleteTeam;
        }

        if (editBtn) {
            editBtn.onclick = editTeam;
        }

        if (availableBtn) {

            availableBtn.onclick = () => {

                if (availableModal) {
                    availableModal.classList.remove("hidden");
                }

            };

        }

        if (cancelAvailableBtn) {

            cancelAvailableBtn.onclick = () => {

                if (availableModal) {
                    availableModal.classList.add("hidden");
                }

            };

        }

        if (confirmAvailableBtn) {
            confirmAvailableBtn.onclick = markAvailable;
        }

    }


    /* ============================================================
       TABLE CLICK
    ============================================================ */

    function tableClick(event) {

        const button = event.target.closest(".viewBtn");

        if (!button) {
            return;
        }

        const id = button.dataset.id;

        selectedTeam = teams.find(
            team => String(team.teamID) === String(id)
        );

        if (!selectedTeam) {
            return;
        }

        if (
            isDepartmentAdmin() &&
            String(selectedTeam.department || "")
                .trim()
                .toUpperCase() !== currentDepartment
        ) {

            alert(
                "You are not authorized to view this dispatch team."
            );

            selectedTeam = null;

            return;
        }

        updateViewModalDetails(selectedTeam);

        if (availableBtn) {

            if (selectedTeam.status === "Dispatched") {
                availableBtn.classList.remove("hidden");
            } else {
                availableBtn.classList.add("hidden");
            }

        }

        if (modal) {
            modal.classList.remove("hidden");
        }

        initializeDispatchTeamMap(selectedTeam);

        startDispatchLocationTracking();

    }


    /* ============================================================
       UPDATE VIEW MODAL DETAILS
    ============================================================ */

    function updateViewModalDetails(team) {

        if (!team) {
            return;
        }

        if (modalTeamName) {
            modalTeamName.textContent = team.teamName || "—";
        }

        if (modalDepartment) {
            modalDepartment.textContent = team.department || "—";
        }

        if (modalLeader) {
            modalLeader.textContent = team.teamLeader || "—";
        }

        if (modalContact) {
            modalContact.textContent = team.contactNumber || "—";
        }

        if (modalStatus) {
            modalStatus.textContent = team.status || "—";
        }

        if (availableBtn) {

            if (team.status === "Dispatched") {
                availableBtn.classList.remove("hidden");
            } else {
                availableBtn.classList.add("hidden");
            }

        }

    }


    /* ============================================================
       HIDE VIEW MODAL
    ============================================================ */

    function hideModal() {

        if (modal) {
            modal.classList.add("hidden");
        }

        stopDispatchLocationTracking();

        selectedTeam = null;

    }


    /* ============================================================
       MAP
    ============================================================ */

    function initializeDispatchTeamMap(team) {

        const mapElement = getElement("dispatchTeamMap");
        const coordinatesElement = getElement("dispatchTeamCoordinates");
        const lastUpdateElement = getElement("dispatchTeamLastUpdate");

        if (!mapElement) {
            return;
        }

        const latitude = parseFloat(team.currentLatitude);
        const longitude = parseFloat(team.currentLongitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            mapElement.innerHTML = `
<div class="w-full h-full flex items-center justify-center">
    <div class="text-center">
        <div class="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <i class="fa-solid fa-location-crosshairs text-slate-400"></i>
        </div>
        <p class="mt-2 text-sm text-slate-500">
            Dispatch team location unavailable
        </p>
    </div>
</div>
`;

            if (coordinatesElement) {
                coordinatesElement.textContent = "Location unavailable";
            }

            if (lastUpdateElement) {
                lastUpdateElement.textContent = "";
            }

            if (dispatchTeamMarker) {
                dispatchTeamMarker.setMap(null);
            }

            dispatchTeamMarker = null;
            dispatchTeamMap = null;

            return;
        }

        if (coordinatesElement) {
            coordinatesElement.textContent =
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }

        if (lastUpdateElement && team.lastLocationUpdate) {
            lastUpdateElement.textContent =
                `Updated ${formatLocationTime(team.lastLocationUpdate)}`;
        }

        if (
            typeof google === "undefined" ||
            !google.maps
        ) {
            return;
        }

        if (!dispatchTeamMap) {

            dispatchTeamMap = new google.maps.Map(
                mapElement,
                {
                    center: {
                        lat: latitude,
                        lng: longitude
                    },
                    zoom: 16,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true
                }
            );

        } else {

            dispatchTeamMap.setCenter({
                lat: latitude,
                lng: longitude
            });

        }

        const markerIcon = {
            url: "/Complaint/assets/dispatch.webp",
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        };

        const markerPosition = {
            lat: latitude,
            lng: longitude
        };

        if (!dispatchTeamMarker) {

            dispatchTeamMarker = new google.maps.Marker({
                position: markerPosition,
                map: dispatchTeamMap,
                title: team.teamName || "Dispatch Team",
                icon: markerIcon,
                optimized: false,
                visible: true,
                zIndex: 1000
            });

        } else {

            dispatchTeamMarker.setOptions({
                position: markerPosition,
                map: dispatchTeamMap,
                title: team.teamName || "Dispatch Team",
                icon: markerIcon,
                visible: true,
                zIndex: 1000
            });

        }

        setTimeout(() => {

            if (!dispatchTeamMap) {
                return;
            }

            google.maps.event.trigger(
                dispatchTeamMap,
                "resize"
            );

            dispatchTeamMap.setCenter({
                lat: latitude,
                lng: longitude
            });

        }, 200);

    }


    /* ============================================================
       LOCATION TIME
    ============================================================ */

    function formatLocationTime(dateString) {

        if (!dateString) {
            return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleTimeString(
            "en-PH",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    /* ============================================================
       UPDATE LOCATION
    ============================================================ */

    async function updateDispatchTeamLocation() {

        if (!selectedTeam) {
            return;
        }

        const requestedTeamID = String(selectedTeam.teamID);

        try {

            const response = await fetch(
                `/Complaint/Dispatchs/get_dispatch_team_location.php?teamID=${encodeURIComponent(
                    requestedTeamID
                )}`,
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

            if (
                !result.success ||
                !result.active ||
                !result.location
            ) {
                return;
            }

            /*
             * Do not apply a delayed location response
             * to a different team selected in the meantime.
             */

            if (
                !selectedTeam ||
                String(selectedTeam.teamID) !== requestedTeamID
            ) {
                return;
            }

            selectedTeam.currentLatitude =
                result.location.latitude;

            selectedTeam.currentLongitude =
                result.location.longitude;

            selectedTeam.locationAccuracy =
                result.location.accuracy;

            selectedTeam.lastLocationUpdate =
                result.location.lastUpdate;

            initializeDispatchTeamMap(selectedTeam);

        } catch (error) {

            console.error(
                "Dispatch location update error:",
                error
            );

        }

    }


    /* ============================================================
       LOCATION TRACKING
    ============================================================ */

    function stopDispatchLocationTracking() {

        if (dispatchLocationInterval) {

            clearInterval(dispatchLocationInterval);

            dispatchLocationInterval = null;

        }

    }


    function startDispatchLocationTracking() {

        stopDispatchLocationTracking();

        updateDispatchTeamLocation();

        dispatchLocationInterval = setInterval(
            updateDispatchTeamLocation,
            5000
        );

    }


    /* ============================================================
       DELETE TEAM
    ============================================================ */

    async function deleteTeam() {

        if (!selectedTeam) {
            return;
        }

        if (!isAdmin()) {
            alert("Only administrators can delete dispatch teams.");
            return;
        }

        if (
            isDepartmentAdmin() &&
            String(selectedTeam.department || "")
                .trim()
                .toUpperCase() !== currentDepartment
        ) {

            alert(
                "You are not authorized to delete this dispatch team."
            );

            return;
        }

        if (!confirm("Delete this dispatch team?")) {
            return;
        }

        try {

            const response = await fetch(
                "/Complaint/Dispatchs/delete_dispatchteam.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        teamID: selectedTeam.teamID
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {

                alert(
                    result.message ||
                    "Failed to delete dispatch team."
                );

                return;
            }

            hideModal();

            await loadTeams();

        } catch (error) {

            console.error("Delete Team Error:", error);

            alert("Unable to connect to the server.");

        }

    }


    /* ============================================================
       EDIT TEAM
    ============================================================ */

    function editTeam() {

        if (!selectedTeam) {
            return;
        }

        if (!isAdmin()) {
            alert("Only administrators can edit dispatch teams.");
            return;
        }

        if (
            isDepartmentAdmin() &&
            String(selectedTeam.department || "")
                .trim()
                .toUpperCase() !== currentDepartment
        ) {

            alert(
                "You are not authorized to edit this dispatch team."
            );

            return;
        }

        if (!addTeamModal || !addTeamForm) {
            alert("The dispatch team form could not be opened.");
            return;
        }

        /*
         * Enter edit mode before populating the form.
         */

        setFormMode(true);

        addTeamForm.reset();

        resetPasswordFeedback();


        /* Populate the selected team's details. */

        setFormValue(["teamName"], selectedTeam.teamName);
        setFormValue(["teamLeader"], selectedTeam.teamLeader);
        setFormValue(["contactNumber"], selectedTeam.contactNumber);
        setFormValue(["email", "teamEmail"], selectedTeam.email);
        setFormValue(
            ["teamStatus", "status"],
            selectedTeam.status || "Available"
        );


        /* Set the correct department. */

        const departmentSelect = getFormField("department");

        if (departmentSelect) {

            if (isDepartmentAdmin()) {

                departmentSelect.value = currentDepartment;

            } else {

                departmentSelect.value =
                    String(selectedTeam.department || "").toUpperCase();

            }

        }


        /*
         * Blank password fields mean the existing password
         * will be preserved by update_dispatch_team.php.
         */

        if (teamPassword) {
            teamPassword.value = "";
        }

        if (teamConfirmPassword) {
            teamConfirmPassword.value = "";
        }


        /*
         * Show the edit form over the existing profile modal.
         */

        addTeamModal.classList.remove("hidden");

        const teamNameInput = getFormField("teamName");

        if (teamNameInput) {

            setTimeout(() => {
                teamNameInput.focus();
            }, 100);

        }

    }


    /* ============================================================
       UPDATE TEAM
    ============================================================ */

    async function updateTeam(event) {

        event.preventDefault();

        if (!selectedTeam || !isEditingTeam) {
            return;
        }

        if (!isAdmin()) {
            alert("Only administrators can edit dispatch teams.");
            return;
        }

        const teamID = selectedTeam.teamID;

        const teamName = getFormValue(["teamName"]);
        const teamLeader = getFormValue(["teamLeader"]);
        const contactNumber = getFormValue(["contactNumber"]);
        const email = getFormValue(["email", "teamEmail"]);
        const status = getFormValue(["teamStatus", "status"]) || "Available";

        const password = String(teamPassword?.value || "");
        const confirmPassword = String(teamConfirmPassword?.value || "");

        const departmentSelect = getFormField("department");

        let department = String(
            departmentSelect?.value || ""
        ).trim().toUpperCase();


        /* Required fields */

        if (!teamName) {
            alert("Team name is required.");
            getFormField("teamName")?.focus();
            return;
        }

        if (!email) {
            alert("Email address is required.");
            getFormField("email", "teamEmail")?.focus();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            getFormField("email", "teamEmail")?.focus();
            return;
        }

        if (
            contactNumber &&
            !/^[0-9]{11}$/.test(contactNumber)
        ) {
            alert("Contact number must be exactly 11 digits.");
            getFormField("contactNumber")?.focus();
            return;
        }


        /* Department authorization */

        if (isDepartmentAdmin()) {
            department = currentDepartment;
        }

        if (!DISPATCH_DEPARTMENTS.includes(department)) {
            alert("Please select a valid dispatch department.");
            departmentSelect?.focus();
            return;
        }

        if (
            isDepartmentAdmin() &&
            String(selectedTeam.department || "")
                .trim()
                .toUpperCase() !== currentDepartment
        ) {
            alert("You are not authorized to edit this dispatch team.");
            return;
        }


        /* Status validation */

        if (!EDITABLE_STATUSES.includes(status)) {
            alert("Invalid team status.");
            return;
        }


        /*
         * Only validate the password if the user entered one.
         * An empty password means no password change.
         */

        if (password !== "") {

            const strongPassword =
                password.length >= 8 &&
                /[A-Z]/.test(password) &&
                /[a-z]/.test(password) &&
                /[0-9]/.test(password) &&
                /[^A-Za-z0-9]/.test(password);

            if (!strongPassword) {

                alert(
                    "The new password must contain at least 8 characters, uppercase and lowercase letters, a number, and a special character."
                );

                teamPassword?.focus();

                return;
            }

            if (password !== confirmPassword) {

                alert("Passwords do not match.");

                teamConfirmPassword?.focus();

                return;
            }

        }


        /* Prevent duplicate submissions. */

        if (saveTeamBtn) {

            saveTeamBtn.disabled = true;

            saveTeamBtn.innerHTML = `
<i class="fa-solid fa-spinner fa-spin mr-2"></i>
Saving Changes...
`;

        }

        try {

            const formData = new FormData();

            formData.set("teamID", String(teamID));
            formData.set("teamName", teamName);
            formData.set("department", department);
            formData.set("teamLeader", teamLeader);
            formData.set("contactNumber", contactNumber);
            formData.set("email", email);
            formData.set("status", status);

            if (password !== "") {
                formData.set("password", password);
            }

            const response = await fetch(
                "/Complaint/Dispatchs/update_dispatch_team.php",
                {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                }
            );

            const responseText = await response.text();

            let result;

            try {

                result = JSON.parse(responseText);

            } catch (error) {

                console.error(
                    "Invalid update team response:",
                    responseText
                );

                throw new Error(
                    `Server returned HTTP ${response.status}.`
                );

            }

            if (!response.ok || !result.success) {

                alert(
                    result.message ||
                    "Failed to update dispatch team."
                );

                return;
            }


            /*
             * Reset the edit mode and hide the edit form.
             */

            addTeamModal.classList.add("hidden");

            if (addTeamForm) {
                addTeamForm.reset();
            }

            resetPasswordFeedback();

            setPasswordRequired(true);

            isEditingTeam = false;


            /*
             * Reload the latest team records.
             */

            await loadTeams();


            /*
             * Re-select the updated team from the latest results.
             */

            selectedTeam = teams.find(
                team => String(team.teamID) === String(teamID)
            ) || null;


            /*
             * Update the profile modal with the saved values.
             */

            if (selectedTeam) {

                updateViewModalDetails(selectedTeam);

                initializeDispatchTeamMap(selectedTeam);

            } else {

                /*
                 * The team may no longer appear in the filtered list.
                 * Keep the updated profile values visible.
                 */

                selectedTeam = {
                    ...selectedTeam,
                    teamID,
                    teamName,
                    department,
                    teamLeader,
                    contactNumber,
                    email,
                    status
                };

                updateViewModalDetails(selectedTeam);

            }


            /*
             * Do not interrupt location tracking for the profile.
             * The tracking interval continues to use selectedTeam.
             */

            showSuccessModal(
                "Dispatch team updated successfully.",
                "Dispatch Team Updated Successfully"
            );

        } catch (error) {

            console.error("Update Team Error:", error);

            alert(
                error.message ||
                "Unable to connect to the server."
            );

        } finally {

            if (saveTeamBtn) {

                saveTeamBtn.disabled = false;

                saveTeamBtn.innerHTML = isEditingTeam
                    ? '<i class="fa-solid fa-floppy-disk mr-2"></i>Save Changes'
                    : '<i class="fa-solid fa-plus mr-2"></i>Add Team';

            }

        }

    }


    /* ============================================================
       MARK AVAILABLE
    ============================================================ */

    async function markAvailable() {

        if (!selectedTeam) {
            return;
        }

        if (!isAdmin()) {
            alert("Only administrators can update dispatch teams.");
            return;
        }

        if (
            isDepartmentAdmin() &&
            String(selectedTeam.department || "")
                .trim()
                .toUpperCase() !== currentDepartment
        ) {

            alert(
                "You are not authorized to update this dispatch team."
            );

            return;
        }

        if (confirmAvailableBtn) {

            confirmAvailableBtn.disabled = true;
            confirmAvailableBtn.textContent = "Updating...";

        }

        try {

            const response = await fetch(
                "/Complaint/Dispatchs/mark_team_available.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        teamID: selectedTeam.teamID
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {

                alert(
                    result.message ||
                    "Failed to update team."
                );

                return;
            }

            if (availableModal) {
                availableModal.classList.add("hidden");
            }

            hideModal();

            await loadTeams();

        } catch (error) {

            console.error("Mark Available Error:", error);

            alert("Unable to connect to server.");

        } finally {

            if (confirmAvailableBtn) {

                confirmAvailableBtn.disabled = false;

                confirmAvailableBtn.textContent =
                    "Yes, Mark Available";

            }

        }

    }


    /* ============================================================
       ADD TEAM SETUP
    ============================================================ */

    function setupAddTeam() {

        if (addTeamBtn && isAdmin()) {

            addTeamBtn.onclick = event => {

                event.preventDefault();

                showAddTeamModal();

            };

        }

        if (closeAddTeamModal) {
            closeAddTeamModal.onclick = hideAddTeamModal;
        }

        if (cancelAddTeam) {
            cancelAddTeam.onclick = hideAddTeamModal;
        }

        if (addTeamForm) {

            addTeamForm.addEventListener("submit", event => {

                if (isEditingTeam) {
                    updateTeam(event);
                } else {
                    addTeam(event);
                }

            });

        }

    }


    /* ============================================================
       SHOW ADD TEAM MODAL
    ============================================================ */

    function showAddTeamModal() {

        if (!addTeamModal) {
            return;
        }

        if (!isAdmin()) {
            alert("You do not have permission to add dispatch teams.");
            return;
        }

        setFormMode(false);

        if (addTeamForm) {
            addTeamForm.reset();
        }

        resetPasswordFeedback();

        const departmentSelect = getElement("department");
        const adminDepartmentName = getElement("adminDepartmentName");


        /* IT GLOBAL ADMIN */

        if (isGlobalAdmin()) {

            if (departmentSelect) {

                departmentSelect.value = "";

                departmentSelect.setAttribute(
                    "required",
                    "required"
                );

            }

        }


        /* RESTRICTED ADMIN */

        else if (isDepartmentAdmin()) {

            if (departmentSelect) {

                departmentSelect.value = currentDepartment;

                departmentSelect.removeAttribute("required");

            }

            if (adminDepartmentName) {
                adminDepartmentName.textContent = currentDepartment;
            }

        }

        setPasswordRequired(true);

        if (saveTeamBtn) {

            saveTeamBtn.disabled = true;

            saveTeamBtn.innerHTML = `
<i class="fa-solid fa-plus mr-2"></i>
Add Team
`;

            saveTeamBtn.className =
                "px-5 py-2.5 rounded-lg bg-gray-400 text-white cursor-not-allowed transition";

        }

        addTeamModal.classList.remove("hidden");

        const teamNameInput = getFormField("teamName");

        if (teamNameInput) {

            setTimeout(() => {
                teamNameInput.focus();
            }, 100);

        }

    }


    /* ============================================================
       HIDE ADD / EDIT TEAM MODAL
    ============================================================ */

    function hideAddTeamModal() {

        if (addTeamModal) {
            addTeamModal.classList.add("hidden");
        }

        /*
         * Return to Add mode after the edit form is closed.
         */

        isEditingTeam = false;

        if (addTeamForm) {
            addTeamForm.reset();
        }

        resetPasswordFeedback();

        setPasswordRequired(true);

        if (saveTeamBtn) {

            saveTeamBtn.disabled = false;

            saveTeamBtn.innerHTML =
                '<i class="fa-solid fa-plus mr-2"></i>Add Team';

        }

    }


    /* ============================================================
       PASSWORD CONTROLS
    ============================================================ */

    function setupPasswordControls() {

        if (toggleTeamPassword && teamPassword) {

            toggleTeamPassword.onclick = () => {

                const hidden = teamPassword.type === "password";

                teamPassword.type = hidden ? "text" : "password";

                const icon = toggleTeamPassword.querySelector("i");

                if (icon) {

                    icon.classList.toggle("fa-eye", !hidden);
                    icon.classList.toggle("fa-eye-slash", hidden);

                }

            };

        }

        if (
            toggleTeamConfirmPassword &&
            teamConfirmPassword
        ) {

            toggleTeamConfirmPassword.onclick = () => {

                const hidden =
                    teamConfirmPassword.type === "password";

                teamConfirmPassword.type =
                    hidden ? "text" : "password";

                const icon =
                    toggleTeamConfirmPassword.querySelector("i");

                if (icon) {

                    icon.classList.toggle("fa-eye", !hidden);
                    icon.classList.toggle("fa-eye-slash", hidden);

                }

            };

        }

        if (teamPassword) {

            teamPassword.addEventListener(
                "input",
                validateTeamPassword
            );

        }

        if (teamConfirmPassword) {

            teamConfirmPassword.addEventListener(
                "input",
                validateTeamPassword
            );

        }

    }


    /* ============================================================
       CONTACT NUMBER
    ============================================================ */

    function setupContactNumber() {

        const contactInput = getFormField("contactNumber");

        if (!contactInput) {
            return;
        }

        contactInput.addEventListener("input", function () {

            this.value = this.value
                .replace(/\D/g, "")
                .slice(0, 11);

        });

    }


    /* ============================================================
       PASSWORD REQUIREMENT
    ============================================================ */

    function updateTeamRequirement(id, valid) {

        const requirement = document.getElementById(id);

        if (!requirement) {
            return;
        }

        const icon = requirement.querySelector(".team-req-icon");

        if (valid) {

            requirement.classList.remove("text-gray-500");
            requirement.classList.add("text-green-600");

            if (icon) {
                icon.textContent = "✓";
            }

        } else {

            requirement.classList.remove("text-green-600");
            requirement.classList.add("text-gray-500");

            if (icon) {
                icon.textContent = "○";
            }

        }

    }


    /* ============================================================
       PASSWORD VALIDATION
    ============================================================ */

    function validateTeamPassword() {

        const password = teamPassword?.value || "";
        const confirm = teamConfirmPassword?.value || "";

        const editing = isEditingTeam;


        if (teamPasswordRequirements) {

            if (password === "") {
                teamPasswordRequirements.classList.add("hidden");
            } else {
                teamPasswordRequirements.classList.remove("hidden");
            }

        }

        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        updateTeamRequirement("reqTeamLength", hasLength);
        updateTeamRequirement("reqTeamUpper", hasUpper);
        updateTeamRequirement("reqTeamLower", hasLower);
        updateTeamRequirement("reqTeamNumber", hasNumber);
        updateTeamRequirement("reqTeamSpecial", hasSpecial);

        let score = 0;

        if (hasLength) score++;
        if (hasUpper) score++;
        if (hasLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;

        if (teamPasswordStrength) {

            if (password === "") {

                teamPasswordStrength.textContent = "";

                teamPasswordStrength.className =
                    "mt-1 h-5 text-xs font-medium invisible";

            } else {

                teamPasswordStrength.classList.remove(
                    "invisible",
                    "hidden"
                );

                if (score <= 2) {

                    teamPasswordStrength.textContent =
                        "Weak Password";

                    teamPasswordStrength.className =
                        "mt-1 h-5 text-xs font-medium text-red-600";

                } else if (score <= 4) {

                    teamPasswordStrength.textContent =
                        "Medium Password";

                    teamPasswordStrength.className =
                        "mt-1 h-5 text-xs font-medium text-yellow-600";

                } else {

                    teamPasswordStrength.textContent =
                        "Strong Password ✓";

                    teamPasswordStrength.className =
                        "mt-1 h-5 text-xs font-medium text-green-600";

                }

            }

        }

        if (teamPasswordMatch) {

            if (confirm === "") {

                teamPasswordMatch.textContent = "";

                teamPasswordMatch.className =
                    "mt-1 h-5 text-sm font-medium hidden";

            } else {

                teamPasswordMatch.classList.remove("hidden");

                if (password === confirm) {

                    teamPasswordMatch.textContent =
                        "✔ Passwords match";

                    teamPasswordMatch.className =
                        "mt-2 text-sm font-medium text-green-600";

                } else {

                    teamPasswordMatch.textContent =
                        "✖ Passwords do not match";

                    teamPasswordMatch.className =
                        "mt-2 text-sm font-medium text-red-600";

                }

            }

        }

        const strongPassword =
            hasLength &&
            hasUpper &&
            hasLower &&
            hasNumber &&
            hasSpecial;

        const passwordsMatch =
            password !== "" &&
            password === confirm;


        /*
         * In edit mode, a blank password is allowed.
         * If the user enters a new password, it must be strong
         * and match its confirmation.
         */

        const validPasswordState = editing
            ? (
                password === "" && confirm === ""
            ) || (
                strongPassword && passwordsMatch
            )
            : (
                strongPassword && passwordsMatch
            );

        if (saveTeamBtn) {

            saveTeamBtn.disabled = !validPasswordState;

            if (validPasswordState) {

                saveTeamBtn.className =
                    "px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition";

            } else {

                saveTeamBtn.className =
                    "px-5 py-2.5 rounded-lg bg-gray-400 text-white cursor-not-allowed transition";

            }

        }

    }


    /* ============================================================
       ADD TEAM
    ============================================================ */

    async function addTeam(event) {

        event.preventDefault();

        if (!addTeamForm) {
            return;
        }

        if (!isAdmin()) {
            alert("You do not have permission to add dispatch teams.");
            return;
        }

        validateTeamPassword();

        if (saveTeamBtn && saveTeamBtn.disabled) {
            return;
        }


        /* FORM FIELDS */

        const teamNameInput = getFormField("teamName");
        const departmentSelect = getFormField("department");
        const teamLeaderInput = getFormField("teamLeader");
        const contactInput = getFormField("contactNumber");
        const emailInput = getFormField("email", "teamEmail");
        const passwordInput = getFormField("password", "teamPassword");
        const statusInput = getFormField("teamStatus", "status");


        /* READ VALUES */

        const teamName = String(
            teamNameInput?.value || ""
        ).trim();

        const teamLeader = String(
            teamLeaderInput?.value || ""
        ).trim();

        const contactNumber = String(
            contactInput?.value || ""
        ).trim();

        const email = String(
            emailInput?.value || ""
        ).trim();

        const password = String(
            passwordInput?.value || teamPassword?.value || ""
        );

        const status = String(
            statusInput?.value || "Available"
        ).trim();


        /* VALIDATION */

        if (!teamName) {
            alert("Team name is required.");
            teamNameInput?.focus();
            return;
        }

        if (!email) {
            alert("Email address is required.");
            emailInput?.focus();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            emailInput?.focus();
            return;
        }

        if (!password) {
            alert("Password is required.");
            passwordInput?.focus();
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters.");
            passwordInput?.focus();
            return;
        }

        if (
            contactNumber &&
            !/^[0-9]{11}$/.test(contactNumber)
        ) {
            alert("Contact number must be exactly 11 digits.");
            contactInput?.focus();
            return;
        }


        /* DEPARTMENT */

        let selectedDepartment = String(
            departmentSelect?.value || ""
        ).trim().toUpperCase();

        if (isGlobalAdmin()) {

            if (!DISPATCH_DEPARTMENTS.includes(selectedDepartment)) {

                alert("Please select a valid dispatch team department.");

                departmentSelect?.focus();

                return;
            }

        } else if (isDepartmentAdmin()) {

            selectedDepartment = currentDepartment;

        }

        if (!DISPATCH_DEPARTMENTS.includes(selectedDepartment)) {
            alert("Please select a valid department.");
            return;
        }


        /* STATUS */

        if (!ALLOWED_STATUSES.includes(status)) {
            alert("Invalid team status.");
            return;
        }


        /* DISABLE SAVE BUTTON */

        if (saveTeamBtn) {

            saveTeamBtn.disabled = true;

            saveTeamBtn.innerHTML = `
<i class="fa-solid fa-spinner fa-spin mr-2"></i>
Adding...
`;

        }


        /* BUILD FORM DATA */

        const formData = new FormData();

        formData.set("teamName", teamName);
        formData.set("department", selectedDepartment);
        formData.set("teamLeader", teamLeader);
        formData.set("contactNumber", contactNumber);
        formData.set("email", email);
        formData.set("password", password);
        formData.set("status", status);


        /* SEND REQUEST */

        try {

            const response = await fetch(
                "/Complaint/Dispatchs/add_dispatch_team.php",
                {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                }
            );

            const responseText = await response.text();

            console.log(
                "Add Team HTTP Status:",
                response.status
            );

            let result;

            try {

                result = JSON.parse(responseText);

            } catch (jsonError) {

                console.error(
                    "Server returned invalid JSON:",
                    responseText
                );

                throw new Error(
                    `Server returned HTTP ${response.status}.`
                );

            }

            if (!response.ok || !result.success) {

                alert(
                    result.message ||
                    `Request failed with HTTP ${response.status}.`
                );

                return;
            }


            /* SUCCESS */

            hideAddTeamModal();

            if (addTeamForm) {
                addTeamForm.reset();
            }

            resetPasswordFeedback();

            configureDepartmentUI();

            await loadTeams();

            showSuccessModal(
                result.message || "Dispatch team added successfully.",
                "Dispatch Team Added Successfully"
            );

        } catch (error) {

            console.error("Add Team Error:", error);

            alert(
                error.message ||
                "Unable to connect to the server."
            );

        } finally {

            if (saveTeamBtn) {

                saveTeamBtn.disabled = false;

                saveTeamBtn.innerHTML = isEditingTeam
                    ? '<i class="fa-solid fa-floppy-disk mr-2"></i>Save Changes'
                    : '<i class="fa-solid fa-plus mr-2"></i>Add Team';

            }

        }

    }


    /* ============================================================
       SUCCESS MODAL
    ============================================================ */

    function showSuccessModal(
        message = "Dispatch team added successfully.",
        title = "Dispatch Team Added Successfully"
    ) {

        let successModal = document.getElementById(
            "dispatchSuccessModal"
        );

        if (!successModal) {

            successModal = document.createElement("div");

            successModal.id = "dispatchSuccessModal";

            successModal.className =
                "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[3px]";

            successModal.innerHTML = `
<div
    class="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dispatchSuccessTitle"
>
    <div class="p-6 text-center">

        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i class="fa-solid fa-check text-xl"></i>
        </div>

        <h2
            id="dispatchSuccessTitle"
            class="mt-4 text-lg font-semibold text-gray-900"
        ></h2>

        <p
            id="dispatchSuccessMessage"
            class="mt-2 text-sm leading-6 text-gray-500"
        ></p>

        <button
            id="dispatchSuccessDone"
            type="button"
            class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            Done
        </button>

    </div>
</div>
`;

            document.body.appendChild(successModal);

            const doneButton = successModal.querySelector(
                "#dispatchSuccessDone"
            );

            if (doneButton) {

                doneButton.addEventListener("click", () => {

                    successModal.classList.add("hidden");

                });

            }

            successModal.addEventListener("click", event => {

                if (event.target === successModal) {
                    successModal.classList.add("hidden");
                }

            });

        }

        const titleElement = successModal.querySelector(
            "#dispatchSuccessTitle"
        );

        const messageElement = successModal.querySelector(
            "#dispatchSuccessMessage"
        );

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        successModal.classList.remove("hidden");

    }


    /* ============================================================
       ESCAPE HTML
    ============================================================ */

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


    /* ============================================================
       GLOBAL INIT
    ============================================================ */

    window.initDispatch = initDispatch;

})();