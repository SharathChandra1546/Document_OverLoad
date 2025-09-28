import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for conditionally joining classNames together
 * Combines clsx functionality for a clean API
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export default cn;