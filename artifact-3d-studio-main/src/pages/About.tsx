import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/AuthGuard";
import { ArrowLeft, Scan, Database, Shield, Users, Globe, Award, Zap } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // If user is not authenticated, redirect to index page
      // Otherwise, they can access the about page
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent mb-2">
              About ArtifactVault
            </h1>
            <p className="text-muted-foreground">Intelligent 3D Artifact Scanning & Digital Preservation</p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Revolutionizing Cultural Heritage Preservation</CardTitle>
            <CardDescription className="text-lg max-w-3xl mx-auto">
              ArtifactVault is an advanced AI-powered platform that transforms the way museums, archaeologists, 
              and cultural institutions preserve and share their most precious artifacts through cutting-edge 
              3D scanning technology and intelligent classification systems.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-heritage-gold" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To democratize access to cultural heritage by creating a comprehensive digital archive 
                that makes artifacts accessible to researchers, educators, and the public worldwide, 
                while preserving them for future generations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-heritage-teal" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A world where every cultural artifact is digitally preserved, classified, and accessible 
                to anyone, anywhere, fostering global understanding and appreciation of our shared human heritage.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Features */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Core Technologies</CardTitle>
            <CardDescription className="text-center">Powering the future of digital preservation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Scan className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2D to 3D Conversion</h3>
                <p className="text-muted-foreground">
                  Advanced computer vision algorithms transform 2D images into interactive 3D models 
                  with remarkable accuracy and detail.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Database className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Classification</h3>
                <p className="text-muted-foreground">
                  Machine learning models automatically categorize artifacts by type, period, 
                  style, and cultural significance.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-heritage-teal/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-heritage-teal" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Preservation</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security ensures your cultural artifacts are protected 
                  and preserved with the highest standards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Impact by the Numbers</CardTitle>
            <CardDescription className="text-center">Our growing global reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground">Artifacts Digitized</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">150+</div>
                <div className="text-muted-foreground">Partner Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-heritage-teal mb-2">50+</div>
                <div className="text-muted-foreground">Countries Reached</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-heritage-gold mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime Reliability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Built with Cutting-Edge Technology</CardTitle>
            <CardDescription className="text-center">Modern stack for modern preservation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-sm py-1 px-3">React 18</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">TypeScript</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">Three.js</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">Machine Learning</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">Computer Vision</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">Cloud Computing</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">WebGL</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">Real-time Processing</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team & Community */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-heritage-gold" />
              Join Our Community
            </CardTitle>
            <CardDescription className="text-center">
              Connect with researchers, educators, and cultural heritage professionals worldwide
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              ArtifactVault isn't just a platform—it's a community of passionate individuals 
              dedicated to preserving and sharing human culture. Join museums, universities, 
              and cultural institutions from around the world.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started Today
            </Button>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-border/50 bg-gradient-to-r from-heritage-gold/10 via-heritage-teal/10 to-heritage-gold/10 backdrop-blur-sm">
            <CardContent className="py-8">
              <Zap className="h-12 w-12 text-heritage-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Heritage Preservation?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start digitizing and classifying your artifacts with our intelligent platform. 
                Experience the future of cultural heritage management today.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="outline"
                  className="border-primary hover:bg-primary/10"
                >
                  Try Upload Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;