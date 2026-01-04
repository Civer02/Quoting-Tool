# Storage Location Explanation

## What is Storage Location?

The **Storage Location** setting determines where your quoting tool saves data in your browser. This includes:
- Your **parts library** (part numbers, descriptions, prices)
- Your **saved draft quotes**

## Important Notes

1. **All data stays on your computer** - Nothing is sent to any server or cloud
2. **Data is browser-specific** - If you use Chrome, your data is in Chrome. If you use Edge, it's separate
3. **Data is computer-specific** - Your data on one computer won't appear on another computer

## Storage Options Explained

### ✅ Permanent Storage (localStorage) - **RECOMMENDED**

**What it does:**
- Saves your data permanently in your browser
- Data persists even after closing the browser
- Data stays until you manually clear browser data

**When to use:**
- **Most users should use this** - It's the default and works best for regular use
- You want your parts library to be available every time you open the tool
- You want to save draft quotes to work on later

**Example:**
- Monday: You add 50 parts to your library
- Tuesday: You close the browser
- Wednesday: You open the tool again - all 50 parts are still there ✅

---

### ⚠️ Temporary Storage (sessionStorage)

**What it does:**
- Saves data only for the current browser session
- Data is **automatically deleted** when you close the browser tab/window
- Data is cleared when you close the browser completely

**When to use:**
- You're just testing the tool
- You don't want any data to persist
- You want a "clean slate" every time you open the tool

**Example:**
- Monday: You add 50 parts to your library
- You close the browser
- Tuesday: You open the tool - all parts are gone ❌ (cleared automatically)

---

### 🔧 Advanced Storage (IndexedDB)

**What it does:**
- Similar to Permanent Storage but uses a different browser technology
- Can handle larger amounts of data
- Currently implemented to use Permanent Storage internally

**When to use:**
- You have a very large parts library (1000+ items)
- You need more storage capacity
- Currently, this option works the same as Permanent Storage

**Note:** This is an advanced option. Most users don't need it.

---

## Which Should I Choose?

### For 99% of users:
**Choose "Permanent Storage"** - It's already selected by default and works perfectly for most needs.

### Only choose "Temporary Storage" if:
- You're testing the tool
- You specifically want data cleared when you close the browser

### Only choose "Advanced Storage" if:
- You have a very large parts library
- You understand it currently works the same as Permanent Storage

---

## Common Questions

**Q: Can I change this later?**
A: Yes! You can go to Settings and change it anytime. However, changing storage types won't automatically migrate your existing data.

**Q: Will my data be lost if I change storage types?**
A: Your data stays in the old storage location. You may need to re-enter parts if you switch from Permanent to Temporary storage.

**Q: Can I access my data from another computer?**
A: No. All storage is local to your browser/computer. To use on another computer, you'd need to export/import your data (feature not currently implemented).

**Q: What happens if I clear my browser data?**
A: If you clear browser data/cache, your parts library and saved quotes will be deleted, regardless of which storage option you chose.

---

## Summary

**Just use the default "Permanent Storage"** unless you have a specific reason not to. It's the simplest and works best for most users!


