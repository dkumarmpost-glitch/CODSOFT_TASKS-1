// Auth API service
// Connects to the Node.js/Express JWT auth backend

const AUTH_BASE_URL = "http://localhost:5000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Helper to make auth API requests and parse errors
 */
async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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
 * Register a new user
 * @param name - User's display name
 * @param email - User's email
 * @param password - User's password (min 6 characters)
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Login an existing user
 * @param email - User's email
 * @param password - User's password
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Fetch the current user's profile (protected route)
 * @param token - JWT token from localStorage
 */
export async function getProfile(token: string): Promise<{ success: boolean; user: AuthUser }> {
  return authRequest<{ success: boolean; user: AuthUser }>("/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
