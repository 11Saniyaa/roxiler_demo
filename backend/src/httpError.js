function httpError(status, message, fields) {
  const error = new Error(message);
  error.status = status;
  if (fields && Object.keys(fields).length) error.fields = fields;
  return error;
}

module.exports = { httpError };
