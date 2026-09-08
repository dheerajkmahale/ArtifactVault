import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Archive, ArrowRight, Scan, Eye, Play, Star, Users, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();


  // Sample 3D models data for showcase

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-blue-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold">ArtifactVault</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero with 3D Model Showcase */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              See Heritage in
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> 3D</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Transform any artifact from 2D images to interactive 3D models.
              Explore our showcase of digitized cultural heritage from world-renowned institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/upload")}
                className="bg-primary hover:bg-primary/90 text-lg px-8"
              >
                Start Scanning
                <Scan className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/gallery")}
                className="text-lg px-8"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Gallery
              </Button>
            </div>
          </div>

          {/* Featured 3D Models Grid */}
        </div>
      </section>

      {/* Process Showcase */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              From photo to interactive 3D model in minutes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">📷</div>
              </div>
              <h3 className="font-semibold mb-2">1. Upload Photo</h3>
              <p className="text-sm text-muted-foreground">Take or upload a clear image of your artifact</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scan className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">2. AI Processing</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes and reconstructs the 3D model</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="font-semibold mb-2">3. Smart Classification</h3>
              <p className="text-sm text-muted-foreground">Automatic categorization and metadata generation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">4. 3D Viewer</h3>
              <p className="text-sm text-muted-foreground">Interact with your new 3D model</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Statistics section removed */}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-0 max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Digitize Your Collection?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of institutions preserving cultural heritage in stunning 3D detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/upload")}
                  className="text-lg px-8"
                >
                  Try Upload Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


    </div>
  );
};

export default Index;
