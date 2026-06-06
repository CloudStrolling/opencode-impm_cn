<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-branch-commit
description: 创建新的git分支，作为本次项目的基础分支。
---

# impm-branch-commit 技能

## 触发词
impm-branch-commit

## 何时使用
- 项目完成后额最后一步

## 执行步骤
1. PM启用VCA subagent来执行代码提交任务。
2. vca需要分析所有未提交的文件，哪些是需要加入git中的，哪些是需要排除的。
3. 将排除的列入排除清单。
4. 将剩余文件提交。
5. 将当前分支合并到主分支。
6. 结束subagent，并退出PM agent。整体流程结束。

