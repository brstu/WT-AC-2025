class ApiError extends Error {
constructor(message, statusCode) {
super(message);
this.statusCode = statusCode;
this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
this.isOperational = true;
Error.captureStackTrace(this, this.constructor);
}
}
class BadRequestError extends ApiError {
constructor(message = 'Некорректный запрос') {
super(message, 400);
}
}
class NotFoundError extends ApiError {
constructor(message = 'Ресурс не найден') {
super(message, 404);
}
}
class ValidationError extends ApiError {
constructor(message = 'Ошибка валидации', errors = []) {
super(message, 422);
this.errors = errors;
}
}
class InternalServerError extends ApiError {
constructor(message = 'Внутренняя ошибка сервера') {
super(message, 500);
}
}
class ConflictError extends ApiError {
constructor(message = 'Конфликт данных') {
super(message, 409);
}
}
module.exports = {
ApiError,
BadRequestError,
NotFoundError,
ValidationError,
InternalServerError,
ConflictError
};