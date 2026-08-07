import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAdd = () => {
    onAddToCart(product.id);
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <article className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="font-display font-semibold text-lg mt-1 mb-1">
          {product.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              {product.rating}
            </span>
          </div>
          <span className="text-lg font-bold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={handleAdd} className="gap-2 w-full">
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
