import { Participant } from '../types';

// Google Sheets 数据行结构
interface SheetRow {
  timestamp: string;
  gender: string;
  wechatName: string;  // 群内微信名
  mbti: string;
  preferences: string; // 择偶偏好
  twoTruths: string;   // 两真一假游戏: 两个真
  oneLie: string;      // 两真一假游戏: 一个假
  notes: string;       // 备注
}

/**
 * 从 Google Sheets 获取数据
 * 需要先将 Sheet 发布为 CSV 格式
 * 
 * 步骤:
 * 1. 在 Google Sheets 中，点击 File -> Share -> Publish to web
 * 2. 选择要发布的 Sheet
 * 3. 格式选择 "Comma-separated values (.csv)"
 * 4. 点击 "Publish"
 * 5. 复制生成的 URL
 */

// 解析 CSV 字符串
function parseCSV(csv: string): string[][] {
  const lines = csv.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
}

// 将 "两个真" 字段拆分为两个陈述
function splitTruths(truthsStr: string): [string, string] {
  if (!truthsStr || truthsStr.trim() === '' || truthsStr === '-') {
    return ['', ''];
  }
  
  const str = truthsStr.trim();
  
  // 1. 数字编号: "1. xxx 2. xxx" 或 "1）xxx 2）xxx" 或 "1) xxx 2) xxx"
  // 支持换行符
  const numberedPatterns = [
    /[1１][\.\)）]\s*([^\n\r]+?)\s*[2２][\.\)）]\s*(.+)/s,  // 1. xxx 2. xxx
    /^1[\.\)）]\s*([^\n\r]+?)\s*2[\.\)）]\s*(.+)/s,        // 1) xxx 2) xxx
    /1[\.\)）]\s*([^\n\r]+?)\s*2[\.\)）]\s*(.+)/s,         // 更宽松的匹配
  ];
  
  for (const pattern of numberedPatterns) {
    const match = str.match(pattern);
    if (match && match[1] && match[2]) {
      return [match[1].trim(), match[2].trim()];
    }
  }
  
  // 2. 换行符分隔（常见于多行输入）
  if (str.includes('\n') || str.includes('\r')) {
    const parts = str.split(/[\n\r]+/).filter(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join(' ').trim()];
    }
  }
  
  // 3. 分号分隔（中文或英文分号）
  if (str.includes('；') || str.includes(';')) {
    const parts = str.split(/[；;]+/).filter(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join('；').trim()];
    }
  }
  
  // 4. 句号分隔（如果句子较长）
  const sentences = str.split(/[。.]+/).filter(s => s.trim());
  if (sentences.length >= 2) {
    // 如果句子数量>=2，取前两个
    return [sentences[0].trim(), sentences.slice(1).join('。').trim()];
  }
  
  // 5. 逗号分隔（但要小心，因为可能只是列表）
  if (str.includes('，') && !str.includes('；') && !str.includes('。')) {
    const parts = str.split('，').filter(p => p.trim());
    if (parts.length >= 2) {
      // 如果逗号分隔后有多段，取前两段
      return [parts[0].trim(), parts.slice(1).join('，').trim()];
    }
  }
  
  // 6. 如果都没匹配到，尝试按长度拆分（如果文本很长）
  if (str.length > 20) {
    const midPoint = Math.floor(str.length / 2);
    // 尝试在中间位置找分隔符
    const separators = ['。', '.', '；', ';', '，', ','];
    for (const sep of separators) {
      const index = str.indexOf(sep, midPoint - 10);
      if (index > 0 && index < str.length - 5) {
        return [str.substring(0, index).trim(), str.substring(index + 1).trim()];
      }
    }
    // 如果找不到分隔符，直接按长度拆分
    return [str.substring(0, midPoint).trim(), str.substring(midPoint).trim()];
  }
  
  // 7. 如果都没匹配到，返回原文作为第一个，第二个为空
  return [str, ''];
}

// 从 CSV URL 获取并解析数据
export async function fetchFromGoogleSheets(csvUrl: string): Promise<Omit<Participant, 'id'>[]> {
  try {
    // 尝试直接访问
    let response = await fetch(csvUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    // 如果直接访问失败，尝试使用 CORS 代理
    if (!response.ok || response.status === 403 || response.status === 0) {
      console.log('Direct access failed, trying CORS proxy...');
      // 使用公共 CORS 代理
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`;
      response = await fetch(proxyUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`);
    }
    
    const csvText = await response.text();
    
    // 检查是否是 HTML 错误页面
    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.includes('<html')) {
      throw new Error('Google Sheets 需要公开访问权限。请将 Sheet 设为"任何拥有链接的人都可以查看"。');
    }
    
    const rows = parseCSV(csvText);
    
    // 跳过表头
    const dataRows = rows.slice(1);
    
    const participants: Omit<Participant, 'id'>[] = [];
    
    for (const row of dataRows) {
      // 确保有足够的列
      if (row.length < 7) continue;
      
      const wechatName = row[2]; // 群内微信名
      
      // 尝试两种格式：
      // 格式1: 第6列是"两个真"（需要拆分），第7列是"一个假"
      // 格式2: 第6列是"真实陈述1"，第7列是"真实陈述2"，第8列是"一个假"
      
      let truth1 = '';
      let truth2 = '';
      let lie = '';
      
      // 检查是否有第8列（格式2：分开的两列）
      if (row.length >= 8 && row[6] && row[7] && row[8]) {
        // 格式2: 真实陈述1、真实陈述2、一个假 分别在6、7、8列
        truth1 = row[6];
        truth2 = row[7];
        lie = row[8];
      } else {
        // 格式1: 两个真（第6列，需要拆分）、一个假（第7列）
        const twoTruths = row[5];
        lie = row[6];
        
        // 拆分两个真
        const [t1, t2] = splitTruths(twoTruths || '');
        truth1 = t1;
        truth2 = t2;
      }
      
      // 跳过没有名字或没有填写游戏数据的行
      if (!wechatName || wechatName === '-' || (!truth1 && !truth2 && !lie)) continue;
      if (truth1 === '-' && truth2 === '-' && lie === '-') continue;
      
      // 如果只有一个真，需要处理
      let finalTruth1 = truth1;
      let finalTruth2 = truth2;
      
      if (truth1 && !truth2) {
        // 只有一个真，尝试进一步拆分
        const [t1, t2] = splitTruths(truth1);
        if (t1 && t2) {
          finalTruth1 = t1;
          finalTruth2 = t2;
        } else if (truth1.length > 15) {
          // 如果文本较长，尝试按长度拆分
          const midPoint = Math.floor(truth1.length / 2);
          finalTruth1 = truth1.substring(0, midPoint).trim();
          finalTruth2 = truth1.substring(midPoint).trim();
        } else {
          // 如果还是只有一个且很短，就重复使用
          finalTruth1 = truth1;
          finalTruth2 = truth1; // 重复使用，但至少有两个选项
        }
      }
      
      // 如果没有有效的陈述，跳过
      if (!finalTruth1 && !finalTruth2 && !lie) continue;
      
      participants.push({
        name: wechatName,
        statement_1: finalTruth1 || '（未填写）',
        statement_2: finalTruth2 || finalTruth1 || '（未填写）',
        statement_3: lie || '（未填写）',
        lie_index: 2 // 谎言总是在第三个位置（索引2）
      });
    }
    
    return participants;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 提供更友好的错误信息
    if (errorMessage.includes('403') || errorMessage.includes('需要公开访问')) {
      throw new Error('Google Sheets 需要公开访问权限。\n\n请按以下步骤操作：\n1. 打开 Google Sheets\n2. 点击右上角"共享"按钮\n3. 将权限改为"任何拥有链接的人都可以查看"\n4. 保存后重试');
    }
    
    throw error;
  }
}

// 直接从 Google Sheets URL 构建 CSV 导出 URL
export function buildCsvUrl(sheetUrl: string): string {
  // 从 URL 中提取 spreadsheet ID 和 gid
  const spreadsheetMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = sheetUrl.match(/gid=(\d+)/);
  
  if (!spreadsheetMatch) {
    throw new Error('Invalid Google Sheets URL');
  }
  
  const spreadsheetId = spreadsheetMatch[1];
  const gid = gidMatch ? gidMatch[1] : '0';
  
  // 构建 CSV 导出 URL
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

// 默认的 Google Sheets URL
export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1JqK58kXUqAngKKq4ktw5-tw8_2oDytm2KTH2f0RaDqU/edit?resourcekey=&gid=1090508738#gid=1090508738';

