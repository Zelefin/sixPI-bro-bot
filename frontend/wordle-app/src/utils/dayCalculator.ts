// utils/dayCalculator.ts

/**
 * Calculates the current day number of the year
 * @returns {number} The current day number (1-366)
 */
export const calculateDayNumber = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };