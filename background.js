let savedInputs = {}; // to hold your saved inputs
let inputIndices = {}; // to keep track of where you are in the savedInputs array for each input field
let excludedDomains = []; // to hold your excluded domains
const maxItemsPerField = 20;
const maxTotalItems = 100;
let totalItems = 0;

// Load stored data when the extension is initialized
chrome.storage.local.get(['savedInputs', 'inputIndices', 'totalItems', 'excludedDomains'], function (result) {
  if (result.savedInputs) savedInputs = result.savedInputs;
  if (result.inputIndices) inputIndices = result.inputIndices;
  if (result.totalItems) totalItems = result.totalItems;
  if (result.excludedDomains) excludedDomains = result.excludedDomains;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'excludeDomain') {
    excludedDomains.push(request.domain);
    chrome.storage.local.set({ 'excludedDomains': excludedDomains }, function () {
      console.log('Domain excluded');
      sendResponse({ status: 'success' });
    });
    return true; // keep the message channel open until sendResponse is called
  } else {
    let inputField = request.xpath;

    // Check if the domain is excluded before processing inputs
    if (excludedDomains.includes(new URL(sender.tab.url).hostname)) {
      sendResponse({ status: 'excluded' });  // Send a response
      return true;  // Return true to keep the port open
    }


    if (request.method === 'saveInput') {
      if (!savedInputs[inputField]) {
        savedInputs[inputField] = [];
      }

      // If we're at maximum capacity for this field, remove the oldest item
      if (savedInputs[inputField].length === maxItemsPerField) {
        savedInputs[inputField].shift();
      } else {
        totalItems++;  // Only increase the total if we're not at capacity for this field
      }

      // If we're over the total capacity, remove the smallest field
      if (totalItems > maxTotalItems) {
        let minKey = Object.keys(savedInputs).reduce((a, b) => savedInputs[a].length < savedInputs[b].length ? a : b);
        totalItems -= savedInputs[minKey].length;
        delete savedInputs[minKey];
        delete inputIndices[minKey];
      }

      savedInputs[inputField].push(request.data);
      inputIndices[inputField] = savedInputs[inputField].length - 1;

      // Save data whenever it's updated
      chrome.storage.local.set({ 'savedInputs': savedInputs, 'inputIndices': inputIndices, 'totalItems': totalItems }, function () {
        console.log('Data saved');
      });
    } else if (request.method === 'getInput') {
      if (!savedInputs[inputField] || savedInputs[inputField].length === 0 || excludedDomains.includes(new URL(sender.tab.url).hostname)) {
        sendResponse({ data: null });  // Indicate that no data should be retrieved
        return true;
      }

      if (request.direction === 'up' && inputIndices[inputField] > 0) {
        inputIndices[inputField]--;
      } else if (request.direction === 'down' && inputIndices[inputField] < savedInputs[inputField].length - 1) {
        inputIndices[inputField]++;
      }

      sendResponse({ data: savedInputs[inputField][inputIndices[inputField]] });
    }

    return true; // Keep this return statement as well to ensure the port is always kept open

  }
  return true; // this was missing
});
