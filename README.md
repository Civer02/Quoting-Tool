# Professional Quoting Tool

A business-formal web-based quoting tool that allows you to create professional PDF quotes with parts management, labor calculations, automatic markup calculations, and template support.

## Features

- **Start Menu**: Easy navigation with three main options
- **Initial Setup**: One-time configuration for company information and storage settings
- **Quick Quote**: Create quotes quickly using templates or from scratch
- **Template System**: Create and manage quote templates for faster quote generation
- **Company Information Management**: Store and display your company logo, name, and contact information
- **Customer Information**: Enter detailed customer/quote recipient information
- **Equipment/Parts Library**: Store equipment/parts with vendor, item number, description, price, and optional inventory tracking
- **Line Items**: Add multiple line items with part numbers, descriptions, unit prices, and quantities
- **Labor & Markups**: Configure labor rates and markup percentages
- **Automatic Calculations**: 
  - Parts subtotal
  - Parts markup
  - Labor totals
  - Grand total
- **Professional PDF Generation**: Generate clean, professional PDF quotes
- **File-Based Storage**: All data stored in repository's `data/` folder structure
- **Backup Support**: Export/import functionality for data backup

## Getting Started

### First Time Setup

1. Open `start.html` in your web browser
2. Complete the initial setup by selecting "Set Storage Location"
3. Enter your company information and configure default settings
4. Storage will be set up in the `data/` folder structure

### Start Menu Options

1. **Quick Quote**: Create a new quote using templates or from scratch
2. **Format Quote**: Create and manage quote templates
3. **Set Storage Location**: Configure storage settings and company information

## How to Use

### Creating a Quick Quote

1. From the start menu, select "Quick Quote"
2. Optionally select a template to pre-fill common information
3. Fill in customer information (required)
4. Add parts/equipment from your library or enter new items
5. Set labor rates and hours
6. Add notes and terms
7. Generate PDF quote

### Creating Templates

1. From the start menu, select "Format Quote"
2. Enter template name and description
3. Fill in default company information, parts, labor rates, notes, and terms
4. Save the template
5. Templates can be loaded when creating quick quotes

### Equipment/Parts Management

Equipment data is stored with the following structure:
- **Vendor**: Equipment vendor/supplier name
- **Item**: Part number or item identifier
- **Description**: Item description
- **Price**: Unit price
- **Inventory**: Optional inventory count (if inventory tracking is enabled)

Equipment is stored in `data/equipment/equipment.json` and can be managed through the Parts Library interface.

### Storage Structure

All data is stored in the repository's `data/` folder:

```
data/
├── quotes/          # Saved quotes (JSON files)
├── equipment/       # Equipment/parts inventory (JSON files)
└── templates/       # Quote templates (JSON files)
```

Data is also backed up to browser localStorage for offline access.

### Adding Parts/Line Items

1. Click "+ Add Part" to add line items
2. Enter part information:
   - **Part Number**: Type to search existing parts in library, or enter new part number
   - **Description**: Auto-filled if part exists in library, or enter manually
   - **Unit Price**: Enter the price per unit
   - **Quantity**: Enter quantity (defaults to 1)
3. When you enter a part number for the first time with description and price, it's automatically saved to the equipment library
4. Click "Remove" to delete a line item

### Using the Parts Library

1. Click "View Parts Library" to see all saved equipment/parts
2. Click "Use" to add a part from the library to your quote
3. Click "Delete" to remove a part from the library
4. When typing a part number, matching parts from the library will appear in a dropdown

### Adding Labor & Markups

1. Set the hourly labor rate
2. Enter the number of hours
3. Set parts markup percentage (applied to parts subtotal)
4. Labor totals are calculated automatically

### Generating PDF

1. Fill in all required information
2. Review the "Quote Summary" section to verify calculations
3. Click "Generate PDF Quote"
4. The PDF will be automatically downloaded with filename format: `Quote_[QuoteNumber]_[Date].pdf`

### Saving and Loading Drafts

1. Click "Save Draft" to save your current quote
2. Click "Load Draft" to restore a previously saved draft
3. Drafts are saved to `data/quotes/` folder

## Technical Details

- **Storage**: 
  - Primary: File-based storage in `data/` folder (quotes, equipment, templates)
  - Backup: Browser localStorage for offline access
- **PDF Generation**: Uses jsPDF library (loaded from CDN)
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- **No Backend Required**: Runs entirely in the browser, no server needed
- **File System Access**: Uses File System Access API (Chrome/Edge) or download/upload for file management

## File Structure

```
Quoting Tool/
├── start.html           # Start menu (entry point)
├── start.js             # Start menu logic
├── setup.html           # Initial setup page
├── setup.js             # Setup logic
├── quick-quote.html     # Quick quote creation page
├── format-quote.html    # Template creation page
├── format-quote.js      # Template management logic
├── script.js            # Main quote functionality
├── storage.js           # Storage management system
├── styles.css           # Professional styling
├── README.md            # This file
└── data/                # Data storage folder
    ├── quotes/          # Saved quotes
    ├── equipment/       # Equipment/parts inventory
    └── templates/       # Quote templates
```

## Notes

- The equipment/parts library persists across browser sessions
- Drafts and quotes are saved to the `data/` folder
- Templates can be reused for faster quote creation
- Quote numbers are auto-generated if not provided (format: QT-YYYYMMDD-XXX)
- All calculations update automatically as you type
- The PDF is optimized for printing and professional presentation
- Data can be exported/imported for backup purposes

## Browser Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Internet connection (for loading jsPDF library from CDN)
- For file system access: Chrome or Edge (recommended) for File System Access API support

## Initial Setup

On first launch, you'll be prompted to:
1. Configure storage location (defaults to `data/` folder)
2. Enter company information
3. Set default markup and labor rates
4. Upload company logo (optional)

After setup, you can access all features from the start menu.