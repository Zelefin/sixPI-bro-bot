export type LetterStatus = "correct" | "misplaced" | "incorrect" | "unused";

export interface GuessResponse {
  ok: boolean;
  is_correct: boolean;
  is_common: boolean;
  word: string;
}

export interface CloudData {
  date: string;
  attempts: string[];
}