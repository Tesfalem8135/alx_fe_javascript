// Initial quotes database
let quotes = [];
let currentCategory = null;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAddFormBtn = document.getElementById('showAddForm');
const categoryButtonsContainer = document.getElementById('categoryButtons');
const exportBtn = document.getElementById('exportQuotes');
const importInput = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorage');
const lastViewedDisplay = document.getElementById('lastViewed');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Load quotes from local storage
  loadQuotes();
  
  // Set up event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJson);
  importInput.addEventListener('change', importFromJsonFile);
  clearStorageBtn.addEventListener('click', clearAllData);
  
  // Generate category buttons
  updateCategoryButtons();
  
  // Load last viewed quote from session storage
  loadLastViewed();
});

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if none are stored
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "inspiration" },
      { text: "Innovation distinguishes between a leader and a follower.", category: "leadership" },
      { text: "Your time is limited, don't waste it living someone else's life.", category: "life" }
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last viewed quote to session storage
function saveLastViewed(quote) {
  sessionStorage.setItem('lastViewed', JSON.stringify(quote));
}

// Load last viewed quote from session storage
function loadLastViewed() {
  const lastViewed = sessionStorage.getItem('lastViewed');
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    lastViewedDisplay.textContent = `Last viewed: "${quote.text}" (${quote.category})`;
  }
}

// Display a random quote
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
  
  // Save to session storage
  saveLastViewed(quote);
  loadLastViewed();
}

// Create the form to add new quotes
function createAddQuoteForm() {
  // Remove any existing form first
  const existingForm = document.querySelector('.add-quote-form');
  if (existingForm) {
    existingForm.remove();
  }

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'add-quote-form';
  formContainer.style.marginTop = '30px';
  formContainer.style.padding = '20px';
  formContainer.style.backgroundColor = '#f0f0f0';
  formContainer.style.borderRadius = '5px';

  // Create form elements
  formContainer.innerHTML = `
    <h3>Add New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="submitNewQuote">Add Quote</button>
    <button id="cancelAddQuote">Cancel</button>
  `;

  // Insert the form after the quote display
  quoteDisplay.insertAdjacentElement('afterend', formContainer);

  // Add event listeners
  document.getElementById('submitNewQuote').addEventListener('click', addQuote);
  document.getElementById('cancelAddQuote').addEventListener('click', () => {
    formContainer.remove();
  });
}

// Add a new quote to the collection
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim().toLowerCase();
  
  if (!text || !category) {
    alert('Please enter both a quote and a category');
    return;
  }
  
  // Add the new quote
  quotes.push({ text, category });
  
  // Save to local storage
  saveQuotes();
  
  // Remove the form
  document.querySelector('.add-quote-form').remove();
  
  // Update UI
  updateCategoryButtons();
  showRandomQuote();
  
  // Notify user
  alert('Quote added successfully!');
}

// Export quotes to JSON file
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'quotes.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote
      for (const quote of importedQuotes) {
        if (!quote.text || !quote.category) {
          throw new Error('Invalid quote format: Each quote must have text and category');
        }
      }
      
      quotes = importedQuotes;
      saveQuotes();
      updateCategoryButtons();
      showRandomQuote();
      alert(`Successfully imported ${importedQuotes.length} quotes!`);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      alert('Error importing quotes: ' + error.message);
    }
  };
  fileReader.readAsText(file);
}

// Clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all quotes and reset to default?')) {
    localStorage.removeItem('quotes');
    sessionStorage.removeItem('lastViewed');
    loadQuotes();
    updateCategoryButtons();
    showRandomQuote();
    lastViewedDisplay.textContent = '';
    alert('All data has been reset to default.');
  }
}

// Update the category filter buttons
function updateCategoryButtons() {
  // Clear existing buttons
  categoryButtonsContainer.innerHTML = '';
  
  // Add "All" category button
  const allButton = document.createElement('button');
  allButton.textContent = 'All';
  allButton.className = !currentCategory ? 'active' : '';
  allButton.addEventListener('click', () => {
    currentCategory = null;
    updateCategoryButtons();
    showRandomQuote();
  });
  categoryButtonsContainer.appendChild(allButton);
  
  // Get all unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Create a button for each category
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.className = currentCategory === category ? 'active' : '';
    button.addEventListener('click', () => {
      currentCategory = category;
      updateCategoryButtons();
      showRandomQuote();
    });
    categoryButtonsContainer.appendChild(button);
  });
  
  // Add "Add New Category" button
  const addCategoryButton = document.createElement('button');
  addCategoryButton.textContent = '+ Add Category';
  addCategoryButton.addEventListener('click', () => {
    const newCategory = prompt('Enter a new category name:');
    if (newCategory && newCategory.trim()) {
      currentCategory = newCategory.trim().toLowerCase();
      updateCategoryButtons();
      showRandomQuote();
    }
  });
  categoryButtonsContainer.appendChild(addCategoryButton);
}