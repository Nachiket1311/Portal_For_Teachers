
// Initialize Firebase (ensure it's initialized only once)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const tableBody = document.getElementById("rejected-body");

// Assume you retrieve the username from Firebase Auth or localStorage
const currentUsername = localStorage.getItem("username"); // or get it from Firebase Authentication

// Check if the user is logged in
if (!currentUsername) {
    alert("User is not logged in.");
} else {
    loadQuestions(); // Load questions if the user is logged in
}

function loadQuestions() {
    const questionsRef = database.ref('mcq-type-question');
    questionsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = ""; // Clear the table before appending new data
        let count = 0; 
        let hasQuestions = false;
        // Check if data exists
        if (!data) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center;">No questions found.</td>
                </tr>
            `;
            return;
        }

        for (let id in data) {
            // Show only the questions uploaded by the current user
                count++;
                const row = document.createElement("tr");
                hasQuestions = true;
                
                if (data[id].username === currentUsername) {
                    row.style.backgroundColor =  "#9fc5e8";
                }else{
                    row.style.backgroundColor =  "white";
                }
                 
               
                row.innerHTML = `
                    <td>${count}</td>
                    <td>${data[id].question}</td>
                    <td>${data[id].options1}</td>
                    <td>${data[id].options2}</td>
                    <td>${data[id].options3}</td>
                    <td>${data[id].options4}</td>
                    <td>${data[id].Canswer}</td>
                    <td>${data[id].marks}</td>
                    <td>${data[id].chapter}</td>
                    <td>${data[id].std}</td>
                    <td>${data[id].medium}</td>
                    <td>${data[id].sub}</td>
                `;
                tableBody.appendChild(row);
            }


        // If no questions, display a message
        if (!hasQuestions) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center;">No questions found for the current user.</td>
                </tr>
            `;
        }
    });
}

