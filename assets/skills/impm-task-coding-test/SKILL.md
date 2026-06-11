<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-task-coding-test
description: 执行编码7 - 测试代码编写与测试
---

# impm-task-coding-test 技能

## 触发词
impm-task-coding-test

## 何时使用
- 针对一个任务进行具体编码的第七步：测试代码编写与测试

## 执行内容
1. PM启用TE subagent来编码测试代码与执行测试
2. 如果已有完善的测试脚本编码，则无需重新编码，直接跳到执行测试脚本这一步。考虑到此前测试不通过，修改以后重新用测试脚本测试的场景。
3. 如果需要重新写测试脚本，则在subagent启动后，按版本号和任务号找到并读取此前生成的参考文件：
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
7. 所有用例都完成编码并测试完毕后，如果存在测试不通过，则将不通过的测试用例返回给PM，结束TE subagent。记录当前task测试失败次数+1
8. PM判断如果达到测试失败次数的上限（默认10次），则提示失败并退出。
9. PM判断如果没有达到测试失败次数的上限，则回退到第二步cs，重新收集信息并重新编码。