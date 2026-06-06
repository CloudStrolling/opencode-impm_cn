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
 * 版本号工具函数集
 *
 * 处理语义化版本号（SemVer）的解析、比较、递增等操作。
 * 版本号格式：主版本号.次版本号.修订号（如 0.1.0）
 */

/**
 * 解析版本号字符串为数字数组
 *
 * 支持 "v" 前缀（如 v0.1.0）和无前缀两种格式
 *
 * @param version 版本号字符串，如 "0.1.0" 或 "v0.1.0"
 * @returns [主版本号, 次版本号, 修订号] 的三元组
 */
export function parseVersion(version: string): [number, number, number] {
    // 去掉可选的 "v" 前缀
    const cleaned = version.replace(/^v/, "");
    // 按 "." 分割并转为数字
    const parts = cleaned.split(".").map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * 将三个版本号分量格式化为字符串
 *
 * @param major 主版本号
 * @param minor 次版本号
 * @param patch 修订号
 * @returns 格式化的版本号字符串，如 "0.1.0"
 */
export function formatVersion(
    major: number,
    minor: number,
    patch: number,
): string {
    return `${major}.${minor}.${patch}`;
}

/**
 * 递增修订号（第三位版本号 +1）
 * 用于生成下一个版本号
 *
 * @param version 当前版本号
 * @returns 递增修订号后的新版本号
 */
export function incrementPatch(version: string): string {
    const [major, minor, patch] = parseVersion(version);
    return formatVersion(major, minor, patch + 1);
}

/**
 * 比较两个版本号的大小
 *
 * @param a 版本号a
 * @param b 版本号b
 * @returns 正数表示a>b，负数表示a<b，0表示相等
 */
export function compareVersions(a: string, b: string): number {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    // 从主版本号开始依次比较，遇到不同则返回差值
    for (let i = 0; i < 3; i++) {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
}

/**
 * 从文件名中提取版本号
 * 文件名格式：{项目名称}-{文档类型}-v{版本号}.md
 *
 * @param fileName 文件名，如 "opencode-impm-requirement-v0.1.0.md"
 * @returns 提取的版本号字符串（不含v前缀），如 "0.1.0"；未找到则返回null
 */
export function extractVersionFromFileName(fileName: string): string | null {
    // 匹配 "-v" 后跟数字.数字.数字 的模式
    const match = fileName.match(/-v(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
}

/**
 * 验证版本号字符串是否合法
 * 合法格式：三位数字以"."分隔，可选"v"前缀
 *
 * @param version 版本号字符串
 * @returns 是否为有效的语义化版本号
 */
export function isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version.replace(/^v/, ""));
}
