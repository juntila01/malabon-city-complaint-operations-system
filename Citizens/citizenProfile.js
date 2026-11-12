(() => {

    let profileData = null;
    let selectedProfileImage = null;


    // =========================================================
    // ELEMENTS
    // =========================================================

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const editProfileModal =
        document.getElementById("editProfileModal");

    const closeEditProfileBtn =
        document.getElementById("closeEditProfileBtn");

    const cancelEditProfileBtn =
        document.getElementById("cancelEditProfileBtn");

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");

    const editFullName =
        document.getElementById("editFullName");

    const editEmail =
        document.getElementById("editEmail");

    const editContact =
        document.getElementById("editContact");

    const changeProfileImageBtn =
        document.getElementById("changeProfileImageBtn");

    const editProfileImageInput =
        document.getElementById("editProfileImageInput");

    const editProfileImage =
        document.getElementById("editProfileImage");

    const editAvatarInitial =
        document.getElementById("editAvatarInitial");


    // =========================================================
    // PROFILE IMAGE URL
    // =========================================================

    function getProfileImageUrl(path) {

        if (!path) {
            return null;
        }

        path = String(path).trim();

        if (!path) {
            return null;
        }

        // Make sure path starts with /
        if (!path.startsWith("/")) {
            path = "/" + path;
        }

        // Cache-buster so updated profile pictures appear immediately
        return path + "?t=" + Date.now();
    }


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    async function loadProfile() {

        try {

            const response = await fetch(
                "get_citizenProfile.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );


            const result = await response.json();

            console.log("PROFILE:", result);


            if (!result.success) {

                if (response.status === 401) {

                    window.location.href =
                        "login.html";

                    return;

                }

                throw new Error(
                    result.message ||
                    "Unable to load profile."
                );
            }


            profileData = result.data;

            renderProfile();

        }
        catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

        }

    }


    // =========================================================
    // RENDER PROFILE
    // =========================================================

    function renderProfile() {

        if (!profileData) {
            return;
        }


        const name =
            profileData.fullName ||
            "Citizen";


        // -----------------------------------------------------
        // NAME
        // -----------------------------------------------------

        const profileName =
            document.getElementById("profileName");

        if (profileName) {

            profileName.textContent =
                name;

        }


        const infoFullName =
            document.getElementById("infoFullName");

        if (infoFullName) {

            infoFullName.textContent =
                profileData.fullName || "--";

        }


        // -----------------------------------------------------
        // EMAIL
        // -----------------------------------------------------

        const profileEmail =
            document.getElementById("profileEmail");

        if (profileEmail) {

            profileEmail.textContent =
                profileData.email || "--";

        }


        const infoEmail =
            document.getElementById("infoEmail");

        if (infoEmail) {

            infoEmail.textContent =
                profileData.email || "--";

        }


        // -----------------------------------------------------
        // CONTACT
        // -----------------------------------------------------

        const infoContact =
            document.getElementById("infoContact");

        if (infoContact) {

            infoContact.textContent =
                profileData.contactNumber || "--";

        }


        // -----------------------------------------------------
        // CREATED
        // -----------------------------------------------------

        const infoCreated =
            document.getElementById("infoCreated");

        if (infoCreated) {

            infoCreated.textContent =
                formatDate(profileData.createdAt);

        }


        // -----------------------------------------------------
        // AVATAR
        // -----------------------------------------------------

        updateMainAvatar();


        // -----------------------------------------------------
        // VERIFICATION
        // -----------------------------------------------------

        updateVerification();

    }


    // =========================================================
    // MAIN AVATAR
    // =========================================================

    function updateMainAvatar() {

        const avatar =
            document.getElementById("profileAvatar");

        if (!avatar) {
            return;
        }


        // Clear previous avatar
        avatar.innerHTML = "";


        const imageUrl =
            getProfileImageUrl(
                profileData.profileImage
            );


        // -----------------------------------------------------
        // PROFILE IMAGE EXISTS
        // -----------------------------------------------------

        if (imageUrl) {

            const image =
                document.createElement("img");


            image.src =
                imageUrl;


            image.alt =
                "Profile photo";


            image.className =
                "w-full h-full object-cover rounded-full";


            image.onerror = function () {

                console.warn(
                    "Unable to load profile image:",
                    imageUrl
                );

                avatar.innerHTML = "";

                avatar.textContent =
                    getInitials(
                        profileData.fullName
                    );

            };


            avatar.appendChild(image);

        }

        // -----------------------------------------------------
        // NO PROFILE IMAGE
        // -----------------------------------------------------

        else {

            avatar.textContent =
                getInitials(
                    profileData.fullName
                );

        }

    }


    // =========================================================
    // VERIFICATION
    // =========================================================

    function updateVerification() {

        const status =
            profileData.verificationStatus ||
            "Pending";


        const normalized =
            status.toLowerCase();


        const text =
            document.getElementById(
                "verificationText"
            );

        const dot =
            document.getElementById(
                "verificationDot"
            );

        const badge =
            document.getElementById(
                "profileVerification"
            );

        const boxTitle =
            document.getElementById(
                "verificationBoxTitle"
            );

        const boxDescription =
            document.getElementById(
                "verificationBoxDescription"
            );


        if (
            !text ||
            !dot ||
            !badge ||
            !boxTitle ||
            !boxDescription
        ) {

            return;

        }


        text.textContent =
            status;


        // Reset classes

        dot.className =
            "w-2 h-2 rounded-full";

        badge.className =
            "inline-flex items-center gap-2 mt-4 " +
            "px-3 py-1.5 rounded-full text-xs font-bold";


        // -----------------------------------------------------
        // VERIFIED
        // -----------------------------------------------------

        if (normalized === "verified") {

            dot.classList.add(
                "bg-green-500"
            );

            badge.classList.add(
                "bg-green-50",
                "text-green-700"
            );

            boxTitle.textContent =
                "Account Verified";

            boxDescription.textContent =
                "Your account has been successfully verified.";

            return;

        }


        // -----------------------------------------------------
        // REJECTED
        // -----------------------------------------------------

        if (normalized === "rejected") {

            dot.classList.add(
                "bg-red-500"
            );

            badge.classList.add(
                "bg-red-50",
                "text-red-700"
            );

            boxTitle.textContent =
                "Verification Rejected";

            boxDescription.textContent =
                "Your verification document was rejected. Please submit a valid document.";

            return;

        }


        // -----------------------------------------------------
        // PENDING
        // -----------------------------------------------------

        dot.classList.add(
            "bg-amber-500"
        );

        badge.classList.add(
            "bg-amber-50",
            "text-amber-700"
        );

        boxTitle.textContent =
            "Verification Pending";

        boxDescription.textContent =
            "Your verification is currently being reviewed.";

    }


    // =========================================================
    // OPEN EDIT PROFILE MODAL
    // =========================================================

    function openEditProfile() {

        if (!profileData) {
            return;
        }


        selectedProfileImage = null;


        // -----------------------------------------------------
        // CURRENT NAME
        // -----------------------------------------------------

        if (editFullName) {

            editFullName.value =
                profileData.fullName || "";

        }


        // -----------------------------------------------------
        // EMAIL
        // READ ONLY
        // -----------------------------------------------------

        if (editEmail) {

            editEmail.textContent =
                profileData.email || "--";

        }


        // -----------------------------------------------------
        // CONTACT
        // READ ONLY
        // -----------------------------------------------------

        if (editContact) {

            editContact.textContent =
                profileData.contactNumber || "--";

        }


        // -----------------------------------------------------
        // RESET FILE INPUT
        // -----------------------------------------------------

        if (editProfileImageInput) {

            editProfileImageInput.value =
                "";

        }


        // -----------------------------------------------------
        // CURRENT PROFILE IMAGE
        // -----------------------------------------------------

        const imageUrl =
            getProfileImageUrl(
                profileData.profileImage
            );


        if (imageUrl) {

            editProfileImage.src =
                imageUrl;

            editProfileImage.classList.remove(
                "hidden"
            );


            editAvatarInitial.classList.add(
                "hidden"
            );

        }

        else {

            editProfileImage.src =
                "";

            editProfileImage.classList.add(
                "hidden"
            );


            editAvatarInitial.classList.remove(
                "hidden"
            );


            editAvatarInitial.textContent =
                getInitials(
                    profileData.fullName
                );

        }


        // -----------------------------------------------------
        // OPEN MODAL
        // -----------------------------------------------------

        editProfileModal.classList.remove(
            "hidden"
        );

        document.body.classList.add(
            "overflow-hidden"
        );

    }


    // =========================================================
    // CLOSE EDIT PROFILE MODAL
    // =========================================================

    function closeEditProfile() {

        if (!editProfileModal) {
            return;
        }


        editProfileModal.classList.add(
            "hidden"
        );


        document.body.classList.remove(
            "overflow-hidden"
        );


        selectedProfileImage = null;


        if (editProfileImageInput) {

            editProfileImageInput.value =
                "";

        }

    }


    // =========================================================
    // SELECT PROFILE IMAGE
    // =========================================================

    function selectProfileImage() {

        if (!editProfileImageInput) {
            return;
        }

        editProfileImageInput.click();

    }


    // =========================================================
    // PROFILE IMAGE CHANGE
    // =========================================================

    if (editProfileImageInput) {

        editProfileImageInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];


                if (!file) {
                    return;
                }


                // -------------------------------------------------
                // ALLOWED TYPES
                // -------------------------------------------------

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    alert(
                        "Please select a JPG, PNG, or WEBP image."
                    );

                    this.value = "";

                    selectedProfileImage =
                        null;

                    return;

                }


                // -------------------------------------------------
                // MAX SIZE: 5MB
                // -------------------------------------------------

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {

                    alert(
                        "Profile image must not exceed 5MB."
                    );

                    this.value = "";

                    selectedProfileImage =
                        null;

                    return;

                }


                selectedProfileImage =
                    file;


                // -------------------------------------------------
                // PREVIEW
                // -------------------------------------------------

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        if (!editProfileImage) {
                            return;
                        }


                        editProfileImage.src =
                            event.target.result;


                        editProfileImage.classList.remove(
                            "hidden"
                        );


                        editAvatarInitial.classList.add(
                            "hidden"
                        );

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    // =========================================================
    // SAVE PROFILE
    // =========================================================

    async function saveProfile() {

        if (!editFullName) {
            return;
        }


        const fullName =
            editFullName.value.trim();


        // -----------------------------------------------------
        // VALIDATE NAME
        // -----------------------------------------------------

        if (!fullName) {

            alert(
                "Please enter your full name."
            );

            editFullName.focus();

            return;

        }


        if (fullName.length < 2) {

            alert(
                "Your name must contain at least 2 characters."
            );

            editFullName.focus();

            return;

        }


        // -----------------------------------------------------
        // DISABLE SAVE BUTTON
        // -----------------------------------------------------

        saveProfileBtn.disabled =
            true;

        saveProfileBtn.textContent =
            "Saving...";


        // -----------------------------------------------------
        // FORM DATA
        // -----------------------------------------------------

        const formData =
            new FormData();


        formData.append(
            "fullName",
            fullName
        );


        if (selectedProfileImage) {

            formData.append(
                "profileImage",
                selectedProfileImage
            );

        }


        // -----------------------------------------------------
        // SEND UPDATE
        // -----------------------------------------------------

        try {

            const response =
                await fetch(
                    "update_citizenProfile.php",
                    {
                        method: "POST",
                        credentials: "same-origin",
                        body: formData
                    }
                );


            const result =
                await response.json();


            console.log(
                "UPDATE PROFILE:",
                result
            );


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Unable to update profile."
                );

            }


            // -------------------------------------------------
            // CLOSE MODAL
            // -------------------------------------------------

            closeEditProfile();


            // -------------------------------------------------
            // RELOAD PROFILE
            // -------------------------------------------------

            await loadProfile();


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            showToast(
                "Profile updated successfully."
            );

        }
        catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            alert(
                error.message ||
                "Unable to update your profile."
            );

        }
        finally {

            saveProfileBtn.disabled =
                false;

            saveProfileBtn.textContent =
                "Save Changes";

        }

    }


    // =========================================================
    // TOAST
    // =========================================================

    function showToast(message) {

        const toast =
            document.createElement("div");


        toast.className =
            "fixed bottom-5 left-4 right-4 " +
            "max-w-md mx-auto z-[200] " +
            "bg-slate-900 text-white " +
            "px-4 py-3 rounded-xl " +
            "text-sm font-medium text-center " +
            "shadow-xl";


        toast.textContent =
            message;


        document.body.appendChild(
            toast
        );


        setTimeout(() => {

            toast.remove();

        }, 3000);

    }


    // =========================================================
    // GET INITIALS
    // =========================================================

    function getInitials(name) {

        if (!name) {
            return "C";
        }


        const parts =
            name.trim().split(/\s+/);


        if (parts.length === 1) {

            return parts[0]
                .charAt(0)
                .toUpperCase();

        }


        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    }


    // =========================================================
    // FORMAT DATE
    // =========================================================

    function formatDate(dateString) {

        if (!dateString) {
            return "--";
        }


        const date =
            new Date(
                String(dateString).replace(
                    " ",
                    "T"
                )
            );


        if (isNaN(date.getTime())) {

            return dateString;

        }


        return date.toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    }


    // =========================================================
    // EVENTS
    // =========================================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            openEditProfile
        );

    }


    if (closeEditProfileBtn) {

        closeEditProfileBtn.addEventListener(
            "click",
            closeEditProfile
        );

    }


    if (cancelEditProfileBtn) {

        cancelEditProfileBtn.addEventListener(
            "click",
            closeEditProfile
        );

    }


    if (changeProfileImageBtn) {

        changeProfileImageBtn.addEventListener(
            "click",
            selectProfileImage
        );

    }


    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            saveProfile
        );

    }


    // =========================================================
    // CLOSE MODAL WHEN CLICKING BACKDROP
    // =========================================================

    if (editProfileModal) {

        editProfileModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    editProfileModal
                ) {

                    closeEditProfile();

                }

            }
        );

    }


    // =========================================================
    // ESCAPE KEY
    // =========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                editProfileModal &&
                !editProfileModal.classList.contains(
                    "hidden"
                )
            ) {

                closeEditProfile();

            }

        }
    );


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    loadProfile();

})();