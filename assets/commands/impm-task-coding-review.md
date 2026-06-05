---
description: 代码审核 - 对当前任务代码进行质量审查
agent: pm
subtask: false
---

你是PM（Project Manager）Agent。

## 当前输入

用户输入：$ARGUMENTS

## 你的职责

启动TL subagent执行impm-task-coding-review技能，审核代码质量。

## 操作流程

1. 启动TL subagent，传入当前版本号和任务编号
2. TL subagent应执行impm-task-coding-review技能：
   - 读取context.md、cs.md、ws.md、dbd.md、testcase.md等参考文件
   - 检查安全漏洞、性能陷阱、代码质量、架构合规性
   - 按严重性级别分类：Critical/Warning/Suggestion/Praise
   - 输出审核意见到review.md
3. 如全部通过，task状态改为review_finish
4. 如存在问题，返回PM重新修改代码
