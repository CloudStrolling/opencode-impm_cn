---
name: impm-coding
description: 执行编码 - 循环获取task清单，逐一执行编码
---

# impm-coding 技能

## 触发词
impm-coding

## 何时使用
- 任务清单生成完成后
- 在执行具体编码前


## 执行步骤
1. 根据当前版本号获取task清单，可以通过读取task json文件的方式获取。
2. 查看task清单中执行的状态，有未执行，已完成和其他一些中间状态。
3. 将状态为非已完成状态的task，按照相互依赖和重要程度排序。
4. 根据顺序逐一将版本号和task编号传入，并执行impm-task-coding任务
5. 如果某一个task测试返回测试失败，已达失败最大次数，则中止整个流程。人工检视需求与设计的问题后，再继续。
6. 所有任务都执行完成后，docs/project.md 的当前进度改为：impm-coding

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤

<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

