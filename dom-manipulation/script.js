// catch elements---
const quoteDisplayDiv = document.getElementById('quoteDisplay'),
newQuoteBtn = document.getElementById('newQuote'),
exportQuotesBtn = document.getElementById('exportQuotes'),
addFormQuote = document.getElementById('addFormQuote'),
categoryFilterSelect = document.getElementById('categoryFilter');


let quotes = [];

// variable to check if form created--
let formCreated = false;

newQuoteBtn.addEventListener('click' , showRandomQuote);
exportQuotesBtn.addEventListener('click' , exportQuotesToJson);

// show form to add----
addFormQuote.addEventListener('click' , () => !formCreated && createAddQuoteForm());


function showRandomQuote () {
    // declare randomQuote--
    let randomQuote;

    // check if there is quotes in local storage first---
    if(localStorage.quotesData) {
        quotes = JSON.parse(localStorage.quotesData);
        randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteDisplayDiv.textContent = `${randomQuote.text} (${randomQuote.category})`;
    }
    // else if (quotes.length > 0) {
    //     randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    //     quoteDisplayDiv.textContent = `${randomQuote.text} (${randomQuote.category})`;
    // } 
    else {
        quoteDisplayDiv.textContent = 'No quotes available. Please add a quote.';
        !formCreated && createAddQuoteForm();
    }
}



function addQuote () {
    // get elements-----
    const newQuoteTextInput = document.getElementById('newQuoteText'),
    newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    // check on values are not empty----
    if (newQuoteTextInput.value && newQuoteCategoryInput.value) {
        // free quotes array---
        quotes = [];

        // get and push values---
        quotes.push({text : newQuoteTextInput.value.trim() 
        , category : newQuoteCategoryInput.value.trim()});

        // add quotes to local storage but first check----
        if(localStorage.quotesData) {
            let localQuotes = JSON.parse(localStorage.quotesData);
            localQuotes.push(...quotes);
            localStorage.quotesData = JSON.stringify(localQuotes);
        }
        else {
            localStorage.setItem('quotesData' , JSON.stringify(quotes));
        }

        // show showRandomQuote--
        showRandomQuote();

        // add the new category to select---
        filterQuotes();

        // clear inputs--
        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';
    }
}


function createAddQuoteForm() {
    let formDiv = document.createElement('div');
    formDiv.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
    document.body.appendChild(formDiv);

    // form created-----
    formCreated = true;
}



function exportQuotesToJson() {
    // check if there are quotes in local storage---
    if (localStorage.getItem('quotesData')) {
        const data = JSON.stringify(localStorage.quotesData);
        const blob = new Blob([data], {type : 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    else {
        quoteDisplayDiv.textContent = 'No quotes to export';
    }
}



function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(JSON.parse(event.target.result));
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}


function saveQuotes() {
    localStorage.quotesData = JSON.stringify(quotes);
}


function populateCategories() {
    const categories = ['all'];
    quotes.forEach(quote => {
        if (!categories.includes(quote.category)) {
            categories.push(quote.category);
        }
    });
    categoryFilterSelect.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
    const selectedCategory = localStorage.selectedCategory || 'all';
    categoryFilterSelect.value = selectedCategory;
}


function filterQuote () {
    const selectedCategory = categoryFilterSelect.value;
    localStorage.selectedCategory = selectedCategory;
    showRandomQuote();
}


window.onload = () => {
    if (localStorage.quotesData) {
        quotes = JSON.parse(localStorage.quotesData);
        populateCategories();
        filterQuote ();
    }
};
const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch data from the server
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to post data to the server
async function postData(newQuote) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newQuote)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error posting data:', error);
    }
}
setInterval(async () => {
  const serverData = await fetchData();
  updateLocalData(serverData);
}, 30000); // Fetch data every 30 seconds
function updateLocalData(serverData) {
  const localData = JSON.parse(localStorage.getItem('quotes')) || [];
  
  // Simple conflict resolution: Server data takes precedence
  const mergedData = mergeData(localData, serverData);

  localStorage.setItem('quotes', JSON.stringify(mergedData));
}

function mergeData(localData, serverData) {
  const merged = [...serverData];

  localData.forEach(localQuote => {
      const existsInServer = serverData.some(serverQuote => serverQuote.id === localQuote.id);
      if (!existsInServer) {
          merged.push(localQuote);
      }
  });

  return merged;
}
function notifyUser(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
      notification.remove();
  }, 5000); // Remove notification after 5 seconds
}

function updateLocalData(serverData) {
  const localData = JSON.parse(localStorage.getItem('quotes')) || [];
  
  const mergedData = mergeData(localData, serverData);
  localStorage.setItem('quotes', JSON.stringify(mergedData));
  
  notifyUser('Data synced with server. Any conflicts were resolved.');
}

function mergeData(localData, serverData) {
  const merged = [...serverData];
  let conflictResolved = false;

  localData.forEach(localQuote => {
      const existsInServer = serverData.some(serverQuote => serverQuote.id === localQuote.id);
      if (!existsInServer) {
          merged.push(localQuote);
      } else {
          conflictResolved = true;
      }
  });

  if (conflictResolved) {
      notifyUser('Conflicts detected and resolved with server data.');
  }

  return merged;
}
function resolveConflictManually(localQuote, serverQuote) {
  // Display a dialog or UI element to let the user choose
  const userChoice = confirm(`Conflict detected for quote ${localQuote.id}. Use server data?`);

  if (userChoice) {
      return serverQuote;
  } else {
      return localQuote;
  }
}

function mergeData(localData, serverData) {
  const merged = [...serverData];

  localData.forEach(localQuote => {
      const serverQuote = serverData.find(serverQuote => serverQuote.id === localQuote.id);
      if (!serverQuote) {
          merged.push(localQuote);
      } else {
          const resolvedQuote = resolveConflictManually(localQuote, serverQuote);
          merged.push(resolvedQuote);
      }
  });

  return merged;
}
// Test function for syncing and conflict resolution
async function testSyncAndConflictResolution() {
  const initialLocalData = [
      { id: 1, quote: "Local Quote 1" },
      { id: 2, quote: "Local Quote 2" }
  ];
  localStorage.setItem('quotes', JSON.stringify(initialLocalData));

  const serverData = await fetchData();
  updateLocalData(serverData);

  const finalLocalData = JSON.parse(localStorage.getItem('quotes'));
  console.log('Final Local Data:', finalLocalData);
}

testSyncAndConflictResolution();
