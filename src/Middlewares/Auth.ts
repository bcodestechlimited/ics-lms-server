import {NextFunction, Response} from "express";
import {StatusCodes} from "http-status-codes";
import mongoose from "mongoose";
import {ExtendedRequest, LocalUserType} from "../interfaces/auth.interface.ts";
import User from "../models/User.ts";
import {ServiceResponse} from "../utils/service-response.ts";
import {verifyUserAccessToken} from "../utils/utils-token.ts";
import {handleServiceResponse} from "./validation.middleware.ts";

export const validateUser = async (req: ExtendedRequest, res: Response) => {
  try {
    res.status(200).json({valid: true});
  } catch (error) {
    res.status(401).json({valid: false});
  }
};

export const isLocalAuthenticated = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! Login to access this resource",
      });
    }

    const decoded = verifyUserAccessToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({message: "Unauthorized, Login to access resource"});
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({message: "User not found", success: false});
    }

    if (decoded.passwordVersion !== user.passwordVersion) {
      return res.status(403).json({
        message: "Password changed recently, login again to access resource",
        success: false,
      });
    }

    const userResponse = user.toObject();
    const userObj: LocalUserType = {
      _id: userResponse._id,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      email: userResponse.email,
      role: userResponse.role as string,
      isAdmin: userResponse.isAdmin,
      isEmailVerified: userResponse.isEmailVerified,
      avatar: userResponse.avatar as string,
    };

    req.user = userObj;
    next();
  } catch (error) {
    console.error("Authentication error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

export const isAuthenticated = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split("Bearer ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! Login to access this resource",
      });
    }

    const decoded = verifyUserAccessToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({message: "Unauthorized, Login to access resource"});
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({message: "User not found", success: false});
    }

    if (decoded.passwordVersion !== user.passwordVersion) {
      return res.status(403).json({
        message: "Password changed recently, login again to access resource",
        success: false,
      });
    }

    const userResponse = user.toObject();
    const userObj: LocalUserType = {
      _id: userResponse._id,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      email: userResponse.email,
      role: userResponse.role as string,
      isAdmin: userResponse.isAdmin,
      isEmailVerified: userResponse.isEmailVerified,
      avatar: userResponse.avatar as string,
    };

    req.user = userObj;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    handleServiceResponse(
      ServiceResponse.failure(
        "Internal Server Error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      ),
      res
    );
  }
};

export const checkUserRole =
  (roles: string[]) =>
  (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user as any;

    const hasRole =
      user?.role &&
      roles.some((role) => role.includes(user?.role.toLowerCase() as string));

    if (!hasRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };

// Validator function
export const isValidObjectId = (id: any) => {
  const {ObjectId} = mongoose.Types;

  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
};
