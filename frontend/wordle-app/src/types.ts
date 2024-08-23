export type LetterStatus = "correct" | "misplaced" | "incorrect" | "unused";

export interface GuessResponse {
  ok: boolean;
  is_correct: boolean;
  is_common: boolean;
  word: string;
  correct_word?: string;
}

export interface WinAmountsResponse {
  win_amounts: number[];  // 0 -> 1 ... 5 -> 6 guess
}

export interface CloudData {
  date: string;
  attempts: string[];
  correctWord: string;
}

export interface LeaderboardEntry {
  full_name: string;
  guesses: number;
  coins_earned: number;
}

export interface LeaderboardResponse {
  users: LeaderboardEntry[];
}