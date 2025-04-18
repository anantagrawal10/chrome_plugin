// Load saved settings when options page opens
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['maxTabs', 'allowedDomains'], function(data) {
    document.getElementById('maxTabs').value = data.maxTabs || 10;
    document.getElementById('allowedDomains').value = (data.allowedDomains || []).join('\n');
  });
});

// Save settings when form is submitted
document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const maxTabs = parseInt(document.getElementById('maxTabs').value);
  const domainsText = document.getElementById('allowedDomains').value;
  
  // Convert domains text to array, remove empty lines and trim whitespace
  const allowedDomains = domainsText
    .split('\n')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0);
  
  // Save settings
  chrome.storage.sync.set({
    maxTabs: maxTabs,
    allowedDomains: allowedDomains
  }, function() {
    // Show success message
    const button = document.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Saved!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
}); 