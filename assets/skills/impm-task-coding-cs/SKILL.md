---
name: impm-task-coding-cs
description: 执行编码2 - 查询现有代码
---

# impm-task-coding-cs 技能

## 触发词
impm-task-coding-cs

## 何时使用
- 针对一个任务进行具体编码的第二步：查询现有代码

## 执行内容
1. 按版本号和任务号找到开发任务需求的上下文文件：docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md。大括号中的内容分别是版本号和任务编号。
2. 读取project.md中的项目地图，找到可能与目前开发任务相关的现有源代码文件和工具类。
3. 依次读取具体的源代码文件，提取与本次开发有关的关键代码片段。
4. 将所有的关键代码片段合并,合并时要标注参考代码的文件位置，代码位置，功能简述。
5. 将合并后的内容放入：docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md。大括号中的内容分别是版本号和任务编号。
6. 将task（包含json和md）的状态改为：cs_finish
7. 结束subagent，返回PM。

## 完成后提示
执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->