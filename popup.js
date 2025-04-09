document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('queryInput');
  const addQueryButton = document.getElementById('addQuery');
  const queriesList = document.getElementById('queriesList');
  const updateInterval = document.getElementById('updateInterval');

  // Load saved queries and settings
  chrome.storage.sync.get(['queries', 'updateInterval'], (data) => {
    if (data.queries) {
      data.queries.forEach(query => addQueryToList(query));
    }
    if (data.updateInterval) {
      updateInterval.value = data.updateInterval;
    }
  });

  // Save update interval when changed
  updateInterval.addEventListener('change', () => {
    chrome.storage.sync.set({ updateInterval: parseInt(updateInterval.value) });
    chrome.runtime.sendMessage({ action: 'updateInterval', interval: parseInt(updateInterval.value) });
  });

  // Add new query
  addQueryButton.addEventListener('click', () => {
    const query = queryInput.value.trim();
    if (query) {
      chrome.storage.sync.get(['queries'], (data) => {
        const queries = data.queries || [];
        if (!queries.includes(query)) {
          queries.push(query);
          chrome.storage.sync.set({ queries }, () => {
            addQueryToList(query);
            queryInput.value = '';
            chrome.runtime.sendMessage({ action: 'newQuery', query });
          });
        }
      });
    }
  });

  // Add query to the list
  function addQueryToList(query) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${query}</span>
      <button class="remove-query">Remove</button>
    `;
    
    li.querySelector('.remove-query').addEventListener('click', () => {
      chrome.storage.sync.get(['queries'], (data) => {
        const queries = data.queries.filter(q => q !== query);
        chrome.storage.sync.set({ queries }, () => {
          li.remove();
          chrome.runtime.sendMessage({ action: 'removeQuery', query });
        });
      });
    });

    queriesList.appendChild(li);
  }
}); 