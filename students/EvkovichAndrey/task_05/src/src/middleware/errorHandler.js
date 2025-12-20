export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Внутренняя ошибка сервера';

    console.error(`[${new Date().toISOString()}] ${status} ${err.stack}`);

    res.status(status).json({
        error: {
            message,
            status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};