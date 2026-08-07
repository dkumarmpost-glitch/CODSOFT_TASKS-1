import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Header } from "@/components/shop/Header";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartModal } from "@/components/shop/CartModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  fetchProducts,
  searchProducts,
  fetchCategories,
  fetchProductsByCategory,
} from "@/services/api";
import { Product } from "@/data/products";

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    itemCount,
  } = useCart();

  // Load categories once on mount
  useEffect(() => {
    let mounted = true;
    fetchCategories()
      .then((cats) => {
        if (mounted) setCategories(["all", ...cats]);
      })
      .catch(() => {
        // Non-fatal: fall back to "all" only
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadProducts = useCallback(async (query: string, category: string) => {
    setLoading(true);
    setError(null);
    try {
      let data: Product[];
      if (query.trim()) {
        data = await searchProducts(query.trim());
      } else if (category !== "all") {
        data = await fetchProductsByCategory(category);
      } else {
        data = await fetchProducts();
      }
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load products. Please try again."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search + category fetch
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadProducts(searchQuery, selectedCategory);
    }, 500);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, selectedCategory, loadProducts]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCheckout = () => {
    // Navigate to checkout page (protected route will handle auth)
    setCartOpen(false);
    navigate("/checkout");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground text-lg">{error}</p>
          <Button onClick={() => loadProducts(searchQuery, selectedCategory)}>
            Retry
          </Button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No products found. Try a different search or category.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={itemCount}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCartClick={() => setCartOpen(true)}
      />

      <main className="container py-8">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 animate-slide-up">
            Welcome to CollegeShop
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Discover quality products at student-friendly prices
          </p>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        {/* Products Grid */}
        <section>{renderContent()}</section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Made for a College Project &bull; E-Commerce Demo
          </p>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        total={getTotal(products)}
      />
    </div>
  );
};

export default Index;
