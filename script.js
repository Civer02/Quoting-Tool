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
    document.getElementById('addPartLineItem').addEventListener('click', addPartLineItem);
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    document.getElementById('clearForm').addEventListener('click', clearForm);
    document.getElementById('saveDraft').addEventListener('click', saveDraft);
    document.getElementById('loadDraft').addEventListener('click', loadDraft);
    document.getElementById('showPartsLibrary').addEventListener('click', showPartsLibrary);
    document.getElementById('closePartsLibrary').addEventListener('click', closePartsLibrary);
    document.getElementById('showInventoryManager').addEventListener('click', showInventoryManager);
    document.getElementById('closeInventoryBtn').addEventListener('click', closeInventory);
    document.getElementById('closeInventory').addEventListener('click', closeInventory);
    
    // Inventory search
    document.getElementById('inventorySearch').addEventListener('input', function() {
        showInventoryManager();
    });
    
    // Labor hours calculation
    document.getElementById('laborRate').addEventListener('input', updateCalculations);
    document.getElementById('laborHours').addEventListener('input', updateCalculations);
    
    // Parts markup calculation
    document.getElementById('partsMarkup').addEventListener('input', updateCalculations);
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const partsModal = document.getElementById('partsLibraryModal');
        const inventoryModal = document.getElementById('inventoryModal');
        if (event.target === partsModal) {
            closePartsLibrary();
        }
        if (event.target === inventoryModal) {
            closeInventory();
        }
    }

    // Close modal with X button
    document.querySelector('.close').addEventListener('click', closePartsLibrary);

    // Set default values if config exists
    if (appConfig) {
        const partsMarkup = document.getElementById('partsMarkup');
        const laborRate = document.getElementById('laborRate');
        if (partsMarkup && appConfig.defaultMarkup) {
            partsMarkup.value = appConfig.defaultMarkup;
        }
        if (laborRate && appConfig.defaultLaborRate) {
            laborRate.value = appConfig.defaultLaborRate;
        }
    }
    
    // Initialize with one part line item if none exist
    if (document.getElementById('partsLineItemsContainer').children.length === 0) {
        addPartLineItem();
    }
    
    // Initialize calculations
    updateCalculations();
}

// Cloud Storage Functions - File-based storage that syncs via cloud
async function loadPartsLibrary() {
    let library = [];
    
    // Try to load from cloud file first
    if (cloudStoragePath && autoSync) {
        try {
            const cloudData = await loadFromCloudFile();
            if (cloudData && cloudData.partsLibrary) {
                library = cloudData.partsLibrary;
            }
        } catch (e) {
            console.log('Could not load from cloud file, using local storage:', e);
        }
    }
    
    // Fallback to localStorage
    if (library.length === 0) {
        const storedLocal = localStorage.getItem('partsLibrary');
        library = storedLocal ? JSON.parse(storedLocal) : [];
    }
    
    // Migrate old parts (without inventory) to include inventory field
    library = library.map(part => {
        if (part.inventory === undefined) {
            part.inventory = 0;
        }
        return part;
    });
    
    // Save migrated data
    if (library.length > 0 && library.some(p => p.inventory === undefined)) {
        partsLibrary = library;
        await savePartsLibrary();
    }
    
    return library;
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
        // Update existing part (preserve inventory if it exists)
        const existingPart = partsLibrary[existingIndex];
        partsLibrary[existingIndex] = { 
            partNumber, 
            description, 
            price: parseFloat(price),
            inventory: existingPart.inventory !== undefined ? existingPart.inventory : 0
        };
    } else {
        // Add new part with 0 inventory
        partsLibrary.push({ 
            partNumber, 
            description, 
            price: parseFloat(price),
            inventory: 0
        });
    }
    
    await savePartsLibrary();
}

async function removeFromPartsLibrary(partNumber) {
    partsLibrary = partsLibrary.filter(p => p.partNumber !== partNumber);
    await savePartsLibrary();
    showPartsLibrary();
}

// Parts Section Functions
function addPartLineItem() {
    lineItemCounter++;
    const container = document.getElementById('partsLineItemsContainer');
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
    // Calculate totals for all part line items
    const lineItems = document.querySelectorAll('#partsLineItemsContainer .line-item');
    lineItems.forEach(item => {
        const price = parseFloat(item.querySelector('.part-price').value) || 0;
        const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
        const total = price * quantity;
        item.querySelector('.part-total').value = `$${total.toFixed(2)}`;
    });
    updateCalculations();
}


// Calculation Functions
function updateCalculations() {
    calculateLineItemTotal();
    
    // Calculate parts subtotal
    let partsSubtotal = 0;
    document.querySelectorAll('#partsLineItemsContainer .line-item').forEach(item => {
        const price = parseFloat(item.querySelector('.part-price').value) || 0;
        const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
        partsSubtotal += price * quantity;
    });
    
    // Apply parts markup
    const markupPercent = parseFloat(document.getElementById('partsMarkup').value) || 0;
    const partsTotal = partsSubtotal * (1 + markupPercent / 100);
    
    // Calculate labor total
    const laborRate = parseFloat(document.getElementById('laborRate').value) || 0;
    const laborHours = parseFloat(document.getElementById('laborHours').value) || 0;
    const laborTotal = laborRate * laborHours;
    
    // Update labor total display
    document.getElementById('laborTotal').value = `$${laborTotal.toFixed(2)}`;
    
    // Calculate grand total
    const grandTotal = partsTotal + laborTotal;
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

// PDF Generation
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get form data
    const companyName = document.getElementById('companyName').value || 'Company Name';
    const companyLogoData = appConfig?.logoData || null; // Get logo from config
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyWebsite = document.getElementById('companyWebsite').value;
    
    const jobName = document.getElementById('jobName').value || '';
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
    if (jobName) {
        doc.setFont(undefined, 'bold');
        doc.text(`Job: ${jobName}`, 20, yPos);
        yPos += 7;
        doc.setFont(undefined, 'normal');
    }
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
    
    let grandTotal = 0;
    
    // Parts Section
    const partsMarkup = parseFloat(document.getElementById('partsMarkup').value) || 0;
    let partsSubtotal = 0;
    const partsLineItems = document.querySelectorAll('#partsLineItemsContainer .line-item');
    
    if (partsLineItems.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        // Parts Section Header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Parts', 20, yPos);
        yPos += 8;
        
        // Table Header (no prices shown - only total at end)
        doc.setFontSize(10);
        doc.text('Item', 20, yPos);
        doc.text('Description', 60, yPos);
        doc.text('Qty', 150, yPos);
        
        yPos += 6;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 5;
        
        doc.setFont(undefined, 'normal');
        
        // Process parts line items
        partsLineItems.forEach(item => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
                // Redraw header
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                doc.text('Item', 20, yPos);
                doc.text('Description', 60, yPos);
                doc.text('Qty', 150, yPos);
                yPos += 6;
                doc.setFont(undefined, 'normal');
            }
            
            const partNumber = item.querySelector('.part-number').value || '';
            const description = item.querySelector('.part-description').value || '';
            const price = parseFloat(item.querySelector('.part-price').value) || 0;
            const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
            const baseTotal = price * quantity;
            partsSubtotal += baseTotal;
            
            const descLines = doc.splitTextToSize(description, 70);
            const partLines = doc.splitTextToSize(partNumber, 30);
            const maxLines = Math.max(descLines.length, partLines.length);
            
            // Show item (no prices - only description and quantity)
            doc.text(partNumber || 'Item', 20, yPos);
            doc.text(descLines[0] || '', 60, yPos);
            doc.text(quantity.toString(), 150, yPos);
            
            if (maxLines > 1) {
                for (let i = 1; i < maxLines; i++) {
                    yPos += 5;
                    if (descLines[i]) doc.text(descLines[i], 60, yPos);
                }
            }
            
            yPos += 8;
        });
        
        // Parts total with markup (markup is hidden from customer)
        const partsTotal = partsSubtotal * (1 + partsMarkup / 100);
        
        yPos += 3;
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        doc.setFont(undefined, 'bold');
        // Only show final parts total - markup is hidden from customer
        doc.text('Parts Total:', 120, yPos);
        doc.text(`$${partsTotal.toFixed(2)}`, 160, yPos);
        yPos += 10;
        
        grandTotal += partsTotal;
    }
    
    // Labor Hours Section
    const laborRate = parseFloat(document.getElementById('laborRate').value) || 0;
    const laborHours = parseFloat(document.getElementById('laborHours').value) || 0;
    const laborTotal = laborRate * laborHours;
    
    if (laborHours > 0 && laborRate > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Labor Hours', 20, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Hourly Rate: $${laborRate.toFixed(2)}/hr`, 20, yPos);
        yPos += 6;
        doc.text(`Hours: ${laborHours}`, 20, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'bold');
        doc.text('Labor Total:', 120, yPos);
        doc.text(`$${laborTotal.toFixed(2)}`, 160, yPos);
        yPos += 10;
        
        grandTotal += laborTotal;
    }
    
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
    
    // Deduct inventory before saving PDF
    await deductInventoryFromQuote();
    
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
        document.getElementById('partsLineItemsContainer').innerHTML = '';
        document.getElementById('laborRate').value = appConfig?.defaultLaborRate || 0;
        document.getElementById('laborHours').value = 0;
        document.getElementById('partsMarkup').value = appConfig?.defaultMarkup || 0;
        document.getElementById('quoteDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('quoteNumber').value = generateQuoteNumber();
        addPartLineItem();
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
        jobName: document.getElementById('jobName').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        quoteNumber: document.getElementById('quoteNumber').value,
        quoteDate: document.getElementById('quoteDate').value,
        quoteNotes: document.getElementById('quoteNotes').value,
        termsAndConditions: document.getElementById('termsAndConditions').value,
        partsMarkup: document.getElementById('partsMarkup').value,
        laborRate: document.getElementById('laborRate').value,
        laborHours: document.getElementById('laborHours').value,
        parts: []
    };
    
    // Save parts line items
    document.querySelectorAll('#partsLineItemsContainer .line-item').forEach(item => {
        draft.parts.push({
            partNumber: item.querySelector('.part-number').value,
            description: item.querySelector('.part-description').value,
            price: item.querySelector('.part-price').value,
            quantity: item.querySelector('.part-quantity').value
        });
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
        document.getElementById('companyAddress').value = data.companyAddress || '';
        document.getElementById('companyPhone').value = data.companyPhone || '';
        document.getElementById('companyEmail').value = data.companyEmail || '';
        document.getElementById('companyWebsite').value = data.companyWebsite || '';
        document.getElementById('jobName').value = data.jobName || '';
        document.getElementById('customerName').value = data.customerName || '';
        document.getElementById('customerAddress').value = data.customerAddress || '';
        document.getElementById('customerPhone').value = data.customerPhone || '';
        document.getElementById('customerEmail').value = data.customerEmail || '';
        document.getElementById('quoteNumber').value = data.quoteNumber || generateQuoteNumber();
        document.getElementById('quoteDate').value = data.quoteDate || new Date().toISOString().split('T')[0];
        document.getElementById('quoteNotes').value = data.quoteNotes || '';
        document.getElementById('termsAndConditions').value = data.termsAndConditions || '';
        
        // Load parts markup and labor
        if (data.partsMarkup !== undefined) {
            document.getElementById('partsMarkup').value = data.partsMarkup || 0;
        }
        if (data.laborRate !== undefined) {
            document.getElementById('laborRate').value = data.laborRate || 0;
        }
        if (data.laborHours !== undefined) {
            document.getElementById('laborHours').value = data.laborHours || 0;
        }
        
        // Clear existing parts
        document.getElementById('partsLineItemsContainer').innerHTML = '';
        
        // Load parts (new format)
        if (data.parts && data.parts.length > 0) {
            data.parts.forEach(itemData => {
                addPartLineItem();
                const lastItem = document.querySelector('#partsLineItemsContainer .line-item:last-child');
                lastItem.querySelector('.part-number').value = itemData.partNumber || '';
                lastItem.querySelector('.part-description').value = itemData.description || '';
                lastItem.querySelector('.part-price').value = itemData.price || '';
                lastItem.querySelector('.part-quantity').value = itemData.quantity || '1';
            });
        } else if (data.customSections && data.customSections.length > 0) {
            // Legacy format - load from custom sections
            data.customSections.forEach(sectionData => {
                if (sectionData.pricingType === 'parts-markup' || sectionData.pricingType === 'parts-only') {
                    document.getElementById('partsMarkup').value = sectionData.markup || 0;
                    sectionData.lineItems.forEach(itemData => {
                        addPartLineItem();
                        const lastItem = document.querySelector('#partsLineItemsContainer .line-item:last-child');
                        lastItem.querySelector('.part-number').value = itemData.partNumber || '';
                        lastItem.querySelector('.part-description').value = itemData.description || '';
                        lastItem.querySelector('.part-price').value = itemData.price || '';
                        lastItem.querySelector('.part-quantity').value = itemData.quantity || '1';
                    });
                }
            });
        } else if (data.lineItems) {
            // Very old legacy format
            data.lineItems.forEach(itemData => {
                addPartLineItem();
                const lastItem = document.querySelector('#partsLineItemsContainer .line-item:last-child');
                lastItem.querySelector('.part-number').value = itemData.partNumber || '';
                lastItem.querySelector('.part-description').value = itemData.description || '';
                lastItem.querySelector('.part-price').value = itemData.price || '';
                lastItem.querySelector('.part-quantity').value = itemData.quantity || '1';
            });
        } else {
            // No parts, just add one empty line item
            addPartLineItem();
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
            const inventory = part.inventory !== undefined ? part.inventory : 0;
            item.innerHTML = `
                <div class="part-library-item-info">
                    <strong>${part.partNumber}</strong>
                    <div>${part.description}</div>
                    <div>$${part.price.toFixed(2)}</div>
                    <div style="color: ${inventory > 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">
                        Inventory: ${inventory}
                    </div>
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
        addPartLineItem();
        const lastItem = document.querySelector('#partsLineItemsContainer .line-item:last-child');
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

// Inventory Management Functions
function showInventoryManager() {
    const modal = document.getElementById('inventoryModal');
    const listDiv = document.getElementById('inventoryList');
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    
    listDiv.innerHTML = '';
    
    // Filter parts based on search
    const filteredParts = partsLibrary.filter(part => 
        !searchTerm || 
        part.partNumber.toLowerCase().includes(searchTerm) ||
        part.description.toLowerCase().includes(searchTerm)
    );
    
    if (filteredParts.length === 0) {
        listDiv.innerHTML = '<p>No parts found. Add parts by entering them in a quote.</p>';
    } else {
        filteredParts.forEach(part => {
            const inventory = part.inventory !== undefined ? part.inventory : 0;
            const item = document.createElement('div');
            item.className = 'part-library-item';
            item.style.marginBottom = '15px';
            item.innerHTML = `
                <div class="part-library-item-info" style="flex: 2;">
                    <strong style="color: #667eea; font-size: 1.1em;">${part.partNumber}</strong>
                    <div style="color: #666; margin: 5px 0;">${part.description}</div>
                    <div style="color: #888;">$${part.price.toFixed(2)}</div>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                    <label style="font-weight: bold;">Current Stock:</label>
                    <input type="number" 
                           id="inventory-${part.partNumber}" 
                           value="${inventory}" 
                           min="0" 
                           step="1"
                           style="width: 100px; padding: 8px; border: 2px solid #ddd; border-radius: 6px;"
                           onchange="updatePartInventory('${part.partNumber}', this.value)">
                    <span style="color: ${inventory > 0 ? '#28a745' : '#dc3545'}; font-weight: bold; min-width: 80px;">
                        ${inventory > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            `;
            listDiv.appendChild(item);
        });
    }
    
    modal.style.display = 'block';
}

function closeInventory() {
    document.getElementById('inventoryModal').style.display = 'none';
}

async function updatePartInventory(partNumber, newQuantity) {
    const partIndex = partsLibrary.findIndex(p => p.partNumber === partNumber);
    if (partIndex >= 0) {
        partsLibrary[partIndex].inventory = parseInt(newQuantity) || 0;
        await savePartsLibrary();
        // Refresh the display
        showInventoryManager();
    }
}

// Deduct inventory when PDF is generated
async function deductInventoryFromQuote() {
    const partsLineItems = document.querySelectorAll('#partsLineItemsContainer .line-item');
    let inventoryUpdated = false;
    
    partsLineItems.forEach(item => {
        const partNumber = item.querySelector('.part-number').value;
        const quantity = parseInt(item.querySelector('.part-quantity').value) || 0;
        
        if (partNumber && quantity > 0) {
            const partIndex = partsLibrary.findIndex(p => 
                p.partNumber.toLowerCase() === partNumber.toLowerCase()
            );
            
            if (partIndex >= 0) {
                const currentInventory = partsLibrary[partIndex].inventory !== undefined 
                    ? partsLibrary[partIndex].inventory 
                    : 0;
                
                // Deduct quantity from inventory (don't go below 0)
                const newInventory = Math.max(0, currentInventory - quantity);
                partsLibrary[partIndex].inventory = newInventory;
                inventoryUpdated = true;
            }
        }
    });
    
    if (inventoryUpdated) {
        await savePartsLibrary();
    }
}


