const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://10.88.51.138:8080"
  ],
  credentials: true,
}));

// Stripe webhook route - MUST be before express.json() so it receives raw body
const { handleStripeWebhook } = require("./controllers/paymentController");
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CollegeShop API is running" });
});

// Mount routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Payment routes (protected)
app.use("/api/payment", require("./routes/paymentRoutes"));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
