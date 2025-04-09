let activeQueries = [];

// Load queries from storage
chrome.storage.sync.get(['queries'], (data) => {
  if (data.queries) {
    activeQueries = data.queries;
    filterVideos();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateVideos') {
    filterVideos();
  }
});

// Function to check if a video title matches any of the active queries
function matchesQuery(title) {
  return activeQueries.some(query => 
    title.toLowerCase().includes(query.toLowerCase())
  );
}

// Function to filter videos on the page
function filterVideos() {
  // Get all video elements
  const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
  
  videoElements.forEach(element => {
    const titleElement = element.querySelector('#video-title');
    if (titleElement) {
      const title = titleElement.textContent.trim();
      const shouldShow = activeQueries.length === 0 || matchesQuery(title);
      element.style.display = shouldShow ? '' : 'none';
    }
  });
}

// Create a MutationObserver to watch for changes in the page
const observer = new MutationObserver((mutations) => {
  filterVideos();
});

// Start observing the page for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial filter when the page loads
filterVideos(); 