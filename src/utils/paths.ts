/**
 * Copyright 2026 jenemy8023 <jenemy8023@163.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 路径常量和工具函数
 *
 * 定义impm插件使用的所有标准目录路径和文件命名规则。
 * 统一的路径管理确保所有工具读写文档时使用一致的目录结构。
 */

import { join } from "node:path";

/** impm标准目录名称映射 */
export const DOC_DIRS = {
    docs: "docs",
    sds: "docs/sds",
    requires: "docs/requires",
    tasks: "docs/tasks",
    prds: "docs/prds",
} as const;

/** 技能模板目录路径（相对于项目根目录） */
export const TEMPLATES_DIR = ".opencode/skills";

/**
 * 文档类型到目录路径的映射
 * 每种文档类型对应一个标准存储目录
 */
export const DOC_TYPE_DIR: Record<string, string> = {
    requirement: DOC_DIRS.requires, // 需求文档 → docs/requires/
    prd: DOC_DIRS.prds, // PRD文档 → docs/prds/
    sds: DOC_DIRS.sds, // 技术规格 → docs/sds/
    task: DOC_DIRS.tasks, // 任务清单 → docs/tasks/
    architect: DOC_DIRS.docs, // 架构文档 → docs/architecture.md
    project: DOC_DIRS.docs, // 项目信息 → docs/project.md
};

/** 文档类型到文件名前缀的映射 */
export const DOC_TYPE_PREFIX: Record<string, string> = {
    requirement: "requirement",
    prd: "prd",
    sds: "sds",
    task: "task",
    architect: "architecture",
    project: "project",
};

/** 文档类型到文件扩展名的映射 */
export const DOC_TYPE_EXT: Record<string, string> = {
    requirement: ".md",
    prd: ".md",
    sds: ".md",
    task: ".md",
    architect: ".md",
    project: ".md",
};

/**
 * 根据项目名称、文档类型和版本号生成标准文件名
 *
 * 命名规则：
 * - 架构/项目文档：直接使用固定文件名（ARCHITECTURE.md / project.md）
 * - 版本化文档：{项目名称}-{文档类型}-v{版本号}.md
 *
 * @param projectName 项目名称（如 opencode-impm）
 * @param docType 文档类型（requirement/prd/sds/task）
 * @param version 版本号（如 0.1.0）
 * @returns 标准化的文件名（不含目录路径）
 */
export function getDocFileName(
    projectName: string,
    docType: string,
    version: string,
): string {
    const prefix = DOC_TYPE_PREFIX[docType];
    const ext = DOC_TYPE_EXT[docType] || ".md";

    // 架构文档和项目文档使用固定文件名
    if (docType === "architect") {
        return `${prefix}${ext}`;
    }
    if (docType === "project") {
        return `${prefix}${ext}`;
    }
    // 版本化文档采用 "{项目名}-{类型}-v{版本}.md" 格式
    return `${projectName}-${prefix}-v${version}${ext}`;
}

/**
 * 生成文档的完整路径（含项目根目录）
 *
 * @param projectRoot 项目根目录绝对路径
 * @param projectName 项目名称
 * @param docType 文档类型
 * @param version 版本号
 * @returns 文档的完整绝对路径
 */
export function getDocFilePath(
    projectRoot: string,
    projectName: string,
    docType: string,
    version: string,
): string {
    const dir = DOC_TYPE_DIR[docType];
    const fileName = getDocFileName(projectName, docType, version);
    return join(projectRoot, dir, fileName);
}

/**
 * 获取任务JSON文件的完整路径
 * 任务清单同时生成 .md（可读文档）和 .json（程序化管理）两个文件
 *
 * @param projectRoot 项目根目录绝对路径
 * @param projectName 项目名称
 * @param version 版本号
 * @returns 任务JSON文件的完整绝对路径
 */
export function getTaskJsonPath(
    projectRoot: string,
    projectName: string,
    version: string,
): string {
    return join(
        projectRoot,
        DOC_DIRS.tasks,
        `${projectName}-task-v${version}.json`,
    );
}
