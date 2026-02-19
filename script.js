// Construction Quote Generator - Simplified & Fast
// Focus: Labor + Equipment only

// ===== CONFIGURATION =====
let appConfig = null;
let laborItemCounter = 0;
let equipmentItemCounter = 0;
let inventory = []; // Inventory items array
let inventoryCategories = []; // Inventory categories array
let savedQuotes = []; // Array of saved quotes with revisions
let sharedStoragePath = ''; // Path to shared storage folder
let sharedStorageHandle = null; // File System Access API directory handle
let autoSyncEnabled = false;
let syncOnStartup = false;

// Default Templates (used if not in localStorage)
const DEFAULT_SCOPE_TEMPLATES = {
    residential: "Complete residential electrical installation including wiring, outlets, switches, and panel connections. All work to be performed per local electrical codes and NEC standards.",
    commercial: "Complete commercial electrical installation including panel upgrades, circuit installation, and electrical system modifications. All work to be performed per local electrical codes and NEC standards.",
    service_upgrade: "Electrical service upgrade including new panel installation, meter base, and service entrance. All work to be performed per local electrical codes and utility requirements.",
    troubleshooting: "Electrical troubleshooting and repair services including diagnosis, repair, and testing of electrical systems. All work to be performed per local electrical codes.",
    lighting: "Complete lighting installation including fixtures, switches, dimmers, and related electrical work. All work to be performed per local electrical codes."
};

const DEFAULT_NOTES_TEMPLATES = {
    standard: "This quote assumes standard site conditions and accessibility. All electrical work to be performed per NEC and local codes. Price valid for 30 days. Payment terms: 50% deposit, balance upon completion.",
    site: "Assumes standard site conditions, clear access, and standard working hours (M-F, 8am-5pm). Additional charges may apply for difficult access, after-hours work, or special permit requirements.",
    materials: "This quote includes all labor and equipment. Electrical materials (wire, devices, breakers) are included as specified. Any additional materials or code upgrades will be billed separately.",
    custom: ""
};

const DEFAULT_EXCLUSIONS_TEMPLATES = {
    standard: "Excludes: electrical permits, inspections, disposal fees, and any work not specifically listed above.",
    permits: "Excludes: electrical permits, inspections, and related fees. Customer responsible for obtaining all necessary permits and scheduling inspections.",
    materials: "Excludes: electrical materials, wire, devices, and consumables. Customer to provide or purchase separately.",
    custom: ""
};

// Template variables (loaded from localStorage or defaults)
let SCOPE_TEMPLATES = {};
let NOTES_TEMPLATES = {};
let EXCLUSIONS_TEMPLATES = {};

// ===== DEFAULT INVENTORY ITEMS =====
const DEFAULT_INVENTORY = [
    { id: 'inv-001', name: 'Generator', model: 'Honda EU7000iS', description: '7000W portable inverter generator', price: 250.00, discount: 0, multiplier: 1.0, stock: 4, category: 'Power Equipment' },
    { id: 'inv-002', name: 'Wire Puller', model: 'Greenlee 555', description: 'Electric wire puller with accessories', price: 180.00, discount: 0, multiplier: 1.0, stock: 3, category: 'Tools' },
    { id: 'inv-003', name: 'Conduit Bender', model: 'Greenlee 881', description: '1/2" EMT conduit bender', price: 95.00, discount: 0, multiplier: 1.0, stock: 6, category: 'Tools' },
    { id: 'inv-004', name: 'Cable Tester', model: 'Fluke TS90', description: 'Network cable tester and certifier', price: 320.00, discount: 0, multiplier: 1.0, stock: 2, category: 'Testing Equipment' },
    { id: 'inv-005', name: 'Multimeter', model: 'Fluke 87V', description: 'True RMS digital multimeter', price: 280.00, discount: 0, multiplier: 1.0, stock: 5, category: 'Testing Equipment' },
    { id: 'inv-006', name: 'Lift', model: 'Genie GS-1930', description: '19ft scissor lift', price: 175.00, discount: 0, multiplier: 1.0, stock: 3, category: 'Access Equipment' },
    { id: 'inv-007', name: 'Ladder', model: 'Werner D6232', description: '32ft extension ladder', price: 85.00, discount: 0, multiplier: 1.0, stock: 8, category: 'Access Equipment' },
    { id: 'inv-008', name: 'Cable Puller', model: 'Greenlee 555-M', description: 'Mechanical cable puller', price: 150.00, discount: 0, multiplier: 1.0, stock: 4, category: 'Tools' }
];

// ===== DEFAULT CATEGORIES =====
const DEFAULT_CATEGORIES = [
    'Power Equipment',
    'Tools',
    'Testing Equipment',
    'Access Equipment',
    'Safety Equipment',
    'General'
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
    loadStorageSettings();
    loadCategories();
    loadInventory();
    loadTemplates();
    loadSavedQuotes();
    setupEventListeners();
    initializeQuote();
    showPage('start'); // Show start page by default
});

function loadConfig() {
    const stored = localStorage.getItem('appConfig');
    if (stored) {
        appConfig = JSON.parse(stored);
        populateConfigForm();
    }
}

function loadStorageSettings() {
    const stored = localStorage.getItem('storageSettings');
    if (stored) {
        const settings = JSON.parse(stored);
        sharedStoragePath = settings.sharedStoragePath || '';
        autoSyncEnabled = settings.autoSyncEnabled || false;
        syncOnStartup = settings.syncOnStartup || false;
        
        // Populate settings form
        if (document.getElementById('sharedStoragePath')) {
            document.getElementById('sharedStoragePath').value = sharedStoragePath;
            document.getElementById('enableAutoSync').checked = autoSyncEnabled;
            document.getElementById('syncOnStartup').checked = syncOnStartup;
        }
        
        // Sync on startup if enabled
        if (syncOnStartup && sharedStoragePath) {
            syncFromSharedStorage();
        }
    }
}

function loadCategories() {
    const stored = localStorage.getItem('inventoryCategories');
    if (stored) {
        inventoryCategories = JSON.parse(stored);
    } else {
        // Initialize with default categories
        inventoryCategories = [...DEFAULT_CATEGORIES];
        saveCategories();
    }
    updateCategoryDropdowns();
}

function saveCategories() {
    localStorage.setItem('inventoryCategories', JSON.stringify(inventoryCategories));
    updateCategoryDropdowns();
}

function updateCategoryDropdowns() {
    // Update inventory form category dropdown
    const invCategorySelect = document.getElementById('invCategory');
    if (invCategorySelect) {
        const currentValue = invCategorySelect.value;
        invCategorySelect.innerHTML = inventoryCategories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
        if (inventoryCategories.includes(currentValue)) {
            invCategorySelect.value = currentValue;
        }
    }
    
    // Update inventory filter dropdown
    const filterSelect = document.getElementById('inventoryCategoryFilter');
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = `
            <option value="all">All Categories</option>
            ${inventoryCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;
        if (currentValue === 'all' || inventoryCategories.includes(currentValue)) {
            filterSelect.value = currentValue;
        } else {
            filterSelect.value = 'all';
        }
    }
}

function loadInventory() {
    const stored = localStorage.getItem('inventory');
    if (stored) {
        inventory = JSON.parse(stored);
    } else {
        // Initialize with default items
        inventory = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
        saveInventory();
    }
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Auto-sync to shared storage if enabled
    if (autoSyncEnabled && sharedStoragePath) {
        syncToSharedStorage();
    }
}

function loadSavedQuotes() {
    const stored = localStorage.getItem('savedQuotes');
    if (stored) {
        savedQuotes = JSON.parse(stored);
        // Ensure backward compatibility - add approval fields to old quotes
        savedQuotes.forEach(quote => {
            if (quote.approved === undefined) {
                quote.approved = false;
                quote.approvedAt = null;
                quote.approvedRevision = null;
            }
        });
    } else {
        savedQuotes = [];
    }
}

function saveSavedQuotes() {
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    
    // Auto-sync to shared storage if enabled
    if (autoSyncEnabled && sharedStoragePath) {
        syncToSharedStorage();
    }
}

function loadTemplates() {
    // Load scope templates
    const storedScope = localStorage.getItem('scopeTemplates');
    SCOPE_TEMPLATES = storedScope ? JSON.parse(storedScope) : JSON.parse(JSON.stringify(DEFAULT_SCOPE_TEMPLATES));
    
    // Load notes templates
    const storedNotes = localStorage.getItem('notesTemplates');
    NOTES_TEMPLATES = storedNotes ? JSON.parse(storedNotes) : JSON.parse(JSON.stringify(DEFAULT_NOTES_TEMPLATES));
    
    // Load exclusions templates
    const storedExclusions = localStorage.getItem('exclusionsTemplates');
    EXCLUSIONS_TEMPLATES = storedExclusions ? JSON.parse(storedExclusions) : JSON.parse(JSON.stringify(DEFAULT_EXCLUSIONS_TEMPLATES));
    
    // Update dropdowns with loaded templates
    updateTemplateDropdowns();
}

function updateTemplateDropdowns() {
    // Update scope template dropdown
    const scopeSelect = document.getElementById('scopeTemplate');
    if (scopeSelect) {
        const currentValue = scopeSelect.value;
        scopeSelect.innerHTML = '<option value="">-- Select Template or Type Custom --</option>';
        Object.keys(SCOPE_TEMPLATES).forEach(key => {
            if (key !== 'custom') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                scopeSelect.appendChild(option);
            }
        });
        scopeSelect.innerHTML += '<option value="custom">Custom (Type Below)</option>';
        scopeSelect.value = currentValue;
    }
    
    // Update notes template dropdown
    const notesSelect = document.getElementById('notesTemplate');
    if (notesSelect) {
        const currentValue = notesSelect.value;
        notesSelect.innerHTML = '<option value="">-- Select Template or Type Custom --</option>';
        Object.keys(NOTES_TEMPLATES).forEach(key => {
            if (key !== 'custom') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                notesSelect.appendChild(option);
            }
        });
        notesSelect.innerHTML += '<option value="custom">Custom Notes</option>';
        notesSelect.value = currentValue;
    }
    
    // Update exclusions template dropdown
    const exclusionsSelect = document.getElementById('exclusionsTemplate');
    if (exclusionsSelect) {
        const currentValue = exclusionsSelect.value;
        exclusionsSelect.innerHTML = '<option value="">-- Select Template or Type Custom --</option>';
        Object.keys(EXCLUSIONS_TEMPLATES).forEach(key => {
            if (key !== 'custom') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                exclusionsSelect.appendChild(option);
            }
        });
        exclusionsSelect.innerHTML += '<option value="custom">Custom Exclusions</option>';
        exclusionsSelect.value = currentValue;
    }
}

function saveTemplates() {
    localStorage.setItem('scopeTemplates', JSON.stringify(SCOPE_TEMPLATES));
    localStorage.setItem('notesTemplates', JSON.stringify(NOTES_TEMPLATES));
    localStorage.setItem('exclusionsTemplates', JSON.stringify(EXCLUSIONS_TEMPLATES));
    
    // Auto-sync to shared storage if enabled
    if (autoSyncEnabled && sharedStoragePath) {
        syncToSharedStorage();
    }
}

function setupEventListeners() {
    // Auto-calculate on input changes
    document.addEventListener('input', debounce(updateCalculations, 300));
    
    // Set valid until date (30 days from quote date)
    const quoteDateInput = document.getElementById('quoteDate');
    if (quoteDateInput) {
        quoteDateInput.addEventListener('change', function() {
            const date = new Date(this.value);
            date.setDate(date.getDate() + 30);
            document.getElementById('validUntil').value = date.toISOString().split('T')[0];
        });
    }
}

function initializeQuote() {
    const quoteDateInput = document.getElementById('quoteDate');
    const validUntilInput = document.getElementById('validUntil');
    const quoteNumberInput = document.getElementById('quoteNumber');
    
    if (quoteDateInput) {
        const today = new Date().toISOString().split('T')[0];
        quoteDateInput.value = today;
    }
    if (validUntilInput) {
        validUntilInput.value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    if (quoteNumberInput) {
        quoteNumberInput.value = generateQuoteNumber();
    }
}

// ===== NAVIGATION =====
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const pageMap = {
        'start': 'startPage',
        'proposal': 'proposalPage',
        'inventory': 'inventoryPage',
        'templates': 'templatesPage',
        'quotes': 'quotesPage',
        'settings': 'settingsPage'
    };
    
    const pageId = pageMap[pageName];
    if (pageId) {
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
            
            // Initialize page-specific content
            if (pageName === 'proposal') {
                // Ensure quote is initialized
                initializeQuote();
                // Add initial items if container is empty
                if (document.getElementById('laborItemsContainer') && document.getElementById('laborItemsContainer').children.length === 0) {
                    addLaborItem();
                    addEquipmentItem();
                }
            } else if (pageName === 'inventory') {
                renderCategoriesList();
                renderInventoryList();
            } else if (pageName === 'templates') {
                renderTemplateLists();
            } else if (pageName === 'quotes') {
                renderQuotesList();
            } else if (pageName === 'settings') {
                populateConfigForm();
            }
        }
    }
}

// ===== SETTINGS =====
function populateConfigForm() {
    if (appConfig) {
        const nameInput = document.getElementById('configCompanyName');
        const phoneInput = document.getElementById('configCompanyPhone');
        const emailInput = document.getElementById('configCompanyEmail');
        const addressInput = document.getElementById('configCompanyAddress');
        const laborRateInput = document.getElementById('defaultLaborRate');
        const taxRateInput = document.getElementById('taxRate');
        
        if (nameInput) nameInput.value = appConfig.companyName || '';
        if (phoneInput) phoneInput.value = appConfig.companyPhone || '';
        if (emailInput) emailInput.value = appConfig.companyEmail || '';
        if (addressInput) addressInput.value = appConfig.companyAddress || '';
        if (laborRateInput) laborRateInput.value = appConfig.defaultLaborRate || 75.00;
        if (taxRateInput) taxRateInput.value = appConfig.taxRate || 0;
        
        if (appConfig.logoData) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPreviewImg = document.getElementById('logoPreviewImg');
            if (logoPreviewImg) {
                logoPreviewImg.src = appConfig.logoData;
                if (logoPreview) logoPreview.style.display = 'block';
            }
        }
    }
    
    // Populate storage settings
    const storagePathInput = document.getElementById('sharedStoragePath');
    const autoSyncInput = document.getElementById('enableAutoSync');
    const syncStartupInput = document.getElementById('syncOnStartup');
    
    if (storagePathInput) storagePathInput.value = sharedStoragePath || '';
    if (autoSyncInput) autoSyncInput.checked = autoSyncEnabled;
    if (syncStartupInput) syncStartupInput.checked = syncOnStartup;
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logoPreviewImg').src = e.target.result;
            document.getElementById('logoPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function saveSettings() {
    const logoFile = document.getElementById('logoUpload').files[0];
    let logoData = appConfig?.logoData || null;
    
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoData = e.target.result;
            saveConfigToStorage(logoData);
        };
        reader.readAsDataURL(logoFile);
            } else {
        saveConfigToStorage(logoData);
    }
}

function saveConfigToStorage(logoData) {
    appConfig = {
        companyName: document.getElementById('configCompanyName').value,
        companyPhone: document.getElementById('configCompanyPhone').value,
        companyEmail: document.getElementById('configCompanyEmail').value,
        companyAddress: document.getElementById('configCompanyAddress').value,
        defaultLaborRate: parseFloat(document.getElementById('defaultLaborRate').value) || 75.00,
        taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
        logoData: logoData
    };
    
    localStorage.setItem('appConfig', JSON.stringify(appConfig));
    
    // Save storage settings
    const storagePathInput = document.getElementById('sharedStoragePath');
    const autoSyncInput = document.getElementById('enableAutoSync');
    const syncStartupInput = document.getElementById('syncOnStartup');
    
    if (storagePathInput) sharedStoragePath = storagePathInput.value.trim();
    if (autoSyncInput) autoSyncEnabled = autoSyncInput.checked;
    if (syncStartupInput) syncOnStartup = syncStartupInput.checked;
    
    const storageSettings = {
        sharedStoragePath: sharedStoragePath,
        autoSyncEnabled: autoSyncEnabled,
        syncOnStartup: syncOnStartup
    };
    localStorage.setItem('storageSettings', JSON.stringify(storageSettings));
    
    // Sync to shared storage if enabled
    if (autoSyncEnabled && sharedStoragePath) {
        syncToSharedStorage();
    }
    
    alert('Settings saved successfully!');
}

// ===== LABOR ITEMS =====
function addLaborItem() {
    laborItemCounter++;
    const container = document.getElementById('laborItemsContainer');
    const defaultRate = appConfig?.defaultLaborRate || 75.00;
    
    const item = document.createElement('div');
    item.className = 'line-item';
    item.dataset.id = laborItemCounter;
    item.innerHTML = `
        <div class="line-item-content">
            <div class="form-group" style="flex: 2;">
                <label>Description</label>
                <select class="labor-template" onchange="applyLaborTemplate(this)" style="margin-bottom: 5px;">
                    <option value="">-- Quick Select --</option>
                    <option value="installation">Electrical Installation</option>
                    <option value="wiring">Wiring & Circuits</option>
                    <option value="panel">Panel Work</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="lighting">Lighting Installation</option>
                    <option value="service">Service Upgrade</option>
                    <option value="general">General Electrical</option>
                </select>
                <input type="text" class="labor-description" placeholder="Labor description" required>
            </div>
            <div class="form-group">
                <label>Hours</label>
                <select class="labor-hours-quick" onchange="this.nextElementSibling.value=this.value; updateCalculations()" style="margin-bottom: 5px;">
                    <option value="">Quick</option>
                    <option value="1">1 hr</option>
                    <option value="2">2 hrs</option>
                    <option value="4">4 hrs</option>
                    <option value="8">8 hrs</option>
                    <option value="16">16 hrs</option>
                    <option value="40">40 hrs</option>
                </select>
                <input type="number" class="labor-hours" step="0.25" min="0" value="8" required oninput="updateCalculations()">
            </div>
            <div class="form-group">
                <label>Rate ($/hr)</label>
                <input type="number" class="labor-rate" step="0.01" min="0" value="${defaultRate}" required oninput="updateCalculations()">
            </div>
            <div class="form-group">
                <label>Total</label>
                <input type="text" class="labor-total" readonly value="$0.00" style="font-weight: bold;">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeLaborItem(this)">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(item);
    updateCalculations();
}

function applyLaborTemplate(select) {
    const templates = {
        installation: "Electrical installation and wiring",
        wiring: "Circuit wiring and installation",
        panel: "Electrical panel installation and upgrades",
        troubleshooting: "Electrical troubleshooting and repair",
        lighting: "Lighting fixture installation",
        service: "Electrical service upgrade",
        general: "General electrical work"
    };
    if (select.value) {
        select.parentElement.querySelector('.labor-description').value = templates[select.value];
        updateCalculations();
    }
}

function removeLaborItem(button) {
    button.closest('.line-item').remove();
    updateCalculations();
}

// ===== EQUIPMENT ITEMS =====
function addEquipmentItem() {
    equipmentItemCounter++;
    const container = document.getElementById('equipmentItemsContainer');
    
    const item = document.createElement('div');
    item.className = 'line-item';
    item.dataset.id = equipmentItemCounter;
    item.innerHTML = `
        <div class="line-item-content">
            <div class="form-group" style="flex: 2;">
                <label>Equipment</label>
                <select class="equipment-inventory-select" onchange="selectInventoryItem(this)" style="margin-bottom: 5px;">
                    <option value="">-- Select from Inventory --</option>
                    ${inventory.map(inv => `<option value="${inv.id}">${inv.name} (${inv.model}) - $${inv.price.toFixed(2)}</option>`).join('')}
                </select>
                <input type="text" class="equipment-description" placeholder="Equipment description" required>
                <input type="hidden" class="equipment-inventory-id" value="">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="equipment-quantity" step="1" min="1" value="1" required oninput="updateCalculations()">
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" class="equipment-price" step="0.01" min="0" value="" required oninput="updateCalculations()" placeholder="Select from inventory or enter price">
            </div>
            <div class="form-group">
                <label>Markup %</label>
                <input type="number" class="equipment-markup" step="0.1" min="0" value="0" oninput="updateCalculations()" placeholder="0">
            </div>
            <div class="form-group">
                <label>Total</label>
                <input type="text" class="equipment-total" readonly value="$0.00" style="font-weight: bold;">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove" onclick="removeEquipmentItem(this)">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(item);
    updateCalculations();
}

function selectInventoryItem(select) {
    const inventoryId = select.value;
    if (!inventoryId) return;
    
    const invItem = inventory.find(item => item.id === inventoryId);
    if (!invItem) return;
    
    const lineItem = select.closest('.line-item');
    const descriptionInput = lineItem.querySelector('.equipment-description');
    const priceInput = lineItem.querySelector('.equipment-price');
    const inventoryIdInput = lineItem.querySelector('.equipment-inventory-id');
    
    // Calculate base price with discount and multiplier
    let basePrice = invItem.price;
    if (invItem.discount > 0) {
        basePrice = basePrice * (1 - invItem.discount / 100);
    }
    if (invItem.multiplier !== 1.0) {
        basePrice = basePrice * invItem.multiplier;
    }
    
    // Populate fields
    descriptionInput.value = `${invItem.name} - ${invItem.model}`;
    priceInput.value = basePrice.toFixed(2);
    inventoryIdInput.value = inventoryId;
    
    updateCalculations();
}

function applyEquipmentTemplate(select) {
    const templates = {
        excavator: "Excavator rental",
        crane: "Crane rental",
        loader: "Loader rental",
        generator: "Generator rental",
        scaffolding: "Scaffolding rental",
        compactor: "Compactor rental",
        truck: "Truck/Vehicle rental"
    };
    if (select.value) {
        select.parentElement.querySelector('.equipment-description').value = templates[select.value];
    updateCalculations();
    }
}

function removeEquipmentItem(button) {
    button.closest('.line-item').remove();
    updateCalculations();
}

// ===== TEMPLATES =====
function applyScopeTemplate() {
    const select = document.getElementById('scopeTemplate');
    if (select.value && select.value !== 'custom') {
        document.getElementById('scopeSummary').value = SCOPE_TEMPLATES[select.value];
    }
}

function applyNotesTemplate() {
    const select = document.getElementById('notesTemplate');
    if (select.value && select.value !== 'custom') {
        document.getElementById('notes').value = NOTES_TEMPLATES[select.value];
    }
}

function applyExclusionsTemplate() {
    const select = document.getElementById('exclusionsTemplate');
    if (select.value && select.value !== 'custom') {
        document.getElementById('exclusions').value = EXCLUSIONS_TEMPLATES[select.value];
    }
}

// ===== CALCULATIONS =====
function updateCalculations() {
    // Calculate labor totals
    let laborSubtotal = 0;
    document.querySelectorAll('#laborItemsContainer .line-item').forEach(item => {
        const hours = parseFloat(item.querySelector('.labor-hours').value) || 0;
        const rate = parseFloat(item.querySelector('.labor-rate').value) || 0;
        const total = hours * rate;
        item.querySelector('.labor-total').value = `$${total.toFixed(2)}`;
        laborSubtotal += total;
    });
    
    // Calculate equipment totals
    let equipmentSubtotal = 0;
    document.querySelectorAll('#equipmentItemsContainer .line-item').forEach(item => {
        const quantity = parseFloat(item.querySelector('.equipment-quantity').value) || 1;
        const price = parseFloat(item.querySelector('.equipment-price').value) || 0;
        const markup = parseFloat(item.querySelector('.equipment-markup').value) || 0;
        const total = quantity * price * (1 + markup / 100);
        item.querySelector('.equipment-total').value = `$${total.toFixed(2)}`;
        equipmentSubtotal += total;
    });
    
    // Update subtotals
    document.getElementById('laborSubtotal').textContent = `$${laborSubtotal.toFixed(2)}`;
    document.getElementById('equipmentSubtotal').textContent = `$${equipmentSubtotal.toFixed(2)}`;
    
    // Calculate tax
    const subtotal = laborSubtotal + equipmentSubtotal;
    const taxRate = appConfig?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    // Show/hide tax row
    const taxRow = document.getElementById('taxRow');
    if (taxAmount > 0) {
        taxRow.style.display = 'flex';
        document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    } else {
        taxRow.style.display = 'none';
    }
    
    // Update grand total
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

// ===== VALIDATION =====
function validateForm() {
    const errors = [];
    
    if (!appConfig || !appConfig.companyName) {
        errors.push('Please configure company settings first.');
    }
    
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        errors.push('Customer name is required.');
    }
    
    const scopeSummary = document.getElementById('scopeSummary').value.trim();
    if (!scopeSummary) {
        errors.push('Scope summary is required.');
    }
    
    const laborItems = document.querySelectorAll('#laborItemsContainer .line-item');
    const equipmentItems = document.querySelectorAll('#equipmentItemsContainer .line-item');
    
    if (laborItems.length === 0 && equipmentItems.length === 0) {
        errors.push('Add at least one labor or equipment item.');
    }
    
    // Validate labor items
    laborItems.forEach((item, index) => {
        const desc = item.querySelector('.labor-description').value.trim();
        const hours = parseFloat(item.querySelector('.labor-hours').value);
        const rate = parseFloat(item.querySelector('.labor-rate').value);
        
        if (!desc) errors.push(`Labor item ${index + 1}: Description required.`);
        if (!hours || hours <= 0) errors.push(`Labor item ${index + 1}: Valid hours required.`);
        if (!rate || rate <= 0) errors.push(`Labor item ${index + 1}: Valid rate required.`);
    });
    
    // Validate equipment items
    equipmentItems.forEach((item, index) => {
        const desc = item.querySelector('.equipment-description').value.trim();
        const quantity = parseFloat(item.querySelector('.equipment-quantity').value);
        const price = parseFloat(item.querySelector('.equipment-price').value);
        
        if (!desc) errors.push(`Equipment item ${index + 1}: Description required.`);
        if (!quantity || quantity <= 0) errors.push(`Equipment item ${index + 1}: Valid quantity required.`);
        if (!price || price <= 0) errors.push(`Equipment item ${index + 1}: Valid price required.`);
    });
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// ===== PDF GENERATION =====
function generatePDF() {
    if (!validateForm()) return;
    
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library is loading. Please wait a moment and try again.');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded correctly');
        }
        const doc = new jsPDF();
    let yPos = 20;
    
    // Header with Logo
    if (appConfig?.logoData) {
        try {
            doc.addImage(appConfig.logoData, 'PNG', 150, yPos, 40, 20);
            yPos += 25;
        } catch (e) {
            console.log('Logo error:', e);
        }
    }
    
    // Company Info
    doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
    if (appConfig?.companyName) {
        doc.text(appConfig.companyName, 150, yPos);
        yPos += 6;
    }
    doc.setFont(undefined, 'normal');
    if (appConfig?.companyAddress) {
        const addrLines = doc.splitTextToSize(appConfig.companyAddress, 50);
        addrLines.forEach(line => {
            doc.text(line, 150, yPos);
            yPos += 5;
        });
    }
    if (appConfig?.companyPhone) {
        doc.text(`Phone: ${appConfig.companyPhone}`, 150, yPos);
        yPos += 5;
    }
    if (appConfig?.companyEmail) {
        doc.text(`Email: ${appConfig.companyEmail}`, 150, yPos);
        yPos += 5;
    }
    
    // Quote Title
    yPos = 20;
    doc.setFontSize(20);
    doc.setTextColor(29, 29, 31);
    doc.setFont(undefined, 'bold');
    doc.text('PROPOSAL', 20, yPos);
    
    // Quote Info
    yPos = 35;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Quote To:', 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'normal');
    
    const customerName = document.getElementById('customerName').value;
    const jobName = document.getElementById('jobName').value;
    const jobsiteAddress = document.getElementById('jobsiteAddress').value;
    
    if (jobName) {
        doc.setFont(undefined, 'bold');
        doc.text(`Job: ${jobName}`, 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
    }
    if (customerName) {
        doc.text(customerName, 20, yPos);
        yPos += 5;
    }
    if (jobsiteAddress) {
        yPos += 2;
        doc.setFont(undefined, 'bold');
        doc.text('Jobsite Address:', 20, yPos);
        yPos += 5;
        doc.setFont(undefined, 'normal');
        const jobsiteLines = doc.splitTextToSize(jobsiteAddress, 80);
        jobsiteLines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 5;
        });
    }
    
    yPos += 3;
    doc.setFont(undefined, 'bold');
    doc.text(`Quote #: ${document.getElementById('quoteNumber').value}`, 20, yPos);
    yPos += 5;
    doc.text(`Date: ${formatDate(document.getElementById('quoteDate').value)}`, 20, yPos);
    yPos += 5;
    doc.text(`Valid Until: ${formatDate(document.getElementById('validUntil').value)}`, 20, yPos);
    yPos += 10;
    
    // Scope Summary
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('SCOPE OF WORK', 20, yPos);
    yPos += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const scopeLines = doc.splitTextToSize(document.getElementById('scopeSummary').value, 170);
    scopeLines.forEach(line => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(line, 20, yPos);
        yPos += 5;
    });
    yPos += 8;
    
    // Labor Section
    let laborSubtotal = 0;
    let equipmentSubtotal = 0;
    
    const laborItems = document.querySelectorAll('#laborItemsContainer .line-item');
    if (laborItems.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('LABOR', 20, yPos);
        yPos += 8;
        
        // Table Header
        doc.setFontSize(10);
        doc.text('Description', 20, yPos);
        doc.text('Hours', 130, yPos);
        doc.text('Total', 170, yPos);
        yPos += 5;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'normal');
        laborItems.forEach(item => {
            if (yPos > 280) { doc.addPage(); yPos = 20; doc.setFont(undefined, 'bold'); doc.text('LABOR (cont.)', 20, yPos); yPos += 8; doc.setFont(undefined, 'normal'); }
            
            const desc = item.querySelector('.labor-description').value;
            const hours = parseFloat(item.querySelector('.labor-hours').value) || 0;
            const rate = parseFloat(item.querySelector('.labor-rate').value) || 0;
            const total = hours * rate;
            laborSubtotal += total;
            
            const descLines = doc.splitTextToSize(desc, 100);
            doc.text(descLines[0], 20, yPos);
            doc.text(hours.toFixed(2), 130, yPos);
            doc.text(`$${total.toFixed(2)}`, 170, yPos);
            
            if (descLines.length > 1) {
                for (let i = 1; i < descLines.length; i++) {
                    yPos += 5;
                    doc.text(descLines[i], 20, yPos);
                }
            }
            yPos += 7;
        });
        
        yPos += 2;
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Labor Subtotal:', 120, yPos);
        doc.text(`$${laborSubtotal.toFixed(2)}`, 170, yPos);
        yPos += 10;
    }
    
    // Equipment Section
    const equipmentItems = document.querySelectorAll('#equipmentItemsContainer .line-item');
    if (equipmentItems.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('EQUIPMENT', 20, yPos);
        yPos += 8;
        
        // Table Header
        doc.setFontSize(10);
        doc.text('Description', 20, yPos);
        doc.text('Qty', 110, yPos);
        doc.text('Total', 150, yPos);
        yPos += 5;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'normal');
        equipmentItems.forEach(item => {
            if (yPos > 280) { doc.addPage(); yPos = 20; doc.setFont(undefined, 'bold'); doc.text('EQUIPMENT (cont.)', 20, yPos); yPos += 8; doc.setFont(undefined, 'normal'); }
            
            const desc = item.querySelector('.equipment-description').value;
            const quantity = parseFloat(item.querySelector('.equipment-quantity').value) || 1;
            const price = parseFloat(item.querySelector('.equipment-price').value) || 0;
            const markup = parseFloat(item.querySelector('.equipment-markup').value) || 0;
            const total = quantity * price * (1 + markup / 100);
            equipmentSubtotal += total;
            
            const descLines = doc.splitTextToSize(desc, 90);
            doc.text(descLines[0], 20, yPos);
            doc.text(quantity.toString(), 110, yPos);
            doc.text(`$${total.toFixed(2)}`, 150, yPos);
            
            if (descLines.length > 1) {
                for (let i = 1; i < descLines.length; i++) {
                    yPos += 5;
                    doc.text(descLines[i], 20, yPos);
                }
            }
            yPos += 7;
        });
        
        yPos += 2;
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Equipment Subtotal:', 120, yPos);
        doc.text(`$${equipmentSubtotal.toFixed(2)}`, 170, yPos);
    yPos += 10;
    }
    
    // Totals
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    const subtotal = laborSubtotal + equipmentSubtotal;
    const taxRate = appConfig?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('QUOTE SUMMARY', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text('Labor Subtotal:', 120, yPos);
    doc.text(`$${laborSubtotal.toFixed(2)}`, 170, yPos);
    yPos += 6;
    
    doc.text('Equipment Subtotal:', 120, yPos);
    doc.text(`$${equipmentSubtotal.toFixed(2)}`, 170, yPos);
    yPos += 6;
    
    if (taxAmount > 0) {
        doc.text(`Tax (${taxRate}%):`, 120, yPos);
        doc.text(`$${taxAmount.toFixed(2)}`, 170, yPos);
        yPos += 6;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(29, 29, 31);
    doc.text('GRAND TOTAL:', 120, yPos);
    doc.text(`$${grandTotal.toFixed(2)}`, 170, yPos);
    yPos += 12;
    
    // Notes
    const notes = document.getElementById('notes').value.trim();
    if (notes) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('NOTES & ASSUMPTIONS:', 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        const noteLines = doc.splitTextToSize(notes, 170);
        noteLines.forEach(line => {
            if (yPos > 280) { doc.addPage(); yPos = 20; }
            doc.text(line, 20, yPos);
            yPos += 5;
        });
        yPos += 5;
    }
    
    // Exclusions
    const exclusions = document.getElementById('exclusions').value.trim();
    if (exclusions) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('EXCLUSIONS:', 20, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        const exclLines = doc.splitTextToSize(exclusions, 170);
        exclLines.forEach(line => {
            if (yPos > 280) { doc.addPage(); yPos = 20; }
            doc.text(line, 20, yPos);
            yPos += 5;
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    // Save PDF
    const fileName = `Quote_${document.getElementById('quoteNumber').value}_${formatDate(document.getElementById('quoteDate').value).replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        console.error('Error details:', error.message, error.stack);
        
        // More specific error messages
        let errorMsg = 'Error generating PDF.\n\n';
        if (error.message) {
            errorMsg += `Error: ${error.message}\n\n`;
        }
        errorMsg += 'Please check:\n';
        errorMsg += '1. All required fields are filled\n';
        errorMsg += '2. Browser console (F12) for details\n';
        errorMsg += '3. Internet connection (for PDF library)';
        
        alert(errorMsg);
    }
}

// ===== QUOTE MANAGEMENT =====
function saveCurrentQuote() {
    if (!validateForm()) {
        alert('Please fix form errors before saving.');
        return;
    }
    
    const quoteData = captureQuoteData();
    const quoteNumber = quoteData.quoteNumber;
    
    // Find existing quote or create new
    let quote = savedQuotes.find(q => q.quoteNumber === quoteNumber);
    
    if (!quote) {
        // New quote
        quote = {
            quoteNumber: quoteNumber,
            createdAt: new Date().toISOString(),
            revisions: [],
            approved: false,
            approvedAt: null,
            approvedRevision: null
        };
        savedQuotes.push(quote);
    }
    
    // Add new revision
    const revision = {
        revisionNumber: quote.revisions.length + 1,
        savedAt: new Date().toISOString(),
        data: quoteData,
        notes: prompt('Add revision notes (optional):') || ''
    };
    
    quote.revisions.push(revision);
    quote.lastModified = new Date().toISOString();
    quote.customerName = quoteData.customerName;
    quote.jobName = quoteData.jobName;
    
    saveSavedQuotes();
    alert(`Quote ${quoteNumber} saved as revision ${revision.revisionNumber}!`);
}

function captureQuoteData() {
    // Capture all form data
    const laborItems = [];
    document.querySelectorAll('#laborItemsContainer .line-item').forEach(item => {
        laborItems.push({
            description: item.querySelector('.labor-description').value,
            hours: parseFloat(item.querySelector('.labor-hours').value) || 0,
            rate: parseFloat(item.querySelector('.labor-rate').value) || 0,
            total: parseFloat(item.querySelector('.labor-total').value.replace('$', '').replace(',', '')) || 0
        });
    });
    
    const equipmentItems = [];
    document.querySelectorAll('#equipmentItemsContainer .line-item').forEach(item => {
        equipmentItems.push({
            description: item.querySelector('.equipment-description').value,
            quantity: parseFloat(item.querySelector('.equipment-quantity').value) || 1,
            price: parseFloat(item.querySelector('.equipment-price').value) || 0,
            markup: parseFloat(item.querySelector('.equipment-markup').value) || 0,
            total: parseFloat(item.querySelector('.equipment-total').value.replace('$', '').replace(',', '')) || 0,
            inventoryId: item.querySelector('.equipment-inventory-id').value || ''
        });
    });
    
    return {
        quoteNumber: document.getElementById('quoteNumber').value,
        quoteDate: document.getElementById('quoteDate').value,
        validUntil: document.getElementById('validUntil').value,
        customerName: document.getElementById('customerName').value,
        jobName: document.getElementById('jobName').value,
        jobsiteAddress: document.getElementById('jobsiteAddress').value,
        scopeSummary: document.getElementById('scopeSummary').value,
        notes: document.getElementById('notes').value,
        exclusions: document.getElementById('exclusions').value,
        laborItems: laborItems,
        equipmentItems: equipmentItems,
        laborSubtotal: parseFloat(document.getElementById('laborSubtotal').textContent.replace('$', '').replace(',', '')) || 0,
        equipmentSubtotal: parseFloat(document.getElementById('equipmentSubtotal').textContent.replace('$', '').replace(',', '')) || 0,
        taxAmount: parseFloat(document.getElementById('taxAmount')?.textContent.replace('$', '').replace(',', '') || '0') || 0,
        grandTotal: parseFloat(document.getElementById('grandTotal').textContent.replace('$', '').replace(',', '')) || 0
    };
}

function loadQuoteData(quoteData) {
    // Load quote data into form
    document.getElementById('quoteNumber').value = quoteData.quoteNumber;
    document.getElementById('quoteDate').value = quoteData.quoteDate;
    document.getElementById('validUntil').value = quoteData.validUntil;
    document.getElementById('customerName').value = quoteData.customerName;
    document.getElementById('jobName').value = quoteData.jobName || '';
    document.getElementById('jobsiteAddress').value = quoteData.jobsiteAddress || '';
    document.getElementById('scopeSummary').value = quoteData.scopeSummary;
    document.getElementById('notes').value = quoteData.notes || '';
    document.getElementById('exclusions').value = quoteData.exclusions || '';
    
    // Clear existing items
    document.getElementById('laborItemsContainer').innerHTML = '';
    document.getElementById('equipmentItemsContainer').innerHTML = '';
    laborItemCounter = 0;
    equipmentItemCounter = 0;
    
    // Load labor items
    if (quoteData.laborItems) {
        quoteData.laborItems.forEach(item => {
            addLaborItem();
            const lastItem = document.querySelector('#laborItemsContainer .line-item:last-child');
            lastItem.querySelector('.labor-description').value = item.description;
            lastItem.querySelector('.labor-hours').value = item.hours;
            lastItem.querySelector('.labor-rate').value = item.rate;
        });
    }
    
    // Load equipment items
    if (quoteData.equipmentItems) {
        quoteData.equipmentItems.forEach(item => {
            addEquipmentItem();
            const lastItem = document.querySelector('#equipmentItemsContainer .line-item:last-child');
            lastItem.querySelector('.equipment-description').value = item.description;
            lastItem.querySelector('.equipment-quantity').value = item.quantity || 1;
            lastItem.querySelector('.equipment-price').value = item.price;
            lastItem.querySelector('.equipment-markup').value = item.markup || 0;
            if (item.inventoryId) {
                lastItem.querySelector('.equipment-inventory-id').value = item.inventoryId;
            }
        });
    }
    
    updateCalculations();
    showPage('proposal');
}

function showQuotesPage() {
    showPage('quotes');
    renderQuotesList();
}

function renderQuotesList() {
    const container = document.getElementById('quotesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (savedQuotes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #86868b; padding: 40px;">No saved quotes yet. Save a quote from the proposal form to see it here.</p>';
        return;
    }
    
    // Sort quotes by last modified (newest first)
    const sortedQuotes = [...savedQuotes].sort((a, b) => {
        return new Date(b.lastModified || b.createdAt) - new Date(a.lastModified || a.createdAt);
    });
    
    sortedQuotes.forEach(quote => {
        const quoteDiv = document.createElement('div');
        quoteDiv.style.marginBottom = '24px';
        quoteDiv.style.padding = '20px';
        quoteDiv.style.backgroundColor = '#ffffff';
        quoteDiv.style.border = '1px solid #d2d2d7';
        quoteDiv.style.borderRadius = '12px';
        
        const latestRevision = quote.revisions[quote.revisions.length - 1];
        const revisionCount = quote.revisions.length;
        const isApproved = quote.approved && quote.approvedRevision === revisionCount;
        const approvalStatus = isApproved 
            ? `<span style="background: #34c759; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.875em; font-weight: 600;">✓ Approved</span>`
            : `<span style="background: #f5f5f7; color: #86868b; padding: 4px 12px; border-radius: 6px; font-size: 0.875em;">Pending</span>`;
        
        quoteDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <h3 style="margin: 0; font-size: 1.25em;">${quote.quoteNumber}</h3>
                        ${approvalStatus}
                    </div>
                    <p style="margin: 4px 0; color: #86868b;">${quote.customerName || 'Unknown Customer'}</p>
                    ${quote.jobName ? `<p style="margin: 4px 0; color: #86868b;">Job: ${quote.jobName}</p>` : ''}
                    <p style="margin: 4px 0; color: #86868b; font-size: 0.875em;">
                        Created: ${formatDate(quote.createdAt.split('T')[0])} | 
                        Revisions: ${revisionCount}
                        ${isApproved ? ` | Approved: ${formatDate(quote.approvedAt.split('T')[0])}` : ''}
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${!isApproved ? `<button type="button" onclick="approveQuote('${quote.quoteNumber}')" 
                            style="background: #34c759; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.875em; font-weight: 600;">✓ Approve Quote</button>` : ''}
                    <button type="button" onclick="loadQuoteRevision('${quote.quoteNumber}', ${revisionCount - 1})" 
                            class="btn-primary" style="padding: 8px 16px; font-size: 0.875em;">Load Latest</button>
                    <button type="button" onclick="deleteQuote('${quote.quoteNumber}')" 
                            style="background: #ff3b30; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.875em;">Delete</button>
                </div>
            </div>
            <div style="border-top: 1px solid #f5f5f7; padding-top: 16px;">
                <strong style="display: block; margin-bottom: 12px; color: #1d1d1f;">Revisions:</strong>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${quote.revisions.map((rev, index) => {
                        const isThisApproved = quote.approved && quote.approvedRevision === rev.revisionNumber;
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${isThisApproved ? '#e8f5e9' : '#f5f5f7'}; border-radius: 8px; ${isThisApproved ? 'border: 2px solid #34c759;' : ''}">
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <strong>Revision ${rev.revisionNumber}</strong>
                                    ${isThisApproved ? `<span style="background: #34c759; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600;">APPROVED</span>` : ''}
                                </div>
                                <span style="color: #86868b; font-size: 0.875em; margin-left: 0;">
                                    ${formatDate(rev.savedAt.split('T')[0])} ${new Date(rev.savedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                ${rev.notes ? `<div style="color: #86868b; font-size: 0.875em; margin-top: 4px;">${rev.notes}</div>` : ''}
                                <div style="color: #86868b; font-size: 0.875em; margin-top: 4px;">
                                    Total: $${rev.data.grandTotal.toFixed(2)}
                                </div>
                            </div>
                            <button type="button" onclick="loadQuoteRevision('${quote.quoteNumber}', ${index})" 
                                    style="background: #0071e3; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;">Load</button>
                        </div>
                    `;
                    }).reverse().join('')}
                </div>
            </div>
        `;
        
        container.appendChild(quoteDiv);
    });
}

function loadQuoteRevision(quoteNumber, revisionIndex) {
    const quote = savedQuotes.find(q => q.quoteNumber === quoteNumber);
    if (!quote || !quote.revisions[revisionIndex]) {
        alert('Quote revision not found.');
        return;
    }
    
    if (confirm('Load this quote revision? Current form data will be replaced.')) {
        loadQuoteData(quote.revisions[revisionIndex].data);
    }
}

function approveQuote(quoteNumber) {
    const quote = savedQuotes.find(q => q.quoteNumber === quoteNumber);
    if (!quote || quote.revisions.length === 0) {
        alert('Quote not found or has no revisions.');
        return;
    }
    
    const latestRevision = quote.revisions[quote.revisions.length - 1];
    const revisionNumber = latestRevision.revisionNumber;
    
    // Check if already approved for this revision
    if (quote.approved && quote.approvedRevision === revisionNumber) {
        if (!confirm('This quote revision is already approved.\n\nDo you want to approve it again? (This will reduce inventory stock again)')) {
            return;
        }
    }
    
    if (!confirm(`Approve quote ${quoteNumber} (Revision ${revisionNumber})?\n\nThis will reduce inventory stock for all equipment items in this quote.`)) {
        return;
    }
    
    // Process equipment items and reduce inventory
    const equipmentItems = latestRevision.data.equipmentItems || [];
    const stockReductions = [];
    const skippedItems = [];
    let hasErrors = false;
    const errors = [];
    
    equipmentItems.forEach(item => {
        if (item.inventoryId) {
            // Find inventory item by ID
            const invItem = inventory.find(inv => inv.id === item.inventoryId);
            if (invItem) {
                const quantity = item.quantity || 1;
                if (invItem.stock >= quantity) {
                    invItem.stock -= quantity;
                    stockReductions.push({
                        name: invItem.name,
                        quantity: quantity,
                        remaining: invItem.stock
                    });
                } else {
                    hasErrors = true;
                    errors.push(`${invItem.name}: Insufficient stock (${invItem.stock} available, ${quantity} needed)`);
                }
            } else {
                skippedItems.push(item.description || 'Unknown item');
            }
        } else {
            // Equipment item not linked to inventory - skip stock reduction
            skippedItems.push(item.description || 'Unknown item');
        }
    });
    
    if (hasErrors) {
        alert('Cannot approve quote due to insufficient inventory:\n\n' + errors.join('\n'));
        return;
    }
    
    // Mark quote as approved
    quote.approved = true;
    quote.approvedAt = new Date().toISOString();
    quote.approvedRevision = revisionNumber;
    
    // Save changes
    saveInventory();
    saveSavedQuotes();
    renderQuotesList();
    renderInventoryList();
    
    // Show success message
    let message = `Quote ${quoteNumber} approved!\n\n`;
    if (stockReductions.length > 0) {
        message += 'Inventory updated:\n';
        stockReductions.forEach(reduction => {
            message += `• ${reduction.name}: -${reduction.quantity} (${reduction.remaining} remaining)\n`;
        });
    }
    if (skippedItems.length > 0) {
        message += `\nNote: ${skippedItems.length} equipment item(s) were not linked to inventory and stock was not reduced.`;
    }
    if (stockReductions.length === 0 && skippedItems.length === 0) {
        message += '(No equipment items in this quote)';
    }
    alert(message);
}

function deleteQuote(quoteNumber) {
    if (!confirm(`Delete quote ${quoteNumber} and all its revisions? This cannot be undone.`)) {
        return;
    }
    
    savedQuotes = savedQuotes.filter(q => q.quoteNumber !== quoteNumber);
    saveSavedQuotes();
    renderQuotesList();
    alert('Quote deleted.');
}

function exportAllQuotes() {
    const data = {
        quotes: savedQuotes,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('All quotes exported!');
}

function importQuotes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (data.quotes && Array.isArray(data.quotes)) {
                    if (confirm(`Import ${data.quotes.length} quote(s)? This will merge with existing quotes.`)) {
                        // Merge quotes (update existing, add new)
                        data.quotes.forEach(importedQuote => {
                            const existingIndex = savedQuotes.findIndex(q => q.quoteNumber === importedQuote.quoteNumber);
                            if (existingIndex >= 0) {
                                // Merge revisions
                                const existing = savedQuotes[existingIndex];
                                importedQuote.revisions.forEach(rev => {
                                    if (!existing.revisions.find(r => r.savedAt === rev.savedAt)) {
                                        existing.revisions.push(rev);
                                    }
                                });
                                existing.revisions.sort((a, b) => a.revisionNumber - b.revisionNumber);
                                existing.lastModified = importedQuote.lastModified || existing.lastModified;
                            } else {
                                savedQuotes.push(importedQuote);
                            }
                        });
                        
                        saveSavedQuotes();
                        renderQuotesList();
                        alert('Quotes imported successfully!');
                    }
                } else {
                    alert('Invalid quotes file format.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing quotes. Please check the file format.');
            }
        }
    };
    input.click();
}

// ===== UTILITIES =====
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generateQuoteNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${year}${month}${day}-${random}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function clearForm() {
    if (confirm('Create a new quote? This will clear all current data.')) {
        document.getElementById('quoteForm').querySelector('form')?.reset();
        document.getElementById('laborItemsContainer').innerHTML = '';
        document.getElementById('equipmentItemsContainer').innerHTML = '';
        laborItemCounter = 0;
        equipmentItemCounter = 0;
        initializeQuote();
    }
}

// ===== INVENTORY MANAGEMENT =====
function showInventoryManager() {
    showPage('inventory');
    renderCategoriesList();
    renderInventoryList();
}

function closeInventoryManager() {
    // Not needed with new navigation, but keep for compatibility
}

function renderInventoryList() {
    const container = document.getElementById('inventoryList');
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('inventoryCategoryFilter')?.value || 'all';
    
    container.innerHTML = '';
    
    // Add search and filter UI if not exists
    if (!document.getElementById('inventorySearch')) {
        const searchDiv = document.createElement('div');
        searchDiv.style.marginBottom = '20px';
        searchDiv.innerHTML = `
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <input type="text" id="inventorySearch" placeholder="🔍 Search inventory..." 
                       style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #d2d2d7; border-radius: 10px; font-size: 1em;"
                       oninput="renderInventoryList()">
                <select id="inventoryCategoryFilter" onchange="renderInventoryList()" 
                        style="padding: 12px 16px; border: 1px solid #d2d2d7; border-radius: 10px; font-size: 1em; background: white;">
                    <option value="all">All Categories</option>
                </select>
                <select id="inventorySortBy" onchange="renderInventoryList()" 
                        style="padding: 12px 16px; border: 1px solid #d2d2d7; border-radius: 10px; font-size: 1em; background: white;">
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                    <option value="price">Sort by Price</option>
                    <option value="stock">Sort by Stock</option>
                </select>
            </div>
        `;
        container.parentElement.insertBefore(searchDiv, container);
        updateCategoryDropdowns(); // Populate the filter dropdown
    }
    
    // Filter inventory
    let filteredInventory = inventory.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.model.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    // Sort inventory
    const sortBy = document.getElementById('inventorySortBy')?.value || 'name';
    filteredInventory.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'stock') return b.stock - a.stock;
        return 0;
    });
    
    if (filteredInventory.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No items found. Try adjusting your search or filters.</p>';
        return;
    }
    
    filteredInventory.forEach(item => {
        const finalPrice = calculateFinalPrice(item);
        const stockClass = item.stock <= 2 ? 'low-stock' : item.stock <= 5 ? 'medium-stock' : 'good-stock';
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <div class="inventory-item-info">
                <div class="inventory-item-header">
                    <strong>${item.name}</strong>
                    <span class="inventory-model">Model: ${item.model}</span>
                    </div>
                <div class="inventory-item-details">
                    <span>${item.description}</span>
                    <span class="inventory-category">${item.category}</span>
                </div>
                <div class="inventory-item-pricing">
                    <span>Base: $${item.price.toFixed(2)}/day</span>
                    ${item.discount > 0 ? `<span>Discount: ${item.discount}%</span>` : ''}
                    ${item.multiplier !== 1.0 ? `<span>Multiplier: ${item.multiplier}x</span>` : ''}
                    <strong>Final: $${finalPrice.toFixed(2)}/day</strong>
                </div>
                <div class="inventory-item-stock">
                    <span class="stock-badge ${stockClass}">Stock: ${item.stock}</span>
                </div>
            </div>
            <div class="inventory-item-actions">
                <button class="btn-edit" onclick="editInventoryItem('${item.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteInventoryItem('${item.id}')">Delete</button>
                </div>
            `;
        container.appendChild(itemDiv);
    });
}

function calculateFinalPrice(item) {
    let price = item.price;
    if (item.discount > 0) {
        price = price * (1 - item.discount / 100);
    }
    if (item.multiplier !== 1.0) {
        price = price * item.multiplier;
    }
    return price;
}

function showAddInventoryForm() {
    document.getElementById('inventoryFormTitle').textContent = 'Add New Inventory Item';
    document.getElementById('inventoryForm').reset();
    document.getElementById('inventoryForm').dataset.mode = 'add';
    updateCategoryDropdowns(); // Ensure category dropdown is up to date
    document.getElementById('inventoryFormModal').style.display = 'block';
}

function closeInventoryForm() {
    document.getElementById('inventoryFormModal').style.display = 'none';
}

function saveInventoryItem() {
    const form = document.getElementById('inventoryForm');
    const mode = form.dataset.mode;
    const formData = {
        name: document.getElementById('invName').value.trim(),
        model: document.getElementById('invModel').value.trim(),
        description: document.getElementById('invDescription').value.trim(),
        price: parseFloat(document.getElementById('invPrice').value) || 0,
        discount: parseFloat(document.getElementById('invDiscount').value) || 0,
        multiplier: parseFloat(document.getElementById('invMultiplier').value) || 1.0,
        stock: parseInt(document.getElementById('invStock').value) || 0,
        category: document.getElementById('invCategory').value || 'General'
    };
    
    // Validation
    if (!formData.name || !formData.model) {
        alert('Name and Model are required.');
        return;
    }
    
    if (mode === 'add') {
        // Add new item
        const newItem = {
            id: 'inv-' + Date.now(),
            ...formData
        };
        inventory.push(newItem);
        } else {
        // Edit existing item
        const itemId = form.dataset.itemId;
        const index = inventory.findIndex(item => item.id === itemId);
        if (index >= 0) {
            inventory[index] = { ...inventory[index], ...formData };
        }
    }
    
    saveInventory();
    renderInventoryList();
    closeInventoryForm();
    
    // Refresh equipment dropdowns
    refreshEquipmentDropdowns();
}

function editInventoryItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    updateCategoryDropdowns(); // Ensure category dropdown is up to date
    
    document.getElementById('inventoryFormTitle').textContent = 'Edit Inventory Item';
    document.getElementById('invName').value = item.name;
    document.getElementById('invModel').value = item.model;
    document.getElementById('invDescription').value = item.description;
    document.getElementById('invPrice').value = item.price;
    document.getElementById('invDiscount').value = item.discount || 0;
    document.getElementById('invMultiplier').value = item.multiplier || 1.0;
    document.getElementById('invStock').value = item.stock;
    document.getElementById('invCategory').value = item.category || 'General';
    
    document.getElementById('inventoryForm').dataset.mode = 'edit';
    document.getElementById('inventoryForm').dataset.itemId = itemId;
    document.getElementById('inventoryFormModal').style.display = 'block';
}

function deleteInventoryItem(itemId) {
    if (!confirm('Delete this inventory item? This cannot be undone.')) return;
    
    inventory = inventory.filter(item => item.id !== itemId);
    saveInventory();
    renderInventoryList();
    refreshEquipmentDropdowns();
}

function refreshEquipmentDropdowns() {
    // Refresh all equipment item dropdowns
    document.querySelectorAll('.equipment-inventory-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="">-- Select from Inventory --</option>
            ${inventory.map(inv => `<option value="${inv.id}">${inv.name} (${inv.model}) - $${inv.price.toFixed(2)}</option>`).join('')}
        `;
        select.value = currentValue;
    });
}

// ===== CATEGORY MANAGEMENT =====
function renderCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    inventoryCategories.forEach(category => {
        const div = document.createElement('div');
        div.style.padding = '12px 16px';
        div.style.backgroundColor = '#ffffff';
        div.style.border = '1px solid #d2d2d7';
        div.style.borderRadius = '10px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <span style="font-weight: 500;">${category}</span>
            <div style="display: flex; gap: 8px;">
                <button type="button" onclick="editCategory('${category}')" 
                        style="background: #0071e3; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;">Edit</button>
                <button type="button" onclick="removeCategory('${category}')" 
                        style="background: #ff3b30; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function showAddCategoryForm() {
    const categoryName = prompt('Enter category name:');
    if (!categoryName || !categoryName.trim()) return;
    
    const trimmedName = categoryName.trim();
    
    if (inventoryCategories.includes(trimmedName)) {
        alert('This category already exists.');
        return;
    }
    
    inventoryCategories.push(trimmedName);
    saveCategories();
    renderCategoriesList();
}

function editCategory(oldName) {
    const newName = prompt(`Edit category name:\n\nCurrent: ${oldName}`, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    
    const trimmedName = newName.trim();
    
    if (inventoryCategories.includes(trimmedName)) {
        alert('This category name already exists.');
        return;
    }
    
    // Update category in array
    const index = inventoryCategories.indexOf(oldName);
    if (index >= 0) {
        inventoryCategories[index] = trimmedName;
        
        // Update all inventory items with this category
        inventory.forEach(item => {
            if (item.category === oldName) {
                item.category = trimmedName;
            }
        });
        
        saveInventory();
        saveCategories();
        renderCategoriesList();
        renderInventoryList();
    }
}

function removeCategory(categoryName) {
    // Check if any items use this category
    const itemsUsingCategory = inventory.filter(item => item.category === categoryName);
    
    if (itemsUsingCategory.length > 0) {
        if (!confirm(`This category is used by ${itemsUsingCategory.length} item(s).\n\nRemoving it will set those items to "General" category.\n\nContinue?`)) {
            return;
        }
        
        // Set items to General category
        itemsUsingCategory.forEach(item => {
            item.category = 'General';
        });
        
        // Ensure General category exists
        if (!inventoryCategories.includes('General')) {
            inventoryCategories.push('General');
        }
        
        saveInventory();
    }
    
    // Remove category
    inventoryCategories = inventoryCategories.filter(cat => cat !== categoryName);
    
    // Ensure at least one category exists
    if (inventoryCategories.length === 0) {
        inventoryCategories.push('General');
    }
    
    saveCategories();
    renderCategoriesList();
    renderInventoryList();
}

// ===== INVENTORY EXPORT/IMPORT =====
function exportInventory() {
    const data = {
        inventory: inventory,
        inventoryCategories: inventoryCategories,
        savedQuotes: savedQuotes,
        scopeTemplates: SCOPE_TEMPLATES,
        notesTemplates: NOTES_TEMPLATES,
        exclusionsTemplates: EXCLUSIONS_TEMPLATES,
        appConfig: appConfig,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = sharedStoragePath ? 'proposal-data-sync.json' : `proposal-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (sharedStoragePath) {
        alert(`Data exported! Save "proposal-data-sync.json" to:\n${sharedStoragePath}\n\nOther users can import from this location.`);
    } else {
        alert('Data exported! Save this file to backup or share with others.');
    }
}

function importInventory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Handle full sync file (from shared storage)
                if (data.inventory && data.scopeTemplates) {
                    if (confirm('Import complete data (inventory + templates + categories + quotes)? This will merge with your current data.')) {
                        inventory = data.inventory;
                        if (data.inventoryCategories && Array.isArray(data.inventoryCategories)) {
                            inventoryCategories = data.inventoryCategories;
                            saveCategories();
                        }
                        if (data.savedQuotes && Array.isArray(data.savedQuotes)) {
                            // Merge quotes (update existing, add new)
                            data.savedQuotes.forEach(importedQuote => {
                                const existingIndex = savedQuotes.findIndex(q => q.quoteNumber === importedQuote.quoteNumber);
                                if (existingIndex >= 0) {
                                    // Merge revisions
                                    const existing = savedQuotes[existingIndex];
                                    importedQuote.revisions.forEach(rev => {
                                        if (!existing.revisions.find(r => r.savedAt === rev.savedAt)) {
                                            existing.revisions.push(rev);
                                        }
                                    });
                                    existing.revisions.sort((a, b) => a.revisionNumber - b.revisionNumber);
                                    existing.lastModified = importedQuote.lastModified || existing.lastModified;
                                } else {
                                    savedQuotes.push(importedQuote);
                                }
                            });
                            saveSavedQuotes();
                        }
                        SCOPE_TEMPLATES = data.scopeTemplates || SCOPE_TEMPLATES;
                        NOTES_TEMPLATES = data.notesTemplates || NOTES_TEMPLATES;
                        EXCLUSIONS_TEMPLATES = data.exclusionsTemplates || EXCLUSIONS_TEMPLATES;
                        if (data.appConfig) {
                            appConfig = { ...appConfig, ...data.appConfig };
                            localStorage.setItem('appConfig', JSON.stringify(appConfig));
                        }
                        saveInventory();
                        saveTemplates();
                        renderCategoriesList();
                        renderInventoryList();
                        updateTemplateDropdowns();
                        refreshEquipmentDropdowns();
                        alert('Data imported successfully from shared storage!');
                    }
                } else if (data.inventory && Array.isArray(data.inventory)) {
                    // Handle inventory-only file
                    if (confirm(`Import ${data.inventory.length} inventory items? This will replace your current inventory.`)) {
                        inventory = data.inventory;
                        saveInventory();
                        renderInventoryList();
                        refreshEquipmentDropdowns();
                        alert('Inventory imported successfully!');
                    }
                } else {
                    alert('Invalid data file format.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing data. Please check the file format.');
            }
        }
    };
    input.click();
}

// ===== TEMPLATE MANAGEMENT =====
function showTemplateManager() {
    showPage('templates');
}

function closeTemplateManager() {
    // Not needed with new navigation, but keep for compatibility
}

function renderTemplateLists() {
    // Render Scope Templates
    const scopeList = document.getElementById('scopeTemplatesList');
    scopeList.innerHTML = '';
    Object.keys(SCOPE_TEMPLATES).forEach(key => {
        if (key === 'custom') return;
        const div = document.createElement('div');
        div.style.marginBottom = '20px';
        div.style.padding = '16px';
        div.style.backgroundColor = '#ffffff';
        div.style.border = '1px solid #d2d2d7';
        div.style.borderRadius = '10px';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="display: block; font-weight: 600; margin: 0;">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <button type="button" onclick="removeTemplate('scope', '${key}')" 
                        style="background: #ff3b30; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;"
                        onmouseover="this.style.background='#ff2d20'" 
                        onmouseout="this.style.background='#ff3b30'">Remove</button>
            </div>
            <textarea id="scope-${key}" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d2d2d7; border-radius: 8px; font-size: 0.9375em; font-family: inherit; resize: vertical;">${SCOPE_TEMPLATES[key]}</textarea>
        `;
        scopeList.appendChild(div);
    });
    // Add Template button for Scope
    const addScopeBtn = document.createElement('button');
    addScopeBtn.type = 'button';
    addScopeBtn.className = 'btn-secondary';
    addScopeBtn.textContent = '+ Add Scope Template';
    addScopeBtn.onclick = () => addTemplate('scope');
    addScopeBtn.style.marginTop = '10px';
    scopeList.appendChild(addScopeBtn);
    
    // Render Notes Templates
    const notesList = document.getElementById('notesTemplatesList');
    notesList.innerHTML = '';
    Object.keys(NOTES_TEMPLATES).forEach(key => {
        if (key === 'custom') return;
        const div = document.createElement('div');
        div.style.marginBottom = '20px';
        div.style.padding = '16px';
        div.style.backgroundColor = '#ffffff';
        div.style.border = '1px solid #d2d2d7';
        div.style.borderRadius = '10px';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="display: block; font-weight: 600; margin: 0;">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <button type="button" onclick="removeTemplate('notes', '${key}')" 
                        style="background: #ff3b30; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;"
                        onmouseover="this.style.background='#ff2d20'" 
                        onmouseout="this.style.background='#ff3b30'">Remove</button>
            </div>
            <textarea id="notes-${key}" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d2d2d7; border-radius: 8px; font-size: 0.9375em; font-family: inherit; resize: vertical;">${NOTES_TEMPLATES[key]}</textarea>
        `;
        notesList.appendChild(div);
    });
    // Add Template button for Notes
    const addNotesBtn = document.createElement('button');
    addNotesBtn.type = 'button';
    addNotesBtn.className = 'btn-secondary';
    addNotesBtn.textContent = '+ Add Notes Template';
    addNotesBtn.onclick = () => addTemplate('notes');
    addNotesBtn.style.marginTop = '10px';
    notesList.appendChild(addNotesBtn);
    
    // Render Exclusions Templates
    const exclusionsList = document.getElementById('exclusionsTemplatesList');
    exclusionsList.innerHTML = '';
    Object.keys(EXCLUSIONS_TEMPLATES).forEach(key => {
        if (key === 'custom') return;
        const div = document.createElement('div');
        div.style.marginBottom = '20px';
        div.style.padding = '16px';
        div.style.backgroundColor = '#ffffff';
        div.style.border = '1px solid #d2d2d7';
        div.style.borderRadius = '10px';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="display: block; font-weight: 600; margin: 0;">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <button type="button" onclick="removeTemplate('exclusions', '${key}')" 
                        style="background: #ff3b30; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875em;"
                        onmouseover="this.style.background='#ff2d20'" 
                        onmouseout="this.style.background='#ff3b30'">Remove</button>
                </div>
            <textarea id="exclusions-${key}" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d2d2d7; border-radius: 8px; font-size: 0.9375em; font-family: inherit; resize: vertical;">${EXCLUSIONS_TEMPLATES[key]}</textarea>
        `;
        exclusionsList.appendChild(div);
    });
    // Add Template button for Exclusions
    const addExclusionsBtn = document.createElement('button');
    addExclusionsBtn.type = 'button';
    addExclusionsBtn.className = 'btn-secondary';
    addExclusionsBtn.textContent = '+ Add Exclusions Template';
    addExclusionsBtn.onclick = () => addTemplate('exclusions');
    addExclusionsBtn.style.marginTop = '10px';
    exclusionsList.appendChild(addExclusionsBtn);
}

function saveAllTemplates() {
    // Save Scope Templates
    Object.keys(SCOPE_TEMPLATES).forEach(key => {
        if (key !== 'custom') {
            const textarea = document.getElementById(`scope-${key}`);
            if (textarea) {
                SCOPE_TEMPLATES[key] = textarea.value.trim();
            }
        }
    });
    
    // Save Notes Templates
    Object.keys(NOTES_TEMPLATES).forEach(key => {
        if (key !== 'custom') {
            const textarea = document.getElementById(`notes-${key}`);
            if (textarea) {
                NOTES_TEMPLATES[key] = textarea.value.trim();
            }
        }
    });
    
    // Save Exclusions Templates
    Object.keys(EXCLUSIONS_TEMPLATES).forEach(key => {
        if (key !== 'custom') {
            const textarea = document.getElementById(`exclusions-${key}`);
            if (textarea) {
                EXCLUSIONS_TEMPLATES[key] = textarea.value.trim();
            }
        }
    });
    
    saveTemplates();
    updateTemplateDropdowns();
    alert('Templates saved successfully!');
}

function addTemplate(type) {
    const templateName = prompt(`Enter a name for the new ${type} template:`);
    if (!templateName || !templateName.trim()) return;
    
    // Sanitize key: lowercase, replace spaces with underscores, remove special characters
    let key = templateName.trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    
    // Ensure key is not empty and doesn't start with a number
    if (!key || /^\d/.test(key)) {
        alert('Template name must start with a letter. Please try again.');
        return;
    }
    
    // Check if template already exists
    let templateExists = false;
    if (type === 'scope' && SCOPE_TEMPLATES[key]) templateExists = true;
    if (type === 'notes' && NOTES_TEMPLATES[key]) templateExists = true;
    if (type === 'exclusions' && EXCLUSIONS_TEMPLATES[key]) templateExists = true;
    
    if (templateExists) {
        alert('A template with this name already exists. Please choose a different name.');
        return;
    }
    
    // Add new template
    if (type === 'scope') {
        SCOPE_TEMPLATES[key] = '';
    } else if (type === 'notes') {
        NOTES_TEMPLATES[key] = '';
    } else if (type === 'exclusions') {
        EXCLUSIONS_TEMPLATES[key] = '';
    }
    
    saveTemplates();
    renderTemplateLists();
    updateTemplateDropdowns();
}

function removeTemplate(type, key) {
    if (key === 'custom') {
        alert('Cannot remove the "custom" template.');
        return;
    }
    
    // Count existing templates (excluding 'custom')
    let templateCount = 0;
    if (type === 'scope') {
        templateCount = Object.keys(SCOPE_TEMPLATES).filter(k => k !== 'custom').length;
        if (templateCount <= 1) {
            alert('Cannot remove the last template. You must have at least one template.');
            return;
        }
        if (confirm(`Remove the "${key}" template? This cannot be undone.`)) {
            delete SCOPE_TEMPLATES[key];
        }
    } else if (type === 'notes') {
        templateCount = Object.keys(NOTES_TEMPLATES).filter(k => k !== 'custom').length;
        if (templateCount <= 1) {
            alert('Cannot remove the last template. You must have at least one template.');
            return;
        }
        if (confirm(`Remove the "${key}" template? This cannot be undone.`)) {
            delete NOTES_TEMPLATES[key];
        }
    } else if (type === 'exclusions') {
        templateCount = Object.keys(EXCLUSIONS_TEMPLATES).filter(k => k !== 'custom').length;
        if (templateCount <= 1) {
            alert('Cannot remove the last template. You must have at least one template.');
            return;
        }
        if (confirm(`Remove the "${key}" template? This cannot be undone.`)) {
            delete EXCLUSIONS_TEMPLATES[key];
        }
    }
    
    saveTemplates();
    renderTemplateLists();
    updateTemplateDropdowns();
}

function resetTemplatesToDefaults() {
    if (confirm('Reset all templates to default values? This cannot be undone.')) {
        SCOPE_TEMPLATES = JSON.parse(JSON.stringify(DEFAULT_SCOPE_TEMPLATES));
        NOTES_TEMPLATES = JSON.parse(JSON.stringify(DEFAULT_NOTES_TEMPLATES));
        EXCLUSIONS_TEMPLATES = JSON.parse(JSON.stringify(DEFAULT_EXCLUSIONS_TEMPLATES));
        saveTemplates();
        renderTemplateLists();
        updateTemplateDropdowns();
        alert('Templates reset to defaults!');
    }
}

// ===== SHARED STORAGE SYNC =====
async function syncToSharedStorage() {
    if (!sharedStoragePath && !sharedStorageHandle) return;
    
    try {
        const data = {
            inventory: inventory,
            inventoryCategories: inventoryCategories,
            savedQuotes: savedQuotes,
            scopeTemplates: SCOPE_TEMPLATES,
            notesTemplates: NOTES_TEMPLATES,
            exclusionsTemplates: EXCLUSIONS_TEMPLATES,
            appConfig: appConfig,
            lastSynced: new Date().toISOString(),
            version: '1.0'
        };
        
        const json = JSON.stringify(data, null, 2);
        
        // If we have a directory handle, write directly to the folder
        if (sharedStorageHandle) {
            try {
                const fileHandle = await sharedStorageHandle.getFileHandle('proposal-data-sync.json', { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(json);
                await writable.close();
                console.log('Data synced directly to selected folder via File System Access API');
                return; // Success, exit early
            } catch (handleError) {
                console.warn('Could not write via directory handle, falling back to download:', handleError);
                // Fall through to download method
            }
        }
        
        // Fallback: download file for manual placement
        localStorage.setItem('pendingSync', json);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proposal-data-sync.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (sharedStoragePath && !sharedStoragePath.startsWith('[Selected:')) {
            console.log('Data ready for sync. Save the downloaded file to:', sharedStoragePath);
        } else {
            console.log('Data downloaded. Place it in your shared folder.');
        }
    } catch (error) {
        console.error('Sync error:', error);
        alert('Error syncing to shared storage. Check console for details.');
    }
}

async function syncFromSharedStorage() {
    if (!sharedStoragePath && !sharedStorageHandle) return;
    
    // If we have a directory handle, try to read directly
    if (sharedStorageHandle) {
        try {
            const fileHandle = await sharedStorageHandle.getFileHandle('proposal-data-sync.json');
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Load the data
            if (data.inventory) inventory = data.inventory;
            if (data.inventoryCategories) inventoryCategories = data.inventoryCategories;
            if (data.scopeTemplates) SCOPE_TEMPLATES = data.scopeTemplates;
            if (data.notesTemplates) NOTES_TEMPLATES = data.notesTemplates;
            if (data.exclusionsTemplates) EXCLUSIONS_TEMPLATES = data.exclusionsTemplates;
            if (data.savedQuotes) savedQuotes = data.savedQuotes;
            if (data.appConfig) appConfig = data.appConfig;
            
            // Save to localStorage
            saveInventory();
            saveCategories();
            saveTemplates();
            saveSavedQuotes();
            if (appConfig) localStorage.setItem('appConfig', JSON.stringify(appConfig));
            
            // Refresh UI
            renderInventoryList();
            renderTemplateLists();
            renderQuotesList();
            refreshEquipmentDropdowns();
            updateTemplateDropdowns();
            populateConfigForm();
            
            alert('Data synced successfully from shared folder!');
            return;
        } catch (handleError) {
            if (handleError.name === 'NotFoundError') {
                alert('No sync file found in the selected folder. Make sure "proposal-data-sync.json" exists.');
            } else {
                console.error('Error reading from directory handle:', handleError);
                // Fall through to manual import message
            }
        }
    }
    
    // Fallback: guide user to manual import
    alert('To sync from shared storage:\n1. Open the shared folder\n2. Find "proposal-data-sync.json"\n3. Use "Import" function in Inventory or Settings');
}

async function selectStorageFolder() {
    // Check if File System Access API is supported
    if ('showDirectoryPicker' in window) {
        try {
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            
            // Store the directory handle for file operations
            sharedStorageHandle = directoryHandle;
            
            // Get the folder name
            const folderName = directoryHandle.name;
            
            // Update the input field with folder name
            const pathInput = document.getElementById('sharedStoragePath');
            if (pathInput) {
                // Show folder name (browsers don't expose full paths for security)
                pathInput.value = `[Selected: ${folderName}]`;
                pathInput.title = `Folder selected via File System Access API. Folder name: ${folderName}`;
            }
            
            // Save the selection (we'll store a reference that we can use)
            const storageSettings = {
                sharedStoragePath: `[Selected: ${folderName}]`,
                autoSyncEnabled: autoSyncEnabled,
                syncOnStartup: syncOnStartup,
                hasDirectoryHandle: true // Flag to indicate we have a handle
            };
            localStorage.setItem('storageSettings', JSON.stringify(storageSettings));
            
            alert(`Folder selected: "${folderName}"\n\nThe folder has been selected and will be used for file operations.\n\nNote: The directory handle will be used for direct file access when available.`);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled the picker
                return;
            }
            console.error('Error selecting folder:', error);
            alert('Error selecting folder. Please enter the path manually.\n\nError: ' + error.message);
        }
    } else {
        // Fallback for browsers that don't support File System Access API
        alert('Folder picker not supported in this browser.\n\nPlease enter the folder path manually, or use a modern browser like Chrome or Edge.');
        
        // Focus the input field for manual entry
        const pathInput = document.getElementById('sharedStoragePath');
        if (pathInput) {
            pathInput.focus();
        }
    }
}

function testStorageConnection() {
    const path = document.getElementById('sharedStoragePath').value.trim();
    if (!path) {
        alert('Please enter a storage path first.');
        return;
    }
    
    // Since we're browser-based, we can't directly access file system
    // But we can guide the user
    alert(`Storage Path: ${path}\n\nFor multi-user sync:\n1. All users should point to the same folder\n2. Use Export/Import to sync data\n3. Save exported files to this folder\n4. Other users can import from this folder\n\nNote: Browser security prevents direct file system access. Use Export/Import for manual sync.`);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const inventoryFormModal = document.getElementById('inventoryFormModal');
    if (event.target === inventoryFormModal) {
        closeInventoryForm();
    }
}
