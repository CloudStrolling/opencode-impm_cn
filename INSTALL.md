# opencode-impm 编译与安装指南

## 编译

```bash
# 安装依赖
npm install

# 编译 TypeScript → dist/
npm run build

# 开发模式：监听文件变化自动编译
npm run dev
```

编译产物：`dist/` 目录（js + d.ts + map 文件）。

---

## 三种安装方式

### 1. 项目级安装（推荐）

在目标项目目录中安装，仅对该项目生效：

```bash
# 方式 A：本地路径引用
cd your-project/
npm install D:\path\to\opencode-impm

# 方式 B：压缩包
cd your-project/
npm install opencode-impm-0.1.0.tgz
```

`postinstall` 脚本会自动将 `assets/` 下的 `commands/`、`agents/`、`skills/` 复制到目标项目的 `.opencode/` 目录，并更新 `opencode.json` 的 plugin 列表。

目标项目 `.opencode/` 目录结构（自动生成）：

```
.opencode/
├── commands/impm.md
├── agents/     (12 个 agent 定义)
└── skills/     (8 个 skill)
```

### 2. 全局安装

通过 npm 全局安装，对所有项目生效：

```bash
# 在插件项目目录
npm link

# 或在任意目录安装本地包
npm install -g D:\path\to\opencode-impm
```

全局安装后，需要在 OpenCode 的全局配置目录添加 plugin 引用：

**Windows**: `%USERPROFILE%\.config\opencode\opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-impm"]
}
```

然后手动将 `assets/` 内容复制到全局 `.opencode/` 目录：

```bash
# Windows PowerShell
$pluginDir = "D:\path\to\opencode-impm"
$globalDir = "$env:USERPROFILE\.config\opencode"
Copy-Item "$pluginDir\assets\*" "$globalDir\" -Recurse -Force
```

> **注意**：全局安装时 `postinstall` 脚本不会自动运行，需要手动完成上述复制和配置步骤。

### 3. 手工安装（不依赖 npm）

如果目标项目不依赖 Node.js/npm：

```
你的项目/
├── .opencode/
│   ├── commands/impm.md    ← 复制自 assets/commands/
│   ├── agents/*.md          ← 复制自 assets/agents/
│   └── skills/*/SKILL.md    ← 复制自 assets/skills/
└── opencode.json            ← 添加 "plugin": ["opencode-impm"]
```

---

## 更新插件

```bash
# 重新编译
npm run build

# 如果是项目级安装，重新执行安装脚本
npm run install:plugin

# 或手动触发（项目目录下）
node scripts/install.mjs
```

---

## npm 发布

```bash
# 1. 编译
npm run build

# 2. 登录 npm
npm login

# 3. 发布
npm publish

# 4. 发布后，用户通过以下方式安装
npm install opencode-impm
```

发布前确认 `package.json` 中的 `files` 字段包含所有必要文件：

```json
{
  "files": ["dist/", "assets/", "scripts/", "template/"]
}
```

版本号遵循 SemVer 规范，使用 `npm version` 管理：

```bash
# 修订号（修复）
npm version patch   # 0.1.0 → 0.1.1

# 次版本号（新功能）
npm version minor   # 0.1.0 → 0.2.0

# 主版本号（破坏性变更）
npm version major   # 0.1.0 → 1.0.0
```

---

## 验证安装

在任意项目目录打开 OpenCode，运行：

```
/impm
```

如果看到 PM Agent 开始执行 impm 流程，说明安装成功。
