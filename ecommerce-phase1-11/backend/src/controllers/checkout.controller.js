import stripe from "../config/stripe.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { CartItem } from "../models/index.js";
import { findOrCreateCart } from "../services/cart.service.js";
import checkoutService from "../services/checkout.service.js";

const loadCartItems = async (req) => {
  const cart = await findOrCreateCart(req);
  const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
  return { cart, cartItems };
};

// POST /api/checkout/create-payment-intent  { addressId?, shippingAddress?, couponCode? }
const createPaymentIntent = async (req, res) => {
  const { addressId, shippingAddress, couponCode } = req.body;
  const { cart, cartItems } = await loadCartItems(req);

  const order = await checkoutService.buildOrder({
    user: req.user,
    cartId: cart.id,
    cartItems,
    addressId,
    shippingAddress,
    couponCode,
    paymentMethod: "stripe",
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: process.env.CURRENCY || "usd",
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      receipt_email: req.user?.email || req.body.shippingAddress?.email,
      automatic_payment_methods: { enabled: true },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json(
      new ApiResponse(201, {
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
      }),
    );
  } catch (err) {
    // Stripe failed after stock/coupon were already reserved — undo both
    // so nothing is left dangling on a customer who never got a working
    // checkout screen.
    await checkoutService.cancelOrderAndRestoreStock(order, {
      reason: "Could not start payment",
    });
    throw new ApiError(502, "Could not start the payment — please try again");
  }
};

// POST /api/checkout/place-order  { addressId?, shippingAddress?, couponCode? }  (Cash on Delivery)
const placeOrder = async (req, res) => {
  const { addressId, shippingAddress, couponCode } = req.body;
  const { cart, cartItems } = await loadCartItems(req);

  const order = await checkoutService.buildOrder({
    user: req.user,
    cartId: cart.id,
    cartItems,
    addressId,
    shippingAddress,
    couponCode,
    paymentMethod: "cod",
  });

  order.status = "confirmed";
  await order.save();

  res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed — pay on delivery"));
};

export default { createPaymentIntent, placeOrder };
