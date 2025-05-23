// 🔐 Firebase configuration (replace with your Firebase project credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 Login, Signup, Logout
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password).catch(alert);
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password).catch(alert);
}

function logout() {
  auth.signOut();
}

// 🔄 Auth State Listener
auth.onAuthStateChanged((user) => {
  if (user) {
    loadNotes(user.uid);
  } else {
    document.getElementById("notes").innerHTML = "<p>Please log in to see your notes.</p>";
  }
});

// 📝 Save or Update Note
function saveNote() {
  const user = auth.currentUser;
  if (!user) return alert("Please log in");

  const noteText = document.getElementById("noteText").value;
  const noteId = document.getElementById("noteId").value;

  if (noteId) {
    db.collection("notes").doc(noteId).update({
      text: noteText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    db.collection("notes").add({
      uid: user.uid,
      text: noteText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  document.getElementById("noteText").value = "";
  document.getElementById("noteId").value = "";
}

// 📄 Load Notes
function loadNotes(uid) {
  db.collection("notes")
    .where("uid", "==", uid)
    .orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      const notesDiv = document.getElementById("notes");
      notesDiv.innerHTML = "";
      snapshot.forEach((doc) => {
        const note = doc.data();
        const div = document.createElement("div");
        div.className = "note";
        div.innerHTML = `
          <p>${note.text}</p>
          <button onclick="editNote('${doc.id}', \`${note.text.replace(/`/g, '\\`')}\`)">Edit</button>
          <button onclick="deleteNote('${doc.id}')">Delete</button>
        `;
        notesDiv.appendChild(div);
      });
    });
}

// ✏️ Edit Note
function editNote(id, text) {
  document.getElementById("noteText").value = text;
  document.getElementById("noteId").value = id;
}

// ❌ Delete Note
function deleteNote(id) {
  db.collection("notes").doc(id).delete();
}
