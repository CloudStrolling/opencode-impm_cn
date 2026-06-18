---
description: 查询现有代码 - 搜索与当前任务相关的现有代码和工具类
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动CS subagent执行impm-task-coding-cs技能，查询与当前任务相关的现有代码。

## 操作流程

1. 启动CS subagent，传入当前版本号和任务编号
2. CS subagent应执行impm-task-coding-cs技能：
   - 读取context.md获取需求上下文
   - 从project.md项目地图中查找相关源代码
   - 读取源代码，提取关键代码片段
   - 合并写入docs/tasks/task_{v}/TASK-{n}/cs.md
3. 完成后将task状态改为cs_finish
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->