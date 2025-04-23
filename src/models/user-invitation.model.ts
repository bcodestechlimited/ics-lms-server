import mongoose, {Document} from "mongoose";

enum InvitationEnum {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface IUserInvitation extends Document {
  firstName: string;
  lastName: string;
  email: string;
  status: InvitationEnum;
  token: string;
  invitedAt: Date;
}

const userInvitationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: Object.values(InvitationEnum),
    default: InvitationEnum.PENDING,
  },
  token: String,
  invitedAt: {type: Date, default: Date.now},
});

export const UserInvitation = mongoose.model(
  "UserInvitation",
  userInvitationSchema
);
