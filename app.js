const form = document.getElementById("note-form");
const walkerInput = document.getElementById("walker-name");
const bodyInput = document.getElementById("note-body");
const moodInput = document.getElementById("note-mood");
const searchInput = document.getElementById("note-search");
const noteList = document.getElementById("note-list");
const emptyState = document.getElementById("empty-state");
const countLabel = document.getElementById("note-count");
const noteTemplate = document.getElementById("note-template");

const storageKey = "bright-notes";

const loadNotes = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not parse notes", error);
    return [];
  }
};

const saveNotes = (notes) => {
  localStorage.setItem(storageKey, JSON.stringify(notes));
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

let notes = loadNotes();

const renderNotes = () => {
  const query = searchInput.value.trim().toLowerCase();
  noteList.innerHTML = "";
  const filtered = notes.filter((note) =>
    [note.walker, note.body, note.mood].some((text) =>
      text.toLowerCase().includes(query)
    )
  );

  filtered.forEach((note) => {
    const noteNode = noteTemplate.content.cloneNode(true);
    noteNode.querySelector(".note__mood").textContent = note.mood;
    noteNode.querySelector(".note__title").textContent = note.walker;
    noteNode.querySelector(".note__body").textContent = note.body;
    noteNode.querySelector(".note__meta").textContent = `Saved ${formatDate(
      note.createdAt
    )}`;
    const deleteButton = noteNode.querySelector(".note__delete");
    deleteButton.addEventListener("click", () => {
      notes = notes.filter((item) => item.id !== note.id);
      saveNotes(notes);
      renderNotes();
    });
    noteList.appendChild(noteNode);
  });

  emptyState.style.display = filtered.length ? "none" : "block";
  countLabel.textContent = String(notes.length);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const newNote = {
    id: crypto.randomUUID(),
    walker: walkerInput.value.trim(),
    body: bodyInput.value.trim(),
    mood: moodInput.value,
    createdAt: Date.now(),
  };

  if (!newNote.walker || !newNote.body) {
    return;
  }

  notes = [newNote, ...notes].slice(0, 20);
  saveNotes(notes);
  form.reset();
  moodInput.value = "Focused";
  renderNotes();
});

searchInput.addEventListener("input", () => {
  renderNotes();
});

renderNotes();
