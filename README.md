# 基于GitHub的浏览器书签同步插件

[English](https://github.com/pluckypioneer/Sync_List/blob/main/README/Readme_English.md)  |  [Français](https://github.com/pluckypioneer/Sync_List/blob/main/README/Readme_%20Fran%C3%A7ais.md)

Many users find it inconvenient to manually sync bookmarks across multiple browsers. This lightweight bookmark sync tool enables cross-platform, cross-device bookmark synchronization. It uses a GitHub repository to store and transfer bookmark content, ensuring privacy and security. It's free, easy to use, and helps you manage bookmarks effortlessly, saving time and effort.

许多用户因常用多个浏览器，手动同步书签不便，故制此轻量级书签同步工具，实现跨平台、跨设备书签同步。依托 GitHub 仓库实现存储传输书签内容，私密安全，免费易用，轻松管理书签，节约我们的时间精力。

## 目录结构

- icons——图标资源
- manifest.json ——插件配置清单
- popup.html—— 主交互页面
- popup.js——主交互逻辑
- options.html ——设置页面
- options.js —— 设置页面逻辑
- cloudflare_worker.js ——后端服务代码
## 功能特点

- 一键将本地书签上传到 GitHub 仓库
- 从 GitHub 仓库下载书签并覆盖本地书签
- 完整的错误处理和用户提示
- 安全的身份验证机制
- 操作日志记录，便于排查问题
- 支持自定义配置

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

## 使用方法

1. 安装插件后，点击浏览器工具栏中的插件图标
2. 点击 "设置" 按钮，填写：
   - Worker API 地址：你部署的 Cloudflare Worker URL
   - 认证 Token：你设置的 `AUTH_TOKEN` 环境变量值
3. 点击 "保存设置"
4. 使用 "上传书签" 按钮将本地书签同步到 GitHub
5. 使用 "下载书签" 按钮将 GitHub 上的书签同步到本地（会覆盖本地书签）

## 注意事项

- 配置worker环境变量时，请**仔细审查**内容是否正确！！！
- 确保您的网络可以正常访问github，如若不能访问，请自行解决。
- 下载书签会覆盖本地所有书签，请谨慎操作
- 建议定期备份书签，以防意外丢失
- 首次使用时，建议先上传本地书签，确保数据已安全存储
- 私有仓库可以更好地保护你的书签隐私

## 常见问题

### Q: 上传 / 下载失败怎么办？

A: 查看插件弹出框中的错误提示，常见原因包括：

- Worker 地址或认证 Token 配置错误
- GitHub 令牌权限不足或已过期
- 网络连接问题
- GitHub 仓库或文件不存在

### Q: 如何获取 GitHub 个人访问令牌？

A: 访问 [GitHub 令牌设置页面](https://github.com/settings/tokens)，点击 "Generate new token"，勾选 `repo` 权限，生成令牌并妥善保存。

### Q: 可以在多台设备上使用吗？

A: 可以，在每台设备上安装插件并配置相同的 Worker 地址和认证 Token 即可实现多设备同步。

## 许可证

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## 免责声明

- 本插件仅供学习和个人使用，数据安全请自行把控。
- 建议将书签仓库设置为私有，保护个人隐私。

---

如有问题或建议，欢迎提 issue 或联系作者。 
