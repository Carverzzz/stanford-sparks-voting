# 测试数据指南 / Test Data Guide

## 📝 方式一：直接在 Supabase 插入测试数据

### 步骤：

1. **打开 Supabase Dashboard**
   - 访问: https://app.supabase.com/project/fcnwowdnjpkcfxmtceqw
   - 点击左侧菜单 **SQL Editor**

2. **运行测试数据 SQL**
   - 点击 **New query**
   - 打开项目中的 `test_data.sql` 文件
   - 复制全部内容，粘贴到 SQL Editor
   - 点击 **Run** 执行

3. **验证数据**
   - 执行后应该看到两条数据
   - 或者点击 **Table Editor** → **rounds** 表查看

### 测试数据说明：

**示例 1: 张三**
- 选项1: 我今年25岁 ✅ (真)
- 选项2: 我喜欢吃苹果 ✅ (真)
- 选项3: 我会说5种语言 ❌ (假 - 这是谎言)

**示例 2: 李四**
- 选项1: 我去过10个国家旅行 ✅ (真)
- 选项2: 我每天跑步5公里 ❌ (假 - 这是谎言)
- 选项3: 我是一名程序员 ✅ (真)

## 📊 方式二：使用 Excel 文件导入

### 步骤：

1. **准备 Excel 文件**
   - 我已经创建了 `test_data_excel.csv` 文件
   - 你可以用 Excel 打开并另存为 `.xlsx` 格式
   - 或者直接使用 CSV 文件（如果系统支持）

2. **在后台控制界面导入**
   - 访问: http://localhost:3000/#/host
   - 点击 **Import Excel** 按钮
   - 选择 Excel 文件上传
   - 应该看到两个参与者：张三、李四

3. **测试流程**
   - 点击 "张三" 创建投票轮次
   - 点击 "Start Timer" 开始投票
   - 在投票界面 (`/vote`) 测试投票
   - 在大屏幕 (`/display`) 查看实时结果

## 🧪 完整测试流程

1. ✅ 运行 `test_data.sql` 在 Supabase 中插入数据
2. ✅ 或者上传 Excel 文件到后台控制界面
3. ✅ 访问后台控制界面 (`/host`)
4. ✅ 选择一个参与者（如"张三"）
5. ✅ 点击 "Start Timer" 开始投票
6. ✅ 打开投票界面 (`/vote`) 或扫描二维码
7. ✅ 选择一个选项投票
8. ✅ 在大屏幕 (`/display`) 查看实时统计
9. ✅ 在后台控制界面点击 "Reveal" 揭示答案
10. ✅ 验证答案是否正确（选项3是谎言）

## 📋 Excel 文件格式说明

| 列名 | 说明 | 示例 |
|------|------|------|
| Name | 参与者姓名 | 张三 |
| Statement 1 | 第一个陈述 | 我今年25岁 |
| Statement 2 | 第二个陈述 | 我喜欢吃苹果 |
| Statement 3 | 第三个陈述 | 我会说5种语言 |
| Lie Index | 谎言索引（1-3） | 3 |

**注意**: `Lie Index` 必须是 1、2 或 3，表示哪个陈述是谎言。

## 🗑️ 清理测试数据

如果想删除测试数据，在 Supabase SQL Editor 运行：

```sql
-- 删除所有测试数据
DELETE FROM votes;
DELETE FROM rounds WHERE participant_name IN ('张三', '李四');
```

