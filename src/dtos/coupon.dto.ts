class CouponDTO {
  id: string;
  couponCode: string;
  discountType: string;
  percentage: number;
  expirationDate: Date;
  maximumUsage: number;
  status: string;
  currentUses: number;
  courseId: { id: string; title: string };
  createdAt: string;

  constructor(coupon: any) {
    (this.id = coupon._id), (this.couponCode = coupon.couponCode);
    this.discountType = coupon.discountType;
    this.percentage = coupon.percentage;
    this.expirationDate = coupon.expirationDate;
    this.maximumUsage = coupon.maximumUsage;
    this.status = coupon.status;
    this.currentUses = coupon.currentUses;
    this.createdAt = coupon.createdAt;
    this.courseId = {
      id: coupon.courseId._id,
      title: coupon.courseId.title,
    };
  }
}

export class GetSingleCouponDTO {}

export default CouponDTO;
