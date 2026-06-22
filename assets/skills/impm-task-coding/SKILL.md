---
name: impm-task-coding
description: 执行编码 - 针对task实行TDD驱动的多agent协作编码
---

# impm-task-coding 技能

## 触发词
impm-task-coding

## 何时使用
- 任务清单生成完成后
- 需要执行具体编码任务时
- 每次针对一个任务执行

## 必要上下文输入
- 版本号
- 当前任务编号
- 如果必要输入不满足，需要直接询问用户

## 执行流程
**需要严格按照下列流程的步骤顺序执行。** 

### 步骤1：需求上下文信息收集
**执行方式：** 启动TL subagent（技术负责人），使用技能impm-task-coding-context 
**功能：** 读取与当前任务相关的需求和设计信息。
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md

### 步骤2：任务相关现有代码文档查询
**执行方式：** 启动CS subagent（本地代码查询），使用技能impm-task-coding-cs 
**功能：** 收集与当前任务关联的现有代码和文档的情况
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md

### 步骤3：任务相关网络信息查询
**执行方式：** 启动WS subagent（网络查询），使用技能impm-task-coding-ws
**功能：** 收集与当前任务关联的网络资料和文档，第三方包或中间件的文档。
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md

### 步骤4：编写数据库设计文档和数据库脚本
**执行方式：** 启动DBA subagent（数据库管理员），使用技能impm-task-coding-dbd
**功能：** 编写与本次任务相关的数据库设计文档和数据库脚本
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md 和 docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.sql

### 步骤5：接口设计
**执行方式：** 启动BE subagent（后端开发），使用技能impm-task-coding-interface
**功能：** 仅当有分前后端的业务需求且当前为后端任务时，设计本次任务需要对外提供的API接口。不满足条件则跳过。
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md

### 步骤6：编写测试用例、测试代码和预期结果
**执行方式：** 启动TE subagent（测试工程师），使用技能impm-task-coding-testcase
**功能：** 编写测试用例、测试代码和预期结果
**输出:** docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md

### 步骤7：根据任务类型选择编码agent完成代码编写
**执行方式：** 
- 前端任务 → 启动FE subagent，使用技能：impm-task-coding-code
- 后端任务 → 启动BE subagent，使用技能：impm-task-coding-code
- 通用任务 → 启动DE subagent，使用技能：impm-task-coding-code
**功能：**
- 根据当前版本前序流程生成的文档进行编码
- 编码前参考步骤5设计的 interface.md 接口定义，确保实现与接口一致

**输出:**
- 所有代码

### 步骤8：代码审核
**执行方式：** 启动TL subagent（技术负责人），使用技能impm-task-coding-review
**功能：** 审核代码的主要内容是否合适，格式是否正确，代码是否有可以优化的地方。
**输出:** 如果审核不通过，则回到本task任务的开头第一步，重新执行全部流程。如果连续5次不通过，放弃，中止任务并报错。

### 步骤9：测试验证
**执行方式：** 启动TE subagent（测试工程师），使用技能impm-task-coding-test
**功能：** 用之前的测试用例和测试代码，执行测试。
**输出:** 如果测试失败，则回到本task任务的开头第一步，重新执行全部流程。如果连续5次不通过，放弃，中止任务并报错。

### 步骤10：接口文档合并
**执行方式：** 启动BE subagent（后端开发），使用技能impm-task-coding-interfacemerge
**功能：** 仅当有分前后端的业务需求且当前为后端任务时，将本次设计的接口合并入全局接口文档：/docs/interface.md。不满足条件则跳过。
**输出:** /docs/interface.md

### 步骤11：代码注释
**执行方式：** 启动TW subagent（技术文档编写），使用技能impm-task-coding-comment
**功能：** 为代码提供详尽的注释说明
**输出:** 所有代码的注释

### 步骤12：更新项目地图
**执行方式：** 启动SA subagent（架构师），使用技能impm-task-coding-projectmap
**功能：** 将本次新增和更新的目录、文件和函数全部写入project.md的项目地图中
**输出:** 更新project.md

上述步骤完成后，更新任务状态为"已完成"，返回impm-coding技能处进行下一个task处理。

## 交付物
- 通过测试的代码
- 代码注释
- git提交记录
- 更新的任务状态

## 注意事项
- 严格遵守TDD流程：先写测试，再写代码
- 编码agent只接收必要的上下文，避免信息过载
- 测试失败时不要跳过，必须修复后才能继续
- 代码注释使用简体中文
- 每个阶段使用独立的subagent，保证上下文隔离

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 退出当前技能，回到impm-coding技能。继续执行下一个task。
2. **执行后续所有步骤** — 退出当前技能，回到impm-coding技能。继续按顺序逐一执行后续所有task。并执行后续操作。

<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->