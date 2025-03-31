
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tableBody = document.getElementById("accepted-body");

function loadQuestions() {
    const questionsRef = database.ref('mcq-type-question'); // Adjust the path as per your database structure
    questionsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = ""; // Clear the table before appending new data
        var count=0;
        let hasAcceptedQuestions = false; // Flag to check for accepted questions

        for (let id in data) {
            if (data[id].status === "Approved") { // Filter for accepted questions
                hasAcceptedQuestions = true;
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

        // If no accepted questions, display a message
        if (!hasAcceptedQuestions) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center;">No questions are accepted.</td>
                </tr>
            `;
        }
    });
}

loadQuestions();

window.updateRemark = function(id) {
    const remarkSelect = document.getElementById(`remark-${id}`);
    const newRemark = remarkSelect.value;

    // Update the remark in the database
    database.ref(`mcq-type-question/${id}`).update({
        remark: newRemark
    })
    .then(() => {
        alert("Remark updated successfully!");
        loadQuestions(); // Reload questions to reflect changes
    })
    .catch((error) => {
        console.error("Error updating remark:", error);
    });
};
