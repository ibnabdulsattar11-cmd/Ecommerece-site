import {
  Wishlist,
  Product,
  ProductImage,
  ProductVariant,
  CartItem,
} from "../models/index.js";
import {
  findOrCreateCart,
  getCartWithItems,
  computeTotals,
} from "../services/cart.service.js";

// GET /api/wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: ProductImage, as: "images", limit: 1 }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist  { productId }
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const [item, wasCreated] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
    });

    res.status(wasCreated ? 201 : 200).json({
      success: true,
      data: item,
      message: wasCreated ? "Added to wishlist" : "Already in wishlist",
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res, next) => {
  try {
    const deleted = await Wishlist.destroy({
      where: { userId: req.user.id, productId: req.params.productId },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not in wishlist" });
    }

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/:productId/move-to-cart  { variantId? , quantity? }
export const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { variantId, quantity = 1 } = req.body;

    const wishlistItem = await Wishlist.findOne({
      where: { userId: req.user.id, productId },
    });
    if (!wishlistItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not in wishlist" });
    }

    const product = await Product.findByPk(productId);
    if (!product || product.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Product no longer available" });
    }

    let unitPrice = parseFloat(product.salePrice || product.price);
    let availableStock = product.stock;

    if (variantId) {
      const variant = await ProductVariant.findOne({
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

    const [cartItem, wasCreated] = await CartItem.findOrCreate({
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
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    await wishlistItem.destroy();

    const fullCart = await getCartWithItems(cart.id);
    const { subtotal, itemCount } = computeTotals(fullCart);

    res.json({
      success: true,
      message: "Moved to cart",
      data: { id: fullCart.id, items: fullCart.items, subtotal, itemCount },
    });
  } catch (err) {
    next(err);
  }
};

