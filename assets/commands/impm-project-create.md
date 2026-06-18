---
description: 创建或更新project.md - 分析项目结构，生成项目信息、编码规范和文件地图
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动SA subagent执行impm-project-create技能，分析项目结构，生成或更新project.md文件。

## 操作流程

1. 启动SA subagent执行impm-project-create技能
2. SA subagent应：
   - 确保docs目录结构存在
   - 检查project.md是否存在
   - 如不存在：读取模板创建新的project.md
   - 如已存在：只更新项目地图部分
   - 填充项目基本信息、数据库信息、编码规范
3. 等待SA完成后，返回结果摘要
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->