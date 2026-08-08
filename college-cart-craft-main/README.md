
# 🛒 CollegeShop - Full Stack E-Commerce Platform

A modern full-stack e-commerce web application built as part of the **CodeSoft Web Development Internship**. The application provides a complete online shopping experience with secure user authentication, shopping cart management, checkout, and online payment integration.

---

## 🚀 Features

- 🔐 JWT Authentication (Register & Login)
- 👤 User Profile Management
- 🛍️ Product Listing & Categories
- 🔍 Product Search
- 🛒 Shopping Cart
- 💳 Secure Stripe Payment Gateway Integration
- 📦 Checkout Process
- 📜 Order Management
- 📱 Responsive UI
- ⚡ Fast React + Vite Frontend
- 🌐 RESTful API Backend

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Stripe API

---

## 📂 Project Structure

```
.
├── src/                  # Frontend source code
├── public/               # Static assets
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CODSOFT_TASKS-1.git
```

### 2. Navigate to the Project

```bash
cd CODSOFT_TASKS-1
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080

STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

---

## ▶️ Running the Project

### Start Backend

```bash
cd server
node server.js
```

### Start Frontend

```bash
npm run dev
```

Frontend:

```
http://localhost:8080
```

Backend:

```
http://localhost:5000
```

---

## 💳 Test Payment

The application uses **Stripe Test Mode**.

Use Stripe's official test card:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
ZIP: Any 5 digits
```

---

## 📸 Screenshots

Add screenshots here after deployment.

- Home Page
- Product Page
- Cart
- Login
- Checkout
- Stripe Payment

---

## 🚀 Deployment

Frontend can be deployed on:

- Vercel
- Netlify

Backend can be deployed on:

- Render
- Railway

Database:

- MongoDB Atlas

---

## 👨‍💻 Author

**Dhruv Kumar Verma**

GitHub: https://github.com/dkumarmpost-glitch

---

## 📄 License

This project is developed for educational purposes as part of the **CodeSoft Internship Program**.