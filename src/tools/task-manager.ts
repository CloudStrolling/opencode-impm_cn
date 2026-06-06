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
 * impm_task_manager - 任务状态管理工具
 * 读取/更新task.json中的任务状态
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { getTaskJsonPath } from "../utils/paths.js";

/** 任务状态枚举 */
export type TaskStatus = "未完成" | "执行中" | "已完成";

/** 任务类型枚举 */
export type TaskType = "前端" | "后端" | "通用";

/** 子任务结构 */
export interface SubTask {
    /** 子任务ID */
    id: string;
    /** 子任务标题 */
    title: string;
    /** 子任务描述 */
    description: string;
    /** 对应的UserStory编号 */
    userStoryIds: string[];
    /** 子任务状态 */
    status: TaskStatus;
    /** 测试方法 */
    testMethod: string;
    /** 验收标准 */
    acceptanceCriteria: string;
}

/** 主任务结构 */
export interface MainTask {
    /** 主任务ID */
    id: string;
    /** 主任务标题 */
    title: string;
    /** 主任务描述 */
    description: string;
    /** 任务类型 */
    taskType: TaskType;
    /** 对应的UserStory编号列表 */
    userStoryIds: string[];
    /** 上游任务ID列表 */
    upstreamTaskIds: string[];
    /** 下游任务ID列表 */
    downstreamTaskIds: string[];
    /** 主任务状态 */
    status: TaskStatus;
    /** 子任务列表 */
    subTasks: SubTask[];
    /** 测试方法 */
    testMethod: string;
    /** 验收标准 */
    acceptanceCriteria: string;
}

/** 任务清单结构 */
export interface TaskList {
    /** 项目名称 */
    projectName: string;
    /** 版本号 */
    version: string;
    /** 主任务列表 */
    tasks: MainTask[];
}

interface TaskManagerArgs {
    /** 项目根目录 */
    projectRoot: string;
    /** 项目名称 */
    projectName: string;
    /** 版本号 */
    version: string;
    /** 操作类型 */
    action: "query" | "update" | "init";
    /** 任务ID（query和update时需要） */
    taskId?: string;
    /** 新状态（update时需要） */
    status?: TaskStatus;
    /** 任务清单内容（init时需要，JSON字符串） */
    taskListJson?: string;
}

export const taskManagerDefinition = {
    description: "管理impm任务清单状态：初始化、查询、更新任务状态",
    args: {
        projectRoot: {
            type: "string" as const,
            description: "项目根目录的绝对路径",
        },
        projectName: { type: "string" as const, description: "项目名称" },
        version: { type: "string" as const, description: "版本号" },
        action: {
            type: "string" as const,
            description:
                "操作类型：query=查询任务, update=更新任务状态, init=初始化任务清单",
        },
        taskId: {
            type: "string" as const,
            description: "任务ID（query和update时需要）",
        },
        status: {
            type: "string" as const,
            description: "新状态（update时需要）：未完成 | 执行中 | 已完成",
        },
        taskListJson: {
            type: "string" as const,
            description: "任务清单JSON字符串（init时需要）",
        },
    },
};

export async function taskManagerExecute(
    args: TaskManagerArgs,
): Promise<string> {
    const {
        projectRoot,
        projectName,
        version,
        action,
        taskId,
        status,
        taskListJson,
    } = args;
    const jsonPath = getTaskJsonPath(projectRoot, projectName, version);

    // 初始化任务清单
    if (action === "init") {
        if (!taskListJson) {
            return "init操作需要提供taskListJson参数";
        }
        try {
            const taskList: TaskList = JSON.parse(taskListJson);
            writeFileSync(jsonPath, JSON.stringify(taskList, null, 2), "utf-8");
            return `任务清单初始化成功: ${jsonPath}`;
        } catch (e) {
            return `JSON解析失败: ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    // 读取现有任务清单
    if (!existsSync(jsonPath)) {
        return `任务清单文件不存在: ${jsonPath}。请先使用init操作创建。`;
    }

    let taskList: TaskList;
    try {
        taskList = JSON.parse(readFileSync(jsonPath, "utf-8"));
    } catch (e) {
        return `任务清单文件读取失败: ${e instanceof Error ? e.message : String(e)}`;
    }

    if (action === "query") {
        if (taskId) {
            // 查找特定任务
            const task = findTask(taskList, taskId);
            if (!task) {
                return `未找到任务: ${taskId}`;
            }
            return JSON.stringify(task, null, 2);
        }
        // 查询所有未完成和执行中的任务
        const pendingTasks = taskList.tasks.filter(
            (t) => t.status === "未完成" || t.status === "执行中",
        );
        return JSON.stringify(
            {
                totalTasks: taskList.tasks.length,
                pendingCount: pendingTasks.length,
                pendingTasks: pendingTasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    taskType: t.taskType,
                    upstreamTaskIds: t.upstreamTaskIds,
                })),
            },
            null,
            2,
        );
    }

    if (action === "update") {
        if (!taskId) {
            return "update操作需要提供taskId参数";
        }
        if (!status) {
            return "update操作需要提供status参数";
        }
        const validStatuses: TaskStatus[] = ["未完成", "执行中", "已完成"];
        if (!validStatuses.includes(status as TaskStatus)) {
            return `无效的状态值: ${status}。有效值: ${validStatuses.join(", ")}`;
        }

        const task = findTask(taskList, taskId);
        if (!task) {
            return `未找到任务: ${taskId}`;
        }

        const oldStatus = task.status;
        task.status = status as TaskStatus;

        writeFileSync(jsonPath, JSON.stringify(taskList, null, 2), "utf-8");
        return `任务 ${taskId} 状态已更新: ${oldStatus} → ${status}`;
    }

    return `不支持的操作类型: ${action}`;
}

/**
 * 在任务清单中查找指定ID的任务（支持主任务和子任务）
 */
function findTask(
    taskList: TaskList,
    taskId: string,
): MainTask | SubTask | null {
    // 先在主任务中查找
    for (const task of taskList.tasks) {
        if (task.id === taskId) return task;
        // 再在子任务中查找
        for (const sub of task.subTasks) {
            if (sub.id === taskId) return sub;
        }
    }
    return null;
}
