# 📚 GitHub-based Browser Bookmark Synchronization Plugin

Many users find it inconvenient to manually sync bookmarks across multiple browsers. This lightweight bookmark sync tool enables cross-platform, cross-device bookmark synchronization. It uses a GitHub repository to store and transfer bookmark content, ensuring privacy and security. It's free, easy to use, and helps you manage bookmarks effortlessly, saving time and effort.

## ✨ New Version Features

### 🎨 User Interface Optimization
- Modern gradient background and card-style design
- Real-time loading status indicators and button state management
- Responsive layout and smooth animation effects
- Real-time connection status display
- Friendly message notification system

### 🔒 Security Enhancement
- **AES-256-GCM Data Encryption**: Support for end-to-end encryption of bookmark data
- **PBKDF2 Key Derivation**: Strong cryptographic algorithm to protect encryption keys
- **Token Validation and Session Management**: Enhanced authentication mechanism
- **Request Signature Verification**: Prevent request tampering and replay attacks
- **Sensitive Data Protection**: Local stored sensitive information is encoded

### 💾 Backup and Recovery Features
- **Local Backup Creation**: One-click creation of local bookmark backup files
- **Encrypted Backup Support**: Option to create encrypted backup files
- **Backup File Recovery**: Support for restoring bookmarks from local backup files
- **Data Integrity Verification**: Ensure data integrity during backup and recovery
- **Automatic Backup Information**: Backup files include timestamps and version information

### 📋 Log Management System
- **Detailed Operation Logs**: Record detailed information of all sync operations
- **Log Viewing Interface**: Beautiful modal log viewer
- **Log Classification Display**: Different types of logs for success, failure, and information
- **Timestamp Recording**: Precise recording of operation times
- **Log Management**: Support for clearing history logs, maximum 100 records saved

## Directory Structure

- icons —— Icon resources
- manifest.json —— Plugin configuration manifest
- popup.html —— Main interaction page
- popup.js —— Main interaction logic
- options.html —— Settings page
- options.js —— Settings page logic
- cloudflare_worker.js —— Backend service code

## 🚀 Features

### Core Features
- One-click upload of local bookmarks to a GitHub repository
- Download bookmarks from a GitHub repository and overwrite local bookmarks
- Comprehensive error handling and user prompts
- Secure authentication mechanism
- Operation log recording for easy troubleshooting
- Support for custom configurations

### Advanced Features
- **Data Encryption**: Optional end-to-end encryption to protect bookmark data
- **Local Backup**: Create and restore local backup files
- **Connection Testing**: One-click API connection status testing
- **Log Management**: Detailed operation logs and viewing interface
- **Security Enhancement**: Token validation, session management, request signing
- **User Experience**: Modern UI, loading states, animation effects

## Installation Method

1. Clone this repository to your local machine
2. Open Chrome/Edge browser and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension" and select the root directory of this repository

## Preparation

### 1. Prepare a GitHub Repository

1. Create a new GitHub repository (it's recommended to set it as private for better security)
2. Create a file in the repository to store bookmarks (e.g., `bookmarks.json`)

### 2. Deploy Cloudflare Worker

1. Register / log in to your Cloudflare account [Visit Cloudflare](https://dash.cloudflare.com)
2. From the left sidebar, select `Workers & Pages` under `Compute`, click the button in the upper right corner to create a new Worker, and choose `Start with Hello World!` to deploy directly
3. Open the Worker management interface for the deployed project, click "Edit code" in the upper right corner, and copy the code from `cloudflare_worker.js` into the Worker editor
4. Configure Worker environment variables:
   - `GITHUB_TOKEN`: GitHub personal access token (requires `repo` permission)
   - `GITHUB_REPO_OWNER`: GitHub username
   - `GITHUB_REPO_NAME`: Name of the repository storing bookmarks
   - `GITHUB_FILE_PATH`: Path to the file storing bookmarks (e.g., `bookmarks.json`)
   - `AUTH_TOKEN`: Custom authentication token (for plugin to access the Worker)
Configuration method: From the Worker management interface of the project on Cloudflare, select "Settings" -> "Variables" -> "Environment Variables" -> "Add variable" in the upper right corner. Keep the type as `Text` by default, and enter the corresponding `Environment variable name` and `Value` (note that the environment variable names must be uppercase; it's recommended to directly copy the names from the README above to avoid errors).
5. Deploy the Worker and record the assigned URL (e.g., `https://bookmark-sync.yourname.workers.dev`)

## 📖 Usage

### Basic Configuration
1. After installing the plugin, click the plugin icon in the browser toolbar
2. Click the "Settings" button and fill in:
   - **Worker API URL**: The Cloudflare Worker URL you deployed
   - **Authentication Token**: The value of the `AUTH_TOKEN` environment variable you set
   - **Encryption Password** (Optional): Set to encrypt bookmark data for protection
3. Click "Test Connection" to verify the configuration is correct
4. Click "Save Settings"

### Bookmark Synchronization
- Use the "Upload Bookmarks" button to sync local bookmarks to GitHub
- Use the "Download Bookmarks" button to sync bookmarks from GitHub to local (will overwrite local bookmarks)

### Backup Management
- Click "Create Backup" to generate local backup files (supports encryption)
- Click "Restore Backup" to restore bookmarks from local backup files

### Log Viewing
- Click "View Logs" to see detailed operation records
- Click "Clear Logs" to clear history log records

### Security Tips
- If an encryption password is set, all uploaded data will be encrypted
- Backup files also support encryption to ensure data security
- Regularly check logs to understand sync status and troubleshoot issues

## ⚠️ Notes

### Configuration Related
- When configuring Worker environment variables, **carefully check** that the content is correct!!!
- Ensure your network can access GitHub normally; if not, please resolve it yourself
- Use the "Test Connection" feature to verify the configuration is correct

### Data Security
- Downloading bookmarks will overwrite all local bookmarks; please operate with caution
- **Strongly recommend setting an encryption password** to protect bookmark data security
- Regularly use the "Create Backup" feature to back up bookmarks to prevent accidental loss
- When using for the first time, it's advisable to upload local bookmarks first to ensure data is securely stored
- A private repository can better protect your bookmark privacy

### Encryption Features
- After setting an encryption password, please remember it; forgetting the password will make data unrecoverable
- The encryption password is not uploaded to the server and is only used locally
- When switching devices, you need to set the same encryption password on the new device

## ❓ Frequently Asked Questions

### Q: What should I do if upload / download fails?

A: First use the "Test Connection" feature to check the configuration, then view "Logs" for detailed error information. Common reasons include:

- Incorrect configuration of Worker address or authentication Token
- Insufficient permissions or expired GitHub token
- Network connection issues
- Non-existent GitHub repository or file
- Inconsistent encryption password settings

### Q: How to obtain a GitHub personal access token?

A: Visit the [GitHub token settings page](https://github.com/settings/tokens), click "Generate new token", check the `repo` permission, generate the token, and keep it safe.

### Q: Can it be used on multiple devices?

A: Yes, install the plugin on each device and configure the same Worker address, authentication Token, and encryption password to achieve multi-device synchronization.

### Q: What if I forget the encryption password?

A: If you forget the encryption password, encrypted data cannot be decrypted. Recommendations:
- If you have unencrypted local backups, you can restore from the backup
- Start over by clearing remote data and re-uploading (will lose encrypted data)
- Therefore, it's strongly recommended to keep the encryption password safe

### Q: Where are the backup files?

A: After clicking "Create Backup", files are automatically downloaded to the browser's default download directory with the filename format `bookmarks-backup-YYYYMMDD-HHMMSS.json` (encrypted backups have an `-encrypted` suffix).

### Q: How to view operation logs?

A: Click the "View Logs" button in the plugin interface to see detailed operation records, including success, failure, and error information, which helps troubleshoot issues.

## 🔧 Technical Features

### Security Technologies
- **AES-256-GCM Encryption**: Industry-standard symmetric encryption algorithm
- **PBKDF2 Key Derivation**: 100,000 iterations to enhance password security
- **Random Salt Values**: Different salt values used for each encryption
- **Integrity Verification**: GCM mode provides data integrity protection

### Architecture Design
- **Modular Code Structure**: Uses classes and modular design for easy maintenance
- **Error Handling Mechanism**: Comprehensive error catching and user-friendly prompts
- **State Management**: Real-time UI state updates and loading indicators
- **Data Validation**: Multi-layer data validation ensures data integrity

## 📋 Version Update Log

### v2.0.0 (Latest Version)
- ✨ Added data encryption feature (AES-256-GCM)
- ✨ Added local backup and recovery features
- ✨ Added detailed log management system
- ✨ Added connection testing feature
- 🎨 Brand new user interface design
- 🔒 Enhanced security and Token management
- 🐛 Fixed multiple known issues
- 📱 Improved responsive design

### v1.0.0
- 🎉 Basic bookmark synchronization features
- 📤 Upload bookmarks to GitHub
- 📥 Download bookmarks from GitHub
- ⚙️ Basic configuration management

## 📄 License

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## ⚠️ Disclaimer

- This plugin is for learning and personal use only; please take responsibility for your data security
- It's recommended to set the bookmark repository as private to protect personal privacy
- Although encryption features provide additional security protection, please keep your encryption password safe
- The author is not responsible for any data loss caused by using this plugin

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## 📞 Contact

If you have any questions or suggestions, welcome to:
- Submit [GitHub Issue](https://github.com/pluckypioneer/Sync_List/issues)
- Create [Pull Request](https://github.com/pluckypioneer/Sync_List/pulls)

---

⭐ If this project helps you, please give it a Star for support!
