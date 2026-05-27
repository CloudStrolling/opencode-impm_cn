/**
 * opencode-impm 安装脚本（预编译ESM版本）
 *
 * 在 npm install 后自动执行，将 assets/ 下的 commands、agents、skills 复制到项目的 .opencode/ 目录
 *
 * 用法：node scripts/install.mjs
 */

import {
    cpSync,
    mkdirSync,
    existsSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// 获取当前脚本路径（兼容 ESM）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 项目根目录
const PROJECT_ROOT = resolve(__dirname, "..");
// assets 资源目录
const ASSETS_DIR = join(PROJECT_ROOT, "assets");
// OpenCode 运行时配置目录
const OPENCODE_DIR = join(PROJECT_ROOT, ".opencode");
// 需要复制的目录列表
const ASSET_DIRS = ["commands", "agents", "skills"];

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
function copyDirRecursive(src, dest) {
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
            // 递归处理子目录
            copyDirRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
            cpSync(srcPath, destPath);
            console.log(`  复制: ${entry.name}`);
        }
    }
}

/**
 * 更新 opencode.json 配置，将 opencode-impm 添加到 plugin 列表
 */
function updateOpenCodeConfig() {
    const configPath = join(PROJECT_ROOT, "opencode.json");

    let config = {};

    if (existsSync(configPath)) {
        try {
            config = JSON.parse(readFileSync(configPath, "utf-8"));
        } catch {
            console.warn("opencode.json 解析失败，将重新创建");
        }
    }

    // 确保 plugin 数组中包含 opencode-impm
    const plugins = Array.isArray(config.plugin) ? [...config.plugin] : [];
    if (!plugins.includes("opencode-impm")) {
        plugins.push("opencode-impm");
    }
    config["$schema"] = config["$schema"] || "https://opencode.ai/config.json";
    config.plugin = plugins;

    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`  配置文件已更新: ${configPath}`);
}

/**
 * 主入口：复制资源文件并更新配置
 */
function main() {
    console.log("============================================");
    console.log("  opencode-impm 安装脚本");
    console.log("============================================");
    console.log("");
    console.log(`项目根目录: ${PROJECT_ROOT}`);
    console.log(`资源目录: ${ASSETS_DIR}`);
    console.log(`目标目录: ${OPENCODE_DIR}`);
    console.log("");

    // 确保 .opencode 目录存在
    mkdirSync(OPENCODE_DIR, { recursive: true });

    // 逐一复制 commands、agents、skills 目录
    for (const dir of ASSET_DIRS) {
        const srcDir = join(ASSETS_DIR, dir);
        const destDir = join(OPENCODE_DIR, dir);

        console.log(`复制 ${dir}/ ...`);
        copyDirRecursive(srcDir, destDir);
    }

    console.log("");
    console.log("更新 opencode.json 配置...");
    updateOpenCodeConfig();

    console.log("");
    console.log("============================================");
    console.log("  安装完成！");
    console.log("  使用 /impm 命令启动AI项目经理全流程开发。");
    console.log("============================================");
}

main();
