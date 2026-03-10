import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required. Server cannot start without it.");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
    userId: string;
    role: string;
}

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ userId, role } satisfies JwtPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
