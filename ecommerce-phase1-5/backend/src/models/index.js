const { sequelize } = require("../config/db");

const User = require("./user.model")(sequelize);
const Address = require("./address.model")(sequelize);
const Category = require("./category.model")(sequelize);
const Product = require("./product.model")(sequelize);
const ProductVariant = require("./productVariant.model")(sequelize);
const ProductImage = require("./productImage.model")(sequelize);
const Cart = require("./cart.model")(sequelize);
const CartItem = require("./cartItem.model")(sequelize);
const Order = require("./order.model")(sequelize);
const OrderItem = require("./orderItem.model")(sequelize);
const Coupon = require("./coupon.model")(sequelize);
const CouponUsage = require("./couponUsage.model")(sequelize);
const Review = require("./review.model")(sequelize);
const Wishlist = require("./wishlist.model")(sequelize);
const Return = require("./return.model")(sequelize);
const Notification = require("./notification.model")(sequelize);
const DeliveryZone = require("./deliveryZone.model")(sequelize);

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

/* ---------------------- CART ---------------------- */
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

ProductVariant.hasMany(CartItem, { foreignKey: "variantId" });
CartItem.belongsTo(ProductVariant, { foreignKey: "variantId" });

/* ---------------------- ORDER ---------------------- */
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

module.exports = {
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
};
