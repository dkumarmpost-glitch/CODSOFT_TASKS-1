const Stripe = require("stripe");
const Order = require("../models/Order");

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create a Stripe Checkout Session and an Order
 * @route   POST /api/payment/create-checkout-session
 * @access  Private (requires JWT)
 */
const createCheckoutSession = async (req, res, next) => {
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

    // Create the order in MongoDB with pending payment status
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

    // Build Stripe line items from order products
    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      customer_email: shippingAddress.email.trim().toLowerCase(),
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.status(201).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payment/webhook
 * @access  Public (Stripe sends events)
 */
const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
    return;
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        // Update the order to mark payment as paid
        await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "paid",
            orderStatus: "processing",
          },
          { new: true }
        );
        console.log(`Order ${orderId} marked as paid`);
      } catch (error) {
        console.error(`Failed to update order ${orderId}: ${error.message}`);
      }
    }
  }

  res.json({ received: true });
};

/**
 * @desc    Get payment status for a Checkout Session
 * @route   GET /api/payment/success?session_id=xxx
 * @access  Private (requires JWT)
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      res.status(400);
      throw new Error("Session ID is required");
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Get the associated order
    const orderId = session.metadata?.orderId;
    const order = await Order.findById(orderId).populate("user", "name email");

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
      paymentStatus: session.payment_status,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSession, handleStripeWebhook, getPaymentStatus };
