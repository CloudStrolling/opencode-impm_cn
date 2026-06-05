# opencode-impm 安装指南

## 概述

opencode-impm 是一个 OpenCode 插件，包含两部分：
- **JS 插件**（`dist/index.js`）：提供 7 个自定义工具（文档读写、版本管理、任务调度、项目分析等）
- **资源文件**（`assets/commands/`、`assets/agents/`、`assets/skills/`）：提供 AI 项目经理所需的命令、Agent 定义和技能

## 安装方式

### 方式一：npm 全局安装（推荐）

**适用场景**：在任意项目中使用 impm 全流程开发。

```bash
# 在目标项目目录中执行
cd your-project
npm install opencode-impm
```

安装成功后：
1. `node_modules/opencode-impm/assets/` 的内容会自动复制到 `your-project/.opencode/`
2. `your-project/opencode.json` 会自动添加 `"opencode-impm"` 到 plugin 列表
3. 检查确认：
```bash
ls .opencode/commands/    # 应包含 impm.md 等命令文件
ls .opencode/agents/      # 应包含 pm.md 等 Agent 定义
ls .opencode/skills/      # 应包含 impm-* 等技能目录
```

在 OpenCode 中使用 `/impm` 命令启动全流程开发。

---

### 方式二：本地项目级安装（开发/调试）

**适用场景**：从源代码构建并安装到同一个项目（插件开发或调试）。

```bash
# 1. 克隆仓库
git clone https://github.com/opencode-ai/opencode-impm.git
cd opencode-impm

# 2. 安装依赖并构建
npm install
npm run build

# 3. 安装插件到本地 .opencode/
npm run install:plugin
# 或手动：
# node scripts/install.mjs
```

安装后 `opencode.json` 会自动添加 `"opencode-impm"` 到 plugin 列表。

---

### 方式三：npm 安装 + 手动配置 opencode.json

**适用场景**：已通过 npm 安装，但需要自定义配置。

```bash
# 1. 安装
npm install opencode-impm

# 2. 手动复制资源（如果 postinstall 未自动执行）
node node_modules/opencode-impm/scripts/install.mjs --target .

# 3. 或在 opencode.json 中手动添加：
```

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-impm"]
}
```

---

### 方式四：PowerShell 安装脚本

**适用场景**：Windows 环境下需要更精细控制的安装。

```powershell
# 本地安装
.\scripts\install.ps1

# 安装到指定项目
.\scripts\install.ps1 -Target "D:\projects\my-app"
```

---

## 验证安装

启动 OpenCode 后，在对话中输入 `/` 查看命令列表，应出现 `impm` 相关的命令：

| 命令 | 说明 |
|------|------|
| `/impm` | 完整 impm 开发流程 |
| `/impm-req-create` | 生成需求文档 |
| `/impm-prd-create` | 生成 PRD 文档 |
| `/impm-architect-create` | 生成架构文档 |
| `/impm-sds-create` | 生成技术规格说明 |
| `/impm-task-create` | 生成任务清单 |
| `/impm-task-coding` | 执行单个任务编码 |
| `/impm-docs-update` | 更新项目文档 |
| ... | ... |

---

## 发布到 npm

```bash
# 构建
npm run build

# 试运行发布（检查包内容）
npm publish --dry-run

# 发布
npm publish --access public
```

发布后消费者即可通过 `npm install opencode-impm` 安装。

---

## 目录结构

```
node_modules/opencode-impm/
├── assets/                  # 资源文件（发布到 npm）
│   ├── agents/              # Agent 定义（pm.md, ba.md 等）
│   ├── commands/            # 命令定义（impm.md 等）
│   └── skills/              # 技能定义（impm-* 技能目录）
├── dist/                    # 编译后的 JS 插件
│   └── index.js
├── scripts/
│   └── install.mjs          # 安装脚本
└── package.json
```

目标项目安装后的结构：

```
your-project/
├── .opencode/               # 自动生成的配置
│   ├── agents/              # 从插件复制
│   ├── commands/
│   └── skills/
├── opencode.json            # 自动添加 "opencode-impm"
└── node_modules/
    └── opencode-impm/       # 安装的插件
```
