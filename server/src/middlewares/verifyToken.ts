import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model";
import { TokenPayload, verifyToken } from "../utils/jwt";

export interface IUserRequest {
    id: string;
    name?: string;
    email?: string;
}

export interface AuthRequest extends Request {
    user?: IUserRequest;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication invalid. Please provide a valid token." });
        }

        const decoded = verifyToken(authHeader.slice(7)) as TokenPayload;
        const user = await User.findById(decoded.id).lean();
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "User not found. Token may be invalid." });
        }

        req.user = { id: user._id.toString(), name: user.name, email: user.email };
        return next();
    } catch (_error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid or expired token" });
    }
};
