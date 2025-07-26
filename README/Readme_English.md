# GitHub-based browser bookmark synchronization plugin

Many users find it inconvenient to manually sync bookmarks across multiple browsers. This lightweight bookmark sync tool enables cross-platform, cross-device bookmark synchronization. It uses a GitHub repository to store and transfer bookmark content, ensuring privacy and security. It's free, easy to use, and helps you manage bookmarks effortlessly, saving time and effort.

## Directory Structure

- icons —— Icon resources
- manifest.json —— Plugin configuration manifest
- popup.html —— Main interaction page
- popup.js —— Main interaction logic
- options.html —— Settings page
- options.js —— Settings page logic
- cloudflare_worker.js —— Backend service code

## Features

- One-click upload of local bookmarks to a GitHub repository
- Download bookmarks from a GitHub repository and overwrite local bookmarks
- Comprehensive error handling and user prompts
- Secure authentication mechanism
- Operation log recording for easy troubleshooting
- Support for custom configurations

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

## Usage

1. After installing the plugin, click the plugin icon in the browser toolbar
2. Click the "Settings" button and fill in:
   - Worker API URL: The Cloudflare Worker URL you deployed
   - Authentication Token: The value of the `AUTH_TOKEN` environment variable you set
3. Click "Save Settings"
4. Use the "Upload Bookmarks" button to sync local bookmarks to GitHub
5. Use the "Download Bookmarks" button to sync bookmarks from GitHub to local (will overwrite local bookmarks)

## Notes

- When configuring Worker environment variables, **carefully check** that the content is correct!!!
- Downloading bookmarks will overwrite all local bookmarks; please operate with caution
- It's recommended to back up bookmarks regularly to prevent accidental loss
- When using for the first time, it's advisable to upload local bookmarks first to ensure data is securely stored
- A private repository can better protect your bookmark privacy

## Frequently Asked Questions

### Q: What should I do if upload / download fails?

A: Check the error prompts in the plugin popup. Common reasons include:

- Incorrect configuration of Worker address or authentication Token
- Insufficient permissions or expired GitHub token
- Network connection issues
- Non-existent GitHub repository or file

### Q: How to obtain a GitHub personal access token?

A: Visit the [GitHub token settings page](https://github.com/settings/tokens), click "Generate new token", check the `repo` permission, generate the token, and keep it safe.

### Q: Can it be used on multiple devices?

A: Yes, install the plugin on each device and configure the same Worker address and authentication Token to achieve multi-device synchronization.

## License

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## Disclaimer

- This plugin is for learning and personal use only; please take responsibility for your data security.
- It's recommended to set the bookmark repository as private to protect personal privacy.

---

If you have any questions or suggestions, please feel free to raise an issue or contact the author.
