/**
 * impm_doc_version - 版本号管理工具
 *
 * 管理项目文档的版本号。版本号确定规则：
 * 1. 如果提示词或文档中指定了版本号，直接使用
 * 2. 否则扫描 docs/requires/ 目录，取最新版本的修订号+1
 * 3. 如果目录为空，默认使用 0.0.1
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
    extractVersionFromFileName,
    compareVersions,
    isValidVersion,
    formatVersion,
} from "../utils/version.js";

/** 版本号管理工具的输入参数 */
interface DocVersionArgs {
    projectRoot: string; // 项目根目录绝对路径
    action: "next" | "current"; // 操作类型：next=获取下一个版本号, current=获取当前最新版本号
    hintVersion?: string; // 提示版本号（如果已指定则优先使用）
}

/** 工具定义 */
export const docVersionDefinition = {
    description: "管理impm文档版本号：获取当前最新版本号或计算下一个版本号",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        action: {
            type: "string" as const,
            description:
                "操作类型：next=获取下一个版本号, current=获取当前最新版本号",
        },
        hintVersion: {
            type: "string" as const,
            description:
                "提示版本号（如果提示词或文档中已指定版本号，则优先使用）",
        },
    },
};

/**
 * 执行版本号管理操作
 *
 * @param args 操作参数
 * @returns 版本号字符串
 */
export async function docVersionExecute(args: DocVersionArgs): Promise<string> {
    const { projectRoot, action, hintVersion } = args;

    // 如果提供了合法的提示版本号，直接返回
    if (hintVersion && isValidVersion(hintVersion)) {
        const cleaned = hintVersion.replace(/^v/, "");
        return cleaned;
    }

    // 扫描 docs/requires/ 目录，查找所有已有版本号
    const requiresDir = join(projectRoot, "docs/requires");
    let latestVersion = "0.0.0";

    if (existsSync(requiresDir)) {
        try {
            const files = readdirSync(requiresDir);
            const versions: string[] = [];

            for (const f of files) {
                const v = extractVersionFromFileName(f);
                if (v) {
                    versions.push(v);
                }
            }

            if (versions.length > 0) {
                versions.sort(compareVersions);
                latestVersion = versions[versions.length - 1];
            }
        } catch {
            // 目录读取失败时使用默认版本号
        }
    }

    // current 模式：直接返回最新版本
    if (action === "current") {
        if (latestVersion === "0.0.0") {
            return "当前无任何版本";
        }
        return latestVersion;
    }

    // next 模式：在最新版本基础上递增修订号
    if (latestVersion === "0.0.0") {
        return "0.0.1";
    }

    const [major, minor, patch] = latestVersion.split(".").map(Number);
    return formatVersion(major, minor, patch + 1);
}
