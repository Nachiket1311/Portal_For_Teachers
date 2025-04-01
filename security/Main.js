const repo = 'DC_project_dump'; // Replace with your repo name
const owner = 'Dcmcbc'; // Replace with your GitHub username
const token = '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';
const branch = 'main'; // Replace with your branch name
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDr43XY9WT93SxOv-T5bb6M0uWT6_ThlpU",
    authDomain: "dc-project-c88d0.firebaseapp.com",
    databaseURL: "https://dc-project-c88d0-default-rtdb.firebaseio.com",
    projectId: "dc-project-c88d0",
    storageBucket: "dc-project-c88d0.firebasestorage.app",
    messagingSenderId: "434941271852",
    appId: "1:434941271852:web:1e8d84c1b604779c535689",
    measurementId: "G-XKT2SXN6VZ"
  };


  function validateAccessToken() {
    // Check if the user is on the login page
    const currentPage = window.location.pathname;
    if (currentPage.includes('login')) {
      return; // Skip validation if on the login page
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const tokenInURL = urlParams.get("token"); // Now using "token" in URL
    const storedToken = localStorage.getItem("authToken"); // Token saved after login
  
  
    // If token is missing or doesn't match stored token, deny access
    if (!tokenInURL || tokenInURL !== storedToken) {
        alert("Unauthorized access! Invalid or missing token.");
    }
  }
  


// Run access check on page load
document.addEventListener("DOMContentLoaded", validateAccessToken);
