---
description: 接口合并 - 将本次任务接口合并入全局接口文档
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动BE subagent执行impm-task-coding-interfacemerge技能，将本次任务接口合并入全局接口文档。

## 操作流程

1. 先判断前置条件：
   - 必须是分前后端的项目且当前为后端任务，才需要接口合并
   - 不满足条件则直接跳过，标记无需合并
2. 启动BE subagent执行impm-task-coding-interfacemerge技能
2. BE subagent应：
   - 读取本次接口文件：`docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md`
   - 检查 `/docs/interface.md` 是否存在，如不存在则直接创建
   - 将本次接口定义合并到 `/docs/interface.md` 中
   - 避免重复（如已有相同接口则覆盖更新）
   - 按模块组织，保持文档结构清晰
4. 完成后输出合并结果路径
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
