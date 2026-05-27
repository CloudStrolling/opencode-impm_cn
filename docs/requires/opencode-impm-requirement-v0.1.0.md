# 项目简介

**项目名称：** 我是项目经理
**项目英文名称：** opencode-impm
**项目类型：** opencode插件
**项目语言：** js,ts
**本地语言:** 简体中文，所有的文档，代码备注，AI的思考过程，回复内容以及其他返回的文字信息都要用简体中文。

**项目业务流程：**

1. AI项目经理先通过详细的需求文档和前期的需求收集阶段获取完整的需求，后续不需要再人工参与。然后整体规划系统，创建架构文档，需求文档和任务清单。根据任务清单逐一完成任务，最后补充文档和注释。
2. 在具体开发中使用Test-Driven Development的方式和遵守工程化和规范化的流程，保证开发质量高，文档齐全，代码可阅读性高。
3. 细颗粒的任务清单，使用subagent编写代码，保证上下文干净，减少编程幻觉和代码bug。
4. 每个工程步骤和子任务都采用独立的subagent和上下文，步骤之间用交付物对接，只读取本次步骤必要的材料，保证上下文干净，减少编程幻觉和代码bug。

反对Vibe Coding没有整体规划，一边做一边改需求。导致总体效率低下，交互频繁，增加工作强度和压力。

---

# 核心流程与最佳实践：

## 1.启动调用：

通过 /impm 命令调用。
/impm 命令会自动启动PM Agent，PM Agent作为主agent，负责流程调度和启动其他subagent。
/impm 后面跟本次提示词，或者本次需求文档的地址。或者混合提示词或需求文档。
然后用git创建一个新的分支，作为当前修改的分支使用。

## 2.生成或更新project.md文档

/impm 命令启动后，首先启SA的subagent，执行impm-project-update技能。：

1. 这个技能主要是生成：project.md。
2. 首先判断是否存在如下文件夹，如果不存在就创建：

- docs
- docs/specs
- docs/requires
- docs/tasks
- docs/prds

3. 判断project.md是否存在，如果没有，根据\template\PROJECT-TEMPLATE.MD 模版生成。如果有的话，在现有基础上更新。
4. project.md包括3个部分：Project Info,Coding Conventions,Project Map。
5. Project Info：项目信息，请按模版内容填写。如果有未明确的内容，通过询问客户补充完整。
6. Coding Conventions：编码规范，根据编程语言生成行业约定俗成的规范，内容尽可能简明扼要。
7. Project Map： 项目内所有源代码文件和文件下的所有函数，每个用一句话描述。
8. 首次创建project.md时，三个部分都要创建。如果已存在project.md，则只更新project map
9. project.md生成完成后，SA subagent结束退出。PM agent等BA subagent退出后继续后续步骤。

后继步骤：生成需求文档

## 3.生成需求文档

前序步骤：生成project.md

PM agent 调用impm-req-create技能。技能内容：

1. 启动BA subagent。
2. 首先读取：本次提示词和提示词中提到的需求文档。
3. 将这些内容合并，按照需求文档的格式要求整理成一个完整的MD文档。
4. 文档版本确认：

- 如果提示词或提示词提到的需求文档的标题或者文档内部有版本号，就按这个版本号来。
- 如果提示词这里没有版本号，则读取docs/requires目录下的所有文件，取版本号最大的文件的版本号，然后三级小版本号上再加1。如果requires目录下没有文件，就取默认初始版本号v0.0.1
- 后续所有的文档版本号，和程序的版本号。都根据这个版本号来。

5. 将需求文件保存到docs/requires/{项目名称}-requirement-v{x.x.x}.MD 项目名称为project.md中的项目名称，版本号为前面提供的版本号。
6. BA subagent返回本次生成的文档位置后退出，PM agent继续后续步骤。

后继步骤：生成PRD文档

## 4.生成PRD文档

前序步骤：生成需求文档

PM agent 调用impm-prd-create技能。技能内容：

1. 启动BA subagent。
2. 首先读取前序生成的requirement文件和project.md文件，生成格式内容完整的PRD文档。
3. PRD采用UserStory的方式记录。每个UserStory都要有自己的编号。
4. 如果在生成PRD的过程中，有什么需要明确的需求细节，可以直接向用户提问。直至需求细节全部清晰。
5. prd文件保存到docs/prds/{项目名称}-prd-v{x.x.x}.MD 项目名称为project.md中的项目名称，版本号为前面确认的版本号。
6. BA subagent返回本次生成的文档位置后退出，PM agent继续后续步骤。

后继步骤：生成架构文件

## 5.生成架构文档

前序步骤：生成PRD文档

PM在主流程里判断：

1. 是否有doc/architect.md 如果不存在,则调用impm-architect‌-update技能。
2. 如果存在，前序生成PRD的内容是否涉及架构变更，如果涉及，则调用impm-architect‌-create技能。
3. 如果已有架构文件，并且本次不涉及架构变更，则跳过当前流程继续后续步骤。

调用impm-architect‌-update技能。技能内容：

1. 启动SA subagent。
2. 根据前序流程生成的PRD，project.md和当前的architect.md（如果有），生成新版的架构文件。
3. 如果在生成architect.md的过程中，有什么需要明确的架构要求，可以直接向用户提问。直至所需的细节全部清晰。
4. 如果在生成architect.md的过程中，需要查询相关信息，可以直接调用网络查询的MCP进行网络查询。
5. 保存或更新到architect.md。然后 BA subagent退出，PM agent继续后续步骤。

后继步骤：生成spec文件

## 6.生成spec

前序步骤：生成PRD文件或架构文档

调用impm-spec-create技能。技能内容：

1. 启动TL subagent。
2. PRD，project.md 和 architect.md，生成spec。
3. spec文件存放在：docs/tasks/{项目名称}-spec-v{x.x.x}.MD
4. 如果在生成spec的过程中，有什么需要明确的需求，可以直接向用户提问。直至所需的细节全部清晰。
5. spec生成完毕后，TL subagent退出，PM agent继续后续步骤。

后继步骤：生成任务文件

## 7.生成任务(task)文件

前序步骤：生成spec

PM在主流程里调用impm-task-create技能。技能内容：

1. 启动TL subagent。
2. 根据前序流程生成的PRD，project.md和architect.md，生成任务清单文件。任务清单文件包括两个，一个是：{项目名称}-task-v{x.x.x}.MD，一个是{项目名称}-task-v{x.x.x}.json，都放在docs/tasks目录下。
3. 任务可以根据实际需要，有主任务和子任务。任务清单可以有多个主任务，每个主任务可以有多个子任务。每个任务都有一个任务代码
4. 如果主任务之间存在前置和后续的关系，需要标注上下游关系。
5. 标注任务和PRD中，UserStory之间的对应关系。
6. 主任务需要标注是前端任务，后端任务还是通用代码任务。
7. 任务需要写清测试方法和验收标准。
8. 每个主任务都要有状态字段，默认是未完成，取值有未完成，执行中和已完成。
9. 对于引用其他代码或者外部的包，通过搜索本地代码和网上查询外部包的文档，收集足够信息，有把握想清楚后在写任务。
10. 有必要时可以询问用户问题，以澄清需求与架构设计未涉及到的内容。
11. 任务清单文件生成后，TL subagent退出，PM agent继续后续步骤。

后继步骤：执行代码变更。

## 7.执行代码变更

前序步骤：生成任务文件

1. PM从任务清单:{项目名称}-task-v{x.x.x}.json 里，查询所有状态是未完成和执行中的主任务清单。
2. 根据任务的上下游关系和任务间的逻辑关系，重要程度，对主任务排序。
3. 对主任务清单的任务，逐一调用impm-coding技能，完成编码，测试，审核等工作。每次完成后更新主任务的完成状态。
4. 待所有任务完成后。继续下一步

### impm-coding技能：

PM先启用CS和WS三个subagent，负责收集有用信息。
CS subagent

1. 首先根据本次版本号和任务编号，查询对应的PRD和任务信息。
2. 读取架构文档，项目信息文档和代码规范文档中，与本次编码任务相关的部分文档
   WS subagent
   1、首先分析本次编码需要使用到的三方包或者中间件，
   2、在线搜索对应的官方文档中需要使用到的部分。

然后启用TE，将CS和WS获取的内容作为上下文，编写测试用例，测试代码和预期结果。

再然后PM根据当前task的类型，是前端任务，后端任务还是通用代码任务，决定启用FE，BE还是DE subagent。
将CS和WS获取的内容作为上下文传入具体的编码Agent。
编码Agent返回编码完成后，再启用TE，测试代码是否正常工作。如果代码出错或者结论不正确，将结论加入上下文，重新启动编码agent更新代码，直至测试通过。
测试通过以后，调用TW，给代码加上详细的注释，代码注释的语种根据project.md的本地语种为准。
注释添加完成后，将代码提交到git

后续步骤：文档与注释编写。

## 8.文档与注释编写

前序步骤：执行代码变更

启动TW subagent，调用impm-doc-update技能：

1. 读取project.md对于本地语言的设置。
2. 根据本地语言，生成 readme.md, agent.md ,编译，环境配置和部署手册和部署脚本等文件材料。
3. 提交git并合并到主分支。
4. 完成所有任务，返回PM agent并结束流程

后续步骤：无。

---

# 产出物与功能清单：

## **agent：**

| Agent名称 |          角色          |                  能力                   |
| :-------: | :--------------------: | :-------------------------------------: |
|    PM     |    Project Manager     |        分析并编排，调用其他Agent        |
|    BA     |    Business Analyst    |      产生需求分析文档和user story       |
|    SA     |  Software Architect‌   |      生成架构文档和搭建环境和架构       |
|    TL     |       Tech Lead        |           生成spec，审核代码            |
|    DE     | Development Engineer‌  |  代码实现、代码修改、执行命令（通用）   |
|    FE     |       Front End        |        创意专家。UI/UX、前端工作        |
|    BE     |        Back End        | 后端工程师，负责Web应用的前端与后端接口 |
|    TE     |     Test Engineer‌     |               测试工程师                |
|    DBA    | Database Administrator |              数据库管理员               |
|    CS     |     Code Searcher      |             本地代码库查询              |
|    WS     |      Web Searcher      |    所用三方包和中间件的网络文档查询     |
|    TW     |    Technical Writer    |              技术文档编写               |

注：只有PM是agent，其他都是subagent

## **command：**

| 命令名称 |      命令中文名称      |                功能与作用                |
| :------: | :--------------------: | :--------------------------------------: |
|  /impm   | impm软件工程全流程开发 | 完整按impm全流程工程式开发，从需求到上线 |
|          |                        |

## **skills：**

|        技能名称        |     中文技能名称      |         触发词         |                                            功能与作用                                            |
| :--------------------: | :-------------------: | :--------------------: | :----------------------------------------------------------------------------------------------: |
|  impm-project-update   | 创建或更新 project.md |       impm-init        |                                      创建或更新 project.md                                       |
|    impm-req-create     |     创建需求文档      |    impm-req-create     |                                 根据提示词生成带版本号的需求文档                                 |
|    impm-prd-create     |      创建prd文档      |    impm-prd-create     |                                    根据需求文档生成prd文档。                                     |
| impm-architect‌-update |  创建或更新架构文件   | impm-architect‌-update |                      根据需求文档和 project.md，创建或更新 ARCHITECTURE.md                       |
|    impm-spec-create    |       创建spec        |    impm-spec-create    | 根据输入的prd文件,架构文件，project文件，生成对应版本的spec docs/specs/{项目名称}-spec-vx.x.x.md |
|    impm-task-create    |       创建task        |    impm-task-create    |     根据架构文件，project文件，spec文件，生成对应版本的docs/tasks/{项目名称}-task-vx.x.x.md      |
|      impm-coding       |       执行编码        |      impm-coding       |                             针对task实行编码，多agent，TDD驱动的编码                             |
|    impm-doc-update     |       执行编码        |    impm-doc-update     |                                         更新项目相关文档                                         |
