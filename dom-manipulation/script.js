// Quote data
const quotes = [
  { text: "Discipline beats motivation.", category: "Mindset" },
  { text: "Code like your future depends on it.", category: "Programming" },
  { text: "Fear is temporary. Regret is permanent.", category: "Life" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>— ${quote.category}</small>
  `;
}

// Create Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote();
}

// Event listener for Show New Quote button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize app
createAddQuoteForm();
showRandomQuote();



// =======================
// STORAGE
// =======================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [];
}

function saveFilter(category) {
  localStorage.setItem("selectedCategory", category);
}

function loadFilter() {
  return localStorage.getItem("selectedCategory") || "all";
}

// =======================
// DATA
// =======================
let quotes = loadQuotes();

// =======================
// DOM
// =======================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// =======================
// SERVER SIMULATION
// =======================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// =======================
// POPULATE CATEGORIES
// =======================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = loadFilter();
}

// =======================
// DISPLAY QUOTES
// =======================
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes found.";
    return;
  }

  list.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// =======================
// FILTER
// =======================
function filterQuotes() {
  const selected = categoryFilter.value;
  saveFilter(selected);

  if (selected === "all") {
    displayQuotes(quotes);
  } else {
    displayQuotes(quotes.filter(q => q.category === selected));
  }
}

// =======================
// RANDOM QUOTE
// =======================
function showRandomQuote() {
  if (!quotes.length) return;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>— ${q.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// =======================
// ADD QUOTE
// =======================
function createAddQuoteForm() {
  const div = document.createElement("div");

  const text = document.createElement("input");
  text.id = "newQuoteText";
  text.placeholder = "Enter a new quote";

  const cat = document.createElement("input");
  cat.id = "newQuoteCategory";
  cat.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;

  div.append(text, cat, btn);
  document.body.appendChild(div);
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) return alert("Fill all fields.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

// =======================
// SYNC WITH SERVER
// =======================
async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";

  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert server posts into quotes
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: SERVER WINS
    quotes = serverQuotes;
    saveQuotes();

    populateCategories();
    filterQuotes();

    syncStatus.textContent =
      "Server sync complete. Conflicts resolved (server data applied).";
  } catch (error) {
    syncStatus.textContent = "Sync failed. Try again.";
  }
}

// =======================
// PERIODIC SERVER POLLING
// =======================
setInterval(syncWithServer, 60000); // every 60 seconds

// =======================
// EXPORT / IMPORT
// =======================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw "";
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported.");
    } catch {
      alert("Invalid JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// =======================
// INIT
// =======================
newQuoteBtn.addEventListener("click", showRandomQuote);

createAddQuoteForm();
populateCategories();
filterQuotes();
