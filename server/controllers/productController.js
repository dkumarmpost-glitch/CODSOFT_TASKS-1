const Product = require("../models/Product");

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById };
