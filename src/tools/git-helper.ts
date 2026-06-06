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
 * impm_git_helper - Git操作工具
 * 封装impm流程中需要的git操作
 */

import {
    isGitRepo,
    createBranch,
    switchBranch,
    getCurrentBranch,
    addFiles,
    commit,
    mergeBranch,
    getStatus,
} from "../utils/git.js";

interface GitHelperArgs {
    /** 项目根目录 */
    projectRoot: string;
    /** 操作类型 */
    action: "branch" | "commit" | "merge" | "status" | "current-branch";
    /** 分支名称（branch和merge操作需要） */
    branchName?: string;
    /** 提交消息（commit操作需要） */
    message?: string;
    /** 要添加的文件列表（commit操作需要，JSON数组字符串） */
    files?: string;
}

export const gitHelperDefinition = {
    description: "Git操作封装：创建分支、提交代码、合并分支、查看状态",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        action: {
            type: "string" as const,
            description:
                "操作类型：branch=创建分支, commit=提交, merge=合并分支, status=查看状态, current-branch=当前分支",
        },
        branchName: { type: "string" as const, description: "分支名称" },
        message: { type: "string" as const, description: "提交消息" },
        files: {
            type: "string" as const,
            description: "要提交的文件列表（JSON数组字符串）",
        },
    },
};

export async function gitHelperExecute(args: GitHelperArgs): Promise<string> {
    const { projectRoot, action, branchName, message, files } = args;

    if (!isGitRepo(projectRoot)) {
        return `当前目录不是git仓库: ${projectRoot}`;
    }

    switch (action) {
        case "branch": {
            if (!branchName) {
                return "branch操作需要提供branchName参数";
            }
            return createBranch(projectRoot, branchName);
        }

        case "commit": {
            if (!message) {
                return "commit操作需要提供message参数";
            }
            const fileList: string[] = files
                ? (JSON.parse(files) as string[])
                : ["-A"];
            addFiles(projectRoot, fileList);
            return commit(projectRoot, message);
        }

        case "merge": {
            if (!branchName) {
                return "merge操作需要提供branchName参数";
            }
            return mergeBranch(projectRoot, branchName);
        }

        case "status": {
            return getStatus(projectRoot);
        }

        case "current-branch": {
            return getCurrentBranch(projectRoot);
        }

        default:
            return `不支持的操作类型: ${action}`;
    }
}
