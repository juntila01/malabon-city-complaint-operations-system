let feedbackData = [];

let feedbackCurrentPage = 1;

const feedbackItemsPerPage = 10;


// ==========================================
// INITIALIZE FEEDBACK PAGE
// ==========================================

window.initFeedback = function () {

    console.log("Feedback page initialized.");

    // --------------------------------------
    // LOAD DATA
    // --------------------------------------

    loadFeedback();


    // --------------------------------------
    // ELEMENTS
    // --------------------------------------

    const searchInput =
        document.getElementById("searchFeedback");

    const ratingFilter =
        document.getElementById("ratingFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const closeModal =
        document.getElementById("closeFeedbackModal");

    const closeModalBottom =
        document.getElementById(
            "closeFeedbackModalBottom"
        );

    const feedbackModal =
        document.getElementById("feedbackModal");


    // --------------------------------------
    // SEARCH
    // --------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterFeedback
        );

    }


    // --------------------------------------
    // RATING FILTER
    // --------------------------------------

    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            filterFeedback
        );

    }


    // --------------------------------------
    // STATUS FILTER
    // --------------------------------------

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterFeedback
        );

    }


    // --------------------------------------
    // CLOSE MODAL
    // --------------------------------------

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeFeedbackModal
        );

    }


    if (closeModalBottom) {

        closeModalBottom.addEventListener(
            "click",
            closeFeedbackModal
        );

    }


    // --------------------------------------
    // CLOSE MODAL WHEN CLICKING BACKDROP
    // --------------------------------------

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

};


// ==========================================
// LOAD FEEDBACK
// ==========================================

async function loadFeedback() {

    const table =
        document.getElementById(
            "feedbackTable"
        );


    if (!table) {

        console.error(
            "feedbackTable element not found."
        );

        return;

    }


    table.innerHTML = `
        <tr>

            <td
                colspan="7"
                class="py-16
                       text-center
                       text-gray-400">

                Loading feedback...

            </td>

        </tr>
    `;


    try {

        console.log(
            "Loading feedback from:",
            "/Complaint/Feedback/get_feedback.php"
        );


        const response =
            await fetch(
                "/Complaint/Feedback/get_feedback.php",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        console.log(
            "Feedback HTTP status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Feedback API result:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load feedback."
            );

        }


        feedbackData =
            Array.isArray(result.data)
                ? result.data
                : [];


        // Reset to first page
        feedbackCurrentPage = 1;


        // Update summary
        updateSummary(
            feedbackData
        );


        // Render
        renderFeedback(
            getFilteredFeedback()
        );


    } catch (error) {

        console.error(
            "Feedback Error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="py-16
                           text-center">

                    <i
                        class="fa-solid
                               fa-triangle-exclamation
                               text-red-400
                               text-2xl
                               mb-3">
                    </i>

                    <p
                        class="text-sm
                               text-red-500">

                        Unable to load feedback.

                    </p>

                    <p
                        class="text-xs
                               text-gray-400
                               mt-1">

                        ${escapeFeedbackHTML(
                            error.message
                        )}

                    </p>

                    <button
                        type="button"
                        onclick="loadFeedback()"
                        class="mt-3
                               text-sm
                               text-blue-600
                               hover:underline">

                        Try again

                    </button>

                </td>

            </tr>
        `;


        updateFeedbackPagination(0);

    }

}


// ==========================================
// SUMMARY
// ==========================================

function updateSummary(data) {

    const total =
        data.length;


    const fiveStar =
        data.filter(
            item =>
                Number(item.rating) === 5
        ).length;


    let average = 0;


    if (total > 0) {

        const sum =
            data.reduce(
                (total, item) =>
                    total +
                    Number(item.rating || 0),
                0
            );


        average =
            sum / total;

    }


    const totalElement =
        document.getElementById(
            "totalFeedback"
        );

    const averageElement =
        document.getElementById(
            "averageRating"
        );

    const fiveStarElement =
        document.getElementById(
            "fiveStarFeedback"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (averageElement) {

        averageElement.textContent =
            average.toFixed(1);

    }


    if (fiveStarElement) {

        fiveStarElement.textContent =
            fiveStar;

    }

}


// ==========================================
// RENDER FEEDBACK
// ==========================================

function renderFeedback(data) {

    const table =
        document.getElementById(
            "feedbackTable"
        );


    if (!table) {

        return;

    }


    // --------------------------------------
    // NO DATA
    // --------------------------------------

    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="py-16
                           text-center
                           text-gray-400">

                    <i
                        class="fa-regular
                               fa-comment-dots
                               text-3xl
                               mb-3">
                    </i>

                    <p class="text-sm">

                        No feedback has been submitted yet.

                    </p>

                </td>

            </tr>
        `;


        updateFeedbackPagination(0);

        return;

    }


    // --------------------------------------
    // TOTAL PAGES
    // --------------------------------------

    const totalPages =
        Math.ceil(
            data.length /
            feedbackItemsPerPage
        );


    // --------------------------------------
    // KEEP CURRENT PAGE VALID
    // --------------------------------------

    if (
        feedbackCurrentPage >
        totalPages
    ) {

        feedbackCurrentPage =
            totalPages;

    }


    if (
        feedbackCurrentPage < 1
    ) {

        feedbackCurrentPage = 1;

    }


    // --------------------------------------
    // CURRENT PAGE RANGE
    // --------------------------------------

    const startIndex =
        (
            feedbackCurrentPage - 1
        ) *
        feedbackItemsPerPage;


    const endIndex =
        startIndex +
        feedbackItemsPerPage;


    const pageData =
        data.slice(
            startIndex,
            endIndex
        );


    // --------------------------------------
    // RENDER ROWS
    // --------------------------------------

    table.innerHTML =
        pageData
            .map(
                feedback =>
                    createFeedbackRow(
                        feedback
                    )
            )
            .join("");


    // --------------------------------------
    // REGISTER VIEW BUTTONS
    // --------------------------------------

    registerViewButtons();


    // --------------------------------------
    // UPDATE PAGINATION
    // --------------------------------------

    updateFeedbackPagination(
        data.length
    );

}


// ==========================================
// PAGINATION
// SAME STYLE AS COMPLAINT MANAGEMENT
// ==========================================

function updateFeedbackPagination(
    totalItems = 0
) {

    const paginationInfo =
        document.getElementById(
            "feedbackPageInfo"
        );

    const pagination =
        document.getElementById(
            "feedbackPagination"
        );


    if (
        !paginationInfo ||
        !pagination
    ) {

        return;

    }


    // --------------------------------------
    // NO RESULTS
    // --------------------------------------

    if (totalItems <= 0) {

        paginationInfo.textContent =
            "Showing 0 of 0";

        pagination.innerHTML =
            "";

        return;

    }


    // --------------------------------------
    // TOTAL PAGES
    // --------------------------------------

    const totalPages =
        Math.ceil(
            totalItems /
            feedbackItemsPerPage
        );


    // --------------------------------------
    // SAFETY
    // --------------------------------------

    if (
        feedbackCurrentPage >
        totalPages
    ) {

        feedbackCurrentPage =
            totalPages;

    }


    if (
        feedbackCurrentPage < 1
    ) {

        feedbackCurrentPage = 1;

    }


    // --------------------------------------
    // CURRENT ITEM RANGE
    // --------------------------------------

    const pageFrom =
        (
            (
                feedbackCurrentPage - 1
            ) *
            feedbackItemsPerPage
        ) + 1;


    const pageTo =
        Math.min(
            feedbackCurrentPage *
            feedbackItemsPerPage,
            totalItems
        );


    paginationInfo.textContent =
        `Showing ${pageFrom}-${pageTo} of ${totalItems}`;


    pagination.innerHTML =
        "";


    // ======================================
    // CREATE PAGE BUTTON
    // ======================================

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

            ${
                active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }

            ${
                disabled
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
                        page ===
                        feedbackCurrentPage
                    ) {

                        return;

                    }


                    feedbackCurrentPage =
                        page;


                    renderFeedback(
                        getFilteredFeedback()
                    );

                }
            );

        }


        return button;

    }


    // ======================================
    // PREVIOUS
    // ======================================

    pagination.appendChild(
        createPageButton(
            "‹",
            feedbackCurrentPage - 1,
            false,
            feedbackCurrentPage <= 1
        )
    );


    // ======================================
    // PAGE NUMBERS
    // ======================================

    const pages = [];


    if (totalPages <= 7) {

        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pages.push(i);

        }

    } else {

        pages.push(1);


        if (
            feedbackCurrentPage > 4
        ) {

            pages.push("...");

        }


        const startPage =
            Math.max(
                2,
                feedbackCurrentPage - 1
            );


        const endPage =
            Math.min(
                totalPages - 1,
                feedbackCurrentPage + 1
            );


        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {

            pages.push(i);

        }


        if (
            feedbackCurrentPage <
            totalPages - 3
        ) {

            pages.push("...");

        }


        pages.push(
            totalPages
        );

    }


    // ======================================
    // RENDER PAGE NUMBERS
    // ======================================

    pages.forEach(
        page => {

            // --------------------------------
            // ELLIPSIS
            // --------------------------------

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


            // --------------------------------
            // PAGE
            // --------------------------------

            pagination.appendChild(
                createPageButton(
                    String(page),
                    page,
                    page ===
                        feedbackCurrentPage
                )
            );

        }
    );


    // ======================================
    // NEXT
    // ======================================

    pagination.appendChild(
        createPageButton(
            "›",
            feedbackCurrentPage + 1,
            false,
            feedbackCurrentPage >= totalPages
        )
    );

}


// ==========================================
// FILTERED FEEDBACK
// ==========================================

function getFilteredFeedback() {

    const searchInput =
        document.getElementById(
            "searchFeedback"
        );

    const ratingFilter =
        document.getElementById(
            "ratingFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const rating =
        ratingFilter
            ? ratingFilter.value
            : "All";


    const status =
        statusFilter
            ? statusFilter.value
            : "All";


    return feedbackData.filter(
        feedback => {

            // --------------------------------
            // SEARCH
            // --------------------------------

            const searchableText = `
                ${feedback.feedbackID || ""}
                ${feedback.complaintID || ""}
                ${feedback.citizenName || ""}
                ${feedback.comments || ""}
                ${feedback.rawComplaintText || ""}
            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    search
                );


            // --------------------------------
            // RATING
            // --------------------------------

            const matchesRating =
                rating === "All" ||
                rating === "" ||
                Number(feedback.rating) ===
                    Number(rating);


            // --------------------------------
            // STATUS
            // --------------------------------

            const feedbackStatus =
                String(
                    feedback.status || ""
                )
                .trim()
                .toLowerCase();


            const selectedStatus =
                String(
                    status || ""
                )
                .trim()
                .toLowerCase();


            const matchesStatus =
                status === "All" ||
                status === "" ||
                feedbackStatus ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesRating &&
                matchesStatus
            );

        }
    );

}


// ==========================================
// CREATE FEEDBACK ROW
// ==========================================

function createFeedbackRow(
    feedback
) {

    const rating =
        Number(
            feedback.rating || 0
        );


    const stars =
        createStars(
            rating
        );


    const comment =
        feedback.comments ||
        "No comment provided.";


    const shortenedComment =
        comment.length > 60
            ? comment.substring(
                0,
                60
            ) + "..."
            : comment;


    return `
        <tr
            class="hover:bg-slate-50
                   transition-colors">

            <!-- ID -->

            <td
                class="px-4 py-3
                       text-xs
                       font-semibold
                       text-slate-700
                       whitespace-nowrap">

                #${escapeFeedbackHTML(
                    feedback.feedbackID
                )}

            </td>


            <!-- COMPLAINT -->

            <td
                class="px-4 py-3">

                <span
                    class="text-xs
                           font-semibold
                           text-slate-700">

                    #${escapeFeedbackHTML(
                        feedback.complaintID
                    )}

                </span>

                <p
                    class="text-[11px]
                           text-slate-400
                           mt-0.5">

                    ${escapeFeedbackHTML(
                        feedback.status || ""
                    )}

                </p>

            </td>


            <!-- CITIZEN -->

            <td
                class="px-4 py-3
                       text-xs
                       text-slate-700">

                ${escapeFeedbackHTML(
                    feedback.citizenName ||
                    "Unknown Citizen"
                )}

            </td>


            <!-- RATING -->

            <td
                class="px-4 py-3
                       whitespace-nowrap">

                <span
                    class="text-yellow-400
                           text-base">

                    ${stars}

                </span>

            </td>


            <!-- COMMENT -->

            <td
                class="px-4 py-3
                       max-w-xs">

                <p
                    class="text-xs
                           text-slate-600
                           truncate">

                    ${escapeFeedbackHTML(
                        shortenedComment
                    )}

                </p>

            </td>


            <!-- DATE -->

            <td
                class="px-4 py-3
                       text-xs
                       text-slate-500
                       whitespace-nowrap">

                ${formatFeedbackDate(
                    feedback.createdAt
                )}

            </td>


            <!-- ACTION -->

            <td
                class="px-4 py-3
                       text-center">

                <button
                    type="button"
                    class="viewFeedbackBtn
                           inline-flex
                           items-center
                           justify-center
                           px-3 py-1.5
                           rounded-lg
                           bg-blue-600
                           text-white
                           hover:bg-blue-700
                           transition
                           text-xs
                           font-medium"
                    data-id="${escapeFeedbackHTML(
                        feedback.feedbackID
                    )}">

                    <i
                        class="fa-solid
                               fa-eye
                               mr-1.5">
                    </i>

                    View

                </button>

            </td>

        </tr>
    `;

}


// ==========================================
// STAR DISPLAY
// ==========================================

function createStars(
    rating
) {

    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rating
                ? "★"
                : "☆";

    }


    return stars;

}


// ==========================================
// FILTER FEEDBACK
// ==========================================

function filterFeedback() {

    // Always return to page 1
    // when filters change.

    feedbackCurrentPage = 1;


    const filtered =
        getFilteredFeedback();


    renderFeedback(
        filtered
    );

}


// ==========================================
// OPEN FEEDBACK MODAL
// ==========================================

function openFeedbackModal(
    feedback
) {

    const feedbackID =
        document.getElementById(
            "modalFeedbackID"
        );

    const complaintID =
        document.getElementById(
            "modalComplaintID"
        );

    const complaintText =
        document.getElementById(
            "modalComplaintText"
        );

    const citizenName =
        document.getElementById(
            "modalCitizenName"
        );

    const modalDate =
        document.getElementById(
            "modalDate"
        );

    const modalRatingStars =
        document.getElementById(
            "modalRatingStars"
        );

    const modalRatingNumber =
        document.getElementById(
            "modalRatingNumber"
        );

    const modalComment =
        document.getElementById(
            "modalComment"
        );

    const feedbackModal =
        document.getElementById(
            "feedbackModal"
        );


    if (feedbackID) {

        feedbackID.textContent =
            `#${feedback.feedbackID}`;

    }


    if (complaintID) {

        complaintID.textContent =
            `Complaint #${feedback.complaintID}`;

    }


    if (complaintText) {

        complaintText.textContent =
            feedback.rawComplaintText ||
            "No complaint description available.";

    }


    if (citizenName) {

        citizenName.textContent =
            feedback.citizenName ||
            "Unknown Citizen";

    }


    if (modalDate) {

        modalDate.textContent =
            formatFeedbackDate(
                feedback.createdAt
            );

    }


    const rating =
        Number(
            feedback.rating || 0
        );


    if (modalRatingStars) {

        modalRatingStars.textContent =
            createStars(
                rating
            );

    }


    if (modalRatingNumber) {

        modalRatingNumber.textContent =
            `${rating} / 5`;

    }


    if (modalComment) {

        modalComment.textContent =
            feedback.comments ||
            "No comment provided.";

    }


    if (feedbackModal) {

        feedbackModal.classList.remove(
            "hidden"
        );

    }

}


// ==========================================
// REGISTER VIEW BUTTONS
// ==========================================

function registerViewButtons() {

    document
        .querySelectorAll(
            ".viewFeedbackBtn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const feedback =
                            feedbackData.find(
                                item =>
                                    String(
                                        item.feedbackID
                                    ) ===
                                    String(id)
                            );


                        if (!feedback) {

                            console.error(
                                "Feedback not found:",
                                id
                            );

                            return;

                        }


                        openFeedbackModal(
                            feedback
                        );

                    }
                );

            }
        );

}


// ==========================================
// CLOSE FEEDBACK MODAL
// ==========================================

function closeFeedbackModal() {

    const modal =
        document.getElementById(
            "feedbackModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatFeedbackDate(
    dateString
) {

    if (!dateString) {

        return "Not available";

    }


    const date =
        new Date(
            String(
                dateString
            ).replace(
                " ",
                "T"
            )
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateString
        );

    }


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeFeedbackHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}