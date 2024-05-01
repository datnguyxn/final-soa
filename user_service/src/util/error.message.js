export const ErrorMessage = (status = 500, message = '', cause = '') => {
    return {
        status,
        message,
        cause
    }
}