# Inventory Management (No Server Required)

## How It Works

Your inventory is managed **entirely in your browser** - no server needed!

### Storage Method: Browser localStorage

```
Your Browser
└── localStorage (browser storage)
    ├── inventory (all your items)
    └── appConfig (company settings)
```

**How it works:**
1. **Add/Edit/Delete items** → Saved to browser localStorage
2. **Data persists** across browser sessions
3. **No internet required** - works offline
4. **Fast** - instant saves, no network delays

---

## Managing Inventory

### Daily Use
- Click "📦 Manage Inventory"
- Add, edit, or delete items
- Changes save automatically
- Available immediately in quotes

### Data Location
- **Stored in:** Your browser's localStorage
- **Location:** Browser-specific (Chrome, Safari, Firefox each have separate storage)
- **Not in repo files:** Data stays in browser, not in your project files

---

## Backup & Sharing

### Export Inventory (Backup)
1. Click "📥 Export Inventory" in inventory manager
2. A JSON file is saved/downloaded (on iPhone/iPad you’ll get the Share sheet → choose **Save to Files**)
3. Save this file to backup your inventory
4. Can be shared with others or moved to different computers

### Import Inventory (Restore/Share)
1. Click "📤 Import Inventory" in inventory manager
2. Select your exported JSON file
3. Inventory imports and replaces current items
4. Perfect for:
   - Restoring from backup
   - Sharing inventory with team
   - Moving to new computer

---

## Multi-Computer Setup

### Option 1: Export/Import (Manual)
1. Export inventory from Computer A
2. Copy JSON file to Computer B (USB, email, cloud storage)
3. Import on Computer B
4. Both computers now have same inventory

### Option 2: Cloud Storage Sync (Recommended)
1. Export inventory to a cloud folder (OneDrive, Google Drive, Dropbox)
2. Import on other computers from same cloud folder
3. Keep file updated by re-exporting when changes are made
4. All computers stay in sync

---

## Limitations & Benefits

### ✅ Benefits
- **No server costs** - completely free
- **Works offline** - no internet needed
- **Fast** - instant saves
- **Private** - data stays on your computer
- **Simple** - no setup required

### ⚠️ Limitations
- **Browser-specific** - each browser has separate data
- **Computer-specific** - data doesn't sync automatically between computers
- **Storage limit** - ~5-10MB (plenty for thousands of items)
- **No real-time sync** - use export/import for sharing

---

## Best Practices

1. **Regular Backups**
   - Export inventory weekly/monthly
   - Save to cloud storage or external drive

2. **Team Sharing**
   - One person manages master inventory
   - Export and share JSON file
   - Others import to stay updated

3. **Multiple Computers**
   - Use cloud storage folder for inventory file
   - Export/import as needed
   - Keep master file updated

4. **Data Safety**
   - Export before major changes
   - Keep multiple backup copies
   - Store backups in different locations

---

## Technical Details

### Storage Format
- **Format:** JSON (human-readable)
- **Location:** Browser localStorage
- **Size Limit:** ~5-10MB (typically 10,000+ items)
- **Persistence:** Survives browser restarts, computer restarts

### Export Format
```json
{
  "inventory": [
    {
      "id": "inv-001",
      "name": "Mini Excavator",
      "model": "CAT 305E",
      "price": 350.00,
      "stock": 2,
      ...
    }
  ],
  "appConfig": { ... },
  "exportDate": "2025-01-15T10:30:00.000Z"
}
```

---

## Summary

**Inventory management works perfectly without a server!**

- ✅ Stored in browser (localStorage)
- ✅ Export/Import for backup & sharing
- ✅ Works offline
- ✅ Fast and simple
- ✅ No setup required

**For team sharing:** Use export/import with cloud storage folder.

**For backup:** Export regularly to keep your data safe.

---

*Your inventory is managed locally in your browser - no server needed!* 🎉
