# AGENTS.md

本文件用于约束和指导参与本项目的 AI 代理与协作者。除非用户明确给出更高优先级的指令，否则应遵守以下规则。

## 项目背景与技术栈

涉及本项目的背景、定位、部署信息与技术栈说明时，请优先参考 `README.md`。

## Git 分支约束

本项目的唯一开发者是 AI 代理，不存在多人并行开发需求。因此：

- **严禁创建任何 Git 分支**。所有修改、提交和推送都必须直接在 `main` 分支上完成。
- 已有功能分支（如 `feat/*`）应尽快合并回 `main` 并删除远端分支。
- 每次部署前必须确认当前在 `main` 分支上，且 `main` 包含了所有已完成功能。

> 此约束已被违反过一次（创建了 `feat/sidebar-collapse` 和 `feat/fullscreen-editor` 分支），导致部署时功能丢失。教训：单开发者项目不需要分支，所有工作直接在 main 上完成。

## GitHub Issue 与 Release 约束

正式版本统一遵循 Semantic Versioning。Git 标签与 GitHub Release 标题必须使用完全相同的 `vX.Y.Z` 格式，例如标签和标题都写作 `v0.1.15`；禁止混用 `EdgeEver vX.Y.Z`、中文标题或其他前后缀。常规修复和向后兼容的小功能递增 patch，向后兼容的重要功能递增 minor，破坏性变更递增 major。发布前必须先检查最新 Release 和远端标签，严禁覆盖、移动或重复使用已经发布的版本号。

Release 标签必须精确指向 `main` 上经过验证的发布提交。除非用户明确要求，否则应发布为非 Draft、非 Prerelease 的正式版本。发布正文统一使用以下结构：

```md
## 主要更新

- 面向用户说明本次变化及影响。

关联 Issue：#<issue-number>

## 验证

- 列出实际完成的测试、类型检查和构建结果。
```

每个功能或修复 Release 都应关联对应的 GitHub Issue。如果发布前尚无 Issue，应先创建并记录问题、目标与实现结果；Release 正文引用该 Issue，发布成功后在 Issue 中回链 Release，并按实际完成状态关闭。验证失败时不得发布正式 Release。

## Cloudflare 自动部署约束

当用户要求根据 GitHub 项目链接将本项目安装部署到 Cloudflare 时，必须先完整阅读并严格按照 `docs/agent-deploy-cloudflare.md` 执行。该文档是此部署流程的唯一操作规范；不要在本文件重复维护部署命令、密码配置或 Workers Builds 步骤。

## 本地启动约束

本地预览或调试时，必须优先使用 `bun run dev` 启动完整开发环境，让 API 通过 `scripts/run-wrangler.mjs` 读取 `.env.local` 中的个性化实例配置。实例名称、D1/R2 资源、账号等本机私有配置均以 `.env.local` 为准，严禁在代理指令或代码中硬编码个人实例名。

除非用户明确要求只启动前端静态界面，否则不要单独运行 `bun run dev:web`；该命令不会启动 API，也不会保证读取 `.env.local` 中的实例配置，容易导致前端请求 `127.0.0.1:8787` 失败或误判环境。

## 组件复用与造轮子约束

UI 功能应尽量复用 `shadcn/ui` 等现有 UI 组件。在实现其他功能时，也应优先采用成熟、稳定的开源组件或库，绝对禁止在没有充分必要性的前提下自行从零造轮子。

为方便代码维护，当页面或功能模块出现复杂结构、重复布局或潜在复用场景时，应视情况封装为独立组件，保持页面入口聚焦于组合与数据传递。

## 自动迭代工作流

以下工作流是默认的代码开发流程，除非用户明确指定其他方式，否则自动执行。

```
修改代码
  ↓
pi-lens 检查（lsp_diagnostics 验证零错误）
  ↓
成功后提交并推送到 main
  ↓
等待 GitHub Actions 构建结果（自动查状态，不用 sleep 阻塞会话）
  ↓
若 CI 失败 → 读取构建日志 → 修复 → 回到第一步
  ↓
重复直到 CI 通过
```

### 关键约束

- 本地没有 Android SDK，无法本地 Gradle 构建。APK 验证依赖 GitHub Actions CI。
- AK 需要用 `lsp_diagnostics` 验证零错误后再提交，减少 CI 空转。
- 用 `curl + GITHUB_TOKEN` 通过 GitHub API 查构建状态，不限流。
- 遇到 CI 错误时先查 `AGENTS.md` 的「构建经验」看是否有已知修复。

## 构建经验

以下记录 Android APK 构建过程中遇到过的错误与修复，供后续 AI 会话遇到 CI 失败时快速定位。

### 2025-07-19：expo install --check 版本不匹配

- **症状**: CI 中 `expo install --check` 以非零退出码失败，构建终止
- **原因**: `package.json` 中 expo 生态包的版本未与 SDK 57 完全对齐
- **修复**: 在本地运行 `bunx expo install <包名>` 让 Expo 自动解析正确版本
- **涉及包**: `expo-clipboard`, `expo-constants`, `expo-document-picker`, `expo-image-manipulator`, `expo-linking`, `react-native-screens`
- **教训**: 添加新的 expo 包后，应运行 `expo install --check` 验证版本一致性

### 2025-07-19：APK 缺少 JS bundle（Unable to load script）

- **症状**: APK 安装后启动报 `Unable to load script. Make sure you're running Metro or that your bundle 'index.android.bundle' is packaged correctly for release.`
- **原因**: `expo prebuild --clean` 生成原生项目后，直接 `./gradlew assembleDebug` 没有自动触发 Metro JS 打包，APK 中缺少 `index.android.bundle`
- **修复**: 在 Gradle 编译前显式执行 JS bundle 步骤：

  ```yaml
  - name: Bundle JavaScript
    run: |
      mkdir -p android/app/src/main/assets
      npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file node_modules/expo-router/entry.js \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res/
  ```

- **教训**: CI 环境下 `expo prebuild` + `gradlew` 方式需要显式 bundle 步骤。如果用 `npx expo run:android` 则自动处理。当前工作流文件：`.github/workflows/mobile-build.yml`

### 2025-07-19：react-native bundle 缺少 @react-native-community/cli

- **症状**: CI 中 bundle 步骤报 `react-native depends on @react-native-community/cli`
- **原因**: `react-native bundle` 命令需要 `@react-native-community/cli` 包
- **修复**: 在 `apps/mobile/package.json` 的 devDependencies 中添加 `"@react-native-community/cli": "latest"`
- **教训**: 在 CI 中使用 `npx react-native bundle` 需要显式安装 CLI 依赖

### 2025-07-19：react-native bundle 需要 metro.config.js

- **症状**: CI 中 bundle 步骤报 `No Metro config found in /home/runner/work/edgeever/edgeever/apps/mobile`
- **原因**: Expo/RN 项目缺少 `metro.config.js`，`react-native bundle` 需要它来确定打包配置
- **修复**: 创建 `apps/mobile/metro.config.cjs`（注意 `.cjs` 而非 `.js`，因为 `package.json` 中有 `"type": "module"`，`.js` 文件会被视为 ESM 导致 `require` 不可用）
- **教训**: 在 CI 中显式执行 `npx react-native bundle` 时需要项目根目录有 metro.config，且必须用 `.cjs` 扩展名

## 决策记录

以下记录跨会话的重要决策，供后续 AI 会话快速恢复上下文。

### 2025-07-18：Android 系统分享接入（expo-share-intent）

- **功能**: 从浏览器、微信等 App 分享内容到 EdgeEver 笔记
- **技术**: `expo-share-intent v8`，支持 text/url 分享
- **核心文件**:
  - `src/lib/share-receiver.ts` — 分享内容类型定义、持久化、Memo 构建
  - `src/components/ShareManager.tsx` — ShareIntentProvider 封装 + OS 分享 intent 处理
  - `src/components/ShareReceiveModal.tsx` — 保存界面（标题/笔记本/标签）
- **流程**: 接收分享 → 已登录则弹出保存界面 → 未登录存 AsyncStorage → 登录后恢复
- **限制**: 当前仅支持 text/url，不支持图片附件

### 2025-07-17：配置 pi MCP 扩展 + 表格渲染 + 侧栏折叠

- **EdgeEver 实例**: `https://edgeever.davidqi.workers.dev`
- **MCP Token**: 已配置到 `~/.pi/mcp-servers.json` 和 `edgeever/.mcp/edgeever.json`
- **pi 扩展**: `~/.pi/agent/extensions/mcp-harness.ts` — 自动发现 MCP 服务器并注册工具
- **表格渲染**: 完成 `@tiptap/extension-table` 集成，`markdownToDoc`/`docToMarkdown` 双向支持
- **侧栏折叠**: 笔记本列表左侧栏折叠/展开功能，按钮在侧栏外部、折叠后仍可见
- **Git 策略确认**: 单开发者，所有工作直接在 `main` 分支上完成，禁止创建功能分支
- **已删除的远端分支**: `feat/sidebar-collapse`, `feat/fullscreen-editor`
