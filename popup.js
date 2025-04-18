// Update the popup with current settings
function updatePopup() {
  chrome.storage.sync.get(['maxTabs', 'allowedDomains'], function(data) {
    document.getElementById('maxTabs').textContent = data.maxTabs || 10;
    document.getElementById('domainCount').textContent = (data.allowedDomains || []).length;
  });
}

// Open options page when button is clicked
document.getElementById('optionsButton').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

// Update popup when it opens
updatePopup(); 