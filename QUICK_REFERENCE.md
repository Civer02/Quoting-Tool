# Quick Reference Guide

## 🚀 How to Use This Tool

### Opening the Tool
1. Open `index.html` in Google Chrome
2. The page loads automatically
3. All features are ready to use

---

## 📝 Code Structure Quick Reference

### HTML → JavaScript Connection

```html
<!-- HTML: Element with ID -->
<input id="companyName" type="text">
```

```javascript
// JavaScript: Get the element
const element = document.getElementById('companyName');

// Get value
const value = element.value;

// Set value
element.value = "New Value";
```

### Common Patterns

#### Pattern 1: Button Click → Function
```html
<button id="myButton">Click Me</button>
```

```javascript
document.getElementById('myButton').addEventListener('click', function() {
    alert('Button clicked!');
});
```

#### Pattern 2: Input Change → Update Display
```html
<input id="price" type="number">
<span id="display">$0.00</span>
```

```javascript
document.getElementById('price').addEventListener('input', function() {
    const price = this.value;
    document.getElementById('display').textContent = `$${price}`;
});
```

#### Pattern 3: Create Dynamic Elements
```javascript
// Create element
const div = document.createElement('div');
div.className = 'my-class';
div.innerHTML = '<p>Content</p>';

// Add to page
document.getElementById('container').appendChild(div);
```

---

## 🔑 Key Functions Explained Simply

### `initializeApp()`
**What it does:** Sets up the app when page loads
- Sets today's date
- Generates quote number
- Attaches all event listeners
- Loads saved parts library

### `addLineItem()`
**What it does:** Adds a new row for parts
- Creates new HTML element
- Adds it to the page
- Attaches event listeners to new inputs

### `calculateLineItemTotal()`
**What it does:** Calculates price × quantity
- Loops through all line items
- Multiplies price by quantity
- Updates the total field
- Calls `updateCalculations()` for grand total

### `updateCalculations()`
**What it does:** Updates all totals
- Calculates parts subtotal
- Calculates markup
- Calculates labor
- Updates grand total display

### `addToPartsLibrary()`
**What it does:** Saves a part for reuse
- Checks if part already exists
- Updates or adds to array
- Saves to browser storage

### `generatePDF()`
**What it does:** Creates downloadable PDF
- Gets all form values
- Creates PDF document
- Adds all content
- Downloads file

### `saveDraft()` / `loadDraft()`
**What it does:** Saves/loads form data
- Collects all form values
- Saves to localStorage
- Can restore later

---

## 📊 Data Storage

### Parts Library
```javascript
// Structure
partsLibrary = [
    {
        partNumber: "ABC123",
        description: "Widget",
        price: 25.99
    },
    // ... more parts
]

// Save
localStorage.setItem('partsLibrary', JSON.stringify(partsLibrary));

// Load
const stored = localStorage.getItem('partsLibrary');
partsLibrary = JSON.parse(stored);
```

### Draft Quote
```javascript
// Structure
draft = {
    companyName: "...",
    customerName: "...",
    lineItems: [
        { partNumber: "...", description: "...", price: "...", quantity: "..." }
    ],
    laborCategories: [
        { categoryName: "...", partsMarkup: "...", laborRate: "...", laborHours: "..." }
    ]
}
```

---

## 🎯 Event Flow Examples

### Example 1: User Adds Line Item
```
User clicks "Add Line Item"
    ↓
addLineItem() function runs
    ↓
Creates new HTML element
    ↓
Adds to page
    ↓
Attaches event listeners
    ↓
Ready for input
```

### Example 2: User Types Part Number
```
User types in part number field
    ↓
'input' event fires
    ↓
handlePartNumberInput() runs
    ↓
Searches parts library
    ↓
Shows autocomplete dropdown
    ↓
User clicks match
    ↓
Auto-fills description and price
    ↓
Calculates total
```

### Example 3: User Changes Price
```
User changes price field
    ↓
'input' event fires
    ↓
calculateLineItemTotal() runs
    ↓
Recalculates line item total
    ↓
updateCalculations() runs
    ↓
Updates all summary totals
```

---

## 🛠️ Common Modifications

### Change Default Values
```javascript
// In initializeApp() or addLineItem()
input.value = "Default Value";
```

### Add New Field
```html
<!-- In HTML -->
<input id="newField" type="text">
```

```javascript
// In JavaScript
const value = document.getElementById('newField').value;
```

### Change Calculation Formula
```javascript
// In updateCalculations()
// Change this:
const markup = partsSubtotal * (markupPercent / 100);

// To this (example: add flat fee):
const markup = (partsSubtotal * (markupPercent / 100)) + 10;
```

### Add Validation
```javascript
function generatePDF() {
    const companyName = document.getElementById('companyName').value;
    
    if (!companyName) {
        alert('Please enter company name!');
        return; // Stop function
    }
    
    // Continue with PDF generation...
}
```

---

## 🐛 Debugging Checklist

1. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Check your console.log() outputs

2. **Verify element IDs**
   - Make sure JavaScript IDs match HTML IDs
   - Case-sensitive!

3. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - See what's saved

4. **Test event listeners**
   - Add `console.log('Button clicked')` in function
   - See if it appears when you click

5. **Verify data types**
   - Numbers: Use `parseFloat()` or `parseInt()`
   - Strings: Already strings from inputs

---

## 💡 Pro Tips

1. **Use `querySelector` for flexibility**
   ```javascript
   // Instead of getElementById
   document.querySelector('#companyName')
   
   // Can also use CSS selectors
   document.querySelector('.line-item .part-price')
   ```

2. **Template literals for HTML**
   ```javascript
   // Use backticks for multi-line strings
   const html = `
       <div>
           <p>${variable}</p>
       </div>
   `;
   ```

3. **Default values prevent errors**
   ```javascript
   // Instead of:
   const price = item.querySelector('.part-price').value;
   
   // Use:
   const price = parseFloat(item.querySelector('.part-price').value) || 0;
   ```

4. **Event delegation for dynamic content**
   ```javascript
   // Instead of attaching to each new element
   // Attach to parent container
   document.getElementById('lineItemsContainer').addEventListener('click', function(e) {
       if (e.target.classList.contains('btn-remove')) {
           removeLineItem(e.target);
       }
   });
   ```

---

## 📚 Learning Path

1. **Start here:** Understand HTML structure
2. **Next:** Learn how JavaScript gets/sets values
3. **Then:** Understand event listeners
4. **Finally:** Learn DOM manipulation (creating/removing elements)

---

## 🔗 Key JavaScript Concepts

### Variables
```javascript
let variableName = value;  // Can change
const constantName = value; // Cannot change
```

### Functions
```javascript
function functionName(parameter) {
    // Do something
    return result;
}
```

### Arrays
```javascript
const array = [item1, item2, item3];
array.push(newItem);      // Add item
array.find(item => condition); // Find item
array.forEach(item => {}); // Loop through
```

### Objects
```javascript
const object = {
    property1: value1,
    property2: value2
};
object.property1; // Access property
```

### Conditionals
```javascript
if (condition) {
    // Do this
} else {
    // Do that
}
```

---

This quick reference pairs with the detailed `CODE_TUTORIAL.md` for complete understanding!

