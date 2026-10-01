import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Box, Sparkles, LayoutDashboard, Grid3x3, Upload, User, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => api.getUser());
  const [token, setToken] = useState(() => api.getToken());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(api.getUser());
      setToken(api.getToken());
    };
    window.addEventListener("auth-state-change", handleAuthChange);
    return () => window.removeEventListener("auth-state-change", handleAuthChange);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
            <Box className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ArtifactVault
            </span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase -mt-1">
              3D Cultural Archive
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/gallery"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive("/gallery")
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Grid3x3 className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
            Gallery
          </Link>

          {token && (
            <>
              <Link
                to="/upload"
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/upload")
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Upload className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
                Scan & Upload
              </Link>

              <Link
                to="/dashboard"
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <LayoutDashboard className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
                Dashboard
              </Link>
            </>
          )}

          <Link
            to="/about"
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive("/about")
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right Auth / Profile Controls */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isActive("/profile")
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 bg-muted/40 hover:bg-muted text-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline-block max-w-[120px] truncate">
                  {user?.name || "Curator"}
                </span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-sm hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
