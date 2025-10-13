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
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ message: "Input Validation Error", errors })
            }
            return res.status(400).json({ message: "Invalid Request Body" })
        }
    }
}
export const validateQuery = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedQuery = schema.safeParse(req.query)
            if (!parsedQuery.success) {
                const errors = parsedQuery.error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ message: "Validation Error", errors })
            }
            // Attach validated query to a new property to avoid type conflicts
            (req as any).parsedQuery = parsedQuery.data
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ message: "Validation Error", errors })
            }
            next(error)
        }
    }
}

export const validateParams = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({ path: e.path, message: e.message }))
                return res.status(400).json({ message: "Validation Error", errors })
            }
            next(error)
        }
    }
}

