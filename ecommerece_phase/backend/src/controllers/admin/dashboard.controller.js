import ApiResponse from "../../utils/ApiResponse.js";

import dashboardService from "../../services/dashboard.service.js";

// GET /api/admin/dashboard  — everything the dashboard landing page needs in one call
const getDashboard = async (req, res) => {
  const [
    summary,
    revenueTimeseries,
    topProducts,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    dashboardService.getSummary(),
    dashboardService.getRevenueTimeseries(parseInt(req.query.days) || 30),
    dashboardService.getTopProducts(10),
    dashboardService.getRecentOrders(10),
    dashboardService.getLowStockProducts(20),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      summary,
      revenueTimeseries,
      topProducts,
      recentOrders,
      lowStockProducts,
    }),
  );
};

export { getDashboard };
export default { getDashboard };
