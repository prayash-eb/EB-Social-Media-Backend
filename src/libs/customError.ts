export class AppError extends Error {
    constructor(message: string, public statusCode: number, module: string) {
        super(message)
        this.statusCode = statusCode
        this.name = module
    }
}