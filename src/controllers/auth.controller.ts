import "dotenv/config";
import {NextFunction, Request, Response} from "express";
import {authService} from "../Services/auth.service";
import {ExtendedRequest} from "../interfaces/auth.interface";
import {StatusCodes} from "http-status-codes";

class AuthController {
  // test: this service
  public async login(req: Request, res: Response, next: NextFunction) {
    const {email, password} = req.body;
    const serviceResponse = await authService.login(email, password);

    if (!serviceResponse?.responseObject?.token) {
      return res
        .status(401)
        .json({message: "Unauthorized, Login to access resource"});
    }
    res.cookie("accessToken", serviceResponse?.responseObject?.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(serviceResponse?.statusCode).json(serviceResponse);
  }

  // test: this service
  public async register(req: Request, res: Response, next: NextFunction) {
    const {email, telephone, firstName, lastName, password} = req.body;
    const serviceResponse = await authService.register({
      email,
      telephone,
      firstName,
      lastName,
      password,
    });

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: this service
  public async activateAccount(req: Request, res: Response) {
    const {token} = req.body;
    console.log({token});
    const serviceResponse = await authService.activateAccount(token as string);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  }

  // test: this service
  public async getSession(req: ExtendedRequest, res: Response) {
    return res.status(200).json(req.user);
  }

  // test: this service
  public async forgotPassword(req: Request, res: Response) {
    const {email} = req.body;
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/reset-password`;
    const serviceResponse = await authService.forgotPassword(email, resetUrl);
  }

  // test: this service
  public async resetPassword() {}

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
  public async suspendUserAccount() {}

  public async updateProfile() {}

  // idea: future implementation
  public async inviteStaff(req: Request, res: Response, next: NextFunction) {
    const {email} = req.body;
    const serviceResponse = await authService.inviteStaff(email);

    // res.status(serviceResponse.statusCode).json(serviceResponse);
  }
}

export const authController = new AuthController();
export default AuthController;
