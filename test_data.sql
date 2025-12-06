-- 测试数据：两条"两真一假"示例
-- 可以直接在 Supabase SQL Editor 中运行

-- 示例 1: 张三
INSERT INTO rounds (
  participant_name,
  options,
  correct_option_index,
  status
) VALUES (
  '张三',
  ARRAY['我今年25岁', '我喜欢吃苹果', '我会说5种语言'],
  2,  -- 第三个选项（索引2）是谎言：会说5种语言
  'PENDING'
);

-- 示例 2: 李四
INSERT INTO rounds (
  participant_name,
  options,
  correct_option_index,
  status
) VALUES (
  '李四',
  ARRAY['我去过10个国家旅行', '我每天跑步5公里', '我是一名程序员'],
  1,  -- 第二个选项（索引1）是谎言：每天跑步5公里
  'PENDING'
);

-- 查看插入的数据
SELECT 
  id,
  participant_name,
  options,
  correct_option_index,
  status,
  created_at
FROM rounds
ORDER BY created_at DESC
LIMIT 2;

