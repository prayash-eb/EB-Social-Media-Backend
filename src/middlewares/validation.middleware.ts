import type { NextFunction, Request, Response } from "express"
import { ZodError, ZodObject } from "zod"

export const validateBody = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                res.status(400).json({ messae: "Validation Error", errors })
            }
        }
    }
}
export const validateQuery = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.query);
            schema.parse(req.query)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                res.status(400).json({ messae: "Validation Error", errors })
            }
        }
    }
}