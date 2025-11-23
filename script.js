//Course class
let rawCourses = [];   
let courses = [];      

class Course {
    constructor(obj) {
        this.id = obj.id;
        this.title = obj.title;
        this.department = obj.department;
        this.level = obj.level;
        this.credits = obj.credits;
        this.instructor = obj.instructor ?? "TBA";
        this.description = obj.description;
        this.semester = obj.semester;
    }

    formattedDetails() {
        return `
            <h2>${this.id}</h2>
            <p><strong>Title:</strong> ${this.title}</p>
            <p><strong>Department:</strong> ${this.department}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Credits:</strong> ${this.credits}</p>
            <p><strong>Instructor:</strong> ${this.instructor}</p>
            <p><strong>Semester:</strong> ${this.semester}</p>
            <p>${this.description}</p>
        `;
    }
}


//  error display function 
function showError(msg) {
    document.getElementById("error").textContent = msg;
}
function clearError() {
    document.getElementById("error").textContent = "";
}

// takes input from user
document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);

            if (!Array.isArray(parsed)) {
                throw new Error("JSON root must be an array.");
            }

            rawCourses = parsed.map(obj => new Course(obj));
            courses = [...rawCourses];

            clearError();
            generateDropdowns();
            applyFilters(); // also displays list

        } catch (e) {
            console.error(e);
            showError("Invalid JSON file format.");
            document.getElementById("courseList").innerHTML = "";
            document.getElementById("courseDetails").textContent =
                "Could not load data.";
        }
    };

    reader.onerror = () => {
        showError("Error reading file.");
    };

    reader.readAsText(file);
});

// dropdown window 
function makeDropdown(selectId, values) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";

    values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    });
}

function generateDropdowns() {
    if (rawCourses.length === 0) return;

    const deptValues = ["All", ...new Set(rawCourses.map(c => c.department))];
    const levelValues = ["All", ...new Set(rawCourses.map(c => c.level))];
    const creditValues = ["All", ...new Set(rawCourses.map(c => c.credits))];
    const instructorValues = ["All", ...new Set(rawCourses.map(c => c.instructor))];

    makeDropdown("filterDept", deptValues);
    makeDropdown("filterLevel", levelValues);
    makeDropdown("filterCredits", creditValues);
    makeDropdown("filterInstructor", instructorValues);
}

// filter
document.getElementById("filterBar").addEventListener("change", () => {
    applyFilters();
});

// function to apply filters
function applyFilters() {
    const deptSel = document.getElementById("filterDept");
    const levelSel = document.getElementById("filterLevel");
    const creditSel = document.getElementById("filterCredits");
    const instrSel = document.getElementById("filterInstructor");

    const deptVal = deptSel.value || "All";
    const levelVal = levelSel.value || "All";
    const creditVal = creditSel.value || "All";
    const instrVal = instrSel.value || "All";

    courses = rawCourses.filter(c =>
        (deptVal === "All" || c.department === deptVal) &&
        (levelVal === "All" || String(c.level) === String(levelVal)) &&
        (creditVal === "All" || String(c.credits) === String(creditVal)) &&
        (instrVal === "All" || c.instructor === instrVal)
    );

    applySorting(false);
    displayCourseList(courses);
}

// sorting 
document.getElementById("sortSelect").addEventListener("change", () => {
    applySorting();
    displayCourseList(courses);
});

// function for semester 
function semesterValue(sem) {
    if (!sem) return 0;
    const [term, yearStr] = sem.split(" ");
    const year = parseInt(yearStr, 10) || 0;
    const orderMap = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };
    const termVal = orderMap[term] || 0;
    return year * 10 + termVal;
}

// apply sorting algorithms
function applySorting(shouldDisplay = true) {
    const mode = document.getElementById("sortSelect").value;

    if (mode === "idAZ") {
        courses.sort((a, b) => a.id.localeCompare(b.id));
    } else if (mode === "idZA") {
        courses.sort((a, b) => b.id.localeCompare(a.id));
    } else if (mode === "titleAZ") {
        courses.sort((a, b) => a.title.localeCompare(b.title));
    } else if (mode === "titleZA") {
        courses.sort((a, b) => b.title.localeCompare(a.title));
    } else if (mode === "semEarliest") {
        courses.sort((a, b) => semesterValue(a.semester) - semesterValue(b.semester));
    } else if (mode === "semLatest") {
        courses.sort((a, b) => semesterValue(b.semester) - semesterValue(a.semester));
    }

    if (shouldDisplay) {
        displayCourseList(courses);
    }
}

// displaying the course lists 
    function displayCourseList(list) {
    const container = document.getElementById("courseList");
    const detailsDiv = document.getElementById("courseDetails");
    container.innerHTML = "";

    if (list.length === 0) {
        container.textContent = "No courses match the selected filters.";
        detailsDiv.textContent = "Select a different filter or load more data.";
        return;
    }

    list.forEach(course => {
        const item = document.createElement("div");
        item.className = "courseItem";
        item.textContent = course.id;

        item.addEventListener("click", () => {
            [...container.getElementsByClassName("courseItem")]
                .forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");

            detailsDiv.innerHTML = course.formattedDetails();
        });

        container.appendChild(item);
    });

    // default details to first item
    detailsDiv.innerHTML = list[0].formattedDetails();
    container.firstChild.classList.add("selected");
}
