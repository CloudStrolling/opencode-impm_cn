/**
 * opencode-impm 插件入口
 *
 * 这是"我是项目经理"（AI项目经理）OpenCode插件的入口文件。
 * 插件注册了7个自定义工具，用于文档管理、版本控制、任务调度、项目分析等。
 *
 * 使用方式：
 * 1. npm包模式：在opencode.json中配置 "plugin": ["opencode-impm"]
 * 2. 本地模式：通过 install.mjs/install.ps1 复制assets到.opencode/
 */

import { docReaderDefinition, docReaderExecute } from "./tools/doc-reader.js";
import { docWriterDefinition, docWriterExecute } from "./tools/doc-writer.js";
import {
    docVersionDefinition,
    docVersionExecute,
} from "./tools/doc-version.js";
import {
    taskManagerDefinition,
    taskManagerExecute,
} from "./tools/task-manager.js";
import {
    projectAnalyzerDefinition,
    projectAnalyzerExecute,
} from "./tools/project-analyzer.js";
import { gitHelperDefinition, gitHelperExecute } from "./tools/git-helper.js";
import {
    contextBuilderDefinition,
    contextBuilderExecute,
} from "./tools/context-builder.js";

/**
 * 创建OpenCode工具的参数schema
 * OpenCode插件使用类似zod的schema定义来描述工具参数类型
 * @param description 参数的中文描述
 */
function createStringSchema(description: string) {
    return { type: "string" as const, description };
}

function createBooleanSchema(description: string) {
    return { type: "boolean" as const, description };
}

/**
 * 插件主函数 — OpenCode在加载插件时自动调用
 *
 * @param context OpenCode运行上下文，包含项目路径、工作区等信息
 * @returns 返回工具注册表，OpenCode会自动注册这些工具供Agent使用
 */
export default async function impmPlugin(context: {
    project: { path: string };
    directory: string;
    worktree?: string;
    client?: unknown;
    $?: unknown;
}) {
    // 从上下文获取项目根目录路径
    const projectRoot = context.project?.path || context.directory;

    return {
        /** 自定义工具注册表 */
        tool: {
            /** 文档读取工具 — 从标准路径读取需求/PRD/spec/任务/架构等文档 */
            impm_doc_reader: {
                description: docReaderDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    docType: createStringSchema(
                        "文档类型：requirement | prd | spec | task | architect | project",
                    ),
                    version: createStringSchema(
                        "版本号（可选，不传则自动获取最新版本）",
                    ),
                    projectName: createStringSchema("项目名称"),
                },
                async execute(args: Record<string, unknown>) {
                    return docReaderExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        docType: args.docType as string,
                        version: args.version as string | undefined,
                        projectName: args.projectName as string | undefined,
                    });
                },
            },

            /** 文档写入工具 — 将文档内容写入标准路径，自动创建目录 */
            impm_doc_writer: {
                description: docWriterDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    docType: createStringSchema(
                        "文档类型：requirement | prd | spec | task | architect | project",
                    ),
                    version: createStringSchema("版本号"),
                    projectName: createStringSchema("项目名称"),
                    content: createStringSchema("文档内容（Markdown格式）"),
                    isJson: createBooleanSchema(
                        "是否为JSON格式（task类型专用）",
                    ),
                },
                async execute(args: Record<string, unknown>) {
                    return docWriterExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        docType: args.docType as string,
                        version: args.version as string,
                        projectName: args.projectName as string,
                        content: args.content as string,
                        isJson: args.isJson as boolean | undefined,
                    });
                },
            },

            /** 版本号管理工具 — 获取当前版本或计算下一个版本号 */
            impm_doc_version: {
                description: docVersionDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    action: createStringSchema(
                        "操作类型：next=获取下一个版本号, current=获取当前最新版本号",
                    ),
                    hintVersion: createStringSchema(
                        "提示版本号（如果提示词或文档中已指定版本号，则优先使用）",
                    ),
                },
                async execute(args: Record<string, unknown>) {
                    return docVersionExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        action: args.action as "next" | "current",
                        hintVersion: args.hintVersion as string | undefined,
                    });
                },
            },

            /** 任务状态管理工具 — 初始化/查询/更新任务清单的状态 */
            impm_task_manager: {
                description: taskManagerDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    projectName: createStringSchema("项目名称"),
                    version: createStringSchema("版本号"),
                    action: createStringSchema(
                        "操作类型：query=查询任务, update=更新任务状态, init=初始化任务清单",
                    ),
                    taskId: createStringSchema("任务ID（query和update时需要）"),
                    status: createStringSchema(
                        "新状态（update时需要）：未完成 | 执行中 | 已完成",
                    ),
                    taskListJson: createStringSchema(
                        "任务清单JSON字符串（init时需要）",
                    ),
                },
                async execute(args: Record<string, unknown>) {
                    return taskManagerExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        projectName: args.projectName as string,
                        version: args.version as string,
                        action: args.action as "query" | "update" | "init",
                        taskId: args.taskId as string | undefined,
                        status: args.status as
                            | "未完成"
                            | "执行中"
                            | "已完成"
                            | undefined,
                        taskListJson: args.taskListJson as string | undefined,
                    });
                },
            },

            /** 项目结构分析工具 — 扫描源码目录，提取文件/函数/类清单 */
            impm_project_analyzer: {
                description: projectAnalyzerDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    sourceDirs: createStringSchema(
                        "要扫描的源代码目录（逗号分隔，相对于项目根目录）",
                    ),
                    excludeDirs: createStringSchema("排除的目录（逗号分隔）"),
                },
                async execute(args: Record<string, unknown>) {
                    return projectAnalyzerExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        sourceDirs: args.sourceDirs
                            ? (args.sourceDirs as string)
                                  .split(",")
                                  .map((s: string) => s.trim())
                            : undefined,
                        excludeDirs: args.excludeDirs
                            ? (args.excludeDirs as string)
                                  .split(",")
                                  .map((s: string) => s.trim())
                            : undefined,
                    });
                },
            },

            /** Git操作工具 — 封装分支创建/提交/合并/状态查询等常用操作 */
            impm_git_helper: {
                description: gitHelperDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    action: createStringSchema(
                        "操作类型：branch=创建分支, commit=提交, merge=合并分支, status=查看状态, current-branch=当前分支",
                    ),
                    branchName: createStringSchema("分支名称"),
                    message: createStringSchema("提交消息"),
                    files: createStringSchema(
                        "要提交的文件列表（JSON数组字符串）",
                    ),
                },
                async execute(args: Record<string, unknown>) {
                    return gitHelperExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        action: args.action as
                            | "branch"
                            | "commit"
                            | "merge"
                            | "status"
                            | "current-branch",
                        branchName: args.branchName as string | undefined,
                        message: args.message as string | undefined,
                        files: args.files as string | undefined,
                    });
                },
            },

            /** 上下文构建工具 — 为编码subagent收集相关文档片段，构建精简上下文 */
            impm_context_builder: {
                description: contextBuilderDefinition.description,
                args: {
                    projectRoot: createStringSchema("项目根目录的绝对路径"),
                    projectName: createStringSchema("项目名称"),
                    version: createStringSchema("版本号"),
                    taskId: createStringSchema("任务ID"),
                    taskType: createStringSchema(
                        "任务类型：frontend | backend | common",
                    ),
                },
                async execute(args: Record<string, unknown>) {
                    return contextBuilderExecute({
                        projectRoot:
                            (args.projectRoot as string) || projectRoot,
                        projectName: args.projectName as string,
                        version: args.version as string,
                        taskId: args.taskId as string,
                        taskType: args.taskType as
                            | "frontend"
                            | "backend"
                            | "common",
                    });
                },
            },
        },
    };
}

/**
 * 兼容ESM和CommonJS的导出方式
 * OpenCode同时支持 default export 和 named export
 */
export { impmPlugin as plugin };
