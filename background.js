let updateTimer = null;
let currentInterval = 5; // Default interval in minutes

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['updateInterval'], (data) => {
    if (data.updateInterval) {
      currentInterval = data.updateInterval;
    }
    startUpdateTimer();
  });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateInterval') {
    currentInterval = message.interval;
    startUpdateTimer();
  } else if (message.action === 'newQuery' || message.action === 'removeQuery') {
    // Trigger immediate update when queries change
    updateYouTubeTabs();
  }
});

// Start or restart the update timer
function startUpdateTimer() {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
  updateTimer = setInterval(() => {
    updateYouTubeTabs();
  }, currentInterval * 60 * 1000);
}

// Update all YouTube tabs
function updateYouTubeTabs() {
  chrome.tabs.query({ url: 'https://www.youtube.com/*' }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'updateVideos' });
    });
  });
}

// Listen for tab updates to check if it's a YouTube page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('https://www.youtube.com/')) {
    chrome.tabs.sendMessage(tabId, { action: 'updateVideos' });
  }
}); 