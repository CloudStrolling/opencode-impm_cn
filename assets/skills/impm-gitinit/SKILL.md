---
name: impm-gitinit
description: 检查并初始化Git仓库 - 检测当前项目是否已加入Git，未初始化则自动执行git init、生成.gitignore并暂存文件
---

# impm-gitinit 技能

## 触发词
impm-gitinit

## 何时使用
- 新项目启动时
- /impm-gitinit 命令启动时
- 项目尚未纳入Git版本管理时

## 执行步骤

### 1. 检查Git初始化状态
- 执行 `git rev-parse --is-inside-work-tree` 或 `git status` 检查当前项目是否为Git仓库

### 2. 如果已初始化Git
- 跳到第4步检查.gitignore

### 3. 如果未初始化Git
- 执行 `git init` 初始化仓库

### 4. 生成.gitignore
1. 如果 docs/project.md 或者 docs/architecture.md存在，则读取对应的开发技术栈
2. 根据项目类型自动生成 `.gitignore`，
3. 首先排除操作系统的操作系统生成文件：
   ```
    # Mac
    .DS_Store
    .AppleDouble
    ._*
    # Windows
    Thumbs.db
    desktop.ini
    # Linux
    *~
   ```
4. 排除IDE编辑器配置：
   ```
   # idea
    .idea/
    *.iml
    *.ipr
    *.iws
    out/

   # vscode
    .vscode/
    *.code-workspace

   # Sublime
    *.sublime-project
    *.sublime-workspace
   # Vim
    *.swp
    *.swo
   # Atom
    .atom/
   ```
   
5. 排除AI开发工具配置：
   ```
   # ====================== AI开发工具专用 ======================
    # OpenCode
    .opencode/
    .opencode.json
    opencode-cache/
    .opencode-snapshots/
    .opencode-history/
    *.opencode.tmp
    
    # Claude Code VSCode插件
    .claude/
    .claudeignore
    .claude-history/
    .claude/conversations/
    .claude/sessions/
    .claude/checkpoints/
    .claude/skills/.cache/
    .claude/settings.local.json
    *.skill-backup
    conversation-history.jsonl
    
    # Codex / GitHub Copilot
    .copilot/
    .copilot-agent/
    copilot-*.log
    .copilotignore
    .vscode/copilot/
    
    # Cursor AI
    .cursor/
    .cursor-index/
    .cursor-cache/
    
    # Codeium / Windsurf
    .codeium/
    windsurf-sessions/
    
    # Tabnine
    .tabnine/
    .tabnine-cache/
    
    # AI通用临时/日志
    *.ai.log
    ai-tmp/
    ai-generated-temp/
    *.ai-backup
   ```
6. 根据语言和技术栈排除相应的文件：
  **前端 / Node.js 项目专用:**
   ```
    # 依赖
    node_modules/
    package-lock.json
    yarn.lock
    pnpm-lock.yaml
    
    # 构建产物
    dist/
    build/
    out/
    output/
    coverage/
    
    # 日志、缓存
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    .pnpm-debug.log*
    .npm
    .eslintcache
   ```

   **Python 项目专用:**
   ```
    __pycache__/
    *.py[cod]
    *$py.class
    *.so
    .Python
    env/
    venv/
    .venv/
    env.bak/
    venv.bak/
    .pytest_cache/
    .coverage
    htmlcov/
    *.pyd
   ```
   
   **Java / Maven / Gradle:**
   ```
    # Maven
    target/
    pom.xml.tag
    pom.xml.releaseBackup
    # Gradle
    build/
    .gradle/
    gradle-app.setting
    !gradle-wrapper.jar
    # 编译class
    *.class
    *.jar
    *.war
   ```

   **C/C++ / CMake / CLion:**
   ```
    cmake-build-*/
    cmake-build-debug/
    cmake-build-release/
    Debug/
    Release/
    *.o
    *.obj
    *.exe
    *.dll
    *.so
    *.a
    *.lib
   ```

   **数据库、缓存、日志、临时文件、补丁、备份:**
   ```
    # 日志
    *.log
    logs/
    log/
    # 数据库
    *.db
    *.sqlite
    *.sqlite3
    # 缓存、临时文件
    tmp/
    temp/
    .cache/
    # 环境密钥
    .env
    .env.local
    .env.dev
    .env.prod
    # 本地分支记录、补丁
    *.patch
    *.diff
    # 备份文件
    *.bak
    *.backup
   ```

### 5. 暂存文件
- 执行 `git add -A` 暂存所有项目文件
- 执行 `git status --short` 确认暂存结果

### 6. 返回结果
- 返回Git初始化结果摘要，包括.gitignore内容和暂存文件列表

## 交付物
- 初始化的Git仓库
- .gitignore文件
- 已暂存的项目文件

## 注意事项
- 如果已初始化Git，不要重复执行
- .gitignore需要覆盖常规排除项，避免将无关文件纳入版本管理
- 暂存前先确认.gitignore已正确生成

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 按照 `../../commands/impm.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 自动执行从下一步开始的所有剩余步骤

<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
