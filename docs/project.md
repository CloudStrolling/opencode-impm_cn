# Project Info

**Project Name:** 我是项目经理
**Project Code:** opencode-impm
**Programming Language:** TypeScript, JavaScript
**Project Type:** opencode插件
**Local Language:** 简体中文
**Project Overview:** AI项目经理插件 - 基于OpenCode的工程化全流程开发插件，通过PM Agent编排多个专业subagent，按照需求→PRD→架构→Spec→任务→编码→文档的完整流程完成软件工程开发。

---

# Coding Conventions

## 命名规范
- **变量/函数：** 使用 `camelCase`（小驼峰），如 `getDocFileName`、`projectRoot`
- **类/类型/接口：** 使用 `PascalCase`（大驼峰），如 `MainTask`、`TaskList`、`DocReaderArgs`
- **常量：** 使用 `UPPER_SNAKE_CASE`（全大写+下划线），如 `DEFAULT_EXCLUDES`、`SOURCE_EXTENSIONS`
- **文件/目录名：** 使用 `kebab-case`（短横线分隔），如 `context-builder.ts`、`task-manager.ts`

## 文件组织
- 按功能模块划分目录：`src/tools/`（工具实现）、`src/utils/`（工具函数）
- 每个文件一个主要导出（类或函数），辅以配套的私有辅助函数
- 工具文件需同时导出 `{name}Definition`（工具定义对象）和 `{name}Execute`（执行函数）
- 资源文件（Agent提示词、技能定义）存放在 `assets/` 目录

## 代码风格
- **严格模式：** 使用 TypeScript 严格模式（`strict: true`），启用完整类型检查
- **模块系统：** 使用 ES Module（`import/export`），编译为 CommonJS 以供 Node.js 使用
- **异步优先：** 工具执行函数统一使用 `async function`，但内部文件操作为简化使用同步API
- **类型定义：** 优先使用 `interface` 定义对象类型，使用 `type` 定义联合类型/工具类型
- **参数接口：** 每个工具函数的参数统一使用独立的 `interface` 定义，确保类型安全

## 注释规范
- **公共API：** 使用 JSDoc 注释（`/** ... */`）为每个导出的函数/类/接口编写文档
- **文件头：** 每个源文件顶部使用 JSDoc 说明文件功能和作者
- **复杂逻辑：** 关键算法和复杂判断需添加内联注释说明设计意图
- **类型注释：** 工具定义（`definition`）中的字段需附带清晰的 `description` 供OpenCode Agent理解

---

# Project Map

共扫描 11 个源代码文件

## src/index.ts
- `createStringSchema(description)` - 创建OpenCode工具参数的string类型Schema
- `createBooleanSchema(description)` - 创建OpenCode工具参数的boolean类型Schema
- `impmPlugin(context)` - 插件主函数，注册7个impm工具（doc_reader/doc_writer/doc_version/task_manager/project_analyzer/git_helper/context_builder）

## src/tools/context-builder.ts
- `contextBuilderExecute(args)` - 根据任务ID和类型，收集相关PRD/架构/spec片段，为编码subagent构建精简上下文
- `formatTask(task)` - 格式化任务信息为可读文本
- `extractRelevantArchitecture(content, taskType)` - 根据任务类型（frontend/backend/common）提取ARCHITECTURE.md中相关章节
- `extractRelevantUserStories(prdContent, taskId)` - 从PRD文档中提取与任务关联的UserStory段落
- `findAndReadDoc(dir, projectName, docType, version)` - 在指定文档目录中查找并读取文档内容

## src/tools/doc-reader.ts
- `docReaderExecute(args)` - 执行文档读取操作，支持固定文件（project.md/ARCHITECTURE.md）和版本化文档的自动版本查找
- `findLatestVersion(dir, docType)` - 扫描文档目录，提取并比较版本号，返回最新版本号
- `inferProjectName(dir, docType, version)` - 通过文件名模式匹配，从已有文档反向推断项目名称

## src/tools/doc-version.ts
- `docVersionExecute(args)` - 执行版本号管理操作（获取当前最新版本号或计算下一个版本号）
- 内部扫描 docs/requires/ 目录，支持 hintVersion 优先规则

## src/tools/doc-writer.ts
- `docWriterExecute(args)` - 执行文档写入操作，自动创建目录；task类型同时生成.md和.json两个文件

## src/tools/git-helper.ts
- `gitHelperExecute(args)` - 执行Git操作封装（创建分支/提交代码/合并分支/查看状态/获取当前分支）

## src/tools/project-analyzer.ts
- `projectAnalyzerExecute(args)` - 执行项目结构分析，扫描源代码目录并生成Markdown格式的Project Map
- `scanDirectory(dir, rootDir, excludes, result)` - 递归扫描目录，收集源代码文件并提取函数/类签名
- `extractFunctions(filePath, ext)` - 根据文件扩展名（支持.ts/.tsx/.js/.py/.go/.java等），使用正则提取函数/类声明签名

## src/tools/task-manager.ts
- `taskManagerExecute(args)` - 执行任务清单管理操作（init初始化/query查询/update更新状态）
- `findTask(taskList, taskId)` - 在任务清单中递归查找指定ID的主任务或子任务

## src/utils/git.ts
- `gitExec(cwd, command)` - 执行git命令并返回标准输出，封装 execSync 调用
- `isGitRepo(cwd)` - 检查指定目录是否为git仓库
- `createBranch(cwd, branchName)` - 创建并切换到新的git分支
- `switchBranch(cwd, branchName)` - 切换到已有的git分支
- `getCurrentBranch(cwd)` - 获取当前所在分支名称
- `addFiles(cwd, files)` - 添加文件到git暂存区
- `commit(cwd, message)` - 提交暂存区内容到git仓库
- `mergeBranch(cwd, branchName)` - 合并指定分支到当前分支
- `getStatus(cwd)` - 获取git仓库的当前状态摘要

## src/utils/paths.ts
- `getDocFileName(projectName, docType, version)` - 根据项目名称、文档类型和版本号生成标准文件名
- `getDocFilePath(projectRoot, projectName, docType, version)` - 生成文档的完整绝对路径
- `getTaskJsonPath(projectRoot, projectName, version)` - 获取任务清单JSON文件的完整路径

## src/utils/version.ts
- `parseVersion(version)` - 解析语义化版本号字符串为[主, 次, 修订]数字数组
- `formatVersion(major, minor, patch)` - 将三个版本号分量格式化为 "x.y.z" 字符串
- `incrementPatch(version)` - 递增版本号的修订号（第三位+1）
- `compareVersions(a, b)` - 比较两个语义化版本号的大小
- `extractVersionFromFileName(fileName)` - 从标准文档文件名中提取版本号
- `isValidVersion(version)` - 验证版本号字符串是否为合法的语义化版本号

---

