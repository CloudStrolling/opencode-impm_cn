---
description: 更新项目文档 - 生成README、部署文档等项目相关文档
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动TW subagent执行impm-docs-update技能，生成或更新项目相关文档。

## 操作流程

1. 启动TW subagent执行impm-docs-update技能
2. TW subagent应：
   - 读取project.md获取项目设置
   - 生成README.md
   - 生成agent说明文档（如有自定义agent）
   - 生成编译部署文档和脚本
3. 等待TW完成后，返回结果摘要
