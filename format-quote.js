// Format Quote - Template Management
let templates = [];
let addTemplatePart;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        templates = await loadTemplates();
    } catch (e) {
        console.error('Error loading templates:', e);
        templates = [];
    }
    
    // Load company info from config
    try {
        const appConfig = JSON.parse(localStorage.getItem('appConfig') || '{}');
        if (appConfig) {
            document.getElementById('templateCompanyName').value = appConfig.companyName || '';
            document.getElementById('templateCompanyAddress').value = appConfig.companyAddress || '';
            document.getElementById('templateCompanyPhone').value = appConfig.companyPhone || '';
            document.getElementById('templateCompanyEmail').value = appConfig.companyEmail || '';
            document.getElementById('templateCompanyWebsite').value = appConfig.companyWebsite || '';
        }
    } catch (e) {
        console.error('Error loading config:', e);
    }
    
    // Define addTemplatePart function
    addTemplatePart = function() {
        console.log('addTemplatePart called');
        const container = document.getElementById('templatePartsContainer');
        if (!container) {
            console.error('templatePartsContainer not found');
            return;
        }
        const partDiv = document.createElement('div');
        partDiv.className = 'part-line-item';
        partDiv.style.marginBottom = '15px';
        partDiv.style.padding = '15px';
        partDiv.style.border = '1px solid #ddd';
        partDiv.style.borderRadius = '6px';
        partDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Part Number</label>
                    <input type="text" class="template-part-number" placeholder="Part number">
                </div>
                <div class="form-group" style="flex: 2;">
                    <label>Description</label>
                    <input type="text" class="template-part-description" placeholder="Description">
                </div>
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" class="template-part-price" step="0.01" min="0" placeholder="0.00" value="0">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="template-part-quantity" step="1" min="1" value="1">
                </div>
                <div class="form-group" style="flex: 0 0 auto;">
                    <label>&nbsp;</label>
                    <button type="button" class="btn-secondary" onclick="this.closest('.part-line-item').remove()" style="padding: 12px;">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(partDiv);
        console.log('Part added, total parts:', container.children.length);
    };
    
    // Make addTemplatePart available globally
    window.addTemplatePart = addTemplatePart;
    
    // Event listeners
    document.getElementById('saveTemplate').addEventListener('click', saveTemplate);
    document.getElementById('loadTemplateToEdit').addEventListener('click', loadTemplateToEdit);
    document.getElementById('deleteTemplate').addEventListener('click', deleteTemplate);
    document.getElementById('addTemplatePart').addEventListener('click', addTemplatePart);
    
    // Initialize with one part
    if (document.getElementById('templatePartsContainer').children.length === 0) {
        addTemplatePart();
    }
    
    // Load existing templates into the list
    displayTemplates();
    
    async function saveTemplate() {
        console.log('saveTemplate called');
        const templateName = document.getElementById('templateName').value.trim();
        console.log('Template name:', templateName);
        
        if (!templateName) {
            alert('Please enter a template name');
            return;
        }
        
        // Check if template name already exists
        const existing = templates.find(t => t.name === templateName);
        if (existing && !confirm('Template with this name already exists. Overwrite?')) {
            return;
        }
        
        // Collect template data
        const templateParts = [];
        const partItems = document.querySelectorAll('.part-line-item');
        console.log('Found part items:', partItems.length);
        
        partItems.forEach((item, index) => {
            const partNumberEl = item.querySelector('.template-part-number');
            const descriptionEl = item.querySelector('.template-part-description');
            const priceEl = item.querySelector('.template-part-price');
            const quantityEl = item.querySelector('.template-part-quantity');
            
            if (!partNumberEl || !descriptionEl || !priceEl || !quantityEl) {
                console.warn('Part item', index, 'missing required elements');
                return;
            }
            
            const partNumber = partNumberEl.value.trim();
            const description = descriptionEl.value.trim();
            const price = parseFloat(priceEl.value) || 0;
            const quantity = parseInt(quantityEl.value) || 1;
            
            console.log('Part', index, ':', { partNumber, description, price, quantity });
            
            // Save all parts, even if empty (user might want to fill them later)
            templateParts.push({
                partNumber: partNumber,
                description: description,
                price: price,
                quantity: quantity
            });
        });
        
        console.log('Collected parts:', templateParts);
        
        const template = {
            name: templateName,
            description: document.getElementById('templateDescription').value.trim(),
            companyName: document.getElementById('templateCompanyName').value.trim(),
            companyAddress: document.getElementById('templateCompanyAddress').value.trim(),
            companyPhone: document.getElementById('templateCompanyPhone').value.trim(),
            companyEmail: document.getElementById('templateCompanyEmail').value.trim(),
            companyWebsite: document.getElementById('templateCompanyWebsite').value.trim(),
            parts: templateParts,
            partsMarkup: parseFloat(document.getElementById('templatePartsMarkup').value) || 0,
            laborRate: parseFloat(document.getElementById('templateLaborRate').value) || 0,
            laborHours: parseFloat(document.getElementById('templateLaborHours').value) || 0,
            notes: document.getElementById('templateNotes').value.trim(),
            terms: document.getElementById('templateTerms').value.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Template to save:', template);
        
        // Remove existing template with same name if it exists
        templates = templates.filter(t => t.name !== templateName);
        templates.push(template);
        
        console.log('All templates:', templates);
        
        try {
            console.log('Calling saveTemplates...');
            await saveTemplates(templates);
            console.log('saveTemplates completed');
            displayTemplates();
            
            // Clear form
            document.getElementById('templateName').value = '';
            document.getElementById('templateDescription').value = '';
            document.getElementById('templatePartsContainer').innerHTML = '';
            addTemplatePart();
            
            alert('Template saved successfully!');
        } catch (e) {
            console.error('Error saving template:', e);
            alert('Error saving template: ' + e.message);
        }
    }
    
    async function loadTemplateToEdit() {
        const select = document.getElementById('templateSelect');
        const templateName = select.value;
        if (!templateName) {
            alert('Please select a template to edit');
            return;
        }
        
        const template = templates.find(t => t.name === templateName);
        if (!template) {
            alert('Template not found');
            return;
        }
        
        // Populate form with template data
        document.getElementById('templateName').value = template.name || '';
        document.getElementById('templateDescription').value = template.description || '';
        document.getElementById('templateCompanyName').value = template.companyName || '';
        document.getElementById('templateCompanyAddress').value = template.companyAddress || '';
        document.getElementById('templateCompanyPhone').value = template.companyPhone || '';
        document.getElementById('templateCompanyEmail').value = template.companyEmail || '';
        document.getElementById('templateCompanyWebsite').value = template.companyWebsite || '';
        document.getElementById('templatePartsMarkup').value = template.partsMarkup || 0;
        document.getElementById('templateLaborRate').value = template.laborRate || 0;
        document.getElementById('templateLaborHours').value = template.laborHours || 0;
        document.getElementById('templateNotes').value = template.notes || '';
        document.getElementById('templateTerms').value = template.terms || '';
        
        // Clear and populate parts
        document.getElementById('templatePartsContainer').innerHTML = '';
        if (template.parts && template.parts.length > 0) {
            template.parts.forEach(part => {
                addTemplatePart();
                const lastItem = document.querySelector('#templatePartsContainer .part-line-item:last-child');
                lastItem.querySelector('.template-part-number').value = part.partNumber || '';
                lastItem.querySelector('.template-part-description').value = part.description || '';
                lastItem.querySelector('.template-part-price').value = part.price || 0;
                lastItem.querySelector('.template-part-quantity').value = part.quantity || 1;
            });
        } else {
            addTemplatePart();
        }
    }
    
    async function deleteTemplate() {
        const select = document.getElementById('templateSelect');
        const templateName = select.value;
        if (!templateName) {
            alert('Please select a template to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
            return;
        }
        
        templates = templates.filter(t => t.name !== templateName);
        try {
            await saveTemplates(templates);
            displayTemplates();
            alert('Template deleted successfully!');
        } catch (e) {
            console.error('Error deleting template:', e);
            alert('Error deleting template: ' + e.message);
        }
    }
    
    function displayTemplates() {
        const listDiv = document.getElementById('templatesList');
        const select = document.getElementById('templateSelect');
        
        // Clear existing
        listDiv.innerHTML = '';
        select.innerHTML = '<option value="">-- Select Template --</option>';
        
        if (templates.length === 0) {
            listDiv.innerHTML = '<p style="color: #666;">No templates saved yet.</p>';
            return;
        }
        
        // Display templates
        templates.forEach(template => {
            const templateDiv = document.createElement('div');
            templateDiv.style.padding = '15px';
            templateDiv.style.marginBottom = '10px';
            templateDiv.style.border = '1px solid #ddd';
            templateDiv.style.borderRadius = '6px';
            templateDiv.style.backgroundColor = '#f9f9f9';
            templateDiv.innerHTML = `
                <h3 style="margin: 0 0 5px 0; color: #667eea;">${template.name}</h3>
                ${template.description ? `<p style="margin: 0 0 10px 0; color: #666;">${template.description}</p>` : ''}
                <small style="color: #999;">Created: ${new Date(template.createdAt).toLocaleDateString()}</small>
            `;
            listDiv.appendChild(templateDiv);
            
            // Add to select
            const option = document.createElement('option');
            option.value = template.name;
            option.textContent = template.name;
            select.appendChild(option);
        });
    }
});
