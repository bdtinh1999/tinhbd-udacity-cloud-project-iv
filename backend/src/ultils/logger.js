const winston = require('winston');

function createLogger(loggerName) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { name: loggerName },
    transports: [
      new winston.transports.Console()
    ]
  });
}

module.exports = { createLogger };
