# Cloud Storage Guide - Cross-Device Sync

## Overview

Your quoting tool now supports **cloud storage sync**, allowing you to access your parts library and saved quotes from any device - your computer, phone, or tablet!

## How It Works

### Automatic Cloud Sync

1. **Set up cloud storage folder** in configuration
2. **Enable auto-sync** (default: ON)
3. **Data automatically saves** to a file in your cloud folder
4. **File syncs** via OneDrive, Google Drive, Dropbox, etc.
5. **Access from any device** - your data is always available!

## Setup Instructions

### Step 1: Configure Cloud Storage

1. Open the **Settings** page (or go through initial configuration)
2. In **"Data Storage Location"** section:
   - **Cloud Storage Folder Path**: Enter the path to a folder in your cloud storage
     - Example: `C:\Users\YourName\OneDrive\Quoting Tool Data`
     - Or: `C:\Users\YourName\Google Drive\Quoting Tool`
   - **Auto-save to cloud file**: Check this box (recommended)

### Step 2: Choose Your Cloud Storage

**Option A: OneDrive (Windows)**
- Create a folder: `C:\Users\YourName\OneDrive\Quoting Tool Data`
- Enter this path in configuration
- OneDrive will automatically sync this folder

**Option B: Google Drive**
- Install Google Drive for Desktop
- Create a folder in your Google Drive folder
- Enter the path in configuration

**Option C: Dropbox**
- Install Dropbox
- Create a folder in your Dropbox folder
- Enter the path in configuration

**Option D: Any Cloud Service**
- As long as the folder syncs to the cloud, it will work!

### Step 3: Use on Multiple Devices

**On Your Computer:**
- Data saves automatically to the cloud file
- File syncs via your cloud service

**On Your Phone/Tablet:**
- Access the same cloud folder via your cloud app
- Use the **"Import Data"** button to load the latest data
- Or use the cloud app to open the data file

## Manual Export/Import (Alternative Method)

If automatic sync doesn't work for your setup:

### Export Data
1. Click **"Export Data"** button
2. Save the JSON file to your cloud storage folder
3. File will sync to other devices

### Import Data
1. On another device, open the cloud folder
2. Click **"Import Data"** button
3. Select the data file from your cloud storage
4. Your parts library and data will load!

## File Location

The data file is saved as:
- **Filename**: `quoting-tool-data.json`
- **Location**: Your specified cloud storage folder
- **Format**: JSON (human-readable)

## What Gets Synced

✅ **Parts Library** - All your saved parts (part numbers, descriptions, prices)
✅ **Draft Quotes** - Your saved quote drafts
✅ **Last Updated** - Timestamp of last sync

## Browser Compatibility

### Modern Browsers (Chrome, Edge, Opera)
- **Full support** - Automatic file access via File System Access API
- No manual export/import needed
- Seamless cloud sync

### Other Browsers (Firefox, Safari)
- **Export/Import method** - Use the Export/Import buttons
- Still syncs via cloud storage
- Just requires manual file selection

## Troubleshooting

### "File access error" message
- **Solution**: Use Export/Import buttons instead
- Your browser may not support automatic file access
- Manual sync still works perfectly!

### Data not syncing
- **Check**: Is your cloud folder actually syncing?
- **Check**: Is the folder path correct?
- **Try**: Use Export/Import for manual sync

### Can't find data on phone
- **Solution**: Use your cloud app (OneDrive, Google Drive, etc.) to access the folder
- **Solution**: Use Import Data button and select the file from cloud storage

## Best Practices

1. **Use a dedicated folder** in your cloud storage for quoting tool data
2. **Keep auto-sync enabled** for automatic backups
3. **Export before major changes** as a backup
4. **Check sync status** in your cloud app to ensure files are syncing

## Security Notes

- ✅ All data stays on your devices and cloud account
- ✅ No data is sent to external servers
- ✅ You control where data is stored
- ✅ Standard cloud storage security applies

## Summary

**For most users:**
1. Set up a cloud folder path in Settings
2. Enable auto-sync
3. Use Export/Import if needed
4. Access your data from any device!

Your parts library and quotes will now sync across all your devices automatically! 🎉


