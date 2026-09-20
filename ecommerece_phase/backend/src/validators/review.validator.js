import { body } from "express-validator";

const createReviewRules = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("images").optional().isArray({ max: 6 }).withMessage("Up to 6 images"),
  body("images.*").optional().isString(),
];

const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body("images").optional().isArray({ max: 6 }).withMessage("Up to 6 images"),
  body("images.*").optional().isString(),
];

const voteRules = [
  body("helpful").isBoolean().withMessage("helpful must be true or false"),
];

const moderationRules = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("status must be approved or rejected"),
];

export { createReviewRules, updateReviewRules, voteRules, moderationRules };
