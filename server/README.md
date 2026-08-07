# CollegeShop Backend API

Production-ready REST API backend for the CollegeShop e-commerce application, built with Node.js, Express.js, MongoDB Atlas, and JWT authentication.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-Origin Resource Sharing

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Register/Login logic
│   ├── productController.js # Product CRUD logic
│   └── orderController.js # Order creation/fetching
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── errorMiddleware.js # Error handling
├── models/
│   ├── User.js            # User schema
│   ├── Product.js         # Product schema
│   └── Order.js           # Order schema
├── routes/
│   ├── authRoutes.js      # /api/auth endpoints
│   ├── productRoutes.js   # /api/products endpoints
│   └── orderRoutes.js     # /api/orders endpoints
├── utils/
│   └── generateToken.js   # JWT token generation
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── server.js              # Entry point
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```
bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory (or edit the existing one):

```
env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/collegeshop?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Replace:
- `<username>` and `<password>` with your MongoDB Atlas credentials
- `<cluster>` with your cluster name
- `JWT_SECRET` with a strong random string

### 3. Run the Server

**Development mode (with auto-reload):**
```
bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured `PORT`).

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/profile` | Get logged-in user's profile | Private (JWT) |

**Register Request Body:**
```
json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Request Body:**
```
json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```
json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product by ID | Public |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create a new order | Private (JWT) |
| GET | `/api/orders` | Get orders for logged-in user | Private (JWT) |

**Create Order Request Body (requires Authorization header):**
```json
{
  "products": [
    { "product": "60d21b4667d0d8992e610c85", "qty": 2 },
    { "product": "60d21b4667d0d8992e610c86", "qty": 1 }
  ]
}
```

## Connecting to Frontend

The API is designed to be a drop-in replacement for the dummy data source. To connect your React frontend:

1. Run the backend server on `http://localhost:5000`
2. In `src/services/api.ts`, change:
   
```
ts
   const BASE_URL = "http://localhost:5000/api";
   
```
3. For authenticated routes, send the JWT token in the `Authorization` header:
   
```
   Authorization: Bearer <your-jwt-token>
   
```

## Error Handling

All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common error scenarios handled:
- Invalid JWT token
- Expired JWT token
- Duplicate email registration
- Invalid product ID
- Empty order cart
- Mongoose validation errors
