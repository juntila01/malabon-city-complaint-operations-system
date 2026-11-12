(() => {

    /* =========================================================
       STATE
    ========================================================== */

    let users = [];
    let filteredUsers = [];
    let selectedUser = null;

    /* PAGINATION */
    let systemUsersCurrentPage = 1;
    const systemUsersItemsPerPage = 10;


    /* =========================================================
       ELEMENTS
    ========================================================== */

    let table;

    let searchInput;
    let roleFilter;
    let departmentFilter;
    let departmentFilterWrapper;
    let clearUserFilters;

    let pageInfo;
    let pagination;

    let modal;
    let closeModal;
    let closeFooterBtn;

    let modalName;
    let modalEmail;
    let modalRole;
    let modalDepartment;

    let addUserBtn;
    let addUserModal;
    let closeAddModal;
    let cancelAddUser;

    let addName;
    let addEmail;
    let addPassword;
    let confirmPassword;

    let addRole;
    let addDepartment;
    let departmentHelp;

    let togglePassword;
    let toggleConfirmPassword;
    let eyeIcon;
    let confirmEyeIcon;

    let passwordRequirements;
    let passwordStrength;
    let passwordMatch;

    let saveUserBtn;


    /* =========================================================
       RBAC
    ========================================================== */

    let currentRole = String(
        window.CURRENT_USER_ROLE || ""
    )
        .trim()
        .toLowerCase();

    let currentDepartment = String(
        window.CURRENT_USER_DEPARTMENT || ""
    )
        .trim()
        .toUpperCase();


    /*
     * IT ADMIN:
     *
     * Can create users in:
     * IT / BFP / MCAT / PSTMO
     *
     * BFP ADMIN:
     * Can create BFP users only.
     *
     * MCAT ADMIN:
     * Can create MCAT users only.
     *
     * PSTMO ADMIN:
     * Can create PSTMO users only.
     */

    const isITAdmin =
        currentRole === "admin" &&
        currentDepartment === "IT";


    const isDepartmentAdmin =
        currentRole === "admin" &&
        ["BFP", "MCAT", "PSTMO"].includes(
            currentDepartment
        );


    /* =========================================================
       INITIALIZE
    ========================================================== */

    function initSystemUsers() {

        /* -----------------------------------------------------
           TABLE
        ----------------------------------------------------- */

        table =
            document.getElementById(
                "systemUsersTable"
            );


        /* -----------------------------------------------------
           FILTERS
        ----------------------------------------------------- */

        searchInput =
            document.getElementById(
                "searchUser"
            );

        roleFilter =
            document.getElementById(
                "roleFilter"
            );

        departmentFilter =
            document.getElementById(
                "departmentFilter"
            );

        departmentFilterWrapper =
            document.getElementById(
                "departmentFilterWrapper"
            );

        clearUserFilters =
            document.getElementById(
                "clearUserFilters"
            );


        /* -----------------------------------------------------
           PAGINATION
        ----------------------------------------------------- */

        pageInfo =
            document.getElementById(
                "systemUsersPageInfo"
            );

        pagination =
            document.getElementById(
                "systemUsersPagination"
            );


        /* -----------------------------------------------------
           VIEW MODAL
        ----------------------------------------------------- */

        modal =
            document.getElementById(
                "viewModal"
            );

        closeModal =
            document.getElementById(
                "closeModal"
            );

        closeFooterBtn =
            document.getElementById(
                "closeFooterBtn"
            );

        modalName =
            document.getElementById(
                "modalName"
            );

        modalEmail =
            document.getElementById(
                "modalEmail"
            );

        modalRole =
            document.getElementById(
                "modalRole"
            );

        modalDepartment =
            document.getElementById(
                "modalDepartment"
            );


        /* -----------------------------------------------------
           ADD USER
        ----------------------------------------------------- */

        addUserBtn =
            document.getElementById(
                "addUserBtn"
            );

        addUserModal =
            document.getElementById(
                "addUserModal"
            );

        closeAddModal =
            document.getElementById(
                "closeAddModal"
            );

        cancelAddUser =
            document.getElementById(
                "cancelAddUser"
            );

        saveUserBtn =
            document.getElementById(
                "saveUserBtn"
            );


        addName =
            document.getElementById(
                "addName"
            );

        addEmail =
            document.getElementById(
                "addEmail"
            );

        addPassword =
            document.getElementById(
                "addPassword"
            );

        confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        addRole =
            document.getElementById(
                "addRole"
            );

        addDepartment =
            document.getElementById(
                "addDepartment"
            );

        departmentHelp =
            document.getElementById(
                "departmentHelp"
            );


        /* -----------------------------------------------------
           PASSWORD
        ----------------------------------------------------- */

        togglePassword =
            document.getElementById(
                "togglePassword"
            );

        toggleConfirmPassword =
            document.getElementById(
                "toggleConfirmPassword"
            );

        eyeIcon =
            document.getElementById(
                "eyeIcon"
            );

        confirmEyeIcon =
            document.getElementById(
                "confirmEyeIcon"
            );

        passwordRequirements =
            document.getElementById(
                "passwordRequirements"
            );

        passwordStrength =
            document.getElementById(
                "passwordStrength"
            );

        passwordMatch =
            document.getElementById(
                "passwordMatch"
            );


        /* =====================================================
           DEBUG
        ====================================================== */

        console.log(
            "System Users Role:",
            currentRole
        );

        console.log(
            "System Users Department:",
            currentDepartment
        );

        console.log(
            "System Users IT Admin:",
            isITAdmin
        );

        console.log(
            "System Users Department Admin:",
            isDepartmentAdmin
        );


        /* =====================================================
           RBAC
        ====================================================== */

        applyUserRBAC();


        /* =====================================================
           EVENTS
        ====================================================== */

        if (addUserBtn) {
            addUserBtn.onclick =
                openAddUserModal;
        }

        if (closeAddModal) {
            closeAddModal.onclick =
                closeAddUserModal;
        }

        if (cancelAddUser) {
            cancelAddUser.onclick =
                closeAddUserModal;
        }

        if (clearUserFilters) {
            clearUserFilters.onclick =
                clearFilters;
        }

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                filterUsers
            );
        }

        if (roleFilter) {
            roleFilter.addEventListener(
                "change",
                filterUsers
            );
        }

        if (departmentFilter) {
            departmentFilter.addEventListener(
                "change",
                filterUsers
            );
        }

        if (closeModal) {
            closeModal.onclick =
                hideViewModal;
        }

        if (closeFooterBtn) {
            closeFooterBtn.onclick =
                hideViewModal;
        }

        if (table) {
            table.addEventListener(
                "click",
                tableClick
            );
        }

        if (togglePassword) {
            togglePassword.onclick =
                togglePasswordVisibility;
        }

        if (toggleConfirmPassword) {
            toggleConfirmPassword.onclick =
                toggleConfirmPasswordVisibility;
        }

        if (addPassword) {
            addPassword.addEventListener(
                "input",
                validatePassword
            );
        }

        if (confirmPassword) {
            confirmPassword.addEventListener(
                "input",
                validatePassword
            );
        }

        if (saveUserBtn) {
            saveUserBtn.onclick =
                addUser;
        }


        /* =====================================================
           LOAD
        ====================================================== */

        loadSystemUsers();
    }


    /* =========================================================
       RBAC
    ========================================================== */

    function applyUserRBAC() {

        /*
         * Only Admin accounts can add users.
         */

        if (
            currentRole !== "admin" &&
            addUserBtn
        ) {
            addUserBtn.remove();
        }


        /*
         * IT ADMIN
         *
         * IT can see and use the department filter.
         */

        if (isITAdmin) {

            if (departmentFilterWrapper) {
                departmentFilterWrapper.classList.remove(
                    "hidden"
                );
            }

            if (addDepartment) {

                addDepartment.disabled = false;

                addDepartment.classList.remove(
                    "bg-gray-100",
                    "text-gray-500",
                    "cursor-not-allowed"
                );

                if (departmentHelp) {
                    departmentHelp.textContent =
                        "IT administrators can assign users to any department.";
                    departmentHelp.classList.remove(
                        "hidden"
                    );
                }
            }

            return;
        }


        /*
         * DEPARTMENT ADMIN
         *
         * BFP / MCAT / PSTMO
         *
         * They cannot filter other departments.
         */

        if (isDepartmentAdmin) {

            if (departmentFilterWrapper) {
                departmentFilterWrapper.classList.add(
                    "hidden"
                );
            }


            /*
             * Force Add User department
             * to authenticated department.
             */

            if (
                addDepartment &&
                currentDepartment
            ) {

                const matchingOption =
                    Array.from(
                        addDepartment.options
                    ).find(
                        option =>
                            option.value
                                .toUpperCase() ===
                            currentDepartment
                    );


                if (matchingOption) {

                    addDepartment.value =
                        matchingOption.value;

                } else {

                    /*
                     * If the HTML does not contain
                     * the department option, create
                     * a safe fixed value.
                     */

                    addDepartment.value =
                        currentDepartment;
                }


                addDepartment.disabled =
                    true;


                addDepartment.classList.add(
                    "bg-gray-100",
                    "text-gray-500",
                    "cursor-not-allowed"
                );


                if (departmentHelp) {

                    departmentHelp.textContent =
                        `This account will be assigned to ${currentDepartment}.`;

                    departmentHelp.classList.remove(
                        "hidden"
                    );
                }
            }

            return;
        }


        /*
         * INVALID ADMIN DEPARTMENT
         *
         * The backend will also reject this.
         */

        if (currentRole === "admin") {

            if (departmentFilterWrapper) {
                departmentFilterWrapper.classList.add(
                    "hidden"
                );
            }

            if (addUserBtn) {
                addUserBtn.remove();
            }

            console.warn(
                "System Users: Admin account has no valid department."
            );
        }
    }


    /* =========================================================
       LOAD SYSTEM USERS
    ========================================================== */

    async function loadSystemUsers() {

        if (!table) {
            return;
        }


        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-4 py-10 text-center text-sm text-gray-400"
                >
                    <div class="flex flex-col items-center gap-2">
                        <i
                            class="fa-solid fa-spinner fa-spin text-blue-500"
                        ></i>

                        <span>
                            Loading system users...
                        </span>
                    </div>
                </td>
            </tr>
        `;


        try {

            const response =
                await fetch(
                    "/Complaint/Users/get_systemUsers.php",
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "same-origin"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            if (!Array.isArray(result)) {

                throw new Error(
                    result.message ||
                    "Invalid server response."
                );

            }


            users =
                result;


            /*
             * Department filtering is still applied
             * locally for restricted departments.
             */

            filteredUsers =
                [...users];


            systemUsersCurrentPage =
                1;


            filterUsers();

        }
        catch (error) {

            console.error(
                "System Users Load Error:",
                error
            );


            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-4 py-10 text-center text-sm text-red-500"
                    >
                        <div class="flex flex-col items-center gap-2">

                            <i
                                class="fa-solid fa-circle-exclamation"
                            ></i>

                            <span>
                                Failed to load system users.
                            </span>

                        </div>
                    </td>
                </tr>
            `;


            updatePagination(0);
        }
    }


    /* =========================================================
       FILTER USERS
    ========================================================== */

    function filterUsers() {

        if (
            !searchInput ||
            !roleFilter
        ) {
            return;
        }


        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        const selectedRole =
            roleFilter.value;


        const selectedDepartment =
            departmentFilter
                ? departmentFilter.value
                : "All";


        filteredUsers =
            users.filter(
                user => {

                    /* -----------------------------------------
                       SEARCH
                    ------------------------------------------ */

                    const matchSearch =
                        String(
                            user.systemUsersID || ""
                        )
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            user.name || ""
                        )
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            user.email || ""
                        )
                            .toLowerCase()
                            .includes(search);


                    /* -----------------------------------------
                       ROLE
                    ------------------------------------------ */

                    const matchRole =
                        selectedRole === "All" ||
                        String(
                            user.role || ""
                        )
                            .toLowerCase() ===
                        selectedRole.toLowerCase();


                    /* -----------------------------------------
                       DEPARTMENT
                    ------------------------------------------ */

                    let matchDepartment = true;


                    /*
                     * IT:
                     *
                     * Can view/filter all departments.
                     */

                    if (isITAdmin) {

                        matchDepartment =
                            selectedDepartment === "All" ||
                            String(
                                user.department || ""
                            )
                                .toUpperCase() ===
                            selectedDepartment.toUpperCase();

                    }


                    /*
                     * BFP / MCAT / PSTMO:
                     *
                     * Only their own department.
                     */

                    else if (isDepartmentAdmin) {

                        matchDepartment =
                            String(
                                user.department || ""
                            )
                                .toUpperCase() ===
                            currentDepartment;

                    }


                    /*
                     * Invalid admin:
                     *
                     * Show nothing.
                     */

                    else if (currentRole === "admin") {

                        matchDepartment = false;

                    }


                    return (
                        matchSearch &&
                        matchRole &&
                        matchDepartment
                    );
                }
            );


        /*
         * Every filter change returns
         * to page 1.
         */

        systemUsersCurrentPage =
            1;


        renderTable();
    }


    /* =========================================================
       CLEAR FILTERS
    ========================================================== */

    function clearFilters() {

        if (searchInput) {
            searchInput.value = "";
        }


        if (roleFilter) {
            roleFilter.value = "All";
        }


        if (
            departmentFilter &&
            isITAdmin
        ) {
            departmentFilter.value = "All";
        }


        systemUsersCurrentPage =
            1;


        filterUsers();
    }


    /* =========================================================
       RENDER TABLE
    ========================================================== */

    function renderTable() {

        if (!table) {
            return;
        }


        const totalItems =
            filteredUsers.length;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalItems /
                    systemUsersItemsPerPage
                )
            );


        if (
            systemUsersCurrentPage >
            totalPages
        ) {

            systemUsersCurrentPage =
                totalPages;

        }


        if (
            systemUsersCurrentPage < 1
        ) {

            systemUsersCurrentPage =
                1;

        }


        if (totalItems === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-4 py-10 text-center text-sm text-gray-400"
                    >
                        <div class="flex flex-col items-center gap-2">

                            <i
                                class="fa-solid fa-users-slash text-xl text-gray-300"
                            ></i>

                            <span>
                                No system users found.
                            </span>

                        </div>
                    </td>
                </tr>
            `;


            updatePagination(0);

            return;
        }


        const startIndex =
            (
                systemUsersCurrentPage - 1
            ) *
            systemUsersItemsPerPage;


        const pageUsers =
            filteredUsers.slice(
                startIndex,
                startIndex +
                systemUsersItemsPerPage
            );


        table.innerHTML =
            pageUsers
                .map(
                    user =>
                        createUserRow(user)
                )
                .join("");


        updatePagination(
            totalItems
        );
    }


    /* =========================================================
       CREATE USER ROW
    ========================================================== */

    function createUserRow(user) {

        const role =
            String(
                user.role || ""
            );


        const department =
            String(
                user.department || ""
            );


        let roleBadge =
            "bg-gray-100 text-gray-700";


        switch (
            role.toLowerCase()
        ) {

            case "admin":

                roleBadge =
                    "bg-blue-100 text-blue-700";

                break;


            case "staff":

                roleBadge =
                    "bg-green-100 text-green-700";

                break;


            case "dispatcher":

                roleBadge =
                    "bg-orange-100 text-orange-700";

                break;


            case "supervisor":

                roleBadge =
                    "bg-purple-100 text-purple-700";

                break;
        }


        return `
            <tr
                class="border-b border-gray-100 hover:bg-slate-50 transition-colors"
            >

                <td
                    class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
                >
                    #${escapeHtml(
                        user.systemUsersID
                    )}
                </td>


                <td
                    class="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap"
                >
                    ${escapeHtml(
                        user.name
                    )}
                </td>


                <td
                    class="px-4 py-3 text-sm text-gray-700"
                >
                    ${escapeHtml(
                        user.email
                    )}
                </td>


                <td
                    class="px-4 py-3 whitespace-nowrap"
                >

                    <span
                        class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleBadge}"
                    >
                        ${escapeHtml(
                            role
                        )}
                    </span>

                </td>


                <td
                    class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                >
                    ${escapeHtml(
                        department || "—"
                    )}
                </td>


                <td
                    class="px-4 py-3 text-right"
                >

                    <button
                        type="button"
                        class="viewBtn inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        data-id="${escapeHtml(
                            user.systemUsersID
                        )}"
                    >
                        <i class="fa-solid fa-eye text-[10px]"></i>
                        View
                    </button>

                </td>

            </tr>
        `;
    }


    /* =========================================================
       PAGINATION
    ========================================================== */

    function updatePagination(
        totalItems = 0
    ) {

        if (!pagination) {
            return;
        }


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalItems /
                    systemUsersItemsPerPage
                )
            );


        const pageFrom =
            totalItems === 0
                ? 0
                :
                (
                    (
                        systemUsersCurrentPage - 1
                    ) *
                    systemUsersItemsPerPage
                ) + 1;


        const pageTo =
            totalItems === 0
                ? 0
                :
                Math.min(
                    systemUsersCurrentPage *
                    systemUsersItemsPerPage,
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


        /* =====================================================
           PREVIOUS
        ====================================================== */

        createPaginationButton(
            "‹",
            systemUsersCurrentPage - 1,
            systemUsersCurrentPage === 1,
            false,
            "Previous page"
        );


        /* =====================================================
           PAGES
        ====================================================== */

        if (totalPages <= 7) {

            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                createPaginationButton(
                    String(page),
                    page,
                    false,
                    page ===
                    systemUsersCurrentPage,
                    `Page ${page}`
                );

            }

        } else {

            /* FIRST PAGE */

            createPaginationButton(
                "1",
                1,
                false,
                systemUsersCurrentPage === 1,
                "Page 1"
            );


            /* LEFT ELLIPSIS */

            if (
                systemUsersCurrentPage > 4
            ) {
                addEllipsis();
            }


            /* CURRENT RANGE */

            const startPage =
                Math.max(
                    2,
                    systemUsersCurrentPage - 1
                );


            const endPage =
                Math.min(
                    totalPages - 1,
                    systemUsersCurrentPage + 1
                );


            for (
                let page = startPage;
                page <= endPage;
                page++
            ) {

                if (
                    page === 1 ||
                    page === totalPages
                ) {
                    continue;
                }


                createPaginationButton(
                    String(page),
                    page,
                    false,
                    page ===
                    systemUsersCurrentPage,
                    `Page ${page}`
                );
            }


            /* RIGHT ELLIPSIS */

            if (
                systemUsersCurrentPage <
                totalPages - 3
            ) {
                addEllipsis();
            }


            /* LAST PAGE */

            createPaginationButton(
                String(totalPages),
                totalPages,
                false,
                systemUsersCurrentPage ===
                totalPages,
                `Page ${totalPages}`
            );
        }


        /* =====================================================
           NEXT
        ====================================================== */

        createPaginationButton(
            "›",
            systemUsersCurrentPage + 1,
            systemUsersCurrentPage === totalPages,
            false,
            "Next page"
        );
    }


    /* =========================================================
       PAGINATION BUTTON
    ========================================================== */

    function createPaginationButton(
        label,
        page,
        disabled = false,
        active = false,
        ariaLabel = ""
    ) {

        if (!pagination) {
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.textContent = label;

        button.disabled = disabled;


        button.className =
            active
                ? "system-users-page-active text-white"
                : "bg-white text-gray-600";


        if (ariaLabel) {

            button.setAttribute(
                "aria-label",
                ariaLabel
            );

        }


        if (!disabled) {

            button.addEventListener(
                "click",
                () => {

                    systemUsersCurrentPage =
                        page;

                    renderTable();

                }
            );

        }


        pagination.appendChild(
            button
        );
    }


    /* =========================================================
       ELLIPSIS
    ========================================================== */

    function addEllipsis() {

        if (!pagination) {
            return;
        }


        const ellipsis =
            document.createElement(
                "span"
            );


        ellipsis.className =
            "px-1 text-xs text-gray-400";


        ellipsis.textContent =
            "…";


        pagination.appendChild(
            ellipsis
        );
    }


    /* =========================================================
       TABLE CLICK
    ========================================================== */

    function tableClick(event) {

        const button =
            event.target.closest(
                ".viewBtn"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        selectedUser =
            users.find(
                user =>
                    String(
                        user.systemUsersID
                    ) ===
                    String(id)
            );


        if (!selectedUser) {
            return;
        }


        /*
         * Department Admin security check.
         */

        if (
            isDepartmentAdmin &&
            String(
                selectedUser.department ||
                ""
            )
                .toUpperCase() !==
            currentDepartment
        ) {

            alert(
                "You are not authorized to view this user."
            );


            selectedUser =
                null;


            return;
        }


        /*
         * Invalid admin account should not
         * be able to view users.
         */

        if (
            currentRole === "admin" &&
            !isITAdmin &&
            !isDepartmentAdmin
        ) {

            alert(
                "Your account does not have permission to view system users."
            );


            selectedUser =
                null;


            return;
        }


        if (modalName) {

            modalName.textContent =
                selectedUser.name ||
                "—";

        }


        if (modalEmail) {

            modalEmail.textContent =
                selectedUser.email ||
                "—";

        }


        if (modalRole) {

            const role =
                String(
                    selectedUser.role ||
                    "—"
                );


            let badge =
                "bg-gray-100 text-gray-700";


            switch (
                role.toLowerCase()
            ) {

                case "admin":

                    badge =
                        "bg-blue-100 text-blue-700";

                    break;


                case "staff":

                    badge =
                        "bg-green-100 text-green-700";

                    break;


                case "dispatcher":

                    badge =
                        "bg-orange-100 text-orange-700";

                    break;


                case "supervisor":

                    badge =
                        "bg-purple-100 text-purple-700";

                    break;
            }


            modalRole.innerHTML = `
                <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge}"
                >
                    ${escapeHtml(role)}
                </span>
            `;
        }


        if (modalDepartment) {

            modalDepartment.innerHTML = `
                <span
                    class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                    ${escapeHtml(
                        selectedUser.department ||
                        "—"
                    )}
                </span>
            `;
        }


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }
    }


    /* =========================================================
       VIEW MODAL
    ========================================================== */

    function hideViewModal() {

        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }


        selectedUser =
            null;
    }


    /* =========================================================
       OPEN ADD USER MODAL
    ========================================================== */

    function openAddUserModal() {

        if (
            currentRole !== "admin"
        ) {
            return;
        }


        /*
         * Only IT, BFP, MCAT and PSTMO
         * admins can add users.
         */

        if (
            !isITAdmin &&
            !isDepartmentAdmin
        ) {
            alert(
                "Your account does not have permission to add users."
            );

            return;
        }


        if (!addUserModal) {
            return;
        }


        resetAddUserForm();


        /*
         * Department Admin:
         *
         * Force own department.
         */

        if (
            isDepartmentAdmin &&
            addDepartment &&
            currentDepartment
        ) {

            addDepartment.value =
                currentDepartment;

            addDepartment.disabled =
                true;

        }


        /*
         * IT Admin:
         *
         * Allow department selection.
         */

        if (
            isITAdmin &&
            addDepartment
        ) {

            addDepartment.disabled =
                false;

        }


        addUserModal.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       CLOSE ADD USER MODAL
    ========================================================== */

    function closeAddUserModal() {

        if (!addUserModal) {
            return;
        }


        addUserModal.classList.add(
            "hidden"
        );


        resetAddUserForm();
    }


    /* =========================================================
       RESET ADD USER FORM
    ========================================================== */

    function resetAddUserForm() {

        if (addName) {
            addName.value = "";
        }


        if (addEmail) {
            addEmail.value = "";
        }


        if (addPassword) {

            addPassword.value = "";

            addPassword.type =
                "password";
        }


        if (confirmPassword) {

            confirmPassword.value = "";

            confirmPassword.type =
                "password";
        }


        if (addRole) {

            addRole.value =
                "admin";
        }


        if (addDepartment) {

            if (isITAdmin) {

                addDepartment.disabled =
                    false;

                addDepartment.value =
                    "IT";

                addDepartment.classList.remove(
                    "bg-gray-100",
                    "text-gray-500",
                    "cursor-not-allowed"
                );

            }

            else if (isDepartmentAdmin) {

                addDepartment.value =
                    currentDepartment;

                addDepartment.disabled =
                    true;

                addDepartment.classList.add(
                    "bg-gray-100",
                    "text-gray-500",
                    "cursor-not-allowed"
                );

            }

        }


        if (departmentHelp) {

            if (isITAdmin) {

                departmentHelp.textContent =
                    "IT administrators can assign users to any department.";

                departmentHelp.classList.remove(
                    "hidden"
                );

            }

            else if (isDepartmentAdmin) {

                departmentHelp.textContent =
                    `This account will be assigned to ${currentDepartment}.`;

                departmentHelp.classList.remove(
                    "hidden"
                );

            }

            else {

                departmentHelp.classList.add(
                    "hidden"
                );

            }
        }


        if (passwordRequirements) {

            passwordRequirements.classList.add(
                "hidden"
            );

        }


        if (passwordStrength) {

            passwordStrength.className =
                "hidden mt-2 text-xs font-medium";

            passwordStrength.textContent =
                "";

        }


        if (passwordMatch) {

            passwordMatch.className =
                "hidden mt-2 text-xs font-medium";

            passwordMatch.textContent =
                "";

        }


        resetRequirementStates();


        if (eyeIcon) {

            eyeIcon.className =
                "fa-solid fa-eye text-sm";

        }


        if (confirmEyeIcon) {

            confirmEyeIcon.className =
                "fa-solid fa-eye text-sm";

        }


        if (saveUserBtn) {

            saveUserBtn.disabled =
                true;

            saveUserBtn.className =
                "inline-flex items-center justify-center rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white transition";

            saveUserBtn.innerHTML =
                "Save User";

        }
    }


    /* =========================================================
       RESET PASSWORD REQUIREMENTS
    ========================================================== */

    function resetRequirementStates() {

        [
            "req-length",
            "req-upper",
            "req-lower",
            "req-number",
            "req-special"
        ].forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (!element) {
                    return;
                }


                element.classList.remove(
                    "text-green-600"
                );


                element.classList.add(
                    "text-gray-500"
                );


                const icon =
                    element.querySelector(
                        ".req-icon"
                    );


                if (icon) {

                    icon.textContent =
                        "○";

                }
            }
        );
    }


    /* =========================================================
       PASSWORD VISIBILITY
    ========================================================== */

    function togglePasswordVisibility() {

        if (!addPassword) {
            return;
        }


        if (
            addPassword.type ===
            "password"
        ) {

            addPassword.type =
                "text";


            if (eyeIcon) {

                eyeIcon.classList.replace(
                    "fa-eye",
                    "fa-eye-slash"
                );

            }

        }

        else {

            addPassword.type =
                "password";


            if (eyeIcon) {

                eyeIcon.classList.replace(
                    "fa-eye-slash",
                    "fa-eye"
                );

            }
        }
    }


    function toggleConfirmPasswordVisibility() {

        if (!confirmPassword) {
            return;
        }


        if (
            confirmPassword.type ===
            "password"
        ) {

            confirmPassword.type =
                "text";


            if (confirmEyeIcon) {

                confirmEyeIcon.classList.replace(
                    "fa-eye",
                    "fa-eye-slash"
                );

            }

        }

        else {

            confirmPassword.type =
                "password";


            if (confirmEyeIcon) {

                confirmEyeIcon.classList.replace(
                    "fa-eye-slash",
                    "fa-eye"
                );

            }
        }
    }


    /* =========================================================
       PASSWORD VALIDATION
    ========================================================== */

    function validatePassword() {

        if (
            !addPassword ||
            !confirmPassword
        ) {
            return;
        }


        const password =
            addPassword.value;


        const confirm =
            confirmPassword.value;


        const hasLength =
            password.length >= 8;


        const hasUpper =
            /[A-Z]/.test(
                password
            );


        const hasLower =
            /[a-z]/.test(
                password
            );


        const hasNumber =
            /[0-9]/.test(
                password
            );


        const hasSpecial =
            /[^A-Za-z0-9]/.test(
                password
            );


        /* -----------------------------------------------------
           REQUIREMENTS
        ----------------------------------------------------- */

        if (password === "") {

            passwordRequirements.classList.add(
                "hidden"
            );

        }

        else {

            passwordRequirements.classList.remove(
                "hidden"
            );

        }


        updateRequirement(
            "req-length",
            hasLength
        );

        updateRequirement(
            "req-upper",
            hasUpper
        );

        updateRequirement(
            "req-lower",
            hasLower
        );

        updateRequirement(
            "req-number",
            hasNumber
        );

        updateRequirement(
            "req-special",
            hasSpecial
        );


        /* -----------------------------------------------------
           STRENGTH
        ----------------------------------------------------- */

        let score = 0;


        if (hasLength)
            score++;


        if (hasUpper)
            score++;


        if (hasLower)
            score++;


        if (hasNumber)
            score++;


        if (hasSpecial)
            score++;


        if (password === "") {

            passwordStrength.className =
                "hidden mt-2 text-xs font-medium";

            passwordStrength.textContent =
                "";

        }

        else if (score <= 2) {

            passwordStrength.className =
                "mt-2 text-xs font-medium text-red-600";

            passwordStrength.textContent =
                "Weak Password";

        }

        else if (score <= 4) {

            passwordStrength.className =
                "mt-2 text-xs font-medium text-yellow-600";

            passwordStrength.textContent =
                "Medium Password";

        }

        else {

            passwordStrength.className =
                "mt-2 text-xs font-medium text-green-600";

            passwordStrength.textContent =
                "Strong Password";
        }


        /* -----------------------------------------------------
           PASSWORD MATCH
        ----------------------------------------------------- */

        if (confirm === "") {

            passwordMatch.className =
                "hidden mt-2 text-xs font-medium";

            passwordMatch.textContent =
                "";

        }

        else if (
            password === confirm
        ) {

            passwordMatch.className =
                "mt-2 text-xs font-medium text-green-600";

            passwordMatch.textContent =
                "Passwords match";

        }

        else {

            passwordMatch.className =
                "mt-2 text-xs font-medium text-red-600";

            passwordMatch.textContent =
                "Passwords do not match";
        }


        /* -----------------------------------------------------
           SAVE BUTTON
        ----------------------------------------------------- */

        const strongPassword =
            hasLength &&
            hasUpper &&
            hasLower &&
            hasNumber &&
            hasSpecial;


        const passwordsMatch =
            password !== "" &&
            password === confirm;


        if (
            strongPassword &&
            passwordsMatch
        ) {

            saveUserBtn.disabled =
                false;


            saveUserBtn.className =
                "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

        }

        else {

            saveUserBtn.disabled =
                true;


            saveUserBtn.className =
                "inline-flex items-center justify-center rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white transition";

        }
    }


    /* =========================================================
       UPDATE REQUIREMENT
    ========================================================== */

    function updateRequirement(
        id,
        valid
    ) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {
            return;
        }


        const icon =
            element.querySelector(
                ".req-icon"
            );


        if (valid) {

            element.classList.remove(
                "text-gray-500"
            );


            element.classList.add(
                "text-green-600"
            );


            if (icon) {

                icon.textContent =
                    "✓";

            }

        }

        else {

            element.classList.remove(
                "text-green-600"
            );


            element.classList.add(
                "text-gray-500"
            );


            if (icon) {

                icon.textContent =
                    "○";

            }
        }
    }


    /* =========================================================
       ADD USER
    ========================================================== */

    async function addUser() {

        /* -----------------------------------------------------
           PERMISSION CHECK
        ----------------------------------------------------- */

        if (currentRole !== "admin") {

            alert(
                "You do not have permission to add users."
            );

            return;
        }


        /*
         * Only IT, BFP, MCAT and PSTMO admins
         * are allowed.
         */

        if (
            !isITAdmin &&
            !isDepartmentAdmin
        ) {

            alert(
                "Your account does not have permission to add users."
            );

            return;
        }


        /* -----------------------------------------------------
           READ FORM VALUES
        ----------------------------------------------------- */

        const name =
            addName.value.trim();


        const email =
            addEmail.value.trim();


        const password =
            addPassword.value;


        const confirm =
            confirmPassword.value;


        const role =
            addRole.value
                .trim()
                .toLowerCase();


        /* -----------------------------------------------------
           DEPARTMENT
        ----------------------------------------------------- */

        let department = "";


        /*
         * IT:
         *
         * Use the selected department.
         */

        if (isITAdmin) {

            department =
                addDepartment.value
                    .trim()
                    .toUpperCase();

        }


        /*
         * BFP / MCAT / PSTMO:
         *
         * NEVER trust the dropdown.
         * Use the authenticated session department.
         */

        else if (isDepartmentAdmin) {

            department =
                currentDepartment;

        }


        /* -----------------------------------------------------
           REQUIRED FIELDS
        ----------------------------------------------------- */

        if (
            !name ||
            !email ||
            !password ||
            !confirm ||
            !role ||
            !department
        ) {

            alert(
                "Please complete all fields."
            );

            return;
        }


        /* -----------------------------------------------------
           VALIDATE ROLE
        ----------------------------------------------------- */

        const allowedRoles = [
            "admin",
            "staff",
            "dispatcher",
            "supervisor"
        ];


        if (
            !allowedRoles.includes(
                role
            )
        ) {

            alert(
                "Invalid role selected."
            );

            return;
        }


        /* -----------------------------------------------------
           VALIDATE DEPARTMENT
        ----------------------------------------------------- */

        const allowedDepartments = [
            "IT",
            "BFP",
            "MCAT",
            "PSTMO"
        ];


        if (
            !allowedDepartments.includes(
                department
            )
        ) {

            alert(
                "Invalid department selected."
            );

            return;
        }


        /* -----------------------------------------------------
           DEPARTMENT ADMIN PROTECTION
        ----------------------------------------------------- */

        if (isDepartmentAdmin) {

            if (
                department !==
                currentDepartment
            ) {

                alert(
                    `You can only create users in the ${currentDepartment} department.`
                );

                return;
            }
        }


        /* -----------------------------------------------------
           EMAIL VALIDATION
        ----------------------------------------------------- */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email
            )
        ) {

            alert(
                "Please enter a valid email address."
            );

            return;
        }


        /* -----------------------------------------------------
           PASSWORD VALIDATION
        ----------------------------------------------------- */

        const strongPassword =
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password);


        if (!strongPassword) {

            alert(
                "Please create a strong password before saving the user."
            );

            return;
        }


        /* -----------------------------------------------------
           PASSWORD MATCH
        ----------------------------------------------------- */

        if (
            password !== confirm
        ) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        /* -----------------------------------------------------
           BUTTON STATE
        ----------------------------------------------------- */

        if (saveUserBtn) {

            saveUserBtn.disabled =
                true;


            saveUserBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin mr-2 text-xs"></i>
                Saving...
            `;
        }


        /* -----------------------------------------------------
           REQUEST
        ----------------------------------------------------- */

        try {

            const response =
                await fetch(
                    "/Complaint/Users/add_systemUser.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        cache:
                            "no-store",

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                password:
                                    password,

                                role:
                                    role,

                                department:
                                    department
                            })
                    }
                );


            /* -------------------------------------------------
               READ RESPONSE SAFELY
            ------------------------------------------------- */

            const responseText =
                await response.text();


            let result = null;


            try {

                result =
                    JSON.parse(
                        responseText
                    );

            }

            catch (jsonError) {

                console.error(
                    "Invalid JSON returned by add_systemUser.php:",
                    responseText
                );


                throw new Error(
                    "The server returned an invalid response."
                );
            }


            /* -------------------------------------------------
               HTTP ERROR
            ------------------------------------------------- */

            if (!response.ok) {

                console.error(
                    "Add System User HTTP Error:",
                    response.status,
                    result
                );


                alert(
                    result.message ||
                    `Unable to add user. Server returned HTTP ${response.status}.`
                );


                return;
            }


            /* -------------------------------------------------
               SERVER ERROR
            ------------------------------------------------- */

            if (
                !result ||
                result.status !== "success"
            ) {

                alert(
                    result?.message ||
                    "Unable to add system user."
                );


                return;
            }


            /* -------------------------------------------------
               SUCCESS
            ------------------------------------------------- */

            alert(
                result.message ||
                "User added successfully."
            );


            /* -------------------------------------------------
               CLOSE MODAL
            ------------------------------------------------- */

            if (
                typeof closeAddUserModal ===
                "function"
            ) {

                closeAddUserModal();

            }

            else {

                const modal =
                    document.getElementById(
                        "addUserModal"
                    );


                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }
            }


            /* -------------------------------------------------
               RESET FORM
            ------------------------------------------------- */

            if (addName) {
                addName.value = "";
            }

            if (addEmail) {
                addEmail.value = "";
            }

            if (addPassword) {
                addPassword.value = "";
            }

            if (confirmPassword) {
                confirmPassword.value = "";
            }

            if (addRole) {
                addRole.value = "staff";
            }


            if (addDepartment) {

                if (isITAdmin) {

                    addDepartment.value =
                        "IT";

                }

                else if (isDepartmentAdmin) {

                    addDepartment.value =
                        currentDepartment;

                }
            }


            /* -------------------------------------------------
               RESET PASSWORD UI
            ------------------------------------------------- */

            if (
                typeof validatePassword ===
                "function"
            ) {

                validatePassword();

            }


            /* -------------------------------------------------
               RELOAD USERS
            ------------------------------------------------- */

            systemUsersCurrentPage =
                1;


            if (
                typeof loadSystemUsers ===
                "function"
            ) {

                await loadSystemUsers();

            }

        }

        catch (error) {

            console.error(
                "Add System User Error:",
                error
            );


            alert(
                error.message ||
                "Failed to save user. Please try again."
            );

        }

        finally {

            /* -------------------------------------------------
               RESTORE BUTTON
            ------------------------------------------------- */

            if (saveUserBtn) {

                saveUserBtn.disabled =
                    false;


                saveUserBtn.innerHTML =
                    "Save User";


                saveUserBtn.className =
                    "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
            }


            if (
                typeof validatePassword ===
                "function"
            ) {

                validatePassword();

            }
        }
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================== */

    function escapeHtml(value) {

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


    /* =========================================================
       EXPOSE INIT
    ========================================================== */

    window.initSystemUsers =
        initSystemUsers;

})();