// 支持Unicode的Base64编码函数
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// 对应的Base64解码函数
function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

// 配置参数
const GITHUB_FILE_PATH = 'bookmarks.json';
const TIMEOUT = 30000; // 统一超时时间（30秒）

// GitHub API URL生成
function getGitHubApiUrl(owner, repo, path) {
    return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

// 处理404错误
function isFileNotFoundError(response) {
    return response.status === 404;
}

// 获取文件SHA
async function getFileSha(githubToken, owner, repo, path) {
    try {
        const response = await fetch(getGitHubApiUrl(owner, repo, path), {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Bookmark Sync Worker'
            },
            signal: AbortSignal.timeout(TIMEOUT)
        });

        if (isFileNotFoundError(response)) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`获取文件信息失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.sha;
    } catch (err) {
        console.error('获取文件SHA失败:', err);
        throw new Error(`获取文件信息出错：${err.message}`);
    }
}

// 上传到GitHub
async function uploadToGitHub(githubToken, owner, repo, path, content, sha) {
    try {
        const response = await fetch(getGitHubApiUrl(owner, repo, path), {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Bookmark Sync Worker'
            },
            body: JSON.stringify({
                message: `Update bookmarks: ${new Date().toISOString()}`,
                content: content,
                sha: sha
            }),
            signal: AbortSignal.timeout(TIMEOUT)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.message || `${response.status} ${response.statusText}`;
            throw new Error(`上传到GitHub失败: ${errorMsg}`);
        }

        return await response.json();
    } catch (err) {
        console.error('上传到GitHub失败:', err);
        throw new Error(`上传过程出错：${err.message}`);
    }
}

// 从GitHub下载
async function downloadFromGitHub(githubToken, owner, repo, path) {
    try {
        const response = await fetch(getGitHubApiUrl(owner, repo, path), {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Bookmark Sync Worker'
            },
            signal: AbortSignal.timeout(TIMEOUT)
        });

        if (isFileNotFoundError(response)) {
            throw new Error('未找到书签文件，请先上传');
        }

        if (!response.ok) {
            throw new Error(`从GitHub下载失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = base64Decode(data.content); // 使用正确的解码函数
        
        try {
            return JSON.parse(content);
        } catch (err) {
            throw new Error(`书签数据解析失败：${err.message}`);
        }
    } catch (err) {
        console.error('从GitHub下载失败:', err);
        throw new Error(`下载过程出错：${err.message}`);
    }
}

// 验证请求身份
function validateRequest(request, authToken) {
    const requestToken = request.headers.get('X-Auth-Token');
    return requestToken && requestToken === authToken;
}

// 处理CORS
function handleCors(request) {
    const origin = request.headers.get('Origin') || '';
    
    // 检查是否为浏览器扩展请求
    const isExtensionOrigin = origin.startsWith('chrome-extension://') || 
                             origin.startsWith('moz-extension://') ||
                             origin.startsWith('safari-web-extension://');

    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };

    // 允许所有浏览器扩展访问
    if (isExtensionOrigin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }

    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 200,
            headers 
        });
    }

    return headers;
}

// 主处理函数
export default {
    async fetch(request, env) {
        const corsHeaders = handleCors(request);
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // 验证环境变量
        const requiredEnvVars = ['GITHUB_TOKEN', 'GITHUB_REPO_OWNER', 'GITHUB_REPO_NAME', 'AUTH_TOKEN'];
        const missingEnvVars = requiredEnvVars.filter(varName => !env[varName]);
        
        if (missingEnvVars.length > 0) {
            console.error('缺少环境变量:', missingEnvVars);
            return new Response(
                JSON.stringify({
                    error: 'SERVER_CONFIG_ERROR',
                    message: '服务器配置错误：缺少必要的环境变量',
                    details: `缺少: ${missingEnvVars.join(', ')}`,
                    timestamp: new Date().toISOString()
                }), 
                { 
                    status: 500, 
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // 验证身份
        if (!validateRequest(request, env.AUTH_TOKEN)) {
            console.warn('未授权访问尝试:', request.headers.get('X-Auth-Token'));
            return new Response(
                JSON.stringify({
                    error: 'UNAUTHORIZED',
                    message: '未授权访问：请检查认证Token是否正确',
                    timestamp: new Date().toISOString()
                }), 
                { 
                    status: 401, 
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const url = new URL(request.url);
        
        try {
            // 处理上传
            if (url.pathname === '/upload' && request.method === 'POST') {
                let content;
                try {
                    content = await request.json();
                } catch (err) {
                    console.error('JSON解析失败:', err);
                    return new Response(
                        JSON.stringify({
                            error: 'INVALID_JSON',
                            message: '请求数据格式错误：无法解析JSON',
                            details: err.message,
                            timestamp: new Date().toISOString()
                        }),
                        { 
                            status: 400, 
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }

                // 验证数据格式
                if (!content || !content.bookmarks || !content.updatedAt) {
                    return new Response(
                        JSON.stringify({
                            error: 'INVALID_DATA_FORMAT',
                            message: '上传数据格式不正确',
                            details: '缺少必要字段：bookmarks 或 updatedAt',
                            timestamp: new Date().toISOString()
                        }),
                        { 
                            status: 400, 
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }

                // 限制数据大小
                const contentStr = JSON.stringify(content);
                const sizeInMB = (contentStr.length / (1024 * 1024)).toFixed(2);
                if (contentStr.length > 10 * 1024 * 1024) {
                    return new Response(
                        JSON.stringify({
                            error: 'DATA_TOO_LARGE',
                            message: '上传失败：数据超过大小限制',
                            details: `当前大小: ${sizeInMB}MB，限制: 10MB`,
                            timestamp: new Date().toISOString()
                        }),
                        { 
                            status: 413, 
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }

                // 使用正确的编码函数
                const base64Content = base64Encode(contentStr);
                
                const sha = await getFileSha(
                    env.GITHUB_TOKEN,
                    env.GITHUB_REPO_OWNER,
                    env.GITHUB_REPO_NAME,
                    GITHUB_FILE_PATH
                );

                await uploadToGitHub(
                    env.GITHUB_TOKEN,
                    env.GITHUB_REPO_OWNER,
                    env.GITHUB_REPO_NAME,
                    GITHUB_FILE_PATH,
                    base64Content,
                    sha
                );

                return new Response(
                    JSON.stringify({
                        success: true,
                        message: '书签上传成功',
                        size: `${sizeInMB}MB`,
                        timestamp: new Date().toISOString()
                    }), 
                    { 
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            // 处理下载
            if (url.pathname === '/download' && request.method === 'GET') {
                const data = await downloadFromGitHub(
                    env.GITHUB_TOKEN,
                    env.GITHUB_REPO_OWNER,
                    env.GITHUB_REPO_NAME,
                    GITHUB_FILE_PATH
                );

                return new Response(JSON.stringify(data), {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }

            return new Response(
                JSON.stringify({
                    error: 'NOT_FOUND',
                    message: '未找到请求的资源',
                    details: `路径 ${url.pathname} 不存在`,
                    timestamp: new Date().toISOString()
                }), 
                { 
                    status: 404, 
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.error('处理请求时出错:', err);
            
            // 根据错误类型返回不同的状态码
            let statusCode = 500;
            let errorCode = 'INTERNAL_ERROR';
            
            if (err.message.includes('GitHub')) {
                statusCode = 502;
                errorCode = 'GITHUB_API_ERROR';
            } else if (err.message.includes('超时') || err.message.includes('timeout')) {
                statusCode = 504;
                errorCode = 'TIMEOUT_ERROR';
            } else if (err.message.includes('网络') || err.message.includes('network')) {
                statusCode = 503;
                errorCode = 'NETWORK_ERROR';
            }
            
            return new Response(
                JSON.stringify({
                    error: errorCode,
                    message: '处理请求时发生错误',
                    details: err.message,
                    timestamp: new Date().toISOString()
                }), 
                { 
                    status: statusCode, 
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    }
};
