export interface Unit {
    id: string;
    name: string;
    words: Record<string, string>;
  }
  
export interface WordAttempt {
    ukrainian: string;
    english: string;
    userAnswer: string;
    isCorrect: boolean;
  }