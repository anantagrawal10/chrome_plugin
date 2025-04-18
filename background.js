// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    allowedDomains: [],
    maxTabs: 10
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    checkTabPermissions(tab);
  }
});

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  checkTabPermissions(tab);
});

// Check if a tab is allowed and manage tab count
async function checkTabPermissions(tab) {
  const { allowedDomains, maxTabs } = await chrome.storage.sync.get(['allowedDomains', 'maxTabs']);
  
  // Skip checking for chrome:// and about: pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    return;
  }

  // Get the domain from the URL
  const url = new URL(tab.url);
  const domain = url.hostname;

  // Check if domain is allowed
  if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
    chrome.tabs.remove(tab.id);
    return;
  }

  // Check total number of tabs
  const tabs = await chrome.tabs.query({});
  if (tabs.length > maxTabs) {
    // Close the newly created tab
    chrome.tabs.remove(tab.id);
    
    // Show alert in the active tab
    const activeTab = tabs.find(t => t.active);
    if (activeTab) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          alert(`Maximum tab limit (${maxTabs}) reached! Please close some tabs before opening new ones.`);
        }
      });
    }
  }
} 