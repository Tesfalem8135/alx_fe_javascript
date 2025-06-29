// Initial quotes database
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "leadership" },
  { text: "Your time is limited, don't waste it living someone else's life.", category: "life" },
  { text: "Stay hungry, stay foolish.", category: "inspiration" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "life" },
  { text: "The way to get started is to quit talking and begin doing.", category: "motivation" }
];

// Current selected category (null means all categories)
let currentCategory = null;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAddFormBtn = document.getElementById('showAddForm');
const categoryButtonsContainer = document.getElementById('categoryButtons');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Display first quote
  showRandomQuote();
  
  // Set up event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);
  
  // Generate category buttons
  updateCategoryButtons();
});

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
}

// Create the form to add new quotes (dynamically)
function createAddQuoteForm() {
  // Remove any existing form first
  const existingForm = document.getElementById('dynamicAddForm');
  if (existingForm) {
    existingForm.remove();
  }

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.id = 'dynamicAddForm';
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
  
  // Remove the form
  document.getElementById('dynamicAddForm').remove();
  
  // Update UI
  updateCategoryButtons();
  showRandomQuote();
  
  // Notify user
  alert('Quote added successfully!');
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