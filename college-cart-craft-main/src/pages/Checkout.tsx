import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag, ArrowLeft, Trash2, Minus, Plus, MapPin, CreditCard } from "lucide-react";
import { fetchProducts } from "@/services/api";
import { Product } from "@/data/products";
import { ShippingAddress } from "@/services/orders";
import { createCheckoutSession } from "@/services/payment";

// Tax rate (optional - 5% GST)
const TAX_RATE = 0.05;

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

const initialShippingForm: ShippingForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
};

const Checkout = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, itemCount } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    ...initialShippingForm,
    fullName: user?.name || "",
    email: user?.email || "",
  });

  // Load products to display cart details
  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cartWithDetails = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return { ...item, product };
    })
    .filter((item) => item.product);

  const subtotal = getTotal(products);
  const tax = subtotal * TAX_RATE;
  const shipping = 0; // Free shipping
  const grandTotal = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingForm = (): string | null => {
    const requiredFields: { key: keyof ShippingForm; label: string }[] = [
      { key: "fullName", label: "Full Name" },
      { key: "phone", label: "Phone Number" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "pinCode", label: "PIN Code" },
    ];

    for (const field of requiredFields) {
      if (!shippingForm[field.key].trim()) {
        return `${field.label} is required`;
      }
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(shippingForm.email.trim())) {
      return "Please enter a valid email address";
    }

    // Validate phone (10-15 digits, allow +, -, spaces)
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(shippingForm.phone.trim())) {
      return "Please enter a valid phone number";
    }

    // Validate PIN code (6 digits for India)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(shippingForm.pinCode.trim())) {
      return "PIN code must be 6 digits";
    }

    return null;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping form
    const validationError = validateShippingForm();
    if (validationError) {
      toast({
        title: "Missing information",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to place your order.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    setPlacing(true);

    try {
      // Build order payload with product snapshots
      const orderProducts = cartWithDetails.map(({ id, qty, product }) => ({
        productId: String(id),
        title: product!.title,
        price: product!.price,
        image: product!.image,
        qty,
      }));

      const shippingAddress: ShippingAddress = {
        fullName: shippingForm.fullName.trim(),
        phone: shippingForm.phone.trim(),
        email: shippingForm.email.trim().toLowerCase(),
        address: shippingForm.address.trim(),
        city: shippingForm.city.trim(),
        state: shippingForm.state.trim(),
        pinCode: shippingForm.pinCode.trim(),
      };

      const response = await createCheckoutSession(token, {
        products: orderProducts,
        shippingAddress,
      });

      // Redirect the user to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("Failed to create Stripe Checkout session");
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
            CollegeShop
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 animate-slide-up">
              Checkout
            </h2>
            <p className="text-muted-foreground">
              Review your order, {user?.name || "guest"}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cartWithDetails.length === 0 ? (
            <Card className="animate-scale-in">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
                <Button onClick={() => navigate("/")}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left column: Cart items + Shipping form */}
              <div className="lg:col-span-3 space-y-6">
                {/* Cart Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Items ({itemCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cartWithDetails.map(({ id, qty, product }) => (
                      <div
                        key={id}
                        className="flex gap-3 p-3 bg-secondary/50 rounded-lg animate-scale-in"
                      >
                        <img
                          src={product!.image}
                          alt={product!.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product!.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₹{product!.price.toLocaleString()} × {qty}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Subtotal: ₹{(product!.price * qty).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(id, qty - 1)}
                              disabled={qty <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(id, qty + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Shipping Address Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                    <CardDescription>
                      Enter the delivery address for your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="John Doe"
                          value={shippingForm.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={shippingForm.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={shippingForm.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="House No, Street, Area"
                        value={shippingForm.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Mumbai"
                          value={shippingForm.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder="Maharashtra"
                          value={shippingForm.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pinCode">PIN Code *</Label>
                        <Input
                          id="pinCode"
                          name="pinCode"
                          placeholder="400001"
                          value={shippingForm.pinCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column: Order Summary */}
              <div className="lg:col-span-2">
                <Card className="lg:sticky lg:top-20">
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5% GST)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <span className="text-lg font-medium">Grand Total</span>
                      <span className="text-2xl font-bold">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                    >
                      {placing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Checkout;
