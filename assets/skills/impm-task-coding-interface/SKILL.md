---
name: impm-task-coding-interface
description: 接口设计 - 编码前设计本次任务API接口
---

# impm-task-coding-interface 技能

## 触发词
impm-task-coding-interface

## 何时使用
- 编码前：需要设计本次任务的API接口时

## 执行角色
- **BE（Backend Engineer）**：本技能由 BE subagent 负责执行

## 执行步骤

1. 判断前置条件：
   - 检查业务需求是否为有分前后端的项目（非纯前端或纯后端项目）
   - 确认当前任务是否为后端任务
   - 如不满足条件，跳过此流程，标记无需接口设计
   - 如满足条件，继续执行后续步骤

2. 判断本次任务是否涉及API接口变更：
   - 如不涉及，跳过此流程，标记无需接口设计
   - 如涉及，继续执行后续步骤

3. 读取参考文件：
   - `docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md`
   - `docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md`
   - `docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md`
   - `/docs/architecture.md`

4. 读取接口文档模板：
   从本技能所在目录（与SKILL.md同级）读取 `INTERFACE-TEMPLATE.MD` 文件作为接口文档的参考模板。

5. 设计接口：
   - 分析任务需求，确定需要暴露的API接口
   - 设计请求方法、路径、参数、请求体和响应格式
   - 定义错误码和异常场景
   - 确保接口设计符合架构文档中的规范和约束

6. 写入接口文档：
   - 将设计好的接口定义写入：`docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md`
   - 按模块组织，保持文档结构清晰

## 交付物
- `docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md` — 本次任务的接口设计文档

## 注意事项
- 接口设计需与架构文档中的规范保持一致
- 如本任务不涉及API接口变更，直接跳过

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
