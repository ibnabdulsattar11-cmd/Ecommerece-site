import express from "express";

import { getProfile, updateProfile, uploadProfileImage, getOrderHistory, listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "../controllers/user.controller.js";

import { updateProfileValidator, addressValidator } from "../validators/user.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { protect } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

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

export default router;
