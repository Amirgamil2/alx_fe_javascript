// Constants
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Example server URL

// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Be yourself; everyone else is already taken.", category: "Category 1" },
    { text: "I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.", category: "Category 2" },
    { text: "A room without books is like a body without a soul.", category: "Category 1" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Category 2" },
];

// Function to display a random quote
function showRandomQuote() {
    const filteredQuotes = filterQuotesArray();
    if (filteredQuotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available for the selected category.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    document.getElementById("quoteDisplay").innerHTML = randomQuote.text;

    // Store the last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', randomQuote.text);
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;
    const newQuote = { text: newQuoteText, category: newQuoteCategory };

    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    populateCategories();
    showRandomQuote();

    // Sync with server
    syncQuotes();
}

// Function to export quotes to a JSON file
function exportQuotes() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        localStorage.setItem('quotes', JSON.stringify(quotes));
        alert('Quotes imported successfully!');
        populateCategories();
        syncQuotes();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to populate category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = ["all", ...new Set(quotes.map(quote => quote.category))];

    // Clear previous options
    categoryFilter.innerHTML = '';

    // Append new options
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem('lastSelectedCategory', selectedCategory);
    showRandomQuote();
}

// Function to filter quotes array based on selected category
function filterQuotesArray() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    return selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        if (serverQuotes.length > 0) {
            quotes = serverQuotes;
            localStorage.setItem('quotes', JSON.stringify(quotes));
            populateCategories();
            showRandomQuote();
            showNotification('Quotes synced with server!');
        }
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Function to post quotes to the server
async function postQuotesToServer() {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quotes)
        });
        const result = await response.json();
        console.log('Quotes posted to server:', result);
        showNotification('Quotes posted to server!');
    } catch (error) {
        console.error('Error posting quotes to server:', error);
    }
}

// Function to sync quotes with the server
async function syncQuotes() {
    await fetchQuotesFromServer();
    await postQuotesToServer();
}

// Function to show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Display the last viewed quote from session storage, if available
document.addEventListener('DOMContentLoaded', () => {
    const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastViewedQuote) {
        document.getElementById("quoteDisplay").innerHTML = lastViewedQuote;
    }
    populateCategories();
    showRandomQuote(); // Show a random quote on initial load
});

// Event listeners for buttons
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Periodically sync with the server every 30 seconds
setInterval(syncQuotes, 30000);