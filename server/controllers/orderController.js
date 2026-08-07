const Order = require("../models/Order");

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (requires JWT)
 */
const createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress } = req.body;

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400);
      throw new Error("Please provide at least one product");
    }

    // Validate shipping address
    if (!shippingAddress) {
      res.status(400);
      throw new Error("Shipping address is required");
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "pinCode",
    ];
    const missingFields = requiredAddressFields.filter(
      (field) => !shippingAddress[field] || !shippingAddress[field].trim()
    );

    if (missingFields.length > 0) {
      res.status(400);
      throw new Error(
        `Missing shipping address fields: ${missingFields.join(", ")}`
      );
    }

    // Validate each product has required snapshot fields
    for (const item of products) {
      if (!item.productId || !item.title || !item.price || !item.qty) {
        res.status(400);
        throw new Error(
          "Each product must include productId, title, price, and qty"
        );
      }
      if (item.qty < 1) {
        res.status(400);
        throw new Error("Quantity must be at least 1");
      }
      if (item.price < 0) {
        res.status(400);
        throw new Error("Price cannot be negative");
      }
    }

    // Build order items (product snapshots - immutable record of purchase)
    const orderItems = products.map((item) => ({
      productId: String(item.productId),
      title: item.title,
      price: item.price,
      image: item.image || "",
      qty: item.qty,
    }));

    // Compute total price server-side (never trust client-computed totals)
    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      products: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pinCode: shippingAddress.pinCode.trim(),
      },
      totalPrice,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders for the logged-in user
 * @route   GET /api/orders/my
 * @access  Private (requires JWT)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single order by ID (only if it belongs to the logged-in user)
 * @route   GET /api/orders/:id
 * @access  Private (requires JWT)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Ensure the order belongs to the logged-in user
    if (order.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
