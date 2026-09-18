import { Schema, model, Types } from "mongoose";

export interface IExpense {
    categoryId: Types.ObjectId;
    amount: number;
    description?: string;
    userId: Types.ObjectId;
    source: "ai" | "manual";
    createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        categoryId: { type: Schema.Types.ObjectId, ref: "ExpenseCategory", required: true },
        amount: { type: Number, required: true },
        description: { type: String, default: "" },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        source: { type: String, enum: ["ai", "manual"], default: "ai" },
        createdAt: { type: Date, default: Date.now }
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

export default model<IExpense>("Expense", expenseSchema);
