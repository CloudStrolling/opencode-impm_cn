# 技术规格文档

**项目名称：** 我是项目经理
**项目英文名：** opencode-impm
**版本号：** v0.1.0
**日期：** 2026-05-27

---

## 目录

1. [技术方案概述](#1-技术方案概述)
2. [模块详细设计](#2-模块详细设计)
   - [2.1 编排引擎层 — PM Agent](#21-编排引擎层--pm-agent)
   - [2.2 技能执行层 — 8个Skills](#22-技能执行层--8个skills)
   - [2.3 工具层 — 7个核心工具](#23-工具层--7个核心工具)
   - [2.4 工具函数层 — Utilities](#24-工具函数层--utilities)
   - [2.5 资源层 — Assets](#25-资源层--assets)
3. [核心数据模型](#3-核心数据模型)
4. [接口详细定义](#4-接口详细定义)
   - [4.1 7个Tool接口](#41-7个tool接口)
   - [4.2 8个Skill接口](#42-8个skill接口)
   - [4.3 全流程编排接口](#43-全流程编排接口)
5. [错误处理方案](#5-错误处理方案)
6. [版本号管理方案](#6-版本号管理方案)
7. [启动流程设计](#7-启动流程设计)
8. [项目文档规范](#8-项目文档规范)
9. [依赖清单](#9-依赖清单)

---

## 1. 技术方案概述

### 1.1 系统定位

"我是项目经理"（opencode-impm）是一个基于 OpenCode 平台的 AI 驱动软件工程全流程开发插件。它以 PM Agent 作为核心编排引擎，通过标准化技能-工具机制调度多个专业 subagent，按照**交付物驱动**的顺序管道执行软件工程全流程。

### 1.2 架构风格

系统采用 **微内核 + 事件驱动管道** 架构风格，分为5层：

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: 用户交互层 (User)                                       │
│   ┌───────────────────────────────────────────────────────────┐  │
│   │  /impm 命令 + 提示词/文档路径                               │  │
│   └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: 编排引擎层 (PM Agent)                                   │
│   ┌──────────┬──────────────┬──────────────┬────────────────┐  │
│   │ 流程编排  │ subagent调度  │ 上下文管理    │ Git/版本号管理  │  │
│   └──────────┴──────────────┴──────────────┴────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: 技能执行层 (8个Skills)                                  │
│    project-update→req-create→prd-create→architect-update→        │
│    spec-create→task-create→coding→doc-update                     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: 工具层 (7个核心Tool)                                    │
│   doc_reader / doc_writer / doc_version / task_manager /         │
│   project_analyzer / git_helper / context_builder                │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5: 资源层 (Assets) + 工具函数层 (Utils)                     │
│   Agent配置 / 命令定义 / 技能定义 / 文档模板                      │
│   git.ts / paths.ts / version.ts                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 核心工程流程

```
用户输入 → project.md → requirement → PRD → 架构 → Spec → Task → 编码 → 文档
```

这是一个单向管道流程，每个步骤的输出文档是下一步骤的唯一输入依赖。

### 1.4 关键设计原则

| 原则 | 说明 | 实现方式 |
|------|------|---------|
| **交付物驱动** | 步骤间通过标准化文档对接 | 固定文件名和路径规范，版本号管理 |
| **上下文隔离** | 每个 subagent 只接收最小上下文 | context_builder 工具按任务ID提取片段 |
| **TDD 先行** | 测试先于实现 | 编码阶段先启动 TE subagent 写测试 |
| **版本号统一** | 同一流程所有文档共享版本号 | doc_version 工具统一管理 |
| **Git 分支隔离** | 每次开发在独立分支进行 | git_helper 工具管理分支操作 |

### 1.5 对应 PRD UserStory 一览

| 编号 | 技术方案覆盖 |
|------|------------|
| US-001 | 全流程编排引擎设计（第2.1节、第7节） |
| US-002 | project-update 技能 + project_analyzer 工具（第2.2节、第2.3节） |
| US-003 | req-create 技能 + doc_version/doc_writer 工具（第2.2节、第2.3节） |
| US-004 | prd-create 技能 + doc_reader/doc_writer 工具（第2.2节） |
| US-005 | architect-update 技能（第2.2节） |
| US-006 | spec-create 技能（即本spec对应的技能，第2.2节） |
| US-007 | task-create 技能 + task_manager 工具（第2.2节、第2.3节） |
| US-008 | coding 技能 + context_builder 工具（第2.2节、第2.3节） |
| US-009 | doc-update 技能（第2.2节） |
| US-010 | git_helper 工具 + git.ts 工具函数（第2.3节、第2.4节） |
| US-011 | doc_version 工具 + version.ts 工具函数（第2.3节、第2.4节） |
| US-012 | context_builder 工具 + skills 输入规范（第2.2节、第2.3节） |

---

## 2. 模块详细设计

### 2.1 编排引擎层 — PM Agent

#### 2.1.1 功能描述

PM Agent 是系统的核心编排器，负责：
1. 接收 `/impm` 命令参数（提示词/文档路径）
2. 调用 `doc_version` 获取/计算统一版本号
3. 调用 `git_helper` 创建 Git 分支
4. 按流程顺序启动 8 个 Skill
5. 调用 `task_manager` 管理任务状态
6. 调用 `git_helper` 提交代码和合并分支
7. 返回进度信息和最终结果给用户

#### 2.1.2 配置位置

`assets/agents/pm.md` — PM Agent 的提示词和角色定义

#### 2.1.3 流程编排伪代码

```
async function impmFlow(userInput: UserInput):
  // Step 0: 初始化
  version = doc_version.next(hintVersion)
  git_helper.branch("impm/v{version}")

  // Step 1: 项目信息初始化
  project.md = skill(impm-project-update, userInput)

  // Step 2: 需求文档生成
  requirement.md = skill(impm-req-create, userInput)

  // Step 3: PRD文档生成
  prd.md = skill(impm-prd-create, project.md, requirement.md)

  // Step 4: 架构文档管理
  ARCHITECTURE.md = skill(impm-architect-update, prd.md, project.md)

  // Step 5: 技术规格说明生成
  spec.md = skill(impm-spec-create, prd.md, ARCHITECTURE.md, project.md)

  // Step 6: 任务清单生成
  task.md + task.json = skill(impm-task-create, prd.md, ARCHITECTURE.md, spec.md, project.md)

  // Step 7: 循环执行编码任务
  for each task in taskList sorted by dependency:
    skill(impm-coding, task)

  // Step 8: 项目文档生成
  skill(impm-doc-update, project.md)

  // Step 9: 完成
  git_helper.commit("完成 v{version} 开发")
  git_helper.merge("main")
  返回 最终结果给用户
```

#### 2.1.4 输入输出

- **输入：** `/impm {提示词}` 或 `/impm {需求文档路径}` 或两者混合
- **输出：** 全流程执行结果，包含各步骤进度信息和最终交付物清单

#### 2.1.5 错误处理

| 场景 | 处理方式 |
|------|---------|
| 用户输入为空 | 提示用户输入需求提示词或指定需求文档路径 |
| Git 仓库不存在 | 提示用户先初始化 Git 仓库 |
| 子任务执行失败 | 记录错误信息，暂停流程，提供重试选项 |
| 版本号冲突 | 检测到版本号冲突时提示用户确认 |

---

### 2.2 技能执行层 — 8个Skills

每个技能封装一个完整的工程步骤，定义在 `assets/skills/` 目录下。

#### 2.2.1 impm-project-update（SA subagent）

**功能描述：** 扫描项目结构，生成或更新 `project.md` 文档。

**输入：**
- 项目根目录路径
- 用户提示词（可选，可能包含项目信息）

**输出：** `project.md` — 包含 Project Info、Coding Conventions、Project Map

**执行逻辑：**
1. 检查 `project.md` 是否存在
2. 若不存在：根据用户输入 + `template/PROJECT-TEMPLATE.MD` 生成完整文档
3. 若存在：读取已有内容，仅更新 Project Map 部分
4. 调用 `project_analyzer` 扫描源码目录，生成 Project Map
5. 使用 `doc_writer` 写入 `project.md`

**对应 PRD：** US-002

#### 2.2.2 impm-req-create（BA subagent）

**功能描述：** 读取用户提示词和引用的需求文档，生成结构化需求文档。

**输入：**
- 用户提示词
- 引用的需求文档路径（可选）

**输出：** `docs/requires/{项目名称}-requirement-v{x.x.x}.md`

**文档结构：**
```markdown
# 需求文档
版本号: v{x.x.x}
日期: {当前日期}

## 1. 项目背景
## 2. 功能需求
## 3. 非功能需求
## 4. 约束条件
## 5. 假设与依赖
```

**版本号规则：**
- 用户指定版本号 → 直接使用
- 未指定 → 读取 `docs/requires/` 下最新文件，修订号+1
- `docs/requires/` 为空 → 默认 v0.0.1

**对应 PRD：** US-003

#### 2.2.3 impm-prd-create（BA subagent）

**功能描述：** 读取需求文档和 `project.md`，生成 UserStory 格式的 PRD 文档。

**输入：**
- `docs/requires/{项目名称}-requirement-v{x.x.x}.md`
- `project.md`

**输出：** `docs/prds/{项目名称}-prd-v{x.x.x}.md`

**文档结构：**
```markdown
# PRD文档
版本号: v{x.x.x}

## 产品概述
## 目标用户
## 用户故事
### US-001: {标题}
- 角色、功能、价值、验收标准、优先级
### US-002: ...
## 优先级排序
## 非功能性需求
## 约束条件
## 假设与依赖
```

**对应 PRD：** US-004

#### 2.2.4 impm-architect-update（SA subagent）

**功能描述：** 根据 PRD 和 `project.md`，生成或更新架构文档。

**输入：**
- `docs/prds/{项目名称}-prd-v{x.x.x}.md`
- `project.md`

**输出：** `ARCHITECTURE.md`

**变更检测：**
- `ARCHITECTURE.md` 不存在 → 生成新文档
- 已存在 → 对比 PRD 判断是否涉及架构变更
  - 涉及变更 → 更新
  - 不涉及 → 跳过

**对应 PRD：** US-005

#### 2.2.5 impm-spec-create（TL subagent）

**功能描述：** 读取 PRD、架构文档和 `project.md`，生成技术规格说明（即本技能）。

**输入：**
- `docs/prds/{项目名称}-prd-v{x.x.x}.md`
- `ARCHITECTURE.md`
- `project.md`

**输出：** `docs/specs/{项目名称}-spec-v{x.x.x}.md`

**文档结构：**
- 技术方案概述
- 模块详细设计（含接口定义、数据模型、错误处理）
- 核心数据模型
- 错误处理方案

**对应 PRD：** US-006

#### 2.2.6 impm-task-create（TL subagent）

**功能描述：** 根据 PRD、架构文档和 Spec，生成任务清单。

**输入：**
- `docs/prds/{项目名称}-prd-v{x.x.x}.md`
- `ARCHITECTURE.md`
- `docs/specs/{项目名称}-spec-v{x.x.x}.md`
- `project.md`

**输出：**
- `docs/tasks/{项目名称}-task-v{x.x.x}.md`（可读文档）
- `docs/tasks/{项目名称}-task-v{x.x.x}.json`（程序化管理）

**任务结构：**
- 主任务：有唯一 ID、标题、描述、类型（前端/后端/通用）、关联 UserStory、上下游依赖、状态
- 子任务：有唯一 ID、标题、描述、测试方法、验收标准

**对应 PRD：** US-007

#### 2.2.7 impm-coding（多 subagent 协作）

**功能描述：** 按任务逐一执行编码，采用 TDD 方式。

**内部 subagent 协作顺序：**
```
1. CS (Code Searcher) → 搜索本地相关代码
2. WS (Web Searcher) → 搜索三方包文档
3. TE (Test Engineer) → 编写测试用例和测试代码
4. FE/BE/DE (按任务类型) → 编写实现代码
5. TE → 验证测试是否通过
6. [循环] 测试失败 → 返回步骤4重新编码
7. TW (Technical Writer) → 添加代码注释
8. [Git] 提交代码，更新任务状态
```

**context_builder 使用方法：**
- 启动每个 subagent 前，调用 `context_builder` 获取精简上下文
- 上下文包含：当前任务信息、关联 UserStory、相关架构/spec 片段

**对应 PRD：** US-008

#### 2.2.8 impm-doc-update（TW subagent）

**功能描述：** 在编码完成后生成项目文档并完善代码注释。

**输入：**
- `project.md`
- 编码完成后的项目代码

**输出：**
- `README.md` — 项目介绍和使用说明
- 编译与部署手册（可选）
- 环境配置说明（可选）
- 部署脚本（可选）

**代码注释要求：**
- 公共 API 使用 JSDoc 格式
- 注释使用 `project.md` 指定的本地语言（简体中文）

**对应 PRD：** US-009

---

### 2.3 工具层 — 7个核心工具

所有工具注册在 `src/index.ts` 中，通过 OpenCode SDK 暴露给 Agent 和 Subagent。

#### 2.3.1 impm_doc_reader — 文档读取工具

**功能描述：** 从标准路径读取项目文档，自动处理版本号查找和项目名称推断。

**实现位置：** `src/tools/doc-reader.ts`

**支持文档类型：**
- 固定文件：`project.md`（`docType: "project"`）、`ARCHITECTURE.md`（`docType: "architect"`）
- 版本化文件：`requirement`、`prd`、`spec`、`task`

**执行流程：**
1. 根据 `docType` 判断文档类型
2. 固定文件 → 直接读取项目根目录
3. 版本化文档 → 通过 `DOC_TYPE_DIR` 映射目录
4. 未传版本号 → 调用 `findLatestVersion()` 自动查找最新版本
5. 未传项目名 → 调用 `inferProjectName()` 从文件名反向推断
6. 组装完整路径并读取文件内容

**接口定义：** 见第4章

#### 2.3.2 impm_doc_writer — 文档写入工具

**功能描述：** 将生成的内容写入标准路径，自动创建不存在的目录。

**实现位置：** `src/tools/doc-writer.ts`

**特殊行为：**
- `docType === "task"` 时同时生成 `.md` 和 `.json` 双格式
- `docType === "project"` 写入项目根目录的 `project.md`
- `docType === "architect"` 写入项目根目录的 `ARCHITECTURE.md`

**接口定义：** 见第4章

#### 2.3.3 impm_doc_version — 版本号管理工具

**功能描述：** 获取当前最新版本号或计算下一个版本号。

**实现位置：** `src/tools/doc-version.ts`

**版本号确定规则（优先级从高到低）：**
1. 用户提示词或文档中明确指定的版本号（`hintVersion`）
2. 扫描 `docs/requires/` 目录，取最新版本的修订号+1
3. 目录为空 → 默认 `0.0.1`

**操作模式：**
- `current` — 返回当前最新版本号
- `next` — 返回下一个版本号（修订号+1）

**接口定义：** 见第4章

#### 2.3.4 impm_task_manager — 任务状态管理工具

**功能描述：** 初始化、查询、更新任务清单状态。

**实现位置：** `src/tools/task-manager.ts`

**操作模式：**
- `init` — 从 JSON 字符串初始化任务清单文件
- `query` — 查询任务（全部可查询或按 taskId 查询）
- `update` — 更新指定任务的状态

**数据持久化：** 所有任务状态存储在 `docs/tasks/{项目名称}-task-v{x.x.x}.json`

**接口定义：** 见第4章

#### 2.3.5 impm_project_analyzer — 项目结构分析工具

**功能描述：** 递归扫描源代码目录，提取函数/类列表，生成 Project Map。

**实现位置：** `src/tools/project-analyzer.ts`

**支持的语言和文件类型：**
| 扩展名 | 语言 | 提取内容 |
|--------|------|---------|
| .ts, .tsx, .js, .jsx | TypeScript/JavaScript | function, const arrow functions, class, interface, type |
| .py | Python | def, class |
| .go | Go | func |
| .java, .kt | Java/Kotlin | class, interface, enum |

**默认排除目录：** `node_modules`, `.git`, `dist`, `build`, `.opencode`, `coverage`, `.next`, `.nuxt`, `vendor`, `__pycache__`, `.venv`, `venv`

**接口定义：** 见第4章

#### 2.3.6 impm_git_helper — Git操作工具

**功能描述：** 封装 impm 流程中需要的 Git 操作。

**实现位置：** `src/tools/git-helper.ts`

**支持的操作：**
| action | 功能 | 需要的参数 |
|--------|------|-----------|
| `branch` | 创建并切换到新分支 | `branchName` |
| `commit` | 添加文件并提交 | `message`, `files`（可选，默认添加全部） |
| `merge` | 合并指定分支到当前分支 | `branchName` |
| `status` | 查看当前状态摘要 | — |
| `current-branch` | 获取当前分支名称 | — |

**先决条件检查：**
- 所有操作前先调用 `isGitRepo()` 检查当前目录是否为 Git 仓库
- 若非 Git 仓库，返回错误提示

**接口定义：** 见第4章

#### 2.3.7 impm_context_builder — 上下文构建工具

**功能描述：** 为编码 subagent 构建精简上下文，仅包含本次任务必要的信息。

**实现位置：** `src/tools/context-builder.ts`

**上下文组装逻辑（按优先级排序）：**
1. **当前任务信息** — 从 task.json 读取指定 taskId 的任务详情，包含标题、描述、验收标准等
2. **编码规范** — 从 `project.md` 提取 Coding Conventions 部分
3. **相关架构设计** — 从 ARCHITECTURE.md 根据任务类型提取相关章节
   - `frontend` → 提取含"前端""front"的章节
   - `backend` → 提取含"后端""back""api"的章节
   - `common` → 提取含"通用""common"的章节，以及总览部分
4. **相关用户故事** — 从 PRD 文档提取与任务关联的 UserStory
5. **技术规格** — 从 spec 文档读取完整内容

**输出格式：** Markdown 文本，各部分用 `---` 分隔

**接口定义：** 见第4章

---

### 2.4 工具函数层 — Utilities

#### 2.4.1 git.ts — Git底层命令封装

**实现位置：** `src/utils/git.ts`

**功能说明：**
基于 `child_process.execSync` 封装 Git 命令，所有命令通过统一的 `gitExec()` 函数执行。

**核心函数：**

| 函数名 | 功能 | 返回类型 |
|--------|------|---------|
| `gitExec(cwd, command)` | 执行 git 命令并返回 stdout | `string` |
| `isGitRepo(cwd)` | 检查目录是否为 Git 仓库 | `boolean` |
| `createBranch(cwd, branchName)` | 创建并切换到新分支 | `string` |
| `switchBranch(cwd, branchName)` | 切换到已有分支 | `string` |
| `getCurrentBranch(cwd)` | 获取当前分支名称 | `string` |
| `addFiles(cwd, files)` | 添加文件到暂存区 | `void` |
| `commit(cwd, message)` | 提交暂存区内容 | `string` |
| `mergeBranch(cwd, branchName)` | 合并分支 | `string` |
| `getStatus(cwd)` | 获取状态摘要 | `string` |

**安全措施：**
- `commit()` 中转义提交信息中的双引号，防止命令注入
- `gitExec()` 使用 `try-catch` 包裹，失败时抛出语义化错误信息

#### 2.4.2 paths.ts — 路径与文件名管理

**实现位置：** `src/utils/paths.ts`

**设计说明：**
统一的路径管理确保所有工具读写文档时使用一致的目录结构。

**目录映射（DOC_TYPE_DIR）：**
| docType | 目录 |
|---------|------|
| `requirement` | `docs/requires/` |
| `prd` | `docs/prds/` |
| `spec` | `docs/specs/` |
| `task` | `docs/tasks/` |
| `architect` | `.`（项目根目录，文件名 ARCHITECTURE.md） |
| `project` | `.`（项目根目录，文件名 project.md） |

**文件名命名规则：**
- 版本化文档：`{项目名称}-{文档类型}-v{版本号}.md`
  - 示例：`opencode-impm-requirement-v0.1.0.md`
- 固定文件：`ARCHITECTURE.md` 或 `project.md`
- 任务 JSON 文件：`{项目名称}-task-v{版本号}.json`

**核心函数：**

| 函数名 | 功能 | 返回类型 |
|--------|------|---------|
| `getDocFileName(projectName, docType, version)` | 生成标准文件名 | `string` |
| `getDocFilePath(projectRoot, projectName, docType, version)` | 生成完整路径 | `string` |
| `getTaskJsonPath(projectRoot, projectName, version)` | 获取任务JSON路径 | `string` |

#### 2.4.3 version.ts — 语义化版本号管理

**实现位置：** `src/utils/version.ts`

**版本号格式：** `主版本号.次版本号.修订号`（如 `0.1.0`），可选择性加 `v` 前缀。

**核心函数：**

| 函数名 | 功能 | 返回类型 |
|--------|------|---------|
| `parseVersion(version)` | 解析版本号为数字数组 | `[number, number, number]` |
| `formatVersion(major, minor, patch)` | 格式化版本号字符串 | `string` |
| `incrementPatch(version)` | 递增修订号 | `string` |
| `compareVersions(a, b)` | 比较两个版本号 | `number` |
| `extractVersionFromFileName(fileName)` | 从文件名提取版本号 | `string \| null` |
| `isValidVersion(version)` | 校验版本号格式 | `boolean` |

---

### 2.5 资源层 — Assets

#### 2.5.1 Agents 配置

**位置：** `assets/agents/`

包含 12 个 subagent 的提示词/配置：
| 文件 | 角色 | 职责 |
|------|------|------|
| `pm.md` | PM (项目经理) | 主编排器 |
| `ba.md` | BA (业务分析师) | 需求与 PRD 编写 |
| `sa.md` | SA (软件架构师) | 项目信息与架构设计 |
| `tl.md` | TL (技术负责人) | 技术规格与任务分解 |
| `te.md` | TE (测试工程师) | 测试用例编写 |
| `fe.md` | FE (前端工程师) | 前端编码 |
| `be.md` | BE (后端工程师) | 后端编码 |
| `de.md` | DE (通用开发) | 通用编码 |
| `cs.md` | CS (代码搜索) | 本地代码搜索 |
| `ws.md` | WS (网络搜索) | 三方包文档搜索 |
| `tw.md` | TW (技术写手) | 文档与注释 |
| `dba.md` | DBA (数据库管理) | 数据库设计与操作 |

#### 2.5.2 Commands 定义

**位置：** `assets/commands/`

- `impm.md` — `/impm` 主命令定义
- 子命令定义文件（可选扩展）

#### 2.5.3 Skills 定义

**位置：** `assets/skills/`

8 个技能目录，每个目录包含技能定义文件（定义输入输出规范和执行步骤）。

#### 2.5.4 文档模板

**位置：** `template/PROJECT-TEMPLATE.MD`

project.md 的生成模板，包含三个节：
```markdown
# Project Info
## Coding Conventions
## Project Map
```

---

## 3. 核心数据模型

### 3.1 任务相关模型

```typescript
// 任务状态枚举
type TaskStatus = "未完成" | "执行中" | "已完成"

// 任务类型枚举
type TaskType = "前端" | "后端" | "通用"

// 子任务结构
interface SubTask {
  id: string            // 子任务ID，如 "TASK-001-1"
  title: string          // 子任务标题
  description: string    // 子任务详细描述
  userStoryIds: string[] // 关联的UserStory编号列表
  status: TaskStatus     // 子任务当前状态
  testMethod: string     // 测试方法描述
  acceptanceCriteria: string // 验收标准描述
}

// 主任务结构
interface MainTask {
  id: string                // 主任务ID，如 "TASK-001"
  title: string             // 主任务标题
  description: string       // 主任务详细描述
  taskType: TaskType        // 任务类型
  userStoryIds: string[]    // 关联的UserStory编号列表
  upstreamTaskIds: string[] // 上游依赖任务ID列表（必须先完成）
  downstreamTaskIds: string[] // 下游任务ID列表（依赖本任务）
  status: TaskStatus        // 主任务当前状态
  subTasks: SubTask[]       // 子任务列表
  testMethod: string        // 测试方法描述
  acceptanceCriteria: string // 验收标准描述
}

// 任务清单结构
interface TaskList {
  projectName: string  // 项目名称
  version: string      // 版本号
  tasks: MainTask[]    // 主任务列表
}
```

### 3.2 文档路径模型

```typescript
// 文档类型常量
type DocType = "requirement" | "prd" | "spec" | "task" | "architect" | "project"

// 文档类型到目录的映射（常量）
const DOC_TYPE_DIR: Record<string, string> = {
  requirement: "docs/requires/",
  prd: "docs/prds/",
  spec: "docs/specs/",
  task: "docs/tasks/",
  architect: ".",     // 项目根目录
  project: ".",       // 项目根目录
}

// 文档文件名映射
const DOC_TYPE_PREFIX: Record<string, string> = {
  requirement: "requirement",
  prd: "prd",
  spec: "spec",
  task: "task",
  architect: "ARCHITECTURE",
  project: "project",
}

// 文件扩展名映射
const DOC_TYPE_EXT: Record<string, string> = {
  requirement: ".md",
  prd: ".md",
  spec: ".md",
  task: ".md",
  architect: ".md",
  project: ".md",
}
```

### 3.3 项目分析模型

```typescript
// 单个文件分析结果
interface FileAnalysis {
  path: string          // 相对于项目根目录的路径
  functions: string[]   // 函数/类签名列表，如 ["getDocFileName(projectName, docType, version)"]
}

// 分析结果
interface AnalysisResult {
  projectRoot: string   // 项目根目录
  fileCount: number     // 扫描的文件总数
  files: FileAnalysis[] // 文件分析结果列表
}
```

### 3.4 上下文模型

```typescript
// context_builder 输出结构（Markdown格式）
// 包含5部分：
//   1. # 当前任务 — 从task.json读取的任务详情
//   2. # 编码规范 — 从project.md提取的Coding Conventions
//   3. # 相关架构设计 — 从ARCHITECTURE.md提取的相关章节
//   4. # 相关用户故事 — 从PRD文档提取的UserStory
//   5. # 技术规格 — 完整spec内容
// 各部分用 "---" 分隔
```

---

## 4. 接口详细定义

### 4.1 7个Tool接口

#### 4.1.1 impm_doc_reader

```typescript
// 参数接口
interface DocReaderArgs {
  projectRoot: string     // 项目根目录绝对路径
  docType: string         // 文档类型: "requirement" | "prd" | "spec" | "task" | "architect" | "project"
  version?: string        // 版本号（可选，不传则自动查找最新版本）
  projectName?: string    // 项目名称（可选，不传则从文件名推断）
}

// 返回值
Promise<string>  // 文档内容（Markdown格式文本）
```

**返回可能值：**
- 成功：文档完整内容字符串
- 文件不存在：描述性错误字符串（如 "project.md 文件不存在"）
- 类型不支持：描述性错误字符串（如 "不支持的文档类型: xxx"）
- 目录不存在：描述性错误字符串（如 "文档目录不存在: docs/specs"）
- 未找到文档：描述性错误字符串（如 "在 docs/specs 目录下未找到 spec 类型的文档"）

#### 4.1.2 impm_doc_writer

```typescript
// 参数接口
interface DocWriterArgs {
  projectRoot: string     // 项目根目录绝对路径
  docType: string         // 文档类型
  version: string         // 版本号
  projectName: string     // 项目名称
  content: string         // 文档内容（Markdown格式）
  isJson?: boolean        // 是否为JSON格式（task类型专用）
}

// 返回值
Promise<string>  // 操作结果消息（包含写入路径）
```

**返回可能值：**
- 成功：`"project.md 写入成功: {路径}"`
- 成功：`"ARCHITECTURE.md 写入成功: {路径}"`
- 成功：`"任务文档写入成功: {路径}"`
- 成功：`"文档写入成功: {路径}"`
- 失败：`"不支持的文档类型: {docType}"`

#### 4.1.3 impm_doc_version

```typescript
// 参数接口
interface DocVersionArgs {
  projectRoot: string         // 项目根目录绝对路径
  action: "next" | "current" // 操作类型
  hintVersion?: string        // 提示版本号（优先使用）
}

// 返回值
Promise<string>  // 版本号字符串，如 "0.1.0"
```

**返回可能值：**
- 有效版本号：`"0.1.0"` 等 SemVer 格式
- 无版本：`"当前无任何版本"`（current 模式且无文档时）

#### 4.1.4 impm_task_manager

```typescript
// 参数接口
interface TaskManagerArgs {
  projectRoot: string                       // 项目根目录
  projectName: string                       // 项目名称
  version: string                           // 版本号
  action: "query" | "update" | "init"       // 操作类型
  taskId?: string                            // 任务ID
  status?: "未完成" | "执行中" | "已完成"      // 新状态
  taskListJson?: string                      // 任务清单JSON字符串（init时需要）
}

// 返回值
Promise<string>  // 操作结果信息
```

**返回可能值：**
- `init` 成功：`"任务清单初始化成功: {路径}"`
- `query` 全部：JSON 字符串（含总任务数、待执行数、待执行任务列表）
- `query` 单任务：任务对象的 JSON 序列化
- `update` 成功：`"任务 {taskId} 状态已更新: 旧状态 → 新状态"`
- 参数错误：明确的错误提示（如 "init操作需要提供taskListJson参数"）
- 文件不存在：`"任务清单文件不存在: {路径}"`

#### 4.1.5 impm_project_analyzer

```typescript
// 参数接口
interface ProjectAnalyzerArgs {
  projectRoot: string        // 项目根目录
  sourceDirs?: string[]      // 要扫描的源代码目录（相对于项目根目录）
  excludeDirs?: string[]     // 排除的目录名列表
}

// 返回值
Promise<string>  // Markdown格式的Project Map
```

**返回格式：**
```markdown
# Project Map
共扫描 N 个源代码文件

## src/tools/doc-reader.ts
- `functionName(params)` - 一句话描述

## src/utils/version.ts
- `parseVersion(version)` - 解析版本号
...
```

#### 4.1.6 impm_git_helper

```typescript
// 参数接口
interface GitHelperArgs {
  projectRoot: string                                      // 项目根目录
  action: "branch" | "commit" | "merge" | "status" | "current-branch"  // 操作类型
  branchName?: string       // 分支名称
  message?: string          // 提交消息
  files?: string            // 要添加的文件列表（JSON数组字符串）
}

// 返回值
Promise<string>  // 操作结果信息
```

**返回可能值：**
- `branch` 成功：`"分支 {branchName} 创建成功"`
- `commit` 成功：`"提交成功: {message}"`
- `merge` 成功：`"合并分支 {branchName} 完成"`
- `status`：`git status --short` 的输出
- `current-branch`：当前分支名称
- 非 Git 仓库：`"当前目录不是git仓库: {路径}"`
- 参数缺失：`"{action}操作需要提供{branchName/message}参数"`

#### 4.1.7 impm_context_builder

```typescript
// 参数接口
interface ContextBuilderArgs {
  projectRoot: string              // 项目根目录
  projectName: string              // 项目名称
  version: string                  // 版本号
  taskId: string                   // 任务ID
  taskType: "frontend" | "backend" | "common"  // 任务类型
}

// 返回值
Promise<string>  // Markdown格式的精简上下文，各部分用"---"分隔
```

### 4.2 8个Skill接口

#### 4.2.1 impm-project-update

```typescript
// 调用方式：SA subagent 通过 skill 机制调用
interface ProjectUpdateInput {
  userInput?: string          // 用户提示词（可能包含项目信息）
  projectRoot: string         // 项目根目录
}

interface ProjectUpdateOutput {
  success: boolean
  message: string              // 操作结果描述
  projectMdPath: string        // project.md 路径
}
```

#### 4.2.2 impm-req-create

```typescript
interface ReqCreateInput {
  userPrompt: string           // 用户提示词
  refDocPath?: string          // 引用的需求文档路径
  projectRoot: string          // 项目根目录
}

interface ReqCreateOutput {
  success: boolean
  message: string
  version: string              // 本次使用的版本号
  filePath: string             // 生成的文档路径
}
```

#### 4.2.3 impm-prd-create

```typescript
interface PrdCreateInput {
  requirementPath: string      // 需求文档路径
  projectRoot: string          // 项目根目录
}

interface PrdCreateOutput {
  success: boolean
  message: string
  filePath: string             // PRD文档路径
}
```

#### 4.2.4 impm-architect-update

```typescript
interface ArchitectUpdateInput {
  prdPath: string              // PRD文档路径
  projectRoot: string          // 项目根目录
}

interface ArchitectUpdateOutput {
  success: boolean
  message: string
  updated: boolean             // 是否更新了架构文档
  filePath: string             // 架构文档路径
}
```

#### 4.2.5 impm-spec-create

```typescript
interface SpecCreateInput {
  prdPath: string              // PRD文档路径
  architecturePath: string     // 架构文档路径
  projectRoot: string          // 项目根目录
}

interface SpecCreateOutput {
  success: boolean
  message: string
  filePath: string             // 规格文档路径
}
```

#### 4.2.6 impm-task-create

```typescript
interface TaskCreateInput {
  prdPath: string              // PRD文档路径
  architecturePath: string     // 架构文档路径
  specPath: string             // Spec文档路径
  projectRoot: string          // 项目根目录
}

interface TaskCreateOutput {
  success: boolean
  message: string
  mdFilePath: string           // 任务文档(.md)路径
  jsonFilePath: string         // 任务JSON(.json)路径
}
```

#### 4.2.7 impm-coding

```typescript
interface CodingInput {
  taskId: string               // 要执行的任务ID
  projectRoot: string          // 项目根目录
  version: string              // 版本号
  projectName: string          // 项目名称
  // 内部通过 context_builder 获取上下文
}

interface CodingOutput {
  success: boolean
  message: string
  taskId: string
  status: "已完成" | "失败"
  testPassed: boolean
  commitHash?: string          // 代码提交的Git哈希
}
```

#### 4.2.8 impm-doc-update

```typescript
interface DocUpdateInput {
  projectRoot: string          // 项目根目录
  projectName: string          // 项目名称
}

interface DocUpdateOutput {
  success: boolean
  message: string
  generatedFiles: string[]     // 生成的文档文件路径列表
}
```

### 4.3 全流程编排接口

```typescript
// PM Agent 接收的 /impm 命令参数
interface ImpmCommandInput {
  prompt?: string              // 用户输入的提示词
  docPath?: string             // 引用的需求文档路径
  hintVersion?: string         // 可选，指定版本号
  projectRoot: string          // 项目根目录（由OpenCode上下文提供）
}

// 全流程执行结果
interface ImpmFlowOutput {
  success: boolean
  message: string
  version: string              // 本次使用的版本号
  branchName: string           // 创建的Git分支名
  steps: {
    name: string
    success: boolean
    output?: string
  }[]                          // 各步骤执行结果
  deliverableFiles: string[]   // 生成的交付物文件列表
  taskCount: number            // 总任务数
  completedCount: number       // 完成任务数
}
```

---

## 5. 错误处理方案

### 5.1 统一错误处理策略

系统采用**分层错误处理 + 友好提示**策略：

1. **工具层错误：** 返回包含错误信息的描述性字符串，不抛异常
2. **技能层错误：** 捕获工具层错误，追加上下文信息后返回
3. **编排层错误：** 捕获技能层错误，记录到流程执行结果，通知用户

### 5.2 错误码与处理

| 类别 | 错误码 | 场景 | 错误消息 | 处理方式 |
|------|--------|------|---------|---------|
| **文档** | E001 | 文档类型不支持 | `不支持的文档类型: {docType}` | 提示支持的类型列表 |
| **文档** | E002 | 文档文件不存在 | `{文件名} 文件不存在` | 提示检查路径或先生成该文档 |
| **文档** | E003 | 文档目录不存在 | `文档目录不存在: {目录路径}` | 自动创建目录（writer）或提示（reader） |
| **文档** | E004 | 未找到版本化文档 | `在 {dir} 目录下未找到 {type} 类型的文档` | 提示检查版本号或先执行前序步骤 |
| **文档** | E005 | 项目名称无法推断 | `无法确定项目名称，请提供 projectName 参数` | 提示用户在参数中传入项目名 |
| **版本号** | E010 | 非法版本号格式 | `无效的版本号: {version}` | 提示正确格式为主版本.次版本.修订号 |
| **任务** | E020 | 任务JSON解析失败 | `JSON解析失败: {错误详情}` | 检查任务清单JSON格式 |
| **任务** | E021 | 任务文件不存在 | `任务清单文件不存在: {路径}` | 提示先执行init操作 |
| **任务** | E022 | 任务ID未找到 | `未找到任务: {taskId}` | 检查任务ID是否正确 |
| **任务** | E023 | 无效的状态值 | `无效的状态值: {status}` | 提示有效值：未完成/执行中/已完成 |
| **任务** | E024 | 参数缺失 | `{action}操作需要提供{参数名}参数` | 提示补充必要参数 |
| **Git** | E030 | 非Git仓库 | `当前目录不是git仓库: {路径}` | 提示用户初始化Git仓库 |
| **Git** | E031 | Git命令失败 | `Git命令执行失败: {命令}\n{错误详情}` | 提示具体的Git错误信息 |
| **分析** | E040 | 目录读取失败 | 静默跳过，返回空结果 | 不影响后续流程 |
| **上下文** | E050 | 任务ID未找到（builder） | 上下文包含错误提示 | 不影响其他上下文片段的组装 |

### 5.3 错误预防措施

| 措施 | 实现方式 |
|------|---------|
| **参数校验** | 所有工具函数在入口处校验必要参数，缺失时返回友好错误 |
| **目录自动创建** | `doc_writer` 在写入前自动创建不存在的目录 |
| **版本号校验** | `isValidVersion()` 统一校验版本号格式，拒绝非法输入 |
| **Git命令安全** | `execSync` 参数使用引号包裹，转义特殊字符 |
| **try-catch覆盖** | 所有文件读写和外部命令调用都有 try-catch 保护 |
| **静默容错** | 非关键操作（如分析器、上下文构建器）失败时返回空结果而非中断流程 |

---

## 6. 版本号管理方案

### 6.1 版本号格式

严格遵循语义化版本号（SemVer）规范：
- 格式：`主版本.次版本.修订号`（如 `0.1.0`）
- 可选 `v` 前缀：`v0.1.0` 和 `0.1.0` 均视为合法
- 全部为数字，以 `.` 分隔

### 6.2 版本号确定规则

```
用户指定版本号？
  ├─ 是 → 直接使用（需校验合法性）
  └─ 否 → docs/requires/ 目录有文件？
            ├─ 是 → 取最新版本号，修订号+1
            └─ 否 → 默认 v0.0.1
```

### 6.3 版本号递增策略

| 变更类型 | 升级位置 | 触发场景 |
|---------|---------|---------|
| 架构/API 重大变更 | 主版本号+1 | 架构文档涉及重构 |
| 新增功能 | 次版本号+1 | 新增 UserStory |
| Bug修复/微小变更 | 修订号+1 | 默认递增规则 |

### 6.4 版本号统一性保障

- 同一轮 `/impm` 流程中，所有文档共享同一版本号
- 版本号由 PM Agent 在流程开始时统一获取，传递给所有 Skill
- 版本号同时存储在文档文件名和文档内容头部

### 6.5 版本号生命周期

```
流程开始 → doc_version.next() → 获取统一版本号 → 传入各Skill
                                                       │
                    requirement.md ← 使用版本号命名     │
                    prd.md ← 使用同一版本号             │
                    spec.md ← 使用同一版本号             │
                    task.md/.json ← 使用同一版本号       │
                                                       ▼
                                              流程结束，版本号固定
```

---

## 7. 启动流程设计

### 7.1 /impm 命令注册

`/impm` 命令通过 OpenCode 平台的命令注册机制定义，配置在 `assets/commands/impm.md` 中。

**命令格式：**
```
/impm <提示词或需求描述>
/impm --doc "<需求文档路径>"
/impm <提示词> --doc "<需求文档路径>"
/impm --version "1.0.0" <提示词>   # 指定版本号
```

### 7.2 全流程执行时序

```
用户 (/impm 命令)
  │
  ▼
PM Agent 激活
  │
  ├─ Step 0: 初始化
  │  ├─ 解析命令参数（提示词、文档路径、版本号）
  │  ├─ 调用 doc_version 获取统一版本号
  │  ├─ 调用 git_helper 创建分支 "impm/v{version}"
  │  └─ 调用 project_analyzer（如需要）
  │
  ├─ Step 1: [SA] impm-project-update
  │  ├─ 输入：用户提示词、项目目录
  │  ├─ 工具：project_analyzer, doc_writer
  │  └─ 输出：project.md ✓
  │
  ├─ Step 2: [BA] impm-req-create
  │  ├─ 输入：用户提示词、引用文档路径（如有）
  │  ├─ 工具：doc_reader, doc_version, doc_writer
  │  └─ 输出：requirement-v{version}.md ✓
  │
  ├─ Step 3: [BA] impm-prd-create
  │  ├─ 输入：requirement-v{version}.md, project.md
  │  ├─ 工具：doc_reader, doc_writer
  │  └─ 输出：prd-v{version}.md ✓
  │
  ├─ Step 4: [SA] impm-architect-update
  │  ├─ 输入：prd-v{version}.md, project.md
  │  ├─ 工具：doc_reader, doc_writer
  │  └─ 输出：ARCHITECTURE.md ✓
  │
  ├─ Step 5: [TL] impm-spec-create
  │  ├─ 输入：prd-v{version}.md, ARCHITECTURE.md, project.md
  │  ├─ 工具：doc_reader, doc_writer
  │  └─ 输出：spec-v{version}.md ✓
  │
  ├─ Step 6: [TL] impm-task-create
  │  ├─ 输入：prd-v{version}.md, ARCHITECTURE.md, spec-v{version}.md, project.md
  │  ├─ 工具：doc_reader, doc_writer
  │  └─ 输出：task-v{version}.md + task-v{version}.json ✓
  │
  ├─ Step 7: [impm-coding] 循环执行
  │  │
  │  ├─ (7a) [CS] 搜索本地代码
  │  ├─ (7b) [WS] 搜索三方包文档
  │  ├─ (7c) [TE] 编写测试用例和测试代码
  │  ├─ (7d) [FE/BE/DE] 编写实现代码
  │  ├─ (7e) [TE] 验证测试
  │  ├─ (7f) [循环] 测试失败 → 返回7d
  │  ├─ (7g) [TW] 添加代码注释
  │  └─ (7h) Git提交 + 更新任务状态
  │
  ├─ Step 8: [TW] impm-doc-update
  │  ├─ 输入：project.md, 构建产物
  │  ├─ 输出：README.md, 部署文档等 ✓
  │  └─ Git提交
  │
  └─ Step 9: 流程结束
     ├─ Git合并分支到 main
     ├─ 版本号固定
     └─ 返回最终结果给用户
```

### 7.3 Git分支命名规范

```
impm/v{version}         — 正常流程：impm/v0.1.0
impm/v{version}-{feat}  — 带特征名：impm/v0.1.0-user-auth
```

---

## 8. 项目文档规范

### 8.1 文档目录结构

```
docs/
├── requires/          # 需求文档（requirement）
│   └── {project}-requirement-v{x.x.x}.md
├── prds/              # PRD文档
│   └── {project}-prd-v{x.x.x}.md
├── specs/             # 技术规格说明
│   └── {project}-spec-v{x.x.x}.md
├── tasks/             # 任务清单
│   ├── {project}-task-v{x.x.x}.md    (可读)
│   └── {project}-task-v{x.x.x}.json  (可解析)
└── prompts/           # 提示词记录（可选）
```

### 8.2 文档版本号命名

- 格式：`{项目名称}-{文档类型}-v{版本号}.md`
- 示例：`opencode-impm-requirement-v0.1.0.md`
- JSON：`{项目名称}-{文档类型}-v{版本号}.json`

### 8.3 文档头部规范

每个版本化文档头部需包含：
```markdown
# {文档标题}
版本号: v{x.x.x}
日期: {YYYY-MM-DD}
```

### 8.4 代码注释规范

```typescript
/**
 * 函数简要描述（一句说明功能）
 *
 * @param paramName 参数描述
 * @returns 返回值描述
 */
export function exampleFunction(paramName: string): string {
  // ...
}
```

---

## 9. 依赖清单

### 9.1 运行时依赖

| 包名 | 版本 | 用途 | 类型 |
|------|------|------|------|
| Node.js | >= 18.0.0 | 运行环境 | 运行时 |
| @opencode-ai/sdk | 最新 | OpenCode平台SDK | 运行时 |
| @opencode-ai/plugin | 最新 | 插件开发接口 | 运行时 |
| zod | 最新 | 数据验证 | 运行时 |
| js-yaml | 最新 | YAML文件解析 | 运行时 |

### 9.2 开发依赖

| 包名 | 版本 | 用途 | 类型 |
|------|------|------|------|
| typescript | 5.x | TypeScript编译 | 开发 |
| @types/node | 最新 | Node.js类型定义 | 开发 |
| vitest/jest | 最新 | 单元测试框架 | 开发 |

### 9.3 平台依赖

| 平台/工具 | 用途 |
|-----------|------|
| OpenCode | Agent/Skill/Command/Tool 运行时基础设施 |
| Git | 版本控制 |
| MCP（可选） | 网络搜索工具（WS subagent用） |

---

## 10. 已实现代码与待开发部分对照

### 10.1 已实现（v0.1.0 现有代码）

| 模块 | 文件 | 状态 |
|------|------|------|
| 插件入口 | `src/index.ts` | ✅ 已实现 — 注册7个工具 |
| 文档读取 | `src/tools/doc-reader.ts` | ✅ 已实现 |
| 文档写入 | `src/tools/doc-writer.ts` | ✅ 已实现 |
| 版本号管理 | `src/tools/doc-version.ts` | ✅ 已实现 |
| 任务管理 | `src/tools/task-manager.ts` | ✅ 已实现 |
| 项目分析 | `src/tools/project-analyzer.ts` | ✅ 已实现 |
| Git操作 | `src/tools/git-helper.ts` | ✅ 已实现 |
| 上下文构建 | `src/tools/context-builder.ts` | ✅ 已实现 |
| Git底层函数 | `src/utils/git.ts` | ✅ 已实现 |
| 路径管理 | `src/utils/paths.ts` | ✅ 已实现 |
| 版本号函数 | `src/utils/version.ts` | ✅ 已实现 |
| 文档模板 | `template/PROJECT-TEMPLATE.MD` | ✅ 已实现 |
| 安装脚本 | `scripts/install.ps1`, `scripts/install.mjs` | ✅ 已实现 |

### 10.2 待开发（基于PRD v0.1.0）

| 模块 | 描述 | 关联UserStory | 优先级 |
|------|------|--------------|--------|
| PM Agent 编排逻辑 | 全流程编排引擎，subagent调度 | US-001 | 高 |
| SA subagent 配置 | project-update 和 architect-update 的Agent配置 | US-002, US-005 | 高 |
| BA subagent 配置 | req-create 和 prd-create 的Agent配置 | US-003, US-004 | 高 |
| TL subagent 配置 | spec-create 和 task-create 的Agent配置 | US-006, US-007 | 高 |
| 编码 subagent 配置 | TE/FE/BE/DE/CS/WS/TW 的Agent配置 | US-008 | 高 |
| TW subagent 配置 | doc-update 的Agent配置 | US-009 | 中 |
| 8个技能定义文件 | Skills 的完整定义和规则 | US-001~009 | 高 |
| /impm 命令定义 | 命令参数解析和PM Agent激活 | US-001 | 高 |
| context-builder 完善 | 与任务管理关联的精确上下文提取 | US-012 | 高 |
| 端到端测试 | 全流程集成测试 | US-001~012 | 高 |

---

> **文档版本记录**
>
> | 版本 | 日期 | 变更说明 |
> |------|------|---------|
> | v0.1.0 | 2026-05-27 | 初版 — 覆盖PRD全部12个UserStory的技术规格说明 |
