let API_BASE;
let apiUrl = '';
let authToken = '';

// Token验证和会话管理
class SecurityManager {
    static async validateToken(apiUrl, token) {
        try {
            const baseUrl = apiUrl && apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            const response = await fetch(`${baseUrl}/validate`, {
                method: 'GET',
                headers: {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.ok) {
                const data = await response.json();
                return { valid: true, data };
            } else {
                return { valid: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
    
    static async checkTokenExpiry() {
        const { tokenExpiry } = await chrome.storage.local.get(['tokenExpiry']);
        if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
            await chrome.storage.local.remove(['tokenExpiry']);
            return false;
        }
        return true;
    }
    
    static async setTokenExpiry(hours = 24) {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + hours);
        await chrome.storage.local.set({ tokenExpiry: expiry.toISOString() });
    }
    
    static generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 初始化API配置
async function initApiConfig() {
    try {
        const result = await chrome.storage.sync.get(['apiUrl', 'authToken']);
        apiUrl = result.apiUrl || '';
        
        if (result.authToken) {
            // 解码存储的Token
            authToken = base64Decode(result.authToken);
        } else {
            authToken = '';
        }
        
        // 检查Token是否过期
        if (authToken) {
            const isExpired = await SecurityManager.checkTokenExpiry();
            if (isExpired) {
                authToken = '';
                showMessage('认证Token已过期，请重新设置', 'warning');
            }
        }
        
        // 更新连接状态
        await checkConnectionStatus();
    } catch (error) {
        console.error('初始化API配置失败:', error);
    }
}

// Base64编码/解码函数
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

// 加密相关功能
class BookmarkCrypto {
    static async generateKey(password) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        return { key, salt };
    }
    
    static async encrypt(data, password) {
        try {
            const { key, salt } = await this.generateKey(password);
            const encoder = new TextEncoder();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(JSON.stringify(data))
            );
            
            // 组合 salt + iv + encrypted data
            const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('加密失败:', error);
            throw new Error('数据加密失败');
        }
    }
    
    static async decrypt(encryptedData, password) {
        try {
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);
            
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );
            
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            console.error('解密失败:', error);
            throw new Error('数据解密失败，请检查密码是否正确');
        }
    }
}

// 检查连接状态
async function checkConnectionStatus() {
    try {
        if (!apiUrl || !authToken) {
            updateStatus(false, '未配置');
            return false;
        }
        
        // 使用安全管理器验证Token
        const validation = await SecurityManager.validateToken(apiUrl, authToken);
        
        if (validation.valid) {
            updateStatus(true, '已连接');
            // 设置Token过期时间
            await SecurityManager.setTokenExpiry(24);
            return true;
        } else {
            updateStatus(false, '认证失败');
            console.error('Token验证失败:', validation.error);
            
            // 如果是认证错误，清除过期的Token信息
            if (validation.error.includes('401') || validation.error.includes('403')) {
                await chrome.storage.local.remove(['tokenExpiry']);
                showMessage('认证失败，请检查Token是否正确', 'error');
            }
            return false;
        }
    } catch (error) {
        console.error('检查连接状态失败:', error);
        updateStatus(false, '连接失败');
        return false;
    }
}

// 加载上次同步信息
async function loadLastSyncInfo() {
    try {
        const result = await chrome.storage.local.get(['lastSyncTime']);
        if (result.lastSyncTime) {
            updateBackupInfo(result.lastSyncTime);
        }
    } catch (error) {
        console.error('加载同步信息失败:', error);
    }
}

// 初始化：从存储中加载API配置
async function init() {
    try {
        const { apiUrl } = await chrome.storage.sync.get('apiUrl');
        // 确保API_BASE不以斜杠结尾，避免URL拼接时出现双斜杠
        API_BASE = apiUrl && apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        // 绑定事件
        document.getElementById('uploadBtn').addEventListener('click', uploadBookmarks);
        document.getElementById('downloadBtn').addEventListener('click', downloadBookmarks);
        document.getElementById('settingsLink').addEventListener('click', openSettings);
        
        // 绑定备份相关事件
        document.getElementById('backupBtn').addEventListener('click', createLocalBackup);
        document.getElementById('restoreBtn').addEventListener('click', restoreLocalBackup);
        document.getElementById('fileInput').addEventListener('change', handleFileSelect);
        
        // 绑定日志相关事件
        document.getElementById('viewLogsBtn').addEventListener('click', showLogsModal);
        document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
        document.getElementById('logsCloseBtn').addEventListener('click', hideLogsModal);
        
        // 点击模态框背景关闭
        document.getElementById('logsModal').addEventListener('click', (e) => {
            if (e.target.id === 'logsModal') {
                hideLogsModal();
            }
        });
        
        // 加载上次同步信息
        await loadLastSyncInfo();
        
        // 检查连接状态
        if (!API_BASE) {
            showMessage('请先配置API地址', 'info');
            updateStatus(false, '未配置');
            return;
        }
        
        // 异步检查连接状态
        checkConnectionStatus();
        
    } catch (err) {
        console.error('初始化失败:', err);
        showMessage('初始化失败，请刷新页面重试', 'error');
        updateStatus(false, '初始化失败');
    }
}

// 显示消息
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // 5秒后自动隐藏成功消息
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// 设置按钮加载状态
function setButtonLoading(buttonId, isLoading, loadingText = '') {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(buttonId.replace('Btn', 'Spinner'));
    const textElement = document.getElementById(buttonId.replace('Btn', 'Text'));
    
    if (isLoading) {
        button.disabled = true;
        spinner.style.display = 'inline-block';
        if (loadingText) {
            textElement.textContent = loadingText;
        }
    } else {
        button.disabled = false;
        spinner.style.display = 'none';
        // 恢复原始文本
        if (buttonId === 'uploadBtn') {
            textElement.textContent = '📤 上传书签';
        } else if (buttonId === 'downloadBtn') {
            textElement.textContent = '📥 下载书签';
        }
    }
}

// 显示进度条
function showProgress(show = true, progress = 0) {
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    if (show) {
        progressBar.style.display = 'block';
        progressFill.style.width = `${progress}%`;
    } else {
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    }
}

// 更新状态指示器
function updateStatus(connected = false, text = '') {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (connected) {
        statusDot.className = 'status-dot status-connected';
        statusText.textContent = text || '已连接';
    } else {
        statusDot.className = 'status-dot status-disconnected';
        statusText.textContent = text || '未连接';
    }
}

// 更新备份信息
function updateBackupInfo(lastSync = null) {
    const backupInfo = document.getElementById('backupInfo');
    if (lastSync) {
        const date = new Date(lastSync);
        const timeStr = date.toLocaleString('zh-CN');
        backupInfo.textContent = `上次同步: ${timeStr}`;
    } else {
        backupInfo.textContent = '上次同步: 从未';
    }
}

// 打开设置页面
function openSettings() {
    chrome.runtime.openOptionsPage();
}

// 获取认证Token
async function getAuthToken() {
    try {
        const { authToken } = await chrome.storage.sync.get('authToken');
        // Token在存储时进行了Base64编码，读取时需要解码
        return authToken ? base64Decode(authToken) : '';
    } catch (err) {
        console.error('获取认证Token失败:', err);
        return '';
    }
}

// 获取书签栏ID
async function getBookmarkBarId() {
    return new Promise((resolve) => {
        // 首先尝试获取书签栏
        chrome.bookmarks.search({ title: "书签栏" }, (results) => {
            if (results.length > 0) {
                resolve(results[0].id);
                return;
            }
            
            // 兼容其他语言版本
            chrome.bookmarks.search({ title: "Bookmarks bar" }, (englishResults) => {
                if (englishResults.length > 0) {
                    resolve(englishResults[0].id);
                    return;
                }
                
                // 如果都找不到，使用根节点的第一个子节点（通常是书签栏）
                chrome.bookmarks.getTree((tree) => {
                    if (tree[0] && tree[0].children && tree[0].children[0]) {
                        resolve(tree[0].children[0].id);
                    } else {
                        resolve('1'); // 默认书签栏ID
                    }
                });
            });
        });
    });
}

// 删除书签栏下的所有内容
async function removeAllBookmarks() {
    try {
        const bookmarkBarId = await getBookmarkBarId();
        
        return new Promise((resolve, reject) => {
            chrome.bookmarks.getChildren(bookmarkBarId, (children) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`获取书签失败: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                if (children.length === 0) {
                    resolve();
                    return;
                }

                // 删除所有子项
                const deletePromises = children.map(child => {
                    return new Promise((resolveDelete) => {
                        if (child.children) {
                            // 文件夹，使用removeTree
                            chrome.bookmarks.removeTree(child.id, () => {
                                if (chrome.runtime.lastError) {
                                    console.warn(`删除文件夹失败: ${child.title}`, chrome.runtime.lastError);
                                }
                                resolveDelete();
                            });
                        } else {
                            // 单个书签，使用remove
                            chrome.bookmarks.remove(child.id, () => {
                                if (chrome.runtime.lastError) {
                                    console.warn(`删除书签失败: ${child.title}`, chrome.runtime.lastError);
                                }
                                resolveDelete();
                            });
                        }
                    });
                });

                Promise.all(deletePromises).then(resolve).catch(reject);
            });
        });
    } catch (err) {
        throw new Error(`删除书签失败: ${err.message}`);
    }
}

// 递归创建书签
async function createBookmarks(bookmarks, parentId) {
    if (!Array.isArray(bookmarks)) {
        return;
    }

    for (const bookmark of bookmarks) {
        try {
            const bookmarkData = {
                parentId: parentId,
                title: bookmark.title || '未命名'
            };

            if (bookmark.url) {
                // 单个书签
                bookmarkData.url = bookmark.url;
                await new Promise((resolve) => {
                    chrome.bookmarks.create(bookmarkData, (newBookmark) => {
                        if (chrome.runtime.lastError) {
                            console.warn(`创建书签失败: ${bookmark.title}`, chrome.runtime.lastError);
                        }
                        resolve();
                    });
                });
            } else if (bookmark.children && bookmark.children.length > 0) {
                // 文件夹
                await new Promise((resolve) => {
                    chrome.bookmarks.create(bookmarkData, async (newFolder) => {
                        if (chrome.runtime.lastError) {
                            console.warn(`创建文件夹失败: ${bookmark.title}`, chrome.runtime.lastError);
                            resolve();
                            return;
                        }
                        
                        // 递归创建子项
                        try {
                            await createBookmarks(bookmark.children, newFolder.id);
                        } catch (err) {
                            console.warn(`创建子书签失败: ${bookmark.title}`, err);
                        }
                        resolve();
                    });
                });
            }
        } catch (err) {
            console.warn(`处理书签失败: ${bookmark.title}`, err);
        }
    }
}

// 上传书签到GitHub
async function uploadBookmarks() {
    if (!API_BASE) {
        showMessage('请先配置API地址', 'error');
        return;
    }

    try {
        setButtonLoading('uploadBtn', true, '📤 准备中...');
        showProgress(true, 10);
        showMessage('正在获取书签...', 'info');
        
        // 获取书签
        const bookmarks = await new Promise((resolve, reject) => {
            chrome.bookmarks.getTree((tree) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`获取书签失败: ${chrome.runtime.lastError.message}`));
                } else {
                    resolve(tree);
                }
            });
        });

        showProgress(true, 30);
        setButtonLoading('uploadBtn', true, '📤 获取完成...');

        // 准备上传数据
        let dataToUpload = {
            bookmarks,
            updatedAt: new Date().toISOString(),
            version: '1.0'
        };

        // 检查是否需要加密
        const { encryptionPassword } = await chrome.storage.sync.get(['encryptionPassword']);
        if (encryptionPassword) {
            showProgress(true, 40);
            setButtonLoading('uploadBtn', true, '📤 加密中...');
            showMessage('正在加密数据...', 'info');
            try {
                const encryptedData = await BookmarkCrypto.encrypt(dataToUpload, encryptionPassword);
                dataToUpload = {
                    encrypted: true,
                    data: encryptedData,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                };
            } catch (error) {
                throw new Error('数据加密失败: ' + error.message);
            }
        }

        showMessage('正在上传书签...', 'info');
        showProgress(true, 50);
        setButtonLoading('uploadBtn', true, '📤 上传中...');
        
        // 发送请求到Cloudflare Worker
        const requestId = SecurityManager.generateRequestId();
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': await getAuthToken(),
                'X-Request-ID': requestId,
                'X-Client-Version': '1.0',
                'X-Timestamp': new Date().toISOString()
            },
            body: JSON.stringify(dataToUpload),
            signal: AbortSignal.timeout(30000) // 30秒超时
        });

        showProgress(true, 90);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '未知错误');
            throw new Error(`上传失败 (${response.status}): ${errorText}`);
        }

        showProgress(true, 100);
        
        setTimeout(() => {
            showProgress(false);
            const message = encryptionPassword ? '书签上传成功！(已加密)' : '书签上传成功！';
            showMessage(message, 'success');
            updateStatus(true, '同步完成');
            updateBackupInfo(new Date().toISOString());
        }, 500);
        
        await logSyncResult('upload', true, '上传成功');
    } catch (err) {
        console.error('上传失败:', err);
        showProgress(false);
        const errorMsg = err.name === 'AbortError' ? '上传超时，请检查网络连接' : err.message;
        showMessage(`上传失败: ${errorMsg}`, 'error');
        updateStatus(false, '上传失败');
        await logSyncResult('upload', false, errorMsg);
    } finally {
        setButtonLoading('uploadBtn', false);
    }
}

// 从GitHub下载书签
async function downloadBookmarks() {
    if (!API_BASE) {
        showMessage('请先配置API地址', 'error');
        return;
    }

    // 二次确认，防止误操作
    if (!confirm('确定要从GitHub下载书签吗？\n\n⚠️ 这将删除您当前的所有书签并替换为GitHub上的书签！\n\n建议先备份当前书签。')) {
        return;
    }

    try {
        setButtonLoading('downloadBtn', true, '📥 准备中...');
        showProgress(true, 10);
        showMessage('正在下载书签...', 'info');
        
        // 从Cloudflare Worker获取书签
        const requestId = SecurityManager.generateRequestId();
        const response = await fetch(`${API_BASE}/download`, {
            headers: {
                'X-Auth-Token': await getAuthToken(),
                'X-Request-ID': requestId,
                'X-Client-Version': '1.0',
                'X-Timestamp': new Date().toISOString()
            },
            signal: AbortSignal.timeout(30000) // 30秒超时
        });

        showProgress(true, 30);
        setButtonLoading('downloadBtn', true, '📥 下载中...');

        if (!response.ok) {
            const errorText = await response.text().catch(() => '未知错误');
            throw new Error(`下载失败 (${response.status}): ${errorText}`);
        }

        let data = await response.json();
        
        // 检查是否为加密数据
        if (data.encrypted) {
            showProgress(true, 40);
            setButtonLoading('downloadBtn', true, '📥 解密中...');
            showMessage('正在解密数据...', 'info');
            
            const { encryptionPassword } = await chrome.storage.sync.get(['encryptionPassword']);
            if (!encryptionPassword) {
                throw new Error('数据已加密，但未设置解密密码。请在设置中配置加密密码。');
            }
            
            try {
                data = await BookmarkCrypto.decrypt(data.data, encryptionPassword);
            } catch (error) {
                throw new Error('数据解密失败，请检查密码是否正确');
            }
        }
        
        if (!data || !data.bookmarks || !Array.isArray(data.bookmarks)) {
            throw new Error('下载的数据格式不正确');
        }

        showProgress(true, 50);
        setButtonLoading('downloadBtn', true, '📥 清理中...');
        showMessage('正在删除现有书签...', 'info');
        await removeAllBookmarks();
        
        showProgress(true, 70);
        setButtonLoading('downloadBtn', true, '📥 导入中...');
        showMessage('正在导入新书签...', 'info');
        const bookmarkBarId = await getBookmarkBarId();
        
        // 导入书签到书签栏
        if (data.bookmarks[0] && data.bookmarks[0].children) {
            // 如果数据包含根节点，导入其子节点
            for (const rootChild of data.bookmarks[0].children) {
                if (rootChild.children || rootChild.url) {
                    await createBookmarks([rootChild], bookmarkBarId);
                }
            }
        } else {
            // 直接导入数据
            await createBookmarks(data.bookmarks, bookmarkBarId);
        }
        
        showProgress(true, 100);
        
        setTimeout(() => {
            showProgress(false);
            showMessage('书签同步完成！', 'success');
            updateStatus(true, '同步完成');
            updateBackupInfo(new Date().toISOString());
        }, 500);
        
        await logSyncResult('download', true, '下载成功');
    } catch (err) {
        console.error('下载失败:', err);
        showProgress(false);
        const errorMsg = err.name === 'AbortError' ? '下载超时，请检查网络连接' : err.message;
        showMessage(`同步失败: ${errorMsg}`, 'error');
        updateStatus(false, '下载失败');
        await logSyncResult('download', false, errorMsg);
    } finally {
        setButtonLoading('downloadBtn', false);
    }
}

// 日志管理类
class LogManager {
    static async addLog(success, action, message) {
        try {
            const logEntry = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                success: success,
                action: action,
                message: message
            };
            
            // 获取现有日志
            const result = await chrome.storage.local.get(['syncLogs']);
            const logs = result.syncLogs || [];
            
            // 添加新日志
            logs.unshift(logEntry);
            
            // 保持最多100条日志
            if (logs.length > 100) {
                logs.splice(100);
            }
            
            // 保存日志
            await chrome.storage.local.set({ syncLogs: logs });
            
            // 如果同步成功，保存同步时间
            if (success && (action === '上传' || action === '下载')) {
                await chrome.storage.local.set({ lastSyncTime: new Date().toISOString() });
            }
            
        } catch (error) {
            console.error('记录日志失败:', error);
        }
    }
    
    static async getLogs() {
        try {
            const result = await chrome.storage.local.get(['syncLogs']);
            return result.syncLogs || [];
        } catch (error) {
            console.error('获取日志失败:', error);
            return [];
        }
    }
    
    static async clearLogs() {
        try {
            await chrome.storage.local.remove(['syncLogs']);
            return true;
        } catch (error) {
            console.error('清空日志失败:', error);
            return false;
        }
    }
    
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// 显示日志模态框
async function showLogsModal() {
    const modal = document.getElementById('logsModal');
    const logsList = document.getElementById('logsList');
    
    try {
        const logs = await LogManager.getLogs();
        
        if (logs.length === 0) {
            logsList.innerHTML = '<div class="logs-empty">暂无日志记录</div>';
        } else {
            logsList.innerHTML = logs.map(log => `
                <div class="log-item ${log.success ? 'success' : 'error'}">
                    <div class="log-time">${LogManager.formatTime(log.timestamp)}</div>
                    <div class="log-action">${log.action}</div>
                    <div class="log-message">${log.message}</div>
                </div>
            `).join('');
        }
        
        modal.classList.add('show');
    } catch (error) {
        console.error('显示日志失败:', error);
        showMessage('显示日志失败: ' + error.message, 'error');
    }
}

// 隐藏日志模态框
function hideLogsModal() {
    const modal = document.getElementById('logsModal');
    modal.classList.remove('show');
}

// 清空日志
async function clearLogs() {
    if (!confirm('确定要清空所有日志记录吗？此操作不可撤销。')) {
        return;
    }
    
    try {
        const success = await LogManager.clearLogs();
        if (success) {
            showMessage('日志已清空', 'success');
            // 如果日志模态框正在显示，刷新内容
            const modal = document.getElementById('logsModal');
            if (modal.classList.contains('show')) {
                const logsList = document.getElementById('logsList');
                logsList.innerHTML = '<div class="logs-empty">暂无日志记录</div>';
            }
        } else {
            showMessage('清空日志失败', 'error');
        }
    } catch (error) {
        console.error('清空日志失败:', error);
        showMessage('清空日志失败: ' + error.message, 'error');
    }
}

// 记录同步结果到日志（保持向后兼容）
async function logSyncResult(type, success, message) {
    await LogManager.addLog(success, type, message);
}

// 创建本地备份
async function createLocalBackup() {
    try {
        setBackupButtonLoading('backupBtn', true, '💾 创建中...');
        showMessage('正在创建本地备份...', 'info');
        
        // 获取所有书签
        const bookmarks = await chrome.bookmarks.getTree();
        
        // 创建备份数据
        let backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            bookmarks: bookmarks,
            metadata: {
                userAgent: navigator.userAgent,
                extensionVersion: chrome.runtime.getManifest().version
            }
        };
        
        // 检查是否需要加密
        const { encryptionPassword } = await chrome.storage.sync.get(['encryptionPassword']);
        let filename;
        if (encryptionPassword) {
            setBackupButtonLoading('backupBtn', true, '💾 加密中...');
            showMessage('正在加密备份数据...', 'info');
            
            try {
                const encryptedData = await BookmarkCrypto.encrypt(backupData, encryptionPassword);
                backupData = {
                    encrypted: true,
                    data: encryptedData,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                };
            } catch (error) {
                throw new Error('备份加密失败: ' + error.message);
            }
        }
        
        // 创建下载链接
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // 生成文件名
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const suffix = encryptionPassword ? '-encrypted' : '';
        filename = `bookmarks-backup${suffix}-${dateStr}-${timeStr}.json`;
        
        // 触发下载
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const message = encryptionPassword ? '✅ 加密备份创建成功！' : '✅ 本地备份创建成功！';
        showMessage(message, 'success');
        
        // 记录备份日志
        await logSyncResult('backup', true, `本地备份创建成功: ${filename}`);
        
    } catch (error) {
        console.error('创建备份失败:', error);
        showMessage(`❌ 创建备份失败: ${error.message}`, 'error');
        await logSyncResult('backup', false, error.message);
    } finally {
        setBackupButtonLoading('backupBtn', false);
    }
}

// 恢复本地备份
async function restoreLocalBackup() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

// 处理文件选择
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        setBackupButtonLoading('restoreBtn', true, '📂 恢复中...');
        showMessage('正在恢复备份...', 'info');
        
        // 读取文件
        const fileContent = await readFileAsText(file);
        let backupData = JSON.parse(fileContent);
        
        // 检查是否为加密数据
        if (backupData.encrypted) {
            setBackupButtonLoading('restoreBtn', true, '📂 解密中...');
            showMessage('正在解密备份数据...', 'info');
            
            const { encryptionPassword } = await chrome.storage.sync.get(['encryptionPassword']);
            if (!encryptionPassword) {
                throw new Error('备份已加密，但未设置解密密码。请在设置中配置加密密码。');
            }
            
            try {
                backupData = await BookmarkCrypto.decrypt(backupData.data, encryptionPassword);
            } catch (error) {
                throw new Error('备份解密失败，请检查密码是否正确');
            }
        }
        
        // 验证备份数据
        if (!backupData.bookmarks || !Array.isArray(backupData.bookmarks)) {
            throw new Error('无效的备份文件格式');
        }
        
        showMessage('正在删除现有书签...', 'info');
        await removeAllBookmarks();
        
        showMessage('正在导入备份书签...', 'info');
        const bookmarkBarId = await getBookmarkBarId();
        
        // 恢复书签
        for (const rootBookmark of backupData.bookmarks) {
            if (rootBookmark.children) {
                for (const child of rootBookmark.children) {
                    if (child.title === '书签栏' || child.title === 'Bookmarks bar') {
                        if (child.children) {
                            await createBookmarks(child.children, bookmarkBarId);
                        }
                        break;
                    }
                }
            }
        }
        
        showMessage('✅ 备份恢复成功！', 'success');
        updateBackupInfo(new Date().toISOString());
        
        // 记录恢复日志
        await logSyncResult('restore', true, `备份恢复成功: ${file.name}`);
        
    } catch (error) {
        console.error('恢复备份失败:', error);
        showMessage(`❌ 恢复备份失败: ${error.message}`, 'error');
        await logSyncResult('restore', false, error.message);
    } finally {
        setBackupButtonLoading('restoreBtn', false);
        // 清空文件输入
        event.target.value = '';
    }
}

// 读取文件内容
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('文件读取失败'));
        reader.readAsText(file);
    });
}

// 设置备份按钮加载状态
function setBackupButtonLoading(buttonId, isLoading, loadingText = '') {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(buttonId.replace('Btn', 'Spinner'));
    const textElement = document.getElementById(buttonId.replace('Btn', 'Text'));
    
    if (isLoading) {
        button.disabled = true;
        spinner.style.display = 'inline-block';
        if (loadingText) {
            textElement.textContent = loadingText;
        }
    } else {
        button.disabled = false;
        spinner.style.display = 'none';
        // 恢复原始文本
        if (buttonId === 'backupBtn') {
            textElement.textContent = '💾 创建备份';
        } else if (buttonId === 'restoreBtn') {
            textElement.textContent = '📂 恢复备份';
        }
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', init);
