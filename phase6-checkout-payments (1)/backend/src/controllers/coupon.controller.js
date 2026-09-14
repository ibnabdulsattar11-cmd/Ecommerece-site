const { Coupon } = require('../models');
const { validateCoupon } = require('../services/order.service');

// POST /api/coupons/validate  { code, subtotal }  (public, but personalized if logged in)
exports.validate = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!req.user) {
      // per-user usage limits can't be checked for a guest — ask them to
      // log in before applying a coupon (matches typical checkout flows
      // where cart is guest but coupon application requires an account)
      return res.status(401).json({ success: false, message: 'Please log in to apply a coupon' });
    }

    const { discount, coupon } = await validateCoupon(code, req.user.id, parseFloat(subtotal || 0));

    res.json({
      success: true,
      data: {
        valid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ---------- Admin ----------

// GET /api/coupons (admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons (admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
    }
    next(err);
  }
};

// PUT /api/coupons/:id (admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    await coupon.update(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/coupons/:id (admin) - soft delete via isActive
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    coupon.isActive = false;
    await coupon.save();
    res.json({ success: true, message: 'Coupon deactivated' });
  } catch (err) {
    next(err);
  }
};
