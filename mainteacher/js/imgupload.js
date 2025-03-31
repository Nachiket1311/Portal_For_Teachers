 
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
      const database = firebase.database();
  
  window.onload=function(){
    loadStandards();
    loadMediums();
  }
  function loadMediums() {
    const mediumSelect = document.getElementById('medium');
    const mediumsRef = database.ref('medium'); // Reference to the mediums data in the database
  
    mediumsRef.once('value', (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const mediumData = childSnapshot.val();
            const option = document.createElement('option');
            option.value = mediumData;
            option.textContent = mediumData;
            mediumSelect.appendChild(option);
        });
    });
  }
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
    const chapterSelect = document.getElementById('chapterName');
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
    const chapterSelect = document.getElementById('chapterName');
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
  
      
  
      function previewFile() {
        const file = document.getElementById("file").files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
          const preview = document.getElementById("preview");
          preview.src = e.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
  
      async function uploadFile() {
        const fileInput = document.getElementById("file");
        if (!fileInput.files[0]) {
          alert("Please select a file first.");
          return;
        }
  
        const file = fileInput.files[0];
        const reader = new FileReader();
  
        reader.onload = async function (e) {
          const base64Data = e.target.result.split(",")[1];
          const fileName = file.name;
  
          google.script.run
            .withSuccessHandler((url) => {
              alert("File uploaded successfully!");
              localStorage.setItem("shareableURL", url);
              document.getElementById("shareableURL").innerText = `Shareable URL: ${url}`;
  
              // Save URL to Firebase
              saveToFirebase(url);
            })
            .withFailureHandler((error) => {
              alert("Error uploading file: " + error);
            })
            .uploadToDrive(base64Data, fileName);
        };
  
        reader.readAsDataURL(file);
      }
  
      function saveToFirebase(url) {
        const username = localStorage.getItem('username');
        const timestamp = new Date().toISOString();
        const chapterName = document.getElementById("chapterName").value;
        const std = document.getElementById("std").value;
        const subject = document.getElementById("subject").value;
        const medium = document.getElementById("medium").value;
        const marks = document.getElementById('marks').value;
        const data = {
          chapter:chapterName,
          std:std,
          marks:marks,
          subject:subject,
          remark:'pending',
          medium:medium,
          url: url,
          uploadedAt: timestamp,
          username:username
        };
        if('mcq'=== document.getElementById("type").value){
            firebase.database().ref("mcq-type-question").push(data)
          .then(() => {
            alert("URL saved to Firebase!");
          })
          .catch((error) => {
            console.error("Error saving URL to Firebase: ", error);
          });
        }else if ('desc'=== document.getElementById('type').value){
            firebase.database().ref("desc-type-question").push(data)
          .then(() => {
            alert("URL saved to Firebase!");
          })
          .catch((error) => {
            console.error("Error saving URL to Firebase: ", error);
          });
        }else{
            alert("Invalid type");
        }
  
      }