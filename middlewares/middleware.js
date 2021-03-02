const errorTypes = {
  ValidationError: 422,
  UniqueViolationError: 409,
  BadInput: 400,
  NotAuthorizedError: 401,
  ForbiddenError: 403,
  ServerError: 500,
  NotFound: 404,
  DBError: 500,
  InvalidData: 404,
};

let errorCodes = {
  "08003": "connection_does_not_exist",
  "08006": "connection_failure",
  "2F002": "modifying_sql_data_not_permitted",
  "57P03": "cannot_connect_now",
  42601: "syntax_error",
  42501: "insufficient_privilege",
  42602: "invalid_name",
  42622: "name_too_long",
  42939: "reserved_name",
  42703: "undefined_column",
  42000: "syntax_error_or_access_rule_violation",
  "42P01": "undefined_table",
  "42P02": "undefined_parameter",
};
const errorMessages = {
  ValidationError: "Validation Error",
  UniqueViolationError: "Data Already exists.",
  ServerError: "Server Error",
  NotAuthorizedError: "Not Authorized",
  ForbiddenError: "Action forbidden",
  NotFound: "Not Found",
  BadInput: "Bad Input",
  DBError: "Database Error",
  InvalidData: "Invalid Data",
};

function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  console.log(error);
  console.log(errorTypes[error.message]);
  console.log(res.statusCode);
  const statusCode = res.statusCode
    ? errorTypes[error.name] || errorTypes[error.message] || res.statusCode
    : errorTypes[error.name] || errorTypes[error.message];
  res.status(statusCode);
  res.json({
    status: statusCode,
    message:
      (errorCodes[error.nativeError] && errorCodes[error.nativeError.code]) ||
      (errorCodes[error.nativeError] && error.nativeError.detail) ||
      errorMessages[error.name] ||
      error.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    data: error.error || (error.details && error.details.body[0].message),
  });
}

// module.exports = {
// notFound,
// errorHandler,
// };

function userMiddleware(req, res, next) {
  console.log(req.session.user);
  try {
    if (!req.session.user) {
      res.status(401).send({ error: "Invalid Request" });
    }
    // if (req.session.user && req.body.userId !== req.session.user) {
    //   throw "Invalid User";
    else {
      next();
    }
  } catch (err) {
    res.status(401).send({ error: "Invalid Request" });
  }
}
function adminMiddleware(req, res, next) {
  if (!req.session.isAdmin) {
    res.status(401);
    throw new Error(errorMessages.NotAuthorizedError);
  }
  next();
}

module.exports = {
  notFound,
  errorMessages,
  errorHandler,
  userMiddleware,
  adminMiddleware,
};
