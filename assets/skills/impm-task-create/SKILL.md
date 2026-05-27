---
name: impm-task-create
description: 创建任务清单 - 根据PRD和架构文档生成任务.md和任务.json
license: MIT
---

# impm-task-create 技能

## 触发词
impm-task-create

## 何时使用
- spec文档生成完成后
- 需要将技术规格转化为可执行的任务清单时

## 执行步骤

### 1. 读取前序文档
使用impm_doc_reader读取：
- PRD文档
- project.md
- architecture.md
- spec文档

### 2. 生成任务清单
根据文档生成两个文件：.md和.json

#### .md文件格式
```markdown
# 任务清单

**项目名称：** {项目名称}
**版本号：** v{x.x.x}
**日期：** {当前日期}

## 主任务列表

### T001: {任务标题}
- **类型：** 前端/后端/通用
- **状态：** 未完成
- **关联UserStory：** US-001, US-002
- **上游任务：** 无
- **下游任务：** T002
- **描述：** {详细任务描述}
- **测试方法：** {如何测试}
- **验收标准：** {验收条件}

#### 子任务
- T001-1: {子任务标题} [未完成]
- T001-2: {子任务标题} [未完成]

### T002: {任务标题}
...
```

#### .json文件格式
```json
{
  "projectName": "{项目名称}",
  "version": "{版本号}",
  "tasks": [
    {
      "id": "T001",
      "title": "{任务标题}",
      "description": "{详细描述}",
      "taskType": "前端|后端|通用",
      "userStoryIds": ["US-001"],
      "upstreamTaskIds": [],
      "downstreamTaskIds": ["T002"],
      "status": "未完成",
      "testMethod": "{测试方法}",
      "acceptanceCriteria": "{验收标准}",
      "subTasks": [
        {
          "id": "T001-1",
          "title": "{子任务标题}",
          "description": "{子任务描述}",
          "userStoryIds": ["US-001"],
          "status": "未完成",
          "testMethod": "{测试方法}",
          "acceptanceCriteria": "{验收标准}"
        }
      ]
    }
  ]
}
```

### 3. 任务拆分规则
- 主任务按功能模块或UserStory划分
- 每个主任务可拆分为多个子任务
- 主任务间标注上下游依赖关系
- 主任务标注类型：前端/后端/通用
- 每个任务写清测试方法和验收标准
- 任务粒度要足够细，一个子任务对应一个小功能点

### 4. 信息收集
- 对于引用的外部代码或包，通过搜索本地代码和网上查询收集信息
- 确保对技术方案有足够把握后再编写任务
- 必要时向用户提问澄清需求

### 5. 写入文件
使用impm_doc_writer写入.md文件，使用impm_task_manager（action=init）初始化.json文件。

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
