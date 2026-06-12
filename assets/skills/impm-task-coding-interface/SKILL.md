<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-task-coding-interface
description: 更新接口文档 - 将本次任务接口合并入全局接口文档
---

# impm-task-coding-interface 技能

## 触发词
impm-task-coding-interface

## 何时使用
- 编码完成且测试和代码审核通过后
- 后端任务需要将本次设计的接口合并到全局接口文档时

## 执行角色
- **BE（Backend Engineer）**：本技能由 BE subagent 负责执行

## 执行步骤

1. 读取本次接口文件：
   - `docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md`

2. 检查全局接口文档是否存在：
   - 如 `/docs/interface.md` 不存在，直接创建该文件
   - 如存在，读取其内容

3. 合并接口：
   - 将本次 `interface.md` 中的接口定义合并到 `/docs/interface.md` 中
   - 避免重复（如已有相同接口则覆盖更新）
   - 按模块组织，保持文档结构清晰

4. 合并完成后输出合并结果路径

## 交付物
- `/docs/interface.md` — 更新后的全局接口文档

## 注意事项
- 不要删除 `/docs/interface.md` 中其他已有模块的接口定义
- 只追加或更新本次任务相关的接口内容

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，继续执行下一个阶段
2. **执行后续所有步骤** — 按照 `/assets/skills/impm-task-coding/skill.md` 中的阶段顺序，自动执行从下一个阶段开始的所有剩余阶段
