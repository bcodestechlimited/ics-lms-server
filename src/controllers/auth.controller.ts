import "dotenv/config";
import {NextFunction, Request, Response} from "express";
import {UploadedFile} from "express-fileupload";
import {StatusCodes} from "http-status-codes";
import {authService} from "../Services/auth.service";
import {userService} from "../Services/user.service";
import {APP_CONFIG} from "../config/app.config";
import {ExtendedRequest} from "../interfaces/auth.interface";

class AuthController {
  public async login(req: Request, res: Response, next: NextFunction) {
    const {email, password} = req.body;
    const role = req.query?.role as string;

    const serviceResponse = await authService.login(email, password);

    if (!serviceResponse?.responseObject?.token) {
      return res
        .status(401)
        .json({message: "Unauthorized, Login to access resource"});
    }
    if (!role) {
      res.cookie("accessToken", serviceResponse?.responseObject?.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      });
    }
    res.status(serviceResponse?.statusCode).json(serviceResponse);
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    const {email, telephone, firstName, lastName, password} = req.body;
    const checkIfUserExists = await authService.checkifUserExists(email);
    if (checkIfUserExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({message: "User account exists!. Please login."});
    }
    const serviceResponse = await authService.register({
      email,
      telephone,
      firstName,
      lastName,
      password,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async activateAccount(req: Request, res: Response) {
    const {token} = req.body;
    const serviceResponse = await authService.activateAccount(token as string);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async getSession(req: ExtendedRequest, res: Response) {
    return res.status(200).json(req.user);
  }

  public async forgotPassword(req: Request, res: Response) {
    const {email} = req.body;
    const role = req.query?.role as string;
    let resetUrl: string;
    if (["admin", "superadmin"].includes(role)) {
      resetUrl = `${APP_CONFIG.ADMIN_FRONTEND_BASE_URL}/auth/reset-password`;
    } else {
      resetUrl = `${APP_CONFIG.CLIENT_FRONTEND_BASE_URL}/auth/reset-password`;
    }
    const serviceResponse = await authService.forgotPassword(email, resetUrl);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async resetPassword(req: Request, res: Response) {
    const {token, newPassword} = req.body;

    const serviceResponse = await authService.resetPassword(token, newPassword);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: this service
  public async updatePassword(
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const {oldPassword, newPassword} = req.body;
    const userId = req.user && req.user._id;
    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({message: "Unauthorized, Login to access resource"});
    }
    const serviceResponse = await authService.updatePassword(
      userId,
      oldPassword,
      newPassword
    );

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: test this service
  public async onboardStaff(req: Request, res: Response, next: NextFunction) {
    const {password, newPassword, token, email} = req.body;
    const serviceResponse = await authService.onboardStaff({
      password,
      newPassword,
      token,
      email,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // todo: implement this service (write the code)
  public async suspendUserAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {id} = req.params;
    const serviceResponse = await userService.toggleAccountStatus(id);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  public async updateProfile(req: ExtendedRequest, res: Response) {
    const {firstName, lastName} = req.body;
    const userId = req.user && req.user._id;

    let avatarTempPath: string | undefined;
    if (req.files?.avatar) {
      const rawImage = req.files.avatar as UploadedFile | UploadedFile[];
      const file = Array.isArray(rawImage) ? rawImage[0] : rawImage;
      if (!/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({success: false, message: "Invalid image type"});
      }

      avatarTempPath = file.tempFilePath;
    }

    const serviceResponse = await userService.updateProfile({
      firstName,
      lastName,
      userId,
      tempFilePath: avatarTempPath,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // idea: future implementation
  public async inviteStaff(req: Request, res: Response, next: NextFunction) {
    const {email} = req.body;
    const serviceResponse = await authService.inviteStaff(email);

    // res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}

export const authController = new AuthController();
export default AuthController;
