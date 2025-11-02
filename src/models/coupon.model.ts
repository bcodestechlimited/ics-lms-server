import mongoose, {Document, Schema} from "mongoose";

export enum DiscountType {
  FLASH_SALE = "FLASH_SALE",
  FIRST_TIME_USER = "FIRST_TIME_USER",
  LIMITED_TIME = "LIMITED_TIME",
  DISCOUNT = "DISCOUNT",
}

export enum CouponStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface ICoupon extends Document {
  couponCode: string;
  discountType: DiscountType;
  percentage: number;
  expirationDate: Date;
  maximumUsage: number;
  status: CouponStatusEnum;
  courseId: mongoose.Types.ObjectId;
  currentUses: number;
  users: [mongoose.Types.ObjectId];
  isDeleted: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    maximumUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    users: [{type: mongoose.Types.ObjectId, ref: "User", index: true}],
    status: {
      type: String,
      enum: Object.values(CouponStatusEnum),
      default: CouponStatusEnum.ACTIVE,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      index: true,
      autopopulate: false,
    },
    isDeleted: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
