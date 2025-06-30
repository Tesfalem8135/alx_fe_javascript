 let quotes = [];
  let selectedCategory = 'all'; // ✅ Tracks selected category
  let currentCategory = null;
  let lastSyncTime = null;
  let serverQuotes = [];

  // ======================
  // DOM Elements
  // ======================
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
  const syncNotification = document.getElementById('syncNotification');

  // ======================
  // Initialization
  // ======================
  document.addEventListener('DOMContentLoaded', function () {
    loadQuotes();
    newQuoteBtn.addEventListener('click', showRandomQuote);
    showAddFormBtn.addEventListener('click', createAddQuoteForm);
    exportBtn.addEventListener('click', exportToJson);
    importInput.addEventListener('change', importFromJsonFile);
    clearStorageBtn.addEventListener('click', clearAllData);
    categoryFilter.addEventListener('change', filterQuotes);
    syncNowBtn.addEventListener('click', syncQuotes);

    populateCategories();
    updateCategoryButtons();
    loadLastViewed();
    loadLastFilter();
    setInterval(syncQuotes, 300000); // 5 minutes
    setTimeout(syncQuotes, 2000); // initial sync
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
    localStorage.setItem('lastFilter', selectedCategory);
  }

  function loadLastFilter() {
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
      selectedCategory = lastFilter;
      currentCategory = selectedCategory === 'all' ? null : selectedCategory;
      categoryFilter.value = lastFilter;
      filterQuotes();
    }
  }

  // ======================
  // Display Quotes
  // ======================
  function showRandomQuote() {
    let filteredQuotes = selectedCategory === 'all'
      ? quotes
      : quotes.filter(quote => quote.category === selectedCategory);

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
  // Filtering
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
    selectedCategory = categoryFilter.value; // ✅ Track selected value
    currentCategory = selectedCategory === 'all' ? null : selectedCategory;
    saveLastFilter();
    showRandomQuote();
  }

  // ======================
  // Add New Quote
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
  // Import/Export
  // ======================
  function exportToJson() {
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
  }

  function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (!Array.isArray(importedQuotes)) throw new Error('Expected an array of quotes');
        for (const q of importedQuotes) {
          if (!q.text || !q.category) throw new Error('Each quote must have text and category');
        }

        quotes = importedQuotes;
        saveQuotes();
        populateCategories();
        updateCategoryButtons();
        showRandomQuote();
        alert(`Imported ${quotes.length} quotes!`);
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    if (confirm('Are you sure you want to clear all quotes and reset?')) {
      localStorage.removeItem('quotes');
      sessionStorage.removeItem('lastViewed');
      localStorage.removeItem('lastFilter');
      loadQuotes();
      populateCategories();
      updateCategoryButtons();
      showRandomQuote();
      lastViewedDisplay.textContent = '';
      alert('Data reset to default.');
    }
  }

  // ======================
  // Sync Functions
  // ======================
  async function fetchQuotesFromServer() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data.slice(0, 5).map(post => ({
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
        acceptServerChanges();
      }

      lastSyncTime = Date.now();
      syncStatus.textContent = `Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}`;
    } catch (e) {
      console.error('Sync failed', e);
      syncStatus.textContent = 'Last sync: Failed';
    }
  }

  function syncQuotes() {
    syncWithServer().then(() => {
      syncNotification.textContent = 'Quotes synced with server!';
      syncNotification.style.display = 'block';
      setTimeout(() => {
        syncNotification.style.display = 'none';
      }, 3000);
    });
  }

  function acceptServerChanges() {
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    updateCategoryButtons();
    showRandomQuote();
    updateNotification.style.display = 'none';
  }

  // ======================
  // Category Buttons
  // ======================
  function updateCategoryButtons() {
    categoryButtonsContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.className = selectedCategory === 'all' ? 'active' : '';
    allBtn.addEventListener('click', () => {
      selectedCategory = 'all';
      categoryFilter.value = 'all';
      filterQuotes();
    });
    categoryButtonsContainer.appendChild(allBtn);

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.textContent = category;
      btn.className = selectedCategory === category ? 'active' : '';
      btn.addEventListener('click', () => {
        selectedCategory = category;
        categoryFilter.value = category;
        filterQuotes();
      });
      categoryButtonsContainer.appendChild(btn);
    });