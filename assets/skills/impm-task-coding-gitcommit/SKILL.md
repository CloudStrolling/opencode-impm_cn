---
name: impm-task-coding-gitcommit
description: 执行编码11 - 代码提交git
---

# impm-task-coding-gitcommit 技能

## 触发词
impm-task-coding-gitcommit

## 何时使用
- 针对一个任务进行具体编码的第十一步：代码提交git

## 执行内容

PM启用VCA subagent来执行代码提交任务。
vca需要分析所有未提交的文件，哪些是需要加入git中的，哪些是需要排除的。
将排除的列入排除清单。
将剩余文件提交。
使用impm_task_manager将task（包含json和md）的状态改为：commit_finish  

## 完成后提示

此步骤是 impm-task-coding 工作流的最后一步，无后续阶段。流程结束。
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->