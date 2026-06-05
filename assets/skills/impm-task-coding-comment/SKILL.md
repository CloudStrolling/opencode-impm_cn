---
name: impm-task-coding-comment
description: 执行编码9 - 代码注释
---

# impm-task-coding-comment 技能

## 触发词
impm-task-coding-comment

## 何时使用
- 针对一个任务进行具体编码的第九步：代码注释

## 执行内容

### PM启用TW subagent来执行代码注释任务

### 查询本任务修改的所有代码
  可以通过本次git中新增和修改的文件中的代码文件来确定本任务中的所有代码

### 注释内容：
  - 每个文件要有对整个文件的注释
  - 每个函数要有对函数的注释，包括函数功能，参数等。
  - 关键的代码块，字典表，重要变量都要有说明和注释。

### 后续处理
task状态改为comment-finish  返回PM

