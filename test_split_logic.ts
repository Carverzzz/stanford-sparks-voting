/**
 * 测试拆分逻辑 - 可以直接在浏览器控制台运行
 * 基于实际 Excel 文件数据
 */

// 复制 splitTruths 函数用于测试
function splitTruths(truthsStr: string): [string, string] {
  if (!truthsStr || truthsStr.trim() === '' || truthsStr === '-') {
    return ['', ''];
  }
  
  const str = truthsStr.trim();
  
  // 1. 数字编号
  const numberedPatterns = [
    /[1１][\.\)）]\s*([^\n\r]+?)\s*[2２][\.\)）]\s*(.+)/s,
    /^1[\.\)）]\s*([^\n\r]+?)\s*2[\.\)）]\s*(.+)/s,
    /1[\.\)）]\s*([^\n\r]+?)\s*2[\.\)）]\s*(.+)/s,
  ];
  
  for (const pattern of numberedPatterns) {
    const match = str.match(pattern);
    if (match && match[1] && match[2]) {
      return [match[1].trim(), match[2].trim()];
    }
  }
  
  // 2. 换行符分隔
  if (str.includes('\n') || str.includes('\r')) {
    const parts = str.split(/[\n\r]+/).filter(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join(' ').trim()];
    }
  }
  
  // 3. 分号分隔
  if (str.includes('；') || str.includes(';')) {
    const parts = str.split(/[；;]+/).filter(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join('；').trim()];
    }
  }
  
  // 4. 句号分隔
  const sentences = str.split(/[。.]+/).filter(s => s.trim());
  if (sentences.length >= 2) {
    return [sentences[0].trim(), sentences.slice(1).join('。').trim()];
  }
  
  // 5. 逗号分隔
  if (str.includes('，') && !str.includes('；') && !str.includes('。')) {
    const parts = str.split('，').filter(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join('，').trim()];
    }
  }
  
  // 6. 按长度拆分
  if (str.length > 20) {
    const midPoint = Math.floor(str.length / 2);
    const separators = ['。', '.', '；', ';', '，', ','];
    for (const sep of separators) {
      const index = str.indexOf(sep, midPoint - 10);
      if (index > 0 && index < str.length - 5) {
        return [str.substring(0, index).trim(), str.substring(index + 1).trim()];
      }
    }
    return [str.substring(0, midPoint).trim(), str.substring(midPoint).trim()];
  }
  
  return [str, ''];
}

// 测试用例（基于实际数据）
const testCases = [
  {
    name: '桑倩倩',
    input: '喜欢运动',
    expected: ['喜欢运动', ''],
    description: '只有一个真'
  },
  {
    name: '乐以～Li Shaoxin',
    input: '我会倒立。 我可以骑自行车不扶把',
    expected: ['我会倒立', '我可以骑自行车不扶把'],
    description: '句号分隔'
  },
  {
    name: '景雯',
    input: '读过博士，做过茶壶；游泳校队',
    expected: ['读过博士，做过茶壶', '游泳校队'],
    description: '分号分隔（注意：原数据可能有问题）'
  },
  {
    name: '林子是什么林',
    input: '我从来没有熬过通宵；我每年都会去旅行',
    expected: ['我从来没有熬过通宵', '我每年都会去旅行'],
    description: '分号分隔'
  },
  {
    name: 'Jackie',
    input: '1）从一年级开始学大提琴，学到十一年级结束\n2）个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床',
    expected: ['从一年级开始学大提琴，学到十一年级结束', '个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床'],
    description: '数字编号 + 换行符'
  },
  {
    name: 'Lucy',
    input: '喜欢户外跑步；喜欢打羽毛球，虽然打得不是很好',
    expected: ['喜欢户外跑步', '喜欢打羽毛球，虽然打得不是很好'],
    description: '分号分隔'
  },
  {
    name: '爱吃辣的米娜酱',
    input: '1.我是双胞胎 2.我从没有独自旅行过',
    expected: ['我是双胞胎', '我从没有独自旅行过'],
    description: '数字编号'
  },
  {
    name: 'Liangfang',
    input: '1. 喜欢吃辣和看下雪； 2. 工作上注重条理是个J人，但日常生活中有点P人哈哈哈',
    expected: ['喜欢吃辣和看下雪', '工作上注重条理是个J人，但日常生活中有点P人哈哈哈'],
    description: '数字编号 + 分号'
  }
];

// 运行测试
console.log('=== 拆分逻辑测试 ===\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = splitTruths(testCase.input);
  const success = result[0] === testCase.expected[0] && 
                  (testCase.expected[1] === '' || result[1].includes(testCase.expected[1]) || testCase.expected[1].includes(result[1]));
  
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  console.log(`  输入: "${testCase.input}"`);
  console.log(`  预期: [${testCase.expected.map(s => `"${s}"`).join(', ')}]`);
  console.log(`  结果: [${result.map(s => `"${s}"`).join(', ')}]`);
  console.log(`  状态: ${success ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  说明: ${testCase.description}\n`);
  
  if (success) passed++;
  else failed++;
});

console.log(`\n总计: ${passed} 通过, ${failed} 失败`);

// 导出用于浏览器测试
if (typeof window !== 'undefined') {
  (window as any).testSplitLogic = () => {
    testCases.forEach((testCase) => {
      const result = splitTruths(testCase.input);
      console.log(`${testCase.name}:`, {
        input: testCase.input,
        result,
        expected: testCase.expected
      });
    });
  };
}

export { splitTruths, testCases };

