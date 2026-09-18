import { Coupon, CouponUsage, Product } from "../models/index.js";

import ApiError from "../utils/ApiError.js";
// A coupon can optionally be scoped to specific products/categories
// (via the coupon_products / coupon_categories join tables). If it has no
// such scoping, the whole cart is eligible.
const resolveEligibleSubtotal = async (coupon, items) => {
  const [scopedProducts, scopedCategories] = await Promise.all([
    coupon.getProducts(),
    coupon.getCategories(),
  ]);

  if (scopedProducts.length === 0 && scopedCategories.length === 0) {
    return items.reduce((sum, i) => sum + i.lineTotal, 0);
  }

  const productIds = new Set(scopedProducts.map((p) => p.id));
  const categoryIds = new Set(scopedCategories.map((c) => c.id));

  let eligible = 0;
  for (const item of items) {
    if (productIds.has(item.productId)) {
      eligible += item.lineTotal;
      continue;
    }
    const product = await Product.findByPk(item.productId, {
      attributes: ["id", "categoryId"],
    });
    if (product && categoryIds.has(product.categoryId))
      eligible += item.lineTotal;
  }
  return eligible;
};

/**
 * Validates a coupon code against the live, priced cart items — never a
 * client-supplied subtotal. Throws ApiError with a clear message on any
 * failure; returns { coupon, discount, eligibleSubtotal } on success.
 */
const validateCoupon = async (code, { userId, items }) => {
  if (!code) throw new ApiError(400, "Coupon code is required");

  const coupon = await Coupon.findOne({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");
  if (!coupon.isActive)
    throw new ApiError(400, "This coupon is no longer active");
  if (new Date(coupon.expiryDate) < new Date())
    throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }

  if (coupon.isUserSpecific) {
    if (!userId) throw new ApiError(401, "Please log in to use this coupon");
    const eligibleUsers = await coupon.getUsers({ where: { id: userId } });
    if (eligibleUsers.length === 0)
      throw new ApiError(403, "This coupon is not available on your account");
  }

  // One redemption per logged-in user by default. Guests (userId undefined)
  // skip this check since we have no durable identity to track against.
  if (userId) {
    const alreadyUsed = await CouponUsage.findOne({
      where: { couponId: coupon.id, userId },
    });
    if (alreadyUsed)
      throw new ApiError(400, "You have already used this coupon");
  }

  const eligibleSubtotal = await resolveEligibleSubtotal(coupon, items);
  if (eligibleSubtotal <= 0) {
    throw new ApiError(
      400,
      "This coupon does not apply to any items in your cart",
    );
  }
  if (eligibleSubtotal < parseFloat(coupon.minOrder)) {
    throw new ApiError(
      400,
      `Minimum order of ${coupon.minOrder} required for this coupon`,
    );
  }

  let discount =
    coupon.type === "percentage"
      ? (eligibleSubtotal * parseFloat(coupon.value)) / 100
      : parseFloat(coupon.value);

  discount = Math.min(discount, eligibleSubtotal);
  if (coupon.maxDiscount !== null)
    discount = Math.min(discount, parseFloat(coupon.maxDiscount));

  return {
    coupon,
    discount: parseFloat(discount.toFixed(2)),
    eligibleSubtotal,
  };
};

export default { validateCoupon };
