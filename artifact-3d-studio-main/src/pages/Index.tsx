import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scan, Database, Shield, Info } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-heritage-gold via-heritage-teal to-heritage-gold bg-clip-text text-transparent">
              ArtifactVault
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12">
            Intelligent System for 3D Artifact Scanning and Digital Preservation
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 text-lg"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/about")}
              size="lg"
              variant="outline"
              className="border-heritage-gold hover:border-heritage-gold hover:bg-heritage-gold/10 h-14 px-8 text-lg"
            >
              <Info className="mr-2 h-4 w-4" />
              About
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="border-border/50 hover:border-primary hover:bg-primary/10 h-14 px-8 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Scan className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">2D to 3D Conversion</h3>
            <p className="text-muted-foreground">
              Upload 2D images and watch as our AI transforms them into interactive 3D models
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center">
              <Database className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">AI Classification</h3>
            <p className="text-muted-foreground">
              Advanced machine learning automatically categorizes and analyzes your artifacts
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-16 h-16 mx-auto mb-6 bg-heritage-teal/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-heritage-teal" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Digital Preservation</h3>
            <p className="text-muted-foreground">
              Secure storage and management of your cultural heritage artifacts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
