import { body } from "express-validator";

const cancelOrderRules = [body("reason").optional().trim()];

const returnRequestRules = [
  body("reason").trim().notEmpty().withMessage("Please tell us why you're returning this"),
  body("itemsReturned").isArray({ min: 1 }).withMessage("Select at least one item to return"),
  body("itemsReturned.*.orderItemId").isUUID().withMessage("Invalid order item"),
  body("itemsReturned.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const statusUpdateRules = [
  body("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "return_requested",
      "returned",
      "refunded",
    ]),
  body("note").optional().trim(),
  body("trackingNumber").optional({ nullable: true }).trim(),
  body("courierName").optional({ nullable: true }).trim(),
  body("trackingUrl").optional({ nullable: true }).isURL(),
  body("estimatedDeliveryDate").optional({ nullable: true }).isISO8601(),
];

const returnReviewRules = [
  body("status").isIn(["approved", "rejected", "received", "completed"]).withMessage("Invalid return status"),
  body("adminNote").optional().trim(),
  body("refundAmount").optional().isFloat({ min: 0 }),
];

export default { cancelOrderRules, returnRequestRules, statusUpdateRules, returnReviewRules };
