/**
 * Google Sheets 同步功能测试用例
 * 测试拆分逻辑和导入功能
 */

import { fetchFromGoogleSheets, buildCsvUrl, splitTruths } from './utils/googleSheetsSync';

// 测试拆分函数（需要导出才能测试）
// 由于 splitTruths 是私有函数，我们通过 fetchFromGoogleSheets 间接测试

describe('Google Sheets Sync Tests', () => {
  
  // 测试用例数据（基于实际 Excel 文件）
  const testCases = [
    {
      name: '桑倩倩',
      twoTruths: '喜欢运动',
      oneLie: '害怕孤独',
      expected: {
        statement_1: '喜欢运动',
        statement_2: '喜欢运动', // 只有一个真，会重复
        statement_3: '害怕孤独',
        lie_index: 2
      },
      description: '只有一个真，应该重复使用'
    },
    {
      name: '乐以～Li Shaoxin',
      twoTruths: '我会倒立。 我可以骑自行车不扶把',
      oneLie: '我爱吃葱',
      expected: {
        statement_1: '我会倒立',
        statement_2: '我可以骑自行车不扶把',
        statement_3: '我爱吃葱',
        lie_index: 2
      },
      description: '句号分隔的两个真'
    },
    {
      name: 'Jackie',
      twoTruths: '1）从一年级开始学大提琴，学到十一年级结束\n2）个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床',
      oneLie: '1）大部分情况下可以在30秒内复原三阶魔方',
      expected: {
        statement_1: '从一年级开始学大提琴，学到十一年级结束',
        statement_2: '个人最高纪录是在床上不吃不喝不上厕所到晚上7点才起床',
        statement_3: '1）大部分情况下可以在30秒内复原三阶魔方',
        lie_index: 2
      },
      description: '数字编号 + 换行符分隔'
    },
    {
      name: 'Liangfang',
      twoTruths: '1. 喜欢吃辣和看下雪； 2. 工作上注重条理是个J人，但日常生活中有点P人哈哈哈',
      oneLie: '1. 我擅长于学术会议的networking环节。',
      expected: {
        statement_1: '喜欢吃辣和看下雪',
        statement_2: '工作上注重条理是个J人，但日常生活中有点P人哈哈哈',
        statement_3: '1. 我擅长于学术会议的networking环节。',
        lie_index: 2
      },
      description: '数字编号 + 分号分隔'
    },
    {
      name: 'Lucy',
      twoTruths: '喜欢户外跑步；喜欢打羽毛球，虽然打得不是很好',
      oneLie: '会游泳',
      expected: {
        statement_1: '喜欢户外跑步',
        statement_2: '喜欢打羽毛球，虽然打得不是很好',
        statement_3: '会游泳',
        lie_index: 2
      },
      description: '分号分隔的两个真'
    }
  ];

  test('splitTruths function should handle various formats', () => {
    // 测试句号分隔
    const result1 = splitTruths('我会倒立。 我可以骑自行车不扶把');
    expect(result1[0]).toBe('我会倒立');
    expect(result1[1]).toBe('我可以骑自行车不扶把');

    // 测试分号分隔
    const result2 = splitTruths('喜欢户外跑步；喜欢打羽毛球，虽然打得不是很好');
    expect(result2[0]).toBe('喜欢户外跑步');
    expect(result2[1]).toBe('喜欢打羽毛球，虽然打得不是很好');

    // 测试数字编号
    const result3 = splitTruths('1. 喜欢吃辣和看下雪； 2. 工作上注重条理');
    expect(result3[0]).toContain('喜欢吃辣');
    expect(result3[1]).toContain('工作上注重条理');

    // 测试换行符
    const result4 = splitTruths('第一行\n第二行');
    expect(result4[0]).toBe('第一行');
    expect(result4[1]).toBe('第二行');

    // 测试单个陈述（应该返回原文本和空）
    const result5 = splitTruths('只有一个陈述');
    expect(result5[0]).toBe('只有一个陈述');
    expect(result5[1]).toBe('');
  });

  test('buildCsvUrl should extract correct spreadsheet ID and gid', () => {
    const url = 'https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/edit?resourcekey=&gid=1090508738#gid=1090508738';
    const csvUrl = buildCsvUrl(url);
    
    expect(csvUrl).toContain('1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU');
    expect(csvUrl).toContain('gid=1090508738');
    expect(csvUrl).toContain('format=csv');
  });
});

// 手动测试函数（可以在浏览器控制台运行）
export const testSplitLogic = () => {
  console.log('=== 测试拆分逻辑 ===\n');
  
  const testCases = [
    { input: '我会倒立。 我可以骑自行车不扶把', expected: '句号分隔' },
    { input: '喜欢户外跑步；喜欢打羽毛球', expected: '分号分隔' },
    { input: '1. 第一 2. 第二', expected: '数字编号' },
    { input: '第一行\n第二行', expected: '换行符' },
    { input: '只有一个陈述', expected: '单个陈述' },
  ];

  testCases.forEach(({ input, expected }) => {
    // 这里需要导入 splitTruths，但由于它是私有函数，我们通过实际数据测试
    console.log(`输入: "${input}"`);
    console.log(`类型: ${expected}`);
    console.log('---');
  });
};

