<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

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

### 阶段1：信息收集

#### 启动TL subagent（技术负责人）
1. 使用技能：impm-task-coding-context
2. 根据当前版本号和任务编号，查询对应的PRD和task信息
3. 读取architecture.md、project.md和sds中与本次任务相关的部分

#### 启动CS subagent（代码搜索）
1. 使用技能：impm-task-coding-cs
2. 根据当前版本号和任务编号，查询对应的PRD和task信息
3. 读取architecture.md、project.md和sds中与本次任务相关的部分
4. 收集与当前任务关联的现有代码和文档的情况

#### 启动WS subagent（网络搜索）
1. 使用技能：impm-task-coding-ws
2. 分析本次编码需要使用到的第三方包或中间件
3. 在线搜索对应的官方文档中需要使用到的部分
4. 收集与当前任务关联的网络资料和文档

### 阶段2：数据库设计

#### 启动DBA subagent（数据库管理员）
1. 使用技能：impm-task-coding-dbd
2. 根据PRD、task信息及CS、WS获取的内容作为上下文
3. 编写数据库设计文档和数据库脚本
4. 如有数据库变更，执行数据库脚本

### 阶段3：测试驱动开发（TDD第一阶段）

#### 启动TE subagent（测试工程师）
1. 使用技能：impm-task-coding-testcase
2. 将PRD和task信息内容，CS、WS、DBA获取的内容作为上下文
3. 编写测试用例、测试代码和预期结果
4. 测试代码应在此阶段无法通过（功能代码尚未实现）
5. 测试用例文档按照技能 impm-task-coding-testcase 的规范写入对应路径

### 阶段4：编码实现

#### 根据任务类型选择编码agent
- 前端任务 → 启动FE subagent，使用技能：impm-task-coding-code
- 后端任务 → 启动BE subagent，使用技能：impm-task-coding-code
- 通用任务 → 启动DE subagent，使用技能：impm-task-coding-code

1. 将对应的PRD和task信息，CS、WS、DBA获取的内容作为上下文传入编码agent
2. 编码agent同时读取architecture.md、project.md和sds
3. 前端任务还需要读取interface.md的接口信息。
4. 编码agent根据获取的上述信息，完成编码
5. 【后端任务】编码agent中的 impm-task-coding-code 技能会在编码前先设计接口文档（interface.md），编码后再进行接口实现

### 阶段5：测试验证（TDD第二阶段）

#### 启动TE subagent（测试工程师）
1. 使用技能：impm-task-coding-test
2. 执行阶段3编写的测试
3. 如测试通过，进入下一阶段
4. 如测试失败：
   - 将错误信息加入上下文
   - 回退到阶段1重新启动信息收集和编码修复代码
   - 再次测试，直到通过
   - 如果连续5次不通过，放弃，中止任务并报错

### 阶段6：代码审核

#### 启动TL subagent（技术负责人）
1. 使用技能：impm-task-coding-review
2. 根据project.md中的本地语言设置
3. 审核代码的主要内容是否合适
4. 注释语种使用简体中文

### 阶段7：接口文档更新

#### 由PM直接执行（或启动对应subagent）
1. 仅后端任务需执行本阶段
2. 使用技能：impm-task-coding-interface
3. 读取本次任务编写的接口文档：docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md
4. 将本次更新的接口合并入全局接口文档：/docs/interface.md（如文件不存在则创建）
5. 确保不删除其他已有模块的接口定义

### 阶段8：代码注释

#### 启动TW subagent（技术文档编写）
1. 使用技能：impm-task-coding-comment
2. 根据project.md中的本地语言设置
3. 为代码添加详细的注释
4. 注释语种使用简体中文

### 阶段9：更新项目地图

#### 启动SA subagent（架构师）
1. 使用技能：impm-task-coding-projectmap（注：此技能需先创建该目录及SKILL.md文件后方可使用）
2. 根据project.md中的本地语言设置
3. 将本次新增和更新的目录、文件和函数全部写入project.md的项目地图中
4. 注释语种使用简体中文

### 阶段10：提交代码

#### 启动VCA subagent（版本控制管理员）
1. 使用技能：impm-task-coding-gitcommit
2. 提交代码到git
3. 使用impm_task_manager更新任务状态为"已完成"

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
1. **执行下一步** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，继续执行下一个阶段
2. **执行后续所有步骤** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，自动执行从下一个阶段开始的所有剩余阶段
