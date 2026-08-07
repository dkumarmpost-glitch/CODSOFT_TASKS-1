const mongoose = require("mongoose");

/**
 * Product Schema
 * - title: product name
 * - description: detailed product description
 * - price: selling price
 * - category: product category
 * - thumbnail: image URL
 * - rating: average rating (0-5)
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a product title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a product price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please add a product category"],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Please add a product image URL"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
