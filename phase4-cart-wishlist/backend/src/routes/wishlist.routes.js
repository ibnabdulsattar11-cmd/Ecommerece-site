const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlist.controller');
const { wishlistAddRules, moveToCartRules } = require('../validators/cart.validator');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// Wishlist is tied to a user account, so every route requires login
router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistAddRules, validate, wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.post('/:productId/move-to-cart', moveToCartRules, validate, wishlistController.moveToCart);

module.exports = router;
