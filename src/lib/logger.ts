// src/lib/logger.ts
// Structured logging for debugging and observability

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private enabled = true;

  info(event: string, data?: Record<string, unknown>) {
    this.log('info', event, data);
  }

  warn(event: string, data?: Record<string, unknown>) {
    this.log('warn', event, data);
  }

  error(event: string, data?: Record<string, unknown>) {
    this.log('error', event, data);
  }

  debug(event: string, data?: Record<string, unknown>) {
    this.log('debug', event, data);
  }

  private log(level: LogLevel, event: string, data?: Record<string, unknown>) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      level,
      event,
      data,
      timestamp: Date.now(),
    };

    this.logs.push(entry);

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (import.meta.env.DEV) {
      const style = this.getConsoleStyle(level);
      const dataStr = data ? JSON.stringify(data, null, 2) : '';
      console.log(`%c[${level.toUpperCase()}] ${event}`, style, dataStr);
    }

    // Persist to localStorage for debugging
    this.persistLogs();
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      debug: 'color: #6b7280',
    };
    return styles[level];
  }

  private persistLogs() {
    try {
      const recentLogs = this.logs.slice(-100); // Store last 100 logs
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      // Silent fail if localStorage is full
      console.warn('Failed to persist logs:', error);
    }
  }

  getLogs(filter?: { level?: LogLevel; event?: string }): LogEntry[] {
    let filtered = this.logs;

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.event) {
      filtered = filtered.filter(log => log.event.includes(filter.event!));
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch {
      // Silent fail
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

export const logger = new Logger();

// Restore logs from localStorage on init
try {
  const stored = localStorage.getItem('app_logs');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      // Re-add stored logs (private access workaround)
      parsed.forEach(log => {
        if (log.level && log.event) {
          logger[log.level as LogLevel](log.event, log.data);
        }
      });
    }
  }
} catch {
  // Ignore errors loading logs
}