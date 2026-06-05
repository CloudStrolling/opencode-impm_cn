---
name: impm-task-create
description: 创建任务清单 - 根据PRD和架构文档生成任务.md和任务.json
license: MIT
---

# impm-task-create 技能

## 触发词
impm-task-create

## 何时使用
- sds文档生成完成后
- 需要将技术规格转化为可执行的任务清单时

## 执行步骤

### 1. 读取前序文档
使用impm_doc_reader读取：
- 当前版本的PRD文档
- project.md
- architecture.md
- 当前版本的sds文档

### 2. 生成任务清单
根据文档生成两个文件：.md和.json

#### 生成task的md
读取同目录下的 `TASK-TEMPLATE.MD` 文件作为任务文档生成模版：
根据需求文档、project.md 和 PRD-TEMPLATE.MD 模版，生成格式完整的PRD文档：
- 模版中的 `{PROJECT_NAME_CN}`、`{PROJECT_NAME}`、`{X.Y.Z}` 等占位符替换为实际值
- 模版中的占位描述（如 `{描述项目要解决的核心问题...}`）替换为实际内容
- TASK-{NNN} 编号从 001 开始递增
- 如果模版中部分内容不使用当前项目，可以TASK中去除这些文档部件。
- 上下文读取是指：上下文读取的方式，从prd，sds中读取哪些段落。

#### .json文件格式
```json
{
  "projectName": "{项目名称}",
  "version": "{版本号}",
  "prd": "docs/prds/{项目名称}-prd-v{X.Y.Z}.md",
  "sds": "docs/sds/{项目名称}-sds-v{X.Y.Z}.md",
  "architecture": "docs/architecture.md",
  "project": "docs/project.md",
  "tasks": [
    {
      "id": "{TASK-001}",
      "title": "{任务名称}",
      "description": "{详细业务描述}",
      "taskType": "backend | frontend | common | test | docs ",
      "userStoryIds": {["US-001",...]},
      "upstreamTaskIds": {[]},
      "downstreamTaskIds": {["TASK-002"]},
      "priority": "P0` | P1 | P2",
      "status": "pending",
      "testMethod": "{测试方法}",
      "acceptanceCriteria": "{验收标准}",
      "contextObtain":"{上下文读取}"
    }
  ]
}
```

### 3. 任务拆分规则
- 每个任务先确定归属模块。再通过UserStory定义一个或一组功能，任务是功能下的具体实现的每个细颗粒步骤。
- 任务间标注上下游依赖关系
- 任务标注类型：前端/后端/通用/测试/文档
- 任务要写清楚任务执行所需要获取的上下文的具体内容，部分。
- 每个任务写清测试方法和验收标准
- 任务粒度要足够细，一个任务对应一个小功能点

### 4. 信息收集
- 对于引用的外部代码或包，通过搜索本地代码（用CS subagent）和网上查询收集信息（用WS subagent）
- 确保对技术方案有足够把握后再编写任务
- 必要时向用户提问澄清需求

### 5. 写入文件
使用impm_doc_writer写入.md文件，使用impm_task_manager（action=init）初始化.json文件。
然后将docs/project.md 的当前进度改为：impm-task

### 6. 返回文件位置
返回两个文件的路径给PM agent。

## 交付物
- docs/tasks/{项目名称}-task-v{x.x.x}.md
- docs/tasks/{项目名称}-task-v{x.x.x}.json

## 注意事项
- 任务粒度要细，避免单个任务过大
- 依赖关系要准确，避免循环依赖
- 测试方法要具体可执行
- 所有内容使用简体中文
