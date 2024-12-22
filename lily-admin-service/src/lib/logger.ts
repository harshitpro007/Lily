import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const appRoot = process.cwd();

class CustomLogger {
  private levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
    cron: 6,
    health: 7,
    moengage: 8,
  };

  private options = {
    info: new DailyRotateFile({
      level: 'info',
      filename: `${appRoot}/logs/info-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: true,
      // maxsize: '5m', // 5MB
      maxFiles: 5,
      // colorize: false,
    }),
    error: new DailyRotateFile({
      level: 'error',
      filename: `${appRoot}/logs/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: true,
      // maxsize: '5m', // 5MB
      maxFiles: 5,
      // colorize: false,
    }),
    health: new DailyRotateFile({
      level: 'health',
      filename: `${appRoot}/logs/health-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: true,
      // maxsize: '5m', // 5MB
      maxFiles: 5,
      // colorize: false,
    }),
    cron: new DailyRotateFile({
      level: 'cron',
      filename: `${appRoot}/logs/cron-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: true,
      // maxsize: '5m', // 5MB
      maxFiles: 5,
      // colorize: false,
    }),
    moengage: new DailyRotateFile({
      level: 'moengage',
      filename: `${appRoot}/logs/moengage-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      json: true,
      // maxsize: '5m', // 5MB
      maxFiles: 5,
      // colorize: false,
    }),
    console: {
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    },
  };

  public logger = winston.createLogger({
    levels: this.levels,
    transports: [
      new winston.transports.Console(this.options.console),
      this.options.info,
      this.options.error,
      this.options.health,
      this.options.cron,
      this.options.moengage,
    ],
    exitOnError: false,
  });
}

export const logger = new CustomLogger().logger;
