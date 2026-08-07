// Order API service
// Connects to the Node.js/Express backend for order management

const ORDERS_BASE_URL = "http://localhost:5000/api/orders";

export interface OrderProduct {
  productId: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Helper to make order API requests and parse errors
 */
async function orderRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${ORDERS_BASE_URL}${path}`, {
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
 * Create a new order
 * @param token - JWT token from localStorage
 * @param payload - Products and shipping address
 */
export async function createOrder(
  token: string,
  payload: CreateOrderPayload
): Promise<{ success: boolean; order: Order }> {
  return orderRequest<{ success: boolean; order: Order }>("/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get all orders for the logged-in user
 * @param token - JWT token from localStorage
 */
export async function getMyOrders(
  token: string
): Promise<{ success: boolean; count: number; orders: Order[] }> {
  return orderRequest<{ success: boolean; count: number; orders: Order[] }>(
    "/my",
    token
  );
}

/**
 * Get a single order by ID (must belong to the logged-in user)
 * @param token - JWT token from localStorage
 * @param id - Order ID
 */
export async function getOrderById(
  token: string,
  id: string
): Promise<{ success: boolean; order: Order }> {
  return orderRequest<{ success: boolean; order: Order }>(
    `/${id}`,
    token
  );
}
