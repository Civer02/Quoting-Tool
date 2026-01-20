// Setup Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load existing config if available
    const existingConfig = localStorage.getItem('appConfig');
    if (existingConfig) {
        const config = JSON.parse(existingConfig);
        document.getElementById('companyName').value = config.companyName || '';
        document.getElementById('companyAddress').value = config.companyAddress || '';
        document.getElementById('companyPhone').value = config.companyPhone || '';
        document.getElementById('companyEmail').value = config.companyEmail || '';
        document.getElementById('companyWebsite').value = config.companyWebsite || '';
        document.getElementById('defaultMarkup').value = config.defaultMarkup || 0;
        document.getElementById('defaultLaborRate').value = config.defaultLaborRate || 0;
        
        if (config.logoData) {
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${config.logoData}" alt="Logo" style="max-width: 100%; max-height: 100px;">`;
        }
    }
    
    // Logo upload handler
    document.getElementById('logoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('logoPreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Logo" style="max-width: 100%; max-height: 100px;">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Save setup
    document.getElementById('saveSetup').addEventListener('click', function() {
        const companyName = document.getElementById('companyName').value;
        if (!companyName) {
            alert('Please enter a company name');
            return;
        }
        
        // Get logo data
        let logoData = '';
        const logoUrl = document.getElementById('companyLogo').value;
        const logoFile = document.getElementById('logoUpload').files[0];
        
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                logoData = e.target.result;
                saveConfig(logoData);
            };
            reader.readAsDataURL(logoFile);
        } else if (logoUrl) {
            logoData = logoUrl;
            saveConfig(logoData);
        } else {
            // Check if existing logo
            const existingConfig = localStorage.getItem('appConfig');
            if (existingConfig) {
                const config = JSON.parse(existingConfig);
                logoData = config.logoData || '';
            }
            saveConfig(logoData);
        }
    });
    
    function saveConfig(logoData) {
        const config = {
            companyName: document.getElementById('companyName').value,
            companyAddress: document.getElementById('companyAddress').value,
            companyPhone: document.getElementById('companyPhone').value,
            companyEmail: document.getElementById('companyEmail').value,
            companyWebsite: document.getElementById('companyWebsite').value,
            logoData: logoData,
            defaultMarkup: parseFloat(document.getElementById('defaultMarkup').value) || 0,
            defaultLaborRate: parseFloat(document.getElementById('defaultLaborRate').value) || 0,
            useLocalStorage: document.getElementById('useLocalStorage').checked,
            storageLocation: 'data/' // Default to data folder
        };
        
        localStorage.setItem('appConfig', JSON.stringify(config));
        localStorage.setItem('appConfigured', 'true');
        localStorage.setItem('initialSetupComplete', 'true');
        
        // Initialize storage structure
        initializeStorage();
        
        alert('Setup completed successfully!');
        window.location.href = 'start.html';
    }
    
    function initializeStorage() {
        // Create default equipment file structure if it doesn't exist
        // This will be handled by the storage.js module
        console.log('Storage initialized');
    }
});
