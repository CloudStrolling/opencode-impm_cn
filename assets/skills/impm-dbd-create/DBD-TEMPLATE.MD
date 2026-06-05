# 数据库设计文档
---
**项目中文名称：** {PROJECT_NAME_CN}
**项目名称：** {PROJECT_NAME}
**版本号：** v{X.Y.Z}
**日期：** {YYYY-MM-DD}

---

# 1. 项目数据库选型
- **数据库**：{MySQL 8.0.36（主从 + MGR）}
- **字符集**：{UTF8MB4}
- **时区**：{Asia/Shanghai（应用层统一处理）}
- **存储引擎**：{InnoDB}
- **分片策略**：{订单表按 `user_id % 1024` 分库分表（ShardingSphere）}

---

# 2. 命名规范
{
| 对象 | 规则 | 示例 |
|------|------|------|
| 库名 | `项目缩写_业务域` | `ec_order`, `ec_payment` |
| 表名 | 小写 + 下划线，单数名词 | `order`, `order_item` |
| 字段名 | 小写 + 下划线，动词/名词 | `created_at`, `is_deleted` |
| 主键 | `pk_表名` | `pk_order` |
| 唯一索引 | `uk_表名_字段` | `uk_order_order_no` |
| 普通索引 | `idx_表名_字段` | `idx_order_user_id_status` |
| 分区表后缀 | `_p` | `order_p` |

}

---

# 3. 物理模型
{
## 3.1 用户表（user）

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 约束 | 说明 |
|--------|------|----------|------|--------|------|------|
| id | BIGINT | - | NO | AUTO_INCREMENT | PK | 用户 ID，雪花算法备用 |
| username | VARCHAR | 64 | NO | - | UK | 用户名 |
| phone | VARCHAR | 20 | NO | - | UK | 手机号，E.164 格式 |
| email | VARCHAR | 128 | YES | NULL | - | 邮箱 |
| status | TINYINT | - | NO | 1 | - | 1=正常, 2=冻结, 3=注销 |
| password_hash | VARCHAR | 255 | NO | - | - | bcrypt 哈希 |
| created_at | DATETIME | 3 | NO | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | DATETIME | 3 | NO | CURRENT_TIMESTAMP ON UPDATE | - | 更新时间 |
| is_deleted | TINYINT | - | NO | 0 | - | 逻辑删除标志 |

**索引设计**：
- `pk_user` (id)
- `uk_user_username` (username)
- `uk_user_phone` (phone)
- `idx_user_created_at` (created_at) —— 用于按时间分页查询

**分片策略**：不分片，全局单表（数据量可控）。
}

---

# 4. 数据字典（枚举值汇总）
{
| 字段 | 枚举值 | 含义 |
|------|--------|------|
| user.status | 1 | 正常 |
| user.status | 2 | 冻结 |
| user.status | 3 | 注销 |
| order.status | 10 | 待支付 |
| order.status | 20 | 已支付 |
| order.status | 30 | 已发货 |
| order.status | 40 | 已完成 |
| order.status | 50 | 已取消 |

}

---

# 5. 安全与权限
{
| 角色 | 库/表权限 | 说明 |
|------|----------|------|
| app_user | SELECT, INSERT, UPDATE | 应用连接账号，禁止 DELETE |
| dba_admin | ALL | DBA 运维账号，审计日志记录 |
| bi_reader | SELECT (脱敏视图) | 只读，敏感字段脱敏 |

**敏感字段脱敏**：
- `user.phone`：BI 查询展示 `138****1234`
- `user.password_hash`：任何非 DBA 角色不可见

}

---

# 6. 备份与容灾
{
| 策略 | 配置 |
|------|------|
| 全量备份 | 每周日 02:00，保留 4 周 |
| 增量备份 | 每日 02:00，Binlog 保留 7 天 |
| 异地容灾 | 从库跨可用区部署，RPO < 30s |
| 归档库 | 冷数据写入 TiDB/ClickHouse，保留 3 年 |

}
