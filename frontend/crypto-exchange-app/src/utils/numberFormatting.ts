/**
 * Formats a number for display, adapting to its magnitude and respecting maximum decimal places.
 * @param value The number to format
 * @param isCurrency Whether to format as currency
 * @param maxDecimalPlaces Maximum number of decimal places to show
 * @returns Formatted string
 */
export function formatNumber(value: number, isCurrency: boolean = false, maxDecimalPlaces: number = 8): string {
    if (value === 0) return isCurrency ? '$0.00' : '0';
  
    const absValue = Math.abs(value);
    let formattedValue: string;
  
    if (absValue < 0.00001) {
      // For very small numbers, use scientific notation
      formattedValue = value.toExponential(Math.min(2, maxDecimalPlaces));
    } else if (absValue < 1) {
      // For numbers less than 1, show up to maxDecimalPlaces
      formattedValue = value.toFixed(maxDecimalPlaces);
    } else if (absValue < 1000) {
      // For numbers between 1 and 999, show up to 2 decimal places or maxDecimalPlaces, whichever is smaller
      formattedValue = value.toFixed(Math.min(2, maxDecimalPlaces));
    } else {
      // For large numbers, use toLocaleString for thousands separators
      formattedValue = value.toLocaleString(undefined, { 
        maximumFractionDigits: Math.min(2, maxDecimalPlaces) 
      });
    }
  
    // Trim trailing zeros after the decimal point, but keep at least 2 decimal places for currency
    formattedValue = formattedValue.replace(/\.?0+$/, '');
    if (isCurrency) {
      const parts = formattedValue.split('.');
      if (parts.length === 1) {
        formattedValue += '.00';
      } else if (parts[1].length === 1) {
        formattedValue += '0';
      }
    }
  
    return isCurrency ? `$${formattedValue}` : formattedValue;
  }