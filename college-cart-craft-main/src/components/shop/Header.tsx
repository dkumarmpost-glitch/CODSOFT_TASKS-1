import { ShoppingCart, Search, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
}

export function Header({ cartCount, searchQuery, onSearchChange, onCartClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 gap-4">
        <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          CollegeShop
        </h1>
        
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/profile")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name?.split(" ")[0] || "Profile"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/login")}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/register")}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </Button>
            </>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCartClick}
            className="relative gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center animate-cart-bounce">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile search */}
      <div className="container pb-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
      </div>
    </header>
  );
}
