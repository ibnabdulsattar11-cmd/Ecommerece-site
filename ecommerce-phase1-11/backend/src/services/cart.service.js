import { Cart, CartItem, Product, ProductVariant, ProductImage, sequelize } from '../models';

/**
 * Finds the active cart for the current request (logged-in user or guest),
 * creating one if it doesn't exist yet.
 */
async function findOrCreateCart(req) {
  const where = req.user ? { userId: req.user.id } : { guestToken: req.guestToken };
  let [cart] = await Cart.findOrCreate({ where, defaults: where });
  return cart;
}

const cartIncludes = [
  {
    model: CartItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'nameEn', 'nameAr', 'slug', 'price', 'salePrice', 'stock'],
        include: [{ model: ProductImage, as: 'images', limit: 1 }],
      },
      { model: ProductVariant, as: 'variant' },
    ],
  },
];

async function getCartWithItems(cartId) {
  return Cart.findByPk(cartId, { include: cartIncludes });
}

function computeTotals(cart) {
  let subtotal = 0;
  let itemCount = 0;

  cart.items.forEach((item) => {
    subtotal += parseFloat(item.unitPriceSnapshot) * item.quantity;
    itemCount += item.quantity;
  });

  return { subtotal: parseFloat(subtotal.toFixed(2)), itemCount };
}

/**
 * Called right after a successful login (from Phase 2's auth controller):
 *   const { mergeGuestCartIntoUserCart } = require('../services/cart.service');
 *   await mergeGuestCartIntoUserCart(user.id, req.cookies.guest_cart_token);
 *   res.clearCookie('guest_cart_token');
 *
 * Guest cart items are folded into the user's existing cart (quantities
 * summed for matching product+variant); the now-empty guest cart is deleted.
 */
async function mergeGuestCartIntoUserCart(userId, guestToken) {
  if (!guestToken) return;

  const guestCart = await Cart.findOne({ where: { guestToken }, include: cartIncludes });
  if (!guestCart || !guestCart.items.length) return;

  const t = await sequelize.transaction();
  try {
    const [userCart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
      transaction: t,
    });

    for (const guestItem of guestCart.items) {
      const [row, wasCreated] = await CartItem.findOrCreate({
        where: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
        },
        defaults: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
          unitPriceSnapshot: guestItem.unitPriceSnapshot,
        },
        transaction: t,
      });

      // Row already existed in the user's cart -> sum quantities instead
      // of overwriting, so nothing the user already added gets lost.
      if (!wasCreated) {
        row.quantity += guestItem.quantity;
        await row.save({ transaction: t });
      }
    }

    await guestCart.destroy({ transaction: t }); // cascades to guest CartItems
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export default {
  findOrCreateCart,
  getCartWithItems,
  computeTotals,
  mergeGuestCartIntoUserCart,
  cartIncludes,
};
