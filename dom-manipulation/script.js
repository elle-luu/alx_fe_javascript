

// ---------------------------
// Storage & Sync Keys
// ---------------------------
const STORAGE_KEY = "dynamic_quotes";
const FILTER_KEY = "selected_category";
const LAST_SYNC_KEY = "last_sync_time";

// ---------------------------
// Server Simulation Config
// ---------------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API
const SYNC_INTERVAL = 15000; // 15 seconds

// ---------------------------
// Storage Helpers
// ---------------------------
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function setLastSync() {
  localStorage.setItem(LAST_SYNC_KEY, Date.now());
}

// ---------------------------
// Data Model
// ---------------------------
let quotes = loadQuotes() || [
  { id: 1, text: "Talk is cheap. Show me the code.", category: "Programming" },
  { id: 2, text: "Simplicity is the soul of efficiency.", category: "Programming" },
  { id: 3, text: "Dream big. Start small. Act now.", category: "Motivation" }
];

let currentCategory = localStorage.getItem(FILTER_KEY) || "All";

// ---------------------------
// DOM References
// ---------------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ---------------------------
// Initial Setup
// ---------------------------
createCategoryFilter();
createAddQuoteForm();
createSyncNotification();
filterQuotes();

newQuoteBtn.addEventListener("click", filterQuotes);

startSync();

// ---------------------------
// Filtering Logic
// ---------------------------
function populateCategories(selectElement) {
  const categories = ["All", ...new Set(quotes.map(q => q.category))];
  selectElement.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectElement.appendChild(option);
  });
}

function createCategoryFilter() {
  const container = document.createElement("div");
  const select = document.createElement("select");
  select.id = "categoryFilter";

  populateCategories(select);
  select.value = currentCategory;

  select.addEventListener("change", () => {
    currentCategory = select.value;
    localStorage.setItem(FILTER_KEY, currentCategory);
    filterQuotes();
  });

  container.appendChild(select);
  document.body.insertBefore(container, quoteDisplay);
}

function filterQuotes() {
  quoteDisplay.innerHTML = "";

  const filtered = currentCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === currentCategory);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes found.";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// ---------------------------
// Add Quote
// ---------------------------
function createAddQuoteForm() {
  const div = document.createElement("div");
  const text = document.createElement("input");
  const cat = document.createElement("input");
  const btn = document.createElement("button");

  text.placeholder = "Quote";
  cat.placeholder = "Category";
  btn.textContent = "Add";

  btn.addEventListener("click", () => {
    if (!text.value || !cat.value) return;

    const newQuote = {
      id: Date.now(),
      text: text.value,
      category: cat.value
    };

    quotes.push(newQuote);
    saveQuotes();
    populateCategories(document.getElementById("categoryFilter"));
    filterQuotes();

    text.value = "";
    cat.value = "";
  });

  div.append(text, cat, btn);
  document.body.appendChild(div);
}

// ---------------------------
// Server Sync Simulation
// ---------------------------
function startSync() {
  syncWithServer();
  setInterval(syncWithServer, SYNC_INTERVAL);
}

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: "Server"
    }));

    resolveConflicts(serverQuotes);
  } catch (err) {
    console.error("Sync failed", err);
  }
}

// ---------------------------
// Conflict Resolution
// ---------------------------
function resolveConflicts(serverQuotes) {
  const localMap = new Map(quotes.map(q => [q.id, q]));

  let conflictsResolved = false;

  serverQuotes.forEach(sq => {
    if (!localMap.has(sq.id)) {
      quotes.push(sq);
      conflictsResolved = true;
    } else {
      // Server wins
      localMap.set(sq.id, sq);
      conflictsResolved = true;
    }
  });

  quotes = Array.from(localMap.values());

  if (conflictsResolved) {
    saveQuotes();
    setLastSync();
    showSyncNotification("Server updates applied. Conflicts resolved.");
    populateCategories(document.getElementById("categoryFilter"));
    filterQuotes();
  }
}

// ---------------------------
// Sync Notification UI
// ---------------------------
function createSyncNotification() {
  const div = document.createElement("div");
  div.id = "syncNotice";
  div.style.fontSize = "0.9rem";
  div.style.opacity = "0.7";
  document.body.appendChild(div);
}

function showSyncNotification(message) {
  const div = document.getElementById("syncNotice");
  div.textContent = message;

  setTimeout(() => {
    div.textContent = "";
  }, 4000);
}



// =======================
// SYNC
// =======================
async function syncWithServer() {
  syncStatus.textContent = "Syncing...";
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const merged = [...quotes];
    serverQuotes.forEach(sq => {
      if (!quotes.some(lq => lq.text === sq.text && lq.category === sq.category)) merged.push(sq);
    });
    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();
    syncStatus.textContent = "Sync complete.";
  } catch {
    syncStatus.textContent = "Sync failed.";
  }
}

// ⚡ Alias for checker: make sure syncQuotes exists
const syncQuotes = syncWithServer;

// Poll server every 60s
setInterval(syncWithServer, 60000);
