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
 * opencode-impm 安装脚本
 * 在npm install后自动执行，将assets/下的commands, agents, skills复制到项目的.opencode/目录
 *
 * 用法：
 *   node scripts/install.mjs          # 通过Node.js运行
 *   powershell -File scripts/install.ps1   # 通过PowerShell运行
 */

import {
    cpSync,
    mkdirSync,
    existsSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** 获取当前脚本所在目录（兼容Node.js ESM） */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** 项目根目录 */
const PROJECT_ROOT = resolve(__dirname, "..");

/** assets目录 */
const ASSETS_DIR = join(PROJECT_ROOT, "assets");

/** dist编译目录 */
const DIST_DIR = join(PROJECT_ROOT, "dist");

/** 目标目录（.opencode/ 是OpenCode的运行时配置目录） */
const OPENCODE_DIR = join(PROJECT_ROOT, ".opencode");

/** 需要复制的资源目录列表（来自 assets/） */
const ASSET_DIRS = ["commands", "agents", "skills"];

/**
 * 解析目录路径（兼容传入的相对路径）
 */
function resolve(...paths: string[]): string {
    let result = __dirname;
    for (const p of paths) {
        if (p.startsWith("/") || p.match(/^[A-Za-z]:\\/)) {
            result = p;
        } else {
            result = join(result, p);
        }
    }
    return result;
}

/**
 * 递归复制目录
 * @param src 源目录路径
 * @param dest 目标目录路径
 */
function copyDirRecursive(src: string, dest: string): void {
    if (!existsSync(src)) {
        console.warn(`  跳过：源目录不存在 ${src}`);
        return;
    }

    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
            cpSync(srcPath, destPath);
            console.log(`  复制: ${entry.name}`);
        }
    }
}

/**
 * 更新opencode.json配置，将opencode-impm添加到plugin列表中
 */
function updateOpenCodeConfig(): void {
    const configPath = join(PROJECT_ROOT, "opencode.json");

    let config: Record<string, unknown> = {};

    if (existsSync(configPath)) {
        try {
            const raw = readFileSync(configPath, "utf-8");
            config = JSON.parse(raw);
        } catch {
            console.warn("opencode.json 解析失败，将重新创建");
        }
    }

    // 确保plugin字段包含opencode-impm
    const plugins: string[] = Array.isArray(config.plugin)
        ? (config.plugin as string[])
        : [];
    if (!plugins.includes("opencode-impm")) {
        plugins.push("opencode-impm");
    }
    config["$schema"] = config["$schema"] || "https://opencode.ai/config.json";
    config.plugin = plugins;

    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`  配置文件已更新: ${configPath}`);
}

/**
 * 主安装流程
 */
function main(): void {
    console.log("============================================");
    console.log("  opencode-impm 安装脚本");
    console.log("============================================");
    console.log("");
    console.log(`项目根目录: ${PROJECT_ROOT}`);
    console.log(`资源目录: ${ASSETS_DIR}`);
    console.log(`目标目录: ${OPENCODE_DIR}`);
    console.log("");

    // 确保.opencode目录存在
    mkdirSync(OPENCODE_DIR, { recursive: true });

    // 复制各资源目录（commands, agents, skills）
    for (const dir of ASSET_DIRS) {
        const srcDir = join(ASSETS_DIR, dir);
        const destDir = join(OPENCODE_DIR, dir);

        console.log(`复制 ${dir}/ ...`);
        copyDirRecursive(srcDir, destDir);
    }

    // 安装插件到 .opencode/plugins/opencode-impm/（本地插件方式）
    const pluginDest = join(OPENCODE_DIR, "plugins", "opencode-impm");
    if (existsSync(DIST_DIR)) {
        console.log("安装本地插件 opencode-impm ...");

        // 创建插件包目录
        const pluginDestDir = join(pluginDest, "dist");
        mkdirSync(pluginDestDir, { recursive: true });

        // 复制 package.json
        cpSync(join(PROJECT_ROOT, "package.json"), join(pluginDest, "package.json"));

        // 复制 dist/
        copyDirRecursive(DIST_DIR, pluginDestDir);
    } else {
        console.warn("  跳过：dist 目录不存在", DIST_DIR);
    }

    console.log("");

    // 更新opencode.json
    console.log("更新 opencode.json 配置...");
    updateOpenCodeConfig();

    console.log("");
    console.log("============================================");
    console.log("  安装完成！");
    console.log("  使用 /impm 命令启动AI项目经理全流程开发。");
    console.log("============================================");
}

main();
