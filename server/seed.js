const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

// Sample products matching the frontend's existing product images
const products = [
  {
    title: "Classic Denim Jacket",
    description:
      "Timeless denim jacket made from premium quality fabric. Perfect for everyday college wear with a classic fit.",
    price: 49.99,
    category: "clothing",
    thumbnail: "/images/denim.jpg",
    rating: 4.5,
  },
  {
    title: "Wireless Headphones",
    description:
      "Immersive sound with active noise cancellation. 30-hour battery life and comfortable over-ear design.",
    price: 89.99,
    category: "electronics",
    thumbnail: "/images/headphones.jpg",
    rating: 4.8,
  },
  {
    title: "Running Sneakers",
    description:
      "Lightweight and comfortable running shoes with responsive cushioning. Ideal for daily workouts.",
    price: 79.99,
    category: "footwear",
    thumbnail: "/images/sneakers.jpg",
    rating: 4.6,
  },
  {
    title: "Canvas Backpack",
    description:
      "Durable canvas backpack with padded laptop compartment. Perfect for carrying books and essentials.",
    price: 39.99,
    category: "accessories",
    thumbnail: "/images/backpack.jpg",
    rating: 4.4,
  },
  {
    title: "Cotton Graphic T-Shirt",
    description:
      "Soft 100% cotton t-shirt with a modern graphic print. Available in multiple colors and sizes.",
    price: 19.99,
    category: "clothing",
    thumbnail: "/images/tshirt.jpg",
    rating: 4.3,
  },
  {
    title: "Classic Wrist Watch",
    description:
      "Elegant analog wrist watch with leather strap. Water-resistant with a minimalist dial design.",
    price: 59.99,
    category: "accessories",
    thumbnail: "/images/watch.jpg",
    rating: 4.7,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany();
    console.log("Products cleared...");

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding products: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
