import { body } from "express-validator";

const checkoutRules = [
  body("addressId").optional().isUUID(),
  body("shippingAddress").optional().isObject(),
  body("shippingAddress.name").if(body("shippingAddress").exists()).notEmpty(),
  body("shippingAddress.phone").if(body("shippingAddress").exists()).notEmpty(),
  body("shippingAddress.email").if(body("shippingAddress").exists()).isEmail(),
  body("shippingAddress.country")
    .if(body("shippingAddress").exists())
    .notEmpty(),
  body("shippingAddress.city").if(body("shippingAddress").exists()).notEmpty(),
  body("shippingAddress.area").if(body("shippingAddress").exists()).notEmpty(),
  body("shippingAddress.street")
    .if(body("shippingAddress").exists())
    .notEmpty(),
  body("couponCode").optional().trim(),
  body().custom((value) => {
    if (!value.addressId && !value.shippingAddress) {
      throw new Error("Provide either addressId or shippingAddress");
    }
    return true;
  }),
];

const validateCouponRules = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
];

const couponRules = [
  body("code").notEmpty().withMessage("Code is required"),
  body("type")
    .isIn(["percentage", "fixed"])
    .withMessage("type must be percentage or fixed"),
  body("value")
    .isFloat({ min: 0 })
    .withMessage("value must be a positive number"),
  body("minOrder").optional().isFloat({ min: 0 }),
  body("maxDiscount").optional({ nullable: true }).isFloat({ min: 0 }),
  body("expiryDate").isISO8601().withMessage("expiryDate must be a valid date"),
  body("usageLimit").optional({ nullable: true }).isInt({ min: 1 }),
  body("isActive").optional().isBoolean(),
  body("isUserSpecific").optional().isBoolean(),
];

export { checkoutRules, validateCouponRules, couponRules };