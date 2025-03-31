

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tableBody = document.getElementById("rejected-body");

function loadQuestions() {
    const questionsRef = database.ref('mcq-type-question'); // Adjust the path as per your database structure
    questionsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = ""; // Clear the table before appending new data
        let count = 0;
        let hasRejectedQuestions = false; // Flag to check for rejected questions

        for (let id in data) {
            if (data[id].status === "Rejected") { // Filter for rejected questions
                hasRejectedQuestions = true;
                const row = document.createElement("tr");
                count++;
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

        // If no rejected questions, display a message
        if (!hasRejectedQuestions) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center;">No questions are rejected.</td>
                </tr>
            `;
        }
    });
}

loadQuestions();

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
