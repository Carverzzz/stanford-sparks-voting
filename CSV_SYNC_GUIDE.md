# CSV 导入与 Supabase 同步指南

## 📋 功能说明

导入 CSV 文件后，系统会：
1. ✅ 解析 CSV 文件
2. ✅ 自动同步到 Supabase `participants` 表
3. ✅ 从 Supabase 重新加载数据（确保一致性）
4. ✅ 关联到当前活动（session）

---

## 🗄️ 数据库表结构

### participants 表

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  statement_1 TEXT NOT NULL,
  statement_2 TEXT NOT NULL,
  statement_3 TEXT NOT NULL,
  lie_index INTEGER NOT NULL, -- 0, 1, or 2
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## 📝 CSV 格式要求

### 必需列名

| 列名 | 说明 | 示例 |
|------|------|------|
| `Name` | 参与者姓名 | 张三 |
| `Statement 1` | 第一个陈述 | 我今年25岁 |
| `Statement 2` | 第二个陈述 | 我喜欢吃苹果 |
| `Statement 3` | 第三个陈述（谎言） | 我会说5种语言 |

### 可选列

| 列名 | 说明 | 默认值 |
|------|------|--------|
| `Lie Index` | 谎言位置（1-3） | 3 |

---

## 🚀 使用步骤

### 步骤 1: 创建 participants 表

1. 打开 Supabase: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
2. 点击 **SQL Editor** → **New query**
3. 复制 `supabase_schema_participants.sql` 的内容
4. 点击 **Run**

### 步骤 2: 准备 CSV 文件

创建 CSV 文件，格式如下：

```csv
Name,Statement 1,Statement 2,Statement 3,Lie Index
张三,我今年25岁,我喜欢吃苹果,我会说5种语言,3
李四,我去过10个国家,我每天跑步5公里,我是一名程序员,2
```

### 步骤 3: 导入 CSV

1. 打开后台界面: `/#/host`
2. 点击 **"Import Excel/CSV"** 按钮
3. 选择你的 CSV 文件
4. 系统会自动：
   - 解析 CSV
   - 同步到 Supabase
   - 显示成功提示

### 步骤 4: 验证同步

1. 在 Supabase 中，打开 **Table Editor**
2. 选择 `participants` 表
3. 应该看到导入的数据

---

## 🔄 同步逻辑

### 导入流程

1. **解析 CSV** → 获取参与者数据
2. **获取当前活动** → 如果没有活动，创建默认活动
3. **删除旧数据** → 删除当前活动的旧参与者（可选）
4. **批量插入** → 将新参与者插入 Supabase
5. **重新加载** → 从 Supabase 重新获取数据（确保一致性）

### 数据关联

- 每个参与者都关联到一个 `session_id`（活动 ID）
- 同一活动内不能有重名（UNIQUE 约束）
- 删除活动时，参与者也会被删除（CASCADE）

---

## ⚠️ 注意事项

1. **活动管理**：
   - 如果没有活动，系统会自动创建
   - 建议先点击"开始新活动"，再导入数据

2. **数据覆盖**：
   - 导入新数据时，会删除当前活动的旧参与者
   - 如果想保留历史数据，可以创建新活动

3. **编码格式**：
   - CSV 文件必须使用 **UTF-8** 编码
   - 确保中文正确显示

4. **列名匹配**：
   - 系统支持多种列名变体（不区分大小写）
   - 参考 `CSV_FORMAT.md` 查看支持的列名

---

## 🧪 测试

### 测试 CSV 文件

```csv
Name,Statement 1,Statement 2,Statement 3,Lie Index
测试1,我是程序员,我喜欢运动,我会说10种语言,3
测试2,我去过20个国家,我每天跑步,我从来没有坐过飞机,3
```

### 验证步骤

1. 导入 CSV
2. 检查 Supabase `participants` 表
3. 验证数据是否正确同步
4. 检查后台界面的参与者列表

---

## 📊 数据流程

```
CSV 文件
   ↓
解析 (parseCSVFile)
   ↓
获取/创建活动 (sessions)
   ↓
删除旧参与者 (可选)
   ↓
批量插入 Supabase (participants)
   ↓
重新加载数据
   ↓
显示在界面
```

---

**现在导入 CSV 后会自动同步到 Supabase 了！** ✅

