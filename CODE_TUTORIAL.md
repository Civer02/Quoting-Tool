# Quoting Tool - Code Tutorial

This document explains how the quoting tool works, breaking down each component and teaching you the concepts used.

## 📚 Table of Contents
1. [Overall Architecture](#overall-architecture)
2. [HTML Structure](#html-structure)
3. [CSS Styling](#css-styling)
4. [JavaScript Functionality](#javascript-functionality)
5. [Key Concepts Explained](#key-concepts-explained)
6. [Data Flow](#data-flow)
7. [How Features Work](#how-features-work)

---

## Overall Architecture

The quoting tool is a **single-page web application** that runs entirely in the browser. It consists of three main files:

```
Quoting Tool/
├── index.html    → Structure and content
├── styles.css    → Visual appearance
└── script.js     → Functionality and logic
```

**How they work together:**
- **HTML** = The skeleton (what you see)
- **CSS** = The appearance (how it looks)
- **JavaScript** = The brain (what it does)

---

## HTML Structure

### Basic HTML Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Metadata and links to CSS -->
  </head>
  <body>
    <!-- All visible content -->
  </body>
</html>
```

### Key HTML Concepts Used

#### 1. **Form Inputs**
```html
<input type="text" id="companyName" required>
```
- `type="text"` - Text input field
- `id="companyName"` - Unique identifier (JavaScript uses this to find the element)
- `required` - Makes the field mandatory

#### 2. **Containers and Sections**
```html
<section class="form-section">
  <h2>Company Information</h2>
  <!-- Form fields here -->
</section>
```
- `<section>` - Groups related content
- `class="form-section"` - CSS styling identifier

#### 3. **Dynamic Content Containers**
```html
<div id="lineItemsContainer">
  <!-- Line items will be added here by JavaScript -->
</div>
```
- `id="lineItemsContainer"` - JavaScript will add/remove items here
- Empty initially - JavaScript populates it

#### 4. **Event Handlers (Inline)**
```html
<button onclick="removeLineItem(this)">Remove</button>
```
- `onclick` - Runs JavaScript when clicked
- `this` - Refers to the button that was clicked

---

## CSS Styling

### How CSS Works

CSS uses **selectors** to target HTML elements and apply styles:

```css
/* Target by element type */
h1 {
  color: blue;
}

/* Target by class */
.form-section {
  padding: 20px;
}

/* Target by ID */
#companyName {
  width: 100%;
}
```

### Key CSS Concepts

#### 1. **Flexbox Layout**
```css
.form-row {
  display: flex;
  gap: 20px;
}
```
- `display: flex` - Makes children arrange horizontally
- `gap: 20px` - Space between items

#### 2. **CSS Variables & Gradients**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
- Creates a gradient background (purple to blue)

#### 3. **Responsive Design**
```css
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
```
- Changes layout on smaller screens

---

## JavaScript Functionality

### How JavaScript Works in This App

JavaScript is **event-driven** - it responds to user actions (clicks, typing, etc.)

### 1. **Initialization**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
```

**What this does:**
- Waits for HTML to fully load
- Then runs `initializeApp()` function
- Ensures all HTML elements exist before JavaScript tries to use them

### 2. **Global Variables**

```javascript
let partsLibrary = loadPartsLibrary();
let lineItemCounter = 0;
let laborCategoryCounter = 0;
```

**What these store:**
- `partsLibrary` - Array of saved parts
- `lineItemCounter` - Tracks how many line items exist
- `laborCategoryCounter` - Tracks labor categories

### 3. **Event Listeners**

```javascript
document.getElementById('addLineItem').addEventListener('click', addLineItem);
```

**How it works:**
1. Finds element with ID `addLineItem` (the "+ Add Line Item" button)
2. Listens for `'click'` events
3. When clicked, runs `addLineItem()` function

---

## Key Concepts Explained

### 1. **DOM (Document Object Model)**

The DOM is JavaScript's way of accessing and manipulating HTML:

```javascript
// Get an element by ID
const element = document.getElementById('companyName');

// Get the value from an input
const value = element.value;

// Set a value
element.value = "New Company Name";

// Create a new element
const newDiv = document.createElement('div');
```

### 2. **localStorage (Browser Storage)**

Stores data in the browser that persists between sessions:

```javascript
// Save data
localStorage.setItem('partsLibrary', JSON.stringify(partsLibrary));

// Load data
const stored = localStorage.getItem('partsLibrary');
const partsLibrary = JSON.parse(stored);
```

**Why JSON.stringify/parse?**
- localStorage only stores strings
- `JSON.stringify()` converts objects/arrays to strings
- `JSON.parse()` converts strings back to objects/arrays

### 3. **Event-Driven Programming**

Code runs in response to events:

```javascript
// When user types in part number field
partNumberInput.addEventListener('input', function() {
    handlePartNumberInput(this, descriptionInput, priceInput);
});

// When user clicks button
button.addEventListener('click', function() {
    doSomething();
});
```

### 4. **Template Literals (String Interpolation)**

```javascript
newItem.innerHTML = `
    <div class="form-group">
        <input type="text" class="part-number" data-index="${lineItemCounter}">
    </div>
`;
```

**What `${lineItemCounter}` does:**
- Inserts the variable value into the string
- If `lineItemCounter = 5`, it becomes `data-index="5"`

---

## Data Flow

### How Data Moves Through the App

```
User Input → JavaScript Function → Update Display → Save to Storage
```

**Example: Adding a Line Item**

1. **User clicks** "+ Add Line Item" button
2. **Event fires** → `addLineItem()` function runs
3. **Function creates** new HTML element with JavaScript
4. **Element added** to `lineItemsContainer`
5. **Event listeners attached** to new inputs
6. **User types** part number
7. **Autocomplete searches** parts library
8. **Calculations update** automatically
9. **Data saved** to localStorage when part is complete

### Calculation Flow

```
Price × Quantity → Line Item Total
All Line Items → Parts Subtotal
Parts Subtotal × Markup % → Parts Markup
Labor Rate × Hours → Labor Total
Parts + Markup + Labor → Grand Total
```

---

## How Features Work

### 1. **Parts Library System**

**How it works:**
```javascript
function addToPartsLibrary(partNumber, description, price) {
    // Check if part exists
    const existingIndex = partsLibrary.findIndex(
        p => p.partNumber.toLowerCase() === partNumber.toLowerCase()
    );
    
    if (existingIndex >= 0) {
        // Update existing
        partsLibrary[existingIndex] = { partNumber, description, price };
    } else {
        // Add new
        partsLibrary.push({ partNumber, description, price });
    }
    
    savePartsLibrary(); // Save to browser storage
}
```

**Step by step:**
1. User enters part number, description, price
2. On blur (when they leave the field), function checks if part exists
3. If exists → updates it
4. If new → adds to array
5. Saves entire array to localStorage

### 2. **Autocomplete Feature**

**How it works:**
```javascript
function handlePartNumberInput(input, descriptionInput, priceInput) {
    const searchTerm = input.value.toLowerCase();
    const matches = partsLibrary.filter(p => 
        p.partNumber.toLowerCase().includes(searchTerm)
    );
    
    if (matches.length > 0) {
        showAutocomplete(matches);
    }
}
```

**Step by step:**
1. User types in part number field
2. JavaScript searches parts library for matches
3. Displays matching parts in dropdown
4. User clicks match → auto-fills description and price

### 3. **Dynamic Line Items**

**How it works:**
```javascript
function addLineItem() {
    lineItemCounter++;
    const container = document.getElementById('lineItemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'line-item';
    newItem.innerHTML = `...HTML template...`;
    container.appendChild(newItem);
    
    // Attach event listeners to new inputs
    const partNumberInput = newItem.querySelector('.part-number');
    partNumberInput.addEventListener('input', function() {
        // Handle input
    });
}
```

**Step by step:**
1. Increment counter (for unique IDs)
2. Create new `<div>` element
3. Set its HTML content (template)
4. Add to container
5. Attach event listeners to new inputs

### 4. **Real-Time Calculations**

**How it works:**
```javascript
function calculateLineItemTotal() {
    const lineItems = document.querySelectorAll('.line-item');
    lineItems.forEach(item => {
        const price = parseFloat(item.querySelector('.part-price').value) || 0;
        const quantity = parseFloat(item.querySelector('.part-quantity').value) || 0;
        const total = price * quantity;
        item.querySelector('.part-total').value = `$${total.toFixed(2)}`;
    });
    updateCalculations(); // Update grand total
}
```

**Step by step:**
1. Find all line items
2. For each item: get price and quantity
3. Calculate total (price × quantity)
4. Update the total field
5. Call `updateCalculations()` to update summary

### 5. **PDF Generation**

**How it works:**
```javascript
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get all form values
    const companyName = document.getElementById('companyName').value;
    
    // Add content to PDF
    doc.text(companyName, 20, 30);
    
    // Save PDF
    doc.save('Quote.pdf');
}
```

**Step by step:**
1. Create new PDF document
2. Get all form values
3. Add text, lines, tables to PDF
4. Handle page breaks
5. Save as downloadable file

**Key PDF concepts:**
- `doc.text(text, x, y)` - Add text at coordinates
- `doc.addPage()` - Start new page
- `doc.save(filename)` - Download PDF

### 6. **Draft Saving/Loading**

**How it works:**
```javascript
function saveDraft() {
    const draft = {
        companyName: document.getElementById('companyName').value,
        customerName: document.getElementById('customerName').value,
        lineItems: [],
        // ... collect all form data
    };
    
    // Collect line items
    document.querySelectorAll('.line-item').forEach(item => {
        draft.lineItems.push({
            partNumber: item.querySelector('.part-number').value,
            // ... other fields
        });
    });
    
    localStorage.setItem('quoteDraft', JSON.stringify(draft));
}
```

**Step by step:**
1. Create object to hold all form data
2. Loop through all line items and collect their values
3. Convert object to JSON string
4. Save to localStorage

**Loading:**
1. Get JSON string from localStorage
2. Parse back to object
3. Loop through data and populate form fields
4. Recreate line items dynamically

---

## Common JavaScript Patterns Used

### 1. **Query Selectors**

```javascript
// Get single element by ID
document.getElementById('companyName')

// Get single element by class (first match)
document.querySelector('.line-item')

// Get all elements by class
document.querySelectorAll('.line-item')
```

### 2. **Array Methods**

```javascript
// Find item in array
partsLibrary.find(p => p.partNumber === 'ABC123')

// Filter array
partsLibrary.filter(p => p.price > 100)

// Find index
partsLibrary.findIndex(p => p.partNumber === 'ABC123')

// Loop through array
partsLibrary.forEach(part => {
    console.log(part);
})
```

### 3. **String Manipulation**

```javascript
// Convert to number
parseFloat('123.45') // Returns 123.45

// Format currency
`$${total.toFixed(2)}` // "$123.45"

// Convert to lowercase
partNumber.toLowerCase()
```

### 4. **Conditional Logic**

```javascript
// If/else
if (existingIndex >= 0) {
    // Update existing
} else {
    // Add new
}

// Ternary operator (shorthand if/else)
const value = condition ? valueIfTrue : valueIfFalse;
```

### 5. **Functions**

```javascript
// Regular function
function addLineItem() {
    // Code here
}

// Arrow function (alternative syntax)
const addLineItem = () => {
    // Code here
}

// Function with parameters
function calculateTotal(price, quantity) {
    return price * quantity;
}
```

---

## Debugging Tips

### 1. **Console Logging**

```javascript
console.log('Debug message');
console.log(variableName);
console.log('Parts library:', partsLibrary);
```

**How to use:**
- Open browser DevTools (F12)
- Go to Console tab
- See your log messages

### 2. **Check Element Values**

```javascript
const element = document.getElementById('companyName');
console.log('Current value:', element.value);
```

### 3. **Check localStorage**

```javascript
// In browser console
localStorage.getItem('partsLibrary')
localStorage.getItem('quoteDraft')
```

---

## Practice Exercises

Try modifying the code to learn:

1. **Change colors**: Edit `styles.css` gradient colors
2. **Add field**: Add a new input field in HTML, get its value in JavaScript
3. **Change calculation**: Modify markup calculation formula
4. **Add validation**: Check if required fields are filled before PDF generation
5. **Customize PDF**: Change PDF layout or add more information

---

## Summary

**The app works by:**
1. HTML provides structure
2. CSS makes it look good
3. JavaScript makes it interactive
4. Event listeners respond to user actions
5. Functions process data and update display
6. localStorage saves data between sessions
7. jsPDF generates downloadable PDFs

**Key takeaway:** Everything is connected through the DOM - JavaScript reads from and writes to HTML elements to create an interactive experience!

