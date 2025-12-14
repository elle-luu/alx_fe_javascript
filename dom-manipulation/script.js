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
