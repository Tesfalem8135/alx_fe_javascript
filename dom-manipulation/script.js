// Initial quotes database
let quotes = [];
let currentCategory = null;
let lastSyncTime = null;
let serverQuotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAddFormBtn = document.getElementById('showAddForm');
const categoryButtonsContainer = document.getElementById('categoryButtons');
const exportBtn = document.getElementById('exportQuotes');
const importInput = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorage');
const lastViewedDisplay = document.getElementById('lastViewed');
const categoryFilter = document.getElementById('categoryFilter');
const syncNowBtn = document.getElementById('syncNow');
const syncStatus = document.getElementById('syncStatus');
const updateNotification = document.getElementById('updateNotification');
const conflictNotification = document.getElementById('conflictNotification');

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
  loadQuotes();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJson);
  importInput.addEventListener('change', importFromJsonFile);
  clearStorageBtn.addEventListener('click', clearAllData);
  categoryFilter.addEventListener('change', filterQuotes);
  syncNowBtn.addEventListener('click', syncWithServer);
  populateCategories();
  updateCategoryButtons();
  loadLastViewed();
  loadLastFilter();
  setInterval(syncWithServer, 300000);
  setTimeout(syncWithServer, 2000);
});

// ======================
// Storage Functions
// ======================

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "inspiration" },
      { text: "Innovation distinguishes between a leader and a follower.", category: "leadership" },
      { text: "Your time is limited, don't waste it living someone else's life.", category: "life" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  localStorage.setItem('lastUpdate', Date.now());
}

function saveLastViewed(quote) {
  sessionStorage.setItem('lastViewed', JSON.stringify(quote));
}

function loadLastViewed() {
  const lastViewed = sessionStorage.getItem('lastViewed');
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    lastViewedDisplay.textContent = `Last viewed: "${quote.text}" (${quote.category})`;
  }
}

function saveLastFilter() {
  localStorage.setItem('lastFilter', currentCategory || 'all');
}

function loadLastFilter() {
  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter) {
    currentCategory = lastFilter === 'all' ? null : lastFilter;
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// ======================
// Quote Display Functions
// ======================

function showRandomQuote() {
  let filteredQuotes = currentCategory
    ? quotes.filter(quote => quote.category === currentCategory)
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found in this category. Add some!</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p class="category">— ${quote.category}</p>
  `;

  saveLastViewed(quote);
  loadLastViewed();
}

// ======================
// Category Management
// ======================

function populateCategories() {
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  const categories = [...new Set(quotes.map(quote => quote.category))];

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  currentCategory = categoryFilter.value === 'all' ? null : categoryFilter.value;
  saveLastFilter();
  showRandomQuote();
}

// ======================
// Quote Management
// ======================

function createAddQuoteForm() {
  const existingForm = document.querySelector('.add-quote-form');
  if (existingForm) {
    existingForm.remove();
    return;
  }

  const formContainer = document.createElement('div');
  formContainer.className = 'add-quote-form';
  formContainer.innerHTML = `
    <h3>Add New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="submitNewQuote">Add Quote</button>
    <button id="cancelAddQuote">Cancel</button>
  `;

  quoteDisplay.insertAdjacentElement('afterend', formContainer);

  document.getElementById('submitNewQuote').addEventListener('click', addQuote);
  document.getElementById('cancelAddQuote').addEventListener('click', () => {
    formContainer.remove();
  });
}

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = categoryInput.value.trim().toLowerCase();

  if (!text || !category) {
    alert('Please enter both a quote and a category');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  document.querySelector('.add-quote-form').remove();
  populateCategories();
  updateCategoryButtons();
  showRandomQuote();
  alert('Quote added successfully!');
}

// ======================
// Import/Export Functions
// ======================

function exportToJson() {
  try {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    alert('Error exporting quotes: ' + error.message);
  }
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }

      for (const quote of importedQuotes) {
        if (!quote.text || !quote.category) {
          throw new Error('Invalid quote format: Each quote must have text and category');
        }
      }

      quotes = importedQuotes;
      saveQuotes();
      populateCategories();
      updateCategoryButtons();
      showRandomQuote();
      alert(`Successfully imported ${importedQuotes.length} quotes!`);
      event.target.value = '';
    } catch (error) {
      alert('Error importing quotes: ' + error.message);
    }
  };
  fileReader.readAsText(file);
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all quotes and reset to default?')) {
    localStorage.removeItem('quotes');
    sessionStorage.removeItem('lastViewed');
    localStorage.removeItem('lastFilter');
    loadQuotes();
    populateCategories();
    updateCategoryButtons();
    showRandomQuote();
    lastViewedDisplay.textContent = '';
    alert('All data has been reset to default.');
  }
}

// ======================
// Server Sync Functions
// ======================

async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const serverData = await response.json();

  return serverData.slice(0, 5).map(post => ({
    text: post.title,
    category: 'server'
  }));
}

async function syncWithServer() {
  try {
    serverQuotes = await fetchQuotesFromServer();

    const lastUpdate = localStorage.getItem('lastUpdate') || 0;
    const serverUpdateTime = Date.now() - 3600000;

    if (serverUpdateTime > lastUpdate) {
      if (confirm('New quotes available from server. Would you like to update?')) {
        acceptServerChanges();
      }
    }

    lastSyncTime = Date.now();
    syncStatus.textContent = `Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}`;
  } catch (error) {
    console.error('Sync failed:', error);
    syncStatus.textContent = 'Last sync: Failed';
  }
}

function acceptServerChanges() {
  quotes = [...quotes, ...serverQuotes];
  saveQuotes();
  populateCategories();
  updateCategoryButtons();
  showRandomQuote();
  updateNotification.style.display = 'none';
  alert('Server changes applied successfully!');
}

function resolveConflict() {
  acceptServerChanges();
}

async function postQuotesToServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotes)
    });

    if (!response.ok) throw new Error('Failed to post quotes');

    const result = await response.json();
    console.log('Posted to server:', result);
    alert('Quotes successfully posted to the server!');
  } catch (error) {
    console.error('Post failed:', error);
    alert('Failed to post quotes to server.');
  }
}

// ======================
// UI Update Functions
// ======================

function updateCategoryButtons() {
  categoryButtonsContainer.innerHTML = '';

  const allButton = document.createElement('button');
  allButton.textContent = 'All';
  allButton.className = !currentCategory ? 'active' : '';
  allButton.addEventListener('click', () => {
    currentCategory = null;
    categoryFilter.value = 'all';
    saveLastFilter();
    updateCategoryButtons();
    showRandomQuote();
  });
  categoryButtonsContainer.appendChild(allButton);

  const categories = [...new Set(quotes.map(quote => quote.category))];

  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.className = currentCategory === category ? 'active' : '';
    button.addEventListener('click', () => {
      currentCategory = category;
      categoryFilter.value = category;
      saveLastFilter();
      updateCategoryButtons();
      showRandomQuote();
    });
    categoryButtonsContainer.appendChild(button);
  });

  const addCategoryButton = document.createElement('button');
  addCategoryButton.textContent = '+ Add Category';
  addCategoryButton.addEventListener('click', () => {
    const newCategory = prompt('Enter a new category name:');
    if (newCategory && newCategory.trim()) {
      currentCategory = newCategory.trim().toLowerCase();
      categoryFilter.value = currentCategory;
      saveLastFilter();
      updateCategoryButtons();
      showRandomQuote();
    }
  });
  categoryButtonsContainer.appendChild(addCategoryButton);
}