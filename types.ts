export interface Participant {
  id: string; // UUID from database
  name: string;
  statement_1: string;
  statement_2: string;
  statement_3: string;
  lie_index: number; // 0, 1, or 2
}

// Representing the Excel Row structure
export interface ExcelRow {
  Name: string;
  "Statement 1": string;
  "Statement 2": string;
  "Statement 3": string;
  "Lie Index": number; // 1, 2, or 3 in Excel, converted to 0-2
}

export enum RoundStatus {
  PENDING = 'PENDING',
  VOTING = 'VOTING',
  LOCKED = 'LOCKED',
  REVEALED = 'REVEALED',
  COMPLETED = 'COMPLETED'
}

export interface Round {
  id: string;
  participant_id: string;
  participant_name: string; // Denormalized for easier UI
  options: string[]; // Array of 3 strings
  correct_option_index: number; // The index of the lie
  status: RoundStatus;
  created_at: string;
  votes: { [key: number]: number }; // Aggregated votes for chart
}

export interface Vote {
  round_id: string;
  option_index: number;
  user_session_id: string;
}

export const CHANNELS = {
  GAME: 'game-room'
};

export const EVENTS = {
  ROUND_UPDATE: 'round-update',
  NEW_VOTE: 'new-vote'
};