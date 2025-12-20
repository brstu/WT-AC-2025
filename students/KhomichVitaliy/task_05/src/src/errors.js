class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

class NotFoundError extends HttpError {
    constructor(message = "Ресурс не найден") {
        super(404, message);
    }
}

class ValidationError extends HttpError {
    constructor(message = "Некорректные данные", details) {
        super(422, message);
        this.details = details;
    }
}

module.exports = { HttpError, NotFoundError, ValidationError };