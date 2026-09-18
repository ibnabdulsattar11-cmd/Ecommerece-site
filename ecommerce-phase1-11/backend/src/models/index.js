import { sequelize } from "../config/db.js";

import UserFactory from "./user.model.js";
import AddressFactory from "./address.model.js";
import CategoryFactory from "./category.model.js";
import ProductFactory from "./product.model.js";
import ProductVariantFactory from "./productVariant.model.js";
import ProductImageFactory from "./productImage.model.js";
import CartFactory from "./cart.model.js";
import CartItemFactory from "./cartItem.model.js";
import OrderFactory from "./order.model.js";
import OrderItemFactory from "./orderItem.model.js";
import CouponFactory from "./coupon.model.js";
import CouponUsageFactory from "./couponUsage.model.js";
import ReviewFactory from "./review.model.js";
import WishlistFactory from "./wishlist.model.js";
import ReturnFactory from "./return.model.js";
import NotificationFactory from "./notification.model.js";
import DeliveryZoneFactory from "./deliveryZone.model.js";
import OrderStatusHistoryFactory from "./orderStatusHistory.model.js";
import InventoryLogFactory from "./inventoryLog.model.js";

const User = UserFactory(sequelize);
const Address = AddressFactory(sequelize);
const Category = CategoryFactory(sequelize);
const Product = ProductFactory(sequelize);
const ProductVariant = ProductVariantFactory(sequelize);
const ProductImage = ProductImageFactory(sequelize);
const Cart = CartFactory(sequelize);
const CartItem = CartItemFactory(sequelize);
const Order = OrderFactory(sequelize);
const OrderItem = OrderItemFactory(sequelize);
const Coupon = CouponFactory(sequelize);
const CouponUsage = CouponUsageFactory(sequelize);
const Review = ReviewFactory(sequelize);
const Wishlist = WishlistFactory(sequelize);
const Return = ReturnFactory(sequelize);
const Notification = NotificationFactory(sequelize);
const DeliveryZone = DeliveryZoneFactory(sequelize);
const OrderStatusHistory = OrderStatusHistoryFactory(sequelize);
const InventoryLog = InventoryLogFactory(sequelize);

/* ---------------------- USER ---------------------- */
User.hasMany(Address, { foreignKey: "userId", onDelete: "CASCADE" });
Address.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Review, { foreignKey: "userId", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Wishlist, { foreignKey: "userId", onDelete: "CASCADE" });
Wishlist.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

/* ---------------------- CATEGORY (self-referencing) ---------------------- */
Category.hasMany(Category, { as: "subcategories", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

/* ---------------------- PRODUCT ---------------------- */
Product.hasMany(ProductImage, { foreignKey: "productId", onDelete: "CASCADE" });
ProductImage.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(ProductVariant, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Review, { foreignKey: "productId", onDelete: "CASCADE" });
Review.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Wishlist, { foreignKey: "productId", onDelete: "CASCADE" });
Wishlist.belongsTo(Product, { foreignKey: "productId" });

// anywhere convenient (e.g. near the PRODUCT block):
Product.hasMany(InventoryLog, { foreignKey: "productId", onDelete: "CASCADE" });
InventoryLog.belongsTo(Product, { foreignKey: "productId" });

ProductVariant.hasMany(InventoryLog, { foreignKey: "variantId" });
InventoryLog.belongsTo(ProductVariant, { foreignKey: "variantId" });

User.hasMany(InventoryLog, { foreignKey: "adjustedByAdminId" });
InventoryLog.belongsTo(User, {
  foreignKey: "adjustedByAdminId",
  as: "adjustedByAdmin",
});

/* ---------------------- CART ---------------------- */
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

ProductVariant.hasMany(CartItem, { foreignKey: "variantId" });
CartItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

/* ---------------------- ORDER ---------------------- */
// near the top, with the other requires:

// anywhere in the "ORDER" association block:
Order.hasMany(OrderStatusHistory, {
  foreignKey: "orderId",
  as: "StatusHistory",
  onDelete: "CASCADE",
});
OrderStatusHistory.belongsTo(Order, { foreignKey: "orderId" });

User.hasMany(OrderStatusHistory, { foreignKey: "changedByAdminId" });
OrderStatusHistory.belongsTo(User, {
  foreignKey: "changedByAdminId",
  as: "changedByAdmin",
});

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

ProductVariant.hasMany(OrderItem, { foreignKey: "variantId" });
OrderItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

Address.hasMany(Order, { foreignKey: "addressId" });
Order.belongsTo(Address, { foreignKey: "addressId" });

Order.hasOne(Return, { foreignKey: "orderId", onDelete: "CASCADE" });
Return.belongsTo(Order, { foreignKey: "orderId" });

/* ---------------------- COUPON ---------------------- */
Coupon.hasMany(CouponUsage, { foreignKey: "couponId", onDelete: "CASCADE" });
CouponUsage.belongsTo(Coupon, { foreignKey: "couponId" });

User.hasMany(CouponUsage, { foreignKey: "userId" });
CouponUsage.belongsTo(User, { foreignKey: "userId" });

Order.hasOne(CouponUsage, { foreignKey: "orderId" });
CouponUsage.belongsTo(Order, { foreignKey: "orderId" });

// Optional scoping: a coupon can be restricted to specific products/categories
Coupon.belongsToMany(Product, {
  through: "coupon_products",
  foreignKey: "couponId",
});
Product.belongsToMany(Coupon, {
  through: "coupon_products",
  foreignKey: "productId",
});

Coupon.belongsToMany(Category, {
  through: "coupon_categories",
  foreignKey: "couponId",
});
Category.belongsToMany(Coupon, {
  through: "coupon_categories",
  foreignKey: "categoryId",
});

// User-specific coupon assignment (only relevant when isUserSpecific = true)
Coupon.belongsToMany(User, { through: "coupon_users", foreignKey: "couponId" });
User.belongsToMany(Coupon, { through: "coupon_users", foreignKey: "userId" });

export default {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Coupon,
  CouponUsage,
  Review,
  Wishlist,
  Return,
  Notification,
  DeliveryZone,
  OrderStatusHistory,
  InventoryLog,
};
