const supabaseUrl = 'https://htdojtzkrwnmwtgwgltn.supabase.co';
const supabaseKey = 'https://htdojtzkrwnmwtgwgltn.supabase.co';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
}

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
}

async function logout() {
  await supabase.auth.signOut();
  document.getElementById("notes").innerHTML = "<p>Logged out.</p>";
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    loadNotes(session.user.id);
  } else {
    document.getElementById("notes").innerHTML = "<p>Please log in to see your notes.</p>";
  }
});

async function saveNote() {
  const noteText = document.getElementById("noteText").value;
  const noteId = document.getElementById("noteId").value;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return alert("Please log in");

  if (noteId) {
    await supabase.from("notes").update({ text: noteText }).eq("id", noteId);
  } else {
    await supabase.from("notes").insert({ uid: user.id, text: noteText });
  }

  document.getElementById("noteText").value = "";
  document.getElementById("noteId").value = "";
  loadNotes(user.id);
}

async function loadNotes(uid) {
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("uid", uid)
    .order("id", { ascending: false });

  const notesDiv = document.getElementById("notes");
  notesDiv.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <p>${note.text}</p>
      <button onclick="editNote('${note.id}', \`${note.text.replace(/`/g, "\\`")}\`)">Edit</button>
      <button onclick="deleteNote('${note.id}')">Delete</button>
    `;
    notesDiv.appendChild(div);
  });
}

function editNote(id, text) {
  document.getElementById("noteText").value = text;
  document.getElementById("noteId").value = id;
}

async function deleteNote(id) {
  await supabase.from("notes").delete().eq("id", id);
  const {
    data: { user }
  } = await supabase.auth.getUser();
  loadNotes(user.id);
}
