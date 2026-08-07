import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogOut, User, Mail, CalendarDays, ShoppingBag } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/", { replace: true });
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header for profile page */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
            CollegeShop
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container py-12 max-w-lg">
        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">{user?.name}</CardTitle>
            <CardDescription>Your CollegeShop account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">{memberSince}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
