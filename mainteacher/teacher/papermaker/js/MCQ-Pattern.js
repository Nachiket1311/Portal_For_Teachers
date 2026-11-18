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

// Fallback Curriculum in case Firebase database is deactivated
const fallbackCurriculum = {
    "10th Standard": {
        "Science": ["Chemical Reactions", "Acids, Bases & Salts", "Life Processes", "Light & Reflection"],
        "Mathematics": ["Real Numbers", "Polynomials", "Quadratic Equations", "Triangles"]
    },
    "11th Standard": {
        "Computer Science": ["Computer Systems Overview", "Python Programming", "Data Representation"],
        "Physics": ["Units and Measurement", "Motion in a Straight Line", "Laws of Motion"]
    },
    "12th Standard": {
        "Computer Science": ["Data Structures (Stack)", "Computer Networks", "Database Management (SQL)"],
        "Mathematics": ["Relations and Functions", "Matrices & Determinants", "Calculus"]
    }
};

function populateFallbackStandards(selectElem) {
    if (!selectElem) return;
    Object.keys(fallbackCurriculum).forEach(std => {
        const option = document.createElement('option');
        option.value = std;
        option.textContent = std;
        selectElem.appendChild(option);
    });
}

function getSampleMCQs(subject, numQuestions) {
    const pool = [
        {
            text: 'Yes',
            question: `In ${subject}, which of the following is considered a foundational core principle?`,
            options1: 'Modular abstraction and algorithmic efficiency',
            options2: 'Unbounded linear recursion',
            options3: 'Hardcoded memory address pointers',
            options4: 'Static compile-time deadlocks',
            Canswer: 'Modular abstraction and algorithmic efficiency'
        },
        {
            text: 'Yes',
            question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
            options1: 'O(log n)',
            options2: 'O(n^2)',
            options3: 'O(1)',
            options4: 'O(n!)',
            Canswer: 'O(log n)'
        },
        {
            text: 'Yes',
            question: 'Which of the following database constraints ensures uniqueness across rows and prevents NULL entries?',
            options1: 'PRIMARY KEY constraint',
            options2: 'CHECK constraint',
            options3: 'CASCADE constraint',
            options4: 'DEFAULT constraint',
            Canswer: 'PRIMARY KEY constraint'
        },
        {
            text: 'Yes',
            question: 'In computer networking, which protocol provides reliable, ordered, and connection-oriented data transfer?',
            options1: 'TCP (Transmission Control Protocol)',
            options2: 'UDP (User Datagram Protocol)',
            options3: 'ICMP',
            options4: 'ARP',
            Canswer: 'TCP (Transmission Control Protocol)'
        },
        {
            text: 'Yes',
            question: 'What is the primary purpose of normalization in relational database design?',
            options1: 'Minimizing data redundancy and preventing insertion/update anomalies',
            options2: 'Compressing image blobs into binary format',
            options3: 'Encrypting database tables with RSA keys',
            options4: 'Replacing SQL queries with machine bytecode',
            Canswer: 'Minimizing data redundancy and preventing insertion/update anomalies'
        }
    ];
    let result = [];
    while (result.length < numQuestions) {
        result = result.concat(pool);
    }
    return result.slice(0, numQuestions);
}

// Load standards from Firebase
function loadStandards() {
    const stdSelect = document.getElementById('std');
    const standardsRef = database.ref('standards');
    standardsRef.once('value', (snapshot) => {
        let hasData = false;
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                hasData = true;
                const stdData = childSnapshot.val();
                const option = document.createElement('option');
                option.value = stdData;
                option.textContent = stdData;
                stdSelect.appendChild(option);
            });
        }
        if (!hasData) {
            populateFallbackStandards(stdSelect);
        }
    }).catch(err => {
        console.warn("Using demo standards fallback:", err.message);
        populateFallbackStandards(stdSelect);
    });

    stdSelect.onchange = function() {
        const stdNumber = this.value;
        loadSubjects(stdNumber);
    };
}

// Load subjects based on selected standard
function loadSubjects(stdNumber) {
    const subjectSelect = document.getElementById('subject');
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    const chapterSelect = document.getElementById('chapter');
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>';

    if (stdNumber) {
        const subjectsRef = database.ref('syllabus').orderByChild('stdNumber').equalTo(stdNumber);
        subjectsRef.once('value', (snapshot) => {
            let hasSubjects = false;
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    hasSubjects = true;
                    const subjectData = childSnapshot.val();
                    const option = document.createElement('option');
                    option.value = subjectData.subject;
                    option.textContent = subjectData.subject;
                    subjectSelect.appendChild(option);
                });
            }
            if (!hasSubjects && fallbackCurriculum[stdNumber]) {
                Object.keys(fallbackCurriculum[stdNumber]).forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subjectSelect.appendChild(option);
                });
            }
        }).catch(err => {
            console.warn("Using demo subjects fallback:", err.message);
            if (fallbackCurriculum[stdNumber]) {
                Object.keys(fallbackCurriculum[stdNumber]).forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subjectSelect.appendChild(option);
                });
            }
        });
    }

    subjectSelect.onchange = function() {
        const subject = this.value;
        loadChapters(stdNumber, subject);
    };
}

// Load chapters based on selected subject
function loadChapters(stdNumber, subject) {
    const chapterSelect = document.getElementById('chapter');
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>';

    if (subject) {
        const chaptersRef = database.ref('syllabus').orderByChild('subject').equalTo(subject);
        chaptersRef.once('value', (snapshot) => {
            let hasChapters = false;
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const chapters = childSnapshot.val().chapters;
                    if (chapters) {
                        hasChapters = true;
                        chapters.forEach(chapter => {
                            const option = document.createElement('option');
                            option.value = chapter.chapterName;
                            option.textContent = chapter.chapterName;
                            chapterSelect.appendChild(option);
                        });
                    }
                });
            }
            if (!hasChapters && fallbackCurriculum[stdNumber] && fallbackCurriculum[stdNumber][subject]) {
                fallbackCurriculum[stdNumber][subject].forEach(chapName => {
                    const option = document.createElement('option');
                    option.value = chapName;
                    option.textContent = chapName;
                    chapterSelect.appendChild(option);
                });
            }
        }).catch(err => {
            console.warn("Using demo chapters fallback:", err.message);
            if (fallbackCurriculum[stdNumber] && fallbackCurriculum[stdNumber][subject]) {
                fallbackCurriculum[stdNumber][subject].forEach(chapName => {
                    const option = document.createElement('option');
                    option.value = chapName;
                    option.textContent = chapName;
                    chapterSelect.appendChild(option);
                });
            }
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
    const numQuestions = parseInt(document.getElementById('numQuestions').value) || 5;

    document.getElementById('myModal').style.display = 'none';
    fetchMCQs(std, subject, selectedChapters, numQuestions);
};

async function fetchMCQs(std, subject, chapter, numQuestions) {
    const questionsRef = database.ref('mcq-type-question');
    questionsRef.once('value', (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
            const mcqsArray = Object.values(questions);
            const filteredMCQs = mcqsArray.filter(question => {
                const questionStd = question.std?.toString().trim().toLowerCase();
                const questionSub = question.sub?.toString().trim().toLowerCase();
                const questionChapter = question.chapter?.toString().trim().toLowerCase();

                return (
                    questionStd === std.trim().toLowerCase() &&
                    questionSub === subject.trim().toLowerCase() &&
                    chapter.some(chap => chap.trim().toLowerCase() === questionChapter)
                );
            });

            if (filteredMCQs.length > 0) {
                const shuffledMCQs = shuffleArray(filteredMCQs);
                displayQuestions(shuffledMCQs, numQuestions);
                return;
            }
        }
        // Fallback sample questions if none in DB or if DB is offline
        displayQuestions(getSampleMCQs(subject || "Computer Science", numQuestions), numQuestions);
    }).catch(error => {
        console.warn("Error fetching MCQs, rendering demo sample questions:", error.message);
        displayQuestions(getSampleMCQs(subject || "Computer Science", numQuestions), numQuestions);
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