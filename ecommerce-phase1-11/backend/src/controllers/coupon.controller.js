import { Coupon, CartItem } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import { findOrCreateCart } from "../services/cart.service.js";

import checkoutService from "../services/checkout.service.js";

import couponService from "../services/coupon.service.js";

// POST /api/coupons/validate  { code }
// Validates against the caller's actual live cart — never a client-supplied
// subtotal — so the preview always matches what checkout will compute.
const validate = async (req, res) => {
  const { code } = req.body;

  const cart = await findOrCreateCart(req);
  const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
  const items = await checkoutService.priceCartItems(cartItems);

  const result = await couponService.validateCoupon(code, {
    userId: req.user?.id,
    items,
  });

  res.status(200).json(
    new ApiResponse(200, {
      code: result.coupon.code,
      type: result.coupon.type,
      value: parseFloat(result.coupon.value),
      discount: result.discount,
    }),
  );
};

/* ---------------------------- Admin ---------------------------- */

const listCoupons = async (req, res) => {
  const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });
  res.status(200).json(new ApiResponse(200, coupons));
};

const createCoupon = async (req, res) => {
  const payload = { ...req.body, code: req.body.code.trim().toUpperCase() };
  const coupon = await Coupon.create(payload);
  res.status(201).json(new ApiResponse(201, coupon, "Coupon created"));
};

const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  if (req.body.code) req.body.code = req.body.code.trim().toUpperCase();
  await coupon.update(req.body);
  res.status(200).json(new ApiResponse(200, coupon, "Coupon updated"));
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  await coupon.destroy();
  res.status(200).json(new ApiResponse(200, null, "Coupon deleted"));
};

export default {
  validate,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
