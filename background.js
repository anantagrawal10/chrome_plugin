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
  
  // Skip checking for chrome:// pages
  if (tab.url.startsWith('chrome://')) {
    return;
  }

  // Check total number of tabs first
  const tabs = await chrome.tabs.query({});
  const totalTabs = tabs.length;
  
  // Only check tab limit if we have a valid maxTabs value
  if (maxTabs && totalTabs > maxTabs) {
    // Close the newly created tab
    chrome.tabs.remove(tab.id);
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Tab Limit Reached',
      message: `Maximum tab limit (${maxTabs}) reached! Please close some tabs before opening new ones.`,
      priority: 2
    });
    return;
  }

  // Always allow new tab URLs
  if (tab.url === 'about:newtab' || tab.url === 'about:blank') {
    return;
  }

  // Get the domain from the URL
  let domain = '';
  try {
    const url = new URL(tab.url);
    domain = url.hostname.toLowerCase().replace('www.', '');
  } catch (e) {
    return; // Skip invalid URLs
  }

  // Check if domain is allowed
  if (allowedDomains.length > 0) {
    // Normalize all domains in the allowed list
    const normalizedAllowedDomains = allowedDomains.map(d => d.toLowerCase().replace('www.', ''));
    
    if (!normalizedAllowedDomains.includes(domain)) {
      chrome.tabs.remove(tab.id);
      return;
    }
  }
} 