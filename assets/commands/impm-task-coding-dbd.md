---
description: 数据库设计 - 为当前任务设计数据库变更
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动DBA subagent执行impm-task-coding-dbd技能，为当前任务设计数据库变更。

## 操作流程

1. 启动DBA subagent，传入当前版本号和任务编号
2. DBA subagent应执行impm-task-coding-dbd技能：
   - 检查项目是否需要数据库（判断dbd.md是否存在）
   - 读取context.md、cs.md、ws.md、dbd.md、architecture.md
   - 判断是否需要调整数据库结构
   - 如需要，生成dbd.md和dbd.sql
   - 更新/dbd.md并执行dbd.sql
3. 完成后将task状态改为dbd_finish
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->