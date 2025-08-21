/**
 * Logging utility for Whish Payment SDK
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * Simple logger for SDK operations
 */
export class Logger {
  private static instance: Logger;
  private readonly enabledLevels: Set<LogLevel>;

  private constructor(enabledLevels: LogLevel[] = [LogLevel.WARN, LogLevel.ERROR]) {
    this.enabledLevels = new Set(enabledLevels);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static configure(enabledLevels: LogLevel[]): void {
    Logger.instance = new Logger(enabledLevels);
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.enabledLevels.has(level)) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...(context && { context }),
      ...(error && { error }),
    };

    // In production, you might want to send logs to an external service
    // For now, we'll use console methods
    const logMessage = this.formatLogMessage(logEntry);

    switch (level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, error);
        break;
    }
  }

  private formatLogMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
  }
}

// Export singleton instance for convenience
export const logger = Logger.getInstance();
