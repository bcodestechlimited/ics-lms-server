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
    return jwt.sign(
      {id: userId, passwordVersion: passwordVersion},
      APP_CONFIG.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10d",
      }
    );
  } catch (error) {
    return null;
  }
};

const verifyUserAccessToken = (
  token: string
): {id: string; passwordVersion: number} | null => {
  try {
    const decoded = jwt.verify(
      token,
      APP_CONFIG.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

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
