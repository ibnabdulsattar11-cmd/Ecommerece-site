// Deliberately not pulling in winston/pino — for the current scale of this
// app, structured console output is enough and every hosting platform
// (Railway/Render/Docker/etc.) already captures stdout/stderr as logs.
// Swap this out for a real logging library if/when volume justifies it.
const log = (level, message, meta = {}) => {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export default {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};
