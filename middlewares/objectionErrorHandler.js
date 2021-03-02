const {
  ValidationError,
  NotFoundError,
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
} = require("objection");

// In this example `res` is an express response object.
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    switch (err.type) {
      case "ModelValidation":
        res.status(400).send({
          stack: err.message,
          message: err.type,
          data: err.data,
        });
        break;
      case "RelationExpression":
        res.status(400).send({
          stack: err.message,
          message: "RelationExpression",
          data: {},
        });
        break;
      case "UnallowedRelation":
        res.status(400).send({
          stack: err.message,
          message: err.type,
          data: {},
        });
        break;
      case "InvalidGraph":
        res.status(400).send({
          stack: err.message,
          message: err.type,
          data: {},
        });
        break;
      default:
        res.status(400).send({
          stack: err.message,
          message: "UnknownValidationError",
          data: {},
        });
        break;
    }
  } else if (err instanceof NotFoundError) {
    res.status(404).send({
      stack: err.message,
      message: "NotFound",
      data: {},
    });
  } else if (err instanceof UniqueViolationError) {
    res.status(409).send({
      stack: err.message,
      message: "UniqueViolation",
      data: {
        columns: err.columns,
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof NotNullViolationError) {
    res.status(400).send({
      stack: err.message,
      message: "NotNullViolation",
      data: {
        column: err.column,
        table: err.table,
      },
    });
  } else if (err instanceof ForeignKeyViolationError) {
    res.status(409).send({
      stack: err.message,
      message: "ForeignKeyViolation",
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof CheckViolationError) {
    res.status(400).send({
      stack: err.message,
      message: "CheckViolation",
      data: {
        table: err.table,
        constraint: err.constraint,
      },
    });
  } else if (err instanceof DataError) {
    res.status(400).send({
      stack: err.message,
      message: "InvalidData",
      data: {},
    });
  } else if (err instanceof DBError) {
    res.status(500).send({
      stack: err.message,
      message: "UnknownDatabaseError",
      data: {},
    });
  } else {
    next(err);
  }
}
module.exports = errorHandler;
