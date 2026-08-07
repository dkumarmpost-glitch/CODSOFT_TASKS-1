import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Package, MapPin, CreditCard, ArrowLeft, ShoppingBag } from "lucide-react";
import { getPaymentStatus } from "@/services/payment";
import { Order } from "@/services/orders";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { token } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!sessionId || !token) {
      setError("Payment session not found");
      setLoading(false);
      return;
    }

    getPaymentStatus(token, sessionId)
      .then((response) => {
        if (mounted) {
          setOrder(response.order);
          // Clear the cart since the order was placed successfully
          clearCart();
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load payment details");
          toast({
            title: "Error",
            description: err instanceof Error ? err.message : "Failed to load payment details",
            variant: "destructive",
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sessionId, token, clearCart]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
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
          <div className="max-w-md mx-auto text-center">
            <p className="text-muted-foreground text-lg mb-6">
              {error || "Payment details not found"}
            </p>
            <Button onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
            CollegeShop
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground">
              Thank you for shopping with CollegeShop. Your payment has been confirmed.
            </p>
          </div>

          {/* Order Summary Card */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="font-display text-lg">Order Details</CardTitle>
              <CardDescription>
                Order placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order ID & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order ID</p>
                  <p className="font-mono text-sm font-medium break-all">{order._id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Status</p>
                  <Badge variant="secondary" className="capitalize">
                    {order.orderStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment</p>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"} className="capitalize">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4" />
                  Items ({order.products.length})
                </h3>
                <div className="space-y-3">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ₹{product.price.toLocaleString()} × {product.qty}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹{(product.price * product.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="p-4 bg-secondary/50 rounded-lg text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pinCode}
                  </p>
                  <p className="text-muted-foreground">
                    Phone: {order.shippingAddress.phone} | Email: {order.shippingAddress.email}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Total Amount
                </span>
                <span className="text-2xl font-bold">
                  ₹{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" size="lg" onClick={() => navigate("/")}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/profile")}>
              View My Orders
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
