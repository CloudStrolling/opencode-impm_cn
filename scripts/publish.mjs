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
 * opencode-impm npm 发布脚本
 *
 * 用法：
 *   node scripts/publish.mjs          # 发布到 npm
 *   node scripts/publish.mjs --dry-run # 试运行（不实际发布）
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

function readPackageJson() {
    return JSON.parse(
        readFileSync(join(PROJECT_ROOT, "package.json"), "utf-8"),
    );
}

function main() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes("--dry-run");

    const pkg = readPackageJson();
    const version = pkg.version;

    console.log("============================================");
    console.log(`  opencode-impm v${version} 发布脚本`);
    console.log("============================================");
    console.log("");
    console.log(`项目: ${pkg.name}`);
    console.log(`版本: ${version}`);
    console.log(`描述: ${pkg.description}`);
    console.log("");

    // 1. 构建
    console.log("步骤 1/3: 构建项目...");
    try {
        execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
    } catch {
        console.error("构建失败，中止发布");
        process.exit(1);
    }
    console.log("  构建完成");
    console.log("");

    // 2. 测试（如有）
    // console.log("步骤 2/3: 运行测试...");
    // try {
    //     execSync("npm test", { cwd: PROJECT_ROOT, stdio: "inherit" });
    // } catch {
    //     console.error("测试失败，中止发布");
    //     process.exit(1);
    // }
    // console.log("  测试通过");
    // console.log("");

    // 3. 发布
    const publishStep = isDryRun ? "试运行" : "发布";
    console.log(`步骤 2/2: ${publishStep}到 npm...`);

    const publishArgs = ["publish"];
    if (isDryRun) {
        publishArgs.push("--dry-run");
    }
    publishArgs.push("--access", "public");

    try {
        execSync(`npm ${publishArgs.join(" ")}`, {
            cwd: PROJECT_ROOT,
            stdio: "inherit",
        });
    } catch {
        console.error(`发布失败`);
        process.exit(1);
    }

    if (isDryRun) {
        console.log("  试运行完成，未实际发布");
    } else {
        console.log(`  发布成功！`);
        console.log(`  npm i ${pkg.name}@latest`);
    }

    console.log("");
    console.log("============================================");
    console.log(isDryRun ? "  试运行完成" : "  发布完成！");
    console.log("============================================");
}

main();
