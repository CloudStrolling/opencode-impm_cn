# Agent 使用说明

opencode-impm 编排了 13 个专业 AI Agent，由 PM Agent（项目经理）统一调度，按照 impm 工程化流程协同完成开发任务。

---

## Agent 总览

| Agent | 角色 | 核心职责 | 由谁调度 |
|-------|------|---------|---------|
| PM | 项目经理 | 流程编排、进度追踪、Subagent 调度 | 用户（通过 `/impm` 命令） |
| BA | 业务分析师 | 需求分析、PRD 生成 | PM |
| SA | 软件架构师 | 项目分析、架构设计 | PM |
| TL | 技术负责人 | 技术规格、任务拆解、代码审查 | PM |
| DBA | 数据库管理员 | 数据库设计、SQL 脚本生成 | PM |
| CS | 代码搜索 | 本地代码库查询与分析 | PM |
| WS | 网络搜索 | 第三方包/文档在线查询 | PM |
| TE | 测试工程师 | 测试用例编写、测试脚本执行 | PM |
| FE | 前端开发 | 前端功能编码实现 | PM |
| BE | 后端开发 | 后端功能编码实现 | PM |
| DE | 通用开发 | 通用编程任务编码实现 | PM |
| TW | 技术写作 | 文档生成、代码注释 | PM |
| VCA | 版本管理员 | Git 分支管理、代码提交与合并 | PM |

---

## PM Agent（项目经理）

**文件：** `assets/agents/pm.md`

PM 是 impm 流程的核心编排者，不直接编写代码，而是调度各个专业 Subagent 完成工作。

**核心职责：**
- 按 impm 流程逐步编排开发过程
- 维护项目进度和任务状态
- 为每个 Subagent 构建精确的上下文
- 确保步骤按序执行、上下文隔离

**调度关系：**
```
PM → BA → VCA → SA → TL → DBA → PM(编码) → TE → TW → VCA
```

**使用方式：** 在 OpenCode 中输入 `/impm` 启动完整流程，或输入子命令执行特定阶段。

---

## BA Agent（业务分析师）

**文件：** `assets/agents/ba.md`

**执行技能：** `impm-req-create`、`impm-prd-create`

**职责：**
- 分析用户输入的需求描述
- 生成带版本号的结构化需求文档（`docs/requires/`）
- 将需求转化为 UserStory 格式的 PRD 文档（`docs/prds/`）
- 定义验收标准和业务规则

**输入：** 用户提示词、版本信息
**输出：** 需求文档（`.md`）、PRD 文档（`.md`）

---

## SA Agent（软件架构师）

**文件：** `assets/agents/sa.md`

**执行技能：** `impm-project-create`、`impm-architect-create`

**职责：**
- 分析项目结构，生成/维护 `project.md`（含项目信息、编码规范、项目地图）
- 根据 PRD 设计系统架构，生成 `architecture.md`
- 确定模块划分、技术选型、数据流设计
- 架构决策记录（ADR）

**输入：** PRD 文档、project.md
**输出：** project.md、architecture.md

---

## TL Agent（技术负责人）

**文件：** `assets/agents/tl.md`

**执行技能：** `impm-sds-create`、`impm-task-create`、`impm-task-coding-context`、`impm-task-coding-review`

**职责：**
- 根据 PRD 和架构文档编写技术规格说明（SDS）
- 将开发需求拆解为可执行的任务清单（task.md + task.json）
- 编码阶段收集需求上下文（context.md）
- 代码质量审核（review.md）

**输入：** PRD 文档、architecture.md
**输出：** sds 文档、任务清单（`.md` + `.json`）、context.md、review.md

---

## DBA Agent（数据库管理员）

**文件：** `assets/agents/dba.md`

**执行技能：** `impm-dbd-create`、`impm-task-coding-dbd`

**职责：**
- 生成数据库设计文档（dbd.md）
- 通过数据库 MCP 读取实际数据库结构
- 为编码任务设计数据库变更（dbd.sql）
- 执行数据库变更脚本

**输入：** project.md、数据库连接信息
**输出：** dbd.md、dbd.sql

---

## CS Agent（代码搜索）

**文件：** `assets/agents/cs.md`

**执行技能：** `impm-task-coding-cs`

**职责：**
- 从 project.md 项目地图中定位与当前任务相关的源代码
- 读取源代码文件，提取关键代码片段
- 标注参考代码的文件位置和功能简述
- 生成 cs.md 供编码 Agent 参考

**输入：** context.md、project.md
**输出：** cs.md（现有代码上下文）

---

## WS Agent（网络搜索）

**文件：** `assets/agents/ws.md`

**执行技能：** `impm-task-coding-ws`

**职责：**
- 分析编码任务需要使用的第三方包或 SDK
- 在线搜索官方文档和使用方法
- 确保搜索资料的版本号与项目兼容
- 生成 ws.md 供编码 Agent 参考

**输入：** context.md、cs.md、architecture.md
**输出：** ws.md（网络参考资料）

---

## TE Agent（测试工程师）

**文件：** `assets/agents/te.md`

**执行技能：** `impm-task-coding-testcase`、`impm-task-coding-test`、`impm-regression-test`

**职责：**
- 编写测试用例文档（testcase.md）
- 编写自动化测试脚本
- 执行测试并记录结果
- 回归测试（全量验证）

**TDD 流程：**
1. 编码前：编写测试用例文档
2. 编码后：编写测试脚本并执行
3. 测试失败 → 回退重新编码
4. 测试通过 → 进入下一步

**输入：** context.md、cs.md、ws.md、dbd.md
**输出：** testcase.md、测试脚本、测试报告

---

## FE/BE/DE Agent（开发工程师）

**文件：** `assets/agents/fe.md`、`assets/agents/be.md`、`assets/agents/de.md`

**执行技能：** `impm-task-coding-code`

**职责：**
- 根据编码上下文和测试用例实现功能代码
- 前端任务 → FE Agent
- 后端任务 → BE Agent
- 通用任务 → DE Agent

**输入：** context.md、cs.md、ws.md、dbd.md、testcase.md
**输出：** 功能代码、review.md

---

## TW Agent（技术写作）

**文件：** `assets/agents/tw.md`

**执行技能：** `impm-docs-update`、`impm-task-coding-comment`

**职责：**
- 生成 README.md、部署文档等项目文档
- 为代码添加详细注释（文件头注释、函数注释、关键代码说明）
- 生成 agent.md 说明文档（本文档）

**输入：** project.md、已完成代码
**输出：** README.md、部署文档、代码注释

---

## VCA Agent（版本管理员）

**文件：** `assets/agents/vca.md`

**执行技能：** `impm-branch-create`、`impm-task-coding-gitcommit`、`impm-branch-commit`

**职责：**
- 创建基于版本号的新分支
- 分析未提交文件，确定 Git 纳入范围
- 提交代码到当前分支
- 合并分支到主分支

**输入：** 版本号、项目名称、未提交文件
**输出：** Git 分支、提交记录、合并结果

---

## 协作流程

```
用户 → [/impm] → PM
                    │
                    ├── [Step 1]  SA → project.md
                    ├── [Step 2]  BA → 需求文档
                    ├── [Step 3]  VCA → 创建分支
                    ├── [Step 4]  BA → PRD 文档
                    ├── [Step 5]  SA → architecture.md
                    ├── [Step 6]  TL → sds 文档
                    ├── [Step 7]  TL → 任务清单
                    ├── [Step 8]  DBA → 数据库设计
                    │
                    ├── [Step 9]  PM(编码循环)
                    │   └── 对每个任务：
                    │       ├── TL   → context.md
                    │       ├── CS   → cs.md
                    │       ├── WS   → ws.md
                    │       ├── DBA  → dbd.sql
                    │       ├── TE   → testcase.md
                    │       ├── FE/BE/DE → 编码
                    │       ├── TE   → 测试验证
                    │       ├── TL   → 代码审查
                    │       ├── TW   → 代码注释
                    │       └── VCA  → 提交代码
                    │
                    ├── [Step 10] TE → 回归测试
                    ├── [Step 11] TW → 项目文档
                    └── [Step 12] VCA → 合并分支
```

---

## 注意事项

1. **上下文隔离**：每个 Subagent 只接收其任务所需的材料，不传递无关信息
2. **交付物驱动**：步骤之间通过文档交付物衔接
3. **TDD 优先**：编码步骤严格遵循"测试先行"原则
4. **所有输出使用简体中文**
5. **Subagent 之间不直接通信**，全部通过 PM Agent 编排调度
