// Initialize Firebase safely
let app, auth, db;
try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
} catch (e) {
    console.warn("Firebase initialization warning:", e);
}

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signinform = document.getElementById("signin");
const createaccount = document.getElementById("createaccount");

// Check if username is unique
function checkUsernameUnique(username) {
    if (!db) return Promise.resolve(true);
    return db.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            return !snapshot.exists();  // Returns true if username is unique, false if already taken
        });
}

// Handle Sign-In
signinform.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('submitBtn');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
        alert("Please provide both username and password.");
        return;
    }

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Verifying...';
        submitBtn.disabled = true;
    }

    const resetSubmitBtn = () => {
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right ml-2"></i>';
            submitBtn.disabled = false;
        }
    };

    const normalizedUser = username.toLowerCase();

    // 1. FAST-PATH DEMO CREDENTIALS:
    // If user enters documented demo credentials (Admin / 123456 or Teacher / 123456),
    // authenticate immediately without hanging on the deactivated Firebase database.
    if ((normalizedUser === 'admin' || normalizedUser === 'teacher') && password === '123456') {
        const isTeacher = (normalizedUser === 'teacher');
        const role = isTeacher ? 'teacher' : 'admin';
        const displayName = isTeacher ? 'Demo Teacher' : 'Demo Admin';
        const displayEmail = isTeacher ? 'teacher@examcraft.edu' : 'admin@examcraft.edu';
        const demoToken = `demo-${role}-token-${Date.now()}`;

        localStorage.setItem("username", displayName);
        localStorage.setItem("email", displayEmail);
        localStorage.setItem("role", role);
        localStorage.setItem("authToken", demoToken);

        const redirectUrl = isTeacher
            ? `../mainteacher/teacher/dashboard.html?token=${encodeURIComponent(demoToken)}`
            : `../mainadmin/admin/dashboard.html?token=${encodeURIComponent(demoToken)}`;

        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 300);
        return;
    }

    // 2. LIVE FIREBASE AUTHENTICATION (with timeout protection against deactivated database):
    if (!db || !auth) {
        alert("Firebase is offline. Please use the Demo Credentials:\n• Admin: Admin / 123456\n• Teacher: Teacher / 123456");
        resetSubmitBtn();
        return;
    }

    let authCompleted = false;
    const dbTimeout = setTimeout(() => {
        if (!authCompleted) {
            authCompleted = true;
            resetSubmitBtn();
            alert("Database connection timed out.\nThe remote Firebase database (dc-project-c88d0) has been deactivated by Google.\n\nPlease use the Demo Credentials to explore the portal:\n• Admin: Admin / 123456\n• Teacher: Teacher / 123456");
        }
    }, 4500);

    // Check if username exists and get the associated email
    db.ref('users').orderByChild('username').equalTo(username).once('value', snapshot => {
        if (authCompleted) return;
        clearTimeout(dbTimeout);
        authCompleted = true;

        if (snapshot.exists()) {
            snapshot.forEach(userSnapshot => {
                const email = userSnapshot.val().email;
                const userId = userSnapshot.key;
                localStorage.setItem("username", username);
                localStorage.setItem("email", email);
                
                // Sign in with email and password
                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;

                        // Fetch user role from Realtime Database
                        db.ref('users/' + userId).once('value')
                            .then((snapshot) => {
                                const role = snapshot.val().role;
                                localStorage.setItem("role", role);
                                // Get the unique ID token for the user
                                user.getIdToken().then((idToken) => {
                                    // Store the token in localStorage
                                    localStorage.setItem("authToken", idToken);

                                    // Redirect based on role with token in the URL
                                    let redirectUrl = '';
                                    if (role === 'admin') {
                                        redirectUrl = `../mainadmin/admin/dashboard.html?token=${idToken}`;
                                    } else if (role === 'teacher') {
                                        redirectUrl = `../mainteacher/teacher/dashboard.html?token=${idToken}`;
                                    } else {
                                        console.error('Unknown role:', role);
                                        resetSubmitBtn();
                                        return;
                                    }

                                    // Redirect to the appropriate dashboard with token in the URL
                                    window.location.href = redirectUrl;
                                });
                            })
                            .catch((error) => {
                                console.error('Error fetching user data:', error);
                                resetSubmitBtn();
                            });
                    })
                    .catch((error) => {
                        console.error("Error signing in: ", error.message);
                        alert("Error: " + error.message);
                        resetSubmitBtn();
                    });
            });
        } else {
            alert('Username not found. To explore the demo, please use:\n• Admin / 123456\n• Teacher / 123456');
            resetSubmitBtn();
        }
    }).catch(err => {
        if (authCompleted) return;
        clearTimeout(dbTimeout);
        authCompleted = true;
        console.error("Database lookup error:", err);
        alert("Firebase Database Error: " + err.message + "\n\nNote: The original database was deactivated by Google.\nPlease use Demo credentials (Admin / 123456 or Teacher / 123456) to test.");
        resetSubmitBtn();
    });
});

// Handle Forgot Password
const forgotPasswordBtn = document.getElementById('forgot-password');
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const email = prompt("Please enter your email address:");
        
        if (email && auth) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert("Password reset email sent. Please check your inbox.");
                })
                .catch((error) => {
                    console.error("Error sending password reset email: ", error.message);
                    alert("Error: " + error.message);
                });
        } else if (!email) {
            alert("Email address cannot be empty.");
        } else {
            alert("Firebase Auth is currently offline.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const bg = document.querySelector(".background-animation");
    if (bg) {
        for (let i = 0; i < 50; i++) {
            let bubble = document.createElement("div");
            bubble.classList.add("circle");
            bubble.style.left = Math.random() * 100 + "vw";
            bubble.style.animationDuration = Math.random() * 5 + 3 + "s";
            bg.appendChild(bubble);
        }
    }
});
