/**
 * Import participants from a CSV file into Supabase `participants` table.
 *
 * Usage:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/import_participants.js path/to/file.csv
 *
 * Notes:
 * - Requires papaparse and @supabase/supabase-js (already in project).
 * - Will ensure an active session exists; creates one if missing.
 * - Inserts participants and upserts on (name, session_id).
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  '';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureActiveSession() {
  const { data: active, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !active) {
    const { data: newSession, error: insertError } = await supabase
      .from('sessions')
      .insert({ name: `Imported ${new Date().toLocaleString()}`, is_active: true })
      .select()
      .single();
    if (insertError || !newSession) {
      throw insertError || new Error('Failed to create session');
    }
    return newSession.id;
  }
  return active.id;
}

function clampLieIndex(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 2;
  return Math.max(0, Math.min(2, num - 1)); // convert 1-3 to 0-2
}

async function importCsv(csvPath) {
  const absPath = path.resolve(csvPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const csvText = fs.readFileSync(absPath, 'utf8');
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.error('CSV parse errors:', parsed.errors.slice(0, 3));
    throw new Error('CSV parse error');
  }

  const sessionId = await ensureActiveSession();

  const rows = parsed.data
    .map((row) => ({
      name: row['Name'] || row['name'],
      statement_1: row['Statement 1'] || row['statement 1'] || '（未填写）',
      statement_2: row['Statement 2'] || row['statement 2'] || '（未填写）',
      statement_3: row['Statement 3'] || row['statement 3'] || '（未填写）',
      lie_index: clampLieIndex(row['Lie Index'] ?? row['lie index'] ?? 3),
      session_id: sessionId,
    }))
    .filter((r) => r.name && (r.statement_1 || r.statement_2 || r.statement_3));

  if (!rows.length) {
    throw new Error('No valid rows found in CSV.');
  }

  // Upsert by (name, session_id)
  const { error } = await supabase
    .from('participants')
    .upsert(rows, { onConflict: 'name,session_id' });

  if (error) {
    throw error;
  }

  console.log(`Imported ${rows.length} participants into session ${sessionId}.`);
}

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Usage: node scripts/import_participants.js path/to/file.csv');
  process.exit(1);
}

importCsv(fileArg)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


