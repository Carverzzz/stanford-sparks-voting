# 设置 Participants 表

## 🚀 快速设置

### 步骤 1: 在 Supabase 中创建表

1. 打开 Supabase: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
2. 点击 **SQL Editor** → **New query**
3. 复制并运行 `supabase_schema_participants.sql` 的内容
4. 点击 **Run**

### 步骤 2: 验证表已创建

1. 在 Supabase 中，点击 **Table Editor**
2. 应该看到 `participants` 表
3. 检查表结构是否正确

---

## 📋 CSV 格式

### 必需列名

```csv
Name,Statement 1,Statement 2,Statement 3,Lie Index
张三,我今年25岁,我喜欢吃苹果,我会说5种语言,3
李四,我去过10个国家,我每天跑步5公里,我是一名程序员,2
```

### 支持的列名变体

- **Name**: `Name`, `name`, `群内微信名`, `姓名`
- **Statement 1**: `Statement 1`, `statement 1`, `真实陈述1`, `陈述1`
- **Statement 2**: `Statement 2`, `statement 2`, `真实陈述2`, `陈述2`
- **Statement 3**: `Statement 3`, `statement 3`, `谎言`, `一个假`, `陈述3`
- **Lie Index**: `Lie Index`, `lie index`, `谎言索引`, `谎言位置` (可选，默认 3)

---

## ✅ 测试

1. 创建测试 CSV 文件（参考上面的格式）
2. 在后台界面导入
3. 检查 Supabase `participants` 表，应该看到数据

---

**完成！现在可以导入 CSV 并自动同步到 Supabase 了！** ✅

