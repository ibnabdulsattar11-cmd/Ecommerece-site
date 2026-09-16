const ApiResponse = require("../../utils/ApiResponse");
const dashboardService = require("../../services/dashboard.service");
const inventoryService = require("../../services/inventory.service");

// GET /api/admin/inventory?search=&sort=&page=&limit=
const listInventory = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const { rows, count } = await inventoryService.listInventory({
    page,
    limit,
    search: req.query.search,
    sort: req.query.sort,
  });

  const response = new ApiResponse(200, rows);
  response.pagination = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
  res.status(200).json(response);
};

// GET /api/admin/inventory/low-stock
const listLowStock = async (req, res) => {
  const products = await dashboardService.getLowStockProducts(parseInt(req.query.limit) || 50);
  res.status(200).json(new ApiResponse(200, products));
};

// PATCH /api/admin/inventory/:productId/stock
// { variantId?, delta, changeType: "restock"|"correction"|"return"|"damage"|"other", note? }
const adjustStock = async (req, res) => {
  const { variantId, delta, changeType, note } = req.body;

  const { target, log } = await inventoryService.adjustStock({
    productId: req.params.productId,
    variantId,
    delta,
    changeType,
    note,
    adminId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { stock: target.stock, log }, "Stock updated"));
};

// GET /api/admin/inventory/:productId/history
const getHistory = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const { rows, count } = await inventoryService.getInventoryHistory(req.params.productId, { page, limit });

  const response = new ApiResponse(200, rows);
  response.pagination = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
  res.status(200).json(response);
};

module.exports = { listInventory, listLowStock, adjustStock, getHistory };
