import path from "path";

import { User, Address, Order } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import { processProfileImage } from "../services/upload.service.js";

import { sanitizeUser } from "./auth.controller.js";
/* ---------------------------- PROFILE ---------------------------- */
const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Address }],
  });
  res.status(200).json(new ApiResponse(200, sanitizeUser(user)));
};

const updateProfile = async (req, res) => {
  const { name, language } = req.body;
  const user = await User.findByPk(req.user.id);

  if (name !== undefined) user.name = name;
  if (language !== undefined) user.language = language;

  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, sanitizeUser(user), "Profile updated"));
};

const uploadProfileImage = async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const processedPath = await processProfileImage(req.file.path);
  const relativePath = `/uploads/${path.basename(processedPath)}`;

  const user = await User.findByPk(req.user.id);
  user.profileImage = relativePath;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { profileImage: relativePath },
        "Profile image updated",
      ),
    );
};

const getOrderHistory = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  res.status(200).json(new ApiResponse(200, orders));
};

/* ---------------------------- ADDRESSES ---------------------------- */
const listAddresses = async (req, res) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.id },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });
  res.status(200).json(new ApiResponse(200, addresses));
};

const createAddress = async (req, res) => {
  const payload = { ...req.body, userId: req.user.id };

  // If this is the user's first address, or explicitly requested, make it default.
  const existingCount = await Address.count({ where: { userId: req.user.id } });
  if (existingCount === 0) payload.isDefault = true;

  if (payload.isDefault) {
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.id } },
    );
  }

  const address = await Address.create(payload);
  res.status(201).json(new ApiResponse(201, address, "Address added"));
};

const updateAddress = async (req, res) => {
  const address = await Address.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) throw new ApiError(404, "Address not found");

  if (req.body.isDefault) {
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.id } },
    );
  }

  await address.update(req.body);
  res.status(200).json(new ApiResponse(200, address, "Address updated"));
};

const deleteAddress = async (req, res) => {
  const address = await Address.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) throw new ApiError(404, "Address not found");

  const wasDefault = address.isDefault;
  await address.destroy();

  // Promote another address to default if the deleted one was the default.
  if (wasDefault) {
    const next = await Address.findOne({ where: { userId: req.user.id } });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  res.status(200).json(new ApiResponse(200, null, "Address deleted"));
};

const setDefaultAddress = async (req, res) => {
  const address = await Address.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) throw new ApiError(404, "Address not found");

  await Address.update(
    { isDefault: false },
    { where: { userId: req.user.id } },
  );
  address.isDefault = true;
  await address.save();

  res
    .status(200)
    .json(new ApiResponse(200, address, "Default address updated"));
};

export {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getOrderHistory,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
