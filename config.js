// Configuration page script

// Color scheme definitions
const colorSchemes = {
    purple: { primary: '#667eea', secondary: '#764ba2', name: 'Purple' },
    blue: { primary: '#4facfe', secondary: '#00f2fe', name: 'Blue' },
    green: { primary: '#43e97b', secondary: '#38f9d7', name: 'Green' },
    red: { primary: '#fa709a', secondary: '#fee140', name: 'Red' },
    orange: { primary: '#fad961', secondary: '#f76b1c', name: 'Orange' },
    teal: { primary: '#30cfd0', secondary: '#330867', name: 'Teal' },
    navy: { primary: '#1e3c72', secondary: '#2a5298', name: 'Navy' },
    burgundy: { primary: '#eb3349', secondary: '#f45c43', name: 'Burgundy' }
};

// Update color preview
function updateColorPreview() {
    const scheme = document.getElementById('colorScheme').value;
    const colors = colorSchemes[scheme];
    const preview = document.getElementById('colorPreview');
    preview.style.background = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
}

// Handle color scheme change
document.addEventListener('DOMContentLoaded', function() {
    const colorSchemeSelect = document.getElementById('colorScheme');
    if (colorSchemeSelect) {
        colorSchemeSelect.addEventListener('change', updateColorPreview);
        updateColorPreview(); // Initial preview
    }
});

// Handle logo upload preview
document.getElementById('logoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logoPreview');
            const previewImg = document.getElementById('logoPreviewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Handle storage option selection
function selectStorage(storageType) {
    document.querySelectorAll('.storage-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Find the clicked option
    const clickedOption = event ? event.currentTarget : document.querySelector(`[onclick*="selectStorage('${storageType}')"]`);
    if (clickedOption) {
        clickedOption.classList.add('selected');
    }
    
    // Check the radio button
    const radioId = `storage${storageType.charAt(0).toUpperCase() + storageType.slice(1)}`;
    const radio = document.getElementById(radioId);
    if (radio) {
        radio.checked = true;
    }
}

// Handle form submission
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const config = {
        companyName: document.getElementById('configCompanyName').value,
        companyAddress: document.getElementById('configCompanyAddress').value,
        companyPhone: document.getElementById('configCompanyPhone').value,
        companyEmail: document.getElementById('configCompanyEmail').value,
        companyWebsite: document.getElementById('configCompanyWebsite').value,
        cloudStoragePath: document.getElementById('cloudStoragePath').value || '',
        autoSync: document.getElementById('autoSync').checked,
        colorScheme: document.getElementById('colorScheme').value,
        defaultMarkup: parseFloat(document.getElementById('defaultMarkup').value) || 0,
        defaultLaborRate: parseFloat(document.getElementById('defaultLaborRate').value) || 0,
        configured: true
    };
    
    // Handle logo upload
    const logoFile = document.getElementById('logoUpload').files[0];
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            config.logoData = e.target.result; // Base64 encoded image
            config.logoFileName = logoFile.name;
            saveConfiguration(config);
        };
        reader.readAsDataURL(logoFile);
    } else {
        saveConfiguration(config);
    }
});

function saveConfiguration(config) {
    // Save configuration to localStorage (this is always available)
    localStorage.setItem('appConfig', JSON.stringify(config));
    
    // Mark as configured
    localStorage.setItem('appConfigured', 'true');
    
    // Redirect to main app
    window.location.href = 'index.html';
}

// Check if already configured
window.addEventListener('DOMContentLoaded', function() {
    const configured = localStorage.getItem('appConfigured');
    if (configured === 'true') {
        // Optionally redirect to main app or show message
        // For now, allow re-configuration
    }
});

