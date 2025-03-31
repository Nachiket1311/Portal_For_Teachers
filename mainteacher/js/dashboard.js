
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();





document.getElementById('uploadBulkBtn').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./bulkmcq.html?token=${authToken}`;
    window.open(url, '_blank');
});

document.getElementById('uploadimgBtn').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./image.html?token=${authToken}`;
    window.open(url, '_blank');
});
document.getElementById('uploadBulkBtn-desc').addEventListener('click', () => {
    const authToken = localStorage.getItem('authToken');
    const url =`./bulkdesc.html?token=${authToken}`;
    window.open(url, '_blank');
});


document.getElementById('excel-format').addEventListener('click', () => {
    document.getElementById('div-pref-form').style="block";
});

document.getElementById('excel-format-form').onsubmit=function(){
    var excelFormat = document.getElementById('format').value;
    if(excelFormat==="mcq-format"){
        window.open("https://drive.google.com/file/d/19cvKZgLNxPcu6GcRf43GPP9e3C_rFoL8/view?usp=sharing",'_blank');
    }
    else if(excelFormat==="desc-format"){
        window.open("https://drive.google.com/file/d/169CGVQY27dueiYQnRNgS1liF812M7b43/view?usp=sharing","_blank");
        }
        document.getElementById('div-pref-form').style="none";    
}


document.getElementById('Logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href="../../login/login.html";
    
});

function uploadedbyme(){
    const token = localStorage.getItem('authToken');
    const url = `./uploadedbyuser.html?token=${token}`;
    window.open(url,'_blank');
    // checkAuthentication;
}

function Totalq(){
    const token = localStorage.getItem('authToken');
    const url = `./Totalq.html?token=${token}`;
    window.open(url,'_blank');
}
// Initial data fetch
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

function mcqpapermaker(){
    const authToken = localStorage.getItem('authToken');
    const url =`./papermaker/html/MCQ-Pattern.html?token=${authToken}`;
    window.open(url, '_blank');
}
function descpapermaker(){
    const authToken = localStorage.getItem('authToken');
    const url =`./papermaker/html/desc-pattern.html?token=${authToken}`;
    window.open(url, '_blank');
}

function finalpapermaker(){
    const authToken = localStorage.getItem('authToken');
    const url =`./papermaker/html/final-pattern.html?token=${authToken}`;
    window.open(url, '_blank');
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