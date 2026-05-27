# 架构文档

**项目名称：** 我是项目经理（opencode-impm）
**版本号：** v0.1.0
**日期：** 2026-05-27

---

## 系统架构概述

### 架构总览

opencode-impm 采用 **微内核 + 事件驱动管道** 架构风格。系统以 PM Agent 作为核心编排引擎（微内核），通过标准化的**技能-工具**机制调度多个专业 subagent，按**文档交付物驱动**的顺序管道执行软件工程全流程。

```
┌─────────────────────────────────────────────────────────────────────┐
│                       用户交互层 (User)                             │
│                    /impm 命令 + 提示词/文档路径                     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                  编排引擎层 (PM Agent - 主控)                       │
│  ┌─────────────┬──────────────┬──────────────┬────────────────┐    │
│  │ 流程编排     │ subagent调度  │ 上下文管理    │ 版本号/Git管理 │    │
│  └──────┬──────┴──────┬───────┴──────┬───────┴───────┬────────┘    │
└─────────┼─────────────┼──────────────┼───────────────┼──────────────┘
          │             │              │               │
┌─────────▼─────┬───────▼──────┬──────▼───────┬───────▼──────────────┐
│  技能执行层    │   技能执行层   │  技能执行层   │    技能执行层       │
│ (Skills)      │  (Skills)    │  (Skills)    │   (Skills)          │
│               │              │              │                     │
│ impm-project- │ impm-req-    │ impm-prd-    │ impm-architect-     │
│ update        │ create       │ create       │ update              │
│ (SA)          │ (BA)         │ (BA)         │ (SA)                │
│               │              │              │                     │
│ impm-spec-    │ impm-task-   │ impm-coding  │ impm-doc-update     │
│ create        │ create       │ (多subagent)  │ (TW)               │
│ (TL)          │ (TL)         │              │                     │
└─────────┬─────┴───────┬──────┴──────┬───────┴──────────────────────┘
          │             │              │
┌─────────▼─────────────▼──────────────▼──────────────────────────────┐
│                        工具层 (Tools - 7个核心工具)                  │
│                                                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ doc_reader  │ │ doc_writer   │ │ doc_version  │ │task_manager│  │
│  └─────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │project_     │ │ git_helper   │ │context_      │                 │
│  │analyzer     │ │              │ │builder       │                 │
│  └─────────────┘ └──────────────┘ └──────────────┘                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                        资源层 (Assets)                               │
│                                                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ Agent配置    │ │ 命令定义      │ │ 技能定义      │ │ 文档模板    │  │
│  │ (agents/)   │ │ (commands/)  │ │ (skills/)    │ │ (template/)│  │
│  └─────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 架构核心原则

| 原则 | 说明 |
|------|------|
| **交付物驱动** | 每个步骤的输出文档是下一步骤的唯一输入依赖，形成完整文档链 |
| **上下文隔离** | 每个 subagent 只接收本步骤必要的最小上下文，减少AI幻觉 |
| **单向管道** | 流程单向推进：需求 → PRD → 架构 → Spec → 任务 → 编码 → 文档 |
| **TDD先行** | 测试先于实现，红-绿-重构循环保证代码质量 |
| **标准工具** | 7个核心工具通过 OpenCode SDK 注册，对 Agent 和 Subagent 统一可用 |

---

## 模块设计

### 模块1: 编排引擎层 — PM Agent

- **职责：** 系统主控，负责全流程编排、subagent调度、上下文管理、Git/版本号管理
- **依赖：** 所有7个核心工具、12个 subagent 配置
- **接口：**
  - 接收 `/impm` 命令参数（提示词/文档路径）
  - 调用 `impm_doc_version` 获取/计算版本号
  - 调用 `impm_git_helper` 执行Git操作
  - 调用 `impm_task_manager` 管理任务状态
  - 按流程顺序启动各 subagent
  - 返回进度信息和最终结果给用户
- **实现位置：** `assets/agents/pm.md`

### 模块2: 技能执行层 — Skills（8个技能）

每个技能封装了一个完整的工程步骤，由对应的 subagent 执行：

| 技能名称 | Subagent | 输入 | 输出 |
|---------|----------|------|------|
| `impm-project-update` | SA | 项目目录 | `project.md` |
| `impm-req-create` | BA | 用户提示词/需求文档 | `docs/requires/requirement-v*.md` |
| `impm-prd-create` | BA | requirement.md, project.md | `docs/prds/prd-v*.md` |
| `impm-architect-update` | SA | prd.md, project.md | `ARCHITECTURE.md` |
| `impm-spec-create` | TL | prd.md, ARCHITECTURE.md, project.md | `docs/specs/spec-v*.md` |
| `impm-task-create` | TL | prd.md, ARCHITECTURE.md, project.md, spec.md | `docs/tasks/task-v*.md/.json` |
| `impm-coding` | CS+WS+TE+FE/BE/DE+TW | 任务ID + 相关文档片段 | 实现代码 + 测试 + 注释 |
| `impm-doc-update` | TW | project.md + 构建产物 | README, 部署文档等 |

- **职责：** 封装每个工程步骤的完整逻辑，定义输入输出规范
- **依赖：** 7个核心工具（技能内部调用）
- **配置位置：** `assets/skills/`

### 模块3: 工具层 — 7个核心工具（Tool）

| 工具 | 职责 | 关键能力 |
|------|------|---------|
| **impm_doc_reader** | 从标准路径读取各类文档 | 自动查找最新版本、推断项目名称 |
| **impm_doc_writer** | 将内容写入标准路径 | 自动创建目录、task类型双格式写入 |
| **impm_doc_version** | 版本号管理 | 获取最新版本、计算下一版本、格式校验 |
| **impm_task_manager** | 任务状态管理 | 初始化/查询/更新任务（.json持久化） |
| **impm_project_analyzer** | 项目结构分析 | 递归扫描、多语言函数提取、生成Project Map |
| **impm_git_helper** | Git操作封装 | 分支创建/切换/提交/合并/状态查询 |
| **impm_context_builder** | 编码上下文构建 | 按任务ID提取PRD/架构/spec相关片段 |

- **职责：** 提供底层原子化能力，供所有 Agent/Subagent 调用
- **依赖：** `src/utils/` 下的工具函数
- **实现位置：** `src/tools/`

### 模块4: 资源层 — Assets & 配置

- **职责：** 存放 subagent 定义、命令定义、技能定义和文档模板
- **目录结构：**
  - `assets/agents/` — 12个 subagent 的提示词/配置（PM + 11 subagent）
  - `assets/commands/` — `/impm` 及8个子命令定义
  - `assets/skills/` — 8个技能的完整定义和规则

### 模块5: 工具函数层 — Utilities

| 模块 | 职责 | 关键接口 |
|------|------|---------|
| `src/utils/git.ts` | Git底层命令封装 | `gitExec()`, `createBranch()`, `commit()`, `mergeBranch()`, `getStatus()` |
| `src/utils/paths.ts` | 路径与文件名管理 | `getDocFileName()`, `getDocFilePath()`, `getTaskJsonPath()` |
| `src/utils/version.ts` | 语义化版本号管理 | `parseVersion()`, `compareVersions()`, `incrementPatch()`, `isValidVersion()` |

---

## 技术选型

| 领域 | 技术方案 | 理由 |
|------|---------|------|
| **运行环境** | Node.js >= 18.0.0 | OpenCode 平台依赖，ESM 原生支持 |
| **编程语言** | TypeScript 5.x（严格模式） | 类型安全、IDE支持好、与OpenCode SDK类型对齐 |
| **模块系统** | ESM（编译为 CommonJS） | 开发时ESM便捷，运行时兼容Node.js |
| **包管理** | npm | OpenCode平台默认包管理器 |
| **构建工具** | tsc（TypeScript Compiler） | 项目轻量，无需复杂构建配置 |
| **数据验证** | zod | OpenCode SDK推荐方案，类型推导强 |
| **YAML解析** | yaml (js-yaml) | 技能和Agent配置采用YAML格式 |
| **SDK** | @opencode-ai/sdk + @types/node | OpenCode平台标准开发依赖 |
| **插件接口** | @opencode-ai/plugin | 插件注册工具的定义规范 |
| **版本控制** | Git | 行业标准，OpenCode内置支持 |
| **Agent机制** | OpenCode Agent + SubAgent | 平台核心能力，支持agent嵌套协作 |
| **文档格式** | Markdown + JSON | 人类可读与机器可解析双通道 |

---

## 数据流

### 全流程数据流

```
用户输入提示词/文档路径
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    PM Agent 主流程编排                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  第1步: [SA] impm-project-update                             │
│    输入: 用户提示词, 项目目录                                │
│    工具: impm_project_analyzer, impm_doc_writer              │
│    输出: project.md                                          │
│                                                              │
│  第2步: [BA] impm-req-create                                │
│    输入: 用户提示词, 引用的需求文档                          │
│    工具: impm_doc_reader, impm_doc_version, impm_doc_writer  │
│    输出: docs/requires/requirement-v*.md                     │
│                                                              │
│  第3步: [BA] impm-prd-create                                │
│    输入: requirement-v*.md, project.md                       │
│    工具: impm_doc_reader, impm_doc_writer                    │
│    输出: docs/prds/prd-v*.md                                 │
│                                                              │
│  第4步: [SA] impm-architect-update                          │
│    输入: prd-v*.md, project.md                               │
│    工具: impm_doc_reader, impm_doc_writer                    │
│    输出: ARCHITECTURE.md                                     │
│                                                              │
│  第5步: [TL] impm-spec-create                               │
│    输入: prd-v*.md, ARCHITECTURE.md, project.md              │
│    工具: impm_doc_reader, impm_doc_writer                    │
│    输出: docs/specs/spec-v*.md                               │
│                                                              │
│  第6步: [TL] impm-task-create                               │
│    输入: prd-v*.md, ARCHITECTURE.md, spec-v*.md, project.md  │
│    工具: impm_doc_reader, impm_doc_writer                    │
│    输出: docs/tasks/task-v*.md + docs/tasks/task-v*.json     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  第7步: [impm-coding] 按任务逐一执行（循环）        │     │
│  │                                                     │     │
│  │  7a. [CS] 搜索本地相关代码                          │     │
│  │  7b. [WS] 搜索三方包/中间件文档                     │     │
│  │  7c. [TE] 编写测试用例和测试代码                    │     │
│  │  7d. [FE/BE/DE] 编写实现代码（任务类型决定）       │     │
│  │  7e. [TE] 验证测试是否通过                          │     │
│  │  7f. [循环] 测试失败→重新编码→再测试               │     │
│  │  7g. [TW] 添加代码注释                              │     │
│  │  7h. 提交代码到Git，更新任务状态                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  第8步: [TW] impm-doc-update                               │
│    输入: project.md, 构建产物                               │
│    工具: impm_git_helper                                    │
│    输出: README.md, 部署文档, 环境配置等                    │
│                                                              │
│  第9步: Git合并分支 & 返回最终结果                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 编码子流程数据流（impm-coding 内部）

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ CS Agent │    │ WS Agent │    │ TE Agent │    │FE/BE/DE  │
│  (搜索)   │    │  (搜索)   │    │  (测试)   │    │ (编码实现)│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 本地代码搜索   │ 三方包文档    │ 测试用例      │ 实现代码    │
     │               │               │               │
     ▼               ▼               ▼               ▼
   ┌──────────────────────────────────────────────────────┐
   │               context_builder 工具                    │
   │  从 PRD/架构/spec 中提取与 taskId 相关的片段          │
   └──────────────────────────────────────────────────────┘
                            │
                            ▼
   ┌──────────────────────────────────────────────────────┐
   │         精简上下文（仅包含本次任务所需）              │
   │  · 关联的 UserStory 描述                             │
   │  · 相关架构章节                                      │
   │  · 技术规格中对应模块的接口定义                      │
   │  · CS/WS 搜索到的参考代码和文档                      │
   │  · 任务验收标准和测试方法                            │
   └──────────────────────────────────────────────────────┘
```

### 上下文隔离数据流

```
步骤A (SA)               步骤A输出                 步骤B (BA)
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│project.md│────▶│  Standard Doc    │────▶│requirement│
└──────────┘     └──────────────────┘     └──────────┘
                    仅传递文档本身             仅读取文档
                    无项目全局上下文             无多余信息
```

---

## 目录结构规范

```
opencode-impm/
│
├── ARCHITECTURE.md              # 架构文档（本文件）       ← SA 生成
├── project.md                   # 项目信息/编码规范/文件地图 ← SA 生成
├── package.json                 # Node.js 包配置
├── tsconfig.json                # TypeScript 编译配置
├── .gitignore                   # Git 忽略规则
│
├── src/                         # 源代码目录
│   ├── index.ts                 # 插件入口，注册7个工具
│   │
│   ├── tools/                   # 工具层实现
│   │   ├── doc-reader.ts        # 文档读取工具
│   │   ├── doc-writer.ts        # 文档写入工具
│   │   ├── doc-version.ts       # 版本号管理工具
│   │   ├── task-manager.ts      # 任务状态管理工具
│   │   ├── project-analyzer.ts  # 项目结构分析工具
│   │   ├── git-helper.ts        # Git操作封装工具
│   │   └── context-builder.ts   # 编码上下文构建工具
│   │
│   └── utils/                   # 工具函数层
│       ├── git.ts               # Git底层命令封装
│       ├── paths.ts             # 路径与文件名管理
│       └── version.ts           # 语义化版本号管理
│
├── assets/                      # 资源文件（Agent/命令/技能配置）
│   ├── agents/                  # 12个Agent/SubAgent的配置与提示词
│   │   ├── pm.md                # PM Agent - 主编排器
│   │   ├── ba.md                # BA - 业务分析师
│   │   ├── sa.md                # SA - 软件架构师
│   │   ├── tl.md                # TL - 技术负责人
│   │   ├── te.md                # TE - 测试工程师
│   │   ├── fe.md                # FE - 前端工程师
│   │   ├── be.md                # BE - 后端工程师
│   │   ├── de.md                # DE - 通用开发工程师
│   │   ├── cs.md                # CS - 代码搜索
│   │   ├── ws.md                # WS - 网络搜索
│   │   ├── tw.md                # TW - 技术写手
│   │   └── dba.md               # DBA - 数据库管理员
│   │
│   ├── commands/                # 命令定义
│   │   ├── impm.md              # /impm 主命令
│   │   └── impm-*.md            # 子命令定义
│   │
│   └── skills/                  # 技能定义（8个技能）
│       ├── impm-project-update/
│       ├── impm-req-create/
│       ├── impm-prd-create/
│       ├── impm-architect-update/
│       ├── impm-spec-create/
│       ├── impm-task-create/
│       ├── impm-coding/
│       └── impm-doc-update/
│
├── template/                    # 文档模板
│   └── PROJECT-TEMPLATE.MD      # project.md 生成模板
│
├── docs/                        # 项目文档目录（运行时生成）
│   ├── requires/                # 需求文档
│   ├── prds/                    # PRD文档
│   ├── specs/                   # 技术规格说明
│   └── tasks/                   # 任务清单 (.md + .json)
│
└── scripts/                     # 安装/部署脚本
    ├── install.ps1              # Windows安装脚本
    └── install.mjs              # 通用安装脚本
```

---

## Subagent 协作模式

### 编排模式：顺序管道 + 单步并行

```
PM Agent (主控)
  │
  ├─→ SA ──→ project.md                          [顺序]
  ├─→ BA ──→ requirement.md ──→ prd.md           [顺序]
  ├─→ SA ──→ ARCHITECTURE.md                     [顺序]
  ├─→ TL ──→ spec.md ──→ tasks (.md+.json)       [顺序]
  │
  │  [循环: 按依赖排序后的任务列表]
  ├─→ CS + WS ──→ 上下文材料                      [并行]
  │     │
  │     ├─→ TE ──→ 测试代码                      [顺序]
  │     ├─→ FE/BE/DE ──→ 实现代码                [顺序]
  │     ├─→ TE ──→ 验证测试                       [顺序]
  │     │    └─→ 不通过 → 返回重新编码             [循环]
  │     └─→ TW ──→ 代码注释                      [顺序]
  │
  └─→ TW ──→ README + 部署文档                    [顺序]
  └─→ Git ──→ 合并分支                           [最终]
```

### Subagent 角色职责一览

| 角色 | 职责 | 调用时机 |
|:----:|------|---------|
| **PM** | 主编排器，调度所有subagent，管理Git/版本/任务状态 | 全程 |
| **SA** | 初始化项目信息（project.md），设计架构（ARCHITECTURE.md） | 第1步、第4步 |
| **BA** | 编写需求文档和PRD文档，与用户交互澄清需求 | 第2步、第3步 |
| **TL** | 编写技术规格说明和任务清单，审核代码质量 | 第5步、第6步 |
| **TE** | 编写测试用例和测试代码，验证实现是否正确 | 第7步 |
| **FE** | 前端任务编码实现 | 第7步（任务类型=frontend） |
| **BE** | 后端任务编码实现 | 第7步（任务类型=backend） |
| **DE** | 通用任务编码实现 | 第7步（任务类型=common） |
| **CS** | 搜索本地代码库，提供参考实现 | 第7步 |
| **WS** | 搜索三方包和中间件的官方文档 | 第7步 |
| **TW** | 添加代码注释，生成项目文档 | 第7步（注释）、第8步（文档） |
| **DBA** | 数据库相关设计与操作 | 按需调用 |

---

## 版本号管理规范

### 版本号策略
- 格式：语义化版本号 `主版本.次版本.修订号`（如 `v1.2.3`）
- 主版本号：架构/API重大变更时升级
- 次版本号：新增功能时升级
- 修订号：Bug修复或微小变更时自动递增
- 首次无指定版本号：默认 `v0.0.1`
- 后续递增：读取 `docs/requires/` 下最新版本号的修订号 +1

### 版本号统一
- 同一轮 `/impm` 流程中所有文档共享同一版本号
- 版本号存储在文档文件名和文档头部
- 版本号管理统一通过 `impm_doc_version` 工具

---

## 部署架构

### 插件部署方式
1. **npm 包模式**（推荐）
   - 在 `.opencode.json` 中配置 `"plugins": ["opencode-impm"]`
   - 自动安装 assets 到 `.opencode/` 目录

2. **本地开发模式**
   - 运行 `scripts/install.ps1`（Windows）或 `scripts/install.mjs`
   - 手动复制 `assets/` 到 `.opencode/` 目录

### 运行环境
```
┌─────────────────────────────────────┐
│          OpenCode 平台               │
│  ┌───────────────────────────────┐  │
│  │   opencode-impm (插件进程)     │  │
│  │   ┌─────────┐                 │  │
│  │   │Agent/   │  Skills + Tools │  │
│  │   │SubAgent ├──→ 7 Tools     │  │
│  │   │ 系统    │  + 8 Skills    │  │
│  │   └─────────┘                 │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        用户项目目录            │  │
│  │  (project.md / docs/ / src/)  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      Git 仓库 / GitHub        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 关键依赖
- **运行时：** Node.js >= 18.0.0
- **平台：** OpenCode（提供 Agent/Skill 运行时）
- **版本控制：** Git（本地仓库）
- **可选：** MCP 网络搜索工具（用于 WS subagent 查询三方文档）

---

## 可扩展性设计

### Subagent 扩展
- 新增 subagent 只需在 `assets/agents/` 下添加配置文件
- 配置文件中定义触发词、角色描述和可用工具列表
- 无需修改核心编排代码

### Skill 扩展
- 在 `assets/skills/` 下创建新技能目录
- 技能定义文件中声明输入输出规范和执行步骤
- 在 PM Agent 编排逻辑中注册新的技能步骤

### Tool 扩展
- 在 `src/tools/` 下实现新工具（遵循工具定义接口规范）
- 在 `src/index.ts` 中注册到 `tool` 对象
- 工具自动对所有 Agent 和 Subagent 可见

---

## 非功能架构决策

| 质量属性 | 架构策略 |
|---------|---------|
| **可维护性** | 分层架构、关注点分离、统一编码规范 |
| **可测试性** | TDD流程保证每个工具函数都有测试覆盖 |
| **可靠性** | 任务状态JSON持久化、Git分支隔离、版本号一致性校验 |
| **性能** | 上下文隔离避免大上下文、工具异步执行 |
| **安全性** | 仅操作项目目录内文件、只读网络查询 |
| **可用性** | 简体中文交互、进度反馈、错误提示清晰 |

---

## 设计模式总结

| 模式 | 应用场景 | 实现方式 |
|------|---------|---------|
| **微内核架构** | 整体系统组织 | PM Agent 作为内核编排，Skills/Subagent 作为插件扩展 |
| **管道-过滤器** | 全流程数据流 | 每个技能是一个过滤器，文档是管道中的数据结构 |
| **策略模式** | 任务执行（FE/BE/DE） | 根据任务类型选择不同编码 subagent |
| **模板方法** | 技能执行流程 | 每个技能有固定的输入→执行→输出模板 |
| **外观模式** | 7个工具 | 封装底层复杂性，对外提供简洁统一接口 |
| **单例模式** | Git/路径/版本工具 | 无状态工具函数，全局复用 |
