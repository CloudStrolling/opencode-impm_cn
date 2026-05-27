---
description: 创建或更新架构文档 - 根据PRD和project.md生成architecture.md
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动SA subagent执行impm-architect-update技能，根据PRD和project.md生成或更新architecture.md架构文档。

## 操作流程

1. 启动SA subagent，将用户输入传递给它
2. SA subagent应执行impm-architect-update技能：
   - 读取PRD文档和project.md
   - 设计系统架构
    - 生成architecture.md架构文档
3. 等待SA完成后，返回结果摘要
