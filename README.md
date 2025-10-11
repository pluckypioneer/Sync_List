# 📚 基于GitHub的浏览器书签同步插件

[English](https://github.com/pluckypioneer/Sync_List/blob/main/README/Readme_English.md)  |  [Français](https://github.com/pluckypioneer/Sync_List/blob/main/README/Readme_%20Fran%C3%A7ais.md)

Many users find it inconvenient to manually sync bookmarks across multiple browsers. This lightweight bookmark sync tool enables cross-platform, cross-device bookmark synchronization. It uses a GitHub repository to store and transfer bookmark content, ensuring privacy and security. It's free, easy to use, and helps you manage bookmarks effortlessly, saving time and effort.

许多用户因常用多个浏览器，手动同步书签不便，故制此轻量级书签同步工具，实现跨平台、跨设备书签同步。依托 GitHub 仓库实现存储传输书签内容，私密安全，免费易用，轻松管理书签，节约我们的时间精力。

## ✨ 新版本特性

### 🎨 用户界面优化
- 现代化的渐变背景和卡片式设计
- 实时加载状态指示器和按钮状态管理
- 响应式布局和流畅的动画效果
- 连接状态实时显示
- 友好的消息提示系统

### 🔒 安全性增强
- **AES-256-GCM 数据加密**：支持对书签数据进行端到端加密
- **PBKDF2 密钥派生**：使用强密码学算法保护加密密钥
- **Token 验证和会话管理**：增强的身份验证机制
- **请求签名验证**：防止请求篡改和重放攻击
- **敏感数据保护**：本地存储的敏感信息经过编码处理

### 💾 备份和恢复功能
- **本地备份创建**：一键创建本地书签备份文件
- **加密备份支持**：可选择创建加密的备份文件
- **备份文件恢复**：支持从本地备份文件恢复书签
- **数据完整性验证**：确保备份和恢复过程的数据完整性
- **自动备份信息**：备份文件包含时间戳和版本信息

### 📋 日志管理系统
- **详细操作日志**：记录所有同步操作的详细信息
- **日志查看界面**：美观的模态框日志查看器
- **日志分类显示**：成功、失败、信息等不同类型的日志
- **时间戳记录**：精确记录每个操作的时间
- **日志管理**：支持清空历史日志，最多保存100条记录

## 目录结构

- icons——图标资源
- manifest.json ——插件配置清单
- popup.html—— 主交互页面
- popup.js——主交互逻辑
- options.html ——设置页面
- options.js —— 设置页面逻辑
- cloudflare_worker.js ——后端服务代码
## 🚀 功能特点

### 核心功能
- 一键将本地书签上传到 GitHub 仓库
- 从 GitHub 仓库下载书签并覆盖本地书签
- 完整的错误处理和用户提示
- 安全的身份验证机制
- 操作日志记录，便于排查问题
- 支持自定义配置

### 高级功能
- **数据加密**：可选的端到端加密保护书签数据
- **本地备份**：创建和恢复本地备份文件
- **连接测试**：一键测试API连接状态
- **日志管理**：详细的操作日志和查看界面
- **安全增强**：Token验证、会话管理、请求签名
- **用户体验**：现代化UI、加载状态、动画效果

## 安装方法

1. 克隆本仓库到本地
2. 打开 Chrome/Edge 浏览器，进入 `chrome://extensions/` 或 `edge://extensions/`
3. 开启的 "开发者模式"
4. 点击 "加载已解压的扩展程序"，选择本仓库根目录文件夹

## 前期准备

### 1. 准备 GitHub 仓库

1. 创建一个新的 GitHub 仓库（建议设置为private私有仓库，更加安全）
2. 在仓库中创建一个用于存储书签的文件（如 `bookmarks.json`）

### 2. 部署 Cloudflare Worker

1. 注册 / 登录 Cloudflare 账号[访问cloudflare](https://dash.cloudflare.com)
2. 从左侧栏下选择`计算Workers`下子目录`Workers和Pages`，点击右上角按钮创建一个新的 Worker，选择`从 Hello World! 开始`直接部署worker
3. 打开部署好的worker管理界面，点击右上角中间的`编辑代码`，打开worker编辑器，将 `cloudflare_worker.js` 中的代码复制到 Worker 编辑器
4. 配置 Worker 环境变量：
   - `GITHUB_TOKEN`：GitHub 个人访问令牌（需要 `repo` 权限）
   - `GITHUB_REPO_OWNER`：GitHub 用户名
   - `GITHUB_REPO_NAME`：存储书签的仓库名
   - `GITHUB_FILE_PATH`：存储书签的文件路径（如 `bookmarks.json`）
   - `AUTH_TOKEN`：自定义认证令牌（用于插件访问 Worker）
配置方法：从cloudflare上该项目的Worker管理界面，选择“设置”->“域和路由”->“变量与机密”->右上角“添加”，类型默认选择`文本`，输入对应的`环境变量名`和`值`(注意环境变量名一定是大写的，建议直接复制README上方的名字防止出错)
5. 部署 Worker 并记录分配的 URL（如 `https://bookmark-sync.yourname.workers.dev`）

## 📖 使用方法

### 基础配置
1. 安装插件后，点击浏览器工具栏中的插件图标
2. 点击 "设置" 按钮，填写：
   - **Worker API 地址**：你部署的 Cloudflare Worker URL
   - **认证 Token**：你设置的 `AUTH_TOKEN` 环境变量值
   - **加密密码**（可选）：设置后将对书签数据进行加密保护
3. 点击 "测试连接" 验证配置是否正确
4. 点击 "保存设置"

### 书签同步
- 使用 "上传书签" 按钮将本地书签同步到 GitHub
- 使用 "下载书签" 按钮将 GitHub 上的书签同步到本地（会覆盖本地书签）

> 注意：1. 下载书签会覆盖本地所有书签，请谨慎操作；2.下载书签会导入到浏览器名为“书签栏”书签文件件内，请自行查看调整书签布局。

### 备份管理
- 点击 "创建备份" 生成本地备份文件（支持加密）
- 点击 "恢复备份" 从本地备份文件恢复书签

### 日志查看
- 点击 "查看日志" 查看详细的操作记录
- 点击 "清空日志" 清除历史日志记录

### 安全提示
- 如果设置了加密密码，所有上传的数据都会被加密
- 备份文件也支持加密，确保数据安全
- 定期查看日志可以了解同步状态和排查问题

## ⚠️ 注意事项

### 配置相关
- 配置worker环境变量时，请**仔细审查**内容是否正确！！！
- 确保您的网络可以正常访问github，如若不能访问，请自行解决
- 使用"测试连接"功能验证配置是否正确

### 数据安全
- 下载书签会覆盖本地所有书签，请谨慎操作
- **强烈建议设置加密密码**，保护书签数据安全
- 定期使用"创建备份"功能备份书签，以防意外丢失
- 首次使用时，建议先上传本地书签，确保数据已安全存储
- 私有仓库可以更好地保护你的书签隐私

### 加密功能
- 设置加密密码后，请务必记住密码，忘记密码将无法解密数据
- 加密密码不会上传到服务器，只在本地使用
- 更换设备时需要在新设备上设置相同的加密密码

## ❓ 常见问题

### Q: 上传 / 下载失败怎么办？

A: 首先使用"测试连接"功能检查配置，然后查看"日志"获取详细错误信息。常见原因包括：

- Worker 地址或认证 Token 配置错误
- GitHub 令牌权限不足或已过期
- 网络连接问题
- GitHub 仓库或文件不存在
- 加密密码设置不一致

### Q: 如何获取 GitHub 个人访问令牌？

A: 访问 [GitHub 令牌设置页面](https://github.com/settings/tokens)，点击 "Generate new token"，勾选 `repo` 权限，生成令牌并妥善保存。注意确保生成的令牌有'Contents'的读写权限。如有不懂请自行查问ai或有关资料。

### Q: 可以在多台设备上使用吗？

A: 可以，在每台设备上安装插件并配置相同的 Worker 地址、认证 Token 和加密密码即可实现多设备同步。

### Q: 忘记加密密码怎么办？

A: 如果忘记加密密码，已加密的数据将无法解密。建议：
- 如果有未加密的本地备份，可以从备份恢复
- 重新开始，清空远程数据，重新上传（会丢失已加密的数据）
- 因此强烈建议妥善保管加密密码

### Q: 备份文件在哪里？

A: 点击"创建备份"后，文件会自动下载到浏览器的默认下载目录，文件名格式为 `bookmarks-backup-YYYYMMDD-HHMMSS.json`（加密备份会有 `-encrypted` 后缀）。

### Q: 如何查看操作日志？

A: 点击插件界面中的"查看日志"按钮，可以查看详细的操作记录，包括成功、失败和错误信息，有助于排查问题。

## 🔧 技术特性

### 安全技术
- **AES-256-GCM 加密**：业界标准的对称加密算法
- **PBKDF2 密钥派生**：使用10万次迭代增强密码安全性
- **随机盐值**：每次加密使用不同的盐值
- **完整性验证**：GCM模式提供数据完整性保护

### 架构设计
- **模块化代码结构**：使用类和模块化设计便于维护
- **错误处理机制**：完善的错误捕获和用户友好提示
- **状态管理**：实时UI状态更新和加载指示
- **数据验证**：多层数据验证确保数据完整性

## 📋 版本更新日志

### v2.0.0 (最新版本)
- ✨ 新增数据加密功能（AES-256-GCM）
- ✨ 新增本地备份和恢复功能
- ✨ 新增详细的日志管理系统
- ✨ 新增连接测试功能
- 🎨 全新的用户界面设计
- 🔒 增强的安全性和Token管理
- 🐛 修复了多个已知问题
- 📱 改进的响应式设计

### v1.0.0
- 🎉 基础的书签同步功能
- 📤 上传书签到GitHub
- 📥 从GitHub下载书签
- ⚙️ 基础配置管理

## 📄 许可证

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## ⚠️ 免责声明

- 本插件仅供学习和个人使用，数据安全请自行把控
- 建议将书签仓库设置为私有，保护个人隐私
- 加密功能虽然提供了额外的安全保护，但请妥善保管加密密码
- 作者不对因使用本插件造成的任何数据丢失负责

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 联系方式

如有问题或建议，欢迎：
- 提交 [GitHub Issue](https://github.com/pluckypioneer/Sync_List/issues)
- 发起 [Pull Request](https://github.com/pluckypioneer/Sync_List/pulls)
- 邮箱: syncbookmark@john-life.sbs

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

---
打赏链接：
> USDT Address：` 0x2aa1308a4ce8671870ff5984c0b9b5fbf56b597e `

<img src="https://health.john-life.sbs/images/eth.jpg =400×400" alt="图片alt" title="OKX打赏">


