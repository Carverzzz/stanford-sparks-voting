import { Participant } from '../types';

// CSV 行结构（不需要分割，直接对应三个陈述）
interface CSVRow {
  Name: string;
  'Statement 1': string;
  'Statement 2': string;
  'Statement 3': string;
  'Lie Index': string | number; // 1, 2, or 3
}

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

// 从 CSV 文件解析参与者数据
export const parseCSVFile = (file: File): Promise<Omit<Participant, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          reject(new Error('CSV 文件至少需要表头和数据行'));
          return;
        }
        
        // 第一行是表头
        const headers = rows[0].map(h => h.trim());
        
        // 查找列索引
        const nameIndex = headers.findIndex(h => 
          h.toLowerCase() === 'name' || 
          h === '群内微信名' || 
          h === '姓名' ||
          h === 'Name'
        );
        
        const stmt1Index = headers.findIndex(h => 
          h.toLowerCase() === 'statement 1' || 
          h === 'Statement 1' ||
          h === '真实陈述1' ||
          h === '陈述1'
        );
        
        const stmt2Index = headers.findIndex(h => 
          h.toLowerCase() === 'statement 2' || 
          h === 'Statement 2' ||
          h === '真实陈述2' ||
          h === '陈述2'
        );
        
        const stmt3Index = headers.findIndex(h => 
          h.toLowerCase() === 'statement 3' || 
          h === 'Statement 3' ||
          h === '谎言' ||
          h === '一个假' ||
          h === '陈述3'
        );
        
        const lieIndexIndex = headers.findIndex(h => 
          h.toLowerCase() === 'lie index' || 
          h === 'Lie Index' ||
          h === '谎言索引' ||
          h === '谎言位置'
        );
        
        // 验证必需的列
        if (nameIndex === -1) {
          reject(new Error('找不到"Name"列（支持: Name, 群内微信名, 姓名）'));
          return;
        }
        
        if (stmt1Index === -1 || stmt2Index === -1 || stmt3Index === -1) {
          reject(new Error('找不到必需的陈述列（需要: Statement 1, Statement 2, Statement 3）'));
          return;
        }
        
        // 解析数据行
        const participants: Omit<Participant, 'id'>[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          
          if (row.length < Math.max(nameIndex, stmt1Index, stmt2Index, stmt3Index) + 1) {
            continue; // 跳过不完整的行
          }
          
          const name = row[nameIndex]?.trim();
          const statement1 = row[stmt1Index]?.trim();
          const statement2 = row[stmt2Index]?.trim();
          const statement3 = row[stmt3Index]?.trim();
          
          // 跳过空行
          if (!name || (!statement1 && !statement2 && !statement3)) {
            continue;
          }
          
          // 确定谎言索引
          let lieIndex = 2; // 默认第三个位置
          
          if (lieIndexIndex !== -1 && row[lieIndexIndex]) {
            const lieValue = parseInt(row[lieIndexIndex].toString().trim());
            if (!isNaN(lieValue) && lieValue >= 1 && lieValue <= 3) {
              lieIndex = lieValue - 1; // 转换为 0-based
            }
          }
          
          participants.push({
            name,
            statement_1: statement1 || '（未填写）',
            statement_2: statement2 || '（未填写）',
            statement_3: statement3 || '（未填写）',
            lie_index: lieIndex
          });
        }
        
        if (participants.length === 0) {
          reject(new Error('没有找到有效的参与者数据'));
          return;
        }
        
        resolve(participants);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file, 'UTF-8');
  });
};

