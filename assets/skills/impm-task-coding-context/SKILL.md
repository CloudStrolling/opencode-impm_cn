<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-task-coding-context
description: 执行编码1 - 获取需求上下文
---

# impm-task-coding-context 技能

## 触发词
impm-task-coding-context

## 何时使用
- 针对一个任务进行具体编码的第一步：获取需求上下文


## 必要上下文输入
- 版本号
- 当前任务编号
- 如果必要输入不满足，需要直接询问用户

## 执行内容

1. 启用技术负责人（TL subagent），传入当前版本号和任务编号作为上下文。
2. 根据版本号定位task文件，根据任务编号在task文件中找到相应的任务内容。
3. 根据任务内容中关联的userstory找到对应的prd的userstory内容。
4. 然后从architecture.md、project.md和当前版本中sds中分析查询与上述任务相关的部分。
5. 将task的任务内容和userstory的内容，以及architecture.md、project.md和当前版本中sds中相关的部分全部合并到一起。
6. 将合并后的内容放入：docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md。大括号中的内容分别是版本号和任务编号。
7. 将task（包含json和md）的状态改为：context_finish
8. 返回PM

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，继续执行下一个阶段
2. **执行后续所有步骤** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，自动执行从下一个阶段开始的所有剩余阶段
