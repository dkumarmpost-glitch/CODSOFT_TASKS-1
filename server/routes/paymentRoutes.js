const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  getPaymentStatus,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Payment Routes (all protected - require JWT)
 * - POST /api/payment/create-checkout-session - Create a Stripe Checkout Session
 * - GET  /api/payment/success                 - Get payment status for a session
 *
 * Note: The Stripe webhook route is mounted directly in server.js
 * before express.json() so it receives the raw request body.
 */
router.use(protect);

router.post("/create-checkout-session", createCheckoutSession);
router.get("/success", getPaymentStatus);

module.exports = router;
