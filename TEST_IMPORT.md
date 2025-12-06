# 测试用例：Google Sheets 导入功能

## 📋 测试数据

基于你的实际 Excel 文件，我创建了测试用例，包含以下格式的数据：

### 测试用例列表

1. **桑倩倩** - 只有一个真
   - 两个真: `喜欢运动`
   - 一个假: `害怕孤独`
   - **预期**: statement_1 = "喜欢运动", statement_2 = "喜欢运动"（重复）, statement_3 = "害怕孤独"

2. **乐以～Li Shaoxin** - 句号分隔
   - 两个真: `我会倒立。 我可以骑自行车不扶把`
   - 一个假: `我爱吃葱`
   - **预期**: statement_1 = "我会倒立", statement_2 = "我可以骑自行车不扶把", statement_3 = "我爱吃葱"

3. **景雯** - 分号分隔
   - 两个真: `读过博士，做过茶壶；游泳校队`
   - 一个假: `身高169cm`
   - **预期**: statement_1 = "读过博士，做过茶壶", statement_2 = "游泳校队", statement_3 = "身高169cm"

4. **Jackie** - 数字编号 + 换行符
   - 两个真: `1）从一年级开始学大提琴，学到十一年级结束\n2）个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床`
   - 一个假: `1）大部分情况下可以在30秒内复原三阶魔方`
   - **预期**: statement_1 = "从一年级开始学大提琴...", statement_2 = "个人最高纪录...", statement_3 = "1）大部分情况下..."

5. **Lucy** - 分号分隔
   - 两个真: `喜欢户外跑步；喜欢打羽毛球，虽然打得不是很好`
   - 一个假: `会游泳`
   - **预期**: statement_1 = "喜欢户外跑步", statement_2 = "喜欢打羽毛球，虽然打得不是很好", statement_3 = "会游泳"

6. **爱吃辣的米娜酱** - 数字编号
   - 两个真: `1.我是双胞胎 2.我从没有独自旅行过`
   - 一个假: `我是少数民族`
   - **预期**: statement_1 = "我是双胞胎", statement_2 = "我从没有独自旅行过", statement_3 = "我是少数民族"

7. **Liangfang** - 数字编号 + 分号
   - 两个真: `1. 喜欢吃辣和看下雪； 2. 工作上注重条理是个J人，但日常生活中有点P人哈哈哈`
   - 一个假: `1. 我擅长于学术会议的networking环节。`
   - **预期**: statement_1 = "喜欢吃辣和看下雪", statement_2 = "工作上注重条理...", statement_3 = "1. 我擅长于..."

## ✅ 测试步骤

### 1. 测试 CSV 导入

```bash
# 在浏览器控制台运行
# 或者使用测试文件 test_import_data.csv
```

### 2. 验证拆分逻辑

系统会按以下优先级尝试拆分：

1. ✅ 数字编号: `1. xxx 2. xxx` 或 `1）xxx 2）xxx`
2. ✅ 换行符: `xxx\nxxx`
3. ✅ 分号: `xxx；xxx` 或 `xxx; xxx`
4. ✅ 句号: `xxx。xxx`
5. ✅ 逗号: `xxx，xxx`
6. ✅ 按长度拆分（如果文本很长）

### 3. 验证选项打乱

在 `HostDashboard.tsx` 的 `createRound` 函数中（第149-157行），系统会：

```typescript
// Shuffle options logic
const optionsRaw = [p.statement_1, p.statement_2, p.statement_3];
const originalLieIndex = p.lie_index;

const indices = [0, 1, 2].sort(() => Math.random() - 0.5);
const shuffledOptions = indices.map(i => optionsRaw[i]);
const newLieIndex = indices.indexOf(originalLieIndex);
```

**确保**：
- ✅ 三个选项会被随机打乱顺序
- ✅ 谎言索引会相应更新
- ✅ 用户看到的顺序是随机的

## 🧪 手动测试

1. **在后台界面** (`/host`)
2. **点击"同步 Google Sheets"**
3. **检查参与者列表**，应该看到所有有效数据
4. **选择一个参与者**，创建投票轮次
5. **验证**：
   - 三个选项是否正确显示
   - 选项顺序是否被打乱
   - 谎言是否在正确位置

## 📊 预期结果

所有测试用例应该：
- ✅ 成功导入
- ✅ 正确拆分"两个真"字段
- ✅ 三个选项完整显示
- ✅ 选项顺序随机打乱
- ✅ 谎言索引正确更新

---

**测试文件**: `test_import_data.csv` 包含所有测试用例的 CSV 格式数据

