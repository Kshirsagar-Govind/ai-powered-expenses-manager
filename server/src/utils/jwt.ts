import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY || "development-secret";

export interface TokenPayload {
    id: string;
    name?: string;
    email?: string;
}

export const generateToken = (payload: TokenPayload): string =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): TokenPayload =>
    jwt.verify(token, JWT_SECRET) as TokenPayload;
