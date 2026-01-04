# Professional Quoting Tool

A business-formal web-based quoting tool that allows you to create professional PDF quotes with parts management, labor calculations, and automatic markup calculations.

## Features

- **Company Information Management**: Store and display your company logo, name, and contact information
- **Customer Information**: Enter detailed customer/quote recipient information
- **Parts Library**: Automatically saves parts (part number, description, price) when first entered, allowing reuse in future quotes
- **Line Items**: Add multiple line items with part numbers, descriptions, unit prices, and quantities
- **Labor & Markups**: Configure multiple labor categories with:
  - Parts markup percentage
  - Hourly labor rates
  - Estimated labor hours
- **Automatic Calculations**: 
  - Parts subtotal
  - Parts markup
  - Labor totals
  - Grand total
- **Professional PDF Generation**: Generate clean, professional PDF quotes
- **Draft Saving**: Save and load draft quotes
- **Data Persistence**: Parts library and drafts are saved in browser localStorage

## How to Use

### Getting Started

1. Open `index.html` in your Google Chrome browser (or any modern web browser)
2. The tool will load with default fields ready for input

### Entering Company Information

1. Fill in your company details:
   - Company logo URL (optional - can be left blank)
   - Company name (required)
   - Address, phone, email, website (optional)

### Entering Customer Information

1. Fill in the "Quote To" section:
   - Customer name (required)
   - Customer address, phone, email (optional)
   - Quote number (auto-generated if left blank)
   - Quote date (defaults to today)

### Adding Parts/Line Items

1. Click "+ Add Line Item" to add more line items
2. Enter part information:
   - **Part Number**: Type to search existing parts in library, or enter new part number
   - **Description**: Auto-filled if part exists in library, or enter manually
   - **Unit Price**: Enter the price per unit
   - **Quantity**: Enter quantity (defaults to 1)
3. When you enter a part number for the first time with description and price, it's automatically saved to the parts library
4. Click "Remove" to delete a line item

### Using the Parts Library

1. Click "View Parts Library" to see all saved parts
2. Click "Use" to add a part from the library to your quote
3. Click "Delete" to remove a part from the library
4. When typing a part number, matching parts from the library will appear in a dropdown

### Adding Labor & Markups

1. Each labor category can have:
   - **Category Name**: e.g., "Electrical", "Plumbing", etc.
   - **Parts Markup (%)**: Percentage markup applied to parts subtotal
   - **Hourly Labor Rate**: Rate per hour for labor
   - **Estimated Hours**: Number of hours estimated
2. Click "+ Add Labor Category" to add more categories
3. Labor totals are calculated automatically
4. Parts markup is calculated as a percentage of the parts subtotal

### Adding Notes

1. Enter any additional notes, terms, or scope description in the "Additional Notes" section
2. These will appear at the bottom of the generated PDF

### Generating PDF

1. Fill in all required information
2. Review the "Quote Summary" section to verify calculations
3. Click "Generate PDF Quote"
4. The PDF will be automatically downloaded with filename format: `Quote_[QuoteNumber]_[Date].pdf`

### Saving and Loading Drafts

1. Click "Save Draft" to save your current quote (saved to browser localStorage)
2. Click "Load Draft" to restore a previously saved draft
3. Click "Clear Form" to reset all fields

## Technical Details

- **Storage**: All data is stored in browser localStorage
- **PDF Generation**: Uses jsPDF library (loaded from CDN)
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- **No Backend Required**: Runs entirely in the browser, no server needed

## File Structure

```
Quoting Tool/
├── index.html      # Main HTML structure
├── styles.css      # Professional styling
├── script.js       # All functionality and logic
└── README.md       # This file
```

## Notes

- The parts library persists across browser sessions
- Drafts are saved locally in your browser
- Quote numbers are auto-generated if not provided (format: QT-YYYYMMDD-XXX)
- All calculations update automatically as you type
- The PDF is optimized for printing and professional presentation

## Browser Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Internet connection (for loading jsPDF library from CDN)

