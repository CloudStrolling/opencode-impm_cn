# 架构文档

**项目中文名称：** OpenCode IMPM（AI项目经理）
**项目名称：** opencode-impm
**版本号：** v0.1.0
**日期：** 2026-05-28

---

## 1. 系统架构概述

### 1.1 系统定位

OpenCode IMPM 是一个基于 OpenCode 平台的 AI 项目经理插件，通过编排多个专业 subagent（BA、SA、TL、TE、FE/BE/DE、TW 等），按照 **TDD 驱动**和**文档驱动**的工程化方法论，自动化执行从需求分析、架构设计、任务分配、编码实现到文档生成的完整软件工程生命周期管理。

### 1.2 架构风格

- **选用风格：** 主从编排 + 插件化分层架构（Master-Slave Orchestration + Plugin Layered Architecture）
- **选型理由：**
  - PRD 中明确了"主从编排"设计理念（PM Agent 作为主控编排者）
  - 插件化架构使每个 subagent 职责单一、独立部署/调用，符合"上下文隔离"原则
  - 分层设计（流程编排层 → 工具层 → Agent/技能层）满足可扩展性和可维护性需求
  - 文件系统作为唯一持久化层，无需数据库，简化部署

### 1.3 架构层次图

```
┌──────────────────────────────────────────────────────────┐
│                    用户交互层 (User Interface)              │
│              OpenCode 平台 / 终端 CLI 环境                  │
│              /impm 命令入口 + 日志输出                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  流程编排层 (Orchestration Layer)           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              PM Agent (主控编排者)                    │  │
│  │  流程调度 · 状态追踪 · Subagent编排 · 生命周期管理   │  │
│  └──────────┬──────────┬──────────┬───────────────────┘  │
│             │          │          │                       │
│    ┌────────▼──┐ ┌────▼────┐ ┌───▼────────┐              │
│    │ BA        │ │  SA     │ │  TL       │  ...          │
│    │ Subagent  │ │  Subagent│ │ Subagent  │               │
│    └───────────┘ └─────────┘ └────────────┘               │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    工具层 (Tool Layer)                      │
│  ┌──────────┐┌──────────┐┌──────────┐┌────────────────┐  │
│  │doc-reader││doc-writer││doc-version││task-manager    │  │
│  └──────────┘└──────────┘└──────────┘└────────────────┘  │
│  ┌──────────┐┌──────────┐┌──────────┐┌────────────────┐  │
│  │project-  ││git-helper││context- ││paths / version │  │
│  │analyzer  ││          ││builder  ││(utils)         │  │
│  └──────────┘└──────────┘└──────────┘└────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  持久化层 (Persistence Layer)               │
│  ┌──────────┐┌──────────┐┌──────────┐┌────────────────┐  │
│  │ docs/    ││ docs/    ││ docs/    ││docs/tasks/     │  │
│  │requires/ ││ prds/    ││ sds/   ││(.md/.json)    │  │
│  └──────────┘└──────────┘└──────────┘└────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │    .opencode/agents/ + .opencode/skills/            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 1.4 核心架构特点

| 特点 | 说明 |
|------|------|
| 主从编排 | PM Agent 作为单一主控，按依赖顺序调度 subagent，确保流程有序执行 |
| 文档驱动 | 每个阶段产出标准化文档，作为下一阶段的输入，信息可追溯 |
| 上下文隔离 | 每个子任务使用独立的 subagent 上下文，由 context-builder 按需构建 |
| 工具化设计 | 所有功能封装为独立工具函数，通过 OpenCode Tool API 注册调用 |
| 无外部依赖 | 仅使用 Node.js 内置模块（fs、path、child_process），保持轻量 |
| 文件即存储 | 所有数据以 Markdown/JSON 文件形式存储在 docs/ 目录，无需数据库 |

---

## 2. 模块设计

### 2.1 流程编排层 — PM Agent（主控编排者）

- **职责：**
  - 接收 `/impm` 命令参数，初始化项目环境（Git 分支创建、文档目录初始化）
  - 按预定义流程编排 subagent 调用顺序（BA → SA → TL → 编码 → TW）
  - 跟踪任务状态，管理任务依赖关系
  - 处理异常和中断，提供日志输出让用户了解进度
  - 不负责具体文档生成、编码或测试执行
- **依赖：** 所有工具层模块、所有 subagent 技能
- **接口：** 通过 OpenCode Command API 注册 `/impm` 命令；通过 OpenCode Agent API 调度 subagent
- **说明：** 作为运行时的流程引擎，PM Agent 的配置定义在 `.opencode/agents/pm-agent.md`

### 2.2 流程编排层 — Subagent 体系

每个 Subagent 对应于一个专业角色，配置定义在 `.opencode/agents/` 目录：

| Subagent | 角色 | 核心技能 | 输入 | 输出 |
|----------|------|---------|------|------|
| BA | 商业分析师 | impm-req-create, impm-prd-create | 用户提示词 + project.md | 需求文档、PRD 文档 |
| SA | 软件架构师 | impm-project-update, impm-architect-update | PRD + project.md | project.md、architecture.md |
| TL | 技术主管 | impm-sds-create, impm-task-create | PRD + architecture.md | sds 文档、任务清单(MD+JSON) |
| CS | 代码搜索 | 本地代码库查询 | 任务信息 | 相关代码上下文 |
| WS | 网络搜索 | 三方库/中间件文档查询 | 技术查询需求 | 官方文档信息 |
| TE | 测试工程师 | 测试用例编写与执行 | 上下文 + sds | 测试代码、测试结果 |
| DE/FE/BE | 开发工程师 | TDD 驱动编码实现 | 测试 + 上下文 | 实现代码 |
| TW | 技术写作 | impm-doc-update | 已完成代码 | README、注释、部署文档 |

- **职责：** 每个 Subagent 负责在自己的专业领域内执行特定技能，不跨域操作
- **依赖：** 依赖工具层提供的各种工具函数完成具体操作
- **说明：** Subagent 之间不直接通信，全部通过 PM Agent 编排调度，保证上下文隔离

### 2.3 工具层 — 文档管理工具集

#### doc-reader（文档读取工具）
- **职责：** 从标准路径读取项目文档，自动处理版本号查找和项目名称推断
- **依赖：** utils/paths（路径常量）、utils/version（版本号解析）
- **接口：** `docReaderExecute(args)` — 根据文档类型和版本号读取对应文件内容

#### doc-writer（文档写入工具）
- **职责：** 将生成的文档内容写入标准路径，自动创建不存在的目录，采用原子写入防止中断
- **依赖：** utils/paths
- **接口：** `docWriterExecute(args)` — 执行文档写入，返回写入结果消息

#### doc-version（版本号管理工具）
- **职责：** 获取当前最新版本号或计算下一个版本号
- **依赖：** utils/version
- **接口：** `docVersionExecute(args)` — 执行版本号管理操作，返回版本号字符串

### 2.4 工具层 — 任务与上下文管理

#### task-manager（任务状态管理工具）
- **职责：** 初始化、查询、更新任务清单的状态，支持主任务和子任务的层级管理
- **依赖：** utils/paths、doc-reader
- **接口：** `taskManagerExecute(args)` — 执行任务管理操作（初始化/查询/更新）

#### context-builder（上下文构建工具）
- **职责：** 根据任务类型和编号，从 PRD、架构文档、sds 等中提取相关片段，构建精简上下文
- **依赖：** doc-reader
- **接口：** `contextBuilderExecute(args)` — 执行上下文构建，返回组合文档内容

### 2.5 工具层 — 项目分析与版本控制

#### project-analyzer（项目分析工具）
- **职责：** 扫描项目源代码文件，按目录层级分组，提取文件描述和函数/类列表，生成 Project Map
- **依赖：** utils/paths
- **接口：** `projectAnalyzerExecute(args)` — 执行项目分析，返回 Markdown 格式项目地图

#### git-helper（Git 操作工具）
- **职责：** 封装 impm 流程中需要的 Git 操作（创建分支、提交、合并、状态查询等）
- **依赖：** utils/git
- **接口：** `gitHelperExecute(args)` — 根据 action 类型分发到不同的 Git 命令

### 2.6 通用工具层 (utils)

#### utils/paths — 路径常量与工具函数
- **职责：** 定义 impm 使用的所有标准目录路径和文件命名规则
- **接口：** `getDocFileName()`, `getDocFilePath()`, `getTaskJsonPath()` 等

#### utils/version — 版本号工具函数
- **职责：** 语义化版本号的解析、比较、递增操作
- **接口：** `parseVersion()`, `formatVersion()`, `incrementPatch()`, `compareVersions()` 等

#### utils/git — Git 操作函数集
- **职责：** 基于 `child_process.execSync` 封装常用 Git 命令
- **接口：** `isGitRepo()`, `createBranch()`, `commit()`, `mergeBranch()` 等

### 模块关系图

```
PM Agent (编排调度)
  │
  ├──→ BA Subagent ──→ impm-req-create / impm-prd-create
  │                         │
  │                         └──→ [doc-reader, doc-writer, doc-version]
  │
  ├──→ SA Subagent ──→ impm-project-update / impm-architect-update
  │                         │
  │                         ├──→ [project-analyzer]
  │                         └──→ [doc-reader, doc-writer]
  │
  ├──→ TL Subagent ──→ impm-sds-create / impm-task-create
  │                         │
  │                         └──→ [task-manager, doc-writer]
  │
  ├──→ CS/WS Subagent ──→ 代码搜索 / 网络文档查询
  │
  ├──→ TE Subagent ────→ 测试用例编写与执行
  │                         │
  │                         └──→ [context-builder]
  │
  ├──→ DE/FE/BE Subagent ──→ TDD 编码实现
  │                             │
  │                             └──→ [context-builder, git-helper]
  │
  └──→ TW Subagent ──→ impm-doc-update
                            │
                            └──→ [git-helper, doc-writer]
```

---

## 3. 技术选型

### 3.1 技术栈全景

| 领域 | 技术方案 | 版本要求 | 选型理由 |
|------|---------|---------|---------|
| 编程语言 | TypeScript | ≥ 5.0 | 类型安全、支持 ESM、OpenCode 平台原生语言 |
| 运行环境 | Node.js | ≥ 18.0 | 跨平台、内置 fs/path/child_process 模块 |
| 模块系统 | ESM (ECMAScript Modules) | — | 现代标准、与 Node.js 18+ 原生支持一致 |
| 框架/平台 | OpenCode Plugin API | — | 作为 OpenCode 插件运行，注册 Command 和 Tool |
| 数据存储 | 文件系统 (Markdown + JSON) | — | 零外部依赖，文档即存储，满足需求 |
| 测试框架 | Node.js 内置 test runner / Vitest | — | 轻量、零配置、与 ESM 兼容 |
| 文档格式 | Markdown + JSON | — | Markdown 人类可读，JSON 机器可处理 |
| 版本号规范 | 语义化版本 (SemVer) | v0.1.0 起 | 业界标准、支持自动递增 |
| 部署方式 | OpenCode 插件（源码安装/npm 包） | — | 随 OpenCode 运行时自动加载，无需独立部署 |

### 3.2 架构决策记录（ADR）

| ADR编号 | 决策内容 | 选项对比 | 最终选择 | 理由 | 后果/权衡 |
|---------|---------|---------|---------|------|----------|
| ADR-001 | 数据持久化方案 | 文件系统 vs SQLite vs JSON 数据库 | 文件系统（Markdown + JSON） | 保持零外部依赖；文档即产品的设计理念；降低部署和版本管理复杂度 | 不支持复杂查询和高并发；数据一致性依赖文件写入原子操作 |
| ADR-002 | 模块间通信方式 | 函数直接调用 vs 消息队列 vs HTTP IPC | 函数直接调用（同进程） | 所有工具/Agent 在 OpenCode 同进程内运行；函数调用延迟最低；无序列化开销 | 不适用于跨进程部署；模块间存在隐式耦合 |
| ADR-003 | 外部依赖策略 | 最小化内置模块 vs 引入第三方库 | 仅使用 Node.js 内置模块 | 零外部依赖降低维护成本和漏洞风险；满足所有功能需求 | 部分功能需要手动实现（如 SemVer 解析、文件 glob） |
| ADR-004 | 技能与工具的交互方式 | OpenCode Tool API vs 自定义 RPC | OpenCode Tool API | 与 OpenCode 平台深度集成；统一工具注册和调用机制 | 平台版本变化可能影响工具接口；无法脱离 OpenCode 独立运行 |
| ADR-005 | 任务清单格式 | 纯 Markdown vs JSON vs MD+JSON 双格式 | MD + JSON 双格式共存 | MD 给人阅读，JSON 给程序处理；task-manager 以 JSON 为状态源，渲染为 MD | 两份数据需保持同步；写入时需同时更新两个文件 |

---

## 4. 数据流

### 4.1 核心业务数据流

```
用户输入提示词
    │
    ▼
┌─────────────────────────────────────────────────┐
│ PM Agent 初始化流程                               │
│ 1. 创建 Git 分支 (impm/{功能}-{时间戳})            │
│ 2. 初始化 docs/ 目录结构 (如不存在)                │
│ 3. 更新 project.md                                │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ BA Subagent — 需求分析阶段                        │
│ 1. 执行 impm-req-create → 生成需求文档            │
│ 2. 执行 impm-prd-create  → 生成 PRD 文档          │
│ 输出: docs/requires/ , docs/prds/                 │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ SA Subagent — 架构设计阶段                        │
│ 1. 执行 impm-project-update → 更新 project.md    │
│ 2. 执行 impm-architect-update → 生成 architecture│
│ 输出: docs/architecture.md                       │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ TL Subagent — 规格与任务阶段                      │
│ 1. 执行 impm-sds-create  → 生成技术规格说明      │
│ 2. 执行 impm-task-create  → 生成任务清单(MD+JSON) │
│ 输出: docs/sds/ , docs/tasks/                   │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ PM Agent — 编码执行阶段（按任务依赖顺序循环）       │
│                                                 │
│ 对每个"未完成"的任务：                             │
│   1. CS Subagent → 搜索本地相关代码               │
│   2. WS Subagent → 查询三方包文档               │
│   3. context-builder → 构建精简上下文             │
│   4. TE Subagent → 编写测试用例和测试代码         │
│   5. DE/FE/BE Subagent → TDD 编码实现            │
│      (测试失败 → 回退重试，最多3次)               │
│   6. git-helper → 提交代码到当前分支              │
│   7. 更新任务状态 → 标记为"已完成"                │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ TW Subagent — 文档生成阶段                        │
│ 1. 执行 impm-doc-update → 生成 README/部署文档    │
│ 2. 添加代码注释                                   │
│ 3. git-helper → 提交文档变更                      │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────┐
│ PM Agent — 完成阶段                               │
│ 1. 合并 Git 分支 → 主分支 (或创建 PR)             │
│ 2. 输出完成报告                                    │
└─────────────────────────────────────────────────┘
```

### 4.2 模块间数据流转

| 发送方 | 接收方 | 数据内容 | 传递方式 |
|--------|--------|---------|---------|
| PM Agent | BA Subagent | 用户提示词、project.md | OpenCode Agent API + 上下文注入 |
| BA Subagent | PM Agent | 需求文档路径、PRD 路径 | 文件写入后返回路径 |
| PM Agent | SA Subagent | PRD 路径、project.md | 上下文注入 |
| SA Subagent | PM Agent | architecture.md 路径 | 文件写入后返回路径 |
| PM Agent | TL Subagent | PRD + architecture 路径 | 上下文注入 |
| TL Subagent | PM Agent | sds 路径、task 路径 | 文件写入后返回路径 |
| PM Agent | CS/WS Subagent | 任务编号、关键词 | 上下文注入 |
| PM Agent | context-builder | 任务编号、任务类型 | 函数调用 |
| context-builder | TE/DE Subagent | 精简文档上下文 | 函数返回值 |
| TE/DE Subagent | git-helper | Git 命令参数 | 函数调用 |
| DE Subagent | PM Agent | 编码结果（通过/失败） | 返回结果消息 |
| PM Agent | task-manager | 更新任务状态请求 | 函数调用 |
| TW Subagent | git-helper | Git 提交参数 | 函数调用 |

### 4.3 数据存储流转

| 数据类型 | 产生阶段 | 存储位置 | 消费阶段 | 生命周期 |
|---------|---------|---------|---------|---------|
| 需求文档 (.md) | BA 需求分析 | docs/requires/ | PRD 生成、架构设计 | 持久化至归档 |
| PRD 文档 (.md) | BA PRD 生成 | docs/prds/ | 架构设计、sds 生成 | 持久化至归档 |
| project.md | SA 项目更新 | docs/ | 所有阶段 | 持续更新 |
| architecture.md | SA 架构设计 | docs/ | sds 生成、编码 | 持久化至归档 |
| 技术规格 (.md) | TL sds 生成 | docs/sds/ | 任务生成、编码 | 持久化至归档 |
| 任务清单 (.md/.json) | TL 任务生成 | docs/tasks/ | 编码执行、状态追踪 | 持续更新至完成 |
| 构建上下文 (内存) | context-builder | 运行时内存 | 编码任务执行 | 任务完成后销毁 |
| 源代码 (Code) | DE/FE/BE 编码 | src/ 及各子目录 | 编译运行 | 持续演进 |
| Git 工作树 | Git 操作 | .git/ | 分支管理、版本控制 | 项目完整生命周期 |

---

## 5. 数据架构

### 5.1 数据模型概览

项目采用**文件即数据**模式，无数据库或 ORM。核心数据模型通过文件系统中的三种形式表达：

```
1. 结构化文档 (Markdown)
   ├── 需求文档（标准章节结构）
   ├── PRD 文档（UserStory + 验收标准 + 非功能需求）
   ├── 架构文档（模块划分 + 技术选型 + 数据流）
   ├── 技术规格文档（接口定义 + 数据模型 + 约束）
   └── 项目信息文档（Project Info + Coding Conventions + Project Map）

2. 结构化数据 (JSON)
   └── 任务清单 JSON（任务状态、依赖、验收标准）— 程序的主要处理对象

3. 配置定义 (Markdown/YAML)
   ├── Agent 配置 (.opencode/agents/*.md)
   └── 技能定义 (.opencode/skills/*/SKILL.md)
```

### 5.2 存储策略

| 数据类型 | 存储方案 | 理由 | 一致性要求 |
|---------|---------|------|-----------|
| 工程文档 | 文件系统 (Markdown) | 人类可读、版本可追溯、零依赖 | 最终一致性（Git 提交后才生效） |
| 任务状态 | 文件系统 (JSON) | 机器可解析、易读易写、task-manager 统一管理 | 强一致性（单文件写入，原子操作） |
| 源代码 | 文件系统 (.ts/.js) | 标准开发实践、Git 版本控制 | 强一致性（Git 提交事务） |
| 运行时上下文 | 内存 | 临时的任务上下文，任务完成后无需持久化 | 无（临时数据） |
| 配置定义 | 文件系统 (Markdown) | 与 OpenCode 平台规范一致 | 最终一致性 |

### 5.3 数据一致性策略

- **原子写入**：文档写入采用"先写临时文件，再重命名"策略，防止写入中断导致文件损坏
- **Git 事务**：每个任务完成后的代码提交作为一个完整事务，保证源代码和文档的一致性
- **JSON 状态源**：任务状态以 JSON 文件为准，MD 文件由 task-manager 渲染生成，避免双源不一致
- **无并发写**：IMPM 流程为单线程串行执行，不存在并发写入冲突，简化一致性模型

---

## 6. 接口设计

### 6.1 外部接口

| 接口名称 | 协议 | 路径/主题 | 认证方式 | 调用方 |
|---------|------|----------|---------|--------|
| `/impm` 命令 | OpenCode Command API | `opencode-impm` 插件注册 | OpenCode 平台认证 | 终端用户 |
| 工具注册表 | OpenCode Tool API | `tools` 属性 | OpenCode 平台注入 | PM Agent / Subagent |

### 6.2 内部接口（工具函数接口）

所有工具通过 OpenCode Tool API 注册，采用统一的接口模式：

| 工具名称 | 输入参数 | 输出格式 | 调用方 |
|---------|---------|---------|--------|
| doc-reader | `{ type: string, version?: string, projectName?: string }` | `{ content: string, version: string, filePath: string }` | BA/SA/TL Subagent |
| doc-writer | `{ type: string, content: string, version: string, projectName?: string }` | `{ message: string, filePath: string, version: string }` | BA/SA/TL/TW Subagent |
| doc-version | `{ type: string, action: 'latest' \| 'next', projectName?: string }` | `{ version: string }` | BA/SA/TL Subagent |
| task-manager | `{ action: 'init' \| 'query' \| 'update', taskId?: string, status?: string }` | `{ result: string, taskList?: object }` | PM Agent |
| project-analyzer | `{ projectRoot: string }` | `{ content: string, fileCount: number }` | SA Subagent |
| git-helper | `{ action: string, ...args }` | `{ message: string, success: boolean }` | PM Agent / TW Subagent |
| context-builder | `{ taskId: string, taskType: string, projectName: string }` | `{ context: string }` | PM Agent |

### 6.3 接口契约示例

```typescript
// 工具函数统一接口模式
interface ToolDefinition {
  name: string;             // 工具名称，如 "doc-reader"
  description: string;      // 工具功能描述
  parameters: {             // JSON Schema 参数定义
    type: 'object';
    properties: Record<string, SchemaProperty>;
    required?: string[];
  };
}

interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required?: boolean;
}

// doc-reader 请求/响应定义
interface DocReaderArgs {
  type: string;         // 文档类型: 'requirement' | 'prd' | 'sds' | 'task'
  version?: string;     // 版本号，可选。不传则查找最新版
  projectName?: string; // 项目名称，可选。不传则自动推断
}

interface DocReaderResult {
  content: string;      // 文档内容
  version: string;      // 实际读取的版本号
  filePath: string;     // 文件绝对路径
}

// doc-writer 请求/响应定义
interface DocWriterArgs {
  type: string;         // 文档类型
  content: string;      // 文档内容（Markdown 格式）
  version: string;      // 版本号
  projectName?: string; // 项目名称
}

interface DocWriterResult {
  message: string;      // 操作结果消息
  filePath: string;     // 写入的文件路径
  version: string;      // 写入的版本号
}
```

---

## 7. 非功能性需求落地（NFR Implementation）

| PRD-NFR 编号 | 非功能性需求 | 架构决策 | 量化指标 |
| --------- | -------- | ------------- | -------------- |
| NFR-4.1-1 | 文档读取工具响应时间 < 500ms | 使用 fs.readFileSync 直接读取本地文件，无网络开销 | 响应时间 < 50ms（本地 SSD） |
| NFR-4.1-2 | 项目分析工具扫描100个文件 < 30s | 递归扫描使用同步 fs 操作，无异步调度开销 | 100 文件扫描 < 5s |
| NFR-4.1-3 | Subagent 上下文构建 < 5s | 仅读取关联文档的必要片段，不做全量加载 | 上下文构建 < 2s |
| NFR-4.2-1 | 所有内容使用简体中文 | 模板和工具函数预设中文文案 | 用户可见信息 100% 中文 |
| NFR-4.2-2 | 错误信息清晰指明问题和方案 | 统一错误处理规范，返回中文错误消息 | 错误信息包含"原因 + 解决方案" |
| NFR-4.2-3 | 每一步都有日志输出 | PM Agent 在流程节点添加 console.log 输出 | 每个阶段至少 1 条进度日志 |
| NFR-4.3-1 | 原子写入防止文件损坏 | doc-writer 采用临时文件 + rename 策略 | 写入中断不产生损坏文件 |
| NFR-4.3-2 | 版本号并发安全 | IMPM 流程单线程串行，无并发写场景 | 不产生重复版本号 |
| NFR-4.3-3 | 网络搜索超时机制 | WS Subagent 添加 30s 超时控制 | 超时后返回错误而非卡死 |
| NFR-4.4-1 | 不读取 .env/credentials 敏感文件 | project-analyzer 配置排除列表 | 扫描排除 .env, credentials, *.key |
| NFR-4.4-2 | Git 操作不存储用户凭证 | 依赖系统 Git 认证，不读写 .git-credentials | 不涉及凭证存储 |
| NFR-4.4-3 | 网络搜索不发送项目代码 | WS 仅发送关键词/包名，不发送源代码 | 无代码泄露风险 |
| NFR-4.5-1 | 代码遵循统一编码规范 | project.md 定义完整编码规范（2空格、camelCase、ESM） | 代码审查通过率 100% |
| NFR-4.5-2 | 公共 API 使用 JSDoc 注释 | 编码规范强制要求，技能模板中嵌入注释模板 | 公共函数 100% 有 JSDoc |
| NFR-4.5-3 | 工具函数返回错误消息而非抛异常 | 统一错误处理规范，所有工具函数 catch 异常后返回消息字符串 | 不抛出未捕获异常 |

---

## 8. 目录结构

```
opencode-impm/
├── .opencode/                          # OpenCode 平台配置目录
│   ├── agents/                         # Agent 配置（Subagent 定义）
│   │   ├── pm-agent.md                 # PM Agent 主控编排者
│   │   ├── ba-subagent.md              # BA 商业分析 Agent
│   │   ├── sa-subagent.md              # SA 软件架构 Agent
│   │   ├── tl-subagent.md              # TL 技术主管 Agent
│   │   ├── de-subagent.md              # DE 通用开发 Agent
│   │   ├── fe-subagent.md              # FE 前端开发 Agent
│   │   ├── be-subagent.md              # BE 后端开发 Agent
│   │   ├── te-subagent.md              # TE 测试 Agent
│   │   ├── cs-subagent.md              # CS 代码搜索 Agent
│   │   ├── ws-subagent.md              # WS 网络搜索 Agent
│   │   └── tw-subagent.md              # TW 技术写作 Agent
│   └── skills/                         # 技能定义（执行逻辑封装）
│       ├── impm-project-update/        # 项目分析与 project.md 管理
│       │   ├── SKILL.md
│       │   └── PROJECT-TEMPLATE.MD
│       ├── impm-req-create/            # 需求文档生成
│       │   └── SKILL.md
│       ├── impm-prd-create/            # PRD 文档生成
│       │   └── SKILL.md
│       ├── impm-architect-update/       # 架构文档生成/更新
│       │   ├── SKILL.md
│       │   └── ARCH-TEMPLATE.MD
│       ├── impm-sds-create/           # 技术规格说明生成
│       │   └── SKILL.md
│       ├── impm-task-create/           # 任务清单生成
│       │   └── SKILL.md
│       ├── impm-coding/                # TDD 驱动编码执行
│       │   └── SKILL.md
│       └── impm-doc-update/            # 项目文档与注释生成
│           └── SKILL.md
├── docs/                               # 项目文档目录
│   ├── project.md                      # 项目信息文档（自动维护）
│   ├── architecture.md                 # 架构文档（本文件）
│   ├── requires/                       # 需求文档
│   │   └── opencode-impm-requirement-v0.1.0.md
│   ├── prds/                           # PRD 文档
│   │   └── opencode-impm-prd-v0.1.0.md
│   ├── sds/                          # 技术规格说明
│   └── tasks/                          # 任务清单
│       ├── opencode-impm-task-v0.1.0.md
│       └── opencode-impm-task-v0.1.0.json
├── src/                                # 源代码目录
│   ├── index.ts                        # 插件入口（注册命令和工具）
│   ├── tools/                          # 工具函数实现（每个文件注册一个 OpenCode Tool）
│   │   ├── doc-reader.ts               # 文档读取工具
│   │   ├── doc-writer.ts               # 文档写入工具
│   │   ├── doc-version.ts              # 版本号管理工具
│   │   ├── task-manager.ts             # 任务状态管理工具
│   │   ├── project-analyzer.ts         # 项目结构分析工具
│   │   ├── git-helper.ts               # Git 操作工具
│   │   └── context-builder.ts          # 上下文构建工具
│   └── utils/                          # 通用工具函数
│       ├── paths.ts                    # 路径常量和工具函数
│       ├── git.ts                      # Git 操作函数集
│       └── version.ts                  # 版本号工具函数集
├── __tests__/                          # 单元测试目录（与 src 结构对应）
│   ├── tools/
│   │   ├── doc-reader.test.ts
│   │   ├── doc-writer.test.ts
│   │   ├── doc-version.test.ts
│   │   ├── task-manager.test.ts
│   │   ├── project-analyzer.test.ts
│   │   ├── git-helper.test.ts
│   │   └── context-builder.test.ts
│   └── utils/
│       ├── paths.test.ts
│       ├── git.test.ts
│       └── version.test.ts
├── package.json                        # 项目配置与依赖声明
├── tsconfig.json                       # TypeScript 编译配置
├── opencode.json                       # OpenCode 插件配置
└── README.md                           # 项目自述（TW Subagent 生成）
```

---

## 9. 架构质量属性

| 质量属性 | 实现策略 | 验证方式 |
| -------- | ----------------- | ----------- |
| **可维护性** | 模块化分层架构，每个工具函数独立文件，职责单一 | 代码审查 + 圈复杂度检查 |
| **可测试性** | 纯函数优先设计，工具函数不依赖全局状态，输入输出明确 | 单元测试覆盖率 ≥ 90% |
| **可扩展性** | 工具函数注册制，新增工具只需新建文件并注册；Subagent 通过技能定义扩展 | 新增一个工具的成本评估 |
| **可靠性** | 统一错误处理返回消息而非抛异常；doc-writer 原子写入；WS 网络超时控制 | 异常场景测试 + 错误注入测试 |
| **可移植性** | 仅依赖 Node.js 内置模块；不依赖操作系统特性；文件路径使用 path 模块处理 | 跨 Windows/macOS/Linux 运行测试 |
| **性能** | 同步文件 I/O（无异步调度开销）；上下文构建按需提取不做全量加载 | 基准测试 + 压力测试 |
| **安全性** | project-analyzer 排除敏感文件；不存储 Git 凭证；WS 不发送项目代码 | 安全扫描 + 代码审计 |

---

## 10. 附录

### A. 接口规范模板

```typescript
// 工具函数统一注册模式
interface ToolRegistration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object';
      description: string;
    }>;
    required: string[];
  };
}

// 工具执行函数统一签名
type ToolExecuteFunction<TArgs, TResult> = (args: TArgs) => TResult;

// 插件入口函数统一签名
type PluginFunction = (context: OpenCodeContext) => {
  commands?: CommandRegistration[];
  tools?: ToolRegistration[];
};
```

### B. 文档命名规范

| 文档类型 | 目录 | 文件名格式 | 示例 |
| ----- | ---- | -------- | ------ |
| 需求文档 | docs/requires/ | `{projectName}-requirement-v{version}.md` | `opencode-impm-requirement-v0.1.0.md` |
| PRD 文档 | docs/prds/ | `{projectName}-prd-v{version}.md` | `opencode-impm-prd-v0.1.0.md` |
| 架构文档 | docs/ | `architecture.md` | `architecture.md` |
| 技术规格 | docs/sds/ | \`{projectName}-sds-v{version}.md\` | \`opencode-impm-sds-v0.1.0.md\` |
| 任务清单 | docs/tasks/ | `{projectName}-task-v{version}.md` / `.json` | `opencode-impm-task-v0.1.0.json` |
| 项目信息 | docs/ | `project.md` | `project.md` |

### C. 版本号规则

格式： `v{主版本}.{次版本}.{修订号}`

递增规则：
- **主版本**：架构有重大变更，不兼容旧版本时
- **次版本**：新增功能或用户故事时
- **修订号**：Bug 修复、文档微调、小改进时

### D. 参考文档

- [OpenCode IMPM PRD v0.1.0](docs/prds/opencode-impm-prd-v0.1.0.md)
- [OpenCode IMPM Project 信息](docs/project.md)
- [OpenCode 插件开发文档](https://docs.opencode.ai)（网络查询）
