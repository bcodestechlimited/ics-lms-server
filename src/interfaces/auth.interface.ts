import {Request} from "express";

export interface RegisterPayloadInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  telephone: string;
}

export interface ExtendedRequest extends Request {
  user?: {
    _id: any;
    email: string;
    passwordVersion?: number;
    firstName: string;
    lastName: string;
    role: string;
    avatar: string;
  };
}

export type UserType = ExtendedRequest["user"];

export type LocalUserType = ExtendedRequest["user"] & {
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  isActive: boolean;
};
