import { body } from "express-validator";

const setBlockedRules = [
  body("blocked").isBoolean().withMessage("blocked must be true or false"),
];

const setRoleRules = [
  body("role")
    .isIn(["USER", "ADMIN"])
    .withMessage("role must be USER or ADMIN"),
];

const adjustStockRules = [
  body("variantId").optional({ nullable: true }).isUUID(),
  body("delta")
    .isInt()
    .withMessage("delta must be a non-zero integer")
    .custom((v) => v !== 0),
  body("changeType")
    .isIn(["restock", "correction", "return", "damage", "other"])
    .withMessage("Invalid changeType"),
  body("note").optional().trim().isLength({ max: 500 }),
];

export { setBlockedRules, setRoleRules, adjustStockRules };