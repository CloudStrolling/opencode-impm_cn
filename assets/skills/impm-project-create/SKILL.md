<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->

---
name: impm-project-create
description: 创建或更新project.md - 分析项目结构，生成项目信息、编码规范和文件地图
---

# impm-project-create 技能

## 触发词
impm-project-create

## 何时使用
- /impm 命令启动后的第一个步骤
- /impm-create-project 命令启动时

## 执行步骤

### 1. 确保目录结构存在
检查并创建以下目录（如不存在）：
- docs
- docs/sds
- docs/requires
- docs/tasks
- docs/prds

### 2. 检查 docs/project.md 是否存在
- 如果不存在：使用impm_doc_reader读取技能所在同目录下的模板PROJECT-TEMPLATE.MD，创建一个新的project.md
- 如果已存在：只更新Project Map部分

### 3. 填充项目基本信息（仅首次创建）
- Project Name：项目名称
- Project Code：项目英文代号
- Programming Language：编程语言
- Project Type：项目类型
- Current Process：当前进度。创建时进度为：impm-project
- Local Language：本地语言（默认简体中文）
- Project Overview：项目概述
如有未明确的内容，通过询问用户补充完整。

### 4. 填充数据库信息（仅首次创建）
- 首先明确是否需要使用数据库。
- 如果需要使用数据库，明确数据库的类型和数据库的版本信息。
- 确定数据库表，字段，索引的命名规则
- 如有未明确的内容，通过询问用户补充完整。

### 5. 生成编码规范（仅首次创建）
根据编程语言生成行业约定俗成的编码规范，内容简明扼要，包括：
- 文件组织规范
- 命名规范
- 代码风格
- 注释规范
- 日志规范
- 测试规范
- 统一错误处理规范
- 其他规范

### 6. 更新项目地图
使用impm_project_analyzer工具扫描项目源代码，生成：
- 按目录层级分组的源代码文件树
- 每个目录的功能描述
- 每个文件的用途描述（从JSDoc或文件头注释提取）
- 每个文件中的函数/类列表
- 每个函数/类的一句话描述

### 7. 写入project.md
使用impm_doc_writer将内容写入docs/project.md。
如有需要，可以通过搜索本地代码（用CS subagent）和网上查询（用WS subagent）收集相关信息，完善文档。

## 交付物
- docs/project.md 文件

## 注意事项
- 首次创建时三个部分（项目基本信息、编码规范、项目地图）都要生成
- 更新时只更新Project Map
- 所有内容使用简体中文
