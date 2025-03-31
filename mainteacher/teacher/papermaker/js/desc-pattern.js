

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

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
    const chapter = document.getElementById('chapter').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value); // Get number of questions

    console.log("Selected values:", { std, subject, chapter, numQuestions }); // Log selected values

    document.getElementById('myModal').style.display = 'none';
    fetchMCQs(std, subject, chapter, numQuestions); // Pass number of questions to fetchMCQs
};

async function fetchMCQs(std, subject, chapter, numQuestions) {
    const questionsRef = database.ref('desc-type-question');
    questionsRef.once('value', (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
 const mcqsArray = Object.values(questions);
            console.log("Available MCQs:", mcqsArray); // Log available MCQs
            console.log("Filtering with:", { std, subject, chapter }); // Log the filtering criteria

            const filteredMCQs = mcqsArray.filter(question => {
                // Log the current question being checked
                console.log("Checking question:", question);

                // Ensure to trim and convert to lowercase for comparison
                const questionStd = question.std?.toString().trim().toLowerCase();
                const questionSub = question.sub?.toString().trim().toLowerCase();
                const questionChapter = question.chapter?.toString().trim().toLowerCase();

                return (
                    questionStd === std.trim().toLowerCase() &&
                    questionSub === subject.trim().toLowerCase() &&
                    questionChapter === chapter.trim().toLowerCase()
                );
            });

            console.log("Filtered MCQs:", filteredMCQs); // Log filtered MCQs

            const shuffledMCQs = shuffleArray(filteredMCQs);
            const limitedMCQs = shuffledMCQs.slice(0, numQuestions); // Limit to the specified number of questions
            displayQuestions(limitedMCQs);
        } else {
            console.log("No questions available.");
        }
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

// Function to display questions
function displayQuestions(questions) {
    const quizContainer = document.getElementById('quiz-container');  
    quizContainer.innerHTML = ''; // Clear previous content

    if (questions.length === 0) {
        quizContainer.innerHTML = '<h3>No questions found for the selected criteria.</h3>';
        return;
    }
    let count =1;
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `<h3>${count}) ${question.question}</h3>`;
        count++;
        quizContainer.appendChild(questionElement);
    });

}