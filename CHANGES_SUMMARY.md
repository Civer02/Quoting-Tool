# Changes Summary - Configuration & Features Update

## ✅ What's New

### 1. **Initial Configuration Page**
- New `config.html` page that appears on first use
- Collects company information upfront
- Sets default values for quotes
- **Redirects to main app after configuration**

### 2. **Local Logo Upload**
- ✅ Logo can now be uploaded as a file (PNG, JPG, GIF)
- ✅ No more URL input - logo is stored locally
- ✅ Logo appears in the main app and on generated PDFs
- Logo is stored as base64 data in configuration

### 3. **Storage Location Selection**
- Users can choose where to store parts library and data:
  - **Browser Local Storage** (Default) - Persistent, browser-specific
  - **IndexedDB** (Advanced) - More capacity for large datasets
  - **Session Storage** (Temporary) - Cleared when browser closes
- Selection is saved in configuration

### 4. **Markup Details on Quote**
- ✅ Markup percentages and amounts are now **clearly shown on the PDF**
- ✅ Breakdown by category is displayed
- ✅ Shows: "Category Name: X% ($XX.XX)" for each markup category
- ✅ Summary section shows detailed markup breakdown

### 5. **Default Settings**
- Can set default markup percentage
- Can set default labor rate
- These values auto-populate when adding new labor categories

---

## 📁 New Files

1. **`config.html`** - Initial configuration page
2. **`config.js`** - Configuration page logic
3. **`CHANGES_SUMMARY.md`** - This file

---

## 🔄 Modified Files

1. **`index.html`**
   - Removed logo URL input
   - Added logo display area
   - Added Settings button
   - Logo now shows from configuration

2. **`script.js`**
   - Added configuration check on load (redirects if not configured)
   - Updated to load company info from configuration
   - Updated storage functions to use selected storage type
   - Enhanced PDF generation to show markup details
   - Added logo to PDF from configuration
   - Default values for labor categories from config

---

## 🚀 How to Use

### First Time Setup

1. **Open `config.html`** (or it will redirect automatically from `index.html`)
2. **Fill in company information:**
   - Company name (required)
   - Address, phone, email, website (optional)
3. **Upload logo:**
   - Click "Choose File"
   - Select your logo image (PNG, JPG, or GIF)
   - Preview will appear
4. **Choose storage location:**
   - Select one of the three options
   - Default is "Browser Local Storage"
5. **Set defaults (optional):**
   - Default markup percentage
   - Default labor rate
6. **Click "Save Configuration & Continue"**
   - Redirects to main quoting tool

### Using the Main App

- Company info is pre-filled from configuration
- Logo appears automatically
- Can click "Settings" button to reconfigure
- Markup details will show on generated PDFs

### Viewing Markup on Quotes

When you generate a PDF:
- Parts subtotal is shown
- **Markup breakdown by category** is displayed:
  ```
  Parts Markup: $XX.XX
    Electrical: 15% ($XX.XX)
    Plumbing: 10% ($XX.XX)
  ```
- Parts total (with markup)
- Labor total
- Grand total

---

## 🔧 Technical Details

### Configuration Storage
- Configuration is stored in `localStorage` as `appConfig`
- Contains: company info, logo (base64), storage preference, defaults
- Flag `appConfigured` set to 'true' after first setup

### Logo Handling
- Logo uploaded as file
- Converted to base64 data URL
- Stored in configuration
- Displayed in app and embedded in PDF

### Storage Types
- **localStorage**: `localStorage.getItem/setItem()` - Default
- **sessionStorage**: `sessionStorage.getItem/setItem()` - Temporary
- **indexedDB**: Currently falls back to localStorage (can be enhanced)

### PDF Markup Display
- Shows markup percentage for each category
- Shows calculated markup amount per category
- Total markup clearly displayed
- Professional formatting

---

## 🐛 Troubleshooting

### "Redirected to config page every time"
- Check browser console for errors
- Make sure `localStorage` is enabled
- Try clearing browser cache and reconfiguring

### "Logo not showing"
- Make sure logo was uploaded in configuration
- Check file format (PNG, JPG, GIF supported)
- Try re-uploading logo in settings

### "Storage not working"
- Check browser supports localStorage
- Try switching storage type in settings
- Clear browser data and reconfigure

---

## 📝 Notes

- Configuration can be changed anytime via Settings button
- Logo can be updated in configuration page
- Storage location can be changed (data will migrate)
- All changes require reconfiguration to take effect

---

## 🎯 Next Steps (Optional Enhancements)

- Full IndexedDB implementation for large datasets
- Export/import configuration
- Multiple logo options
- Custom PDF templates
- Cloud storage integration

