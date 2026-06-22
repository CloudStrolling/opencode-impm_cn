---
name: impm-task-coding-test
description: 执行编码9 - 测试代码编写与测试
---

# impm-task-coding-test 技能

## 触发词
impm-task-coding-test

## 何时使用
- 针对一个任务进行具体编码的第九步：测试代码编写与测试

## 执行内容
1. 检查是否已有完善的测试脚本，如有则直接跳到执行测试步骤（适用于修复后重新测试的场景）。
2. 如需要编写或更新测试脚本，按版本号和任务号找到并读取此前生成的参考文件：
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md
  - docs/project.md
  大括号中的内容分别是版本号和任务编号。
4. 根据testcase.md文档的内容，结合其他上下文内容，完成测试脚本编码。
5. 根据不同语言的要求或通用约定，将测试脚本代码放到合适的目录下。
6. 执行测试脚本完成测试，并在testcase.md中记录测试脚本，测试过程和测试结论。已有测试结论则更新。
7. 所有用例都完成编码并测试完毕后，如果存在测试不通过，则将不通过的测试用例返回给PM，结束TE subagent，同时记录当前task测试失败次数+1
8. PM判断如果达到测试失败次数的上限（默认5次），则提示失败并退出。
9. PM判断如果没有达到测试失败次数的上限，则回退到task任务的第一步重新搜集信息并重新编码。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->