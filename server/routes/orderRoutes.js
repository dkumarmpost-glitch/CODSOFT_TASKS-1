const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Order Routes (all protected - require JWT)
 * - POST /api/orders      - Create a new order
 * - GET  /api/orders/my   - Get all orders for the logged-in user
 * - GET  /api/orders/:id  - Get a single order by ID (own orders only)
 */
router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
