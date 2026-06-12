<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-task-coding-ws
description: 执行编码3 - 查询网络参考资料
---

# impm-task-coding-ws 技能

## 触发词
impm-task-coding-ws

## 何时使用
- 针对一个任务进行具体编码的第三步：查询网络参考资料

## 执行内容
1. 启用网络技术文档查询（WS subagent），
2. 按上下文中的版本号和任务号找到并读取此前生成的参考文件：
- docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
  大括号中的内容分别是版本号和任务编号。
3. 读取 /docs/architecture.md 作为参考
4. 根据上述文件内容，判断当前任务中，需要使用哪些三方的包或者sdk。
5. 在网络上查询这些包的官方文档，使用方法和案例。
6. 在查询和收集时，需要关注当前项目使用的版本号和所查询的资料的版本号是否兼容。
7. 将查询到的内容分析，合并，汇总后放入：docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md。大括号中的内容分别是版本号和任务编号。
8. 将task（包含json和md）的状态改为：ws_finish
9. 结束subagent，返回PM。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，继续执行下一个阶段
2. **执行后续所有步骤** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，自动执行从下一个阶段开始的所有剩余阶段