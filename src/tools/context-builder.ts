/**
 * impm_context_builder - 上下文构建工具
 * 根据任务类型和编号，收集相关文档片段，构建精简上下文
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DOC_TYPE_DIR, getDocFileName } from "../utils/paths.js";
import {
    extractVersionFromFileName,
    compareVersions,
} from "../utils/version.js";
import { readdirSync } from "node:fs";
import type { TaskList, MainTask } from "./task-manager.js";
import { getTaskJsonPath } from "../utils/paths.js";

interface ContextBuilderArgs {
    /** 项目根目录 */
    projectRoot: string;
    /** 项目名称 */
    projectName: string;
    /** 版本号 */
    version: string;
    /** 任务ID */
    taskId: string;
    /** 任务类型：frontend | backend | common */
    taskType: "frontend" | "backend" | "common";
}

export const contextBuilderDefinition = {
    description:
        "为编码subagent构建精简上下文：根据任务ID收集相关PRD、架构、spec片段",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        projectName: { type: "string" as const, description: "项目名称" },
        version: { type: "string" as const, description: "版本号" },
        taskId: { type: "string" as const, description: "任务ID" },
        taskType: {
            type: "string" as const,
            description: "任务类型：frontend | backend | common",
        },
    },
};

export async function contextBuilderExecute(
    args: ContextBuilderArgs,
): Promise<string> {
    const { projectRoot, projectName, version, taskId, taskType } = args;

    const sections: string[] = [];

    // 1. 读取任务信息
    const taskJsonPath = getTaskJsonPath(projectRoot, projectName, version);
    if (existsSync(taskJsonPath)) {
        try {
            const taskList: TaskList = JSON.parse(
                readFileSync(taskJsonPath, "utf-8"),
            );
            const task = taskList.tasks.find((t) => t.id === taskId);
            if (task) {
                sections.push(`# 当前任务\n${formatTask(task)}`);
            } else {
                sections.push(`# 当前任务\n未找到任务ID: ${taskId}`);
            }
        } catch {
            sections.push(`# 当前任务\n任务文件读取失败`);
        }
    }

    // 2. 读取project.md
    const projectMdPath = join(projectRoot, "project.md");
    if (existsSync(projectMdPath)) {
        const content = readFileSync(projectMdPath, "utf-8");
        // 提取Coding Conventions部分
        const conventionsMatch = content.match(
            /# Coding Conventions\n([\s\S]*?)(?=\n# |$)/,
        );
        if (conventionsMatch) {
            sections.push(`# 编码规范\n${conventionsMatch[1].trim()}`);
        }
    }

    // 3. 读取架构文档
    const archPath = join(projectRoot, "ARCHITECTURE.md");
    if (existsSync(archPath)) {
        const content = readFileSync(archPath, "utf-8");
        // 根据任务类型提取相关架构部分
        const relevantSections = extractRelevantArchitecture(content, taskType);
        sections.push(`# 相关架构设计\n${relevantSections}`);
    }

    // 4. 读取PRD中相关的UserStory
    const prdDir = join(projectRoot, DOC_TYPE_DIR.prd);
    const prdContent = findAndReadDoc(prdDir, projectName, "prd", version);
    if (prdContent) {
        // 提取与任务关联的UserStory
        const relevantStories = extractRelevantUserStories(prdContent, taskId);
        if (relevantStories) {
            sections.push(`# 相关用户故事\n${relevantStories}`);
        }
    }

    // 5. 读取spec
    const specDir = join(projectRoot, DOC_TYPE_DIR.spec);
    const specContent = findAndReadDoc(specDir, projectName, "spec", version);
    if (specContent) {
        sections.push(`# 技术规格\n${specContent}`);
    }

    return sections.join("\n\n---\n\n");
}

/**
 * 格式化任务信息
 */
function formatTask(task: MainTask): string {
    let output = `- ID: ${task.id}\n`;
    output += `- 标题: ${task.title}\n`;
    output += `- 类型: ${task.taskType}\n`;
    output += `- 描述: ${task.description}\n`;
    output += `- 关联UserStory: ${task.userStoryIds.join(", ")}\n`;
    output += `- 测试方法: ${task.testMethod}\n`;
    output += `- 验收标准: ${task.acceptanceCriteria}\n`;

    if (task.subTasks.length > 0) {
        output += `\n子任务:\n`;
        for (const sub of task.subTasks) {
            output += `  - [${sub.status}] ${sub.id}: ${sub.title}\n`;
        }
    }

    return output;
}

/**
 * 根据任务类型提取相关的架构部分
 */
function extractRelevantArchitecture(
    content: string,
    taskType: string,
): string {
    const sections: string[] = [];
    const lines = content.split("\n");
    let inRelevantSection = false;
    let currentSectionLevel = 0;

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const title = headingMatch[2].toLowerCase();

            if (level <= 2) {
                inRelevantSection = false;
                currentSectionLevel = level;
            }

            // 判断是否与任务类型相关
            if (
                title.includes("总体") ||
                title.includes("overview") ||
                title.includes("全局") ||
                (taskType === "frontend" &&
                    (title.includes("前端") || title.includes("front"))) ||
                (taskType === "backend" &&
                    (title.includes("后端") ||
                        title.includes("back") ||
                        title.includes("api"))) ||
                (taskType === "common" &&
                    (title.includes("通用") || title.includes("common")))
            ) {
                inRelevantSection = true;
            }
        }

        if (inRelevantSection) {
            sections.push(line);
        }
    }

    return sections.length > 0
        ? sections.join("\n")
        : content.substring(0, 3000);
}

/**
 * 从PRD中提取与任务关联的UserStory
 */
function extractRelevantUserStories(
    prdContent: string,
    taskId: string,
): string {
    // 简单提取：按## 分割，返回所有UserStory段落
    const stories = prdContent.split(/\n(?=##\s)/);
    return stories.slice(0, 10).join("\n");
}

/**
 * 在目录中查找并读取文档
 */
function findAndReadDoc(
    dir: string,
    projectName: string,
    docType: string,
    version: string,
): string | null {
    if (!existsSync(dir)) return null;

    const prefix =
        docType === "requirement"
            ? "requirement"
            : docType === "prd"
              ? "prd"
              : docType === "spec"
                ? "spec"
                : docType === "task"
                  ? "task"
                  : null;

    if (!prefix) return null;

    try {
        const fileName = getDocFileName(projectName, docType, version);
        const filePath = join(dir, fileName);
        if (existsSync(filePath)) {
            return readFileSync(filePath, "utf-8");
        }
        return null;
    } catch {
        return null;
    }
}
