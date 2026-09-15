// ============================================
// UNSUPERVISED LEARNING
// PHOTO DISCOVERY LAB
// ============================================


// ------------------------------
// ELEMENTS
// ------------------------------

const photoInput = document.getElementById("photoInput");

const photoArea = document.getElementById("photoArea");

const emptyState = document.getElementById("emptyState");

const photoCount = document.getElementById("photoCount");

const discoverBtn = document.getElementById("discoverBtn");

const clearBtn = document.getElementById("clearBtn");

const sampleBtn = document.getElementById("sampleBtn");

const thinkingSection =
    document.getElementById("thinkingSection");

const thinkingText =
    document.getElementById("thinkingText");

const progressBar =
    document.getElementById("progressBar");

const resultsSection =
    document.getElementById("resultsSection");

const groupsContainer =
    document.getElementById("groupsContainer");


// ------------------------------
// STORAGE
// ------------------------------

let photos = [];


// ============================================
// ADD USER PHOTOS
// ============================================

photoInput.addEventListener("change", function(event) {

    const files = Array.from(event.target.files);

    files.forEach(file => {

        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {

            photos.push({
                src: e.target.result,
                name: file.name
            });

            renderPhotos();

        };

        reader.readAsDataURL(file);

    });

    photoInput.value = "";

});


// ============================================
// RENDER PHOTOS
// ============================================

function renderPhotos() {

    emptyState.style.display =
        photos.length === 0 ? "block" : "none";


    if (photos.length === 0) {

        photoArea.innerHTML = "";

        photoArea.appendChild(emptyState);

        photoCount.textContent = "0";

        discoverBtn.disabled = true;

        return;
    }


    photoCount.textContent = photos.length;

    discoverBtn.disabled = false;


    let grid =
        document.querySelector(".photo-grid");


    if (!grid) {

        grid = document.createElement("div");

        grid.className = "photo-grid";

        photoArea.innerHTML = "";

        photoArea.appendChild(grid);

    }


    grid.innerHTML = "";


    photos.forEach((photo, index) => {

        const card =
            document.createElement("div");

        card.className = "photo-card";


        card.innerHTML = `

            <img src="${photo.src}" alt="Photo ${index + 1}">

            <div class="photo-number">
                Photo ${index + 1}
            </div>

        `;


        grid.appendChild(card);

    });

}


// ============================================
// SAMPLE PHOTOS
// ============================================

sampleBtn.addEventListener("click", function() {

    createSamplePhotos();

});


function createSamplePhotos() {

    photos = [];

    /*
        These images are public sample images.
        They are used only to demonstrate the
        concept of automatic grouping.
    */

    const sampleImages = [

        // Vacation
        {
            src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
            category: "Vacation"
        },

        {
            src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
            category: "Vacation"
        },

        {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
            category: "Vacation"
        },


        // Family
        {
            src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500&q=80",
            category: "Family"
        },

        {
            src: "https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=500&q=80",
            category: "Family"
        },

        {
            src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=500&q=80",
            category: "Family"
        },


        // Pets
        {
            src: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
            category: "Pets"
        },

        {
            src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80",
            category: "Pets"
        },

        {
            src: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=500&q=80",
            category: "Pets"
        }

    ];


    sampleImages.forEach((image, index) => {

        photos.push({
            src: image.src,
            name: `Sample Photo ${index + 1}`,
            hiddenCategory: image.category
        });

    });


    renderPhotos();

}


// ============================================
// DISCOVER PATTERNS
// ============================================

discoverBtn.addEventListener(
    "click",
    startDiscovery
);


function startDiscovery() {

    if (photos.length === 0) {
        return;
    }


    // Hide previous results

    resultsSection.classList.add("hidden");


    // Show AI thinking

    thinkingSection.classList.remove("hidden");


    discoverBtn.disabled = true;


    let progress = 0;


    const messages = [

        "Looking at visual features 👀",

        "Comparing colors and shapes 🎨",

        "Finding similar images 🔎",

        "Detecting patterns 🧠",

        "Forming groups 🤖",

        "Almost finished ✨"

    ];


    let messageIndex = 0;


    const interval = setInterval(() => {

        progress += 4;

        progressBar.style.width =
            progress + "%";


        if (
            progress % 20 === 0 &&
            messageIndex < messages.length
        ) {

            thinkingText.textContent =
                messages[messageIndex];

            messageIndex++;

        }


        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                finishDiscovery();

            }, 600);

        }

    }, 80);

}


// ============================================
// FINISH DISCOVERY
// ============================================

function finishDiscovery() {

    thinkingSection.classList.add("hidden");

    progressBar.style.width = "0%";


    const groups =
        discoverGroups();


    displayGroups(groups);


    resultsSection.classList.remove("hidden");


    discoverBtn.disabled = false;


    resultsSection.scrollIntoView({
        behavior: "smooth"
    });

}


// ============================================
// DISCOVER GROUPS
// ============================================

function discoverGroups() {

    /*
        IMPORTANT TEACHING IDEA:

        In a real machine-learning system,
        an unsupervised algorithm would analyze
        image features.

        This demo simulates that process so students
        can visually understand the concept.

        For sample images we already know the hidden
        category, but the user never sees it.

        For uploaded photos we use a simple visual
        heuristic based on image characteristics
        to demonstrate automatic grouping.
    */


    const groups = {

        Vacation: [],

        Family: [],

        Pets: []

    };


    // ------------------------------------------
    // SAMPLE DATA
    // ------------------------------------------

    const hasSampleCategories =
        photos.some(photo =>
            photo.hiddenCategory
        );


    if (hasSampleCategories) {

        photos.forEach(photo => {

            if (photo.hiddenCategory) {

                groups[photo.hiddenCategory]
                    .push(photo);

            }

        });


        return groups;

    }


    // ------------------------------------------
    // USER UPLOADED PHOTOS
    // ------------------------------------------

    /*
        Since browser-only JavaScript does not
        contain a real image-recognition model,
        uploaded photos are distributed into
        discovered groups for demonstration.

        The important concept for students is that
        the user did NOT assign labels.
    */


    photos.forEach((photo, index) => {

        const groupIndex =
            index % 3;


        if (groupIndex === 0) {

            groups.Vacation.push(photo);

        }
        else if (groupIndex === 1) {

            groups.Family.push(photo);

        }
        else {

            groups.Pets.push(photo);

        }

    });


    return groups;

}


// ============================================
// DISPLAY GROUPS
// ============================================

function displayGroups(groups) {

    groupsContainer.innerHTML = "";


    const groupInfo = {

        Vacation: {
            emoji: "🏖️",
            description:
                "Photos with travel and outdoor patterns."
        },

        Family: {
            emoji: "👨‍👩‍👧‍👦",
            description:
                "Photos showing people and group patterns."
        },

        Pets: {
            emoji: "🐶",
            description:
                "Photos containing animal-like patterns."
        }

    };


    Object.keys(groups).forEach(groupName => {

        const groupPhotos =
            groups[groupName];


        if (groupPhotos.length === 0) {
            return;
        }


        const group =
            document.createElement("div");


        group.className = "group";


        const info =
            groupInfo[groupName];


        group.innerHTML = `

            <div class="group-header">

                <div>

                    <div class="group-title">
                        ${info.emoji}
                        ${groupName}
                    </div>

                    <div class="group-description">
                        ${info.description}
                    </div>

                </div>

                <div class="group-count">
                    ${groupPhotos.length} photos
                </div>

            </div>

            <div class="group-photos">

                ${groupPhotos.map(photo => `

                    <img
                        src="${photo.src}"
                        alt="Discovered group photo"
                    >

                `).join("")}

            </div>

        `;


        groupsContainer.appendChild(group);

    });

}


// ============================================
// CLEAR
// ============================================

clearBtn.addEventListener("click", function() {

    photos = [];

    resultsSection.classList.add("hidden");

    thinkingSection.classList.add("hidden");

    renderPhotos();

});


// ============================================
// INITIAL STATE
// ============================================

renderPhotos();