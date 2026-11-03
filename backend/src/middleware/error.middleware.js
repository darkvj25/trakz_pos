const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || 'Unhandled Server Error', { stack: err.stack, path: req.path });
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = errorHandler;
