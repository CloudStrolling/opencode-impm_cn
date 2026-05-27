---
name: impm-project-update
description: 创建或更新project.md - 分析项目结构，生成项目信息、编码规范和文件地图
license: MIT
---

# impm-project-update 技能

## 触发词
impm-project-update

## 何时使用
- /impm命令启动后的第一个步骤
- 需要更新project.md的Project Map时

## 执行步骤

### 1. 确保目录结构存在
检查并创建以下目录（如不存在）：
- docs
- docs/specs
- docs/requires
- docs/tasks
- docs/prds

### 2. 判断project.md是否存在
- 如果不存在：创建一个新的project.md
- 如果已存在：只更新Project Map部分

### 3. 填充Project Info（仅首次创建）
- Project Name：项目名称
- Project Code：项目英文代号
- Programming Language：编程语言
- Project Type：项目类型
- Local Language：本地语言（默认简体中文）
- Project Overview：项目概述

如有未明确的内容，通过询问用户补充完整。

### 4. 生成Coding Conventions（仅首次创建）
根据编程语言生成行业约定俗成的编码规范，内容简明扼要，包括：
- 命名规范
- 文件组织
- 代码风格
- 注释规范

### 5. 更新Project Map
使用impm_project_analyzer工具扫描项目源代码，生成：
- 所有源代码文件列表
- 每个文件中的函数/类列表
- 每个函数/类的一句话描述

### 6. 写入project.md
使用impm_doc_writer将内容写入docs/project.md。

## 交付物
- docs/project.md 文件

## 注意事项
- 首次创建时三个部分都要生成
- 更新时只更新Project Map
- 所有内容使用简体中文
