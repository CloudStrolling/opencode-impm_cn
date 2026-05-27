/**
 * impm_project_analyzer - 项目结构分析工具
 * 扫描项目源代码文件，提取函数/类列表及描述
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

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

interface FileAnalysis {
    /** 相对路径 */
    path: string;
    /** 文件中的函数/类列表 */
    functions: string[];
}

interface AnalysisResult {
    /** 项目根目录 */
    projectRoot: string;
    /** 扫描的文件数量 */
    fileCount: number;
    /** 文件分析结果列表 */
    files: FileAnalysis[];
}

export const projectAnalyzerDefinition = {
    description:
        "分析项目源代码结构，提取文件列表和函数/类签名，用于生成project.md的Project Map部分",
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

    const result: AnalysisResult = {
        projectRoot,
        fileCount: 0,
        files: [],
    };

    for (const dir of scanDirs) {
        if (!existsSync(dir)) continue;
        scanDirectory(dir, projectRoot, excludes, result);
    }

    // 格式化为Markdown项目地图格式
    let output = `# Project Map\n\n`;
    output += `共扫描 ${result.fileCount} 个源代码文件\n\n`;

    for (const file of result.files) {
        output += `## ${file.path}\n`;
        for (const fn of file.functions) {
            output += `- ${fn}\n`;
        }
        output += "\n";
    }

    return output;
}

/**
 * 递归扫描目录
 */
function scanDirectory(
    dir: string,
    rootDir: string,
    excludes: Set<string>,
    result: AnalysisResult,
): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!excludes.has(entry.name)) {
                scanDirectory(fullPath, rootDir, excludes, result);
            }
            continue;
        }

        if (!entry.isFile()) continue;

        const ext = extname(entry.name);
        if (!SOURCE_EXTENSIONS.has(ext)) continue;

        const relPath = relative(rootDir, fullPath);
        const functions = extractFunctions(fullPath, ext);

        result.files.push({ path: relPath, functions });
        result.fileCount++;
    }
}

/**
 * 从源代码文件中提取函数/类签名
 */
function extractFunctions(filePath: string, ext: string): string[] {
    const functions: string[] = [];

    try {
        const content = readFileSync(filePath, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // TypeScript/JavaScript: function, const, class, export
            if (
                ext === ".ts" ||
                ext === ".tsx" ||
                ext === ".js" ||
                ext === ".jsx"
            ) {
                // function声明
                const funcMatch = line.match(
                    /^(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
                );
                if (funcMatch) {
                    functions.push(`${funcMatch[1]}(${funcMatch[2]})`);
                    continue;
                }

                // const/let箭头函数
                const arrowMatch = line.match(
                    /^(?:export\s+(?:const|let)\s+)(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/,
                );
                if (arrowMatch) {
                    functions.push(`${arrowMatch[1]}(${arrowMatch[2]}) =>`);
                    continue;
                }

                // class声明
                const classMatch = line.match(
                    /^(?:export\s+(?:default\s+)?)?class\s+(\w+)/,
                );
                if (classMatch) {
                    functions.push(`class ${classMatch[1]}`);
                    continue;
                }

                // interface/type声明
                const typeMatch = line.match(
                    /^(?:export\s+)?(?:interface|type)\s+(\w+)/,
                );
                if (typeMatch) {
                    functions.push(
                        `${line.startsWith("interface") ? "interface" : "type"} ${typeMatch[1]}`,
                    );
                    continue;
                }
            }

            // Python: def, class
            if (ext === ".py") {
                const pyFuncMatch = line.match(
                    /^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/,
                );
                if (pyFuncMatch) {
                    functions.push(`def ${pyFuncMatch[1]}(${pyFuncMatch[2]})`);
                    continue;
                }

                const pyClassMatch = line.match(/^class\s+(\w+)/);
                if (pyClassMatch) {
                    functions.push(`class ${pyClassMatch[1]}`);
                    continue;
                }
            }

            // Go: func
            if (ext === ".go") {
                const goFuncMatch = line.match(
                    /^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(([^)]*)\)/,
                );
                if (goFuncMatch) {
                    functions.push(`func ${goFuncMatch[1]}(${goFuncMatch[2]})`);
                    continue;
                }
            }

            // Java/Kotlin: public/private/protected class/method
            if (ext === ".java" || ext === ".kt") {
                const javaClassMatch = line.match(
                    /(?:public|private|protected)?\s*(?:class|interface|enum)\s+(\w+)/,
                );
                if (javaClassMatch) {
                    functions.push(`class ${javaClassMatch[1]}`);
                    continue;
                }
            }
        }
    } catch {
        // 文件读取失败，跳过
    }

    return functions;
}
