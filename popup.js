let API_BASE;

// 初始化：从存储中加载API配置
async function init() {
    const { apiBase } = await chrome.storage.sync.get('apiBase');
    API_BASE = apiBase;
    
    if (!API_BASE) {
        showMessage('请先配置API地址', 'info');
    }
    
    // 绑定按钮事件
    document.getElementById('uploadBtn').addEventListener('click', uploadBookmarks);
    document.getElementById('downloadBtn').addEventListener('click', downloadBookmarks);
    document.getElementById('settingsLink').addEventListener('click', openSettings);
}

// 显示消息提示
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// 打开设置页面
function openSettings() {
    chrome.runtime.openOptionsPage();
}

// 上传书签到GitHub
async function uploadBookmarks() {
    if (!API_BASE) {
        showMessage('请先配置API地址', 'error');
        return;
    }

    try {
        showMessage('正在获取书签...', 'info');
        
        // 获取书签并处理可能的错误
        const bookmarks = await new Promise((resolve, reject) => {
            chrome.bookmarks.getTree((tree) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`获取书签失败: ${chrome.runtime.lastError.message}`));
                } else {
                    resolve(tree);
                }
            });
        });

        // 添加时间戳用于冲突处理
        const dataToUpload = {
            bookmarks,
            updatedAt: new Date().toISOString()
        };

        showMessage('正在上传书签...', 'info');
        
        // 发送请求到Cloudflare Worker
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': await getAuthToken()
            },
            body: JSON.stringify(dataToUpload),
            signal: AbortSignal.timeout(10000) // 10秒超时
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`上传失败: ${errorText || response.statusText}`);
        }

        showMessage('书签上传成功', 'success');
        logSyncResult('upload', true, '上传成功');
    } catch (err) {
        showMessage(`上传失败: ${err.message}`, 'error');
        logSyncResult('upload', false, err.message);
    }
}

// 从GitHub下载书签
async function downloadBookmarks() {
    if (!API_BASE) {
        showMessage('请先配置API地址', 'error');
        return;
    }

    // 二次确认，防止误操作
    if (!confirm('确定要从GitHub下载书签吗？这将覆盖您当前的所有书签！')) {
        return;
    }

    try {
        showMessage('正在下载书签...', 'info');
        
        // 从Cloudflare Worker获取书签
        const response = await fetch(`${API_BASE}/download`, {
            headers: {
                'X-Auth-Token': await getAuthToken()
            },
            signal: AbortSignal.timeout(10000) // 10秒超时
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`下载失败: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || !data.bookmarks || !Array.isArray(data.bookmarks)) {
            throw new Error('获取的数据格式不正确');
        }

        showMessage('正在删除现有书签...', 'info');
        await removeAllBookmarks();
        
        showMessage('正在导入新书签...', 'info');
        await createBookmarks(data.bookmarks, '0'); // 导入到根节点
        
        showMessage('书签同步完成', 'success');
        logSyncResult('download', true, '下载成功');
    } catch (err) {
        showMessage(`同步失败: ${err.message}`, 'error');
        logSyncResult('download', false, err.message);
    }
}

// 递归创建书签
function createBookmarks(bookmarks, parentId) {
    return Promise.all(bookmarks.map(bookmark => {
        return new Promise((resolve) => {
            // 过滤掉不需要的属性
            const bookmarkData = {
                parentId,
                title: bookmark.title || '',
                url: bookmark.url || undefined
            };

            chrome.bookmarks.create(bookmarkData, (newBookmark) => {
                // 如果有子节点，递归创建
                if (bookmark.children && bookmark.children.length > 0) {
                    createBookmarks(bookmark.children, newBookmark.id)
                        .then(resolve)
                        .catch(resolve); // 即使子节点创建失败，也继续处理
                } else {
                    resolve();
                }
            });
        });
    }));
}

// 删除所有书签（保留根节点）
function removeAllBookmarks() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((tree) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(`删除书签失败: ${chrome.runtime.lastError.message}`));
            }
            
            if (!tree || !tree[0] || !tree[0].children) {
                return resolve();
            }

            // 获取所有根节点的子节点（排除根节点本身）
            const rootChildren = tree[0].children;
            const deletePromises = rootChildren.map(node => 
                new Promise((res) => {
                    chrome.bookmarks.removeTree(node.id, () => {
                        // 忽略单个节点删除的错误，继续删除其他节点
                        res();
                    });
                })
            );

            Promise.all(deletePromises).then(resolve).catch(resolve);
        });
    });
}

// 获取认证Token
async function getAuthToken() {
    const { authToken } = await chrome.storage.sync.get('authToken');
    return authToken || '';
}

// 记录同步结果到日志
async function logSyncResult(type, success, message) {
    try {
        const { syncLogs } = await chrome.storage.local.get('syncLogs');
        const logs = Array.isArray(syncLogs) ? syncLogs : [];
        
        // 只保留最近100条日志
        if (logs.length >= 100) {
            logs.shift();
        }
        
        logs.push({
            type,
            success,
            message,
            timestamp: new Date().toISOString()
        });
        
        await chrome.storage.local.set({ syncLogs: logs });
    } catch (err) {
        console.error('记录日志失败:', err);
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', init);
