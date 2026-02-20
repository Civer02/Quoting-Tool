# Proposal Generator

A fast, streamlined web-based tool for generating professional construction proposals focused on **labor and equipment**. Minimal inputs, maximum efficiency. Includes inventory management, quote history with revisions, and multi-user sync capabilities.

## 🚀 Quick Start

1. **Open `index.html`** in your browser
2. **First Time:** Click "⚙️ Company Settings" and fill in your company info
3. **Create Quote:** Fill in customer name, select templates, add labor/equipment items
4. **Generate PDF:** Click "Generate PDF Quote" - done!

## ✨ Key Features

- **Minimal Input Required:** Smart defaults and templates reduce typing
- **Construction-Focused:** Built specifically for labor and equipment proposals
- **Inventory Management:** Track equipment stock, categories, and pricing
- **Quote History & Revisions:** Save quotes with full revision tracking
- **Quote Approval:** Approve quotes and automatically reduce inventory stock
- **Multi-User Sync:** Share inventory and templates across devices/users
- **Quick Templates:** Pre-filled options for common tasks and equipment
- **Auto-Calculations:** Totals update automatically as you type
- **Professional PDFs:** Clean, print-ready proposals ready to send
- **iPhone Logo Support:** HEIC/HEIF logo files are converted automatically
- **One-Time Setup:** Company info saved, reuse for all proposals

## 📋 What You Need to Enter

**Required:**
- Customer Name
- Scope Summary (job description)
- At least one Labor OR Equipment item

**Optional:**
- Job Name
- Jobsite Address
- Notes & Assumptions
- Exclusions

**Auto-Generated:**
- Quote Number
- Quote Date (today)
- Valid Until (30 days from quote date)

## 🎯 How It Works

### 1. Company Settings (One-Time Setup)

Click "⚙️ Company Settings" and enter:
- Company Name (required)
- Contact Info (phone, email, address)
- Logo (optional - upload image file)
- Default Rates (labor $/hr, equipment $/day)
- Tax Rate (if applicable)

**Settings are saved automatically** and used for all future quotes.

### 2. Create a Quote

**Customer Info:**
- Enter customer name (required)
- Optional: Job name, jobsite address

**Scope Summary:**
- Select a template (Electrical, Plumbing, Framing, etc.) OR
- Type custom description

**Labor Items:**
- Click "+ Add Labor Item"
- Select template from dropdown (optional)
- Enter hours (use quick-select: 1, 2, 4, 8, 16, 40 hrs)
- Rate auto-fills from settings (editable)
- Total calculates automatically

**Equipment Items:**
- Click "+ Add Equipment Item"
- Select from inventory OR enter manually
- Enter quantity and price
- Add markup percentage (hidden from customer)
- Total calculates automatically (quantity × price × markup)

**Notes & Exclusions:**
- Select templates OR type custom text
- Common assumptions and exclusions pre-written

### 3. Generate PDF

Click "Generate PDF Quote" - the PDF downloads automatically with:
- Professional formatting
- All calculations
- Company branding
- Ready to send to customer

## 📊 Quote Structure

The generated PDF includes (in order):

1. **Header:** Company logo, name, contact info
2. **Quote Info:** Quote #, date, valid until
3. **Customer Info:** Name, job, address
4. **Scope Summary:** Job description
5. **Labor Section:** Table with hours, rates, totals
6. **Equipment Section:** Table with days, rates, totals
7. **Summary:** Subtotals, tax (if any), grand total
8. **Notes & Assumptions:** Additional information
9. **Exclusions:** What's not included

## 🎨 Templates Included

**Scope Templates:**
- Electrical Installation
- Plumbing Work
- Framing & Structure
- Drywall Installation
- Roofing Work
- Concrete Work

**Labor Templates:**
- Electrical Work
- Plumbing Work
- Framing
- Drywall
- Roofing
- Concrete
- General Labor

**Equipment Templates:**
- Excavator
- Crane
- Loader
- Generator
- Scaffolding
- Compactor
- Truck/Vehicle

**Notes Templates:**
- Standard Assumptions
- Site Conditions
- Materials Included

**Exclusions Templates:**
- Standard Exclusions
- Permits & Inspections
- Materials Not Included

## 💡 Tips for Fast Quotes

1. **Use Templates:** Select from dropdowns instead of typing
2. **Quick-Select Hours/Days:** Use the quick-select dropdowns
3. **Set Default Rates:** Configure once in settings, applies to all items
4. **Save Time:** Only fill required fields for fastest quotes
5. **Reuse Settings:** Company info saved, no need to re-enter

## 🔧 Technical Details

- **Storage:** Browser localStorage (company settings persist)
- **PDF Generation:** jsPDF library (loaded from CDN)
- **Browser:** Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- **No Backend:** Runs entirely in browser, no server needed
- **No Installation:** Just open the HTML file

## 🔒 Hybrid Hosting & Privacy

You can **run the app from the cloud** (e.g. GitHub Pages) while keeping **your data local or on a company shared folder**:

- **Code** is served from the host (GitHub, etc.); **no pricing or customer data is sent there**.
- **Data** (company info, inventory, quotes, templates) lives only in the browser (localStorage) or in your shared folder (via Export/Import or sync).
- **For companies:** Use Settings → Storage & Sync to point to a shared folder (network drive or cloud-synced folder like OneDrive). Export/import or sync keeps everyone on the same inventory and templates; the app code stays on the host, your numbers stay with you.
- **Pricing in the repo:** Default inventory and labor rate in the code are placeholders (zeros). Set your real rates and inventory in the app or via import so they never appear in the public repo.

## 📁 File Structure

```
Proposal Generator/
├── index.html              # Main application (single-page interface)
├── script.js               # All functionality (~2,200 lines)
├── styles.css              # Apple-inspired styling
├── README.md               # Complete documentation
├── QUICK_START.md          # Quick setup guide
├── CLIENT_SIDE_EXPLANATION.md  # How client-side storage works
└── INVENTORY_MANAGEMENT.md # Inventory system documentation
```

## 🆚 What Changed from Previous Version

**Removed:**
- Complex parts library system
- Inventory management
- Cloud storage file picker
- Multiple labor categories with markups
- Parts markup calculations
- Draft saving complexity
- Separate configuration page

**Simplified:**
- Single-page interface
- Labor + Equipment focus only
- Template-based inputs
- Smart defaults everywhere
- Streamlined PDF output

**Added:**
- Quick-select dropdowns for hours/days
- Construction-specific templates
- Scope summary section
- Exclusions section
- Auto-valid until date
- Better validation

## 🐛 Troubleshooting

**"Settings not saving"**
- Make sure browser allows localStorage
- Check browser console for errors

**"PDF not generating"**
- Check that all required fields are filled
- Verify at least one labor or equipment item exists
- Check browser console for errors

**"My iPhone logo file won't load"**
- HEIC/HEIF logo files are supported and converted on upload
- If conversion fails, refresh the page and try uploading again
- You can also export as JPG/PNG from Photos and upload that instead

**"Templates not working"**
- Make sure JavaScript is enabled
- Try refreshing the page

## 📝 Notes

- Quote numbers auto-generate: `QT-YYYYMMDD-XXX`
- Valid until date is automatically 30 days from quote date
- All calculations update in real-time
- PDF is optimized for printing
- Settings persist across browser sessions

## 🎯 Best Practices

1. **Set up company info first** - saves time on every quote
2. **Use templates** - faster than typing everything
3. **Set default rates** - applies to all new items
4. **Review before PDF** - check calculations in summary section
5. **Keep it simple** - only add what's needed

---

**Ready to create professional construction quotes in minutes!** 🚀
