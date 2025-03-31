
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Function to add a new row to the questions table
  function addQuestionRow() {
    const questionTableBody = document.getElementById("questionsTableBody");
  
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="number" class="form-control" placeholder="Q.No" required></td>
      <td><input type="number" class="form-control" placeholder="No. of Questions" required></td>
      <td><input type="number" class="form-control" placeholder="Marks per Question" required></td>
      <td><button class="btn btn-danger" onclick="deleteQuestionRow(this)">Delete</button></td>
    `;
  
    questionTableBody.appendChild(row);
  }
  
  // Function to delete a question row
  function deleteQuestionRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
  }
  
  // Function to save the pattern to Firebase
  function savePattern() {
    const patternName = document.getElementById("patternName").value;
    const totalMarks = document.getElementById("totalMarks").value;
  
    if (patternName && totalMarks) {
      // Extract data from each row in the table
      const questionsData = [];
      document.querySelectorAll("#questionsTableBody tr").forEach(row => {
        const questionNumber = row.cells[0].querySelector("input").value;
        const numberOfQuestions = row.cells[1].querySelector("input").value;
        const marksPerQuestion = row.cells[2].querySelector("input").value;
  
        if (questionNumber && numberOfQuestions && marksPerQuestion) {
          questionsData.push({
            questionNumber,
            numberOfQuestions,
            marksPerQuestion
          });
        }
      });
  
      // Create a new pattern object
      const pattern = {
        name: patternName,
        totalMarks,
        questions: questionsData
      };
  
      // Push pattern to Firebase
      database.ref("patterns").push(pattern)
        .then(() => {
          alert("Pattern saved successfully!");
          document.getElementById("patternForm").reset();
          document.getElementById("questionsTableBody").innerHTML = ""; // Clear table rows after saving
          displayPatterns();
        })
        .catch(error => console.error("Error saving pattern:", error));
    } else {
      alert("Please fill in all required fields.");
    }
  }
  
  // Function to display saved patterns from Firebase
  function displayPatterns() {
    const patternList = document.getElementById("patternList");
    patternList.innerHTML = "";
  
    // Fetch patterns from Firebase
    database.ref("patterns").once("value", snapshot => {
      snapshot.forEach(childSnapshot => {
        const pattern = childSnapshot.val();
        const patternKey = childSnapshot.key;
  
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
          <strong>${pattern.name}</strong> - Total Marks: ${pattern.totalMarks}
          <button class="btn btn-danger btn-sm float-right" onclick="deletePattern('${patternKey}')">Delete</button>
          <ul class="mt-2">
            ${pattern.questions.map(q => `
              <li>Q.No ${q.questionNumber}: ${q.numberOfQuestions} questions, ${q.marksPerQuestion} marks each</li>
            `).join("")}
          </ul>
        `;
        patternList.appendChild(li);
      });
    });
  }
  
  // Function to delete a saved pattern from Firebase
  function deletePattern(patternKey) {
    database.ref("patterns/" + patternKey).remove()
      .then(() => {
        alert("Pattern deleted successfully!");
        displayPatterns();
      })
      .catch(error => console.error("Error deleting pattern:", error));
  }
  
  // Load existing patterns on page load
  window.onload = displayPatterns;
  