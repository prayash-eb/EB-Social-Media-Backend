import z from "zod";

export const createTemplateSchema = z.object({
    name: z.string().min(3).max(50).toLowerCase(),
    subject: z.string().min(3).max(100),
    body: z.string().min(3).max(3000),
    description: z.string().optional(),
});

export const editTemplateSchema = z.object({
    name: z.string().min(3).max(50).toLowerCase().optional(),
    subject: z.string().min(3).max(100).optional(),
    body: z.string().min(3).max(3000).optional(),
    description: z.string().optional(),
});

export type CreateTempleteDTO = z.infer<typeof createTemplateSchema>;
export type EditTemplateDTO = z.infer<typeof editTemplateSchema>;
