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
    try {
        const result = await chrome.storage.sync.get(['apiUrl', 'authToken', 'encryptionPassword']);
        if (result.apiUrl) {
            document.getElementById('apiUrl').value = result.apiUrl;
        }
        if (result.authToken) {
            document.getElementById('authToken').value = base64Decode(result.authToken);
        }
        if (result.encryptionPassword) {
            document.getElementById('encryptionPassword').value = result.encryptionPassword;
        }
    } catch (error) {
        console.error('加载设置失败:', error);
        showMessage('加载设置失败', 'error');
    }
}

// 保存设置
async function saveSettings() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';
    
    try {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        const authToken = document.getElementById('authToken').value.trim();
        const encryptionPassword = document.getElementById('encryptionPassword').value.trim();
        
        if (!apiUrl || !authToken) {
            showMessage('请填写完整的API地址和认证Token', 'error');
            return;
        }
        
        // 对敏感数据进行base64编码存储
        const settings = {
            apiUrl: apiUrl,
            authToken: base64Encode(authToken)
        };
        
        // 只有设置了加密密码才保存
        if (encryptionPassword) {
            settings.encryptionPassword = encryptionPassword;
        } else {
            // 如果清空了密码，删除已保存的密码
            await chrome.storage.sync.remove(['encryptionPassword']);
        }
        
        await chrome.storage.sync.set(settings);
        
        showMessage('设置保存成功！', 'success');
    } catch (error) {
        console.error('保存设置失败:', error);
        showMessage('保存设置失败: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 保存设置';
    }
}

// Base64编码/解码函数
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

// 显示消息提示
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // 自动隐藏成功消息
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }
}

// 测试连接功能
async function testConnection() {
    const testBtn = document.getElementById('testBtn');
    testBtn.disabled = true;
    testBtn.textContent = '测试中...';
    
    try {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        const authToken = document.getElementById('authToken').value.trim();
        
        if (!apiUrl || !authToken) {
            showMessage('请先填写API地址和认证Token', 'error');
            return;
        }
        
        // 测试连接
        const response = await fetch(`${apiUrl}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showMessage('连接测试成功！', 'success');
        } else {
            const errorText = await response.text();
            showMessage(`连接测试失败: ${response.status} ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('连接测试失败:', error);
        showMessage('连接测试失败: ' + error.message, 'error');
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '🔗 测试连接';
    }
}

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('testBtn').addEventListener('click', testConnection);
    
    // 阻止表单默认提交
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
});
