

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
        let hasQuestions = false; // Flag to check if the user has any questions

        // Check if data exists
        if (!data) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center;">No questions found.</td>
                </tr>
            `;
            return;
        }

        for (let id in data) {
            // Show only the questions uploaded by the current user
            if (data[id].username === currentUsername) {
                hasQuestions = true;
                const row = document.createElement("tr");
                count++;

                // Determine the background color based on the question's status
                // Set background color
                
                if(data[id].status === "Approved"){
                    row.style.backgroundColor =  "#d3f7cb";
                }else if(data[id].status === "Rejected"){
                    row.style.backgroundColor =  "#f7d5d5";
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
                    <td>${data[id].status}</td>
                    <td><button onclick="deleteQuestion('${id}')">Delete</button></td>
                `;
                tableBody.appendChild(row);
            }
        }

        // If no questions, display a message
        if (!hasQuestions) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center;">No questions found for the current user.</td>
                </tr>
            `;
        }
    });
}

window.deleteQuestion = function(id) {
    if (confirm("Are you sure you want to delete this question?")) {
        database.ref(`mcq-type-question/${id}`).remove()
        .then(() => {
            alert("Question deleted successfully!");
            loadQuestions(); // Reload the table after deletion
        })
        .catch((error) => {
            console.error("Error deleting question:", error);
        });
    }
};
