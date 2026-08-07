const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

/**
 * Product Routes
 * - GET /api/products      - Get all products
 * - GET /api/products/:id  - Get single product by ID
 */
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
