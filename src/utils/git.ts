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
 * Git操作工具函数
 *
 * 基于 child_process.execSync 封装常用的git命令操作。
 * 这些底层函数被 git-helper 工具调用，实现impm流程中的版本控制需求。
 */

import { execSync } from "node:child_process";

/**
 * 执行git命令并返回标准输出
 *
 * @param cwd 执行git命令的工作目录（项目根目录）
 * @param command git子命令（不包含"git"前缀），如 "status --short"
 * @returns 命令的标准输出字符串
 * @throws 如果git命令执行失败，抛出包含错误信息的Error
 */
function gitExec(cwd: string, command: string): string {
    try {
        return execSync(`git ${command}`, {
            cwd, // 在工作目录下执行
            encoding: "utf-8", // 输出编码为UTF-8
            stdio: ["pipe", "pipe", "pipe"], // 不继承父进程stdio
        }).trim();
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Git命令执行失败: git ${command}\n${msg}`);
    }
}

/**
 * 检查当前目录是否为git仓库
 * 通过执行 git rev-parse --is-inside-work-tree 判断
 *
 * @param cwd 要检查的目录
 * @returns 是否为git仓库
 */
export function isGitRepo(cwd: string): boolean {
    try {
        gitExec(cwd, "rev-parse --is-inside-work-tree");
        return true;
    } catch {
        return false;
    }
}

/**
 * 创建并切换到新分支
 *
 * @param cwd 项目根目录
 * @param branchName 新分支名称
 * @returns 操作结果消息
 */
export function createBranch(cwd: string, branchName: string): string {
    gitExec(cwd, `checkout -b "${branchName}"`);
    return `分支 ${branchName} 创建成功`;
}

/**
 * 切换到已有分支
 *
 * @param cwd 项目根目录
 * @param branchName 目标分支名称
 * @returns 操作结果消息
 */
export function switchBranch(cwd: string, branchName: string): string {
    gitExec(cwd, `checkout "${branchName}"`);
    return `已切换到分支 ${branchName}`;
}

/**
 * 获取当前所在分支名称
 *
 * @param cwd 项目根目录
 * @returns 当前分支名称
 */
export function getCurrentBranch(cwd: string): string {
    return gitExec(cwd, "branch --show-current");
}

/**
 * 添加文件到git暂存区
 *
 * @param cwd 项目根目录
 * @param files 要添加的文件路径列表（相对于项目根目录）
 */
export function addFiles(cwd: string, files: string[]): void {
    // 将文件路径用引号包裹后加入命令
    const fileArgs = files.map((f) => `"${f}"`).join(" ");
    gitExec(cwd, `add ${fileArgs}`);
}

/**
 * 提交暂存区的内容
 *
 * @param cwd 项目根目录
 * @param message 提交信息
 * @returns 提交结果信息
 */
export function commit(cwd: string, message: string): string {
    // 转义提交信息中的双引号，防止命令注入
    gitExec(cwd, `commit -m "${message.replace(/"/g, '\\"')}"`);
    return `提交成功: ${message}`;
}

/**
 * 合并指定分支到当前分支
 *
 * @param cwd 项目根目录
 * @param branchName 要合并的来源分支名称
 * @returns 合并结果信息
 */
export function mergeBranch(cwd: string, branchName: string): string {
    gitExec(cwd, `merge "${branchName}"`);
    return `合并分支 ${branchName} 完成`;
}

/**
 * 获取git仓库的当前状态摘要
 *
 * @param cwd 项目根目录
 * @returns git status --short 的输出
 */
export function getStatus(cwd: string): string {
    return gitExec(cwd, "status --short");
}
