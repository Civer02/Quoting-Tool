// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if app is configured
    const configured = localStorage.getItem('appConfigured');
    if (configured !== 'true') {
        window.location.href = 'config.html';
        return;
    }
    
    // Load cloud storage settings
    if (appConfig) {
        cloudStoragePath = appConfig.cloudStoragePath || '';
        autoSync = appConfig.autoSync !== false;
    }
    
    // Load parts library (from cloud or local)
    partsLibrary = await loadPartsLibrary();
    
    initializeApp();
});

// Global variables
let appConfig = loadAppConfig();
let cloudStoragePath = appConfig?.cloudStoragePath || '';
let autoSync = appConfig?.autoSync !== false; // Default to true
let cloudFileHandle = null; // For File System Access API
let partsLibrary = []; // Will be loaded asynchronously
let lineItemCounter = 0;
let laborCategoryCounter = 0;

// Load app configuration
function loadAppConfig() {
    const stored = localStorage.getItem('appConfig');
    return stored ? JSON.parse(stored) : null;
}

// Apply color scheme
function applyColorScheme() {
    if (!appConfig || !appConfig.colorScheme) return;
    
    const colorSchemes = {
        purple: { primary: '#667eea', secondary: '#764ba2' },
        blue: { primary: '#4facfe', secondary: '#00f2fe' },
        green: { primary: '#43e97b', secondary: '#38f9d7' },
        red: { primary: '#fa709a', secondary: '#fee140' },
        orange: { primary: '#fad961', secondary: '#f76b1c' },
        teal: { primary: '#30cfd0', secondary: '#330867' },
        navy: { primary: '#1e3c72', secondary: '#2a5298' },
        burgundy: { primary: '#eb3349', secondary: '#f45c43' }
    };
    
    const colors = colorSchemes[appConfig.colorScheme] || colorSchemes.purple;
    const style = document.createElement('style');
    style.textContent = `
        header { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important; }
        .form-section h2 { color: ${colors.primary} !important; border-bottom-color: ${colors.primary} !important; }
        .btn-primary { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important; }
        .summary-section { border-color: ${colors.primary} !important; }
        .summary-item { border-left-color: ${colors.primary} !important; }
        .summary-item.grand-total { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important; }
    `;
    document.head.appendChild(style);
}

// Initialize the application
function initializeApp() {
    // Apply color scheme
    applyColorScheme();
    
    // Load configuration and populate company info
    if (appConfig) {
        document.getElementById('companyName').value = appConfig.companyName || '';
        document.getElementById('companyAddress').value = appConfig.companyAddress || '';
        document.getElementById('companyPhone').value = appConfig.companyPhone || '';
        document.getElementById('companyEmail').value = appConfig.companyEmail || '';
        document.getElementById('companyWebsite').value = appConfig.companyWebsite || '';
        
        // Display logo if available
        if (appConfig.logoData) {
            const logoImg = document.getElementById('logoImage');
            logoImg.src = appConfig.logoData;
            logoImg.style.display = 'block';
        }
    }
    
    // Set default quote date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;

    // Generate default quote number
    if (!document.getElementById('quoteNumber').value) {
        document.getElementById('quoteNumber').value = generateQuoteNumber();
    }

    // Event listeners
    document.getElementById('addCustomSection').addEventListener('click', addCustomSection);
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    document.getElementById('clearForm').addEventListener('click', clearForm);
    document.getElementById('saveDraft').addEventListener('click', saveDraft);
    document.getElementById('loadDraft').addEventListener('click', loadDraft);
    document.getElementById('showPartsLibrary').addEventListener('click', showPartsLibrary);
    document.getElementById('closePartsLibrary').addEventListener('click', closePartsLibrary);
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('partsLibraryModal');
        if (event.target === modal) {
            closePartsLibrary();
        }
    }

    // Close modal with X button
    document.querySelector('.close').addEventListener('click', closePartsLibrary);

    // Set default values for initial labor category if config exists
    if (appConfig) {
        const initialMarkup = document.querySelector('.parts-markup');
        const initialLaborRate = document.querySelector('.labor-rate');
        if (initialMarkup && appConfig.defaultMarkup) {
            initialMarkup.value = appConfig.defaultMarkup;
        }
        if (initialLaborRate && appConfig.defaultLaborRate) {
            initialLaborRate.value = appConfig.defaultLaborRate;
        }
    }
    
    // Initialize with default section if none exist
    if (document.getElementById('customSectionsContainer').children.length === 0) {
        addCustomSection();
    }
    
    // Initialize calculations
    updateCalculations();
}

// Cloud Storage Functions - File-based storage that syncs via cloud
async function loadPartsLibrary() {
    // Try to load from cloud file first
    if (cloudStoragePath && autoSync) {
        try {
            const cloudData = await loadFromCloudFile();
            if (cloudData && cloudData.partsLibrary) {
                return cloudData.partsLibrary;
            }
        } catch (e) {
            console.log('Could not load from cloud file, using local storage:', e);
        }
    }
    
    // Fallback to localStorage
    const storedLocal = localStorage.getItem('partsLibrary');
    return storedLocal ? JSON.parse(storedLocal) : [];
}

async function savePartsLibrary() {
    // Always save to localStorage as backup
    localStorage.setItem('partsLibrary', JSON.stringify(partsLibrary));
    
    // Also save to cloud file if enabled
    if (autoSync) {
        try {
            await saveToCloudFile();
        } catch (e) {
            console.log('Could not save to cloud file:', e);
            // Still works - data is in localStorage
        }
    }
}

// Cloud file operations
async function loadFromCloudFile() {
    if (!cloudStoragePath) return null;
    
    try {
        // Try File System Access API (Chrome, Edge)
        if ('showOpenFilePicker' in window) {
            if (!cloudFileHandle) {
                // Request file access
                const [handle] = await window.showOpenFilePicker({
                    suggestedName: 'quoting-tool-data.json',
                    types: [{
                        description: 'JSON files',
                        accept: { 'application/json': ['.json'] }
                    }],
                    startIn: 'documents'
                });
                cloudFileHandle = handle;
            }
            
            const file = await cloudFileHandle.getFile();
            const text = await file.text();
            return JSON.parse(text);
        } else {
            // Fallback: Try to read from localStorage path reference
            const filePath = localStorage.getItem('cloudFilePath');
            if (filePath) {
                // For now, we'll use export/import functionality
                // User can manually sync the file
                return null;
            }
        }
    } catch (e) {
        console.log('File access error:', e);
        return null;
    }
}

async function saveToCloudFile(customData = null) {
    if (!cloudStoragePath) return;
    
    const data = customData || {
        partsLibrary: partsLibrary,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Try File System Access API
        if ('showSaveFilePicker' in window) {
            let fileHandle = cloudFileHandle;
            
            if (!fileHandle) {
                // Create new file
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'quoting-tool-data.json',
                    types: [{
                        description: 'JSON files',
                        accept: { 'application/json': ['.json'] }
                    }],
                    startIn: 'documents'
                });
                cloudFileHandle = fileHandle;
            }
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            
            // Store file handle reference
            localStorage.setItem('cloudFileHandle', JSON.stringify({ name: fileHandle.name }));
        } else {
            // Fallback: Download file for manual cloud sync
            downloadDataFile(data, 'quoting-tool-data.json');
        }
    } catch (e) {
        console.log('File save error:', e);
        // Fallback to download
        downloadDataFile(data, 'quoting-tool-data.json');
    }
}

function downloadDataFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export/Import functions for manual cloud sync
function exportData() {
    const data = {
        partsLibrary: partsLibrary,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
    };
    downloadDataFile(data, `quoting-tool-data-${new Date().toISOString().split('T')[0]}.json`);
    alert('Data exported! Save this file to your cloud storage folder to sync across devices.');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.partsLibrary) {
                partsLibrary = data.partsLibrary;
                await savePartsLibrary();
                alert('Data imported successfully!');
                location.reload();
            } else {
                alert('Invalid data file.');
            }
        }
    };
    input.click();
}

async function addToPartsLibrary(partNumber, description, price) {
    // Check if part already exists
    const existingIndex = partsLibrary.findIndex(p => p.partNumber.toLowerCase() === partNumber.toLowerCase());
    
    if (existingIndex >= 0) {
        // Update existing part
        partsLibrary[existingIndex] = { partNumber, description, price: parseFloat(price) };
    } else {
        // Add new part
        partsLibrary.push({ partNumber, description, price: parseFloat(price) });
    }
    
    await savePartsLibrary();
}

async function removeFromPartsLibrary(partNumber) {
    partsLibrary = partsLibrary.filter(p => p.partNumber !== partNumber);
    await savePartsLibrary();
    showPartsLibrary();
}

// Custom Sections System
let sectionCounter = 0;

function addCustomSection() {
    sectionCounter++;
    const container = document.getElementById('customSectionsContainer');
    const sectionId = `section-${sectionCounter}`;
    const section = document.createElement('div');
    section.className = 'custom-section';
    section.dataset.sectionId = sectionId;
    section.innerHTML = `
        <div class="section-header" style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
            <div class="form-row">
                <div class="form-group" style="flex: 2;">
                    <label>Section Name</label>
                    <input type="text" class="section-name" placeholder="e.g., Parts, Labor, Materials" value="Section ${sectionCounter}">
                </div>
                <div class="form-group" style="flex: 2;">
                    <label>Pricing Type</label>
                    <select class="section-pricing-type" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px;">
                        <option value="parts-markup">Parts with Markup</option>
                        <option value="labor">Labor (Hourly)</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="parts-only">Parts Only (No Markup)</option>
                    </select>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Markup %</label>
                    <input type="number" class="section-markup" step="0.1" min="0" value="${appConfig?.defaultMarkup || 0}" placeholder="0" style="display: none;">
                    <input type="number" class="section-markup" step="0.1" min="0" value="${appConfig?.defaultMarkup || 0}" placeholder="0">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Section Total</label>
                    <input type="text" class="section-total" readonly value="$0.00" style="font-weight: bold;">
                </div>
                <div class="form-group" style="flex: 0.5;">
                    <label>&nbsp;</label>
                    <button type="button" class="btn-remove" onclick="removeCustomSection(this)">Remove Section</button>
                </div>
            </div>
        </div>
        <div class="section-line-items" id="lineItems-${sectionId}">
            <!-- Line items will be added here -->
        </div>
        <button type="button" class="btn-secondary add-line-item-btn" onclick="addLineItemToSection('${sectionId}')" style="margin-bottom: 20px;">+ Add Line Item</button>
    `;
    container.appendChild(section);
    
    // Add event listeners
    const pricingTypeSelect = section.querySelector('.section-pricing-type');
    const markupInput = section.querySelectorAll('.section-markup')[1];
    
    pricingTypeSelect.addEventListener('change', function() {
        const type = this.value;
        if (type === 'parts-markup' || type === 'parts-only') {
            markupInput.style.display = 'block';
            markupInput.previousElementSibling.style.display = 'block';
        } else {
            markupInput.style.display = 'none';
            markupInput.previousElementSibling.style.display = 'none';
        }
        updateCalculations();
    });
    
    markupInput.addEventListener('input', updateCalculations);
    
    // Add initial line item
    addLineItemToSection(sectionId);
    updateCalculations();
}

function removeCustomSection(button) {
    if (confirm('Remove this section and all its line items?')) {
        button.closest('.custom-section').remove();
        updateCalculations();
    }
}

function addLineItemToSection(sectionId) {
    lineItemCounter++;
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    const container = section.querySelector('.section-line-items');
    const newItem = document.createElement('div');
    newItem.className = 'line-item';
    newItem.innerHTML = `
        <div class="form-row" style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
            <div class="form-group">
                <label>Part Number / Item</label>
                <input type="text" class="part-number" placeholder="Enter or select from library" data-index="${lineItemCounter}">
                <div class="parts-autocomplete" id="autocomplete-${lineItemCounter}"></div>
            </div>
            <div class="form-group" style="flex: 2;">
                <label>Description</label>
                <input type="text" class="part-description" placeholder="Auto-filled from library">
            </div>
            <div class="form-group">
                <label>Unit Price ($)</label>
                <input type="number" class="part-price" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="part-quantity" step="1" min="1" value="1">
            </div>
            <div class="form-group">
                <label>Total</label>
                <input type="text" class="part-total" readonly value="$0.00" style="font-weight: bold;">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeLineItem(this)">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
    
    // Add event listeners
    const partNumberInput = newItem.querySelector('.part-number');
    const descriptionInput = newItem.querySelector('.part-description');
    const priceInput = newItem.querySelector('.part-price');
    const quantityInput = newItem.querySelector('.part-quantity');
    
    partNumberInput.addEventListener('input', function() {
        handlePartNumberInput(this, descriptionInput, priceInput);
    });
    
    partNumberInput.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(this.dataset.index), 200);
    });
    
    priceInput.addEventListener('input', calculateLineItemTotal);
    quantityInput.addEventListener('input', calculateLineItemTotal);
    
    partNumberInput.addEventListener('blur', function() {
        if (this.value && priceInput.value && descriptionInput.value) {
            addToPartsLibrary(this.value, descriptionInput.value, priceInput.value);
        }
    });
    
    updateCalculations();
}

// Old Line Item Functions (kept for compatibility, but will be replaced)
function addLineItem() {
    lineItemCounter++;
    const container = document.getElementById('lineItemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'line-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Part Number</label>
                <input type="text" class="part-number" placeholder="Enter or select from library" data-index="${lineItemCounter}">
                <div class="parts-autocomplete" id="autocomplete-${lineItemCounter}"></div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="part-description" placeholder="Auto-filled from library">
            </div>
            <div class="form-group">
                <label>Unit Price ($)</label>
                <input type="number" class="part-price" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="part-quantity" step="1" min="1" value="1">
            </div>
            <div class="form-group">
                <label>Total</label>
                <input type="text" class="part-total" readonly value="$0.00">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeLineItem(this)">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
    
    // Add event listeners to new line item
    const partNumberInput = newItem.querySelector('.part-number');
    const descriptionInput = newItem.querySelector('.part-description');
    const priceInput = newItem.querySelector('.part-price');
    const quantityInput = newItem.querySelector('.part-quantity');
    
    partNumberInput.addEventListener('input', function() {
        handlePartNumberInput(this, descriptionInput, priceInput);
    });
    
    partNumberInput.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(this.dataset.index), 200);
    });
    
    priceInput.addEventListener('input', calculateLineItemTotal);
    quantityInput.addEventListener('input', calculateLineItemTotal);
    
    // Save to library when part number is entered for the first time
    partNumberInput.addEventListener('blur', function() {
        if (this.value && priceInput.value && descriptionInput.value) {
            addToPartsLibrary(this.value, descriptionInput.value, priceInput.value);
        }
    });
}

function removeLineItem(button) {
    button.closest('.line-item').remove();
    updateCalculations();
}

function handlePartNumberInput(input, descriptionInput, priceInput) {
    const searchTerm = input.value.toLowerCase();
    const autocompleteDiv = document.getElementById(`autocomplete-${input.dataset.index}`);
    
    if (searchTerm.length === 0) {
        hideAutocomplete(input.dataset.index);
        return;
    }
    
    // Search parts library
    const matches = partsLibrary.filter(p => 
        p.partNumber.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    );
    
    if (matches.length > 0) {
        showAutocomplete(input.dataset.index, matches, descriptionInput, priceInput, input);
    } else {
        hideAutocomplete(input.dataset.index);
    }
}

function showAutocomplete(index, matches, descriptionInput, priceInput, partNumberInput) {
    const autocompleteDiv = document.getElementById(`autocomplete-${index}`);
    autocompleteDiv.innerHTML = '';
    
    matches.forEach(part => {
        const item = document.createElement('div');
        item.className = 'parts-autocomplete-item';
        item.innerHTML = `<strong>${part.partNumber}</strong> - ${part.description} ($${part.price.toFixed(2)})`;
        item.addEventListener('click', function() {
            partNumberInput.value = part.partNumber;
            descriptionInput.value = part.description;
            priceInput.value = part.price;
            calculateLineItemTotal();
            hideAutocomplete(index);
        });
        autocompleteDiv.appendChild(item);
    });
    
    autocompleteDiv.style.display = 'block';
}

function hideAutocomplete(index) {
    const autocompleteDiv = document.getElementById(`autocomplete-${index}`);
    if (autocompleteDiv) {
        autocompleteDiv.style.display = 'none';
    }
}

function calculateLineItemTotal() {
    // Calculate totals for all line items across all sections
    document.querySelectorAll('.custom-section').forEach(section => {
        const lineItems = section.querySelectorAll('.line-item');
        lineItems.forEach(item => {
            const price = parseFloat(item.querySelector('.part-price').value) || 0;
            const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
            const total = price * quantity;
            item.querySelector('.part-total').value = `$${total.toFixed(2)}`;
        });
    });
    updateCalculations();
}

// Labor Category Functions
function addLaborCategory() {
    laborCategoryCounter++;
    const container = document.getElementById('laborCategoriesContainer');
    const defaultMarkup = appConfig?.defaultMarkup || 0;
    const defaultLaborRate = appConfig?.defaultLaborRate || 0;
    const newCategory = document.createElement('div');
    newCategory.className = 'labor-category';
    newCategory.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Category Name</label>
                <input type="text" class="category-name" placeholder="e.g., Electrical" value="Electrical">
            </div>
            <div class="form-group">
                <label>Parts Markup (%)</label>
                <input type="number" class="parts-markup" step="0.1" min="0" value="${defaultMarkup}" placeholder="0">
            </div>
            <div class="form-group">
                <label>Hourly Labor Rate ($/hr)</label>
                <input type="number" class="labor-rate" step="0.01" min="0" value="${defaultLaborRate}" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Estimated Hours</label>
                <input type="number" class="labor-hours" step="0.25" min="0" value="0" placeholder="0">
            </div>
            <div class="form-group">
                <label>Labor Total</label>
                <input type="text" class="labor-total" readonly value="$0.00">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeLaborCategory(this)">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(newCategory);
    
    // Add event listeners
    const inputs = newCategory.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateCalculations);
    });
}

function removeLaborCategory(button) {
    button.closest('.labor-category').remove();
    updateCalculations();
}

// Calculation Functions - Updated for Custom Sections
function updateCalculations() {
    calculateLineItemTotal();
    
    let grandTotal = 0;
    
    // Calculate each section's total based on its pricing type
    document.querySelectorAll('.custom-section').forEach(section => {
        const pricingType = section.querySelector('.section-pricing-type').value;
        const markupPercent = parseFloat(section.querySelector('.section-markup').value) || 0;
        const sectionTotalInput = section.querySelector('.section-total');
        
        // Calculate base subtotal for this section
        let sectionSubtotal = 0;
        section.querySelectorAll('.line-item').forEach(item => {
            const price = parseFloat(item.querySelector('.part-price').value) || 0;
            const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
            sectionSubtotal += price * quantity;
        });
        
        let sectionTotal = 0;
        
        // Apply pricing type logic
        switch(pricingType) {
            case 'parts-markup':
                // Parts with markup applied
                sectionTotal = sectionSubtotal * (1 + markupPercent / 100);
                break;
            case 'labor':
                // Labor: sum of all line items (treated as hours * rate)
                sectionTotal = sectionSubtotal;
                break;
            case 'fixed':
                // Fixed price: just the sum
                sectionTotal = sectionSubtotal;
                break;
            case 'parts-only':
                // Parts only: no markup
                sectionTotal = sectionSubtotal;
                break;
            default:
                sectionTotal = sectionSubtotal;
        }
        
        // Update section total display
        sectionTotalInput.value = `$${sectionTotal.toFixed(2)}`;
        grandTotal += sectionTotal;
    });
    
    // Update grand total
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

// PDF Generation
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get form data
    const companyName = document.getElementById('companyName').value || 'Company Name';
    const companyLogoData = appConfig?.logoData || null; // Get logo from config
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyWebsite = document.getElementById('companyWebsite').value;
    
    const customerName = document.getElementById('customerName').value || 'Customer Name';
    const customerAddress = document.getElementById('customerAddress').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    
    const quoteNumber = document.getElementById('quoteNumber').value || 'N/A';
    const quoteDate = document.getElementById('quoteDate').value || new Date().toISOString().split('T')[0];
    
    const quoteNotes = document.getElementById('quoteNotes').value;
    const termsAndConditions = document.getElementById('termsAndConditions').value;
    
    // Header with Logo
    let yPos = 20;
    
    // Add logo if available
    if (companyLogoData) {
        try {
            doc.addImage(companyLogoData, 'PNG', 150, yPos, 40, 20);
            yPos += 25;
        } catch (e) {
            console.log('Error adding logo to PDF:', e);
            yPos = 25;
        }
    } else {
        yPos = 25;
    }
    
    // Quote Title
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('QUOTE', 20, yPos);
    
    // Company Information (Right side)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let companyYPos = companyLogoData ? 45 : 25;
    
    if (companyName) {
        doc.setFont(undefined, 'bold');
        doc.text(companyName, 150, companyYPos);
        companyYPos += 7;
    }
    
    doc.setFont(undefined, 'normal');
    if (companyAddress) {
        const addressLines = doc.splitTextToSize(companyAddress, 50);
        addressLines.forEach(line => {
            doc.text(line, 150, companyYPos);
            companyYPos += 6;
        });
    }
    
    if (companyPhone) {
        doc.text(`Phone: ${companyPhone}`, 150, companyYPos);
        companyYPos += 6;
    }
    if (companyEmail) {
        doc.text(`Email: ${companyEmail}`, 150, companyYPos);
        companyYPos += 6;
    }
    if (companyWebsite) {
        doc.text(`Website: ${companyWebsite}`, 150, companyYPos);
        companyYPos += 6;
    }
    
    // Quote Information
    yPos = 50;
    doc.setFont(undefined, 'bold');
    doc.text('Quote To:', 20, yPos);
    yPos += 7;
    
    doc.setFont(undefined, 'normal');
    if (customerName) {
        doc.text(customerName, 20, yPos);
        yPos += 6;
    }
    if (customerAddress) {
        const addressLines = doc.splitTextToSize(customerAddress, 80);
        addressLines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 6;
        });
    }
    if (customerPhone) {
        doc.text(`Phone: ${customerPhone}`, 20, yPos);
        yPos += 6;
    }
    if (customerEmail) {
        doc.text(`Email: ${customerEmail}`, 20, yPos);
        yPos += 6;
    }
    
    // Quote Details
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`Quote Number: ${quoteNumber}`, 20, yPos);
    yPos += 6;
    doc.text(`Quote Date: ${formatDate(quoteDate)}`, 20, yPos);
    yPos += 10;
    
    // Custom Sections - Loop through each section
    let grandTotal = 0;
    
    document.querySelectorAll('.custom-section').forEach(section => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        const sectionName = section.querySelector('.section-name').value || 'Section';
        const pricingType = section.querySelector('.section-pricing-type').value;
        const markupPercent = parseFloat(section.querySelector('.section-markup').value) || 0;
        
        // Section Header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(sectionName, 20, yPos);
        yPos += 8;
        
        // Table Header (no unit price column)
        doc.setFontSize(10);
        doc.text('Item', 20, yPos);
        doc.text('Description', 60, yPos);
        doc.text('Qty', 140, yPos);
        doc.text('Total', 160, yPos);
        
        yPos += 6;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 5;
        
        doc.setFont(undefined, 'normal');
        let sectionSubtotal = 0;
        
        // Process line items in this section
        section.querySelectorAll('.line-item').forEach(item => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
                // Redraw header
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                doc.text('Item', 20, yPos);
                doc.text('Description', 60, yPos);
                doc.text('Qty', 140, yPos);
                doc.text('Total', 160, yPos);
                yPos += 6;
                doc.setFont(undefined, 'normal');
            }
            
            const partNumber = item.querySelector('.part-number').value || '';
            const description = item.querySelector('.part-description').value || '';
            const price = parseFloat(item.querySelector('.part-price').value) || 0;
            const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
            const baseTotal = price * quantity;
            sectionSubtotal += baseTotal;
            
            // Apply markup if pricing type is parts-markup
            let finalTotal = baseTotal;
            if (pricingType === 'parts-markup' && markupPercent > 0) {
                finalTotal = baseTotal * (1 + markupPercent / 100);
            }
            
            const descLines = doc.splitTextToSize(description, 70);
            const partLines = doc.splitTextToSize(partNumber, 30);
            const maxLines = Math.max(descLines.length, partLines.length);
            
            // Show item (no unit price, only final total)
            doc.text(partNumber || 'Item', 20, yPos);
            doc.text(descLines[0] || '', 60, yPos);
            doc.text(quantity.toString(), 140, yPos);
            doc.text(`$${finalTotal.toFixed(2)}`, 160, yPos);
            
            if (maxLines > 1) {
                for (let i = 1; i < maxLines; i++) {
                    yPos += 5;
                    if (descLines[i]) doc.text(descLines[i], 60, yPos);
                }
            }
            
            yPos += 8;
        });
        
        // Calculate section total based on pricing type
        let sectionTotal = sectionSubtotal;
        if (pricingType === 'parts-markup' && markupPercent > 0) {
            sectionTotal = sectionSubtotal * (1 + markupPercent / 100);
        }
        
        // Section total
        if (section.querySelectorAll('.line-item').length > 0) {
            yPos += 3;
            doc.setLineWidth(0.3);
            doc.line(20, yPos, 190, yPos);
            yPos += 6;
            doc.setFont(undefined, 'bold');
            doc.text(`${sectionName} Total:`, 120, yPos);
            doc.text(`$${sectionTotal.toFixed(2)}`, 160, yPos);
            yPos += 10;
        }
        
        grandTotal += sectionTotal;
    });
    
    // Summary Section
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('QUOTE SUMMARY', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    const primaryColor = appConfig?.colorScheme ? getColorScheme(appConfig.colorScheme).primary : '#667eea';
    const rgb = hexToRgb(primaryColor);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFont(undefined, 'bold');
    doc.text('GRAND TOTAL:', 20, yPos);
    doc.text(`$${grandTotal.toFixed(2)}`, 160, yPos);
    
    // Notes
    if (quoteNotes) {
        yPos += 15;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Notes / Scope Description:', 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        const noteLines = doc.splitTextToSize(quoteNotes, 170);
        noteLines.forEach(line => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += 6;
        });
    }
    
    // Terms and Conditions
    if (termsAndConditions) {
        yPos += 15;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Terms and Conditions:', 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        const termsLines = doc.splitTextToSize(termsAndConditions, 170);
        termsLines.forEach(line => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += 6;
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 100, 285, { align: 'center' });
    }
    
    // Save PDF
    const fileName = `Quote_${quoteNumber}_${formatDate(quoteDate).replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getColorScheme(schemeName) {
    const colorSchemes = {
        purple: { primary: '#667eea', secondary: '#764ba2' },
        blue: { primary: '#4facfe', secondary: '#00f2fe' },
        green: { primary: '#43e97b', secondary: '#38f9d7' },
        red: { primary: '#fa709a', secondary: '#fee140' },
        orange: { primary: '#fad961', secondary: '#f76b1c' },
        teal: { primary: '#30cfd0', secondary: '#330867' },
        navy: { primary: '#1e3c72', secondary: '#2a5298' },
        burgundy: { primary: '#eb3349', secondary: '#f45c43' }
    };
    return colorSchemes[schemeName] || colorSchemes.purple;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 102, g: 126, b: 234 };
}

function generateQuoteNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${year}${month}${day}-${random}`;
}

// Form Management
function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.querySelector('form')?.reset();
        document.getElementById('lineItemsContainer').innerHTML = '';
        document.getElementById('laborCategoriesContainer').innerHTML = '';
        document.getElementById('quoteDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('quoteNumber').value = generateQuoteNumber();
        addLineItem();
        addLaborCategory();
        updateCalculations();
    }
}

async function saveDraft() {
    const draft = {
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyEmail: document.getElementById('companyEmail').value,
        companyWebsite: document.getElementById('companyWebsite').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        quoteNumber: document.getElementById('quoteNumber').value,
        quoteDate: document.getElementById('quoteDate').value,
        quoteNotes: document.getElementById('quoteNotes').value,
        termsAndConditions: document.getElementById('termsAndConditions').value,
        customSections: []
    };
    
    // Save custom sections
    document.querySelectorAll('.custom-section').forEach(section => {
        const sectionData = {
            sectionName: section.querySelector('.section-name').value,
            pricingType: section.querySelector('.section-pricing-type').value,
            markup: section.querySelector('.section-markup').value,
            lineItems: []
        };
        
        section.querySelectorAll('.line-item').forEach(item => {
            sectionData.lineItems.push({
                partNumber: item.querySelector('.part-number').value,
                description: item.querySelector('.part-description').value,
                price: item.querySelector('.part-price').value,
                quantity: item.querySelector('.part-quantity').value
            });
        });
        
        draft.customSections.push(sectionData);
    });
    
    localStorage.setItem('quoteDraft', JSON.stringify(draft));
    
    // Also save to cloud if enabled
    if (autoSync) {
        try {
            await saveDraftToCloud(draft);
        } catch (e) {
            console.log('Could not save draft to cloud:', e);
        }
    }
    
    alert('Draft saved successfully!');
}

async function saveDraftToCloud(draft) {
    const data = {
        partsLibrary: partsLibrary,
        draft: draft,
        lastUpdated: new Date().toISOString()
    };
    await saveToCloudFile(data);
}

function loadDraft() {
    const draft = localStorage.getItem('quoteDraft');
    if (!draft) {
        alert('No saved draft found.');
        return;
    }
    
    if (confirm('Load saved draft? This will replace current form data.')) {
        const data = JSON.parse(draft);
        
        document.getElementById('companyName').value = data.companyName || '';
        document.getElementById('companyLogo').value = data.companyLogo || '';
        document.getElementById('companyAddress').value = data.companyAddress || '';
        document.getElementById('companyPhone').value = data.companyPhone || '';
        document.getElementById('companyEmail').value = data.companyEmail || '';
        document.getElementById('companyWebsite').value = data.companyWebsite || '';
        document.getElementById('customerName').value = data.customerName || '';
        document.getElementById('customerAddress').value = data.customerAddress || '';
        document.getElementById('customerPhone').value = data.customerPhone || '';
        document.getElementById('customerEmail').value = data.customerEmail || '';
        document.getElementById('quoteNumber').value = data.quoteNumber || generateQuoteNumber();
        document.getElementById('quoteDate').value = data.quoteDate || new Date().toISOString().split('T')[0];
        document.getElementById('quoteNotes').value = data.quoteNotes || '';
        document.getElementById('termsAndConditions').value = data.termsAndConditions || '';
        
        // Clear existing sections
        document.getElementById('customSectionsContainer').innerHTML = '';
        
        // Load custom sections (new format)
        if (data.customSections && data.customSections.length > 0) {
            data.customSections.forEach(sectionData => {
                addCustomSection();
                const lastSection = document.querySelector('.custom-section:last-child');
                lastSection.querySelector('.section-name').value = sectionData.sectionName || '';
                lastSection.querySelector('.section-pricing-type').value = sectionData.pricingType || 'parts-markup';
                lastSection.querySelector('.section-markup').value = sectionData.markup || '0';
                
                // Trigger change event to show/hide markup field
                lastSection.querySelector('.section-pricing-type').dispatchEvent(new Event('change'));
                
                // Clear initial line item and add saved ones
                lastSection.querySelector('.section-line-items').innerHTML = '';
                sectionData.lineItems.forEach(itemData => {
                    const sectionId = lastSection.dataset.sectionId;
                    addLineItemToSection(sectionId);
                    const lastItem = lastSection.querySelector('.line-item:last-child');
                    lastItem.querySelector('.part-number').value = itemData.partNumber || '';
                    lastItem.querySelector('.part-description').value = itemData.description || '';
                    lastItem.querySelector('.part-price').value = itemData.price || '';
                    lastItem.querySelector('.part-quantity').value = itemData.quantity || '1';
                });
            });
        } else if (data.lineItems) {
            // Legacy format - convert to single section
            addCustomSection();
            const lastSection = document.querySelector('.custom-section:last-child');
            lastSection.querySelector('.section-name').value = 'Parts';
            data.lineItems.forEach(itemData => {
                const sectionId = lastSection.dataset.sectionId;
                addLineItemToSection(sectionId);
                const lastItem = lastSection.querySelector('.line-item:last-child');
                lastItem.querySelector('.part-number').value = itemData.partNumber || '';
                lastItem.querySelector('.part-description').value = itemData.description || '';
                lastItem.querySelector('.part-price').value = itemData.price || '';
                lastItem.querySelector('.part-quantity').value = itemData.quantity || '1';
            });
        }
        
        updateCalculations();
    }
}

// Parts Library Modal
function showPartsLibrary() {
    const modal = document.getElementById('partsLibraryModal');
    const listDiv = document.getElementById('partsLibraryList');
    
    listDiv.innerHTML = '';
    
    if (partsLibrary.length === 0) {
        listDiv.innerHTML = '<p>No parts in library yet. Add parts by entering part numbers in line items.</p>';
    } else {
        partsLibrary.forEach(part => {
            const item = document.createElement('div');
            item.className = 'part-library-item';
            item.innerHTML = `
                <div class="part-library-item-info">
                    <strong>${part.partNumber}</strong>
                    <div>${part.description}</div>
                    <div>$${part.price.toFixed(2)}</div>
                </div>
                <div class="part-library-item-actions">
                    <button class="btn-use-part" onclick="usePartFromLibrary('${part.partNumber}')">Use</button>
                    <button class="btn-delete-part" onclick="deletePartFromLibrary('${part.partNumber}')">Delete</button>
                </div>
            `;
            listDiv.appendChild(item);
        });
    }
    
    modal.style.display = 'block';
}

function closePartsLibrary() {
    document.getElementById('partsLibraryModal').style.display = 'none';
}

function usePartFromLibrary(partNumber) {
    const part = partsLibrary.find(p => p.partNumber === partNumber);
    if (part) {
        // Add a new line item with this part
        addLineItem();
        const lastItem = document.querySelector('.line-item:last-child');
        lastItem.querySelector('.part-number').value = part.partNumber;
        lastItem.querySelector('.part-description').value = part.description;
        lastItem.querySelector('.part-price').value = part.price;
        calculateLineItemTotal();
        closePartsLibrary();
    }
}

function deletePartFromLibrary(partNumber) {
    if (confirm(`Delete part "${partNumber}" from library?`)) {
        removeFromPartsLibrary(partNumber);
    }
}


