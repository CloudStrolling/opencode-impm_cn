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
 * impm_project_analyzer - 项目结构分析工具
 * 扫描项目源代码文件，按目录层级分组，提取文件描述和函数/类列表
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

interface ProjectAnalyzerArgs {
    /** 项目根目录 */
    projectRoot: string;
    /** 要扫描的源代码目录（相对于项目根目录），默认扫描所有 */
    sourceDirs?: string[];
    /** 排除的目录 */
    excludeDirs?: string[];
}

/** 默认排除的目录 */
const DEFAULT_EXCLUDES = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".opencode",
    "coverage",
    ".next",
    ".nuxt",
    "vendor",
    "__pycache__",
    ".venv",
    "venv",
];

/** 支持的源代码文件扩展名 */
const SOURCE_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".go",
    ".java",
    ".kt",
    ".rs",
    ".rb",
    ".php",
    ".cs",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".swift",
    ".dart",
]);

interface FunctionInfo {
    signature: string;
    description: string;
}

interface FileNode {
    path: string;
    name: string;
    description: string;
    functions: FunctionInfo[];
}

interface DirNode {
    path: string;
    name: string;
    description: string;
    dirs: Map<string, DirNode>;
    files: FileNode[];
}

interface AnalysisResult {
    projectRoot: string;
    fileCount: number;
    rootDirs: Map<string, DirNode>;
}

/** 目录名称到描述的映射 */
const DIR_DESCRIPTIONS: Record<string, string> = {
    src: "项目核心源代码目录",
    tools: "工具函数实现目录，每个文件注册一个独立的impm工具",
    utils: "通用工具函数目录，提供路径、版本号等辅助功能",
    scripts: "构建和安装脚本目录",
    assets: "资源文件目录，包含Agent提示词、命令和技能定义",
    docs: "项目文档目录，包含需求、PRD、架构、sds等文档",
    template: "项目模板文件目录",
    tests: "测试文件目录",
    __tests__: "测试文件目录",
    test: "测试文件目录",
    sds: "测试文件目录",
    components: "组件目录",
    config: "配置文件目录",
    routes: "路由定义目录",
    controllers: "控制器目录",
    models: "数据模型目录",
    services: "业务逻辑目录",
    middleware: "中间件目录",
    hooks: "React Hooks目录",
    styles: "样式文件目录",
    public: "静态资源目录",
};

export const projectAnalyzerDefinition = {
    description:
        "分析项目源代码结构，按目录层级分组，提取文件描述和函数/类签名，用于生成project.md的Project Map部分",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        sourceDirs: {
            type: "string" as const,
            description: "要扫描的源代码目录（逗号分隔，相对于项目根目录）",
        },
        excludeDirs: {
            type: "string" as const,
            description: "排除的目录（逗号分隔）",
        },
    },
};

export async function projectAnalyzerExecute(
    args: ProjectAnalyzerArgs,
): Promise<string> {
    const { projectRoot, sourceDirs, excludeDirs } = args;

    const excludes = new Set([...DEFAULT_EXCLUDES, ...(excludeDirs ?? [])]);

    const scanDirs = sourceDirs?.length
        ? sourceDirs.map((d) => join(projectRoot, d))
        : [projectRoot];

    const rootDirs = new Map<string, DirNode>();

    for (const dir of scanDirs) {
        if (!existsSync(dir)) continue;
        scanDirectory(dir, projectRoot, excludes, rootDirs);
    }

    return formatProjectMap(rootDirs, projectRoot);
}

/**
 * 获取目录描述（基于目录名或上下文）
 */
function getDirDescription(dirName: string, _parentPath: string): string {
    const lower = dirName.toLowerCase();
    if (DIR_DESCRIPTIONS[lower]) {
        return DIR_DESCRIPTIONS[lower];
    }
    return `${dirName} 目录`;
}

/**
 * 获取文件描述（从JSDoc或文件头部注释提取）
 */
function extractFileDescription(content: string, ext: string): string {
    let comment: string | null = null;

    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
        const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
        if (jsdocMatch) {
            comment = jsdocMatch[1];
        }
    } else if (ext === ".py") {
        const docstringMatch = content.match(/"""(.*?)"""/s);
        if (docstringMatch) {
            comment = docstringMatch[1];
        }
    } else if (ext === ".go" || ext === ".rs") {
        const blockMatch = content.match(/\/\*([\s\S]*?)\*\//);
        if (blockMatch) {
            comment = blockMatch[1];
        }
    }

    if (comment) {
        const lines = comment
            .split("\n")
            .map((l) => l.replace(/^\s*\*\s?/, ""))
            .map((l) => l.trim())
            .filter(Boolean);
        return lines.length > 0 ? lines[0] : "";
    }

    return "";
}

/**
 * 获取函数描述（从函数前的注释行提取）
 */
function extractFunctionDescription(
    content: string,
    lineIndex: number,
): string {
    const lines = content.split("\n");
    // 向上查找函数声明前的注释
    for (let i = lineIndex - 1; i >= 0 && i >= lineIndex - 5; i--) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith("//")) {
            return trimmed.replace(/^\/\/\s*/, "").trim();
        }
        if (trimmed.startsWith("*")) {
            const desc = trimmed
                .replace(/^\s*\*\s?/, "")
                .replace(/^\s*\*\/$/, "")
                .trim();
            if (desc) return desc;
        }
        if (trimmed === "" || trimmed.startsWith("import") || trimmed === "*/" || trimmed === "/**") {
            continue;
        }
        if (!trimmed.startsWith("*") && !trimmed.startsWith("//")) {
            break;
        }
    }
    return "";
}

/**
 * 递归扫描目录，构建目录树
 */
function scanDirectory(
    dir: string,
    rootDir: string,
    excludes: Set<string>,
    rootDirs: Map<string, DirNode>,
): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;

        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!excludes.has(entry.name)) {
                scanDirectory(fullPath, rootDir, excludes, rootDirs);
            }
            continue;
        }

        if (!entry.isFile()) continue;

        const ext = extname(entry.name);
        if (!SOURCE_EXTENSIONS.has(ext)) continue;

        const relPath = relative(rootDir, fullPath);
        const functions = extractFunctions(fullPath, ext);
        const description = extractFileDescription(
            readFileSync(fullPath, "utf-8"),
            ext,
        );

        // 将文件插入到目录树中
        const pathParts = relPath.split(sep);
        const fileName = pathParts.pop()!;

        if (pathParts.length === 0) {
            // 根目录文件
            const rootNode = getOrCreateDir(rootDirs, "", "");
            rootNode.files.push({
                path: relPath,
                name: fileName,
                description,
                functions,
            });
        } else {
            // 嵌套目录文件
            let currentNode: DirNode | null = null;
            let accumulatedPath = "";

            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                accumulatedPath = accumulatedPath
                    ? `${accumulatedPath}/${part}`
                    : part;

                if (i === 0) {
                    currentNode = getOrCreateDir(
                        rootDirs,
                        accumulatedPath,
                        part,
                    );
                } else {
                    currentNode = getOrCreateDir(
                        currentNode!.dirs,
                        accumulatedPath,
                        part,
                    );
                }
            }

            if (currentNode) {
                currentNode.files.push({
                    path: relPath,
                    name: fileName,
                    description,
                    functions,
                });
            }
        }
    }
}

/**
 * 获取或创建目录节点
 */
function getOrCreateDir(
    parentMap: Map<string, DirNode>,
    dirPath: string,
    dirName: string,
): DirNode {
    if (!parentMap.has(dirPath)) {
        parentMap.set(dirPath, {
            path: dirPath,
            name: dirName,
            description: getDirDescription(dirName, dirPath),
            dirs: new Map(),
            files: [],
        });
    }
    return parentMap.get(dirPath)!;
}

/**
 * 从源代码文件中提取函数/类签名
 */
function extractFunctions(filePath: string, ext: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    try {
        const content = readFileSync(filePath, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            let match: RegExpMatchArray | null = null;

            // TypeScript/JavaScript
            if (
                ext === ".ts" ||
                ext === ".tsx" ||
                ext === ".js" ||
                ext === ".jsx"
            ) {
                match = line.match(
                    /^(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
                );
                if (match) {
                    functions.push({
                        signature: `${match[1]}(${match[2]})`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }

                const arrowMatch = line.match(
                    /^(?:export\s+(?:const|let)\s+)(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/,
                );
                if (arrowMatch) {
                    functions.push({
                        signature: `${arrowMatch[1]}(${arrowMatch[2]}) =>`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }

                const classMatch = line.match(
                    /^(?:export\s+(?:default\s+)?)?class\s+(\w+)/,
                );
                if (classMatch) {
                    functions.push({
                        signature: `class ${classMatch[1]}`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }

                const typeMatch = line.match(
                    /^(?:export\s+)?(?:interface|type)\s+(\w+)/,
                );
                if (typeMatch) {
                    const kind = line.startsWith("interface")
                        ? "interface"
                        : "type";
                    functions.push({
                        signature: `${kind} ${typeMatch[1]}`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }
            }

            // Python
            if (ext === ".py") {
                const pyFuncMatch = line.match(
                    /^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/,
                );
                if (pyFuncMatch) {
                    functions.push({
                        signature: `def ${pyFuncMatch[1]}(${pyFuncMatch[2]})`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }

                const pyClassMatch = line.match(/^class\s+(\w+)/);
                if (pyClassMatch) {
                    functions.push({
                        signature: `class ${pyClassMatch[1]}`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }
            }

            // Go
            if (ext === ".go") {
                const goFuncMatch = line.match(
                    /^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(([^)]*)\)/,
                );
                if (goFuncMatch) {
                    functions.push({
                        signature: `func ${goFuncMatch[1]}(${goFuncMatch[2]})`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }
            }

            // Java/Kotlin
            if (ext === ".java" || ext === ".kt") {
                const javaClassMatch = line.match(
                    /(?:public|private|protected)?\s*(?:class|interface|enum)\s+(\w+)/,
                );
                if (javaClassMatch) {
                    functions.push({
                        signature: `class ${javaClassMatch[1]}`,
                        description: extractFunctionDescription(content, i),
                    });
                    continue;
                }
            }
        }
    } catch {
        // 文件读取失败，跳过
    }

    return functions;
}

/**
 * 统计目录树中的文件总数
 */
function countFiles(dirMap: Map<string, DirNode>): number {
    let count = 0;
    for (const [, node] of dirMap) {
        count += node.files.length;
        count += countFiles(node.dirs);
    }
    return count;
}

/**
 * 渲染目录树为Markdown格式
 */
function renderDirTree(
    dirMap: Map<string, DirNode>,
    basePath: string,
    level: number,
): string {
    let output = "";

    const sortedDirs = [...dirMap.entries()].sort(([a], [b]) =>
        a.localeCompare(b),
    );

    for (const [, node] of sortedDirs) {
        if (node.files.length === 0 && node.dirs.size === 0) continue;

        const headingPrefix = "#".repeat(Math.min(level + 1, 6));

        // 目录标题
        output += `${headingPrefix} ${node.path}/\n\n`;
        if (node.description) {
            output += `${node.description}\n\n`;
        }

        // 排序文件
        const sortedFiles = [...node.files].sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        for (const file of sortedFiles) {
            const fileHeading = "#".repeat(Math.min(level + 2, 6));
            output += `${fileHeading} ${file.path}\n\n`;
            if (file.description) {
                output += `${file.description}\n\n`;
            }
            for (const fn of file.functions) {
                const desc = fn.description
                    ? ` - ${fn.description}`
                    : "";
                output += `- \`${fn.signature}\`${desc}\n`;
            }
            output += "\n";
        }

        // 递归渲染子目录
        output += renderDirTree(node.dirs, node.path, level + 1);
    }

    return output;
}

/**
 * 格式化为Markdown项目地图格式（多级目录分组、目录描述、文件描述）
 */
function formatProjectMap(
    rootDirs: Map<string, DirNode>,
    _projectRoot: string,
): string {
    const totalFiles = countFiles(rootDirs);
    const totalDirs = countDirs(rootDirs);

    let output = `# Project Map\n\n`;
    output += `共扫描 ${totalFiles} 个源代码文件，分布在 ${totalDirs} 个目录中\n\n`;

    output += renderDirTree(rootDirs, "", 0);

    return output;
}

/**
 * 统计目录树中的目录总数
 */
function countDirs(dirMap: Map<string, DirNode>): number {
    let count = 0;
    for (const [, node] of dirMap) {
        if (node.files.length > 0 || node.dirs.size > 0) {
            count++;
        }
        count += countDirs(node.dirs);
    }
    return count;
}
