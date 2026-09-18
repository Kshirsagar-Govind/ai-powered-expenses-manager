import { Schema, model } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true }
    },
    {
        timestamps: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: any) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

export default model<IUser>("User", userSchema);
