/* =========================================================
   SYSTEM PROFILE
   ========================================================= */

window.initProfile = function () {

    console.log("System Profile initialized.");
    initEditProfile();

    // Make sure the profile HTML has been inserted
    if (!document.getElementById("profileEmailUi")) {
        console.warn("Profile HTML not ready yet. Retrying...");

        setTimeout(() => {
            window.initProfile();
        }, 50);

        return;
    }

    loadSystemProfile();

};



async function loadSystemProfile() {

    try {

        const response = await fetch(
            "/Complaint/Users/get_Systemprofile.php",
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const result = await response.json();

        console.log("SYSTEM PROFILE RESPONSE:", result);

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load profile."
            );
        }

        const user = result.user;

        currentProfileUser = user;

        console.log("PROFILE USER:", user);
        console.log("PROFILE NAME:", user.name);
        console.log("PROFILE EMAIL:", user.email);

        /* =========================================
            NAME
            ========================================= */

        setProfileText(
            "profileNameUi",
            user.name
        );


        /* =========================================
           EMAIL HEADER
           ========================================= */

        const emailHeader =
            document.getElementById("profileEmailHeader");

        if (emailHeader) {
            emailHeader.textContent = user.email;
        }


        /* =========================================
           EMAIL ACCOUNT INFORMATION
           ========================================= */

        const email =
            document.getElementById("profileEmailUi");

        if (email) {

            console.log(
                "Found #profileEmail element"
            );

            email.textContent = user.email;


        }
        else {

            console.error(
                "#profileEmail DOES NOT EXIST"
            );

        }


        /* =========================================
           ROLE
           ========================================= */

        setProfileText(
            "profileRole",
            formatRole(user.role)
        );

        setProfileText(
            "profileRoleBadge",
            formatRole(user.role)
        );


        /* =========================================
           DEPARTMENT
           ========================================= */

        setProfileText(
            "profileDepartment",
            user.department
        );

        setProfileText(
            "profileDepartmentBadge",
            user.department
        );


        /* =========================================
           CREATED
           ========================================= */

        setProfileText(
            "profileCreated",
            formatProfileDate(user.createdAt)
        );


        /* =========================================
   AVATAR
   ========================================= */

        const avatarImage =
            document.getElementById("profileAvatarImage");

        const avatarInitials =
            document.getElementById("profileInitials");


        if (user.profilePicture) {

            avatarImage.src =
                user.profilePicture;

            avatarImage.classList.remove("hidden");

            avatarInitials.classList.add("hidden");

        }
        else {

            avatarImage.src = "";

            avatarImage.classList.add("hidden");

            avatarInitials.textContent =
                getProfileInitials(user.name);

            avatarInitials.classList.remove("hidden");

        }

    }
    catch (error) {

        console.error(
            "SYSTEM PROFILE ERROR:",
            error
        );

        showProfileError();

    }

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setProfileText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value || "--";

}


/* =========================================================
   FORMAT ROLE
   ========================================================= */

function formatRole(role) {

    if (!role) {
        return "--";
    }

    return role
        .toLowerCase()
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatProfileDate(dateString) {

    if (!dateString) {
        return "--";
    }

    const date =
        new Date(
            dateString.replace(" ", "T")
        );

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   INITIALS
   ========================================================= */
function getProfileInitials(name) {

    if (!name) {
        return "U";
    }

    const cleanName =
        String(name).trim();

    if (!cleanName) {
        return "U";
    }

    const parts =
        cleanName
            .split(/\s+/)
            .filter(Boolean);

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


/* =========================================================
   ERROR
   ========================================================= */

function showProfileError() {

    setProfileText(
        "profileEmailUi",
        "Unable to load"
    );

    setProfileText(
        "profileEmailHeader",
        "Unable to load profile"
    );

    setProfileText(
        "profileRole",
        "--"
    );

    setProfileText(
        "profileRoleBadge",
        "--"
    );

    setProfileText(
        "profileDepartment",
        "--"
    );

    setProfileText(
        "profileDepartmentBadge",
        "--"
    );

    setProfileText(
        "profileCreated",
        "--"
    );


    const avatar =
        document.getElementById("profileAvatar");

    if (avatar) {
        avatar.textContent = "!";
    }

}
/* =========================================================
   EDIT PROFILE
   ========================================================= */

let currentProfileUser = null;
let selectedProfileImage = null;


function initEditProfile() {

    const editButton =
        document.getElementById("editProfileButton");

    const modal =
        document.getElementById("editProfileModal");

    const closeButton =
        document.getElementById("closeEditProfileModal");

    const cancelButton =
        document.getElementById("cancelEditProfile");

    const saveButton =
        document.getElementById("saveEditProfile");

    const imageInput =
        document.getElementById("profilePictureInput");


    if (!editButton || !modal) {
        return;
    }


    /* =========================================
       OPEN MODAL
       ========================================= */

    editButton.onclick = () => {

        if (!currentProfileUser) {

            console.warn(
                "Profile data has not loaded yet."
            );

            return;
        }

        openEditProfileModal();

    };


    /* =========================================
       CLOSE MODAL
       ========================================= */

    if (closeButton) {

        closeButton.onclick = closeEditProfileModal;

    }


    if (cancelButton) {

        cancelButton.onclick = closeEditProfileModal;

    }


    /* =========================================
       CLICK OUTSIDE
       ========================================= */

    modal.onclick = (event) => {

        if (event.target === modal) {

            closeEditProfileModal();

        }

    };


    /* =========================================
       IMAGE SELECT
       ========================================= */

    if (imageInput) {

        imageInput.onchange = handleProfileImage;

    }


    /* =========================================
       SAVE
       ========================================= */

    if (saveButton) {

        saveButton.onclick = saveProfileChanges;

    }

}


/* =========================================================
   OPEN EDIT MODAL
   ========================================================= */

function openEditProfileModal() {

    const modal =
        document.getElementById("editProfileModal");

    const nameInput =
        document.getElementById("editProfileName");

    const email =
        document.getElementById("editProfileEmail");

    const role =
        document.getElementById("editProfileRole");

    const department =
        document.getElementById("editProfileDepartment");

    const initials =
        document.getElementById("editProfileInitials");

    const preview =
        document.getElementById("editProfileImagePreview");


    nameInput.value =
        currentProfileUser.name || "";

    email.textContent =
        currentProfileUser.email || "--";

    role.textContent =
        formatRole(currentProfileUser.role);

    department.textContent =
        currentProfileUser.department || "--";


    selectedProfileImage = null;


    /* Existing profile picture */

    if (currentProfileUser.profilePicture) {

        preview.src =
            currentProfileUser.profilePicture;

        preview.classList.remove("hidden");

        initials.classList.add("hidden");

    }
    else {

        preview.src = "";

        preview.classList.add("hidden");

        initials.textContent =
            getInitials(currentProfileUser.name);

        initials.classList.remove("hidden");

    }


    modal.classList.remove("hidden");

}


/* =========================================================
   CLOSE EDIT MODAL
   ========================================================= */

function closeEditProfileModal() {

    const modal =
        document.getElementById("editProfileModal");

    if (modal) {

        modal.classList.add("hidden");

    }

}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function handleProfileImage(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    /* 5MB */

    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Profile picture must not exceed 5MB."
        );

        event.target.value = "";

        return;

    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        alert(
            "Please select a JPG, PNG, or WebP image."
        );

        event.target.value = "";

        return;

    }


    selectedProfileImage = file;


    const preview =
        document.getElementById("editProfileImagePreview");

    const initials =
        document.getElementById("editProfileInitials");


    const reader =
        new FileReader();


    reader.onload = function () {

        preview.src =
            reader.result;

        preview.classList.remove("hidden");

        initials.classList.add("hidden");

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

async function saveProfileChanges() {

    const nameInput =
        document.getElementById("editProfileName");

    const saveButton =
        document.getElementById("saveEditProfile");


    const name =
        nameInput.value.trim();


    if (!name) {

        alert("Please enter your full name.");

        nameInput.focus();

        return;

    }


    if (name.length < 2) {

        alert(
            "Please enter a valid name."
        );

        nameInput.focus();

        return;

    }


    saveButton.disabled = true;

    saveButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Saving...';


    try {

        const formData =
            new FormData();


        formData.append(
            "name",
            name
        );


        if (selectedProfileImage) {

            formData.append(
                "profilePicture",
                selectedProfileImage
            );

        }


        const response =
            await fetch(
                "/Complaint/Users/update_Systemprofile.php",
                {
                    method: "POST",
                    credentials: "same-origin",
                    body: formData
                }
            );


        const result =
            await response.json();


        console.log(
            "UPDATE PROFILE RESPONSE:",
            result
        );


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to update profile."
            );

        }


        alert(
            "Profile updated successfully."
        );


        closeEditProfileModal();


        /* Reload profile */

        await loadSystemProfile();


    }
    catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        alert(
            error.message ||
            "Failed to update profile."
        );

    }
    finally {

        saveButton.disabled = false;

        saveButton.innerHTML =
            '<i class="fa-solid fa-check mr-1"></i> Save Changes';

    }

}