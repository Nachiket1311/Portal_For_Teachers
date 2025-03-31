
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tableBody = document.getElementById("pending-body");

function loadQuestions() {
    const questionsRef = database.ref('mcq-type-question'); // Adjust the path as per your database structure
    questionsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = ""; // Clear the table before appending new data
        let count = 0;
        let hasPendingQuestions = false; // Flag to check for pending questions

        for (let id in data) {
            if (data[id].status === "pending") { // Filter for pending questions
                hasPendingQuestions = true;
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
                    <td>
                        <select id="status-${id}" onchange="updateRemark('${id}')">
                            <option value="Pending" ${data[id].status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Approved" ${data[id].status === "Approved" ? "selected" : ""}>Approved</option>
                            <option value="Rejected" ${data[id].status === "Rejected" ? "selected" : ""}>Rejected</option>
                        </select>
                    </td>
                    <td><button onclick="deleteQuestion('${id}')">Delete</button></td>
                `;

                tableBody.appendChild(row);
            }
        }

        // If no pending questions, display a message
        if (!hasPendingQuestions) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center;">No pending questions.</td>
                </tr>
            `;
        }
    });
}

loadQuestions();

window.updateRemark = function(id) {
    const remarkSelect = document.getElementById(`status-${id}`);
    const newRemark = remarkSelect.value;

    // Update the remark in the database
    database.ref(`mcq-type-question/${id}`).update({
        status: newRemark
    })
    .then(() => {
        alert("Remark updated successfully!");
        loadQuestions(); // Reload questions to reflect changes
    })
    .catch((error) => {
        console.error("Error updating remark:", error);
    });
};

window.deleteQuestion = function(id) {
    if (confirm("Are you sure you want to delete this question?")) {
        database.ref(`mcq-type-question/${id}`).remove()
        .then(() => {
            alert("Question deleted successfully!");
            loadQuestions(); // Reload the table
        })
        .catch((error) => {
            console.error("Error deleting question:", error);
        });
    }
};
