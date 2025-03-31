

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signinform = document.getElementById("signin");
const createaccount = document.getElementById("createaccount");

// signUpButton.addEventListener('click', () => {
//     container.classList.add("right-panel-active");
// });

// signInButton.addEventListener('click', () => {
//     container.classList.remove("right-panel-active");
// });

// Check if username is unique
function checkUsernameUnique(username) {
    return db.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            return !snapshot.exists();  // Returns true if username is unique, false if already taken
        });
}

// // Handle Sign-Up
// createaccount.addEventListener("submit", (event) => {
//     event.preventDefault(); // Prevent the default form submission

//     const username = document.getElementById('signup-username').value;
//     const name = document.getElementById('signup-name').value;
//     const email = document.getElementById('signup-email').value;
//     const password = document.getElementById('signup-password').value;
//     const role = document.querySelector('input[name="role"]:checked').value;

//     // Validate inputs
//     if (!email || !password || !role || !username || !name) {
//         alert("Please fill in all fields.");
//         return;
//     }

//     if (password.length < 6) {
//         alert("Password must be at least 6 characters long.");
//         return;
//     }

//     // Check if the username is unique
//     checkUsernameUnique(username).then(isUnique => {
//         if (!isUnique) {
//             alert("Username already taken. Please choose a different username.");
//             return;
//         }

//         // If username is unique, create a new user
//         auth.createUserWithEmailAndPassword(email, password)
//             .then((userCredential) => {
//                 const user = userCredential.user;
//                 const userId = user.uid;

//                 // Store the user data in Realtime Database
//                 return db.ref('users/' + userId).set({
//                     username: username,
//                     name: name,
//                     email: email,
//                     role: role
//                 });
//             })
//             .then(() => {
//                 alert('Account created successfully');
//                 document.getElementById('createaccount').reset();
//             })
//             .catch((error) => {
//                 console.error("Error: ", error.message);
//                 alert("Error: " + error.message);
//             });
//     }).catch((error) => {
//         console.error("Error checking username uniqueness: ", error);
//         alert("Error checking username uniqueness: " + error.message);
//     });
// });

// Handle Sign-In
signinform.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert("Please provide both username and password.");
        return;
    }

    // Check if the username exists and get the associated email
    db.ref('users').orderByChild('username').equalTo(username).once('value', snapshot => {
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
                                        return;
                                    }

                                    // Redirect to the appropriate dashboard with the token in the URL
                                    window.location.href = redirectUrl;
                                });
                            })
                            .catch((error) => {
                                console.error('Error fetching user data:', error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error signing in: ", error.message);
                        alert("Error: " + error.message);
                    });
            });
        } else {
            alert('Username not found');
        }
    });
});

// Handle Forgot Password
document.getElementById('forgot-password').addEventListener('click', (event) => {
    event.preventDefault();
    const email = prompt("Please enter your email address:");
    
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent. Please check your inbox.");
            })
            .catch((error) => {
                console.error("Error sending password reset email: ", error.message);
                alert("Error: " + error.message);
            });
    } else {
        alert("Email address cannot be empty.");
    }
});
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