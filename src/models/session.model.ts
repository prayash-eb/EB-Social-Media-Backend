import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    jti: string;
    device: string;
    expiresAt: Date;
    valid: Boolean;
}

interface ISessionModel extends Model<ISession> {
    createSession(userId: mongoose.Types.ObjectId, jti: string, device: string): Promise<ISession>;
}

const sessionSchema = new Schema<ISession, ISessionModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        jti: {
            type: String,
            required: true,
            unique: true,
        },
        device: {
            type: String,
        },
        valid: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create a TTL(Time To Live) index on `expiresAt`
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.statics.createSession = async function (userId, jti, device) {
    const MAX_SESSIONS_PER_USER = Number(process.env.MAX_SESSIONS_PER_SER) || 3;
    const existingSessions = await Session.find({ userId }).sort({ createdAt: 1 }).exec();

    if (existingSessions.length >= MAX_SESSIONS_PER_USER) {
        const sessionsToRemove = existingSessions.slice(
            0,
            existingSessions.length - (MAX_SESSIONS_PER_USER - 1)
        );
        const sessionIds = sessionsToRemove.map((s) => s._id);
        await this.deleteMany({ _id: { $in: sessionIds } });
    }

    return await this.create({
        userId,
        jti,
        device,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    });
};

const Session = model<ISession, ISessionModel>("Session", sessionSchema);
export default Session;
