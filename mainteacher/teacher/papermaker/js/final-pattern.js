
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);
window.onload = function() {
    document.getElementById('myModal').style.display = 'block';
    loadStandards(); // Load standards when modal opens
};

// Close modal
document.getElementById('closeModal').onclick = function() {
    document.getElementById('myModal').style.display = 'none';
};
function loadStandards() {
    const stdSelect = document.getElementById('std');
    const standardsRef = database.ref('standards'); // Reference to the root of the database
    standardsRef.once('value', (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const stdData = childSnapshot.val();
            const option = document.createElement('option');
            option.value = stdData;
            option.textContent = stdData;
            stdSelect.appendChild(option);
        });
    });

    stdSelect.onchange = function() {
        const stdNumber = this.value;
        loadSubjects(stdNumber); // Load subjects based on selected standard
    };
}

// Load subjects based on selected standard
function loadSubjects(stdNumber) {
    const subjectSelect = document.getElementById('subject');
    subjectSelect.innerHTML = '<option value="">Select Subject</option>'; // Reset subjects

    if (stdNumber) {
        const subjectsRef = database.ref('syllabus').orderByChild('stdNumber').equalTo(stdNumber);
        subjectsRef.once('value', (snapshot) => {
            snapshot.forEach(childSnapshot => {
                const subjectData = childSnapshot.val();
                const option = document.createElement('option');
                option.value = subjectData.subject;
                option.textContent = subjectData.subject;
                subjectSelect.appendChild(option);
            });
        });
    }

}
document.getElementById('preferencesForm').onsubmit = function(event) {
    event.preventDefault();
    const std = document.getElementById('std').value;
    const subject = document.getElementById('subject').value;
    document.getElementById('myModal').style.display = 'none';
    fetchMCQs(std, subject,5); // Pass number of questions to fetchMCQs
    fetchdesc(std,subject)
};

async function fetchMCQs(std, subject,numQuestions) {
    const questionsRef = database.ref('mcq-type-question');
    questionsRef.once('value', (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
            const mcqsArray = Object.values(questions);
            console.log("Available MCQs:", mcqsArray);
           

            const filteredMCQs = mcqsArray.filter(question => {
                // Ensure to trim and convert to lowercase for comparison
                const questionStd = question.std?.toString().trim().toLowerCase();
                const questionSub = question.sub?.toString().trim().toLowerCase();

                // Iterate over selected chapters to check if any match
                return (
                    questionStd === std.trim().toLowerCase() &&
                    questionSub === subject.trim().toLowerCase()
                );
            });

            console.log("Filtered MCQs:", filteredMCQs);

            if (filteredMCQs.length > 0) {
                const shuffledMCQs = shuffleArray(filteredMCQs);
                const limitedMCQs = shuffledMCQs.slice(0, numQuestions); // Limit to the specified number of questions
                displayMCQQuestions(limitedMCQs);
            } else {
                console.log("No matching questions found for the criteria.");
                displayMCQQuestions([]); // Display no questions message
            }
        } else {
            console.error("No questions available in the database.");
        }
    }).catch(error => {
        console.error("Error fetching MCQs:", error);
    });
}





async function fetchdesc(std, subject) {
    const questionsRef = database.ref('desc-type-question');
    questionsRef.once('value', (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
            const mcqsArray = Object.values(questions);
            console.log("Available MCQs:", mcqsArray);
           

            const filteredMCQs = mcqsArray.filter(question => {
                // Ensure to trim and convert to lowercase for comparison
                const questionStd = question.std?.toString().trim().toLowerCase();
                const questionSub = question.sub?.toString().trim().toLowerCase();

                // Iterate over selected chapters to check if any match
                return (
                    questionStd === std.trim().toLowerCase() &&
                    questionSub === subject.trim().toLowerCase()
                );
            });

            console.log("Filtered MCQs:", filteredMCQs);

            if (filteredMCQs.length > 0) {
                const shuffledMCQs = shuffleArray(filteredMCQs);
                display1MQuestions(shuffledMCQs,5);
                display2MQuestions(shuffledMCQs,3);
                display2BMQuestions(shuffledMCQs,5);
                display3MQuestions(shuffledMCQs,8);
                display5MQuestions(shuffledMCQs,2);
            } else {
                console.log("No matching questions found for the criteria.");
                displayMCQQuestions([]); // Display no questions message
            }
        } else {
            console.error("No questions available in the database.");
        }
    }).catch(error => {
        console.error("Error fetching MCQs:", error);
    });
}

function display1MQuestions(questions, limit) {
    const quizContainer = document.getElementById('Q1-B');  
    quizContainer.innerHTML = ''; // Clear previous content

    // Filter questions to only include those with 1 mark
    const filteredQuestions = questions.filter(question => question.marks === 1);
    
    if (filteredQuestions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    // Limit the number of questions displayed
    const limitedQuestions = filteredQuestions.slice(0, limit);
    let count = 1;
    limitedQuestions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        count++;
        quizContainer.appendChild(questionElement);
    });
}
function display2MQuestions(questions, limit) {
    const quizContainer = document.getElementById('Q2-A');  
    quizContainer.innerHTML = ''; // Clear previous content

    // Filter questions to only include those with 1 mark
    const filteredQuestions = questions.filter(question => question.marks === 2);
    
    if (filteredQuestions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    // Limit the number of questions displayed
    const limitedQuestions = filteredQuestions.slice(0, limit);
    let count = 1;
    limitedQuestions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        count++;
        quizContainer.appendChild(questionElement);
    });
}
function display2BMQuestions(questions, limit) {
    const quizContainer = document.getElementById('Q2-B');  
    quizContainer.innerHTML = ''; // Clear previous content

    // Filter questions to only include those with 1 mark
    const filteredQuestions = questions.filter(question => question.marks === 2);
    
    if (filteredQuestions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    // Limit the number of questions displayed
    const limitedQuestions = filteredQuestions.slice(0, limit);
    let count = 1;
    limitedQuestions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        count++;
        quizContainer.appendChild(questionElement);
    });
}
function display3MQuestions(questions, limit) {
    const quizContainer = document.getElementById('Q3');  
    quizContainer.innerHTML = ''; // Clear previous content

    // Filter questions to only include those with 1 mark
    const filteredQuestions = questions.filter(question => question.marks === 3);
    
    if (filteredQuestions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    // Limit the number of questions displayed
    const limitedQuestions = filteredQuestions.slice(0, limit);
    let count = 1;
    limitedQuestions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        count++;
        quizContainer.appendChild(questionElement);
    });
}
function display5MQuestions(questions, limit) {
    const quizContainer = document.getElementById('Q4');  
    quizContainer.innerHTML = ''; // Clear previous content

    // Filter questions to only include those with 1 mark
    const filteredQuestions = questions.filter(question => question.marks === 1);
    
    if (filteredQuestions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    // Limit the number of questions displayed
    const limitedQuestions = filteredQuestions.slice(0, limit);
    let count = 1;
    limitedQuestions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        count++;
        quizContainer.appendChild(questionElement);
    });
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function displayMCQQuestions(questions) {
    const quizContainer = document.getElementById('Q1-A');  
    quizContainer.innerHTML = ''; // Clear previous content

    if (questions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }
    let count =1;
    const answersArray=[];
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<p> <b>${count})</b> ${question.question}</p>`;
        const answerElement = `${count}) ${question.Canswer}`; 
        count++;
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options');
        const letters = ['A', 'B', 'C', 'D'];
        // Create options dynamically
        for (let i = 0; i <= 3; i++) {
            const optionKey = `options${i+1}`;
            const optionItem = document.createElement('li');
            optionItem.textContent = `${letters[i]}) ${question[optionKey]}`;
            optionsList.appendChild(optionItem);
        }

        questionElement.appendChild(optionsList);
        quizContainer.appendChild(questionElement);
        
        
        // Store the answer in the array
        answersArray.push(`${answerElement}`);

    });
    localStorage.setItem('answers', JSON.stringify(answersArray));

    // Open a new window to display the answers
    const answerWindow = window.open('', '_blank'); // Open a new blank window
    if (!answerWindow) {
        alert('Popup blocked! Please allow popups for this site.');
        return; // Exit if popup is blocked
    }

    // Write initial HTML structure for the answer window
    answerWindow.document.write(`
        <html>
            <head>
                <title>Answers</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    strong { color: blue; }
                    h3 { margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>Answers</h1>
                <div id="answers-container"></div>
                </body>
                <script>
                const storedAnswers = JSON.parse(localStorage.getItem('answers'));
                const answersContainer = document.getElementById('answers-container');
                storedAnswers.forEach((answer) => {
                    const answerElement = document.createElement('p');
                    answerElement.textContent = answer;
                    answersContainer.appendChild(answerElement);
                    });
                localStorage.removeItem('answers');
                </script>
                </html>
    `);
    answerWindow.document.close(); // Close the document
}