<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-branch-create
description: 创建新的git分支 - 基于版本信息创建项目分支并提交前序文档
---

# impm-branch-create 技能

## 触发词
impm-branch-create

## 何时使用
- 需求文档生成完成后的下一步

## 执行步骤

### 1. 获取版本信息
技能调用时，需要提供生成requirement文档时的版本信息和项目名称。

### 2. 生成新的分支
1. 如果未初始化Git：
  启动SA subagent执行Git初始化任务：
  运行 git init 初始化仓库
  分析项目结构，根据项目类型（Node.js/Python/Java/Go等）自动生成 .gitignore
  使用 git add -A 暂存项目文件
  提交现有内容。  
2. 如果存在远程仓库，将当前主分支的最新代码拉回到本地。
3. 以项目名称加版本号为分支名称，创建新的分支并切换到新的分支。

### 3. 提交前序文档
1. 将前序生成的需求文档加入新的分支的git。
2. 如果当前分支的git中没有project.md，则将project.md加入当前分支。

### 4. 返回PM

