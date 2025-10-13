import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import type mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import type { UserAcademicDeleteDTO, UserAcademicEntryDTO, UserAcademicsDTO, UserBirthdayDateDTO, UserHobbyDTO, UserLocationDTO } from "../validators/user.validator.js";

export default class UserService {

    private checkUser = async (userId: mongoose.Types.ObjectId) => {
        const user = await User.findById(userId)
        if (!user) {
            throw new AppError("User doesnot exist", 400, "USER_MODULE")
        }
        return user;
    }

    public updateLocation = async (userId: mongoose.Types.ObjectId, data: UserLocationDTO): Promise<void> => {
        const user = await this.checkUser(userId)
        user.location.type = "Point";
        user.location.coordinates = [data.longitude, data.latitude]
        await user.save()
    }
    public removeLocation = async (userId: mongoose.Types.ObjectId): Promise<void> => {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $unset: {
                location: ""
            }
        })
        if (!updatedUser) {
            throw new AppError("User doesnot exist", 400, "USER_MODULE")
        }
    }
    public updateHobby = async (userId: mongoose.Types.ObjectId, data: UserHobbyDTO): Promise<void> => {
        const user = await this.checkUser(userId)
        const existingHobbies = new Set(user.hobbies)

        const uniqueHobbies = data.hobbies.filter((hobby) => {
            if (!existingHobbies.has(hobby)) {
                // include it in the set to prevent duplciation even within the hobbies array
                existingHobbies.add(hobby)
                return true
            }
            // skip the hobby as it is duplicate
            return false
        })

        if (uniqueHobbies.length > 0) {
            user.hobbies.push(...uniqueHobbies)
            await user.save()
        }
        else {
            throw new AppError("Hobbies already included", 400, "USER_MODULE")
        }
    }
    public deleteHobby = async (userId: mongoose.Types.ObjectId, data: UserHobbyDTO) => {
        const user = await this.checkUser(userId);
        const hobbiesToDelete = new Set(data.hobbies)
        const finalHobbies = user.hobbies.filter(hobby => !hobbiesToDelete.has(hobby))
        user.hobbies = finalHobbies
        await user.save()
    }

    public updateDateofBirth = async (userId: mongoose.Types.ObjectId, data: UserBirthdayDateDTO) => {
        const user = await this.checkUser(userId);
        user.dateOfBirth = data.dateOfBirth
        await user.save()
    }
    public deleteDateofBirth = async (userId: mongoose.Types.ObjectId) => {
        const user = await this.checkUser(userId);
        user.dateOfBirth = undefined
        await user.save()
    }

    public addOrUpdateAcademics = async (userId: mongoose.Types.ObjectId, data: UserAcademicsDTO) => {
        const user = await this.checkUser(userId);
        const { academicQualifications } = data;
        academicQualifications.forEach((newAcademic: UserAcademicEntryDTO) => {
            if (newAcademic.id) {
                // Update existing academic by id
                const index = user.academicQualifications.findIndex(existingAcademic => existingAcademic.id === newAcademic.id);
                if (index !== -1) {
                    user.academicQualifications[index]!.degreeName = newAcademic.degreeName;
                    user.academicQualifications[index]!.passedYear = newAcademic.passedYear;
                }
            } else {
                // Add new academic with generated id
                user.academicQualifications.push({
                    id: uuidv4().toString(),
                    degreeName: newAcademic.degreeName,
                    passedYear: newAcademic.passedYear
                });
            }
        });
        await user.save();
    }
    public deleteAcademics = async (userId: mongoose.Types.ObjectId, data: UserAcademicDeleteDTO) => {
        const user = await this.checkUser(userId);
        // perform filter on user.acdemicQualifications
        const uniqueAcademicIds = new Set(data.ids);
        const finalAcademics = user.academicQualifications.filter((academic) => !uniqueAcademicIds.has(academic.id))
        user.academicQualifications = finalAcademics
        await user.save();
    }

}