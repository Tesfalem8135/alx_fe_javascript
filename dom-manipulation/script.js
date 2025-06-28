// Initial quotes array with some default quotes
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspiration" },
    { text: "The only way to do great work is to love what you do.", category: "Success" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const showAddFormButton = document.getElementById('showAddForm');
const addQuoteForm = document.getElementById('addQuoteForm');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Function to show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Please add some quotes!</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    // Create elements for the quote and category
    const quoteElement = document.createElement('div');
    quoteElement.innerHTML = `
        <p style="font-size: 1.2em; font-style: italic;">"${quote.text}"</p>
        <p style="color: #666; text-align: right;">Category: ${quote.category}</p>
    `;

    // Clear previous quote and add new one with a fade effect
    quoteDisplay.style.opacity = '0';
    setTimeout(() => {
        quoteDisplay.innerHTML = '';
        quoteDisplay.appendChild(quoteElement);
        quoteDisplay.style.opacity = '1';
    }, 200);
}

// Function to add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    // Validate input
    if (!text || !category) {
        alert('Please fill in both the quote and category fields.');
        return;
    }

    // Add new quote to the array
    quotes.push({ text, category });

    // Clear the form
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Hide the form
    addQuoteForm.style.display = 'none';

    // Show the new quote
    showRandomQuote();

    // Show success message
    alert('Quote added successfully!');
}

// Toggle the add quote form
function toggleAddQuoteForm() {
    if (addQuoteForm.style.display === 'none') {
        addQuoteForm.style.display = 'block';
    } else {
        addQuoteForm.style.display = 'none';
    }
}

// Event Listeners
newQuoteButton.addEventListener('click', showRandomQuote);
showAddFormButton.addEventListener('click', toggleAddQuoteForm);

// Show initial random quote
showRandomQuote();
