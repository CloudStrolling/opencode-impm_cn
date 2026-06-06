<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
description: 代码提交Git - 将当前任务代码提交到Git仓库
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动VCA subagent执行impm-task-coding-gitcommit技能，提交代码到Git。

## 操作流程

1. 启动VCA subagent执行impm-task-coding-gitcommit技能
2. VCA subagent应：
   - 分析所有未提交的文件
   - 确定哪些需加入Git、哪些需排除
   - 排除应排除的文件
   - 提交剩余文件到Git
