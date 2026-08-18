export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function notFoundMiddleware(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === "ZodError" ? 400 : 500);
  const isProduction = process.env.NODE_ENV === "production";
  const message = status >= 500 && isProduction ? "Something went wrong." : error.message;
  res.status(status).json({
    success: false,
    message,
    errors: error.issues?.map((issue) => ({ path: issue.path.join("."), message: issue.message })) || [],
  });
}

