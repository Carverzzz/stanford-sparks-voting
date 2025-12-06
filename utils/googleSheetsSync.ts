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
  // 尝试多种分隔方式
  // 1. 数字编号: "1. xxx 2. xxx" 或 "1）xxx 2）xxx"
  const numberedMatch = truthsStr.match(/[1１][\.\)）]\s*(.+?)\s*[2２][\.\)）]\s*(.+)/);
  if (numberedMatch) {
    return [numberedMatch[1].trim(), numberedMatch[2].trim()];
  }
  
  // 2. 分号分隔
  if (truthsStr.includes('；') || truthsStr.includes(';')) {
    const parts = truthsStr.split(/[；;]/);
    if (parts.length >= 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
  }
  
  // 3. 逗号分隔（但要小心中文逗号）
  if (truthsStr.includes('，') && !truthsStr.includes('；')) {
    const parts = truthsStr.split('，');
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join('，').trim()];
    }
  }
  
  // 4. 如果都没匹配到，返回原文和空字符串
  return [truthsStr.trim(), ''];
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
      const twoTruths = row[5];  // 两真一假游戏: 两个真
      const oneLie = row[6];     // 两真一假游戏: 一个假
      
      // 跳过没有名字或没有填写游戏数据的行
      if (!wechatName || wechatName === '-' || (!twoTruths && !oneLie)) continue;
      if (twoTruths === '-' && oneLie === '-') continue;
      
      // 拆分两个真
      const [truth1, truth2] = splitTruths(twoTruths || '');
      
      // 如果没有有效的陈述，跳过
      if (!truth1 && !truth2 && !oneLie) continue;
      
      participants.push({
        name: wechatName,
        statement_1: truth1 || '（未填写）',
        statement_2: truth2 || truth1 || '（未填写）', // 如果只有一个真，复用
        statement_3: oneLie || '（未填写）',
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

