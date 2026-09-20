import { Op } from "sequelize";

import {
  sequelize,
  Product,
  ProductVariant,
  InventoryLog,
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
const listInventory = async ({
  page = 1,
  limit = 20,
  search,
  sort = "stock_asc",
}) => {
  const where = {};
  if (search) {
    where[Op.or] = [
      { nameEn: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const orderMap = {
    stock_asc: [["stock", "ASC"]],
    stock_desc: [["stock", "DESC"]],
    name: [["nameEn", "ASC"]],
  };

  const { rows, count } = await Product.findAndCountAll({
    where,
    attributes: ["id", "nameEn", "slug", "sku", "stock", "status"],
    order: orderMap[sort] || orderMap.stock_asc,
    limit,
    offset: (page - 1) * limit,
  });

  return { rows, count };
};

/**
 * Adjusts stock for a product or one of its variants by a signed delta
 * (positive = adding stock, negative = removing it), and records the
 * change in InventoryLog for a full audit trail. Runs in a transaction so
 * the stock update and its log entry are always consistent.
 */
const adjustStock = async ({
  productId,
  variantId,
  delta,
  changeType,
  note,
  adminId,
}) => {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new ApiError(400, "delta must be a non-zero integer");
  }

  const target = variantId
    ? await ProductVariant.findByPk(variantId)
    : await Product.findByPk(productId);
  if (!target)
    throw new ApiError(
      404,
      variantId ? "Product variant not found" : "Product not found",
    );
  if (variantId && target.productId !== productId) {
    throw new ApiError(
      400,
      "This variant does not belong to the given product",
    );
  }

  const previousStock = target.stock;
  const newStock = previousStock + delta;
  if (newStock < 0)
    throw new ApiError(
      400,
      `Cannot reduce stock below zero (current: ${previousStock})`,
    );

  const log = await sequelize.transaction(async (t) => {
    target.stock = newStock;
    await target.save({ transaction: t });

    return InventoryLog.create(
      {
        productId,
        variantId: variantId || null,
        changeType,
        quantityChange: delta,
        previousStock,
        newStock,
        note: note || null,
        adjustedByAdminId: adminId,
      },
      { transaction: t },
    );
  });

  return { target, log };
};

const getInventoryHistory = async (
  productId,
  { page = 1, limit = 20 } = {},
) => {
  const { rows, count } = await InventoryLog.findAndCountAll({
    where: { productId },
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
  return { rows, count };
};

export { listInventory, adjustStock, getInventoryHistory };
export default { listInventory, adjustStock, getInventoryHistory };