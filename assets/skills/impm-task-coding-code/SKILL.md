<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

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
2.subagent启动后，按版本号和任务号找到并读取此前生成的参考文件：
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/review.md
  - docs/project.md
  大括号中的内容分别是版本号和任务编号。
3. 如果testcase.md中，存在未测试通过的测试，则当前编码是修补bug的编码，主要关注测试不通过部分的修改。
4. 如果review.md中，存在未测试通过的检查项目，则按照检查项的要求修改代码。
5. 根据上述文件内容编写代码，编码力求简洁，逻辑清晰，函数和文件大小适中。
6. 编码时如果还需要检查资料和现有代码，可以让CS和WS这两个subagent检索材料。
7. 编码时如果存在实际需求，需要调整architecture.md或者project.md或者其他架构相关材料，可以启动SA subagent进行修改。
8. 编码时如果存在实际需求，需要调整本次的数据库结构：docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md和docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.sql，可以启动DBA subagent进行修改。修改完成后，由于老的dbd.sql已执行，还需要增加一个dbd-fix{1}.sql,用于将数据库升级到最新版本。{}内的内容数字递增。生成完毕后执行dbd-fix{1}.sql
9. 编写完成后，先检查一下代码是否有明显的格式，语法问题。函数和文件的功能划分是否合适，结构是否清晰，可阅读性高。
10. 再检查代码是否覆盖了参考上下文中所有的需求。
11. 最后检查代码逻辑上是否有漏洞和问题。
12. 将task（包含json和md）的状态改为：code_finish
13. 结束subagent，返回PM。