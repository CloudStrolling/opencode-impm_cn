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
 * impm_doc_writer - 文档写入工具
 *
 * 将生成的文档内容写入标准路径，自动创建不存在的目录。
 * 支持写入 project.md、architecture.md 和版本化文档。
 * 任务类型会同时生成 .md（可读文档）和 .json（程序化管理）两个文件。
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { DOC_TYPE_DIR, getDocFileName, getTaskJsonPath } from "../utils/paths.js"

/** 文档写入工具的输入参数 */
interface DocWriterArgs {
  projectRoot: string       // 项目根目录绝对路径
  docType: string           // 文档类型
  version: string           // 版本号
  projectName: string       // 项目名称
  content: string           // 文档内容（Markdown格式）
  isJson?: boolean          // 是否为JSON格式（task类型专用）
}

/** 工具定义 */
export const docWriterDefinition = {
  description: "写入impm项目文档到标准路径（需求文档、PRD、sds、task、架构文档、project.md）",
  args: {
    projectRoot: { type: "string" as const, description: "项目根目录的绝对路径" },
    docType: {
      type: "string" as const,
      description: "文档类型：requirement | prd | sds | task | architect | project",
    },
    version: { type: "string" as const, description: "版本号" },
    projectName: { type: "string" as const, description: "项目名称" },
    content: { type: "string" as const, description: "文档内容（Markdown格式）" },
    isJson: { type: "boolean" as const, description: "是否为JSON格式（task类型专用）" },
  },
}

/**
 * 执行文档写入操作
 *
 * @param args 写入参数
 * @returns 操作结果消息（包含写入路径）
 */
export async function docWriterExecute(args: DocWriterArgs): Promise<string> {
  const { projectRoot, docType, version, projectName, content, isJson } = args

  // 版本化文档：确定目标目录
  const docDir = DOC_TYPE_DIR[docType]
  if (!docDir) {
    return `不支持的文档类型: ${docType}`
  }

  const fullDir = join(projectRoot, docDir)

  // 如果目录不存在则自动创建
  if (!existsSync(fullDir)) {
    mkdirSync(fullDir, { recursive: true })
  }

  // task类型需要同时生成 .md 和 .json 两个文件
  if (docType === "task") {
    // 写入 .md 文档
    const mdFileName = getDocFileName(projectName, docType, version)
    const mdFilePath = join(fullDir, mdFileName)
    writeFileSync(mdFilePath, content, "utf-8")

    // 如果提供了JSON内容，同时写入 .json 文件供程序化管理
    const jsonFilePath = getTaskJsonPath(projectRoot, projectName, version)
    if (isJson) {
      writeFileSync(jsonFilePath, content, "utf-8")
    }

    return `任务文档写入成功: ${mdFilePath}`
  }

  // 其他文档类型直接写入
  const fileName = getDocFileName(projectName, docType, version)
  const filePath = join(fullDir, fileName)
  writeFileSync(filePath, content, "utf-8")

  return `文档写入成功: ${filePath}`
}
