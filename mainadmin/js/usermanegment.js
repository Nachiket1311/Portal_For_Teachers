
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const usersRef = database.ref('users');
const tableBody = document.getElementById("containuser");
usersRef.on('value', (snapshot) => {
    const data = snapshot.val();
    tableBody.innerHTML = ""; // Clear the table before appending new data
    let count = 0;

    // Check if data exists
    if (!data) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="14" style="text-align: center;">No questions found.</td>
            </tr>
        `;
        return;
    }

    for (let id in data) {
        // Show only the questions uploaded by the current user
            const row = document.createElement("tr");
            count++;

           
            row.innerHTML = `
                <td>${count}</td>
                <td>${data[id].name}</td>
                <td>${data[id].email}</td>
                <td>${data[id].username}</td>
                <td>${data[id].role}</td>
                <td><button class="btn btn-outline-danger" onclick="deleteQuestion('${id}')">Delete</button></td>
            `;
            tableBody.appendChild(row);
        }
    });
window.deleteQuestion = function(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        database.ref(`users/${id}`).remove()
        .then(() => {
            alert("user deleted successfully!");
        })
        .catch((error) => {
            console.error("Error deleting user:", error);
        });
    }
};
function adduser(){
    document.getElementById('myModal').style.display = 'block';
}
document.getElementById('preferencesForm').onsubmit = function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!email || !password || !role || !username || !name) {
        alert("Please fill in all fields.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    // Check if the username is unique
    checkUsernameUnique(username).then(isUnique => {
        if (!isUnique) {
            alert("Username already taken. Please choose a different username.");
            return;
        }

        // If username is unique, create a new user
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userId = user.uid;

                // Store the user data in Realtime Database
                return database.ref('users/' + userId).set({
                    username: username,
                    name: name,
                    email: email,
                    role: role
                });
            })
            .then(() => {
                alert('Account created successfully');
                document.getElementById('createaccount').reset();
            })
    }).catch((error) => {
        console.error("Error checking username uniqueness: ", error);
        alert("Error checking username uniqueness: " + error.message);
    });
    document.getElementById('myModal').style.display = 'none';
    alert("user is added successfully");
};
function checkUsernameUnique(username) {
    return database.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            return !snapshot.exists();  // Returns true if username is unique, false if already taken
        });
}

document.querySelectorAll('.close').forEach(button => {
    button.onclick = function() {
        document.getElementById('myModal').style.display = 'none';
    };
});

document.addEventListener('keydown', function(event) {
    if (event.keyCode == 27) { // If ESC key is pressed
        var modal = document.getElementById("myModal");
        if (modal.style.display === 'block') { // Check if the modal is currently displayed
            modal.style.display = 'none'; // Hide the modal
        }
    }
});