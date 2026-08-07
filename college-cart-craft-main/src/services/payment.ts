// Payment API service
// Connects to the Node.js/Express backend for Stripe Checkout integration

const PAYMENT_BASE_URL = "http://localhost:5000/api/payment";

import { OrderProduct, ShippingAddress, Order } from "@/services/orders";

export interface CreateCheckoutSessionPayload {
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url: string;
  sessionId: string;
  orderId: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  order: Order;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Helper to make payment API requests and parse errors
 */
async function paymentRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${PAYMENT_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const err = data as ErrorResponse;
    throw new Error(err.message || "Something went wrong. Please try again.");
  }

  return data as T;
}

/**
 * Create a Stripe Checkout Session
 * @param token - JWT token from localStorage
 * @param payload - Products and shipping address
 */
export async function createCheckoutSession(
  token: string,
  payload: CreateCheckoutSessionPayload
): Promise<CheckoutSessionResponse> {
  return paymentRequest<CheckoutSessionResponse>(
    "/create-checkout-session",
    token,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Get payment status for a Stripe Checkout Session
 * @param token - JWT token from localStorage
 * @param sessionId - Stripe Checkout Session ID
 */
export async function getPaymentStatus(
  token: string,
  sessionId: string
): Promise<PaymentStatusResponse> {
  return paymentRequest<PaymentStatusResponse>(
    `/success?session_id=${encodeURIComponent(sessionId)}`,
    token
  );
}
