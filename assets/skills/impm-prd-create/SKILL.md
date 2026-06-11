<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-prd-create
description: 创建PRD文档 - 根据需求文档生成UserStory格式的PRD
---

# impm-prd-create 技能

## 触发词
impm-prd-create

## 何时使用
- 需求文档已完成，git开新分支完成后的下一步
- 需要将需求转化为UserStory格式时

## 执行步骤

### 1. 读取前序文档
使用impm_doc_reader读取：
- 前序生成的requirement文档，指定需求文档或者docs/requires/ 目录下，指定版本号对应的需求文档。
- project.md

### 2. 读取PRD模板
读取同目录下的 `PRD-TEMPLATE.MD` 文件作为PRD文档生成模板：


### 3. 生成PRD
根据需求文档、project.md 和 PRD-TEMPLATE.MD 模板，生成格式完整的PRD文档：

- 模板中的 `{PROJECT_NAME_CN}`、`{PROJECT_NAME}`、`{X.Y.Z}` 等占位符替换为实际值
- 模板中的占位描述（如 `{描述项目要解决的核心问题...}`）替换为实际内容
- US-{NNN} 编号从 001 开始递增
- 用户故事与需求文档中的功能需求（FR-{NNN}）关联
- 验收标准严格遵循 Given-When-Then 格式
- 边界情况与错误处理表根据实际场景填充
- 如果模板中部分内容不使用当前项目，可以PRD中去除这些文档部件。

### 4. 需求细节确认
如果在生成PRD过程中有不明确的需求细节，直接向用户提问，直到所有细节清晰。
如有需要，可以通过搜索本地代码（用CS subagent）和网上查询（用WS subagent）收集相关信息，完善文档。

### 5. 写入文档
使用impm_doc_writer将PRD文档写入：
`docs/prds/{PROJECT_NAME}-prd-v{X.Y.Z}.md`
然后将docs/project.md 的当前进度改为：impm-prd

### 6. 返回文档位置
返回生成的文档路径给PM agent。

## 交付物
- docs/prds/{PROJECT_NAME}-prd-v{X.Y.Z}.md

## 注意事项
- 每个UserStory必须有唯一编号（US-001, US-002...）
- UserStory要与需求文档中的功能需求对应
- 验收标准要具体、可测试
- 所有内容使用简体中文
