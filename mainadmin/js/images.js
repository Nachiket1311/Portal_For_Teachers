const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Preview Image Before Upload
function previewFile() {
    const file = document.getElementById('file').files[0];
    const preview = document.getElementById('image-preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

window.onload = function () {
    loadStandards();
    loadMediums();
};

// Load Mediums from Firebase
function loadMediums() {
    const mediumSelect = document.getElementById('medium');
    const mediumsRef = database.ref('medium');

    mediumsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const option = document.createElement('option');
            option.value = childSnapshot.val();
            option.textContent = childSnapshot.val();
            mediumSelect.appendChild(option);
        });
    });
}

// Load Standards from Firebase
function loadStandards() {
    const stdSelect = document.getElementById('std');
    const standardsRef = database.ref('standards');

    standardsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const option = document.createElement('option');
            option.value = childSnapshot.val();
            option.textContent = childSnapshot.val();
            stdSelect.appendChild(option);
        });
    });

    stdSelect.onchange = function () {
        loadSubjects(this.value);
    };
}

// Load Subjects based on Standard
function loadSubjects(stdNumber) {
    const subjectSelect = document.getElementById('subject');
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    
    const subjectsRef = database.ref('syllabus').orderByChild('stdNumber').equalTo(stdNumber);
    
    subjectsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const option = document.createElement('option');
            option.value = childSnapshot.val().subject;
            option.textContent = childSnapshot.val().subject;
            subjectSelect.appendChild(option);
        });
    });

    subjectSelect.onchange = function () {
        loadChapters(stdNumber, this.value);
    };
}

// Load Chapters based on Subject
function loadChapters(stdNumber, subject) {
    const chapterSelect = document.getElementById('chapterName');
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>';

    const chaptersRef = database.ref('syllabus').orderByChild('subject').equalTo(subject);
    
    chaptersRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const chapters = childSnapshot.val().chapters;
            chapters.forEach((chapter) => {
                const option = document.createElement('option');
                option.value = chapter.chapterName;
                option.textContent = chapter.chapterName;
                chapterSelect.appendChild(option);
            });
        });
    });
}
async function uploadFile() {
    const fileInput = document.getElementById('file').files[0];
    const marks = document.getElementById('marks').value;
    const std = document.getElementById('std').value;
    const medium = document.getElementById('medium').value;
    const sub = document.getElementById('subject').value;
    const chapterName = document.getElementById('chapterName').value;
    const type = document.getElementById('type').value;
    const Canswer = document.getElementById('canswer').value;

    if (!fileInput || !marks || !std || !medium || !sub || !chapterName || !type) {
      alert('Please fill all required fields.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result.split(',')[1];
  
      const metadata = {
        marks,
        std: std,
        medium,
        sub,
        chapter: chapterName,
        type,
        text:"No",
        Canswer: Canswer,
  
      };
  
      let fileName = fileInput.name;
  
      try {
        // Check if the file already exists in the GitHub repository
        const checkResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (checkResponse.ok) {
          // File already exists, generate a unique file name
          const fileExtension = fileName.split('.').pop();
          const fileBaseName = fileName.substring(0, fileName.lastIndexOf('.'));
          fileName = `${fileBaseName}_${Date.now()}.${fileExtension}`;
          alert(`File with the same name already exists. Renaming to: ${fileName}`);
        }
  
        // Proceed with the upload
        const uploadResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Add ${fileName}`,
              content: base64Content,
              branch: branch,
            }),
          }
        );
  
        const uploadResult = await uploadResponse.json();
        if (uploadResponse.ok) {
          const metadataWithUrl = {
            ...metadata,
            url: uploadResult.content.download_url,
            text:'No',
          };
  
          const questionSetRef = database.ref(
            type === 'mcq' ? 'mcq-type-question' : 'desc-type-question'
          );
          questionSetRef
            .push(metadataWithUrl)
            .then(() => {
              alert('File uploaded successfully!');
            })
            .catch((error) => {
              console.error('Error saving question:', error);
            });
  
          document.getElementById('shareableURL').innerText = uploadResult.content.download_url;
        } else {
          console.error('Error uploading file:', uploadResult);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('File not found in repository. Proceeding with upload.');
        } else {
          console.error('Error:', error);
          alert('An error occurred during file upload.');
        }
      }
    };
  
    reader.readAsDataURL(fileInput);
  }