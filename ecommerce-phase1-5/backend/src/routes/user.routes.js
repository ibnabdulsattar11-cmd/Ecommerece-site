const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getOrderHistory,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/user.controller");
const {
  updateProfileValidator,
  addressValidator,
} = require("../validators/user.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(protect); // every route below requires authentication

router.get("/me", getProfile);
router.patch("/me", updateProfileValidator, validate, updateProfile);
router.post("/me/profile-image", upload.single("image"), uploadProfileImage);
router.get("/me/orders", getOrderHistory);

router.get("/me/addresses", listAddresses);
router.post("/me/addresses", addressValidator, validate, createAddress);
router.patch("/me/addresses/:id", addressValidator, validate, updateAddress);
router.delete("/me/addresses/:id", deleteAddress);
router.patch("/me/addresses/:id/default", setDefaultAddress);

module.exports = router;
