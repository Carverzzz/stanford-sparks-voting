# Google Sheets 同步设置指南

## ⚠️ 同步失败的原因

Google Sheets 默认是私有的，需要权限才能访问。有两种解决方案：

## 方案一：将 Sheet 设为公开（推荐）

### 步骤：

1. **打开你的 Google Sheets**
   - 访问: https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/edit

2. **点击右上角的"共享"按钮** (Share)

3. **修改访问权限**
   - 点击"更改" (Change)
   - 选择 **"任何拥有链接的人都可以查看"** (Anyone with the link can view)
   - 点击"完成" (Done)

4. **保存设置**
   - 确保权限已更新

5. **在后台界面重试同步**
   - 点击"同步 Google Sheets"按钮
   - 应该可以成功同步了

## 方案二：使用已发布的 CSV（如果方案一不行）

1. **在 Google Sheets 中**
   - 点击 **File** → **Share** → **Publish to web**
   - 选择要发布的 Sheet（通常是第一个）
   - 格式选择 **"Comma-separated values (.csv)"**
   - 点击 **"Publish"**

2. **复制发布的 URL**
   - 会得到一个类似这样的 URL:
   - `https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`

3. **在后台界面使用这个 URL**
   - 将 URL 粘贴到输入框中
   - 点击同步

## 测试 CSV URL

你可以直接在浏览器中测试 CSV URL 是否可访问：

```
https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/export?format=csv&gid=1090508738
```

如果浏览器显示 CSV 内容（而不是登录页面），说明可以访问。

## 常见错误

### 错误 1: "Failed to fetch: 403"
- **原因**: Sheet 是私有的
- **解决**: 按照方案一将 Sheet 设为公开

### 错误 2: "Failed to fetch: CORS"
- **原因**: 跨域问题
- **解决**: 代码已自动使用 CORS 代理，如果还不行，使用方案二

### 错误 3: "没有找到有效的参与者数据"
- **原因**: CSV 格式不对或数据为空
- **解决**: 检查 Sheet 中是否有数据，确保列顺序正确

## 数据格式要求

Sheet 的列顺序应该是：
1. Timestamp
2. GENDER
3. **群内微信名** (第3列，索引2)
4. MBTI
5. 择偶偏好
6. **两真一假游戏: 两个真** (第6列，索引5)
7. **两真一假游戏: 一个假** (第7列，索引6)
8. 备注

## 快速检查清单

- [ ] Sheet 已设为"任何拥有链接的人都可以查看"
- [ ] 在浏览器中可以直接访问 CSV URL
- [ ] Sheet 中有数据
- [ ] 列顺序正确

---

**设置完成后，在后台界面点击"同步 Google Sheets"即可！**

