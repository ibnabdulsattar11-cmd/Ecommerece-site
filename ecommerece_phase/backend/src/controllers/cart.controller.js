import { Product, ProductVariant, CartItem } from "../models/index.js";
import {
  findOrCreateCart,
  getCartWithItems,
  computeTotals,
  mergeGuestCartIntoUserCart,
} from "../services/cart.service.js";
import { GUEST_COOKIE_NAME } from "../middlewares/guestCart.middleware.js";

function serializeCart(cart) {
  const { subtotal, itemCount } = computeTotals(cart);
  return { id: cart.id, items: cart.items, subtotal, itemCount };
}

// GET /api/cart
 const getCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req);
    const full = await getCartWithItems(cart.id);
    res.json({ success: true, data: serializeCart(full) });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items  { productId, variantId?, quantity }
 const addItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findByPk(productId);
    if (!product || product.status !== "ACTIVE") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let variant = null;
    let availableStock = product.stock;
    let unitPrice = parseFloat(product.salePrice || product.price);

    if (variantId) {
      variant = await ProductVariant.findOne({
        where: { id: variantId, productId },
      });
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, message: "Variant not found" });
      }
      availableStock = variant.stock;
      unitPrice += parseFloat(variant.priceModifier || 0);
    }

    if (availableStock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    const cart = await findOrCreateCart(req);

    const [item, wasCreated] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId, variantId: variantId || null },
      defaults: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        unitPriceSnapshot: unitPrice,
      },
    });

    if (!wasCreated) {
      const newQuantity = item.quantity + quantity;
      if (newQuantity > availableStock) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock available" });
      }
      item.quantity = newQuantity;
      item.unitPriceSnapshot = unitPrice; // refresh price snapshot to current price
      await item.save();
    }

    const full = await getCartWithItems(cart.id);
    res.status(201).json({ success: true, data: serializeCart(full) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/items/:itemId  { quantity }
 const updateItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await findOrCreateCart(req);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
      include: [
        { model: ProductVariant, as: "variant" },
        { model: Product, as: "product" },
      ],
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    const availableStock = item.variant
      ? item.variant.stock
      : item.product.stock;
    if (quantity > availableStock) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    item.quantity = quantity;
    await item.save();

    const full = await getCartWithItems(cart.id);
    res.json({ success: true, data: serializeCart(full) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:itemId
 const removeItem = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req);
    const deleted = await CartItem.destroy({
      where: { id: req.params.itemId, cartId: cart.id },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    const full = await getCartWithItems(cart.id);
    res.json({ success: true, data: serializeCart(full) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart  - clear entire cart (e.g. after order placed)
 const clearCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/merge
 * Called by the frontend right after a successful login/register, while
 * the guest_cart_token cookie is still present. Also exported as a plain
 * function so Phase 2's login controller can call it directly server-side
 * instead of requiring a separate round trip.
 */
 const mergeCart = async (req, res, next) => {
  try {
    const guestToken = req.cookies?.[GUEST_COOKIE_NAME];
    await mergeGuestCartIntoUserCart(req.user.id, guestToken);
    res.clearCookie(GUEST_COOKIE_NAME);

    const cart = await findOrCreateCart(req);
    const full = await getCartWithItems(cart.id);
    res.json({ success: true, data: serializeCart(full) });
  } catch (err) {
    next(err);
  }
};

export { getCart, addItem, updateItemQuantity, removeItem, clearCart, mergeCart };
export default { getCart, addItem, updateItemQuantity, removeItem, clearCart, mergeCart };