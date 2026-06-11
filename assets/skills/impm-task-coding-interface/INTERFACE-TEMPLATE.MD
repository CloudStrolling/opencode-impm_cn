# 接口文档

**项目名称：** {PROJECT_NAME_CN}
**项目英文名：** {PROJECT_NAME}
**版本号：** v{X.Y.Z}
**日期：** {YYYY-MM-DD}

---

## 模块：{模块名称}

### {API名称}

**接口**：`{HTTP_METHOD} /api/{path}`

**功能描述**：{功能说明}

**请求头**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| {header_name} | {type} | {Y/N} | {description} |

**请求参数**：

| 参数名 | 类型 | 必填 | 位置 | 说明 |
|--------|------|------|------|------|
| {param_name} | {type} | {Y/N} | {query/body/path} | {description} |

**请求示例**：

```json
{
  "key": "value"
}
```

**响应参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| {param_name} | {type} | {Y/N} | {description} |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| {code} | {description} |

---
