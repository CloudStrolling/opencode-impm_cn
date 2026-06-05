# 项目基本信息

**项目中文名称:** OpenCode IMPM（AI项目经理）
**项目名称:** opencode-impm
**编程语言:** TypeScript
**项目类型:** OpenCode Plugin（Node.js插件）
**本地化语言:** 简体中文
**项目总体介绍：** 基于OpenCode平台构建的AI项目经理插件，实现完整的工程化全流程开发管理。通过编排多个专业subagent（BA、SA、TL、TE、FE、BE等），按照TDD驱动和文档驱动的方式，自动化执行从需求分析、架构设计、任务分配、编码实现到文档生成的完整软件工程生命周期。

---

# 编码规范

## 文件组织规范
- 采用模块化设计，每个工具函数单独文件
- 工具函数放在 `src/tools/` 目录，通用工具放在 `src/utils/` 目录
- 入口文件 `src/index.ts` 负责工具注册和插件初始化
- 文档和配置文件放在 `docs/` 和 `.opencode/` 目录

## 命名规范
- **变量和函数：** 使用 camelCase（如 `projectRoot`、`docReaderExecute`）
- **类和接口：** 使用 PascalCase（如 `DocReaderArgs`、`TaskList`）
- **常量：** 使用 UPPER_CASE（如 `DOC_TYPE_DIR`、`DEFAULT_EXCLUDES`）
- **文件名：** 使用 kebab-case（如 `doc-reader.ts`、`task-manager.ts`）

## 代码风格
- 使用 2 空格缩进
- 使用单引号字符串，语句末尾加分号
- 使用 ESM 模块系统（import/export）
- 避免使用 `any` 类型，优先使用具体类型或 `unknown`
- 异步操作使用 async/await 语法

## 注释规范
- 公共API使用 JSDoc 注释（`/** ... */`）
- 复杂逻辑使用行内注释（`// ...`）
- 文件头部使用多行注释说明模块功能
- 函数参数和返回值使用 JSDoc `@param` 和 `@returns`

## 日志规范
- 使用 `console.log` 输出常规信息
- 使用 `console.warn` 输出警告信息
- 使用 `console.error` 输出错误信息
- 生产环境避免输出调试日志

## 测试规范
- 每个工具函数编写单元测试
- 测试文件放在 `__tests__/` 目录，与源文件对应
- 测试描述使用中文，清晰说明测试场景
- 使用 TDD 方式开发，先写测试再写实现

## 统一错误处理规范
- 使用 try-catch 捕获异常
- 错误信息使用中文描述，便于调试
- 工具函数返回错误消息字符串，不抛出异常
- 重要操作前进行参数校验

## 其他规范
- 使用 Node.js 内置模块（fs、path、child_process）
- 避免引入外部依赖，保持轻量级
- 文件路径使用绝对路径，避免相对路径歧义
- 不修改全局对象，避免副作用

---

# 项目地图

## src/ - 项目核心源代码目录

### src/tools/ - 工具函数实现目录，每个文件注册一个独立的impm工具

#### src/tools/doc-reader.ts
文档读取工具，从标准路径读取项目文档，自动处理版本号查找和项目名称推断。

- `docReaderDefinition` - 工具定义对象，描述工具功能和参数
- `docReaderExecute(args)` - 执行文档读取操作，根据文档类型读取对应文件内容
- `findLatestVersion(dir, docType)` - 在目录中查找某个文档类型的最新版本号
- `inferProjectName(dir, docType, version)` - 从目录中的文件名推断项目名称

#### src/tools/doc-writer.ts
文档写入工具，将生成的文档内容写入标准路径，自动创建不存在的目录。

- `docWriterDefinition` - 工具定义对象
- `docWriterExecute(args)` - 执行文档写入操作，返回写入结果消息

#### src/tools/doc-version.ts
版本号管理工具，获取当前最新版本号或计算下一个版本号。

- `docVersionDefinition` - 工具定义对象
- `docVersionExecute(args)` - 执行版本号管理操作，返回版本号字符串

#### src/tools/task-manager.ts
任务状态管理工具，初始化、查询、更新任务清单的状态。

- `taskManagerDefinition` - 工具定义对象
- `taskManagerExecute(args)` - 执行任务管理操作，返回操作结果
- `findTask(taskList, taskId)` - 在任务清单中查找指定ID的任务（支持主任务和子任务）

#### src/tools/project-analyzer.ts
项目结构分析工具，扫描项目源代码文件，按目录层级分组，提取文件描述和函数/类列表。

- `projectAnalyzerDefinition` - 工具定义对象
- `projectAnalyzerExecute(args)` - 执行项目分析，返回Markdown格式的项目地图
- `getDirDescription(dirName, parentPath)` - 获取目录描述（基于目录名或上下文）
- `extractFileDescription(content, ext)` - 从JSDoc或文件头部注释提取文件描述
- `extractFunctionDescription(content, lineIndex)` - 提取函数前的注释行作为函数描述
- `scanDirectory(dir, rootDir, excludes, rootDirs)` - 递归扫描目录，构建目录树
- `getOrCreateDir(parentMap, dirPath, dirName)` - 获取或创建目录节点
- `extractFunctions(filePath, ext)` - 从源代码文件中提取函数/类签名
- `countFiles(dirMap)` - 统计目录树中的文件总数
- `renderDirTree(dirMap, basePath, level)` - 渲染目录树为Markdown格式
- `formatProjectMap(rootDirs, projectRoot)` - 格式化为Markdown项目地图
- `countDirs(dirMap)` - 统计目录树中的目录总数

#### src/tools/git-helper.ts
Git操作工具，封装impm流程中需要的git操作。

- `gitHelperDefinition` - 工具定义对象
- `gitHelperExecute(args)` - 执行Git操作，根据action类型分发到不同的git命令

#### src/tools/context-builder.ts
上下文构建工具，根据任务类型和编号，收集相关文档片段，构建精简上下文。

- `contextBuilderDefinition` - 工具定义对象
- `contextBuilderExecute(args)` - 执行上下文构建，返回组合文档内容
- `formatTask(task)` - 格式化任务信息为可读文本
- `extractRelevantArchitecture(content, taskType)` - 根据任务类型提取相关的架构部分
- `extractRelevantUserStories(prdContent, taskId)` - 从PRD中提取与任务关联的UserStory
- `findAndReadDoc(dir, projectName, docType, version)` - 在目录中查找并读取文档

### src/utils/ - 通用工具函数目录，提供路径、版本号等辅助功能

#### src/utils/paths.ts
路径常量和工具函数，定义impm插件使用的所有标准目录路径和文件命名规则。

- `DOC_DIRS` - impm标准目录名称映射
- `TEMPLATES_DIR` - 技能模板目录路径（相对于项目根目录）
- `DOC_TYPE_DIR` - 文档类型到目录路径的映射
- `DOC_TYPE_PREFIX` - 文档类型到文件名前缀的映射
- `DOC_TYPE_EXT` - 文档类型到文件扩展名的映射
- `getDocFileName(projectName, docType, version)` - 根据项目名称、文档类型和版本号生成标准文件名
- `getDocFilePath(projectRoot, projectName, docType, version)` - 生成文档的完整路径
- `getTaskJsonPath(projectRoot, projectName, version)` - 获取任务JSON文件的完整路径

#### src/utils/git.ts
Git操作工具函数，基于 child_process.execSync 封装常用的git命令操作。

- `gitExec(cwd, command)` - 执行git命令并返回标准输出
- `isGitRepo(cwd)` - 检查当前目录是否为git仓库
- `createBranch(cwd, branchName)` - 创建并切换到新分支
- `switchBranch(cwd, branchName)` - 切换到已有分支
- `getCurrentBranch(cwd)` - 获取当前所在分支名称
- `addFiles(cwd, files)` - 添加文件到git暂存区
- `commit(cwd, message)` - 提交暂存区的内容
- `mergeBranch(cwd, branchName)` - 合并指定分支到当前分支
- `getStatus(cwd)` - 获取git仓库的当前状态摘要

#### src/utils/version.ts
版本号工具函数集，处理语义化版本号（SemVer）的解析、比较、递增等操作。

- `parseVersion(version)` - 解析版本号字符串为数字数组
- `formatVersion(major, minor, patch)` - 将三个版本号分量格式化为字符串
- `incrementPatch(version)` - 递增修订号（第三位版本号+1）
- `compareVersions(a, b)` - 比较两个版本号的大小
- `extractVersionFromFileName(fileName)` - 从文件名中提取版本号
- `isValidVersion(version)` - 验证版本号字符串是否合法

## src/index.ts - 插件入口
opencode-impm插件入口，注册7个自定义工具，用于文档管理、版本控制、任务调度、项目分析等。

- `impmPlugin(context)` - 插件主函数，OpenCode在加载插件时自动调用，返回工具注册表
- `createStringSchema(description)` - 创建字符串类型参数schema
- `createBooleanSchema(description)` - 创建布尔类型参数schema
