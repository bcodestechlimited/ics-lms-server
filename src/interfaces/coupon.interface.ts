export interface ProcessCouponInterface {
  couponCode: string;
  courseId: string;
}

export interface CouponCheckoutInterface extends ProcessCouponInterface {}
