import type { NextFunction, Request, Response } from "express"
import { ZodError, ZodObject } from "zod"

export const validateBody = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.is("multipart/form-data") && typeof req.body?.data === "string") {
                req.body = JSON.parse(req.body?.data)
            }
            const parsedData = schema.parse(req.body)
            req.body = parsedData
            next()
        } catch (error) {
            console.log(error);
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ messae: "Input Validation Error", errors })
            }
            return res.status(400).json({ message: "Invalid Request Body" })
        }
    }
}
export const validateQuery = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.safeParse(req.query)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ messae: "Validation Error", errors })
            }
            next(error)
        }
    }
}

