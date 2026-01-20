// Start Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if initial setup is complete
    const setupComplete = localStorage.getItem('initialSetupComplete');
    const setupBanner = document.getElementById('setupBanner');
    
    if (setupComplete !== 'true') {
        setupBanner.style.display = 'block';
    }
    
    // Menu option event listeners
    document.getElementById('quickQuoteOption').addEventListener('click', function() {
        // Check if setup is complete
        if (setupComplete !== 'true') {
            alert('Please complete the initial setup first by selecting "Set Storage Location"');
            return;
        }
        window.location.href = 'quick-quote.html';
    });
    
    document.getElementById('formatQuoteOption').addEventListener('click', function() {
        window.location.href = 'format-quote.html';
    });
    
    document.getElementById('storageLocationOption').addEventListener('click', function() {
        window.location.href = 'setup.html';
    });
});
