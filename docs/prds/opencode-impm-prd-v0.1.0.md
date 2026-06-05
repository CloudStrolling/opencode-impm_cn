# PRD 文档

**项目中文名称：** OpenCode IMPM（AI项目经理）
**项目名称：** opencode-impm
**版本号：** v0.1.0
**日期：** 2026-05-28

---

## 1. 产品概述

### 1.1 项目背景
基于OpenCode平台构建的AI项目经理插件，解决传统Vibe Coding缺乏整体规划、需求频繁变更、上下文污染导致AI编程幻觉和Bug频发的问题。通过编排多个专业subagent，按照TDD驱动和文档驱动的工程化方法论，自动化执行从需求分析、架构设计、任务分配、编码实现到文档生成的全流程软件工程生命周期管理。

### 1.2 产品目标
- **目标 1**：实现从需求到交付的全流程自动化管理，减少人工介入，提升开发效率50%以上
- **目标 2**：通过TDD驱动开发和细粒度subagent分工，将AI编程幻觉和代码Bug降低80%
- **目标 3**：建立标准化的文档体系和工程规范，确保每个项目产出完整的需求文档、架构文档、测试用例和部署材料

### 1.3 核心设计理念
- **文档驱动**：每个阶段产出标准化文档，作为下一阶段的输入和交付物，确保信息可追溯
- **TDD先行**：先编写测试用例和验收标准，再实现代码，确保每个功能都有明确的质量标准
- **上下文隔离**：每个子任务使用独立的subagent和精简上下文，减少信息污染和编程幻觉
- **主从编排**：PM Agent作为主控编排者，调度各专业subagent协同工作，确保流程有序执行

### 1.4 术语表（Glossary）

| 术语 | 英文 | 定义 |
|------|------|------|
| AI项目经理 | AI Project Manager (IMPM) | 基于OpenCode的AI插件，通过编排subagent实现全流程软件工程管理 |
| 项目管理Agent | PM Agent | 主控Agent，负责流程编排、状态跟踪和subagent调度 |
| 商业分析Agent | BA Subagent | 负责需求分析和PRD文档编写 |
| 软件架构Agent | SA Subagent | 负责架构设计和架构文档编写 |
| 技术主管Agent | TL Subagent | 负责技术规格说明和任务清单生成 |
| 开发工程师Agent | DE/FE/BE Subagent | 分别负责通用、前端、后端代码实现 |
| 测试工程师Agent | TE Subagent | 负责测试用例编写和执行 |
| 代码搜索Agent | CS Subagent | 负责本地代码库查询 |
| 网络搜索Agent | WS Subagent | 负责三方包和中间件的文档查询 |
| 技术写作Agent | TW Subagent | 负责技术文档和注释编写 |
| 用户故事 | User Story | 以角色-功能-价值格式描述需求的标准化方法 |
| TDD | Test-Driven Development | 测试驱动开发，先写测试再写实现 |

---

## 2. 目标用户

| 用户角色 | 使用场景 | 核心诉求 |
|---------|---------|---------|
| AI开发者 | 通过OpenCode进行AI辅助编程 | 希望获得完整的工程化管理，避免碎片化编码和返工 |
| 技术负责人 | 管理项目全流程开发 | 希望标准化流程、自动化文档生成和可追溯的任务管理 |
| 独立开发者 | 从零开始构建项目 | 希望获得专业级工程化支持，无需手动管理需求和任务 |
| 团队管理者 | 评估和管理多个AI项目 | 希望标准化产出物，便于项目审查和质量控制 |

---

## 3. 用户故事（User Stories）

### US-001: /impm 命令入口与流程总控

**优先级：** 高
**关联需求：** 
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-001（启动调用）

#### 故事描述
- **作为** 开发者用户
- **我想要** 通过 `/impm` 命令（后跟提示词或需求文档路径）启动AI项目管理全流程
- **以便** 一键触发从需求分析到代码交付的完整工程化流程，无需手动调用各个步骤

#### 前置条件
- OpenCode平台已安装opencode-impm插件
- 当前工作目录为一个Git仓库
- 用户输入了有效的提示词或需求文档路径

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 用户在当前Git仓库目录下输入 `/impm 实现用户登录功能`，When PM Agent被触发启动，Then 系统自动创建一个新的Git分支，分支名基于当前时间戳或功能名称生成
- [ ] **AC2：** Given 用户输入 `/impm` 后跟一个不存在的文件路径，When PM Agent解析参数，Then 系统返回错误提示"需求文档路径不存在，请检查后重试"，流程终止
- [ ] **AC3：** Given 当前目录不是Git仓库时输入 `/impm` 命令，When PM Agent检查环境，Then 系统返回错误提示"当前目录不是Git仓库，请在Git仓库中运行/impm命令"

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 用户只输入 `/impm` 无任何参数 | 返回提示信息："请提供需求描述或需求文档路径，例如 /impm 实现用户登录功能" |
| 提示词中包含特殊字符 | 正常解析并传递给需求生成流程，不做过滤 |
| /impm命令执行过程中用户中断 | 已生成的分支保留，已产生的文档不丢失，可手动恢复 |

#### 交付物
- `src/index.ts`（插件入口，注册/impm命令）
- `.opencode/agents/pm-agent.md`（PM Agent配置）

#### 备注
- /impm命令的实现依赖于OpenCode的Command API
- PM Agent负责流程总控，需要预定义所有subagent的调用方式

---

### US-002: 标准化文档目录与版本管理

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-002（项目初始化与文档目录创建）

#### 故事描述
- **作为** 开发者用户
- **我想要** 系统自动创建标准化的文档目录结构（docs/requires/、docs/prds/、docs/sds/、docs/tasks/、docs/），并提供统一的文档读写和版本管理工具
- **以便** 所有工程文档按规范存储，版本号可追溯，后续流程工具能自动定位和读取所需文档

#### 前置条件
- /impm命令已启动，PM Agent已就绪

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given PM Agent首次启动一个项目，When 执行目录初始化步骤，Then 自动创建 `docs/`、`docs/requires/`、`docs/prds/`、`docs/sds/`、`docs/tasks/` 目录（如不存在）
- [ ] **AC2：** Given 需要读取需求文档，When 调用文档读取工具（doc-reader），指定文档类型为requirement和版本号，Then 工具从 `docs/requires/` 目录下找到对应文件并返回完整内容
- [ ] **AC3：** Given 需要保存新生成的文档，When 调用文档写入工具（doc-writer），指定文档类型和内容，Then 工具将文件保存到 `docs/{docType}/` 目录下，文件名格式为 `{projectName}-{docType}-v{version}.md`

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 文档目录已存在（非首次运行） | 跳过创建步骤，不覆盖现有目录 |
| 指定的文档版本号不存在 | 返回错误提示，列出当前目录下所有可用版本 |
| 文档写入时目录权限不足 | 返回错误信息并提示用户检查目录权限 |
| 文件名冲突（相同版本号已存在） | 询问用户是否覆盖，或自动在修订号上递增 |

#### 交付物
- `src/tools/doc-reader.ts`（文档读取工具）
- `src/tools/doc-writer.ts`（文档写入工具）
- `src/tools/doc-version.ts`（版本号管理工具）
- `src/utils/paths.ts`（路径常量与工具函数）
- `src/utils/version.ts`（版本号解析与计算工具）

#### 备注
- 版本号管理采用语义化版本（SemVer）：主版本.次版本.修订号（如 v0.1.0）
- 首次运行时版本号默认为 v0.0.1，后续根据规则自动递增

---

### US-003: 项目分析与 project.md 自动管理

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-003（project.md生成与更新）

#### 故事描述
- **作为** 开发者用户
- **我想要** SA Subagent自动扫描项目源代码，生成或更新 `project.md` 文档（包含项目信息、编码规范和项目地图）
- **以便** 所有参与者（人类和AI）都能快速了解项目结构、编码风格和文件组织

#### 前置条件
- 文档目录已创建
- 项目源代码已存在或初步搭建

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 项目尚不存在 `project.md`，When SA Subagent执行 `impm-project-update` 技能，Then 根据 `PROJECT-TEMPLATE.MD` 模板生成完整的 `project.md`，包含Project Info、Coding Conventions和Project Map三部分
- [ ] **AC2：** Given `project.md` 已存在且项目代码有变更，When SA Subagent执行更新，Then 保留Project Info和Coding Conventions部分，仅更新Project Map部分（扫描所有源代码文件，列出每个文件及函数的一句描述）
- [ ] **AC3：** Given 项目中新增了源代码文件，When 执行项目分析扫描，Then Project Map中新增文件条目及其函数列表，已有文件的变化同步更新

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 项目没有源代码文件 | Project Map部分显示"暂无源代码文件"，不报错 |
| 存在大量文件（超过100个） | 完整扫描所有文件，按目录层级分组生成地图，不作截断 |
| 文件包含非标准注释格式 | 尽可能提取有效描述，无法提取时使用文件名作为默认描述 |
| 编码规范部分信息不明确 | 询问用户补充完整，首次创建时三个部分都要完整生成 |

#### 交付物
- `docs/project.md`（项目信息文档）
- `src/tools/project-analyzer.ts`（项目分析工具）
- `.opencode/skills/impm-project-update/SKILL.md`（技能实现）

#### 备注
- Project Map需要覆盖所有子目录下的源代码文件
- 每个函数/类都需要一句简短描述

---

### US-004: 需求文档自动生成

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-004（需求文档生成）

#### 故事描述
- **作为** 开发者用户
- **我想要** BA Subagent自动分析我的提示词和已有需求文档，合并生成结构化的需求文档（包含项目背景、功能需求、非功能需求、约束条件、假设与依赖）
- **以便** 需求被系统化地记录和管理，作为后续PRD和架构设计的可靠输入

#### 前置条件
- `project.md` 已生成
- 用户提供了有效的提示词或需求文档路径

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 用户输入 `/impm 实现用户认证系统`，When BA Subagent执行 `impm-req-create` 技能，Then 生成结构化的需求文档，文档格式遵循标准模板，包含项目背景、功能需求、非功能需求等章节
- [ ] **AC2：** Given 用户提供了需求文档路径和补充提示词，When BA Subagent合并两者内容，Then 生成的文档包含提示词中的新增内容，并与文档中的现有内容无缝整合
- [ ] **AC3：** Given 没有指定版本号且 `docs/requires/` 目录下已有其他版本的需求文档，When BA Subagent确定版本号，Then 读取最大版本号并在修订号上加1作为新版本号

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 提示词只有一句话，信息不充分 | 尽可能生成结构化文档框架，标注未明确的字段并询问用户补充 |
| 需求文档路径和提示词内容冲突 | 以提示词为优先，标记冲突点并说明原因 |
| `docs/requires/` 目录为空 | 使用默认版本号 v0.0.1 开始 |
| 用户既无提示词也无文档路径 | 返回提示："请提供需求描述或需求文档路径" |

#### 交付物
- `docs/requires/{项目名称}-requirement-v{版本号}.md`（需求文档）
- `.opencode/skills/impm-req-create/SKILL.md`（技能实现）

#### 备注
- 需求文档是后续所有步骤的源头，必须确保结构完整
- 版本号管理需与doc-version工具联动

---

### US-005: PRD文档自动生成

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-005（PRD文档生成）

#### 故事描述
- **作为** 开发者用户
- **我想要** BA Subagent根据已生成的需求文档和 `project.md`，自动生成UserStory格式的PRD文档（包含产品概述、目标用户、用户故事、非功能性需求）
- **以便** 需求转化为可执行、可测试的用户故事，为后续架构设计和任务分解提供依据

#### 前置条件
- 需求文档已生成并保存到 `docs/requires/` 目录
- `project.md` 已存在

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 需求文档已就绪，When BA Subagent执行 `impm-prd-create` 技能，Then 生成PRD文档，包含产品概述、目标用户、至少3个UserStory、非功能性需求章节
- [ ] **AC2：** Given PRD中的UserStory，When 检查格式，Then 每个UserStory包含唯一编号（US-001格式）、角色-功能-价值描述、Given-When-Then格式的验收标准、前置条件和边界情况表格
- [ ] **AC3：** Given PRD文档中的UserStory，When 检查与需求文档的关联，Then 每个US都关联到对应的功能需求编号（FR-NNN）

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 需求文档内容太少，不足以生成完整的UserStory | 生成基础的故事框架，标注需要补充的需求细节并向用户提问 |
| 需求文档中有相互矛盾的需求 | 在PRD中标注冲突点，生成多个可选故事版本供用户决策 |
| 需求文档版本号与当前版本不匹配 | 使用需求文档实际版本号，保持一致 |

#### 交付物
- `docs/prds/{项目名称}-prd-v{版本号}.md`（PRD文档）
- `.opencode/skills/impm-prd-create/SKILL.md`（技能实现）

#### 备注
- PRD中的用户故事必须与需求文档的功能需求一一对应
- Given-When-Then格式的验收标准必须具体、可测试

---

### US-006: 架构文档自动生成与更新

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-006（架构文档生成）

#### 故事描述
- **作为** 开发者用户
- **我想要** SA Subagent根据PRD和 `project.md` 自动生成或更新架构文档（包含系统架构图、模块划分、技术选型、数据流设计）
- **以便** 系统整体架构清晰记录，技术方案有据可依，后续编码有架构指引

#### 前置条件
- PRD文档已生成
- `project.md` 已存在

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given PRD文档和 `project.md` 已就绪但尚无架构文档，When SA Subagent执行 `impm-architect-update` 技能，Then 生成完整的 `architecture.md`，包含技术栈选择、模块架构、目录结构设计、数据流说明
- [ ] **AC2：** Given 已有 `architecture.md` 且PRD中有新的UserStory涉及架构变更，When SA Subagent执行更新，Then 在保留原有架构内容的基础上，新增或修改受影响的部分
- [ ] **AC3：** Given 需要确定某个第三方库的技术细节，When SA Subagent调用网络搜索工具，Then 获取官方文档信息并作为架构决策的依据

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| PRD中没有涉及架构变更 | 跳过架构文档生成步骤，通知用户"本次不涉及架构变更" |
| 项目需要多个技术栈决策 | 逐一分析每个决策点，必要时分多次查询网络文档 |
| 架构决策与现有代码冲突 | 标注差异点和迁移方案，供用户决策 |

#### 交付物
- `docs/architecture.md`（架构文档）
- `.opencode/skills/impm-architect-update/SKILL.md`（技能实现）

#### 备注
- 架构文档需要涉及工具层（doc-reader等7个工具）和流程编排层的架构设计
- 首次生成时覆盖完整架构，后续更新采用增量方式

---

### US-007: 技术规格说明与任务清单自动生成

**优先级：** 中
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-007（技术规格说明生成）、FR-008（任务清单生成）

#### 故事描述
- **作为** 开发者用户
- **我想要** TL Subagent根据PRD和架构文档，自动生成技术规格说明（sds）和可执行的细粒度任务清单（MD+JSON格式，包含任务状态、依赖关系、验收标准）
- **以便** 编码工作有明确的技术方案指引和可追踪的任务管理

#### 前置条件
- PRD文档和架构文档已就绪

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given PRD和架构文档已就绪，When TL Subagent执行 `impm-sds-create` 技能，Then 生成技术规格说明文档，包含每个模块的接口定义、数据模型、技术约束
- [ ] **AC2：** Given sds已生成，When TL Subagent执行 `impm-task-create` 技能，Then 同时生成 `docs/tasks/{项目名称}-task-v{版本号}.md` 和 `docs/tasks/{项目名称}-task-v{版本号}.json` 两个文件
- [ ] **AC3：** Given 任务清单已生成，When 检查任务格式，Then 每个主任务包含任务代码、上下游关系、前端/后端/通用标注、状态（未完成/执行中/已完成）、对应的UserStory编号、测试方法和验收标准

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 某个UserStory需要拆分为多个主任务 | 一个US对应多个主任务，每个主任务标注对应的US编号 |
| 任务之间存在复杂依赖 | 使用上下游关系字段标注，PM Agent按依赖顺序调度执行 |
| 需要引用外部包或三方库 | 通过网络搜索查询官方文档，收集足够信息后再写入任务 |
| JSON格式的任务清单需要持久化状态 | 每次任务状态更新时同步写入JSON文件，保持状态持久化 |

#### 交付物
- `docs/sds/{项目名称}-sds-v{版本号}.md`（技术规格说明）
- `docs/tasks/{项目名称}-task-v{版本号}.md`（任务清单MD）
- `docs/tasks/{项目名称}-task-v{版本号}.json`（任务清单JSON）
- `src/tools/task-manager.ts`（任务状态管理工具）
- `.opencode/skills/impm-sds-create/SKILL.md`（技能实现）
- `.opencode/skills/impm-task-create/SKILL.md`（技能实现）

#### 备注
- MD文件给人阅读，JSON文件给程序处理
- 任务状态由task-manager工具统一管理

---

### US-008: 多Agent TDD驱动编码执行

**优先级：** 高
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-009（多Agent TDD驱动编码）

#### 故事描述
- **作为** 开发者用户
- **我想要** PM Agent按任务依赖顺序调度多个专业Subagent（CS搜索代码、WS搜索网络文档、TE编写测试、DE/FE/BE实现代码、TW添加注释）执行TDD驱动的编码
- **以便** 每个任务在干净的上下文中以测试驱动方式完成，确保代码质量和可维护性

#### 前置条件
- 任务清单已生成且至少有一个任务状态为"未完成"

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 一个"未完成"的编码任务，When PM Agent调度执行，Then 先启动CS Subagent搜索本地相关代码，再启动WS Subagent查询所需三方包文档
- [ ] **AC2：** Given CS和WS已收集完上下文信息，When TE Subagent开始工作，Then 根据收集的信息编写测试用例和测试代码，测试代码覆盖正常流程、边界条件和错误场景
- [ ] **AC3：** Given 测试用例已编写完成，When DE/FE/BE Subagent收到测试和上下文，Then 编写实现代码，确保所有测试通过；如果测试不通过，则将失败信息带回上下文重新编码，直到全部通过
- [ ] **AC4：** Given 编码全部通过测试，When TW Subagent添加代码注释，Then 注释使用简体中文，公共API使用JSDoc格式，复杂逻辑添加行内注释

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 测试持续失败（超过3次重试） | 记录失败详情，标记任务为"受阻"，通知PM Agent人工介入 |
| 任务之间有前置依赖未完成 | 跳过当前任务，按依赖顺序重新调度，只执行前置已完成的后续任务 |
| 三方包文档不完整 | 使用已知稳定版本的API，标注不确定性点 |
| 本地代码搜索无结果 | 返回"未找到相关代码"信息，WS仍正常运行提供外部信息 |

#### 交付物
- `src/tools/context-builder.ts`（上下文构建工具）
- `src/tools/git-helper.ts`（Git操作工具）
- `.opencode/skills/impm-coding/SKILL.md`（技能实现）

#### 备注
- 此用户故事对应最复杂的流程，涉及6个subagent的协作
- TDD流程必须严格执行：先测试后编码，测试通过才算完成
- 每次编码只读取本次任务必要的上下文，避免上下文污染

---

### US-009: 项目文档与注释自动生成

**优先级：** 中
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-010（文档与注释编写）

#### 故事描述
- **作为** 开发者用户
- **我想要** TW Subagent在所有编码任务完成后，自动生成README、部署文档、环境配置手册等项目文档，并确保所有代码注释完整规范
- **以便** 项目对外可读、可部署、可维护，降低知识传递成本

#### 前置条件
- 所有编码任务已完成并提交到Git

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given 所有编码任务已完成，When TW Subagent执行 `impm-doc-update` 技能，Then 生成 `README.md`，包含项目简介、快速开始、开发指南和部署说明
- [ ] **AC2：** Given 项目需要部署配置，When 生成部署文档，Then 包含环境依赖列表、环境变量说明、构建和启动命令
- [ ] **AC3：** Given 所有文档和注释已生成完毕，When TW Subagent提交到Git，Then 所有变更提交到当前分支

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 项目没有明显的部署需求 | 生成基础的开发环境配置文档，不强制生成部署手册 |
| README已存在（非首次生成） | 在现有基础上更新，不覆盖用户自定义内容 |
| Git提交被hooks拒绝 | 修正问题后重新提交，不强制跳过hooks |

#### 交付物
- `README.md`（项目自述文件）
- `docs/deploy-guide.md`（部署文档，如需要）
- `.opencode/skills/impm-doc-update/SKILL.md`（技能实现）

#### 备注
- 文档语种根据 `project.md` 中的本地语言设置（简体中文）
- 所有代码注释必须符合 `project.md` 中的注释规范

---

### US-010: Git分支管理与版本控制集成

**优先级：** 中
**关联需求：**
- 需求文档：docs/requires/opencode-impm-requirement-v0.1.0.md
- 需求编号：FR-001（启动调用 - 分支创建）、FR-010（文档编写 - 提交合并）

#### 故事描述
- **作为** 开发者用户
- **我想要** PM Agent在流程中自动管理Git分支（启动时创建功能分支，编码完成后提交代码，最终合并回主分支）
- **以便** 每次迭代的变更可追溯、可回滚，代码管理符合Git最佳实践

#### 前置条件
- 当前目录为Git仓库
- /impm命令已启动

#### 验收标准（Acceptance Criteria）

- [ ] **AC1：** Given `/impm` 命令启动，When PM Agent初始化流程，Then 创建一个新的Git分支，分支名格式为 `impm/{功能简述}-{时间戳}`，并切换到该分支
- [ ] **AC2：** Given 单个编码任务完成并通过测试，When 提交代码到Git，Then 使用清晰的提交信息格式（`[{任务编号}] {变更描述}`），仅暂存该任务相关的文件
- [ ] **AC3：** Given 所有任务完成且文档生成完毕，When 进入完成阶段，Then 合并功能分支到主分支（或创建PR）

#### 边界情况与错误处理
| 场景 | 预期行为 |
|------|---------|
| 分支名已存在 | 在分支名后添加递增序号，如 `impm/feature-1` |
| 合并时发生冲突 | 停止流程，提示用户手动解决冲突后继续 |
| 中间提交时文件已变更 | 先拉取最新代码，再尝试提交 |
| 用户不希望创建分支 | 提供一个配置选项，允许直接在主分支上工作 |

#### 交付物
- `src/utils/git.ts`（Git工具函数集）
- `src/tools/git-helper.ts`（Git操作工具）

#### 备注
- Git操作封装在工具中，不直接对外暴露
- 分支策略可通过配置调整

---

## 4. 非功能性需求（Non-Functional Requirements）

### 4.1 性能
- 文档读取工具响应时间 < 500ms（本地文件系统）
- 项目分析工具扫描100个文件以内完成时间 < 30s
- 每次Subagent上下文构建时间 < 5s

### 4.2 可用性
- 所有文档和输出内容使用简体中文
- 错误信息使用中文描述，清晰指明问题和解决方案
- 流程中的每一步都有日志输出，让用户了解当前进度

### 4.3 可靠性
- 文档写入采用原子操作（先写临时文件，再重命名），防止写入中断导致文件损坏
- 版本号管理支持并发安全（同一时间不会生成两个相同版本号）
- 外部查询（网络搜索）设置超时机制，默认超时时间为30s

### 4.4 安全性
- 不读取 `.env`、`credentials` 等敏感文件
- Git操作不存储用户凭证，依赖系统已配置的Git认证
- 网络搜索仅查询三方库官方文档，不发送项目代码

### 4.5 可维护性
- 代码遵循 `project.md` 中的编码规范：使用TypeScript、ESM模块、2空格缩进、camelCase命名
- 每个工具函数独立文件，职责单一，便于测试和修改
- 公共API使用JSDoc注释，包含 `@param` 和 `@returns`
- 所有工具函数返回错误消息字符串，不抛出异常
- 使用Node.js内置模块，避免外部依赖

---

## 5. 附录

### 5.1 UserStory与功能需求对照表

| 用户故事 | 关联功能需求 | 对应技能 | 执行Subagent |
|---------|------------|---------|-------------|
| US-001: /impm命令入口与流程总控 | FR-001 启动调用 | - | PM Agent |
| US-002: 标准化文档目录与版本管理 | FR-002 项目初始化 | - | PM Agent/SA |
| US-003: 项目分析与project.md管理 | FR-003 project.md生成 | impm-project-update | SA |
| US-004: 需求文档自动生成 | FR-004 需求文档生成 | impm-req-create | BA |
| US-005: PRD文档自动生成 | FR-005 PRD文档生成 | impm-prd-create | BA |
| US-006: 架构文档生成与更新 | FR-006 架构文档生成 | impm-architect-update | SA |
| US-007: 技术规格与任务清单生成 | FR-007, FR-008 sds/task生成 | impm-sds-create, impm-task-create | TL |
| US-008: 多Agent TDD驱动编码执行 | FR-009 编码执行 | impm-coding | PM + CS/WS/TE/DE/FE/BE/TW |
| US-009: 项目文档与注释生成 | FR-010 文档编写 | impm-doc-update | TW |
| US-010: Git分支管理与版本控制集成 | FR-001, FR-010 Git操作 | - | PM |

### 5.2 项目文件结构总览

```
项目根目录/
├── .opencode/
│   ├── agents/                  # Agent配置
│   │   ├── pm-agent.md
│   │   ├── ba-subagent.md
│   │   ├── sa-subagent.md
│   │   ├── tl-subagent.md
│   │   ├── de-subagent.md
│   │   ├── fe-subagent.md
│   │   ├── be-subagent.md
│   │   ├── te-subagent.md
│   │   ├── cs-subagent.md
│   │   ├── ws-subagent.md
│   │   └── tw-subagent.md
│   └── skills/                  # 技能实现
│       ├── impm-project-update/SKILL.md
│       ├── impm-req-create/SKILL.md
│       ├── impm-prd-create/SKILL.md
│       ├── impm-architect-update/SKILL.md
│       ├── impm-sds-create/SKILL.md
│       ├── impm-task-create/SKILL.md
│       ├── impm-coding/SKILL.md
│       └── impm-doc-update/SKILL.md
├── docs/
│   ├── project.md               # 项目信息文档
│   ├── architecture.md          # 架构文档
│   ├── requires/                # 需求文档目录
│   ├── prds/                    # PRD文档目录
│   ├── sds/                   # 规格说明目录
│   └── tasks/                   # 任务清单目录
├── src/
│   ├── index.ts                 # 插件入口
│   ├── tools/                   # 工具函数
│   │   ├── doc-reader.ts
│   │   ├── doc-writer.ts
│   │   ├── doc-version.ts
│   │   ├── task-manager.ts
│   │   ├── project-analyzer.ts
│   │   ├── git-helper.ts
│   │   └── context-builder.ts
│   └── utils/                   # 通用工具
│       ├── paths.ts
│       ├── git.ts
│       └── version.ts
└── __tests__/                   # 单元测试目录
```
