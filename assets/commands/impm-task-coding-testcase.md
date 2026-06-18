---
description: 测试用例编写 - 为当前任务编写单元测试用例文档
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动TE subagent执行impm-task-coding-testcase技能，编写测试用例文档。

## 操作流程

1. 如测试文档已存在则跳过（重新编码场景）
2. 启动TE subagent，传入当前版本号和任务编号
3. TE subagent应执行impm-task-coding-testcase技能：
   - 读取context.md、cs.md、ws.md、dbd.md
   - 参考测试用例模板生成用例文档
   - 特别关注异常和边缘数值的用例
   - 写入docs/tasks/task_{v}/TASK-{n}/testcase.md
4. 完成后将task状态改为testcase_finish
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->