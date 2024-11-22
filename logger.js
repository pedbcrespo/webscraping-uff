import winston from 'winston';
import cliProgress from 'cli-progress';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

export const getProgressBar = () => new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);