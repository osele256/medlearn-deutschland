// src/lib/bugFixes.ts
// Common bug fixes and improvements for Day 6

/**
 * BUG FIX #1: localStorage quota exceeded
 * Symptom: App crashes when localStorage is full
 * Solution: Implement smart storage management
 */
export function cleanupOldData() {
  try {
    const storage = localStorage.getItem('medical-learning-storage');
    if (!storage) return;

    const data = JSON.parse(storage);
    
    // Keep only last 20 scenarios
    if (data.state?.scenarioHistory?.length > 20) {
      data.state.scenarioHistory = data.state.scenarioHistory.slice(-20);
    }

    // Keep only last 50 translations
    if (data.state?.translations?.length > 50) {
      data.state.translations = data.state.translations.slice(-50);
    }

    // Keep only last 100 logs
    const logs = localStorage.getItem('app_logs');
    if (logs) {
      const parsed = JSON.parse(logs);
      if (Array.isArray(parsed) && parsed.length > 100) {
        localStorage.setItem('app_logs', JSON.stringify(parsed.slice(-100)));
      }
    }

    localStorage.setItem('medical-learning-storage', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to cleanup storage:', e);
    // If cleanup fails, clear non-essential data
    try {
      localStorage.removeItem('app_logs');
    } catch {}
  }
}

/**
 * BUG FIX #2: Handle localStorage quota errors
 * Symptom: State not persisting when quota exceeded
 * Solution: Catch and handle gracefully
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      cleanupOldData();
      
      // Try again after cleanup
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('localStorage still full after cleanup');
        return false;
      }
    }
    return false;
  }
}

/**
 * BUG FIX #3: Debounce rapid operations
 * Symptom: Multiple API calls when user clicks rapidly
 * Solution: Debounce function with proper typing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * BUG FIX #4: Throttle rapid operations
 * Symptom: Performance issues with rapid scrolling/resizing
 * Solution: Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * BUG FIX #5: Validate input before processing
 * Symptom: Crashes on invalid input
 * Solution: Input sanitization
 */
export function sanitizeInput(input: string, maxLength = 10000): string {
  if (!input || typeof input !== 'string') return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove potentially problematic characters (optional)
  // sanitized = sanitized.replace(/[<>]/g, '');
  
  return sanitized;
}

/**
 * BUG FIX #6: Deep clone objects safely
 * Symptom: State mutation causing bugs
 * Solution: Safe deep clone function
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to deep clone:', e);
    return obj;
  }
}

/**
 * BUG FIX #7: Retry with exponential backoff
 * Symptom: Single failures causing permanent errors
 * Solution: Smart retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * BUG FIX #8: Format error messages for users
 * Symptom: Technical error messages confuse users
 * Solution: User-friendly error formatter
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Map technical errors to user-friendly messages
    if (error.message.includes('timeout')) {
      return 'The operation took too long. Please try again.';
    }
    if (error.message.includes('network')) {
      return 'Network connection issue. Check your internet and try again.';
    }
    if (error.message.includes('quota')) {
      return 'Storage is full. Some older data has been cleared automatically.';
    }
    if (error.message.includes('not available')) {
      return 'This feature requires Chrome AI. Please enable it in chrome://flags';
    }
    
    // Generic error
    return 'Something went wrong. Please try again.';
  }
  
  return 'An unexpected error occurred.';
}

/**
 * BUG FIX #9: Check if element is in viewport
 * Symptom: Auto-scroll not working properly
 * Solution: Viewport detection
 */
export function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * BUG FIX #10: Smooth scroll to element
 * Symptom: Jumpy scrolling
 * Solution: Smooth scroll helper
 */
export function smoothScrollTo(element: HTMLElement, offset = 0) {
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * BUG FIX #11: Check if running in mobile
 * Symptom: Desktop-only features breaking mobile
 * Solution: Mobile detection
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

/**
 * BUG FIX #12: Copy to clipboard with fallback
 * Symptom: Copy button doesn't work in some browsers
 * Solution: Clipboard API with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard API failed, trying fallback');
    }
  }
  
  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (e) {
    console.error('Copy to clipboard failed:', e);
    return false;
  }
}

/**
 * BUG FIX #13: Format date/time consistently
 * Symptom: Inconsistent date formats
 * Solution: Centralized formatting
 */
export function formatTimestamp(timestamp: number, locale = 'de-DE'): string {
  return new Date(timestamp).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timestamp: number, locale = 'de-DE'): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * BUG FIX #14: Cancel pending requests
 * Symptom: Old requests completing after navigation
 * Solution: AbortController pattern
 */
export function createAbortablePromise<T>(
  fn: (signal: AbortSignal) => Promise<T>
): { promise: Promise<T>; abort: () => void } {
  const controller = new AbortController();
  
  return {
    promise: fn(controller.signal),
    abort: () => controller.abort(),
  };
}

/**
 * BUG FIX #15: Prevent memory leaks
 * Symptom: Memory grows over time
 * Solution: Cleanup helper
 */
export function createCleanup() {
  const cleanupFns: (() => void)[] = [];
  
  return {
    add: (fn: () => void) => cleanupFns.push(fn),
    cleanup: () => {
      cleanupFns.forEach(fn => {
        try {
          fn();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      });
      cleanupFns.length = 0;
    },
  };
}