import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, Box, Sparkles, ArrowRight } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    if (api.getToken()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isLogin && !formData.fullName) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
        toast.success("Welcome back, Curator!");
        navigate("/dashboard");
      } else {
        await api.auth.signup({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        toast.success("Curator account initialized successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-amber-500 p-0.5 mx-auto shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-[10px] bg-background/90 flex items-center justify-center">
                <Box className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              {isLogin ? "Curator Portal Sign In" : "Register Curator Account"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access the 3D preservation vault"
                : "Join the digital archaeological archive and start scanning"}
            </p>
          </div>

          <Card className="glass-panel border-primary/20 bg-card/60 shadow-2xl backdrop-blur-xl">
            <CardHeader className="pb-4">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-muted/40 border border-border/40 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`py-2 rounded-md transition-all ${
                    isLogin
                      ? "bg-primary text-black font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`py-2 rounded-md transition-all ${
                    !isLogin
                      ? "bg-primary text-black font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-mono text-muted-foreground">
                      FULL NAME
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Dr. Helena Thorne"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required={!isLogin}
                      className="bg-muted/30 border-border/50 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-mono text-muted-foreground">
                    EMAIL ADDRESS
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="curator@institution.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-muted/30 border-border/50 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-mono text-muted-foreground">
                    PASSWORD
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-muted/30 border-border/50 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 shadow-lg shadow-primary/20 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? "Authenticating..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In to Vault" : "Initialize Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-border/30 text-center text-xs text-muted-foreground font-mono">
                <span className="flex items-center justify-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  MongoDB Atlas JWT Protected Session
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
