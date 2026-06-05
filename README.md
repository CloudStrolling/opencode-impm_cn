# OpenCode IMPM — AI项目经理

> 基于 OpenCode 平台的 AI 项目经理插件，实现从需求到上线的全流程自动化工程开发。

[![npm version](https://img.shields.io/npm/v/opencode-impm)](https://www.npmjs.com/package/opencode-impm)
[![License](https://img.shields.io/npm/l/opencode-impm)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

---

## 概述

opencode-impm 是一个 OpenCode 插件，通过编排多个专业 AI Agent（BA、SA、TL、TE、FE/BE/DE 等），按照 **TDD 驱动**和**文档驱动**的方式，自动化执行从需求分析、架构设计、任务分配、编码实现到文档生成的完整软件工程生命周期。

### 核心特点

- **全流程自动化** — 一条命令走通需求→设计→编码→测试→文档全流程
- **多 Agent 协作** — PM 主控编排，BA/SA/TL/TE/FE/BE 各司其职，上下文隔离
- **TDD 驱动** — 严格遵循"先写测试用例，再写实现代码"的原则
- **文档驱动** — 每个阶段产出标准化文档，信息可追溯
- **零外部依赖** — 仅使用 Node.js 内置模块，轻量无负担

---

## 安装

### 方式一：npm 安装（推荐）

在目标项目目录中执行：

```bash
npm install opencode-impm
```

安装后自动将插件资源复制到 `.opencode/`，并更新 `opencode.json`。

### 方式二：本地安装

```bash
git clone https://github.com/opencode-ai/opencode-impm.git
cd opencode-impm
npm install
npm run build
npm run install:plugin
```

### 方式三：手动配置

```bash
npm install opencode-impm
node node_modules/opencode-impm/scripts/install.mjs --target .
```

或手动在 `opencode.json` 中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-impm"]
}
```

详见 [docs/INSTALL.md](docs/INSTALL.md)。

---

## 快速开始

在 OpenCode 中启动对话，输入：

```
/impm
```

PM Agent 会自动执行完整开发流程：

1. 检查 Git 初始化
2. 分析项目结构，生成/更新 project.md
3. 引导你输入需求，生成需求文档
4. 生成 PRD 文档（UserStory 格式）
5. 设计系统架构
6. 生成技术规格说明
7. 拆解任务清单
8. 逐一执行 TDD 编码
9. 回归测试
10. 生成项目文档
11. 提交合并分支

也可执行子命令运行特定阶段：

| 命令 | 说明 |
|------|------|
| `/impm-project-create` | 生成/更新项目文档 |
| `/impm-req-create` | 生成需求文档 |
| `/impm-prd-create` | 生成 PRD 文档 |
| `/impm-architect-create` | 生成架构文档 |
| `/impm-sds-create` | 生成技术规格说明 |
| `/impm-task-create` | 拆解任务清单 |
| `/impm-task-coding` | 执行单个任务编码 |
| `/impm-regression-test` | 回归测试 |
| `/impm-docs-update` | 生成项目文档 |

---

## 架构

```
用户输入 → PM Agent (编排调度)
              │
              ├── BA  → 需求/PRD 文档
              ├── SA  → 架构设计
              ├── TL  → 技术规格 + 任务清单
              ├── CS  → 本地代码查询
              ├── WS  → 网络文档查询
              ├── TE  → 测试用例 + 测试执行
              ├── FE/BE/DE → TDD 编码实现
              ├── TW  → 文档生成 + 代码注释
              └── VCA → Git 分支管理 + 提交
```

插件注册了 7 个 OpenCode 自定义工具：

| 工具 | 功能 |
|------|------|
| `impm_doc_reader` | 读取需求/PRD/架构/任务等文档 |
| `impm_doc_writer` | 写入文档，自动创建目录 |
| `impm_doc_version` | 版本号管理 |
| `impm_task_manager` | 任务状态管理 |
| `impm_project_analyzer` | 项目结构扫描分析 |
| `impm_git_helper` | Git 操作封装 |
| `impm_context_builder` | 编码上下文构建 |

---

## 开发指南

```bash
# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev

# 安装到本地 .opencode/
npm run install:plugin

# 运行测试
npm test

# 发布到 npm（试运行）
npm run publish:dry

# 发布到 npm
npm run publish:public
```

### 项目结构

```
opencode-impm/
├── assets/              # Agent/命令/技能定义（发布到 npm）
│   ├── agents/          # 13 个 Agent 配置
│   ├── commands/        # 29 个 impm 命令
│   └── skills/          # 23 个 impm 技能
├── docs/                # 项目文档
├── scripts/             # 安装/发布脚本
│   ├── install.mjs      # 安装脚本（支持本地/npm/手动）
│   ├── install.ps1      # PowerShell 版安装脚本
│   └── publish.mjs      # npm 发布脚本
├── src/                 # TypeScript 源代码
│   ├── index.ts         # 插件入口
│   ├── tools/           # 7 个工具函数实现
│   └── utils/           # 通用工具函数
└── package.json
```

---

## 许可证

MIT
