const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', orderController.getMyOrders);
router.get('/by-number/:orderNumber', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);

module.exports = router;
