---
description: 查询网络资料 - 搜索与当前任务相关的第三方包和文档
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动WS subagent执行impm-task-coding-ws技能，查询与当前任务相关的网络资料。

## 操作流程

1. 启动WS subagent，传入当前版本号和任务编号
2. WS subagent应执行impm-task-coding-ws技能：
   - 读取context.md、cs.md、architecture.md
   - 分析任务需要使用的第三方包或SDK
   - 在线搜索官方文档和使用方法
   - 注意版本兼容性
   - 合并写入docs/tasks/task_{v}/TASK-{n}/ws.md
3. 完成后将task状态改为ws_finish
