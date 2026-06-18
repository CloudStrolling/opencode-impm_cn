---
name: impm-task-coding-code
description: 执行编码6 - 任务程序编写
---

# impm-task-coding-code 技能

## 触发词
impm-task-coding-code

## 何时使用
- 针对一个任务进行具体编码的第六步：任务程序编写

## 执行内容
1. PM读取task的类型：前端任务，后端任务还是通用编程任务。根据不同类型，启动不同的subagent。前端任务启用：FE，后端任务启用BE，通用任务启用DE
2. subagent启动后，按版本号和任务号找到并读取此前生成的参考文件：
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/review.md（如有）
  - docs/project.md
  大括号中的内容分别是版本号和任务编号。
3. 【前端任务接口参考】如果本任务是前端任务（FE agent），则在编码前先读取后端编写的接口文档 /docs/interface.md，了解API接口定义后再编写前端代码。
4. 【后端任务接口设计】如果本任务是后端任务（BE agent）且需要对外提供API接口，则在编码前先设计接口：
   a. 读取接口文档模板：assets/skills/impm-task-coding-interface/INTERFACE-TEMPLATE.MD
   b. 根据参考文件设计接口（请求方法、路径、参数、响应格式等）
    c. 将接口设计写入：docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md
    d. 将接口模板文件也复制到任务目录下作为后续参考
    e. 后端编码完成后，将接口定义汇总更新到 /docs/interface.md，供前端任务参考
5. 如果testcase.md中存在未通过测试，则当前编码属于修复编码，主要关注测试不通过部分的修改。
6. 如果review.md存在且包含未通过的检查项，则按检查要求修改代码。
7. 根据上述文件内容编写代码，编码力求简洁，逻辑清晰，函数和文件大小适中。
8. 编码时如果还需要检查资料和现有代码，可以让CS和WS这两个subagent检索材料。
9. 编码时如果存在实际需求，需要调整architecture.md或者project.md或者其他架构相关材料，可以启动SA subagent进行修改。
10. 编码时如需调整数据库结构，可启动DBA subagent修改 dbd.md 和 dbd.sql。由于原有dbd.sql已执行，需生成 dbd-fix{N}.sql（N递增）用于增量升级到最新版本，生成后立即执行。
11. 编写完成后，先检查一下代码是否有明显的格式，语法问题。函数和文件的功能划分是否合适，结构是否清晰，可读性高。
12. 再检查代码是否覆盖了参考上下文中所有的需求。
13. 最后检查代码逻辑上是否有漏洞和问题。
14. 将task（包含json和md）的状态改为：code_finish
15. 结束subagent，返回PM。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
