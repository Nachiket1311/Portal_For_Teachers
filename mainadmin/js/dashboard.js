// Firebase configuration


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const Accepted = document.getElementById("Acceptedbody");
const Pending = document.getElementById("Pendingbody");
const Rejected = document.getElementById("Rejectedbody");

// Fetch and display total users
function fetchUserCounts() {
    const usersRef = database.ref('users');
    usersRef.once('value').then((snapshot) => {
        let adminCount = 0, teacherCount = 0, studentCount = 0;

        snapshot.forEach(doc => {
            const userData = doc.val();
            const role = userData.role;

            if (role === 'admin') adminCount++;
            else if (role === 'teacher') teacherCount++;
            else if (role === 'student') studentCount++;
        });

        const totalUsers = adminCount + teacherCount + studentCount;
        const totalUsersBtn = document.getElementById('totalUsersBtn');
        totalUsersBtn.textContent = `Total Users: ${totalUsers} (Admins: ${adminCount}, Teachers: ${teacherCount}, Students: ${studentCount})`;
    }).catch((error) => {
        console.error("Error fetching user data:", error);
    });
}


document.getElementById('totalUsersBtn').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./usermanegment.html?token=${authToken}`;
    window.open(url, '_blank');
});

function fetchQuestionCounts() {
    const questionsRef = database.ref('mcq-type-question');

    questionsRef.once('value').then((snapshot) => {
        let acceptedCount = 0, pendingCount = 0, rejectedCount = 0;

        snapshot.forEach(doc => {
            const questionData = doc.val();
            const status = questionData.status;

            if (status === 'Approved') acceptedCount++;
            else if (status === 'pending') pendingCount++;
            else if (status === 'Rejected') rejectedCount++;
        });
        let totalquestions  = acceptedCount + pendingCount + rejectedCount;
        // Display the counts in the respective buttons or elements
        const acceptedBtn = document.getElementById('acceptedQuestionsBtn');
        const pendingBtn = document.getElementById('pendingQuestionsBtn');
        const rejectedBtn = document.getElementById('rejectedQuestionsBtn');
        const totalBtn = document.getElementById('totalQuestionsBtn');

        acceptedBtn.textContent = `Accepted Questions: ${acceptedCount}`;
        pendingBtn.textContent = `Pending Questions: ${pendingCount}`;
        rejectedBtn.textContent = `Rejected Questions: ${rejectedCount}`;
        totalBtn.textContent = `Total Questions: ${totalquestions}`;
    }).catch((error) => {
        console.error("Error fetching question data:", error);
    });
}
// Redirect to Manage Question Paper Pattern page
function managePattern() {
    const authToken = localStorage.getItem('authToken');
    const url =`./manage-pattern.html?token=${authToken}`;
    window.open(url, '_blank');
  }
  
  // Redirect to Manage Chapters in Subject page
  function manageChapter() {
    const authToken = localStorage.getItem('authToken');
    const url =`./manage-chapter.html?token=${authToken}`;
    window.open(url, '_blank');
    
  }
  
  

document.getElementById('uploadBulkBtn').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./bulkmcq.html?token=${authToken}`;
    window.open(url, '_blank');
});

document.getElementById('uploadBulkBtn-desc').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./bulkdesc.html?token=${authToken}`;
    window.open(url, '_blank');
});


document.getElementById('Logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href="../../login/login.html";
    
});
function totalq(){
    const token = localStorage.getItem('authToken');
    const url = `./Totalq.html?token=${token}`;
    window.open(url,'_blank');
}

function accepted(){
    const token = localStorage.getItem('authToken');
    const url = `./accepted-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function pending(){
    const token = localStorage.getItem('authToken');
    const url = `./pending-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function rejected(){
    const token = localStorage.getItem('authToken');
    const url = `./rejected-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function accepteddesc(){
    const token = localStorage.getItem('authToken');
    const url = `./desc-accepted-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function pendingdesc(){
    const token = localStorage.getItem('authToken');
    const url = `./desc-pending-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function rejecteddesc(){
    const token = localStorage.getItem('authToken');
    const url = `./desc-rejected-questions.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
function totalqdesc(){
    const token = localStorage.getItem('authToken');
    const url = `./desc-Totalq.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}
// Initial data fetch
fetchUserCounts();
fetchQuestionCounts();
function fetchAdminDetails() {
    // Check if details are already in local storage
    let adminName = localStorage.getItem('username');
    let adminEmail = localStorage.getItem('email');
    let adminRole = localStorage.getItem('role');

    // If all details are present in local storage, use them
    if (adminName && adminEmail && adminRole) {
        updateAdminSidebar(adminName, adminEmail, adminRole);
    } else {
        // Fetch details from Firebase
        const adminId = localStorage.getItem('authToken'); // Assume authToken is the admin's unique ID
        if (adminId) {
            const adminRef = database.ref(`users/${adminId}`);

            adminRef.once('value').then((snapshot) => {
                const adminData = snapshot.val();
                if (adminData) {
                    // Store details in local storage for future use
                    localStorage.setItem('adminName', adminData.name);
                    localStorage.setItem('adminEmail', adminData.email);
                    localStorage.setItem('adminRole', adminData.role);

                    // Update the sidebar with the fetched details
                    updateAdminSidebar(adminData.name, adminData.email, adminData.role);
                }
            }).catch((error) => {
                console.error("Error fetching admin details from database:", error);
            });
        }
    }
}

// Function to update the sidebar with admin details
function updateAdminSidebar(name, email, role) {
    document.querySelector('.profile-sidebar ul').innerHTML = `
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
        <li>Role: ${role}</li>
    `;
}

// Call the function to fetch and display admin details
fetchAdminDetails();
fetchdescQuestionCounts();
function fetchdescQuestionCounts() {
    const questionsRef = database.ref('desc-type-question');

    questionsRef.once('value').then((snapshot) => {
        let acceptedCount = 0, pendingCount = 0, rejectedCount = 0;

        snapshot.forEach(doc => {
            const questionData = doc.val();
            const status = questionData.status;

            if (status === 'Approved') acceptedCount++;
            else if (status === 'pending') pendingCount++;
            else if (status === 'Rejected') rejectedCount++;
        });
        let totalquestions  = acceptedCount + pendingCount + rejectedCount;
        // Display the counts in the respective buttons or elements
        const acceptedBtn = document.getElementById('acceptedQuestionsBtndesc');
        const pendingBtn = document.getElementById('pendingQuestionsBtndesc');
        const rejectedBtn = document.getElementById('rejectedQuestionsBtndesc');
        const totalBtn = document.getElementById('totalQuestionsBtndesc');

        acceptedBtn.textContent = `Accepted Questions: ${acceptedCount}`;
        pendingBtn.textContent = `Pending Questions: ${pendingCount}`;
        rejectedBtn.textContent = `Rejected Questions: ${rejectedCount}`;
        totalBtn.textContent = `Total Questions: ${totalquestions}`;
    }).catch((error) => {
        console.error("Error fetching question data:", error);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const bg = document.querySelector(".background-animation");
    for (let i = 0; i < 50; i++) {
        let bubble = document.createElement("div");
        bubble.classList.add("circle");
        bubble.style.left = Math.random() * 100 + "vw";
        bubble.style.animationDuration = Math.random() * 5 + 3 + "s";
        bg.appendChild(bubble);
    }
});