# 🧪 测试步骤指南

## 快速测试流程

### 步骤 1: 确保 Google Sheets 已公开

1. 打开你的 Google Sheets:
   https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/edit

2. 点击右上角 **"共享"** (Share) 按钮

3. 点击 **"更改"** (Change)

4. 选择 **"任何拥有链接的人都可以查看"** (Anyone with the link can view)

5. 点击 **"完成"** (Done)

---

### 步骤 2: 访问后台界面

打开后台控制界面：
```
https://stanford-sparks-voting-oj71whn5v-carverzs-projects.vercel.app/#/host
```

或者使用最新部署的 URL（如果已更新）

---

### 步骤 3: 同步 Google Sheets

1. 在后台界面，找到 **"Google Sheets URL"** 输入框
2. 确认 URL 是：
   ```
   https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/edit?resourcekey=&gid=1090508738#gid=1090508738
   ```
3. 点击 **"同步 Google Sheets"** 按钮
4. 等待同步完成（应该看到成功提示）

---

### 步骤 4: 验证导入结果

1. 检查 **"Participants"** 列表
2. 应该看到约 40+ 位参与者（跳过"-"的行）
3. 验证以下测试用例：

#### ✅ 测试用例 1: 桑倩倩
- 应该看到：`桑倩倩`
- 点击查看详情，应该看到：
  - statement_1: `喜欢运动`
  - statement_2: `喜欢运动` (重复)
  - statement_3: `害怕孤独`

#### ✅ 测试用例 2: 乐以～Li Shaoxin
- 应该看到：`乐以～Li Shaoxin`
- 点击查看详情，应该看到：
  - statement_1: `我会倒立`
  - statement_2: `我可以骑自行车不扶把`
  - statement_3: `我爱吃葱`

#### ✅ 测试用例 3: Jackie
- 应该看到：`Jackie`
- 点击查看详情，应该看到：
  - statement_1: `从一年级开始学大提琴，学到十一年级结束`
  - statement_2: `个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床`
  - statement_3: `1）大部分情况下可以在30秒内复原三阶魔方`

---

### 步骤 5: 测试选项打乱功能

1. 从参与者列表中选择一个参与者（如"乐以～Li Shaoxin"）
2. 点击 **"Start Timer"** 或创建投票轮次
3. 打开大屏幕界面：
   ```
   https://stanford-sparks-voting-oj71whn5v-carverzs-projects.vercel.app/#/display
   ```
4. 打开投票界面（手机或新标签页）：
   ```
   https://stanford-sparks-voting-oj71whn5v-carverzs-projects.vercel.app/
   ```

5. **验证选项打乱**：
   - ✅ 三个选项的顺序应该是随机的（不是固定顺序）
   - ✅ 每次创建新轮次，顺序可能不同
   - ✅ 谎言的位置会相应更新

6. **多次测试**：
   - 结束当前轮次
   - 再次选择同一个参与者，创建新轮次
   - 验证选项顺序是否不同

---

### 步骤 6: 测试投票功能

1. 在投票界面选择一个选项
2. 验证：
   - ✅ 有动画效果（选中反馈）
   - ✅ 大屏幕实时更新投票数
   - ✅ 显示 "X / Y 已投票"

---

## 🔍 调试技巧

### 如果同步失败：

1. **检查浏览器控制台** (F12)
   - 查看是否有错误信息
   - 检查网络请求是否成功

2. **验证 Google Sheets 权限**：
   - 在浏览器中直接访问 CSV URL：
   ```
   https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/export?format=csv&gid=1090508738
   ```
   - 如果显示 CSV 内容，说明权限正确
   - 如果显示登录页面，需要设置权限

3. **检查数据格式**：
   - 确保第3列是"群内微信名"
   - 确保第6列是"两真一假游戏: 两个真"
   - 确保第7列是"两真一假游戏: 一个假"

---

### 如果选项没有打乱：

1. **检查代码逻辑**：
   - 在 `HostDashboard.tsx` 第252行，应该有：
   ```typescript
   const indices = [0, 1, 2].sort(() => Math.random() - 0.5);
   ```

2. **验证数据库**：
   - 检查 `rounds` 表中的 `options` 字段
   - 检查 `correct_option_index` 是否正确

---

## 📊 预期结果

### 导入结果：
- ✅ 约 40+ 位有效参与者
- ✅ 所有测试用例都正确拆分
- ✅ 单个陈述的情况会重复使用

### 选项打乱结果：
- ✅ 每次创建轮次，选项顺序随机
- ✅ 谎言索引正确更新
- ✅ 用户看到的顺序是随机的

---

## 🚀 开始测试

现在可以开始测试了！

1. 确保 Google Sheets 已公开 ✅
2. 访问后台界面 ✅
3. 点击"同步 Google Sheets" ✅
4. 验证导入结果 ✅
5. 测试选项打乱 ✅
6. 测试投票功能 ✅

---

**遇到问题？** 查看浏览器控制台的错误信息，或告诉我具体的错误。

