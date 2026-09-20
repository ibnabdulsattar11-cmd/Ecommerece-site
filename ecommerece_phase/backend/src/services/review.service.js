import { Review, Product, OrderItem, Order } from "../models/index.js";

// A review is "verified purchase" if the reviewer has at least one
// DELIVERED order containing this product — checked at review-creation
// time and snapshotted onto the review (doesn't change retroactively if
// they later return the item).
const isVerifiedPurchase = async (userId, productId) => {
  if (!userId) return false;

  const count = await OrderItem.count({
    where: { productId },
    include: [{ model: Order, where: { userId, status: "delivered" }, attributes: [] }],
  });

  return count > 0;
};

// Recalculates Product.avgRating / Product.reviewCount from APPROVED
// reviews only — call this after any create/update/delete/moderation
// action that could change which reviews count.
const recomputeProductRating = async (productId) => {
  const approved = await Review.findAll({
    where: { productId, status: "approved" },
    attributes: ["rating"],
  });

  const reviewCount = approved.length;
  const avgRating = reviewCount ? approved.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  await Product.update(
    { avgRating: parseFloat(avgRating.toFixed(1)), reviewCount },
    { where: { id: productId } }
  );
};

export { isVerifiedPurchase, recomputeProductRating };