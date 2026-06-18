---
name: impm-task-coding-testcase
description: 执行编码5 - 测试用例编写
---

# impm-task-coding-testcase 技能

## 触发词
impm-task-coding-testcase

## 何时使用
- 针对一个任务进行具体编码的第五步：测试的用例编写

## 执行内容
1. 如果测试文档已存在则跳过当前流程。将task（包含json和md）的状态改为：testcase_finish（主要是测试不通过，重新编码的场景。）
2. 启用测试工程师（TE subagent），按版本号和任务号找到并读取此前生成的参考文件：
- docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
- docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md
  大括号中的内容分别是版本号和任务编号。
3. 参考技能同目录下的模板文件TESTCASE-TEMPLATE.MD作为文档模板。
4. 根据上述文件内容，特别context.md的测试验收标准部分的内容，生成单元测试用例文档。文档内容写入docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md
5. 生成测试用例时，需要特别关注异常和边缘数值的用例，保证用例全面，测试覆盖率高。
6. 测试自动化测试脚本、测试过程、测试结论这三段暂时不用编写。
7. 将task（包含json和md）的状态改为：testcase_finish
8. 结束subagent，返回PM。

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->