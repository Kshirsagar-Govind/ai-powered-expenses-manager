import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { generateToken } from "../utils/jwt";

const publicUser = (user: { _id: { toString(): string }; name: string; email: string }) => ({
    id: user._id.toString(), name: user.name, email: user.email
});

export const RegisterNewUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide name, email, and password" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide a valid email address" });
        if (password.length < 6) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Password must be at least 6 characters long" });
        if (await User.exists({ email: email.toLowerCase() })) return res.status(StatusCodes.CONFLICT).json({ msg: "User with this email already exists" });

        const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
        return res.status(StatusCodes.CREATED).json({ msg: "Account created successfully", token: generateToken(publicUser(user)), user: publicUser(user) });
    } catch (error: any) {
        if (error?.code === 11000) return res.status(StatusCodes.CONFLICT).json({ msg: "User with this email already exists" });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "An error occurred while creating the account" });
    }
};

export const LoginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide both email and password" });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid email or password" });
        const safeUser = publicUser(user);
        return res.status(StatusCodes.OK).json({ msg: "User logged in successfully", token: generateToken(safeUser), user: safeUser });
    } catch (_error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "An error occurred during login" });
    }
};

export const UpdateUserData = async (_req: Request, res: Response) => res.status(StatusCodes.OK).json({ msg: "Users detail updated!" });
export const DeleteUser = async (_req: Request, res: Response) => res.status(StatusCodes.OK).json({ msg: "User account deleted!" });
