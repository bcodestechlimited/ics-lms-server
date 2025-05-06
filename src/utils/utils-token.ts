import jwt, { JwtPayload } from "jsonwebtoken";
import { APP_CONFIG } from "../config/app.config";
import crypto from "crypto";

const generateActivationToken = (userId: string): string | null => {
  return jwt.sign({id: userId}, APP_CONFIG.EMAIL_ACTIVATION_SECRET, {
    expiresIn: "24h",
  });
};

const verifyActivationToken = (token: string): Record<"id", string> | null => {
  try {
    const decoded = jwt.verify(
      token,
      APP_CONFIG.EMAIL_ACTIVATION_SECRET
    ) as JwtPayload;
    return {id: decoded.id};
  } catch (error) {
    return null;
  }
};

const generateUserAccessToken = ({
  userId,
  passwordVersion,
}: {
  userId: string;
  passwordVersion: number;
}): string | null => {
  try {
    const token = jwt.sign(
      {id: userId, passwordVersion: passwordVersion},
      APP_CONFIG.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "10d",
      }
    );

    return token;
  } catch (error) {
    return null;
  }
};

interface AccessTokenPayload {
  id: string;
  passwordVersion: number;
  iat: number;
  exp: number;
}

const verifyUserAccessToken = (
  token: string
): {id: string; passwordVersion: number} | null => {
  try {
    const decoded = jwt.verify(
      token,
      APP_CONFIG.ACCESS_TOKEN_SECRET
    ) as AccessTokenPayload;

    return {id: decoded.id, passwordVersion: decoded.passwordVersion};
  } catch (error) {
    return null;
  }
};

const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
};

export {
  generateActivationToken,
  generateUserAccessToken,
  verifyActivationToken,
  verifyUserAccessToken,
  generatePasswordResetToken,
};
