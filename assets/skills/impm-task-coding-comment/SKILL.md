---
name: impm-task-coding-comment
description: 执行编码11 - 代码注释
---

# impm-task-coding-comment 技能

## 触发词
impm-task-coding-comment

## 何时使用
- 针对一个任务进行具体编码的第十一步：代码注释

## 执行内容

### 查询本任务修改的所有代码
  可以通过本次git中新增和修改的文件中的代码文件来确定本任务中的所有代码

### 注释内容：
  - 每个文件要有对整个文件的注释
  - 每个函数要有对函数的注释，包括函数功能，参数等。
  - 关键的代码块，字典表，重要变量都要有说明和注释。

### 后续处理
task状态改为comment-finish。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
