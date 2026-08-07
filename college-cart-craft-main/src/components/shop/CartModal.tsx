import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { Product } from "@/data/products";
import { toast } from "@/hooks/use-toast";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  total: number;
}

export function CartModal({
  open,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  total,
}: CartModalProps) {
  const cartWithDetails = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return { ...item, product };
  }).filter((item) => item.product);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products before checking out.",
        variant: "destructive",
      });
      return;
    }
    onCheckout();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </DialogTitle>
        </DialogHeader>

        {cartWithDetails.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
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
                      ₹{product!.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(id, qty - 1)}
                        disabled={qty <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(id, qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => onRemove(id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
