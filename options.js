// 编码函数
function base64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// 解码函数
function base64Decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

// 加载已保存的设置
async function loadSettings() {
    const { apiBase, authToken } = await chrome.storage.sync.get(['apiBase', 'authToken']);
    
    if (apiBase) {
        document.getElementById('apiBase').value = apiBase;
    }
    
    if (authToken) {
        document.getElementById('authToken').value = authToken;
    }
}

// 保存设置
async function saveSettings() {
    const apiBase = document.getElementById('apiBase').value.trim();
    const authToken = document.getElementById('authToken').value.trim();
    
    if (!apiBase) {
        showMessage('请输入API地址', 'error');
        return;
    }
    
    try {
        // 简单验证URL格式
        new URL(apiBase);
    } catch (err) {
        showMessage('API地址格式不正确', 'error');
        return;
    }
    
    try {
        await chrome.storage.sync.set({
            apiBase,
            authToken
        });
        
        showMessage('设置保存成功', 'success');
        
        // 2秒后自动关闭设置页面
        setTimeout(() => {
            window.close();
        }, 2000);
    } catch (err) {
        showMessage(`保存失败: ${err.message}`, 'error');
    }
}

// 显示消息提示
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
});
