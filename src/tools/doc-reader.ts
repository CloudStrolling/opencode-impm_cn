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
 * impm_doc_reader - 文档读取工具
 *
 * 从标准路径读取项目文档，自动处理版本号查找和项目名称推断。
 * 支持两种文档类型：
 * - 固定文件：docs/project.md（项目信息）、ARCHITECTURE.md（架构文档）
 * - 版本化文件：docs/{type}/ 目录下的带版本号md文件
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DOC_TYPE_DIR, getDocFileName, TEMPLATES_DIR } from "../utils/paths.js";
import {
    extractVersionFromFileName,
    compareVersions,
    isValidVersion,
} from "../utils/version.js";

/** 文档读取工具的输入参数 */
interface DocReaderArgs {
    projectRoot: string; // 项目根目录绝对路径
    docType: string; // 文档类型：requirement | prd | sds | task | architect | project
    version?: string; // 版本号（可选，不传则自动查找最新版本）
    projectName?: string; // 项目名称（可选，不传则从文件名推断）
}

/** 工具定义（供index.ts注册用） */
export const docReaderDefinition = {
    description:
        "读取impm项目文档（需求文档、PRD、sds、task、架构文档、project.md、技能模板）",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        docType: {
            type: "string" as const,
            description:
                "文档类型：requirement | prd | sds | task | architect | project | template",
        },
        version: {
            type: "string" as const,
            description: "版本号（可选，不传则自动获取最新版本）",
        },
        projectName: {
            type: "string" as const,
            description: "项目名称（task类型需要）",
        },
    },
};

/**
 * 执行文档读取操作
 *
 * 流程：判断文档类型 → project/architect直接读固定路径 → 其他类型查找版本号 → 读取文件
 *
 * @param args 读取参数
 * @returns 文档内容字符串
 */
export async function docReaderExecute(args: DocReaderArgs): Promise<string> {
    const { projectRoot, docType, version, projectName } = args;

    // project.md 和 ARCHITECTURE.md 不涉及版本号
    if (docType === "project") {
        const filePath = join(projectRoot, "docs", "project.md");
        if (!existsSync(filePath)) {
            return "project.md 文件不存在";
        }
        return readFileSync(filePath, "utf-8");
    }

    // 模板文件从 .opencode/skills/{skillName}/ 读取
    if (docType === "template") {
        const skillName = projectName || "impm-project-update";
        const templateDir = join(projectRoot, TEMPLATES_DIR, skillName);
        const filePath = join(templateDir, "PROJECT-TEMPLATE.MD");
        if (!existsSync(filePath)) {
            return `模板文件不存在: ${filePath}`;
        }
        return readFileSync(filePath, "utf-8");
    }

    if (docType === "architect") {
        const filePath = join(projectRoot, "ARCHITECTURE.md");
        if (!existsSync(filePath)) {
            return "ARCHITECTURE.md 文件不存在";
        }
        return readFileSync(filePath, "utf-8");
    }

    // 版本化文档需要查找对应的目录和文件名
    const docDir = DOC_TYPE_DIR[docType];
    if (!docDir) {
        return `不支持的文档类型: ${docType}。支持: requirement, prd, sds, task, architect, project, template`;
    }

    const fullDir = join(projectRoot, docDir);
    if (!existsSync(fullDir)) {
        return `文档目录不存在: ${docDir}`;
    }

    // 如果未指定版本号，自动扫描目录查找最新版本
    let targetVersion = version;
    if (!targetVersion) {
        targetVersion = findLatestVersion(fullDir, docType) ?? undefined;
        if (!targetVersion) {
            return `在 ${docDir} 目录下未找到 ${docType} 类型的文档`;
        }
    }

    // 如果未提供项目名称，尝试从已有文件名推断
    let name = projectName;
    if (!name) {
        name = inferProjectName(fullDir, docType, targetVersion) ?? undefined;
        if (!name) {
            return `无法确定项目名称，请提供 projectName 参数`;
        }
    }

    // 组装完整路径并读取文件
    const fileName = getDocFileName(name, docType, targetVersion);
    const filePath = join(fullDir, fileName);

    if (!existsSync(filePath)) {
        return `文档文件不存在: ${filePath}`;
    }

    return readFileSync(filePath, "utf-8");
}

/**
 * 在指定目录中查找某个文档类型的最新版本号
 *
 * 扫描目录中所有文件，匹配 "{任意名}-{docType前缀}-v{版本号}.md" 格式的文件名，
 * 取版本号最大的作为最新版本
 *
 * @param dir 要扫描的目录
 * @param docType 文档类型
 * @returns 最新版本号字符串，未找到返回null
 */
function findLatestVersion(dir: string, docType: string): string | null {
    // 确定文件名中的关键字前缀
    const prefix =
        docType === "requirement"
            ? "requirement"
            : docType === "prd"
              ? "prd"
              : docType === "sds"
                ? "sds"
              : docType === "task"
                ? "task"
                : null;

    if (!prefix) return null;

    try {
        const files = readdirSync(dir);
        const versions: string[] = [];
        for (const f of files) {
            // 提取版本号并确认文件类型匹配
            const v = extractVersionFromFileName(f);
            if (v && f.includes(`-${prefix}-v`)) {
                versions.push(v);
            }
        }
        if (versions.length === 0) return null;
        // 排序后取最后一个（最大版本号）
        versions.sort(compareVersions);
        return versions[versions.length - 1];
    } catch {
        return null;
    }
}

/**
 * 从目录中的文件名推断项目名称
 *
 * 文件名格式：{项目名称}-{文档类型}-v{版本号}.md
 * 通过已知的文档类型和版本号，反向匹配出项目名称
 *
 * @param dir 文档目录
 * @param docType 文档类型
 * @param version 版本号
 * @returns 项目名称字符串，未找到返回null
 */
function inferProjectName(
    dir: string,
    docType: string,
    version: string,
): string | null {
    const prefix =
        docType === "requirement"
            ? "requirement"
            : docType === "prd"
              ? "prd"
              : docType === "sds"
                ? "sds"
              : docType === "task"
                  ? "task"
                  : null;

    if (!prefix) return null;

    try {
        const files = readdirSync(dir);
        // 构造正则匹配文件名：{项目名}-{前缀}-v{版本}.md
        const pattern = new RegExp(
            `^(.+)-${prefix}-v${version.replace(/\./g, "\\.")}\\.md$`,
        );
        for (const f of files) {
            const match = f.match(pattern);
            if (match) return match[1];
        }
        return null;
    } catch {
        return null;
    }
}
