

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to add a new row to the chapters table
function addQuestionRow() {
    const questionTableBody = document.getElementById("questionsTableBody");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="number" class="form-control" placeholder="SR.No" required></td>
      <td><input type="text" class="form-control" placeholder="Name of Chapter" required></td>
      <td><button class="btn btn-danger" onclick="deleteQuestionRow(this)">Delete</button></td>
    `;

    questionTableBody.appendChild(row);
}

// Function to delete a chapter row
function deleteQuestionRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

function saveSyllabus() {
    const stdNumber = document.getElementById("stdnumber").value;
    const subject = document.getElementById("Subject").value.toLowerCase();
    const medium = document.getElementById("Medium").value.toLowerCase();

    if (stdNumber && subject && medium) {
        // Extract data from each row in the table
        const chapters = [];
        document.querySelectorAll("#questionsTableBody tr").forEach(row => {
            const srNum = row.cells[0].querySelector("input").value;
            const chapterName = row.cells[1].querySelector("input").value;

            if (srNum && chapterName) {
                chapters.push({
                    srNum: parseInt(srNum, 10),  // Convert srNum to an integer
                    chapterName
                });
            }
        });

        // Track if any duplicates are found
        let stdExists = false;
        let mediumExists = false;
        let subjectExists = false;

        // Check if the STD already exists
        database.ref("standards").once('value')
            .then(snapshot => {
                snapshot.forEach(childSnapshot => {
                    const existingValue = childSnapshot.val();
                    if (existingValue === stdNumber) {
                        stdExists = true;
                    }
                });

                if (stdExists) {
                    console.warn("Standard already exists!"); // Alert for duplicate standard
                } else {
                    return database.ref("standards").push(stdNumber);
                }
            })
            .catch(error => {
                console.error("Error checking STD:", error);
            });

        // Check if the medium already exists
        database.ref("medium").once('value')
            .then(snapshot => {
                snapshot.forEach(childSnapshot => {
                    const existingValue = childSnapshot.val();
                    if (existingValue === medium) {
                        mediumExists = true;
                    }
                });

                if (mediumExists) {
                    console.warn("Medium already exists!"); // Alert for duplicate medium
                } else {
                    return database.ref("medium").push(medium);
                }
            })
            .catch(error => {
                console.error("Error checking medium:", error);
            });

        // Check if the Subject already exists
        database.ref("subject").once('value')
            .then(snapshot => {
                snapshot.forEach(childSnapshot => {
                    const existingValue = childSnapshot.val();
                    if (existingValue === subject) {
                        subjectExists = true;
                    }
                });

                if (subjectExists) {
                    console.warn("Subject already exists!"); // Alert for duplicate subject
                } else {
                    return database.ref("subject").push(subject);
                }
            })
            .catch(error => {
                console.error("Error checking subject:", error);
            });

        // Create a new syllabus object
        const syllabus = {
            stdNumber,
            subject,
            medium,
            chapters
        };

        // Push syllabus to Firebase if it's valid
        database.ref("syllabus").push(syllabus)
            .then(() => {
                alert("Syllabus saved successfully!");
                document.getElementById("syllabusForm").reset();
                document.getElementById("questionsTableBody").innerHTML = ""; // Clear table rows after saving
                displaySyllabus();
            })
            .catch(error => console.error("Error saving syllabus:", error));
    } else {
        alert("Please fill in all required fields.");
    }
}
// Function to display saved syllabus from Firebase
// Function to display saved syllabus from Firebase
function displaySyllabus() {
    const syllabusList = document.getElementById("syllabusList");
    syllabusList.innerHTML = "";

    // Fetch syllabus from Firebase
    database.ref("syllabus").once("value", snapshot => {
        snapshot.forEach(childSnapshot => {
            const syllabus = childSnapshot.val();
            const syllabusKey = childSnapshot.key;

            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
                <strong>Standard: ${syllabus.stdNumber}, Subject: ${syllabus.subject}, Medium: ${syllabus.medium}</strong>
                <ul class="mt-2">
                    ${(syllabus.chapters || []).map(chapter => `
                        <li>SR.No ${chapter.srNum}: ${chapter.chapterName}</li>
                    `).join("")}
                </ul>
                <button class="btn btn-danger btn-sm float-right" onclick="deleteSyllabus('${syllabusKey}')">Delete</button>
            `;
            syllabusList.appendChild(li);
        });
    });
}


// Function to delete a saved syllabus from Firebase
function deleteSyllabus(syllabusKey) {
    database.ref("syllabus/" + syllabusKey).remove()
        .then(() => {
            alert("Syllabus deleted successfully!");
            displaySyllabus();
        })
        .catch(error => console.error("Error deleting syllabus:", error));
}

// Load existing syllabus on page load
window.onload = displaySyllabus;

const colors = [
    "linear-gradient(-45deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb)",
    "linear-gradient(-45deg, #a18cd1, #fbc2eb, #fad0c4, #ff9a9e)",
    "linear-gradient(-45deg, #8EC5FC, #E0C3FC, #ff9a9e, #a18cd1)"
];

let index = 0;

function changeBackground() {
    document.body.style.background = colors[index];
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "gradientBG 8s ease infinite";
    index = (index + 1) % colors.length;
}

// Change background every 10 seconds
setInterval(changeBackground, 6000);
