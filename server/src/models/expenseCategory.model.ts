import { Schema, model, Types } from "mongoose";

export interface IExpenseCategory {
    name: string;
    color: string;
    userId: Types.ObjectId;
}

const expenseCategorySchema = new Schema<IExpenseCategory>(
    {
        name: { type: String, required: true, trim: true, lowercase: true },
        color: { type: String, default: "#808080" },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
    },
    {
        timestamps: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: any) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

expenseCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default model<IExpenseCategory>("ExpenseCategory", expenseCategorySchema);
