// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

let isFirstRun = true;
// Show modal on page load
window.onload = function() {
    document.getElementById('myModal').style.display = 'block';
    loadStandards(); // Load standards when modal opens
};

// Close modal
document.getElementById('closeModal').onclick = function() {
    document.getElementById('myModal').style.display = 'none';
};

// Load standards from Firebase
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
    const chapterSelect = document.getElementById('chapter');
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>'; // Reset chapters

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

    subjectSelect.onchange = function() {
        const subject = this.value;
        loadChapters(stdNumber, subject); // Load chapters based on selected subject
    };
}

// Load chapters based on selected subject
function loadChapters(stdNumber, subject) {
    const chapterSelect = document.getElementById('chapter');
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>'; // Reset chapters

    if (subject) {
        const chaptersRef = database.ref('syllabus').orderByChild('subject').equalTo(subject);
        chaptersRef.once('value', (snapshot) => {
            snapshot.forEach(childSnapshot => {
                const chapters = childSnapshot.val().chapters;
                chapters.forEach(chapter => {
                    const option = document.createElement('option');
                    option.value = chapter.chapterName;
                    option.textContent = chapter.chapterName;
                    chapterSelect.appendChild(option);
                });
            });
        });
    }
}

// Handle form submission
document.getElementById('preferencesForm').onsubmit = function(event) {
    event.preventDefault();
    const std = document.getElementById('std').value;
    const subject = document.getElementById('subject').value;
    const chapterSelect = document.getElementById('chapter');
    const selectedChapters = Array.from(chapterSelect.selectedOptions).map(option => option.value);
    const numQuestions = parseInt(document.getElementById('numQuestions').value); // Get number of questions

    

    document.getElementById('myModal').style.display = 'none';
    fetchMCQs(std, subject, selectedChapters, numQuestions); // Pass number of questions to fetchMCQs
};

async function fetchMCQs(std, subject, chapter, numQuestions) {
    const questionsRef = database.ref('mcq-type-question');
    questionsRef.once('value', (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
            const mcqsArray = Object.values(questions);
            const filteredMCQs = mcqsArray.filter(question => {
                // Ensure to trim and convert to lowercase for comparison
                const questionStd = question.std?.toString().trim().toLowerCase();
                const questionSub = question.sub?.toString().trim().toLowerCase();
                const questionChapter = question.chapter?.toString().trim().toLowerCase();

                // Iterate over selected chapters to check if any match
                return (
                    questionStd === std.trim().toLowerCase() &&
                    questionSub === subject.trim().toLowerCase() &&
                    chapter.some(chap => chap.trim().toLowerCase() === questionChapter)
                );
            });
            console.log(filteredMCQs.length);

            if (filteredMCQs.length > 0) {
                const shuffledMCQs = shuffleArray(filteredMCQs);
                displayQuestions(shuffledMCQs,numQuestions);
            } else {
                console.log("No matching questions found for the criteria.");
                displayQuestions([]); // Display no questions message
            }
        } else {
            console.error("No questions available in the database.");
        }
    }).catch(error => {
        console.error("Error fetching MCQs:", error);
    });
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function displayQuestions(questions,numQuestions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous content

    if (questions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }

    const limitedMCQs = questions.slice(0, numQuestions); // Limit to the specified number of questions
    const availablequestion = questions.slice(numQuestions);
    console.log("Number of questions to be there:", limitedMCQs);
    console.log(availablequestion);
    let answersArray = [];  // Initialize an empty array

    // Render only the limited questions
    limitedMCQs.forEach((question, index) => {
        answersArray.push(question.Canswer); // Store correct answers in the array
        createQuestionElement(quizContainer, availablequestion, question, index); // Create and render the question
    });
    
    localStorage.setItem("answers",JSON.stringify(answersArray));
    revelans();
    
}
function createQuestionElement(quizContainer, questions, question, index) {
    // Wrapper for the question
    const questionWrapper = document.createElement('div');
    const questionElement = document.createElement('div');
    
    questionWrapper.classList.add('question-wrapper');
    questionWrapper.setAttribute('data-index', index);

    // Display image if available
    if (question.text === 'No') {
        const imageElement = document.createElement('img');
        imageElement.src = question.url;
        imageElement.alt = "Question Image";
        imageElement.classList.add('question-image');
        questionWrapper.appendChild(imageElement);
    } else {
        // Display the question text
        questionElement.classList.add('question');
        questionElement.innerHTML = `<h3>${index + 1}) ${question.question}</h3>`;

        // Display options
        const optionsList = document.createElement('ul');
        optionsList.classList.add('options');
        const letters = ['A', 'B', 'C', 'D'];
        for (let i = 0; i < 4; i++) {
            const optionKey = `options${i + 1}`;
            const optionItem = document.createElement('li');
            optionItem.textContent = `${letters[i]}) ${question[optionKey]}`;
            optionsList.appendChild(optionItem);
        }
        questionElement.appendChild(optionsList);
    }

    // Custom Dropdown for available replacement questions
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.classList.add('custom-dropdown');

    const dropdownButton = document.createElement('button');
    dropdownButton.textContent = 'Select a question to replace';
    dropdownButton.classList.add('dropdown-btn');

    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown-list');
    
    questions.forEach((otherQuestion, otherIndex) => {
        if (otherIndex !== index) {
            const listItem = document.createElement('li');
            listItem.classList.add('dropdown-item');
          
           

// Create a span to hold the question text
const textSpan = document.createElement('span');
textSpan.textContent = `Q${otherIndex + 1}: `; // Set the text content

// Create and configure image element
if (otherQuestion.url) {
    const img = document.createElement('img');
    img.src = otherQuestion.url;
    img.alt = 'Question Image';
    img.style.width = '300px'; // Adjust size as needed
    img.style.height = '200px';
    img.style.marginLeft = '10px'; // Space between text and image

    // Append text and image correctly
    listItem.appendChild(textSpan);
    listItem.appendChild(img);
} else {
    // If no image, just add text
    listItem.appendChild(textSpan);
    listItem.appendChild(document.createTextNode(otherQuestion.question));
}


            
            listItem.onclick = () => {
                replaceQuestion(questionWrapper, questions[otherIndex], index);
            };

            dropdownList.appendChild(listItem);
        }
    });

    dropdownWrapper.appendChild(dropdownButton);
    dropdownWrapper.appendChild(dropdownList);
    dropdownButton.onclick = () => dropdownList.classList.toggle('show');

    // Append elements to the wrapper
    questionWrapper.appendChild(questionElement);
    questionWrapper.appendChild(dropdownWrapper);

    // Append the wrapper to the quiz container
    quizContainer.appendChild(questionWrapper);
}

function replaceQuestion(questionWrapper, newQuestion, index) {
    if (!questionWrapper) {
        console.error("Question wrapper not found!");
        return;
    }

    // Retrieve answers and selected questions from localStorage
    let answersArray = JSON.parse(localStorage.getItem("answers")) || [];
    let selectedQuestions = JSON.parse(localStorage.getItem("selectedQuestions")) || [];

    // Check if the question is already selected
    if (selectedQuestions.includes(newQuestion.question)||selectedQuestions.includes(newQuestion.url)) {
        alert("You have already selected this question. Please choose a different question.");
        return;
    }

    if (newQuestion.url) {
        selectedQuestions.push(newQuestion.url);
    }else{
        selectedQuestions.push(newQuestion.question);
    }
    
    localStorage.setItem("selectedQuestions", JSON.stringify(selectedQuestions));

    // Log old and new answers array
    console.log("Old answer array:", answersArray);
    answersArray[index] = newQuestion.Canswer;
    console.log("New answer array:", answersArray);

    // Store updated answers array back to localStorage
    localStorage.setItem("answers", JSON.stringify(answersArray));

    revelans();

    // Select the elements inside questionWrapper
    const questionElement = questionWrapper.querySelector('.question h3');
    const optionsList = questionWrapper.querySelector('.options');

    if (!questionElement || !optionsList) {
        console.error("Question or options list missing!");
        return;
    }

    // Check if the question has an image
if (newQuestion.url) {
    questionElement.innerHTML =`${index + 1})`;
      // Clear previous options
      optionsList.innerHTML = '';
    let imgElement = questionWrapper.querySelector('.question img');

    if (!imgElement) {
        imgElement = document.createElement('img');
        imgElement.classList.add('question-image'); // Add a class for styling
        questionWrapper.querySelector('.question').appendChild(imgElement);
    }

    imgElement.src = newQuestion.url;
    imgElement.alt = "Question Image";
} else {
    // Update question text
    questionElement.innerHTML = `${index + 1}) ${newQuestion.question}`;

    // Clear previous options
    optionsList.innerHTML = '';

    // Add new options
    const options = [newQuestion.options1, newQuestion.options2, newQuestion.options3, newQuestion.options4];
    const letters = ['A', 'B', 'C', 'D'];

    options.forEach((option, i) => {
        if (option) {
            const optionItem = document.createElement('li');
            optionItem.textContent = `${letters[i]}) ${option}`;
            optionsList.appendChild(optionItem);
        }
    });
}

}

function revelans() {
    // Open a new window to display the answers
    const answerWindow = window.open('', '_blank');
    if (!answerWindow) {
        alert('Popup blocked! Please allow popups for this site.');
        return;
    }
    isFirstRun = false; 

    // Retrieve answers and selected questions from localStorage
    const storedAnswers = JSON.parse(localStorage.getItem('answers')) || [];
    const selectedQuestions = JSON.parse(localStorage.getItem("selectedQuestions")) || [];

    // Log the selected questions for debugging
    console.log("Selected Questions:", selectedQuestions);

    // Check for duplicate questions before printing

    for (let i = 0; i < selectedQuestions.length; i++) {
        for (let j = i + 1; j < selectedQuestions.length; j++) {
            if (selectedQuestions[i] === selectedQuestions[j]) {
                duplicateFound = true;
                console.log(`Duplicate found: ${selectedQuestions[i]}`);
                break;
            }
        }
    }

    console.log("Duplicated:", duplicateFound);
    

    // Write HTML structure for the answer window
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
                <button id="print">Print Question</button>
                <div id="answers-container"></div>
            </body>
            <script src="../js/print.js"></script>
            <script>
                let index = 1;
                const storedAnswers = JSON.parse(localStorage.getItem('answers'));
                const answersContainer = document.getElementById('answers-container');
                storedAnswers.forEach((answer) => {
                    const answerElement = document.createElement('p');
                    answerElement.textContent = \`\${index}) \${answer}\`;
                    answersContainer.appendChild(answerElement);
                    index++;
                });
            </script>
        </html>
    `);
    answerWindow.document.close();
}