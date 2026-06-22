---
name: impm-task-coding-review
description: 执行编码7 - 代码审核
---

# impm-task-coding-review 技能

## 触发词
impm-task-coding-review

## 何时使用
- 针对一个任务进行具体编码的第八步：代码审核

## 执行内容
### PM启用TL subagent来执行代码审核
### 按版本号和任务号找到并读取此前生成的参考文件：
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/context.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/cs.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/ws.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/dbd.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/testcase.md
  - docs/tasks/task_{v.x.y.z}/TASK-{001}/interface.md
  - docs/project.md
  - docs/architecture.md
  大括号中的内容分别是版本号和任务编号。
### 代码审核的目标：
  - 发现代码中的问题，而非修复它们。只输出审核意见，不修改任何文件
  - 发现安全漏洞（注入、越权、硬编码密钥、敏感信息泄露）
  - 识别性能陷阱（N+1 查询、内存泄漏、不必要的循环、大数据量全表扫描）
  - 检查代码质量（重复代码、过长函数、命名混乱、缺乏注释）
  - 验证架构合规性（分层是否清晰、是否违反依赖方向、是否绕过已定义的接口）
  - 确认测试覆盖（关键路径是否有测试、边界条件是否覆盖）
### 严重性级别

| 级别 | 定义 | 处理要求 |
|------|------|---------|
| 🔴 **Critical** | 安全漏洞、数据丢失风险、生产环境直接崩溃 | 必须阻塞合并，立即修复 |
| 🟠 **Warning** | 性能隐患、架构债务、可维护性问题 | 建议本次迭代修复，可协商 |
| 🟡 **Suggestion** | 风格优化、命名建议、注释补充 | 可选，由作者决定 |
| 🟢 **Praise** | 设计优雅、测试完备、文档清晰 | 正向反馈，鼓励保持 |

### 审核列表

#### 安全性
- [ ] 无硬编码密码/密钥/API Token（包括配置文件、注释、日志输出）
- [ ] 用户输入全部经过校验和转义（SQL 注入、XSS、命令注入）
- [ ] 权限检查：每个受保护端点/函数都有身份校验
- [ ] 敏感数据脱敏：日志、错误信息、API 响应中无手机号、身份证号明文
- [ ] 依赖库无已知 CVE（检查 package.json、pom.xml、go.mod 等）

#### 性能
- [ ] 无 N+1 查询（ORM 懒加载陷阱）
- [ ] 循环内无 IO 操作（数据库查询、HTTP 调用、文件读写）
- [ ] 大数据量操作有分页/流式处理（LIMIT、cursor、Stream）
- [ ] 无内存泄漏（闭包引用、未清理的定时器、全局缓存无限增长）
- [ ] 复杂计算有缓存策略（Redis、本地缓存、CDN）

#### 代码质量
- [ ] 函数长度 ≤ 50 行，职责单一
- [ ] 命名有意义（函数动词+名词，变量见名知意，禁止 a/b/c/x）
- [ ] 异常处理完整（不吞异常、不空 catch、有降级策略）
- [ ] 日志规范（有 RequestID 追踪、分级正确、无敏感信息）
- [ ] 魔法数字/字符串提取为常量或枚举

#### 架构
- [ ] 分层清晰：Controller → Service → Repository/DAO，不跨层调用
- [ ] 依赖方向正确：上层依赖下层接口，不依赖实现
- [ ] 无重复代码（DRY），相似逻辑提取公共函数/工具类
- [ ] 第三方服务调用有熔断/降级/重试（ resilience4j、Polly、自研）
- [ ] 配置与代码分离（环境变量、配置中心，禁止 if env==prod）

#### 测试
- [ ] 核心业务流程有单元测试（覆盖率 ≥ 80%）
- [ ] 边界条件覆盖（空值、极大值、负数、并发）
- [ ] 外部依赖有 Mock（数据库、HTTP、消息队列）
- [ ] 测试可独立运行，无顺序依赖

### 输出格式

对每个发现的问题，按以下格式输出：

```markdown
### 🔴 Critical | {文件路径}:{行号}

**问题**：{一句话描述}

**代码片段**：
```python
{相关代码，3-5 行}

风险：{具体会造成什么后果}
修复建议：{具体怎么做，给出代码示例或伪代码}
参考：{OWASP 链接、官方文档、团队规范链接}

### 汇总表

| 文件 | Critical | Warning | Suggestion | 状态 |
|------|----------|---------|------------|------|
| `src/order/service.py` | 1 | 2 | 3 | ⚠️ 需修改 |
| `src/payment/api.py` | 0 | 0 | 1 | ✅ 通过 |

```
文件保存在 docs/tasks/task_{v.x.y.z}/TASK-{001}/review.md。如果文件已经存在，就覆盖。

### 后续处理
如果review.md 不是全部都通过。返回PM，PM就回到本task任务的开头第一步，重新收集信息并编码。
如果review.md全部通过  task状态改为review-finish

## 完成后提示

执行完毕后，向用户提示以下选项：
1. **执行下一步** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，继续执行下一个步骤。
2. **执行后续所有步骤** — 严格按照 `../../commands/impm-task-coding.md` 中流程步骤的序号顺序，自动执行从下一步开始的所有剩余步骤
<!--
SPDX-License-Identifier: Apache-2.0
Copyright 2026 CloudStrolling/jenemy8023 <jenemy8023@163.com>
-->
