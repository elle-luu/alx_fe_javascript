// =======================
// STORAGE
// =======================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [
    { text: "Discipline beats motivation.", category: "Mindset" },
    { text: "Code like your future depends on it.", category: "Programming" },
    { text: "Fear is temporary. Regret is permanent.", category: "Life" }
  ];
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
// SERVER
// =======================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  const data = await res.json();
  return data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (err) {
    console.error("Failed to post quote:", err);
  }
}

// =======================
// DISPLAY & FILTER
// =======================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.value = loadFilter();
}

function displayQuotes(list) {
  quoteDisplay.innerHTML = "";
  if (!list.length) {
    quoteDisplay.textContent = "No quotes found.";
    return;
  }
  list.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

function filterQuotes() {
  const selected = categoryFilter.value;
  saveFilter(selected);
  displayQuotes(selected === "all" ? quotes : quotes.filter(q => q.category === selected));
}

function showRandomQuote() {
  if (!quotes.length) return quoteDisplay.textContent = "No quotes available.";
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>— ${q.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// =======================
// ADD QUOTE
// =======================
function createAddQuoteForm() {
  const div = document.createElement("div");
  const text = Object.assign(document.createElement("input"), { id: "newQuoteText", placeholder: "Enter a new quote" });
  const cat = Object.assign(document.createElement("input"), { id: "newQuoteCategory", placeholder: "Enter quote category" });
  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.addEventListener("click", addQuote);
  div.append(text, cat, btn);
  document.body.appendChild(div);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill in both fields.");
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  postQuoteToServer(newQuote); // send to server
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
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

setInterval(syncWithServer, 60000);

// =======================
// INIT
// =======================
newQuoteBtn.addEventListener("click", showRandomQuote);
createAddQuoteForm();
populateCategories();
filterQuotes();
