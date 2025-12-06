import * as XLSX from 'xlsx';
import { ExcelRow, Participant } from '../types';

export const parseExcel = (file: File): Promise<Omit<Participant, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        const participants = json.map((row) => ({
          name: row.Name,
          statement_1: row["Statement 1"],
          statement_2: row["Statement 2"],
          statement_3: row["Statement 3"],
          lie_index: (row["Lie Index"] || 1) - 1 // Convert 1-based Excel to 0-based JS
        }));

        resolve(participants);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};