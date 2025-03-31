

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const questionset = database.ref("mcq-type-question");

document.addEventListener("DOMContentLoaded", function() {
    // Check for username in local storage
    let username = localStorage.getItem('username');

    // If username is not in local storage, fetch it from the database
    if (!username) {
        const userRef = database.ref('users').child('your-user-id'); // Replace 'your-user-id' with the actual user ID
        userRef.once('value').then(snapshot => {
            const userData = snapshot.val();
            username = userData ? userData.username : 'Unknown'; // Fallback if no username found
            localStorage.setItem('username', username); // Store in local storage for future use
        }).catch(error => {
            console.error("Error fetching username:", error);
        });
    }

    // CSV Upload
    document.getElementById('upload-csv').addEventListener('click', function() {
        const fileInput = document.getElementById('csv-file');
        const file = fileInput.files[0]; 

        if (file) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    console.log(results.data);
                    addQuestionsFromCSV(results.data, username); // Pass username to the function
                    alert("File uploaded");
                },
                error: function(err) {
                    console.error("Error parsing file:", err);
                }
            });
        } else {
            alert("Please choose a CSV file.");
        }
    });

    // Function to delete questions from Firebase and table
    function deleteQuestion(questionId, index) {
        if (confirm(`Are you sure you want to delete question ${index + 1}?`)) {
            const questionRef = questionset.child(questionId);  

            questionRef.remove()
            .then(() => {
                alert(`Question ${index + 1} deleted successfully`);
                document.getElementById(`row-${index}`).remove();  
            })
            .catch((error) => {
                console.error("Error deleting question:", error);
            });
        }
    }

    // Function to add questions from CSV to table
    function addQuestionsFromCSV(questions, username) {
        const questionsBody = document.getElementById("questions-body");
        questionsBody.innerHTML = ""; // Clear previous questions

        questions.forEach((question, index) => {
            const row = document.createElement("tr");
            row.id = `row-${index}`; 

            const newQuestionRef = questionset.push(); 

            newQuestionRef.set({
                question: question.questions,
                options1: question.option1,
                options2: question.option2,
                options3: question.option3,
                options4: question.option4,
                Canswer: question.Canswer,
                marks: question.marks,
                std: question.std,
                medium: question.medium,
                sub: question.sub,
                status: 'pending',
                text:'Yes',
                chapter: question.chapter,
                username: username // Add the username here
            }).then(() => {
                row.dataset.questionId = newQuestionRef.key; 

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${question.questions}</td>
                    <td>${question.option1}</td>
                    <td>${question.option2}</td>
                    <td>${question.option3}</td>
                    <td>${question.option4}</td>
                    <td>${question.Canswer}</td>
                    <td>${question.marks}</td>
                    <td>${question.chapter}</td>
                    <td>${question.std}</td>
                    <td>${question.medium}</td>
                    <td>${question.sub}</td>
                    <td><button class="delete-question" data-index="${index}" data-question-id="${row.dataset.questionId}">Delete</button></td>
                `;

                questionsBody.appendChild(row);

                const deleteButton = row.querySelector(".delete-question");
                deleteButton.addEventListener("click", function() {
                    const questionId = this.dataset.questionId;
                    const index = this.dataset.index;
                    deleteQuestion(questionId, index); 
                });
            })
            .catch((error) => {
                console.error("Error adding question to Firebase:", error);
            });
        });
    }
});

function godashborad(){
    const token = localStorage.getItem('authToken');
    window.location.href = `./dashboard.html?token=${token}`;
    // checkAuthentication;
}