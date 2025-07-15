export class DisplayValueValidator {
  static validatePercentage(value: any): number {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid percentage value: ${value}`);
      return 0;
    }
    // Percentages should be 0-100 (or sometimes 0-1)
    if (num > 1 && num <= 100) return num;
    if (num >= 0 && num <= 1) return num * 100;
    if (num > 100) {
      console.warn(`Percentage exceeds 100: ${num}`);
      return 100;
    }
    return Math.max(0, num);
  }
  
  static validateCurrency(value: any): number {
    // If already a string with currency symbol, extract the number
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleanValue = value.replace(/[$,]/g, '').trim();
      const num = Number(cleanValue);
      if (!isNaN(num)) {
        return Math.round(num * 100) / 100;
      }
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid currency value: ${value}`);
      return 0;
    }
    return Math.round(num * 100) / 100; // Ensure 2 decimal places
  }
  
  static validateNumber(value: any): number {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid number value: ${value}`);
      return 0;
    }
    return num;
  }
  
  static validateBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    return !!value;
  }
  
  static validateDate(value: any): Date | null {
    if (!value) return null;
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date value: ${value}`);
        return null;
      }
      return date;
    } catch {
      console.warn(`Invalid date value: ${value}`);
      return null;
    }
  }
  
  static validateString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }
}