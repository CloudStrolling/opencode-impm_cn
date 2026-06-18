---
name: impm-task-coding-dbd
description: 执行编码4 - 数据库设计
---

# impm-task-coding-dbd 技能

## 触发词
impm-task-coding-dbd

## 何时使用
- 针对一个任务进行具体编码的第四步：数据库设计

## 执行内容
1. 启用数据库管理员（DBA subagent），
2. 首先查询项目是否需要数据库，是否存在/docs/dbd.md。如果文件不存在，则认定项目无需数据库，直接跳过流程。
3. 按上下文中的版本号和任务号找到并读取此前生成的参考文件：
- docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
4. 读取 /docs/dbd.md 和 /docs/architecture.md 作为参考
5. 根据对任务的解读，判断是否需要对目前数据库结构或者数据进行调整。如果不需要，则跳过此流程。
6. 如果确实需要调整数据库或者数值，生成 docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md 记录变更。同时生成:docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.sql 用于后续执行变更。大括号中的内容分别是版本号和任务编号。
7. 更新 /docs/dbd.md，将本次的变更加入，调整物理模型的结构。
8. 在 /docs/dbd.md 末尾追加变更记录：
   - 扫描 `docs/requires/` 目录下的所有文件，对比文件名获取最新版本号（文件名格式如 `v1.0.0.md` 或 `1.0.0.md`，取版本数值最大的）
   - 获取当前日期
   - 在文档末尾添加变更记录表格：

   | 变更日期 | 版本号 | 变更说明 |
   |---------|-------|---------|
   | {当前日期} | v{最新版本号} | 数据库设计更新 |

9. 调用sql的mcp，执行 docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.sql 
10. 将task（包含json和md）的状态改为：dbd_finish
11. 结束subagent，返回PM。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->