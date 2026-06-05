/**
 * opencode-impm 安装脚本
 *
 * 将 assets/ 下的 commands、agents、skills 复制到目标项目的 .opencode/ 目录，
 * 并更新目标项目的 opencode.json。
 *
 * 使用场景：
 *   1. 本地开发安装：npm install（postinstall 自动调用）
 *   2. 作为 npm 依赖安装：在消费方项目中 npm install opencode-impm（postinstall 自动调用）
 *   3. 手动指定目标：node scripts/install.mjs --target /path/to/project
 *
 * 检测逻辑：
 *   - 如果 --target 参数指定了路径，安装到该路径
 *   - 如果 INIT_CWD 环境变量存在且不等于当前包目录，安装到 INIT_CWD（npm 依赖安装场景）
 *   - 否则，安装到当前项目根目录（本地开发安装场景）
 */

import {
    cpSync,
    mkdirSync,
    existsSync,
    readdirSync,
    readFileSync,
    writeFileSync,
    rmSync,
} from "node:fs";
import { join, dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// 当前脚本所在目录（node_modules/opencode-impm/scripts/）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 插件根目录（node_modules/opencode-impm/）
const PLUGIN_ROOT = resolve(__dirname, "..");

// assets 资源目录
const ASSETS_DIR = join(PLUGIN_ROOT, "assets");

// 需要复制的目录列表
const ASSET_DIRS = ["commands", "agents", "skills"];

/**
 * 确定目标项目根目录
 * @param {string[]} args - 命令行参数
 * @returns {string} 目标项目根目录的绝对路径
 */
function resolveTargetProject(args) {
    // 1. 优先使用 --target 参数
    const targetIndex = args.indexOf("--target");
    if (targetIndex !== -1 && targetIndex + 1 < args.length) {
        const target = args[targetIndex + 1];
        return isAbsolute(target) ? target : resolve(process.cwd(), target);
    }

    // 2. npm 依赖安装场景：INIT_CWD 指向执行 npm install 的目录
    const initCwd = process.env.INIT_CWD;
    if (initCwd) {
        // 确保 INIT_CWD 不是插件自身的目录（避免本地开发时误判）
        if (resolve(initCwd) !== PLUGIN_ROOT) {
            return resolve(initCwd);
        }
    }

    // 3. 回退：当前工作目录
    return process.cwd();
}

/**
 * 递归复制目录
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 * @param {boolean} [clean=false] - 是否先清空目标目录
 */
function copyDirRecursive(src, dest, clean = false) {
    if (!existsSync(src)) {
        console.warn(`  跳过：源目录不存在 ${src}`);
        return;
    }

    if (clean && existsSync(dest)) {
        // 清空目标目录（确保旧文件被删除）
        const entries = readdirSync(dest, { withFileTypes: true });
        for (const entry of entries) {
            const destPath = join(dest, entry.name);
            if (entry.isDirectory()) {
                rmSync(destPath, { recursive: true, force: true });
            } else {
                rmSync(destPath, { force: true });
            }
        }
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
        }
    }
}

/**
 * 更新目标项目的 opencode.json，添加插件配置
 * @param {string} projectRoot - 目标项目根目录
 */
function updateOpenCodeConfig(projectRoot) {
    const configPath = join(projectRoot, "opencode.json");

    let config = {};

    if (existsSync(configPath)) {
        try {
            config = JSON.parse(readFileSync(configPath, "utf-8"));
        } catch {
            console.warn("  opencode.json 解析失败，将重新创建");
        }
    }

    const plugins = Array.isArray(config.plugin) ? [...config.plugin] : [];
    if (!plugins.includes("opencode-impm")) {
        plugins.push("opencode-impm");
    }
    config["$schema"] =
        config["$schema"] || "https://opencode.ai/config.json";
    config.plugin = plugins;

    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`  配置文件已更新: ${configPath}`);
}

/**
 * 主入口
 */
function main() {
    const args = process.argv.slice(2);
    const targetRoot = resolveTargetProject(args);

    console.log("============================================");
    console.log("  opencode-impm 安装脚本");
    console.log("============================================");
    console.log("");
    console.log(`插件目录: ${PLUGIN_ROOT}`);
    console.log(`资源目录: ${ASSETS_DIR}`);
    console.log(`目标项目: ${targetRoot}`);
    console.log("");

    if (!existsSync(ASSETS_DIR)) {
        console.error("错误：资源目录不存在，请确保在 opencode-impm 插件目录中运行此脚本");
        console.error(`       ${ASSETS_DIR}`);
        process.exit(1);
    }

    // 目标项目的 .opencode 目录
    const opencodeDir = join(targetRoot, ".opencode");

    // 逐一复制 commands、agents、skills 目录
    for (const dir of ASSET_DIRS) {
        const srcDir = join(ASSETS_DIR, dir);
        const destDir = join(opencodeDir, dir);

        if (!existsSync(srcDir)) {
            console.warn(`  跳过：资源目录不存在 ${srcDir}`);
            continue;
        }

        console.log(`复制 ${dir}/ ...`);
        copyDirRecursive(srcDir, destDir);
    }

    console.log("");

    // 更新目标项目的 opencode.json
    console.log("更新 opencode.json 配置...");
    updateOpenCodeConfig(targetRoot);

    console.log("");
    console.log("============================================");
    console.log("  安装完成！");
    console.log("  使用 /impm 命令启动AI项目经理全流程开发。");
    console.log("============================================");
}

main();
