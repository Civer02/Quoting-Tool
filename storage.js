// Storage Management System
// Handles file-based storage in the repository's data folder

const STORAGE_BASE = 'data/';
const QUOTES_FOLDER = STORAGE_BASE + 'quotes/';
const EQUIPMENT_FOLDER = STORAGE_BASE + 'equipment/';
const TEMPLATES_FOLDER = STORAGE_BASE + 'templates/';

// Equipment/Parts Data Structure:
// {
//   vendor: string,
//   item: string (part number),
//   description: string,
//   price: number,
//   inventory: number (optional, if inventory tracking enabled)
// }

// Load equipment/parts from file
async function loadEquipment() {
    try {
        // Try to load from file first (requires local server)
        const response = await fetch(EQUIPMENT_FOLDER + 'equipment.json');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.log('Could not load from file, using localStorage:', e);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('equipment');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Return empty array if nothing found
    return [];
}

// Save equipment/parts to file
async function saveEquipment(equipment) {
    // Always save to localStorage as backup
    localStorage.setItem('equipment', JSON.stringify(equipment));
    
    // Try to save to file (requires local server or File System Access API)
    try {
        if ('showSaveFilePicker' in window) {
            // Use File System Access API
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'equipment.json',
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] }
                }],
                startIn: 'documents'
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(equipment, null, 2));
            await writable.close();
        } else {
            // Fallback: Download file
            downloadJSONFile(equipment, 'equipment.json', EQUIPMENT_FOLDER);
        }
    } catch (e) {
        console.log('File save error, data saved to localStorage:', e);
        // Still works - data is in localStorage
    }
}

// Load quotes from file
async function loadQuotes() {
    try {
        const response = await fetch(QUOTES_FOLDER + 'quotes.json');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.log('Could not load quotes from file, using localStorage:', e);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('quotes');
    if (stored) {
        return JSON.parse(stored);
    }
    
    return [];
}

// Save quotes to file
async function saveQuotes(quotes) {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    try {
        if ('showSaveFilePicker' in window) {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'quotes.json',
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] }
                }],
                startIn: 'documents'
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(quotes, null, 2));
            await writable.close();
        } else {
            downloadJSONFile(quotes, 'quotes.json', QUOTES_FOLDER);
        }
    } catch (e) {
        console.log('File save error, data saved to localStorage:', e);
    }
}

// Load templates from file
async function loadTemplates() {
    try {
        const response = await fetch(TEMPLATES_FOLDER + 'templates.json');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.log('Could not load templates from file, using localStorage:', e);
    }
    
    const stored = localStorage.getItem('templates');
    if (stored) {
        return JSON.parse(stored);
    }
    
    return [];
}

// Save templates to file
async function saveTemplates(templates) {
    // Always save to localStorage as backup
    localStorage.setItem('templates', JSON.stringify(templates));
    console.log('Templates saved to localStorage');
    
    // Try to save via local server first (if available)
    try {
        // This would require a server-side endpoint, but we'll try a simple approach
        // For now, we'll use the download method which works in all scenarios
    } catch (e) {
        console.log('Server save not available');
    }
    
    // Automatically download the file - user should save it to data/templates/templates.json
    // This ensures templates are saved to the repository
    downloadJSONFile(templates, 'templates.json', 'data/templates/');
}

// Download JSON file (for manual sync to repository)
function downloadJSONFile(data, filename, folder) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instruction to user
    const message = `File "${filename}" downloaded. Please save it to: ${folder}${filename} in your repository.`;
    console.log(message);
    
    // Show a brief notification (non-blocking)
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; max-width: 300px;';
    notification.textContent = `File downloaded. Save to: ${folder}${filename}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Import equipment from file
async function importEquipmentFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                try {
                    const data = JSON.parse(text);
                    resolve(Array.isArray(data) ? data : []);
                } catch (e) {
                    reject(new Error('Invalid JSON file'));
                }
            } else {
                reject(new Error('No file selected'));
            }
        };
        input.click();
    });
}

// Import quotes from file
async function importQuotesFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                try {
                    const data = JSON.parse(text);
                    resolve(Array.isArray(data) ? data : []);
                } catch (e) {
                    reject(new Error('Invalid JSON file'));
                }
            } else {
                reject(new Error('No file selected'));
            }
        };
        input.click();
    });
}

// Import templates from file
async function importTemplatesFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                try {
                    const data = JSON.parse(text);
                    resolve(Array.isArray(data) ? data : []);
                } catch (e) {
                    reject(new Error('Invalid JSON file'));
                }
            } else {
                reject(new Error('No file selected'));
            }
        };
        input.click();
    });
}

// Export all data for backup
async function exportAllData() {
    const equipment = await loadEquipment();
    const quotes = await loadQuotes();
    const templates = await loadTemplates();
    const config = localStorage.getItem('appConfig');
    
    const allData = {
        equipment: equipment,
        quotes: quotes,
        templates: templates,
        config: config ? JSON.parse(config) : null,
        exportDate: new Date().toISOString()
    };
    
    downloadJSONFile(allData, 'quoting-tool-backup.json', '');
}

// Import all data from backup
async function importAllData() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                try {
                    const data = JSON.parse(text);
                    
                    if (data.equipment) await saveEquipment(data.equipment);
                    if (data.quotes) await saveQuotes(data.quotes);
                    if (data.templates) await saveTemplates(data.templates);
                    if (data.config) localStorage.setItem('appConfig', JSON.stringify(data.config));
                    
                    resolve(data);
                } catch (e) {
                    reject(new Error('Invalid backup file'));
                }
            } else {
                reject(new Error('No file selected'));
            }
        };
        input.click();
    });
}
