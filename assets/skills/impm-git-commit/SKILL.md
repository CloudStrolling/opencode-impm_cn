---
name: impm-git-commit
description: 提交代码
---

# impm-git-commit 技能

## 触发词
impm-git-commit

## 何时使用
- 编码和文档更新全部完成后的最后一步

## 执行步骤
1. PM启用VCA subagent来执行代码提交任务。
2. VCA需要分析所有未提交的文件，哪些是需要加入git中的，哪些是需要排除的。
3. 将排除的列入排除清单。
4. 将剩余文件提交，提交时的commit message 格式为：{项目英文缩写}-{本次修改的版本号}-本次提交内容的简述。
5. 项目英文缩写：项目英文名的单词首字母小写。如果项目英文名称不是多个单词组成的，直接用项目英文名当做缩写
6. 结束subagent，并退出PM agent。整体流程结束。

## 完成后提示

此步骤是整个 impm 工作流的最后一步，无后续步骤。流程结束。

<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
