---
name: impm-task-coding-interfacemerge
description: 接口合并 - 将本次任务接口合并入全局接口文档
---

# impm-task-coding-interfacemerge 技能

## 触发词
impm-task-coding-interfacemerge

## 何时使用
- 编码完成且测试和代码审核通过后
- 需要将本次设计的接口合并到全局接口文档时

## 执行角色
- **BE（Backend Engineer）**：本技能由 BE subagent 负责执行

## 执行步骤

1. 判断前置条件：
   - 检查业务需求是否为有分前后端的项目（非纯前端或纯后端项目）
   - 确认当前任务是否为后端任务
   - 如不满足条件，跳过此流程，标记无需合并
   - 如满足条件，继续执行后续步骤

2. 读取本次接口文件：
   - `docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md`

3. 检查全局接口文档是否存在：
   - 如 `/docs/interface.md` 不存在，直接创建该文件
   - 如存在，读取其内容

4. 合并接口：
   - 将本次 `interface.md` 中的接口定义合并到 `/docs/interface.md` 中
   - 避免重复（如已有相同接口则覆盖更新）
   - 按模块组织，保持文档结构清晰

5. 合并完成后输出合并结果路径

## 交付物
- `/docs/interface.md` — 更新后的全局接口文档

## 注意事项
- 不要删除 `/docs/interface.md` 中其他已有模块的接口定义
- 只追加或更新本次任务相关的接口内容

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
