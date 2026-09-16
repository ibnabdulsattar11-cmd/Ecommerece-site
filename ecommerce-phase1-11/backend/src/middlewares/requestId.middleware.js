const { v4: uuidv4 } = require("uuid"); // already a dependency

// Lets you grep logs (and tell a customer "give me the X-Request-Id from
// your error") to find the exact request across access logs and error
// logs, instead of guessing from a timestamp.
const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
};

module.exports = requestId;
