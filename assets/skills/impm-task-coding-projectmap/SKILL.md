---
name: impm-task-coding-projectmap
description: 更新项目地图 - 将本次新增和更新的目录、文件、函数写入project.md的项目地图中，排除git忽略文件和.opencode目录
---

# impm-task-coding-projectmap 技能

## 触发词
impm-task-coding-projectmap

## 何时使用
- 编码阶段的最后一步
- 需要更新项目地图时

## 执行步骤

### 1. 读取现有project.md
- 使用 impm_doc_reader 读取 docs/project.md
- 定位项目地图（Project Map）章节

### 2. 扫描Git管理范围内的文件
- 使用 `git ls-files` 获取所有被Git跟踪的文件列表（）
- 扫描本次新增，但是尚未加入Git跟踪的文件
- 排除根据.gitignore忽略的文件和文件夹

### 3. 分析文件结构
- 按目录层级分组源代码文件树
- 对每个目录描述其功能
- 对每个文件提取用途描述（从JSDoc或文件头注释提取）
- 列出每个文件中的函数/类列表
- 对每个函数/类做一句话描述

### 4. 合并新内容到项目地图
- 保留已有但本次未变更的目录和文件记录
- 新增本次新增的目录、文件和函数/类
- 更新本次有变更的文件和函数/类描述
- 不删除其他已有模块的记录

### 5. 写入project.md
- 使用 impm_doc_writer 将更新后的项目地图写入 docs/project.md
- 确保不破坏project.md中其他章节的内容

### 6. 添加变更记录
在 docs/project.md 末尾追加变更记录：
- 扫描 `docs/requires/` 目录下的所有文件，对比文件名获取最新版本号（文件名格式如 `v1.0.0.md` 或 `1.0.0.md`，取版本数值最大的）
- 获取当前日期
- 在文档末尾添加变更记录表格：

| 变更日期 | 版本号 | 变更说明 |
|---------|-------|---------|
| {当前日期} | v{最新版本号} | 项目地图更新 |

## 交付物
- 更新后的 docs/project.md 文件（项目地图部分已更新）

## 注意事项
- 扫描Git跟踪的文件（`git ls-files`）和本次新增的文件，排除被git忽略的文件
- 不删除其他已有模块的记录
- 使用 project.md 中配置的本地语言

## 完成后提示
执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
