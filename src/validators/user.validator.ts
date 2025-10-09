import mongoose from "mongoose";
import z from "zod";

const currentYear = new Date().getFullYear()

export const userLocationSchema = z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90)

})
export const userHobbySchema = z.object({
    hobbies: z.array(z.string().toLowerCase().trim()).min(1)
})

export const userBirthdayDateSchema = z.object({
    dateOfBirth: z.string().trim()
})

export const userAcademicEntrySchema = z.object({
    id: mongoose.Types.ObjectId,
    passedYear: z.number().int("Year must be a whole number").max(currentYear, "Passed year cannot be in future"),
    degreeName: z.string().trim().toLowerCase().min(2, "Degree name must be at least 2 characters").max(50, "Degree name mustnot be greater than 50 characters")
})

export const userAcademicsSchema = z.object({
    academicQualifications: z.array(userAcademicEntrySchema).min(1, "Please provide at least one academic qualification.")
})

export type UserLocationDTO = z.infer<typeof userLocationSchema>;
export type UserHobbyDTO = z.infer<typeof userHobbySchema>;
export type UserBirthdayDateDTO = z.infer<typeof userBirthdayDateSchema>;
export type UserAcademicEntryDTO = z.infer<typeof userAcademicEntrySchema>;
export type UserAcademicsDTO = z.infer<typeof userAcademicsSchema>;

