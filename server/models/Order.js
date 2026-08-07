const mongoose = require("mongoose");

/**
 * Order Schema
 * - user: reference to the User who placed the order
 * - products: array of product snapshots (immutable record of what was purchased)
 * - shippingAddress: delivery address details
 * - totalPrice: computed total of the order
 * - orderStatus: fulfillment state (pending, processing, shipped, delivered, cancelled)
 * - paymentStatus: payment state (paid, pending, failed)
 * - createdAt: auto-managed by timestamps
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    products: [
      {
        productId: {
          type: String,
          required: [true, "Product ID is required"],
        },
        title: {
          type: String,
          required: [true, "Product title is required"],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Product price is required"],
          min: [0, "Price cannot be negative"],
        },
        image: {
          type: String,
          default: "",
        },
        qty: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
      },
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please add a valid email",
        ],
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pinCode: {
        type: String,
        required: [true, "PIN code is required"],
        trim: true,
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
