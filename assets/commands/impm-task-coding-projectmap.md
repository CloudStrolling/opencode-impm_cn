---
description: 更新项目地图 - 将本次新增和更新的目录、文件、函数写入project.md的项目地图中，排除git忽略文件和.opencode目录
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动SA subagent执行impm-task-coding-projectmap技能，将本次新增和更新的目录、文件和函数写入project.md的项目地图中。

## 操作流程

1. 启动SA subagent执行impm-task-coding-projectmap技能
2. SA subagent应：
   - 读取docs/project.md，定位项目地图章节
   - 使用 `git ls-files` 获取Git跟踪的文件列表
   - 过滤掉 `.opencode/` 目录下的所有文件
   - 分析每个文件的函数/类信息
   - 按目录层级分组生成文件树
   - 将更新后的项目地图写回docs/project.md
3. 等待SA完成后，返回结果摘要

## 注意事项

- 只包含Git跟踪的文件，排除被git忽略的文件
- 排除 `.opencode/` 目录下的所有内容
- 不删除其他已有模块的记录
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->